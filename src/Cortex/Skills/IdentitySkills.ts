/**
 * CORTEX - SKILLS: IdentitySkills
 * 
 * Compétences cognitives pour les démarches d'identité.
 * Ces skills gèrent les procédures liées à l'identité numérique:
 * - CNI (Carte Nationale d'Identité)
 * - Passeport
 * - Suivi de demandes
 * - Informations sur les démarches
 */

import { iDNSoul, SoulState } from '@/Consciousness';
import { SkillActivationSignal, SkillResult } from './NavigationSkills';

// ============================================================
// TYPES
// ============================================================

export interface IdentityDocumentType {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    description: string;
}

export interface ProcedureInfo {
    id: string;
    type: 'new' | 'renewal' | 'duplicate' | 'modification';
    documentType: string;
    documents: string[];
    steps: string[];
    location: string;
    delay: string;
    cost: string;
    notes?: string[];
}

export interface RequestStatus {
    id: string;
    type: string;
    status: 'pending' | 'processing' | 'ready' | 'delivered' | 'rejected';
    statusLabel: string;
    submittedAt: Date;
    estimatedCompletion: Date;
    currentStep: number;
    totalSteps: number;
}

// ============================================================
// DOCUMENT TYPES
// ============================================================

const IDENTITY_DOCUMENTS: IdentityDocumentType[] = [
    {
        id: 'cni',
        name: 'Carte Nationale d\'Identité',
        shortName: 'CNI',
        icon: '🪪',
        description: 'Document d\'identité officiel obligatoire pour tout citoyen gabonais'
    },
    {
        id: 'passport',
        name: 'Passeport',
        shortName: 'Passeport',
        icon: '📕',
        description: 'Document de voyage international'
    },
    {
        id: 'birth_certificate',
        name: 'Acte de Naissance',
        shortName: 'Acte de naissance',
        icon: '📜',
        description: 'Document d\'état civil attestant de la naissance'
    },
    {
        id: 'residence_certificate',
        name: 'Certificat de Résidence',
        shortName: 'Certificat résidence',
        icon: '🏠',
        description: 'Justificatif de domicile officiel'
    },
    {
        id: 'nationality_certificate',
        name: 'Certificat de Nationalité',
        shortName: 'Certificat nationalité',
        icon: '🇬🇦',
        description: 'Attestation de la nationalité gabonaise'
    },
    {
        id: 'family_booklet',
        name: 'Livret de Famille',
        shortName: 'Livret famille',
        icon: '📖',
        description: 'Document regroupant l\'état civil de la famille'
    }
];

// ============================================================
// PROCEDURE DATABASE
// ============================================================

