/**
 * Page Coffre-fort Numérique (Document Vault)
 * 
 * Stockage personnel sécurisé des documents du citoyen.
 * Catégories: Identité, Famille, Diplômes, Santé, Véhicule, Logement, Travail, Autres
 * Utilise Zustand pour la persistance locale
 */

import { useState, useEffect } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDocumentVaultStore } from "@/stores/documentVaultStore";
import { DocumentCategory } from "@/services/documentVaultService";
import { toast } from "sonner";
import {
    FolderLock,
    Upload,
    Camera,
    Search,
    Filter,
    Eye,
    Download,
    Trash2,
    X,
    Plus,
    FileText,
    User,
    Users,
    GraduationCap,
    Heart,
    Car,
    Home,
    Briefcase,
    MoreVertical,
    Check,
    Image as ImageIcon,
    File,
    Loader2,
    Cloud,
    CloudOff
} from "lucide-react";

// Document categories with icons and colors
const documentCategories = [
    { id: "identity" as const, label: "Identité", icon: User, color: "from-green-500 to-emerald-600" },
    { id: "family" as const, label: "Famille", icon: Users, color: "from-pink-500 to-rose-600" },
    { id: "education" as const, label: "Diplômes", icon: GraduationCap, color: "from-blue-500 to-indigo-600" },
    { id: "health" as const, label: "Santé", icon: Heart, color: "from-red-500 to-rose-600" },
    { id: "vehicle" as const, label: "Véhicule", icon: Car, color: "from-orange-500 to-amber-600" },
    { id: "housing" as const, label: "Logement", icon: Home, color: "from-cyan-500 to-teal-600" },
    { id: "work" as const, label: "Travail", icon: Briefcase, color: "from-purple-500 to-violet-600" },
    { id: "other" as const, label: "Autres", icon: FileText, color: "from-slate-500 to-gray-600" },
];

type CategoryId = DocumentCategory;

// Local document type for UI
interface VaultDocument {
    id: string;
    name: string;
    category: CategoryId;
    file_type: "pdf" | "image" | "other";
    file_size: string;
    created_at: string;
    thumbnail_url?: string;
}

// Mock documents for initial demo
const mockDocuments: VaultDocument[] = [
    { id: "1", name: "CNI_Recto.jpg", category: "identity", file_type: "image", file_size: "1.2 MB", created_at: "2024-01-15" },
    { id: "2", name: "CNI_Verso.jpg", category: "identity", file_type: "image", file_size: "1.1 MB", created_at: "2024-01-15" },
    { id: "3", name: "Passeport.pdf", category: "identity", file_type: "pdf", file_size: "2.4 MB", created_at: "2023-11-20" },
    { id: "4", name: "Acte_Naissance.pdf", category: "family", file_type: "pdf", file_size: "0.8 MB", created_at: "2024-02-10" },
    { id: "5", name: "Livret_Famille.pdf", category: "family", file_type: "pdf", file_size: "1.5 MB", created_at: "2023-06-05" },
    { id: "6", name: "Baccalaureat.pdf", category: "education", file_type: "pdf", file_size: "0.5 MB", created_at: "2020-07-15" },
    { id: "7", name: "Licence_Informatique.pdf", category: "education", file_type: "pdf", file_size: "0.7 MB", created_at: "2023-09-20" },
    { id: "8", name: "Carte_CNAMGS.jpg", category: "health", file_type: "image", file_size: "0.9 MB", created_at: "2024-03-01" },
    { id: "9", name: "Permis_Conduire.jpg", category: "vehicle", file_type: "image", file_size: "1.0 MB", created_at: "2022-08-12" },
    { id: "10", name: "Carte_Grise.pdf", category: "vehicle", file_type: "pdf", file_size: "0.6 MB", created_at: "2023-04-18" },
];

