/**
 * CORTEX - SKILLS: NavigationSkills
 * 
 * Compétences cognitives de navigation de l'agent iDN.
 * Ces skills gèrent la navigation dans l'application IDN.GA:
 * - Navigation globale (changement de page)
 * - Scroll et focus
 * - Contrôle de l'interface
 */

import { iDNSoul, SoulState } from '@/Consciousness';

// ============================================================
// TYPES
// ============================================================

export interface SkillActivationSignal {
    skillName: string;
    activatedBy: 'voice' | 'text' | 'click' | 'context' | 'system';
    soulState: SoulState;
    timestamp: Date;
    priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SkillResult<T = unknown> {
    success: boolean;
    skillName: string;
    data?: T;
    error?: string;
    executionTime: number;
    vocalFeedback: string;
}

export interface NavigationTarget {
    path: string;
    label: string;
    section?: string;     // Section spécifique sur la page
    elementId?: string;   // Élément à focus
}

export interface ScrollTarget {
    elementId?: string;
    position?: ScrollLogicalPosition;  // 'start' | 'center' | 'end' | 'nearest'
    offset?: number;
}

// ============================================================
// NAVIGATION MAP - Cartographie IDN.GA
// ============================================================

const NAVIGATION_MAP: Record<string, NavigationTarget> = {
    // Pages principales
    'accueil': { path: '/', label: 'Accueil' },
    'dashboard': { path: '/dashboard', label: 'Tableau de bord' },
    'tableau_de_bord': { path: '/dashboard', label: 'Tableau de bord' },

    // Espace Citoyen
    'icarte': { path: '/icarte', label: 'iCarte - Cartes Numériques' },
    'carte': { path: '/icarte', label: 'Cartes Numériques' },
    'cartes': { path: '/icarte', label: 'Cartes Numériques' },

    'idocument': { path: '/idocument', label: 'iDocument - Documents' },
    'documents': { path: '/idocument', label: 'Documents' },
    'mes_documents': { path: '/idocument', label: 'Mes Documents' },

    'iboite': { path: '/iboite', label: 'iBoîte - Messagerie' },
    'boite': { path: '/iboite', label: 'Messagerie' },
    'messagerie': { path: '/iboite', label: 'Messagerie' },
    'courriers': { path: '/iboite', label: 'Courriers' },

    'icv': { path: '/icv', label: 'iCV - CV Numérique' },
    'cv': { path: '/icv', label: 'CV Numérique' },

    'icoffre': { path: '/icoffre', label: 'iCoffre - Coffre-Fort' },
    'coffre': { path: '/icoffre', label: 'Coffre-Fort' },

    'parametres': { path: '/settings', label: 'Paramètres' },
    'settings': { path: '/settings', label: 'Paramètres' },
    'reglages': { path: '/settings', label: 'Réglages' },

    // Agent iDN
    'iasted': { path: '/iasted', label: 'Agent iDN' },
    'assistant': { path: '/iasted', label: 'Assistant' },
    'idn': { path: '/iasted', label: 'Agent iDN' },

    // Espace Président
    'president': { path: '/president-space', label: 'Espace Président' },
    'presidence': { path: '/president-space', label: 'Présidence' },
    'espace_president': { path: '/president-space', label: 'Espace Président' },

    // Espace Admin
    'admin': { path: '/admin-space', label: 'Espace Admin' },
    'administration': { path: '/admin-space', label: 'Administration' },
    'god': { path: '/admin-space', label: 'Mode God' },

    // Espaces Spéciaux
    'cabinet': { path: '/cabinet-director-space', label: 'Directeur Cabinet' },
    'secretariat': { path: '/secretariat-general-space', label: 'Secrétariat Général' },
    'dgss': { path: '/dgss-space', label: 'DGSS' },
    'protocole': { path: '/protocol-director-space', label: 'Protocole' },
    'reception': { path: '/service-reception-space', label: 'Réception' },

    // Contrôleur
    'controller': { path: '/controller-space', label: 'Espace Contrôleur' },
    'controleur': { path: '/controller-space', label: 'Espace Contrôleur' },
    'verification': { path: '/controller-space', label: 'Vérification' },

    // Auth
    'connexion': { path: '/login', label: 'Connexion' },
    'login': { path: '/login', label: 'Connexion' },
    'deconnexion': { path: '/logout', label: 'Déconnexion' },
    'logout': { path: '/logout', label: 'Déconnexion' }
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

    protected generateVocalFeedback(action: string, success: boolean): string {
        const soul = iDNSoul.getState();

        if (success) {
            return iDNSoul.generateActionConfirmation(action);
        } else {
            if (soul.persona.formalityLevel === 3) {
                return `Veuillez m'excuser, je n'ai pas pu ${action}.`;
            }
            return `Désolé, il y a eu un souci avec ${action}.`;
        }
    }

    protected createSignal(skillName: string, activatedBy: SkillActivationSignal['activatedBy'] = 'system'): SkillActivationSignal {
        return {
            skillName,
            activatedBy,
            soulState: iDNSoul.getState(),
            timestamp: new Date(),
            priority: 'normal'
        };
    }
}

// ============================================================
// NAVIGATION SKILLS
// ============================================================

class NavigationSkillsClass extends BaseSkill {
    private static instance: NavigationSkillsClass;
    private navigationCallback: ((path: string) => void) | null = null;

