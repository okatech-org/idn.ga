/**
 * CORTEX - SKILLS: Central Export
 * 
 * Les Compétences Cognitives de l'agent iDN.
 * Ces skills sont les "réflexes" que la Conscience active.
 */

// Skills
export { NavigationSkills } from './NavigationSkills';
export { IdentitySkills } from './IdentitySkills';

// Types Navigation
export type {
    SkillActivationSignal,
    SkillResult,
    NavigationTarget,
    ScrollTarget
} from './NavigationSkills';

// Types Identity
export type {
    IdentityDocumentType,
    ProcedureInfo,
    RequestStatus
} from './IdentitySkills';