const DocumentVault = () => {
    // Zustand store
    const {
        documents,
        isLoading,
        selectedCategory,
        searchQuery,
        fetchDocuments,
        addDocument,
        deleteDocument: storeDeleteDocument,
        setSelectedCategory,
        setSearchQuery,
        filteredDocuments,
        getCategoryCounts
    } = useDocumentVaultStore();

    // Local UI state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<VaultDocument | null>(null);
    const [uploadCategory, setUploadCategory] = useState<CategoryId>("other");

    // Load documents on mount, with mock data fallback
    useEffect(() => {
        if (documents.length === 0) {
            // Initialize with mock documents if empty
            mockDocuments.forEach(doc => {
                addDocument({
                    name: doc.name,
                    category: doc.category,
                    file_type: doc.file_type,
                    file_size: doc.file_size,
                });
            });
        }
    }, []);

    // Get filtered documents from store
    const displayedDocuments = filteredDocuments();
    const categoryCounts = getCategoryCounts();

    // Get category info
    const getCategoryInfo = (categoryId: CategoryId) => {
        return documentCategories.find(c => c.id === categoryId);
    };

    // Delete document
    const handleDeleteDocument = async (docId: string) => {
        await storeDeleteDocument(docId);
        setSelectedDocument(null);
        toast.success("Document supprimé");
    };

    // Handle file upload
    const handleUpload = async (files: FileList | null) => {
        if (!files) return;

        for (const file of Array.from(files)) {
            await addDocument({
                name: file.name,
                category: uploadCategory,
                file_type: file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "other",
                file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            });
        }

        setShowUploadModal(false);
        toast.success(`${files.length} document(s) ajouté(s)`);
    };

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                            <FolderLock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Coffre-fort</h1>
                            <p className="text-[10px] text-muted-foreground">{documents.length} documents sécurisés</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
                            "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        )}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Ajouter
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher un document..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-9 pr-4 py-2 rounded-xl text-sm",
                                "bg-muted/50 border border-border",
                                "focus:outline-none focus:ring-2 focus:ring-primary/30"
                            )}
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all",
                            selectedCategory === "all"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                    >
                        Tous ({documents.length})
                    </button>
                    {documentCategories.map(cat => {
                        const count = documents.filter(d => d.category === cat.id).length;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all",
                                    selectedCategory === cat.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <cat.icon className="w-3 h-3" />
                                {cat.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Documents Grid */}
                <div className="flex-1 overflow-auto">
                    {displayedDocuments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground">Aucun document trouvé</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="mt-3 text-xs text-primary hover:underline"
                            >
                                Ajouter un document
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {displayedDocuments.map(doc => {
                                const catInfo = getCategoryInfo(doc.category);
                                return (
                                    <motion.div
                                        key={doc.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={cn(
                                            "group relative p-3 rounded-xl cursor-pointer transition-all",
                                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                                            "border border-slate-200/60 dark:border-white/10",
                                            "hover:border-primary/30 hover:shadow-lg"
                                        )}
                                        onClick={() => setSelectedDocument(doc)}
                                    >
                                        {/* Thumbnail */}
                                        <div className={cn(
                                            "aspect-[4/3] rounded-lg mb-2 flex items-center justify-center",
                                            `bg-gradient-to-br ${catInfo?.color || "from-gray-500 to-slate-600"}`
                                        )}>
                                            {doc.file_type === "image" ? (
                                                <ImageIcon className="w-8 h-8 text-white/80" />
                                            ) : doc.file_type === "pdf" ? (
                                                <FileText className="w-8 h-8 text-white/80" />
                                            ) : (
                                                <File className="w-8 h-8 text-white/80" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <p className="text-[11px] font-medium text-foreground truncate">{doc.name}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[9px] text-muted-foreground">{doc.file_size}</span>
                                            <span className="text-[9px] text-muted-foreground">
                                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>

                                        {/* Category badge */}
                                        <div className="absolute top-2 right-2">
                                            {catInfo && (
                                                <div className={cn(
                                                    "p-1 rounded-md",
                                                    `bg-gradient-to-br ${catInfo.color}`
                                                )}>
                                                    <catInfo.icon className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover actions */}
                                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                                                <Eye className="w-4 h-4 text-white" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                                                <Download className="w-4 h-4 text-white" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                                className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-md p-5 rounded-2xl",
                                "bg-background border border-border shadow-2xl"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-foreground">Ajouter un document</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="text-[10px] font-medium text-muted-foreground uppercase">Catégorie</label>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {documentCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setUploadCategory(cat.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                                                uploadCategory === cat.id
                                                    ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                                                    : "bg-muted/50 border-border hover:border-primary/30",
                                                "border"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center",
                                                `bg-gradient-to-br ${cat.color}`
                                            )}>
                                                <cat.icon className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[8px] text-muted-foreground">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Upload Zone */}
                            <div className="space-y-3">
                                <label
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer",
                                        "border-2 border-dashed border-border hover:border-primary/50",
                                        "bg-muted/30 hover:bg-muted/50 transition-all"
                                    )}
                                >
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-foreground font-medium">Cliquez pour sélectionner</p>
                                    <p className="text-[10px] text-muted-foreground">ou glissez-déposez vos fichiers</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => handleUpload(e.target.files)}
                                    />
                                </label>

                                {/* Camera option */}
                                <button
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                                        "bg-muted/50 hover:bg-muted transition-colors",
                                        "text-xs font-medium text-muted-foreground"
                                    )}
                                >
                                    <Camera className="w-4 h-4" />
                                    Prendre une photo
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Preview Modal */}
            <AnimatePresence>
                {selectedDocument && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedDocument(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-lg p-5 rounded-2xl",
                                "bg-background border border-border shadow-2xl"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const catInfo = getCategoryInfo(selectedDocument.category);
                                        return catInfo && (
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                `bg-gradient-to-br ${catInfo.color}`
                                            )}>
                                                <catInfo.icon className="w-4 h-4 text-white" />
                                            </div>
                                        );
                                    })()}
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">{selectedDocument.name}</h3>
                                        <p className="text-[10px] text-muted-foreground">
                                            {selectedDocument.file_size} • {new Date(selectedDocument.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDocument(null)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Preview area */}
                            <div className={cn(
                                "aspect-[4/3] rounded-xl mb-4 flex items-center justify-center",
                                "bg-muted/50"
                            )}>
                                {selectedDocument.file_type === "image" ? (
                                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                                ) : (
                                    <FileText className="w-16 h-16 text-muted-foreground" />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                                        "text-xs font-medium"
                                    )}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Télécharger
                                </button>
                                <button
                                    onClick={() => handleDeleteDocument(selectedDocument.id)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
                                        "bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors",
                                        "text-xs font-medium"
                                    )}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </UserSpaceLayout>
    );
};

export default DocumentVault;
