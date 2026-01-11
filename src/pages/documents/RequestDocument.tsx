import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Baby,
    Scale,
    Car,
    Home,
    GraduationCap,
    Heart,
    CheckCircle2,
    Clock,
    ChevronRight,
    Send
} from "lucide-react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentType {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    description: string;
    processingTime: string;
    fee: string;
}

const documentTypes: DocumentType[] = [
    {
        id: "birth-certificate",
        name: "Acte de Naissance",
        icon: Baby,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-500/10",
        description: "Copie intégrale ou extrait d'acte de naissance",
        processingTime: "3-5 jours",
        fee: "2 500 FCFA"
    },
    {
        id: "criminal-record",
        name: "Casier Judiciaire",
        icon: Scale,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-500/10",
        description: "Bulletin n°3 du casier judiciaire",
        processingTime: "5-7 jours",
        fee: "5 000 FCFA"
    },
    {
        id: "driving-license",
        name: "Permis de Conduire",
        icon: Car,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
        description: "Renouvellement ou duplicata du permis",
        processingTime: "7-10 jours",
        fee: "15 000 FCFA"
    },
    {
        id: "residence-cert",
        name: "Certificat de Résidence",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        description: "Attestation de domicile officielle",
        processingTime: "1-2 jours",
        fee: "1 000 FCFA"
    },
    {
        id: "diploma-copy",
        name: "Copie de Diplôme",
        icon: GraduationCap,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500/10",
        description: "Copie certifiée conforme de diplôme",
        processingTime: "5-7 jours",
        fee: "3 000 FCFA"
    },
    {
        id: "marriage-cert",
        name: "Acte de Mariage",
        icon: Heart,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        description: "Copie intégrale d'acte de mariage",
        processingTime: "3-5 jours",
        fee: "2 500 FCFA"
    }
];

interface PendingRequest {
    id: string;
    documentType: string;
    requestDate: string;
    status: "pending" | "processing" | "ready";
    estimatedDate: string;
}

const pendingRequests: PendingRequest[] = [
    {
        id: "REQ-001",
        documentType: "Casier Judiciaire",
        requestDate: "08/01/2026",
        status: "processing",
        estimatedDate: "15/01/2026"
    },
    {
        id: "REQ-002",
        documentType: "Certificat de Résidence",
        requestDate: "10/01/2026",
        status: "pending",
        estimatedDate: "12/01/2026"
    }
];

export default function RequestDocument() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const handleSubmitRequest = () => {
        // TODO: Implement actual request submission
        setSelectedType(null);
        // Show success toast
    };

    const getStatusColor = (status: PendingRequest["status"]) => {
        switch (status) {
            case "ready": return "text-green-600 bg-green-500/10";
            case "processing": return "text-blue-600 bg-blue-500/10";
            case "pending": return "text-amber-600 bg-amber-500/10";
        }
    };

    const getStatusLabel = (status: PendingRequest["status"]) => {
        switch (status) {
            case "ready": return "Prêt";
            case "processing": return "En cours";
            case "pending": return "En attente";
        }
    };

    return (
        <UserSpaceLayout>
            <div className="space-y-8 pb-24 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className={cn(
                            "w-10 h-10 rounded-xl",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10",
                            "hover:border-primary/30"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Demander un Document</h1>
                        <p className="text-sm text-muted-foreground">Faites une demande de document officiel en ligne</p>
                    </div>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                            Demandes en cours
                        </h3>
                        <div className="space-y-3">
                            {pendingRequests.map((request, index) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "p-4 rounded-xl flex items-center justify-between",
                                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                                        "border border-slate-200/60 dark:border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-primary/10 rounded-xl">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{request.documentType}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Demandé le {request.requestDate} • Prévu le {request.estimatedDate}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium",
                                        getStatusColor(request.status)
                                    )}>
                                        {getStatusLabel(request.status)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Document Types Grid */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                        Types de documents disponibles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documentTypes.map((docType, index) => (
                            <motion.button
                                key={docType.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedType(docType.id)}
                                className={cn(
                                    "p-5 rounded-2xl text-left transition-all duration-300",
                                    "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                                    "border-2",
                                    selectedType === docType.id
                                        ? "border-primary shadow-lg shadow-primary/10"
                                        : "border-slate-200/60 dark:border-white/10 hover:border-primary/30",
                                    "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
                                    "group"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-3 rounded-xl shrink-0",
                                        "transition-transform duration-300 group-hover:scale-110",
                                        docType.bgColor
                                    )}>
                                        <docType.icon className={cn("w-6 h-6", docType.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-foreground">{docType.name}</h4>
                                            {selectedType === docType.id && (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">{docType.description}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/80">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {docType.processingTime}
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {docType.fee}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                {selectedType && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-24 left-0 right-0 px-6 md:relative md:bottom-auto md:px-0"
                    >
                        <Button
                            onClick={handleSubmitRequest}
                            className={cn(
                                "w-full py-6 rounded-2xl font-semibold text-base",
                                "bg-gradient-to-r from-primary to-emerald-600",
                                "hover:from-primary/90 hover:to-emerald-600/90",
                                "shadow-lg shadow-primary/25"
                            )}
                        >
                            <Send className="w-5 h-5 mr-2" />
                            Envoyer la demande
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}
            </div>
        </UserSpaceLayout>
    );
}
