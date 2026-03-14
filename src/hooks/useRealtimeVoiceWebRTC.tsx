import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Types for WebRTC and Realtime API
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
type VoiceMode = 'listening' | 'speaking' | 'thinking' | 'idle';

interface UseRealtimeVoiceWebRTCProps {
  userRole?: string;
  userGender?: string;
  onToolCall?: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
}

export const useRealtimeVoiceWebRTC = ({ onToolCall }: UseRealtimeVoiceWebRTCProps) => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('idle');
  const [audioLevel] = useState(0);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioStream = useRef<MediaStream | null>(null);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');

      // TODO: Migrate to Convex action for OpenAI Realtime token generation
      // Previously used Supabase edge function chat-with-iasted
      toast.error("Voice WebRTC: en attente de migration vers Convex");
      setStatus('error');
      return;

      // The code below will be re-enabled once a Convex action replaces the edge function
      // It requires an ephemeral token from the backend to connect to OpenAI Realtime API
    } catch (error) {
      setStatus('error');
      toast.error("Erreur de connexion vocale");
    }
  }, [onToolCall]);

  const disconnect = useCallback(() => {
    if (peerConnection.current) peerConnection.current.close();
    if (audioStream.current) audioStream.current.getTracks().forEach(t => t.stop());
    setStatus('idle');
    setVoiceMode('idle');
  }, []);

  return { connect, disconnect, status, voiceMode, audioLevel };
};
