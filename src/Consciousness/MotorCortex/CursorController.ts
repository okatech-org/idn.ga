/**
 * CONSCIOUSNESS - MotorCortex: CursorController
 * 
 * Hook React pour contrôler l'animation du curseur iDN.
 * Ce hook écoute les commandes motrices et les traduit en état React.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MotorSynapse, MotorCommand, MotorState } from './MotorSynapse';

// ============================================================
// TYPES
// ============================================================

export interface CursorPosition {
    x: number;
    y: number;
}

export interface CursorState {
    position: CursorPosition;
    isVisible: boolean;
    isMoving: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
    isInteracting: boolean;
    pulseIntensity: 'none' | 'subtle' | 'medium' | 'strong';
    targetElement: string | null;
    emotion: 'neutral' | 'happy' | 'concerned' | 'excited' | 'formal';
}

export interface IAstedCursorStyles {
    orbSize: number;
    transitionDuration: number;
    easing: string;
}

// ============================================================
// HOOK: useIAstedCursor
// ============================================================

export function useIAstedCursor(options?: {
    initialPosition?: CursorPosition;
    idlePosition?: 'corner' | 'center' | 'custom';
    orbSize?: number;
}) {
    const {
        initialPosition = { x: 0, y: 0 },
        idlePosition = 'corner',
        orbSize = 60
    } = options || {};

    // État du curseur
    const [cursorState, setCursorState] = useState<CursorState>({
        position: initialPosition,
        isVisible: true,
        isMoving: false,
        isSpeaking: false,
        isThinking: false,
        isInteracting: false,
        pulseIntensity: 'none',
        targetElement: null,
        emotion: 'neutral'
    });

    // Références pour les animations
    const animationRef = useRef<number | null>(null);
    const currentPositionRef = useRef<CursorPosition>(initialPosition);
    const targetPositionRef = useRef<CursorPosition>(initialPosition);

    // ========== ANIMATION FLUIDE ==========

    const animateToPosition = useCallback((target: CursorPosition, duration: number) => {
        const startPosition = { ...currentPositionRef.current };
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeInOutCubic)
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const newPosition = {
                x: startPosition.x + (target.x - startPosition.x) * eased,
                y: startPosition.y + (target.y - startPosition.y) * eased
            };

            currentPositionRef.current = newPosition;
            setCursorState(prev => ({
                ...prev,
                position: newPosition,
                isMoving: progress < 1
            }));

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setCursorState(prev => ({ ...prev, isMoving: false }));
            }
        };

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // ========== POSITIONNEMENT PAR ÉLÉMENT ==========

    const moveToElement = useCallback((elementId: string, duration: number = 500) => {
        if (typeof document === 'undefined') return;

        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`[CursorController] Élément #${elementId} non trouvé`);
            return;
        }

        const rect = element.getBoundingClientRect();
        const target = {
            x: rect.left + rect.width / 2 - orbSize / 2,
            y: rect.top + rect.height / 2 - orbSize / 2
        };

        targetPositionRef.current = target;
        setCursorState(prev => ({ ...prev, isMoving: true, targetElement: elementId }));
        animateToPosition(target, duration);
    }, [animateToPosition, orbSize]);

    // ========== POSITION DE REPOS ==========

    const goToIdlePosition = useCallback(() => {
        if (typeof window === 'undefined') return;

        let target: CursorPosition;

        switch (idlePosition) {
            case 'corner':
                target = {
                    x: window.innerWidth - orbSize - 32,
                    y: window.innerHeight - orbSize - 32
                };
                break;
            case 'center':
                target = {
                    x: window.innerWidth / 2 - orbSize / 2,
                    y: window.innerHeight / 2 - orbSize / 2
                };
                break;
            default:
                target = initialPosition;
        }

        animateToPosition(target, 800);
    }, [idlePosition, orbSize, initialPosition, animateToPosition]);

    // ========== COMMANDES MOTRICES ==========

    const handleMotorCommand = useCallback((command: MotorCommand) => {
        switch (command.type) {
            case 'MOVE_TO':
                if ('elementId' in command.target) {
                    const duration = command.speed === 'slow' ? 1000 : command.speed === 'fast' ? 300 : 500;
                    moveToElement(command.target.elementId, duration);
                } else {
                    const duration = command.speed === 'slow' ? 1000 : command.speed === 'fast' ? 300 : 500;
                    animateToPosition(command.target, duration);
                }
                break;

            case 'GAZE_AT':
                moveToElement(command.elementId, 300);
                if (command.highlight) {
                    const element = document.getElementById(command.elementId);
                    if (element) {
                        element.style.outline = '2px solid #00aaff';
                        element.style.outlineOffset = '4px';
                        setTimeout(() => {
                            element.style.outline = '';
                            element.style.outlineOffset = '';
                        }, command.duration);
                    }
                }
                break;

            case 'VOCALIZE':
                setCursorState(prev => ({
                    ...prev,
                    isSpeaking: true,
                    emotion: command.emotion
                }));
                break;

            case 'PULSE':
                setCursorState(prev => ({
                    ...prev,
                    pulseIntensity: command.intensity
                }));
                setTimeout(() => {
                    setCursorState(prev => ({ ...prev, pulseIntensity: 'none' }));
                }, command.duration);
                break;

            case 'THINK':
                setCursorState(prev => ({ ...prev, isThinking: true }));
                setTimeout(() => {
                    setCursorState(prev => ({ ...prev, isThinking: false }));
                }, command.duration);
                break;

            case 'INTERACT':
                setCursorState(prev => ({ ...prev, isInteracting: true }));
                setTimeout(() => {
                    setCursorState(prev => ({ ...prev, isInteracting: false }));
                }, command.delay || 200);

                if (command.action === 'click') {
                    const element = cursorState.targetElement
                        ? document.getElementById(cursorState.targetElement)
                        : null;
                    if (element) {
                        element.click();
                    }
                }
                break;

            case 'IDLE':
                goToIdlePosition();
                break;
        }
    }, [moveToElement, animateToPosition, goToIdlePosition, cursorState.targetElement]);

    // ========== ABONNEMENT AUX COMMANDES ==========

    useEffect(() => {
        const unsubscribe = MotorSynapse.onCommand(handleMotorCommand);

        // Position initiale de repos
        setTimeout(() => {
            goToIdlePosition();
        }, 1000);

        return () => {
            unsubscribe();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleMotorCommand, goToIdlePosition]);

    // ========== ÉCOUTE FIN DE PAROLE ==========

    useEffect(() => {
        const unsubscribe = MotorSynapse.onStateChange((state: MotorState) => {
            if (!state.isSpeaking && cursorState.isSpeaking) {
                setCursorState(prev => ({ ...prev, isSpeaking: false }));
            }
        });

        return unsubscribe;
    }, [cursorState.isSpeaking]);

    // ========== MÉTHODES PUBLIQUES ==========

    const show = useCallback(() => {
        setCursorState(prev => ({ ...prev, isVisible: true }));
    }, []);

    const hide = useCallback(() => {
        setCursorState(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        cursorState,
        show,
        hide,
        moveToElement,
        goToIdlePosition,
        styles: {
            orbSize,
            transitionDuration: 500,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        } as IAstedCursorStyles
    };
}

export { MotorSynapse };