const PROCEDURES_DATABASE: Record<string, ProcedureInfo[]> = {
    cni: [
        {
            id: 'cni-new',
            type: 'new',
            documentType: 'cni',
            documents: [
                'Acte de naissance (original + copie)',
                '4 photos d\'identité (format 4x4 cm)',
                'Justificatif de domicile récent',
                'Certificat de nationalité gabonaise'
            ],
            steps: [
                'Constitution du dossier',
                'Dépôt à la DGDI (Direction Générale de la Documentation et de l\'Immigration)',
                'Prise d\'empreintes et photo biométrique',
                'Paiement des frais (si applicable)',
                'Retrait après notification'
            ],
            location: 'DGDI - Direction Générale de la Documentation et de l\'Immigration',
            delay: '2 à 4 semaines',
            cost: 'Gratuit (première demande)',
            notes: [
                'Présence obligatoire du demandeur',
                'Mineurs : présence d\'un parent avec sa CNI'
            ]
        },
        {
            id: 'cni-renewal',
            type: 'renewal',
            documentType: 'cni',
            documents: [
                'Ancienne CNI (ou déclaration de perte)',
                '4 photos d\'identité (format 4x4 cm)',
                'Justificatif de domicile récent'
            ],
            steps: [
                'Constitution du dossier',
                'Dépôt à la DGDI',
                'Prise de nouvelles empreintes',
                'Paiement des frais',
                'Retrait après notification'
            ],
            location: 'DGDI - Direction Générale de la Documentation et de l\'Immigration',
            delay: '2 à 4 semaines',
            cost: '5,000 FCFA'
        },
        {
            id: 'cni-lost',
            type: 'duplicate',
            documentType: 'cni',
            documents: [
                'Déclaration de perte (commissariat)',
                'Acte de naissance',
                '4 photos d\'identité',
                'Justificatif de domicile'
            ],
            steps: [
                'Déclaration de perte au commissariat',
                'Obtention du récépissé de déclaration',
                'Constitution du nouveau dossier',
                'Dépôt à la DGDI',
                'Retrait après notification'
            ],
            location: 'Commissariat + DGDI',
            delay: '3 à 5 semaines',
            cost: '10,000 FCFA',
            notes: [
                'La déclaration de perte est obligatoire',
                'Ancien numéro de CNI si connu'
            ]
        }
    ],
    passport: [
        {
            id: 'passport-new',
            type: 'new',
            documentType: 'passport',
            documents: [
                'CNI valide',
                'Acte de naissance (original + copie)',
                '4 photos d\'identité (format passeport)',
                'Justificatif de domicile récent',
                'Certificat de nationalité (si première demande)'
            ],
            steps: [
                'Constitution du dossier complet',
                'Prise de rendez-vous en ligne ou sur place',
                'Dépôt du dossier à la DGDI',
                'Prise d\'empreintes et photo biométrique',
                'Paiement des frais',
                'Retrait après notification (SMS/email)'
            ],
            location: 'DGDI - Service des Passeports',
            delay: '4 à 6 semaines',
            cost: 'Ordinaire: 50,000 FCFA / Biométrique: 100,000 FCFA'
        },
        {
            id: 'passport-renewal',
            type: 'renewal',
            documentType: 'passport',
            documents: [
                'Ancien passeport',
                'CNI valide',
                '4 photos d\'identité (format passeport)',
                'Justificatif de domicile récent'
            ],
            steps: [
                'Constitution du dossier',
                'Prise de rendez-vous',
                'Dépôt du dossier',
                'Paiement des frais',
                'Retrait après notification'
            ],
            location: 'DGDI - Service des Passeports',
            delay: '4 à 6 semaines',
            cost: 'Ordinaire: 50,000 FCFA / Biométrique: 100,000 FCFA'
        }
    ],
    birth_certificate: [
        {
            id: 'birth-cert-copy',
            type: 'duplicate',
            documentType: 'birth_certificate',
            documents: [
                'Pièce d\'identité du demandeur',
                'Livret de famille (si disponible)',
                'Informations: nom complet, date et lieu de naissance'
            ],
            steps: [
                'Se rendre à la mairie du lieu de naissance',
                'Remplir le formulaire de demande',
                'Paiement des frais de timbre',
                'Retrait immédiat ou différé'
            ],
            location: 'Mairie du lieu de naissance',
            delay: 'Immédiat à 1 semaine',
            cost: '500 à 2,000 FCFA'
        }
    ],
    residence_certificate: [
        {
            id: 'residence-cert',
            type: 'new',
            documentType: 'residence_certificate',
            documents: [
                'CNI',
                'Justificatif de domicile récent (facture eau/électricité)',
                'Attestation de loyer ou titre de propriété'
            ],
            steps: [
                'Se rendre à la mairie ou préfecture',
                'Présenter les documents',
                'Remplir le formulaire',
                'Paiement des frais',
                'Retrait'
            ],
            location: 'Mairie ou Préfecture de résidence',
            delay: 'Immédiat à 3 jours',
            cost: '1,000 à 3,000 FCFA'
        }
    ]
};

// ============================================================
// BASE SKILL CLASS
// ============================================================

abstract class BaseSkill {
    protected soulState: SoulState | null = null;

