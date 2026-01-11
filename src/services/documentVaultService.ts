/**
 * Document Vault Service
 * 
 * Gestion du stockage sécurisé des documents citoyens avec Supabase
 * Fallback sur localStorage si l'utilisateur n'est pas connecté
 */

import { supabase } from "@/integrations/supabase/client";

// Document types
export interface VaultDocument {
    id: string;
    user_id?: string;
    name: string;
    category: DocumentCategory;
    file_type: "pdf" | "image" | "other";
    file_url?: string;
    file_size: string;
    thumbnail_url?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export type DocumentCategory =
    | "identity"
    | "family"
    | "education"
    | "health"
    | "vehicle"
    | "housing"
    | "work"
    | "other";

const LOCAL_STORAGE_KEY = "idn_vault_documents";

// Get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
};

// Get documents from localStorage
const getLocalDocuments = (): VaultDocument[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save documents to localStorage
const saveLocalDocuments = (documents: VaultDocument[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(documents));
};

export const documentVaultService = {
    /**
     * Récupérer tous les documents du coffre-fort
     */
    async getDocuments(): Promise<VaultDocument[]> {
        const userId = await getCurrentUserId();

        if (userId) {
            // Try Supabase first
            const { data, error } = await supabase
                .from("vault_documents")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (!error && data) {
                return data as VaultDocument[];
            }
        }

        // Fallback to localStorage
        return getLocalDocuments();
    },

    /**
     * Ajouter un document au coffre-fort
     */
    async addDocument(doc: Omit<VaultDocument, "id" | "user_id" | "created_at" | "updated_at">): Promise<VaultDocument | null> {
        const userId = await getCurrentUserId();
        const now = new Date().toISOString();

        const newDoc: VaultDocument = {
            ...doc,
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId ?? undefined,
            created_at: now,
            updated_at: now,
        };

        if (userId) {
            // Try Supabase
            const { data, error } = await supabase
                .from("vault_documents")
                .insert(newDoc)
                .select()
                .single();

            if (!error && data) {
                return data as VaultDocument;
            }
        }

        // Fallback to localStorage
        const localDocs = getLocalDocuments();
        localDocs.unshift(newDoc);
        saveLocalDocuments(localDocs);
        return newDoc;
    },

    /**
     * Supprimer un document
     */
    async deleteDocument(docId: string): Promise<boolean> {
        const userId = await getCurrentUserId();

        if (userId) {
            const { error } = await supabase
                .from("vault_documents")
                .delete()
                .eq("id", docId)
                .eq("user_id", userId);

            if (!error) {
                return true;
            }
        }

        // Fallback to localStorage
        const localDocs = getLocalDocuments();
        const filtered = localDocs.filter(d => d.id !== docId);
        saveLocalDocuments(filtered);
        return true;
    },

    /**
     * Upload un fichier vers le storage Supabase
     */
    async uploadFile(file: File, category: DocumentCategory): Promise<{ url: string; path: string } | null> {
        const userId = await getCurrentUserId();
        if (!userId) return null;

        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${category}/${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from("vault")
            .upload(filePath, file);

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        const { data } = supabase.storage.from("vault").getPublicUrl(filePath);
        return { url: data.publicUrl, path: filePath };
    },

    /**
     * Supprimer un fichier du storage
     */
    async deleteFile(filePath: string): Promise<boolean> {
        const { error } = await supabase.storage
            .from("vault")
            .remove([filePath]);

        return !error;
    },

    /**
     * Synchroniser les documents locaux vers Supabase
     */
    async syncLocalToCloud(): Promise<number> {
        const userId = await getCurrentUserId();
        if (!userId) return 0;

        const localDocs = getLocalDocuments();
        if (localDocs.length === 0) return 0;

        let synced = 0;
        for (const doc of localDocs) {
            const { error } = await supabase
                .from("vault_documents")
                .upsert({ ...doc, user_id: userId });

            if (!error) synced++;
        }

        // Clear local storage after sync
        if (synced === localDocs.length) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        return synced;
    }
};
