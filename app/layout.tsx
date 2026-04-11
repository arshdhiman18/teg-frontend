import type { Metadata } from 'next';
import { Playfair_Display, Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LenisProvider from './LenisProvider';
import SplashScreen from '@/components/SplashScreen';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TEG — The Event Gardener | Luxury Event Design',
    template: '%s | The Event Gardener',
  },
  description:
    'TEG - The Event Gardener creates bespoke luxury event experiences for weddings, birthdays, anniversaries, corporate events and more. We design memories.',
  keywords: [
    'luxury event planning',
    'event decoration',
    'wedding decor',
    'birthday decoration',
    'corporate events',
    'TEG',
    'The Event Gardener',
  ],
  openGraph: {
    title: 'TEG — The Event Gardener | Luxury Event Design',
    description:
      'Bespoke luxury event design for those who demand the extraordinary.',
    type: 'website',
    locale: 'en_IN',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <body className="bg-light font-inter">
        <LenisProvider>
          <SplashScreen />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
