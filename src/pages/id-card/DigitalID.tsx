import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, RotateCw, ShieldCheck, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { Button } from "@/components/ui/button";
import IDCardFront from "@/components/id-card/IDCardFront";
import IDCardBack from "@/components/id-card/IDCardBack";
import { useToast } from "@/components/ui/use-toast";

const DigitalID = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrTimer, setQrTimer] = useState(300); // 5 minutes
    const [copied, setCopied] = useState(false);

    // Mock User Data
    const userData = {
        firstName: "Jean Pierre",
        lastName: "DUPONT",
        birthDate: "12/05/1985",
        gender: "M",
        nip: "1234 5678 9012 3456",
        photoUrl: "https://github.com/shadcn.png",
        issueDate: "01/01/2024",
        expiryDate: "01/01/2034",
        address: "BP 1234, Libreville, Gabon\nQuartier Louis",
        bloodType: "O+",
        height: "1.82 m",
        issuer: "DGDI Gabon"
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setQrTimer((prev) => (prev > 0 ? prev - 1 : 300));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText("MOCK-TOKEN-12345");
        setCopied(true);
        toast({
            title: "Copié !",
            description: "Le code de sécurité a été copié dans le presse-papier.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <UserSpaceLayout>
            <div className="flex flex-col h-full space-y-8 pb-24 max-w-lg mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="font-bold text-xl text-foreground">Carte Nationale d'Identité</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="neu-raised w-10 h-10 rounded-full text-muted-foreground hover:text-primary"
                    >
                        <Share2 size={20} />
                    </Button>
                </div>

                {/* Card Container */}
                <div className="flex-1 flex flex-col items-center justify-center perspective-1000 min-h-[350px]">
                    <motion.div
                        className="relative w-full aspect-[1.586] preserve-3d cursor-pointer"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <IDCardFront userData={userData} />
                        <IDCardBack userData={userData} />
                    </motion.div>

                    <p className="text-muted-foreground text-xs mt-8 flex items-center animate-pulse">
                        <RotateCw size={14} className="mr-2" />
                        Touchez la carte pour la retourner
                    </p>
                </div>

                {/* QR Code Timer Section */}
                <div className="neu-raised p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Code de sécurité dynamique</p>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">Expire dans <span className="text-primary font-mono font-bold">{formatTime(qrTimer)}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="neu-raised w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors active:neu-inset"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
            </div>
        </UserSpaceLayout>
    );
};

export default DigitalID;
