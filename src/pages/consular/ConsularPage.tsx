import { ArrowLeft, Globe, Building2, Calendar, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConsularCard } from "@/components/consular/ConsularCard";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";

/**
 * Dedicated page for Consular Card display and management
 */
export default function ConsularPage() {
    const navigate = useNavigate();

    // Mock profile data
    const mockProfile = {
        last_name: "DUPONT",
        first_name: "Jean Marie",
        birth_date: "15/03/1985",
        consular_number: "GAB-2024-123456",
        consular_pin: "1234",
        issued_date: "01/01/2024",
        expires_date: "01/01/2029",
    };

    return (
        <UserSpaceLayout>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate">
                        Carte Consulaire
                    </h1>
                    <p className="text-sm text-muted-foreground truncate">
                        République Gabonaise
                    </p>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Valide
                </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-auto">
                {/* Left: Consular Card */}
                <div className="space-y-4">
                    <ConsularCard profile={mockProfile} />
                </div>

                {/* Right: Information Cards */}
                <div className="space-y-4">
                    {/* Card Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Informations de la Carte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Numéro</span>
                                <span className="font-mono font-medium">{mockProfile.consular_number}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Code PIN</span>
                                <span className="font-mono font-medium">{mockProfile.consular_pin}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Date d'émission</span>
                                <span className="font-medium">{mockProfile.issued_date}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Date d'expiration</span>
                                <span className="font-medium text-amber-600">{mockProfile.expires_date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Registered Consulate */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                Consulat d'Inscription
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Consulat</span>
                                <span className="font-medium">Paris, France</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Circonscription</span>
                                <span className="font-medium">Île-de-France</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Code</span>
                                <span className="font-mono">CGF-IDF-001</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Online Services */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />
                                Services en Ligne
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                                Accédez aux services consulaires en ligne avec votre carte.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open("https://contact.ga", "_blank")}
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                Portail Consulaire
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </UserSpaceLayout>
    );
}
