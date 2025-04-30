'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DiversiCloudLogo } from '@/components/DiversiCloudLogo';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Main navigation bar matching the design in screenshot 1
 */
export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth0();
  
  // Define navigation items - matches screenshot 1
  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'AI Assistant', href: '/ai' }
  ];

  return (
    <header className="border-b border-white/10 bg-[#346066] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo with text - using pixel-specific size */}
          <Link href="/" className="flex items-center">
            <DiversiCloudLogo size={40} /> {/* Exact pixel size - adjust as needed */}
            <span className="text-white text-xl font-medium ml-3">DiversiCloud</span>
          </Link>
          
          {/* Navigation items */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map(item => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${
                  pathname === item.href 
                    ? 'text-white font-medium' 
                    : 'text-white/80 hover:text-white'
                } transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User info and sign out */}
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <div className="text-white/80">
              Welcome, {user?.name}
            </div>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="px-4 py-1 bg-white rounded text-[#346066] hover:bg-white/90 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}