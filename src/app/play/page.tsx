// src/app/play/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES = {
  MISSING_FIELDS: "Please complete all required fields.",
  AUDIO_LOAD_FAILED: "Failed to load audio. Please try again.",
  AD_BLOCKER: "Please disable ad-blocker to support free usage.",
  GENERATION_FAILED: "Failed to generate audio. Please try again.",
};

// Cosmic countdown phrases for preparation
const countdownPhrases = [
  "🌌 Scanning cosmic frequencies...",
  "🧠 Calculating your brainwave patterns...",
  "🩸 Harmonizing blood type and MBTI...",
  "🎼 Synthesizing custom BPM, beats, and rhythms...",
  "✨ Your personalized sound spectrum is ready!",
];

// 배경음 매핑 (실제 파일명과 연결)
const ambienceFileMap: { [key: string]: string } = {
  'Stream': 'stream_sound',
  'Prairie Wind': 'prairie_wind',
  'Forest Wind': 'forest_wind',
  'Gentle Waves': 'gentle_waves',
  'Rustling Leaves': 'rustling_leaves',
  'Soft Birdsong': 'soft_birdsong',
  'Crickets at Night': 'crickets_night',
  'Owls at Night': 'owls_night',
  'Page Turning': 'page_turning',
  'Humming': 'humming',
  'Cave Drips': 'cave_drips',
  'Seagulls': 'seagulls',
  'Campfire': 'campfire',
  'Cosmic Sounds': 'cosmic_sounds',
  'Deep Sea': 'deep_sea',
  'Temple Bells': 'temple_bells'
};

