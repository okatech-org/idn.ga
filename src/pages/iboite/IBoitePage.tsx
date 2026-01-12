/**
 * iBoîte - Boîte aux Lettres Numérique Multi-Comptes
 * Gestion de plusieurs adresses, boîtes aux lettres et comptes eMail
 */

import { useState } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Package, Mail, MessageCircle, MapPin, Copy, Check, Send, Plus, X, Paperclip,
    Building2, User, Reply, Star, Archive, Trash2, Search, Inbox, Clock, Share2,
    Truck, Printer, Download, AlertCircle, FileText, Undo2,
    QrCode, Navigation, Eye, ChevronRight, ArrowLeft, Minus, Maximize2,
    ChevronDown, Home, Briefcase, Users, Settings
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Types
type TabType = "mailbox" | "emails";
type FolderType = "inbox" | "sent" | "drafts" | "archive" | "trash";
type MessageFolder = "inbox" | "sent" | "archive";
type MailboxSection = "letters" | "packages";
type AccountType = "personal" | "professional" | "association";

interface Account {
    id: string;
    name: string;
    type: AccountType;
    icon: typeof Home;
    color: string;
    address: {
        label: string;
        fullAddress: string;
        street: string;
        city: string;
        country: string;
        postalCode: string;
        gps: { lat: number; lng: number };
        qrCode: string;
    };
    email: string;
}

interface DigitalLetter {
    id: string; accountId: string; folder: FolderType; sender: string; senderAddress: string;
    recipient: string; recipientAddress: string; subject: string; content: string;
    attachments: { name: string; size: string }[]; isRead: boolean; type: "action_required" | "informational" | "standard";
    stampColor: "red" | "blue" | "green"; createdAt: Date; dueDate?: Date;
}

interface PackageDelivery {
    id: string; accountId: string; trackingNumber: string; sender: string; description: string;
    status: "pending" | "transit" | "delivered" | "available"; estimatedDelivery?: Date;
}

interface Message {
    id: string; accountId: string; sender: { name: string; type: "admin" | "citizen" };
    recipient: { name: string; type: "admin" | "citizen" };
    subject: string; preview: string; content: string; date: Date;
    isRead: boolean; isStarred: boolean; folder: MessageFolder;
}

// Mock Data - Multiple Accounts
const mockAccounts: Account[] = [
    {
        id: "personal",
        name: "Personnel",
        type: "personal",
        icon: Home,
        color: "from-blue-500 to-indigo-600",
        address: {
            label: "Boîte Personnelle - Jean Dupont",
            fullAddress: "Point Relais idn.ga #12345",
            street: "Avenue du Colonel Parant",
            city: "Libreville",
            country: "Gabon",
            postalCode: "BP 1000",
            gps: { lat: 0.4162, lng: 9.4673 },
            qrCode: "IDNGA-PERSO-12345"
        },
        email: "jean.dupont@idn.ga"
    },
    {
        id: "professional",
        name: "Professionnel",
        type: "professional",
        icon: Briefcase,
        color: "from-emerald-500 to-teal-600",
        address: {
            label: "Société ABC SARL",
            fullAddress: "Immeuble Le Cristal, Bureau 302",
            street: "Boulevard Triomphal",
            city: "Libreville",
            country: "Gabon",
            postalCode: "BP 5000",
            gps: { lat: 0.3925, lng: 9.4536 },
            qrCode: "IDNGA-PRO-ABC-5000"
        },
        email: "contact@abc-sarl.ga"
    },
    {
        id: "association",
        name: "Association",
        type: "association",
        icon: Users,
        color: "from-purple-500 to-pink-600",
        address: {
            label: "Association Jeunesse Active",
            fullAddress: "Maison des Associations",
            street: "Rue de la Solidarité",
            city: "Libreville",
            country: "Gabon",
            postalCode: "BP 2500",
            gps: { lat: 0.4012, lng: 9.4421 },
            qrCode: "IDNGA-ASSO-JA-2500"
        },
        email: "asso.jeunesse@idn.ga"
    }
];

const mockPackages: PackageDelivery[] = [
    { id: "pkg1", accountId: "personal", trackingNumber: "GA2024-78901", sender: "Amazon.fr", description: "Commande électronique", status: "available" },
    { id: "pkg2", accountId: "personal", trackingNumber: "GA2024-78902", sender: "La Poste", description: "Recommandé", status: "transit", estimatedDelivery: new Date(Date.now() + 86400000 * 2) },
    { id: "pkg3", accountId: "professional", trackingNumber: "GA2024-PRO-001", sender: "Fournisseur XYZ", description: "Matériel bureau", status: "available" },
];

