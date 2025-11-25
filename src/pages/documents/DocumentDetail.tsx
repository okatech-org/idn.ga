import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Share2, Trash2, ShieldCheck, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion } from "framer-motion";

const DocumentDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock Data Fetching based on ID
    const doc = {
        id: id,
        title: "Carte Nationale d'Identité",
        type: "Identité",
        status: "Vérifié",
        expiry: "2034-01-01",
        issueDate: "2024-01-01",
        authority: "DGDI",
        number: "123456789012",
        image: "https://github.com/shadcn.png" // Placeholder
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
                    <h1 className="font-bold text-lg text-foreground truncate max-w-[200px]">{doc.title}</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">

                    {/* Left Column: Preview */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="neu-inset p-4 rounded-2xl flex items-center justify-center bg-gray-100 dark:bg-black/20 min-h-[300px]"
                        >
                            {/* Document Image Placeholder */}
                            <div className="relative w-full aspect-[1.586] max-w-md rounded-xl overflow-hidden shadow-lg">
                                <img src={doc.image} alt="Document Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                    <div className="flex items-center space-x-2 text-white">
                                        <ShieldCheck size={16} className="text-green-400" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Document Vérifié</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <div className="flex justify-center space-x-4">
                            <Button className="neu-raised flex-1 h-12 space-x-2 text-foreground hover:text-primary">
                                <Download size={20} />
                                <span>Télécharger</span>
                            </Button>
                            <Button className="neu-raised flex-1 h-12 space-x-2 text-foreground hover:text-primary">
                                <Share2 size={20} />
                                <span>Partager</span>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="neu-raised p-6 rounded-2xl space-y-6">
                        <h3 className="font-bold text-lg text-foreground border-b border-border/50 pb-2">Détails</h3>

                        <div className="space-y-4">
                            <DetailRow icon={FileText} label="Type" value={doc.type} />
                            <DetailRow icon={ShieldCheck} label="Numéro" value={doc.number} isMono />
                            <DetailRow icon={Calendar} label="Délivré le" value={doc.issueDate} />
                            <DetailRow icon={Calendar} label="Expire le" value={doc.expiry} isHighlight />
                            <DetailRow icon={ShieldCheck} label="Autorité" value={doc.authority} />
                        </div>

                        <div className="pt-6 mt-auto">
                            <Button
                                variant="destructive"
                                className="w-full h-12 neu-flat bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 shadow-none border border-red-200 dark:border-red-900/50"
                            >
                                <Trash2 size={18} className="mr-2" />
                                Supprimer ce document
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

const DetailRow = ({ icon: Icon, label, value, isMono = false, isHighlight = false }: any) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-3 text-muted-foreground">
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-bold ${isMono ? 'font-mono tracking-wider' : ''} ${isHighlight ? 'text-primary' : 'text-foreground'}`}>
            {value}
        </span>
    </div>
);

export default DocumentDetail;
