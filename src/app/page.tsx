"use client";

import { Play, Heart, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { SignInButton } from '@clerk/nextjs';

export default function Home() {

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
  
    const playAudio = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio('/Shimmer_tts-1-hd_1x_2024-11-12T01_25_15-556Z.mp3');
        audioRef.current.onended = () => setIsPlaying(false);
      }
      
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.log('Audio playback failed:', error);
        });
        setIsPlaying(true);
      }
    };


  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Logo in corner */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-orange-100 to-rose-100 rounded-lg shadow-sm">
            <Play className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">
            Resonance
          </span>
        </div>
      </div>

      {/* Audio Play Button */}
      <div className="absolute z-20 top-6 right-6">
        <button
          onClick={playAudio}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            text-sm font-medium transition-all duration-300
            bg-white/80 hover:bg-white
            text-gray-700 hover:text-gray-900
            shadow-sm hover:shadow
            backdrop-blur-sm
            ${isPlaying ? 'ring-2 ring-orange-500/50' : ''}
          `}
        >
          <div className={`relative ${isPlaying ? 'animate-pulse' : ''}`}>
            <Volume2 className="w-4 h-4" />
            {isPlaying && (
              <div className="absolute inset-0 animate-ping-slow">
                <Volume2 className="w-4 h-4 text-orange-500/30" />
              </div>
            )}
          </div>
          Play Introduction
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-180px)] p-4">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl font-medium text-gray-800 leading-relaxed">
            Have weekly recurring conversations
          </h2>
          
          <p className="text-gray-600 text-xl max-w-xl mx-auto leading-relaxed">
            Start meaningful conversations with an AI voice assistant on a recurring schedule. Perfect for weekly planning, daily reflections, or regular check-ins.
          </p>

          <div className="flex flex-col gap-6 items-center">
          <SignInButton>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 
                text-white px-10 py-7 text-xl font-medium rounded-full transition-all duration-300 
                hover:scale-105 hover:shadow-lg shadow-md"            
              >
                Get started
            </Button>
          </SignInButton>
            
            <p className="text-base text-gray-500">
              ✨ No credit card required • Start free today
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-6 text-center">
        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
          Built with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> in NYC by <a href="https://henrikberggren.com" className="underline">Henrik Berggren</a>
        </p>
      </div>
    </div>

  );
}
