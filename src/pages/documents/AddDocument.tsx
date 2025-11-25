import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, Camera, CheckCircle, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence } from "framer-motion";

const AddDocument = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"select" | "preview" | "success">("select");
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStep("preview");
        }
    };

    const handleUpload = () => {
        // Simulate upload
        setTimeout(() => {
            setStep("success");
        }, 1500);
    };

    return (
        <UserSpaceLayout>
            <div className="space-y-6 pb-24 h-full flex flex-col">
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
                    <h1 className="font-bold text-lg text-foreground">Ajouter un document</h1>
                    <div className="w-10" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {step === "select" && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold text-foreground">Importer un fichier</h2>
                                    <p className="text-muted-foreground">PNG, JPG ou PDF (Max 10MB)</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Upload Option */}
                                    <label className="neu-raised p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 cursor-pointer hover:text-primary transition-all active:neu-inset group h-64">
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                                        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UploadCloud size={40} />
                                        </div>
                                        <span className="font-bold text-lg">Choisir un fichier</span>
                                    </label>

                                    {/* Camera Option */}
                                    <button className="neu-raised p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 cursor-pointer hover:text-primary transition-all active:neu-inset group h-64">
                                        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Camera size={40} />
                                        </div>
                                        <span className="font-bold text-lg">Prendre une photo</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === "preview" && file && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-md space-y-6"
                            >
                                <div className="neu-raised p-6 rounded-3xl relative">
                                    <button
                                        onClick={() => { setFile(null); setStep("select"); }}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                                            <FileText size={40} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-foreground truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleUpload}
                                    className="w-full h-14 text-lg font-bold neu-button bg-primary text-white hover:bg-primary/90"
                                >
                                    Confirmer l'envoi
                                </Button>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-32 h-32 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500">
                                    <CheckCircle size={64} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Document ajouté !</h2>
                                    <p className="text-muted-foreground mt-2">Votre document est en cours de vérification.</p>
                                </div>
                                <Button
                                    onClick={() => navigate("/documents")}
                                    className="px-8 h-12 font-bold neu-raised hover:text-primary"
                                >
                                    Retour aux documents
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default AddDocument;
