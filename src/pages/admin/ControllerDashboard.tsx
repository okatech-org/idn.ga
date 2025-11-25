import { useNavigate } from "react-router-dom";
import { FileCheck, Users, AlertTriangle, CheckCircle, ArrowLeft, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";

const ControllerDashboard = () => {
    const navigate = useNavigate();

    const tasks = [
        { id: 1, type: "CNI", applicant: "Jean Dupont", status: "pending", time: "Il y a 10 min", risk: "low" },
        { id: 2, type: "Passeport", applicant: "Marie Curie", status: "pending", time: "Il y a 25 min", risk: "medium" },
        { id: 3, type: "Acte de Naissance", applicant: "Paul Bongo", status: "review", time: "Il y a 1h", risk: "low" },
        { id: 4, type: "CNI", applicant: "Sarah Kassa", status: "flagged", time: "Il y a 2h", risk: "high" },
    ];

    return (
        <MainLayout>
            <div className="relative w-full space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/demo')}
                                className="flex items-center gap-2 hover:bg-white/10"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Retour</span>
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <FileCheck className="w-8 h-8 text-primary" />
                            Vérification d'Identité
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Tableau de bord pour l'approbation des documents
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border-white/10"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtres</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="neu-raised p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">En Attente</p>
                                <p className="text-3xl font-bold text-foreground mt-2">24</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="neu-raised p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Approuvé</p>
                                <p className="text-3xl font-bold text-foreground mt-2">152</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="neu-raised p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Rejeté</p>
                                <p className="text-3xl font-bold text-foreground mt-2">8</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="neu-raised p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Aujourd'hui</p>
                                <p className="text-3xl font-bold text-foreground mt-2">32</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification Queue */}
                <div className="neu-raised rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6 text-foreground">File d'Attente</h2>
                    <div className="space-y-4">{/* ... rest of content ... */}</div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ControllerDashboard;
