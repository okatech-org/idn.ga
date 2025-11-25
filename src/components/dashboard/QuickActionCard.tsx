import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
    icon: LucideIcon;
    label: string;
    subLabel: string;
    onClick?: () => void;
    colorClass?: string;
    bgClass?: string;
    className?: string;
}

const QuickActionCard = ({
    icon: Icon,
    label,
    subLabel,
    onClick,
    colorClass = "text-primary",
    bgClass = "bg-primary/10",
    className = ""
}: QuickActionCardProps) => {
    return (
        <div
            className={`neu-raised p-5 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:text-primary transition-all active:neu-inset ${className}`}
            onClick={onClick}
        >
            <div className={`p-3 rounded-2xl shadow-sm ${bgClass} ${colorClass}`}>
                <Icon size={28} />
            </div>
            <div className="text-center">
                <span className="font-bold text-sm block text-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{subLabel}</span>
            </div>
        </div>
    );
};

export default QuickActionCard;
