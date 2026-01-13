/**
 * CONSCIOUSNESS - IntentProcessor
 * 
 * Le Processeur d'Intentions de l'agent iDN - "Le Lobe Frontal"
 * 
 * Ce module reçoit les intentions (voix, texte, clic) et décide:
 * - Quel Skill activer
 * - Comment répondre vocalement
 * - Quelle démarche administrative lancer
 */

import { iDNSoul, SoulState } from './iDNSoul';
import { ContextMemory } from './ContextMemory';
import { SocialProtocolAdapter } from './SocialProtocolAdapter';
import { IDNRole } from '@/Cortex/entities/IDNRole';

// ============================================================
// TYPES
// ============================================================

/** Source de l'intention */
export type IntentSource = 'voice' | 'text' | 'click' | 'context' | 'system';

/** Intention parsée */
export interface ParsedIntent {
    action: string;
    entities: Record<string, string>;
    confidence: number;
    rawInput: string;
    source: IntentSource;
}

/** Catégorie d'intention pour IDN.GA */
export type IntentCategory =
    | 'navigation'      // Aller à, ouvrir, fermer
    | 'identity'        // CNI, passeport, identité
    | 'documents'       // Actes, certificats
    | 'verification'    // Vérification, validation
    | 'information'     // Qu'est-ce que, comment, où
    | 'control'         // Stop, annuler, recommencer
    | 'greeting'        // Bonjour, au revoir
    | 'unknown';

/** Résultat du traitement */
export interface ProcessingResult {
    success: boolean;
    intent: ParsedIntent | null;
    category: IntentCategory;
    response: string;
    suggestedActions?: string[];
    procedureStarted?: string;
}

// ============================================================
// PATTERNS DE RECONNAISSANCE D'INTENTIONS IDN
// ============================================================

const INTENT_PATTERNS: Array<{
    category: IntentCategory;
    patterns: RegExp[];
    action: string;
}> = [
        // Navigation
        {
            category: 'navigation',
            patterns: [
                /(?:va|aller|emmène|amène|conduis)[\s-]*(moi\s+)?(?:à|vers|sur|au|aux)\s+(.+)/i,
                /ouvre?\s+(?:la\s+page\s+)?(.+)/i,
                /(?:retourne?|reviens?)\s+(?:en\s+)?arrière/i,
                /page\s+(.+)/i,
                /(?:montre|affiche)[\s-]*(moi)?\s+(.+)/i
            ],
            action: 'navigate'
        },

        // Identité (CNI, Passeport)
        {
            category: 'identity',
            patterns: [
                /(?:carte\s+)?(?:nationale\s+)?(?:d[''])?identité|cni/i,
                /passeport/i,
                /renouveler?\s+(?:ma\s+)?(?:cni|carte|passeport)/i,
                /(?:nouvelle?|demande?)\s+(?:cni|carte\s+d['']identité|passeport)/i,
                /(?:où\s+en\s+est|suivi|état)\s+(?:ma\s+)?demande/i,
                /perte?\s+(?:de\s+)?(?:cni|carte|passeport)/i
            ],
            action: 'identity_procedure'
        },

        // Documents (Actes, Certificats)
        {
            category: 'documents',
            patterns: [
                /acte\s+(?:de\s+)?(?:naissance|mariage|décès)/i,
                /certificat\s+(?:de\s+)?(?:résidence|nationalité|vie)/i,
                /justificatif\s+(?:de\s+)?domicile/i,
                /(?:obtenir|demander|avoir)\s+(?:un\s+)?(?:acte|certificat|document)/i,
                /livret\s+(?:de\s+)?famille/i,
                /extrait\s+(?:de\s+)?(?:naissance|acte)/i
            ],
            action: 'document_procedure'
        },

        // Vérification (pour contrôleurs)
        {
            category: 'verification',
            patterns: [
                /vérifier?\s+(?:l[''])?identité/i,
                /valider?\s+(?:le\s+)?document/i,
                /scanner?\s+(?:le\s+)?(?:code|qr|document)/i,
                /authentifier?\s+/i,
                /contrôler?\s+/i
            ],
            action: 'verify'
        },

        // Information
        {
            category: 'information',
            patterns: [
                /(?:qu['']?est[\s-]ce\s+que?|c['']?est\s+quoi)\s+(.+)/i,
                /(?:comment|où|quand|pourquoi|combien)\s+(.+)/i,
                /(?:explique?|dis[\s-]moi|parle[\s-]moi\s+de)\s+(.+)/i,
                /(?:cherche?|trouve?|recherche?)\s+(.+)/i,
                /(?:délai|durée|temps)\s+(?:pour|de)\s+(.+)/i,
                /(?:documents?|pièces?)\s+(?:requis|nécessaires|à\s+fournir)/i,
                /(?:horaires?|heures?\s+d['']ouverture)/i
            ],
            action: 'inform'
        },

        // Contrôle
        {
            category: 'control',
            patterns: [
                /(?:stop|arrête|tais[\s-]toi|silence)/i,
                /(?:annule?|cancel)/i,
                /(?:recommence?|reset|réinitialise?)/i,
                /(?:ferme?|quitte?|sort?)/i
            ],
            action: 'control'
        },

        // Greeting
        {
            category: 'greeting',
            patterns: [
                /(?:bonjour|salut|hello|hi|coucou|hey)/i,
                /(?:au\s*revoir|bye|à\s+bientôt|à\s+plus)/i,
                /(?:merci|thanks)/i
            ],
            action: 'greet'
        }
    ];

