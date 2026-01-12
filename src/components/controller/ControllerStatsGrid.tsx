import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
    Users,
    Timer,
    Target
} from 'lucide-react';
import { ControllerStats } from '@/types/controller';

interface ControllerStatsGridProps {
    stats: ControllerStats;
}

export const ControllerStatsGrid = ({ stats }: ControllerStatsGridProps) => {
    const statCards = [
        {
            label: 'En Attente',
            value: stats.pendingCount,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
            trend: null
        },
        {
            label: 'En Cours',
            value: stats.inReviewCount,
            icon: Timer,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            trend: null
        },
        {
            label: 'Approuvés Aujourd\'hui',
            value: stats.approvedToday,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            trend: '+12%'
        },
        {
            label: 'Rejetés Aujourd\'hui',
            value: stats.rejectedToday,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            trend: null
        },
        {
            label: 'Signalés',
            value: stats.flaggedCount,
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            trend: null
        },
        {
            label: 'Temps Moyen',
            value: `${stats.averageProcessingTime}min`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            trend: '-5%'
        },
        {
            label: 'Mes Traitements',
            value: stats.myProcessedToday,
            icon: Target,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            trend: null
        },
        {
            label: 'Ma File',
            value: stats.myPendingCount,
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
            trend: null
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="neu-raised p-4 rounded-xl hover:shadow-neo-md transition-all group"
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
                    <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default ControllerStatsGrid;
