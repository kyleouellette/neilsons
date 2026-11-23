// Gun of the Week — edit this file each week, then `npm run deploy`.
// Keep older entries in `previous` to show a short history on the page.
// Photos go in src/assets/ and are imported below so Astro can resize and compress them.

import type { ImageMetadata } from 'astro';
import tikkaT3xHunter from '../assets/tikka-t3x-hunter.jpg';

export interface FeaturedGun {
  weekOf: string; // ISO date (Monday of the week)
  make: string;
  model: string;
  caliber: string;
  action: string;
  condition: 'New' | 'Used' | 'Consignment';
  price?: string; // leave undefined to show "Call for price"
  blurb: string;
  specs: { label: string; value: string }[];
  goodFor: string[];
  image?: { src: ImageMetadata; alt: string };
}

export const gunOfTheWeek: FeaturedGun = {
  weekOf: '2026-11-22',
  make: 'Tikka',
  model: 'T3x Hunter',
  caliber: '.30-06 Springfield',
  action: 'Bolt action',
  condition: 'New',
  blurb:
    "Walnut stock, a fluted stainless barrel, a smooth Finnish bolt and a sub-MOA accuracy guarantee. The T3x Hunter is the kind of rifle you hand down — and in .30-06 it's right at home in a Maine stand or a November clearcut.",
  specs: [
    { label: 'Barrel', value: '22.4 in. fluted' },
    { label: 'Finish', value: 'Stainless' },
    { label: 'Stock', value: 'Oiled walnut' },
    { label: 'Capacity', value: '3 + 1' },
  ],
  goodFor: ['Whitetail', 'Black bear', 'Moose'],
  image: {
    src: tikkaT3xHunter,
    alt: 'Tikka T3x Hunter with walnut stock and fluted stainless barrel on a wooden display stand',
  },
};

export const previous: Pick<FeaturedGun, 'weekOf' | 'make' | 'model' | 'caliber'>[] = [
  { weekOf: '2026-11-15', make: 'Marlin', model: '336 Classic', caliber: '.30-30 Win' },
  { weekOf: '2026-11-08', make: 'Browning', model: 'Citori 725 Field', caliber: '12 ga' },
  { weekOf: '2026-11-01', make: 'CVA', model: 'Accura LR-X', caliber: '.50 cal muzzleloader' },
];