// ============================================================
// BASE DE CONNAISSANCES IDN
// ============================================================

const IDN_KNOWLEDGE_BASE: Record<string, {
    title: string;
    documents: string[];
    location: string;
    delay: string;
    cost: string;
}> = {
    cni: {
        title: 'Carte Nationale d\'Identité',
        documents: [
            'Acte de naissance',
            '2 photos d\'identité (4x4 cm)',
            'Justificatif de domicile',
            'Ancienne CNI ou déclaration de perte'
        ],
        location: 'Direction Générale de la Documentation et de l\'Immigration (DGDI)',
        delay: '2 à 4 semaines',
        cost: 'Gratuit (première demande) / 5,000 FCFA (renouvellement)'
    },
    passport: {
        title: 'Passeport',
        documents: [
            'CNI valide',
            'Acte de naissance',
            '2 photos d\'identité',
            'Justificatif de domicile',
            'Ancien passeport (si renouvellement)'
        ],
        location: 'DGDI - Service des Passeports',
        delay: '4 à 6 semaines',
        cost: 'Ordinaire: 50,000 FCFA / Biométrique: 100,000 FCFA'
    },
    birth_certificate: {
        title: 'Acte de Naissance',
        documents: [
            'Pièce d\'identité du demandeur',
            'Livret de famille (si disponible)',
            'Informations: nom, date/lieu de naissance'
        ],
        location: 'Mairie du lieu de naissance',
        delay: 'Immédiat à 1 semaine',
        cost: '500 à 2,000 FCFA'
    },
    residence_certificate: {
        title: 'Certificat de Résidence',
        documents: [
            'CNI',
            'Justificatif de domicile récent',
            'Facture d\'eau/électricité ou attestation de loyer'
        ],
        location: 'Mairie ou Préfecture de résidence',
        delay: 'Immédiat à 3 jours',
        cost: '1,000 à 3,000 FCFA'
    }
};

// ============================================================
// INTENT PROCESSOR CLASS
// ============================================================

class IntentProcessorClass {
    private static instance: IntentProcessorClass;
    private isProcessing: boolean = false;

    private constructor() {
        console.log('🧠 [IntentProcessor] Processeur d\'intentions IDN initialisé');
    }

