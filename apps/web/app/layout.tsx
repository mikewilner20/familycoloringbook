import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Family Coloring Book POD',
  description: 'Transform family photos into coloring books'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <header className="list-inline" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
            <h1>Family Coloring Book</h1>
            <a href="/">Projects</a>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
