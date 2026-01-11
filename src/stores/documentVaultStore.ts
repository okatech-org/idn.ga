/**
 * Document Vault Store (Zustand)
 * 
 * State management for the citizen's document vault
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { documentVaultService, VaultDocument, DocumentCategory } from '@/services/documentVaultService';

interface DocumentVaultState {
    // State
    documents: VaultDocument[];
    isLoading: boolean;
    error: string | null;
    selectedCategory: DocumentCategory | 'all';
    searchQuery: string;

    // Actions
    fetchDocuments: () => Promise<void>;
    addDocument: (doc: Omit<VaultDocument, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<VaultDocument | null>;
    deleteDocument: (id: string) => Promise<void>;
    setSelectedCategory: (category: DocumentCategory | 'all') => void;
    setSearchQuery: (query: string) => void;

    // Computed
    filteredDocuments: () => VaultDocument[];
    getDocumentsByCategory: (category: DocumentCategory) => VaultDocument[];
    getCategoryCounts: () => Record<DocumentCategory | 'all', number>;
}

export const useDocumentVaultStore = create<DocumentVaultState>()(
    persist(
        (set, get) => ({
            // Initial state
            documents: [],
            isLoading: false,
            error: null,
            selectedCategory: 'all',
            searchQuery: '',

            // Actions
            fetchDocuments: async () => {
                set({ isLoading: true, error: null });
                try {
                    const documents = await documentVaultService.getDocuments();
                    set({ documents, isLoading: false });
                } catch (error) {
                    set({ error: 'Erreur lors du chargement des documents', isLoading: false });
                }
            },

            addDocument: async (doc) => {
                set({ isLoading: true, error: null });
                try {
                    const newDoc = await documentVaultService.addDocument(doc);
                    if (newDoc) {
                        set(state => ({
                            documents: [newDoc, ...state.documents],
                            isLoading: false
                        }));
                    }
                    return newDoc;
                } catch (error) {
                    set({ error: 'Erreur lors de l\'ajout du document', isLoading: false });
                    return null;
                }
            },

            deleteDocument: async (id) => {
                try {
                    await documentVaultService.deleteDocument(id);
                    set(state => ({
                        documents: state.documents.filter(d => d.id !== id)
                    }));
                } catch (error) {
                    set({ error: 'Erreur lors de la suppression' });
                }
            },

            setSelectedCategory: (category) => set({ selectedCategory: category }),
            setSearchQuery: (query) => set({ searchQuery: query }),

            // Computed
            filteredDocuments: () => {
                const { documents, selectedCategory, searchQuery } = get();
                return documents.filter(doc => {
                    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
                    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                });
            },

            getDocumentsByCategory: (category) => {
                return get().documents.filter(d => d.category === category);
            },

            getCategoryCounts: () => {
                const { documents } = get();
                const counts: Record<string, number> = { all: documents.length };
                documents.forEach(doc => {
                    counts[doc.category] = (counts[doc.category] || 0) + 1;
                });
                return counts as Record<DocumentCategory | 'all', number>;
            },
        }),
        {
            name: 'document-vault-storage',
            partialize: (state) => ({
                documents: state.documents,
                selectedCategory: state.selectedCategory,
            }),
        }
    )
);
