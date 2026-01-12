import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Bell,
    User,
    Shield,
    Fingerprint,
    Moon,
    Sun,
    Globe,
    HelpCircle,
    FileText,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const ControllerSettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState({
        urgentRequests: true,
        flaggedDocuments: true,
        delayReminders: false,
        dailySummary: true
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="h-full overflow-y-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Paramètres
                </h1>
                <p className="text-sm text-muted-foreground">
                    Configuration de votre espace de travail
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="neu-raised p-5 rounded-xl space-y-4"
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Informations du compte
                    </h3>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <Fingerprint className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">Agent Marc Koumba</p>
                            <p className="text-sm text-muted-foreground">ID: AGT-2026-0042</p>
                            <Badge className="mt-1 bg-primary/10 text-primary">Niveau 2 - Assermenté</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Poste', value: 'Libreville Central' },
                            { label: 'Service', value: 'Vérification CNI' },
                            { label: 'Date assermentation', value: '15/01/2024' },
                            { label: 'Expiration', value: '14/01/2027' }
                        ].map((item, i) => (
                            <div key={i} className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="font-medium text-sm">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="neu-raised p-5 rounded-xl space-y-4"
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Préférences de notification
                    </h3>

                    <div className="space-y-2">
                        {[
                            { key: 'urgentRequests', label: 'Nouvelles demandes urgentes', desc: 'Alerte immédiate' },
                            { key: 'flaggedDocuments', label: 'Documents signalés', desc: 'Alertes de fraude' },
                            { key: 'delayReminders', label: 'Rappels de délai', desc: 'Demandes en retard' },
                            { key: 'dailySummary', label: 'Résumé quotidien', desc: 'Email à 18h' }
                        ].map((pref) => (
                            <div
                                key={pref.key}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                                <div>
                                    <p className="text-sm font-medium">{pref.label}</p>
                                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(pref.key as keyof typeof notifications)}
                                    className={cn(
                                        'w-11 h-6 rounded-full p-0.5 transition-colors',
                                        notifications[pref.key as keyof typeof notifications]
                                            ? 'bg-primary'
                                            : 'bg-muted'
                                    )}
                                >
                                    <motion.div
                                        animate={{
                                            x: notifications[pref.key as keyof typeof notifications] ? 20 : 0
                                        }}
                                        className="w-5 h-5 rounded-full bg-white shadow-md"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Appearance */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="neu-raised p-5 rounded-xl space-y-4"
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Apparence
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setTheme('light')}
                            className={cn(
                                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                                theme === 'light'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent bg-muted/30 hover:bg-muted/50'
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Sun className="w-5 h-5 text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium">Mode clair</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={cn(
                                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                                theme === 'dark'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent bg-muted/30 hover:bg-muted/50'
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                <Moon className="w-5 h-5 text-slate-300" />
                            </div>
                            <span className="text-sm font-medium">Mode sombre</span>
                        </button>
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="neu-raised p-5 rounded-xl space-y-4"
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Aide & Support
                    </h3>

                    <div className="space-y-2">
                        {[
                            { icon: FileText, label: 'Guide de l\'utilisateur', action: 'Ouvrir le PDF' },
                            { icon: Shield, label: 'Politique de sécurité', action: 'Voir' },
                            { icon: Globe, label: 'Langue', action: 'Français' },
                            { icon: HelpCircle, label: 'Contacter le support', action: 'Email' }
                        ].map((item, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                <span className="text-xs text-primary">{item.action}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            >
                <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Déconnectez-vous de votre session de travail. Assurez-vous d'avoir enregistré toutes vos modifications.
                </p>
                <Button variant="destructive" size="sm" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                </Button>
            </motion.div>
        </div>
    );
};

export default ControllerSettingsPage;
