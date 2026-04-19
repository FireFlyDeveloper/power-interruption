import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { DeviceProvider } from '@/context/DeviceContext';
import { AuthProvider } from '@/context/AuthContext';
import { MetadataProvider } from '@/context/MetadataContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Power Monitor - Balayan Batangas',
  description: 'Power interruption monitoring system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className={`${poppins.className} bg-[#0C1119]`}>
        <AuthProvider>
          <MetadataProvider>
            <DeviceProvider>
              {children}
            </DeviceProvider>
          </MetadataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
