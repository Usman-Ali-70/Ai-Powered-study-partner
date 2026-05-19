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

export function PDFUploader({ onUploadComplete, onClose }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') {
      setFile(dropped);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === 'application/pdf') {
      setFile(selected);
    } else {
      toast.error('Please upload a PDF file');
    }
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

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      toast.success('PDF uploaded and processed!');
      onUploadComplete(data.note);
    } catch {
      toast.error('Failed to upload PDF. Please try again.');
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
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="card w-full max-w-md"
          style={{ padding: '32px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Upload PDF
            </h2>
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={18} />
            </button>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
            style={{
              borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
              background: isDragging ? 'var(--accent-glow)' : 'var(--bg-secondary)',
            }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-input')?.click()}
          >
            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={32} style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Drag & drop your PDF here
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  or click to browse
                </p>
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full mt-6"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing PDF...
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
