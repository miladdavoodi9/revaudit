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
