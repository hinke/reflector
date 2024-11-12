"use client";

const LOCAL_RELAY_SERVER_URL = 'http://localhost:8081';

import { useEffect, useRef, useCallback, useState } from 'react';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { instructions } from '../utils/conversation_config.mjs';
import { Play, Heart, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

export default function Home() {

/**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient({ url: LOCAL_RELAY_SERVER_URL })
  );

  const [items, setItems] = useState<ItemType[]>([]);
  const startTimeRef = useRef<string>(new Date().toISOString());
  const [isConnected, setIsConnected] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(false);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Init VAD mode and other session config
    client.updateSession({
      turn_detection: { type: 'server_vad' },
      voice: 'shimmer',
    });

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hi`,
      },
    ]);

    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  }, []);


  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);


    /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
    useEffect(() => {
      // Get refs
      const wavStreamPlayer = wavStreamPlayerRef.current;
      const client = clientRef.current;
  
      // Set instructions

      client.updateSession({ instructions: instructions });
      // Set transcription, otherwise we don't get user transcriptions back
      client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

      client.on('error', (event: any) => console.error(event));
      client.on('conversation.interrupted', async () => {
        const trackSampleOffset = await wavStreamPlayer.interrupt();
        if (trackSampleOffset?.trackId) {
          const { trackId, offset } = trackSampleOffset;
          await client.cancelResponse(trackId, offset);
        }
      });
      client.on('conversation.updated', async ({ item, delta }: any) => {
        const items = client.conversation.getItems();
        if (delta?.audio) {
          wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        }
        if (item.status === 'completed' && item.formatted.audio?.length) {
          const wavFile = await WavRecorder.decode(
            item.formatted.audio,
            24000,
            24000
          );
          item.formatted.file = wavFile;
        }
        setItems(items);
      });
  
      setItems(client.conversation.getItems());
  
      return () => {
        // cleanup; resets to defaults
        client.reset();
      };    
    }, []);
  

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
            <Button 
              onClick={isConnected ? disconnectConversation : connectConversation}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 
                text-white px-10 py-7 text-xl font-medium rounded-full transition-all duration-300 
                hover:scale-105 hover:shadow-lg shadow-md"              
            >
              {isConnected ? 'End conversation' : 'Start conversation'}
            </Button>
            
            <p className="text-base text-gray-500">
              ✨ No credit card required • Start free today
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 p-6 text-center">
        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
          Built with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> in NYC by Henrik Berggren
        </p>
      </div>
    </div>

  );
}
