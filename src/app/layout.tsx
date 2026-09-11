import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CodeArena | A little better, one problem at a time.',
  description:
    'A focused place to practice algorithms, explore solutions, and build your problem-solving instincts. Start with a JavaScript challenge.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="m-0 bg-paper font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
