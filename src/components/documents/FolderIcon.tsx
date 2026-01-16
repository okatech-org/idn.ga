/**
 * FolderIcon - Dossier style Windows vertical
 * 
 * Reproduit fidèlement l'icône de dossier Windows avec:
 * - Perspective 3D verticale (dossier debout)
 * - Feuilles A4 visibles à l'intérieur
 * - Animation d'ouverture au survol (si contient des fichiers)
 */

import React from 'react';

interface FolderIconProps {
    type: 'closed-empty' | 'closed-filled' | 'open-filled';
    size?: number;
    color?: string;
    className?: string;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
    type,
    size = 80,
    color = '#f5d87a', // Jaune Windows classique
    className = ''
}) => {
    // Couleurs dérivées
    const darkerColor = adjustColor(color, -30);
    const lighterColor = adjustColor(color, 30);
    const borderColor = adjustColor(color, -50);

    // Animation du document basée sur le type
    const docOffset = type === 'open-filled' ? -15 : 0;
    const frontPanelRotate = type === 'open-filled' ? 8 : 0;

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 100 120"
                width="100%"
                height="100%"
                style={{ overflow: 'visible' }}
            >
                {/* OMBRE AU SOL */}
                <ellipse
                    cx="55"
                    cy="115"
                    rx="30"
                    ry="6"
                    fill="rgba(0,0,0,0.12)"
                />

                {/* FEUILLES A4 (visibles si dossier contient des fichiers) */}
                {type !== 'closed-empty' && (
                    <g
                        style={{
                            transform: `translateY(${docOffset}px)`,
                            transition: 'transform 0.35s ease-out'
                        }}
                    >
                        {/* Feuille arrière (légèrement décalée) */}
                        <rect
                            x="32"
                            y="18"
                            width="40"
                            height="55"
                            rx="1"
                            fill="#f8f9fa"
                            stroke="#d1d5db"
                            strokeWidth="0.5"
                        />

                        {/* Feuille principale */}
                        <rect
                            x="35"
                            y="15"
                            width="40"
                            height="55"
                            rx="1"
                            fill="#ffffff"
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                            style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.08))' }}
                        />

                        {/* Bande bleue en bas (comme Windows) */}
                        <rect
                            x="35"
                            y="62"
                            width="40"
                            height="8"
                            fill="#60a5fa"
                        />

                        {/* Lignes de texte simulées */}
                        <line x1="40" y1="25" x2="68" y2="25" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
                        <line x1="40" y1="32" x2="65" y2="32" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
                        <line x1="40" y1="39" x2="60" y2="39" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
                    </g>
                )}

                {/* DOSSIER - PANNEAU ARRIÈRE (côté gauche en perspective) */}
                <path
                    d="M 15 20 L 15 105 L 25 110 L 25 25 Z"
                    fill={darkerColor}
                    stroke={borderColor}
                    strokeWidth="0.5"
                />

                {/* DOSSIER - FOND/DOS */}
                <path
                    d="M 15 20 L 25 25 L 85 25 L 85 20 Z"
                    fill={lighterColor}
                    stroke={borderColor}
                    strokeWidth="0.5"
                />

                {/* DOSSIER - LANGUETTE SUPÉRIEURE */}
                <path
                    d="M 55 15 L 85 15 L 85 25 L 55 25 L 50 20 Z"
                    fill={lighterColor}
                    stroke={borderColor}
                    strokeWidth="0.5"
                />

                {/* DOSSIER - PANNEAU AVANT PRINCIPAL */}
                <g
                    style={{
                        transformOrigin: '25px 110px',
                        transform: `rotateY(${frontPanelRotate}deg)`,
                        transition: 'transform 0.35s ease-out'
                    }}
                >
                    <path
                        d="M 25 25 L 25 110 L 85 105 L 85 25 Z"
                        fill={color}
                        stroke={borderColor}
                        strokeWidth="0.5"
                    />

                    {/* Reflet/highlight sur le panneau avant */}
                    <path
                        d="M 25 35 L 25 55 L 85 52 L 85 32 Z"
                        fill={lighterColor}
                        opacity="0.4"
                    />
                </g>

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
