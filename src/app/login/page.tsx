// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const auth = getAuth(app);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in with Google:", user.email);
      router.push('/onboarding');
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      setError(error.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in with email:", email);
        router.push('/onboarding');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created with email:", email);
        router.push('/onboarding');
      }
    } catch (error: any) {
      console.error("Error during email auth:", error);
      let errorMessage = "Failed to authenticate.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000814] text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Beatamin</h1>
          <p className="text-gray-400">Personalized Binaural Beats</p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-md bg-white text-black font-medium hover:scale-105 hover:shadow-[0_0_8px_white] transition duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-center mb-4">
            {isLogin ? 'Sign in with Email' : 'Sign up with Email'}
          </h2>
          {error && (
            <div className="bg-red-900 text-red-100 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-[#00F5FF] focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-[#00F5FF] focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium transition duration-300 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#00F5FF] text-black hover:scale-105 hover:shadow-[0_0_8px_#00F5FF]'
              }`}
            >
              {isLoading ? (isLogin ? 'Signing in...' : 'Signing up...') : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          <div className="text-center mt-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#00F5FF] hover:underline text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-[#00F5FF] hover:underline">
            Terms
          </Link>{' '}
          &{' '}
          <Link href="/privacy" className="text-[#00F5FF] hover:underline">
            Privacy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}