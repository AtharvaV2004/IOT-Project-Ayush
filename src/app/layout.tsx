import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ColdChain Monitor - Real-time IoT Cold Storage Tracking',
  description: 'Enterprise Cold Chain IoT Telemetry, GPS Tracking, and Remote Actuator Control platform for ESP32 devices.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#080d1a] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
