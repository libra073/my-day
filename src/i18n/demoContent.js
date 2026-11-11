/**
 * Demo workspace content localisation.
 *
 * The seeded demo wedding (John & Sarah) ships with English copy stored in the
 * database. Those rows are content, not interface strings — we only translate
 * the exact known seed values and leave anything a real user typed untouched.
 */
const SW_COPY = {
  // tasks
  'Book Grand Imperial Reception Hall': 'Weka Nafasi ya Ukumbi wa Mapokezi wa Grand Imperial',
  'Verify sound limits, air conditioning, and confirm down payment terms.': 'Hakikisha mipaka ya sauti, kiyoyozi, na uthibitishe masharti ya malipo ya awali.',
  'Confirm Food Tasting Menu for 300 Guests': 'Thibitisha Menyu ya Kuonja Chakula kwa Wageni 300',
  'Coordinate with catering team for pilau, biryani, roast beef, and dessert options.': 'Shirikiana na timu ya chakula kuhusu pilau, biryani, nyama choma na chaguo za dessert.',
  'Please ask about generator fuel policy for evening power cuts.': 'Tafadhali uliza kuhusu sera ya mafuta ya jenereta wakati wa kukatika kwa umeme jioni.',
  'Task created with high priority': 'Kazi imeundwa kwa kipaumbele cha juu',
  'Task created': 'Kazi imeundwa',
  // decisions
  'Wedding Color Theme & Palette': 'Rangi na Mandhari ya Harusi',
  'Select the primary decorative colors for reception stage, chair sashes, and floral arches.': 'Chagua rangi kuu za mapambo ya jukwaa la mapokezi, viti na matao ya maua.',
  'Royal Emerald Green & Warm Gold': 'Kijani cha Zumardi na Dhahabu Ya Joto',
  'Blush Pink & Champagne Rose': 'Pink Hafifu na Waridi wa Champagne',
  'Navy Blue & Crisp Silver': 'Bluu ya Bahari na Fedha Angavu',
  'Agreed on Emerald Green & Warm Gold. Matches Grand Imperial ballroom chandeliers.': 'Tumekubaliana kwenye Kijani cha Zumardi na Dhahabu Ya Joto. Inaendana na chandelier za ukumbi wa Grand Imperial.',
  'DJ Band vs Live Acoustic Saxophone MC': 'Bendi ya DJ dhidi ya Saxophone ya Moja kwa Moja',
  'Decide entertainment style for guest arrival cocktail hour and dancing.': 'Amua mtindo wa burudani wakati wageni wanawasili na kwenye densi.',
  'Full Live Band + Modern DJ mix': 'Bendi Kamili ya Moja kwa Moja + Mchanganyiko wa DJ wa Kisasa',
  'Solo Saxophonist + Master DJ': 'Mpiga Saxophone Mmoja + DJ Mkuu',
  // notes
  'Emergency Vendor Contacts & Protocols': 'Mawasiliano ya Dharura ya Watoa Huduma na Taratibu',
  'Police escort contact: +255 777 000 111. Backup generator technician on standby from 2 PM to 1 AM.': 'Mawasiliano ya polisi wa msafara: +255 777 000 111. Fundi wa jenereta ya akiba yupo tayari kuanzia saa 8 mchana hadi saa 7 usiku.',
  // notifications
  'Task Assigned': 'Kazi Imepewa',
  'Task assigned to you': 'Kazi imepewa wewe',
  // budget categories
  'Kumbi (Venue)': 'Kumbi',
  'Catering & Beverages': 'Chakula na Vinywaji',
  'Wapambaji (Decorations)': 'Wapambaji (Mapambo)',
  'MC & Entertainment': 'MC na Burudani',
  'Saloon & Makeup': 'Saluni na Makeup',
  'Luxury Transport': 'Usafiri wa Kifahari',
};

/** Translate a known demo value; anything else passes through unchanged. */
export const demoText = (value, isSw) => {
  if (!isSw || typeof value !== 'string') return value;
  return SW_COPY[value] || value;
};
