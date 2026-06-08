'use client';

import { useState, useEffect } from 'react';
import { Student, CreateStudentInput, StudentStatus } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateStudentInput) => Promise<void>;
  student?: Student | null;
}

const STATUS_OPTIONS: StudentStatus[] = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'];

export default function StudentModal({ isOpen, onClose, onSave, student }: Props) {
  const [form, setForm] = useState<CreateStudentInput>({
    firstName: '', lastName: '', email: '', phone: '', grade: '',
    major: '', gpa: undefined, address: '', city: '', state: '',
    country: 'India', bio: '', status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setForm({
        firstName: student.firstName, lastName: student.lastName, email: student.email,
        phone: student.phone || '', grade: student.grade || '',
        major: student.major || '', gpa: student.gpa,
        address: student.address || '', city: student.city || '',
        state: student.state || '', country: student.country || 'India',
        bio: student.bio || '', status: student.status,
      });
    } else {
      setForm({ firstName: '', lastName: '', email: '', phone: '', grade: '', major: '',
        gpa: undefined, address: '', city: '', state: '', country: 'India', bio: '', status: 'ACTIVE' });
    }
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const set = (key: keyof CreateStudentInput, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="animate-fade">
        <div style={styles.header}>
          <h2 style={styles.title}>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <Field label="First Name *"><input style={styles.input} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required /></Field>
            <Field label="Last Name *"><input style={styles.input} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required /></Field>
          </div>
          <div style={styles.row}>
            <Field label="Email *"><input type="email" style={styles.input} value={form.email} onChange={(e) => set('email', e.target.value)} required /></Field>
            <Field label="Phone"><input style={styles.input} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          </div>
          <div style={styles.row}>
            <Field label="Grade"><input style={styles.input} value={form.grade} placeholder="e.g. 10th, 11th" onChange={(e) => set('grade', e.target.value)} /></Field>
            <Field label="Major"><input style={styles.input} value={form.major} placeholder="e.g. Computer Science" onChange={(e) => set('major', e.target.value)} /></Field>
          </div>
          <div style={styles.row}>
            <Field label="GPA"><input type="number" min="0" max="4" step="0.01" style={styles.input} value={form.gpa ?? ''} onChange={(e) => set('gpa', e.target.value ? parseFloat(e.target.value) : undefined)} /></Field>
            <Field label="Status">
              <select style={styles.input} value={form.status} onChange={(e) => set('status', e.target.value as StudentStatus)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={styles.row}>
            <Field label="City"><input style={styles.input} value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
            <Field label="State"><input style={styles.input} value={form.state} onChange={(e) => set('state', e.target.value)} /></Field>
          </div>
          <Field label="Address"><input style={styles.input} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
          <Field label="Bio"><textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} value={form.bio} onChange={(e) => set('bio', e.target.value)} /></Field>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : null}
              {saving ? 'Saving…' : (student ? 'Update Student' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)' }}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
  },
  modal: {
    background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', width: '100%',
    maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 28px 0', marginBottom: 20,
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
    color: 'var(--ink-muted)', width: 32, height: 32, display: 'flex',
    alignItems: 'center', justifyContent: 'center', borderRadius: 6,
  },
  errorBox: {
    margin: '0 28px 16px', background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.2)',
    color: 'var(--danger)', borderRadius: 8, padding: '10px 14px', fontSize: 13,
  },
  form: { padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', gap: 12 },
  input: {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8,
    fontSize: 13, color: 'var(--ink)', background: 'var(--surface)', width: '100%',
    fontFamily: 'var(--font-body)', outline: 'none',
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: {
    padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 8,
    background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--ink-soft)',
  },
  saveBtn: {
    padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none',
    borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
  },
};
