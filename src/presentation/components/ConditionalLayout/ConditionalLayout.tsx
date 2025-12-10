'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/presentation/components/Header';
import { Footer } from '@/presentation/components/Footer';

const AUTH_ROUTES = ['/dashboard', '/dispatch', '/paquetes', '/repartos', '/transportes', '/login'];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some(route => pathname?.startsWith(route));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
