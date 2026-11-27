#!/usr/bin/env node
// Create a new Gun of the Week entry from templates/gun-of-the-week.md.
//
//   npm run new-gun                       # prompts for make, model, caliber
//   npm run new-gun -- --make Ruger --model "10/22 Carbine" --caliber ".22 LR" \
//     --price '$349' --condition New --image ~/Desktop/ruger.jpg
//
// The week defaults to the Sunday after the newest entry (and never earlier than
// the coming Sunday), matching the Sunday-morning scheduled rebuild.

import { copyFile, readFile, readdir, writeFile, access } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gunsDir = path.join(root, 'src/content/guns');
const templatePath = path.join(root, 'templates/gun-of-the-week.md');

const USAGE = `Usage: npm run new-gun -- [options]

  --make <make>          e.g. Ruger                (prompted if missing)
  --model <model>        e.g. "10/22 Carbine"      (prompted if missing)
  --caliber <caliber>    e.g. ".22 LR"             (prompted if missing)
  --date <YYYY-MM-DD>    week of (a Sunday); defaults to the next open Sunday
  --action <action>      e.g. "Bolt action"
  --condition <c>        New | Used | Consignment
  --price <price>        e.g. '$349' (omit to show "Call for price")
  --image <file>         photo to copy next to the entry
  --alt <text>           alt text for the photo
  --force                overwrite an existing entry
  -h, --help             show this help`;

const { values: opts } = parseArgs({
  options: {
    make: { type: 'string' },
    model: { type: 'string' },
    caliber: { type: 'string' },
    date: { type: 'string' },
    action: { type: 'string' },
    condition: { type: 'string' },
    price: { type: 'string' },
    image: { type: 'string' },
    alt: { type: 'string' },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (opts.help) {
  console.log(USAGE);
  process.exit(0);
}

const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};

const CONDITIONS = ['New', 'Used', 'Consignment'];
if (opts.condition) {
  const match = CONDITIONS.find((c) => c.toLowerCase() === opts.condition.toLowerCase());
  if (!match) fail(`--condition must be one of ${CONDITIONS.join(', ')}`);
  opts.condition = match;
}

// --- Dates (all in UTC to avoid timezone drift) ---
const DAY = 86_400_000;
const isoDate = (d) => d.toISOString().slice(0, 10);
const parseDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || isoDate(d) !== s ? null : d;
};

const files = await readdir(gunsDir);
const entries = files.filter((f) => f.endsWith('.md'));
const usedWeeks = new Map(); // weekOf -> filename
for (const f of entries) {
  const text = await readFile(path.join(gunsDir, f), 'utf8');
  const m = text.match(/^weekOf:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
  if (m) usedWeeks.set(m[1], f);
}

function defaultWeek() {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const comingSunday = new Date(today.getTime() + ((7 - today.getUTCDay()) % 7) * DAY);
  const latest = [...usedWeeks.keys()].sort().at(-1);
  let week = latest ? new Date(parseDate(latest).getTime() + 7 * DAY) : comingSunday;
  if (week < comingSunday) week = comingSunday;
  while (usedWeeks.has(isoDate(week))) week = new Date(week.getTime() + 7 * DAY);
  return isoDate(week);
}

// --- Prompt for anything required that wasn't passed ---
const interactive = process.stdin.isTTY;
const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
async function ask(label, fallback) {
  if (!rl) return fallback ?? '';
  const answer = (await rl.question(fallback ? `${label} (${fallback}): ` : `${label}: `)).trim();
  return answer || fallback || '';
}

const weekDefault = defaultWeek();
const make = (opts.make ?? (await ask('Make'))).trim();
const model = (opts.model ?? (await ask('Model'))).trim();
const caliber = (opts.caliber ?? (await ask('Caliber'))).trim();
const weekOf = (opts.date ?? (await ask('Week of', weekDefault))).trim();
rl?.close();

if (!make || !model || !caliber) {
  fail('make, model and caliber are required (pass --make, --model, --caliber or run in a terminal).');
}
const weekDate = parseDate(weekOf);
if (!weekDate) fail(`"${weekOf}" is not a valid YYYY-MM-DD date.`);
if (weekDate.getUTCDay() !== 0) console.warn(`⚠ ${weekOf} is not a Sunday — the weekly rebuild runs on Sundays.`);

// --- Build the file ---
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slug = slugify(`${make} ${model}`);
const fileName = `${weekOf}-${slug}.md`;
const filePath = path.join(gunsDir, fileName);

const exists = async (p) => access(p).then(() => true, () => false);
if ((await exists(filePath)) && !opts.force) fail(`${path.relative(root, filePath)} already exists (use --force to overwrite).`);
const clash = usedWeeks.get(weekOf);
if (clash && clash !== fileName) console.warn(`⚠ ${clash} is already scheduled for ${weekOf}.`);

// Quote YAML values only when a plain scalar would be misread.
const yaml = (s) =>
  /^[A-Za-z0-9.$][^:#'"\[\]{},&*!|>%@`]*$/.test(s) && s === s.trim() && !/^(true|false|null|yes|no|on|off|~)$/i.test(s)
    ? s
    : JSON.stringify(s);

let out = (await readFile(templatePath, 'utf8')).replaceAll('{{slug}}', slug);
for (const [key, value] of Object.entries({ weekOf, make: yaml(make), model: yaml(model), caliber: yaml(caliber) })) {
  // Required fields take the YAML-safe value; elsewhere (comments) use the raw text.
  out = out.replace(`${key}: {{${key}}}`, () => `${key}: ${value}`);
}
out = out.replaceAll('{{make}}', make).replaceAll('{{model}}', model);

// Uncomment optional scalar fields that were passed.
for (const key of ['action', 'condition', 'price']) {
  if (opts[key]) out = out.replace(new RegExp(`^# ${key}: .*$`, 'm'), `${key}: ${yaml(opts[key].trim())}`);
}

if (opts.image) {
  const src = path.resolve(opts.image.replace(/^~(?=$|\/)/, process.env.HOME ?? '~'));
  if (!(await exists(src))) fail(`Image not found: ${opts.image}`);
  const imageName = `${slug}${path.extname(src).toLowerCase() || '.jpg'}`;
  const dest = path.join(gunsDir, imageName);
  if ((await exists(dest)) && !opts.force) fail(`${path.relative(root, dest)} already exists (use --force to overwrite).`);
  await copyFile(src, dest);
  const alt = (opts.alt ?? `${make} ${model}`).trim();
  out = out.replace(/^# image:\n#\s+src: .*\n#\s+alt: .*$/m, `image:\n  src: ./${imageName}\n  alt: ${yaml(alt)}`);
  console.log(`✔ Copied photo to ${path.relative(root, dest)}`);
}

await writeFile(filePath, out);
console.log(`✔ Created ${path.relative(root, filePath)} (week of ${weekOf})`);
console.log('  Fill in the optional fields and description, then preview with `npm run dev`.');
