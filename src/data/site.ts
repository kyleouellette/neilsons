export const site = {
  name: "Neilson's Sporting Goods",
  shortName: "Neilson's",
  tagline: 'The best known friend to hunters and fishermen since 1949.',
  established: 1949,
  owner: 'Gary Hamilton',
  town: 'Farmingdale',
  state: 'Maine',
  locationNote: 'Three miles south of the State Capitol building',
  address: {
    street: '726 Maine Ave',
    city: 'Farmingdale',
    state: 'ME',
    zip: '04344',
  },
  phone: '(207) 629-9163',
  phoneHref: 'tel:+12076299163',
  email: 'babydogham@gmail.com',
  // TODO: swap for the shop's direct Yelp business URL once confirmed
  yelpUrl:
    'https://www.yelp.com/search?find_desc=Neilson%27s+Sporting+Goods&find_loc=Farmingdale%2C+ME',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=726+Maine+Ave%2C+Farmingdale%2C+ME+04344',
};

export const specialties = [
  {
    title: 'Big Game',
    body: 'Bolt-action and lever rifles in the calibers Maine deer, moose and bear hunters trust.',
    icon: 'antler',
  },
  {
    title: 'Upland & Migratory Birds',
    body: 'Over/unders, side-by-sides and pumps for grouse coverts and duck blinds alike.',
    icon: 'bird',
  },
  {
    title: 'Wild Turkey',
    body: 'Turkey-ready shotguns, chokes and loads to close the deal in the spring woods.',
    icon: 'feather',
  },
  {
    title: 'Small Game',
    body: 'Rimfires and light shotguns for squirrel, rabbit and a great first gun.',
    icon: 'leaf',
  },
  {
    title: 'Skeet & Target',
    body: 'Competition shotguns and accurate target rifles for the range and the club.',
    icon: 'target',
  },
  {
    title: 'Personal Protection',
    body: 'A full line of handguns with honest advice on picking the right one for you.',
    icon: 'shield',
  },
] as const;

// Latest reviews, newest first
export const reviews = [
  {
    date: 'January 2025',
    author: 'Chris Wescott',
    body: "Old school cool right here. You'll know the second you walk in. Wish they were all like this.",
  },
  {
    date: 'October 2024',
    author: 'ristophe Ri',
    body: 'These guys are the best. Period. Do your business here.',
  },
  {
    date: 'March 2024',
    author: 'Brittney Ann Begin',
    body: 'Had an amazing experience! Very down to earth gentlemen, we were comfortable and reassured the whole time, very kind. We are recommending all of our friends and family!',
  },
  {
    date: 'December 2023',
    author: 'Enkaa',
    body: 'Good selection and friendly workers',
  },
] as const;
