import { useNavigate, useSearchParams } from "react-router-dom";
import {
    User, Shield, Bell, Globe, HelpCircle, ChevronRight, LogOut,
    Moon, Sun, Mail, MessageSquare, X, Smartphone, Key, Camera,
    Eye, Download, Trash2, Link, ExternalLink, Star, Plus,
    Building2, Wallet, HeartPulse, Briefcase, CheckCircle2, AlertCircle,
    Lock, Fingerprint, History, FileText, UserX, Settings2
} from "lucide-react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface ConnectedApp {
    id: string;
    name: string;
    domain: string;
    icon: React.ElementType;
    color: string;
    permissions: string[];
    lastAccess: string;
    connected: boolean;
}

interface QuickAccessSite {
    id: string;
    name: string;
    url: string;
    icon: string;
    color: string;
}

type SettingsTab = "profil" | "securite" | "applications" | "notifications" | "confidentialite";

const tabConfig: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "securite", label: "Sécurité", icon: Shield },
    { id: "applications", label: "Applications", icon: Link },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "confidentialite", label: "Confidentialité", icon: Eye },
];

const GeneralSettings = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    // Get active tab from URL or default to 'profil'
    const activeTab = (searchParams.get("tab") as SettingsTab) || "profil";
    const setActiveTab = (tab: SettingsTab) => {
        setSearchParams({ tab });
    };

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        security: true,
        marketing: false,
        newsletter: true,
        updates: true
    });

    const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([
        { id: "1", name: "Impôts (DGI)", domain: "impots.dgi.ga", icon: Wallet, color: "text-blue-500 bg-blue-500/10", permissions: ["Identité", "Adresse"], lastAccess: "Il y a 2 jours", connected: true },
        { id: "2", name: "CNSS", domain: "portail.cnss.ga", icon: Building2, color: "text-emerald-500 bg-emerald-500/10", permissions: ["Identité", "Numéro SS"], lastAccess: "Il y a 1 semaine", connected: true },
        { id: "3", name: "Santé", domain: "sante.gov.ga", icon: HeartPulse, color: "text-red-500 bg-red-500/10", permissions: ["Identité"], lastAccess: "Non utilisé", connected: false },
        { id: "4", name: "Emploi (ONE)", domain: "one.emploi.ga", icon: Briefcase, color: "text-indigo-500 bg-indigo-500/10", permissions: ["Identité", "CV"], lastAccess: "Il y a 3 mois", connected: true },
    ]);

    const [quickAccessSites, setQuickAccessSites] = useState<QuickAccessSite[]>([
        { id: "1", name: "Mairie", url: "https://mairie.ga", icon: "🏛️", color: "bg-emerald-500/10" },
        { id: "2", name: "Impôts", url: "https://dgi.ga", icon: "💰", color: "bg-blue-500/10" },
        { id: "3", name: "CNSS", url: "https://cnss.ga", icon: "🏥", color: "bg-red-500/10" },
        { id: "4", name: "Emploi", url: "https://one.ga", icon: "💼", color: "bg-indigo-500/10" },
    ]);

    const [selectedApp, setSelectedApp] = useState<ConnectedApp | null>(null);

    const disconnectApp = (appId: string) => {
        setConnectedApps(prev => prev.map(app => app.id === appId ? { ...app, connected: false } : app));
        setSelectedApp(null);
    };

    const removeQuickAccess = (siteId: string) => {
        setQuickAccessSites(prev => prev.filter(s => s.id !== siteId));
    };

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-3 overflow-hidden">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-foreground">Paramètres</h1>
                    <span className="text-xs text-muted-foreground">Version 2.1.0</span>
                </div>

                {/* Horizontal Tab Menu */}
                <div className={cn(
                    "shrink-0 p-1 rounded-xl flex gap-1",
                    "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
                    "border border-slate-300/80 dark:border-white/10",
                    "shadow-sm dark:shadow-none"
                )}>
                    {tabConfig.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-md"
                                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === "profil" && (
                            <TabContent key="profil">
                                <ProfilSection isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />
                            </TabContent>
                        )}
                        {activeTab === "securite" && (
                            <TabContent key="securite">
                                <SecuriteSection navigate={navigate} />
                            </TabContent>
                        )}
                        {activeTab === "applications" && (
                            <TabContent key="applications">
                                <ApplicationsSection
                                    connectedApps={connectedApps}
                                    quickAccessSites={quickAccessSites}
                                    onSelectApp={setSelectedApp}
                                    onRemoveQuickAccess={removeQuickAccess}
                                />
                            </TabContent>
                        )}
                        {activeTab === "notifications" && (
                            <TabContent key="notifications">
                                <NotificationsSection notifications={notifications} setNotifications={setNotifications} />
                            </TabContent>
                        )}
                        {activeTab === "confidentialite" && (
                            <TabContent key="confidentialite">
                                <ConfidentialiteSection />
                            </TabContent>
                        )}
                    </AnimatePresence>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => navigate("/login")}
                    className={cn(
                        "shrink-0 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2",
                        "bg-white/60 dark:bg-white/5 border border-red-200/60 dark:border-red-500/20",
                        "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10",
                        "transition-colors"
                    )}
                >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                </button>
            </div>

            {/* App Detail Modal */}
            <AnimatePresence>
                {selectedApp && (
                    <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} onDisconnect={disconnectApp} />
                )}
            </AnimatePresence>
        </UserSpaceLayout>
    );
};

