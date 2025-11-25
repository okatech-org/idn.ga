import { LucideIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
    type: "security" | "document" | "ai" | "cv" | "system";
    icon: LucideIcon;
    title: string;
    message: string;
    time: string;
    read: boolean;
    onRead?: () => void;
    onAction?: () => void;
    actionLabel?: string;
}

const NotificationItem = ({
    type,
    icon: Icon,
    title,
    message,
    time,
    read,
    onRead,
    onAction,
    actionLabel
}: NotificationItemProps) => {

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "security": return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
            case "document": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
            case "ai": return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
            case "cv": return "text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400";
            default: return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    return (
        <div className={cn(
            "p-4 rounded-2xl flex items-start space-x-4 transition-all duration-300 group relative overflow-hidden",
            read
                ? "bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
                : "neu-raised bg-background"
        )}>
            {/* Unread Indicator */}
            {!read && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}

            <div className={cn("p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", getTypeStyles(type))}>
                <Icon size={20} />
            </div>

            <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className={cn("text-sm font-bold truncate pr-6", read ? "text-muted-foreground" : "text-foreground")}>
                        {title}
                    </h3>
                    <span className="text-[10px] font-medium text-muted-foreground/70 whitespace-nowrap">{time}</span>
                </div>
                <p className={cn("text-xs leading-relaxed mb-3", read ? "text-muted-foreground/80" : "text-foreground/80")}>
                    {message}
                </p>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    {!read && onRead && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onRead(); }}
                            className="h-7 px-2 text-[10px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        >
                            <Check size={12} className="mr-1" /> Marquer comme lu
                        </Button>
                    )}
                    {onAction && actionLabel && (
                        <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onAction(); }}
                            className="h-7 px-3 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                        >
                            {actionLabel}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
