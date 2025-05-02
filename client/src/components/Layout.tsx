import { ReactNode } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import CartSidebar from '@/components/CartSidebar';
import OrderHistory from '@/components/OrderHistory';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Momo Ecommerce' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Blazing fast ecommerce platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow flex flex-col md:flex-row">
          {/* Left sidebar - Categories */}
          <CategorySidebar />
          
          {/* Main content */}
          <div className="flex-grow p-4">
            {children}
          </div>
          
          {/* Right sidebar - Cart and Order History */}
          <div className="w-full md:w-64 p-4 border-l-2 border-black">
            <CartSidebar />
            <OrderHistory />
          </div>
        </main>
        
        <footer className="border-t-2 border-black py-4 text-center">
          <p>&copy; {new Date().getFullYear()} Momo Ecommerce. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}