import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Home, Plane, ArrowLeft, ChevronRight, FileText, CheckCircle2, Shield, Languages, Moon, Sun, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, languages } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";
import digitalGabonPeople from "@/assets/digital_gabon_people.png";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfileSelection = () => {
    const navigate = useNavigate();
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const profiles = [
        {
            id: "citizen",
            title: t('profile_citizen_title'),
            icon: User,
            gradient: "from-green-500 to-emerald-600",
            bgLight: "bg-green-50",
            bgDark: "bg-green-900/20",
            textColor: "text-green-600 dark:text-green-400",
            borderColor: "border-green-500",
            description: t('profile_citizen_desc'),
            docs: [t('doc_cni'), t('doc_birth_cert')],
            flag: "🇬🇦",
            badge: "Niveau 3"
        },
        {
            id: "resident",
            title: t('profile_resident_title'),
            icon: Home,
            gradient: "from-yellow-500 to-amber-600",
            bgLight: "bg-yellow-50",
            bgDark: "bg-yellow-900/20",
            textColor: "text-yellow-600 dark:text-yellow-400",
            borderColor: "border-yellow-500",
            description: t('profile_resident_desc'),
            docs: [t('doc_residence_card'), t('doc_passport')],
            flag: "🏠",
            badge: "Niveau 2"
        },
        {
            id: "tourist",
            title: t('profile_tourist_title'),
            icon: Plane,
            gradient: "from-blue-500 to-indigo-600",
            bgLight: "bg-blue-50",
            bgDark: "bg-blue-900/20",
            textColor: "text-blue-600 dark:text-blue-400",
            borderColor: "border-blue-500",
            description: t('profile_tourist_desc'),
            docs: [t('doc_passport'), t('doc_visa')],
            flag: "✈️",
            badge: "Niveau 1"
        },
        {
            id: "developer",
            title: t('profile_developer_title'),
            icon: Code,
            gradient: "from-purple-500 to-violet-600",
            bgLight: "bg-purple-50",
            bgDark: "bg-purple-900/20",
            textColor: "text-purple-600 dark:text-purple-400",
            borderColor: "border-purple-500",
            description: t('profile_developer_desc'),
            docs: [t('doc_business_reg'), t('doc_api_request')],
            flag: "💻",
            badge: "API Access"
        },
    ];

    return (
        <div
            className={cn(
                "fixed inset-0 w-full font-sans overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row transition-colors duration-500 z-10",
                "text-slate-900 dark:text-white bg-slate-50 dark:bg-black"
            )}
        >
            {/* Ambient Background (Global) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>

            {/* Left Content Panel (70%) - Glassmorphic */}
            <div className="flex-1 lg:flex-[0.7] flex flex-col lg:h-full z-20 relative glass lg:border-r border-white/10 backdrop-blur-xl">
                <div className="p-6 lg:p-10 flex flex-col lg:h-full lg:justify-between">
                    {/* Header with Navigation & Theme/Lang Controls */}
                    <div className="flex items-center justify-between shrink-0">
                        <button
                            onClick={() => navigate("/")}
                            className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <img src={sceauGabon} alt="Sceau du Gabon" className="h-12 w-12 lg:h-[58px] lg:w-[58px] object-contain" />
                            <div className="text-left">
                                <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">IDN.GA</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Identité Numérique</div>
                            </div>
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Language Selector */}
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
                                            className={cn(
                                                "cursor-pointer",
                                                language === lang.code && "bg-primary/10 text-primary"
                                            )}
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

                    {/* Main Content Area - Centered on Desktop, Stacked on Mobile */}
                    <div className="flex-1 flex flex-col lg:justify-center px-0 lg:px-8 w-full mt-6 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-4 shrink-0"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-1 w-8 bg-primary rounded-full"></div>
                                <span className="text-xs font-semibold text-primary uppercase tracking-widest">{t('profile_step')}</span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {t('profile_title')}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                {t('profile_subtitle')}
                            </p>
                        </motion.div>

                        {/* Grid Layout for Profiles - No Scroll */}
                        <div className="w-full">
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="show"
                            >
                                {profiles.map((profile) => (
                                    <motion.div
                                        key={profile.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedProfile(profile.id)}
                                        onDoubleClick={() => {
                                            setSelectedProfile(profile.id);
                                            navigate("/onboarding/kyc", { state: { profile: profile.id } });
                                        }}
                                        className="outline-none h-full"
                                    >
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className={cn(
                                                "relative h-full flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 rounded-2xl outline-none group border",
                                                selectedProfile === profile.id
                                                    ? "bg-primary/10 dark:bg-primary/20 border-primary shadow-xl shadow-primary/20"
                                                    : "bg-white/90 dark:bg-white/5 border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                                            )}>

                                            <div className={cn(
                                                "p-3 rounded-xl mb-4 transition-all duration-300 shadow-lg",
                                                selectedProfile === profile.id
                                                    ? "bg-gradient-to-br from-primary to-primary/80 text-white"
                                                    : `bg-gradient-to-br ${profile.gradient} text-white`
                                            )}>
                                                <profile.icon className="w-7 h-7 text-white" />
                                            </div>

                                            <h3 className={cn(
                                                "text-lg font-bold mb-2 text-center transition-colors duration-300",
                                                selectedProfile === profile.id ? "text-primary dark:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                                            )}>
                                                {profile.title}
                                            </h3>

                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-medium tracking-wider transition-all",
                                                selectedProfile === profile.id
                                                    ? "bg-primary text-white"
                                                    : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                                            )}>
                                                {profile.badge}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-4 space-y-3 shrink-0">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                    {t('profile_protection')}
                                </p>
                            </div>

                            <Button
                                disabled={!selectedProfile}
                                onClick={() => navigate("/onboarding/kyc", { state: { profile: selectedProfile } })}
                                className={cn(
                                    "w-full h-12 text-base font-bold rounded-xl transition-all duration-300",
                                    selectedProfile
                                        ? "bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 animate-pulse"
                                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                                )}
                            >
                                {t('profile_continue')}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>

                        {/* Mobile Video Preview */}
                        <div className="lg:hidden mt-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div className="relative aspect-video">
                                <video
                                    src="/videos/video_idn_ga.mp4"
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Shield className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Sécurité & Confidentialité Garanties</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Footer */}
                        <div className="lg:hidden mt-6 pb-4 text-center">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                © 2026 République Gabonaise
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                <a href="/legal/privacy" className="hover:text-primary">Confidentialité</a> · <a href="/legal/terms" className="hover:text-primary">CGU</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Visual Panel (30%) - 3D Video */}
            <div className="hidden lg:flex lg:flex-[0.3] relative items-center justify-center overflow-hidden perspective-1000">
                {/* 3D Floating Video Card */}
                <div className="relative w-[90%] h-[85%] glass-card overflow-hidden shadow-2xl shadow-black/50 rotate-y-12 preserve-3d">
                    <video
                        src="/videos/video_idn_ga.mp4"
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Bottom Info */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="glass p-4 rounded-xl border border-white/20 shadow-glow-primary backdrop-blur-3xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-full">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Sécurité Maximale</div>
                                    <div className="text-xs text-white/70">Vos données sont protégées</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Desktop Only */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        © 2026 République Gabonaise · <a href="/legal/privacy" className="hover:text-primary">Confidentialité</a> · <a href="/legal/terms" className="hover:text-primary">CGU</a>
                    </p>
                </div>
            </div>
        </div>

    );
};

export default ProfileSelection;
