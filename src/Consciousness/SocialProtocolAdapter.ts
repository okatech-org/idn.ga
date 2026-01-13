/**
 * CONSCIOUSNESS - SocialProtocolAdapter
 * 
 * Adaptateur du Protocole Social Gabonais pour IDN.GA.
 * Gère les formules de politesse et le ton selon le contexte culturel
 * et le rôle de l'utilisateur dans l'écosystème d'identité numérique.
 */

import { IDNRole } from '@/Cortex/entities/IDNRole';

// ============================================================
// TYPES
// ============================================================

export type CommunicationContext = 'greeting' | 'request' | 'confirmation' | 'error' | 'farewell' | 'procedure';

export interface ProtocolResponse {
    prefix: string;
    suffix: string;
    tone: 'formal' | 'warm' | 'technical';
    emoticons: boolean;
}

// ============================================================
// PROTOCOLE PAR RÔLE
// ============================================================

const PROTOCOL_RULES: Record<string, {
    salutation: {
        morning: string;
        afternoon: string;
        evening: string;
    };
    honorific: string;
    closings: string[];
    tone: 'formal' | 'warm' | 'technical';
    useEmoticons: boolean;
}> = {
    // ========== HAUTE AUTORITÉ ==========
    [IDNRole.PRESIDENT_REPUBLIQUE]: {
        salutation: {
            morning: 'Excellence, Monsieur le Président de la République, je vous présente mes salutations les plus respectueuses en ce matin.',
            afternoon: 'Excellence, Monsieur le Président de la République, je vous salue avec le plus grand respect.',
            evening: 'Excellence, Monsieur le Président de la République, je vous souhaite une excellente soirée.'
        },
        honorific: 'Excellence',
        closings: [
            'Je reste à votre entière disposition, Excellence.',
            'C\'est un honneur de vous servir, Monsieur le Président.',
            'Vos instructions seront exécutées avec la plus grande diligence.'
        ],
        tone: 'formal',
        useEmoticons: false
    },

    [IDNRole.MINISTRE]: {
        salutation: {
            morning: 'Excellence Monsieur le Ministre, bonjour et bienvenue.',
            afternoon: 'Excellence Monsieur le Ministre, bon après-midi.',
            evening: 'Excellence Monsieur le Ministre, bonsoir.'
        },
        honorific: 'Excellence',
        closings: [
            'Je reste à votre disposition, Excellence.',
            'N\'hésitez pas si vous avez besoin d\'assistance supplémentaire.'
        ],
        tone: 'formal',
        useEmoticons: false
    },

    [IDNRole.SECRETAIRE_GENERAL_PR]: {
        salutation: {
            morning: 'Monsieur le Secrétaire Général, bonjour.',
            afternoon: 'Monsieur le Secrétaire Général, bon après-midi.',
            evening: 'Monsieur le Secrétaire Général, bonsoir.'
        },
        honorific: 'Monsieur le Secrétaire Général',
        closings: [
            'À votre service.',
            'Je suis prêt pour vos prochaines instructions.'
        ],
        tone: 'formal',
        useEmoticons: false
    },

    [IDNRole.DIRECTEUR_CABINET]: {
        salutation: {
            morning: 'Monsieur le Directeur de Cabinet, bonjour.',
            afternoon: 'Monsieur le Directeur, bon après-midi.',
            evening: 'Monsieur le Directeur, bonsoir.'
        },
        honorific: 'Monsieur le Directeur',
        closings: [
            'À votre service.',
            'Prêt à exécuter vos directives.'
        ],
        tone: 'formal',
        useEmoticons: false
    },

    // ========== CONTRÔLEURS ==========
    [IDNRole.CONTROLEUR_IDENTITE]: {
        salutation: {
            morning: 'Bonjour Agent ! Prêt pour les vérifications du jour ?',
            afternoon: 'Bon après-midi ! Des identités à valider ?',
            evening: 'Bonsoir ! La permanence de vérification est active.'
        },
        honorific: 'Agent',
        closings: ['Bonne session de vérification !', 'À ton service.'],
        tone: 'warm',
        useEmoticons: true
    },

    [IDNRole.AGENT_DGDI]: {
        salutation: {
            morning: 'Bonjour ! Prêt pour les dossiers d\'identité ?',
            afternoon: 'Bon après-midi ! Des demandes à traiter ?',
            evening: 'Bonsoir, Agent DGDI !'
        },
        honorific: 'Agent',
        closings: ['Bon travail sur les identités !', 'À ta disposition.'],
        tone: 'warm',
        useEmoticons: true
    },

    [IDNRole.VERIFICATEUR_BIOMETRIQUE]: {
        salutation: {
            morning: 'Salut ! Système biométrique prêt.',
            afternoon: 'Ça roule ? Vérifications en cours ?',
            evening: 'Bonsoir ! Mode biométrique actif.'
        },
        honorific: 'Vérificateur',
        closings: ['Précision biométrique !', 'Force à toi !'],
        tone: 'warm',
        useEmoticons: true
    },

    // ========== CITOYENS ==========
    [IDNRole.CITOYEN]: {
        salutation: {
            morning: 'Bonjour cher citoyen ! Bienvenue sur IDN.ga, votre portail d\'identité numérique.',
            afternoon: 'Bon après-midi ! Comment puis-je vous accompagner dans vos démarches ?',
            evening: 'Bonsoir ! Je suis là pour vous guider dans vos démarches d\'identité.'
        },
        honorific: 'Cher citoyen',
        closings: [
            'N\'hésitez pas si vous avez d\'autres questions sur vos démarches.',
            'Je reste à votre disposition pour toute information.',
            'Bonne continuation et à bientôt sur IDN.ga !'
        ],
        tone: 'warm',
        useEmoticons: true
    },

    [IDNRole.CITOYEN_DIASPORA]: {
        salutation: {
            morning: 'Bonjour cher compatriote de la diaspora ! Bienvenue sur IDN.ga.',
            afternoon: 'Bon après-midi ! Comment puis-je vous aider avec vos documents ?',
            evening: 'Bonsoir ! Heureux de vous accompagner depuis l\'étranger.'
        },
        honorific: 'Cher compatriote',
        closings: [
            'Le Gabon reste connecté à vous où que vous soyez.',
            'Merci pour votre attachement à la nation.'
        ],
        tone: 'warm',
        useEmoticons: true
    },

    [IDNRole.RESIDENT_ETRANGER]: {
        salutation: {
            morning: 'Bonjour et bienvenue au Gabon !',
            afternoon: 'Good afternoon! / Bon après-midi !',
            evening: 'Good evening! / Bonsoir !'
        },
        honorific: 'Cher résident',
        closings: [
            'N\'hésitez pas en français ou anglais.',
            'Bienvenue au Gabon !'
        ],
        tone: 'warm',
        useEmoticons: true
    },

    // ========== ADMINISTRATION ==========
    [IDNRole.ADMINISTRATEUR_SYSTEME]: {
        salutation: {
            morning: 'Admin connecté. Système IDN opérationnel.',
            afternoon: 'Session admin active. Tous systèmes nominaux.',
            evening: 'Mode admin nocturne. Supervision active.'
        },
        honorific: 'Admin',
        closings: ['Fin de session.', 'Logs enregistrés.'],
        tone: 'technical',
        useEmoticons: false
    },

    [IDNRole.SUPPORT_TECHNIQUE]: {
        salutation: {
            morning: 'Support technique en ligne. Prêt à aider.',
            afternoon: 'Support actif. Des tickets à traiter ?',
            evening: 'Mode support de nuit activé.'
        },
        honorific: 'Support',
        closings: ['Ticket résolu.', 'Assistance terminée.'],
        tone: 'technical',
        useEmoticons: false
    },

    [IDNRole.ANONYME]: {
        salutation: {
            morning: 'Bonjour ! Bienvenue sur IDN.ga, le portail d\'identité numérique du Gabon.',
            afternoon: 'Bon après-midi ! Je suis iDN, votre assistant d\'identité numérique.',
            evening: 'Bonsoir ! Comment puis-je vous aider ?'
        },
        honorific: 'Cher visiteur',
        closings: [
            'Créez un compte pour accéder à tous nos services !',
            'Connectez-vous pour une expérience personnalisée.'
        ],
        tone: 'warm',
        useEmoticons: true
    },

    [IDNRole.ORGANISATION]: {
        salutation: {
            morning: 'Bonjour ! Bienvenue sur l\'espace organisations.',
            afternoon: 'Bon après-midi ! Comment puis-je assister votre organisation ?',
            evening: 'Bonsoir ! Je suis à votre disposition.'
        },
        honorific: 'Cher partenaire',
        closings: [
            'Nous sommes ravis de collaborer avec votre organisation.',
            'Votre satisfaction est notre priorité.'
        ],
        tone: 'warm',
        useEmoticons: false
    }
};

