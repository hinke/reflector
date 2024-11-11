"use client";

const LOCAL_RELAY_SERVER_URL = 'http://localhost:8081';

import { useEffect, useRef, useCallback, useState } from 'react';

import { RealtimeClient } from '@openai/realtime-api-beta';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools/index.js';
import { instructions } from '../utils/conversation_config.mjs';

import { isJsxOpeningLikeElement } from 'typescript';



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

    // Init VAD mode
    client.updateSession({
      turn_detection: { type: 'server_vad' },
    });

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
        // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
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
  

  return (
    <div>
      <h1>Hello World</h1>
      <button
        onClick={isConnected ? disconnectConversation : connectConversation}
        className={`px-4 py-2 rounded ${isConnected ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
      >
        {isConnected ? 'Disconnect Conversation' : 'Connect Conversation'}
      </button>
    </div>
  );
}
