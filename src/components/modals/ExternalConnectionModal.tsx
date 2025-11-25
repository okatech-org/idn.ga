import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertCircle, Loader2, Check, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExternalConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
    serviceUrl: string;
}

const ExternalConnectionModal = ({ isOpen, onClose, serviceName, serviceUrl }: ExternalConnectionModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState<'request' | 'loading' | 'success'>('request');

    useEffect(() => {
        if (isOpen) {
            setStep('request');
            setIsLoading(false);
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handleApprove = () => {
        setStep('loading');
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2500);
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0">
                <div className="neu-raised rounded-3xl overflow-hidden bg-background">
                    <AnimatePresence mode="wait">
                        {step === 'request' && (
                            <motion.div
                                key="request"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="p-6 space-y-6"
                            >
                                {/* Header */}
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 neu-inset rounded-2xl flex items-center justify-center text-primary">
                                        <Globe size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{serviceName}</h2>
                                        <p className="text-sm text-muted-foreground">{serviceUrl}</p>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-4 rounded-xl flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
                                        Ce service demande l'accès à vos informations d'identité vérifiées. Assurez-vous de faire confiance à ce site.
                                    </p>
                                </div>

                                {/* Permissions */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Permissions demandées</h3>
                                    <div className="neu-inset p-4 rounded-xl space-y-3 bg-transparent">
                                        <PermissionItem label="Nom complet et Prénoms" required />
                                        <PermissionItem label="Numéro d'Identification (NIP)" required />
                                        <PermissionItem label="Adresse email" />
                                        <PermissionItem label="Numéro de téléphone" />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-4 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="flex-1 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                    >
                                        Refuser
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary/90 hover:scale-[1.02] transition-all"
                                    >
                                        Autoriser
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-12 flex flex-col items-center justify-center space-y-6 min-h-[400px]"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 animate-pulse"></div>
                                    <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck className="text-primary" size={32} />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-foreground">Authentification sécurisée</h3>
                                    <p className="text-sm text-muted-foreground">Vérification de vos identifiants...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 flex flex-col items-center justify-center space-y-6 min-h-[400px] bg-green-50 dark:bg-green-900/10"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                                >
                                    <Check className="text-white w-12 h-12" strokeWidth={3} />
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Connexion Réussie !</h2>
                                    <p className="text-muted-foreground">
                                        Vous êtes maintenant connecté à <span className="font-bold text-foreground">{serviceName}</span>.
                                    </p>
                                </div>
                                <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-4">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2.5 }}
                                        className="h-full bg-green-500"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Redirection automatique...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PermissionItem = ({ label, required }: { label: string, required?: boolean }) => (
    <div className="flex items-center space-x-3">
        <Checkbox id={label} checked={required} disabled={required} className={required ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary opacity-70" : ""} />
        <Label htmlFor={label} className={`text-sm ${required ? "text-muted-foreground" : "text-foreground"}`}>
            {label} {required && <span className="text-xs text-primary ml-1">(Requis)</span>}
        </Label>
    </div>
);

export default ExternalConnectionModal;
