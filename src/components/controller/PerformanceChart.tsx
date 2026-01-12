import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceData {
    day: string;
    approved: number;
    rejected: number;
    pending: number;
}

interface PerformanceChartProps {
    data?: PerformanceData[];
    title?: string;
}

const defaultData: PerformanceData[] = [
    { day: 'Lun', approved: 38, rejected: 2, pending: 5 },
    { day: 'Mar', approved: 42, rejected: 4, pending: 8 },
    { day: 'Mer', approved: 35, rejected: 1, pending: 12 },
    { day: 'Jeu', approved: 48, rejected: 3, pending: 6 },
    { day: 'Ven', approved: 52, rejected: 5, pending: 4 },
    { day: 'Sam', approved: 28, rejected: 1, pending: 2 },
    { day: 'Dim', approved: 15, rejected: 0, pending: 1 }
];

export const PerformanceChart = ({ data = defaultData, title }: PerformanceChartProps) => {
    const maxValue = Math.max(...data.map(d => d.approved + d.rejected + d.pending));

    const totalApproved = data.reduce((sum, d) => sum + d.approved, 0);
    const totalRejected = data.reduce((sum, d) => sum + d.rejected, 0);
    const totalPending = data.reduce((sum, d) => sum + d.pending, 0);
    const total = totalApproved + totalRejected + totalPending;

    const approvalRate = total > 0 ? Math.round((totalApproved / (totalApproved + totalRejected)) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 dark:text-green-400">Approuvés</span>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{totalApproved}</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-red-600 dark:text-red-400">Rejetés</span>
                        <TrendingDown className="w-3 h-3 text-red-500" />
                    </div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">{totalRejected}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 dark:text-blue-400">Taux d'approbation</span>
                    </div>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{approvalRate}%</p>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="h-40 flex items-end justify-between gap-2 px-2">
                {data.map((item, index) => {
                    const height = maxValue > 0 ? ((item.approved + item.rejected) / maxValue) * 100 : 0;
                    const approvedHeight = (item.approved / maxValue) * 100;
                    const rejectedHeight = (item.rejected / maxValue) * 100;

                    return (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full h-32 flex flex-col-reverse relative rounded-t-md overflow-hidden">
                                {/* Approved bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${approvedHeight}%` }}
                                    transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
                                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm"
                                />
                                {/* Rejected bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${rejectedHeight}%` }}
                                    transition={{ delay: index * 0.05 + 0.1, duration: 0.5, ease: 'easeOut' }}
                                    className="w-full bg-gradient-to-t from-red-500 to-red-400"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">{item.day}</span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-green-500 to-green-400" />
                    <span className="text-xs text-muted-foreground">Approuvés</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-red-500 to-red-400" />
                    <span className="text-xs text-muted-foreground">Rejetés</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;
