import React from 'react';

const LoadingTransition = () => {
  return (
    <div className="fixed inset-0 z-50">
      {/* Fondo con blur */}
      <div className="absolute inset-0 backdrop-filter backdrop-blur-md bg-default-100/70" />
      
      {/* Contenido centrado */}
      <div className="flex relative flex-col justify-center items-center h-full">
        <div className="mb-8 w-16 h-16 rounded-full border-4 animate-spin border-primary border-t-transparent"></div>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Estamos navegando a presupuestos...</h2>
        <p className="text-foreground-500">Por favor, espere un momento</p>
      </div>
    </div>
  );
};

export default LoadingTransition; 