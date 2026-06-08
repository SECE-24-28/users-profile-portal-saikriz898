import { StudentStatus } from '@/types';

const STATUS_CONFIG: Record<StudentStatus, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: 'Active', bg: 'rgba(16,185,129,0.1)', color: '#059669' },
  INACTIVE: { label: 'Inactive', bg: 'rgba(156,163,175,0.15)', color: '#6b7280' },
  GRADUATED: { label: 'Graduated', bg: 'rgba(79,70,229,0.1)', color: 'var(--accent)' },
  SUSPENDED: { label: 'Suspended', bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
};

export default function StatusBadge({ status }: { status: StudentStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}
