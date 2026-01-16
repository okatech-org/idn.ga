/**
 * FolderIcon - Composant SVG de dossier style Windows
 * 
 * États:
 * - closed-empty: Dossier fermé sans document
 * - closed-filled: Dossier fermé avec document visible
 * - open-filled: Dossier ouvert avec document qui dépasse (au survol)
 */

import React from 'react';

interface FolderIconProps {
    type: 'closed-empty' | 'closed-filled' | 'open-filled';
    size?: number;
    color?: string;
    docColor?: string;
    className?: string;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
    type,
    size = 64,
    color = '#f5d67a',
    docColor = '#ffffff',
    className = ''
}) => {
    const width = size;
    const height = size;

    // Couleur plus foncée pour les ombres
    const darkerColor = adjustColor(color, -20);
    const lighterColor = adjustColor(color, 20);

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width, height }}
        >
            <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                style={{ overflow: 'visible' }}
            >
                {/* Ombre portée */}
                <ellipse
                    cx="50"
                    cy="95"
                    rx="35"
                    ry="5"
                    fill="rgba(0,0,0,0.15)"
                />

                {/* DOCUMENT DERRIÈRE (visible si filled) */}
                {type !== 'closed-empty' && (
                    <g
                        style={{
                            transform: type === 'open-filled' ? 'translateY(-12px)' : 'translateY(0)',
                            transition: 'transform 0.4s ease-out'
                        }}
                    >
                        {/* Document blanc */}
                        <rect
                            x="25"
                            y={type === 'open-filled' ? 8 : 18}
                            width="50"
                            height="60"
                            fill={docColor}
                            stroke="#d1d5db"
                            strokeWidth="1"
                            rx="2"
                            style={{
                                filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.1))'
                            }}
                        />
                        {/* Coin plié */}
                        <path
                            d={type === 'open-filled'
                                ? "M 63 8 L 75 8 L 75 20 Z"
                                : "M 63 18 L 75 18 L 75 30 Z"
                            }
                            fill="#e5e7eb"
                            stroke="#d1d5db"
                            strokeWidth="0.5"
                        />
                        {/* Lignes de texte */}
                        <line x1="32" y1={type === 'open-filled' ? 22 : 32} x2="60" y2={type === 'open-filled' ? 22 : 32} stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
                        <line x1="32" y1={type === 'open-filled' ? 30 : 40} x2="55" y2={type === 'open-filled' ? 30 : 40} stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                        <line x1="32" y1={type === 'open-filled' ? 38 : 48} x2="58" y2={type === 'open-filled' ? 38 : 48} stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                    </g>
                )}

                {/* DOSSIER - Panneau arrière */}
                <path
                    d="M 10 25 L 10 90 L 90 90 L 90 25 L 55 25 L 50 18 L 15 18 L 10 25 Z"
                    fill={darkerColor}
                />

                {/* DOSSIER - Panneau avant (avec ouverture si open) */}
                {type === 'open-filled' ? (
                    // Panneau ouvert - incliné vers l'avant
                    <path
                        d="M 8 92 L 15 45 L 85 45 L 92 92 Z"
                        fill={color}
                        stroke={darkerColor}
                        strokeWidth="1"
                        style={{
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                    />
                ) : (
                    // Panneau fermé
                    <path
                        d="M 10 35 L 10 90 L 90 90 L 90 35 Z"
                        fill={color}
                        stroke={darkerColor}
                        strokeWidth="0.5"
                    />
                )}

                {/* Reflet/Highlight sur le dossier */}
                <path
                    d={type === 'open-filled'
                        ? "M 15 50 L 20 75 L 80 75 L 85 50 Z"
                        : "M 10 40 L 10 55 L 90 55 L 90 40 Z"
                    }
                    fill={lighterColor}
                    opacity="0.3"
                />

                {/* Languette du haut */}
                <path
                    d="M 15 18 L 50 18 L 55 25 L 15 25 Z"
                    fill={lighterColor}
                    stroke={color}
                    strokeWidth="0.5"
                />
            </svg>
        </div>
    );
};

// Fonction utilitaire pour ajuster la luminosité d'une couleur hex
function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// Couleurs prédéfinies pour les catégories de dossiers
export const FOLDER_ICON_COLORS: Record<string, string> = {
    identity: '#3b82f6',      // blue
    civil_status: '#8b5cf6',  // violet
    residence: '#10b981',     // emerald
    education: '#f59e0b',     // amber
    work: '#0ea5e9',          // sky
    health: '#ef4444',        // red
    vehicle: '#6366f1',       // indigo
    other: '#64748b',         // slate
    administrative: '#3b82f6',
    financial: '#10b981',
    medical: '#ef4444',
    professional: '#f59e0b'
};

export default FolderIcon;
