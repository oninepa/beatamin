// src/app/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// 수정된 카테고리 데이터 - 경로 수정
const categories = [
  {
    id: "mindfulness",
    name: "Mindfulness",
    image: "/images/categories/mindfulness/mindfulness.jpg",
  },
  {
    id: "sleep",
    name: "Sleep",
    image: "/images/categories/sleep/sleep.jpg",
  },
  {
    id: "study",
    name: "Study",
    image: "/images/categories/study/study.jpg",
  },
  {
    id: "emotion",
    name: "Emotion",
    image: "/images/categories/emotion/emotion.jpg",
  },
  {
    id: "exercise",
    name: "Exercise",
    image: "/images/categories/exercise/exercise.jpg",
  },
  {
    id: "work",
    name: "Work",
    image: "/images/categories/work/work.jpg",
  },
  {
    id: "love",
    name: "Love",
    image: "/images/categories/love/love.jpg",
  },
  {
    id: "spirituality",
    name: "Spirituality",
    image: "/images/categories/spirituality/spirituality.jpg",
  },
];

export default function CategoriesPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchUserPlan = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserPlan(userDocSnap.data().plan || "freeA");
          } else {
            setUserPlan("freeA");
          }
        } catch (err) {
          console.error("Error fetching user plan:", err);
          setUserPlan("freeA");
        }
      };
      fetchUserPlan();
    }
  }, [user, loading, router]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  const handleImageError = (categoryId: string) => {
    console.log(`Image failed to load for category: ${categoryId}`);
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 bg-[#000814] text-white p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-center">Choose your goal</h1>
        <p className="text-center text-gray-400 text-base">
          Select a category that matches your current need.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="relative flex items-center justify-center h-32 rounded-xl bg-gray-800 border border-gray-700 hover:border-[#00F5FF] hover:bg-[#001a29] transition duration-300 transform hover:scale-105 overflow-hidden"
              style={{
                backgroundImage: `url(${category.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* 반투명 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              {/* 텍스트 오버레이 */}
              <span 
                className="relative z-10 text-2xl font-bold text-[#00F5FF] drop-shadow-lg text-center px-2" 
                style={{
                  textShadow: '0 0 10px #00F5FF, 0 0 20px #00F5FF, 0 0 30px #00F5FF'
                }}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>

        {userPlan && (
          <div className="mt-6 p-3 bg-gray-900 rounded-md text-center text-xs text-gray-400">
            Your plan:{" "}
            <span className="font-semibold text-[#00F5FF]">
              {userPlan.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