// Tab Content Wrapper
const TabContent = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full"
    >
        {children}
    </motion.div>
);

// ============================================
// SECTION 1: PROFIL
// ============================================
const ProfilSection = ({ isDark, toggleTheme, navigate }: { isDark: boolean; toggleTheme: () => void; navigate: (path: string) => void }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Profile Card */}
        <SettingsCard className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-3 border-primary/20">
                        <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4 text-white" />
                    </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-bold text-xl text-foreground">Jean Dupont</h2>
                    <p className="text-sm text-muted-foreground">jean.dupont@example.com</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Identité vérifiée
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            Niveau 3
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/id-card")}
                    className="py-2.5 px-5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90"
                >
                    Voir ma carte d'identité
                </button>
            </div>
        </SettingsCard>

        {/* Personal Info */}
        <SettingsCard title="Informations personnelles">
            <SettingsItem icon={User} title="Nom complet" value="Jean Dupont" />
            <SettingsItem icon={Mail} title="Email" value="jean.dupont@example.com" />
            <SettingsItem icon={Smartphone} title="Téléphone" value="+241 77 00 00 00" />
            <SettingsItem icon={Globe} title="Nationalité" value="Gabonaise" />
            <SettingsItem icon={FileText} title="Numéro CNI" value="GA-XXXX-XXXX" />
        </SettingsCard>

        {/* Preferences */}
        <SettingsCard title="Préférences">
            <SettingsItem icon={Globe} title="Langue" value="Français" />
            <SettingToggle
                icon={isDark ? Moon : Sun}
                title="Mode Sombre"
                subtitle="Interface adaptée à la nuit"
                checked={isDark}
                onCheckedChange={toggleTheme}
            />
            <SettingsItem icon={Settings2} title="Accessibilité" subtitle="Taille du texte, contraste" />
        </SettingsCard>
    </div>
);

