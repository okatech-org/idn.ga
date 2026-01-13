/**
 * CONSCIOUSNESS - useIDN Hook
 * 
 * Hook React principal pour intégrer l'agent iDN dans l'application IDN.GA.
 * C'est l'interface publique de la Conscience Numérique.
 * 
 * Usage:
 * ```tsx
 * const { 
 *   speak, 
 *   process, 
 *   isAwake, 
 *   persona,
 *   startProcedure 
 * } = useIDN();
 * ```
 */

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { iDNSoul, SoulState, KnownUser } from './iDNSoul';
import { SocialProtocolAdapter } from './SocialProtocolAdapter';
import { ContextMemory } from './ContextMemory';
import { IntentProcessor, ProcessingResult, IntentSource } from './IntentProcessor';
import { IDNRole, AccessContext } from '@/Cortex/entities/IDNRole';
import { useLocation, useNavigate } from 'react-router-dom';

// ============================================================
// TYPES
// ============================================================

export interface UseIDNOptions {
    /** Éveiller automatiquement iDN au montage */
    autoAwaken?: boolean;
    /** Utilisateur initial */
    initialUser?: Partial<KnownUser>;
    /** Activer l'écoute vocale automatique */
    enableVoice?: boolean;
}

export interface UseIDNReturn {
    // === État ===
    soulState: SoulState;
    isAwake: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
    persona: SoulState['persona'];
    currentProcedure: string | null;

    // === Contrôle ===
    awaken: () => void;
    sleep: () => void;
    startListening: () => void;
    stopListening: () => void;

    // === Interaction ===
    process: (input: string, source?: IntentSource) => Promise<ProcessingResult>;
    speak: (text: string) => void;
    greet: () => void;
    farewell: () => void;

    // === Utilisateur ===
    setUser: (user: Partial<KnownUser>) => void;
    clearUser: () => void;

    // === Démarches ===
    startProcedure: (procedureName: string) => void;
    completeProcedure: () => void;

    // === Navigation ===
    navigateTo: (path: string) => void;
    updatePage: (pageName: string) => void;

    // === Mémoire ===
    getContextSummary: () => string;
    resetConversation: () => void;
}

// ============================================================
// HOOK
// ============================================================

