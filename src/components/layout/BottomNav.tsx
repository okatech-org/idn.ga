import { Home, FileText, QrCode, User, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, label: "Accueil", path: "/dashboard" },
        { icon: FileText, label: "Documents", path: "/documents" },
        { icon: QrCode, label: "QR Code", path: "/id-card", isCenter: true },
        { icon: User, label: "CV", path: "/cv" },
        { icon: Settings, label: "Paramètres", path: "/settings" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-safe pt-2 z-40">
            <div className="flex justify-between items-end max-w-md mx-auto relative">
                {navItems.map((item) => {
                    const active = isActive(item.path);

                    if (item.isCenter) {
                        return (
                            <div key={item.path} className="relative -top-6">
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={cn(
                                        "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
                                        active ? "bg-primary text-white" : "bg-primary text-white"
                                    )}
                                >
                                    <item.icon size={28} />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center w-16 py-2 space-y-1 transition-colors",
                                active ? "text-primary" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
