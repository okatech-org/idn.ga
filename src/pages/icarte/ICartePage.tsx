import { useState } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Plus,
    Trash2,
    Edit3,
    GripVertical,
    Star,
    StarOff,
    CreditCard,
    Bus,
    Heart,
    Car,
    Briefcase,
    X,
    Check,
    ChevronRight,
    Users,
    Vote,
    Flag,
    Gift,
    Palette,
    PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletCard, defaultCards } from "@/components/dashboard/DigitalWallet";
import sceauGabon from "@/assets/sceau_gabon.png";

// Available gradients for custom cards
const availableGradients = [
    { name: "Vert", value: "from-green-600 via-green-700 to-emerald-800", preview: "bg-green-600" },
    { name: "Orange", value: "from-orange-500 via-orange-600 to-red-600", preview: "bg-orange-500" },
    { name: "Bleu", value: "from-blue-500 via-blue-600 to-indigo-700", preview: "bg-blue-500" },
    { name: "Rose", value: "from-rose-500 via-rose-600 to-pink-600", preview: "bg-rose-500" },
    { name: "Noir", value: "from-slate-800 via-slate-900 to-black", preview: "bg-slate-800" },
    { name: "Violet", value: "from-purple-600 via-purple-700 to-violet-800", preview: "bg-purple-600" },
    { name: "Cyan", value: "from-cyan-500 via-cyan-600 to-teal-700", preview: "bg-cyan-500" },
    { name: "Jaune", value: "from-amber-500 via-amber-600 to-yellow-600", preview: "bg-amber-500" },
    { name: "Rouge", value: "from-red-600 via-red-700 to-rose-800", preview: "bg-red-600" },
    { name: "Indigo", value: "from-indigo-600 via-indigo-700 to-blue-800", preview: "bg-indigo-600" },
];

// Available icons for custom cards
const availableIcons = [
    { name: "Carte", icon: CreditCard },
    { name: "Voiture", icon: Car },
    { name: "Bus", icon: Bus },
    { name: "Cœur", icon: Heart },
    { name: "Valise", icon: Briefcase },
    { name: "Groupe", icon: Users },
    { name: "Vote", icon: Vote },
    { name: "Drapeau", icon: Flag },
    { name: "Cadeau", icon: Gift },
];

// Extended card type templates
const cardTemplates = [
    { type: "cni", name: "Carte d'Identité", shortLabel: "CNI", icon: CreditCard, gradient: "from-green-600 via-green-700 to-emerald-800" },
    { type: "driving", name: "Permis de Conduire", shortLabel: "Permis", icon: Car, gradient: "from-orange-500 via-orange-600 to-red-600" },
    { type: "transport", name: "Carte Transport", shortLabel: "Transport", icon: Bus, gradient: "from-blue-500 via-blue-600 to-indigo-700" },
    { type: "health", name: "Assurance Maladie", shortLabel: "Santé", icon: Heart, gradient: "from-rose-500 via-rose-600 to-pink-600" },
    { type: "bank", name: "Carte Bancaire", shortLabel: "Bancaire", icon: CreditCard, gradient: "from-slate-800 via-slate-900 to-black" },
    { type: "business", name: "Carte de Visite", shortLabel: "Visite", icon: Briefcase, gradient: "from-purple-600 via-purple-700 to-violet-800" },
    { type: "association", name: "Carte d'Association", shortLabel: "Association", icon: Users, gradient: "from-cyan-500 via-cyan-600 to-teal-700" },
    { type: "voter", name: "Carte d'Électeur", shortLabel: "Électeur", icon: Vote, gradient: "from-amber-500 via-amber-600 to-yellow-600" },
    { type: "party", name: "Carte de Parti", shortLabel: "Parti", icon: Flag, gradient: "from-red-600 via-red-700 to-rose-800" },
    { type: "loyalty", name: "Carte de Fidélité", shortLabel: "Fidélité", icon: Gift, gradient: "from-indigo-600 via-indigo-700 to-blue-800" },
] as const;

type CardType = typeof cardTemplates[number]["type"] | "custom";

