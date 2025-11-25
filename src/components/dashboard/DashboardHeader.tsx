import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
    userName: string;
    userRole: string;
    profileImage?: string;
}

const DashboardHeader = ({ userName, userRole, profileImage }: DashboardHeaderProps) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full neu-raised p-1 overflow-hidden border-2 border-primary/20">
                    <img
                        src={profileImage || "https://github.com/shadcn.png"}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
                <div>
                    <h2 className="font-bold text-xl leading-tight text-foreground">Bonjour, {userName}</h2>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full shadow-sm">
                        {userRole}
                    </span>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="neu-raised w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={() => navigate('/notifications')}
                    className="neu-raised w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors relative"
                >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
