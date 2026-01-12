import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    FileCheck,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    Settings,
    Bell,
    Moon,
    Sun,
    History,
    BarChart3,
    QrCode,
    Fingerprint,
    ChevronRight,
    ChevronDown,
    LogOut,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

// Components
import { ControllerStatsGrid } from '@/components/controller/ControllerStatsGrid';
import { VerificationQueue } from '@/components/controller/VerificationQueue';
import { VerificationDetailModal } from '@/components/controller/VerificationDetailModal';
import { PerformanceChart } from '@/components/controller/PerformanceChart';
import { DocumentScanner } from '@/components/controller/DocumentScanner';

// Types
import {
    VerificationRequest,
    ControllerStats,
    VerificationDecision,
    VerificationStatus
} from '@/types/controller';
import { cn } from '@/lib/utils';

// Mock data pour la démonstration
const generateMockRequests = (): VerificationRequest[] => [
    {
        id: 'vr-001-2026',
        applicant: {
            id: 'app-001',
            firstName: 'Jean-Pierre',
            lastName: 'Moussavou',
            dateOfBirth: '1985-03-15',
            placeOfBirth: 'Libreville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: '123 Avenue de l\'Indépendance, Libreville',
            phone: '+241 77 12 34 56',
            email: 'jp.moussavou@email.ga',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussavou'
        },
        documentType: 'cni',
        status: 'pending',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        priority: 2,
        documents: [
            {
                id: 'doc-001',
                type: 'Acte de naissance',
                name: 'Acte_naissance_Moussavou.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: true
            },
            {
                id: 'doc-002',
                type: 'Justificatif de domicile',
                name: 'Facture_SEEG_2026.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: false
            }
        ],
        verifications: [
            {
                id: 'ver-001',
                type: 'biometric',
                result: 'pass',
                score: 95,
                details: 'Correspondance faciale validée avec la photo d\'identité existante.',
                performedAt: new Date().toISOString(),
                performedBy: 'Système Biométrique'
            },
            {
                id: 'ver-002',
                type: 'database',
                result: 'pass',
                score: 100,
                details: 'Aucune fraude détectée dans les bases de données nationales.',
                performedAt: new Date().toISOString(),
                performedBy: 'DGDI Database'
            }
        ],
        notes: [],
        source: 'online'
    },
    {
        id: 'vr-002-2026',
        applicant: {
            id: 'app-002',
            firstName: 'Marie',
            lastName: 'Obame-Nguema',
            dateOfBirth: '1990-07-22',
            placeOfBirth: 'Port-Gentil',
            nationality: 'Gabonaise',
            gender: 'F',
            address: '45 Rue du Commerce, Port-Gentil',
            phone: '+241 66 98 76 54',
            email: 'marie.obame@email.ga',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ObameNguema'
        },
        documentType: 'passport',
        status: 'pending',
        riskLevel: 'medium',
        requestedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [
            {
                id: 'doc-003',
                type: 'CNI actuelle',
                name: 'CNI_Obame.jpg',
                url: 'https://via.placeholder.com/600x400',
                uploadedAt: new Date().toISOString(),
                verified: true
            },
            {
                id: 'doc-004',
                type: 'Photo d\'identité',
                name: 'Photo_passport.jpg',
                url: 'https://via.placeholder.com/400x500',
                uploadedAt: new Date().toISOString(),
                verified: true
            }
        ],
        verifications: [
            {
                id: 'ver-003',
                type: 'ai_assisted',
                result: 'inconclusive',
                score: 72,
                details: 'Score de confiance modéré. Vérification manuelle recommandée.',
                performedAt: new Date().toISOString(),
                performedBy: 'AI Verification Engine'
            }
        ],
        notes: [
            {
                id: 'note-001',
                content: 'La photo présente une légère différence avec la CNI existante. À vérifier.',
                createdAt: new Date().toISOString(),
                createdBy: 'Agent Mboumba',
                type: 'warning'
            }
        ],
        source: 'in_person',
        location: 'Guichet Central Port-Gentil'
    },
    {
        id: 'vr-003-2026',
        applicant: {
            id: 'app-003',
            firstName: 'Paul',
            lastName: 'Bongo-Ondimba',
            dateOfBirth: '1978-11-30',
            placeOfBirth: 'Franceville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: '78 Boulevard Triomphal, Franceville',
            phone: '+241 74 55 66 77',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BongoOndimba'
        },
        documentType: 'birth_cert',
        status: 'in_review',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        assignedTo: 'Agent Koumba',
        priority: 3,
        documents: [
            {
                id: 'doc-005',
                type: 'Acte de naissance ancien',
                name: 'Ancien_acte.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: true
            }
        ],
        verifications: [
            {
                id: 'ver-004',
                type: 'database',
                result: 'pass',
                details: 'Enregistrement civil confirmé.',
                performedAt: new Date().toISOString(),
                performedBy: 'État Civil National'
            }
        ],
        notes: [],
        source: 'agent'
    },
    {
        id: 'vr-004-2026',
        applicant: {
            id: 'app-004',
            firstName: 'Sarah',
            lastName: 'Kassa-Mapangou',
            dateOfBirth: '1995-02-14',
            placeOfBirth: 'Oyem',
            nationality: 'Gabonaise',
            gender: 'F',
            address: '12 Quartier Mindoubé, Oyem',
            phone: '+241 62 33 44 55',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KassaMapangou'
        },
        documentType: 'cni',
        status: 'flagged',
        riskLevel: 'high',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [
            {
                id: 'doc-006',
                type: 'Acte de naissance',
                name: 'Acte_naissance_suspect.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: false,
                issues: ['Document potentiellement modifié', 'Signature illisible']
            }
        ],
        verifications: [
            {
                id: 'ver-005',
                type: 'ai_assisted',
                result: 'fail',
                score: 35,
                details: 'Anomalies détectées dans le document. Potentielle falsification.',
                performedAt: new Date().toISOString(),
                performedBy: 'AI Fraud Detection'
            },
            {
                id: 'ver-006',
                type: 'database',
                result: 'fail',
                details: 'Aucun enregistrement correspondant trouvé dans l\'état civil d\'Oyem.',
                performedAt: new Date().toISOString(),
                performedBy: 'État Civil Oyem'
            }
        ],
        notes: [
            {
                id: 'note-002',
                content: 'ATTENTION: Document suspect. Vérification approfondie requise. Contacter les autorités d\'Oyem.',
                createdAt: new Date().toISOString(),
                createdBy: 'Système',
                type: 'action_required'
            }
        ],
        source: 'online'
    },
    {
        id: 'vr-005-2026',
        applicant: {
            id: 'app-005',
            firstName: 'Emmanuel',
            lastName: 'Ndong-Mba',
            dateOfBirth: '1982-08-05',
            placeOfBirth: 'Lambaréné',
            nationality: 'Gabonaise',
            gender: 'M',
            address: '56 Rue Albert Schweitzer, Lambaréné',
            phone: '+241 77 88 99 00',
            email: 'e.ndong@ministere.ga',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NdongMba'
        },
        documentType: 'driving',
        status: 'pending',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        priority: 4,
        documents: [
            {
                id: 'doc-007',
                type: 'CNI valide',
                name: 'CNI_Ndong.jpg',
                url: 'https://via.placeholder.com/600x400',
                uploadedAt: new Date().toISOString(),
                verified: true
            },
            {
                id: 'doc-008',
                type: 'Certificat médical',
                name: 'Certificat_medical.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: true
            }
        ],
        verifications: [
            {
                id: 'ver-007',
                type: 'biometric',
                result: 'pass',
                score: 98,
                details: 'Identité confirmée par empreinte digitale.',
                performedAt: new Date().toISOString(),
                performedBy: 'Terminal Biométrique LBV-003'
            }
        ],
        notes: [],
        source: 'in_person',
        location: 'Centre de permis de Lambaréné'
    },
    {
        id: 'vr-006-2026',
        applicant: {
            id: 'app-006',
            firstName: 'Clémentine',
            lastName: 'Ondo-Minko',
            dateOfBirth: '1998-12-01',
            placeOfBirth: 'Bitam',
            nationality: 'Gabonaise',
            gender: 'F',
            address: '23 Avenue des Palmiers, Bitam',
            phone: '+241 65 11 22 33',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OndoMinko'
        },
        documentType: 'passport',
        status: 'escalated',
        riskLevel: 'critical',
        requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [
            {
                id: 'doc-009',
                type: 'CNI',
                name: 'CNI_doublon.jpg',
                url: 'https://via.placeholder.com/600x400',
                uploadedAt: new Date().toISOString(),
                verified: false,
                issues: ['Doublon détecté', 'Numéro CNI déjà utilisé']
            }
        ],
        verifications: [
            {
                id: 'ver-008',
                type: 'database',
                result: 'fail',
                details: 'Ce numéro de CNI est déjà associé à une autre personne dans le système.',
                performedAt: new Date().toISOString(),
                performedBy: 'DGDI Central'
            },
            {
                id: 'ver-009',
                type: 'ai_assisted',
                result: 'fail',
                score: 15,
                details: 'Tentative de fraude à l\'identité détectée. Dossier escaladé.',
                performedAt: new Date().toISOString(),
                performedBy: 'AI Security Module'
            }
        ],
        notes: [
            {
                id: 'note-003',
                content: 'ALERTE FRAUDE: Usurpation d\'identité potentielle. Dossier transféré à la DGSS.',
                createdAt: new Date().toISOString(),
                createdBy: 'Agent Supervisor',
                type: 'action_required'
            },
            {
                id: 'note-004',
                content: 'Personne originale contactée. Elle confirme n\'avoir jamais fait cette demande.',
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                createdBy: 'Agent Koumba',
                type: 'warning'
            }
        ],
        source: 'online'
    },
    // === HISTORIQUE - Demandes déjà traitées ===
    {
        id: 'vr-hist-001',
        applicant: {
            id: 'app-h001',
            firstName: 'André',
            lastName: 'Mba-Obiang',
            dateOfBirth: '1975-05-20',
            placeOfBirth: 'Libreville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: '88 Quartier Glass, Libreville',
            phone: '+241 77 11 22 33',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MbaObiang'
        },
        documentType: 'cni',
        status: 'approved',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        priority: 3,
        documents: [
            {
                id: 'doc-h001',
                type: 'Acte de naissance',
                name: 'Acte_Mba.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: true
            }
        ],
        verifications: [
            {
                id: 'ver-h001',
                type: 'biometric',
                result: 'pass',
                score: 99,
                details: 'Identité confirmée.',
                performedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                performedBy: 'Agent Koumba'
            }
        ],
        notes: [
            {
                id: 'note-h001',
                content: 'Dossier complet, aucune anomalie détectée.',
                createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                createdBy: 'Agent Koumba',
                type: 'info'
            }
        ],
        source: 'in_person',
        location: 'Mairie de Libreville'
    },
    {
        id: 'vr-hist-002',
        applicant: {
            id: 'app-h002',
            firstName: 'Francine',
            lastName: 'Nzoghe-Ndong',
            dateOfBirth: '1988-09-12',
            placeOfBirth: 'Oyem',
            nationality: 'Gabonaise',
            gender: 'F',
            address: '15 Boulevard Triomphal, Oyem',
            phone: '+241 66 44 55 66',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NzogheNdong'
        },
        documentType: 'passport',
        status: 'approved',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        priority: 2,
        documents: [
            {
                id: 'doc-h002',
                type: 'CNI',
                name: 'CNI_Nzoghe.jpg',
                url: 'https://via.placeholder.com/600x400',
                uploadedAt: new Date().toISOString(),
                verified: true
            }
        ],
        verifications: [
            {
                id: 'ver-h002',
                type: 'database',
                result: 'pass',
                details: 'Toutes les vérifications réussies.',
                performedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
                performedBy: 'DGDI Database'
            }
        ],
        notes: [],
        source: 'online'
    },
    {
        id: 'vr-hist-003',
        applicant: {
            id: 'app-h003',
            firstName: 'Michel',
            lastName: 'Ella-Nguema',
            dateOfBirth: '1992-01-25',
            placeOfBirth: 'Mouila',
            nationality: 'Gabonaise',
            gender: 'M',
            address: '42 Rue des Manguiers, Mouila',
            phone: '+241 74 77 88 99',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EllaNguema'
        },
        documentType: 'cni',
        status: 'rejected',
        riskLevel: 'high',
        requestedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [
            {
                id: 'doc-h003',
                type: 'Acte de naissance',
                name: 'Acte_suspect.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: false,
                issues: ['Document falsifié', 'Tampon non conforme']
            }
        ],
        verifications: [
            {
                id: 'ver-h003',
                type: 'ai_assisted',
                result: 'fail',
                score: 22,
                details: 'Falsification détectée par analyse IA.',
                performedAt: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(),
                performedBy: 'AI Fraud Detection'
            }
        ],
        notes: [
            {
                id: 'note-h003',
                content: 'Document falsifié. Dossier transmis aux autorités judiciaires.',
                createdAt: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(),
                createdBy: 'Agent Supervisor',
                type: 'action_required'
            }
        ],
        source: 'online'
    },
    {
        id: 'vr-hist-004',
        applicant: {
            id: 'app-h004',
            firstName: 'Pauline',
            lastName: 'Mintsa-Mi-Obiang',
            dateOfBirth: '1980-06-18',
            placeOfBirth: 'Makokou',
            nationality: 'Gabonaise',
            gender: 'F',
            address: '7 Quartier Djolé, Makokou',
            phone: '+241 62 88 99 00',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MintsaMiObiang'
        },
        documentType: 'birth_cert',
        status: 'approved',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        priority: 4,
        documents: [
            {
                id: 'doc-h004',
                type: 'Livret de famille',
                name: 'Livret_Mintsa.pdf',
                url: 'https://via.placeholder.com/600x800',
                uploadedAt: new Date().toISOString(),
                verified: true
            }
        ],
        verifications: [
            {
                id: 'ver-h004',
                type: 'database',
                result: 'pass',
                details: 'Enregistrement confirmé à Makokou.',
                performedAt: new Date(Date.now() - 95 * 60 * 60 * 1000).toISOString(),
                performedBy: 'État Civil Makokou'
            }
        ],
        notes: [],
        source: 'agent'
    }
];

