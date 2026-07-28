// initialData.js – Rich mock data for MY DAY demo

export const providers = [
  // Kumbi – Venues
  {
    id: 'venue-1',
    category: 'kumbi',
    name: 'Grand Imperial Hall & Gardens',
    location: 'Dar es Salaam (Mbezi Beach)',
    capacity: 450,
    pricePerDay: 2500000,
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545232979-fbf34f5ce947?auto=format&fit=crop&w=800&q=80'
    ],
    facilities: ['VIP Lounge', 'Air Conditioning', 'Private Garden', 'High-End Sound System', '200+ Parking Bays', 'Backup Generator'],
    description: 'Luxurious air-conditioned ballroom with expansive tropical gardens, crystal chandeliers, and panoramic ocean views.',
    contact: '+255 777 123 456',
    rules: 'No outside catering without prior consent. 3-hour setup time provided.',
    unavailableDates: [],
  },
  {
    id: 'venue-2',
    category: 'kumbi',
    name: 'Serengeti Palace Ballroom',
    location: 'Arusha (Njiro)',
    capacity: 300,
    pricePerDay: 1800000,
    rating: 4.8,
    reviewsCount: 26,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80'],
    facilities: ['Mount Meru View', 'Modern Lighting', 'Stage Setup', 'Ample Parking'],
    description: 'Premium event space overlooking Mount Meru with state-of-the-art acoustics.',
    contact: '+255 754 999 888',
    rules: 'Standard event rules apply.',
    unavailableDates: [],
  },

  // Wapambaji – Decorators
  {
    id: 'decor-1',
    category: 'wapambaji',
    name: 'Floral Dreams & Luxury Decor',
    location: 'Arusha',
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    packages: [
      { id: 'basic', name: 'Classic Elegance Package', price: 1200000, description: 'Stage decor, guest table centerpieces, entrance archway, and chair sashes.' },
      { id: 'premium', name: 'Royal Platinum Package', price: 3000000, description: 'Full venue transformation, custom mood lighting, fresh floral installations, VIP head table setup, and walkway carpet.' },
    ],
    contact: '+255 788 222 333',
    unavailableDates: [],
  },
  {
    id: 'decor-2',
    category: 'wapambaji',
    name: 'Swahili Chic Event Designers',
    location: 'Dar es Salaam',
    rating: 4.7,
    reviewsCount: 19,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    packages: [
      { id: 'gold', name: 'Golden Glow Decor', price: 1800000, description: 'Warm gold and ivory draping, fairy light canopy, and tableware accenting.' }
    ],
    contact: '+255 655 444 111',
    unavailableDates: [],
  },

  // MCs & Entertainment
  {
    id: 'ent-1',
    category: 'entertainment',
    name: 'MC Anthony & DJ Rhythm Beats',
    location: 'Dar es Salaam & Mwanza',
    services: ['Bilingual MC', 'Live Saxophone', 'Pro DJ', 'Haze Machine'],
    pricePerEvent: 800000,
    rating: 5.0,
    reviewsCount: 54,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    languages: ['Swahili', 'English'],
    contact: '+255 799 444 555',
    unavailableDates: [],
  },

  // Catering
  {
    id: 'cater-1',
    category: 'catering',
    name: 'Royal Spice & Gourmet Catering',
    location: 'Zanzibar & Dar es Salaam',
    pricePerPerson: 30000,
    rating: 4.9,
    reviewsCount: 31,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    menuSamples: ['Pilau Ya Mbuzi', 'Grilled Kingfish', 'Biryani Special', 'Tropical Fruit Towers', 'Custom Wedding Cake'],
    contact: '+255 711 666 777',
    unavailableDates: [],
  },

  // Saloon & Barbershop
  {
    id: 'salon-1',
    category: 'saloon',
    name: 'Glamour Queen Bridal Salon & Spa',
    location: 'Dar es Salaam (Oysterbay)',
    rating: 4.8,
    reviewsCount: 29,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    packages: [
      { id: 'bride-premium', name: 'Bride & Bridesmaids VIP Glam', price: 900000, services: ['HD Airbrush Makeup', 'Hairstyling', 'Gel Nails', 'Facial & Massages'] },
      { id: 'groom-basic', name: 'Groom & Groomsmen Haircut & Facial', price: 300000, services: ['Precision Beard Trim', 'Hot Towel Facial', 'Hair Styling'] },
    ],
    contact: '+255 722 888 999',
    unavailableDates: [],
  },

  // Transport
  {
    id: 'trans-1',
    category: 'transport',
    name: 'Executive Wedding Fleet & Limos',
    location: 'Dar es Salaam',
    vehicleType: 'Mercedes-Benz S-Class & Range Rover Vogue',
    pricePerDay: 700000,
    rating: 4.9,
    reviewsCount: 22,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    capacity: 4,
    contact: '+255 733 111 222',
    unavailableDates: [],
  },
];

export const reviews = [
  {
    id: 'rev-1',
    customerName: 'Baraka & Rehema',
    weddingDate: '15th November 2025',
    rating: 5,
    review: 'MY DAY made planning our 400-guest wedding in Dar es Salaam completely stress-free! Booking our venue and caterers through mobile money with instant receipts gave us total peace of mind.',
    photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rev-2',
    customerName: 'David & Neema',
    weddingDate: '28th January 2026',
    rating: 5,
    review: 'The budget tracker and verified vendor list saved us millions of shillings! Grand Imperial Hall and MC Anthony exceeded our expectations.',
    photo: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rev-3',
    customerName: 'Juma & Farida',
    weddingDate: '10th May 2026',
    rating: 5,
    review: 'From Zanzibar catering to luxury cars, everything was locked in seamlessly. Highly recommend MY DAY to all Tanzanian couples!',
    photo: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'
  }
];

export default { providers, reviews };
