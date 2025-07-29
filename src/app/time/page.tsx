// src/app/time/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 시간 옵션 (분 단위)
// 유료/무료에 따라 선택 가능한 옵션을 제한합니다.
const timeOptionsAll = [
  { value: 10, label: '10 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
];

export default function TimeSelectionPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [timeOptions, setTimeOptions] = useState(timeOptionsAll); // 기본값은 전체 옵션

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      // Firestore에서 사용자 요금제 정보 가져오기
      const fetchUserPlan = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const plan = userDocSnap.data().plan || 'freeA';
            setUserPlan(plan);
            
            // 요금제에 따라 선택 가능한 시간 옵션 필터링
            // Free A, Free B: 2시간(120분)까지
            // Plus, Premium: 전체
            if (plan === 'freeA' || plan === 'freeB') {
              setTimeOptions(timeOptionsAll.filter(option => option.value <= 120));
            } else {
              setTimeOptions(timeOptionsAll);
            }
          } else {
             setUserPlan('freeA');
             setTimeOptions(timeOptionsAll.filter(option => option.value <= 120));
          }
        } catch (err) {
          console.error("Error fetching user plan:", err);
          setUserPlan('freeA');
          setTimeOptions(timeOptionsAll.filter(option => option.value <= 120));
        }
      };
      fetchUserPlan();
    }
  }, [user, loading, router]);

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes);
  };

  const handleNext = () => {
    if (selectedTime !== null) {
      setIsNavigating(true);
      // 선택한 시간을 localStorage에 저장
      localStorage.setItem('selectedTime', selectedTime.toString());
      // 재생 페이지로 이동
      router.push('/play');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 bg-[#000814] text-white p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Select Duration</h1>
        <p className="text-center text-gray-400 text-sm">
          How long would you like to listen?
        </p>
        {/* 사용자 플랜 표시 - 대분류와 같은 형식으로 변경 */}
        {userPlan && (
          <div className="mt-6 p-3 bg-gray-900 rounded-md text-center text-xs text-gray-400">
            Your plan:{" "}
            <span className="font-semibold text-[#00F5FF]">
              {userPlan.toUpperCase()}
            </span>
            {(userPlan === 'freeA' || userPlan === 'freeB') && (
              <p className="mt-1">Free plans are limited to 2 hours.</p>
            )}
          </div>
        )}

        {/* 시간 옵션 버튼들 */}
        <div className="space-y-3">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeSelect(option.value)}
              className={`w-full py-3 px-4 rounded-md text-left transition duration-300 ${
                selectedTime === option.value
                  ? 'bg-[#00F5FF] text-black font-medium'
                  : 'bg-gray-800 border border-gray-700 hover:border-[#00F5FF]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Next 버튼 */}
        <button
          onClick={handleNext}
          disabled={selectedTime === null || isNavigating}
          className={`w-full py-3 px-4 rounded-md font-medium transition duration-300 ${
            selectedTime === null || isNavigating
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-[#00F5FF] text-black hover:scale-[1.02] hover:shadow-[0_0_8px_#00F5FF]'
          }`}
        >
          {isNavigating ? 'Loading...' : 'Generate'} {/* Next 대신 Generate로 변경 */}
        </button>

        {/* 뒤로 가기 링크 */}
        <div className="text-center">
          <Link href="/ambience" className="text-[#00F5FF] hover:underline text-sm">
            &larr; Back to Ambience
          </Link>
        </div>
      </div>
    </div>
  );
}