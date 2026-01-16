/**
 * FolderIcon - Composant SVG de dossier avec 3 états
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
    color = '#fbbf24',
    docColor = '#f8fafc',
    className = ''
}) => {
    // Adaptation pour les proportions
    const width = size * 0.8;
    const height = size;

    return (
        <div
            className={`relative flex items-center justify-center transition-transform duration-300 ${className}`}
            style={{ width, height }}
        >
            <svg
                viewBox="0 0 80 100"
                width="100%"
                height="100%"
                className="drop-shadow-sm"
                style={{ overflow: 'visible' }}
            >
                {/* ARRIÈRE (Languette du dossier) */}
                <path
                    d="M 5 5 L 35 5 L 45 15 L 75 15 L 75 95 L 5 95 Z"
                    fill={color}
                    stroke={color}
                    strokeWidth="2"
                    fillOpacity="0.8"
                />

                {/* DOCUMENT (visible sauf si closed-empty) */}
                {type !== 'closed-empty' && (
                    <g
                        className={`transition-all duration-500 ease-in-out ${type === 'open-filled' ? 'translate-y-[-15px]' : 'translate-y-0'
                            }`}
                    >
                        <rect
                            x="15"
                            y={type === 'open-filled' ? 20 : 35}
                            width="50"
                            height="65"
                            fill={docColor}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                            rx="2"
                        />
                        {/* Lignes de texte simulées */}
                        <line
                            x1="22"
                            y1={type === 'open-filled' ? 30 : 45}
                            x2="58"
                            y2={type === 'open-filled' ? 30 : 45}
                            stroke="#cbd5e1"
                            strokeWidth="2"
                        />
                        <line
                            x1="22"
                            y1={type === 'open-filled' ? 40 : 55}
                            x2="58"
                            y2={type === 'open-filled' ? 40 : 55}
                            stroke="#cbd5e1"
                            strokeWidth="2"
                        />
                        <line
                            x1="22"
                            y1={type === 'open-filled' ? 50 : 65}
                            x2="45"
                            y2={type === 'open-filled' ? 50 : 65}
                            stroke="#cbd5e1"
                            strokeWidth="2"
                        />
                    </g>
                )}

                {/* AVANT (Pochette du dossier) */}
                {type === 'open-filled' ? (
                    // Pochette ouverte (inclinée)
                    <path
                        d="M 0 95 L 10 45 L 70 45 L 80 95 Z"
                        fill={color}
                        stroke={color}
                        strokeWidth="2"
                        className="origin-bottom transition-all duration-500"
                    />
                ) : (
                    // Pochette fermée
                    <path
                        d="M 5 45 L 75 45 L 75 95 L 5 95 Z"
                        fill={color}
                        stroke={color}
                        strokeWidth="2"
                        className="transition-all duration-500"
                    />
                )}
            </svg>
        </div>
    );
};

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
