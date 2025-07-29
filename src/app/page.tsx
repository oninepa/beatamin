'use client';

import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // 로그인된 사용자는 대분류 페이지로 이동
        router.push('/categories');
      } else {
        // 로그인되지 않은 사용자는 로그인 페이지로 이동
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // 로딩 중일 때 표시할 화면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F5FF] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Beatamin</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-400">Error</h1>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-[#00F5FF] text-black px-6 py-2 rounded-md font-medium hover:scale-105 transition-transform"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 기본적으로는 빈 화면 (리다이렉트 중)
  return null;
}