    public static getInstance(): IntentProcessorClass {
        if (!IntentProcessorClass.instance) {
            IntentProcessorClass.instance = new IntentProcessorClass();
        }
        return IntentProcessorClass.instance;
    }

    // ========== TRAITEMENT PRINCIPAL ==========

    /**
     * Traite une intention (point d'entrée principal)
     */
    public async process(
        input: string,
        source: IntentSource = 'text'
    ): Promise<ProcessingResult> {
        // Vérifier que iDN est éveillé
        const soulState = iDNSoul.getState();
        if (!soulState.isAwake) {
            iDNSoul.awaken();
        }

        this.isProcessing = true;
        iDNSoul.setProcessing(true);

        console.log(`🧠 [IntentProcessor] Input: "${input}" (source: ${source})`);

        // Enregistrer dans la mémoire
        ContextMemory.addUserMessage(input);

        // Parser l'intention
        const intent = this.parseIntent(input, source);
        const category = this.categorizeIntent(intent);

        console.log(`🧠 [IntentProcessor] Intent: ${intent.action} (${category})`);

        let response: string;
        let suggestedActions: string[] | undefined;
        let procedureStarted: string | undefined;

        try {
            switch (category) {
                case 'navigation':
                    response = await this.handleNavigation(intent, soulState);
                    break;

                case 'identity':
                    const identityResult = await this.handleIdentityProcedure(intent, soulState);
                    response = identityResult.response;
                    suggestedActions = identityResult.suggestedActions;
                    procedureStarted = identityResult.procedure;
                    break;

                case 'documents':
                    const docResult = await this.handleDocumentProcedure(intent, soulState);
                    response = docResult.response;
                    suggestedActions = docResult.suggestedActions;
                    procedureStarted = docResult.procedure;
                    break;

                case 'verification':
                    response = await this.handleVerification(intent, soulState);
                    break;

                case 'information':
                    response = await this.handleInformation(intent);
                    break;

                case 'control':
                    response = await this.handleControl(intent);
                    break;

                case 'greeting':
                    response = this.handleGreeting(intent, soulState);
                    break;

                default:
                    response = this.handleUnknown(intent, soulState);
            }

            // Enregistrer la réponse
            ContextMemory.addAssistantMessage(response);

        } catch (error) {
            console.error('[IntentProcessor] Error:', error);
            response = SocialProtocolAdapter.adaptMessage(
                'Une erreur s\'est produite. Veuillez réessayer.',
                soulState.persona.role,
                'error'
            );
        } finally {
            this.isProcessing = false;
            iDNSoul.setProcessing(false);
        }

        return {
            success: true,
            intent,
            category,
            response,
            suggestedActions,
            procedureStarted
        };
    }

    // ========== PARSING ==========

    private parseIntent(input: string, source: IntentSource): ParsedIntent {
        const normalized = input.trim().toLowerCase();
        const entities: Record<string, string> = {};
        let action = 'unknown';
        let confidence = 0.5;

        for (const pattern of INTENT_PATTERNS) {
            for (const regex of pattern.patterns) {
                const match = normalized.match(regex);
                if (match) {
                    action = pattern.action;
                    confidence = 0.8;

                    // Extraire les entités des groupes de capture
                    if (match[1]) entities.target = match[1].trim();
                    if (match[2]) entities.secondary = match[2].trim();

                    break;
                }
            }
            if (action !== 'unknown') break;
        }

        // Vérifier le contexte pour améliorer la confiance
        const activeTopics = ContextMemory.getActiveTopics();
        if (activeTopics.length > 0 && action === 'unknown') {
            const lastAction = ContextMemory.getLastAction();
            if (lastAction) {
                action = 'continue';
                confidence = 0.6;
            }
        }

        return {
            action,
            entities,
            confidence,
            rawInput: input,
            source
        };
    }

    private categorizeIntent(intent: ParsedIntent): IntentCategory {
        for (const pattern of INTENT_PATTERNS) {
            if (pattern.action === intent.action) {
                return pattern.category;
            }
        }
        return 'unknown';
    }

