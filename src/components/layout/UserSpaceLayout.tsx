import React from 'react';
import { Sun, Moon, Settings, LogOut, LayoutDashboard, FileText, User, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import IAstedButtonFull from '../iasted/IAstedButtonFull';
import { useTheme } from '@/context/ThemeContext';

export default function UserSpaceLayout({ children, showSidebar = true }: { children: React.ReactNode; showSidebar?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 transition-colors duration-300">
            <div className="flex gap-6 max-w-[1600px] mx-auto relative">

                {/* SIDEBAR DÉTACHÉE */}
                {showSidebar && (
                    <aside className="neu-card w-60 flex-shrink-0 p-6 hidden md:flex flex-col min-h-[calc(100vh-3rem)] overflow-hidden">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="neu-raised w-12 h-12 rounded-full flex items-center justify-center p-2 text-primary">
                                <span className="font-bold text-lg">ID</span>
                            </div>
                            <div>
                                <div className="font-bold text-sm">IDN.GA</div>
                                <div className="text-xs text-muted-foreground">Espace Utilisateur</div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-3 flex-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/dashboard') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Tableau de bord
                            </button>
                            <button
                                onClick={() => navigate('/documents')}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/documents') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                            >
                                <FileText className="w-4 h-4" />
                                Mes Documents
                            </button>
                            <button
                                onClick={() => navigate('/cv')}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/cv') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                            >
                                <User className="w-4 h-4" />
                                Mon CV
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/settings') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                            >
                                <Settings className="w-4 h-4" />
                                Paramètres
                            </button>
                        </nav>

                        {/* Footer Sidebar */}
                        <div className="mt-auto pt-4 border-t border-border/20 space-y-3">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm neu-raised hover:shadow-neo-md transition-all"
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {isDark ? 'Mode clair' : 'Mode sombre'}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive neu-raised hover:shadow-neo-md transition-all"
                            >
                                <LogOut className="w-4 h-4" /> Déconnexion
                            </button>
                        </div>
                    </aside>
                )}

                {/* CONTENU PRINCIPAL */}
                <main className="flex-1 min-w-0 mb-20 md:mb-0">
                    <div className="neu-card p-4 md:p-8 min-h-[calc(100vh-3rem)] relative overflow-hidden">
                        {children}
                    </div>
                </main>

                {/* MOBILE BOTTOM NAV */}
                {showSidebar && (
                    <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
                        {/* Background Container with Neomorphic Style */}
                        <div className="bg-background/95 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
                            <div className="flex justify-between items-center px-6 h-16 relative">

                                {/* Left Icons */}
                                <div className="flex space-x-8">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className={`flex flex-col items-center justify-center space-y-1 ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
                                    >
                                        <LayoutDashboard size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                                        {isActive('/dashboard') && <span className="w-1 h-1 bg-primary rounded-full"></span>}
                                    </button>
                                    <button
                                        onClick={() => navigate('/documents')}
                                        className={`flex flex-col items-center justify-center space-y-1 ${isActive('/documents') ? 'text-primary' : 'text-muted-foreground'}`}
                                    >
                                        <FileText size={24} strokeWidth={isActive('/documents') ? 2.5 : 2} />
                                        {isActive('/documents') && <span className="w-1 h-1 bg-primary rounded-full"></span>}
                                    </button>
                                </div>

                                {/* Center Space for iAsted */}
                                <div className="w-16 h-16"></div>

                                {/* Right Icons */}
                                <div className="flex space-x-8">
                                    <button
                                        onClick={() => navigate('/cv')}
                                        className={`flex flex-col items-center justify-center space-y-1 ${isActive('/cv') ? 'text-primary' : 'text-muted-foreground'}`}
                                    >
                                        <User size={24} strokeWidth={isActive('/cv') ? 2.5 : 2} />
                                        {isActive('/cv') && <span className="w-1 h-1 bg-primary rounded-full"></span>}
                                    </button>
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className={`flex flex-col items-center justify-center space-y-1 ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}
                                    >
                                        <Settings size={24} strokeWidth={isActive('/settings') ? 2.5 : 2} />
                                        {isActive('/settings') && <span className="w-1 h-1 bg-primary rounded-full"></span>}
                                    </button>
                                </div>

                                {/* Central Dock for iAsted Button */}
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-20 h-20 flex items-center justify-center pointer-events-none">
                                    {/* The button itself needs pointer-events-auto */}
                                    <div className="pointer-events-auto transform scale-90">
                                        <IAstedButtonFull fixedPosition={false} size="md" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* iAsted Agent - Persistent (Desktop Only) */}
                <div className="hidden md:block fixed bottom-6 right-6 z-50">
                    <IAstedButtonFull />
                </div>
            </div>
        </div>
    );
}
