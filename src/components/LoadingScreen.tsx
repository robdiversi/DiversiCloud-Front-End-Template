'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  redirectTo?: string;
  redirectDelay?: number;
}

export function LoadingScreen({ 
  message = "Loading Workspace Orchestration Manager...",
  subMessage = "Setting up your environment",
  redirectTo = "/",
  redirectDelay = 2500
}: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Dot animation
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // After specified delay, navigate on
    const navTimeout = setTimeout(() => {
      router.push(redirectTo);
    }, redirectDelay);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(navTimeout);
    };
  }, [router, redirectTo, redirectDelay]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#346066] relative overflow-hidden">
      {/* Grid backdrop */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8 text-center px-4">
        {/* Animated boxes - bigger, no fill, horizontal animation */}
        <div className="w-80 h-60 mx-auto relative">
          <svg 
            viewBox="0 0 200 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* First box */}
            <rect 
              x="5" 
              y="30" 
              width="50" 
              height="50" 
              stroke="white" 
              strokeWidth="2"
              fill="none"
              style={{
                animation: 'boxMoveHorizontal1 4s ease-in-out infinite',
                opacity: 0.9
              }}
            />
            {/* Middle box */}
            <rect 
              x="75" 
              y="30" 
              width="50" 
              height="50" 
              stroke="white"
              strokeWidth="2"
              fill="none"
              style={{
                opacity: 0.7
              }}
            />
            {/* Last box */}
            <rect 
              x="145" 
              y="30" 
              width="50" 
              height="50" 
              stroke="white"
              strokeWidth="2"
              fill="none"
              style={{
                animation: 'boxMoveHorizontal2 4s ease-in-out infinite',
                opacity: 0.5
              }}
            />
            
            {/* Connecting lines */}
            <line 
              x1="55" 
              y1="55" 
              x2="75" 
              y2="55" 
              stroke="white" 
              strokeWidth="2"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
                opacity: 0.6
              }}
            />
            <line 
              x1="125" 
              y1="55" 
              x2="145" 
              y2="55" 
              stroke="white" 
              strokeWidth="2"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
                opacity: 0.6
              }}
            />
          </svg>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <h1 className="text-white text-2xl font-medium tracking-wide">
            {message}
          </h1>
          <p className="text-white/80 text-sm">
            {subMessage}
            {dots}
          </p>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full"
            style={{ animation: "loading 2s ease-in-out infinite", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}