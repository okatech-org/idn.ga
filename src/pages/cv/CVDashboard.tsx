import { useNavigate } from "react-router-dom";
import { Download, Share2, Briefcase, GraduationCap, Award, ChevronRight, FileText } from "lucide-react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import SmartScoreRing from "@/components/cv/SmartScoreRing";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const CVDashboard = () => {
    const navigate = useNavigate();
    const completionScore = 78;

    const sections = [
        { icon: Briefcase, title: "Expériences", count: "2 postes", color: "text-orange-500", bg: "bg-orange-500/10" },
        { icon: GraduationCap, title: "Formation", count: "3 diplômes", color: "text-blue-500", bg: "bg-blue-500/10" },
        { icon: Award, title: "Compétences", count: "8 skills", color: "text-purple-500", bg: "bg-purple-500/10" },
        { icon: FileText, title: "Infos", count: "100%", color: "text-green-500", bg: "bg-green-500/10" }
    ];

    const suggestions = [
        { title: "Ajoutez vos diplômes", desc: "2x plus d'offres", impact: "+15%" },
        { title: "Validez vos compétences", desc: "Certifier anglais", impact: "+10%" }
    ];

    return (
        <UserSpaceLayout>
            <div className="h-full flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-xl font-bold text-foreground">iCV</h1>
                    <div className="flex gap-2">
                        <button className={cn(
                            "p-2.5 rounded-lg",
                            "bg-white/95 dark:bg-white/5",
                            "border border-slate-300/80 dark:border-white/10",
                            "hover:border-primary/30 shadow-sm dark:shadow-none"
                        )}>
                            <Share2 className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <button className={cn(
                            "p-2.5 rounded-lg",
                            "bg-white/95 dark:bg-white/5",
                            "border border-slate-300/80 dark:border-white/10",
                            "hover:border-primary/30 shadow-sm dark:shadow-none"
                        )}>
                            <Download className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Main Content - 2 columns */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                    {/* Left: Score + Suggestions */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "p-4 rounded-2xl flex flex-col items-center",
                            "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
                            "border border-slate-300/80 dark:border-white/10",
                            "shadow-sm dark:shadow-none"
                        )}
                    >
                        <SmartScoreRing score={completionScore} size={100} />
                        <h3 className="font-bold text-base text-foreground mt-2">Niveau Expert</h3>
                        <p className="text-xs text-muted-foreground text-center">Profil attractif</p>

                        <div className="w-full mt-3 pt-3 border-t border-slate-300/60 dark:border-white/10 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Suggestions</p>
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate("/icv/edit")}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer transition-all",
                                        "bg-slate-100/80 dark:bg-white/5",
                                        "hover:bg-slate-200/80 dark:hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-foreground">{s.title}</span>
                                        <span className="text-xs font-bold text-green-500">{s.impact}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: Sections Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 flex flex-col gap-4"
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sections du CV</p>
                        <div className="flex-1 grid grid-cols-2 gap-2 content-start">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate("/icv/edit")}
                                    className={cn(
                                        "p-4 rounded-xl cursor-pointer transition-all",
                                        "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
                                        "border border-slate-300/80 dark:border-white/10",
                                        "hover:border-primary/30 hover:scale-[1.02]",
                                        "flex items-center gap-3 group",
                                        "shadow-sm dark:shadow-none"
                                    )}
                                >
                                    <div className={cn("p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110", section.bg)}>
                                        <section.icon className={cn("w-5 h-5", section.color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-base text-foreground">{section.title}</h4>
                                        <p className="text-xs text-muted-foreground">{section.count}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:translate-x-0.5 transition-transform" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => navigate("/icv/edit")}
                            className={cn(
                                "w-full py-2.5 rounded-xl font-medium text-sm transition-all",
                                "bg-primary text-white hover:bg-primary/90"
                            )}
                        >
                            Modifier mon CV
                        </button>
                    </motion.div>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default CVDashboard;
