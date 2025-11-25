import { Smartphone, Laptop, LogOut } from "lucide-react";

interface SessionItemProps {
    device: string;
    location: string;
    lastActive: string;
    isActive?: boolean;
    type: "mobile" | "desktop";
    onRevoke?: () => void;
}

const SessionItem = ({ device, location, lastActive, isActive, type, onRevoke }: SessionItemProps) => {
    const Icon = type === "mobile" ? Smartphone : Laptop;

    return (
        <div className={`flex items-center justify-between ${!isActive ? "opacity-70" : ""}`}>
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "neu-inset text-primary" : "neu-inset text-muted-foreground"}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="font-bold text-sm text-foreground">{device}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        {lastActive} • {location}
                    </p>
                </div>
            </div>
            {!isActive && onRevoke && (
                <button
                    onClick={onRevoke}
                    className="neu-raised w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:text-destructive/80 transition-colors active:neu-inset"
                >
                    <LogOut size={14} />
                </button>
            )}
        </div>
    );
};

export default SessionItem;
