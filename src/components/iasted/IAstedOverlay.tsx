import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIAsted } from '@/context/IAstedContext';
import { X, MessageCircle, Mic, FileText, Activity, Terminal, Shield, Zap, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentService } from '@/services/DocumentService';
import { usePresidentRole } from '@/hooks/usePresidentRole';

const IAstedOverlay = () => {
    const { isOpen, close, mode, setMode, currentContext } = useIAsted();
    const { isPresident } = usePresidentRole(); // Assuming President role implies Admin/God access for now
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: 'Bonjour. Je suis iAsted, l\'intelligence centrale. Comment puis-je vous aider ?' }
    ]);

    // Mock God Mode Logs
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && isPresident) {
            const interval = setInterval(() => {
                const newLog = `[SYSTEM] ${new Date().toLocaleTimeString()} - ${Math.random() > 0.5 ? 'Check integrity' : 'Sync data'} - OK`;
                setLogs(prev => [newLog, ...prev].slice(0, 20));
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isOpen, isPresident]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
        const userMsg = inputMessage;
        setInputMessage('');

        // Mock AI Response with Context Awareness
        setTimeout(() => {
            let response = "Je traite votre demande...";

            if (userMsg.toLowerCase().includes('où suis-je')) {
                response = `Vous êtes actuellement sur le module : ${currentContext?.type} (${currentContext?.path}).`;
            } else if (userMsg.toLowerCase().includes('rapport')) {
                response = "Je génère le rapport demandé immédiatement.";
                DocumentService.generateReport('activity');
            } else {
                response = `Bien reçu. J'analyse "${userMsg}" dans le contexte actuel.`;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Overlay Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-[9999] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">iAsted Core</h2>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Online • {currentContext?.type || 'System'}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={close} className="rounded-full hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Tabs */}
                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="flex-1 flex flex-col">
                            <div className="px-4 pt-4">
                                <TabsList className="grid w-full grid-cols-4 bg-white/5">
                                    <TabsTrigger value="chat"><MessageCircle className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="voice"><Mic className="w-4 h-4" /></TabsTrigger>
                                    <TabsTrigger value="actions"><FileText className="w-4 h-4" /></TabsTrigger>
                                    {isPresident && <TabsTrigger value="god" className="text-red-400 data-[state=active]:text-red-500"><Shield className="w-4 h-4" /></TabsTrigger>}
                                </TabsList>
                            </div>

                            {/* Chat Mode */}
                            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                        ? 'bg-primary text-white rounded-tr-none'
                                                        : 'bg-white/10 text-foreground rounded-tl-none border border-white/10'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-4 border-t border-white/10 bg-white/5">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                                        <Input
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Posez une question..."
                                            className="bg-background/50 border-white/10"
                                        />
                                        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </TabsContent>

                            {/* Voice Mode */}
                            <TabsContent value="voice" className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping blur-xl"></div>
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-2xl relative z-10">
                                        <Mic className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Mode Vocal Actif</h3>
                                    <p className="text-muted-foreground">Je vous écoute. Parlez naturellement.</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="rounded-full">Pause</Button>
                                    <Button variant="destructive" className="rounded-full">Arrêter</Button>
                                </div>
                            </TabsContent>

                            {/* Actions Mode (Doc Gen) */}
                            <TabsContent value="actions" className="flex-1 p-4 space-y-4">
                                <h3 className="font-semibold text-lg mb-4">Générateur de Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2 bg-white/5 hover:bg-white/10 border-white/10"
                                        onClick={() => DocumentService.generateReport('activity')}
                                    >
                                        <Activity className="w-8 h-8 text-blue-400" />
                                        <span>Rapport d'Activité</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2 bg-white/5 hover:bg-white/10 border-white/10"
                                        onClick={() => DocumentService.generatePDF('Attestation_Citoyen', 'Content')}
                                    >
                                        <FileText className="w-8 h-8 text-green-400" />
                                        <span>Attestation PDF</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2 bg-white/5 hover:bg-white/10 border-white/10"
                                        onClick={() => DocumentService.generateDocx('Contrat_Type', 'Content')}
                                    >
                                        <FileText className="w-8 h-8 text-blue-600" />
                                        <span>Contrat Word</span>
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* God Mode */}
                            <TabsContent value="god" className="flex-1 p-0 flex flex-col bg-black/90 font-mono text-xs text-green-400">
                                <div className="p-2 border-b border-green-900 flex items-center gap-2 bg-green-900/20">
                                    <Terminal className="w-4 h-4" />
                                    <span>SYSTEM_ROOT_ACCESS // GOD_MODE</span>
                                </div>
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-1">
                                        {logs.map((log, i) => (
                                            <div key={i} className="opacity-80 hover:opacity-100 hover:bg-green-900/30 p-0.5 rounded">
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-2 border-t border-green-900 bg-green-900/10">
                                    <div className="flex gap-2">
                                        <span className="text-green-600">{'>'}</span>
                                        <span className="animate-pulse">_</span>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default IAstedOverlay;
