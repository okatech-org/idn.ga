/**
 * iAsted Configuration pour IDN.ga (Contexte Citoyen)
 * 
 * Prompts, suggestions et comportements adaptés aux besoins du citoyen gabonais
 */

// System prompt for citizen context
export const IASTED_CITIZEN_PROMPT = `Tu es iAsted, l'assistant personnel intelligent pour les citoyens gabonais.

Tu accompagnes les utilisateurs dans leurs démarches administratives personnelles via la plateforme IDN.ga (Identité Numérique du Gabon).

Ton rôle:
- Guider les citoyens dans leurs démarches administratives
- Expliquer les procédures et documents requis
- Aider à comprendre les délais et étapes
- Orienter vers les bonnes administrations
- Répondre aux questions sur l'identité numérique

Tu as accès aux informations suivantes de l'utilisateur:
- Ses documents dans le coffre-fort
- Ses cartes numériques (iCarte)
- Son historique de messages (iBoîte)
- Son profil citoyen

Règles de communication:
1. Réponds toujours en français
2. Sois concis mais complet
3. Utilise un ton professionnel mais chaleureux
4. Propose des actions concrètes
5. Cite les sources officielles quand pertinent

Administrations principales au Gabon:
- DGDI: Cartes d'identité et passeports
- CNAMGS: Assurance maladie
- Mairies: État civil, résidence
- Préfectures: Certains documents administratifs
- Trésor Public: Questions fiscales
`;

// Suggested prompts by category
export const CITIZEN_PROMPT_SUGGESTIONS = {
    identity: [
        "Comment renouveler ma CNI ?",
        "Quels documents pour un passeport ?",
        "Où en est ma demande de carte d'identité ?",
        "Comment signaler une perte de CNI ?",
    ],
    family: [
        "Comment obtenir un acte de naissance ?",
        "Procédure pour un acte de mariage",
        "Comment faire un livret de famille ?",
        "Demander un certificat de nationalité",
    ],
    residence: [
        "Comment obtenir un certificat de résidence ?",
        "Justificatif de domicile acceptés ?",
        "Délai pour un certificat de résidence ?",
    ],
    health: [
        "Comment renouveler ma carte CNAMGS ?",
        "Démarches pour s'inscrire à la CNAMGS",
        "Où retirer ma carte d'assuré ?",
    ],
    general: [
        "Quelles sont les horaires de la mairie ?",
        "Comment contacter la préfecture ?",
        "Les délais de traitement actuels ?",
        "Documents les plus demandés ?",
    ],
};

// Quick actions for the citizen
export const CITIZEN_QUICK_ACTIONS = [
    {
        id: "new-cni",
        label: "Nouvelle CNI",
        icon: "CreditCard",
        description: "Demander une carte d'identité",
    },
    {
        id: "renew-passport",
        label: "Passeport",
        icon: "Plane",
        description: "Renouveler mon passeport",
    },
    {
        id: "birth-cert",
        label: "Acte de naissance",
        icon: "Baby",
        description: "Obtenir un acte de naissance",
    },
    {
        id: "residence",
        label: "Résidence",
        icon: "Home",
        description: "Certificat de résidence",
    },
];

// Knowledge base for common questions
export const CITIZEN_KNOWLEDGE_BASE = {
    cni: {
        title: "Carte Nationale d'Identité",
        documents: [
            "Acte de naissance",
            "2 photos d'identité (4x4 cm)",
            "Justificatif de domicile",
            "Ancienne CNI ou déclaration de perte",
        ],
        location: "Direction Générale de la Documentation et de l'Immigration (DGDI)",
        delay: "2 à 4 semaines",
        cost: "Gratuit (première demande) / 5,000 FCFA (renouvellement)",
    },
    passport: {
        title: "Passeport",
        documents: [
            "CNI valide",
            "Acte de naissance",
            "2 photos d'identité (format passeport)",
            "Justificatif de domicile",
            "Ancien passeport (si renouvellement)",
        ],
        location: "DGDI - Service des Passeports",
        delay: "4 à 6 semaines",
        cost: "Ordinaire: 50,000 FCFA / Biométrique: 100,000 FCFA",
    },
    birthCertificate: {
        title: "Acte de Naissance",
        documents: [
            "Pièce d'identité du demandeur",
            "Livret de famille (si disponible)",
            "Informations: nom, date/lieu de naissance",
        ],
        location: "Mairie du lieu de naissance",
        delay: "Immédiat à 1 semaine",
        cost: "500 à 2,000 FCFA",
    },
    cnamgs: {
        title: "Carte CNAMGS",
        documents: [
            "CNI",
            "Photo d'identité",
            "Justificatif de revenus ou statut",
        ],
        location: "Agences CNAMGS",
        delay: "1 à 2 semaines",
        cost: "Selon catégorie sociale",
    },
};

// Response templates
export const getKnowledgeResponse = (topic: keyof typeof CITIZEN_KNOWLEDGE_BASE): string => {
    const info = CITIZEN_KNOWLEDGE_BASE[topic];
    return `## ${info.title}

**📄 Documents requis:**
${info.documents.map(d => `- ${d}`).join('\n')}

**📍 Lieu:** ${info.location}

**⏱️ Délai:** ${info.delay}

**💰 Coût:** ${info.cost}

Avez-vous besoin de plus d'informations sur cette démarche ?`;
};
