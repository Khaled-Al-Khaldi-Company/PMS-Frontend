import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PMS - Khaled Al-Khaldi Contracting',
  description: 'Enterprise Resource Planning & Mustaqlasat Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
