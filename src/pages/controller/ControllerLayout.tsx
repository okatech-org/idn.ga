import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    Clock,
    History,
    QrCode,
    Settings,
    Bell,
    Moon,
    Sun,
    LogOut,
    Fingerprint,
    ChevronRight,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';


const ControllerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();


    // Mock counts for badges
    const pendingCount = 24;
    const overdueCount = 3;



    const navItems = [
        {
            path: '/controller',
            label: 'Dashboard',
            icon: LayoutDashboard,
            exact: true
        },
        {
            path: '/controller/queue',
            label: 'File d\'attente',
            icon: Clock,
            count: pendingCount,
            alert: overdueCount > 0
        },
        {
            path: '/controller/history',
            label: 'Historique',
            icon: History
        },
        {
            path: '/controller/scanner',
            label: 'Scanner',
            icon: QrCode
        },
        {
            path: '/controller/settings',
            label: 'Paramètres',
            icon: Settings
        }
    ];

    const isActive = (path: string, exact?: boolean) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className={cn(
            "min-h-screen",
            "bg-slate-100 dark:bg-slate-950"
        )}>
            <div className="relative z-10 flex h-screen overflow-hidden p-4 md:p-6 gap-4 max-w-[1800px] mx-auto">
                {/* Sidebar */}
                <aside className={cn(
                    "w-56 flex-shrink-0 p-4 flex flex-col overflow-hidden rounded-xl",
                    "bg-white dark:bg-slate-900",
                    "border border-slate-200 dark:border-slate-800"
                )}>
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-slate-900 dark:text-white">iControl</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Agent Vérificateur</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const active = item.exact
                                ? isActive(item.path, true)
                                : (isActive(item.path) && !isActive('/controller', true)) || (item.exact && location.pathname === item.path);

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={cn(
                                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                                        active
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {item.alert && (
                                            <AlertTriangle className="w-3 h-3 text-red-500" />
                                        )}
                                        {item.count !== undefined && (
                                            <Badge className="bg-primary/10 text-primary text-xs px-1.5 py-0">
                                                {item.count}
                                            </Badge>
                                        )}
                                    </div>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Agent Info Card */}
                    <div className={cn(
                        "p-3 rounded-lg mb-4",
                        "bg-slate-50 dark:bg-slate-800",
                        "border border-slate-200 dark:border-slate-700"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                <Fingerprint className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Agent Koumba</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Niveau 2</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                "text-slate-600 dark:text-slate-300",
                                "hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-4 h-4" /> Mode clair
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4" /> Mode sombre
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/demo')}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                "text-red-600 dark:text-red-400",
                                "hover:bg-red-50 dark:hover:bg-red-950"
                            )}
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <div className={cn(
                        "p-3 mb-4 flex items-center justify-between rounded-xl",
                        "bg-white dark:bg-slate-900",
                        "border border-slate-200 dark:border-slate-800"
                    )}>
                        <div className="flex items-center gap-2">
                            {/* Breadcrumb */}
                            <span className="text-sm text-slate-500 dark:text-slate-400">iControl</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {navItems.find(item =>
                                    item.exact ? isActive(item.path, true) : isActive(item.path) && !isActive('/controller', true)
                                )?.label || 'Dashboard'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "relative h-8 w-8",
                                    "bg-white dark:bg-slate-900",
                                    "border-slate-200 dark:border-slate-700"
                                )}
                            >
                                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                    3
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className={cn(
                        "flex-1 p-5 overflow-hidden rounded-xl",
                        "bg-white dark:bg-slate-900",
                        "border border-slate-200 dark:border-slate-800"
                    )}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ControllerLayout;
