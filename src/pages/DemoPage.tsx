import { useNavigate } from "react-router-dom";
import { User, Shield, Briefcase, Plane, ArrowRight, Info, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const DemoPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const personas = [
        {
            id: "citizen",
            name: t("citizen_name"),
            role: t("citizen_role"),
            status: t("citizen_status"),
            objective: t("citizen_objective"),
            context: t("citizen_context"),
            icon: User,
            color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            borderColor: "border-green-200 dark:border-green-800",
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
            color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            borderColor: "border-blue-200 dark:border-blue-800",
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
            color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            borderColor: "border-yellow-200 dark:border-yellow-800",
            path: "/dashboard"
        },
        {
            id: "admin",
            name: t("admin_name"),
            role: t("admin_role"),
            status: t("admin_status"),
            objective: t("admin_objective"),
            context: t("admin_context"),
            icon: Shield,
            color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            borderColor: "border-red-200 dark:border-red-800",
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
            color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
            borderColor: "border-indigo-200 dark:border-indigo-800",
            path: "/controller"
        }
    ];

    return (
        <MainLayout showNav={false}>
            <div className="min-h-screen bg-neutral-light/50 dark:bg-background p-6 pb-24 relative">

                {/* Language Switcher Positioned Absolute Top Right */}
                <div className="absolute top-6 right-6 z-10">
                    <LanguageSwitcher />
                </div>

                <div className="max-w-4xl mx-auto pt-8">
                    <div className="mb-10 text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground font-header">{t("demoTitle")}</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t("demoSubtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {personas.map((persona, index) => (
                            <motion.div
                                key={persona.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`neu-card p-6 relative overflow-hidden group cursor-pointer border-l-4 ${persona.borderColor}`}
                                onClick={() => navigate(persona.path)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-4 rounded-xl ${persona.color} shadow-inner`}>
                                            <persona.icon size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{persona.name}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 border border-black/5 ${persona.color.split(' ')[1]}`}>
                                                {persona.role}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary transition-colors">
                                        <ArrowRight size={24} />
                                    </Button>
                                </div>

                                <div className="space-y-3 mt-4">
                                    <div className="flex items-start space-x-2">
                                        <Info size={16} className="text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">{t("status")}</p>
                                            <p className="text-sm text-foreground">{persona.status}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Target size={16} className="text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">{t("objective")}</p>
                                            <p className="text-sm text-foreground">{persona.objective}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <FileText size={16} className="text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">{t("context")}</p>
                                            <p className="text-sm text-foreground">{persona.context}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/")}
                            className="neu-button px-8 py-6 text-lg hover:text-primary"
                        >
                            {t("backHome")}
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default DemoPage;
