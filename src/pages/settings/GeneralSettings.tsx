import { useNavigate } from "react-router-dom";
import { User, Shield, Bell, Globe, HelpCircle, Info, ChevronRight, LogOut, Moon, Sun, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { useTheme } from "@/context/ThemeContext";
import SettingToggle from "@/components/settings/SettingToggle";
import { useState } from "react";

const GeneralSettings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    });

    return (
        <UserSpaceLayout>
            <div className="space-y-8 pb-24 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>

                {/* Profile Section */}
                <div className="neu-raised p-6 flex items-center space-x-5 rounded-3xl">
                    <div className="w-20 h-20 rounded-full neu-inset p-1 overflow-hidden border-2 border-primary/10 relative group cursor-pointer">
                        <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full object-cover rounded-full transition-opacity group-hover:opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-foreground">Modifier</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-xl text-foreground">Jean Dupont</h2>
                        <p className="text-sm text-muted-foreground">jean.dupont@example.com</p>
                        <div className="mt-2 flex space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">Citoyen</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 uppercase tracking-wide">Vérifié</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="neu-raised text-primary hover:text-primary/80 rounded-xl">Modifier</Button>
                </div>

                {/* Settings Groups */}
                <div className="space-y-8">
                    <SettingsGroup title="Compte">
                        <SettingsItem icon={User} title="Informations personnelles" onClick={() => { }} />
                        <SettingsItem icon={Shield} title="Sécurité et confidentialité" onClick={() => navigate("/settings/security")} />
                    </SettingsGroup>

                    <SettingsGroup title="Notifications">
                        <SettingToggle
                            icon={Mail}
                            title="Emails"
                            description="Recevoir des mises à jour par email"
                            checked={notifications.email}
                            onCheckedChange={(c) => setNotifications({ ...notifications, email: c })}
                            iconColor="text-blue-500"
                        />
                        <SettingToggle
                            icon={Bell}
                            title="Push Notifications"
                            description="Alertes sur votre appareil"
                            checked={notifications.push}
                            onCheckedChange={(c) => setNotifications({ ...notifications, push: c })}
                            iconColor="text-red-500"
                        />
                        <SettingToggle
                            icon={MessageSquare}
                            title="SMS"
                            description="Codes de sécurité et alertes urgentes"
                            checked={notifications.sms}
                            onCheckedChange={(c) => setNotifications({ ...notifications, sms: c })}
                            iconColor="text-green-500"
                        />
                    </SettingsGroup>

                    <SettingsGroup title="Préférences">
                        <SettingsItem icon={Globe} title="Langue" value="Français" onClick={() => { }} />
                        <SettingToggle
                            icon={isDark ? Moon : Sun}
                            title="Mode Sombre"
                            description="Ajuster l'apparence de l'application"
                            checked={isDark}
                            onCheckedChange={toggleTheme}
                            iconColor={isDark ? "text-indigo-400" : "text-orange-500"}
                        />
                    </SettingsGroup>

                    <SettingsGroup title="Support">
                        <SettingsItem icon={HelpCircle} title="Aide et support" onClick={() => { }} />
                        <SettingsItem icon={Info} title="À propos de IDN.GA" onClick={() => { }} />
                    </SettingsGroup>

                    <button className="w-full py-4 rounded-xl neu-raised text-destructive font-medium hover:text-destructive/80 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center space-x-2 active:neu-inset">
                        <LogOut size={20} />
                        <span>Se déconnecter</span>
                    </button>

                    <p className="text-center text-xs text-muted-foreground/60 pt-4">Version 1.0.0 (Build 2024.11.25)</p>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

const SettingsGroup = ({ title, children }: any) => (
    <div>
        <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wider">{title}</h3>
        <div className="neu-raised rounded-2xl p-2 space-y-1">
            {children}
        </div>
    </div>
);

const SettingsItem = ({ icon: Icon, title, value, onClick }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
        <div className="flex items-center space-x-4">
            <div className="p-2.5 neu-raised rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                <Icon size={20} />
            </div>
            <span className="font-medium text-sm text-foreground">{title}</span>
        </div>
        <div className="flex items-center space-x-3">
            {value && <span className="text-sm text-muted-foreground">{value}</span>}
            <ChevronRight size={18} className="text-muted-foreground/50" />
        </div>
    </div>
);

export default GeneralSettings;
