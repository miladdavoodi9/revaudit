import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/3md-ventures.svg"
            alt="3MD Ventures"
            width={160}
            height={69}
            priority
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-xs font-medium text-gray-400 tracking-wide">
            Free · 2 minutes · No CRM access required
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
          Your CRM is lying to your leadership.
        </h1>

        {/* Subhead */}
        <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Answer 10 questions. Get a scored audit of your RevOps stack — pipeline design,
          attribution, hygiene, reporting, and revenue leakage risk. Free. Instant. Specific.
        </p>

        {/* CTA */}
        <Link
          href="/audit"
          className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-base tracking-wide shadow-lg shadow-indigo-950"
        >
          Start My Free Audit →
        </Link>

        {/* Stat pills */}
        <div className="flex items-center justify-center gap-4 mt-10">
          {[
            { label: '5 categories' },
            { label: '10 questions' },
            { label: '$0 cost' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-full text-sm font-medium text-gray-400"
            >
              {stat.label}
            </div>
          ))}
        </div>
      </div>

      {/* Footer brand */}
      <div className="mt-16 flex flex-col items-center gap-3">
        <Image src="/3md-ventures.svg" alt="3MD Ventures" width={100} height={43} className="opacity-30" />
        <p className="text-gray-700 text-xs tracking-wide">Built in Austin, TX</p>
      </div>
    </main>
  );
}
