import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard,
    Bus,
    Heart,
    Car,
    Briefcase,
    RotateCcw,
    ArrowLeft,
    Share2,
    CreditCard as PayIcon,
    Printer,
    QrCode,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";

interface CardAction {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}

export interface WalletCard {
    id: string;
    type: "cni" | "transport" | "bank" | "business" | "driving" | "health";
    name: string;
    subtitle?: string;
    icon: React.ElementType;
    gradient: string;
    data: Record<string, string>;
    backData?: Record<string, string>;
    actions?: CardAction[];
}

// Default predefined cards
export const defaultCards: WalletCard[] = [
    {
        id: "cni",
        type: "cni",
        name: "Carte d'Identité",
        subtitle: "République Gabonaise",
        icon: CreditCard,
        gradient: "from-green-600 via-green-700 to-emerald-800",
        data: { nom: "DUPONT Jean", numero: "GA-1234-5678-9012", validite: "12/2030" },
        backData: { naissance: "15/03/1990", lieu: "Libreville", sexe: "M", taille: "1.75m" },
        actions: [
            { icon: QrCode, label: "QR Code", onClick: () => console.log("QR CNI") },
            { icon: Download, label: "Télécharger", onClick: () => console.log("Download CNI") }
        ]
    },
    {
        id: "driving",
        type: "driving",
        name: "Permis de Conduire",
        subtitle: "Catégories B, C",
        icon: Car,
        gradient: "from-orange-500 via-orange-600 to-red-600",
        data: { nom: "DUPONT Jean", numero: "PER-GA-2022-5678", categories: "B, C" },
        backData: { delivrance: "01/03/2022", prefecture: "Libreville", points: "12/12" },
        actions: [
            { icon: QrCode, label: "QR Code", onClick: () => console.log("QR Permis") },
            { icon: Printer, label: "Imprimer", onClick: () => console.log("Print Permis") }
        ]
    },
    {
        id: "transport",
        type: "transport",
        name: "Carte Transport",
        subtitle: "STLG Libreville",
        icon: Bus,
        gradient: "from-blue-500 via-blue-600 to-indigo-700",
        data: { zone: "Toutes zones", numero: "TRS-2024-001234", validite: "01/2025" },
        backData: { type: "Abonnement Mensuel", solde: "12 500 XAF" },
        actions: [
            { icon: PayIcon, label: "Recharger", onClick: () => console.log("Pay Transport") },
            { icon: QrCode, label: "QR Code", onClick: () => console.log("QR Transport") }
        ]
    },
    {
        id: "health",
        type: "health",
        name: "CNAMGS",
        subtitle: "Assurance Maladie",
        icon: Heart,
        gradient: "from-rose-500 via-rose-600 to-pink-600",
        data: { regime: "Salarié", numero: "CNAM-789012", validite: "12/2025" },
        backData: { employeur: "TechGabon SARL", couverture: "100%" },
        actions: [
            { icon: Printer, label: "Attestation", onClick: () => console.log("Print CNAMGS") },
            { icon: Download, label: "Télécharger", onClick: () => console.log("Download CNAMGS") }
        ]
    },
    {
        id: "bank",
        type: "bank",
        name: "BGFI Bank",
        subtitle: "Carte Visa Premium",
        icon: CreditCard,
        gradient: "from-slate-800 via-slate-900 to-black",
        data: { numero: "**** **** **** 4521", titulaire: "DUPONT JEAN", expiration: "09/27" },
        backData: { cvv: "***", plafond: "500 000 XAF/jour" },
        actions: [
            { icon: PayIcon, label: "Payer", onClick: () => console.log("Pay Bank") },
            { icon: QrCode, label: "QR Code", onClick: () => console.log("QR Bank") }
        ]
    },
    {
        id: "business",
        type: "business",
        name: "Carte de Visite",
        subtitle: "TechGabon SARL",
        icon: Briefcase,
        gradient: "from-purple-600 via-purple-700 to-violet-800",
        data: { titre: "Directeur Technique", entreprise: "TechGabon SARL" },
        backData: { email: "j.dupont@techgabon.ga", tel: "+241 77 12 34 56", site: "techgabon.ga" },
        actions: [
            { icon: Share2, label: "Partager", onClick: () => console.log("Share Business") },
            { icon: QrCode, label: "QR Code", onClick: () => console.log("QR Business") }
        ]
    }
];

interface CompactWalletProps {
    cards?: WalletCard[];
    onCardClick?: (cardId: string) => void;
}

