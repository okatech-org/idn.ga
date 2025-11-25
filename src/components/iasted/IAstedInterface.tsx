import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeVoiceWebRTC } from '@/hooks/useRealtimeVoiceWebRTC';
import { IAstedButtonFull } from './IAstedButtonFull';
import IAstedOverlay from './IAstedOverlay'; // We keep the overlay for Chat UI
import { useIAsted } from '@/context/IAstedContext';
import { DocumentService } from '@/services/DocumentService';
import { toast } from 'sonner';

interface IAstedInterfaceProps {
    userRole?: string;
    userGender?: string;
}

const IAstedInterface: React.FC<IAstedInterfaceProps> = ({ userRole = 'citizen', userGender = 'male' }) => {
    const navigate = useNavigate();
    const { isOpen, toggle, open, close, mode, setMode } = useIAsted();

    // Tool Execution Logic
    const handleToolCall = async (toolName: string, args: any) => {
        console.log(`[iAsted] Tool Call: ${toolName}`, args);

        try {
            switch (toolName) {
                case 'navigate_app':
                    if (args.route) {
                        navigate(args.route);
                        return { success: true, message: `Navigated to ${args.route}` };
                    }
                    break;

                case 'generate_document':
                    if (args.type) {
                        await DocumentService.generatePDF(args.title || 'Document', args.content || '');
                        return { success: true, message: "Document generated successfully" };
                    }
                    break;

                case 'control_ui':
                    if (args.action === 'set_theme_dark') {
                        document.documentElement.classList.add('dark');
                        return { success: true, message: "Dark mode enabled" };
                    } else if (args.action === 'set_theme_light') {
                        document.documentElement.classList.remove('dark');
                        return { success: true, message: "Light mode enabled" };
                    }
                    break;

                default:
                    return { success: false, error: "Unknown tool" };
            }
        } catch (error) {
            console.error("Tool execution error:", error);
            return { success: false, error: error.message };
        }
    };

    // Voice Hook
    const { connect, disconnect, status, voiceMode, audioLevel } = useRealtimeVoiceWebRTC({
        userRole,
        userGender,
        onToolCall: handleToolCall
    });

    // Handle Button Click
    const handleButtonClick = () => {
        if (status === 'connected') {
            disconnect();
            close();
        } else {
            connect();
            open('voice');
        }
    };

    // Sync Voice Mode with Context
    useEffect(() => {
        if (status === 'connected' && mode !== 'voice') {
            setMode('voice');
        }
    }, [status, mode, setMode]);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-[9999]">
                <IAstedButtonFull
                    onClick={handleButtonClick}
                    voiceListening={voiceMode === 'listening'}
                    voiceSpeaking={voiceMode === 'speaking'}
                    voiceProcessing={voiceMode === 'thinking'}
                    pulsing={status === 'connecting'}
                    audioLevel={audioLevel}
                    isInterfaceOpen={isOpen}
                />
            </div>

            {/* The Overlay handles the Chat UI */}
            {/* Note: In a full implementation, we might merge IAstedInterface logic into IAstedOverlay or vice versa. 
          For now, IAstedInterface manages the Voice connection and Button, while Overlay manages the Chat UI. */}
        </>
    );
};

export default IAstedInterface;