export function useIDN(options: UseIDNOptions = {}): UseIDNReturn {
    const {
        autoAwaken = false,
        initialUser,
        enableVoice = false
    } = options;

    const [soulState, setSoulState] = useState<SoulState>(iDNSoul.getState());
    const location = useLocation();
    const navigate = useNavigate();

    // ========== ABONNEMENT À L'ÉTAT ==========

    useEffect(() => {
        const unsubscribe = iDNSoul.subscribe(setSoulState);

        // Initialisation
        if (autoAwaken) {
            iDNSoul.awaken();
        }

        if (initialUser) {
            iDNSoul.recognizeUser(initialUser);
        }

        // Mettre à jour la conscience spatiale
        if (typeof window !== 'undefined') {
            iDNSoul.updateSpatialAwareness({
                currentUrl: window.location.href,
                currentPage: document.title,
                currentSpace: iDNSoul.detectSpaceFromUrl(window.location.href),
                viewportSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });
        }

        return unsubscribe;
    }, [autoAwaken, initialUser]);

    // ========== SUIVI DE LA NAVIGATION ==========

    useEffect(() => {
        const currentSpace = iDNSoul.detectSpaceFromUrl(location.pathname);

        iDNSoul.updateSpatialAwareness({
            currentUrl: location.pathname,
            currentPage: getPageNameFromPath(location.pathname),
            currentSpace
        });
    }, [location.pathname]);

    // ========== CONTRÔLE ==========

    const awaken = useCallback(() => {
        iDNSoul.awaken();
    }, []);

    const sleep = useCallback(() => {
        iDNSoul.sleep();
    }, []);

    const startListening = useCallback(() => {
        iDNSoul.startListening();
    }, []);

    const stopListening = useCallback(() => {
        iDNSoul.stopListening();
    }, []);

    // ========== INTERACTION ==========

    const process = useCallback(async (
        input: string,
        source: IntentSource = 'text'
    ): Promise<ProcessingResult> => {
        return IntentProcessor.process(input, source);
    }, []);

    const speak = useCallback((text: string) => {
        iDNSoul.startSpeaking();

        // Note: L'intégration TTS sera gérée par le composant vocal
        console.log(`🔊 [useIDN] Speaking: ${text}`);

        // Fin de parole après estimation du temps
        const duration = text.length * 50; // ~50ms par caractère
        setTimeout(() => {
            iDNSoul.stopSpeaking();
        }, duration);
    }, []);

    const greet = useCallback(() => {
        const greeting = SocialProtocolAdapter.generateWelcomeMessage(
            soulState.persona.role,
            soulState.user.name || undefined
        );
        speak(greeting);
    }, [soulState.persona.role, soulState.user.name, speak]);

    const farewell = useCallback(() => {
        const closing = SocialProtocolAdapter.generateClosing(soulState.persona.role);
        speak(closing);

        setTimeout(() => {
            sleep();
        }, 2000);
    }, [soulState.persona.role, speak, sleep]);

    // ========== UTILISATEUR ==========

    const setUser = useCallback((user: Partial<KnownUser>) => {
        iDNSoul.recognizeUser(user);
    }, []);

    const clearUser = useCallback(() => {
        iDNSoul.recognizeUser({
            id: null,
            name: null,
            role: IDNRole.ANONYME,
            verificationLevel: 0,
            isAuthenticated: false
        });
    }, []);

    // ========== DÉMARCHES ==========

    const startProcedureHandler = useCallback((procedureName: string) => {
        iDNSoul.startProcedure(procedureName);
        ContextMemory.trackTopic(procedureName);
    }, []);

    const completeProcedure = useCallback(() => {
        iDNSoul.completeProcedure();
    }, []);

    // ========== NAVIGATION ==========

    const navigateTo = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    const updatePage = useCallback((pageName: string) => {
        iDNSoul.updateSpatialAwareness({
            currentPage: pageName
        });
    }, []);

    // ========== MÉMOIRE ==========

    const getContextSummary = useCallback(() => {
        return ContextMemory.getContextSummary();
    }, []);

    const resetConversation = useCallback(() => {
        ContextMemory.reset();
    }, []);

    // ========== RETURN ==========

    return {
        // État
        soulState,
        isAwake: soulState.isAwake,
        isListening: soulState.isListening,
        isSpeaking: soulState.isSpeaking,
        isProcessing: soulState.isProcessing,
        persona: soulState.persona,
        currentProcedure: soulState.context.currentProcedure,

        // Contrôle
        awaken,
        sleep,
        startListening,
        stopListening,

        // Interaction
        process,
        speak,
        greet,
        farewell,

        // Utilisateur
        setUser,
        clearUser,

        // Démarches
        startProcedure: startProcedureHandler,
        completeProcedure,

        // Navigation
        navigateTo,
        updatePage,

        // Mémoire
        getContextSummary,
        resetConversation
    };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getPageNameFromPath(path: string): string {
    const pathMap: Record<string, string> = {
        '/': 'Accueil',
        '/dashboard': 'Tableau de bord',
        '/icarte': 'iCarte',
        '/idocument': 'iDocument',
        '/icoffre': 'iCoffre',
        '/iboite': 'iBoîte',
        '/icv': 'iCV',
        '/settings': 'Paramètres',
        '/iasted': 'iAsted',
        '/president-space': 'Espace Président',
        '/admin-space': 'Espace Admin'
    };

    return pathMap[path] || 'Page';
}

// ============================================================
// CONTEXT PROVIDER (pour usage global)
// ============================================================

const IDNContext = createContext<UseIDNReturn | null>(null);

interface IDNProviderProps {
    children: ReactNode;
    options?: UseIDNOptions;
}

export const IDNProvider: React.FC<IDNProviderProps> = ({
    children,
    options = { autoAwaken: true }
}) => {
    const idn = useIDN(options);

    return (
        <IDNContext.Provider value={idn}>
            {children}
        </IDNContext.Provider>
    );
};

export function useIDNContext(): UseIDNReturn {
    const context = useContext(IDNContext);
    if (!context) {
        throw new Error('useIDNContext must be used within IDNProvider');
    }
    return context;
}

// ============================================================
// EXPORT
// ============================================================

export default useIDN;