// ============================================
// SECTION 2: SÉCURITÉ
// ============================================
const SecuriteSection = ({ navigate }: { navigate: (path: string) => void }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Password & 2FA */}
        <SettingsCard title="Authentification">
            <SettingsItem icon={Key} title="Mot de passe" subtitle="Modifié il y a 3 mois" onClick={() => navigate("/settings/security")} />
            <SettingsItem icon={Fingerprint} title="Authentification 2FA" subtitle="Activée via application" badge="Actif" badgeColor="bg-green-500" />
            <SettingsItem icon={Smartphone} title="Code de récupération" subtitle="5 codes restants" />
        </SettingsCard>

        {/* Devices */}
        <SettingsCard title="Appareils connectés" badge="2 actifs">
            <div className="space-y-2">
                <DeviceItem name="iPhone 15 Pro" location="Libreville" current />
                <DeviceItem name="MacBook Pro" location="Libreville" />
            </div>
            <button className="w-full mt-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                Déconnecter tous les appareils
            </button>
        </SettingsCard>

        {/* Security Activity */}
        <SettingsCard title="Activité récente" className="lg:col-span-2">
            <div className="space-y-2">
                <ActivityItem title="Connexion réussie" time="Aujourd'hui, 14:32" location="Libreville" success />
                <ActivityItem title="Mot de passe modifié" time="Il y a 3 mois" location="Libreville" success />
                <ActivityItem title="Tentative de connexion bloquée" time="Il y a 2 semaines" location="Lagos, Nigeria" />
            </div>
            <button className="w-full mt-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 border border-primary/20">
                Voir tout l'historique
            </button>
        </SettingsCard>
    </div>
);

