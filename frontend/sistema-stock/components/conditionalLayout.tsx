// components/ConditionalLayout.tsx
"use client"
import React, { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { SideBar } from './sidebar';

const ConditionalLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const pathname = usePathname();

  // Ajusta estas condiciones si tus rutas de login o recuperar contraseña son diferentes
  const isLoginPage = pathname === '/'; // Página de login
  const isRecoverPasswordPage = pathname === '/recuperar-password'; // Página de recuperar contraseña

  return (
    <>
      {isLoginPage || isRecoverPasswordPage ? ( // Si es login o recuperar contraseña, no muestra el sidebar
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
