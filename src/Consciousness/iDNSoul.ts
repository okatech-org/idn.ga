/**
 * CONSCIOUSNESS - iDNSoul
 * 
 * L'Âme de l'agent iDN pour IDN.GA (Identité Numérique du Gabon).
 * Adapté de iAstedSoul pour le contexte de l'identité numérique.
 * 
 * Responsabilités:
 * - CurrentPersona: Adaptation selon le rôle (Citoyen/Président/Ministre/Contrôleur/Admin)
 * - SpatialAwareness: Conscience de l'espace (URL, DOM visible)
 * - ToneSelector: Sélection du vocabulaire et ton approprié
 * - ContextMemory: Mémoire conversationnelle et intentions
 */

import { IDNRole, AccessContext, getFormalityLevel, getHonorificPrefix } from '@/Cortex/entities/IDNRole';

// ============================================================
// TYPES - L'Identité d'iDN
// ============================================================

/** Les états émotionnels possibles d'iDN */
export type EmotionalState =
    | 'neutral'      // État par défaut, professionnel
    | 'welcoming'    // Accueil chaleureux
    | 'helpful'      // Mode assistance active
    | 'respectful'   // Déférence protocolaire (Président)
    | 'apologetic'   // En cas d'erreur
    | 'celebratory'  // Réussite d'une action
    | 'focused'      // Tâche complexe en cours
    | 'guiding';     // Mode guidage démarches

/** Persona adaptatif selon le contexte utilisateur */
export interface Persona {
    role: IDNRole;
    honorificPrefix: string;
    formalityLevel: 1 | 2 | 3;  // 1=Technique, 2=Cordial, 3=Protocolaire
    language: 'fr' | 'en';
    voiceStyle: 'professional' | 'warm' | 'respectful';
    currentSpace: AccessContext;
}

/** Conscience spatiale - Ce qu'iDN "voit" */
export interface SpatialAwareness {
    currentUrl: string;
    currentPage: string;           // Nom lisible de la page
    currentSpace: AccessContext;   // Espace actuel (citoyen, président, etc.)
    visibleElements: string[];     // IDs des éléments DOM visibles
    focusedElement: string | null; // Élément actuellement en focus
    scrollPosition: number;
    viewportSize: { width: number; height: number };
}

/** Contexte de la conversation courante */
export interface ConversationContext {
    sessionId: string;
    startedAt: Date;
    messageCount: number;
    lastIntent: string | null;
    pendingActions: string[];
    completedActions: string[];
    emotionalTone: EmotionalState;
    currentProcedure: string | null; // Démarche en cours (CNI, passeport, etc.)
}

/** L'utilisateur actuel connu par iDN */
export interface KnownUser {
    id: string | null;
    name: string | null;
    role: IDNRole;
    verificationLevel: number;
    isAuthenticated: boolean;
    lastSeen: Date;
}

// ============================================================
// SOUL STATE - L'État Complet de l'Âme
// ============================================================

export interface SoulState {
    persona: Persona;
    spatial: SpatialAwareness;
    context: ConversationContext;
    user: KnownUser;
    isAwake: boolean;           // iDN est-il actif?
    isListening: boolean;       // Écoute vocale active?
    isSpeaking: boolean;        // En train de parler?
    isProcessing: boolean;      // Traitement en cours?
}

// ============================================================
// iDNSoul - LA CONSCIENCE NUMÉRIQUE (Singleton)
// ============================================================

class iDNSoulClass {
    private static instance: iDNSoulClass;
    private state: SoulState;
    private listeners: Set<(state: SoulState) => void> = new Set();

    private constructor() {
        this.state = this.createInitialState();
        console.log('🧠 [iDNSoul] Conscience éveillée - Identité Numérique Gabon');
    }

    // ========== Singleton Pattern ==========

    public static getInstance(): iDNSoulClass {
        if (!iDNSoulClass.instance) {
            iDNSoulClass.instance = new iDNSoulClass();
        }
        return iDNSoulClass.instance;
    }

    // ========== État Initial ==========