// Type-specific form fields for each card type
const cardTypeFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
    cni: [
        { key: "nom", label: "Nom complet", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro CNI", placeholder: "GA-1234-5678-9012" },
        { key: "validite", label: "Date de validité", placeholder: "12/2030" },
    ],
    driving: [
        { key: "nom", label: "Nom complet", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro permis", placeholder: "PER-GA-2022-5678" },
        { key: "categories", label: "Catégories", placeholder: "A, B, C" },
    ],
    transport: [
        { key: "zone", label: "Zone de circulation", placeholder: "Toutes zones" },
        { key: "numero", label: "Numéro carte", placeholder: "TRS-2024-001234" },
        { key: "validite", label: "Validité", placeholder: "01/2025" },
    ],
    health: [
        { key: "regime", label: "Régime", placeholder: "Salarié / GEF / Étudiant" },
        { key: "numero", label: "Numéro CNAMGS", placeholder: "CNAM-789012" },
        { key: "validite", label: "Date de validité", placeholder: "12/2025" },
    ],
    bank: [
        { key: "numero", label: "Numéro de carte", placeholder: "**** **** **** 4521" },
        { key: "titulaire", label: "Titulaire", placeholder: "DUPONT JEAN" },
        { key: "expiration", label: "Date d'expiration", placeholder: "09/27" },
    ],
    business: [
        { key: "titre", label: "Titre / Poste", placeholder: "Directeur Technique" },
        { key: "entreprise", label: "Entreprise", placeholder: "TechGabon SARL" },
        { key: "email", label: "Email professionnel", placeholder: "contact@entreprise.ga" },
        { key: "telephone", label: "Téléphone", placeholder: "+241 77 12 34 56" },
    ],
    association: [
        { key: "nom", label: "Nom du membre", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro de membre", placeholder: "ASS-2024-001" },
        { key: "fonction", label: "Fonction", placeholder: "Membre / Secrétaire / Président" },
    ],
    voter: [
        { key: "nom", label: "Nom complet", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro électeur", placeholder: "EL-GA-2024-123456" },
        { key: "bureau", label: "Bureau de vote", placeholder: "Bureau 12 - Libreville" },
    ],
    party: [
        { key: "nom", label: "Nom du militant", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro de carte", placeholder: "PDG-2024-001" },
        { key: "section", label: "Section locale", placeholder: "Section Libreville-Nord" },
    ],
    loyalty: [
        { key: "nom", label: "Nom du client", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro de fidélité", placeholder: "FID-123456" },
        { key: "points", label: "Points accumulés", placeholder: "1500 points" },
    ],
    custom: [
        { key: "champ1", label: "Champ 1", placeholder: "Valeur..." },
        { key: "champ2", label: "Champ 2", placeholder: "Valeur..." },
    ],
};

// Get subtitle placeholder based on card type
const getSubtitlePlaceholder = (type: string): string => {
    const placeholders: Record<string, string> = {
        cni: "République Gabonaise",
        driving: "Catégories B, C",
        transport: "STLG Libreville / SOTRAVOG",
        health: "Assurance Maladie",
        bank: "BGFI Bank / UGB / Orabank",
        business: "Nom de l'entreprise",
        association: "Nom de l'association",
        voter: "Élections 2025",
        party: "Nom du parti politique",
        loyalty: "Nom de l'enseigne",
        custom: "Organisation / Émetteur",
    };
    return placeholders[type] || "Organisation";
};

const ICartePage = () => {
    // State for all user cards
    const [allCards, setAllCards] = useState<WalletCard[]>(defaultCards);
    // State for featured card IDs (max 6)
    const [featuredIds, setFeaturedIds] = useState<string[]>(defaultCards.slice(0, 6).map(c => c.id));
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [editingCard, setEditingCard] = useState<WalletCard | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<CardType | null>(null);
    // Form state for new/edit card
    const [cardForm, setCardForm] = useState({
        name: "",
        subtitle: "",
        data: {} as Record<string, string>,
    });
    // Custom card form state
    const [customCardForm, setCustomCardForm] = useState({
        name: "",
        subtitle: "",
        selectedGradient: availableGradients[0].value,
        selectedIconIndex: 0,
        fields: [
            { key: "champ1", label: "Champ 1", value: "" },
            { key: "champ2", label: "Champ 2", value: "" },
        ],
    });

    // Open custom card modal
    const openCustomCardModal = () => {
        setCustomCardForm({
            name: "Ma Carte",
            subtitle: "",
            selectedGradient: availableGradients[0].value,
            selectedIconIndex: 0,
            fields: [
                { key: "nom", label: "Nom", value: "" },
                { key: "numero", label: "Numéro", value: "" },
            ],
        });
        setShowCustomModal(true);
    };

    // Add field to custom card
    const addCustomField = () => {
        const newKey = `champ${customCardForm.fields.length + 1}`;
        setCustomCardForm({
            ...customCardForm,
            fields: [...customCardForm.fields, { key: newKey, label: `Champ ${customCardForm.fields.length + 1}`, value: "" }],
        });
    };

    // Remove field from custom card
    const removeCustomField = (index: number) => {
        if (customCardForm.fields.length <= 1) return;
        setCustomCardForm({
            ...customCardForm,
            fields: customCardForm.fields.filter((_, i) => i !== index),
        });
    };

    // Create custom card
    const createCustomCard = () => {
        const SelectedIcon = availableIcons[customCardForm.selectedIconIndex].icon;
        const newCard: WalletCard = {
            id: `custom-${Date.now()}`,
            type: "custom" as any,
            name: customCardForm.name,
            subtitle: customCardForm.subtitle,
            icon: SelectedIcon,
            gradient: customCardForm.selectedGradient,
            data: customCardForm.fields.reduce((acc, field) => {
                acc[field.label.toLowerCase()] = field.value;
                return acc;
            }, {} as Record<string, string>),
            backData: {},
            actions: [],
        };
        setAllCards([...allCards, newCard]);
        setShowCustomModal(false);
    };

    // Get featured cards in order
    const featuredCards = featuredIds
        .map(id => allCards.find(c => c.id === id))
        .filter(Boolean) as WalletCard[];

    // Toggle featured status
    const toggleFeatured = (cardId: string) => {
        if (featuredIds.includes(cardId)) {
            setFeaturedIds(featuredIds.filter(id => id !== cardId));
        } else if (featuredIds.length < 6) {
            setFeaturedIds([...featuredIds, cardId]);
        }
    };

    // Delete card
    const deleteCard = (cardId: string) => {
        setAllCards(allCards.filter(c => c.id !== cardId));
        setFeaturedIds(featuredIds.filter(id => id !== cardId));
    };

    // Open edit modal
    const openEditModal = (card: WalletCard) => {
        setEditingCard(card);
        setCardForm({
            name: card.name,
            subtitle: card.subtitle || "",
            data: { ...card.data },
        });
    };

    // Save edit
    const saveEdit = () => {
        if (!editingCard) return;
        setAllCards(allCards.map(c =>
            c.id === editingCard.id
                ? { ...c, name: cardForm.name, subtitle: cardForm.subtitle, data: cardForm.data }
                : c
        ));
        setEditingCard(null);
    };

    // Open add modal with template
    const openAddModal = (templateType: CardType) => {
        const template = cardTemplates.find(t => t.type === templateType);
        if (!template) return;
        setSelectedTemplate(templateType);
        setCardForm({
            name: template.name,
            subtitle: "",
            data: {},
        });
        setShowAddModal(true);
    };

    // Add new card
    const addCard = () => {
        if (!selectedTemplate) return;
        const template = cardTemplates.find(t => t.type === selectedTemplate);
        if (!template) return;

        const newCard: WalletCard = {
            id: `${selectedTemplate}-${Date.now()}`,
            type: selectedTemplate,
            name: cardForm.name,
            subtitle: cardForm.subtitle,
            icon: template.icon,
            gradient: template.gradient,
            data: cardForm.data,
            backData: {},
            actions: [],
        };

        setAllCards([...allCards, newCard]);
        setShowAddModal(false);
        setSelectedTemplate(null);
    };

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-foreground">iCarte</h1>
                        <p className="text-xs text-muted-foreground">Gérez vos cartes numériques</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {featuredIds.length}/6 cartes en vedette
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">

                    {/* Left: Featured Cards (Drag & Drop) */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "p-4 rounded-2xl flex flex-col overflow-hidden",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10"
                        )}
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <p className="text-xs font-semibold text-foreground">Mes 6 cartes en vedette</p>
                            <p className="text-[9px] text-muted-foreground">Glissez pour réordonner</p>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <Reorder.Group
                                axis="y"
                                values={featuredIds}
                                onReorder={setFeaturedIds}
                                className="space-y-2"
                            >
                                {featuredCards.map((card) => (
                                    <Reorder.Item
                                        key={card.id}
                                        value={card.id}
                                        className="cursor-grab active:cursor-grabbing"
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 p-2.5 rounded-xl",
                                                "bg-slate-100/50 dark:bg-white/5",
                                                "border border-slate-200/60 dark:border-white/10",
                                                "hover:border-primary/30 transition-all"
                                            )}
                                        >
                                            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />

                                            <div
                                                className={cn(
                                                    "w-10 h-6 rounded-md flex items-center justify-center shrink-0",
                                                    `bg-gradient-to-br ${card.gradient}`
                                                )}
                                            >
                                                {card.type === "cni" ? (
                                                    <img src={sceauGabon} alt="" className="h-4 w-4 object-contain" />
                                                ) : (
                                                    <card.icon className="w-3 h-3 text-white" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-medium text-foreground truncate">{card.name}</p>
                                                <p className="text-[9px] text-muted-foreground truncate">{card.subtitle}</p>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => openEditModal(card)}
                                                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                                                </button>
                                                <button
                                                    onClick={() => toggleFeatured(card.id)}
                                                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <StarOff className="w-3 h-3 text-amber-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>

                            {featuredCards.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CreditCard className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-muted-foreground">Aucune carte en vedette</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Sélectionnez des cartes à droite</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: All Cards + Add */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "p-4 rounded-2xl flex flex-col overflow-hidden",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10"
                        )}
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <p className="text-xs font-semibold text-foreground">Toutes mes cartes</p>
                            <p className="text-[9px] text-muted-foreground">{allCards.length} cartes</p>
                        </div>

                        <div className="flex-1 overflow-auto space-y-2">
                            {allCards.map((card) => {
                                const isFeatured = featuredIds.includes(card.id);
                                return (
                                    <div
                                        key={card.id}
                                        className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-xl",
                                            "bg-slate-100/50 dark:bg-white/5",
                                            "border border-slate-200/60 dark:border-white/10",
                                            isFeatured && "ring-2 ring-primary/30"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-6 rounded-md flex items-center justify-center shrink-0",
                                                `bg-gradient-to-br ${card.gradient}`
                                            )}
                                        >
                                            {card.type === "cni" ? (
                                                <img src={sceauGabon} alt="" className="h-4 w-4 object-contain" />
                                            ) : (
                                                <card.icon className="w-3 h-3 text-white" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-foreground truncate">{card.name}</p>
                                            <p className="text-[9px] text-muted-foreground truncate">{card.subtitle}</p>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openEditModal(card)}
                                                className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <Edit3 className="w-3 h-3 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => toggleFeatured(card.id)}
                                                disabled={!isFeatured && featuredIds.length >= 6}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    isFeatured
                                                        ? "text-amber-500 hover:bg-amber-500/10"
                                                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10",
                                                    !isFeatured && featuredIds.length >= 6 && "opacity-30 cursor-not-allowed"
                                                )}
                                            >
                                                {isFeatured ? <Star className="w-3 h-3 fill-current" /> : <Star className="w-3 h-3" />}
                                            </button>
                                            <button
                                                onClick={() => deleteCard(card.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Card Section */}
                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 shrink-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Ajouter une carte</p>
                            <div className="grid grid-cols-4 gap-1.5">
                                {cardTemplates.map((template) => (
                                    <button
                                        key={template.type}
                                        onClick={() => openAddModal(template.type)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all",
                                            "bg-slate-100/50 dark:bg-white/5",
                                            "hover:bg-slate-200/50 dark:hover:bg-white/10",
                                            "border border-transparent hover:border-primary/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded-md flex items-center justify-center",
                                            `bg-gradient-to-br ${template.gradient}`
                                        )}>
                                            <template.icon className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <span className="text-[7px] text-muted-foreground truncate w-full text-center">{template.shortLabel}</span>
                                    </button>
                                ))}
                                {/* Custom Card Button */}
                                <button
                                    onClick={() => openCustomCardModal()}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all col-span-2",
                                        "bg-gradient-to-br from-primary/20 to-primary/10",
                                        "hover:from-primary/30 hover:to-primary/20",
                                        "border border-primary/30 hover:border-primary/50"
                                    )}
                                >
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center bg-primary/20">
                                        <Palette className="w-2.5 h-2.5 text-primary" />
                                    </div>
                                    <span className="text-[7px] text-primary font-medium">Personnalisée</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setEditingCard(null)}
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
                                <h3 className="text-sm font-bold text-foreground">Modifier la carte</h3>
                                <button
                                    onClick={() => setEditingCard(null)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Nom</label>
                                    <input
                                        type="text"
                                        value={cardForm.name}
                                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Sous-titre</label>
                                    <input
                                        type="text"
                                        value={cardForm.subtitle}
                                        onChange={(e) => setCardForm({ ...cardForm, subtitle: e.target.value })}
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    />
                                </div>

                                {/* Data fields */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Données</label>
                                    <div className="mt-1 space-y-2">
                                        {Object.entries(cardForm.data).map(([key, value]) => (
                                            <div key={key} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={key}
                                                    disabled
                                                    className="w-1/3 px-2 py-1.5 rounded-lg text-[11px] bg-muted/30 border border-border"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => setCardForm({
                                                        ...cardForm,
                                                        data: { ...cardForm.data, [key]: e.target.value }
                                                    })}
                                                    className="flex-1 px-2 py-1.5 rounded-lg text-[11px] bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setEditingCard(null)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-muted hover:bg-muted/80 transition-colors"
                                    )}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                                        "flex items-center justify-center gap-1"
                                    )}
                                >
                                    <Check className="w-3 h-3" />
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-lg p-5 rounded-2xl max-h-[85vh] overflow-auto",
                                "bg-background border border-border shadow-2xl"
                            )}
                        >
                            {/* Modal Header with Card Preview */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const template = cardTemplates.find(t => t.type === selectedTemplate);
                                        return template ? (
                                            <div className={cn(
                                                "w-12 h-8 rounded-lg flex items-center justify-center",
                                                `bg-gradient-to-br ${template.gradient}`
                                            )}>
                                                <template.icon className="w-5 h-5 text-white" />
                                            </div>
                                        ) : null;
                                    })()}
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">
                                            {cardTemplates.find(t => t.type === selectedTemplate)?.name || "Nouvelle carte"}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground">Remplissez les informations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Card Name */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Nom de la carte</label>
                                    <input
                                        type="text"
                                        value={cardForm.name}
                                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    />
                                </div>

                                {/* Subtitle with type-specific placeholder */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">
                                        {selectedTemplate === "business" ? "Entreprise" : "Organisation / Émetteur"}
                                    </label>
                                    <input
                                        type="text"
                                        value={cardForm.subtitle}
                                        onChange={(e) => setCardForm({ ...cardForm, subtitle: e.target.value })}
                                        placeholder={getSubtitlePlaceholder(selectedTemplate)}
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    />
                                </div>

                                {/* Separator */}
                                <div className="pt-2 border-t border-border">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">
                                        Informations de la carte
                                    </p>
                                </div>

                                {/* Type-specific fields */}
                                {cardTypeFields[selectedTemplate].map((field) => (
                                    <div key={field.key}>
                                        <label className="text-[10px] font-medium text-muted-foreground uppercase">
                                            {field.label}
                                        </label>
                                        <input
                                            type="text"
                                            value={cardForm.data[field.key] || ""}
                                            onChange={(e) => setCardForm({
                                                ...cardForm,
                                                data: { ...cardForm.data, [field.key]: e.target.value }
                                            })}
                                            placeholder={field.placeholder}
                                            className={cn(
                                                "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                                "bg-muted/50 border border-border",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-muted hover:bg-muted/80 transition-colors"
                                    )}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={addCard}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                                        "flex items-center justify-center gap-1"
                                    )}
                                >
                                    <Plus className="w-3 h-3" />
                                    Créer la carte
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Card Modal */}
            <AnimatePresence>
                {showCustomModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowCustomModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                                "w-full max-w-lg p-5 rounded-2xl max-h-[90vh] overflow-auto",
                                "bg-background border border-border shadow-2xl"
                            )}
                        >
                            {/* Header with preview */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-12 h-8 rounded-lg flex items-center justify-center",
                                        `bg-gradient-to-br ${customCardForm.selectedGradient}`
                                    )}>
                                        {(() => {
                                            const IconComponent = availableIcons[customCardForm.selectedIconIndex].icon;
                                            return <IconComponent className="w-5 h-5 text-white" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Carte Personnalisée</h3>
                                        <p className="text-[10px] text-muted-foreground">Créez votre propre carte</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCustomModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Name and Subtitle */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-medium text-muted-foreground uppercase">Nom de la carte</label>
                                        <input
                                            type="text"
                                            value={customCardForm.name}
                                            onChange={(e) => setCustomCardForm({ ...customCardForm, name: e.target.value })}
                                            placeholder="Ma Carte"
                                            className={cn(
                                                "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                                "bg-muted/50 border border-border",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-medium text-muted-foreground uppercase">Organisation</label>
                                        <input
                                            type="text"
                                            value={customCardForm.subtitle}
                                            onChange={(e) => setCustomCardForm({ ...customCardForm, subtitle: e.target.value })}
                                            placeholder="Nom de l'organisme"
                                            className={cn(
                                                "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                                "bg-muted/50 border border-border",
                                                "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Couleur de la carte</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {availableGradients.map((gradient, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCustomCardForm({ ...customCardForm, selectedGradient: gradient.value })}
                                                className={cn(
                                                    "w-7 h-7 rounded-lg transition-all",
                                                    `bg-gradient-to-br ${gradient.value}`,
                                                    customCardForm.selectedGradient === gradient.value
                                                        ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                                                        : "hover:scale-105"
                                                )}
                                                title={gradient.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Icon Picker */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Icône</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {availableIcons.map((iconItem, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCustomCardForm({ ...customCardForm, selectedIconIndex: index })}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                    "bg-muted/50 border",
                                                    customCardForm.selectedIconIndex === index
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                                title={iconItem.name}
                                            >
                                                <iconItem.icon className="w-4 h-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Fields */}
                                <div className="pt-3 border-t border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-medium text-muted-foreground uppercase">Champs personnalisés</label>
                                        <button
                                            onClick={addCustomField}
                                            className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                                        >
                                            <PlusCircle className="w-3 h-3" />
                                            Ajouter
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {customCardForm.fields.map((field, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => {
                                                        const newFields = [...customCardForm.fields];
                                                        newFields[index].label = e.target.value;
                                                        setCustomCardForm({ ...customCardForm, fields: newFields });
                                                    }}
                                                    placeholder="Libellé"
                                                    className={cn(
                                                        "w-1/3 px-2 py-1.5 rounded-lg text-[11px]",
                                                        "bg-muted/30 border border-border",
                                                        "focus:outline-none focus:ring-1 focus:ring-primary/30"
                                                    )}
                                                />
                                                <input
                                                    type="text"
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const newFields = [...customCardForm.fields];
                                                        newFields[index].value = e.target.value;
                                                        setCustomCardForm({ ...customCardForm, fields: newFields });
                                                    }}
                                                    placeholder="Valeur"
                                                    className={cn(
                                                        "flex-1 px-2 py-1.5 rounded-lg text-[11px]",
                                                        "bg-muted/50 border border-border",
                                                        "focus:outline-none focus:ring-1 focus:ring-primary/30"
                                                    )}
                                                />
                                                <button
                                                    onClick={() => removeCustomField(index)}
                                                    disabled={customCardForm.fields.length <= 1}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        customCardForm.fields.length <= 1
                                                            ? "opacity-30 cursor-not-allowed"
                                                            : "hover:bg-red-500/10"
                                                    )}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowCustomModal(false)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-muted hover:bg-muted/80 transition-colors"
                                    )}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={createCustomCard}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                                        "flex items-center justify-center gap-1"
                                    )}
                                >
                                    <Palette className="w-3 h-3" />
                                    Créer ma carte
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </UserSpaceLayout>
    );
};

export default ICartePage;
