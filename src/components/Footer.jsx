import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

function Footer() {
  return (
    <footer style={{
      background: 'var(--color-dark)',
      color: '#FAF9F6',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      marginTop: '4rem',
      borderTop: '3px solid var(--color-primary)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Heart size={18} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-header)', color: '#ffffff', letterSpacing: '0.05em' }}>
              MY DAY
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Making wedding planning simple, beautiful, and stress-free for couples across Tanzania.
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <ShieldCheck size={16} /> 100% Verified Vendors & Secure Mobile Money
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)' }}>Home</Link></li>
            <li><Link to="/marketplace" style={{ color: 'rgba(255,255,255,0.8)' }}>Browse Services</Link></li>
            <li><Link to="/wedding" style={{ color: 'rgba(255,255,255,0.8)' }}>Wedding Profile</Link></li>
            <li><Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.8)' }}>Event Dashboard</Link></li>
            <li><Link to="/bookings" style={{ color: 'rgba(255,255,255,0.8)' }}>My Bookings</Link></li>
            <li><Link to="/become-vendor" style={{ color: 'rgba(255,255,255,0.8)' }}>Become a Vendor</Link></li>
            <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.8)' }}>Contact Us</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Categories</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/marketplace?category=kumbi" style={{ color: 'rgba(255,255,255,0.8)' }}>🏰 Kumbi – Venues</Link></li>
            <li><Link to="/marketplace?category=wapambaji" style={{ color: 'rgba(255,255,255,0.8)' }}>🎨 Wapambaji – Decorators</Link></li>
            <li><Link to="/marketplace?category=entertainment" style={{ color: 'rgba(255,255,255,0.8)' }}>🎤 MCs & Entertainment</Link></li>
            <li><Link to="/marketplace?category=catering" style={{ color: 'rgba(255,255,255,0.8)' }}>🍽️ Catering</Link></li>
            <li><Link to="/marketplace?category=saloon" style={{ color: 'rgba(255,255,255,0.8)' }}>💇 Saloon & Barbershop</Link></li>
            <li><Link to="/marketplace?category=transport" style={{ color: 'rgba(255,255,255,0.8)' }}>🚗 Transport</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Support & Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.8)' }}>Help Center & FAQ</Link></li>
            <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.8)' }}>Privacy Policy</Link></li>
            <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.8)' }}>Terms & Conditions</Link></li>
            <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.8)' }}>Refund & Cancellation Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.15)',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div>© 2026 MY DAY. All Rights Reserved.</div>
        <div>Designed for couples & service providers in Tanzania.</div>
      </div>
    </footer>
  );
}

export default Footer;
