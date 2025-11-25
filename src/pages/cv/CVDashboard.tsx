import { useNavigate } from "react-router-dom";
import { Download, Share2, Briefcase, GraduationCap, Award, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import SmartScoreRing from "@/components/cv/SmartScoreRing";
import AISuggestionCard from "@/components/cv/AISuggestionCard";

const CVDashboard = () => {
    const navigate = useNavigate();
    const completionScore = 78;

    return (
        <UserSpaceLayout>
            <div className="space-y-8 pb-24 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Mon CV Intelligent</h1>
                        <p className="text-sm text-muted-foreground">Gérez et optimisez votre profil professionnel</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" size="icon" className="neu-raised rounded-full w-10 h-10">
                            <Share2 size={18} />
                        </Button>
                        <Button variant="outline" size="icon" className="neu-raised rounded-full w-10 h-10">
                            <Download size={18} />
                        </Button>
                    </div>
                </div>

                {/* Score & Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="neu-raised p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 md:col-span-1">
                        <SmartScoreRing score={completionScore} size={140} />
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Niveau Expert</h3>
                            <p className="text-xs text-muted-foreground">Votre profil est très attractif pour les recruteurs.</p>
                        </div>
                    </div>

                    {/* Suggestions Column */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-semibold text-foreground ml-1">Recommandations</h3>
                        <div className="grid gap-4">
                            <AISuggestionCard
                                title="Ajoutez vos diplômes"
                                description="Les profils avec une formation détaillée reçoivent 2x plus d'offres."
                                impact="+15% Score"
                                onApply={() => navigate("/cv/edit")}
                            />
                            <AISuggestionCard
                                title="Validez vos compétences"
                                description="Faites certifier votre niveau d'anglais par notre partenaire."
                                impact="+10% Score"
                                onApply={() => navigate("/cv/edit")}
                            />
                        </div>
                    </div>
                </div>

                {/* Sections Grid */}
                <div>
                    <h3 className="font-semibold text-foreground mb-4 ml-1">Sections du CV</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SectionCard
                            icon={Briefcase}
                            title="Expériences Professionnelles"
                            count="2 postes renseignés"
                            color="text-orange-600 dark:text-orange-400"
                            bg="bg-orange-50 dark:bg-orange-900/20"
                            onClick={() => navigate("/cv/edit")}
                        />
                        <SectionCard
                            icon={GraduationCap}
                            title="Formation & Diplômes"
                            count="3 diplômes renseignés"
                            color="text-blue-600 dark:text-blue-400"
                            bg="bg-blue-50 dark:bg-blue-900/20"
                            onClick={() => navigate("/cv/edit")}
                        />
                        <SectionCard
                            icon={Award}
                            title="Compétences & Certifications"
                            count="8 compétences ajoutées"
                            color="text-purple-600 dark:text-purple-400"
                            bg="bg-purple-50 dark:bg-purple-900/20"
                            onClick={() => navigate("/cv/edit")}
                        />
                        <SectionCard
                            icon={FileText}
                            title="Informations Personnelles"
                            count="Complété à 100%"
                            color="text-green-600 dark:text-green-400"
                            bg="bg-green-50 dark:bg-green-900/20"
                            onClick={() => navigate("/cv/edit")}
                        />
                    </div>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

const SectionCard = ({ icon: Icon, title, count, color, bg, onClick }: any) => (
    <div
        className="neu-raised p-4 rounded-xl flex items-center justify-between cursor-pointer hover:text-primary transition-all active:neu-inset group"
        onClick={onClick}
    >
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="font-bold text-sm text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground">{count}</p>
            </div>
        </div>
        <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" size={20} />
    </div>
);

export default CVDashboard;