const mockLetters: DigitalLetter[] = [
    // Personnel
    { id: "l1", accountId: "personal", folder: "inbox", sender: "Mairie de Libreville", senderAddress: "Mairie de Libreville\nService État Civil\nBP 123 Libreville", recipient: "Jean Dupont", recipientAddress: "Jean Dupont\nBP 1000\nLibreville, GABON", subject: "Complément de dossier requis", content: "Monsieur,\n\nSuite à l'examen de votre dossier de demande d'acte de naissance, nous avons constaté qu'il manque une pièce justificative.\n\nNous vous prions de bien vouloir nous transmettre dans les meilleurs délais :\n- Une copie de votre pièce d'identité\n- Un justificatif de domicile récent\n\nSans réponse de votre part sous 15 jours, votre dossier sera classé sans suite.\n\nVeuillez agréer, Monsieur, l'expression de nos salutations distinguées.\n\nLe Service de l'État Civil", attachments: [], isRead: false, type: "action_required", stampColor: "red", createdAt: new Date(Date.now() - 7200000), dueDate: new Date(Date.now() + 86400000 * 15) },
    { id: "l2", accountId: "personal", folder: "inbox", sender: "CNAMGS", senderAddress: "CNAMGS\nDirection Générale\nLibreville", recipient: "Jean Dupont", recipientAddress: "Jean Dupont\nBP 1000\nLibreville", subject: "Confirmation d'adhésion à l'assurance maladie", content: "Monsieur,\n\nNous avons le plaisir de vous confirmer que votre adhésion au régime d'assurance maladie obligatoire a été validée.\n\nVotre numéro d'assuré social est : CNAMGS-2024-78901\n\nVotre carte d'assuré vous sera envoyée sous 10 jours ouvrables.\n\nCordialement,\nLa Direction", attachments: [], isRead: true, type: "informational", stampColor: "green", createdAt: new Date(Date.now() - 172800000) },
    { id: "l3", accountId: "personal", folder: "sent", sender: "Jean Dupont", senderAddress: "Jean Dupont\nBP 1000\nLibreville, GABON", recipient: "Mairie de Libreville", recipientAddress: "Mairie de Libreville\nService État Civil\nHôtel de Ville\nBP 123 Libreville", subject: "Demande de copie intégrale d'acte de naissance", content: "Madame, Monsieur l'Officier de l'État Civil,\n\nJe soussigné Jean Dupont, né le 15 mai 1990 à Libreville, sollicite par la présente la délivrance d'une copie intégrale de mon acte de naissance.\n\nCette demande est motivée par le renouvellement de mon passeport.\n\nVous trouverez ci-joint les pièces justificatives requises.\n\nDans l'attente d'une réponse favorable, je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.\n\nJean Dupont", attachments: [{ name: "CNI_recto_verso.pdf", size: "1.2 MB" }, { name: "Justificatif_domicile.pdf", size: "850 KB" }], isRead: true, type: "standard", stampColor: "blue", createdAt: new Date(Date.now() - 432000000) },
    // Professionnel
    { id: "l4", accountId: "professional", folder: "inbox", sender: "Direction Générale des Impôts", senderAddress: "DGI\nService des Entreprises\nLibreville", recipient: "ABC SARL", recipientAddress: "ABC SARL\nBP 5000\nLibreville", subject: "Avis d'imposition 2024", content: "Madame, Monsieur le Gérant,\n\nVeuillez trouver ci-joint votre avis d'imposition pour l'exercice 2024.\n\nLe montant dû est de 2,500,000 FCFA, payable avant le 31 mars 2025.\n\nCordialement,\nLa DGI", attachments: [{ name: "Avis_Imposition_2024.pdf", size: "2.1 MB" }], isRead: false, type: "action_required", stampColor: "red", createdAt: new Date(Date.now() - 3600000), dueDate: new Date(Date.now() + 86400000 * 60) },
    // Association
    { id: "l5", accountId: "association", folder: "inbox", sender: "Préfecture de l'Estuaire", senderAddress: "Préfecture\nService des Associations\nLibreville", recipient: "Association Jeunesse Active", recipientAddress: "Association Jeunesse Active\nBP 2500\nLibreville", subject: "Renouvellement agrément", content: "À l'attention du Président,\n\nVotre agrément arrive à expiration le 30 juin 2025. Merci de procéder au renouvellement.\n\nCordialement.", attachments: [], isRead: true, type: "informational", stampColor: "blue", createdAt: new Date(Date.now() - 86400000 * 5) },
];

