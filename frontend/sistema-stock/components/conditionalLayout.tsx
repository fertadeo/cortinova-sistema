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
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg">
          <SideBar />
          <main className="flex-grow overflow-auto p-5 bg-gray-50 dark:bg-dark-bg">
            {children}
          </main>
        </div>
      )}
    </>
  );
};

export default ConditionalLayout;
