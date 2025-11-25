import React from 'react';
import { Sun, Moon, Settings, LogOut, LayoutDashboard, Users, FileText, BarChart3, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 transition-colors duration-300">
            <div className="flex gap-6 max-w-[1600px] mx-auto relative">

                {/* ADMIN SIDEBAR */}
                <aside className="neu-card w-60 flex-shrink-0 p-6 hidden md:flex flex-col min-h-[calc(100vh-3rem)] overflow-hidden">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="neu-raised w-12 h-12 rounded-full flex items-center justify-center p-2 text-primary">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">IDN.GA</div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider text-primary">Admin Système</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-3 flex-1">
                        <button
                            onClick={() => navigate('/admin')}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/admin') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Tableau de bord
                        </button>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/admin/users') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                        >
                            <Users className="w-4 h-4" />
                            Utilisateurs
                        </button>
                        <button
                            onClick={() => navigate('/admin/verifications')}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/admin/verifications') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Vérifications
                        </button>
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/admin/reports') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Rapports
                        </button>
                        <button
                            onClick={() => navigate('/admin/settings')}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${isActive('/admin/settings') ? 'neu-inset text-primary' : 'neu-raised hover:shadow-neo-md'}`}
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

                {/* CONTENU PRINCIPAL */}
                <main className="flex-1 min-w-0 mb-20 md:mb-0">
                    <div className="neu-card p-4 md:p-8 min-h-[calc(100vh-3rem)] relative overflow-hidden">
                        {children}
                    </div>
                </main>

                {/* MOBILE BOTTOM NAV (Simplified for Admin) */}
                <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
                    <div className="bg-background/95 backdrop-blur-md border-t border-white/20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
                        <div className="flex justify-around items-center px-6 h-16">
                            <button onClick={() => navigate('/admin')} className={`flex flex-col items-center justify-center space-y-1 ${isActive('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <LayoutDashboard size={24} />
                            </button>
                            <button onClick={() => navigate('/admin/users')} className={`flex flex-col items-center justify-center space-y-1 ${isActive('/admin/users') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <Users size={24} />
                            </button>
                            <button onClick={() => navigate('/admin/verifications')} className={`flex flex-col items-center justify-center space-y-1 ${isActive('/admin/verifications') ? 'text-primary' : 'text-muted-foreground'}`}>
                                <FileText size={24} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
