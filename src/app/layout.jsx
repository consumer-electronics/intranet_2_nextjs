import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';

import AppThemeProvider from '@/providers/AppThemeProvider';
import './globals.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata = {
  title: 'Intranet',
  description: 'Intranet corporativa',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>
            {children}
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}