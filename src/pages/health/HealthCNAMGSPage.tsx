import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { CNAMGSCard } from "@/components/health/CNAMGSCard";
import { Shield, ArrowLeft, Download, CreditCard, FileText, Phone, Mail, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { generateCNAMGSPdf } from "@/utils/cnamgs-pdf-generator";
import { toast } from "sonner";

// Mock profile data - in real app this would come from user context
const mockProfile = {
    full_name: "Jean DUPONT",
    birth_date: "1990-03-15",
    birth_place: "Libreville",
    gender: "male",
    cnamgs_number: "001-234-567-8",
    employer: "TechGabon SARL",
    avatar_url: undefined
};

export default function HealthCNAMGSPage() {
    const navigate = useNavigate();

    const handleDownloadCard = async () => {
        toast.info("Génération de l'attestation CNAMGS...");
        try {
            await generateCNAMGSPdf(
                {
                    numero: mockProfile.cnamgs_number,
                    nom: mockProfile.full_name.split(' ').pop()?.toUpperCase() || "DUPONT",
                    prenoms: mockProfile.full_name.split(' ').slice(0, -1).join(' ').toUpperCase() || "JEAN",
                    dateNaissance: new Date(mockProfile.birth_date).toLocaleDateString('fr-FR'),
                    lieuNaissance: mockProfile.birth_place,
                    sexe: mockProfile.gender === 'male' ? 'M' : 'F',
                    regime: "Secteur Privé",
                    qualite: "Assuré principal",
                    employeur: mockProfile.employer,
                    couvertures: [
                        { type: "Affections courantes", taux: "80%", ticket: "20% à charge de l'assuré" },
                        { type: "Affections Longue Durée (ALD)", taux: "90%", ticket: "10% à charge de l'assuré" },
                        { type: "Femmes enceintes déclarées", taux: "100%", ticket: "0% (prise en charge totale)" }
                    ]
                },
                {
                    armoiriesUrl: '/emblem_gabon.png',
                    cnamgsLogoUrl: '/cnamgs_logo.png',
                    photoUrl: mockProfile.avatar_url
                },
                {
                    showGrid: false,
                    downloadFileName: `attestation-cnamgs-${mockProfile.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`
                }
            );
            toast.success("Attestation CNAMGS téléchargée");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Erreur lors de la génération de l'attestation");
        }
    };

    return (
        <UserSpaceLayout>
            <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Carte CNAMGS
                            </h1>
                            <p className="text-sm text-muted-foreground">Votre carte d'assurance maladie</p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                        Actif
                    </Badge>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-auto">
                    {/* Left: CNAMGS Card with SVG */}
                    <div className="space-y-4">
                        {/* CNAMGSCard Component - This renders the SVG and is required for PDF generation */}
                        <CNAMGSCard profile={mockProfile} />
                    </div>

                    {/* Right: Info Cards */}
                    <div className="space-y-4">
                        {/* Coverage Info */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Droits et Couverture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { label: "Consultations", value: "100%" },
                                    { label: "Hospitalisations", value: "100%" },
                                    { label: "Médicaments", value: "80%" },
                                    { label: "Analyses", value: "100%" }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                        <span className="text-sm text-muted-foreground">{item.label}</span>
                                        <span className="text-sm font-bold text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Carte d'assuré CNAMGS</p>
                                            <p className="text-xs text-muted-foreground">Format PDF officiel</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleDownloadCard}>
                                        <Download className="w-4 h-4 mr-1" />
                                        PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Contact CNAMGS
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                        <Phone className="w-4 h-4 text-primary" />
                                        <span className="text-sm">+241 11 76 60 00</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span className="text-sm">contact@cnamgs.ga</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        <span className="text-sm">Libreville, Quartier Batterie IV</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UserSpaceLayout>
    );
}