    // ========== HANDLERS PAR CATÉGORIE ==========

    private async handleNavigation(intent: ParsedIntent, soulState: SoulState): Promise<string> {
        const target = intent.entities.target || intent.entities.secondary || '';

        // Logique de navigation simplifiée
        const navigationMap: Record<string, string> = {
            'accueil': '/',
            'dashboard': '/dashboard',
            'documents': '/idocument',
            'cartes': '/icarte',
            'coffre': '/icoffre',
            'boîte': '/iboite',
            'mail': '/iboite',
            'cv': '/icv',
            'paramètres': '/settings'
        };

        for (const [key, path] of Object.entries(navigationMap)) {
            if (target.includes(key)) {
                // Note: La navigation réelle sera gérée par le hook
                return SocialProtocolAdapter.adaptMessage(
                    `Je vous emmène vers ${key}.`,
                    soulState.persona.role,
                    'confirmation'
                );
            }
        }

        return `Je n'ai pas pu identifier la destination "${target}". Pouvez-vous préciser ?`;
    }

    private async handleIdentityProcedure(
        intent: ParsedIntent,
        soulState: SoulState
    ): Promise<{ response: string; suggestedActions?: string[]; procedure?: string }> {
        const rawInput = intent.rawInput.toLowerCase();
        let procedure = '';
        let knowledgeKey = '';

        if (rawInput.includes('cni') || rawInput.includes('carte') && rawInput.includes('identité')) {
            procedure = 'Carte Nationale d\'Identité';
            knowledgeKey = 'cni';
        } else if (rawInput.includes('passeport')) {
            procedure = 'Passeport';
            knowledgeKey = 'passport';
        }

        if (knowledgeKey && IDN_KNOWLEDGE_BASE[knowledgeKey]) {
            const info = IDN_KNOWLEDGE_BASE[knowledgeKey];
            iDNSoul.startProcedure(procedure);
            ContextMemory.trackTopic(procedure);

            const response = `📋 **${info.title}**

**Documents requis:**
${info.documents.map(d => `• ${d}`).join('\n')}

**Lieu:** ${info.location}
**Délai:** ${info.delay}
**Coût:** ${info.cost}

Souhaitez-vous que je vous guide étape par étape ?`;

            return {
                response,
                suggestedActions: ['Démarrer la procédure', 'Plus d\'informations', 'Trouver un bureau'],
                procedure
            };
        }

        return {
            response: 'Je peux vous aider avec votre CNI ou passeport. Quelle démarche souhaitez-vous effectuer ?',
            suggestedActions: ['Nouvelle CNI', 'Renouveler CNI', 'Nouveau passeport', 'Renouveler passeport']
        };
    }

    private async handleDocumentProcedure(
        intent: ParsedIntent,
        soulState: SoulState
    ): Promise<{ response: string; suggestedActions?: string[]; procedure?: string }> {
        const rawInput = intent.rawInput.toLowerCase();
        let knowledgeKey = '';
        let procedure = '';

        if (rawInput.includes('naissance') || rawInput.includes('extrait')) {
            knowledgeKey = 'birth_certificate';
            procedure = 'Acte de Naissance';
        } else if (rawInput.includes('résidence')) {
            knowledgeKey = 'residence_certificate';
            procedure = 'Certificat de Résidence';
        }

        if (knowledgeKey && IDN_KNOWLEDGE_BASE[knowledgeKey]) {
            const info = IDN_KNOWLEDGE_BASE[knowledgeKey];
            iDNSoul.startProcedure(procedure);
            ContextMemory.trackTopic(procedure);

            const response = `📋 **${info.title}**

**Documents requis:**
${info.documents.map(d => `• ${d}`).join('\n')}

**Lieu:** ${info.location}
**Délai:** ${info.delay}
**Coût:** ${info.cost}

Voulez-vous plus de détails sur cette démarche ?`;

            return {
                response,
                suggestedActions: ['Démarrer la demande', 'Trouver la mairie', 'Horaires d\'ouverture'],
                procedure
            };
        }

        return {
            response: 'Je peux vous aider avec différents documents administratifs. Lequel vous intéresse ?',
            suggestedActions: ['Acte de naissance', 'Certificat de résidence', 'Acte de mariage', 'Livret de famille']
        };
    }