export default function PlayPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  // 사용자 정보
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  // 선택된 옵션
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedAmbiences, setSelectedAmbiences] = useState<string[]>([]);

  // API 응답
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 오디오 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [musicVolume, setMusicVolume] = useState(50);
  const [ambienceVolume, setAmbienceVolume] = useState(50);
  const [binauralVolume, setBinauralVolume] = useState(50);
  const [showAdCountdown, setShowAdCountdown] = useState(true);
  const [adCountdown, setAdCountdown] = useState(5);

  // 접을 수 있는 섹션 상태 추가
  const [expandedSections, setExpandedSections] = useState({
    userInfo: false,
    selection: false,
    aiGenerated: false,
    playerStatus: false
  });

  // 섹션 토글 함수 추가
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 오디오 참조 - 누락된 변수들 추가
  const mainAudioRef = useRef<HTMLAudioElement>(null);
  const ambienceAudioRefs = useRef<HTMLAudioElement[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 배경음 오디오 요소 초기화
  useEffect(() => {
    // 최대 2개의 배경음을 위한 오디오 요소 생성
    ambienceAudioRefs.current = Array(2).fill(null).map(() => {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      return audio;
    });

    return () => {
      // 컴포넌트 언마운트 시 정리
      ambienceAudioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);

  // 메인 오디오 이벤트 리스너 설정
  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      // 설정된 시간보다 짧고, 자연스럽게 끝난 경우에만 반복 재생
      if (totalDuration > 0 && audio.currentTime < totalDuration - 1) { // 1 second buffer
        audio.currentTime = 0;
        audio.play().catch(console.error);
        console.log('Looping audio - current time:', audio.currentTime, 'total duration:', totalDuration);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('Audio playback completed');
      }
    };
  
    const handleError = (e: any) => {
      console.error('Audio error:', e);
      setGenerationError(ERROR_MESSAGES.AUDIO_LOAD_FAILED);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // 볼륨 변경 시 실시간 적용
  useEffect(() => {
    if (mainAudioRef.current) {
      mainAudioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  useEffect(() => {
    ambienceAudioRefs.current.forEach(audio => {
      if (audio) {
        audio.volume = ambienceVolume / 100;
      }
    });
  }, [ambienceVolume]);

  /* ──────────────────────────────────────────────
   * 1. Load user information & selected values
   * ────────────────────────────────────────────── */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchData = async () => {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          const data = docSnap.exists() ? docSnap.data() : {};
          setUserInfo(data);
          setUserPlan(data.plan || "freeA");

          setSelectedCategory(localStorage.getItem("selectedCategory"));
          setSelectedCategoryTitle(localStorage.getItem("selectedCategoryTitle"));
          setSelectedSubCategory(localStorage.getItem("selectedSubCategory"));
          setSelectedTime(Number(localStorage.getItem("selectedTime")) || null);
          setSelectedAmbiences(JSON.parse(localStorage.getItem("selectedAmbiences") || "[]"));

          if (!selectedCategory || !selectedSubCategory) {
            setGenerationError(ERROR_MESSAGES.MISSING_FIELDS);
            setIsGenerating(false);
          }
        } catch {
          setGenerationError(ERROR_MESSAGES.GENERATION_FAILED);
          setIsGenerating(false);
        }
      };
      fetchData();
    }
  }, [user, loading, router, selectedCategory, selectedSubCategory]);

  /* ──────────────────────────────────────────────
   * 2. API 호출
   * ────────────────────────────────────────────── */
  useEffect(() => {
    const callApi = async () => {
      if (!userInfo || apiResponse) return;
      try {
        setIsGenerating(true);
        setGenerationError(null);

        const age = userInfo.age;
        const ageGroup = age < 21 ? "10-20" : age < 31 ? "21-30" : age < 41 ? "31-40" : age < 51 ? "41-50" : age < 61 ? "51-60" : age < 71 ? "61-70" : "70+";

        // 디버깅을 위한 localStorage 값 확인
        console.log('localStorage 값들:', {
          selectedCategory: localStorage.getItem('selectedCategory'),
          selectedSubCategory: localStorage.getItem('selectedSubCategory'),
          현재사용중: { selectedCategory, selectedSubCategory }
        });

        // 임시 테스트용 하드코딩 값
        const body = {
          category: "mindfulness",
          sub: "mindfulness_meditation",
          gender: userInfo.gender,
          ageGroup,
          blood: userInfo.bloodType,
          space: userInfo.space,
          device: userInfo.device,
        };

        console.log('테스트 API Request Body:', body);

        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error Response:', errorText);
          throw new Error(errorText);
        }
        
        const response = await res.json();
        console.log('API Success Response:', response);
        setApiResponse(response);
      } catch (err) {
        console.error('API Call Error:', err);
        setGenerationError(ERROR_MESSAGES.GENERATION_FAILED);
      } finally {
        setIsGenerating(false);
      }
    };
    callApi();
  }, [userInfo, selectedCategory, selectedSubCategory, selectedTime, selectedAmbiences, apiResponse]);
  /* ──────────────────────────────────────────────
   * 3. 오디오 & Web-AudioContext
   * ────────────────────────────────────────────── */
  useEffect(() => {
    if (!apiResponse) return;
    
    // 디버깅: API 응답 확인
    console.log('API Response:', apiResponse);
    console.log('Hz value:', apiResponse.hz || apiResponse.hertz);
    
  }, [apiResponse]);

  // createBinauralBeats 함수 수정
const createBinauralBeats = () => {
  if (!audioCtxRef.current || !apiResponse) {
    console.log('Cannot create binaural beats - missing context or response');
    return;
  }
  
  const ctx = audioCtxRef.current;
  // createBinauralBeats 함수에서 주파수 부분도 수정
  const baseFreq = parseFloat(apiResponse.hz || apiResponse.hertz) || 440; // 200에서 440Hz로 증가 (더 들리기 쉬운 주파수)
  const beatFreq = 8; // 10Hz에서 8Hz로 조정 (알파파 범위)
    
  console.log('Creating binaural beats with frequency:', baseFreq, 'Hz');
  
  // 기존 oscillator 정리
  if (leftOscRef.current) {
    try {
      leftOscRef.current.stop();
      leftOscRef.current.disconnect();
    } catch (e) {}
  }
  if (rightOscRef.current) {
    try {
      rightOscRef.current.stop();
      rightOscRef.current.disconnect();
    } catch (e) {}
  }
  
  // 스테레오 바이노럴 비트 생성
  const leftOsc = ctx.createOscillator();
  const rightOsc = ctx.createOscillator();
  const leftGain = ctx.createGain();
  const rightGain = ctx.createGain();
  const merger = ctx.createChannelMerger(2);
  
  // 주파수 설정 (왼쪽: 기본, 오른쪽: 기본 + 비트)
  leftOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  rightOsc.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);
  leftOsc.type = 'sine';
  rightOsc.type = 'sine';
  
  // 볼륨 설정 (더 높게 설정)
  const volume = (binauralVolume / 100) * 0.8; // 0.3에서 0.8로 증가
  leftGain.gain.setValueAtTime(volume, ctx.currentTime);
  rightGain.gain.setValueAtTime(volume, ctx.currentTime);
  
  console.log('Binaural volume set to:', volume);
  
  // 연결: 왼쪽 채널
  leftOsc.connect(leftGain);
  leftGain.connect(merger, 0, 0);
  
  // 연결: 오른쪽 채널
  rightOsc.connect(rightGain);
  rightGain.connect(merger, 0, 1);
  
  // 최종 출력
  merger.connect(ctx.destination);
  
  // 시작
  leftOsc.start();
  rightOsc.start();
  
  // 참조 저장
  leftOscRef.current = leftOsc;
  rightOscRef.current = rightOsc;
  leftGainRef.current = leftGain;
  rightGainRef.current = rightGain;
  mergerRef.current = merger;
  
  console.log('Binaural beats started successfully with volume:', volume);
};

  // 바이노럴 비트 볼륨 업데이트
