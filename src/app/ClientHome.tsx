'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import LogoPulse from '@/components/LogoPulse';
import Link from 'next/link';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function ClientHome() {
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } = useAuth0();

  /* dummy local state – fields are disabled */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  /* Simulate initial loading for smoother transitions */
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 800); // Short delay for a smoother experience
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  /* ------------- loading ------------- */
  if (isLoading || initialLoading) {
    return <LoadingScreen redirectTo="/" />;
  }

  /* ------------- authenticated ------------- */
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#346066]">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm bg-[#346066]/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                {/* Fixed size container for the logo */}
                <div style={{ width: '120px', height: '120px' }}>
                  <LogoPulse />
                </div>
                <span className="text-white text-xl font-medium ml-3">DiversiCloud</span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
              <Link href="/multicloud-tool" className="text-white/90 hover:text-white transition-colors">
                  MultiCloud Pricing Tool
                </Link>
                <Link href="/ai" className="text-white/90 hover:text-white transition-colors">
                  AI Assistant
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <div className="text-white/80 mr-2">
                    Welcome, {user?.name}
                  </div>
                  <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="px-3 py-1.5 bg-white/10 rounded-md text-white hover:bg-white/20 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="lg:col-span-2 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">MultiCloud Management Overview</h1>
                <p className="text-white/70 mt-1">Overview of your usage and service usage across AWS, Azure, and GCP</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-medium">Cloud Services</h3>
                  <p className="text-3xl font-bold text-white mt-2">12</p>
                  <p className="text-white/60 text-sm">Active services</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-medium">Regions</h3>
                  <p className="text-3xl font-bold text-white mt-2">3</p>
                  <p className="text-white/60 text-sm">Deployed regions</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-medium">Cost Savings</h3>
                  <p className="text-3xl font-bold text-white mt-2">18%</p>
                  <p className="text-white/60 text-sm">This month</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-medium">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/multicloud-tool" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg p-3 text-center transition-colors">
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white text-sm">Compare Prices</span>
                    </div>
                  </Link>
                  
                  <Link href="/ai" className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg p-3 text-center transition-colors">
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-white text-sm">AI Assistant</span>
                    </div>
                  </Link>
                  
                  <button className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg p-3 text-center transition-colors">
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-sm">Settings</span>
                    </div>
                  </button>
                  
                  <button className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg p-3 text-center transition-colors">
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white text-sm">Help</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* News & Updates */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <h2 className="text-lg font-medium text-white mb-4">News & Updates</h2>
                <div className="space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <h3 className="text-white font-medium">New AWS Region Available</h3>
                    <p className="text-white/70 text-sm mt-1">Now supporting deployments to AWS ap-south-2 region.</p>
                    <p className="text-white/50 text-xs mt-2">3 days ago</p>
                  </div>
                  <div className="pb-3 border-b border-white/10">
                    <h3 className="text-white font-medium">Price Comparison Updated</h3>
                    <p className="text-white/70 text-sm mt-1">Latest pricing for Azure SQL Database now available.</p>
                    <p className="text-white/50 text-xs mt-2">1 week ago</p>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">AI Assistant Improvements</h3>
                    <p className="text-white/70 text-sm mt-1">Enhanced cost optimization recommendations.</p>
                    <p className="text-white/50 text-xs mt-2">2 weeks ago</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <h2 className="text-lg font-medium text-white mb-4">Cloud Distribution</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">AWS</span>
                      <span className="text-white">42%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">Azure</span>
                      <span className="text-white">35%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white">GCP</span>
                      <span className="text-white">23%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
              <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center p-2 rounded hover:bg-white/5">
                  <div className="bg-white/10 p-2 rounded mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Price comparison completed</p>
                    <p className="text-white/60 text-xs">Today, 10:42 AM</p>
                  </div>
                </div>
                <div className="flex items-center p-2 rounded hover:bg-white/5">
                  <div className="bg-white/10 p-2 rounded mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Cost optimization alert</p>
                    <p className="text-white/60 text-xs">Yesterday, 3:15 PM</p>
                  </div>
                </div>
                <div className="flex items-center p-2 rounded hover:bg-white/5">
                  <div className="bg-white/10 p-2 rounded mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Monthly report generated</p>
                    <p className="text-white/60 text-xs">Apr 25, 2025</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 text-white/70 text-sm hover:text-white transition-colors">
                View all activity →
              </button>
            </div>
            
            {/* Popular Services */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
              <h2 className="text-lg font-medium text-white mb-4">Popular Services</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded hover:bg-white/5">
                  <div className="flex items-center">
                    <div className="bg-white/10 p-2 rounded mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Virtual Machines</p>
                      <p className="text-white/60 text-xs">EC2, Azure VM, Compute Engine</p>
                    </div>
                  </div>
                  <Link href="/multicloud-tool">
                    <span className="text-white/60 hover:text-white transition-colors text-sm">Compare</span>
                  </Link>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-white/5">
                  <div className="flex items-center">
                    <div className="bg-white/10 p-2 rounded mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Object Storage</p>
                      <p className="text-white/60 text-xs">S3, Blob Storage, Cloud Storage</p>
                    </div>
                  </div>
                  <Link href="/multicloud-tool">
                    <span className="text-white/60 hover:text-white transition-colors text-sm">Compare</span>
                  </Link>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-white/5">
                  <div className="flex items-center">
                    <div className="bg-white/10 p-2 rounded mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Databases</p>
                      <p className="text-white/60 text-xs">RDS, SQL Database, Cloud SQL</p>
                    </div>
                  </div>
                  <Link href="/multicloud-tool">
                    <span className="text-white/60 hover:text-white transition-colors text-sm">Compare</span>
                  </Link>
                </div>
              </div>
                  <Link href="/multicloud-tool">
                  <button className="mt-4 text-white/70 text-sm hover:text-white transition-colors">
                    Compare all services →
                  </button>
                </Link>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                {/* Fixed size container for footer logo */}
                <div style={{ width: '65px', height: '65px' }}>
                  <LogoPulse />
                </div>
                <span className="ml-2 text-white/60 text-sm">
                  © {new Date().getFullYear()} DiversiCloud. All rights reserved.
                </span>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  /* ------------- unauthenticated ------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#346066] relative overflow-hidden">
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
        <div style={{ width: '64px', height: '64px' }} className="mb-1">
          <LogoPulse />
        </div>

        {/* brand */}
        <h1 className="mb-12 text-white text-4xl font-bold tracking-wider">
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
              className="w-full py-2 rounded-lg bg-white text-[#346066] opacity-50 cursor-not-allowed"
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
              <span className="px-2 bg-[#346066] text-white/60">Or continue with</span>
            </div>
          </div>

          {/* SSO button */}
          <button
            onClick={() => loginWithRedirect()}
            className="w-full py-2 rounded-lg bg-white text-[#346066] font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
          >
            Log in with SSO
          </button>
        </div>
      </div>
    </div>
  );
}