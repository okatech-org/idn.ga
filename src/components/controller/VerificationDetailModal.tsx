import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    FileText,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Flag,
    Send,
    ArrowUp,
    Fingerprint,
    Camera,
    Database,
    Brain,
    MessageSquare,
    Download,
    ZoomIn,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    VerificationRequest,
    DOCUMENT_TYPE_LABELS,
    STATUS_LABELS,
    RISK_COLORS,
    RISK_LABELS,
    VerificationDecision
} from '@/types/controller';
import { cn } from '@/lib/utils';

interface VerificationDetailModalProps {
    request: VerificationRequest | null;
    isOpen: boolean;
    onClose: () => void;
    onDecision: (decision: VerificationDecision) => void;
}

export const VerificationDetailModal = ({
    request,
    isOpen,
    onClose,
    onDecision
}: VerificationDetailModalProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'verifications' | 'notes'>('info');
    const [decisionNotes, setDecisionNotes] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [docZoom, setDocZoom] = useState(100);

    if (!request) return null;

    const riskColors = RISK_COLORS[request.riskLevel];

    const handleDecision = (type: 'approve' | 'reject' | 'escalate' | 'request_info') => {
        onDecision({
            requestId: request.id,
            decision: type,
            reason: decisionNotes,
            notes: decisionNotes
        });
        setDecisionNotes('');
    };

    const getVerificationIcon = (type: string) => {
        switch (type) {
            case 'biometric':
                return <Fingerprint className="w-5 h-5" />;
            case 'ai_assisted':
                return <Brain className="w-5 h-5" />;
            case 'database':
                return <Database className="w-5 h-5" />;
            default:
                return <Camera className="w-5 h-5" />;
        }
    };

    const tabs = [
        { id: 'info', label: 'Informations', icon: User },
        { id: 'documents', label: 'Documents', icon: FileText, count: request.documents.length },
        { id: 'verifications', label: 'Vérifications', icon: Shield, count: request.verifications.length },
        { id: 'notes', label: 'Notes', icon: MessageSquare, count: request.notes.length }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-background shadow-lg">
                                        <img
                                            src={request.applicant.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.applicant.lastName}`}
                                            alt={request.applicant.lastName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={cn(
                                        'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center',
                                        riskColors.bg
                                    )}>
                                        <Shield className={cn('w-3 h-3', riskColors.text)} />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {request.applicant.firstName} {request.applicant.lastName}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge className="bg-primary/10 text-primary">
                                            {DOCUMENT_TYPE_LABELS[request.documentType]}
                                        </Badge>
                                        <Badge className={cn(riskColors.bg, riskColors.text)}>
                                            Risque {RISK_LABELS[request.riskLevel]}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            ID: {request.id.slice(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-muted"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        activeTab === tab.id
                                            ? 'bg-background shadow-sm text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={cn(
                                            'ml-1 px-1.5 py-0.5 rounded-full text-xs',
                                            activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'info' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Informations personnelles */}
                                    <div className="neu-raised p-5 rounded-xl">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            Informations Personnelles
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Prénom</p>
                                                    <p className="font-medium">{request.applicant.firstName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Nom</p>
                                                    <p className="font-medium">{request.applicant.lastName}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Date de naissance</p>
                                                        <p className="font-medium">{new Date(request.applicant.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Lieu de naissance</p>
                                                        <p className="font-medium">{request.applicant.placeOfBirth}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Téléphone</p>
                                                        <p className="font-medium">{request.applicant.phone}</p>
                                                    </div>
                                                </div>
                                                {request.applicant.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Email</p>
                                                            <p className="font-medium truncate">{request.applicant.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Adresse</p>
                                                <p className="font-medium">{request.applicant.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détails de la demande */}
                                    <div className="neu-raised p-5 rounded-xl">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-primary" />
                                            Détails de la Demande
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Type de document</span>
                                                    <Badge variant="outline">{DOCUMENT_TYPE_LABELS[request.documentType]}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Statut actuel</span>
                                                    <Badge>{STATUS_LABELS[request.status]}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Priorité</span>
                                                    <Badge variant={request.priority === 1 ? 'destructive' : 'secondary'}>
                                                        {request.priority === 1 ? 'Urgente' : request.priority <= 3 ? 'Normale' : 'Basse'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Source</span>
                                                    <span className="font-medium">
                                                        {request.source === 'online' ? 'En ligne' : request.source === 'in_person' ? 'Guichet' : 'Agent'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span>Demande soumise le {new Date(request.requestedAt).toLocaleDateString('fr-FR')} à {new Date(request.requestedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>

                                            {request.location && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>Lieu: {request.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1 space-y-3">
                                        <h3 className="font-bold text-lg mb-4">Documents soumis</h3>
                                        {request.documents.map((doc) => (
                                            <motion.div
                                                key={doc.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setSelectedDoc(doc.url)}
                                                className={cn(
                                                    'p-4 rounded-xl cursor-pointer transition-all border-2',
                                                    selectedDoc === doc.url
                                                        ? 'neu-inset border-primary'
                                                        : 'neu-raised border-transparent hover:border-primary/30'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        'w-10 h-10 rounded-lg flex items-center justify-center',
                                                        doc.verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                    )}>
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{doc.name}</p>
                                                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                                                    </div>
                                                    {doc.verified ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                {doc.issues && doc.issues.length > 0 && (
                                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                        <p className="text-xs text-red-600 dark:text-red-400">
                                                            {doc.issues.join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="neu-raised rounded-xl p-4 h-[400px] flex flex-col">
                                            {selectedDoc ? (
                                                <>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-medium">Aperçu du document</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDocZoom(Math.max(50, docZoom - 25))}
                                                            >
                                                                -
                                                            </Button>
                                                            <span className="text-sm w-12 text-center">{docZoom}%</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDocZoom(Math.min(200, docZoom + 25))}
                                                            >
                                                                +
                                                            </Button>
                                                            <Button variant="outline" size="sm" onClick={() => setDocZoom(100)}>
                                                                <RotateCcw className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="outline" size="sm">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-auto flex items-center justify-center">
                                                        <img
                                                            src={selectedDoc}
                                                            alt="Document preview"
                                                            className="max-w-full h-auto transition-transform"
                                                            style={{ transform: `scale(${docZoom / 100})` }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                                    <p>Sélectionnez un document pour l'aperçu</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'verifications' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg mb-4">Historique des vérifications</h3>
                                    {request.verifications.map((verification, index) => (
                                        <motion.div
                                            key={verification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="neu-raised p-5 rounded-xl"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    'w-12 h-12 rounded-xl flex items-center justify-center',
                                                    verification.result === 'pass' ? 'bg-green-100 text-green-600' :
                                                        verification.result === 'fail' ? 'bg-red-100 text-red-600' :
                                                            'bg-yellow-100 text-yellow-600'
                                                )}>
                                                    {getVerificationIcon(verification.type)}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold">
                                                                {verification.type === 'biometric' ? 'Vérification Biométrique' :
                                                                    verification.type === 'ai_assisted' ? 'Analyse IA' :
                                                                        verification.type === 'database' ? 'Vérification Base de Données' :
                                                                            'Vérification Manuelle'}
                                                            </h4>
                                                            <Badge className={cn(
                                                                verification.result === 'pass' ? 'bg-green-100 text-green-700' :
                                                                    verification.result === 'fail' ? 'bg-red-100 text-red-700' :
                                                                        verification.result === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                            )}>
                                                                {verification.result === 'pass' ? 'Réussi' :
                                                                    verification.result === 'fail' ? 'Échoué' :
                                                                        verification.result === 'pending' ? 'En cours' :
                                                                            'Non concluant'}
                                                            </Badge>
                                                        </div>
                                                        {verification.score !== undefined && (
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold text-primary">{verification.score}</span>
                                                                <span className="text-sm text-muted-foreground">/100</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-2">{verification.details}</p>

                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span>Par: {verification.performedBy}</span>
                                                        <span>•</span>
                                                        <span>{new Date(verification.performedAt).toLocaleString('fr-FR')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg mb-4">Notes et commentaires</h3>
                                    {request.notes.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Aucune note pour cette demande
                                        </div>
                                    ) : (
                                        request.notes.map((note, index) => (
                                            <motion.div
                                                key={note.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    'p-4 rounded-xl border-l-4',
                                                    note.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500' :
                                                        note.type === 'action_required' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                                                            'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {note.type === 'warning' ? (
                                                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                                    ) : note.type === 'action_required' ? (
                                                        <Flag className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                    ) : (
                                                        <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm">{note.content}</p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <span>{note.createdBy}</span>
                                                            <span>•</span>
                                                            <span>{new Date(note.createdAt).toLocaleString('fr-FR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer avec actions de décision */}
                        <div className="p-6 border-t border-border bg-muted/30">
                            <div className="mb-4">
                                <Textarea
                                    placeholder="Ajoutez une note ou justification pour votre décision..."
                                    value={decisionNotes}
                                    onChange={(e) => setDecisionNotes(e.target.value)}
                                    className="resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDecision('request_info')}
                                        className="gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Demander infos
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDecision('escalate')}
                                        className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                        Escalader
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDecision('reject')}
                                        className="gap-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Rejeter
                                    </Button>
                                    <Button
                                        onClick={() => handleDecision('approve')}
                                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approuver
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VerificationDetailModal;