    protected validateActivation(signal: SkillActivationSignal): boolean {
        if (!signal.soulState.isAwake) {
            console.warn(`⚠️ [${signal.skillName}] Rejeté: iDN n'est pas éveillé`);
            return false;
        }
        this.soulState = signal.soulState;
        console.log(`🔓 [${signal.skillName}] Activé par ${signal.activatedBy}`);
        return true;
    }

    protected createSignal(skillName: string): SkillActivationSignal {
        return {
            skillName,
            activatedBy: 'system',
            soulState: iDNSoul.getState(),
            timestamp: new Date(),
            priority: 'normal'
        };
    }
}

// ============================================================
// IDENTITY SKILLS
// ============================================================

class IdentitySkillsClass extends BaseSkill {
    private static instance: IdentitySkillsClass;

    private constructor() {
        super();
        console.log('🪪 [IdentitySkills] Compétences d\'identité iDN chargées');
    }

    public static getInstance(): IdentitySkillsClass {
        if (!IdentitySkillsClass.instance) {
            IdentitySkillsClass.instance = new IdentitySkillsClass();
        }
        return IdentitySkillsClass.instance;
    }

    // ========== INFORMATIONS ==========

    /**
     * Récupère les types de documents disponibles
     */
    public getDocumentTypes(): IdentityDocumentType[] {
        return [...IDENTITY_DOCUMENTS];
    }

    /**
     * Récupère les informations sur un type de document
     */
    public getDocumentInfo(documentType: string): IdentityDocumentType | null {
        return IDENTITY_DOCUMENTS.find(doc => doc.id === documentType) || null;
    }

    /**
     * Récupère les procédures pour un type de document
     */
    public getProcedures(documentType: string): ProcedureInfo[] {
        return PROCEDURES_DATABASE[documentType] || [];
    }

    /**
     * Récupère une procédure spécifique
     */
    public getProcedure(procedureId: string): ProcedureInfo | null {
        for (const procedures of Object.values(PROCEDURES_DATABASE)) {
            const found = procedures.find(p => p.id === procedureId);
            if (found) return found;
        }
        return null;
    }

    // ========== ASSISTANCE ==========

    /**
     * Explique une démarche d'identité
     */
    public async explainProcedure(
        documentType: string,
        procedureType: 'new' | 'renewal' | 'duplicate' | 'modification' = 'new',
        signal?: SkillActivationSignal
    ): Promise<SkillResult<{ formatted: string; procedure: ProcedureInfo | null }>> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('ExplainProcedure');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'ExplainProcedure',
                error: 'Non autorisé',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        const procedures = this.getProcedures(documentType);
        const procedure = procedures.find(p => p.type === procedureType);

        if (!procedure) {
            return {
                success: false,
                skillName: 'ExplainProcedure',
                error: `Procédure ${procedureType} non trouvée pour ${documentType}`,
                executionTime: Date.now() - startTime,
                vocalFeedback: `Je n'ai pas d'informations sur cette procédure.`
            };
        }

        const docInfo = this.getDocumentInfo(documentType);
        const docName = docInfo?.name || documentType;

        // Formater la réponse
        const formatted = this.formatProcedureInfo(procedure, docName);

        // Démarrer le tracking de la démarche
        iDNSoul.startProcedure(docName);

        const soul = iDNSoul.getState();
        let vocalFeedback: string;

        if (soul.persona.formalityLevel === 3) {
            vocalFeedback = `Voici les informations concernant la demande de ${docName}, Excellence.`;
        } else {
            vocalFeedback = `Voici les informations pour votre ${docName}. ${procedure.documents.length} documents sont requis.`;
        }