    private constructor() {
        super();
        console.log('🧭 [NavigationSkills] Compétences de navigation iDN chargées');
    }

    public static getInstance(): NavigationSkillsClass {
        if (!NavigationSkillsClass.instance) {
            NavigationSkillsClass.instance = new NavigationSkillsClass();
        }
        return NavigationSkillsClass.instance;
    }

    /**
     * Configure le callback de navigation (à appeler depuis le Router React)
     */
    public setNavigationCallback(callback: (path: string) => void): void {
        this.navigationCallback = callback;
        console.log('🔗 [NavigationSkills] Callback de navigation configuré');
    }

    // ========== NAVIGATION GLOBALE ==========

    /**
     * Navigue vers une page par son nom ou son chemin
     */
    public async navigateTo(
        target: string,
        signal?: SkillActivationSignal
    ): Promise<SkillResult<NavigationTarget>> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('NavigateTo');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'NavigateTo',
                error: 'Activation non autorisée',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        // Chercher dans la map de navigation
        const normalizedTarget = target.toLowerCase()
            .replace(/\s+/g, '_')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const navTarget = NAVIGATION_MAP[normalizedTarget];

        if (!navTarget) {
            // Essayer de trouver une correspondance partielle
            const partialMatch = Object.entries(NAVIGATION_MAP)
                .find(([key, value]) =>
                    key.includes(normalizedTarget) ||
                    value.label.toLowerCase().includes(target.toLowerCase())
                );

            if (!partialMatch) {
                return {
                    success: false,
                    skillName: 'NavigateTo',
                    error: `Page "${target}" non trouvée`,
                    executionTime: Date.now() - startTime,
                    vocalFeedback: `Je ne connais pas la page "${target}". Pouvez-vous préciser ?`
                };
            }

            return this.performNavigation(partialMatch[1], startTime);
        }

        return this.performNavigation(navTarget, startTime);
    }

    private async performNavigation(
        target: NavigationTarget,
        startTime: number
    ): Promise<SkillResult<NavigationTarget>> {
        try {
            iDNSoul.setProcessing(true);
            iDNSoul.queueAction(`Navigation vers ${target.label}`);

            console.log(`🧭 [NavigateTo] ${target.path} (${target.label})`);

            // Mise à jour de la conscience spatiale
            iDNSoul.updateSpatialAwareness({
                currentUrl: target.path,
                currentPage: target.label
            });

            // Effectuer la navigation
            if (this.navigationCallback) {
                this.navigationCallback(target.path);
            } else if (typeof window !== 'undefined') {
                // Fallback: navigation directe
                window.location.href = target.path;
            }

            iDNSoul.completeAction(`Navigation vers ${target.label}`);
            iDNSoul.setProcessing(false);

            const soul = iDNSoul.getState();
            let feedback: string;

            if (soul.persona.formalityLevel === 3) {
                feedback = `Voici la page ${target.label}, Excellence.`;
            } else {
                feedback = `C'est parti ! Voici la page ${target.label}.`;
            }

            return {
                success: true,
                skillName: 'NavigateTo',
                data: target,
                executionTime: Date.now() - startTime,
                vocalFeedback: feedback
            };

        } catch (error) {
            iDNSoul.setProcessing(false);
            return {
                success: false,
                skillName: 'NavigateTo',
                error: error instanceof Error ? error.message : 'Erreur de navigation',
                executionTime: Date.now() - startTime,
                vocalFeedback: this.generateVocalFeedback('naviguer', false)
            };
        }
    }

