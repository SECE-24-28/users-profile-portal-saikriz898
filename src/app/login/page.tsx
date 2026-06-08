'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace('/dashboard');
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg}>
        <div style={styles.bgShape1} />
        <div style={styles.bgShape2} />
      </div>

      <div style={styles.card} className="animate-fade">
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={styles.logoText}>EduTrack</h1>
        </div>

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subheading}>Sign in to manage student profiles</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : 'Sign in'}
          </button>
        </form>

        <div style={styles.hint}>
          <span>Demo credentials pre-filled</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--surface)', position: 'relative', overflow: 'hidden', padding: '24px',
  },
  bg: { position: 'absolute', inset: 0, overflow: 'hidden' },
  bgShape1: {
    position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
    background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  bgShape2: {
    position: 'absolute', bottom: '-15%', left: '-10%', width: 500, height: 500,
    background: 'radial-gradient(circle, rgba(124,116,240,0.06) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  card: {
    background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '48px 40px',
    width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
    position: 'relative', zIndex: 1,
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: {
    width: 40, height: 40, background: 'var(--accent)', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' },
  heading: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 },
  subheading: { fontSize: 14, color: 'var(--ink-muted)', marginBottom: 28 },
  errorBox: {
    background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)',
    borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 20, fontSize: 14,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' },
  input: {
    padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: 14, color: 'var(--ink)', background: 'var(--surface)', transition: 'border 0.2s',
    outline: 'none',
  },
  btn: {
    marginTop: 8, padding: '12px', background: 'var(--accent)', color: 'white', border: 'none',
    borderRadius: 'var(--radius)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'opacity 0.2s, transform 0.1s',
  },
  hint: { marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--ink-muted)' },
};
