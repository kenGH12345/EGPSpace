'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoricalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF5E6 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-3xl">🧪</span>
        </div>
        <p className="text-gray-600">正在跳转...</p>
      </div>
    </div>
  );
}
