import type { Metadata } from 'next';
import { Geist, Geist_Mono, Rethink_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const rethinkSans = Rethink_Sans({
  variable: '--font-rethink-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BeFitus',
  description: 'Train smarter. Track better.',
  icons: {
    icon: '/Logo-BeFitus.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rethinkSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