        return {
            success: true,
            skillName: 'ExplainProcedure',
            data: { formatted, procedure },
            executionTime: Date.now() - startTime,
            vocalFeedback
        };
    }

    private formatProcedureInfo(procedure: ProcedureInfo, docName: string): string {
        let result = `## ${docName}\n\n`;

        result += `**📄 Documents requis:**\n`;
        procedure.documents.forEach(doc => {
            result += `• ${doc}\n`;
        });

        result += `\n**📍 Lieu:** ${procedure.location}\n`;
        result += `**⏱️ Délai:** ${procedure.delay}\n`;
        result += `**💰 Coût:** ${procedure.cost}\n`;

        result += `\n**📋 Étapes:**\n`;
        procedure.steps.forEach((step, index) => {
            result += `${index + 1}. ${step}\n`;
        });

        if (procedure.notes && procedure.notes.length > 0) {
            result += `\n**⚠️ Notes importantes:**\n`;
            procedure.notes.forEach(note => {
                result += `• ${note}\n`;
            });
        }

        return result;
    }

    /**
     * Génère une liste de vérification pour une procédure
     */
    public async generateChecklist(
        procedureId: string,
        signal?: SkillActivationSignal
    ): Promise<SkillResult<string[]>> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('GenerateChecklist');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'GenerateChecklist',
                error: 'Non autorisé',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        const procedure = this.getProcedure(procedureId);
        if (!procedure) {
            return {
                success: false,
                skillName: 'GenerateChecklist',
                error: 'Procédure non trouvée',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        const checklist = [
            '☐ Vérifier tous les documents requis',
            ...procedure.documents.map(doc => `☐ ${doc}`),
            '☐ Préparer les moyens de paiement',
            '☐ Noter l\'adresse du lieu',
            ...procedure.steps.map(step => `☐ ${step}`)
        ];

        return {
            success: true,
            skillName: 'GenerateChecklist',
            data: checklist,
            executionTime: Date.now() - startTime,
            vocalFeedback: `J'ai généré une checklist de ${checklist.length} points.`
        };
    }

    /**
     * Vérifie les documents disponibles vs requis
     */
    public async checkDocumentsReady(
        procedureId: string,
        availableDocuments: string[],
        signal?: SkillActivationSignal
    ): Promise<SkillResult<{ ready: boolean; missing: string[]; available: string[] }>> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('CheckDocumentsReady');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'CheckDocumentsReady',
                error: 'Non autorisé',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        const procedure = this.getProcedure(procedureId);
        if (!procedure) {
            return {
                success: false,
                skillName: 'CheckDocumentsReady',
                error: 'Procédure non trouvée',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        const normalizedAvailable = availableDocuments.map(d => d.toLowerCase());
        const missing: string[] = [];
        const available: string[] = [];

        for (const required of procedure.documents) {
            const normalizedRequired = required.toLowerCase();
            const found = normalizedAvailable.some(a =>
                normalizedRequired.includes(a) || a.includes(normalizedRequired)
            );

            if (found) {
                available.push(required);
            } else {
                missing.push(required);
            }
        }

        const ready = missing.length === 0;
        let vocalFeedback: string;

        if (ready) {
            vocalFeedback = 'Parfait ! Vous avez tous les documents nécessaires.';
        } else {
            vocalFeedback = `Il vous manque ${missing.length} document${missing.length > 1 ? 's' : ''}: ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? ', etc.' : ''}.`;
        }

        return {
            success: true,
            skillName: 'CheckDocumentsReady',
            data: { ready, missing, available },
            executionTime: Date.now() - startTime,
            vocalFeedback
        };
    }

    /**
     * Recherche une procédure par mots-clés
     */
    public searchProcedures(keywords: string): ProcedureInfo[] {
        const normalized = keywords.toLowerCase();
        const results: ProcedureInfo[] = [];

        for (const procedures of Object.values(PROCEDURES_DATABASE)) {
            for (const procedure of procedures) {
                const docInfo = this.getDocumentInfo(procedure.documentType);
                const searchText = [
                    docInfo?.name || '',
                    docInfo?.shortName || '',
                    procedure.type,
                    ...procedure.documents,
                    procedure.location
                ].join(' ').toLowerCase();

                if (searchText.includes(normalized)) {
                    results.push(procedure);
                }
            }
        }

        return results;
    }
}

// ============================================================
// EXPORT
// ============================================================

export const IdentitySkills = IdentitySkillsClass.getInstance();
