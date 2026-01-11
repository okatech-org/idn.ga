import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, FileText, CreditCard, GraduationCap, Building2, Car } from "lucide-react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DocumentList = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("Tous");
    const [searchTerm, setSearchTerm] = useState("");

    const documents = [
        { id: 1, title: "CNI", type: "Identité", status: "Vérifié", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: 2, title: "Passeport", type: "Identité", status: "Vérifié", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: 3, title: "Permis", type: "Transport", status: "Vérifié", icon: Car, color: "text-orange-500", bg: "bg-orange-500/10" },
        { id: 4, title: "Master 2", type: "Diplômes", status: "En attente", icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10" },
        { id: 5, title: "Résidence", type: "Administratif", status: "Expiré", icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    const filters = ["Tous", "Identité", "Diplômes", "Admin", "Transport"];

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === "Tous" || doc.type === filter || (filter === "Admin" && doc.type === "Administratif");
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Vérifié": return "text-green-500 bg-green-500/10";
            case "En attente": return "text-amber-500 bg-amber-500/10";
            case "Expiré": return "text-red-500 bg-red-500/10";
            default: return "text-slate-500 bg-slate-500/10";
        }
    };

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-center shrink-0">
                    <h1 className="text-lg font-bold text-foreground">Mes Documents</h1>
                    <button
                        onClick={() => navigate("/documents/add")}
                        className={cn(
                            "p-2 rounded-lg",
                            "bg-primary text-white",
                            "hover:bg-primary/90"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Search + Filters */}
                <div className="shrink-0 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                                "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                                "border border-slate-200/60 dark:border-white/10",
                                "focus:outline-none focus:border-primary/50"
                            )}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="shrink-0 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                                filter === f
                                    ? "bg-primary text-white"
                                    : "bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Document Grid */}
                <div className="flex-1 min-h-0 overflow-auto">
                    {filteredDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {filteredDocs.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                    className={cn(
                                        "p-3 rounded-xl cursor-pointer transition-all",
                                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                                        "border border-slate-200/60 dark:border-white/10",
                                        "hover:border-primary/30 hover:scale-[1.02]",
                                        "group"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg shrink-0", doc.bg)}>
                                            <doc.icon className={cn("w-4 h-4", doc.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-foreground truncate">{doc.title}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-muted-foreground">{doc.type}</span>
                                                <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", getStatusStyle(doc.status))}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className={cn(
                            "text-center py-6 rounded-xl",
                            "bg-white/60 dark:bg-white/5",
                            "border border-slate-200/60 dark:border-white/10"
                        )}>
                            <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Aucun document</p>
                        </div>
                    )}
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default DocumentList;