export default function CompactWallet({ cards = defaultCards, onCardClick }: CompactWalletProps) {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Take only first 6 cards for display
    const displayCards = cards.slice(0, 6);

    const handleCardClick = (cardId: string) => {
        if (selectedCard === cardId) {
            setIsFlipped(!isFlipped);
        } else {
            setSelectedCard(cardId);
            setIsFlipped(false);
            onCardClick?.(cardId);
        }
    };

    const handleBack = () => {
        setSelectedCard(null);
        setIsFlipped(false);
    };

    // Card overlap offset - like real Apple Wallet
    // Each card shows its header (name + icon) before being covered by the next
    const CARD_OVERLAP = 42; // Offset to show full card header with icon and text
    const CARD_HEIGHT = 52; // Height of each card in stacked view
    const selectedCardData = selectedCard ? displayCards.find(c => c.id === selectedCard) : null;

    // Calculate total stack height
    const stackHeight = CARD_HEIGHT + (displayCards.length - 1) * CARD_OVERLAP;

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Header with back button when card selected */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between mb-2 shrink-0"
                    >
                        <button
                            onClick={handleBack}
                            className={cn(
                                "flex items-center gap-1 text-[10px] font-medium",
                                "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Retour
                        </button>
                        <span className="text-[9px] text-muted-foreground">
                            Cliquez pour retourner
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Stack - Apple Wallet Style */}
            <div className="relative flex-1" style={{ minHeight: selectedCard ? 120 : stackHeight }}>
                <AnimatePresence>
                    {displayCards.map((card, index) => {
                        const isSelected = selectedCard === card.id;

                        // Apple Wallet style: each card is offset by CARD_OVERLAP
                        // Bottom cards are in front (higher z-index for higher index)
                        const stackPosition = index * CARD_OVERLAP;
                        const zIndex = isSelected ? 100 : (index + 1);

                        // When a card is selected, hide others
                        if (selectedCard && !isSelected) {
                            return null;
                        }

                        // Selected card - Full size 85x55 format
                        if (isSelected) {
                            return (
                                <motion.div
                                    key={card.id}
                                    layout
                                    initial={{ y: stackPosition }}
                                    animate={{ y: 0 }}
                                    onClick={() => handleCardClick(card.id)}
                                    className="absolute left-0 right-0 top-0 cursor-pointer"
                                    style={{ zIndex: 100, perspective: "1000px" }}
                                >
                                    <motion.div
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                        style={{
                                            transformStyle: "preserve-3d",
                                            aspectRatio: "85 / 55"
                                        }}
                                        className={cn(
                                            "rounded-xl text-white relative overflow-hidden w-full shadow-xl",
                                            `bg-gradient-to-br ${card.gradient}`
                                        )}
                                    >
                                        {/* Front */}
                                        <div
                                            className="absolute inset-0 p-3"
                                            style={{ backfaceVisibility: "hidden" }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    {card.type === "cni" ? (
                                                        <img src={sceauGabon} alt="" className="h-6 w-6 object-contain" />
                                                    ) : (
                                                        <div className="p-1.5 rounded-lg bg-white/20">
                                                            <card.icon className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-xs">{card.name}</p>
                                                        <p className="text-[9px] opacity-70">{card.subtitle}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                                                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="mt-2 space-y-0.5">
                                                {Object.entries(card.data).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-[8px] uppercase opacity-50">{key}</span>
                                                        <span className={cn("font-medium text-[9px]", key === "numero" && "font-mono")}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 p-3"
                                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-xs">Verso</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                                                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {card.backData && (
                                                <div className="mt-2 space-y-0.5">
                                                    {Object.entries(card.backData).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-[8px] uppercase opacity-50">{key}</span>
                                                            <span className="font-medium text-[9px]">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 blur-xl" />
                                    </motion.div>
                                </motion.div>
                            );
                        }

                        // Stacked cards - Full card visible, overlapping like Apple Wallet
                        return (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleCardClick(card.id)}
                                className="absolute left-0 right-0 cursor-pointer"
                                style={{
                                    zIndex,
                                    top: stackPosition
                                }}
                            >
                                <div
                                    style={{ aspectRatio: "85 / 55" }}
                                    className={cn(
                                        "rounded-xl text-white px-3 py-2.5 shadow-lg w-full",
                                        `bg-gradient-to-br ${card.gradient}`,
                                        "hover:shadow-xl transition-shadow",
                                        "border border-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {card.type === "cni" ? (
                                            <img src={sceauGabon} alt="" className="h-5 w-5 object-contain" />
                                        ) : (
                                            <div className="p-1 rounded-lg bg-white/20">
                                                <card.icon className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-[11px] leading-tight">{card.name}</p>
                                            <p className="text-[8px] opacity-70">{card.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Action Buttons - only when card is selected */}
            <AnimatePresence>
                {selectedCardData?.actions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-2 grid grid-cols-2 gap-1.5 shrink-0"
                    >
                        {selectedCardData.actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 py-2 rounded-lg",
                                    "bg-slate-100/50 dark:bg-white/10",
                                    "hover:bg-slate-200/50 dark:hover:bg-white/15",
                                    "text-[10px] font-medium text-foreground",
                                    "transition-colors"
                                )}
                            >
                                <action.icon className="w-3 h-3" />
                                {action.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
