import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#009E49", "#FCD116", "#0072CE"], // Gabon colors
        });
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8"
            >
                <Check className="w-16 h-16 text-primary" strokeWidth={3} />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-neutral-dark mb-4"
            >
                Identité Vérifiée !
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500 mb-8 max-w-xs mx-auto"
            >
                Votre profil a été créé avec succès. Votre identité numérique sera active dans <span className="font-bold text-neutral-dark">24 à 48 heures</span>.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full max-w-xs"
            >
                <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full h-14 text-lg font-bold shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
                >
                    Accéder à mon profil
                </Button>
            </motion.div>
        </div>
    );
};

export default Success;
