/**
 * CONSCIOUSNESS - ContextMemory
 * 
 * Mémoire Conversationnelle de l'agent iDN.
 * Gère l'historique des conversations, les sujets actifs et les références contextuelles.
 */

// ============================================================
// TYPES
// ============================================================

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    intent?: string;
    entities?: Record<string, string>;
}

export interface ConversationTopic {
    name: string;
    startedAt: Date;
    lastMentioned: Date;
    messageCount: number;
    resolved: boolean;
}

export interface ContextualReference {
    type: 'document' | 'procedure' | 'person' | 'location' | 'date';
    value: string;
    mentionedAt: Date;
}

export interface TrackedAction {
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt: Date;
    completedAt?: Date;
    result?: string;
}

export interface MemoryState {
    messages: ConversationMessage[];
    topics: ConversationTopic[];
    references: ContextualReference[];
    actions: TrackedAction[];
    sessionStartedAt: Date;
    lastActivity: Date;
}

// ============================================================
// CONTEXT MEMORY CLASS
// ============================================================

class ContextMemoryClass {
    private static instance: ContextMemoryClass;
    private state: MemoryState;
    private maxMessages = 50; // Limite pour éviter la surcharge mémoire

    private constructor() {
        this.state = this.createInitialState();
        console.log('🧠 [ContextMemory] Mémoire conversationnelle initialisée');
    }

    public static getInstance(): ContextMemoryClass {
        if (!ContextMemoryClass.instance) {
            ContextMemoryClass.instance = new ContextMemoryClass();
        }
        return ContextMemoryClass.instance;
    }

    // ========== INITIALISATION ==========

    private createInitialState(): MemoryState {
        return {
            messages: [],
            topics: [],
            references: [],
            actions: [],
            sessionStartedAt: new Date(),
            lastActivity: new Date()
        };
    }

    // ========== MESSAGE MANAGEMENT ==========

    /**
     * Ajoute un message utilisateur à la mémoire
     */
    public addUserMessage(content: string, intent?: string, entities?: Record<string, string>): void {
        this.addMessage({
            id: this.generateId(),
            role: 'user',
            content,
            timestamp: new Date(),
            intent,
            entities
        });
    }

    /**
     * Ajoute un message assistant à la mémoire
     */
    public addAssistantMessage(content: string): void {
        this.addMessage({
            id: this.generateId(),
            role: 'assistant',
            content,
            timestamp: new Date()
        });
    }

    /**
     * Ajoute un message système à la mémoire
     */
    public addSystemMessage(content: string): void {
        this.addMessage({
            id: this.generateId(),
            role: 'system',
            content,
            timestamp: new Date()
        });
    }

    private addMessage(message: ConversationMessage): void {
        this.state.messages.push(message);
        this.state.lastActivity = new Date();

        // Limiter la taille de l'historique
        if (this.state.messages.length > this.maxMessages) {
            this.state.messages = this.state.messages.slice(-this.maxMessages);
        }

        console.log(`💬 [ContextMemory] Message ajouté (${message.role}): ${message.content.substring(0, 50)}...`);
    }

    /**
     * Récupère les N derniers messages
     */
    public getRecentMessages(count: number = 10): ConversationMessage[] {
        return this.state.messages.slice(-count);
    }

    /**
     * Récupère tous les messages de la session
     */
    public getAllMessages(): ConversationMessage[] {
        return [...this.state.messages];
    }

    // ========== TOPIC MANAGEMENT ==========

    /**
     * Ajoute ou met à jour un sujet de conversation
     */
    public trackTopic(topicName: string): void {
        const existingTopic = this.state.topics.find(t => t.name === topicName);

        if (existingTopic) {
            existingTopic.lastMentioned = new Date();
            existingTopic.messageCount++;
        } else {
            this.state.topics.push({
                name: topicName,
                startedAt: new Date(),
                lastMentioned: new Date(),
                messageCount: 1,
                resolved: false
            });
        }

        console.log(`📌 [ContextMemory] Topic suivi: ${topicName}`);
    }

    /**
     * Marque un sujet comme résolu
     */
    public resolveTopic(topicName: string): void {
        const topic = this.state.topics.find(t => t.name === topicName);
        if (topic) {
            topic.resolved = true;
            console.log(`✅ [ContextMemory] Topic résolu: ${topicName}`);
        }
    }

