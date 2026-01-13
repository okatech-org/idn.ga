import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileCheck,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
    Users,
    Timer,
    Target,
    ArrowRight,
    CalendarDays,
    AlertCircle,
    ChevronRight,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PerformanceChart } from '@/components/controller/PerformanceChart';
import {
    VerificationRequest,
    ControllerStats,
    DOCUMENT_TYPE_LABELS,
    RISK_COLORS,
    STATUS_LABELS
} from '@/types/controller';
import { cn } from '@/lib/utils';

// Mock data
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

const generateOverdueRequests = (): VerificationRequest[] => [
    {
        id: 'vr-overdue-001',
        applicant: {
            id: 'app-o001',
            firstName: 'Sarah',
            lastName: 'Kassa-Mapangou',
            dateOfBirth: '1995-02-14',
            placeOfBirth: 'Oyem',
            nationality: 'Gabonaise',
            gender: 'F',
            address: 'Quartier Zamaligué, Oyem',
            phone: '+241 66 12 34 56',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KassaMapangou'
        },
        documentType: 'cni',
        status: 'flagged',
        riskLevel: 'high',
        requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [],
        verifications: [],
        notes: [],
        source: 'online'
    },
    {
        id: 'vr-overdue-002',
        applicant: {
            id: 'app-o002',
            firstName: 'Clémentine',
            lastName: 'Ondo-Minko',
            dateOfBirth: '1998-12-01',
            placeOfBirth: 'Bitam',
            nationality: 'Gabonaise',
            gender: 'F',
            address: 'Avenue des Cocotiers, Bitam',
            phone: '+241 77 23 45 67',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OndoMinko'
        },
        documentType: 'passport',
        status: 'escalated',
        riskLevel: 'critical',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        documents: [],
        verifications: [],
        notes: [],
        source: 'online'
    },
    {
        id: 'vr-overdue-003',
        applicant: {
            id: 'app-o003',
            firstName: 'Patrick',
            lastName: 'Mba-Essono',
            dateOfBirth: '1988-06-22',
            placeOfBirth: 'Franceville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: 'Rue du Commerce, Franceville',
            phone: '+241 62 34 56 78',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MbaEssono'
        },
        documentType: 'birth_cert',
        status: 'pending',
        riskLevel: 'medium',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 2,
        documents: [],
        verifications: [],
        notes: [],
        source: 'in_person'
    }
];

const generateTodayRequests = (): VerificationRequest[] => [
    {
        id: 'vr-today-001',
        applicant: {
            id: 'app-t001',
            firstName: 'Jean-Pierre',
            lastName: 'Moussavou',
            dateOfBirth: '1985-03-15',
            placeOfBirth: 'Libreville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: 'Boulevard Triomphal, Libreville',
            phone: '+241 74 45 67 89',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussavou'
        },
        documentType: 'cni',
        status: 'pending',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 3,
        documents: [],
        verifications: [],
        notes: [],
        source: 'online'
    },
    {
        id: 'vr-today-002',
        applicant: {
            id: 'app-t002',
            firstName: 'Marie',
            lastName: 'Obame-Nguema',
            dateOfBirth: '1990-07-22',
            placeOfBirth: 'Port-Gentil',
            nationality: 'Gabonaise',
            gender: 'F',
            address: 'Rue de la Plage, Port-Gentil',
            phone: '+241 65 56 78 90',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ObameNguema'
        },
        documentType: 'passport',
        status: 'in_review',
        riskLevel: 'medium',
        requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        priority: 2,
        documents: [],
        verifications: [],
        notes: [],
        source: 'in_person'
    },
    {
        id: 'vr-today-003',
        applicant: {
            id: 'app-t003',
            firstName: 'Paul',
            lastName: 'Bongo-Ondimba',
            dateOfBirth: '1978-11-30',
            placeOfBirth: 'Franceville',
            nationality: 'Gabonaise',
            gender: 'M',
            address: 'Avenue de l\'Indépendance, Franceville',
            phone: '+241 77 67 89 01',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BongoOndimba'
        },
        documentType: 'driving',
        status: 'pending',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        priority: 4,
        documents: [],
        verifications: [],
        notes: [],
        source: 'agent'
    },
    {
        id: 'vr-today-004',
        applicant: {
            id: 'app-t004',
            firstName: 'Emmanuel',
            lastName: 'Ndong-Mba',
            dateOfBirth: '1982-08-05',
            placeOfBirth: 'Lambaréné',
            nationality: 'Gabonaise',
            gender: 'M',
            address: 'Quartier Isaac, Lambaréné',
            phone: '+241 66 78 90 12',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NdongMba'
        },
        documentType: 'cni',
        status: 'pending',
        riskLevel: 'low',
        requestedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        priority: 3,
        documents: [],
        verifications: [],
        notes: [],
        source: 'online'
    }
];

