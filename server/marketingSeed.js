// Catalogue seed for the JSON fallback store. Postgres gets the same rows from
// supabase/migrations/0003_marketing_services.sql. No prices are invented:
// every service starts quote-based until an admin sets a fixed price.

const SERVICES = [
  {
    id: 'mks-profile', slug: 'profile-creation', sort: 1,
    name: { en: 'Professional Vendor Profile Creation', sw: 'Uundaji wa Wasifu wa Biashara wa Kitaalamu' },
    summary: { en: 'A complete, polished business profile that presents your services, packages and portfolio at their best.', sw: 'Wasifu kamili na wa kuvutia wa biashara unaoonyesha huduma, vifurushi na kwingineko yako kwa ubora.' },
    description: { en: 'Our team builds and optimises your MY DAY business profile: business description, service presentation, package and pricing layout, portfolio organisation and branding improvements.', sw: 'Timu yetu huunda na kuboresha wasifu wa biashara yako ya MY DAY: maelezo ya biashara, uwasilishaji wa huduma, mpangilio wa vifurushi na bei, upangaji wa kwingineko na uboreshaji wa chapa.' },
    requirements: { en: 'Registered vendor account; business name, logo and contact details; existing photos or portfolio items; package list with prices.', sw: 'Akaunti ya muuzaji iliyosajiliwa; jina la biashara, nembo na maelezo ya mawasiliano; picha au vitu vya kwingineko vilivyopo; orodha ya vifurushi na bei.' },
    deliverables: [
      { en: 'Profile setup & optimization', sw: 'Uundaji na uboreshaji wa wasifu' },
      { en: 'Business description & service presentation', sw: 'Maelezo ya biashara na uwasilishaji wa huduma' },
      { en: 'Package & pricing presentation', sw: 'Uwasilishaji wa vifurushi na bei' },
      { en: 'Portfolio organisation', sw: 'Upangaji wa kwingineko' },
      { en: 'Branding & profile improvement', sw: 'Chapa na uboreshaji wa wasifu' },
    ],
  },
  {
    id: 'mks-photo', slug: 'photo-video', sort: 2,
    name: { en: 'Photography & Videography Services', sw: 'Huduma za Picha na Video' },
    summary: { en: 'Professional photography and video that show your business, products and venues at production quality.', sw: 'Picha na video za kitaalamu zinazoonyesha biashara, bidhaa na maeneo yako kwa ubora wa kitaalamu.' },
    description: { en: 'Booked shoots by the MY DAY media team: business photography, product and service photography, venue photography, behind-the-scenes content and business introduction videos.', sw: 'Upigaji picha uliopangwa na timu ya media ya MY DAY: picha za biashara, picha za bidhaa na huduma, picha za maeneo, maudhui ya nyuma ya pazia na video za utangulizi wa biashara.' },
    requirements: { en: 'Approved vendor profile; shoot location and access; preferred shoot dates; list of products or services to feature.', sw: 'Wasifu wa muuzaji ulioidhinishwa; eneo la upigaji picha na ruhusa ya kuingia; tarehe unazopendelea; orodha ya bidhaa au huduma za kuonyesha.' },
    deliverables: [
      { en: 'Business photography', sw: 'Picha za biashara' },
      { en: 'Product & service photography', sw: 'Picha za bidhaa na huduma' },
      { en: 'Venue photography', sw: 'Picha za maeneo' },
      { en: 'Behind-the-scenes content', sw: 'Maudhui ya nyuma ya pazia' },
      { en: 'Business introduction video', sw: 'Video ya utangulizi wa biashara' },
    ],
  },
  {
    id: 'mks-social', slug: 'social-promotion', sort: 3,
    name: { en: 'Social Media Promotion', sw: 'Promosheni za Mitandao ya Kijamii' },
    summary: { en: "Planned promotion of your business through MY DAY's official social channels.", sw: 'Promosheni iliyopangwa ya biashara yako kupitia njia rasmi za mitandao ya kijamii za MY DAY.' },
    description: { en: "Promotional posts, stories and reels, vendor spotlights and a content plan, published through MY DAY's official social channels. Managed service: MY DAY creates and publishes the content; no external advertising accounts are connected.", sw: 'Machapisho ya promosheni, stori na reels, uangalizi wa wauzaji na mpango wa maudhui, kuchapishwa kupitia njia rasmi za MY DAY. Huduma inayosimamiwa: MY DAY huunda na kuchapisha maudhui; hakuna akaunti za matangazo za nje zilizounganishwa.' },
    requirements: { en: 'Approved vendor profile; brand assets (logo, photos); offer or message to promote; preferred promotion window.', sw: 'Wasifu wa muuzaji ulioidhinishwa; vitu vya chapa (nembo, picha); ofa au ujumbe wa kupromoti; kipindi unachopendelea cha promosheni.' },
    deliverables: [
      { en: 'Promotional posts', sw: 'Machapisho ya promosheni' },
      { en: 'Stories & reels', sw: 'Stori na reels' },
      { en: 'Vendor spotlights', sw: 'Uangalizi wa wauzaji' },
      { en: 'Social content planning', sw: 'Mpango wa maudhui ya kijamii' },
      { en: 'Publication on MY DAY channels', sw: 'Uchapishaji kwenye njia za MY DAY' },
    ],
  },
  {
    id: 'mks-video', slug: 'promo-videos', sort: 4,
    name: { en: 'Promotional Videos', sw: 'Video za Promosheni' },
    summary: { en: 'Edited promotional videos for your business, services, venues and special offers.', sw: 'Video za promosheni zilizohaririwa kwa biashara, huduma, maeneo na ofa maalum.' },
    description: { en: 'The MY DAY media team produces business introduction videos, service showcases, promotional advertisements, venue and product showcases and special-offer videos.', sw: 'Timu ya media ya MY DAY hutengeneza video za utangulizi wa biashara, maonyesho ya huduma, matangazo ya promosheni, maonyesho ya maeneo na bidhaa na video za ofa maalum.' },
    requirements: { en: 'Approved vendor profile; shoot access and dates; script approval; brand assets and offer details.', sw: 'Wasifu wa muuzaji ulioidhinishwa; ruhusa na tarehe za upigaji; idhini ya hati; vitu vya chapa na maelezo ya ofa.' },
    deliverables: [
      { en: 'Business introduction video', sw: 'Video ya utangulizi wa biashara' },
      { en: 'Service showcase video', sw: 'Video ya maonyesho ya huduma' },
      { en: 'Promotional advertisement', sw: 'Tangazo la promosheni' },
      { en: 'Venue & product showcase', sw: 'Maonyesho ya maeneo na bidhaa' },
      { en: 'Special offer video', sw: 'Video ya ofa maalum' },
    ],
  },
  {
    id: 'mks-sponsored', slug: 'sponsored-features', sort: 5,
    name: { en: 'Sponsored Vendor Features', sw: 'Nafasi za Udhamini kwa Wauzaji' },
    summary: { en: 'Clearly labelled sponsored placements across MY DAY, controlled entirely by the MY DAY team.', sw: 'Nafasi za udhamini zilizoandikwa wazi kote MY DAY, zinazosimamiwa kabisa na timu ya MY DAY.' },
    description: { en: 'Homepage sponsored placements, featured vendor sections, sponsored category placements and promotional banners. Every placement is visibly labelled Sponsored and expires automatically; organic vendor rankings are never affected.', sw: 'Nafasi za udhamini za ukurasa wa nyumbani, sehemu za wauzaji walioangaziwa, nafasi za udhamini za kategoria na mabango ya promosheni. Kila nafasi huandikwa wazi Sponsored na huisha kiotomatiki; mpangilio wa asili wa wauzaji hauathiriwi kamwe.' },
    requirements: { en: 'Approved vendor profile; campaign objective; preferred placement and duration; approved promotional content.', sw: 'Wasifu wa muuzaji ulioidhinishwa; lengo la kampeni; nafasi na muda unaopendelewa; maudhui ya promosheni yaliyoidhinishwa.' },
    deliverables: [
      { en: 'Homepage sponsored placement', sw: 'Nafasi ya udhamini ya ukurasa wa nyumbani' },
      { en: 'Featured vendor section', sw: 'Sehemu ya muuzaji aliyeangaziwa' },
      { en: 'Sponsored category placement', sw: 'Nafasi ya udhamini ya kategoria' },
      { en: 'Promotional banner', sw: 'Bango la promosheni' },
      { en: 'Visible Sponsored label', sw: 'Lebo iliyo wazi ya Sponsored' },
    ],
  },
  {
    id: 'mks-campaigns', slug: 'campaigns', sort: 6,
    name: { en: 'Marketing Campaigns', sw: 'Kampeni za Masoko' },
    summary: { en: 'Managed campaigns for launches, seasons and special offers, with a real performance report at the end.', sw: 'Kampeni zinazosimamiwa za uzinduzi, misimu na ofa maalum, na ripoti halisi ya utendaji mwishoni.' },
    description: { en: 'Business launch campaigns, seasonal promotions, wedding-season campaigns, discount and special-offer campaigns and custom promotional campaigns, planned and executed by the MY DAY marketing team.', sw: 'Kampeni za uzinduzi wa biashara, promosheni za misimu, kampeni za msimu wa harusi, kampeni za punguzo na ofa maalum na kampeni maalum za promosheni, zilizopangwa na kutekelezwa na timu ya masoko ya MY DAY.' },
    requirements: { en: 'Approved vendor profile; campaign objective and budget; target audience; start and end dates; offer details.', sw: 'Wasifu wa muuzaji ulioidhinishwa; lengo na bajeti ya kampeni; hadhira lengwa; tarehe za kuanza na kuisha; maelezo ya ofa.' },
    deliverables: [
      { en: 'Business launch campaign', sw: 'Kampeni ya uzinduzi wa biashara' },
      { en: 'Seasonal promotion', sw: 'Promosheni ya msimu' },
      { en: 'Wedding-season campaign', sw: 'Kampeni ya msimu wa harusi' },
      { en: 'Discount & special-offer campaign', sw: 'Kampeni ya punguzo na ofa maalum' },
      { en: 'Custom campaign & performance report', sw: 'Kampeni maalum na ripoti ya utendaji' },
    ],
  },
];

export function seedMarketingServices() {
  const now = new Date().toISOString();
  return SERVICES.map(s => ({
    ...s,
    active: true,
    priceType: 'quote',
    priceTzs: null,
    managed: true,
    createdAt: now,
    updatedAt: now,
  }));
}