const mockMessages: Message[] = [
    { id: "m1", accountId: "personal", sender: { name: "Mairie de Libreville", type: "admin" }, recipient: { name: "Vous", type: "citizen" }, subject: "Confirmation de votre demande", preview: "Votre demande a été enregistrée sous le numéro...", content: "Bonjour,\n\nVotre demande a été enregistrée sous le numéro #2024-12345.\n\nElle sera traitée dans un délai de 5 jours ouvrables.\n\nCordialement,\nLe Service Accueil", date: new Date(Date.now() - 1800000), isRead: false, isStarred: true, folder: "inbox" },
    { id: "m2", accountId: "personal", sender: { name: "CNAMGS", type: "admin" }, recipient: { name: "Vous", type: "citizen" }, subject: "Documents requis pour votre dossier", preview: "Pour compléter votre dossier, merci de fournir...", content: "Bonjour,\n\nPour compléter votre dossier d'affiliation, merci de nous fournir les documents suivants :\n- Copie de la CNI\n- Photo d'identité récente\n- Justificatif de revenus\n\nCordialement,\nCNAMGS", date: new Date(Date.now() - 7200000), isRead: false, isStarred: false, folder: "inbox" },
    { id: "m3", accountId: "professional", sender: { name: "Chambre de Commerce", type: "admin" }, recipient: { name: "ABC SARL", type: "citizen" }, subject: "Cotisation annuelle", preview: "Rappel de votre cotisation annuelle...", content: "Cher adhérent,\n\nNous vous rappelons que votre cotisation annuelle est à régler avant fin janvier.\n\nCordialement.", date: new Date(Date.now() - 86400000), isRead: false, isStarred: false, folder: "inbox" },
];

const administrations = [
    { id: "mairie", name: "Mairie de Libreville" },
    { id: "prefecture", name: "Préfecture de l'Estuaire" },
    { id: "cnamgs", name: "CNAMGS" },
    { id: "dgi", name: "Direction Générale des Impôts" },
];

// Account Selector Component
const AccountSelector = ({ accounts, selected, onChange }: { accounts: Account[]; selected: Account; onChange: (a: Account) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                    "bg-gradient-to-r", selected.color,
                    "text-white shadow-lg hover:shadow-xl"
                )}
            >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <selected.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-bold truncate">{selected.name}</p>
                    <p className="text-xs text-white/70 truncate">{selected.email}</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50"
                    >
                        {accounts.map(account => (
                            <button
                                key={account.id}
                                onClick={() => { onChange(account); setIsOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                                    selected.id === account.id && "bg-slate-100 dark:bg-white/10"
                                )}
                            >
                                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white", account.color)}>
                                    <account.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-semibold text-foreground">{account.name}</p>
                                    <p className="text-xs text-muted-foreground">{account.email}</p>
                                </div>
                                {selected.id === account.id && <Check className="w-4 h-4 text-primary" />}
                            </button>
                        ))}
                        <div className="border-t border-slate-200 dark:border-white/10 p-2">
                            <button className="w-full flex items-center justify-center gap-2 p-2 text-sm text-primary hover:bg-primary/5 rounded-lg">
                                <Plus className="w-4 h-4" />
                                Ajouter un compte
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Envelope Card
const EnvelopeCard = ({ letter, isSelected, onClick }: { letter: DigitalLetter; isSelected: boolean; onClick: () => void }) => {
    const isOpen = letter.isRead || isSelected;
    const isSent = letter.folder === "sent";
    const displayName = isSent ? letter.recipient : letter.sender;

    return (
        <motion.button onClick={onClick} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            className={cn("w-full relative mb-3 rounded-xl overflow-hidden text-left transition-all", "bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/90", "border border-slate-300/60 shadow-sm hover:shadow-md", isSelected && "ring-2 ring-primary ring-offset-2")}>
            <div className="relative h-28 bg-[#f5f2eb] dark:bg-[#e8e4dc] overflow-hidden">
                <motion.div animate={{ y: isOpen ? 0 : 10, opacity: isOpen ? 1 : 0 }} className="absolute top-1 left-2 right-2 h-full bg-white rounded-t-sm z-0 pt-2 px-3">
                    <div className="h-1 w-full bg-blue-500/10 rounded mb-2" />
                    <div className="space-y-1.5 opacity-40"><div className="h-1 w-3/4 bg-slate-300 rounded" /></div>
                </motion.div>
                <motion.div style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} animate={{ rotateX: isOpen ? 180 : 0, zIndex: isOpen ? 0 : 20 }} className="absolute top-0 left-0 right-0 h-14 origin-top bg-gradient-to-b from-[#ebe7df] to-[#dfd9ce]" />
                <div className={cn("absolute top-3 left-0 right-0 bottom-0 z-10 bg-[#f5f2eb] dark:bg-[#e8e4dc] border-t border-black/5 p-3 flex flex-col justify-end", isOpen && "translate-y-6")}>
                    {letter.type === "action_required" && !letter.isRead && <span className="absolute top-1 right-2 text-[9px] font-bold text-white bg-red-500 px-2 py-0.5 rounded rotate-3">URGENT</span>}
                    {letter.folder === "drafts" && <span className="absolute top-1 right-2 text-[9px] font-bold text-slate-500 border border-dashed border-slate-400 px-2 py-0.5 rounded">BROUILLON</span>}
                    <div className="bg-white/70 p-2 rounded max-w-[85%]"><p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p><p className="text-xs text-slate-500 truncate">{letter.subject}</p></div>
                </div>
            </div>
        </motion.button>
    );
};

