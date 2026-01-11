/**
 * iBoîte Message Store (Zustand)
 * 
 * State management for citizen messaging
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { iboiteService, IBoiteMessage } from '@/services/iboiteService';

type FolderType = 'inbox' | 'sent' | 'archive';

interface IBoiteState {
    // State
    messages: IBoiteMessage[];
    isLoading: boolean;
    error: string | null;
    selectedFolder: FolderType;
    selectedMessageId: string | null;
    unreadCount: number;

    // Actions
    fetchMessages: () => Promise<void>;
    sendMessage: (recipientId: string, recipientName: string, subject: string, content: string) => Promise<IBoiteMessage | null>;
    markAsRead: (id: string) => Promise<void>;
    toggleStar: (id: string) => Promise<void>;
    archiveMessage: (id: string) => Promise<void>;
    deleteMessage: (id: string) => Promise<void>;
    setSelectedFolder: (folder: FolderType) => void;
    setSelectedMessage: (id: string | null) => void;

    // Computed
    getMessagesByFolder: (folder: FolderType) => IBoiteMessage[];
    getSelectedMessage: () => IBoiteMessage | null;
}

export const useIBoiteStore = create<IBoiteState>()(
    persist(
        (set, get) => ({
            // Initial state
            messages: [],
            isLoading: false,
            error: null,
            selectedFolder: 'inbox',
            selectedMessageId: null,
            unreadCount: 0,

            // Actions
            fetchMessages: async () => {
                set({ isLoading: true, error: null });
                try {
                    const messages = await iboiteService.getMessages();
                    const unreadCount = messages.filter(m => m.folder === 'inbox' && !m.is_read).length;
                    set({ messages, unreadCount, isLoading: false });
                } catch (error) {
                    set({ error: 'Erreur lors du chargement des messages', isLoading: false });
                }
            },

            sendMessage: async (recipientId, recipientName, subject, content) => {
                set({ isLoading: true, error: null });
                try {
                    const newMessage = await iboiteService.sendMessage(
                        recipientId, recipientName, subject, content
                    );
                    if (newMessage) {
                        set(state => ({
                            messages: [newMessage, ...state.messages],
                            isLoading: false
                        }));
                    }
                    return newMessage;
                } catch (error) {
                    set({ error: 'Erreur lors de l\'envoi', isLoading: false });
                    return null;
                }
            },

            markAsRead: async (id) => {
                await iboiteService.markAsRead(id);
                set(state => ({
                    messages: state.messages.map(m =>
                        m.id === id ? { ...m, is_read: true } : m
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            },

            toggleStar: async (id) => {
                await iboiteService.toggleStar(id);
                set(state => ({
                    messages: state.messages.map(m =>
                        m.id === id ? { ...m, is_starred: !m.is_starred } : m
                    )
                }));
            },

            archiveMessage: async (id) => {
                await iboiteService.archiveMessage(id);
                set(state => ({
                    messages: state.messages.map(m =>
                        m.id === id ? { ...m, folder: 'archive' as const } : m
                    ),
                    selectedMessageId: state.selectedMessageId === id ? null : state.selectedMessageId
                }));
            },

            deleteMessage: async (id) => {
                await iboiteService.deleteMessage(id);
                set(state => ({
                    messages: state.messages.filter(m => m.id !== id),
                    selectedMessageId: state.selectedMessageId === id ? null : state.selectedMessageId
                }));
            },

            setSelectedFolder: (folder) => set({ selectedFolder: folder, selectedMessageId: null }),
            setSelectedMessage: (id) => set({ selectedMessageId: id }),

            // Computed
            getMessagesByFolder: (folder) => {
                return get().messages.filter(m => m.folder === folder);
            },

            getSelectedMessage: () => {
                const { messages, selectedMessageId } = get();
                return messages.find(m => m.id === selectedMessageId) ?? null;
            },
        }),
        {
            name: 'iboite-storage',
            partialize: (state) => ({
                messages: state.messages,
                selectedFolder: state.selectedFolder,
            }),
        }
    )
);
