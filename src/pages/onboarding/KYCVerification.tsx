import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const KYCVerification = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCapture = () => {
        setIsCapturing(true);
        // Simulate capture delay
        setTimeout(() => {
            setIsCapturing(false);
            navigate("/onboarding/selfie");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pt-12">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
                    <ArrowLeft size={24} />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">Vérification d'identité</span>
                    <div className="flex space-x-1 mt-1">
                        <div className="w-8 h-1 bg-primary rounded-full"></div>
                        <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
                        <div className="w-8 h-1 bg-gray-700 rounded-full"></div>
                    </div>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Camera Viewport Simulation */}
            <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
                {/* Camera Feed Placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2787&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>

                {/* Guide Overlay */}
                <div className="relative z-10 w-full max-w-sm aspect-[1.586] border-2 border-white/30 rounded-xl mx-6 flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-lg"></div>

                    <div className="text-center">
                        <p className="text-white font-bold text-lg drop-shadow-md">
                            Scannez votre CNI
                        </p>
                        <p className="text-white/80 text-sm mt-1 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            Placez le recto dans le cadre
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-black p-8 pb-12 z-20">
                <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center space-y-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-14 h-14 border-gray-700 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon size={24} />
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                        </Button>
                        <span className="text-xs text-gray-400">Galerie</span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCapture}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative mx-4"
                    >
                        <div className={`w-16 h-16 rounded-full bg-white transition-all duration-300 ${isCapturing ? "scale-75 bg-primary" : "scale-100"}`}></div>
                    </motion.button>

                    <div className="w-14" /> {/* Spacer for balance */}
                </div>
            </div>
        </div>
    );
};

export default KYCVerification;
