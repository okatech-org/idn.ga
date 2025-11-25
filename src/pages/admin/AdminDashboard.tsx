import { useNavigate } from "react-router-dom";
import { Users, FileCheck, ShieldAlert, Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layout/AdminLayout";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminStatCard from "@/components/admin/AdminStatCard";
import VerificationQueueItem from "@/components/admin/VerificationQueueItem";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const data = [
        { name: 'Lun', inscriptions: 40 },
        { name: 'Mar', inscriptions: 30 },
        { name: 'Mer', inscriptions: 20 },
        { name: 'Jeu', inscriptions: 27 },
        { name: 'Ven', inscriptions: 18 },
        { name: 'Sam', inscriptions: 23 },
        { name: 'Dim', inscriptions: 34 },
    ];

    const handleApprove = (name: string) => {
        toast({
            title: "Dossier validé",
            description: `Le dossier de ${name} a été approuvé avec succès.`,
            className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
        });
    };

    const handleReject = (name: string) => {
        toast({
            title: "Dossier rejeté",
            description: `Le dossier de ${name} a été rejeté.`,
            variant: "destructive",
        });
    };

    return (
        <AdminLayout>
            <div className="flex flex-col h-full space-y-6">
                {/* Header Content (Title only, nav is in sidebar) */}
                <div className="flex items-center justify-between sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-sm">
                    <h1 className="font-bold text-xl text-foreground">Tableau de bord</h1>
                    <div className="text-sm text-muted-foreground">Bienvenue, Administrateur</div>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pb-24 pr-2">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-5">
                        <AdminStatCard
                            icon={Users}
                            label="Utilisateurs"
                            value="12,345"
                            trend="+12%"
                            trendUp={true}
                            color="text-blue-600 dark:text-blue-400"
                            bgColor="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <AdminStatCard
                            icon={FileCheck}
                            label="Docs Vérifiés"
                            value="8,902"
                            trend="+5%"
                            trendUp={true}
                            color="text-green-600 dark:text-green-400"
                            bgColor="bg-green-50 dark:bg-green-900/20"
                        />
                        <AdminStatCard
                            icon={ShieldAlert}
                            label="Alertes Sécu"
                            value="3"
                            trend="-2"
                            trendUp={false}
                            color="text-red-600 dark:text-red-400"
                            bgColor="bg-red-50 dark:bg-red-900/20"
                        />
                        <AdminStatCard
                            icon={Activity}
                            label="En ligne"
                            value="1,203"
                            trend="+8%"
                            trendUp={true}
                            color="text-purple-600 dark:text-purple-400"
                            bgColor="bg-purple-50 dark:bg-purple-900/20"
                        />
                    </div>

                    {/* Chart */}
                    <div className="neu-raised p-6 rounded-2xl">
                        <h3 className="font-semibold mb-6 text-foreground">Inscriptions cette semaine</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} stroke="var(--muted-foreground)" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                    />
                                    <Bar dataKey="inscriptions" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Verification Queue */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-foreground">Vérifications en attente</h3>
                            <Button variant="link" className="text-primary text-xs h-auto p-0 font-bold">Tout voir</Button>
                        </div>
                        <div className="space-y-4">
                            <VerificationQueueItem
                                name="Alice Mba"
                                docType="Passeport"
                                time="Il y a 5 min"
                                avatarSeed="Alice"
                                onApprove={() => handleApprove("Alice Mba")}
                                onReject={() => handleReject("Alice Mba")}
                            />
                            <VerificationQueueItem
                                name="Paul Bongo"
                                docType="Permis de Conduire"
                                time="Il y a 12 min"
                                avatarSeed="Paul"
                                onApprove={() => handleApprove("Paul Bongo")}
                                onReject={() => handleReject("Paul Bongo")}
                            />
                            <VerificationQueueItem
                                name="Sarah Kassa"
                                docType="Carte Nationale d'Identité"
                                time="Il y a 30 min"
                                avatarSeed="Sarah"
                                onApprove={() => handleApprove("Sarah Kassa")}
                                onReject={() => handleReject("Sarah Kassa")}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
