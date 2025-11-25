import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface VerificationQueueItemProps {
    name: string;
    docType: string;
    time: string;
    avatarSeed: string;
    onApprove: () => void;
    onReject: () => void;
}

const VerificationQueueItem = ({ name, docType, time, avatarSeed, onApprove, onReject }: VerificationQueueItemProps) => {
    return (
        <div className="neu-raised p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-transform cursor-pointer group">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full overflow-hidden border-2 border-background shadow-sm group-hover:border-primary/50 transition-colors">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="font-bold text-sm text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{docType}</p>
                </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
                <span className="text-[10px] text-muted-foreground font-medium">{time}</span>
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onReject(); }}
                        className="h-7 w-7 p-0 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                    >
                        <X size={14} />
                    </Button>
                    <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onApprove(); }}
                        className="h-7 w-7 p-0 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                    >
                        <Check size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VerificationQueueItem;
