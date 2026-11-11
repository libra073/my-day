import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// [route, english, swahili]
const TITLES = [
  [/^\/$/, 'MY DAY — Plan Your Perfect Wedding Day', 'MY DAY — Panga Siku Yako ya Harusi'],
  [/^\/marketplace/, 'Explore vendors · MY DAY', 'Tafuta watoa huduma · MY DAY'],
  [/^\/vendor\//, 'Vendor · MY DAY', 'Mtoa huduma · MY DAY'],
  [/^\/login/, 'Sign in · MY DAY', 'Ingia · MY DAY'],
  [/^\/signup/, 'Create your account · MY DAY', 'Fungua akaunti · MY DAY'],
  [/^\/register/, 'Create your account · MY DAY', 'Fungua akaunti · MY DAY'],
  [/^\/forgot-password/, 'Reset your password · MY DAY', 'Weka nenosiri jipya · MY DAY'],
  [/^\/reset-password/, 'Choose a new password · MY DAY', 'Chagua nenosiri jipya · MY DAY'],
  [/^\/planner/, 'AI planner · MY DAY', 'Mpangaji wa AI · MY DAY'],
  [/^\/wedding/, 'Wedding profile · MY DAY', 'Wasifu wa harusi · MY DAY'],
  [/^\/invite\//, 'Wedding invitation · MY DAY', 'Mwaliko wa harusi · MY DAY'],
  [/^\/bookings/, 'My bookings · MY DAY', 'Uhifadhi wangu · MY DAY'],
  [/^\/become-vendor/, 'Become a vendor · MY DAY', 'Kuwa mtoa huduma · MY DAY'],
  [/^\/contact/, 'Contact us · MY DAY', 'Wasiliana nasi · MY DAY'],
  [/^\/dashboard/, 'Event dashboard · MY DAY', 'Dashibodi ya sherehe · MY DAY'],
  [/^\/provider/, 'Provider dashboard · MY DAY', 'Dashibodi ya mtoa huduma · MY DAY'],
  [/^\/admin/, 'Admin · MY DAY', 'Utawala · MY DAY'],
  [/^\/auth\/callback/, 'Confirming your link · MY DAY', 'Inathibitisha kiungo · MY DAY'],
  [/^\/auth\/callback/, 'Confirming your link · MY DAY', 'Inathibitisha kiungo · MY DAY'],
  [/^\/lab\/lens/, 'Lens lab · MY DAY', 'Maabara ya lensi · MY DAY'],
];

const FALLBACK_EN = 'MY DAY — Tanzanian Wedding Marketplace';
const FALLBACK_SW = 'MY DAY — Soko la Harusi Tanzania';

export default function PageTitle() {
  const { pathname } = useLocation();
  const { language } = useAppContext();
  const isSw = language === 'sw';

  useEffect(() => {
    const match = TITLES.find(([pattern]) => pattern.test(pathname));
    document.title = match ? (isSw ? match[2] : match[1]) : (isSw ? FALLBACK_SW : FALLBACK_EN);
    document.documentElement.lang = isSw ? 'sw' : 'en';
  }, [pathname, isSw]);

  return null;
}
