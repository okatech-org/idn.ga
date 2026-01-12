// Types pour l'Agent Vérificateur / Contrôleur d'Identité

export type VerificationStatus =
    | 'pending'      // En attente de vérification
    | 'in_review'    // En cours d'examen
    | 'approved'     // Approuvé
    | 'rejected'     // Rejeté
    | 'flagged'      // Signalé pour examen approfondi
    | 'escalated';   // Escaladé à un superviseur

export type DocumentType =
    | 'cni'          // Carte Nationale d'Identité
    | 'passport'     // Passeport
    | 'birth_cert'   // Acte de Naissance
    | 'residence'    // Certificat de Résidence
    | 'driving'      // Permis de Conduire
    | 'marriage'     // Acte de Mariage
    | 'death'        // Acte de Décès
    | 'other';       // Autre document

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type VerificationMethod =
    | 'biometric'    // Vérification biométrique
    | 'manual'       // Vérification manuelle
    | 'ai_assisted'  // Assistée par IA
    | 'database';    // Vérification en base de données

export interface Applicant {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    nationality: string;
    gender: 'M' | 'F';
    address: string;
    phone: string;
    email?: string;
    photoUrl?: string;
    identificationNumber?: string;
}

export interface VerificationRequest {
    id: string;
    applicant: Applicant;
    documentType: DocumentType;
    status: VerificationStatus;
    riskLevel: RiskLevel;
    requestedAt: string;
    assignedTo?: string;
    priority: number; // 1 = highest, 5 = lowest

    // Documents soumis
    documents: SubmittedDocument[];

    // Vérifications effectuées
    verifications: VerificationCheck[];

    // Notes et commentaires
    notes: VerificationNote[];

    // Métadonnées
    source: 'online' | 'in_person' | 'agent';
    location?: string;
    estimatedProcessingTime?: number; // en minutes
}

export interface SubmittedDocument {
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
    verified: boolean;
    issues?: string[];
}

export interface VerificationCheck {
    id: string;
    type: VerificationMethod;
    result: 'pass' | 'fail' | 'pending' | 'inconclusive';
    score?: number; // 0-100
    details: string;
    performedAt: string;
    performedBy: string;
}

export interface VerificationNote {
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
    type: 'info' | 'warning' | 'action_required';
}

export interface ControllerStats {
    pendingCount: number;
    inReviewCount: number;
    approvedToday: number;
    rejectedToday: number;
    flaggedCount: number;
    averageProcessingTime: number; // en minutes
    myProcessedToday: number;
    myPendingCount: number;
}

export interface VerificationDecision {
    requestId: string;
    decision: 'approve' | 'reject' | 'escalate' | 'request_info';
    reason: string;
    notes?: string;
    conditions?: string[];
}

// Mapping des types de documents vers leurs labels
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    cni: 'Carte Nationale d\'Identité',
    passport: 'Passeport',
    birth_cert: 'Acte de Naissance',
    residence: 'Certificat de Résidence',
    driving: 'Permis de Conduire',
    marriage: 'Acte de Mariage',
    death: 'Acte de Décès',
    other: 'Autre Document'
};

// Mapping des statuts vers leurs labels
export const STATUS_LABELS: Record<VerificationStatus, string> = {
    pending: 'En Attente',
    in_review: 'En Cours',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    flagged: 'Signalé',
    escalated: 'Escaladé'
};

// Mapping des niveaux de risque vers leurs couleurs
export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-500' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-500' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500' },
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-500' }
};

export const RISK_LABELS: Record<RiskLevel, string> = {
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    critical: 'Critique'
};