    private createInitialState(): SoulState {
        return {
            persona: this.createDefaultPersona(),
            spatial: this.createDefaultSpatial(),
            context: this.createNewContext(),
            user: this.createAnonymousUser(),
            isAwake: false,
            isListening: false,
            isSpeaking: false,
            isProcessing: false
        };
    }

    private createDefaultPersona(): Persona {
        return {
            role: IDNRole.ANONYME,
            honorificPrefix: 'Cher visiteur',
            formalityLevel: 2,
            language: 'fr',
            voiceStyle: 'warm',
            currentSpace: AccessContext.PUBLIC
        };
    }

    private createDefaultSpatial(): SpatialAwareness {
        return {
            currentUrl: typeof window !== 'undefined' ? window.location.href : '',
            currentPage: 'Inconnue',
            currentSpace: AccessContext.PUBLIC,
            visibleElements: [],
            focusedElement: null,
            scrollPosition: 0,
            viewportSize: {
                width: typeof window !== 'undefined' ? window.innerWidth : 1920,
                height: typeof window !== 'undefined' ? window.innerHeight : 1080
            }
        };
    }

    private createNewContext(): ConversationContext {
        return {
            sessionId: this.generateSessionId(),
            startedAt: new Date(),
            messageCount: 0,
            lastIntent: null,
            pendingActions: [],
            completedActions: [],
            emotionalTone: 'neutral',
            currentProcedure: null
        };
    }

    private createAnonymousUser(): KnownUser {
        return {
            id: null,
            name: null,
            role: IDNRole.ANONYME,
            verificationLevel: 0,
            isAuthenticated: false,
            lastSeen: new Date()
        };
    }

