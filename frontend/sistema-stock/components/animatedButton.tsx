// components/AnimatedButton.tsx
'use client'
import { useState } from 'react';

export default function AnimatedButton() {
  // Definimos el tipo de `status` para aceptar 'null', 'success', o 'failed'
  const [status, setStatus] = useState<null | 'success' | 'failed'>(null);

  const handleClick = () => {
    simulateResponse();
  };

  const simulateResponse = () => {
    const success = Math.random() > 0.5;
    setStatus(success ? 'success' : 'failed');
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 text-white bg-primary-500 font-semibold rounded transition-all duration-500 ease-in-out ${
        status === 'success'
          ? 'animated-success'
          : status === 'failed'
          ? 'animated-fail'
          : 'bg-blue-500'
      }`}
    >
      {status === 'success' ? 'Success!' : status === 'failed' ? 'Failed' : 'Click me'}
    </button>
  );
}
