import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { CartProvider } from '@/context/CartContext';
import type { Metadata } from 'next';
import NavWrapper from '@/components/NavWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Unique Organizers | Premium System Stock Nairobi',
  description: 'The elite destination for high-tier organizational assets. Located at Sirikiwa Business Centre, Accra Road.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <CartProvider>
          <NavWrapper>{children}</NavWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