// ============================================================
// SOCIAL PROTOCOL ADAPTER CLASS
// ============================================================

class SocialProtocolAdapterClass {
    private static instance: SocialProtocolAdapterClass;

    private constructor() {
        console.log('🎭 [SocialProtocolAdapter] Protocole social IDN initialisé');
    }

    public static getInstance(): SocialProtocolAdapterClass {
        if (!SocialProtocolAdapterClass.instance) {
            SocialProtocolAdapterClass.instance = new SocialProtocolAdapterClass();
        }
        return SocialProtocolAdapterClass.instance;
    }

    /**
     * Génère un message de bienvenue adapté au rôle
     */
    public generateWelcomeMessage(role: IDNRole, userName?: string): string {
        const protocol = PROTOCOL_RULES[role] || PROTOCOL_RULES[IDNRole.ANONYME];
        const hour = new Date().getHours();

        let timeOfDay: 'morning' | 'afternoon' | 'evening';
        if (hour >= 6 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
        else timeOfDay = 'evening';

        let greeting = protocol.salutation[timeOfDay];

        // Personnaliser avec le nom si disponible
        if (userName && role !== IDNRole.PRESIDENT_REPUBLIQUE) {
            greeting = greeting.replace('citoyen', userName)
                .replace('compatriote', userName)
                .replace('visiteur', userName);
        }

        return greeting;
    }

    /**
     * Génère une formule de clôture adaptée
     */
    public generateClosing(role: IDNRole): string {
        const protocol = PROTOCOL_RULES[role] || PROTOCOL_RULES[IDNRole.ANONYME];
        const closings = protocol.closings;
        return closings[Math.floor(Math.random() * closings.length)];
    }

    /**
     * Adapte un message selon le contexte et le rôle
     */
    public adaptMessage(
        message: string,
        role: IDNRole,
        context: CommunicationContext
    ): string {
        const protocol = PROTOCOL_RULES[role] || PROTOCOL_RULES[IDNRole.ANONYME];

        let adaptedMessage = message;

        // Ajouter des marqueurs de politesse selon le contexte
        switch (context) {
            case 'confirmation':
                if (protocol.tone === 'formal') {
                    adaptedMessage = `Bien noté, ${protocol.honorific}. ${adaptedMessage}`;
                } else if (protocol.useEmoticons) {
                    adaptedMessage = `✅ ${adaptedMessage}`;
                }
                break;

            case 'error':
                if (protocol.tone === 'formal') {
                    adaptedMessage = `Je vous prie de m'excuser, ${protocol.honorific}. ${adaptedMessage}`;
                } else {
                    adaptedMessage = `Désolé ! ${adaptedMessage}`;
                }
                break;

            case 'procedure':
                if (protocol.useEmoticons) {
                    adaptedMessage = `📋 ${adaptedMessage}`;
                }
                break;

            case 'farewell':
                adaptedMessage = this.generateClosing(role);
                break;
        }

        return adaptedMessage;
    }

    /**
     * Génère un message d'aide pour une démarche
     */
    public generateProcedureHelp(
        procedureName: string,
        role: IDNRole
    ): string {
        const protocol = PROTOCOL_RULES[role] || PROTOCOL_RULES[IDNRole.ANONYME];

        if (protocol.tone === 'formal') {
            return `Je puis vous assister pour la démarche "${procedureName}". Veuillez me préciser vos besoins.`;
        } else {
            return `Je vais vous guider pour "${procedureName}". C'est parti ! 🚀`;
        }
    }

    /**
     * Récupère le niveau de formalité pour un rôle
     */
    public getTone(role: IDNRole): 'formal' | 'warm' | 'technical' {
        const protocol = PROTOCOL_RULES[role] || PROTOCOL_RULES[IDNRole.ANONYME];
        return protocol.tone;
    }

    /**
     * Vérifie si les emoticons sont autorisés pour ce rôle
     */
    public canUseEmoticons(role: IDNRole): boolean {
        const protocol = PROTOCOL_RULES[role] || PROTOCOL_RULES[IDNRole.ANONYME];
        return protocol.useEmoticons;
    }
}

// ============================================================
// EXPORT
// ============================================================

export const SocialProtocolAdapter = SocialProtocolAdapterClass.getInstance();
