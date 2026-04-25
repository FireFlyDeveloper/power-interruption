import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { DeviceProvider } from '@/context/DeviceContext';
import { AuthProvider } from '@/context/AuthContext';
import { MetadataProvider } from '@/context/MetadataContext';
import { AppSettingsProvider } from '@/context/AppSettingsContext';
import StyleInjector from '@/components/StyleInjector';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem('power-interruption-settings');
                if (s) {
                  var d = JSON.parse(s);
                  if (d.darkMode === false) {
                    document.documentElement.classList.add('light');
                  }
                }
              } catch(e) {}
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className={`${poppins.className} bg-[#0C1119]`}>
        <AuthProvider>
          <AppSettingsProvider>
            <StyleInjector />
            <MetadataProvider>
              <DeviceProvider>
                {children}
              </DeviceProvider>
            </MetadataProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