    /**
     * Retourne à la page précédente
     */
    public async goBack(signal?: SkillActivationSignal): Promise<SkillResult> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('GoBack');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'GoBack',
                error: 'Activation non autorisée',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        console.log('◀️ [GoBack] Retour en arrière');

        if (typeof window !== 'undefined') {
            window.history.back();
        }

        return {
            success: true,
            skillName: 'GoBack',
            executionTime: Date.now() - startTime,
            vocalFeedback: 'Retour à la page précédente.'
        };
    }

    // ========== SCROLL & FOCUS ==========

    /**
     * Fait défiler vers un élément
     */
    public async scrollTo(
        target: ScrollTarget,
        signal?: SkillActivationSignal
    ): Promise<SkillResult> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('ScrollTo');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'ScrollTo',
                error: 'Activation non autorisée',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        if (typeof document === 'undefined') {
            return {
                success: false,
                skillName: 'ScrollTo',
                error: 'Document non disponible',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        try {
            if (target.elementId) {
                const element = document.getElementById(target.elementId);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: target.position || 'center'
                    });
                    console.log(`📜 [ScrollTo] Element: ${target.elementId}`);
                } else {
                    return {
                        success: false,
                        skillName: 'ScrollTo',
                        error: `Élément #${target.elementId} non trouvé`,
                        executionTime: Date.now() - startTime,
                        vocalFeedback: `Je ne trouve pas l'élément ${target.elementId}.`
                    };
                }
            } else {
                window.scrollTo({
                    top: target.offset || 0,
                    behavior: 'smooth'
                });
            }

            return {
                success: true,
                skillName: 'ScrollTo',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };

        } catch (error) {
            return {
                success: false,
                skillName: 'ScrollTo',
                error: error instanceof Error ? error.message : 'Erreur de scroll',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }
    }

    /**
     * Met le focus sur un élément
     */
    public async focusElement(
        elementId: string,
        signal?: SkillActivationSignal
    ): Promise<SkillResult> {
        const startTime = Date.now();
        const activationSignal = signal || this.createSignal('FocusElement');

        if (!this.validateActivation(activationSignal)) {
            return {
                success: false,
                skillName: 'FocusElement',
                error: 'Activation non autorisée',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        if (typeof document === 'undefined') {
            return {
                success: false,
                skillName: 'FocusElement',
                error: 'Document non disponible',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            return {
                success: true,
                skillName: 'FocusElement',
                executionTime: Date.now() - startTime,
                vocalFeedback: ''
            };
        }

        return {
            success: false,
            skillName: 'FocusElement',
            error: `Élément #${elementId} non trouvé`,
            executionTime: Date.now() - startTime,
            vocalFeedback: ''
        };
    }

    /**
     * Récupère les cibles de navigation disponibles
     */
    public getAvailableTargets(): string[] {
        return Object.keys(NAVIGATION_MAP);
    }

    /**
     * Recherche une cible par mot-clé
     */
    public searchTarget(keyword: string): NavigationTarget[] {
        const normalized = keyword.toLowerCase();
        return Object.entries(NAVIGATION_MAP)
            .filter(([key, value]) =>
                key.includes(normalized) ||
                value.label.toLowerCase().includes(normalized)
            )
            .map(([, value]) => value);
    }
}

// ============================================================
// EXPORT
// ============================================================

export const NavigationSkills = NavigationSkillsClass.getInstance();
