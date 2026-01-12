import { useState, useMemo } from 'react';
import {
    History,
    Download,
    Calendar,
    Search,
    Filter,
    ChevronRight,
    CheckCircle,
    XCircle,
    ChevronDown,
    FileText
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
    DOCUMENT_TYPE_LABELS
} from '@/types/controller';
import { cn } from '@/lib/utils';

// Mock historical data
const generateHistoricalRequests = (): VerificationRequest[] => [
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
        documents: [],
        verifications: [],
        notes: [],
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
        documents: [],
        verifications: [],
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
        documents: [],
        verifications: [],
        notes: [],
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
        documents: [],
        verifications: [],
        notes: [],
        source: 'agent'
    },
    {
        id: 'vr-hist-005',
        applicant: {
            id: 'app-h005',
            firstName: 'Roger',
            lastName: 'Ntoutoume',
            dateOfBirth: '1970-03-10',
            placeOfBirth: 'Libreville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: '20 Rue du Port, Libreville',
            phone: '+241 77 55 44 33',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ntoutoume'
        },
        documentType: 'driving',
        status: 'approved',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
        priority: 3,
        documents: [],
        verifications: [],
        notes: [],
        source: 'in_person'
    },
    {
        id: 'vr-hist-006',
        applicant: {
            id: 'app-h006',
            firstName: 'Jeanne',
            lastName: 'Oyono-Mba',
            dateOfBirth: '1994-11-08',
            placeOfBirth: 'Bitam',
            nationality: 'Gabonaise',
            gender: 'F',
            address: '33 Avenue de la Paix, Bitam',
            phone: '+241 65 22 33 44',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OyonoMba'
        },
        documentType: 'passport',
        status: 'rejected',
        riskLevel: 'critical',
        requestedAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [],
        verifications: [],
        notes: [],
        source: 'online'
    }
];

// Simple History Card Component - No effects
const HistoryCard = ({
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
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `il y a ${diffDays}j`;
        return `il y a ${diffHours}h`;
    };

    const isApproved = request.status === 'approved';
    const isRejected = request.status === 'rejected';

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

            {/* Status Badge */}
            {isApproved && (
                <Badge className={cn(
                    "text-xs px-2.5 py-0.5 shrink-0 rounded-full font-medium gap-1",
                    "bg-green-100 text-green-700 border border-green-300",
                    "dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                )}>
                    <CheckCircle className="w-3 h-3" />
                    Approuvé
                </Badge>
            )}
            {isRejected && (
                <Badge className={cn(
                    "text-xs px-2.5 py-0.5 shrink-0 rounded-full font-medium gap-1",
                    "bg-red-100 text-red-700 border border-red-300",
                    "dark:bg-red-950 dark:text-red-300 dark:border-red-700"
                )}>
                    <XCircle className="w-3 h-3" />
                    Rejeté
                </Badge>
            )}

            {/* Chevron */}
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        </div>
    );
};

const ControllerHistoryPage = () => {
    const { toast } = useToast();

    // State
    const [requests] = useState<VerificationRequest[]>(generateHistoricalRequests());
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'rejected'>('all');

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

        // Sort by date (most recent first)
        filtered.sort((a, b) =>
            new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );

        return filtered;
    }, [requests, searchQuery, filterStatus]);

    const handleViewRequest = (request: VerificationRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        toast({
            title: '📊 Export en cours',
            description: 'L\'historique sera téléchargé au format CSV.'
        });
    };

    // Stats
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Historique
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {filteredRequests.length} demande(s) traitée(s)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "gap-2",
                            "bg-white dark:bg-slate-900",
                            "border-slate-200 dark:border-slate-700",
                            "text-slate-700 dark:text-slate-200"
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        Période
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "gap-2",
                            "bg-white dark:bg-slate-900",
                            "border-slate-200 dark:border-slate-700",
                            "text-slate-700 dark:text-slate-200"
                        )}
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="flex gap-3 mb-4 shrink-0">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    "bg-green-50 dark:bg-green-950",
                    "border border-green-200 dark:border-green-800"
                )}>
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {approvedCount} Approuvé(s)
                    </span>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    "bg-red-50 dark:bg-red-950",
                    "border border-red-200 dark:border-red-800"
                )}>
                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {rejectedCount} Rejeté(s)
                    </span>
                </div>
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
                                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'approved' | 'rejected')}
                                    className={cn(
                                        "w-full p-2.5 pr-8 rounded-lg text-sm appearance-none cursor-pointer",
                                        "bg-slate-50 dark:bg-slate-800",
                                        "border border-slate-200 dark:border-slate-700",
                                        "text-slate-900 dark:text-white"
                                    )}
                                >
                                    <option value="all">Tous</option>
                                    <option value="approved">Approuvés</option>
                                    <option value="rejected">Rejetés</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {filterStatus !== 'all' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterStatus('all')}
                                className="self-end text-xs text-slate-500 dark:text-slate-400"
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* History Grid - 2 columns */}
            <div className="flex-1 min-h-0 overflow-auto">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold mb-2">Aucune demande trouvée</p>
                        <p className="text-sm">Modifiez vos critères de recherche</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {filteredRequests.map((request) => (
                            <HistoryCard
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
                onDecision={() => { }}
            />
        </div>
    );
};

export default ControllerHistoryPage;
