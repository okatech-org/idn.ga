/**
 * Page iBoîte - Messagerie Interne
 * 
 * Communication entre le citoyen et les administrations.
 * Dossiers: Boîte de réception, Envoyés, Archives
 */

import { useState } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Inbox,
    Send,
    Archive,
    Trash2,
    Star,
    Search,
    Plus,
    X,
    Paperclip,
    ChevronLeft,
    MoreVertical,
    Mail,
    MailOpen,
    Clock,
    Check,
    CheckCheck,
    Building2,
    User,
    Reply,
    Forward
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Folder types
type FolderType = "inbox" | "sent" | "archive";

// Message type
interface Message {
    id: string;
    sender: {
        name: string;
        type: "admin" | "citizen";
        avatar?: string;
    };
    recipient: {
        name: string;
        type: "admin" | "citizen";
    };
    subject: string;
    preview: string;
    content: string;
    date: Date;
    isRead: boolean;
    isStarred: boolean;
    folder: FolderType;
    attachments?: { name: string; size: string }[];
}

// Administration contacts
const administrations = [
    { id: "mairie", name: "Mairie de Libreville", icon: Building2 },
    { id: "prefecture", name: "Préfecture du Estuaire", icon: Building2 },
    { id: "cnamgs", name: "CNAMGS", icon: Building2 },
    { id: "dgdi", name: "Direction Générale de la Documentation", icon: Building2 },
    { id: "tresor", name: "Trésor Public", icon: Building2 },
];

// Mock messages
const mockMessages: Message[] = [
    {
        id: "1",
        sender: { name: "Mairie de Libreville", type: "admin" },
        recipient: { name: "Vous", type: "citizen" },
        subject: "Confirmation de votre demande d'acte de naissance",
        preview: "Votre demande a été enregistrée sous le numéro #2024-LBV-12345...",
        content: "Bonjour,\n\nVotre demande d'acte de naissance a été enregistrée sous le numéro #2024-LBV-12345. Vous pouvez suivre son avancement dans votre espace personnel.\n\nCordialement,\nService État Civil",
        date: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        isStarred: true,
        folder: "inbox",
    },
    {
        id: "2",
        sender: { name: "CNAMGS", type: "admin" },
        recipient: { name: "Vous", type: "citizen" },
        subject: "Renouvellement de votre carte - Documents requis",
        preview: "Pour procéder au renouvellement de votre carte, veuillez fournir...",
        content: "Bonjour,\n\nPour procéder au renouvellement de votre carte CNAMGS, veuillez fournir les documents suivants:\n- Photocopie CNI\n- Photo d'identité récente\n- Justificatif de domicile\n\nCordialement,\nService Adhésion",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: false,
        isStarred: false,
        folder: "inbox",
    },
    {
        id: "3",
        sender: { name: "Préfecture du Estuaire", type: "admin" },
        recipient: { name: "Vous", type: "citizen" },
        subject: "Votre passeport est prêt",
        preview: "Nous avons le plaisir de vous informer que votre passeport...",
        content: "Bonjour,\n\nNous avons le plaisir de vous informer que votre passeport est prêt. Vous pouvez le retirer aux guichets de la Préfecture du lundi au vendredi de 8h à 15h.\n\nN'oubliez pas de vous munir de votre CNI et du récépissé de dépôt.\n\nCordialement,\nService des Passeports",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isRead: true,
        isStarred: true,
        folder: "inbox",
    },
    {
        id: "4",
        sender: { name: "Vous", type: "citizen" },
        recipient: { name: "Mairie de Libreville", type: "admin" },
        subject: "Demande de certificat de résidence",
        preview: "Bonjour, je souhaite obtenir un certificat de résidence...",
        content: "Bonjour,\n\nJe souhaite obtenir un certificat de résidence pour mon dossier de demande de passeport.\n\nPouvez-vous m'indiquer les pièces à fournir et les démarches à suivre?\n\nCordialement",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48),
        isRead: true,
        isStarred: false,
        folder: "sent",
    },
    {
        id: "5",
        sender: { name: "Trésor Public", type: "admin" },
        recipient: { name: "Vous", type: "citizen" },
        subject: "Avis d'imposition 2024",
        preview: "Votre avis d'imposition pour l'année 2024 est disponible...",
        content: "Bonjour,\n\nVotre avis d'imposition pour l'année 2024 est disponible dans votre espace personnel.\n\nCordialement,\nTrésor Public",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        isRead: true,
        isStarred: false,
        folder: "archive",
    },
];

