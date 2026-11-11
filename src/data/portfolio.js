/**
 * Portfolio content for the "Real Weddings" showcase.
 *
 * Images live in /public/portfolio so they ship with the app (no CDN
 * dependency, no layout shift, and the same files can be reused on vendor
 * pages). Swap any entry for the client's own photography - the component
 * only cares about the shape below.
 */
export const PORTFOLIO_ITEMS = [
  {
    id: 'nungwi-tide',
    image: '/portfolio/beach-tide.jpg',
    couple: 'Amina & Yusuf',
    title: 'A tide-lit vow on Nungwi',
    venue: 'The Sands - Nungwi',
    region: 'Zanzibar',
    guests: 140,
    style: 'coastal',
    size: 'big',
    blurb:
      'A barefoot ceremony at golden hour, dhow sails on the horizon and 140 guests seated on the sand.',
    vendors: ['The Sands, Nungwi', 'Swahili Chic Decor', 'Lens & Light Studio'],
    quote: 'We wanted the ocean to be the only decoration. It was.',
  },
  {
    id: 'stone-town',
    image: '/portfolio/stone-town-vows.jpg',
    couple: 'Zawadi & Hamisi',
    title: 'Kanzu and lace in Stone Town',
    venue: 'Forodhani House - Stone Town',
    region: 'Zanzibar',
    guests: 90,
    style: 'traditional',
    size: 'tall',
    blurb:
      'A coastal ceremony in kanzu and hand-embroidered lace, framed by carved doors and cloves in the air.',
    vendors: ['Forodhani House', 'Mrembo Bridal', 'Pwani Films'],
  },
  {
    id: 'golden-hour',
    image: '/portfolio/golden-hour-couple.jpg',
    couple: 'Neema & Baraka',
    title: 'The last light at Mbezi',
    venue: 'Mbezi Beach Gardens',
    region: 'Dar es Salaam',
    guests: 220,
    style: 'coastal',
    size: 'normal',
    blurb:
      'An evening reception under festoon lights, with a 220-guest dinner and a first dance on the lawn.',
    vendors: ['Mbezi Beach Gardens', 'Royal Spice Catering', 'DJ Rhythm Beats'],
  },
  {
    id: 'coral-crimson',
    image: '/portfolio/coral-and-crimson.jpg',
    couple: 'Fatuma & Iddi',
    title: 'Coral, crimson and a family procession',
    venue: 'Kariakoo Grand Hall',
    region: 'Dar es Salaam',
    guests: 300,
    style: 'traditional',
    size: 'normal',
    blurb:
      'Three hundred guests, two families, and a procession that took the whole street with it.',
    vendors: ['Kariakoo Grand Hall', 'Mama Ntilie Catering', 'Sauti Live Band'],
  },
  {
    id: 'gele',
    image: '/portfolio/gele-portrait.jpg',
    couple: 'Halima & Suleiman',
    title: 'Gold thread, quiet confidence',
    venue: 'The Amani Suite',
    region: 'Dar es Salaam',
    guests: 80,
    style: 'traditional',
    size: 'tall',
    blurb:
      'A morning of henna, gold thread and close family before the evening reception.',
    vendors: ['The Amani Suite', 'Zuri Beauty Studio', 'Lens & Light Studio'],
  },
  {
    id: 'kanga-sisters',
    image: '/portfolio/kanga-sisters.jpg',
    couple: 'Rehema & Juma',
    title: 'The aunties, in kanga',
    venue: 'Paje Beach House',
    region: 'Zanzibar',
    guests: 110,
    style: 'traditional',
    size: 'normal',
    blurb:
      'The family entrance, dressed in matching kanga - the moment everyone photographs.',
    vendors: ['Paje Beach House', 'Swahili Chic Decor', 'Pwani Films'],
  },
  {
    id: 'reception',
    image: '/portfolio/reception-toast.jpg',
    couple: 'Grace & Emmanuel',
    title: 'A toast for three hundred',
    venue: 'Serengeti Palace Ballroom',
    region: 'Arusha',
    guests: 300,
    style: 'ballroom',
    size: 'wide',
    blurb:
      'A full ballroom transformation: draped ceiling, warm uplighting and a 12-metre head table.',
    vendors: ['Serengeti Palace Ballroom', 'Floral Dreams & Luxury Decor', 'Royal Spice Catering'],
  },
  {
    id: 'altar',
    image: '/portfolio/altar-vow.jpg',
    couple: 'Sarah & Daniel',
    title: 'The vow, before the noise',
    venue: "St. Joseph's - Upanga",
    region: 'Dar es Salaam',
    guests: 160,
    style: 'garden',
    size: 'normal',
    blurb:
      'A quiet church ceremony in the morning, followed by a garden lunch for 160.',
    vendors: ["St. Joseph's Upanga", 'Swahili Chic Decor', 'Lens & Light Studio'],
  },
  {
    id: 'henna',
    image: '/portfolio/henna-bride.jpg',
    couple: 'Mariam & Abdul',
    title: 'Henna, and the calm before',
    venue: 'The Amani Suite',
    region: 'Dar es Salaam',
    guests: 70,
    style: 'traditional',
    size: 'normal',
    blurb:
      'The bridal suite on the morning of the wedding - henna, flowers, and a very quiet room.',
    vendors: ['The Amani Suite', 'Zuri Beauty Studio', 'Mrembo Bridal'],
  },
];

export const PORTFOLIO_FILTERS = [
  { id: 'all', label: 'All celebrations' },
  { id: 'coastal', label: 'Coastal' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'ballroom', label: 'Ballroom' },
  { id: 'garden', label: 'Garden' },
];

/** Extra frames used on vendor pages when a vendor has few photos of its own. */
export const VENDOR_PORTFOLIO_POOL = [
  '/portfolio/ring-and-lace.jpg',
  '/portfolio/bouquet-and-shoes.jpg',
  '/portfolio/garden-couple.jpg',
  '/portfolio/red-celebration.jpg',
  '/portfolio/coastal-bride.jpg',
  '/portfolio/reception-toast.jpg',
];