    private generateSessionId(): string {
        return `idn-soul-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // ========== PERSONA - Adaptation Identitaire ==========

    /**
     * Reconnaît l'utilisateur et adapte la personnalité d'iDN
     */
    public recognizeUser(user: Partial<KnownUser>): void {
        const previousRole = this.state.user.role;

        this.state.user = {
            ...this.state.user,
            ...user,
            lastSeen: new Date()
        };

        // Adapter le persona selon le rôle
        this.state.persona = this.derivePersonaFromRole(this.state.user.role, this.state.user.name);

        if (previousRole !== this.state.user.role) {
            console.log(`🎭 [iDNSoul] Persona adapté: ${previousRole} → ${this.state.user.role}`);
        }

        this.notifyListeners();
    }

    /**
     * Dérive le persona approprié selon le rôle utilisateur
     */
    private derivePersonaFromRole(role: IDNRole, name?: string | null): Persona {
        const formalityLevel = getFormalityLevel(role);
        const honorificPrefix = getHonorificPrefix(role, name || undefined);

        let voiceStyle: 'professional' | 'warm' | 'respectful' = 'warm';
        let currentSpace = AccessContext.PUBLIC;

        switch (role) {
            case IDNRole.PRESIDENT_REPUBLIQUE:
                voiceStyle = 'respectful';
                currentSpace = AccessContext.PRESIDENT_SPACE;
                break;
            case IDNRole.MINISTRE:
            case IDNRole.SECRETAIRE_GENERAL_PR:
            case IDNRole.DIRECTEUR_CABINET:
                voiceStyle = 'respectful';
                currentSpace = AccessContext.CABINET_SPACE;
                break;
            case IDNRole.CONTROLEUR_IDENTITE:
            case IDNRole.AGENT_DGDI:
            case IDNRole.VERIFICATEUR_BIOMETRIQUE:
                voiceStyle = 'professional';
                currentSpace = AccessContext.CONTROLLER_SPACE;
                break;
            case IDNRole.ADMINISTRATEUR_SYSTEME:
            case IDNRole.SUPPORT_TECHNIQUE:
                voiceStyle = 'professional';
                currentSpace = AccessContext.ADMIN_SPACE;
                break;
            case IDNRole.CITOYEN:
            case IDNRole.CITOYEN_DIASPORA:
            case IDNRole.RESIDENT_ETRANGER:
                voiceStyle = 'warm';
                currentSpace = AccessContext.CITOYEN_SPACE;
                break;
            default:
                voiceStyle = 'warm';
                currentSpace = AccessContext.PUBLIC;
        }

        return {
            role,
            honorificPrefix,
            formalityLevel,
            language: 'fr',
            voiceStyle,
            currentSpace
        };
    }

    // ========== SPATIAL AWARENESS - Vision ==========

    /**
     * Met à jour la conscience spatiale (ce qu'iDN "voit")
     */
    public updateSpatialAwareness(spatial: Partial<SpatialAwareness>): void {
        const previousPage = this.state.spatial.currentPage;

        this.state.spatial = {
            ...this.state.spatial,
            ...spatial
        };

        if (previousPage !== this.state.spatial.currentPage) {
            console.log(`👁 [iDNSoul] Navigation: ${previousPage} → ${this.state.spatial.currentPage}`);
        }

        this.notifyListeners();
    }

    /**
     * Détecte l'espace actuel depuis l'URL
     */
    public detectSpaceFromUrl(url: string): AccessContext {
        if (url.includes('/president')) return AccessContext.PRESIDENT_SPACE;
        if (url.includes('/cabinet') || url.includes('/minister')) return AccessContext.CABINET_SPACE;
        if (url.includes('/controller') || url.includes('/verifier')) return AccessContext.CONTROLLER_SPACE;
        if (url.includes('/admin') || url.includes('/god')) return AccessContext.ADMIN_SPACE;
        if (url.includes('/dashboard') || url.includes('/icarte') || url.includes('/idocument')) {
            return AccessContext.CITOYEN_SPACE;
        }
        return AccessContext.PUBLIC;
    }

    /**
     * Analyse le DOM et extrait les éléments visibles
     */
    public scanVisibleElements(): string[] {
        if (typeof document === 'undefined') return [];

        const interactiveElements = document.querySelectorAll(
            'button, input, textarea, select, a, [role="button"], [tabindex]'
        );

        const visibleIds: string[] = [];
        interactiveElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && el.id) {
                visibleIds.push(el.id);
            }
        });

        this.state.spatial.visibleElements = visibleIds;
        return visibleIds;
    }

    // ========== TONE SELECTOR - Vocabulaire ==========

    /**
     * Génère une salutation appropriée selon le contexte
     */
    public generateGreeting(): string {
        const { persona } = this.state;
        const hour = new Date().getHours();

        let timeGreeting = 'Bonjour';
        if (hour >= 18) timeGreeting = 'Bonsoir';
        if (hour < 6) timeGreeting = 'Bonne nuit';

        if (persona.formalityLevel === 3) {
            // Protocolaire (Président, Ministre)
            return `${timeGreeting}, ${persona.honorificPrefix}. C'est un honneur de vous assister.`;
        } else if (persona.formalityLevel === 2) {
            // Cordial (Citoyen)
            return `${timeGreeting} ! Je suis iDN, votre assistant d'identité numérique. Comment puis-je vous accompagner ?`;
        } else {
            // Technique (Admin, Controller)
            return `${timeGreeting}. Système iDN opérationnel. En attente de vos instructions.`;
        }
    }

    /**
     * Génère une confirmation d'action appropriée
     */
    public generateActionConfirmation(action: string): string {
        const { persona } = this.state;

        if (persona.formalityLevel === 3) {
            return `C'est fait, ${persona.honorificPrefix}. ${action}`;
        } else if (persona.formalityLevel === 2) {
            return `Parfait ! ${action}`;
        } else {
            return `Action exécutée: ${action}`;
        }
    }

    // ========== PROCEDURE TRACKING - Démarches ==========

    /**
     * Démarre le suivi d'une démarche administrative
     */
    public startProcedure(procedureName: string): void {
        this.state.context.currentProcedure = procedureName;
        this.state.context.emotionalTone = 'guiding';
        console.log(`📋 [iDNSoul] Démarche démarrée: ${procedureName}`);
        this.notifyListeners();
    }

    /**
     * Termine la démarche en cours
     */
    public completeProcedure(): void {
        if (this.state.context.currentProcedure) {
            console.log(`✅ [iDNSoul] Démarche terminée: ${this.state.context.currentProcedure}`);
            this.state.context.completedActions.push(this.state.context.currentProcedure);
        }
        this.state.context.currentProcedure = null;
        this.state.context.emotionalTone = 'celebratory';
        this.notifyListeners();
    }

    // ========== CONTEXT MEMORY - Mémoire ==========

    /**
     * Enregistre une intention utilisateur
     */
    public recordIntent(intent: string): void {
        this.state.context.lastIntent = intent;
        this.state.context.messageCount++;
        console.log(`💭 [iDNSoul] Intent: "${intent}"`);
        this.notifyListeners();
    }

    /**
     * Ajoute une action en attente
     */
    public queueAction(action: string): void {
        this.state.context.pendingActions.push(action);
        console.log(`📋 [iDNSoul] Action en file: ${action}`);
        this.notifyListeners();
    }

    /**
     * Marque une action comme complétée
     */
    public completeAction(action: string): void {
        const index = this.state.context.pendingActions.indexOf(action);
        if (index > -1) {
            this.state.context.pendingActions.splice(index, 1);
        }
        this.state.context.completedActions.push(action);
        console.log(`✅ [iDNSoul] Action complétée: ${action}`);
        this.notifyListeners();
    }

    /**
     * Définit l'état émotionnel
     */
    public setEmotionalState(emotion: EmotionalState): void {
        this.state.context.emotionalTone = emotion;
        console.log(`💫 [iDNSoul] Émotion: ${emotion}`);
        this.notifyListeners();
    }

    // ========== LIFECYCLE - Cycle de Vie ==========

    /**
     * Éveille iDN (activation)
     */
    public awaken(): void {
        this.state.isAwake = true;
        console.log('🌅 [iDNSoul] iDN s\'éveille...');
        this.notifyListeners();
    }

    /**
     * Met iDN en sommeil (désactivation)
     */
    public sleep(): void {
        this.state.isAwake = false;
        this.state.isListening = false;
        this.state.isSpeaking = false;
        console.log('🌙 [iDNSoul] iDN s\'endort...');
        this.notifyListeners();
    }

    /**
     * Active l'écoute vocale
     */
    public startListening(): void {
        this.state.isListening = true;
        console.log('👂 [iDNSoul] Écoute active');
        this.notifyListeners();
    }

    /**
     * Désactive l'écoute vocale
     */
    public stopListening(): void {
        this.state.isListening = false;
        console.log('🔇 [iDNSoul] Écoute désactivée');
        this.notifyListeners();
    }

    /**
     * Commence à parler
     */
    public startSpeaking(): void {
        this.state.isSpeaking = true;
        this.notifyListeners();
    }

    /**
     * Arrête de parler
     */
    public stopSpeaking(): void {
        this.state.isSpeaking = false;
        this.notifyListeners();
    }

    /**
     * Indique un traitement en cours
     */
    public setProcessing(processing: boolean): void {
        this.state.isProcessing = processing;
        this.notifyListeners();
    }

    // ========== STATE ACCESS & SUBSCRIPTION ==========

    /**
     * Récupère l'état complet de l'âme
     */
    public getState(): Readonly<SoulState> {
        return { ...this.state };
    }

    /**
     * S'abonne aux changements d'état
     */
    public subscribe(listener: (state: SoulState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        const stateCopy = { ...this.state };
        this.listeners.forEach(listener => listener(stateCopy));
    }

    // ========== RESET ==========

    /**
     * Réinitialise la conscience (nouvelle session)
     */
    public reset(): void {
        this.state = this.createInitialState();
        console.log('🔄 [iDNSoul] Conscience réinitialisée');
        this.notifyListeners();
    }
}

// ============================================================
// EXPORT - L'instance unique de l'Âme
// ============================================================

export const iDNSoul = iDNSoulClass.getInstance();
export type { iDNSoulClass };
