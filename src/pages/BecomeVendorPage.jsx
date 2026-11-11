import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import {
  CheckCircle2, Store, MapPin, Phone, Wallet, FileText, Rocket, ShieldCheck,
  Zap, BadgeCheck, Building2, Palette, Music, UtensilsCrossed, Scissors, Car,
  Loader2, Sparkles, Star, Check, TrendingUp, Calendar, CreditCard,
  MessageCircle, Award, Users, ArrowRight, Image as ImageIcon, Clock3,
} from 'lucide-react';
import '../styles/vendor-program.css';

const CATEGORIES = [
  { id: 'wapambaji', name: 'Wapambaji - Decorators', swName: 'Wapambaji - Mapambo', short: 'Decorators', sub: 'Decor & Styling', icon: Palette },
  { id: 'kumbi', name: 'Kumbi - Venues', swName: 'Kumbi - Kumbi', short: 'Venues', sub: 'Halls & Gardens', icon: Building2 },
  { id: 'entertainment', name: 'MCs & Entertainment', swName: 'MCs & Burudani', short: 'MCs & Music', sub: 'DJs, Bands & MCs', icon: Music },
  { id: 'catering', name: 'Catering & Chakula', swName: 'Chakula - Catering', short: 'Catering', sub: 'Food & Drinks', icon: UtensilsCrossed },
  { id: 'saloon', name: 'Saloon & Barbershop', swName: 'Saluni & Urembo', short: 'Saloon', sub: 'Hair & Bridal Makeup', icon: Scissors },
  { id: 'transport', name: 'Transport & Luxury Cars', swName: 'Usafiri - Magari ya Harusi', short: 'Transport', sub: 'Luxury Wedding Cars', icon: Car },
];

const PRICE_UNITS = {
  kumbi: { en: 'per day', sw: 'kwa siku' },
  transport: { en: 'per day', sw: 'kwa siku' },
  catering: { en: 'per guest', sw: 'kwa mgeni' },
  entertainment: { en: 'per event', sw: 'kwa sherehe' },
  wapambaji: { en: 'per package', sw: 'kwa kifurushi' },
  saloon: { en: 'per package', sw: 'kwa huduma' },
};

const CITY_PRESETS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Zanzibar', 'Dodoma'];

const PRICE_PRESETS = [
  { label: '500k', value: 500000 },
  { label: '1.0M', value: 1000000 },
  { label: '1.5M', value: 1500000 },
  { label: '2.5M', value: 2500000 },
  { label: '5.0M', value: 5000000 },
];

const AMENITY_TAGS = [
  '✨ Red Carpet & VIP Walkway',
  '❄️ Full Air Conditioning (AC)',
  '⚡ High-Capacity Backup Generator',
  '👰 Dedicated Bridal Changing Suite',
  '🔊 Professional Sound & PA System',
  '💡 Dynamic Stage & LED Ambient Lighting',
  '🍽️ Complete Buffet Ware & Chafing Dishes',
  '🤝 Complimentary Wedding Consultation',
];

const AMENITY_LABELS_SW = {
  'Red Carpet & VIP Walkway': 'Zulia Jekundu & Njia ya VIP',
  'Full Air Conditioning (AC)': 'Kiyoyozi Kamili (AC)',
  'High-Capacity Backup Generator': 'Jenereta Msaidizi ya Nguvu',
  'Dedicated Bridal Changing Suite': 'Chumba Maalum cha Kubadilishia Bibi Harusi',
  'Professional Sound & PA System': 'Sauti ya Kitaalamu & Mfumo wa PA',
  'Dynamic Stage & LED Ambient Lighting': 'Jukwaa la Kisasa & Mwanga wa LED',
  'Complete Buffet Ware & Chafing Dishes': 'Vyombo Kamili vya Buffet & Chafing',
  'Complimentary Wedding Consultation': 'Ushauri wa Bure wa Harusi',
};

const DESC_MAX = 500;

