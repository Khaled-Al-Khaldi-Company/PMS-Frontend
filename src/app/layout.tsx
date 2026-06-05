import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './Providers';
import PwaInstall from './components/PwaInstall';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PMS - Khaled Al-Khaldi Contracting',
  description: 'Enterprise Resource Planning & Management System',
  manifest: '/manifest.json',
  other: {
    'google': 'notranslate',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <meta name="application-name" content="PMS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PMS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-950 text-slate-100 overflow-x-hidden`}>
        <Providers>{children}</Providers>
        <PwaInstall />
      </body>
    </html>
  );
}
