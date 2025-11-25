import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Shield, FileText, Sparkles, User, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NotificationCenter = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");

    // Mock Data
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "security" as const,
            icon: Shield,
            title: "Nouvelle connexion détectée",
            message: "Une connexion a été détectée depuis Chrome sur Windows à 14:30. Si ce n'est pas vous, changez votre mot de passe.",
            time: "Il y a 2 min",
            read: false,
            date: "today"
        },
        {
            id: 2,
            type: "document" as const,
            icon: FileText,
            title: "Document expirant bientôt",
            message: "Votre passeport expire dans 30 jours. Pensez à initier le renouvellement.",
            time: "Il y a 2h",
            read: false,
            actionLabel: "Renouveler",
            date: "today"
        },
        {
            id: 3,
            type: "ai" as const,
            icon: Sparkles,
            title: "Suggestion IA",
            message: "Ajoutez vos compétences linguistiques pour compléter votre profil à 100%.",
            time: "Hier",
            read: true,
            actionLabel: "Voir mon profil",
            date: "yesterday"
        },
        {
            id: 4,
            type: "cv" as const,
            icon: User,
            title: "Vue de profil",
            message: "Votre CV a été consulté par 'Gabon Telecom' pour le poste de Chef de Projet.",
            time: "Hier",
            read: true,
            date: "yesterday"
        },
    ]);

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.type === filter; // security, document, etc.
    });

    const groupedNotifications = {
        today: filteredNotifications.filter(n => n.date === "today"),
        yesterday: filteredNotifications.filter(n => n.date === "yesterday"),
    };

    return (
        <UserSpaceLayout>
            <div className="space-y-6 pb-24 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="font-bold text-xl text-foreground">Notifications</h1>
                            <p className="text-xs text-muted-foreground">{notifications.filter(n => !n.read).length} non lues</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={markAllAsRead}
                            className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-primary"
                            title="Tout marquer comme lu"
                        >
                            <CheckCheck size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearAll}
                            className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-destructive"
                            title="Tout effacer"
                        >
                            <Trash2 size={18} />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
                    <TabsList className="w-full bg-transparent p-0 space-x-2 overflow-x-auto flex-nowrap justify-start no-scrollbar">
                        <TabsTrigger value="all" className="neu-raised data-[state=active]:neu-inset rounded-xl px-4 py-2 text-xs font-bold">Tout</TabsTrigger>
                        <TabsTrigger value="unread" className="neu-raised data-[state=active]:neu-inset rounded-xl px-4 py-2 text-xs font-bold">Non lu</TabsTrigger>
                        <TabsTrigger value="security" className="neu-raised data-[state=active]:neu-inset rounded-xl px-4 py-2 text-xs font-bold">Sécurité</TabsTrigger>
                        <TabsTrigger value="document" className="neu-raised data-[state=active]:neu-inset rounded-xl px-4 py-2 text-xs font-bold">Documents</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Notifications List */}
                <div className="space-y-6">
                    {groupedNotifications.today.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Aujourd'hui</h3>
                            <div className="space-y-3">
                                {groupedNotifications.today.map(notif => (
                                    <NotificationItem
                                        key={notif.id}
                                        {...notif}
                                        onRead={() => markAsRead(notif.id)}
                                        onAction={() => console.log("Action clicked", notif.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {groupedNotifications.yesterday.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Hier</h3>
                            <div className="space-y-3">
                                {groupedNotifications.yesterday.map(notif => (
                                    <NotificationItem
                                        key={notif.id}
                                        {...notif}
                                        onRead={() => markAsRead(notif.id)}
                                        onAction={() => console.log("Action clicked", notif.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredNotifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                            <Bell size={48} className="text-muted-foreground mb-4" />
                            <p className="font-bold text-foreground">Aucune notification</p>
                            <p className="text-xs text-muted-foreground">Vous êtes à jour !</p>
                        </div>
                    )}
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default NotificationCenter;
