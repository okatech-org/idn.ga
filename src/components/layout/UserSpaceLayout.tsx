import React, { useState } from 'react';
import { Sun, Moon, Settings, LogOut, LayoutDashboard, FileText, User, Shield, CreditCard, FolderLock, Mail, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import IAstedButtonFull from '../iasted/IAstedButtonFull';
import { IAstedChatModal } from '../iasted/IAstedChatModal';
import { useTheme } from '@/context/ThemeContext';
import { IAstedProvider } from '@/context/IAstedContext';

export default function UserSpaceLayout({
    children,
    showSidebar = true,
    showAgent = true
}: {
    children: React.ReactNode;
    showSidebar?: boolean;
    showAgent?: boolean;
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    // State pour le modal de chat texte (double-clic)
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <IAstedProvider>
            <div className="min-h-screen bg-background p-4 md:p-6 transition-colors duration-300">
                <div className="flex gap-6 max-w-[1600px] mx-auto relative">

                    {/* SIDEBAR DÉTACHÉE (Glassmorphism & Floating) */}
                    {showSidebar && (
                        <aside className="hidden md:flex flex-col w-64 glass-card h-[calc(100vh-3rem)] sticky top-6 overflow-hidden border border-white/20">
                            {/* Logo */}
                            <div className="flex items-center gap-4 p-6 cursor-pointer border-b border-white/10" onClick={() => navigate('/')}>
                                <div className="glass w-12 h-12 rounded-2xl flex items-center justify-center p-2 text-primary shadow-glow-primary/50">
                                    <span className="font-bold text-xl tracking-tight">ID</span>
                                </div>
                                <div>
                                    <div className="font-bold text-md tracking-wider">IDN.GA</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Espace Citoyen</div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                                {[
                                    { path: '/profil', icon: LayoutDashboard, label: 'iProfil' },
                                    { path: '/idocument', icon: FileText, label: 'iDocument' },
                                    { path: '/iboite', icon: Mail, label: 'iBoîte' },
                                    { path: '/icarte', icon: CreditCard, label: 'iCarte' },
                                    { path: '/icv', icon: User, label: 'iCV' },
                                    { path: '/iasted', icon: Sparkles, label: 'iAsted' },
                                    { path: '/parametres', icon: Settings, label: 'Paramètres' },
                                ].map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group
                                            ${isActive(item.path)
                                                ? 'bg-primary/20 text-primary shadow-glow-primary/30 translate-x-1'
                                                : 'hover:bg-white/5 hover:translate-x-1 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        {item.label}
                                        {isActive(item.path) && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </nav>

                            {/* Footer Sidebar */}
                            <div className="p-4 border-t border-white/10 space-y-2 bg-black/5">
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium hover:bg-white/5 transition-all"
                                >
                                    {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                                    {isDark ? 'Mode clair' : 'Mode sombre'}
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <LogOut className="w-4 h-4" /> Déconnexion
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* CONTENU PRINCIPAL (Glassmorphic) */}
                    <main className="flex-1 min-w-0 mb-20 md:mb-0 relative">
                        <div className="glass-card p-6 md:p-10 min-h-[calc(100vh-3rem)] relative overflow-hidden backdrop-blur-xl border border-white/10">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10">
                                {children}
                            </div>
                        </div>
                    </main>

                    {/* MOBILE BOTTOM NAV */}
                    {showSidebar && (
                        <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
                            {/* Background Container with Neomorphic Style */}
                            <div className="bg-background/95 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
                                <div className="flex justify-between items-center px-3 h-16 relative">

                                    {/* Left Icons (3 items) */}
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => navigate('/profil')}
                                            className={`flex flex-col items-center justify-center space-y-0.5 min-w-[44px] ${isActive('/profil') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <LayoutDashboard size={20} strokeWidth={isActive('/profil') ? 2.5 : 2} />
                                            <span className="text-[9px] font-medium">Profil</span>
                                        </button>
                                        <button
                                            onClick={() => navigate('/idocument')}
                                            className={`flex flex-col items-center justify-center space-y-0.5 min-w-[44px] ${isActive('/idocument') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <FileText size={20} strokeWidth={isActive('/idocument') ? 2.5 : 2} />
                                            <span className="text-[9px] font-medium">Docs</span>
                                        </button>
                                        <button
                                            onClick={() => navigate('/iboite')}
                                            className={`flex flex-col items-center justify-center space-y-0.5 min-w-[44px] ${isActive('/iboite') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <Mail size={20} strokeWidth={isActive('/iboite') ? 2.5 : 2} />
                                            <span className="text-[9px] font-medium">Boîte</span>
                                        </button>
                                    </div>

                                    {/* Center Space for iAsted */}
                                    <div className="w-16 h-16"></div>

                                    {/* Right Icons (3 items) */}
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => navigate('/icarte')}
                                            className={`flex flex-col items-center justify-center space-y-0.5 min-w-[44px] ${isActive('/icarte') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <CreditCard size={20} strokeWidth={isActive('/icarte') ? 2.5 : 2} />
                                            <span className="text-[9px] font-medium">Cartes</span>
                                        </button>
                                        <button
                                            onClick={() => navigate('/icv')}
                                            className={`flex flex-col items-center justify-center space-y-0.5 min-w-[44px] ${isActive('/icv') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <User size={20} strokeWidth={isActive('/icv') ? 2.5 : 2} />
                                            <span className="text-[9px] font-medium">CV</span>
                                        </button>
                                        <button
                                            onClick={() => navigate('/parametres')}
                                            className={`flex flex-col items-center justify-center space-y-0.5 min-w-[44px] ${isActive('/parametres') ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            <Settings size={20} strokeWidth={isActive('/parametres') ? 2.5 : 2} />
                                            <span className="text-[9px] font-medium">Réglages</span>
                                        </button>
                                    </div>

                                    {/* Central Dock for iAsted Button */}
                                    {showAgent && (
                                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-20 h-20 flex items-center justify-center pointer-events-none">
                                            {/* The button itself needs pointer-events-auto */}
                                            <div className="pointer-events-auto transform scale-90">
                                                <IAstedButtonFull
                                                    fixedPosition={false}
                                                    size="md"
                                                    onDoubleClick={() => setIsChatModalOpen(true)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                    {/* iAsted Agent - Persistent (Desktop Only) */}
                    {showAgent && (
                        <div className="hidden md:block fixed bottom-6 right-6 z-50">
                            <IAstedButtonFull onDoubleClick={() => setIsChatModalOpen(true)} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Chat Texte (ouvert par double-clic) */}
            <IAstedChatModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
            />
        </IAstedProvider>
    );
}


