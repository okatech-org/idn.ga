import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentCardProps {
    title: string;
    type: string;
    date: string;
    status: "Vérifié" | "En attente" | "Expiré" | "Rejeté";
    expiry: string | null;
    onClick?: () => void;
}

const DocumentCard = ({ title, type, date, status, expiry, onClick }: DocumentCardProps) => {
    const isExpiringSoon = expiry && new Date(expiry) < new Date(new Date().setMonth(new Date().getMonth() + 1));
    const isExpired = expiry && new Date(expiry) < new Date();

    let statusColor = "text-gray-500";
    let statusIcon = <Clock size={16} />;
    let statusBg = "bg-gray-100";

    if (status === "Vérifié") {
        statusColor = "text-green-600 dark:text-green-400";
        statusIcon = <CheckCircle size={16} />;
        statusBg = "bg-green-50 dark:bg-green-900/20";
    } else if (status === "En attente") {
        statusColor = "text-yellow-600 dark:text-yellow-400";
        statusIcon = <Clock size={16} />;
        statusBg = "bg-yellow-50 dark:bg-yellow-900/20";
    } else if (status === "Rejeté" || isExpired) {
        statusColor = "text-red-600 dark:text-red-400";
        statusIcon = <AlertCircle size={16} />;
        statusBg = "bg-red-50 dark:bg-red-900/20";
    }

    return (
        <div
            onClick={onClick}
            className="neu-raised p-4 rounded-xl flex items-center space-x-4 cursor-pointer hover:text-primary transition-all active:neu-inset group"
        >
            <div className={`p-3 rounded-xl shadow-sm ${statusBg} ${statusColor} group-hover:scale-110 transition-transform`}>
                <FileText size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">{title}</h3>
                <p className="text-xs text-muted-foreground font-medium truncate">
                    {type} • {expiry ? `Exp: ${expiry}` : date}
                </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
                <div className={`flex items-center space-x-1 ${statusColor}`}>
                    {statusIcon}
                    {/* <span className="text-[10px] font-bold uppercase">{status}</span> */}
                </div>
                {isExpiringSoon && !isExpired && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 shadow-sm">Exp. bientôt</Badge>
                )}
                {isExpired && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 shadow-sm">Expiré</Badge>
                )}
            </div>
        </div>
    );
};

export default DocumentCard;
