import { useNavigate } from "react-router-dom";
import { User, Shield, Bell, Globe, HelpCircle, ChevronRight, LogOut, Moon, Sun, Mail, MessageSquare, ExternalLink, X } from "lucide-react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const GeneralSettings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
    const [apps, setApps] = useState([
        { id: "1", name: "impots.ga", permissions: ["Identité"] },
        { id: "2", name: "cnss.ga", permissions: ["Identité"] },
    ]);

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-3">
                {/* Header */}
                <h1 className="text-xl font-bold text-foreground shrink-0">Paramètres</h1>

                {/* Main Content - 2 columns */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0 overflow-auto">
                    {/* Left Column */}
                    <div className="space-y-3">
                        {/* Profile */}
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-4 rounded-xl flex items-center gap-3",
                                "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
                                "border border-slate-300/80 dark:border-white/10",
                                "shadow-sm dark:shadow-none"
                            )}
                        >
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/20">
                                <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-base text-foreground">Jean Dupont</h2>
                                <p className="text-xs text-muted-foreground truncate">jean.dupont@example.com</p>
                            </div>
                            <button className="text-xs text-primary font-medium">Modifier</button>
                        </motion.div>

                        {/* Account */}
                        <SettingsGroup title="Compte">
                            <SettingsItem icon={User} title="Infos personnelles" />
                            <SettingsItem icon={Shield} title="Sécurité" onClick={() => navigate("/settings/security")} />
                        </SettingsGroup>

                        {/* Preferences */}
                        <SettingsGroup title="Préférences">
                            <SettingsItem icon={Globe} title="Langue" value="FR" />
                            <SettingToggle
                                icon={isDark ? Moon : Sun}
                                title="Mode Sombre"
                                checked={isDark}
                                onCheckedChange={toggleTheme}
                            />
                        </SettingsGroup>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                        {/* Apps */}
                        <SettingsGroup title="Applications">
                            {apps.map((app) => (
                                <div key={app.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 group">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-primary" />
                                        <div>
                                            <span className="text-sm font-medium text-foreground">{app.name}</span>
                                            <p className="text-xs text-muted-foreground">{app.permissions.join(", ")}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setApps(prev => prev.filter(a => a.id !== app.id))}
                                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </SettingsGroup>

                        {/* Notifications */}
                        <SettingsGroup title="Notifications">
                            <SettingToggle icon={Mail} title="Emails" checked={notifications.email} onCheckedChange={(c) => setNotifications({ ...notifications, email: c })} />
                            <SettingToggle icon={Bell} title="Push" checked={notifications.push} onCheckedChange={(c) => setNotifications({ ...notifications, push: c })} />
                            <SettingToggle icon={MessageSquare} title="SMS" checked={notifications.sms} onCheckedChange={(c) => setNotifications({ ...notifications, sms: c })} />
                        </SettingsGroup>

                        {/* Support */}
                        <SettingsGroup title="Support">
                            <SettingsItem icon={HelpCircle} title="Aide" />
                        </SettingsGroup>
                    </div>
                </div>

                {/* Logout */}
                <button className={cn(
                    "shrink-0 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2",
                    "bg-white/60 dark:bg-white/5 border border-red-200/60 dark:border-red-500/20",
                    "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                )}>
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                </button>
            </div>
        </UserSpaceLayout>
    );
};

const SettingsGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 px-1">{title}</p>
        <div className={cn(
            "rounded-xl p-2 space-y-1",
            "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
            "border border-slate-300/80 dark:border-white/10",
            "shadow-sm dark:shadow-none"
        )}>
            {children}
        </div>
    </div>
);

const SettingsItem = ({ icon: Icon, title, value, onClick }: { icon: React.ElementType; title: string; value?: string; onClick?: () => void }) => (
    <div onClick={onClick} className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 group">
        <div className="flex items-center gap-2.5">
            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
            {value && <span className="text-xs text-muted-foreground">{value}</span>}
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </div>
    </div>
);

const SettingToggle = ({ icon: Icon, title, checked, onCheckedChange }: { icon: React.ElementType; title: string; checked: boolean; onCheckedChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between p-2.5 rounded-lg">
        <div className="flex items-center gap-2.5">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn("w-10 h-6 rounded-full transition-colors relative", checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700")}
        >
            <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-1")} />
        </button>
    </div>
);

export default GeneralSettings;
