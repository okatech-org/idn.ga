import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import DocumentCard from "@/components/documents/DocumentCard";
import { motion } from "framer-motion";

const DocumentList = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("Tous");
    const [searchTerm, setSearchTerm] = useState("");

    // Mock Data - In real app, fetch from API
    const documents = [
        { id: 1, title: "Carte Nationale d'Identité", type: "Identité", date: "01/01/2024", status: "Vérifié", expiry: "2034-01-01" },
        { id: 2, title: "Passeport", type: "Identité", date: "15/06/2023", status: "Vérifié", expiry: "2028-06-15" },
        { id: 3, title: "Permis de Conduire", type: "Transport", date: "10/03/2022", status: "Vérifié", expiry: "2027-03-10" },
        { id: 4, title: "Diplôme Master 2", type: "Diplômes", date: "20/09/2020", status: "En attente", expiry: null },
        { id: 5, title: "Attestation de Résidence", type: "Administratif", date: "05/11/2024", status: "Vérifié", expiry: "2025-05-05" },
    ] as const;

    const filters = ["Tous", "Identité", "Diplômes", "Administratif", "Transport"];

    const filteredDocs = documents.filter(doc => {
        const matchesFilter = filter === "Tous" || doc.type === filter;
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <UserSpaceLayout>
            <div className="space-y-6 pb-24">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Mes Documents</h1>
                        <p className="text-sm text-muted-foreground">Gérez vos documents officiels</p>
                    </div>
                    <Button
                        size="icon"
                        className="rounded-full w-12 h-12 neu-raised hover:text-primary transition-colors"
                        onClick={() => navigate("/documents/add")}
                    >
                        <Plus size={24} />
                    </Button>
                </div>

                {/* Search & Filter */}
                <div className="flex space-x-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 neu-inset bg-transparent border-none shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="w-12 h-12 neu-raised rounded-xl text-muted-foreground">
                        <Filter size={20} />
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === f
                                ? "neu-inset text-primary"
                                : "neu-raised text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Document List */}
                <div className="space-y-4">
                    {filteredDocs.length > 0 ? (
                        filteredDocs.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DocumentCard
                                    title={doc.title}
                                    type={doc.type}
                                    date={doc.date}
                                    status={doc.status}
                                    expiry={doc.expiry}
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Aucun document trouvé.</p>
                        </div>
                    )}
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default DocumentList;
