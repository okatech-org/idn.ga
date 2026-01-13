/**
 * CONSCIOUSNESS - MotorCortex: IDNCursor
 * 
 * Composant React du curseur animé iDN.
 * L'orbe visuel qui représente la présence de l'agent dans l'interface.
 */

import React, { useEffect, useCallback } from 'react';
import { useIAstedCursor, CursorState, IAstedCursorStyles } from './CursorController';
import { MotorSynapse } from './MotorSynapse';

// ============================================================
// TYPES
// ============================================================

interface IDNCursorProps {
    visible?: boolean;
    onSpeechEnd?: () => void;
    className?: string;
}

// ============================================================
// STYLES INLINE (pour portabilité)
// ============================================================

const getOrbStyles = (
    state: CursorState,
    styles: IAstedCursorStyles
): React.CSSProperties => {
    const baseSize = styles.orbSize;
    const pulseScale = state.pulseIntensity === 'strong' ? 1.3 :
        state.pulseIntensity === 'medium' ? 1.15 :
            state.pulseIntensity === 'subtle' ? 1.05 : 1;

    return {
        position: 'fixed',
        left: state.position.x,
        top: state.position.y,
        width: baseSize,
        height: baseSize,
        borderRadius: '50%',
        background: getOrbGradient(state),
        boxShadow: getOrbShadow(state),
        transform: `scale(${pulseScale})`,
        transition: state.isMoving
            ? `all ${styles.transitionDuration}ms ${styles.easing}`
            : 'all 0.3s ease',
        opacity: state.isVisible ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 9999,
        cursor: 'none'
    };
};

const getOrbGradient = (state: CursorState): string => {
    if (state.isSpeaking) {
        return 'radial-gradient(circle at 30% 30%, #00ffcc, #00aaff 40%, #0066ff 70%, #4400ff)';
    }
    if (state.isThinking) {
        return 'radial-gradient(circle at 30% 30%, #ffcc00, #ff9900 40%, #ff6600 70%, #ff3300)';
    }
    if (state.isInteracting) {
        return 'radial-gradient(circle at 30% 30%, #ff00ff, #cc00ff 40%, #9900ff 70%, #6600ff)';
    }
    if (state.pulseIntensity !== 'none') {
        return 'radial-gradient(circle at 30% 30%, #00ffff, #00aaff 40%, #0066ff 70%, #0044ff)';
    }
    // État par défaut - couleurs IDN (bleu/or gabonais)
    return 'radial-gradient(circle at 30% 30%, #00aaff, #0066ff 50%, #003399 80%)';
};

const getOrbShadow = (state: CursorState): string => {
    const intensity = state.pulseIntensity;
    const baseColor = state.isSpeaking ? '0, 170, 255' :
        state.isThinking ? '255, 153, 0' :
            state.isInteracting ? '153, 0, 255' : '0, 102, 255';

    const baseShadow = `
        0 0 20px rgba(${baseColor}, 0.4),
        0 0 40px rgba(${baseColor}, 0.2),
        inset 0 -5px 15px rgba(0, 0, 0, 0.2),
        inset 0 5px 15px rgba(255, 255, 255, 0.3)
    `;

    if (intensity === 'strong') {
        return `
            ${baseShadow},
            0 0 60px rgba(${baseColor}, 0.6),
            0 0 100px rgba(${baseColor}, 0.4)
        `;
    }
    if (intensity === 'medium') {
        return `
            ${baseShadow},
            0 0 40px rgba(${baseColor}, 0.5)
        `;
    }
    return baseShadow;
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export const IDNCursor: React.FC<IDNCursorProps> = ({
    visible = true,
    onSpeechEnd,
    className = ''
}) => {
    const { cursorState, styles, show, hide } = useIAstedCursor({
        idlePosition: 'corner',
        orbSize: 48
    });

    // Gérer la visibilité
    useEffect(() => {
        if (visible) {
            show();
        } else {
            hide();
        }
    }, [visible, show, hide]);

    // Callback de fin de parole
    useEffect(() => {
        if (!cursorState.isSpeaking && onSpeechEnd) {
            onSpeechEnd();
        }
    }, [cursorState.isSpeaking, onSpeechEnd]);

    if (!cursorState.isVisible) {
        return null;
    }

    return (
        <div
            className={`idn-cursor ${className}`}
            style={getOrbStyles(cursorState, styles)}
            aria-hidden="true"
        >
            {/* Anneau intérieur */}
            <div
                style={{
                    position: 'absolute',
                    inset: '15%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4), transparent 60%)',
                    opacity: 0.7
                }}
            />

            {/* Animation de parole */}
            {cursorState.isSpeaking && (
                <div
                    style={{
                        position: 'absolute',
                        inset: '-10px',
                        borderRadius: '50%',
                        border: '2px solid rgba(0, 170, 255, 0.5)',
                        animation: 'idn-speaking-ring 0.8s ease-in-out infinite'
                    }}
                />
            )}

            {/* Animation de réflexion */}
            {cursorState.isThinking && (
                <div
                    style={{
                        position: 'absolute',
                        inset: '0',
                        borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, transparent, rgba(255, 153, 0, 0.5), transparent)',
                        animation: 'idn-thinking-spin 1s linear infinite'
                    }}
                />
            )}

            {/* Indicateur de mouvement */}
            {cursorState.isMoving && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '-8px',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#00aaff',
                        boxShadow: '0 0 8px #00aaff'
                    }}
                />
            )}

            {/* Styles CSS en ligne pour les animations */}
            <style>{`
                @keyframes idn-speaking-ring {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                }
                @keyframes idn-thinking-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ============================================================
// HOOK: useIAstedMotor (raccourci)
// ============================================================

export function useIDNMotor() {
    const gazeAt = useCallback((elementId: string) => {
        MotorSynapse.gazeAt(elementId);
    }, []);

    const moveTo = useCallback((elementId: string) => {
        MotorSynapse.moveToElement(elementId);
    }, []);

    const click = useCallback(() => {
        MotorSynapse.click();
    }, []);

    const speak = useCallback((text: string) => {
        MotorSynapse.speak(text);
    }, []);

    const think = useCallback((duration: number = 2000) => {
        MotorSynapse.think(duration);
    }, []);

    const pulse = useCallback((intensity: 'subtle' | 'medium' | 'strong' = 'medium') => {
        MotorSynapse.pulse(intensity);
    }, []);

    const idle = useCallback(() => {
        MotorSynapse.idle();
    }, []);

    const welcome = useCallback(() => {
        MotorSynapse.welcomeSequence();
    }, []);

    const navigateTo = useCallback((targetId: string, message: string) => {
        MotorSynapse.navigateSequence(targetId, message);
    }, []);

    const fillForm = useCallback((fields: Array<{ elementId: string; value: string }>) => {
        MotorSynapse.fillFormSequence(fields);
    }, []);

    const startProcedure = useCallback((procedureName: string) => {
        MotorSynapse.procedureSequence(procedureName);
    }, []);

    const verify = useCallback(() => {
        MotorSynapse.verificationSequence();
    }, []);

    return {
        // Commandes simples
        gazeAt,
        moveTo,
        click,
        speak,
        think,
        pulse,
        idle,

        // Séquences
        welcome,
        navigateTo,
        fillForm,
        startProcedure,
        verify,

        // État
        getState: MotorSynapse.getState.bind(MotorSynapse)
    };
}

// Alias pour compatibilité
export const useIAstedMotor = useIDNMotor;
