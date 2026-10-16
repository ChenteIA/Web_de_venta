import type { Metadata, Viewport } from 'next';
import { Figtree, Gloock } from 'next/font/google';
import { IMAGES } from '@/lib/images';
import { BUSINESS } from '@/lib/site';
import './globals.css';

const gloock = Gloock({ weight: '400', subsets: ['latin'], variable: '--font-gloock', display: 'swap' });
const figtree = Figtree({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-figtree', display: 'swap' });

export const metadata: Metadata = {
  title: BUSINESS.name,
  description: `${BUSINESS.name}: ${BUSINESS.tagline} Pide por WhatsApp.`,
  icons: IMAGES.favicon
    ? { icon: [{ url: '/favicon-32.png', type: 'image/png', sizes: '32x32' }], apple: '/apple-touch-icon.png' }
    : { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#191210' },
  ],
};

// Aplica el tema guardado antes de pintar (evita el parpadeo).
// También activa las animaciones de aparición (.js-reveal) solo si hay JavaScript.
const themeScript = `document.documentElement.classList.add('js-reveal');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={`${gloock.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
