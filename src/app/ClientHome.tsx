'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import LogoPulse from '@/components/LogoPulse';
import { cn } from '@/lib/utils';

export default function ClientHome() {
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } =
    useAuth0();

  /* dummy local state – fields are disabled */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  /* ------------- loading ------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dc-teal">
        <span className="text-white">Loading…</span>
      </div>
    );
  }

  /* ------------- authenticated ------------- */
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dc-teal gap-6 p-8">
        <LogoPulse />
        <h1 className="text-white text-3xl font-bold">
          Welcome&nbsp;{user?.name}
        </h1>

        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  /* ------------- unauthenticated ------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-dc-teal relative overflow-hidden">
      {/* faint grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* main column */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* logo */}
        <div className="w-64 h-64 mb-1">
          <LogoPulse />
        </div>

        {/* brand */}
        <h1 className="-mt-12 mb-12 text-white text-4xl font-bold tracking-wider">
          DiversiCloud
        </h1>

        {/* glassy card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-6">
          {/* heading */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Welcome</h2>
            <p className="text-lg text-white/80">
              Sign in to <span className="font-semibold">MultiCloud&nbsp;Orchestrator&nbsp;Manager</span>
            </p>
          </div>

          {/* dummy form */}
          <form className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-white/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-white/80">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 cursor-not-allowed"
              />
            </div>

            {/* disabled Sign-In button */}
            <button
              type="submit"
              disabled
              className="w-full py-2 rounded-lg bg-white text-dc-teal opacity-50 cursor-not-allowed"
            >
              Sign In
            </button>
          </form>

          {/* divider */}
          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/20 text-white/60">Or continue with</span>
              </div>
            </div>

          {/* SSO button */}
          <button
  onClick={() => loginWithRedirect()}
  className={cn(
    "w-full py-2 rounded-lg bg-white text-[#346066] font-medium flex items-center justify-center gap-2",
    "hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/30",
    "animate-pulse-subtle"
  )}
  style={
    {
      /* make it pulse faster and more subtly */
      "--pulse-subtle-duration": ".2s",
      "--pulse-subtle-intensity": "5",
    } as React.CSSProperties
  }
>
  Log in with SSO
</button>
        </div>
      </div>
    </div>
  );
}