useEffect(() => {
  if (leftGainRef.current && rightGainRef.current && audioCtxRef.current) {
    const volume = (binauralVolume / 100) * 2.0; // 최대 볼륨으로 설정
    leftGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    rightGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    console.log('Binaural volume updated to:', volume);
  }
}, [binauralVolume]);

  /* ──────────────────────────────────────────────
   * 4. 재생 / 일시정지 / 정지
   * ────────────────────────────────────────────── */
  // formatTime 함수 추가 (togglePlayPause 함수 앞에 추가)
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 사용자 설정 시간 초기화 (API 호출 useEffect 다음에 추가)
  useEffect(() => {
    if (selectedTime) {
      setTotalDuration(selectedTime * 60); // 분을 초로 변환
      console.log('Total duration set to:', selectedTime * 60, 'seconds');
    }
  }, [selectedTime]);
  
  // 시간 체크 및 반복 재생 로직 수정
useEffect(() => {
  if (!isPlaying || !totalDuration) return;
  
  const checkTime = () => {
    const actualAudioDuration = mainAudioRef.current?.duration || 450;
    const audioCurrentTime = mainAudioRef.current?.currentTime || 0;
    
    // 전체 설정 시간 기준으로 현재 시간 계산
    const totalElapsedTime = Math.floor(currentTime / actualAudioDuration) * actualAudioDuration + audioCurrentTime;
    
    // UI 시간 업데이트
    setCurrentTime(totalElapsedTime);
    
    // 설정된 총 시간에 도달하면 정지
    if (totalElapsedTime >= totalDuration) {
      stopAudio();
      return;
    }
  };
  
  const interval = setInterval(checkTime, 1000);
  return () => clearInterval(interval);
}, [isPlaying, currentTime, totalDuration]);
  
  // 메인 오디오 이벤트 리스너 수정
  useEffect(() => {
    const audio = mainAudioRef.current;
    if (!audio) return;
  
    const handleLoadedMetadata = () => {
      // 사용자 설정 시간을 duration으로 사용
      if (totalDuration > 0) {
        setDuration(totalDuration);
        console.log('Using user set duration:', totalDuration, 'actual audio:', audio.duration);
      } else {
        setDuration(audio.duration);
      }
    };
  
    const handleTimeUpdate = () => {
      // 실제 오디오 시간만 업데이트 (전체 시간은 checkTime에서 처리)
      // setCurrentTime은 여기서 하지 않음
    };
  
    const handleEnded = () => {
      const actualAudioDuration = audio.duration || 450;
      const totalElapsedTime = Math.floor(currentTime / actualAudioDuration) * actualAudioDuration + actualAudioDuration;
      
      // 설정된 총 시간보다 작으면 반복 재생
      if (totalDuration > 0 && totalElapsedTime < totalDuration) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        console.log('Looping audio - total elapsed:', totalElapsedTime, 'total duration:', totalDuration);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        console.log('Audio playback completed');
      }
    };
  
    const handleError = (e: any) => {
      console.error('Audio error:', e);
      setGenerationError(ERROR_MESSAGES.AUDIO_LOAD_FAILED);
      setIsPlaying(false);
    };
  
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
  
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [totalDuration, currentTime]);
  
  // togglePlayPause 함수에서 바이노럴 비트 시작 부분 수정
  const togglePlayPause = async () => {
    if (!mainAudioRef.current || !apiResponse?.public_id) {
      return;
    }
    
    // AudioContext 초기화 (사용자 상호작용 시)
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('AudioContext created:', audioCtxRef.current.state);
      } catch (e) {
        console.error('AudioContext creation failed:', e);
        return;
      }
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      try {
        await audioCtxRef.current.resume();
        console.log('AudioContext resumed:', audioCtxRef.current.state);
      } catch (e) {
        console.error('AudioContext resume failed:', e);
      }
    }
    
    if (isPlaying) {
      mainAudioRef.current.pause();
      ambienceAudioRefs.current.forEach(audio => audio?.pause());
      
      // 바이노럴 비트 정지
      if (leftOscRef.current) {
        try {
          leftOscRef.current.stop();
          leftOscRef.current.disconnect();
        } catch (e) {}
      }
      if (rightOscRef.current) {
        try {
          rightOscRef.current.stop();
          rightOscRef.current.disconnect();
        } catch (e) {}
      }
      
      setIsPlaying(false);
      return;
    }
    
    try {
      // 메인 음악 로드
      const publicId = apiResponse.public_id;
      const baseUrl = 'https://res.cloudinary.com/dsixore5e/video/upload/';
      let musicUrl = `${baseUrl}${publicId}.mp3`;
      
      mainAudioRef.current.src = musicUrl;
      mainAudioRef.current.load();
      mainAudioRef.current.volume = musicVolume / 100;
      
      // 배경음 로드
      selectedAmbiences.forEach((ambience, index) => {
        const fileName = ambienceFileMap[ambience];
        if (fileName && ambienceAudioRefs.current[index]) {
          const ambienceUrl = `${baseUrl}${fileName}.mp3`;
          ambienceAudioRefs.current[index].src = ambienceUrl;
          ambienceAudioRefs.current[index].load();
          ambienceAudioRefs.current[index].volume = ambienceVolume / 100;
          ambienceAudioRefs.current[index].loop = true;
        }
      });
      
      // 바이노럴 비트 시작
      // togglePlayPause() 내부에 추가
        console.log('baseUrl:', baseUrl);
        console.log('musicUrl:', musicUrl);
        console.log('audio.src:', mainAudioRef.current.src);
        console.log('audioCtx state:', audioCtxRef.current?.state);


      // 바이노럴 비트 시작 (지연 시간 증가)
      setTimeout(() => {
        console.log('Attempting to start binaural beats...');
        console.log('AudioContext available:', !!audioCtxRef.current);
        console.log('API Response available:', !!apiResponse);
        console.log('Hz value from API:', apiResponse?.hz || apiResponse?.hertz);
        createBinauralBeats();
      }, 1000); // 500ms에서 1000ms로 증가
      
      // 메인 오디오 재생
      await mainAudioRef.current.play();
      
      // 배경음 재생
      selectedAmbiences.forEach((_, index) => {
        ambienceAudioRefs.current[index]?.play().catch(err => {
          console.warn(`배경음 ${index} 재생 실패:`, err);
        });
      });
      
      setIsPlaying(true);
      console.log('All audio started successfully');
    } catch (e) {
      console.error('재생 실패:', e);
      setGenerationError(ERROR_MESSAGES.AUDIO_LOAD_FAILED);
    }
  };

  const stopAudio = () => {
    mainAudioRef.current?.pause();
    mainAudioRef.current && (mainAudioRef.current.currentTime = 0);
    ambienceAudioRefs.current.forEach((a) => {
      a?.pause();
      a && (a.currentTime = 0);
    });
    
    // Binaural beats 정지
    [leftOscRef.current, rightOscRef.current].forEach(osc => {
      if (osc) {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      }
    });
    
    setIsPlaying(false);
    setCurrentTime(0);
  };
