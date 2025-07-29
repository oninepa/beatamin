// src/app/categories/[slug]/page.tsx
'use client';

// 1. use 훅을 react에서 임포트
import { useState, useEffect, use } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 각 카테고리별 세부 항목 데이터 (이미지, 설명 포함, 공간 정보 제거)
const categoryDetails: Record<string, {
  title: string;
  items: {
    name: string;
    image: string;
    // space: 'indoor' | 'outdoor'; // 공간 정보 제거
    description: string;
  }[]
}> = {
  mindfulness: {
    title: 'Mindfulness',
    items: [
      {
        name: 'Mindfulness Meditation',
        image: '/images/categories/mindfulness/mindfulness_meditation.jpg',
        description: 'Focus on the present moment to reduce stress and increase awareness.'
      },
      {
        name: 'Body Scan',
        image: '/images/categories/mindfulness/body_scan.jpg',
        description: 'Progressively focus on different parts of your body to release tension.'
      },
      {
        name: 'Breath Awareness',
        image: '/images/categories/mindfulness/breath_awareness.jpg',
        description: 'Concentrate on your breathing to calm the mind and relax the body.'
      },
      {
        name: 'Nature Connection',
        image: '/images/categories/mindfulness/nature_connection.jpg',
        description: 'Connect with the natural environment to feel grounded and peaceful.'
      },
      {
        name: 'Cosmic Connection',
        image: '/images/categories/mindfulness/cosmic_connection.jpg',
        description: 'Feel a sense of unity with the universe to expand your consciousness.'
      },
      {
        name: 'Transcendental Meditation',
        image: '/images/categories/mindfulness/transcendental_meditation.jpg',
        description: 'Use a mantra to transcend ordinary thought and reach a state of pure awareness.'
      },
      {
        name: 'Focused Attention',
        image: '/images/categories/mindfulness/focused_attention.jpg',
        description: 'Concentrate on a single object or thought to improve focus and clarity.'
      },
      {
        name: 'Loving-Kindness Meditation',
        image: '/images/categories/mindfulness/loving_kindness_meditation.jpg',
        description: 'Cultivate feelings of compassion and love for yourself and others.'
      },
    ],
  },
  sleep: {
    title: 'Sleep',
    items: [
      {
        name: 'Deep Sleep',
        image: '/images/categories/sleep/deep_sleep.jpg',
        description: 'Promote restorative sleep for physical and mental recovery.'
      },
      {
        name: 'Long Sleep',
        image: '/images/categories/sleep/long_sleep.jpg',
        description: 'Encourage longer sleep duration for deep rest.'
      },
      {
        name: 'Short Nap',
        image: '/images/categories/sleep/short_nap.jpg',
        description: 'Refresh and rejuvenate with a quick power nap.'
      },
      {
        name: 'Dream Sleep',
        image: '/images/categories/sleep/dream_sleep.jpg',
        description: 'Enhance REM sleep for vivid dreams and emotional processing.'
      },
      {
        name: 'Daytime Nap',
        image: '/images/categories/sleep/daytime_nap.jpg',
        description: 'Combat afternoon fatigue with a rejuvenating midday rest.'
      },
      {
        name: 'Recovery Sleep',
        image: '/images/categories/sleep/recovery_sleep.jpg',
        description: 'Accelerate healing and recovery through quality sleep.'
      },
      {
        name: 'Insomnia Relief',
        image: '/images/categories/sleep/insomnia_relief.jpg',
        description: 'Help calm an overactive mind to fall asleep more easily.'
      },
      {
        name: 'Drowsiness Prevention',
        image: '/images/categories/sleep/drowsiness_prevention.jpg',
        description: 'Stay alert and awake during the day to improve nighttime sleep.'
      },
    ],
  },
  study: {
    title: 'Study',
    items: [
      {
        name: 'Creativity Boost',
        image: '/images/categories/study/creativity_boost.jpg',
        description: 'Stimulate creative thinking and idea generation.'
      },
      {
        name: 'Memory Enhancement',
        image: '/images/categories/study/memory_enhancement.jpg',
        description: 'Improve retention and recall of information.'
      },
      {
        name: 'Analytical Thinking',
        image: '/images/categories/study/analytical_thinking.jpg',
        description: 'Sharpen logical reasoning and problem-solving skills.'
      },
      {
        name: 'Mathematical Focus',
        image: '/images/categories/study/mathematical_focus.jpg',
        description: 'Enhance concentration for numerical tasks.'
      },
      {
        name: 'Literary Comprehension',
        image: '/images/categories/study/literary_comprehension.jpg',
        description: 'Improve understanding and analysis of texts.'
      },
      {
        name: 'Physical Learning',
        image: '/images/categories/study/physical_learning.jpg',
        description: 'Aid in memorizing physical movements and skills.'
      },
      {
        name: 'Exam Preparation',
        image: '/images/categories/study/exam_preparation.jpg',
        description: 'Reduce anxiety and optimize focus for exams.'
      },
      {
        name: 'Holistic Learning',
        image: '/images/categories/study/holistic_learning.jpg',
        description: 'Integrate multiple learning styles for better understanding.'
      },
    ],
  },
  emotion: {
    title: 'Emotion',
    items: [
      {
        name: 'Inner Peace',
        image: '/images/categories/emotion/inner_peace.jpg',
        description: 'Cultivate a sense of calm and tranquility within.'
      },
      {
        name: 'Anger Management',
        image: '/images/categories/emotion/anger_management.jpg',
        description: 'Learn to control and express anger in a healthy way.'
      },
      {
        name: 'Empathy Enhancement',
        image: '/images/categories/emotion/empathy_enhancement.jpg',
        description: 'Develop a deeper understanding of others\' feelings.'
      },
      {
        name: 'Happiness Promotion',
        image: '/images/categories/emotion/happiness_promotion.jpg',
        description: 'Boost overall mood and sense of well-being.'
      },
      {
        name: 'Self-Compassion',
        image: '/images/categories/emotion/self_compassion.jpg',
        description: 'Practice kindness and understanding towards yourself.'
      },
      {
        name: 'Emotional Balance',
        image: '/images/categories/emotion/emotional_balance.jpg',
        description: 'Stabilize mood swings and achieve emotional equilibrium.'
      },
      {
        name: 'Sadness Alleviation',
        image: '/images/categories/emotion/sadness_alleviation.jpg',
        description: 'Gently process and lift feelings of sadness.'
      },
      {
        name: 'Conflict Resolution',
        image: '/images/categories/emotion/conflict_resolution.jpg',
        description: 'Approach disagreements with clarity and empathy.'
      },
    ],
  },
  exercise: {
    title: 'Exercise',
    items: [
      {
        name: 'Warm-up',
        image: '/images/categories/exercise/warm_up.jpg',
        description: 'Prepare your body and mind for physical activity.'
      },
      {
        name: 'Flexibility',
        image: '/images/categories/exercise/flexibility.jpg',
        description: 'Improve range of motion and reduce injury risk.'
      },
      {
        name: 'Cardio',
        image: '/images/categories/exercise/cardio.jpg',
        description: 'Boost heart rate and endurance for overall fitness.'
      },
      {
        name: 'Strength Training',
        image: '/images/categories/exercise/strength_training.jpg',
        description: 'Build muscle mass and increase physical power.'
      },
      {
        name: 'Endurance',
        image: '/images/categories/exercise/endurance.jpg',
        description: 'Increase stamina for longer periods of activity.'
      },
      {
        name: 'Running',
        image: '/images/categories/exercise/running.jpg',
        description: 'Enhance cardiovascular health and mental clarity.'
      },
      {
        name: 'Walking',
        image: '/images/categories/exercise/walking.jpg',
        description: 'Promote gentle movement and mindfulness.'
      },
      {
        name: 'Recovery',
        image: '/images/categories/exercise/recovery.jpg',
        description: 'Aid muscle repair and reduce fatigue post-workout.'
      },
    ],
  },
  work: {
    title: 'Work',
    items: [
      {
        name: 'Motivation Boost',
        image: '/images/categories/work/motivation_boost.jpg',
        description: 'Increase drive and enthusiasm for tasks.'
      },
      {
        name: 'Focused Work',
        image: '/images/categories/work/focused_work.jpg',
        description: 'Minimize distractions for deep work sessions.'
      },
      {
        name: 'Multitasking',
        image: '/images/categories/work/multitasking.jpg',
        description: 'Manage multiple tasks efficiently without losing focus.'
      },
      {
        name: 'Collaborative Work',
        image: '/images/categories/work/collaborative_work.jpg',
        description: 'Enhance teamwork and communication skills.'
      },
      {
        name: 'Analytical Tasks',
        image: '/images/categories/work/analytical_tasks.jpg',
        description: 'Support complex problem-solving and data analysis.'
      },
      {
        name: 'Accounting Tasks',
        image: '/images/categories/work/accounting_tasks.jpg',
        description: 'Maintain accuracy and focus during financial work.'
      },
      {
        name: 'Customer Service',
        image: '/images/categories/work/customer_service.jpg',
        description: 'Cultivate patience and empathy for client interactions.'
      },
      {
        name: 'Organization',
        image: '/images/categories/work/organization.jpg',
        description: 'Improve mental clarity for planning and structuring tasks.'
      },
    ],
  },
  love: {
    title: 'Love',
    items: [
      {
        name: 'Romantic Love',
        image: '/images/categories/love/romantic_love.jpg',
        description: 'Deepen intimacy and connection with a partner.'
      },
      {
        name: 'Family Love',
        image: '/images/categories/love/family_love.jpg',
        description: 'Strengthen bonds and foster harmony within the family.'
      },
      {
        name: 'Friendship',
        image: '/images/categories/love/friendship.jpg',
        description: 'Celebrate and nurture platonic relationships.'
      },
      {
        name: 'Forgiveness',
        image: '/images/categories/love/forgiveness.jpg',
        description: 'Release resentment and heal emotional wounds.'
      },
      {
        name: 'Reconciliation',
        image: '/images/categories/love/reconciliation.jpg',
        description: 'Rebuild trust and understanding after conflict.'
      },
      {
        name: 'Universal Love',
        image: '/images/categories/love/universal_love.jpg',
        description: 'Cultivate compassion and empathy for all beings.'
      },
      {
        name: 'Sexual Desire',
        image: '/images/categories/love/sexual_desire.jpg',
        description: 'Enhance physical attraction and intimacy.'
      },
      {
        name: 'Sexual Performance',
        image: '/images/categories/love/sexual_performance.jpg',
        description: 'Reduce anxiety and boost confidence in intimate situations.'
      },
    ],
  },
  spirituality: {
    title: 'Spirituality',
    items: [
      {
        name: 'Prayer',
        image: '/images/categories/spirituality/prayer.jpg',
        description: 'Connect with a higher power or inner self through devotion.'
      },
      {
        name: 'Praise',
        image: '/images/categories/spirituality/praise.jpg',
        description: 'Express gratitude and joy through uplifting energy.'
      },
      {
        name: 'Repentance',
        image: '/images/categories/spirituality/repentance.jpg',
        description: 'Acknowledge mistakes and seek inner peace through reflection.'
      },
      {
        name: 'Compassion',
        image: '/images/categories/spirituality/compassion.jpg',
        description: 'Develop unconditional love and empathy for others.'
      },
      {
        name: 'Enlightenment',
        image: '/images/categories/spirituality/enlightenment.jpg',
        description: 'Seek profound understanding and spiritual awakening.'
      },
      {
        name: 'Scripture Reading',
        image: '/images/categories/spirituality/scripture_reading.jpg',
        description: 'Deepen understanding through contemplation of sacred texts.'
      },
      {
        name: 'Sacrifice',
        image: '/images/categories/spirituality/sacrifice.jpg',
        description: 'Cultivate selflessness and letting go of attachments.'
      },
      {
        name: 'Third Eye',
        image: '/images/categories/spirituality/third_eye.jpg',
        description: 'Enhance intuition and inner vision for spiritual insight.'
      },
    ],
  },
};
export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  // 2. params를 use()로 언래핑
  // const slug = params?.slug || ''; // 이전 방식 (더 이상 권장되지 않음)
  const unwrappedParams = use(params); // params Promise를 언래핑
  const slug = unwrappedParams.slug; // 이제 실제 slug 값에 접근

  const categoryData = categoryDetails[slug];
  
  useEffect(() => {
    console.log('Current slug:', slug);
    console.log('Category data:', categoryData);
 
  }, [slug, categoryData]);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

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

  // Add auto-navigation when item is selected
  const handleItemSelect = (itemName: string) => {
    setSelectedItem(itemName);
    setIsNavigating(true);
    localStorage.setItem('selectedCategory', slug);
    localStorage.setItem('selectedCategoryTitle', categoryData.title);
    localStorage.setItem('selectedSubCategory', itemName);
    router.push('/ambience');
  };

  // handleNext 함수 추가 또는 버튼 제거
  const handleNext = () => {
    if (selectedItem) {
      setIsNavigating(true);
      localStorage.setItem('selectedCategory', slug);
      localStorage.setItem('selectedCategoryTitle', categoryData.title);
      localStorage.setItem('selectedSubCategory', selectedItem);
      router.push('/ambience');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">Error: {error.message}</div>;
  }

  // 잘못된 카테고리 슬러그 처리
  if (!categoryData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#000814] text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-400 mb-6">The requested category does not exist.</p>
        <Link href="/categories" className="text-[#00F5FF] hover:underline">
          &larr; Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 bg-[#000814] text-white p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">{categoryData.title}</h1>
        <div className="grid grid-cols-2 gap-4">
          {categoryData.items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemSelect(item.name)}
              className="relative flex items-center justify-center h-48 rounded-xl bg-gradient-to-br from-blue-900 to-purple-900 border border-gray-700 hover:border-[#00F5FF] hover:from-blue-800 hover:to-purple-800 transition duration-300 transform hover:scale-105 overflow-hidden"
            >
              {/* 반투명 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              {/* 텍스트 오버레이 */}
              <div className="relative z-10 text-center px-2">
                {/* 소분류 제목 - 대분류와 같은 크기, 같은 색깔 */}
                <span 
                  className="block text-2xl font-bold text-[#00F5FF] drop-shadow-lg mb-2" 
                  style={{
                    textShadow: '0 0 10px #00F5FF, 0 0 20px #00F5FF, 0 0 30px #00F5FF'
                  }}
                >
                  {item.name}
                </span>
                
                {/* 보조 설명 - 1.5배 크기, 분홍색 야광 */}
                <p 
                  className="text-base font-medium text-[#FF69B4] drop-shadow-lg" 
                  style={{
                    textShadow: '0 0 8px #FF69B4, 0 0 16px #FF69B4, 0 0 24px #FF69B4'
                  }}
                >
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Next 버튼 완전 제거 */}

        {/* 사용자 플랜 표시 - 대분류와 같은 형식 */}
        {userPlan && (
          <div className="mt-6 p-3 bg-gray-900 rounded-md text-center text-xs text-gray-400">
            Your plan:{" "}
            <span className="font-semibold text-[#00F5FF]">
              {userPlan.toUpperCase()}
            </span>
          </div>
        )}

        <div className="text-center">
          <Link href="/categories" className="text-[#00F5FF] hover:underline text-sm">
            &larr; Back to Categories
          </Link>
        </div>
      </div>
    </div>
  );
}