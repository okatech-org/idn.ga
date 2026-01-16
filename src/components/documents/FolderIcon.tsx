/**
 * FolderIcon - Dossier Réaliste 3D
 * 
 * Design basé sur le style "High Quality 3D Render":
 * - Surfaces lisses avec gradients subtils
 * - Ombres douces (ambient occlusion)
 * - Piles de papier réalistes
 * - Animation fluide
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
    color = '#fbbf24', // Base jaune/orange chaud
    className = ''
}) => {
    // Calcul des variantes de couleur pour le réalisme 3D
    // Face avant (plus claire)
    const frontColor = color;
    // Face arrière/intérieur (plus sombre)
    const backColor = adjustColor(color, -20);
    // Bordures/Accents
    const strokeColor = adjustColor(color, -40);

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
                <defs>
                    {/* Gradients pour effet 3D */}
                    <linearGradient id={`grad-front-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={adjustColor(color, 20)} />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                    <linearGradient id={`grad-back-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={adjustColor(color, -10)} />
                        <stop offset="100%" stopColor={adjustColor(color, -30)} />
                    </linearGradient>
                    {/* Ombre portée douce */}
                    <filter id="shadow-soft" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="0" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* OMBRE GLOBALE */}
                <ellipse
                    cx="50"
                    cy="105"
                    rx="35"
                    ry="6"
                    fill="rgba(0,0,0,0.15)"
                    filter="url(#shadow-soft)"
                />

                {/* CONTENU (PAPIERS) - Visible si open-filled ou closed-filled */}
                {type !== 'closed-empty' && (
                    <g
                        style={{
                            transform: type === 'open-filled' ? 'translateY(-18px)' : 'translateY(0)',
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        {/* Papier 3 (Fond) */}
                        <path
                            d="M 28 20 L 78 20 L 78 80 L 28 80 Z"
                            fill="#f1f5f9"
                            stroke="#cbd5e1"
                            strokeWidth="0.5"
                            transform="rotate(-2 53 50)"
                        />
                        {/* Papier 2 (Milieu) */}
                        <path
                            d="M 30 18 L 80 18 L 80 78 L 30 78 Z"
                            fill="#f8fafc"
                            stroke="#cbd5e1"
                            strokeWidth="0.5"
                            transform="rotate(1 55 48)"
                        />
                        {/* Papier 1 (Devant) - Blanc pur */}
                        <rect
                            x="25"
                            y="15"
                            width="50"
                            height="65"
                            rx="1"
                            fill="#ffffff"
                            stroke="#e2e8f0"
                            strokeWidth="0.5"
                            filter="url(#shadow-soft)"
                        />

                        {/* Lignes de texte subtiles (gris très clair) */}
                        <line x1="32" y1="25" x2="68" y2="25" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                        <line x1="32" y1="35" x2="60" y2="35" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
                    </g>
                )}

                {/* DOSSIER - ÉLÉMENT ARRIÈRE (Backplate) */}
                <path
                    d="M 15 25 L 15 100 Q 15 105 20 105 L 85 105 Q 90 105 90 100 L 90 25 L 55 25 L 50 18 L 20 18 Q 15 18 15 25 Z"
                    fill={`url(#grad-back-${color})`}
                    stroke={strokeColor}
                    strokeWidth="0.5"
                />

                {/* DOSSIER - FACE AVANT (Frontplate) */}
                <g
                    style={{
                        transformOrigin: '50% 105px',
                        transform: type === 'open-filled' ? 'rotateX(15deg)' : 'rotateX(0deg)',
                        transition: 'transform 0.4s ease-out'
                    }}
                >
                    <path
                        d="M 15 35 L 15 100 Q 15 105 20 105 L 85 105 Q 90 105 90 100 L 90 35 L 15 35 Z"
                        fill={`url(#grad-front-${color})`}
                        stroke={strokeColor}
                        strokeWidth="0.5"
                        filter="url(#shadow-soft)"
                    />

                    {/* Biseau lumineux (Highlight) sur le bord supérieur */}
                    <path
                        d="M 15 35 L 90 35"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1"
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
