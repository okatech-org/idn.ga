import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import sceauGabon from "@/assets/sceau_gabon.png";

const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Trigger confetti
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#009E49", "#FCD116", "#0072CE"],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#009E49", "#FCD116", "#0072CE"],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    const features = [
        { icon: Clock, title: "Activation sous 24-48h", desc: "Vérification manuelle en cours" },
        { icon: Bell, title: "Notification", desc: "Vous serez alerté par email" },
        { icon: Shield, title: "Sécurisé", desc: "Données protégées et chiffrées" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-6">
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 mb-8"
            >
                <img src={sceauGabon} alt="" className="h-[58px] w-[58px] object-contain" />
            </motion.div>

            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative mb-8"
            >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                    <Check className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
                {/* Pulse Ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full border-4 border-green-500"
                />
            </motion.div>

            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Inscription Réussie !
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Votre demande d'identité numérique a été soumise avec succès.
                </p>
            </motion.div>

            {/* Info Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-sm space-y-3 mb-8"
            >
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            index === 0 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                                index === 1 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                                    "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        )}>
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{feature.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full max-w-sm mt-auto"
            >
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30"
                >
                    Accéder à mon espace
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-xs text-slate-400 mt-4">
                    Vous recevrez une notification dès que votre identité sera active.
                </p>
            </motion.div>
        </div>
    );
};

export default Success;
