import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, ArrowLeft, AlertCircle, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useLanguage } from "@/context/LanguageContext";

const SelfieVerification = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [step, setStep] = useState<"positioning" | "detecting" | "ready" | "captured" | "verified">("positioning");

    useEffect(() => {
        // Simulate face positioning detection
        const timer1 = setTimeout(() => setStep("detecting"), 1500);
        const timer2 = setTimeout(() => setStep("ready"), 3500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const handleCapture = () => {
        setStep("captured");
        setTimeout(() => {
            setStep("verified");
            setTimeout(() => {
                navigate("/onboarding/pin");
            }, 1500);
        }, 1500);
    };

    const stepMessages = {
        positioning: t('selfie_msg_position'),
        detecting: t('selfie_msg_detecting'),
        ready: t('selfie_msg_ready'),
        captured: t('selfie_msg_captured'),
        verified: t('selfie_msg_verified'),
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="relative z-20 p-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <img src={sceauGabon} alt="" className="h-[58px] w-[58px] object-contain" />
                    <div className="w-10" />
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-3">
                        <div className="w-8 h-1 rounded-full bg-primary"></div>
                        <div className="w-8 h-1 rounded-full bg-primary"></div>
                        <div className={cn("w-8 h-1 rounded-full", step === "verified" ? "bg-primary" : "bg-slate-700")}></div>
                    </div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">{t('selfie_step')}</span>
                    <h1 className="text-2xl font-bold mt-2">{t('selfie_title')}</h1>
                    <p className="text-slate-400 text-sm mt-1">{t('selfie_subtitle')}</p>
                </div>
            </header>

            {/* Camera Viewport */}
            <div className="flex-1 relative flex items-center justify-center">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-radial from-slate-800 to-slate-900"></div>

                {/* Face Oval Frame */}
                <div className="relative z-10">
                    <motion.div
                        className={cn(
                            "w-64 h-80 rounded-[50%] border-4 flex items-center justify-center transition-all duration-500",
                            step === "positioning" && "border-white/30",
                            step === "detecting" && "border-yellow-500",
                            step === "ready" && "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
                            step === "captured" && "border-primary",
                            step === "verified" && "border-green-500 bg-green-500/10"
                        )}
                    >
                        {/* Scanning Animation */}
                        {step === "detecting" && (
                            <motion.div
                                animate={{
                                    boxShadow: ["0 0 0 0 rgba(234,179,8,0.4)", "0 0 0 30px rgba(234,179,8,0)"]
                                }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 rounded-[50%]"
                            />
                        )}

                        {/* Face Placeholder */}
                        <AnimatePresence>
                            {step === "verified" ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring" }}
                                >
                                    <Check className="w-20 h-20 text-green-500" strokeWidth={3} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    className="text-center"
                                >
                                    <Smile className="w-20 h-20 text-white/30 mx-auto" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Liveness Indicators */}
                    {step === "ready" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
                        >
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                👁️ {t('selfie_eyes_detected')}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Status Message */}
                <div className="absolute bottom-32 left-0 right-0 text-center">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full"
                    >
                        {step === "detecting" && (
                            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                        )}
                        {step === "ready" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        )}
                        <span className="text-sm">{stepMessages[step]}</span>
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            <div className="relative z-20 p-6 pb-10 flex flex-col items-center">
                <Button
                    disabled={step !== "ready"}
                    onClick={handleCapture}
                    className={cn(
                        "w-20 h-20 rounded-full p-0 transition-all",
                        step === "ready"
                            ? "bg-white hover:bg-gray-100 shadow-xl"
                            : "bg-slate-700"
                    )}
                >
                    {step === "verified" ? (
                        <Check className="w-10 h-10 text-green-600" />
                    ) : step === "captured" ? (
                        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                    ) : (
                        <Camera className={cn(
                            "w-8 h-8",
                            step === "ready" ? "text-slate-900" : "text-slate-500"
                        )} />
                    )}
                </Button>

                {/* Tips */}
                <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('selfie_tips')}</span>
                </div>
            </div>
        </div>
    );
};

export default SelfieVerification;
