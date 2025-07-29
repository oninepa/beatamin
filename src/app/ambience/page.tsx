// src/app/ambience/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 배경 소리 옵션 (16가지) - 이미지 경로 추가
const ambienceOptions = [
  { name: 'Stream', image: '/images/ambience/stream.jpg' },
  { name: 'Prairie Wind', image: '/images/ambience/prairie-wind.jpg' },
  { name: 'Forest Wind', image: '/images/ambience/forest-wind.jpg' },
  { name: 'Gentle Waves', image: '/images/ambience/gentle-waves.jpg' },
  { name: 'Rustling Leaves', image: '/images/ambience/rustling-leaves.jpg' },
  { name: 'Soft Birdsong', image: '/images/ambience/soft-birdsong.jpg' },
  { name: 'Crickets at Night', image: '/images/ambience/crickets-night.jpg' },
  { name: 'Owls at Night', image: '/images/ambience/owls-night.jpg' },
  { name: 'Page Turning', image: '/images/ambience/page-turning.jpg' },
  { name: 'Humming', image: '/images/ambience/humming.jpg' },
  { name: 'Cave Drips', image: '/images/ambience/cave-drips.jpg' },
  { name: 'Seagulls', image: '/images/ambience/seagulls.jpg' },
  { name: 'Campfire', image: '/images/ambience/campfire.jpg' },
  { name: 'Cosmic Sounds', image: '/images/ambience/cosmic-sounds.jpg' },
  { name: 'Deep Sea', image: '/images/ambience/deep-sea.jpg' },
  { name: 'Temple Bells', image: '/images/ambience/temple-bells.jpg' }
];

export default function AmbienceSelectionPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [selectedAmbiences, setSelectedAmbiences] = useState<string[]>([]);
  const [maxSelections] = useState(2);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      const fetchUserPlan = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserPlan(userDocSnap.data().plan || 'freeA');
          } else {
             setUserPlan('freeA');
          }
        } catch (err) {
          console.error("Error fetching user plan:", err);
          setUserPlan('freeA');
        }
      };
      fetchUserPlan();
    }
  }, [user, loading, router]);

  const handleAmbienceToggle = (ambienceName: string) => {
    setSelectedAmbiences(prev => {
      if (prev.includes(ambienceName)) {
        return prev.filter(a => a !== ambienceName);
      } else {
        if (prev.length < maxSelections) {
          return [...prev, ambienceName];
        }
        return prev;
      }
    });
  };

  const handleGenerate = () => {
    if (selectedAmbiences.length >= 0 && selectedAmbiences.length <= maxSelections) {
      setIsNavigating(true);
      localStorage.setItem('selectedAmbiences', JSON.stringify(selectedAmbiences));
      router.push('/time');
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
        <h1 className="text-4xl font-bold text-center">Add background sounds</h1>
        <p className="text-center text-gray-400 text-lg">
          Select up to {maxSelections} ambient sounds to enhance your experience.
        </p>

        {/* 선택 개수 표시 */}
        <div className="text-center text-lg text-gray-400">
          {selectedAmbiences.length} / {maxSelections} selected
        </div>

        {/* 배경 소리 버튼 그리드 (3열) - 폭 60%, 높이 2배 */}
        <div className="grid grid-cols-3 gap-2 justify-center">
          {ambienceOptions.map((ambience, index) => (
            <button
              key={index}
              onClick={() => handleAmbienceToggle(ambience.name)}
              disabled={!selectedAmbiences.includes(ambience.name) && selectedAmbiences.length >= maxSelections}
              className={`relative flex items-center justify-center rounded-xl transition duration-300 transform hover:scale-105 overflow-hidden ${
                selectedAmbiences.includes(ambience.name)
                  ? 'border-2 border-[#00F5FF] shadow-[0_0_15px_#00F5FF]'
                  : 'border border-gray-700 hover:border-[#00F5FF]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                width: '100%',
                height: '120px',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${ambience.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* 텍스트 오버레이 */}
              <div className="relative z-10 text-center px-1">
                <span 
                  className="block text-lg font-bold text-[#00F5FF] drop-shadow-lg" 
                  style={{
                    textShadow: '0 0 10px #00F5FF, 0 0 20px #00F5FF, 0 0 30px #00F5FF'
                  }}
                >
                  {ambience.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Generate 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={isNavigating}
          className={`w-full py-3 px-4 rounded-md font-medium transition duration-300 ${
            isNavigating
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-[#00F5FF] text-black hover:scale-[1.02] hover:shadow-[0_0_8px_#00F5FF]'
          }`}
        >
          {isNavigating ? 'Loading...' : 'Next'}
        </button>

        {/* 사용자 플랜 표시 - 대분류와 같은 형식으로 변경 */}
        {userPlan && (
          <div className="mt-6 p-3 bg-gray-900 rounded-md text-center text-xs text-gray-400">
            Your plan:{" "}
            <span className="font-semibold text-[#00F5FF]">
              {userPlan.toUpperCase()}
            </span>
          </div>
        )}

        {/* 뒤로 가기 링크 */}
        <div className="text-center">
          <Link href="/categories" className="text-[#00F5FF] hover:underline text-sm">
            &larr; Back to Categories
          </Link>
        </div>
      </div>
    </div>
  );
}