// Letter Detail with Zoom
const LetterDetailFull = ({ letter, onClose, onMove }: { letter: DigitalLetter; onClose: () => void; onMove: (f: FolderType) => void }) => {
    const [zoom, setZoom] = useState(100);
    const [isFloatingMode, setIsFloatingMode] = useState(false);
    const zoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const zoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const resetZoom = () => setZoom(100);

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col bg-slate-100 dark:bg-black/90">
                <div className="h-14 shrink-0 px-4 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 shadow-sm">
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200"><ArrowLeft className="w-4 h-4" />Retour</button>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button onClick={zoomOut} disabled={zoom <= 50} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                        <button onClick={resetZoom} className="px-3 py-1 text-sm font-semibold min-w-[50px] text-center hover:bg-white rounded-lg">{zoom}%</button>
                        <button onClick={zoomIn} disabled={zoom >= 200} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                        <div className="w-px h-5 bg-slate-300 mx-1" />
                        <button onClick={() => setIsFloatingMode(true)} className="p-2 rounded-lg hover:bg-white" title="Mode lecture"><Maximize2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-slate-100"><Printer className="w-5 h-5 text-slate-600" /></button>
                        <button className="p-2 rounded-xl hover:bg-slate-100"><Download className="w-5 h-5 text-slate-600" /></button>
                        {letter.folder !== "archive" && letter.folder !== "trash" && <button onClick={() => onMove("archive")} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200"><Archive className="w-4 h-4" />Archiver</button>}
                        {letter.folder !== "trash" ? <button onClick={() => onMove("trash")} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-5 h-5" /></button> : <button onClick={() => onMove("inbox")} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-600"><Undo2 className="w-4 h-4" />Restaurer</button>}
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
                    <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                        <div className="bg-white text-black shadow-2xl rounded-sm w-[700px]" style={{ minHeight: '900px' }}>
                            <div className="p-10 flex flex-col h-full">
                                <div className="flex justify-between mb-8"><div className="text-sm text-slate-600 whitespace-pre-line">{letter.senderAddress}</div><div className="text-sm font-semibold text-right whitespace-pre-line">{letter.recipientAddress}</div></div>
                                <div className="text-sm text-slate-600 text-right mb-6">Libreville, le {format(letter.createdAt, "dd MMMM yyyy", { locale: fr })}</div>
                                <div className="text-lg font-bold mb-6 pb-2 border-b border-slate-200">Objet : {letter.subject}</div>
                                <div className="flex-1 text-base leading-7 whitespace-pre-wrap text-justify">{letter.content}</div>
                                {letter.attachments.length > 0 && <div className="mt-8 pt-4 border-t border-slate-200"><p className="text-sm font-bold text-slate-600 uppercase mb-3">Pièces jointes</p><div className="space-y-2">{letter.attachments.map((a, i) => <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border"><FileText className="w-5 h-5 text-blue-500" /><div className="flex-1"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-slate-500">{a.size}</p></div><button className="p-2 hover:bg-slate-200 rounded"><Eye className="w-4 h-4" /></button><button className="p-2 hover:bg-slate-200 rounded"><Download className="w-4 h-4" /></button></div>)}</div></div>}
                                <div className="mt-8 text-right"><span className="text-xl text-blue-900 italic">{letter.sender.split('\n')[0]}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                {letter.type === "action_required" && letter.folder === "inbox" && <div className="shrink-0 p-4 bg-white border-t border-red-100 flex justify-between items-center"><div className="flex items-center gap-3 text-red-600"><AlertCircle className="w-5 h-5" /><div><p className="text-sm font-bold">Action requise</p><p className="text-xs text-red-500">Avant le {letter.dueDate ? format(letter.dueDate, "dd/MM/yyyy") : "prochainement"}</p></div></div><button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700"><Reply className="w-4 h-4" />Répondre</button></div>}
            </motion.div>
            <AnimatePresence>
                {isFloatingMode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setIsFloatingMode(false)}>
                        <div className="shrink-0 h-14 px-6 flex items-center justify-between bg-black/50 backdrop-blur border-b border-white/10">
                            <div className="text-white"><p className="text-sm font-semibold">{letter.subject}</p><p className="text-xs text-white/60">De: {letter.sender.split('\n')[0]}</p></div>
                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
                                    <button onClick={zoomOut} disabled={zoom <= 50} className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                                    <span className="px-3 text-sm font-semibold text-white min-w-[50px] text-center">{zoom}%</span>
                                    <button onClick={zoomIn} disabled={zoom >= 200} className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                                </div>
                                <button onClick={() => setIsFloatingMode(false)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white ml-4"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-8 flex justify-center items-start" onClick={e => e.stopPropagation()}>
                            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                                <div className="bg-white text-black shadow-2xl rounded-sm w-[700px]" style={{ minHeight: '900px' }}>
                                    <div className="p-10 flex flex-col h-full">
                                        <div className="flex justify-between mb-8"><div className="text-sm text-slate-600 whitespace-pre-line">{letter.senderAddress}</div><div className="text-sm font-semibold text-right whitespace-pre-line">{letter.recipientAddress}</div></div>
                                        <div className="text-sm text-slate-600 text-right mb-6">Libreville, le {format(letter.createdAt, "dd MMMM yyyy", { locale: fr })}</div>
                                        <div className="text-lg font-bold mb-6 pb-2 border-b border-slate-200">Objet : {letter.subject}</div>
                                        <div className="flex-1 text-base leading-7 whitespace-pre-wrap text-justify">{letter.content}</div>
                                        <div className="mt-8 text-right"><span className="text-xl text-blue-900 italic">{letter.sender.split('\n')[0]}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="py-3 text-center text-white/40 text-xs">Cliquez à l'extérieur pour fermer</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const IBoitePage = () => {
    const [selectedAccount, setSelectedAccount] = useState<Account>(mockAccounts[0]);
    const [activeTab, setActiveTab] = useState<TabType>("mailbox");
    const [mailboxSection, setMailboxSection] = useState<MailboxSection>("letters");
    const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
    const [letters, setLetters] = useState(mockLetters);
    const [selectedLetter, setSelectedLetter] = useState<DigitalLetter | null>(null);
    const [messages, setMessages] = useState(mockMessages);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [messageFolder, setMessageFolder] = useState<MessageFolder>("inbox");
    const [searchQuery, setSearchQuery] = useState("");
    const [copied, setCopied] = useState(false);
    const [showCompose, setShowCompose] = useState(false);

    // Filtered data based on selected account
    const accountLetters = letters.filter(l => l.accountId === selectedAccount.id);
    const accountPackages = mockPackages.filter(p => p.accountId === selectedAccount.id);
    const accountMessages = messages.filter(m => m.accountId === selectedAccount.id);

    const filteredLetters = accountLetters.filter(l => l.folder === currentFolder);
    const filteredMessages = accountMessages.filter(m => m.folder === messageFolder && (m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.sender.name.toLowerCase().includes(searchQuery.toLowerCase())));
    const unreadMessages = accountMessages.filter(m => m.folder === "inbox" && !m.isRead).length;
    const unreadLetters = accountLetters.filter(l => l.folder === "inbox" && !l.isRead).length;
    const availablePackages = accountPackages.filter(p => p.status === "available").length;

    const moveLetter = (id: string, target: FolderType) => { setLetters(prev => prev.map(l => l.id === id ? { ...l, folder: target } : l)); setSelectedLetter(null); };
    const copyAddress = () => { navigator.clipboard.writeText(`${selectedAccount.address.fullAddress}\n${selectedAccount.address.street}\n${selectedAccount.address.postalCode} ${selectedAccount.address.city}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const openMaps = () => window.open(`https://www.google.com/maps?q=${selectedAccount.address.gps.lat},${selectedAccount.address.gps.lng}`, "_blank");

    // Reset selections when account changes
    const handleAccountChange = (account: Account) => {
        setSelectedAccount(account);
        setSelectedLetter(null);
        setSelectedMessage(null);
        setCurrentFolder("inbox");
        setMessageFolder("inbox");
    };

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-4 relative">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold text-foreground">iBoîte</h1>
                    <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                        <Plus className="w-5 h-5" />{activeTab === "emails" ? "eMail" : "Lettre"}
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 relative">

                    {/* Left Panel (2/3) */}
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={cn("lg:col-span-2 rounded-2xl flex flex-col overflow-hidden relative", "bg-white/95 dark:bg-white/5 backdrop-blur-sm border border-slate-300/80 shadow-md")}>
                        {/* Tabs */}
                        <div className="flex border-b border-slate-300/60 shrink-0">
                            {[{ id: "mailbox" as TabType, label: "Ma Boîte aux Lettres", icon: Mail, badge: unreadLetters + availablePackages }, { id: "emails" as TabType, label: "Mes eMails", icon: MessageCircle, badge: unreadMessages }].map(tab => (
                                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedLetter(null); setSelectedMessage(null); }} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all", activeTab === tab.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:text-foreground hover:bg-slate-50")}>
                                    <tab.icon className="w-5 h-5" />{tab.label}{tab.badge > 0 && <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", activeTab === tab.id ? "bg-primary/20 text-primary" : "bg-primary text-white")}>{tab.badge}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 flex min-h-0 overflow-hidden">
                            {activeTab === "mailbox" ? (
                                <>
                                    {/* Sidebar */}
                                    <div className="w-52 border-r border-slate-300/60 p-3 flex flex-col shrink-0 bg-slate-50/50">
                                        <div className="flex gap-1 p-1 bg-slate-200/50 rounded-lg mb-4">
                                            <button onClick={() => setMailboxSection("letters")} className={cn("flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5", mailboxSection === "letters" ? "bg-white shadow-sm" : "text-slate-500")}><Mail className="w-4 h-4" />Courriers{unreadLetters > 0 && <span className="px-1.5 text-[10px] bg-primary text-white rounded-full">{unreadLetters}</span>}</button>
                                            <button onClick={() => setMailboxSection("packages")} className={cn("flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5", mailboxSection === "packages" ? "bg-white shadow-sm" : "text-slate-500")}><Package className="w-4 h-4" />Colis{availablePackages > 0 && <span className="px-1.5 text-[10px] bg-amber-500 text-white rounded-full">{availablePackages}</span>}</button>
                                        </div>
                                        {mailboxSection === "letters" && (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider px-2 mb-2">Dossiers</p>
                                                {[{ id: "inbox" as FolderType, label: "Reçus", icon: Inbox, count: unreadLetters }, { id: "sent" as FolderType, label: "Envoyés", icon: Send }, { id: "drafts" as FolderType, label: "Brouillons", icon: FileText, count: accountLetters.filter(l => l.folder === "drafts").length }, { id: "archive" as FolderType, label: "Archives", icon: Archive }, { id: "trash" as FolderType, label: "Corbeille", icon: Trash2 }].map(f => (
                                                    <button key={f.id} onClick={() => { setCurrentFolder(f.id); setSelectedLetter(null); }} className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all", currentFolder === f.id ? "bg-white shadow-sm text-foreground" : "text-slate-500 hover:bg-white/50")}>
                                                        <div className="flex items-center gap-2"><f.icon className="w-4 h-4" />{f.label}</div>{f.count && f.count > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">{f.count}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {mailboxSection === "packages" && (
                                            <div className="flex flex-col items-center py-4 px-3 rounded-xl bg-white text-center shadow-sm">
                                                <QrCode className="w-16 h-16 text-slate-300 mb-2" /><p className="text-sm font-bold">QR Retrait</p><p className="text-xs font-mono text-slate-500 mt-1">{selectedAccount.address.qrCode}</p><p className="text-xs text-slate-500 mt-3 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Lun-Sam, 8h-18h</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                        <div className="p-3 border-b border-slate-300/60 flex justify-between items-center bg-slate-50/50">
                                            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{mailboxSection === "letters" ? (currentFolder === "inbox" ? "Boîte de réception" : currentFolder === "sent" ? "Envoyés" : currentFolder === "drafts" ? "Brouillons" : currentFolder === "archive" ? "Archives" : "Corbeille") : "Mes Colis"}</h2>
                                            <span className="text-sm text-slate-500">{mailboxSection === "letters" ? filteredLetters.length : accountPackages.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 bg-slate-50/30">
                                            {mailboxSection === "letters" ? (
                                                filteredLetters.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-slate-400"><Mail className="w-10 h-10 mb-2" /><p className="text-sm">Dossier vide</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{filteredLetters.map(l => <EnvelopeCard key={l.id} letter={l} isSelected={selectedLetter?.id === l.id} onClick={() => { setSelectedLetter(l); if (!l.isRead) setLetters(prev => prev.map(x => x.id === l.id ? { ...x, isRead: true } : x)); }} />)}</div>
                                            ) : (
                                                <div className="space-y-3">{accountPackages.map(pkg => <motion.div key={pkg.id} whileHover={{ scale: 1.01, y: -2 }} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300/60 shadow-sm"><div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", pkg.status === "available" ? "bg-amber-500/10" : "bg-blue-500/10")}><Package className={cn("w-6 h-6", pkg.status === "available" ? "text-amber-500" : "text-blue-500")} /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{pkg.description}</p><p className="text-sm text-slate-500">De: {pkg.sender}</p><p className="text-xs font-mono text-slate-400">{pkg.trackingNumber}</p></div><div className="text-right"><span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white", pkg.status === "available" ? "bg-amber-500" : "bg-blue-500")}>{pkg.status === "available" ? <><Package className="w-3.5 h-3.5" />À retirer</> : <><Truck className="w-3.5 h-3.5" />En transit</>}</span>{pkg.estimatedDelivery && <p className="text-xs text-slate-500 mt-1">Arrivée: {format(pkg.estimatedDelivery, "dd/MM")}</p>}</div><ChevronRight className="w-5 h-5 text-slate-400" /></motion.div>)}</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* EMAILS TAB */
                                <div className="flex-1 flex min-h-0">
                                    <div className={cn("flex flex-col border-r border-slate-300/60", selectedMessage ? "w-80 hidden lg:flex" : "flex-1")}>
                                        <div className="flex border-b border-slate-300/60 shrink-0">{[{ id: "inbox" as MessageFolder, label: "Réception", icon: Inbox, count: unreadMessages }, { id: "sent" as MessageFolder, label: "Envoyés", icon: Send }, { id: "archive" as MessageFolder, label: "Archives", icon: Archive }].map(f => (<button key={f.id} onClick={() => { setMessageFolder(f.id); setSelectedMessage(null); }} className={cn("flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium", messageFolder === f.id ? "text-primary border-b-2 border-primary bg-primary/5" : "text-slate-500 hover:bg-slate-50")}><f.icon className="w-4 h-4" />{f.label}{f.count && f.count > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">{f.count}</span>}</button>))}</div>
                                        <div className="p-2 border-b border-slate-200"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30" /></div></div>
                                        <div className="flex-1 overflow-auto divide-y divide-slate-200">{filteredMessages.map(msg => (<button key={msg.id} onClick={() => { setSelectedMessage(msg); if (!msg.isRead) setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m)); }} className={cn("w-full p-4 text-left hover:bg-slate-50", selectedMessage?.id === msg.id && "bg-primary/5", !msg.isRead && "bg-blue-50/50")}><div className="flex items-start gap-3"><div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", msg.sender.type === "admin" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-green-500 to-emerald-600")}>{msg.sender.type === "admin" ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-2"><span className={cn("text-sm truncate", !msg.isRead ? "font-bold" : "text-slate-600")}>{messageFolder === "sent" ? msg.recipient.name : msg.sender.name}</span><span className="text-xs text-slate-500 shrink-0">{formatDistanceToNow(msg.date, { addSuffix: true, locale: fr })}</span></div><p className={cn("text-sm truncate", !msg.isRead ? "font-semibold" : "text-slate-600")}>{msg.subject}</p><p className="text-sm text-slate-500 truncate">{msg.preview}</p></div>{msg.isStarred && <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />}</div></button>))}</div>
                                    </div>
                                    <div className={cn("flex-1 flex flex-col", selectedMessage ? "flex" : "hidden lg:flex")}>{selectedMessage ? (<><div className="p-4 border-b flex items-start justify-between bg-white"><div className="flex items-center gap-3"><div className={cn("w-12 h-12 rounded-full flex items-center justify-center", selectedMessage.sender.type === "admin" ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-green-500 to-emerald-600")}>{selectedMessage.sender.type === "admin" ? <Building2 className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}</div><div><p className="text-lg font-bold">{selectedMessage.sender.name}</p><p className="text-sm text-slate-500">À: {selectedMessage.recipient.name} • {format(selectedMessage.date, "dd/MM/yyyy HH:mm")}</p></div></div><div className="flex items-center gap-1"><button onClick={() => setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, isStarred: !m.isStarred } : m))} className="p-2 rounded-lg hover:bg-slate-100"><Star className={cn("w-5 h-5", selectedMessage.isStarred ? "text-amber-500 fill-current" : "text-slate-400")} /></button><button onClick={() => { setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, folder: "archive" } : m)); setSelectedMessage(null); }} className="p-2 rounded-lg hover:bg-slate-100"><Archive className="w-5 h-5 text-slate-400" /></button><button className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-5 h-5 text-red-500" /></button><button onClick={() => setSelectedMessage(null)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button></div></div><h2 className="px-4 pt-4 text-lg font-bold">{selectedMessage.subject}</h2><div className="flex-1 p-4 overflow-auto"><p className="text-base whitespace-pre-wrap leading-relaxed">{selectedMessage.content}</p></div><div className="p-4 border-t bg-white"><button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"><Reply className="w-5 h-5" />Répondre</button></div></>) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-400"><MessageCircle className="w-12 h-12 mb-3 opacity-50" /><p className="text-sm font-medium">Sélectionnez un message</p></div>)}</div>
                                </div>
                            )}
                        </div>
                        <AnimatePresence>{selectedLetter && activeTab === "mailbox" && mailboxSection === "letters" && <LetterDetailFull letter={selectedLetter} onClose={() => setSelectedLetter(null)} onMove={f => moveLetter(selectedLetter.id, f)} />}</AnimatePresence>
                    </motion.div>

                    {/* Right Panel (1/3) - Account & Address */}
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-4 flex flex-col bg-white/95 dark:bg-white/5 backdrop-blur-sm border border-slate-300/80 shadow-md">
                        {/* Account Selector */}
                        <AccountSelector accounts={mockAccounts} selected={selectedAccount} onChange={handleAccountChange} />

                        <div className="my-4 border-t border-slate-200 dark:border-white/10" />

                        {/* Address Card */}
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Adresse de livraison</p>
                        <div className={cn("p-4 rounded-xl bg-gradient-to-r text-white mb-4", selectedAccount.color)}>
                            <div className="flex items-center gap-2 mb-3"><MapPin className="w-5 h-5" /><span className="text-sm font-semibold">{selectedAccount.address.label}</span></div>
                            <p className="text-xs text-white/80 leading-relaxed">{selectedAccount.address.fullAddress}<br />{selectedAccount.address.street}<br />{selectedAccount.address.postalCode} {selectedAccount.address.city}</p>
                            <div className="flex gap-2 mt-4">
                                <button onClick={copyAddress} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copié" : "Copier"}</button>
                                <button onClick={openMaps} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30"><Navigation className="w-4 h-4" />GPS</button>
                                <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30"><Share2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-3 rounded-xl bg-slate-100/90"><p className="text-xl font-bold text-blue-500">{accountLetters.filter(l => l.folder === "inbox").length}</p><p className="text-sm text-slate-500 uppercase font-medium">Courriers</p></div>
                            <div className="text-center p-3 rounded-xl bg-slate-100/90"><p className="text-xl font-bold text-amber-500">{accountPackages.length}</p><p className="text-sm text-slate-500 uppercase font-medium">Colis</p></div>
                        </div>

                        {/* Opening Hours */}
                        <div className="mt-auto p-3 rounded-lg bg-slate-100/90">
                            <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Infos Retrait</p>
                            <div className="space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Lun-Sam: 8h-18h</p><p className="flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" />Stockage gratuit 7 jours</p></div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {showCompose && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompose(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg p-5 rounded-2xl bg-background border border-border shadow-2xl">
                            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{activeTab === "emails" ? "Nouveau eMail" : "Nouvelle Lettre"}</h3><button onClick={() => setShowCompose(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button></div>
                            <div className="mb-4 p-3 rounded-xl bg-slate-100 flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white", selectedAccount.color)}><selectedAccount.icon className="w-4 h-4" /></div>
                                <div><p className="text-sm font-semibold">Depuis: {selectedAccount.name}</p><p className="text-xs text-muted-foreground">{selectedAccount.email}</p></div>
                            </div>
                            <div className="space-y-4">
                                <div><label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Destinataire</label><select className="w-full mt-2 px-4 py-3 rounded-xl text-sm bg-slate-100/90 border border-slate-300/60 focus:ring-2 focus:ring-primary/30"><option value="">Sélectionner</option>{administrations.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                                <div><label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Objet</label><input type="text" placeholder="Objet" className="w-full mt-2 px-4 py-3 rounded-xl text-sm bg-slate-100/90 border border-slate-300/60 focus:ring-2 focus:ring-primary/30" /></div>
                                <div><label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Message</label><textarea placeholder={activeTab === "emails" ? "Votre message..." : "Madame, Monsieur,\n\n"} rows={5} className="w-full mt-2 px-4 py-3 rounded-xl text-sm bg-slate-100/90 border border-slate-300/60 resize-none focus:ring-2 focus:ring-primary/30" /></div>
                                <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm w-full bg-slate-100/90 hover:bg-slate-200/90 border border-dashed border-slate-300/60"><Paperclip className="w-5 h-5 text-slate-500" />Joindre un fichier</button>
                            </div>
                            <div className="flex gap-3 mt-5"><button onClick={() => setShowCompose(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300">Annuler</button><button className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"><Send className="w-5 h-5" />Envoyer</button></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </UserSpaceLayout>
    );
};

export default IBoitePage;
