import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RevAudit by 3MD Ventures',
  description:
    'Free AI-powered RevOps audit tool. Answer 10 questions and get a scored report across pipeline design, attribution, data hygiene, reporting, and revenue leakage.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'RevAudit by 3MD Ventures',
    description: 'How healthy is your RevOps stack? Get a free AI-powered audit in 3 minutes — scored across 5 categories with estimated ARR impact.',
    url: 'https://revaudit.3mdventures.com',
    siteName: 'RevAudit',
    images: [
      {
        url: 'https://revaudit.3mdventures.com/og-image.png',
        width: 2242,
        height: 2254,
        alt: '3MD Ventures — RevAudit',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RevAudit by 3MD Ventures',
    description: 'How healthy is your RevOps stack? Free AI-powered audit in 3 minutes.',
    images: ['https://revaudit.3mdventures.com/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-950 font-sans">{children}</body>
    </html>
  );
}
