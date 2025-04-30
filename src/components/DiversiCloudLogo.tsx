// src/components/DiversiCloudLogo.tsx
"use client";

import LogoPulse from './LogoPulse';
import Link from 'next/link';

interface DiversiCloudLogoProps {
  className?: string;
  variant?: 'default' | 'small' | 'large' | 'header';
  showText?: boolean;
  linkTo?: string;
  size?: number; // New prop for exact size in pixels
}

export function DiversiCloudLogo({ 
  className = "", 
  variant = 'default', 
  showText = false,
  linkTo = '/',
  size =  // If provided, this overrides the variant sizes
}: DiversiCloudLogoProps) {
  // Default sizes in pixels for different variants
  const defaultSizes = {
    small: 32,  // 8rem = 32px
    default: 44, // 11rem = 44px
    large: 64,  // 16rem = 64px
    header: 44  // 11rem = 44px
  };

  // Determine the actual size to use
  const pixelSize = size || defaultSizes[variant];
  
  const sizeStyle = {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`
  };

  const content = (
    <div className={`flex items-center ${className}`}>
      <div style={sizeStyle}>
        <LogoPulse />
      </div>
      
      {showText && (
        <div className="ml-3">
          <h1 className="text-white text-xl font-medium tracking-wider">
            DiversiCloud
          </h1>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}