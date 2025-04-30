// src/app/not-found.tsx
'use client';

import Link from 'next/link';

export default function NotFound() {
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
        {/* Three interlinking squares */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="flex items-center">
            {/* First square */}
            <div className="w-16 h-16 border-2 border-white/90 rounded"></div>
            {/* Connecting line */}
            <div className="w-4 h-0.5 bg-white/60"></div>
            {/* Second square */}
            <div className="w-16 h-16 border-2 border-white/70 rounded"></div>
            {/* Connecting line */}
            <div className="w-4 h-0.5 bg-white/60"></div>
            {/* Third square */}
            <div className="w-16 h-16 border-2 border-white/50 rounded"></div>
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h1 className="text-white text-2xl font-medium tracking-wide">
            Page Not Found
          </h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action button */}
        <div>
          <Link 
            href="/dashboard"
            className="px-6 py-2 bg-white text-[#346066] rounded-md hover:bg-white/90 transition-colors inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}