import { Inter } from 'next/font/google';
import './globals.css';

import { CartProvider } from '@/context/CartContext';
import type { Metadata } from 'next';
import NavWrapper from '@/components/NavWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Unique Organizers | Premium System Stock Nairobi',
  description: 'The elite destination for high-tier organizational assets. Located at Tumaini House, 5th Floor, Shop Number 4, Next to Cafe Deli, Behind Kencom Building.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        
      </head>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <CartProvider>
          <NavWrapper>{children}</NavWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
