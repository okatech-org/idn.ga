import { motion } from "framer-motion";
import {
    Bell,
    Settings,
    Shield,
    CheckCircle2,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
    userName: string;
    userEmail?: string;
    photoUrl?: string;
    verificationLevel?: number;
    notificationCount?: number;
    onNotificationClick?: () => void;
    onSettingsClick?: () => void;
}

export default function ProfileHeader({
    userName,
    userEmail = "jean.dupont@example.com",
    photoUrl = "https://github.com/shadcn.png",
    verificationLevel = 3,
    notificationCount = 3,
    onNotificationClick,
    onSettingsClick
}: ProfileHeaderProps) {
    const navigate = useNavigate();

    const stats = [
        { label: "Documents", value: "12", color: "text-blue-600" },
        { label: "Services", value: "4", color: "text-green-600" },
        { label: "Score CV", value: "78%", color: "text-amber-600" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-foreground">Mon Profil</h1>
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        onClick={onNotificationClick || (() => navigate("/notifications"))}
                        className={cn(
                            "relative p-2.5 rounded-xl transition-all",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10",
                            "hover:border-primary/30 hover:scale-105"
                        )}
                    >
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                                {notificationCount > 9 ? "9+" : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Settings */}
                    <button
                        onClick={onSettingsClick || (() => navigate("/settings"))}
                        className={cn(
                            "p-2.5 rounded-xl transition-all",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-200/60 dark:border-white/10",
                            "hover:border-primary/30 hover:scale-105"
                        )}
                    >
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Profile Card */}
            <div className={cn(
                "p-5 rounded-2xl",
                "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                "border border-slate-200/60 dark:border-white/10"
            )}>
                <div className="flex items-center gap-4">
                    {/* Profile Photo */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
                            <img
                                src={photoUrl}
                                alt={userName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Verification Badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg text-foreground truncate">{userName}</h2>
                        <p className="text-sm text-muted-foreground truncate">{userEmail}</p>

                        {/* Verification Level */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-full">
                                <Shield className="w-3 h-3 text-green-600" />
                                <span className="text-[10px] font-semibold text-green-600">
                                    Niveau {verificationLevel}
                                </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Identité vérifiée</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <button
                        onClick={() => navigate("/settings")}
                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
