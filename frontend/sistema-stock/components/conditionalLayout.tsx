// components/ConditionalLayout.tsx
"use client"
import React, { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import {SideBar} from './sidebar';

const ConditionalLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/'; // Ajusta esta condición si tu ruta de login es diferente

  return (
    <>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <SideBar />
        <main style={{ flexGrow: 1, overflow: 'auto', padding: '20px' }}>
            {children}
          </main>
        </div>

      )}
    </>
  );
};

export default ConditionalLayout;
