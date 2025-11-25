import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

// Types for WebRTC and Realtime API
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
type VoiceMode = 'listening' | 'speaking' | 'thinking' | 'idle';

interface UseRealtimeVoiceWebRTCProps {
  userRole?: string;
  userGender?: string;
  onToolCall?: (toolName: string, args: any) => Promise<any>;
}

export const useRealtimeVoiceWebRTC = ({ userRole = 'citizen', userGender = 'male', onToolCall }: UseRealtimeVoiceWebRTCProps) => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle');
  const [audioLevel, setAudioLevel] = useState(0);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audioStream = useRef<MediaStream | null>(null);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');

      // 1. Get Ephemeral Token from our Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-iasted`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ userRole, userGender })
      });

      if (!response.ok) throw new Error('Failed to get session token');
      const data = await response.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // 2. Initialize WebRTC
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // Setup Audio
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      pc.ontrack = (e) => audioEl.srcObject = e.streams[0];

      // Add Local Audio Track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      // Setup Data Channel for Events
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;

      dc.onmessage = async (e) => {
        const event = JSON.parse(e.data);

        if (event.type === 'response.function_call_arguments.done') {
          setVoiceMode('thinking');
          if (onToolCall) {
            const result = await onToolCall(event.name, JSON.parse(event.arguments));
            // Send result back to OpenAI
            const responseEvent = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: event.call_id,
                output: JSON.stringify(result)
              }
            };
            dc.send(JSON.stringify(responseEvent));
            dc.send(JSON.stringify({ type: "response.create" })); // Trigger response generation
          }
        }

        if (event.type === 'input_audio_buffer.speech_started') setVoiceMode('listening');
        if (event.type === 'input_audio_buffer.speech_stopped') setVoiceMode('thinking');
        if (event.type === 'response.audio.delta') setVoiceMode('speaking');
      };

      // 3. Create Offer and Connect
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-10-01";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      setStatus('connected');
      setVoiceMode('idle');
      toast.success("iAsted Vocal Connecté");

    } catch (error) {
      console.error("Connection failed:", error);
      setStatus('error');
      toast.error("Erreur de connexion vocale");
    }
  }, [userRole, userGender, onToolCall]);

  const disconnect = useCallback(() => {
    if (peerConnection.current) peerConnection.current.close();
    if (audioStream.current) audioStream.current.getTracks().forEach(t => t.stop());
    setStatus('idle');
    setVoiceMode('idle');
  }, []);

  return { connect, disconnect, status, voiceMode, audioLevel };
};
