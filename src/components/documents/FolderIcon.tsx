/**
 * FolderIcon - Design "Clean 3D" Vertical Premium
 * 
 * ✨ Design épuré avec formes lisses, gradients subtils, ombres douces
 * 📄 Papiers réalistes: pile de feuilles blanches sortant par l'encoche
 * 🧠 Logique intelligente:
 *    - Fermé vide: dossier fermé simple
 *    - Fermé avec contenu: dossier fermé avec indice de papiers (légèrement visible)
 *    - Ouvert: dossier avec papiers qui sortent clairement
 * 
 * Style: Dossier vertical inspiré du design Windows/macOS moderne
 */

import React from 'react';

interface FolderIconProps {
    type: 'closed-empty' | 'closed-filled' | 'open-filled';
    size?: number;
    color?: string;
    className?: string;
    isHovered?: boolean;
}

export const FolderIcon: React.FC<FolderIconProps> = ({
    type,
    size = 80,
    color = '#f5b041',
    className = '',
    isHovered = false
}) => {
    // Unique ID for gradients to avoid conflicts
    const uid = React.useId().replace(/:/g, '');
    
    // Calculate color variants for 3D realism
    const frontLight = adjustColor(color, 30);
    const frontMid = color;
    const frontDark = adjustColor(color, -20);
    const backColor = adjustColor(color, -35);
    const shadowColor = adjustColor(color, -50);
    const edgeHighlight = adjustColor(color, 45);

    return (
        <div
            className={`relative flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : ''} ${className}`}
            style={{ width: size, height: size * 1.2 }}
        >
            <svg
                viewBox="0 0 80 100"
                width="100%"
                height="100%"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Main folder front gradient - vertical smooth 3D */}
                    <linearGradient id={`folderFront-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={frontLight} />
                        <stop offset="30%" stopColor={frontMid} />
                        <stop offset="100%" stopColor={frontDark} />
                    </linearGradient>
                    
                    {/* Back panel gradient (darker) */}
                    <linearGradient id={`folderBack-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={adjustColor(color, -15)} />
                        <stop offset="100%" stopColor={backColor} />
                    </linearGradient>

                    {/* Inner fold gradient */}
                    <linearGradient id={`folderInner-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={adjustColor(color, -30)} />
                        <stop offset="100%" stopColor={adjustColor(color, -45)} />
                    </linearGradient>

                    {/* Paper gradient for subtle depth */}
                    <linearGradient id={`paperGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f0f4f8" />
                    </linearGradient>

                    {/* Edge highlight gradient */}
                    <linearGradient id={`edgeHighlight-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    
                    {/* Soft drop shadow filter */}
                    <filter id={`dropShadow-${uid}`} x="-50%" y="-30%" width="200%" height="180%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                        <feOffset dx="4" dy="8" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.35" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Paper shadow - more subtle */}
                    <filter id={`paperShadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                        <feOffset dx="1" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Inner shadow for the notch */}
                    <filter id={`innerShadow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="-1" dy="1" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                    </filter>
                </defs>

                {/* GROUND SHADOW - ellipse under the folder */}
                <ellipse
                    cx="40"
                    cy="98"
                    rx={type === 'open-filled' ? 28 : 24}
                    ry="4"
                    fill="rgba(0,0,0,0.15)"
                    style={{
                        transition: 'all 0.4s ease-out'
                    }}
                />

                {/* === BACK PANEL (visible on sides) === */}
                <path
                    d="M 8 8
                       L 8 88
                       Q 8 92 12 92
                       L 68 92
                       Q 72 92 72 88
                       L 72 8
                       Q 72 4 68 4
                       L 12 4
                       Q 8 4 8 8
                       Z"
                    fill={`url(#folderBack-${uid})`}
                    opacity="0.9"
                />

                {/* === PAPERS STACK (visible through notch for filled types) === */}
                {type !== 'closed-empty' && (
                    <g
                        style={{
                            transform: type === 'open-filled' 
                                ? 'translateY(-18px)' 
                                : 'translateY(-4px)',
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            opacity: type === 'closed-filled' ? 0.85 : 1
                        }}
                    >
                        {/* Paper 3 - Back (slightly rotated) */}
                        <rect
                            x="52"
                            y="12"
                            width="12"
                            height="35"
                            rx="1.5"
                            fill="#e8ecf0"
                            stroke="#d1d5db"
                            strokeWidth="0.3"
                            transform="rotate(2 58 30)"
                        />
                        
                        {/* Paper 2 - Middle */}
                        <rect
                            x="53"
                            y="10"
                            width="12"
                            height="36"
                            rx="1.5"
                            fill="#f3f4f6"
                            stroke="#d1d5db"
                            strokeWidth="0.3"
                            transform="rotate(-1 59 28)"
                        />
                        
                        {/* Paper 1 - Front (main visible paper) */}
                        <rect
                            x="54"
                            y="8"
                            width="12"
                            height="38"
                            rx="1.5"
                            fill={`url(#paperGrad-${uid})`}
                            stroke="#d1d5db"
                            strokeWidth="0.4"
                            filter={`url(#paperShadow-${uid})`}
                        />

                        {/* Subtle lines on paper for realism */}
                        <g opacity="0.35">
                            <line x1="56" y1="14" x2="63" y2="14" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
                            <line x1="56" y1="18" x2="62" y2="18" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
                            <line x1="56" y1="22" x2="61" y2="22" stroke="#cbd5e1" strokeWidth="0.8" strokeLinecap="round" />
                        </g>
                    </g>
                )}

                {/* === MAIN FOLDER FRONT (vertical rectangle with notch) === */}
                <g filter={`url(#dropShadow-${uid})`}>
                    {/* Main body with notch cutout */}
                    <path
                        d="M 10 6
                           L 10 86
                           Q 10 90 14 90
                           L 66 90
                           Q 70 90 70 86
                           L 70 50
                           L 70 40
                           L 50 40
                           L 50 6
                           Q 50 2 46 2
                           L 14 2
                           Q 10 2 10 6
                           Z"
                        fill={`url(#folderFront-${uid})`}
                    />

                    {/* Inner notch shadow/depth */}
                    <path
                        d="M 50 40
                           L 70 40
                           L 70 50
                           L 50 50
                           L 50 40
                           Z"
                        fill={`url(#folderInner-${uid})`}
                    />

                    {/* Notch bottom edge line */}
                    <path
                        d="M 50 50 L 70 50"
                        stroke={shadowColor}
                        strokeWidth="0.5"
                        opacity="0.4"
                    />

                    {/* Top edge highlight */}
                    <path
                        d="M 14 2 L 46 2"
                        stroke={edgeHighlight}
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        opacity="0.7"
                    />

                    {/* Left edge highlight for 3D */}
                    <path
                        d="M 10 6 L 10 86"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="1"
                    />

                    {/* Right edge shadow */}
                    <path
                        d="M 70 50 L 70 86 Q 70 90 66 90"
                        stroke={shadowColor}
                        strokeWidth="0.6"
                        fill="none"
                        opacity="0.3"
                    />

                    {/* Bottom edge line */}
                    <path
                        d="M 14 90 L 66 90"
                        stroke={shadowColor}
                        strokeWidth="0.4"
                        opacity="0.2"
                    />
                </g>

                {/* === CORNER FOLD (top right folded corner) === */}
                <g opacity={type === 'closed-empty' ? 1 : 0.9}>
                    {/* Folded corner triangle */}
                    <path
                        d="M 50 2
                           L 50 16
                           Q 50 20 54 20
                           L 70 20
                           L 50 2
                           Z"
                        fill={adjustColor(color, -10)}
                        stroke={shadowColor}
                        strokeWidth="0.3"
                        opacity="0.95"
                    />
                    
                    {/* Fold shadow underneath */}
                    <path
                        d="M 50 16 L 54 20 L 50 20 Z"
                        fill="rgba(0,0,0,0.15)"
                    />
                    
                    {/* Fold edge highlight */}
                    <path
                        d="M 50 2 L 70 20"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="0.6"
                    />
                </g>
            </svg>
        </div>
    );
};

/**
 * Utility function to adjust color brightness
 */
function adjustColor(hex: string, amount: number): string {
    // Handle rgb/rgba colors
    if (hex.startsWith('rgb')) {
        return hex;
    }
    
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    
    if (isNaN(num)) return hex;
    
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Predefined colors for document categories
 * Using warm, friendly tones for the 3D effect
 */
export const FOLDER_ICON_COLORS: Record<string, string> = {
    identity: '#4f9cf9',      // bright blue
    civil_status: '#a78bfa',  // soft purple
    residence: '#34d399',     // fresh green
    education: '#f5b041',     // warm amber/orange
    work: '#60a5fa',          // sky blue
    health: '#f87171',        // soft red
    vehicle: '#818cf8',       // indigo
    other: '#94a3b8',         // neutral slate
    administrative: '#4f9cf9',
    financial: '#34d399',
    medical: '#f87171',
    professional: '#f5b041'
};

export default FolderIcon;