const IBoitePage = () => {
    const [messages, setMessages] = useState<Message[]>(mockMessages);
    const [selectedFolder, setSelectedFolder] = useState<FolderType>("inbox");
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Compose form state
    const [composeForm, setComposeForm] = useState({
        recipient: "",
        subject: "",
        content: "",
    });

    // Filter messages by folder and search
    const filteredMessages = messages.filter(msg => {
        const matchesFolder = msg.folder === selectedFolder;
        const matchesSearch =
            msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    // Count unread
    const unreadCount = messages.filter(m => m.folder === "inbox" && !m.isRead).length;

    // Mark as read
    const markAsRead = (msgId: string) => {
        setMessages(messages.map(m =>
            m.id === msgId ? { ...m, isRead: true } : m
        ));
    };

    // Toggle star
    const toggleStar = (msgId: string) => {
        setMessages(messages.map(m =>
            m.id === msgId ? { ...m, isStarred: !m.isStarred } : m
        ));
    };

    // Delete message
    const deleteMessage = (msgId: string) => {
        setMessages(messages.filter(m => m.id !== msgId));
        setSelectedMessage(null);
    };

    // Archive message
    const archiveMessage = (msgId: string) => {
        setMessages(messages.map(m =>
            m.id === msgId ? { ...m, folder: "archive" } : m
        ));
        setSelectedMessage(null);
    };

    // Send message
    const sendMessage = () => {
        if (!composeForm.recipient || !composeForm.subject) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            sender: { name: "Vous", type: "citizen" },
            recipient: { name: composeForm.recipient, type: "admin" },
            subject: composeForm.subject,
            preview: composeForm.content.slice(0, 80) + "...",
            content: composeForm.content,
            date: new Date(),
            isRead: true,
            isStarred: false,
            folder: "sent",
        };
        setMessages([newMessage, ...messages]);
        setShowComposeModal(false);
        setComposeForm({ recipient: "", subject: "", content: "" });
    };

    // Open message
    const openMessage = (msg: Message) => {
        setSelectedMessage(msg);
        if (!msg.isRead) markAsRead(msg.id);
    };

    // Folders config
    const folders = [
        { id: "inbox" as FolderType, label: "Réception", icon: Inbox, count: unreadCount },
        { id: "sent" as FolderType, label: "Envoyés", icon: Send, count: 0 },
        { id: "archive" as FolderType, label: "Archives", icon: Archive, count: 0 },
    ];

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">iBoîte</h1>
                            <p className="text-[10px] text-muted-foreground">
                                {unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : "Messagerie sécurisée"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowComposeModal(true)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium",
                            "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        )}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nouveau
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0 overflow-hidden">

                    {/* Left Panel: Folders + List */}
                    <div className={cn(
                        "lg:col-span-1 flex flex-col rounded-2xl overflow-hidden",
                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                        "border border-slate-200/60 dark:border-white/10"
                    )}>
                        {/* Folder Tabs */}
                        <div className="flex border-b border-border shrink-0">
                            {folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => { setSelectedFolder(folder.id); setSelectedMessage(null); }}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium transition-colors",
                                        selectedFolder === folder.id
                                            ? "text-primary border-b-2 border-primary bg-primary/5"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <folder.icon className="w-3.5 h-3.5" />
                                    {folder.label}
                                    {folder.count > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] bg-primary text-primary-foreground">
                                            {folder.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="p-2 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={cn(
                                        "w-full pl-8 pr-3 py-1.5 rounded-lg text-[11px]",
                                        "bg-muted/50 border border-border",
                                        "focus:outline-none focus:ring-1 focus:ring-primary/30"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-auto">
                            {filteredMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <MailOpen className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-xs text-muted-foreground">Aucun message</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {filteredMessages.map(msg => (
                                        <button
                                            key={msg.id}
                                            onClick={() => openMessage(msg)}
                                            className={cn(
                                                "w-full p-3 text-left transition-colors hover:bg-accent/50",
                                                selectedMessage?.id === msg.id && "bg-accent",
                                                !msg.isRead && "bg-primary/5"
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                    msg.sender.type === "admin"
                                                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                                        : "bg-gradient-to-br from-green-500 to-emerald-600"
                                                )}>
                                                    {msg.sender.type === "admin" ? (
                                                        <Building2 className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={cn(
                                                            "text-[11px] truncate",
                                                            !msg.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                                                        )}>
                                                            {selectedFolder === "sent" ? msg.recipient.name : msg.sender.name}
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground shrink-0">
                                                            {formatDistanceToNow(msg.date, { addSuffix: true, locale: fr })}
                                                        </span>
                                                    </div>
                                                    <p className={cn(
                                                        "text-[10px] truncate",
                                                        !msg.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                                                    )}>
                                                        {msg.subject}
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground truncate">
                                                        {msg.preview}
                                                    </p>
                                                </div>
                                                {msg.isStarred && (
                                                    <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Message Detail */}
                    <div className={cn(
                        "lg:col-span-2 flex flex-col rounded-2xl overflow-hidden",
                        "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                        "border border-slate-200/60 dark:border-white/10"
                    )}>
                        {selectedMessage ? (
                            <>
                                {/* Message Header */}
                                <div className="p-4 border-b border-border shrink-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                selectedMessage.sender.type === "admin"
                                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                                    : "bg-gradient-to-br from-green-500 to-emerald-600"
                                            )}>
                                                {selectedMessage.sender.type === "admin" ? (
                                                    <Building2 className="w-5 h-5 text-white" />
                                                ) : (
                                                    <User className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{selectedMessage.sender.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    À: {selectedMessage.recipient.name} • {selectedMessage.date.toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleStar(selectedMessage.id)}
                                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <Star className={cn(
                                                    "w-4 h-4",
                                                    selectedMessage.isStarred ? "text-amber-500 fill-current" : "text-muted-foreground"
                                                )} />
                                            </button>
                                            <button
                                                onClick={() => archiveMessage(selectedMessage.id)}
                                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <Archive className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => deleteMessage(selectedMessage.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <h2 className="text-sm font-bold text-foreground mt-3">{selectedMessage.subject}</h2>
                                </div>

                                {/* Message Content */}
                                <div className="flex-1 p-4 overflow-auto">
                                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                        {selectedMessage.content}
                                    </p>
                                </div>

                                {/* Reply Actions */}
                                <div className="p-3 border-t border-border shrink-0">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setComposeForm({
                                                    recipient: selectedMessage.sender.name,
                                                    subject: `Re: ${selectedMessage.subject}`,
                                                    content: "",
                                                });
                                                setShowComposeModal(true);
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium",
                                                "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                            )}
                                        >
                                            <Reply className="w-3.5 h-3.5" />
                                            Répondre
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                <Mail className="w-12 h-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">Sélectionnez un message</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {showComposeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowComposeModal(false)}
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
                                <h3 className="text-sm font-bold text-foreground">Nouveau message</h3>
                                <button
                                    onClick={() => setShowComposeModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-muted"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Recipient */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Destinataire</label>
                                    <select
                                        value={composeForm.recipient}
                                        onChange={(e) => setComposeForm({ ...composeForm, recipient: e.target.value })}
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    >
                                        <option value="">Sélectionner une administration</option>
                                        {administrations.map(admin => (
                                            <option key={admin.id} value={admin.name}>{admin.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Objet</label>
                                    <input
                                        type="text"
                                        value={composeForm.subject}
                                        onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                                        placeholder="Objet du message"
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase">Message</label>
                                    <textarea
                                        value={composeForm.content}
                                        onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                                        placeholder="Votre message..."
                                        rows={6}
                                        className={cn(
                                            "w-full mt-1 px-3 py-2 rounded-lg text-sm resize-none",
                                            "bg-muted/50 border border-border",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        )}
                                    />
                                </div>

                                {/* Attachment */}
                                <button className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                                    "bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                                )}>
                                    <Paperclip className="w-3.5 h-3.5" />
                                    Joindre un fichier
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setShowComposeModal(false)}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-muted hover:bg-muted/80 transition-colors"
                                    )}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={!composeForm.recipient || !composeForm.subject}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                                        "flex items-center justify-center gap-1",
                                        (!composeForm.recipient || !composeForm.subject) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Send className="w-3 h-3" />
                                    Envoyer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </UserSpaceLayout>
    );
};

export default IBoitePage;
