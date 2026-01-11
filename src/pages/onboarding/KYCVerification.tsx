import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, ArrowLeft, Image as ImageIcon, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useLanguage } from "@/context/LanguageContext";

const KYCVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<"front" | "back" | "processing" | "done">("front");
    const [isCapturing, setIsCapturing] = useState(false);

    const selectedProfile = location.state?.profile || "citizen";
    // Simplified logic: Tourist (Passport) = Single side, others = Double side
    const isSingleSide = selectedProfile === "tourist";

    const handleCapture = () => {
        setIsCapturing(true);
        setTimeout(() => {
            setIsCapturing(false);
            if (step === "front") {
                if (isSingleSide) {
                    setStep("processing");
                    startProcessing();
                } else {
                    setStep("back");
                }
            } else if (step === "back") {
                setStep("processing");
                startProcessing();
            }
        }, 1000);
    };

    const startProcessing = () => {
        setTimeout(() => {
            setStep("done");
            setTimeout(() => {
                navigate("/onboarding/selfie");
            }, 1500);
        }, 2000);
    };

    const stepInfo = {
        front: { title: t('kyc_front_title'), subtitle: t('kyc_front_subtitle') },
        back: { title: t('kyc_back_title'), subtitle: t('kyc_back_subtitle') },
        processing: { title: t('kyc_processing_title'), subtitle: t('kyc_processing_subtitle') },
        done: { title: t('kyc_success_title'), subtitle: t('kyc_success_subtitle') },
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col relative">
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
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex gap-1">
                            <div className={cn("w-8 h-1 rounded-full", step !== "front" ? "bg-primary" : "bg-primary animate-pulse")}></div>
                            {!isSingleSide && (
                                <div className={cn("w-8 h-1 rounded-full", step === "back" || step === "processing" || step === "done" ? "bg-primary" : "bg-slate-700")}></div>
                            )}
                            <div className={cn("w-8 h-1 rounded-full", step === "done" ? "bg-primary" : "bg-slate-700")}></div>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">{t('kyc_step')}</span>
                    <h1 className="text-2xl font-bold mt-2">{stepInfo[step].title}</h1>
                    <p className="text-slate-400 text-sm mt-1">{stepInfo[step].subtitle}</p>
                </div>
            </header>

            {/* Camera Viewport */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Camera Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>

                {/* ID Card Frame */}
                <AnimatePresence mode="wait">
                    {(step === "front" || step === "back") && (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="relative z-10"
                        >
                            <div className={cn(
                                "w-80 aspect-[1.586] border-2 rounded-2xl flex items-center justify-center transition-all duration-300",
                                isCapturing ? "border-primary bg-primary/10" : "border-white/30 bg-white/5"
                            )}>
                                {/* Corner Guides */}
                                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary -mt-0.5 -ml-0.5 rounded-tl-xl"></div>
                                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary -mt-0.5 -mr-0.5 rounded-tr-xl"></div>
                                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary -mb-0.5 -ml-0.5 rounded-bl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary -mb-0.5 -mr-0.5 rounded-br-xl"></div>

                                {/* Content */}
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                                        {step === "front" ? (
                                            <span className="text-3xl">🪪</span>
                                        ) : (
                                            <RotateCcw className="w-8 h-8 text-white/60" />
                                        )}
                                    </div>
                                    <p className="text-white/60 text-sm">
                                        {step === "front" ? t('kyc_camera_front') : t('kyc_camera_back')}
                                    </p>
                                </div>
                            </div>

                            {/* Scanning Line Animation */}
                            {isCapturing && (
                                <motion.div
                                    initial={{ top: 0 }}
                                    animate={{ top: "100%" }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_#009E49]"
                                />
                            )}
                        </motion.div>
                    )}

                    {step === "processing" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                            <p className="text-slate-400">{t('kyc_ocr_processing')}</p>
                        </motion.div>
                    )}

                    {step === "done" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring" }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-primary" />
                            </div>
                            <p className="text-primary font-semibold">{t('kyc_doc_auth')}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="relative z-20 p-6 pb-10">
                {(step === "front" || step === "back") && (
                    <div className="flex items-center justify-center gap-8">
                        {/* Gallery Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="w-6 h-6" />
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                        </Button>

                        {/* Capture Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCapture}
                            disabled={isCapturing}
                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ scale: isCapturing ? 0.7 : 1 }}
                                className={cn(
                                    "w-16 h-16 rounded-full transition-colors",
                                    isCapturing ? "bg-primary" : "bg-white"
                                )}
                            />
                        </motion.button>

                        {/* Spacer */}
                        <div className="w-14 h-14" />
                    </div>
                )}

                {/* Tips */}
                {(step === "front" || step === "back") && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        <span>{t('kyc_tips_lighting')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KYCVerification;
