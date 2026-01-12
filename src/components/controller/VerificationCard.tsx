import { motion } from 'framer-motion';
import {
    User,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    Flag,
    ChevronRight,
    Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    VerificationRequest,
    DOCUMENT_TYPE_LABELS,
    STATUS_LABELS,
    RISK_COLORS,
    RISK_LABELS
} from '@/types/controller';
import { cn } from '@/lib/utils';

interface VerificationCardProps {
    request: VerificationRequest;
    onView: (request: VerificationRequest) => void;
    onQuickApprove?: (request: VerificationRequest) => void;
    onQuickReject?: (request: VerificationRequest) => void;
    isCompact?: boolean;
}

export const VerificationCard = ({
    request,
    onView,
    onQuickApprove,
    onQuickReject,
    isCompact = false
}: VerificationCardProps) => {
    const riskColors = RISK_COLORS[request.riskLevel];

    const getStatusIcon = () => {
        switch (request.status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'flagged':
                return <Flag className="w-4 h-4 text-orange-500" />;
            case 'in_review':
                return <Eye className="w-4 h-4 text-blue-500" />;
            case 'escalated':
                return <AlertTriangle className="w-4 h-4 text-purple-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusColor = () => {
        switch (request.status) {
            case 'approved':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'flagged':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'in_review':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'escalated':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        return `Il y a ${Math.floor(seconds / 86400)}j`;
    };

    if (isCompact) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => onView(request)}
                className="neu-raised p-4 rounded-xl cursor-pointer group transition-all"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-background">
                            <img
                                src={request.applicant.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.applicant.lastName}`}
                                alt={request.applicant.lastName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-foreground">
                                {request.applicant.firstName} {request.applicant.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {DOCUMENT_TYPE_LABELS[request.documentType]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', riskColors.bg, riskColors.text)}>
                            {RISK_LABELS[request.riskLevel]}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -3 }}
            className={cn(
                "neu-raised p-5 rounded-2xl cursor-pointer group transition-all border-l-4",
                riskColors.border
            )}
            onClick={() => onView(request)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted border-2 border-background shadow-md">
                            <img
                                src={request.applicant.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.applicant.lastName}`}
                                alt={request.applicant.lastName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {request.priority === 1 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {request.applicant.firstName} {request.applicant.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{DOCUMENT_TYPE_LABELS[request.documentType]}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Badge className={cn('flex items-center gap-1', getStatusColor())}>
                        {getStatusIcon()}
                        <span>{STATUS_LABELS[request.status]}</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {timeSince(request.requestedAt)}
                    </span>
                </div>
            </div>

            {/* Info rapide */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-xl">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Né(e) le</p>
                    <p className="text-sm font-medium">{new Date(request.applicant.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Lieu</p>
                    <p className="text-sm font-medium truncate">{request.applicant.placeOfBirth}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Source</p>
                    <p className="text-sm font-medium capitalize">{request.source === 'online' ? 'En ligne' : request.source === 'in_person' ? 'Guichet' : 'Agent'}</p>
                </div>
            </div>

            {/* Niveau de risque et vérifications */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Shield className={cn('w-4 h-4', riskColors.text)} />
                    <span className={cn('text-sm font-medium', riskColors.text)}>
                        Risque {RISK_LABELS[request.riskLevel]}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {request.verifications.slice(0, 3).map((v, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center',
                                v.result === 'pass' ? 'bg-green-100 text-green-600' :
                                    v.result === 'fail' ? 'bg-red-100 text-red-600' :
                                        'bg-yellow-100 text-yellow-600'
                            )}
                        >
                            {v.result === 'pass' ? <CheckCircle className="w-3 h-3" /> :
                                v.result === 'fail' ? <XCircle className="w-3 h-3" /> :
                                    <Clock className="w-3 h-3" />}
                        </div>
                    ))}
                    {request.verifications.length > 3 && (
                        <span className="text-xs text-muted-foreground ml-1">
                            +{request.verifications.length - 3}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions rapides */}
            {(request.status === 'pending' || request.status === 'in_review') && (
                <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 dark:border-green-800"
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickApprove?.(request);
                        }}
                    >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 dark:border-red-800"
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickReject?.(request);
                        }}
                    >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-muted/50 hover:bg-muted"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(request);
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

export default VerificationCard;
