'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    // Log the error but also include auth state for debugging
    console.error('Application error:', {
      error,
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
  }, [error, isAuthenticated]);

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
            Something went wrong
          </h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            {error.message || 'We encountered an unexpected error. Our team has been notified and is working to resolve the issue.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              // Clear any potential auth-related errors before retrying
              if (error.message?.toLowerCase().includes('auth')) {
                window.location.href = '/'; // Force a full reload for auth errors
              } else {
                reset(); // Use the normal reset for other errors
              }
            }}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/dashboard"
            className="px-6 py-2 bg-white text-[#346066] rounded-md hover:bg-white/90 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>

        {/* Additional context for auth-related errors */}
        {error.message?.toLowerCase().includes('auth') && (
          <p className="text-white/60 text-xs mt-4">
            You may need to sign in again to continue.
          </p>
        )}
      </div>
    </div>
  );
}