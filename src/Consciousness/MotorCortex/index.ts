/**
 * CONSCIOUSNESS - MotorCortex: Central Export
 * 
 * Le Système Moteur de l'agent iDN - "Le Corps Virtuel"
 */

// Synapse principale
export { MotorSynapse } from './MotorSynapse';
export type {
    MotorCommandType,
    GazeCommand,
    MoveCommand,
    InteractCommand,
    VocalizeCommand,
    PulseCommand,
    IdleCommand,
    ThinkCommand,
    MotorCommand,
    MotorSequence,
    MotorState
} from './MotorSynapse';

// Contrôleur de curseur (hook)
export { useIAstedCursor } from './CursorController';
export type { CursorPosition, CursorState, IAstedCursorStyles } from './CursorController';

// Composant React
export { IDNCursor, useIDNMotor, useIAstedMotor } from './IDNCursor';
