import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type IAstedMode = 'chat' | 'voice' | 'god' | 'actions';

interface IAstedContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: (mode?: IAstedMode) => void;
    mode: IAstedMode;
    setMode: (mode: IAstedMode) => void;
    currentContext: any;
    setContext: (context: any) => void;
}

const IAstedContext = createContext<IAstedContextType | undefined>(undefined);

export const IAstedProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<IAstedMode>('chat');
    const [currentContext, setCurrentContext] = useState<any>(null);
    const location = useLocation();

    // Update context based on location (mock implementation of context awareness)
    React.useEffect(() => {
        const path = location.pathname;
        let contextData = { path, type: 'general' };

        if (path.includes('/admin')) {
            contextData = { path, type: 'admin_panel' };
        } else if (path.includes('/documents')) {
            contextData = { path, type: 'document_management' };
        } else if (path.includes('/icv')) {
            contextData = { path, type: 'cv_editor' };
        }

        setCurrentContext(contextData);
    }, [location]);

    const toggle = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);
    const open = (initialMode?: IAstedMode) => {
        if (initialMode) setMode(initialMode);
        setIsOpen(true);
    };

    return (
        <IAstedContext.Provider value={{ isOpen, toggle, close, open, mode, setMode, currentContext, setContext: setCurrentContext }}>
            {children}
        </IAstedContext.Provider>
    );
};

export const useIAsted = () => {
    const context = useContext(IAstedContext);
    if (context === undefined) {
        throw new Error('useIAsted must be used within an IAstedProvider');
    }
    return context;
};
