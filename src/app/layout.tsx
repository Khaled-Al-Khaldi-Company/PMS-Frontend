import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PMS - Khaled Al-Khaldi Contracting',
  description: 'Enterprise Resource Planning & Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-950 text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
