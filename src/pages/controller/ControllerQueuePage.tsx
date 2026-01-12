import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Search,
    Filter,
    RefreshCw,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Components
import { VerificationDetailModal } from '@/components/controller/VerificationDetailModal';

// Types
import {
    VerificationRequest,
    VerificationDecision,
    VerificationStatus,
    RiskLevel,
    DOCUMENT_TYPE_LABELS,
    STATUS_LABELS,
    RISK_LABELS
} from '@/types/controller';
import { cn } from '@/lib/utils';

// Mock data
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
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 2,
        documents: [],
        verifications: [],
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
        status: 'in_review',
        riskLevel: 'medium',
        requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [],
        verifications: [],
        notes: [],
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
        status: 'pending',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        assignedTo: 'Agent Koumba',
        priority: 3,
        documents: [],
        verifications: [],
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
        documents: [],
        verifications: [],
        notes: [],
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
        documents: [],
        verifications: [],
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
        documents: [],
        verifications: [],
        notes: [],
        source: 'online'
    }
];

// Simple Request Card Component - No effects
const RequestCard = ({
    request,
    onClick
}: {
    request: VerificationRequest;
    onClick: () => void;
}) => {
    const getTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}j`;
        if (diffHours > 0) return `${diffHours}h`;
        return `${diffMins}min`;
    };

    const getStatusStyle = (status: VerificationStatus) => {
        switch (status) {
            case 'pending':
                return 'border-amber-400 text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-700';
            case 'in_review':
                return 'border-blue-400 text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-700';
            case 'flagged':
                return 'border-orange-400 text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950 dark:border-orange-700';
            case 'escalated':
                return 'border-red-400 text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950 dark:border-red-700';
            default:
                return 'border-gray-400 text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-900 dark:border-gray-600';
        }
    };

    const getRiskStyle = (risk: RiskLevel) => {
        switch (risk) {
            case 'low':
                return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950';
            case 'medium':
                return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950';
            case 'high':
                return 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-950';
            case 'critical':
                return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950';
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-4 rounded-xl cursor-pointer",
                "bg-white dark:bg-slate-900",
                "border border-slate-200 dark:border-slate-700"
            )}
        >
            {/* Avatar */}
            <img
                src={request.applicant.photoUrl}
                alt={request.applicant.firstName}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {request.applicant.lastName} {request.applicant.firstName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>{DOCUMENT_TYPE_LABELS[request.documentType]}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{getTimeAgo(request.requestedAt)}</span>
                </p>
            </div>

            {/* Risk Badge */}
            <div
                className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    getRiskStyle(request.riskLevel)
                )}
                title={RISK_LABELS[request.riskLevel]}
            >
                {request.riskLevel === 'critical' ? '!' : request.riskLevel.charAt(0).toUpperCase()}
            </div>

            {/* Status Badge */}
            <Badge
                variant="outline"
                className={cn(
                    'text-xs px-2.5 py-0.5 shrink-0 border rounded-full font-medium',
                    getStatusStyle(request.status)
                )}
            >
                {STATUS_LABELS[request.status]}
            </Badge>

            {/* Chevron */}
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        </div>
    );
};

const ControllerQueuePage = () => {
    const { toast } = useToast();

    // State
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all');
    const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            const allRequests = generateMockRequests();
            const pendingRequests = allRequests.filter(r =>
                ['pending', 'in_review', 'flagged', 'escalated'].includes(r.status)
            );
            setRequests(pendingRequests);
            setIsLoading(false);
        }, 500);
    }, []);

    const filteredRequests = useMemo(() => {
        let filtered = [...requests];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.applicant.firstName.toLowerCase().includes(query) ||
                r.applicant.lastName.toLowerCase().includes(query) ||
                r.id.toLowerCase().includes(query)
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(r => r.status === filterStatus);
        }

        if (filterRisk !== 'all') {
            filtered = filtered.filter(r => r.riskLevel === filterRisk);
        }

        // Sort by priority and risk
        filtered.sort((a, b) => {
            const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            const riskCompare = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
            if (riskCompare !== 0) return riskCompare;
            return a.priority - b.priority;
        });

        return filtered;
    }, [requests, searchQuery, filterStatus, filterRisk]);

    const handleViewRequest = (request: VerificationRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleDecision = (decision: VerificationDecision) => {
        setRequests(prev => prev.filter(r => r.id !== decision.requestId));

        const messages: Record<string, { title: string; description: string }> = {
            approve: { title: '✅ Demande approuvée', description: 'La demande a été approuvée.' },
            reject: { title: '❌ Demande rejetée', description: 'La demande a été rejetée.' },
            escalate: { title: '⬆️ Demande escaladée', description: 'Transférée au superviseur.' },
            request_info: { title: '📝 Infos demandées', description: 'Demande d\'informations envoyée.' }
        };

        toast(messages[decision.decision]);
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const activeFiltersCount = [filterStatus !== 'all', filterRisk !== 'all'].filter(Boolean).length;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        File d'attente
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {filteredRequests.length} demande(s) à traiter
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadRequests}
                    disabled={isLoading}
                    className={cn(
                        "gap-2",
                        "bg-white dark:bg-slate-900",
                        "border-slate-200 dark:border-slate-700",
                        "text-slate-700 dark:text-slate-200"
                    )}
                >
                    <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                    Actualiser
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="space-y-3 mb-4 shrink-0">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <Input
                            type="text"
                            placeholder="Rechercher par nom ou ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "pl-10",
                                "bg-white dark:bg-slate-900",
                                "border-slate-200 dark:border-slate-700",
                                "text-slate-900 dark:text-white",
                                "placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            )}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'gap-2',
                            "bg-white dark:bg-slate-900",
                            "border-slate-200 dark:border-slate-700",
                            "text-slate-700 dark:text-slate-200",
                            showFilters && 'bg-primary/10 border-primary dark:bg-primary/20'
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        Filtres
                        {activeFiltersCount > 0 && (
                            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-white">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className={cn(
                        "p-4 rounded-xl flex flex-wrap gap-4",
                        "bg-white dark:bg-slate-900",
                        "border border-slate-200 dark:border-slate-700"
                    )}>
                        {/* Status Filter */}
                        <div className="min-w-[150px]">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wider">
                                Statut
                            </label>
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as VerificationStatus | 'all')}
                                    className={cn(
                                        "w-full p-2.5 pr-8 rounded-lg text-sm appearance-none cursor-pointer",
                                        "bg-slate-50 dark:bg-slate-800",
                                        "border border-slate-200 dark:border-slate-700",
                                        "text-slate-900 dark:text-white"
                                    )}
                                >
                                    <option value="all">Tous</option>
                                    <option value="pending">{STATUS_LABELS.pending}</option>
                                    <option value="in_review">{STATUS_LABELS.in_review}</option>
                                    <option value="flagged">{STATUS_LABELS.flagged}</option>
                                    <option value="escalated">{STATUS_LABELS.escalated}</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Risk Filter */}
                        <div className="min-w-[150px]">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block uppercase tracking-wider">
                                Risque
                            </label>
                            <div className="relative">
                                <select
                                    value={filterRisk}
                                    onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
                                    className={cn(
                                        "w-full p-2.5 pr-8 rounded-lg text-sm appearance-none cursor-pointer",
                                        "bg-slate-50 dark:bg-slate-800",
                                        "border border-slate-200 dark:border-slate-700",
                                        "text-slate-900 dark:text-white"
                                    )}
                                >
                                    <option value="all">Tous</option>
                                    <option value="low">{RISK_LABELS.low}</option>
                                    <option value="medium">{RISK_LABELS.medium}</option>
                                    <option value="high">{RISK_LABELS.high}</option>
                                    <option value="critical">{RISK_LABELS.critical}</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterStatus('all');
                                    setFilterRisk('all');
                                }}
                                className="self-end text-xs text-slate-500 dark:text-slate-400"
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Queue Grid - 2 columns */}
            <div className="flex-1 min-h-0 overflow-auto">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold mb-2">Aucune demande en attente</p>
                        <p className="text-sm">Toutes les demandes ont été traitées</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {filteredRequests.map((request) => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onClick={() => handleViewRequest(request)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
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

export default ControllerQueuePage;
