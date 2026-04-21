'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  onCapture: (email: string, name: string) => void;
}

export default function EmailCapture({ onCapture }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function validate(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(email)) {
      setError('Please enter a valid work email.');
      return;
    }
    setError('');
    onCapture(email.trim(), name.trim());
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="mb-6">
          <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Your report is ready.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Enter your email to unlock your full RevOps audit — scored across 5 categories with specific fixes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-600 transition-colors text-sm"
            />
          </div>

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="Work email *"
              required
              className={`w-full px-4 py-3 bg-gray-950 border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-colors text-sm ${
                error ? 'border-red-600 focus:border-red-500' : 'border-gray-800 focus:border-indigo-600'
              }`}
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm tracking-wide"
          >
            Unlock My Report →
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          No spam. One follow-up from Milad at 3MD Ventures.
        </p>
      </div>
    </div>
  );
}
