import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    color: string;
    bgColor: string;
}

const AdminStatCard = ({ icon: Icon, label, value, trend, trendUp, color, bgColor }: AdminStatCardProps) => {
    return (
        <div className="neu-raised p-5 rounded-2xl flex flex-col justify-between h-36 hover:text-primary transition-colors cursor-default group">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${bgColor} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <h4 className="text-2xl font-bold text-foreground">{value}</h4>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
            </div>
        </div>
    );
};

export default AdminStatCard;
