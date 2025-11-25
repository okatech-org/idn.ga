import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Smartphone, Key, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import SettingToggle from "@/components/settings/SettingToggle";
import SessionItem from "@/components/settings/SessionItem";
import { useState } from "react";

const SecuritySettings = () => {
    const navigate = useNavigate();
    const [biometrics, setBiometrics] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <UserSpaceLayout>
            <div className="space-y-6 pb-24 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="font-bold text-xl text-foreground">Sécurité</h1>
                    <div className="w-10" />
                </div>

                <div className="space-y-8">
                    {/* Biometrics & 2FA */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wider">Authentification</h3>
                        <div className="neu-raised rounded-2xl p-2 space-y-1">
                            <SettingToggle
                                icon={Shield}
                                title="Face ID / Touch ID"
                                description="Utiliser la biométrie pour se connecter"
                                checked={biometrics}
                                onCheckedChange={setBiometrics}
                                iconColor="text-green-600 dark:text-green-500"
                            />
                            <SettingToggle
                                icon={Smartphone}
                                title="Double Authentification (2FA)"
                                description="Code SMS à chaque nouvelle connexion"
                                checked={twoFactor}
                                onCheckedChange={setTwoFactor}
                                iconColor="text-blue-600 dark:text-blue-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wider">Gestion du compte</h3>
                        <div className="neu-raised rounded-2xl p-2 space-y-1">
                            <div className="p-4 flex items-center justify-between rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2.5 neu-raised rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                                        <Key size={20} />
                                    </div>
                                    <span className="font-medium text-sm text-foreground">Changer le code PIN</span>
                                </div>
                                <ArrowLeft size={16} className="rotate-180 text-muted-foreground/50" />
                            </div>
                            <div className="p-4 flex items-center justify-between rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2.5 neu-raised rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                                        <History size={20} />
                                    </div>
                                    <span className="font-medium text-sm text-foreground">Historique des connexions</span>
                                </div>
                                <ArrowLeft size={16} className="rotate-180 text-muted-foreground/50" />
                            </div>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1 uppercase tracking-wider">Sessions Actives</h3>
                        <div className="neu-raised p-4 rounded-2xl space-y-4">
                            <SessionItem
                                device="iPhone 13 Pro"
                                location="Libreville"
                                lastActive="Actif maintenant"
                                isActive={true}
                                type="mobile"
                            />

                            <div className="border-t border-border/10 my-2"></div>

                            <SessionItem
                                device="MacBook Pro"
                                location="Port-Gentil"
                                lastActive="Il y a 2 heures"
                                isActive={false}
                                type="desktop"
                                onRevoke={() => { }}
                            />

                            <button className="w-full py-3 mt-2 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                                Déconnecter tous les autres appareils
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default SecuritySettings;
