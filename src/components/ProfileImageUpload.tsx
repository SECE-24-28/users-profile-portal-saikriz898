'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Student } from '@/types';

interface Props {
  student: Student;
  onImageUpdated: (imageUrl: string) => void;
}

export default function ProfileImageUpload({ student, onImageUpdated }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      const { imageUrl } = await uploadRes.json();

      // Update student in GraphQL
      const gqlRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation UpdateImage($id: ID!, $imageUrl: String!) {
            updateStudentImage(id: $id, imageUrl: $imageUrl) { id profileImage }
          }`,
          variables: { id: student.id, imageUrl },
        }),
      });

      const gqlData = await gqlRes.json();
      if (gqlData.errors) throw new Error(gqlData.errors[0].message);

      onImageUpdated(imageUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  return (
    <div style={styles.container}>
      <div
        style={{ ...styles.imageArea, ...(dragOver ? styles.dragOver : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {student.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={student.profileImage} alt={student.fullName} style={styles.image} />
        ) : (
          <div style={styles.placeholder}>{initials}</div>
        )}

        <div style={styles.overlay}>
          {uploading ? (
            <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          ) : (
            <div style={styles.overlayContent}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span style={styles.overlayText}>Upload photo</span>
            </div>
          )}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {error && <p style={styles.error}>{error}</p>}
      <p style={styles.hint}>Click or drag to upload. Max 5MB.</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  imageArea: {
    position: 'relative', width: 120, height: 120, borderRadius: '50%',
    cursor: 'pointer', overflow: 'hidden', border: '3px solid var(--border)',
    transition: 'border-color 0.2s',
  },
  dragOver: { borderColor: 'var(--accent)', boxShadow: '0 0 0 4px var(--accent-glow)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: {
    width: '100%', height: '100%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)',
  },
  overlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0, transition: 'opacity 0.2s',
    // hover handled via CSS class below
  },
  overlayContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  overlayText: { color: 'white', fontSize: 11, fontWeight: 500 },
  error: { fontSize: 12, color: 'var(--danger)', textAlign: 'center' },
  hint: { fontSize: 11, color: 'var(--ink-muted)', textAlign: 'center' },
};
