'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <div style={styles.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={styles.logoText}>EduTrack</span>
      </div>

      <div style={styles.right}>
        {user && (
          <>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{user.name?.[0] || user.email[0].toUpperCase()}</div>
              <div>
                <div style={styles.userName}>{user.name || user.email.split('@')[0]}</div>
                <div style={styles.userRole}>{user.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', height: 60, background: 'var(--surface-card)',
    borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
  },
  left: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600,
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 },
  userRole: { fontSize: 11, color: 'var(--ink-muted)', textTransform: 'capitalize' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
    background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', transition: 'all 0.2s',
  },
};
