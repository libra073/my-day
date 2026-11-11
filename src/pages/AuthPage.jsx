import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthExperience from '../components/auth/AuthExperience';

export default function AuthPage({ initialTab = 'login' }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const tab = token ? 'reset' : (params.get('tab') || initialTab);

  return (
    <main>
      <AuthExperience
        initialTab={tab}
        resetTokenFromUrl={token}
        onNavigate={(path) => navigate(path, { replace: true })}
      />
    </main>
  );
}
