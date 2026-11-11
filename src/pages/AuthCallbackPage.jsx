import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, Mail } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import AuthExperience from '../components/auth/AuthExperience';

/**
 * Landing page for Supabase email links:
 *   • signup confirmation → session is established, go to the dashboard
 *   • password recovery   → show the set-a-new-password form
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [state, setState] = useState('loading'); // loading | recovery | error

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate('/login', { replace: true });
      return undefined;
    }

    let cancelled = false;
    const isRecoveryUrl =
      window.location.hash.includes('type=recovery') ||
      new URLSearchParams(window.location.search).get('type') === 'recovery';

    const resolve = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data?.session) {
        if (isRecoveryUrl) {
          setState('recovery');
        } else {
          const role = data.session.user?.user_metadata?.global_role;
          navigate(role === 'provider' ? '/provider' : role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
        return;
      }
      setState('error');
    };

    // Supabase parses the URL itself; give it a moment before giving up.
    const timer = setTimeout(resolve, 900);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') setState('recovery');
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub?.subscription?.unsubscribe?.();
    };
  }, [navigate]);

  if (state === 'recovery') {
    return <AuthExperience initialTab="reset" onNavigate={(path, opts) => navigate(path, opts)} />;
  }

  return (
    <div className="ax ax--page ax-callback">
      <section className="ax-card" style={{ textAlign: 'center' }}>
        <div className="ax-brand" style={{ justifyContent: 'center' }}>
          <span className="ax-brand__mark">
            {state === 'loading' ? <Loader2 size={18} className="ax-spin" /> : <ShieldCheck size={18} />}
          </span>
          <span className="ax-brand__name">MY DAY</span>
        </div>

        {state === 'loading' ? (
          <>
            <h1 className="ax-title">Confirming your link…</h1>
            <p className="ax-sub">One moment while we verify your email with Supabase.</p>
          </>
        ) : (
          <>
            <h1 className="ax-title">This link has expired</h1>
            <p className="ax-sub">
              Confirmation and reset links can only be used once, and they expire quickly. Request a fresh one below.
            </p>
            <button type="button" className="ax-submit" onClick={() => navigate('/login', { replace: true })}>
              <Mail size={16} /> Back to sign in
            </button>
          </>
        )}
      </section>
    </div>
  );
}
