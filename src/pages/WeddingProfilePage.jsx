import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const LOCATIONS = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Zanzibar', 'Dodoma', 'Tanga'];

function WeddingProfilePage() {
  const { wedding, setWedding } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: wedding.title || "John & Sarah's Dream Wedding",
    bride: wedding.bride || 'Sarah',
    groom: wedding.groom || 'John',
    date: wedding.date || '2026-12-25',
    location: wedding.location || 'Dar es Salaam',
    guests: wedding.guests || 300,
    budget: wedding.budget || 15000000,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'guests' || name === 'budget' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setWedding(prev => ({ ...prev, ...formData }));
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/dashboard'); }, 1200);
  };

  const budgetAllocation = [
    { category: '🏰 Venue (Kumbi)', pct: 25, amount: formData.budget * 0.25 },
    { category: '🍽️ Catering', pct: 35, amount: formData.budget * 0.35 },
    { category: '🎨 Decorators (Wapambaji)', pct: 15, amount: formData.budget * 0.15 },
    { category: '🎤 MC & Entertainment', pct: 10, amount: formData.budget * 0.10 },
    { category: '💇 Saloon & Beauty', pct: 8, amount: formData.budget * 0.08 },
    { category: '🚗 Luxury Transport', pct: 7, amount: formData.budget * 0.07 },
  ];

  const glassCard = { background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#FFFFFF', marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Heart size={28} fill="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', marginBottom: '0.5rem', fontWeight: 800 }}>Configure Your Wedding Event</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Set your wedding date, guest count, and total budget to personalize vendor recommendations and expense tracking.</p>
        </div>

        {saved && (
          <div style={{
            background: 'var(--color-success-bg)', color: 'var(--color-success)',
            border: '1px solid rgba(56, 161, 105, 0.3)', padding: '1rem',
            borderRadius: 'var(--radius)', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700
          }}>
            <CheckCircle2 size={20} /> Wedding profile saved successfully! Redirecting to Dashboard...
          </div>
        )}

        <div style={{ ...glassCard, padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Wedding Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="E.g. John & Sarah's Grand Celebration" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Bride Name</label>
                <input type="text" name="bride" value={formData.bride} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Groom Name</label>
                <input type="text" name="groom" value={formData.groom} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Wedding Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Location / City</label>
                <select name="location" value={formData.location} onChange={handleChange}>
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Expected Guests</label>
                <input type="number" name="guests" min="20" max="5000" value={formData.guests} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>Total Target Budget (TSh)</label>
                <input type="number" name="budget" step="500000" value={formData.budget} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" style={{
              width: '100%',
              background: 'var(--color-primary)',
              color: '#FFFFFF', fontWeight: 700, fontSize: '1rem', padding: '0.9rem',
              borderRadius: 'var(--radius-pill)',
              boxShadow: 'var(--shadow-glow)',
            }}>
              Save Wedding Profile & Continue
            </button>
          </form>
        </div>

        {/* Recommended Budget Allocation preview */}
        <div style={{ ...glassCard, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', fontWeight: 700 }}>
            <Sparkles size={18} color="var(--color-primary)" />
            Recommended Budget Breakdown (TSh {formData.budget.toLocaleString()})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {budgetAllocation.map(b => (
              <div key={b.category} style={{
                background: 'var(--color-surface-soft)', padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{b.category}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>TSh {b.amount.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{b.pct}% of total budget</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeddingProfilePage;