// 프로그레스 바 클릭 핸들러 개선
const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!mainAudioRef.current) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const clickRatio = clickX / width;
  
  const targetTime = (totalDuration || duration) * clickRatio;
  const actualAudioDuration = mainAudioRef.current.duration || 450; // 7분 30초
  
  // 클릭한 위치가 실제 음악 길이를 넘어가는 경우
  if (targetTime > actualAudioDuration) {
    // 음악 길이 내에서 반복되는 위치로 계산
    const loopPosition = targetTime % actualAudioDuration;
    mainAudioRef.current.currentTime = loopPosition;
    setCurrentTime(targetTime); // UI는 전체 시간 기준으로 표시
  } else {
    // 음악 길이 내의 정상적인 위치 이동
    mainAudioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  }
  
  // 재생 중이었다면 계속 재생
  if (isPlaying && mainAudioRef.current.paused) {
    mainAudioRef.current.play().catch(console.error);
  }
  
  console.log('Progress clicked - target:', targetTime, 'actual audio pos:', mainAudioRef.current.currentTime);
};

  // Save 기능 추가
  const handleSave = () => {
    const saveData = {
      userInfo,
      selectedCategory,
      selectedSubCategory,
      selectedTime,
      selectedAmbiences,
      apiResponse,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`saved_session_${Date.now()}`, JSON.stringify(saveData));
    alert('세션이 저장되었습니다!');
  };

  // Share 기능 추가
  const handleShare = async () => {
    const shareData = {
      title: 'My Binaural Beat Session',
      text: `${selectedCategory} - ${selectedSubCategory} (${selectedTime}분)`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      // 폴백: 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  /* ──────────────────────────────────────────────
   * 5. 광고 카운트다운 + 우주-몽환 문구
   * ────────────────────────────────────────────── */
  useEffect(() => {
    if (!userPlan || !(userPlan === "freeA" || userPlan === "freeB") || !showAdCountdown) return;
    if (adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setShowAdCountdown(false);
  }, [adCountdown, showAdCountdown, userPlan]);
  /* ──────────────────────────────────────────────
   * 6. UI 렌더
   * ────────────────────────────────────────────── */
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#000814] text-white">Error: {error.message}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 bg-[#000814] text-white p-4">
      {/* Hidden audio elements */}
      <audio ref={mainAudioRef} crossOrigin="anonymous" />
      
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Your Binaural Experience</h1>

        {/* PLAYER CONTROLS - MOVED TO TOP */}
        {apiResponse && !isGenerating && !generationError && (
          <div className="bg-gray-900 p-4 rounded-md space-y-6">
            {/* Cosmic countdown */}
            {userPlan && (userPlan === "freeA" || userPlan === "freeB") && showAdCountdown && (
              <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-xl p-6 text-center space-y-3 animate-pulse">
                <h2 className="text-lg font-bold text-cyan-300">{countdownPhrases[5 - adCountdown]}</h2>
                <div className="text-3xl font-mono text-white">{adCountdown}</div>
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {!showAdCountdown && (
              <>
                {/* Progress bar */}
                <div 
                  className="w-full bg-gray-700 rounded-full h-2.5 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={handleProgressClick}
                >
                  <div
                    className="bg-[#00F5FF] h-2.5 rounded-full pointer-events-none"
                    style={{ width: `${totalDuration ? (currentTime / totalDuration) * 100 : duration ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration || duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <button onClick={togglePlayPause} className="bg-[#00F5FF] text-black px-6 py-2 rounded-md font-medium hover:scale-105 transition-transform">
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button onClick={stopAudio} className="bg-gray-700 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-600 transition-colors">
                    Stop
                  </button>
                </div>

                {/* Volume controls */}
                <div className="space-y-4">
                  {["Music", "Ambience", "Binaural"].map((label, idx) => (
                    <div key={label}>
                      <label className="block text-sm mb-1">{label} Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={idx === 0 ? musicVolume : idx === 1 ? ambienceVolume : binauralVolume}
                        onChange={(e) =>
                          idx === 0
                            ? setMusicVolume(parseInt(e.target.value))
                            : idx === 1
                            ? setAmbienceVolume(parseInt(e.target.value))
                            : setBinauralVolume(parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button onClick={() => router.push("/categories")} className="flex-1 bg-gray-700 text-white py-2 rounded-md font-medium hover:bg-gray-600 transition-colors">Regenerate</button>
                  <button onClick={handleSave} className="flex-1 bg-gray-700 text-white py-2 rounded-md font-medium hover:bg-gray-600 transition-colors">Save</button>
                  <button onClick={handleShare} className="flex-1 bg-gray-700 text-white py-2 rounded-md font-medium hover:bg-gray-600 transition-colors">Share</button>
                </div>
              </>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F5FF] mb-4"></div>
            <p className="text-gray-400">AI is composing your unique soundscape...</p>
          </div>
        )}

        {generationError && (
          <div className="bg-red-900 text-red-100 p-4 rounded-md">
            <p>{generationError}</p>
            <button onClick={() => router.push("/categories")} className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
              Go Back & Retry
            </button>
          </div>
        )}

        {/* COLLAPSIBLE INFORMATION SECTIONS - MOVED TO BOTTOM */}
        
        {/* 1. User Information - Purple Theme */}
        {userInfo && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-400 rounded-lg shadow-lg shadow-purple-500/30">
            <button
              onClick={() => toggleSection('userInfo')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-purple-800/30 transition-colors rounded-lg"
            >
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                🧠 User Information
              </h3>
              <span className="text-purple-300 text-xl">{expandedSections.userInfo ? '−' : '+'}</span>
            </button>
            {expandedSections.userInfo && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  {userInfo.gender && <li className="text-pink-300">Gender: {userInfo.gender}</li>}
                  {userInfo.age && <li className="text-purple-300">Age: {userInfo.age}</li>}
                  {userInfo.zodiac && <li className="text-indigo-300">Zodiac: {userInfo.zodiac}</li>}
                  {userInfo.bloodType && <li className="text-violet-300">Blood Type: {userInfo.bloodType}</li>}
                  {userInfo.environment && <li className="text-fuchsia-300">Environment: {userInfo.environment}</li>}
                  {userInfo.device && <li className="text-purple-400">Device: {userInfo.device}</li>}
                  {userInfo.mbti && <li className="text-pink-400">MBTI: {userInfo.mbti}</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 2. Your Selection - Blue Theme */}
        {selectedCategory && (
          <div className="bg-gradient-to-r from-blue-900 to-cyan-900 border border-cyan-400 rounded-lg shadow-lg shadow-cyan-500/30">
            <button
              onClick={() => toggleSection('selection')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-blue-800/30 transition-colors rounded-lg"
            >
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                🎯 Your Selection
              </h3>
              <span className="text-cyan-300 text-xl">{expandedSections.selection ? '−' : '+'}</span>
            </button>
            {expandedSections.selection && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="text-cyan-300">Category: {selectedCategoryTitle || selectedCategory}</li>
                  <li className="text-blue-300">Detail: {selectedSubCategory}</li>
                  {selectedTime && <li className="text-sky-300">Time: {selectedTime} minutes</li>}
                  <li className="text-teal-300">Ambiences: {selectedAmbiences.join(", ") || "None"}</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 3. AI Generated - Green Theme */}
        {apiResponse && (
          <div className="bg-gradient-to-r from-green-900 to-emerald-900 border border-emerald-400 rounded-lg shadow-lg shadow-emerald-500/30">
            <button
              onClick={() => toggleSection('aiGenerated')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-green-800/30 transition-colors rounded-lg"
            >
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                🤖 AI Generated Brainwave
              </h3>
              <span className="text-emerald-300 text-xl">{expandedSections.aiGenerated ? '−' : '+'}</span>
            </button>
            {expandedSections.aiGenerated && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  {(apiResponse.hz || apiResponse.hertz) && <li className="text-emerald-300">Base Frequency: {apiResponse.hz || apiResponse.hertz} Hz</li>}
                  {apiResponse.bpm && <li className="text-green-300">BPM: {apiResponse.bpm}</li>}
                  {apiResponse.rhythm && <li className="text-lime-300">Rhythm: {apiResponse.rhythm}</li>}
                  {apiResponse.beat && <li className="text-teal-300">Beat Pattern: {apiResponse.beat}</li>}
                  {apiResponse.tempo && <li className="text-emerald-400">Tempo: {apiResponse.tempo}</li>}
                  {apiResponse.key && <li className="text-green-400">Musical Key: {apiResponse.key}</li>}
                  {apiResponse.mood && <li className="text-lime-400">Mood: {apiResponse.mood}</li>}
                  {apiResponse.genre && <li className="text-teal-400">Genre: {apiResponse.genre}</li>}
                  {(apiResponse.hz || apiResponse.hertz) && (
                    <li className="text-yellow-300 font-semibold">Binaural Beat: {(parseFloat(apiResponse.hz || apiResponse.hertz) + 4).toFixed(1)} Hz - {apiResponse.hz || apiResponse.hertz} Hz = 4 Hz</li>
                  )}
                  {apiResponse.public_id && <li className="text-gray-400">Audio ID: {apiResponse.public_id}</li>}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 4. Player Status - Orange Theme */}
        {apiResponse && isPlaying && (
          <div className="bg-gradient-to-r from-orange-900 to-yellow-900 border border-yellow-400 rounded-lg shadow-lg shadow-yellow-500/30">
            <button
              onClick={() => toggleSection('playerStatus')}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-orange-800/30 transition-colors rounded-lg"
            >
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                🎵 Player Status
              </h3>
              <span className="text-yellow-300 text-xl">{expandedSections.playerStatus ? '−' : '+'}</span>
            </button>
            {expandedSections.playerStatus && (
              <div className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="text-orange-300">Music Volume: {musicVolume}%</li>
                  <li className="text-yellow-300">Ambience Volume: {ambienceVolume}%</li>
                  <li className="text-amber-300">Binaural Volume: {binauralVolume}%</li>
                  <li className="text-orange-400">Playback Time: {formatTime(currentTime)} / {formatTime(totalDuration || duration)}</li>
                  <li className="text-yellow-400">Status: {isPlaying ? 'Playing' : 'Stopped'}</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 사용자 플랜 표시 추가 - 대분류와 같은 형식 */}
        {userPlan && (
          <div className="mt-6 p-3 bg-gray-900 rounded-md text-center text-xs text-gray-400">
            Your plan:{" "}
            <span className="font-semibold text-[#00F5FF]">
              {userPlan.toUpperCase()}
            </span>
          </div>
        )}

          <div className="text-center">
           <Link href="/time" className="text-[#00F5FF] hover:underline text-sm">
            &larr; Back to Time Selection
          </Link>
        </div>
      </div>
    </div>
  );
}