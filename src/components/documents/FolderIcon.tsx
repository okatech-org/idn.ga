/**
 * FolderIcon - Design "Clean 3D" Premium
 * 
 * ✨ Design épuré avec formes lisses, gradients subtils, ombres douces
 * 📄 Papiers réalistes: pile de feuilles blanches sans bande bleue
 * 🧠 Logique intelligente:
 *    - Fermé vide: dossier fermé simple
 *    - Fermé avec contenu: dossier fermé avec indice de papiers (légèrement visible)
 *    - Ouvert: dossier avec papiers qui sortent clairement
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
    color = '#fbbf24',
    className = '',
    isHovered = false
}) => {
    // Unique ID for gradients to avoid conflicts
    const uid = React.useId().replace(/:/g, '');
    
    // Calculate color variants for 3D realism
    const frontLight = adjustColor(color, 25);
    const frontMid = color;
    const frontDark = adjustColor(color, -15);
    const backColor = adjustColor(color, -25);
    const shadowColor = adjustColor(color, -50);

    return (
        <div
            className={`relative flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-105' : ''} ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Main folder gradient - smooth 3D look */}
                    <linearGradient id={`folderFront-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={frontLight} />
                        <stop offset="40%" stopColor={frontMid} />
                        <stop offset="100%" stopColor={frontDark} />
                    </linearGradient>
                    
                    {/* Back panel gradient */}
                    <linearGradient id={`folderBack-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={adjustColor(color, -10)} />
                        <stop offset="100%" stopColor={backColor} />
                    </linearGradient>

                    {/* Inner shadow for depth */}
                    <linearGradient id={`innerShadow-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </linearGradient>

                    {/* Paper gradient for subtle depth */}
                    <linearGradient id={`paperGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f8fafc" />
                    </linearGradient>
                    
                    {/* Soft drop shadow filter */}
                    <filter id={`dropShadow-${uid}`} x="-30%" y="-20%" width="160%" height="160%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="2" dy="6" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.25" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Paper shadow */}
                    <filter id={`paperShadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                        <feOffset dx="1" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.15" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* GROUND SHADOW - ellipse */}
                <ellipse
                    cx="50"
                    cy="95"
                    rx={type === 'open-filled' ? 38 : 32}
                    ry="5"
                    fill="rgba(0,0,0,0.12)"
                    style={{
                        transition: 'all 0.4s ease-out'
                    }}
                />

                {/* === FOLDER BACK PANEL (Always visible) === */}
                <path
                    d="M 12 28 
                       L 12 85 
                       Q 12 90 17 90 
                       L 83 90 
                       Q 88 90 88 85 
                       L 88 28 
                       L 55 28 
                       L 50 20 
                       L 17 20 
                       Q 12 20 12 28 
                       Z"
                    fill={`url(#folderBack-${uid})`}
                    filter={`url(#dropShadow-${uid})`}
                />

                {/* === PAPERS STACK (visible for filled types) === */}
                {type !== 'closed-empty' && (
                    <g
                        style={{
                            transform: type === 'open-filled' 
                                ? 'translateY(-22px) translateX(2px)' 
                                : 'translateY(-3px)',
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            opacity: type === 'closed-filled' ? 0.7 : 1
                        }}
                    >
                        {/* Paper 3 - Back (rotated slightly) */}
                        <rect
                            x="25"
                            y="28"
                            width="48"
                            height="60"
                            rx="2"
                            fill="#f1f5f9"
                            stroke="#e2e8f0"
                            strokeWidth="0.4"
                            transform="rotate(-3 49 58)"
                        />
                        
                        {/* Paper 2 - Middle */}
                        <rect
                            x="26"
                            y="26"
                            width="48"
                            height="60"
                            rx="2"
                            fill="#f8fafc"
                            stroke="#e2e8f0"
                            strokeWidth="0.4"
                            transform="rotate(1 50 56)"
                        />
                        
                        {/* Paper 1 - Front (main visible paper) */}
                        <rect
                            x="24"
                            y="24"
                            width="48"
                            height="60"
                            rx="2"
                            fill={`url(#paperGrad-${uid})`}
                            stroke="#e2e8f0"
                            strokeWidth="0.5"
                            filter={`url(#paperShadow-${uid})`}
                        />

                        {/* Subtle text lines on front paper (very faint) */}
                        <g opacity="0.4">
                            <line x1="32" y1="35" x2="64" y2="35" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="32" y1="43" x2="58" y2="43" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="32" y1="51" x2="54" y2="51" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                        </g>
                    </g>
                )}

                {/* === FOLDER FRONT PANEL === */}
                <g
                    style={{
                        transformOrigin: '50px 90px',
                        transform: type === 'open-filled' 
                            ? 'perspective(200px) rotateX(20deg)' 
                            : 'perspective(200px) rotateX(0deg)',
                        transition: 'transform 0.4s ease-out'
                    }}
                >
                    {/* Main front body */}
                    <path
                        d="M 12 38 
                           L 12 85 
                           Q 12 90 17 90 
                           L 83 90 
                           Q 88 90 88 85 
                           L 88 38 
                           Q 88 33 83 33 
                           L 17 33 
                           Q 12 33 12 38 
                           Z"
                        fill={`url(#folderFront-${uid})`}
                        filter={`url(#dropShadow-${uid})`}
                    />

                    {/* Top edge highlight */}
                    <path
                        d="M 17 33 L 83 33"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                    {/* Subtle inner shadow at top */}
                    <rect
                        x="14"
                        y="34"
                        width="72"
                        height="8"
                        fill={`url(#innerShadow-${uid})`}
                        opacity="0.4"
                    />

                    {/* Left edge shadow for 3D effect */}
                    <path
                        d="M 12 38 L 12 85 Q 12 90 17 90"
                        stroke={shadowColor}
                        strokeWidth="0.5"
                        fill="none"
                        opacity="0.3"
                    />
                </g>

                {/* === TAB (small folder tab on top) === */}
                <path
                    d="M 17 22 
                       L 17 28 
                       L 55 28 
                       L 50 22 
                       Q 48 20 45 20 
                       L 22 20 
                       Q 17 20 17 22 
                       Z"
                    fill={adjustColor(color, 5)}
                    stroke={adjustColor(color, -20)}
                    strokeWidth="0.3"
                />
                
                {/* Tab highlight */}
                <path
                    d="M 22 20 L 45 20"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
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
    education: '#fbbf24',     // warm amber
    work: '#60a5fa',          // sky blue
    health: '#f87171',        // soft red
    vehicle: '#818cf8',       // indigo
    other: '#94a3b8',         // neutral slate
    administrative: '#4f9cf9',
    financial: '#34d399',
    medical: '#f87171',
    professional: '#fbbf24'
};

export default FolderIcon;