    private async handleVerification(intent: ParsedIntent, soulState: SoulState): Promise<string> {
        // Pour les contrôleurs d'identité
        if (soulState.persona.role === IDNRole.CONTROLEUR_IDENTITE ||
            soulState.persona.role === IDNRole.AGENT_DGDI ||
            soulState.persona.role === IDNRole.VERIFICATEUR_BIOMETRIQUE) {
            return 'Mode vérification activé. Présentez le document ou scannez le code QR.';
        }
        return 'La fonction de vérification est réservée aux contrôleurs d\'identité.';
    }

    private async handleInformation(intent: ParsedIntent): Promise<string> {
        const rawInput = intent.rawInput.toLowerCase();

        // Recherche dans la base de connaissances
        for (const [key, info] of Object.entries(IDN_KNOWLEDGE_BASE)) {
            if (rawInput.includes(key) || rawInput.includes(info.title.toLowerCase())) {
                return `**${info.title}**\n\nDélai: ${info.delay}\nCoût: ${info.cost}\nLieu: ${info.location}`;
            }
        }

        // Réponses génériques
        if (rawInput.includes('horaire')) {
            return 'Les services administratifs sont généralement ouverts de 7h30 à 15h30, du lundi au vendredi.';
        }

        if (rawInput.includes('délai') || rawInput.includes('durée')) {
            return 'Les délais varient selon le document. CNI: 2-4 semaines, Passeport: 4-6 semaines, Actes: immédiat à 1 semaine.';
        }

        return 'Je n\'ai pas trouvé d\'information précise. Pouvez-vous reformuler votre question ?';
    }

    private async handleControl(intent: ParsedIntent): Promise<string> {
        const rawInput = intent.rawInput.toLowerCase();

        if (rawInput.includes('stop') || rawInput.includes('arrête')) {
            iDNSoul.sleep();
            return 'À bientôt !';
        }

        if (rawInput.includes('annule')) {
            iDNSoul.completeProcedure();
            return 'Action annulée.';
        }

        if (rawInput.includes('recommence') || rawInput.includes('reset')) {
            ContextMemory.reset();
            return 'Conversation réinitialisée. Comment puis-je vous aider ?';
        }

        return 'Commande de contrôle non reconnue.';
    }

    private handleGreeting(intent: ParsedIntent, soulState: SoulState): string {
        const rawInput = intent.rawInput.toLowerCase();

        if (rawInput.includes('merci')) {
            return SocialProtocolAdapter.adaptMessage(
                'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.',
                soulState.persona.role,
                'confirmation'
            );
        }

        if (rawInput.includes('revoir') || rawInput.includes('bye')) {
            return SocialProtocolAdapter.generateClosing(soulState.persona.role);
        }

        // Salutation
        return iDNSoul.generateGreeting();
    }

    private handleUnknown(intent: ParsedIntent, soulState: SoulState): string {
        const suggestions = [
            'Demander une CNI ou passeport',
            'Obtenir un acte de naissance',
            'Comprendre une démarche',
            'Suivre mon dossier'
        ];

        return `Je n'ai pas bien compris "${intent.rawInput}". Voici ce que je peux faire:\n\n${suggestions.map(s => `• ${s}`).join('\n')}`;
    }

    // ========== UTILITIES ==========

    public isCurrentlyProcessing(): boolean {
        return this.isProcessing;
    }
}

// ============================================================
// EXPORT
// ============================================================

export const IntentProcessor = IntentProcessorClass.getInstance();
