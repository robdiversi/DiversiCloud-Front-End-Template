'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export function LoadingScreen({ 
  message = "Loading Workspace Orchestration Manager...",
  subMessage = "Setting up your environment"
}: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    try {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error in loading animation:', error);
      return () => {};
    }
  }, []);

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

      {/* Main content */}
      <div className="relative z-10 space-y-8 text-center px-4">
        {/* Animated boxes logo */}
        <div className="w-48 h-48 mx-auto relative">
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* First box */}
            <rect 
              x="15" 
              y="15" 
              width="30" 
              height="30" 
              fill="white" 
              style={{
                animation: 'boxOverlap1 3s ease-in-out infinite',
                opacity: 0.9
              }}
            />
            {/* Middle box */}
            <rect 
              x="35" 
              y="35" 
              width="30" 
              height="30" 
              fill="white" 
              style={{
                animation: 'boxOverlap2 3s ease-in-out infinite',
                opacity: 0.7
              }}
            />
            {/* Last box */}
            <rect 
              x="55" 
              y="55" 
              width="30" 
              height="30" 
              fill="white" 
              style={{
                animation: 'boxOverlap3 3s ease-in-out infinite',
                opacity: 0.5
              }}
            />
            
            {/* Connecting lines */}
            <line 
              x1="45" 
              y1="30" 
              x2="50" 
              y2="35" 
              stroke="white" 
              strokeWidth="2.5"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
                opacity: 0.6
              }}
            />
            <line 
              x1="65" 
              y1="50" 
              x2="70" 
              y2="55" 
              stroke="white" 
              strokeWidth="2.5"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
                opacity: 0.6
              }}
            />
          </svg>
        </div>

        {/* Loading text */}
        <div className="space-y-3">
          <h1 className="text-white text-2xl font-medium tracking-wide">
            {message}
          </h1>
          <p className="text-white/80 text-sm">
            {subMessage}{dots}
          </p>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full"
            style={{
              animation: 'loading 2s ease-in-out infinite',
              width: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
}