// ============================================
// SECTION 3: APPLICATIONS
// ============================================
const ApplicationsSection = ({
    connectedApps,
    quickAccessSites,
    onSelectApp,
    onRemoveQuickAccess
}: {
    connectedApps: ConnectedApp[];
    quickAccessSites: QuickAccessSite[];
    onSelectApp: (app: ConnectedApp) => void;
    onRemoveQuickAccess: (id: string) => void;
}) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Connected Apps */}
        <SettingsCard
            title="Applications Connectées"
            badge={`${connectedApps.filter(a => a.connected).length} actives`}
            action={<button className="text-xs text-primary font-medium">+ Ajouter</button>}
        >
            <p className="text-xs text-muted-foreground pb-2">
                Services autorisés à accéder à votre identité IDN.GA via OAuth
            </p>
            {connectedApps.map((app) => (
                <div
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg cursor-pointer group",
                        "hover:bg-black/5 dark:hover:bg-white/5",
                        !app.connected && "opacity-50"
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", app.color)}>
                            <app.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-foreground">{app.name}</span>
                            <p className="text-xs text-muted-foreground">{app.permissions.join(", ")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {app.connected ? (
                            <span className="text-xs text-green-500 font-medium">Connecté</span>
                        ) : (
                            <span className="text-xs text-muted-foreground">Révoqué</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                </div>
            ))}
        </SettingsCard>

        {/* Quick Access */}
        <SettingsCard
            title="Accès Rapides"
            badge={`${quickAccessSites.length} favoris`}
            action={<button className="text-xs text-primary font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</button>}
        >
            <p className="text-xs text-muted-foreground pb-2">
                Sites affichés sur votre page d'accueil iProfil
            </p>
            <div className="grid grid-cols-2 gap-2">
                {quickAccessSites.map((site) => (
                    <div
                        key={site.id}
                        className={cn(
                            "relative p-3 rounded-lg text-center group",
                            "bg-slate-50 dark:bg-white/5",
                            "border border-slate-200 dark:border-white/10",
                            "hover:border-primary/30"
                        )}
                    >
                        <button
                            onClick={() => onRemoveQuickAccess(site.id)}
                            className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <span className="text-2xl">{site.icon}</span>
                        <p className="text-sm font-medium text-foreground mt-1">{site.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{site.url}</p>
                    </div>
                ))}
            </div>
            <button className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 border border-dashed border-primary/30 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un site favori
            </button>
        </SettingsCard>
    </div>
);

// ============================================
// SECTION 4: NOTIFICATIONS
// ============================================
const NotificationsSection = ({ notifications, setNotifications }: { notifications: any; setNotifications: (n: any) => void }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Communication Channels */}
        <SettingsCard title="Canaux de communication">
            <SettingToggle icon={Mail} title="Email" subtitle="Notifications par email" checked={notifications.email} onCheckedChange={(c) => setNotifications({ ...notifications, email: c })} />
            <SettingToggle icon={Bell} title="Notifications Push" subtitle="Sur votre appareil" checked={notifications.push} onCheckedChange={(c) => setNotifications({ ...notifications, push: c })} />
            <SettingToggle icon={MessageSquare} title="SMS" subtitle="Messages texte" checked={notifications.sms} onCheckedChange={(c) => setNotifications({ ...notifications, sms: c })} />
        </SettingsCard>

        {/* Notification Types */}
        <SettingsCard title="Types de notifications">
            <SettingToggle icon={Shield} title="Alertes sécurité" subtitle="Connexions suspectes, changements" checked={notifications.security} onCheckedChange={(c) => setNotifications({ ...notifications, security: c })} />
            <SettingToggle icon={FileText} title="Mises à jour documents" subtitle="Nouveaux documents disponibles" checked={notifications.updates} onCheckedChange={(c) => setNotifications({ ...notifications, updates: c })} />
            <SettingToggle icon={Mail} title="Newsletter" subtitle="Actualités IDN.GA" checked={notifications.newsletter} onCheckedChange={(c) => setNotifications({ ...notifications, newsletter: c })} />
            <SettingToggle icon={Star} title="Offres et promotions" subtitle="Services partenaires" checked={notifications.marketing} onCheckedChange={(c) => setNotifications({ ...notifications, marketing: c })} />
        </SettingsCard>
    </div>
);

// ============================================
// SECTION 5: CONFIDENTIALITÉ
// ============================================
const ConfidentialiteSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Privacy Settings */}
        <SettingsCard title="Vie privée">
            <SettingsItem icon={Eye} title="Visibilité du profil" subtitle="Qui peut voir votre profil" value="Limité" />
            <SettingsItem icon={User} title="Partage d'informations" subtitle="Données partagées avec les services" />
            <SettingToggle icon={History} title="Historique d'activité" subtitle="Enregistrer l'historique de navigation" checked={true} onCheckedChange={() => { }} />
        </SettingsCard>

        {/* Data Management */}
        <SettingsCard title="Gestion des données">
            <SettingsItem icon={Download} title="Exporter mes données" subtitle="Télécharger toutes vos informations" />
            <SettingsItem icon={FileText} title="Demander une copie" subtitle="Format PDF ou JSON" />
            <SettingsItem icon={History} title="Historique des accès" subtitle="Voir qui a consulté vos données" />
        </SettingsCard>

        {/* Legal */}
        <SettingsCard title="Légal et support" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <SettingsItem icon={FileText} title="Conditions d'utilisation" />
                <SettingsItem icon={Shield} title="Politique de confidentialité" />
                <SettingsItem icon={HelpCircle} title="Centre d'aide" />
                <SettingsItem icon={MessageSquare} title="Contacter le support" />
            </div>
        </SettingsCard>

        {/* Danger Zone */}
        <SettingsCard title="Zone de danger" className="lg:col-span-2 border-red-200 dark:border-red-500/20">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                        <UserX className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-600">Supprimer mon compte</p>
                        <p className="text-xs text-red-500/70">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                    </div>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">
                    Supprimer
                </button>
            </div>
        </SettingsCard>
    </div>
);

// ============================================
// REUSABLE COMPONENTS
// ============================================
const SettingsCard = ({ title, children, className, badge, action }: { title?: string; children: React.ReactNode; className?: string; badge?: string; action?: React.ReactNode }) => (
    <div className={cn(
        "p-4 rounded-xl",
        "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
        "border border-slate-300/80 dark:border-white/10",
        "shadow-sm dark:shadow-none",
        className
    )}>
        {title && (
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    {badge && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {action}
            </div>
        )}
        {children}
    </div>
);

const SettingsItem = ({ icon: Icon, title, subtitle, value, badge, badgeColor, onClick, danger }: { icon: React.ElementType; title: string; subtitle?: string; value?: string; badge?: string; badgeColor?: string; onClick?: () => void; danger?: boolean }) => (
    <div onClick={onClick} className={cn("flex items-center justify-between p-2.5 rounded-lg cursor-pointer group", "hover:bg-black/5 dark:hover:bg-white/5", danger && "hover:bg-red-50 dark:hover:bg-red-500/10")}>
        <div className="flex items-center gap-2.5">
            <Icon className={cn("w-5 h-5 transition-colors", danger ? "text-red-500" : "text-muted-foreground group-hover:text-primary")} />
            <div>
                <span className={cn("text-sm font-medium", danger ? "text-red-600" : "text-foreground")}>{title}</span>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            {badge && <span className={cn("text-[10px] font-semibold text-white px-2 py-0.5 rounded-full", badgeColor || "bg-slate-500")}>{badge}</span>}
            {value && <span className="text-xs text-muted-foreground">{value}</span>}
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </div>
    </div>
);

const SettingToggle = ({ icon: Icon, title, subtitle, checked, onCheckedChange }: { icon: React.ElementType; title: string; subtitle?: string; checked: boolean; onCheckedChange: (c: boolean) => void }) => (
    <div className="flex items-center justify-between p-2.5 rounded-lg">
        <div className="flex items-center gap-2.5">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
                <span className="text-sm font-medium text-foreground">{title}</span>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
        <button onClick={() => onCheckedChange(!checked)} className={cn("w-11 h-6 rounded-full transition-colors relative", checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700")}>
            <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
        </button>
    </div>
);

const DeviceItem = ({ name, location, current }: { name: string; location: string; current?: boolean }) => (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-white/5">
        <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <div>
                <span className="text-sm font-medium text-foreground">{name}</span>
                <p className="text-xs text-muted-foreground">{location}</p>
            </div>
        </div>
        {current ? (
            <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">Cet appareil</span>
        ) : (
            <button className="text-xs text-red-500 font-medium hover:underline">Déconnecter</button>
        )}
    </div>
);

const ActivityItem = ({ title, time, location, success }: { title: string; time: string; location: string; success?: boolean }) => (
    <div className="flex items-center justify-between p-2.5 rounded-lg">
        <div className="flex items-center gap-2.5">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", success ? "bg-green-50 dark:bg-green-500/10" : "bg-red-50 dark:bg-red-500/10")}>
                {success ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div>
                <span className="text-sm font-medium text-foreground">{title}</span>
                <p className="text-xs text-muted-foreground">{location}</p>
            </div>
        </div>
        <span className="text-xs text-muted-foreground">{time}</span>
    </div>
);

const AppDetailModal = ({ app, onClose, onDisconnect }: { app: ConnectedApp; onClose: () => void; onDisconnect: (id: string) => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", app.color)}><app.icon className="w-6 h-6" /></div>
                    <div><h3 className="text-lg font-bold">{app.name}</h3><p className="text-sm text-muted-foreground">{app.domain}</p></div>
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Permissions accordées</p><div className="flex flex-wrap gap-2">{app.permissions.map((perm, i) => (<span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{perm}</span>))}</div></div>
                <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Dernier accès</p><p className="text-sm text-foreground">{app.lastAccess}</p></div>
                <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Statut</p><div className="flex items-center gap-2">{app.connected ? (<><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-sm font-medium text-green-600">Connecté</span></>) : (<><span className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-sm font-medium text-muted-foreground">Déconnecté</span></>)}</div></div>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-white/5 border-t border-border flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-border hover:bg-slate-50">Fermer</button>
                {app.connected && (<button onClick={() => onDisconnect(app.id)} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">Révoquer l'accès</button>)}
            </div>
        </motion.div>
    </motion.div>
);

export default GeneralSettings;
