import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import WalletProvider from '@/components/wallet/WalletProvider';
import Layout from '@/components/common/Layout';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WalletProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  );
}