/**
 * iBoîte Message Service
 * 
 * Gestion de la messagerie interne citoyen-administration
 * Utilise Supabase avec fallback localStorage
 */

import { supabase } from "@/integrations/supabase/client";

// Message types
export interface IBoiteMessage {
    id: string;
    user_id?: string;
    sender_type: "admin" | "citizen";
    sender_name: string;
    sender_avatar?: string;
    recipient_type: "admin" | "citizen";
    recipient_name: string;
    recipient_id?: string;
    subject: string;
    content: string;
    preview: string;
    folder: "inbox" | "sent" | "archive";
    is_read: boolean;
    is_starred: boolean;
    attachments?: { name: string; size: string; url?: string }[];
    created_at: string;
    updated_at: string;
}

export interface Administration {
    id: string;
    name: string;
    category: string;
    email?: string;
}

const LOCAL_STORAGE_KEY = "idn_iboite_messages";

// Default administrations
export const DEFAULT_ADMINISTRATIONS: Administration[] = [
    { id: "mairie-lbv", name: "Mairie de Libreville", category: "municipal" },
    { id: "prefecture", name: "Préfecture de l'Estuaire", category: "prefecture" },
    { id: "cnamgs", name: "CNAMGS", category: "health" },
    { id: "dgdi", name: "Direction de la Documentation et de l'Immigration", category: "identity" },
    { id: "tresor", name: "Trésor Public", category: "finance" },
    { id: "impots", name: "Direction Générale des Impôts", category: "finance" },
    { id: "education", name: "Ministère de l'Éducation Nationale", category: "education" },
    { id: "emploi", name: "Office National de l'Emploi", category: "employment" },
];

// Get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
};

// LocalStorage helpers
const getLocalMessages = (): IBoiteMessage[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLocalMessages = (messages: IBoiteMessage[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
};

export const iboiteService = {
    /**
     * Récupérer tous les messages
     */
    async getMessages(folder?: "inbox" | "sent" | "archive"): Promise<IBoiteMessage[]> {
        const userId = await getCurrentUserId();

        if (userId) {
            let query = supabase
                .from("iboite_messages")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (folder) {
                query = query.eq("folder", folder);
            }

            const { data, error } = await query;

            if (!error && data) {
                return data as IBoiteMessage[];
            }
        }

        // Fallback to localStorage
        const localMessages = getLocalMessages();
        return folder
            ? localMessages.filter(m => m.folder === folder)
            : localMessages;
    },

    /**
     * Récupérer le nombre de messages non lus
     */
    async getUnreadCount(): Promise<number> {
        const userId = await getCurrentUserId();

        if (userId) {
            const { count, error } = await supabase
                .from("iboite_messages")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("folder", "inbox")
                .eq("is_read", false);

            if (!error) {
                return count ?? 0;
            }
        }

        // Fallback
        const localMessages = getLocalMessages();
        return localMessages.filter(m => m.folder === "inbox" && !m.is_read).length;
    },

    /**
     * Envoyer un message à une administration
     */
    async sendMessage(
        recipientId: string,
        recipientName: string,
        subject: string,
        content: string,
        attachments?: { name: string; size: string }[]
    ): Promise<IBoiteMessage | null> {
        const userId = await getCurrentUserId();
        const now = new Date().toISOString();

        const newMessage: IBoiteMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId ?? undefined,
            sender_type: "citizen",
            sender_name: "Vous",
            recipient_type: "admin",
            recipient_name: recipientName,
            recipient_id: recipientId,
            subject,
            content,
            preview: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
            folder: "sent",
            is_read: true,
            is_starred: false,
            attachments,
            created_at: now,
            updated_at: now,
        };

        if (userId) {
            const { data, error } = await supabase
                .from("iboite_messages")
                .insert(newMessage)
                .select()
                .single();

            if (!error && data) {
                return data as IBoiteMessage;
            }
        }

        // Fallback
        const localMessages = getLocalMessages();
        localMessages.unshift(newMessage);
        saveLocalMessages(localMessages);
        return newMessage;
    },

    /**
     * Marquer un message comme lu
     */
    async markAsRead(messageId: string): Promise<boolean> {
        const userId = await getCurrentUserId();

        if (userId) {
            const { error } = await supabase
                .from("iboite_messages")
                .update({ is_read: true, updated_at: new Date().toISOString() })
                .eq("id", messageId)
                .eq("user_id", userId);

            if (!error) return true;
        }

        // Fallback
        const localMessages = getLocalMessages();
        const updated = localMessages.map(m =>
            m.id === messageId ? { ...m, is_read: true } : m
        );
        saveLocalMessages(updated);
        return true;
    },

    /**
     * Basculer l'état favori
     */
    async toggleStar(messageId: string): Promise<boolean> {
        const userId = await getCurrentUserId();
        const localMessages = getLocalMessages();
        const message = localMessages.find(m => m.id === messageId);
        const newStarred = !message?.is_starred;

        if (userId) {
            const { error } = await supabase
                .from("iboite_messages")
                .update({ is_starred: newStarred, updated_at: new Date().toISOString() })
                .eq("id", messageId)
                .eq("user_id", userId);

            if (!error) return true;
        }

        // Fallback
        const updated = localMessages.map(m =>
            m.id === messageId ? { ...m, is_starred: newStarred } : m
        );
        saveLocalMessages(updated);
        return true;
    },

    /**
     * Archiver un message
     */
    async archiveMessage(messageId: string): Promise<boolean> {
        const userId = await getCurrentUserId();

        if (userId) {
            const { error } = await supabase
                .from("iboite_messages")
                .update({ folder: "archive", updated_at: new Date().toISOString() })
                .eq("id", messageId)
                .eq("user_id", userId);

            if (!error) return true;
        }

        // Fallback
        const localMessages = getLocalMessages();
        const updated = localMessages.map(m =>
            m.id === messageId ? { ...m, folder: "archive" as const } : m
        );
        saveLocalMessages(updated);
        return true;
    },

    /**
     * Supprimer un message
     */
    async deleteMessage(messageId: string): Promise<boolean> {
        const userId = await getCurrentUserId();

        if (userId) {
            const { error } = await supabase
                .from("iboite_messages")
                .delete()
                .eq("id", messageId)
                .eq("user_id", userId);

            if (!error) return true;
        }

        // Fallback
        const localMessages = getLocalMessages();
        const filtered = localMessages.filter(m => m.id !== messageId);
        saveLocalMessages(filtered);
        return true;
    },

    /**
     * Obtenir la liste des administrations disponibles
     */
    async getAdministrations(): Promise<Administration[]> {
        // Could be fetched from Supabase in the future
        return DEFAULT_ADMINISTRATIONS;
    },

    /**
     * Simuler une réponse d'administration (pour la démo)
     */
    async simulateAdminResponse(
        senderName: string,
        subject: string,
        content: string
    ): Promise<IBoiteMessage | null> {
        const userId = await getCurrentUserId();
        const now = new Date().toISOString();

        const response: IBoiteMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId ?? undefined,
            sender_type: "admin",
            sender_name: senderName,
            recipient_type: "citizen",
            recipient_name: "Vous",
            subject,
            content,
            preview: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
            folder: "inbox",
            is_read: false,
            is_starred: false,
            created_at: now,
            updated_at: now,
        };

        if (userId) {
            const { data, error } = await supabase
                .from("iboite_messages")
                .insert(response)
                .select()
                .single();

            if (!error && data) {
                return data as IBoiteMessage;
            }
        }

        // Fallback
        const localMessages = getLocalMessages();
        localMessages.unshift(response);
        saveLocalMessages(localMessages);
        return response;
    }
};
