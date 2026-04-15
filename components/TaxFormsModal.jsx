'use client';

import { useState, useRef } from 'react';

/**
 * TaxFormsModal - Download IRD + KiwiSaver forms, upload signed copies
 * Sends email to Angela with attachments
 */
export default function TaxFormsModal({ person, isOpen, onClose, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
    e.target.value = ''; // Reset input
  };

  const addFiles = (newFiles) => {
    // Filter for PDFs and images only
    const validFiles = newFiles.filter(f => 
      f.type === 'application/pdf' || 
      f.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (files.length === 0) {
      setError('Please add at least one file');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Convert files to base64
      const fileData = await Promise.all(
        files.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return {
            filename: file.name,
            content: base64,
            type: file.type,
          };
        })
      );

      const res = await fetch('/api/upload-tax-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personName: person?.name || 'Unknown',
          personId: person?.id,
          files: fileData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }

      setSuccess(true);
      onSuccess?.();
      
      // Close after brief success message
      setTimeout(() => {
        setFiles([]);
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFiles([]);
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-0 flex justify-between items-start">
          <h2 className="font-heading text-[28px] font-semibold text-gray-900">
            Your Tax Forms
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pt-6 space-y-6">
          {/* Download section */}
          <div>
            <p className="text-[15px] text-gray-600 mb-4">
              Please complete both forms.
            </p>
            <div className="flex gap-3">
              <a
                href="/forms/ir330-PAYE-form.pdf"
                download
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                IRD Form
              </a>
              <a
                href="/forms/Kiwisaver-form.pdf"
                download
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                KiwiSaver
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Upload section */}
          <div>
            <p className="text-[15px] text-gray-600 mb-4">
              Upload your signed forms here.
            </p>
            
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragOver 
                  ? 'border-teal bg-teal/5' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg 
                className="w-8 h-8 mx-auto mb-2 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
              </svg>
              <p className="text-sm text-gray-500">
                Drop files here or <span className="text-teal font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF or images</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-teal/20 px-8 py-5 bg-teal/5 flex justify-between items-center">
          <div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-teal font-medium">Sent to Angela ✓</p>}
          </div>
          
          <button
            onClick={handleSend}
            disabled={loading || files.length === 0 || success}
            className="px-8 py-3 rounded-xl bg-teal text-teal-dark text-base font-semibold hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