// Compact Request Card Component
const CompactRequestCard = ({
    request,
    isOverdue = false,
    onClick
}: {
    request: VerificationRequest;
    isOverdue?: boolean;
    onClick: () => void;
}) => {
    const riskColors = RISK_COLORS[request.riskLevel];

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

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                isOverdue
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-muted/30 hover:bg-muted/50'
            )}
        >
            {/* Avatar */}
            <div className="relative">
                <img
                    src={request.applicant.photoUrl}
                    alt={request.applicant.firstName}
                    className="w-10 h-10 rounded-full bg-muted"
                />
                {isOverdue && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                    {request.applicant.lastName} {request.applicant.firstName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{DOCUMENT_TYPE_LABELS[request.documentType]}</span>
                    <span>•</span>
                    <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                        {getTimeAgo(request.requestedAt)}
                    </span>
                </div>
            </div>

            {/* Risk & Status */}
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        riskColors.bg, riskColors.text
                    )}
                >
                    {request.riskLevel === 'critical' ? '!' : request.riskLevel.charAt(0).toUpperCase()}
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        'text-[10px]',
                        request.status === 'pending' && 'border-yellow-500 text-yellow-600',
                        request.status === 'in_review' && 'border-blue-500 text-blue-600',
                        request.status === 'flagged' && 'border-orange-500 text-orange-600',
                        request.status === 'escalated' && 'border-red-500 text-red-600'
                    )}
                >
                    {STATUS_LABELS[request.status]}
                </Badge>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
    );
};

const ControllerDashboard = () => {
    const navigate = useNavigate();
    const [stats] = useState<ControllerStats>(generateMockStats());
    const [overdueRequests] = useState<VerificationRequest[]>(generateOverdueRequests());
    const [todayRequests] = useState<VerificationRequest[]>(generateTodayRequests());

    const handleViewRequest = (request: VerificationRequest) => {
        navigate('/controller/queue', { state: { selectedRequestId: request.id } });
    };

    const statCards = [
        {
            label: 'En Attente',
            value: stats.pendingCount,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
        },
        {
            label: 'Approuvés',
            value: stats.approvedToday,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            trend: '+12%'
        },
        {
            label: 'Rejetés',
            value: stats.rejectedToday,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/30'
        },
        {
            label: 'Temps Moyen',
            value: `${stats.averageProcessingTime}min`,
            icon: Timer,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            trend: '-5%'
        }
    ];

    return (
        <div className="h-full overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <FileCheck className="w-7 h-7 text-primary" />
                        Tableau de bord
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Vue d'ensemble des vérifications d'identité
                    </p>
                </div>
                <Button onClick={() => navigate('/controller/queue')} className="gap-2">
                    Traiter les demandes
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="neu-raised p-4 rounded-xl"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            {stat.trend && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend.startsWith('+')
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue Requests */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="neu-raised p-5 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Demandes en retard</h3>
                                <p className="text-xs text-muted-foreground">Délai de traitement dépassé</p>
                            </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                            {overdueRequests.length} urgent(s)
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        {overdueRequests.map((request) => (
                            <CompactRequestCard
                                key={request.id}
                                request={request}
                                isOverdue
                                onClick={() => handleViewRequest(request)}
                            />
                        ))}
                    </div>

                    {overdueRequests.length > 3 && (
                        <Button
                            variant="ghost"
                            className="w-full mt-3 text-sm"
                            onClick={() => navigate('/controller/queue?filter=overdue')}
                        >
                            Voir tous les retards ({overdueRequests.length})
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </motion.div>

                {/* Today's Requests */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="neu-raised p-5 rounded-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <CalendarDays className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Demandes du jour</h3>
                                <p className="text-xs text-muted-foreground">Reçues aujourd'hui</p>
                            </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                            {todayRequests.length} nouvelle(s)
                        </Badge>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {todayRequests.map((request) => (
                            <CompactRequestCard
                                key={request.id}
                                request={request}
                                onClick={() => handleViewRequest(request)}
                            />
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full mt-3 text-sm"
                        onClick={() => navigate('/controller/queue')}
                    >
                        Voir toute la file d'attente
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </motion.div>
            </div>

            {/* Performance Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="neu-raised p-5 rounded-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Performance hebdomadaire</h3>
                            <p className="text-xs text-muted-foreground">Activité des 7 derniers jours</p>
                        </div>
                    </div>
                </div>
                <PerformanceChart />
            </motion.div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Ma file', value: stats.myPendingCount, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
                    { label: 'Mes traitements', value: stats.myProcessedToday, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Signalés', value: stats.flaggedCount, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
                    { label: 'En cours', value: stats.inReviewCount, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }
                ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="flex items-center gap-3 p-4 neu-raised rounded-xl"
                    >
                        <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{item.value}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ControllerDashboard;
