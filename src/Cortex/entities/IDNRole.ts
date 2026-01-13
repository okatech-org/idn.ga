/**
 * CORTEX - Entity: IDNRole
 * 
 * Pure enum representing roles in the Gabonese Identity Digital Ecosystem.
 * Adapted from MunicipalRole for the IDN.GA sovereignty platform.
 */

// ============================================================
// ENUMS - Rôles IDN.GA
// ============================================================

export enum IDNRole {
    // Citoyens
    CITOYEN = 'CITOYEN',
    CITOYEN_DIASPORA = 'CITOYEN_DIASPORA',
    RESIDENT_ETRANGER = 'RESIDENT_ETRANGER',

    // Haute Autorité
    PRESIDENT_REPUBLIQUE = 'PRESIDENT_REPUBLIQUE',
    MINISTRE = 'MINISTRE',
    SECRETAIRE_GENERAL_PR = 'SECRETAIRE_GENERAL_PR',
    DIRECTEUR_CABINET = 'DIRECTEUR_CABINET',

    // Administration Identité
    CONTROLEUR_IDENTITE = 'CONTROLEUR_IDENTITE',
    AGENT_DGDI = 'AGENT_DGDI',
    VERIFICATEUR_BIOMETRIQUE = 'VERIFICATEUR_BIOMETRIQUE',

    // Support Technique
    ADMINISTRATEUR_SYSTEME = 'ADMINISTRATEUR_SYSTEME',
    SUPPORT_TECHNIQUE = 'SUPPORT_TECHNIQUE',

    // Autres
    ANONYME = 'ANONYME',
    ORGANISATION = 'ORGANISATION'
}

export enum VerificationLevel {
    AUCUN = 0,
    EMAIL_VERIFIE = 1,
    TELEPHONE_VERIFIE = 2,
    IDENTITE_VERIFIEE = 3,
    BIOMETRIE_VALIDEE = 4
}

export enum AccessContext {
    CITOYEN_SPACE = 'CITOYEN_SPACE',
    PRESIDENT_SPACE = 'PRESIDENT_SPACE',
    CABINET_SPACE = 'CABINET_SPACE',
    CONTROLLER_SPACE = 'CONTROLLER_SPACE',
    ADMIN_SPACE = 'ADMIN_SPACE',
    PUBLIC = 'PUBLIC'
}

// ============================================================
// VALUE OBJECTS
// ============================================================

export interface RoleDefinition {
    readonly role: IDNRole;
    readonly label: string;
    readonly labelFeminin: string;
    readonly formalityLevel: 1 | 2 | 3; // 1=Technique, 2=Cordial, 3=Protocolaire
    readonly honorificPrefix: string;
    readonly permissions: readonly string[];
    readonly canAccessSpaces: readonly AccessContext[];
}

// ============================================================
// HELPERS (Pure functions, no side effects)
// ============================================================

export function isCitizenRole(role: IDNRole): boolean {
    return [
        IDNRole.CITOYEN,
        IDNRole.CITOYEN_DIASPORA,
        IDNRole.RESIDENT_ETRANGER,
        IDNRole.ANONYME
    ].includes(role);
}

export function isHighAuthorityRole(role: IDNRole): boolean {
    return [
        IDNRole.PRESIDENT_REPUBLIQUE,
        IDNRole.MINISTRE,
        IDNRole.SECRETAIRE_GENERAL_PR,
        IDNRole.DIRECTEUR_CABINET
    ].includes(role);
}

export function isControllerRole(role: IDNRole): boolean {
    return [
        IDNRole.CONTROLEUR_IDENTITE,
        IDNRole.AGENT_DGDI,
        IDNRole.VERIFICATEUR_BIOMETRIQUE
    ].includes(role);
}

export function isAdminRole(role: IDNRole): boolean {
    return [
        IDNRole.ADMINISTRATEUR_SYSTEME,
        IDNRole.SUPPORT_TECHNIQUE
    ].includes(role);
}

export function getFormalityLevel(role: IDNRole): 1 | 2 | 3 {
    if (isHighAuthorityRole(role)) return 3;
    if (isControllerRole(role) || isAdminRole(role)) return 1;
    return 2;
}

export function getHonorificPrefix(role: IDNRole, name?: string): string {
    switch (role) {
        case IDNRole.PRESIDENT_REPUBLIQUE:
            return 'Son Excellence Monsieur le Président de la République';
        case IDNRole.MINISTRE:
            return name ? `Excellence ${name}` : 'Excellence Monsieur le Ministre';
        case IDNRole.SECRETAIRE_GENERAL_PR:
            return 'Monsieur le Secrétaire Général';
        case IDNRole.DIRECTEUR_CABINET:
            return 'Monsieur le Directeur de Cabinet';
        case IDNRole.CONTROLEUR_IDENTITE:
        case IDNRole.AGENT_DGDI:
            return name ? `Agent ${name}` : 'Cher Agent';
        case IDNRole.VERIFICATEUR_BIOMETRIQUE:
            return 'Vérificateur';
        case IDNRole.ADMINISTRATEUR_SYSTEME:
            return 'Administrateur';
        case IDNRole.SUPPORT_TECHNIQUE:
            return 'Support';
        case IDNRole.CITOYEN:
            return name ? `Cher ${name}` : 'Cher citoyen';
        case IDNRole.CITOYEN_DIASPORA:
            return name ? `Cher ${name}` : 'Cher compatriote';
        case IDNRole.RESIDENT_ETRANGER:
            return name ? `Cher ${name}` : 'Cher résident';
        case IDNRole.ORGANISATION:
            return 'Cher partenaire';
        default:
            return 'Cher visiteur';
    }
}
