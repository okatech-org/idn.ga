import React, { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { Settings, Shield, Server, Bell, Key, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const AdminSettings = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationOpen, setRegistrationOpen] = useState(true);
    const [twoFactorEnforced, setTwoFactorEnforced] = useState(false);

    const handleSave = () => {
        toast.success("Paramètres système mis à jour avec succès");
    };

    return (
        <AdminLayout>
            <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Settings className="w-6 h-6 text-primary" />
                            Paramètres Système
                        </h1>
                        <p className="text-muted-foreground text-sm">Configuration globale de la plateforme IDN.GA.</p>
                    </div>
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                        <Save className="w-4 h-4 mr-2" /> Enregistrer
                    </Button>
                </div>

                <div className="space-y-6">

                    {/* System Status */}
                    <div className="neu-raised p-6 rounded-xl space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <Server className="w-5 h-5 text-blue-500" /> État du Système
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Mode Maintenance</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Activez pour empêcher l'accès aux utilisateurs (sauf admins).
                                    </p>
                                </div>
                                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Inscriptions Ouvertes</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Autoriser les nouveaux utilisateurs à créer un compte.
                                    </p>
                                </div>
                                <Switch checked={registrationOpen} onCheckedChange={setRegistrationOpen} />
                            </div>
                        </div>
                    </div>

                    {/* Security Policies */}
                    <div className="neu-raised p-6 rounded-xl space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <Shield className="w-5 h-5 text-green-500" /> Politiques de Sécurité
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Forcer la 2FA (Admins)</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Exiger l'authentification à deux facteurs pour tous les administrateurs.
                                    </p>
                                </div>
                                <Switch checked={twoFactorEnforced} onCheckedChange={setTwoFactorEnforced} />
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label>Expiration de session (minutes)</Label>
                                    <Input type="number" defaultValue="30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tentatives de connexion max</Label>
                                    <Input type="number" defaultValue="5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Keys */}
                    <div className="neu-raised p-6 rounded-xl space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                            <Key className="w-5 h-5 text-yellow-500" /> Clés API Externes
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Ces clés donnent accès aux services tiers (OCR, SMS, Email). Ne les partagez jamais.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Clé API OCR (Google Vision)</Label>
                                <div className="flex gap-2">
                                    <Input type="password" value="AIzaSyD...XyZ" readOnly className="font-mono" />
                                    <Button variant="outline">Regénérer</Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Clé API SMS Gateway</Label>
                                <div className="flex gap-2">
                                    <Input type="password" value="sk_live_...999" readOnly className="font-mono" />
                                    <Button variant="outline">Regénérer</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
