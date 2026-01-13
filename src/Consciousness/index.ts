/**
 * CONSCIOUSNESS - Central Export
 * 
 * L'Âme de l'agent iDN - Le Ghost in the Machine pour IDN.GA.
 * 
 * Ce module exporte tous les composants de la Conscience Numérique:
 * - iDNSoul: Le singleton central (Persona, Spatial, Tone)
 * - SocialProtocolAdapter: Adaptation culturelle gabonaise
 * - ContextMemory: Mémoire conversationnelle
 * - IntentProcessor: Le lobe frontal (traitement des intentions)
 * - MotorCortex: Le système moteur (animations, curseur)
 */

// L'Âme
export { iDNSoul } from './iDNSoul';
export type {
    EmotionalState,
    Persona,
    SpatialAwareness,
    ConversationContext,
    KnownUser,
    SoulState
} from './iDNSoul';

// Le Protocole Social
export { SocialProtocolAdapter } from './SocialProtocolAdapter';
export type { CommunicationContext, ProtocolResponse } from './SocialProtocolAdapter';

// La Mémoire
export { ContextMemory } from './ContextMemory';
export type {
    ConversationMessage,
    ConversationTopic,
    ContextualReference,
    TrackedAction,
    MemoryState
} from './ContextMemory';

// Le Processeur d'Intentions (Lobe Frontal)
export { IntentProcessor } from './IntentProcessor';
export type {
    IntentSource,
    ParsedIntent,
    IntentCategory,
    ProcessingResult
} from './IntentProcessor';

// Le Système Moteur (MotorCortex)
export {
    MotorSynapse,
    useIAstedCursor,
    IDNCursor,
    useIDNMotor,
    useIAstedMotor
} from './MotorCortex';
export type {
    MotorCommandType,
    MotorCommand,
    MotorSequence,
    MotorState,
    CursorPosition,
    CursorState,
    IAstedCursorStyles
} from './MotorCortex';

// Hook React Principal
export {
    useIDN,
    IDNProvider,
    useIDNContext
} from './useIDN';
export type { UseIDNOptions, UseIDNReturn } from './useIDN';

