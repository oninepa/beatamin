// src/app/layout.tsx
'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#000814] text-white min-h-screen flex flex-col`}>
        {/* 헤더 */}
        <header className="fixed top-0 w-full bg-[#000814] border-b border-gray-800 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* 왼쪽: 홈 버튼, 뒤로가기 버튼 */}
            <div className="flex items-center space-x-2">
              {/* 홈 화면(/)에서는 홈/뒤로가기 버튼 숨김 */}
              {pathname !== '/' && (
                <>
                  <button
                    onClick={() => router.push('/')}
                    className="text-[#00F5FF] hover:text-[#00c8d1]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="text-[#00F5FF] hover:text-[#00c8d1]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* 가운데: 앱 제목 */}
            <h1 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">Beatamin</h1>

            {/* 오른쪽: 언어 선택, 햄버거 메뉴, 프로필 이미지 (타이머 제거) */}
            <div className="flex items-center space-x-4">
              {/* 언어 선택 드롭다운 */}
              <select className="bg-gray-800 text-white border border-gray-700 rounded-md p-1 text-sm">
                <option value="en">EN</option>
                <option value="ko">KO</option>
              </select>

              {/* 햄버거 메뉴 버튼 */}
              <button className="text-[#00F5FF] hover:text-[#00c8d1]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* 프로필 이미지 또는 로그인 버튼 */}
              <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow container mx-auto px-4 py-10 pt-20 pb-20">
          {children}
        </main>

        {/* 광고 배너 공간 */}
        <div className="container mx-auto px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-800">
          Advertisement Space (For Free Users)
        </div>

        {/* 푸터 */}
        <footer className="fixed bottom-0 w-full bg-[#000814] border-t border-gray-800 z-50">
          <div className="container mx-auto px-4 py-2 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Beatamin. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}