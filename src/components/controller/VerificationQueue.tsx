import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    SortAsc,
    SortDesc,
    RefreshCw,
    ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    VerificationRequest,
    DocumentType,
    VerificationStatus,
    RiskLevel,
    DOCUMENT_TYPE_LABELS,
    STATUS_LABELS,
    RISK_LABELS
} from '@/types/controller';
import { VerificationCard } from './VerificationCard';
import { cn } from '@/lib/utils';

interface VerificationQueueProps {
    requests: VerificationRequest[];
    onViewRequest: (request: VerificationRequest) => void;
    onQuickApprove: (request: VerificationRequest) => void;
    onQuickReject: (request: VerificationRequest) => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

type SortField = 'date' | 'priority' | 'risk' | 'name';
type SortOrder = 'asc' | 'desc';

export const VerificationQueue = ({
    requests,
    onViewRequest,
    onQuickApprove,
    onQuickReject,
    onRefresh,
    isLoading = false
}: VerificationQueueProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all');
    const [filterDocType, setFilterDocType] = useState<DocumentType | 'all'>('all');
    const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
    const [sortField, setSortField] = useState<SortField>('priority');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const filteredAndSortedRequests = useMemo(() => {
        let filtered = [...requests];

        // Recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.applicant.firstName.toLowerCase().includes(query) ||
                r.applicant.lastName.toLowerCase().includes(query) ||
                r.applicant.identificationNumber?.toLowerCase().includes(query) ||
                r.id.toLowerCase().includes(query)
            );
        }

        // Filtres
        if (filterStatus !== 'all') {
            filtered = filtered.filter(r => r.status === filterStatus);
        }
        if (filterDocType !== 'all') {
            filtered = filtered.filter(r => r.documentType === filterDocType);
        }
        if (filterRisk !== 'all') {
            filtered = filtered.filter(r => r.riskLevel === filterRisk);
        }

        // Tri
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
                    break;
                case 'priority':
                    comparison = a.priority - b.priority;
                    break;
                case 'risk':
                    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
                    break;
                case 'name':
                    comparison = (a.applicant.lastName + a.applicant.firstName)
                        .localeCompare(b.applicant.lastName + b.applicant.firstName);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [requests, searchQuery, filterStatus, filterDocType, filterRisk, sortField, sortOrder]);

    const statusOptions: { value: VerificationStatus | 'all'; label: string }[] = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'pending', label: STATUS_LABELS.pending },
        { value: 'in_review', label: STATUS_LABELS.in_review },
        { value: 'flagged', label: STATUS_LABELS.flagged },
        { value: 'escalated', label: STATUS_LABELS.escalated }
    ];

    const docTypeOptions: { value: DocumentType | 'all'; label: string }[] = [
        { value: 'all', label: 'Tous les documents' },
        ...Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
            value: value as DocumentType,
            label
        }))
    ];

    const riskOptions: { value: RiskLevel | 'all'; label: string }[] = [
        { value: 'all', label: 'Tous les risques' },
        ...Object.entries(RISK_LABELS).map(([value, label]) => ({
            value: value as RiskLevel,
            label
        }))
    ];

    const activeFiltersCount = [
        filterStatus !== 'all',
        filterDocType !== 'all',
        filterRisk !== 'all'
    ].filter(Boolean).length;

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Rechercher par nom, ID ou numéro d'identification..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'gap-2',
                            showFilters && 'bg-primary/10 border-primary'
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

                    <Button
                        variant="outline"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="neu-raised p-4 rounded-xl space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                        Statut
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value as VerificationStatus | 'all')}
                                            className="w-full p-2 pr-8 rounded-lg border border-border bg-background text-sm appearance-none cursor-pointer"
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                {/* Document Type Filter */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                        Type de document
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filterDocType}
                                            onChange={(e) => setFilterDocType(e.target.value as DocumentType | 'all')}
                                            className="w-full p-2 pr-8 rounded-lg border border-border bg-background text-sm appearance-none cursor-pointer"
                                        >
                                            {docTypeOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                {/* Risk Filter */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                        Niveau de risque
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={filterRisk}
                                            onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
                                            className="w-full p-2 pr-8 rounded-lg border border-border bg-background text-sm appearance-none cursor-pointer"
                                        >
                                            {riskOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="flex gap-2">
                                    <span className="text-xs text-muted-foreground">Trier par:</span>
                                    {[
                                        { field: 'priority' as SortField, label: 'Priorité' },
                                        { field: 'date' as SortField, label: 'Date' },
                                        { field: 'risk' as SortField, label: 'Risque' },
                                        { field: 'name' as SortField, label: 'Nom' }
                                    ].map(sort => (
                                        <Button
                                            key={sort.field}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSort(sort.field)}
                                            className={cn(
                                                'h-7 px-2 text-xs gap-1',
                                                sortField === sort.field && 'bg-primary/10 text-primary'
                                            )}
                                        >
                                            {sort.label}
                                            {sortField === sort.field && (
                                                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                                            )}
                                        </Button>
                                    ))}
                                </div>

                                {activeFiltersCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setFilterStatus('all');
                                            setFilterDocType('all');
                                            setFilterRisk('all');
                                        }}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Réinitialiser les filtres
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filteredAndSortedRequests.length} demande(s) trouvée(s)</span>
                {searchQuery && (
                    <span>Recherche: "{searchQuery}"</span>
                )}
            </div>

            {/* Queue List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredAndSortedRequests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 text-muted-foreground"
                        >
                            <p className="text-lg font-medium mb-2">Aucune demande trouvée</p>
                            <p className="text-sm">Modifiez vos filtres ou attendez de nouvelles demandes</p>
                        </motion.div>
                    ) : (
                        filteredAndSortedRequests.map((request, index) => (
                            <motion.div
                                key={request.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <VerificationCard
                                    request={request}
                                    onView={onViewRequest}
                                    onQuickApprove={onQuickApprove}
                                    onQuickReject={onQuickReject}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VerificationQueue;
