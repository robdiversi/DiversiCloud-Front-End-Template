'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
  initialError?: string;
}

async function loginWithIDP(provider: string): Promise<void> {
  const authEndpoint = `http://localhost:8000/auth/${provider}/login`;
  const response = await fetch(authEndpoint, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`${provider} authentication failed`);
  }
}

export function LoginForm({ onSuccess, initialError }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      console.log('Starting login process for:', email);
      const base64Credentials = btoa(`${email}:${password}`);
      
      console.log('Making token request...');
      const tokenResponse = await fetch('http://localhost:8000/auth/basic/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('Token response status:', tokenResponse.status);
  
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token request failed:', errorText);
        throw new Error(errorText || 'Authentication failed');
      }
  
      const responseText = await tokenResponse.text();
      console.log('Token response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing token response:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!data.access_token) {
        throw new Error('No access token received');
      }

      console.log('Calling login function from AuthContext...');
      await login(email, password);
      console.log('Login successful, auth state:', { isAuthenticated });

      console.log('Redirecting...');
      if (onSuccess) {
        onSuccess();
      }
      router.push(searchParams.get('returnTo') || '/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#346066] relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Main container with flex column */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6 -mt-28">
        {/* Logo Container */}
        <div className="w-70 h-70 relative mb-1">
          {/* Echo layers */}
          <div className="absolute inset-0 opacity-40 animate-echo-1">
            <Image
              src="/images/diversicloud_sign_in.png"
              alt=""
              width={250}
              height={250}
              className="scale-85"
            />
          </div>
          <div className="absolute inset-0 opacity-20 animate-echo-2">
            <Image
              src="/images/diversicloud_sign_in.png"
              alt=""
              width={250}
              height={250}
              className="scale-95"
            />
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-glow"></div>
          
          {/* Main logo */}
          <Image
            src="/images/diversicloud_sign_in.png"
            alt="DiversiCloud Workspace Orchestration Manager Logo"
            width={250}
            height={250}
            priority
            className="animate-pulse-subtle relative z-10"
          />
        </div>

        {/* Company Name */}
        <div className="text-center -mt-12 mb-12">
          <h1 className="text-white text-4xl font-bold tracking-wider">
            DiversiCloud
          </h1>
          <div className="h-0.5 w-32 mx-auto bg-white/20 rounded-full mt-2"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 w-full space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-white text-3xl font-bold tracking-wide">
              Welcome
            </h2>
            <p className="text-white/80 text-lg">
              Sign in to Workspace Orchestration Manager
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-100 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-white text-[#346066] rounded-lg font-medium hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#346066] text-white/60">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              disabled={true}
              className="w-full py-2 px-4 bg-white/10 border border-white/20 rounded-lg text-white/60 font-medium hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              onClick={() => handleIDPLogin('google')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google (Coming Soon)
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              disabled={true}
              className="text-white/60 text-sm hover:text-white/80 transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 w-full">
            <div className="max-w-md mx-auto w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}