import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Home, Plane, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ProfileSelection = () => {
    const navigate = useNavigate();
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

    const profiles = [
        {
            id: "citizen",
            title: "Citoyen Gabonais",
            icon: User, // Ideally a Flag icon if available, or keep User for now
            color: "bg-primary", // Green
            description: "Pour les détenteurs de la nationalité gabonaise.",
            docs: ["Carte Nationale d'Identité", "Acte de Naissance"],
            flag: "🇬🇦"
        },
        {
            id: "resident",
            title: "Résident au Gabon",
            icon: Home,
            color: "bg-secondary", // Yellow
            description: "Pour les étrangers résidant légalement au Gabon.",
            docs: ["Carte de Séjour", "Passeport"],
            flag: "🏠"
        },
        {
            id: "tourist",
            title: "Visiteur Temporaire",
            icon: Plane,
            color: "bg-accent", // Blue
            description: "Pour les séjours de courte durée (Tourisme, Affaires, Famille).",
            docs: ["Passeport", "Visa"],
            flag: "✈️"
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-light p-6 flex flex-col">
            <div className="mt-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-4 -ml-2">
                    <ArrowLeft className="text-neutral-dark" />
                </Button>
                <h1 className="text-2xl font-bold font-header text-neutral-dark">Bienvenue sur IDN.GA</h1>
                <p className="text-gray-500 mt-2">Veuillez sélectionner votre type de profil pour commencer.</p>
            </div>

            <div className="flex-1 space-y-4">
                {profiles.map((profile) => (
                    <motion.div
                        key={profile.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedProfile(profile.id)}
                    >
                        <Card
                            className={`p-4 cursor-pointer border-2 transition-all ${selectedProfile === profile.id
                                ? "border-primary shadow-lg bg-white ring-2 ring-primary/20"
                                : "border-transparent hover:border-gray-200 bg-white"
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${profile.color.replace('bg-', 'bg-opacity-10 text-')}`}>
                                    {profile.flag}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-neutral-dark">{profile.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{profile.description}</p>

                                    {selectedProfile === profile.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mt-3 pt-3 border-t border-gray-100"
                                        >
                                            <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">Documents requis :</p>
                                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                                {profile.docs.map((doc) => (
                                                    <li key={doc}>{doc}</li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Button
                disabled={!selectedProfile}
                onClick={() => navigate("/onboarding/kyc")}
                className="w-full mt-6 h-14 text-lg font-bold shadow-lg"
            >
                Continuer
            </Button>
        </div>
    );
};

export default ProfileSelection;