const generateMockStats = (): ControllerStats => ({
    pendingCount: 24,
    inReviewCount: 8,
    approvedToday: 45,
    rejectedToday: 3,
    flaggedCount: 5,
    averageProcessingTime: 12,
    myProcessedToday: 18,
    myPendingCount: 6
});

type Section = 'queue' | 'history' | 'stats' | 'scanner' | 'settings';

const ControllerSpace = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // State
    const [activeSection, setActiveSection] = useState<Section>('queue');
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [stats, setStats] = useState<ControllerStats>(generateMockStats());
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Charger les données initiales
        loadRequests();
    }, []);

    const loadRequests = useCallback(() => {
        setIsLoading(true);
        // Simuler le chargement
        setTimeout(() => {
            setRequests(generateMockRequests());
            setStats(generateMockStats());
            setIsLoading(false);
        }, 500);
    }, []);

    const handleViewRequest = (request: VerificationRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleQuickApprove = (request: VerificationRequest) => {
        handleDecision({
            requestId: request.id,
            decision: 'approve',
            reason: 'Approbation rapide - Documents conformes'
        });
    };

    const handleQuickReject = (request: VerificationRequest) => {
        handleDecision({
            requestId: request.id,
            decision: 'reject',
            reason: 'Documents non conformes'
        });
    };

    const handleDecision = (decision: VerificationDecision) => {
        // Mettre à jour le statut local
        setRequests(prev => prev.map(r => {
            if (r.id === decision.requestId) {
                let newStatus: VerificationStatus;
                switch (decision.decision) {
                    case 'approve':
                        newStatus = 'approved';
                        break;
                    case 'reject':
                        newStatus = 'rejected';
                        break;
                    case 'escalate':
                        newStatus = 'escalated';
                        break;
                    default:
                        newStatus = r.status;
                }
                return { ...r, status: newStatus };
            }
            return r;
        }));

        // Afficher une notification
        const messages: Record<string, { title: string; description: string }> = {
            approve: {
                title: '✅ Demande approuvée',
                description: 'La demande a été approuvée avec succès.'
            },
            reject: {
                title: '❌ Demande rejetée',
                description: 'La demande a été rejetée.'
            },
            escalate: {
                title: '⬆️ Demande escaladée',
                description: 'La demande a été transférée à un superviseur.'
            },
            request_info: {
                title: '📝 Informations demandées',
                description: 'Une demande d\'informations complémentaires a été envoyée.'
            }
        };

        toast(messages[decision.decision]);

        // Mettre à jour les stats
        setStats(prev => ({
            ...prev,
            pendingCount: Math.max(0, prev.pendingCount - 1),
            approvedToday: decision.decision === 'approve' ? prev.approvedToday + 1 : prev.approvedToday,
            rejectedToday: decision.decision === 'reject' ? prev.rejectedToday + 1 : prev.rejectedToday,
            myProcessedToday: prev.myProcessedToday + 1
        }));

        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const sidebarItems = [
        { id: 'queue', label: 'File d\'attente', icon: Clock, count: stats.pendingCount },
        { id: 'history', label: 'Historique', icon: History },
        { id: 'stats', label: 'Statistiques', icon: BarChart3 },
        { id: 'scanner', label: 'Scanner', icon: QrCode },
        { id: 'settings', label: 'Paramètres', icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex h-screen overflow-hidden p-4 md:p-6 gap-6 max-w-[1800px] mx-auto">
                {/* Sidebar */}
                <aside className="neu-card w-64 flex-shrink-0 p-5 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm">iControl</h2>
                            <p className="text-xs text-muted-foreground">Agent Vérificateur</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as Section)}
                                className={cn(
                                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all',
                                    activeSection === item.id
                                        ? 'neu-inset text-primary font-semibold'
                                        : 'neu-raised hover:shadow-neo-md'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </div>
                                {item.count !== undefined && (
                                    <Badge className="bg-primary/10 text-primary text-xs">
                                        {item.count}
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="pt-4 border-t border-border space-y-2">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm neu-raised hover:shadow-neo-md transition-all"
                        >
                            {mounted && theme === 'dark' ? (
                                <>
                                    <Sun className="w-4 h-4" /> Mode clair
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4" /> Mode sombre
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate('/demo')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive neu-raised hover:shadow-neo-md transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <div className="neu-card p-6 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    <FileCheck className="w-7 h-7 text-primary" />
                                    Contrôle d'Identité
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Vérification et approbation des documents officiels
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Agent Info */}
                            <div className="flex items-center gap-3 px-4 py-2 neu-raised rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                    <Fingerprint className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Agent Koumba</p>
                                    <p className="text-xs text-muted-foreground">Niveau 2 - Assermenté</p>
                                </div>
                            </div>

                            {/* Notifications */}
                            <Button variant="outline" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                    3
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 neu-card p-6 overflow-hidden flex flex-col">
                        <AnimatePresence mode="wait">
                            {activeSection === 'queue' && (
                                <motion.div
                                    key="queue"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col h-full"
                                >
                                    {/* Stats Grid */}
                                    <div className="mb-6">
                                        <ControllerStatsGrid stats={stats} />
                                    </div>

                                    {/* Queue */}
                                    <div className="flex-1 min-h-0 overflow-auto">
                                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                            Demandes en attente
                                        </h2>
                                        <VerificationQueue
                                            requests={requests.filter(r =>
                                                ['pending', 'in_review', 'flagged', 'escalated'].includes(r.status)
                                            )}
                                            onViewRequest={handleViewRequest}
                                            onQuickApprove={handleQuickApprove}
                                            onQuickReject={handleQuickReject}
                                            onRefresh={loadRequests}
                                            isLoading={isLoading}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col h-full"
                                >
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <History className="w-5 h-5 text-primary" />
                                        Historique des vérifications
                                    </h2>

                                    <div className="flex-1 min-h-0 overflow-auto">
                                        <VerificationQueue
                                            requests={requests.filter(r =>
                                                ['approved', 'rejected'].includes(r.status)
                                            )}
                                            onViewRequest={handleViewRequest}
                                            onQuickApprove={() => { }}
                                            onQuickReject={() => { }}
                                            onRefresh={loadRequests}
                                            isLoading={isLoading}
                                        />

                                        {requests.filter(r => ['approved', 'rejected'].includes(r.status)).length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium mb-2">Aucun historique</p>
                                                <p className="text-sm">Les demandes traitées apparaîtront ici</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'stats' && (
                                <motion.div
                                    key="stats"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-primary" />
                                        Tableau de bord analytique
                                    </h2>

                                    <ControllerStatsGrid stats={stats} />

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Performance Chart */}
                                        <div className="neu-raised p-6 rounded-xl">
                                            <h3 className="font-semibold mb-4">Performance hebdomadaire</h3>
                                            <PerformanceChart />
                                        </div>

                                        {/* Distribution by Type */}
                                        <div className="neu-raised p-6 rounded-xl">
                                            <h3 className="font-semibold mb-4">Répartition par type de document</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { type: 'CNI', count: 45, color: 'bg-blue-500' },
                                                    { type: 'Passeport', count: 28, color: 'bg-green-500' },
                                                    { type: 'Acte de Naissance', count: 18, color: 'bg-yellow-500' },
                                                    { type: 'Permis de Conduire', count: 12, color: 'bg-purple-500' },
                                                    { type: 'Autres', count: 7, color: 'bg-gray-500' }
                                                ].map(item => (
                                                    <div key={item.type} className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                                        <span className="flex-1 text-sm">{item.type}</span>
                                                        <span className="font-semibold">{item.count}</span>
                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${item.color} rounded-full`}
                                                                style={{ width: `${(item.count / 45) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'scanner' && (
                                <motion.div
                                    key="scanner"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-full"
                                >
                                    <DocumentScanner />
                                </motion.div>
                            )}

                            {activeSection === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-primary" />
                                        Paramètres
                                    </h2>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Preferences */}
                                        <div className="neu-raised p-6 rounded-xl space-y-4">
                                            <h3 className="font-semibold">Préférences de notification</h3>
                                            {[
                                                { label: 'Nouvelles demandes urgentes', enabled: true },
                                                { label: 'Demandes signalées', enabled: true },
                                                { label: 'Rappels de délai', enabled: false },
                                                { label: 'Résumé quotidien', enabled: true }
                                            ].map((pref, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <span className="text-sm">{pref.label}</span>
                                                    <div className={cn(
                                                        'w-10 h-6 rounded-full p-1 transition-colors cursor-pointer',
                                                        pref.enabled ? 'bg-primary' : 'bg-muted'
                                                    )}>
                                                        <div className={cn(
                                                            'w-4 h-4 rounded-full bg-white transition-transform',
                                                            pref.enabled && 'translate-x-4'
                                                        )} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Account Info */}
                                        <div className="neu-raised p-6 rounded-xl space-y-4">
                                            <h3 className="font-semibold">Informations du compte</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                                        <Fingerprint className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">Agent Marc Koumba</p>
                                                        <p className="text-xs text-muted-foreground">ID: AGT-2026-0042</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="p-3 bg-muted/30 rounded-lg">
                                                        <p className="text-muted-foreground text-xs">Niveau d'habilitation</p>
                                                        <p className="font-semibold">Niveau 2</p>
                                                    </div>
                                                    <div className="p-3 bg-muted/30 rounded-lg">
                                                        <p className="text-muted-foreground text-xs">Poste</p>
                                                        <p className="font-semibold">Libreville Central</p>
                                                    </div>
                                                    <div className="p-3 bg-muted/30 rounded-lg">
                                                        <p className="text-muted-foreground text-xs">Date d'assermentation</p>
                                                        <p className="font-semibold">15/01/2024</p>
                                                    </div>
                                                    <div className="p-3 bg-muted/30 rounded-lg">
                                                        <p className="text-muted-foreground text-xs">Expiration</p>
                                                        <p className="font-semibold">14/01/2027</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Verification Detail Modal */}
            <VerificationDetailModal
                request={selectedRequest}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRequest(null);
                }}
                onDecision={handleDecision}
            />
        </div>
    );
};

export default ControllerSpace;
