import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence } from "framer-motion";

const EditCV = () => {
    const navigate = useNavigate();
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAskAI = () => {
        setIsGenerating(true);
        setAiSuggestion(null);
        // Simulate AI delay
        setTimeout(() => {
            setIsGenerating(false);
            setAiSuggestion("En tant que Chef de Projet Digital, j'ai piloté la refonte complète de 3 plateformes e-commerce, augmentant le taux de conversion de 25%. J'ai coordonné une équipe agile de 8 développeurs et designers, assurant la livraison des sprints dans les délais.");
        }, 2000);
    };

    return (
        <UserSpaceLayout>
            <div className="space-y-6 pb-24 max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="font-bold text-xl text-foreground">Ajouter une expérience</h1>
                    <div className="w-10" />
                </div>

                <div className="neu-raised p-6 md:p-8 rounded-3xl space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold ml-1">Intitulé du poste</Label>
                            <Input placeholder="ex: Chef de Projet Digital" className="h-12 neu-inset border-none bg-transparent" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold ml-1">Entreprise</Label>
                            <Input placeholder="ex: Agence Web Gabon" className="h-12 neu-inset border-none bg-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold ml-1">Date de début</Label>
                                <Input type="date" className="h-12 neu-inset border-none bg-transparent" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold ml-1">Date de fin</Label>
                                <Input type="date" className="h-12 neu-inset border-none bg-transparent" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-semibold ml-1">Description</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:bg-primary/10 h-8 px-3 rounded-full text-xs font-bold flex items-center transition-colors"
                                    onClick={handleAskAI}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <Sparkles size={12} className="mr-2 animate-spin" />
                                    ) : (
                                        <Wand2 size={12} className="mr-2" />
                                    )}
                                    {isGenerating ? "Génération..." : "Améliorer avec l'IA"}
                                </Button>
                            </div>
                            <div className="relative">
                                <Textarea
                                    placeholder="Décrivez vos missions et réalisations..."
                                    className="min-h-[150px] neu-inset border-none bg-transparent resize-none p-4"
                                    defaultValue={aiSuggestion || ""}
                                />
                                <AnimatePresence>
                                    {aiSuggestion && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute -bottom-4 left-0 right-0 translate-y-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl shadow-lg z-10"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <Sparkles className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={16} />
                                                <div>
                                                    <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">Suggestion de l'IA :</p>
                                                    <p className="text-sm text-green-700 dark:text-green-400 italic leading-relaxed">
                                                        "{aiSuggestion}"
                                                    </p>
                                                    <div className="mt-3 flex space-x-2">
                                                        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs">Accepter</Button>
                                                        <Button size="sm" variant="ghost" className="h-8 text-green-700 hover:bg-green-100 text-xs" onClick={() => setAiSuggestion(null)}>Ignorer</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={() => navigate("/cv")} className="w-full h-12 text-lg font-bold neu-button bg-primary text-white hover:bg-primary/90 flex items-center justify-center space-x-2">
                            <Save size={20} />
                            <span>Enregistrer les modifications</span>
                        </Button>
                    </div>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default EditCV;
