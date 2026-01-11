import { motion } from "framer-motion";
import {
    Building2,
    HeartPulse,
    Scale,
    Car,
    Briefcase,
    Wallet,
    ChevronRight,
    CheckCircle2,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    connected: boolean;
    lastAccess?: string;
    description: string;
}

const services: Service[] = [
    {
        id: "impots",
        name: "Impôts (DGI)",
        icon: Wallet,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        connected: true,
        lastAccess: "Il y a 2 jours",
        description: "Direction Générale des Impôts"
    },
    {
        id: "cnss",
        name: "CNSS",
        icon: Building2,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        connected: true,
        lastAccess: "Il y a 1 semaine",
        description: "Caisse Nationale de Sécurité Sociale"
    },
    {
        id: "sante",
        name: "Santé",
        icon: HeartPulse,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        connected: false,
        description: "Ministère de la Santé"
    },
    {
        id: "justice",
        name: "Justice",
        icon: Scale,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-500/10",
        connected: false,
        description: "Ministère de la Justice"
    },
    {
        id: "transport",
        name: "Transport",
        icon: Car,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
        connected: true,
        lastAccess: "Il y a 3 mois",
        description: "Direction Générale des Transports"
    },
    {
        id: "emploi",
        name: "Emploi",
        icon: Briefcase,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-500/10",
        connected: false,
        description: "Office National de l'Emploi"
    }
];

interface ServicesSectionProps {
    onServiceClick?: (serviceId: string) => void;
}

export default function ServicesSection({ onServiceClick }: ServicesSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Services Publics
                </h3>
                <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    Tout voir <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {services.map((service, index) => (
                    <motion.button
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onServiceClick?.(service.id)}
                        className={cn(
                            "relative p-4 rounded-2xl text-left transition-all duration-300",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10",
                            "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                            "hover:scale-[1.02] active:scale-[0.98]",
                            "group"
                        )}
                    >
                        {/* Status indicator */}
                        <div className="absolute top-3 right-3">
                            {service.connected ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                            )}
                        </div>

                        {/* Icon */}
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                            "transition-transform duration-300 group-hover:scale-110",
                            service.bgColor
                        )}>
                            <service.icon className={cn("w-5 h-5", service.color)} />
                        </div>

                        {/* Content */}
                        <h4 className="font-semibold text-sm text-foreground mb-0.5">
                            {service.name}
                        </h4>

                        {service.connected && service.lastAccess ? (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.lastAccess}
                            </p>
                        ) : (
                            <p className="text-[10px] text-muted-foreground">
                                Non connecté
                            </p>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