const stripEmoji = (tag) => tag.replace(/^[^\w\s]+/, '').trim();

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function BecomeVendorPage() {
  const { setProviders, providers, language } = useAppContext();
  const navigate = useNavigate();
  const isSw = language === 'sw';

  const [formData, setFormData] = useState({
    name: '',
    category: 'wapambaji',
    location: 'Dar es Salaam',
    contact: '700 000 000',
    priceRate: 1500000,
    description: '',
  });

  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  /* ---- live marketplace figures (derived from the provider list, not hard-coded) ---- */
  const activeVendors = Array.isArray(providers) ? providers.length : 0;
  const averageRating = useMemo(() => {
    const rated = (providers || []).filter((p) => Number.isFinite(Number(p.rating)) && Number(p.rating) > 0);
    if (!rated.length) return null;
    return (rated.reduce((sum, p) => sum + Number(p.rating), 0) / rated.length).toFixed(1);
  }, [providers]);

  const completion = useMemo(() => {
    const checks = [
      formData.name.trim().length > 0,
      formData.category.length > 0,
      formData.location.trim().length > 0,
      formData.contact.replace(/\D/g, '').length >= 9,
      formData.priceRate > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData]);

  const activeUnit = isSw
    ? PRICE_UNITS[formData.category]?.sw || 'kwa kifurushi'
    : PRICE_UNITS[formData.category]?.en || 'per package';

  const isAmenitySelected = (tag) => formData.description.includes(stripEmoji(tag));

  // chips show the localised label; the stored text stays canonical English
  const amenityLabel = (tag) => {
    if (!isSw) return stripEmoji(tag);
    const clean = stripEmoji(tag);
    return AMENITY_LABELS_SW[clean] || clean;
  };

  const handleToggleAmenity = (tag) => {
    const cleanTag = stripEmoji(tag);
    setFormData((prev) => {
      if (prev.description.includes(cleanTag)) {
        const next = prev.description
          .split('\n')
          .filter((line) => !line.replace(/^•\s*/, '').trim().startsWith(cleanTag))
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trimEnd();
        return { ...prev, description: next };
      }
      const separator = prev.description.trim().length > 0 ? '\n• ' : '• ';
      return { ...prev, description: `${prev.description}${separator}${cleanTag}`.slice(0, DESC_MAX) };
    });
  };

  const normalizePhone = () => {
    const digits = formData.contact.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('255')) return `+${digits}`;
    if (digits.startsWith('0')) return `+255 ${digits.slice(1)}`;
    return `+255 ${digits}`;
  };

  const validate = () => {
    if (!formData.name.trim()) return isSw ? 'Tafadhali weka jina la biashara yako.' : 'Please enter your business name.';
    if (!formData.category) return isSw ? 'Tafadhali chagua kundi la huduma.' : 'Please choose a service category.';
    if (!formData.location.trim()) return isSw ? 'Tafadhali weka eneo au jiji lako.' : 'Please enter your business location.';
    if (formData.contact.replace(/\D/g, '').length < 9) {
      return isSw
        ? 'Tafadhali weka nambari sahihi ya simu / WhatsApp (+255 700 000 000).'
        : 'Please enter a valid phone / WhatsApp contact number.';
    }
    if (!formData.priceRate || formData.priceRate <= 0) {
      return isSw ? 'Tafadhali weka bei ya kuanzia iliyo sahihi.' : 'Please enter a valid starting price.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      formRef.current?.querySelector('#vreg-name')?.focus();
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      location: formData.location.trim(),
      contact: normalizePhone(),
      priceRate: formData.priceRate,
      description: formData.description.trim(),
    };

    let created;
    try {
      const res = await api.registerVendor(payload);
      created = res?.vendor;
      if (!created?.id) throw new Error('Registration was not confirmed by the server.');
    } catch (err) {
      setSubmitting(false);
      const serverMessage = err?.data?.error || (err?.status === 422 ? err.message : '');
      setError(
        serverMessage ||
          (isSw
            ? 'Hatukuweza kuwasilisha usajili wako kwa sasa. Tafadhali angalia muunganisho wako na ujaribu tena.'
            : 'We could not submit your registration right now. Please check your connection and try again.')
      );
      return;
    }

    const newVendor = {
      id: created.id,
      category: payload.category,
      name: payload.name,
      location: payload.location,
      pricePerDay: ['kumbi', 'transport'].includes(payload.category) ? payload.priceRate : null,
      pricePerPerson: payload.category === 'catering' ? payload.priceRate : null,
      pricePerEvent: payload.category === 'entertainment' ? payload.priceRate : null,
      packages: ['wapambaji', 'saloon'].includes(payload.category)
        ? [
            {
              id: `pkg-${Date.now()}`,
              name: isSw ? 'Kifurushi cha Msingi cha Harusi' : 'Standard Wedding Package',
              price: payload.priceRate,
              description:
                payload.description ||
                (isSw ? 'Huduma kamili ya kitaalamu kwa harusi yako.' : 'Full professional wedding package included.'),
            },
          ]
        : [],
      rating: 0,
      reviewsCount: 0,
      verified: false,
      isFeatured: false,
      status: created.status || 'pending_review',
      image: '/portfolio/reception-toast.jpg',
      description: payload.description,
      contact: payload.contact,
      unavailableDates: [],
    };

    setProviders((prev) => [newVendor, ...prev]);
    setSubmitting(false);
    setRegistered(true);

    setTimeout(() => {
      navigate('/login');
      navigate('/provider');
    }, 2400);
  };

  const benefits = [
    {
      icon: Store,
      tag: isSw ? 'BURE 100%' : '100% Free',
      title: isSw ? 'Tengeneza Wasifu wa Biashara' : 'Create Your Business Profile',
      desc: isSw
        ? 'Onyesha kazi zako, vifurushi, bei na vifaa vyako kwa wanandoa wanaotafuta watoa huduma wa harusi.'
        : 'Showcase your portfolio, packages, pricing and amenities to couples searching for wedding professionals.',
    },
    {
      icon: Rocket,
      tag: isSw ? 'AMANA 30%' : '30% Advance',
      title: isSw ? 'Pokea Maombi ya Uhifadhi Moja kwa Moja' : 'Receive Direct Booking Requests',
      desc: isSw
        ? 'Pokea maombi ya uhifadhi moja kwa moja kutoka kwa wanandoa, pamoja na amana ya awali ya 30% kulingana na masharti ya uhifadhi.'
        : 'Receive booking requests directly from couples, with a 30% advance deposit according to the booking terms.',
    },
    {
      icon: Calendar,
      tag: isSw ? 'HAKUNA MIGONGANO' : 'Zero Conflicts',
      title: isSw ? 'Simamia Upatikanaji wa Kalenda' : 'Manage Calendar Availability',
      desc: isSw
        ? 'Dhibiti upatikanaji wako, funga tarehe zisizopatikana na punguza migongano wakati wa misimu yenye shughuli nyingi.'
        : 'Control your availability, block unavailable dates and reduce scheduling conflicts during busy wedding seasons.',
    },
    {
      icon: CreditCard,
      tag: isSw ? 'SIMU & BENKI' : 'Mobile & Bank',
      title: isSw ? 'Pokea Malipo ya Mtandaoni' : 'Accept Online Payments',
      desc: isSw
        ? 'Pokea malipo kupitia njia zinazotumika ikiwa ni pamoja na M-Pesa, Tigo Pesa, Airtel Money na uhamishaji wa benki.'
        : 'Receive payments through supported channels including M-Pesa, Tigo Pesa, Airtel Money and bank transfers.',
    },
    {
      icon: TrendingUp,
      tag: isSw ? 'TAKWIMU HALISI' : 'Live Analytics',
      title: isSw ? 'Fuatilia Mapato na Takwimu' : 'Track Earnings & Analytics',
      desc: isSw
        ? 'Tazama mgawanyo wa kifedha, shughuli za uhifadhi, mapato na matukio yajayo kutoka kwenye tovuti yako ya mtoa huduma.'
        : 'View financial breakdowns, booking activity, earnings and upcoming events from your provider portal.',
    },
    {
      icon: Award,
      tag: isSw ? 'BEJI YA UTHIBITISHO' : 'Verified Badge',
      title: isSw ? 'Jenga Sifa kwa Wateja' : 'Build Client Reputation',
      desc: isSw
        ? 'Jenga imani kupitia maoni ya wateja yaliyothibitishwa na ongeza mwonekano wako kwenye soko la MY DAY.'
        : 'Build trust through verified customer reviews and strengthen your visibility across the MY DAY marketplace.',
    },
  ];

  const steps = [
    {
      n: '01',
      icon: FileText,
      title: isSw ? 'Jisajili' : 'Register',
      desc: isSw
        ? 'Tengeneza wasifu wa biashara yako na toa taarifa zako za mawasiliano.'
        : 'Create your business profile and provide your contact information.',
    },
    {
      n: '02',
      icon: ImageIcon,
      title: isSw ? 'Kamilisha Orodha Yako' : 'Complete Your Listing',
      desc: isSw
        ? 'Ongeza maelezo ya biashara, bei, huduma na picha za kazi zako.'
        : 'Add your business description, pricing, services and portfolio images.',
    },
    {
      n: '03',
      icon: Users,
      title: isSw ? 'Uonekane' : 'Get Discovered',
      desc: isSw
        ? 'Biashara yako inaonekana kwa wanandoa wanaotafuta kwenye soko la MY DAY.'
        : 'Your business becomes visible to couples searching the MY DAY marketplace.',
    },
    {
      n: '04',
      icon: Calendar,
      title: isSw ? 'Pokea Uhifadhi' : 'Receive Bookings',
      desc: isSw
        ? 'Simamia maombi ya uhifadhi, upatikanaji na malipo kupitia tovuti yako ya mtoa huduma.'
        : 'Manage booking requests, availability and payments through your provider portal.',
    },
  ];

  const advantages = [
    {
      icon: Zap,
      title: isSw ? 'Uchapishaji wa Haraka' : 'Instant Publishing',
      desc: isSw
        ? 'Orodha yako inaweza kuonekana kwenye soko mara usajili na ukaguzi unaohitajika kukamilika.'
        : 'Your listing can become visible on the marketplace once registration and required checks are successfully completed.',
    },
    {
      icon: FileText,
      title: isSw ? 'Mikataba ya Kidijitali' : 'Digital Contracts',
      desc: isSw
        ? 'Makubaliano ya kidijitali yanaweza kutengenezwa kwa uhifadhi kulingana na mtiririko wa uhifadhi wa jukwaa.'
        : "Digital agreements can be generated for bookings according to the platform's booking workflow.",
    },
    {
      icon: ShieldCheck,
      title: isSw ? 'Malipo Yaliyolindwa' : 'Protected Payouts',
      desc: isSw
        ? 'Pata njia za malipo na malipo zinazotumika, kulingana na masharti ya malipo ya jukwaa.'
        : "Access supported payment and payout channels, subject to the platform's payment terms.",
    },
  ];

  const assurances = [
    isSw ? 'Kujiunga ni bure' : 'Free to join',
    isSw ? 'Hakuna ada ya kila mwezi' : 'No monthly subscription fees',
    isSw ? 'Kamisheni kwa uhifadhi uliothibitishwa pekee' : 'Commission only on confirmed bookings',
  ];

  return (
    <div className="vp-page">
      {/* 01 - HERO */}
      <section className="vp-hero" aria-labelledby="vp-hero-title">
        <div className="container vp-hero__inner">
          <div className="vp-hero__copy">
            <span className="vp-eyebrow">
              <Sparkles size={13} /> {isSw ? 'MPANGO RASMI WA WASHIRIKA WA MY DAY' : 'Official MY DAY Vendor Partner Program'}
            </span>

            <h1 id="vp-hero-title" className="vp-hero__title">
              {isSw ? 'Kukuza Biashara Yako ya Harusi na MY DAY.' : 'Grow Your Wedding Business with MY DAY.'}
            </h1>

            <p className="vp-hero__lead">
              {isSw
                ? "Jiunge na soko kuu la harusi Tanzania. Ungana na wanandoa wanaopanga harusi zao, onyesha huduma zako na kukuza biashara yako kupitia uhifadhi wa moja kwa moja."
                : "Join Tanzania's premier wedding marketplace. Connect with couples actively planning their weddings, showcase your services and grow your business through direct bookings."}
            </p>

            <div className="vp-hero__actions">
              <button type="button" className="vp-btn vp-btn--primary" onClick={() => scrollToId('vendor-register')}>
                {isSw ? 'Kuwa Mshirika' : 'Become a Partner'} <ArrowRight size={16} />
              </button>
              <button type="button" className="vp-btn vp-btn--ghost" onClick={() => scrollToId('vp-benefits')}>
                {isSw ? 'Gundua Faida za Mshirika' : 'Explore Partner Benefits'}
              </button>
            </div>

            <ul className="vp-trust" aria-label={isSw ? 'Takwimu za soko' : 'Marketplace figures'}>
              <li>
                <Users size={15} />
                <strong>{activeVendors}</strong> {isSw ? 'Watoa Huduma' : 'Active Vendors'}
              </li>
              <li>
                <Star size={15} fill="currentColor" />
                <strong>{averageRating ? `${averageRating}★` : 'New'}</strong>{' '}
                {isSw ? 'Kiwango cha Wastani' : 'Average Rating'}
              </li>
              <li>
                <ShieldCheck size={15} />
                <strong>0 TSh</strong> {isSw ? 'Ada ya Kujiunga' : 'Upfront Fee'}
              </li>
            </ul>
          </div>

          <figure className="vp-hero__visual">
            <div className="vp-hero__frame vp-hero__frame--main">
              <img src="/portfolio/kanga-sisters.jpg" alt={isSw ? 'Sherehe ya harusi Tanzania' : 'A Tanzanian wedding celebration'} decoding="async" />
            </div>
            <div className="vp-hero__frame vp-hero__frame--inset">
              <img src="/portfolio/gele-portrait.jpg" alt={isSw ? 'Bibi harusi wa Tanzania' : 'A Tanzanian bride'} decoding="async" />
            </div>
            <figcaption className="vp-hero__caption">
              <BadgeCheck size={15} /> {isSw ? 'Biashara washirika kote Tanzania' : 'Partner businesses across Tanzania'}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 02 - BENEFITS */}
      <section className="vp-section" id="vp-benefits" aria-labelledby="vp-benefits-title">
        <div className="container">
          <header className="vp-sec-head">
            <span className="vp-eyebrow vp-eyebrow--quiet">
              <Sparkles size={12} /> {isSw ? 'Kwa Nini MY DAY' : 'Why partner with MY DAY'}
            </span>
            <h2 id="vp-benefits-title" className="vp-h2">
              {isSw ? 'Kila unachohitaji kukuza biashara yako.' : 'Everything you need to grow your business.'}
            </h2>
            <p className="vp-lead">
              {isSw
                ? 'Kuanzia orodha yako ya kwanza hadi uhifadhi unaofuata, MY DAY inakupa zana za kukua.'
                : 'From your first listing to your next confirmed booking, MY DAY gives your business the tools to grow.'}
            </p>
          </header>

          <div className="vp-benefits">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <article key={b.title} className="vp-benefit">
                  <div className="vp-benefit__top">
                    <span className="vp-benefit__icon" aria-hidden="true">
                      <Icon size={19} />
                    </span>
                    <span className="vp-benefit__tag">{b.tag}</span>
                  </div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 03 - PROCESS */}
      <section className="vp-section vp-section--tight" aria-labelledby="vp-process-title">
        <div className="container">
          <header className="vp-sec-head vp-sec-head--center">
            <h2 id="vp-process-title" className="vp-h2">
              {isSw ? 'Kutoka usajili hadi uhifadhi unaofuata.' : 'From registration to your next booking.'}
            </h2>
          </header>

          <ol className="vp-steps">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.n} className="vp-step">
                  <span className="vp-step__num">{s.n}</span>
                  <span className="vp-step__icon" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 04 - ADVANTAGES */}
      <section className="vp-section" aria-labelledby="vp-adv-title">
        <div className="container vp-split">
          <figure className="vp-split__visual">
            <img src="/portfolio/coastal-bride.jpg" alt={isSw ? 'Sherehe ya harusi' : 'Wedding celebration'} loading="lazy" decoding="async" />
            <figcaption>{isSw ? 'Sherehe halisi, washirika halisi' : 'Real celebrations, real partners'}</figcaption>
          </figure>

          <div className="vp-split__copy">
            <h2 id="vp-adv-title" className="vp-h2">
              {isSw ? 'Biashara yako. Chapa yako. Fursa zaidi.' : 'Your business. Your brand. More opportunities.'}
            </h2>

            <ul className="vp-adv">
              {advantages.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.title}>
                    <span className="vp-adv__icon" aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <div>
                      <h3>{a.title}</h3>
                      <p>{a.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* 05 - TESTIMONIAL */}
      <section className="vp-section vp-section--tight" aria-labelledby="vp-quote-title">
        <div className="container">
          <figure className="vp-quote">
            <span className="vp-quote__mark" aria-hidden="true">“</span>
            <div className="vp-quote__body">
            <blockquote id="vp-quote-title">
              {isSw
                ? '“MY DAY ilitusaidia kupata uhifadhi 18 mpya wa mapambo ya harusi katika mwezi wetu wa kwanza pekee. Kwa kweli jukwaa bora la harusi Tanzania!”'
                : '“MY DAY helped us secure 18 new wedding decor bookings in our first month alone. Truly the best wedding platform in Tanzania!”'}
            </blockquote>
            <figcaption>
              <div className="vp-quote__who">
                <strong>Amina K.</strong>
                <span>Imperial Floral — Dar es Salaam</span>
              </div>
              <span className="vp-quote__note">
                {isSw ? 'Ushuhuda wa mshirika — haujathibitishwa kwa uhuru.' : 'Partner story — not independently verified.'}
              </span>
            </figcaption>
            </div>
            <img className="vp-quote__photo" src="/portfolio/bouquet-and-shoes.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      {/* 06 - REGISTRATION */}
      <section className="vp-section vp-section--form" id="vendor-register" aria-labelledby="vreg-title">
        <div className="container">
          <header className="vp-sec-head vp-sec-head--center">
            <h2 id="vreg-title" className="vp-h2">
              {isSw ? "Weka biashara yako kwenye MY DAY." : "Let's get your business on MY DAY."}
            </h2>
            <p className="vp-lead">
              {isSw
                ? 'Jaza taarifa za biashara yako ili kuunda wasifu wako wa mtoa huduma. Unaweza kuongeza picha, vifurushi na taarifa zaidi baadaye kupitia tovuti yako ya mtoa huduma.'
                : 'Fill in your business details to create your vendor profile. You can add your photos, packages and additional information later through your provider portal.'}
            </p>
            <ul className="vp-assurances">
              {assurances.map((a) => (
                <li key={a}>
                  <Check size={13} /> {a}
                </li>
              ))}
            </ul>
          </header>

          <div className="vp-panel">
            <aside className="vp-panel__side">
              <span className="vp-panel__badge">
                <BadgeCheck size={15} /> {isSw ? 'Usajili Rasmi' : 'Official registration'}
              </span>

              <h3>{isSw ? 'Orodha yako, hatua kwa hatua' : 'Your listing, step by step'}</h3>
              <p>
                {isSw
                  ? 'Dakika chache tu. Taarifa hizi ndizo wanandoa wanaona kwenye soko.'
                  : 'A few minutes is all it takes. These are the details couples see in the marketplace.'}
              </p>

              <ol className="vp-panel__steps">
                <li><span>1</span>{isSw ? 'Utambulisho wa biashara' : 'Business identity'}</li>
                <li><span>2</span>{isSw ? 'Eneo na mawasiliano' : 'Location & contact'}</li>
                <li><span>3</span>{isSw ? 'Bei ya kuanzia' : 'Starting price'}</li>
                <li><span>4</span>{isSw ? 'Maelezo na huduma' : 'Description & amenities'}</li>
              </ol>

              <div className="vp-panel__progress" aria-live="polite">
                <div className="vp-panel__progress-head">
                  <span>{isSw ? 'Maendeleo' : 'Progress'}</span>
                  <strong>{completion}%</strong>
                </div>
                <div
                  className="vp-panel__bar"
                  role="progressbar"
                  aria-valuenow={completion}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: `${completion}%` }} />
                </div>
              </div>

              <p className="vp-panel__fineprint">
                <Clock3 size={13} />
                {isSw
                  ? 'Orodha inaonekana baada ya usajili na ukaguzi unaohitajika kukamilika.'
                  : 'Your listing becomes visible once registration and required checks are complete.'}
              </p>
            </aside>

            <div className="vp-panel__main">
              {registered ? (
                <div className="vp-success" role="status">
                  <span className="vp-success__icon">
                    <CheckCircle2 size={34} />
                  </span>
                  <h3>
                    {isSw ? `Karibu, ${formData.name}!` : `Welcome aboard, ${formData.name}!`}
                  </h3>
                  <p>
                    {isSw
                      ? 'Usajili wako umepokelewa na upo kwenye ukaguzi. Tunakuhamisha kwenye tovuti yako ya mtoa huduma…'
                      : 'Your registration is confirmed and pending review. Taking you to your provider portal…'}
                  </p>
                  <div className="vp-success__bar"><span /></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="vp-form" ref={formRef} noValidate>
                  {/* STEP 1 */}
                  <fieldset className="vp-stepset">
                    <legend>
                      <span className="vp-stepset__num">1</span>
                      <span>
                        <strong>{isSw ? 'Utambulisho wa Biashara' : 'Business Identity'}</strong>
                        <small>{isSw ? 'Jina na aina ya huduma' : 'Name and service category'}</small>
                      </span>
                    </legend>

                    <div className="vp-field">
                      <label htmlFor="vreg-name">
                        {isSw ? 'Jina la Biashara' : 'Business Name'} <em aria-hidden="true">*</em>
                      </label>
                      <div className="vp-input">
                        <Store size={17} aria-hidden="true" />
                        <input
                          id="vreg-name"
                          type="text"
                          autoComplete="organization"
                          placeholder={isSw ? 'Mf. Imperial Floral & Decor' : 'Enter your registered or business trading name.'}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="vp-field">
                      <span className="vp-field__label" id="vreg-cat-label">
                        {isSw ? 'Kundi la Huduma' : 'Service Category'} <em aria-hidden="true">*</em>
                      </span>
                      <p className="vp-field__hint" id="vreg-cat-hint">
                        {isSw ? 'Chagua utaalamu wako mkuu.' : 'Select your primary specialty.'}
                      </p>

                      <div className="vp-cats" role="radiogroup" aria-labelledby="vreg-cat-label" aria-describedby="vreg-cat-hint">
                        {CATEGORIES.map((c) => {
                          const Icon = c.icon;
                          const active = formData.category === c.id;
                          const label = isSw ? c.swName : c.name;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              className={`vp-cat ${active ? 'is-active' : ''}`}
                              onClick={() => setFormData({ ...formData, category: c.id })}
                            >
                              <span className="vp-cat__icon"><Icon size={16} /></span>
                              <span className="vp-cat__text">
                                <strong>{label}</strong>
                                <small>{c.sub}</small>
                              </span>
                              {active && <Check size={14} className="vp-cat__check" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </fieldset>

                  {/* STEP 2 */}
                  <fieldset className="vp-stepset">
                    <legend>
                      <span className="vp-stepset__num">2</span>
                      <span>
                        <strong>{isSw ? 'Eneo na Mawasiliano' : 'Location & Contact'}</strong>
                        <small>{isSw ? 'Jiji na simu ya WhatsApp' : 'City and WhatsApp number'}</small>
                      </span>
                    </legend>

                    <div className="vp-grid2">
                      <div className="vp-field">
                        <label htmlFor="vreg-location">
                          {isSw ? 'Eneo / Jiji' : 'Location / City'} <em aria-hidden="true">*</em>
                        </label>
                        <div className="vp-input">
                          <MapPin size={17} aria-hidden="true" />
                          <input
                            id="vreg-location"
                            type="text"
                            autoComplete="address-level2"
                            placeholder="Dar es Salaam"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                          />
                        </div>
                        <div className="vp-pills">
                          {CITY_PRESETS.map((city) => (
                            <button
                              key={city}
                              type="button"
                              aria-pressed={formData.location === city}
                              className={`vp-pill ${formData.location === city ? 'is-active' : ''}`}
                              onClick={() => setFormData({ ...formData, location: city })}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="vp-field">
                        <label htmlFor="vreg-contact">
                          {isSw ? 'Simu / WhatsApp' : 'Phone / WhatsApp Contact'} <em aria-hidden="true">*</em>
                        </label>
                        <div className="vp-input vp-input--phone">
                          <Phone size={17} aria-hidden="true" />
                          <span className="vp-input__prefix">+255</span>
                          <input
                            id="vreg-contact"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="700 000 000"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value.replace(/^\s*\+?255\s*/, '') })}
                            required
                            aria-describedby="vreg-contact-hint"
                          />
                          <MessageCircle size={15} className="vp-input__wa" aria-hidden="true" />
                        </div>
                        <p className="vp-field__hint" id="vreg-contact-hint">
                          {isSw ? 'Inatumika kupokea arifa za uhifadhi wa wanandoa.' : 'Used for instant couple booking alerts.'}
                        </p>
                      </div>
                    </div>
                  </fieldset>

                  {/* STEP 3 */}
                  <fieldset className="vp-stepset">
                    <legend>
                      <span className="vp-stepset__num">3</span>
                      <span>
                        <strong>{isSw ? 'Bei' : 'Pricing'}</strong>
                        <small>{isSw ? 'Bei ya kuanzia kwa kifurushi' : 'Starting price per package'}</small>
                      </span>
                    </legend>

                    <div className="vp-field">
                      <label htmlFor="vreg-price">
                        {isSw ? 'Bei ya Kuanzia (TSh)' : 'Starting Price Rate (TSh)'} <em aria-hidden="true">*</em>
                      </label>
                      <p className="vp-field__hint">
                        {isSw ? 'Weka bei yako ya kuanzia kwa kifurushi.' : 'Enter your starting price per package.'}
                      </p>

                      <div className="vp-input vp-input--price">
                        <Wallet size={17} aria-hidden="true" />
                        <span className="vp-input__prefix">TSh</span>
                        <input
                          id="vreg-price"
                          type="number"
                          min="10000"
                          step="50000"
                          inputMode="numeric"
                          value={formData.priceRate}
                          onChange={(e) => setFormData({ ...formData, priceRate: parseInt(e.target.value, 10) || 0 })}
                          required
                        />
                        <span className="vp-input__suffix">{activeUnit}</span>
                      </div>

                      <div className="vp-pills vp-pills--presets">
                        {PRICE_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            aria-pressed={formData.priceRate === p.value}
                            className={`vp-pill ${formData.priceRate === p.value ? 'is-active' : ''}`}
                            onClick={() => setFormData({ ...formData, priceRate: p.value })}
                          >
                            TSh {p.label}
                          </button>
                        ))}
                      </div>

                      <div className="vp-price-preview" aria-live="polite">
                        <span>
                          {isSw ? 'Wanandoa wataona:' : 'Couples will see:'}{' '}
                          <strong>TSh {Number(formData.priceRate || 0).toLocaleString()}</strong> {activeUnit}
                        </span>
                        <span className="vp-price-preview__tag">
                          <Check size={11} /> {isSw ? 'Bei Halisi' : 'Live preview'}
                        </span>
                      </div>
                    </div>
                  </fieldset>

                  {/* STEP 4 */}
                  <fieldset className="vp-stepset">
                    <legend>
                      <span className="vp-stepset__num">4</span>
                      <span>
                        <strong>{isSw ? 'Maelezo na Huduma' : 'Description & Amenities'}</strong>
                        <small>{isSw ? 'Hiari — inaongeza mvuto' : 'Optional — helps you stand out'}</small>
                      </span>
                    </legend>

                    <div className="vp-field">
                      <label htmlFor="vreg-desc">
                        {isSw ? 'Maelezo ya Biashara' : 'Business Description'}{' '}
                        <span className="vp-field__optional">{isSw ? 'hiari' : 'optional'}</span>
                      </label>
                      <textarea
                        id="vreg-desc"
                        rows={4}
                        maxLength={DESC_MAX}
                        placeholder={
                          isSw
                            ? 'Tuambie kinachofanya biashara yako kuwa maalum, huduma unazotoa na kile wanandoa wanachoweza kutarajia.'
                            : 'Tell couples what makes your business special, what services you provide and what they can expect.'
                        }
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        aria-describedby="vreg-desc-count"
                      />
                      <div className="vp-field__meta">
                        <span>{isSw ? 'Chips za huduma za haraka:' : 'Quick amenity chips:'}</span>
                        <span id="vreg-desc-count" className="vp-counter">
                          {formData.description.length} / {DESC_MAX}
                        </span>
                      </div>

                      <div className="vp-amenities">
                        {AMENITY_TAGS.map((tag) => {
                          const selected = isAmenitySelected(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              aria-pressed={selected}
                              className={`vp-amenity ${selected ? 'is-selected' : ''}`}
                              onClick={() => handleToggleAmenity(tag)}
                            >
                              <span aria-hidden="true">{tag.split(' ')[0]}</span>
                              <span>{amenityLabel(tag)}</span>
                              {selected && <Check size={13} className="vp-amenity__check" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </fieldset>

                  {error && (
                    <div className="vp-error" role="alert">
                      <ShieldCheck size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" className="vp-submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={19} className="vp-spin" />
                        {isSw ? 'Tunawasilisha usajili…' : 'Submitting your registration…'}
                      </>
                    ) : (
                      <>
                        <Rocket size={19} />
                        {isSw ? 'Sajili na Uzindue Orodha' : 'Register & Launch Listing'}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <p className="vp-legal">
                    {isSw
                      ? 'Kujiunga ni bure · Hakuna ada ya kila mwezi · Kamisheni kwa uhifadhi uliothibitishwa pekee.'
                      : 'Free to join · No monthly fees · Commission only on confirmed bookings.'}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 07 - CLOSING CTA */}
      <section className="vp-close" aria-labelledby="vp-close-title">
        <div className="container vp-close__inner">
          <div>
            <h2 id="vp-close-title">
              {isSw ? 'Mteja wako ajaye anaweza kuwa anatafuta wewe leo.' : 'Your next customer could be searching for you today.'}
            </h2>
            <p>
              {isSw
                ? 'Jiunge na jamii ya watoa huduma wa MY DAY na weka biashara yako mbele ya wanandoa wanaopanga sherehe zao.'
                : 'Join the MY DAY vendor community and put your business in front of couples planning their perfect celebration.'}
            </p>
          </div>
          <button type="button" className="vp-btn vp-btn--primary vp-btn--lg" onClick={() => scrollToId('vendor-register')}>
            {isSw ? 'Kuwa Mshirika Rasmi' : 'Become an Official Partner'} <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
