import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Smartphone, Globe, Lock, Zap, Users, ChevronRight, Download, Info, Sun, Moon, Languages } from "lucide-react";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, languages } from "@/context/LanguageContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'download' | 'vision'>('info');
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className={cn(
            "min-h-screen w-full font-sans overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row relative",
            "text-slate-900 dark:text-white bg-slate-50 dark:bg-black"
        )}>
            {/* Ambient Background (Global) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>

            {/* Left Content Panel (40%) - Glassmorphic */}
            <div className="flex-1 lg:flex-[0.4] flex flex-col lg:justify-between p-6 lg:p-12 z-20 relative glass lg:border-r border-white/10 backdrop-blur-xl">
                {/* Navigation / Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={sceauGabon} alt="Sceau du Gabon" className="h-12 w-12 lg:h-[58px] lg:w-[58px] object-contain" />
                        <div>
                            <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">IDN.GA</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Identité Numérique Nationale</div>
                        </div>
                    </div>

                    {/* Theme & Language Controls */}
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

                        {/* Theme Toggle */}
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

                {/* Mobile Video Preview - FIRST on mobile */}
                <div className="lg:hidden mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
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
                            <div className="glass p-3 rounded-lg border border-white/20 flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-full">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white uppercase tracking-wider">Vision 2025</div>
                                    <div className="text-sm font-bold text-white">Gabon Numérique</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Hero Text */}
                <div className="space-y-6 lg:space-y-8 my-6 lg:my-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-wider border border-green-100 dark:border-green-800">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {t('landing_badge')}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                            {t('landing_title_1')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600">{t('landing_title_2')}</span>
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                            {t('landing_description')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
                                onClick={() => navigate("/onboarding/profile")}
                            >
                                {t('landing_cta_start')}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 text-base border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                                onClick={() => navigate("/demo")}
                            >
                                {t('landing_cta_demo')}
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Mobile Features Section */}
                <div className="lg:hidden p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 mb-4">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {t('landing_features')}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Lock className="w-4 h-4 mx-auto mb-1 text-green-600" />
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{t('landing_security')}</span>
                        </div>
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{t('landing_speed')}</span>
                        </div>
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{t('landing_universal')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Copyright */}
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-4 lg:mt-0 pb-4 lg:pb-0">
                    <span>© {new Date().getFullYear()} {t('landing_badge')}</span>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">{t('landing_privacy')}</a>
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">{t('landing_support')}</a>
                    </div>
                </div>
            </div>

            {/* Right Visual Panel (60%) - Desktop Only */}
            <div className="hidden lg:flex lg:flex-[0.6] relative items-center justify-center overflow-hidden perspective-1000">
                {/* 3D Floating Elements */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* Main Visual with Glass Overlay - Full Space */}
                    <div className="relative w-[90%] h-[85%] glass-card overflow-hidden shadow-2xl shadow-black/50 rotate-y-12 preserve-3d">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
                        <video
                            src="/videos/video_idn_ga.mp4"
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />

                        {/* Floating Stats Card - Static */}
                        <div className="absolute bottom-8 left-6 right-6 glass p-4 rounded-xl border border-white/20 shadow-glow-primary backdrop-blur-3xl z-20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-full text-primary ring-2 ring-primary/30">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white uppercase tracking-wider">Vision 2025</div>
                                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Gabon Numérique</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Info Dock (Top - Integrated) */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="absolute top-12 z-30 w-full flex justify-center px-8"
                >
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-full p-2 shadow-2xl shadow-black/5 flex items-center gap-1">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-[420px]">
                            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                                <TabsTrigger value="info" className="rounded-full py-2 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg transition-all border border-transparent data-[state=active]:border-slate-100 dark:data-[state=active]:border-slate-600">
                                    <Zap className="w-3.5 h-3.5 mr-2" /> {t('landing_features')}
                                </TabsTrigger>
                                <TabsTrigger value="vision" className="rounded-full py-2 text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg transition-all border border-transparent data-[state=active]:border-slate-100 dark:data-[state=active]:border-slate-600">
                                    <Info className="w-3.5 h-3.5 mr-2" /> {t('landing_vision')}
                                </TabsTrigger>
                                <TabsTrigger value="download" className="rounded-full py-2 text-xs font-medium data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">
                                    <Download className="w-3.5 h-3.5 mr-2" /> {t('landing_download')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Popup Content for Tabs */}
                            <div className="absolute top-full mt-4 left-0 right-0">
                                <TabsContent value="info" className="mt-0">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-xl flex justify-between gap-4"
                                    >
                                        <FeatureItem icon={<Lock className="w-5 h-5 text-green-600" />} title={t('landing_security')} />
                                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 self-center"></div>
                                        <FeatureItem icon={<Zap className="w-5 h-5 text-yellow-500" />} title={t('landing_speed')} />
                                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 self-center"></div>
                                        <FeatureItem icon={<Users className="w-5 h-5 text-blue-600" />} title={t('landing_universal')} />
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="vision" className="mt-0">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 shadow-xl"
                                    >
                                        <div className="flex gap-4 items-center">
                                            <Globe className="w-8 h-8 text-primary" />
                                            <div>
                                                <div className="font-bold text-sm">Vision Nationale 2025</div>
                                                <div className="text-xs opacity-70">Vers un futur 100% connecté</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="download" className="mt-0">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-3 rounded-2xl border border-white/20 shadow-xl flex justify-center gap-3"
                                    >
                                        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs"><Apple className="w-3 h-3" /> iOS</Button>
                                        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs"><Smartphone className="w-3 h-3" /> Android</Button>
                                    </motion.div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex flex-col items-center text-center flex-1">
        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2 shadow-sm border border-slate-100 dark:border-slate-700">
            {icon}
        </div>
        <div className="font-semibold text-sm text-slate-900 dark:text-white">{title}</div>
    </div>
);

export default LandingPage;
