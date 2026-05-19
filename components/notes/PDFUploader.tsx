'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

interface PDFUploaderProps {
  onUploadComplete: (note: { id: string; title: string }) => void;
  onClose: () => void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.txt',
  '.md',
  '.markdown',
  '.doc',
  '.docx',
  '.rtf',
  '.html',
  '.htm',
  '.csv',
  '.json',
  '.xml',
  '.odt',
  '.pptx',
  '.ppt',
  '.xls',
  '.xlsx',
];

function isAcceptedFile(file: File): boolean {
  if (!file) return false;
  const name = file.name.toLowerCase();
  if (ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  // Generous fallback — anything text-ish or document MIME type
  if (file.type.startsWith('text/')) return true;
  if (
    file.type.includes('pdf') ||
    file.type.includes('msword') ||
    file.type.includes('officedocument') ||
    file.type.includes('opendocument') ||
    file.type.includes('rtf')
  ) {
    return true;
  }
  return false;
}

export function PDFUploader({ onUploadComplete, onClose }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const validateAndSet = (selected: File | undefined | null) => {
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      toast.error('File is larger than 25 MB');
      return;
    }
    if (!isAcceptedFile(selected)) {
      toast.error('Unsupported file type');
      return;
    }
    setFile(selected);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSet(e.target.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authedFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Upload failed (${res.status})`);
      }
      toast.success('Document uploaded and processed!');
      onUploadComplete(data.note);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="card w-full max-w-md"
          style={{ padding: '24px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Upload Document
            </h2>
            <button onClick={onClose} className="btn-ghost p-2" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Drop zone */}
          <div
            className="rounded-xl p-6 sm:p-8 text-center transition-colors cursor-pointer"
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragging ? 'var(--accent-glow)' : 'var(--bg-secondary)',
            }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('doc-input')?.click()}
          >
            <input
              id="doc-input"
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={32} style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-medium break-all">{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Drag & drop any document here
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  or click to browse — PDF, DOCX, TXT, MD, RTF, CSV, JSON…
                </p>
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full mt-5"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload & Process
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
