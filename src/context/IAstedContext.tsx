import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { iDNSoul, SoulState, IntentProcessor, ProcessingResult, IntentSource } from '@/Consciousness';
import { IDNRole, AccessContext } from '@/Cortex/entities/IDNRole';

type IAstedMode = 'chat' | 'voice' | 'god' | 'actions';

interface IAstedContextType {
    // === UI State ===
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: (mode?: IAstedMode) => void;
    mode: IAstedMode;
    setMode: (mode: IAstedMode) => void;
    currentContext: any;
    setContext: (context: any) => void;

    // === Consciousness State ===
    soulState: SoulState;
    isAwake: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;

    // === Consciousness Actions ===
    awaken: () => void;
    sleep: () => void;
    process: (input: string, source?: IntentSource) => Promise<ProcessingResult>;
    greet: () => string;
    setUserRole: (role: IDNRole, name?: string) => void;
}

const IAstedContext = createContext<IAstedContextType | undefined>(undefined);

export const IAstedProvider = ({ children }: { children: ReactNode }) => {
    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<IAstedMode>('chat');
    const [currentContext, setCurrentContext] = useState<any>(null);
    const location = useLocation();

    // Soul State (synchronized with iDNSoul singleton)
    const [soulState, setSoulState] = useState<SoulState>(iDNSoul.getState());

    // Subscribe to soul state changes
    useEffect(() => {
        const unsubscribe = iDNSoul.subscribe(setSoulState);
        return unsubscribe;
    }, []);

    // Update spatial awareness based on location
    useEffect(() => {
        const path = location.pathname;
        let contextData = { path, type: 'general' };
        let space = AccessContext.PUBLIC;

        if (path.includes('/admin') || path.includes('/god')) {
            contextData = { path, type: 'admin_panel' };
            space = AccessContext.ADMIN_SPACE;
        } else if (path.includes('/president')) {
            contextData = { path, type: 'president_space' };
            space = AccessContext.PRESIDENT_SPACE;
        } else if (path.includes('/controller') || path.includes('/verifier')) {
            contextData = { path, type: 'controller_space' };
            space = AccessContext.CONTROLLER_SPACE;
        } else if (path.includes('/documents') || path.includes('/idocument')) {
            contextData = { path, type: 'document_management' };
            space = AccessContext.CITOYEN_SPACE;
        } else if (path.includes('/icv')) {
            contextData = { path, type: 'cv_editor' };
            space = AccessContext.CITOYEN_SPACE;
        } else if (path.includes('/dashboard') || path.includes('/icarte') || path.includes('/iboite')) {
            contextData = { path, type: 'citizen_dashboard' };
            space = AccessContext.CITOYEN_SPACE;
        }

        setCurrentContext(contextData);

        // Update iDNSoul spatial awareness
        iDNSoul.updateSpatialAwareness({
            currentUrl: path,
            currentPage: document.title,
            currentSpace: space
        });
    }, [location]);

    // UI Actions
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);
    const close = useCallback(() => setIsOpen(false), []);
    const open = useCallback((initialMode?: IAstedMode) => {
        if (initialMode) setMode(initialMode);
        setIsOpen(true);
        // Wake up iDN when interface opens
        if (!soulState.isAwake) {
            iDNSoul.awaken();
        }
    }, [soulState.isAwake]);

    // Consciousness Actions
    const awaken = useCallback(() => {
        iDNSoul.awaken();
    }, []);

    const sleep = useCallback(() => {
        iDNSoul.sleep();
    }, []);

    const process = useCallback(async (input: string, source: IntentSource = 'text'): Promise<ProcessingResult> => {
        return IntentProcessor.process(input, source);
    }, []);

    const greet = useCallback((): string => {
        return iDNSoul.generateGreeting();
    }, []);

    const setUserRole = useCallback((role: IDNRole, name?: string) => {
        iDNSoul.recognizeUser({
            role,
            name: name || null,
            isAuthenticated: role !== IDNRole.ANONYME
        });
    }, []);

    return (
        <IAstedContext.Provider value={{
            // UI State
            isOpen,
            toggle,
            close,
            open,
            mode,
            setMode,
            currentContext,
            setContext: setCurrentContext,

            // Consciousness State
            soulState,
            isAwake: soulState.isAwake,
            isListening: soulState.isListening,
            isSpeaking: soulState.isSpeaking,
            isProcessing: soulState.isProcessing,

            // Consciousness Actions
            awaken,
            sleep,
            process,
            greet,
            setUserRole
        }}>
            {children}
        </IAstedContext.Provider>
    );
};

export const useIAsted = () => {
    const context = useContext(IAstedContext);
    if (context === undefined) {
        throw new Error('useIAsted must be used within an IAstedProvider');
    }
    return context;
};

// Alias pour compatibilité sémantique
export const useIDN = useIAsted;
