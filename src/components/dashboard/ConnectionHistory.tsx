import { motion } from "framer-motion";
import {
    Shield,
    Smartphone,
    Globe,
    Clock,
    ChevronRight,
    X,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Connection {
    id: string;
    serviceName: string;
    serviceUrl: string;
    action: string;
    timestamp: string;
    device: string;
    location: string;
    trusted: boolean;
}

const mockConnections: Connection[] = [
    {
        id: "1",
        serviceName: "impots.ga",
        serviceUrl: "https://impots.ga",
        action: "Vérification d'identité",
        timestamp: "Aujourd'hui, 14:32",
        device: "iPhone 15 Pro",
        location: "Libreville, Gabon",
        trusted: true
    },
    {
        id: "2",
        serviceName: "cnss.ga",
        serviceUrl: "https://cnss.ga",
        action: "Accès au profil",
        timestamp: "Hier, 09:15",
        device: "MacBook Pro",
        location: "Libreville, Gabon",
        trusted: true
    },
    {
        id: "3",
        serviceName: "banque-nationale.ga",
        serviceUrl: "https://banque-nationale.ga",
        action: "Signature électronique",
        timestamp: "Il y a 3 jours",
        device: "Windows PC",
        location: "Libreville, Gabon",
        trusted: true
    },
    {
        id: "4",
        serviceName: "transport.ga",
        serviceUrl: "https://transport.ga",
        action: "Vérification permis",
        timestamp: "Il y a 1 semaine",
        device: "Android",
        location: "Port-Gentil, Gabon",
        trusted: false
    }
];

interface ConnectionHistoryProps {
    maxItems?: number;
    onViewAll?: () => void;
    onRevoke?: (connectionId: string) => void;
}

export default function ConnectionHistory({
    maxItems = 3,
    onViewAll,
    onRevoke
}: ConnectionHistoryProps) {
    const [connections, setConnections] = useState(mockConnections);
    const displayedConnections = connections.slice(0, maxItems);

    const handleRevoke = (id: string) => {
        setConnections(prev => prev.filter(c => c.id !== id));
        onRevoke?.(id);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Connexions Récentes
                    </h3>
                </div>
                <button
                    onClick={onViewAll}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                    Historique <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-2">
                {displayedConnections.map((connection, index) => (
                    <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "p-4 rounded-xl transition-all duration-200",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10",
                            "hover:border-slate-300 dark:hover:border-white/20",
                            "group"
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Service Icon */}
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    "bg-gradient-to-br from-primary/20 to-accent/20"
                                )}>
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-sm text-foreground truncate">
                                            {connection.serviceName}
                                        </span>
                                        {connection.trusted && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        {connection.action}
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {connection.timestamp}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Smartphone className="w-3 h-3" />
                                            {connection.device}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Revoke Button */}
                            <button
                                onClick={() => handleRevoke(connection.id)}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    "opacity-0 group-hover:opacity-100",
                                    "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                )}
                                title="Révoquer l'accès"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {connections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    Aucune connexion récente
                </div>
            )}
        </div>
    );
}
