"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export function LoadingScreen({
  message = "Loading Workspace Orchestration Manager...",
  subMessage = "Setting up your environment",
}: LoadingScreenProps) {
  const [dots, setDots] = useState("");
  const router = useRouter();

  useEffect(() => {
    // dot animation
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // after 2.5s, navigate on
    const navTimeout = setTimeout(() => {
      router.push("/ai");
    }, 2500);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(navTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#346066] relative overflow-hidden">
      {/* grid backdrop */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* content */}
      <div className="relative z-10 space-y-8 text-center px-4">
        {/* your logo SVG */}
        <div className="w-48 h-48 mx-auto relative">
          {/* …inline SVG with boxOverlap/pulse keyframes… */}
        </div>

        {/* messages */}
        <div className="space-y-3">
          <h1 className="text-white text-2xl font-medium tracking-wide">
            {message}
          </h1>
          <p className="text-white/80 text-sm">
            {subMessage}
            {dots}
          </p>
        </div>

        {/* progress bar */}
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