    /**
     * Récupère les sujets actifs (non résolus)
     */
    public getActiveTopics(): ConversationTopic[] {
        return this.state.topics.filter(t => !t.resolved);
    }

    // ========== REFERENCE TRACKING ==========

    /**
     * Ajoute une référence contextuelle
     */
    public addReference(type: ContextualReference['type'], value: string): void {
        this.state.references.push({
            type,
            value,
            mentionedAt: new Date()
        });
        console.log(`🔗 [ContextMemory] Référence ajoutée: ${type} = ${value}`);
    }

    /**
     * Récupère les références d'un type donné
     */
    public getReferences(type: ContextualReference['type']): ContextualReference[] {
        return this.state.references.filter(r => r.type === type);
    }

    /**
     * Récupère la dernière référence d'un type donné
     */
    public getLastReference(type: ContextualReference['type']): ContextualReference | null {
        const refs = this.getReferences(type);
        return refs.length > 0 ? refs[refs.length - 1] : null;
    }

    // ========== ACTION TRACKING ==========

    /**
     * Démarre le suivi d'une action
     */
    public startAction(actionName: string): void {
        this.state.actions.push({
            name: actionName,
            status: 'in_progress',
            startedAt: new Date()
        });
        console.log(`🚀 [ContextMemory] Action démarrée: ${actionName}`);
    }

    /**
     * Marque une action comme complétée
     */
    public completeAction(actionName: string, result?: string): void {
        const action = this.state.actions.find(a => a.name === actionName && a.status === 'in_progress');
        if (action) {
            action.status = 'completed';
            action.completedAt = new Date();
            action.result = result;
            console.log(`✅ [ContextMemory] Action complétée: ${actionName}`);
        }
    }

    /**
     * Marque une action comme échouée
     */
    public failAction(actionName: string, reason?: string): void {
        const action = this.state.actions.find(a => a.name === actionName && a.status === 'in_progress');
        if (action) {
            action.status = 'failed';
            action.completedAt = new Date();
            action.result = reason;
            console.log(`❌ [ContextMemory] Action échouée: ${actionName}`);
        }
    }

    /**
     * Récupère la dernière action
     */
    public getLastAction(): TrackedAction | null {
        return this.state.actions.length > 0 ? this.state.actions[this.state.actions.length - 1] : null;
    }

    /**
     * Récupère les actions en cours
     */
    public getPendingActions(): TrackedAction[] {
        return this.state.actions.filter(a => a.status === 'in_progress' || a.status === 'pending');
    }

    // ========== CONTEXT SUMMARY ==========

    /**
     * Génère un résumé du contexte pour l'IA
     */
    public getContextSummary(): string {
        const activeTopics = this.getActiveTopics();
        const pendingActions = this.getPendingActions();
        const recentMessages = this.getRecentMessages(5);
        const recentRefs = this.state.references.slice(-5);

        let summary = '';

        if (activeTopics.length > 0) {
            summary += `Sujets actifs: ${activeTopics.map(t => t.name).join(', ')}. `;
        }

        if (pendingActions.length > 0) {
            summary += `Actions en cours: ${pendingActions.map(a => a.name).join(', ')}. `;
        }

        if (recentRefs.length > 0) {
            const refSummary = recentRefs.map(r => `${r.type}: ${r.value}`).join(', ');
            summary += `Références récentes: ${refSummary}. `;
        }

        if (recentMessages.length > 0) {
            summary += `Derniers échanges: ${recentMessages.length} messages.`;
        }

        return summary || 'Nouvelle conversation.';
    }

    // ========== UTILITIES ==========

    private generateId(): string {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Récupère l'état complet de la mémoire
     */
    public getState(): Readonly<MemoryState> {
        return { ...this.state };
    }

    /**
     * Réinitialise la mémoire (nouvelle session)
     */
    public reset(): void {
        this.state = this.createInitialState();
        console.log('🔄 [ContextMemory] Mémoire réinitialisée');
    }

    /**
     * Durée de la session courante en minutes
     */
    public getSessionDuration(): number {
        return Math.floor((new Date().getTime() - this.state.sessionStartedAt.getTime()) / 60000);
    }
}

// ============================================================
// EXPORT
// ============================================================

export const ContextMemory = ContextMemoryClass.getInstance();
