import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Delete, Fingerprint, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";
import { useLanguage } from "@/context/LanguageContext";

const PinCreation = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [pin, setPin] = useState<string>("");
    const [confirmPin, setConfirmPin] = useState<string>("");
    const [stage, setStage] = useState<"create" | "confirm" | "done">("create");
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);
    const [error, setError] = useState(false);
    const PIN_LENGTH = 6;

    const currentPin = stage === "create" ? pin : confirmPin;
    const setCurrentPin = stage === "create" ? setPin : setConfirmPin;

    const handleNumberClick = (num: string) => {
        if (currentPin.length < PIN_LENGTH) {
            const newPin = currentPin + num;
            setCurrentPin(newPin);
            setError(false);

            if (newPin.length === PIN_LENGTH) {
                if (stage === "create") {
                    setTimeout(() => setStage("confirm"), 300);
                } else if (stage === "confirm") {
                    if (newPin === pin) {
                        setStage("done");
                        setTimeout(() => navigate("/onboarding/success"), 800);
                    } else {
                        setError(true);
                        setTimeout(() => {
                            setConfirmPin("");
                            setError(false);
                        }, 500);
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        setCurrentPin(currentPin.slice(0, -1));
        setError(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="p-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => stage === "confirm" ? (setStage("create"), setConfirmPin("")) : navigate(-1)}
                        className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </Button>
                    <img src={sceauGabon} alt="" className="h-[58px] w-[58px] object-contain" />
                    <div className="w-10" />
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-3">
                        <div className="w-8 h-1 rounded-full bg-primary"></div>
                        <div className="w-8 h-1 rounded-full bg-primary"></div>
                        <div className="w-8 h-1 rounded-full bg-primary"></div>
                    </div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">{t('pin_step')}</span>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                        {stage === "create" ? t('pin_create_title') : t('pin_confirm_title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {stage === "create"
                            ? t('pin_create_subtitle')
                            : t('pin_confirm_subtitle')
                        }
                    </p>
                </div>
            </header>

            {/* PIN Display */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <motion.div
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex gap-4 mb-12"
                >
                    {[...Array(PIN_LENGTH)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                scale: currentPin.length > i ? 1.2 : 1,
                            }}
                            className={cn(
                                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                                currentPin.length > i
                                    ? error
                                        ? "bg-red-500 border-red-500"
                                        : "bg-primary border-primary"
                                    : "bg-transparent border-slate-300 dark:border-slate-600"
                            )}
                        />
                    ))}
                </motion.div>

                {/* Keypad */}
                <div className="w-full max-w-xs grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <motion.button
                            key={num}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleNumberClick(num.toString())}
                            className="w-20 h-20 rounded-2xl text-2xl font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mx-auto"
                        >
                            {num}
                        </motion.button>
                    ))}
                    <div /> {/* Empty cell */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleNumberClick("0")}
                        className="w-20 h-20 rounded-2xl text-2xl font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mx-auto"
                    >
                        0
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDelete}
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mx-auto"
                    >
                        <Delete className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>

            {/* Biometric Toggle */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Fingerprint className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{t('pin_biometrics')}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('pin_biometrics_desc')}</p>
                        </div>
                    </div>
                    <Switch
                        checked={biometricsEnabled}
                        onCheckedChange={setBiometricsEnabled}
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t('pin_security')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PinCreation;
