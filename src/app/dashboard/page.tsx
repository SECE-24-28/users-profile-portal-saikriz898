'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGraphQL } from '@/hooks/useGraphQL';
import { Student, StudentConnection, CreateStudentInput } from '@/types';
import StudentModal from '@/components/StudentModal';
import StatusBadge from '@/components/StatusBadge';
import ProfileImageUpload from '@/components/ProfileImageUpload';

const STUDENTS_QUERY = `
  query GetStudents($page: Int, $pageSize: Int, $filter: StudentFilterInput) {
    students(page: $page, pageSize: $pageSize, filter: $filter) {
      students {
        id firstName lastName fullName email phone grade major gpa
        city state status profileImage enrolledAt
      }
      total page pageSize totalPages
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      id firstName lastName fullName email phone grade major gpa
      city state status profileImage enrolledAt
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      id firstName lastName fullName email phone grade major gpa
      city state status profileImage enrolledAt
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id) { success message }
  }
`;

export default function DashboardPage() {
  const { query } = useGraphQL();
  const [connection, setConnection] = useState<StudentConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewPanel, setViewPanel] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await query<{ students: StudentConnection }>(STUDENTS_QUERY, {
        page, pageSize: 10,
        filter: search ? { search } : undefined,
      });
      setConnection(data.students);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, page, search]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStudents, search]);

  const handleSave = async (input: CreateStudentInput) => {
    if (editStudent) {
      await query(UPDATE_MUTATION, { id: editStudent.id, input });
    } else {
      await query(CREATE_MUTATION, { input });
    }
    fetchStudents();
    setEditStudent(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await query(DELETE_MUTATION, { id: deleteId });
      setDeleteId(null);
      if (selectedStudent?.id === deleteId) { setSelectedStudent(null); setViewPanel(false); }
      fetchStudents();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const openEdit = (s: Student) => { setEditStudent(s); setModalOpen(true); };
  const openView = (s: Student) => { setSelectedStudent(s); setViewPanel(true); };

  const students = connection?.students || [];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Students</h1>
          <p style={styles.pageSubtitle}>
            {connection ? `${connection.total} students enrolled` : 'Loading…'}
          </p>
        </div>
        <button style={styles.addBtn} onClick={() => { setEditStudent(null); setModalOpen(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Student
        </button>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total', value: connection?.total || 0, color: 'var(--accent)' },
          { label: 'Active', value: students.filter(s => s.status === 'ACTIVE').length, color: '#059669' },
          { label: 'Graduated', value: students.filter(s => s.status === 'GRADUATED').length, color: '#7c3aed' },
          { label: 'Inactive', value: students.filter(s => s.status === 'INACTIVE' || s.status === 'SUSPENDED').length, color: '#9ca3af' },
        ].map(stat => (
          <div key={stat.label} style={styles.statCard}>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <svg style={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          style={styles.searchInput}
          placeholder="Search by name, email, or major…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button style={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Table + Side Panel */}
      <div style={styles.content}>
        <div style={{ ...styles.tableWrap, flex: viewPanel ? '1' : 'unset' }}>
          {loading ? (
            <div style={styles.loadingState}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎓</div>
              <p style={styles.emptyText}>{search ? 'No students found for that search.' : 'No students yet. Add your first student!'}</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Grade / Major</th>
                  <th style={styles.th}>GPA</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    style={{ ...styles.row, ...(selectedStudent?.id === s.id ? styles.rowSelected : {}) }}
                    onClick={() => openView(s)}
                  >
                    <td style={styles.td}>
                      <div style={styles.studentCell}>
                        <div style={styles.avatarSmall}>
                          {s.profileImage
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={s.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : <span>{s.firstName[0]}{s.lastName[0]}</span>
                          }
                        </div>
                        <div>
                          <div style={styles.studentName}>{s.fullName}</div>
                          <div style={styles.studentEmail}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.cellMain}>{s.grade || '—'}</div>
                      <div style={styles.cellSub}>{s.major || '—'}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.gpaChip}>
                        {s.gpa != null ? s.gpa.toFixed(1) : '—'}
                      </span>
                    </td>
                    <td style={styles.td}><StatusBadge status={s.status} /></td>
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.actionBtns}>
                        <button style={styles.iconBtn} title="Edit" onClick={() => openEdit(s)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button style={{ ...styles.iconBtn, ...styles.iconBtnDanger }} title="Delete" onClick={() => setDeleteId(s.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {connection && connection.totalPages > 1 && (
            <div style={styles.pagination}>
              <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={styles.pageInfo}>Page {page} of {connection.totalPages}</span>
              <button style={styles.pageBtn} disabled={page >= connection.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {viewPanel && selectedStudent && (
          <div style={styles.sidePanel} className="animate-slide">
            <div style={styles.sidePanelHeader}>
              <h3 style={styles.sidePanelTitle}>Profile</h3>
              <button style={styles.closeBtn} onClick={() => setViewPanel(false)}>✕</button>
            </div>

            <div style={styles.profileTop}>
              <ProfileImageUpload
                student={selectedStudent}
                onImageUpdated={(url) => {
                  setSelectedStudent(prev => prev ? { ...prev, profileImage: url } : null);
                  fetchStudents();
                }}
              />
              <div style={styles.profileName}>{selectedStudent.fullName}</div>
              <StatusBadge status={selectedStudent.status} />
            </div>

            <div style={styles.profileDetails}>
              {[
                { icon: '✉', label: 'Email', value: selectedStudent.email },
                { icon: '📱', label: 'Phone', value: selectedStudent.phone },
                { icon: '🎓', label: 'Grade', value: selectedStudent.grade },
                { icon: '📚', label: 'Major', value: selectedStudent.major },
                { icon: '⭐', label: 'GPA', value: selectedStudent.gpa?.toFixed(2) },
                { icon: '📍', label: 'Location', value: [selectedStudent.city, selectedStudent.state].filter(Boolean).join(', ') },
              ].map(({ icon, label, value }) => value ? (
                <div key={label} style={styles.detailRow}>
                  <span style={styles.detailIcon}>{icon}</span>
                  <div>
                    <div style={styles.detailLabel}>{label}</div>
                    <div style={styles.detailValue}>{value}</div>
                  </div>
                </div>
              ) : null)}

              {selectedStudent.bio && (
                <div style={styles.bioSection}>
                  <div style={styles.detailLabel}>Bio</div>
                  <p style={styles.bioText}>{selectedStudent.bio}</p>
                </div>
              )}
            </div>

            <div style={styles.sidePanelActions}>
              <button style={styles.editFullBtn} onClick={() => openEdit(selectedStudent)}>
                Edit Profile
              </button>
              <button style={styles.deleteOutlineBtn} onClick={() => setDeleteId(selectedStudent.id)}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditStudent(null); }}
        onSave={handleSave}
        student={editStudent}
      />

      {deleteId && (
        <div style={styles.overlay} onClick={() => setDeleteId(null)}>
          <div style={styles.confirmDialog} className="animate-fade" onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIcon}>🗑️</div>
            <h3 style={styles.confirmTitle}>Delete Student?</h3>
            <p style={styles.confirmText}>This action cannot be undone.</p>
            <div style={styles.confirmActions}>
              <button style={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={styles.deleteBtn} disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1280, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--ink)' },
  pageSubtitle: { fontSize: 14, color: 'var(--ink-muted)', marginTop: 2 },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
    background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  statCard: {
    background: 'var(--surface-card)', borderRadius: 'var(--radius)', padding: '16px 20px',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
  },
  statValue: { fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 },
  searchBar: {
    position: 'relative', marginBottom: 16, display: 'flex', alignItems: 'center',
  },
  searchIcon: { position: 'absolute', left: 14, color: 'var(--ink-muted)' },
  searchInput: {
    width: '100%', padding: '10px 14px 10px 42px', border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 14, background: 'var(--surface-card)', color: 'var(--ink)',
    outline: 'none',
  },
  clearSearch: {
    position: 'absolute', right: 12, background: 'none', border: 'none',
    cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 14,
  },
  content: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  tableWrap: {
    flex: 1, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
  },
  loadingState: { padding: 20 },
  emptyState: { padding: '60px 20px', textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: 'var(--ink-muted)', fontSize: 14 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'var(--surface)' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
    color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)',
  },
  row: {
    borderBottom: '1px solid var(--border)', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  rowSelected: { background: 'var(--surface-hover)' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  studentCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatarSmall: {
    width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 13, fontWeight: 600, flexShrink: 0, overflow: 'hidden',
  },
  studentName: { fontSize: 14, fontWeight: 500, color: 'var(--ink)' },
  studentEmail: { fontSize: 12, color: 'var(--ink-muted)' },
  cellMain: { fontSize: 13, color: 'var(--ink)', fontWeight: 500 },
  cellSub: { fontSize: 12, color: 'var(--ink-muted)' },
  gpaChip: {
    display: 'inline-block', padding: '2px 8px', background: 'var(--accent-glow)',
    color: 'var(--accent)', borderRadius: 6, fontSize: 12, fontWeight: 600,
  },
  actionBtns: { display: 'flex', gap: 6 },
  iconBtn: {
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--border)', borderRadius: 6, background: 'transparent',
    cursor: 'pointer', color: 'var(--ink-soft)', transition: 'all 0.15s',
  },
  iconBtnDanger: { color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)', background: 'var(--danger-light)' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '14px 16px', borderTop: '1px solid var(--border)' },
  pageBtn: {
    padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 7,
    background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--ink-soft)',
  },
  pageInfo: { fontSize: 13, color: 'var(--ink-muted)' },
  sidePanel: {
    width: 300, flexShrink: 0, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
  },
  sidePanelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
  },
  sidePanelTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)',
    fontSize: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6,
  },
  profileTop: {
    padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 10, borderBottom: '1px solid var(--border)',
  },
  profileName: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, textAlign: 'center' },
  profileDetails: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
  detailRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  detailIcon: { fontSize: 14, width: 20, flexShrink: 0, marginTop: 2 },
  detailLabel: { fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
  detailValue: { fontSize: 13, color: 'var(--ink)', marginTop: 1 },
  bioSection: { marginTop: 4 },
  bioText: { fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 },
  sidePanelActions: { padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 },
  editFullBtn: {
    flex: 1, padding: '9px', background: 'var(--accent)', color: 'white',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  deleteOutlineBtn: {
    padding: '9px 14px', background: 'var(--danger-light)', color: 'var(--danger)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 13,
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  confirmDialog: {
    background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', padding: '32px',
    width: 340, textAlign: 'center', boxShadow: 'var(--shadow-lg)',
  },
  confirmIcon: { fontSize: 36, marginBottom: 12 },
  confirmTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 },
  confirmText: { fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 },
  confirmActions: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 8,
    background: 'transparent', cursor: 'pointer', fontSize: 14,
  },
  deleteBtn: {
    flex: 1, padding: '10px', background: 'var(--danger)', color: 'white',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
  },
};
