// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const weightOptions = [
  "35.1-40 kg", "40.1-45 kg", "45.1-50 kg", "50.1-55 kg", "55.1-60 kg",
  "60.1-65 kg", "65.1-70 kg", "70.1-75 kg", "75.1-80 kg", "80.1-85 kg",
  "85.1-90 kg", "90.1-95 kg", "95.1-100 kg", "100.1-105 kg", "105.1-110 kg",
  "110.1-115 kg", "115.1-120 kg", "120 kg+"
];

const bloodTypeOptions = ["A", "B", "O", "AB"];
const mbtiOptions = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ"
];

const listeningDeviceOptions = [
  { id: 'phone', label: '📱 Phone Speaker' },
  { id: 'earphone', label: '🎧 Earphone' },
  { id: 'external', label: '🔊 External Speaker' },
];

const spaceOptions = [
  { id: 'indoor', label: '🏠 Indoor' },
  { id: 'outdoor', label: '🌳 Outdoor' },
];

const getZodiacSign = (month: number, day: number) => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return '';
};

export default function OnboardingPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const [gender, setGender] = useState<string>('');
  const [birthdate, setBirthdate] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bloodType, setBloodType] = useState<string>('');
  const [listeningDevice, setListeningDevice] = useState<string>('');
  const [space, setSpace] = useState<string>('');
  const [mbti, setMbti] = useState<string>('');

  const [age, setAge] = useState<number | null>(null);
  const [zodiac, setZodiac] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setGender(data.gender || '');
            setBirthdate(data.birthdate ? new Date(data.birthdate.seconds * 1000).toISOString().split('T')[0] : '');
            setWeight(data.weightRange || '');
            setBloodType(data.bloodType || '');
            setListeningDevice(data.listeningDevice || '');
            setSpace(data.space || '');
            setMbti(data.mbti || '');
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };
      fetchUserData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (birthdate) {
      const birthDateObj = new Date(birthdate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);

      const month = birthDateObj.getMonth() + 1;
      const day = birthDateObj.getDate();
      const calculatedZodiac = getZodiacSign(month, day);
      setZodiac(calculatedZodiac);
    } else {
      setAge(null);
      setZodiac('');
    }
  }, [birthdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!gender || !birthdate || !weight || !bloodType || !listeningDevice || !space) {
        setFormError("Please complete all required fields.");
        return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        gender,
        birthdate: new Date(birthdate),
        age: age ?? null,
        weightRange: weight,
        bloodType,
        zodiac,
        listeningDevice,
        space,
        mbti: mbti || null,
        plan: 'freeA',
        lastUpdated: new Date()
      }, { merge: true });

      console.log("User onboarding data saved!");
      router.push('/categories');
    } catch (err) {
      console.error("Error saving user data:", err);
      setFormError("Failed to save information. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-bold text-center">Tell us about you</h1>

        {formError && (
          <div className="bg-red-900 text-red-100 p-3 rounded-md text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gender *</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={gender === 'Male'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                  required
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={gender === 'Female'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2"
                />
                Female
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium mb-1">
              Birthdate *
            </label>
            <input
              type="date"
              id="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              required
            />
            {(age !== null || zodiac) && (
              <p className="text-sm text-gray-400 mt-1">
                {age !== null && `Your age: ${age}`}
                {age !== null && zodiac && ' | '}
                {zodiac && `Zodiac: ${zodiac}`}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium mb-1">
              Weight *
            </label>
            <select
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              required
            >
              <option value="">Select your weight range</option>
              {weightOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium mb-1 flex items-center">
              Blood type *
              <Link href="/info/blood" className="ml-2 text-[#00F5FF] hover:underline text-xs">(i)</Link>
            </label>
            <select
              id="bloodType"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              required
            >
              <option value="">Select your blood type</option>
              {bloodTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Space *</label>
            <div className="grid grid-cols-2 gap-2">
              {spaceOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border ${
                    space === option.id
                      ? 'border-[#00F5FF] bg-[#001a29]'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="space"
                    value={option.id}
                    checked={space === option.id}
                    onChange={(e) => setSpace(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <span className="text-lg">{option.label.split(' ')[0]}</span>
                  <span className="text-xs mt-1 text-center">{option.label.split(' ')[1]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Listening device *</label>
            <div className="grid grid-cols-3 gap-2">
              {listeningDeviceOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border ${
                    listeningDevice === option.id
                      ? 'border-[#00F5FF] bg-[#001a29]'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="listeningDevice"
                    value={option.id}
                    checked={listeningDevice === option.id}
                    onChange={(e) => setListeningDevice(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <span className="text-lg">{option.label.split(' ')[0]}</span>
                  <span className="text-xs mt-1 text-center">{option.label.split(' ')[1]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="mbti" className="block text-sm font-medium mb-1 flex items-center">
              MBTI (optional)
              <Link href="/info/mbti" className="ml-2 text-[#00F5FF] hover:underline text-xs">(?)</Link>
            </label>
            <div className="flex space-x-2">
              <select
                id="mbti"
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="flex-grow p-2 rounded bg-gray-800 border border-gray-700"
              >
                <option value="">Select your MBTI</option>
                {mbtiOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setMbti('')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
              >
                Skip
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-md font-medium transition duration-300 ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#00F5FF] text-black hover:scale-[1.02] hover:shadow-[0_0_8px_#00F5FF]'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}