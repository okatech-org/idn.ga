import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanFace, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BiometricLogin = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<"scanning" | "success" | "failed">("scanning");

    useEffect(() => {
        // Simulate scanning process
        const scanTimer = setTimeout(() => {
            setStatus("success");

            // Redirect after success
            const redirectTimer = setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

            return () => clearTimeout(redirectTimer);
        }, 2500);

        return () => clearTimeout(scanTimer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/login")}
                    className="text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                    <ArrowLeft size={24} />
                </Button>
            </div>

            {/* Scanning Animation Container */}
            <div className="relative w-64 h-64 mb-12">
                {/* Static Frame */}
                <div className={`absolute inset-0 border-4 rounded-[40px] transition-colors duration-500 ${status === "scanning" ? "border-white/20" :
                        status === "success" ? "border-green-500" : "border-red-500"
                    }`} />

                {/* Scanning Line */}
                {status === "scanning" && (
                    <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear",
                            repeatType: "reverse"
                        }}
                        className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_rgba(0,158,73,0.8)] z-10"
                    />
                )}

                {/* Face Icon / Status Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {status === "scanning" && (
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <ScanFace size={80} className="text-white/50" />
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500"
                        >
                            <CheckCircle size={80} strokeWidth={1.5} />
                        </motion.div>
                    )}

                    {status === "failed" && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-red-500"
                        >
                            <XCircle size={80} strokeWidth={1.5} />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2 z-10">
                <motion.h2
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-white tracking-wide"
                >
                    {status === "scanning" && "Recherche de visage..."}
                    {status === "success" && "Identité confirmée"}
                    {status === "failed" && "Non reconnu"}
                </motion.h2>
                <p className="text-white/60">
                    {status === "scanning" && "Gardez votre visage dans le cadre"}
                    {status === "success" && "Redirection en cours..."}
                    {status === "failed" && "Veuillez réessayer"}
                </p>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
            </div>
        </div>
    );
};

export default BiometricLogin;
