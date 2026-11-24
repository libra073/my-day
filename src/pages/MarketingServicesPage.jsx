import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { marketingApi } from '../services/marketingApi';
import { ServiceCard, glassCard, LoadingNote, ErrorNote } from '../components/marketing/marketingShared';

export default function MarketingServicesPage() {
  const { language, role, isLoggedIn, openAuthModal } = useAppContext();
  const isSw = language === 'sw';
  const [services, setServices] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    marketingApi.services()
      .then(res => setServices(res.services || []))
      .catch(e => setError(e.message));
  };
  useEffect(load, []);

  const steps = isSw ? [
    ['Wasilisha ombi', 'Chagua huduma, eleza malengo ya kampeni na tarehe unazopendelea, na pakia picha au video za kusaidia.'],
    ['Mapitio na nukuu', 'Timu ya MY DAY hupitia ombi lako, huomba taarifa zaidi ikihitajika, na kutoa nukuu ya bei au kuthibitisha bei iliyowekwa.'],
    ['Malipo na ratiba', 'Baada ya idhini, lipa kwa njia rasmi za MY DAY; timu huthibitisha malipo kisha hupanga kampeni yako.'],
    ['Utekelezaji na ripoti', 'Timu hutekeleza huduma na kurekodi ripoti halisi ya utendaji unayoiona kwenye dashibodi yako.'],
  ] : [
    ['Submit a request', 'Choose a service, describe your campaign objectives and preferred dates, and upload supporting images or videos.'],
    ['Review & quotation', 'The MY DAY team reviews your request, asks for more information if needed, and issues a quotation or confirms the set price.'],
    ['Payment & scheduling', 'Once approved, pay through MY DAY’s official channels; the team verifies payment server-side and schedules your campaign.'],
    ['Execution & report', 'The team delivers the service and records a real performance report you can read in your dashboard.'],
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <header className="mktg-hero glass-slab glass-frosted-optical" style={{ ...glassCard, marginBottom: '2rem' }}>
        <span className="mktg-badge" style={{ color: '#7c6cf8', borderColor: '#7c6cf855', background: '#7c6cf814' }}>
          <Megaphone size={13} /> {isSw ? 'Huduma za Masoko kwa Wauzaji' : 'Vendor Marketing Services'}
        </span>
        <h1>{isSw ? 'Kuza biashara yako ya harusi na MY DAY' : 'Grow your wedding business with MY DAY'}</h1>
        <p>
          {isSw
            ? 'Huduma za kitaalamu za masoko na promosheni zinazosimamiwa na timu ya MY DAY: wasifu wa biashara, picha na video, promosheni za mitandao ya kijamii, nafasi za udhamini na kampeni kamili. Kila huduma inasimamiwa na timu yetu — hakuna akaunti za matangazo za nje zilizounganishwa.'
            : 'Professional marketing and promotion services managed by the MY DAY team: business profiles, photography and video, social media promotion, sponsored placements and full campaigns. Every service is a managed service executed by our team — no external advertising accounts are connected.'}
        </p>
        {role === 'provider' ? (
          <Link to="/provider?tab=marketing" className="mktg-btn" style={{ textDecoration: 'none', padding: '0.7rem 1.6rem' }}>
            {isSw ? 'Omba huduma kwenye dashibodi yako' : 'Request a service from your dashboard'}
          </Link>
        ) : (
          <button
            type="button"
            className="mktg-btn"
            style={{ padding: '0.7rem 1.6rem' }}
            onClick={() => {
              if (isLoggedIn) window.location.assign('/provider?tab=marketing');
              else openAuthModal({ initialTab: 'register', contextNote: isSw ? 'Huduma za Masoko kwa Wauzaji' : 'Vendor Marketing Services' });
            }}
          >
            {isSw ? 'Jisajili kama muuzaji kuanza' : 'Register as a vendor to start'}
          </button>
        )}
      </header>

      <ErrorNote error={error} language={language} onRetry={load} />
      {!services ? <LoadingNote language={language} /> : (
        <div className="mktg-grid" style={{ marginBottom: '2.5rem' }}>
          {services.map(s => (
            <ServiceCard
              key={s.id}
              service={s}
              language={language}
              actionLabel={isSw ? 'Maelezo na ombi' : 'Details & request'}
              onAction={() => {
                if (role === 'provider') window.location.assign('/provider?tab=marketing');
                else openAuthModal({ initialTab: 'register', contextNote: s.name?.[language] || s.name?.en });
              }}
            />
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--app-text-primary, #0F172A)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        {isSw ? 'Jinsi inavyofanya kazi' : 'How it works'}
      </h2>
      <div className="mktg-steps" style={{ marginBottom: '2rem' }}>
        {steps.map(([title, body], i) => (
          <div key={i} className="mktg-step glass-slab glass-frosted-optical" style={glassCard}>
            <em>{i + 1}</em>
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--app-text-muted, #64748B)', lineHeight: 1.6 }}>
        {isSw
          ? 'Bei huwekwa na wasimamizi wa MY DAY; huduma zinaanza kwa nukuu ya bei. Nafasi za udhamini huandikwa wazi "Sponsored", huisha kiotomatiki, na hazibadilishi mpangilio wa asili wa wauzaji.'
          : 'Prices are set by MY DAY administrators; services start on quotation. Sponsored placements are visibly labelled “Sponsored”, expire automatically, and never alter organic vendor rankings.'}
      </p>
    </div>
  );
}