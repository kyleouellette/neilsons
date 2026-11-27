import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Gun of the Week — add one Markdown file per week to src/content/guns/, then deploy.
// The newest published `weekOf` is featured; the next three show as "Previously featured".
// Photos sit next to the Markdown file and are referenced by relative path.
const guns = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guns' }),
  schema: ({ image }) =>
    z.object({
      weekOf: z.coerce.date(), // Monday of the week, e.g. 2026-11-22
      make: z.string(),
      model: z.string(),
      caliber: z.string(),
      action: z.string().optional(),
      condition: z.enum(['New', 'Used', 'Consignment']).optional(),
      price: z.string().optional(), // leave out to show "Call for price"
      specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      goodFor: z.array(z.string()).default([]),
      image: z.object({ src: image(), alt: z.string() }).optional(),
    }),
});

export const collections = { guns };
