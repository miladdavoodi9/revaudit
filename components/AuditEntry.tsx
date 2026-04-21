'use client';

interface AuditEntryProps {
  onQuiz: () => void;
  onUpload: () => void;
}

export default function AuditEntry({ onQuiz, onUpload }: AuditEntryProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">RevOps Audit</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Get a scored assessment of your revenue operations stack — with specific fixes and estimated ARR impact.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Quiz path */}
        <button
          onClick={onQuiz}
          className="group text-left bg-gray-900 border border-gray-800 hover:border-brand-500 rounded-2xl p-6 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-800 transition-colors">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-1">Answer 10 Questions</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Self-paced diagnostic. Takes about 3 minutes. No CRM access needed.
          </p>
          <div className="mt-4 text-brand-400 text-sm font-medium group-hover:text-brand-300 transition-colors">
            Start quiz →
          </div>
        </button>

        {/* Upload path */}
        <button
          onClick={onUpload}
          className="group text-left bg-gray-900 border border-gray-800 hover:border-brand-500 rounded-2xl p-6 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-800 transition-colors">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-1">Upload Your CRM Export</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Drop a CSV, JSON, or XML field export. Claude reads your schema — not your data.
          </p>
          <div className="mt-4 text-brand-400 text-sm font-medium group-hover:text-brand-300 transition-colors">
            Upload file →
          </div>
        </button>
      </div>

      <p className="text-center text-gray-600 text-xs mt-6">
        Both paths produce the same scored report across 5 RevOps categories.
      </p>
    </div>
  );
}
