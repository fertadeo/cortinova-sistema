'use client';

import dynamic from 'next/dynamic';

const ReglasNegocioManager = dynamic(() => import('@/components/ReglasNegocioManager'), { ssr: false });

export default function ReglasNegocioPage() {
  return (
    <div className="w-full min-h-screen">
      <ReglasNegocioManager />
    </div>
  );
}
