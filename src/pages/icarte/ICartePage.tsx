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
    Users,
    Vote,
    Flag,
    Gift,
    Palette,
    Eye,
    EyeOff,
    ChevronRight,
    Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletCard, defaultCards } from "@/components/dashboard/DigitalWallet";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useNavigate } from "react-router-dom";

// Available gradients for custom cards
const availableGradients = [
    { name: "Vert", value: "from-green-600 via-green-700 to-emerald-800", preview: "bg-green-600" },
    { name: "Orange", value: "from-orange-500 via-orange-600 to-red-600", preview: "bg-orange-500" },
    { name: "Bleu", value: "from-blue-500 via-blue-600 to-indigo-700", preview: "bg-blue-500" },
    { name: "Rose", value: "from-rose-500 via-rose-600 to-pink-600", preview: "bg-rose-500" },
    { name: "Noir", value: "from-slate-800 via-slate-900 to-black", preview: "bg-slate-800" },
    { name: "Violet", value: "from-purple-600 via-purple-700 to-violet-800", preview: "bg-purple-600" },
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

// Card templates
const cardTemplates = [
    { type: "cni", name: "Carte d'Identité", shortLabel: "CNI", icon: CreditCard, gradient: "from-green-600 via-green-700 to-emerald-800" },
    { type: "driving", name: "Permis de Conduire", shortLabel: "Permis", icon: Car, gradient: "from-orange-500 via-orange-600 to-red-600" },
    { type: "transport", name: "Carte Transport", shortLabel: "Transport", icon: Bus, gradient: "from-blue-500 via-blue-600 to-indigo-700" },
    { type: "health", name: "Assurance Maladie", shortLabel: "Santé", icon: Heart, gradient: "from-rose-500 via-rose-600 to-pink-600" },
    { type: "bank", name: "Carte Bancaire", shortLabel: "Bancaire", icon: CreditCard, gradient: "from-slate-800 via-slate-900 to-black" },
    { type: "business", name: "Carte de Visite", shortLabel: "Visite", icon: Briefcase, gradient: "from-purple-600 via-purple-700 to-violet-800" },
    { type: "voter", name: "Carte d'Électeur", shortLabel: "Électeur", icon: Vote, gradient: "from-amber-500 via-amber-600 to-yellow-600" },
    { type: "loyalty", name: "Carte de Fidélité", shortLabel: "Fidélité", icon: Gift, gradient: "from-indigo-600 via-indigo-700 to-blue-800" },
] as const;

type CardType = typeof cardTemplates[number]["type"] | "custom";

// Form fields by type
const cardTypeFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
    cni: [
        { key: "nom", label: "Nom complet", placeholder: "DUPONT Jean" },
        { key: "numero", label: "Numéro CNI", placeholder: "GA-1234-5678-9012" },
    ],
    driving: [
        { key: "nom", label: "Nom complet", placeholder: "DUPONT Jean" },
        { key: "categories", label: "Catégories", placeholder: "A, B, C" },
    ],
    transport: [
        { key: "zone", label: "Zone", placeholder: "Toutes zones" },
        { key: "numero", label: "Numéro", placeholder: "TRS-2024-001234" },
    ],
    health: [
        { key: "regime", label: "Régime", placeholder: "Salarié / Étudiant" },
        { key: "numero", label: "Numéro CNAMGS", placeholder: "CNAM-789012" },
    ],
    bank: [
        { key: "numero", label: "Numéro", placeholder: "**** **** **** 4521" },
        { key: "titulaire", label: "Titulaire", placeholder: "DUPONT JEAN" },
    ],
    business: [
        { key: "titre", label: "Poste", placeholder: "Directeur Technique" },
        { key: "entreprise", label: "Entreprise", placeholder: "TechGabon SARL" },
    ],
    voter: [
        { key: "nom", label: "Nom", placeholder: "DUPONT Jean" },
        { key: "bureau", label: "Bureau", placeholder: "Bureau 12 - Libreville" },
    ],
    loyalty: [
        { key: "enseigne", label: "Enseigne", placeholder: "Casino / Géant" },
        { key: "points", label: "Points", placeholder: "1500 points" },
    ],
    custom: [
        { key: "champ1", label: "Champ 1", placeholder: "Valeur..." },
    ],
};

