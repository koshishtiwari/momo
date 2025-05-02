import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { loadHtmx } from '@/lib/htmx';

export default function App({ Component, pageProps }: AppProps) {
  // Initialize HTMX on client-side
  useEffect(() => {
    loadHtmx();
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}