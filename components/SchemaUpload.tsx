'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface SchemaUploadProps {
  onComplete: (schema: string, filename: string, crm: string, companySize: string, industry: string, arr: string) => void;
  onBack: () => void;
}

const CRM_OPTIONS   = ['Salesforce', 'HubSpot', 'Pipedrive', 'Monday.com', 'Other'];
const SIZE_OPTIONS  = ['1–10', '11–50', '51–200', '201–500', '500+'];
const ARR_OPTIONS   = ['Under $500K', '$500K–$1M', '$1M–$5M', '$5M–$20M', '$20M–$50M', '$50M+'];
const ACCEPT        = '.csv,.json,.xml';
const MAX_BYTES     = 500_000; // 500 KB — field schema never needs more

export default function SchemaUpload({ onComplete, onBack }: SchemaUploadProps) {
  const [file, setFile]           = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging]   = useState(false);
  const [crm, setCrm]             = useState('');
  const [size, setSize]           = useState('');
  const [industry, setIndustry]   = useState('');
  const [arr, setArr]             = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string {
    if (f.size > MAX_BYTES) return 'File is too large. Please export only your field schema (not records).';
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json', 'xml'].includes(ext ?? '')) return 'Only .csv, .json, and .xml files are accepted.';
    return '';
  }

  function handleFile(f: File) {
    const err = validateFile(f);
    if (err) { setFileError(err); setFile(null); return; }
    setFileError('');
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  async function handleSubmit() {
    if (!file || !crm || !size) return;
    const text = await file.text();
    onComplete(text, file.name, crm, size, industry, arr);
  }

  const canSubmit = file && crm && size;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-2">
        <span className="text-xs font-medium text-brand-400 uppercase tracking-widest">Schema Upload</span>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Upload your CRM field export</h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        We read field names, types, and picklist values only — never actual records, contacts, or deal data.
      </p>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-3 mb-2 ${
          dragging
            ? 'border-brand-400 bg-brand-950'
            : file
            ? 'border-brand-600 bg-gray-900'
            : 'border-gray-700 bg-gray-900 hover:border-gray-500'
        }`}
      >
        <input ref={inputRef} type="file" accept={ACCEPT} onChange={onInputChange} className="hidden" />
        {file ? (
          <>
            <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">{file.name}</p>
            <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-gray-300 text-sm font-medium">Drop your file here or click to browse</p>
            <p className="text-gray-600 text-xs">CSV · JSON · XML · Max 500 KB</p>
          </>
        )}
      </div>
      {fileError && <p className="text-red-400 text-xs mb-4">{fileError}</p>}

      {/* What we read notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-300 font-medium">What we read:</span> field names, data types, picklist values, and required rules.{' '}
          <span className="text-gray-300 font-medium">What we never read:</span> contacts, companies, deals, or any actual records.
          Your file is processed in memory and discarded immediately after the report is generated.
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Your CRM <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CRM_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCrm(opt)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  crm === opt
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-brand-500 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Company Size <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSize(opt)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  size === opt
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-brand-500 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Industry <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. SaaS, FinTech, Healthcare"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Current ARR <span className="text-gray-600">(optional)</span>
          </label>
          <p className="text-xs text-brand-400 mb-2">
            Sharing your ARR lets us calculate the exact dollar value of each finding.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ARR_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setArr((a) => (a === opt ? '' : opt))}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  arr === opt
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-brand-500 hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm tracking-wide"
        >
          Analyze My Schema →
        </button>
      </div>
    </div>
  );
}