const ICartePage = () => {
    const navigate = useNavigate();

    // State for all user cards
    const [allCards, setAllCards] = useState<WalletCard[]>(defaultCards);
    // State for featured card IDs (max 6 - shown in profile)
    const [featuredIds, setFeaturedIds] = useState<string[]>(defaultCards.slice(0, 6).map(c => c.id));
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [editingCard, setEditingCard] = useState<WalletCard | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<CardType | null>(null);
    // Form state
    const [cardForm, setCardForm] = useState({
        name: "",
        subtitle: "",
        data: {} as Record<string, string>,
    });
    // Custom card form
    const [customCardForm, setCustomCardForm] = useState({
        name: "Ma Carte",
        subtitle: "",
        selectedGradient: availableGradients[0].value,
        selectedIconIndex: 0,
        fields: [{ key: "nom", label: "Nom", value: "" }],
    });

    // Get cards NOT in profile (not featured)
    const nonFeaturedCards = allCards.filter(c => !featuredIds.includes(c.id));
    const featuredCards = featuredIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as WalletCard[];

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

    // Edit modal
    const openEditModal = (card: WalletCard) => {
        setEditingCard(card);
        setCardForm({ name: card.name, subtitle: card.subtitle || "", data: { ...card.data } });
    };

    const saveEdit = () => {
        if (!editingCard) return;
        setAllCards(allCards.map(c =>
            c.id === editingCard.id ? { ...c, name: cardForm.name, subtitle: cardForm.subtitle, data: cardForm.data } : c
        ));
        setEditingCard(null);
    };

    // Add modal
    const openAddModal = (templateType: CardType) => {
        const template = cardTemplates.find(t => t.type === templateType);
        if (!template) return;
        setSelectedTemplate(templateType);
        setCardForm({ name: template.name, subtitle: "", data: {} });
        setShowAddModal(true);
    };

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

    // Custom card
    const openCustomCardModal = () => {
        setCustomCardForm({
            name: "Ma Carte",
            subtitle: "",
            selectedGradient: availableGradients[0].value,
            selectedIconIndex: 0,
            fields: [{ key: "nom", label: "Nom", value: "" }],
        });
        setShowCustomModal(true);
    };

    const createCustomCard = () => {
        const SelectedIcon = availableIcons[customCardForm.selectedIconIndex].icon;
        const newCard: WalletCard = {
            id: `custom-${Date.now()}`,
            type: "custom" as any,
            name: customCardForm.name,
            subtitle: customCardForm.subtitle,
            icon: SelectedIcon,
            gradient: customCardForm.selectedGradient,
            data: customCardForm.fields.reduce((acc, f) => ({ ...acc, [f.label.toLowerCase()]: f.value }), {}),
            backData: {},
            actions: [],
        };
        setAllCards([...allCards, newCard]);
        setShowCustomModal(false);
    };

    // Card row component
    const CardRow = ({ card, showFeaturedButton = true }: { card: WalletCard; showFeaturedButton?: boolean }) => {
        const isFeatured = featuredIds.includes(card.id);
        const isHealthCard = card.type === "health";

        const handleCardClick = () => {
            if (isHealthCard) {
                navigate("/health/cnamgs");
            }
        };

        return (
            <div
                onClick={isHealthCard ? handleCardClick : undefined}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    "bg-white dark:bg-white/5",
                    "border border-slate-200 dark:border-white/10",
                    "hover:border-primary/30 hover:shadow-sm",
                    isHealthCard && "cursor-pointer hover:bg-primary/5"
                )}
            >
                {/* Card Preview */}
                <div className={cn(
                    "w-14 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                    `bg-gradient-to-br ${card.gradient}`
                )}>
                    {card.type === "cni" ? (
                        <img src={sceauGabon} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                        <card.icon className="w-4 h-4 text-white" />
                    )}
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{card.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.subtitle}</p>
                </div>

                {/* Health card indicator */}
                {isHealthCard && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        <ChevronRight className="w-3 h-3" />
                        <span>Voir</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {!isHealthCard && (
                        <button
                            onClick={(e) => { e.stopPropagation(); openEditModal(card); }}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            title="Modifier"
                        >
                            <Edit3 className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                    {showFeaturedButton && (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFeatured(card.id); }}
                            disabled={!isFeatured && featuredIds.length >= 6}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isFeatured ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10",
                                !isFeatured && featuredIds.length >= 6 && "opacity-30 cursor-not-allowed"
                            )}
                            title={isFeatured ? "Retirer du profil" : "Ajouter au profil"}
                        >
                            {isFeatured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                    )}
                    {!isHealthCard && (
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <UserSpaceLayout>
            <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">iCarte</h1>
                        <p className="text-sm text-muted-foreground">Gérez toutes vos cartes numériques</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full",
                            "bg-primary/10 text-primary"
                        )}>
                            {featuredIds.length}/6 dans le profil
                        </span>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                "bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10",
                                "hover:border-primary/30 hover:bg-slate-50"
                            )}
                        >
                            <Wallet className="w-4 h-4" />
                            Voir le profil
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0 overflow-hidden">

                    {/* Left: Featured Cards (in profile) */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "p-4 rounded-xl flex flex-col overflow-hidden",
                            "bg-white/90 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200 dark:border-white/10"
                        )}
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                <p className="text-sm font-semibold text-foreground">Cartes dans le Profil</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Glissez pour réordonner</span>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <Reorder.Group axis="y" values={featuredIds} onReorder={setFeaturedIds} className="grid grid-cols-2 gap-2">
                                {featuredCards.map((card) => {
                                    const isHealthCard = card.type === "health";
                                    return (
                                        <Reorder.Item key={card.id} value={card.id} className="cursor-grab active:cursor-grabbing">
                                            <div
                                                onClick={isHealthCard ? () => navigate("/health/cnamgs") : undefined}
                                                className={cn(
                                                    "relative rounded-xl overflow-hidden p-2",
                                                    "bg-primary/5 dark:bg-primary/10",
                                                    "border border-primary/20",
                                                    isHealthCard && "hover:bg-primary/10 cursor-pointer"
                                                )}
                                                style={{ aspectRatio: "85 / 55" }}
                                            >
                                                {/* Card Preview - Wallet Style */}
                                                <div
                                                    className={cn(
                                                        "w-full h-full rounded-lg flex flex-col justify-between p-2",
                                                        isHealthCard ? "bg-white" : `bg-gradient-to-br ${card.gradient}`
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            {card.type === "cni" ? (
                                                                <img src={sceauGabon} alt="" className="h-4 w-4 object-contain" />
                                                            ) : isHealthCard ? (
                                                                <div className="w-4 h-3 bg-[#009640] rounded-sm" />
                                                            ) : (
                                                                <div className="p-1 rounded bg-white/20">
                                                                    <card.icon className="w-2.5 h-2.5 text-white" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className={cn(
                                                                    "text-[10px] font-bold leading-tight truncate",
                                                                    isHealthCard ? "text-[#009640]" : "text-white"
                                                                )}>{card.name}</p>
                                                                <p className={cn(
                                                                    "text-[8px] truncate",
                                                                    isHealthCard ? "text-gray-500" : "text-white/70"
                                                                )}>{card.subtitle}</p>
                                                            </div>
                                                        </div>
                                                        <GripVertical className={cn(
                                                            "w-3 h-3 shrink-0",
                                                            isHealthCard ? "text-gray-400" : "text-white/50"
                                                        )} />
                                                    </div>

                                                    {isHealthCard ? (
                                                        <div className="flex items-center justify-end">
                                                            <span className="text-[8px] text-primary font-medium">Ouvrir →</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleFeatured(card.id); }}
                                                            className="absolute top-1 right-1 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                                                            title="Retirer du profil"
                                                        >
                                                            <EyeOff className="w-3 h-3 text-white" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>

                            {featuredCards.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Wallet className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">Aucune carte dans le profil</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Ajoutez des cartes depuis la liste à droite
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right: Non-featured cards + Add */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "p-4 rounded-xl flex flex-col overflow-hidden",
                            "bg-white/90 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200 dark:border-white/10"
                        )}
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm font-semibold text-foreground">Autres Cartes</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{nonFeaturedCards.length} cartes</span>
                        </div>

                        <div className="flex-1 overflow-auto space-y-2">
                            {nonFeaturedCards.map((card) => (
                                <CardRow key={card.id} card={card} />
                            ))}

                            {nonFeaturedCards.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CreditCard className="w-10 h-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">Toutes vos cartes sont dans le profil</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Ajoutez de nouvelles cartes ci-dessous
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Add Card Section */}
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 shrink-0">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Ajouter une carte</p>
                            <div className="grid grid-cols-4 gap-2">
                                {cardTemplates.slice(0, 6).map((template) => (
                                    <button
                                        key={template.type}
                                        onClick={() => openAddModal(template.type)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
                                            "bg-slate-50 dark:bg-white/5",
                                            "hover:bg-slate-100 dark:hover:bg-white/10",
                                            "border border-transparent hover:border-primary/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-5 rounded flex items-center justify-center",
                                            `bg-gradient-to-br ${template.gradient}`
                                        )}>
                                            <template.icon className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{template.shortLabel}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={openCustomCardModal}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all col-span-2",
                                        "bg-primary/10 hover:bg-primary/20",
                                        "border border-primary/20 hover:border-primary/40"
                                    )}
                                >
                                    <div className="w-8 h-5 rounded flex items-center justify-center bg-primary/20">
                                        <Palette className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-[10px] text-primary font-medium">Personnalisée</span>
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
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-5 rounded-xl bg-background border border-border shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold">Modifier la carte</h3>
                                <button onClick={() => setEditingCard(null)} className="p-1.5 rounded-lg hover:bg-muted">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Nom</label>
                                    <input
                                        type="text"
                                        value={cardForm.name}
                                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Sous-titre</label>
                                    <input
                                        type="text"
                                        value={cardForm.subtitle}
                                        onChange={(e) => setCardForm({ ...cardForm, subtitle: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setEditingCard(null)}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-1"
                                >
                                    <Check className="w-4 h-4" /> Enregistrer
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
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-5 rounded-xl bg-background border border-border shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const template = cardTemplates.find(t => t.type === selectedTemplate);
                                        return template ? (
                                            <div className={cn("w-10 h-6 rounded-lg flex items-center justify-center", `bg-gradient-to-br ${template.gradient}`)}>
                                                <template.icon className="w-4 h-4 text-white" />
                                            </div>
                                        ) : null;
                                    })()}
                                    <h3 className="text-base font-bold">{cardTemplates.find(t => t.type === selectedTemplate)?.name}</h3>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Nom de la carte</label>
                                    <input
                                        type="text"
                                        value={cardForm.name}
                                        onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Émetteur / Organisation</label>
                                    <input
                                        type="text"
                                        value={cardForm.subtitle}
                                        onChange={(e) => setCardForm({ ...cardForm, subtitle: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                {cardTypeFields[selectedTemplate]?.map((field) => (
                                    <div key={field.key}>
                                        <label className="text-xs font-medium text-muted-foreground uppercase">{field.label}</label>
                                        <input
                                            type="text"
                                            value={cardForm.data[field.key] || ""}
                                            onChange={(e) => setCardForm({ ...cardForm, data: { ...cardForm.data, [field.key]: e.target.value } })}
                                            placeholder={field.placeholder}
                                            className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={addCard}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Créer
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
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-5 rounded-xl bg-background border border-border shadow-2xl max-h-[80vh] overflow-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold">Carte Personnalisée</h3>
                                <button onClick={() => setShowCustomModal(false)} className="p-1.5 rounded-lg hover:bg-muted">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Nom</label>
                                    <input
                                        type="text"
                                        value={customCardForm.name}
                                        onChange={(e) => setCustomCardForm({ ...customCardForm, name: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 rounded-lg text-sm bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Couleur</label>
                                    <div className="flex gap-2 mt-1">
                                        {availableGradients.map((g) => (
                                            <button
                                                key={g.value}
                                                onClick={() => setCustomCardForm({ ...customCardForm, selectedGradient: g.value })}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg",
                                                    g.preview,
                                                    customCardForm.selectedGradient === g.value && "ring-2 ring-primary ring-offset-2"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Icône</label>
                                    <div className="flex gap-2 mt-1">
                                        {availableIcons.slice(0, 6).map((ic, idx) => (
                                            <button
                                                key={ic.name}
                                                onClick={() => setCustomCardForm({ ...customCardForm, selectedIconIndex: idx })}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center bg-muted",
                                                    customCardForm.selectedIconIndex === idx && "ring-2 ring-primary"
                                                )}
                                            >
                                                <ic.icon className="w-4 h-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowCustomModal(false)}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={createCustomCard}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Créer
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
