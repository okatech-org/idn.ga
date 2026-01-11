import { useNavigate } from "react-router-dom";
import { User, Shield, Briefcase, Plane, ArrowRight, Info, Target, FileText, ArrowLeft, Moon, Sun, Languages, Zap, Globe, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage, languages } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import sceauGabon from "@/assets/sceau_gabon.png";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DemoPage = () => {
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const personas = [
        {
            id: "citizen",
            name: t("citizen_name"),
            role: t("citizen_role"),
            status: t("citizen_status"),
            objective: t("citizen_objective"),
            context: t("citizen_context"),
            icon: User,
            gradient: "from-green-500 to-emerald-600",
            path: "/dashboard"
        },
        {
            id: "resident",
            name: t("resident_name"),
            role: t("resident_role"),
            status: t("resident_status"),
            objective: t("resident_objective"),
            context: t("resident_context"),
            icon: Briefcase,
            gradient: "from-blue-500 to-indigo-600",
            path: "/dashboard"
        },
        {
            id: "tourist",
            name: t("tourist_name"),
            role: t("tourist_role"),
            status: t("tourist_status"),
            objective: t("tourist_objective"),
            context: t("tourist_context"),
            icon: Plane,
            gradient: "from-yellow-500 to-amber-600",
            path: "/dashboard"
        },
        {
            id: "developer",
            name: t("developer_name"),
            role: t("developer_role"),
            status: t("developer_status"),
            objective: t("developer_objective"),
            context: t("developer_context"),
            icon: Code,
            gradient: "from-purple-500 to-violet-600",
            path: "/developer"
        },
        {
            id: "admin",
            name: t("admin_name"),
            role: t("admin_role"),
            status: t("admin_status"),
            objective: t("admin_objective"),
            context: t("admin_context"),
            icon: Shield,
            gradient: "from-red-500 to-rose-600",
            path: "/admin"
        },
        {
            id: "controller",
            name: t("controller_name"),
            role: t("controller_role"),
            status: t("controller_status"),
            objective: t("controller_objective"),
            context: t("controller_context"),
            icon: Shield,
            gradient: "from-pink-500 to-rose-600",
            path: "/controller"
        }
    ];

    return (
        <div className={cn(
            "min-h-screen w-full font-sans overflow-y-auto relative transition-colors duration-500",
            "text-slate-900 dark:text-white bg-slate-50 dark:bg-black"
        )}>
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-white/5 backdrop-blur-xl">
                <div className="container mx-auto px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/")}
                                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <img src={sceauGabon} alt="Sceau du Gabon" className="h-12 w-12 lg:h-[58px] lg:w-[58px] object-contain" />
                                <div>
                                    <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">Mode Démo</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">IDN.GA - Testez la plateforme</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <Languages className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {languages.map((lang) => (
                                        <DropdownMenuItem
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code)}
                                            className={cn("cursor-pointer", language === lang.code && "bg-primary/10 text-primary")}
                                        >
                                            <span className="mr-2">{lang.flag}</span>
                                            {lang.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 container mx-auto px-4 lg:px-6 py-8 lg:py-12">
                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto mb-10 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-wider border border-green-100 dark:border-green-800">
                        <Zap className="w-3 h-3" /> Mode Démonstration
                    </div>
                    <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                        {t("demoTitle")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {t("demoSubtitle")}
                    </p>
                </motion.div>

                {/* Personas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
                    {personas.map((persona, index) => (
                        <motion.div
                            key={persona.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 rounded-2xl border transition-all duration-300 cursor-pointer group bg-white/90 dark:bg-white/5 border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                            onClick={() => navigate(persona.path)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white shadow-lg", persona.gradient)}>
                                        <persona.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{persona.name}</h3>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                            {persona.role}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-primary transition-colors">
                                    <ArrowRight size={20} />
                                </Button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("status")}</p>
                                        <p className="text-slate-700 dark:text-slate-200">{persona.status}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Target size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("objective")}</p>
                                        <p className="text-slate-700 dark:text-slate-200">{persona.objective}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t("context")}</p>
                                        <p className="text-slate-700 dark:text-slate-200">{persona.context}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <Button
                        variant="outline"
                        onClick={() => navigate("/")}
                        className="px-8 py-6 text-lg border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t("backHome")}
                    </Button>
                </motion.div>
            </main>
        </div>
    );
};

export default DemoPage;
