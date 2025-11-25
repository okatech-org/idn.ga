import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SelfieVerification = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"detecting" | "ready" | "captured">("detecting");

    useEffect(() => {
        // Simulate face detection
        const timer = setTimeout(() => {
            setStep("ready");
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleCapture = () => {
        setStep("captured");
        setTimeout(() => {
            navigate("/onboarding/pin");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pt-12">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
                    <ArrowLeft size={24} />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">Vérification faciale</span>
                    <div className="flex space-x-1 mt-1">
                        <div className="w-8 h-1 bg-primary rounded-full"></div>
                        <div className="w-8 h-1 bg-primary rounded-full"></div>
                        <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
                    </div>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Camera Viewport */}
            <div className="flex-1 relative flex items-center justify-center">
                {/* Fake Camera Feed */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2788&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-sm"></div>

                {/* Oval Frame */}
                <div className="relative z-10 w-64 h-80 rounded-[50%] border-4 border-white/30 overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]">
                    {/* Face Detection Animation */}
                    {step === "detecting" && (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 border-4 border-primary rounded-[50%]"
                        />
                    )}

                    {step === "ready" && (
                        <div className="absolute inset-0 border-4 border-green-500 rounded-[50%] shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                    )}
                </div>

                {/* Instructions */}
                <div className="absolute top-32 z-20 text-center w-full px-6">
                    <h2 className="text-2xl font-bold mb-2 drop-shadow-md">Selfie de vérification</h2>
                    <p className="text-white/90 bg-black/40 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                        {step === "detecting" ? "Positionnez votre visage dans le cadre..." : "Regardez l'appareil et clignez des yeux"}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-black p-8 pb-12 z-20 flex justify-center">
                <Button
                    disabled={step === "detecting"}
                    onClick={handleCapture}
                    className={`w-20 h-20 rounded-full p-0 flex items-center justify-center transition-all ${step === "ready" ? "bg-white hover:bg-gray-200" : "bg-gray-800"
                        }`}
                >
                    {step === "captured" ? (
                        <Check className="text-green-600 w-10 h-10" />
                    ) : (
                        <Camera className={`w-8 h-8 ${step === "ready" ? "text-black" : "text-gray-500"}`} />
                    )}
                </Button>
            </div>
        </div>
    );
};

export default SelfieVerification;
