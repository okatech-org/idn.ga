import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Delete, Fingerprint, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const PinCreation = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState<string>("");
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const PIN_LENGTH = 6;

    const handleNumberClick = (num: string) => {
        if (pin.length < PIN_LENGTH) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === PIN_LENGTH) {
                setTimeout(() => navigate("/onboarding/success"), 500);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-between p-6 pb-12">
            <div className="w-full pt-8">
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2">
                        <ArrowLeft className="text-neutral-dark" />
                    </Button>
                    <div className="flex space-x-1">
                        <div className="w-8 h-1 bg-primary rounded-full"></div>
                        <div className="w-8 h-1 bg-primary rounded-full"></div>
                        <div className="w-8 h-1 bg-primary rounded-full"></div>
                    </div>
                    <div className="w-10" />
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-dark mb-2">Créez votre code PIN</h1>
                    <p className="text-gray-500">Ce code sécurisera l'accès à votre identité numérique.</p>
                </div>
            </div>

            {/* PIN Display */}
            <div className="flex space-x-4 my-8">
                {[...Array(PIN_LENGTH)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={{
                            scale: pin.length > i ? 1.1 : 1,
                            borderColor: pin.length > i ? "#009E49" : "#E5E7EB",
                        }}
                        className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? "bg-primary border-primary" : "bg-transparent border-gray-200"
                            }`}
                    />
                ))}
            </div>

            {/* Keypad */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-y-6 gap-x-8 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="w-16 h-16 rounded-full text-2xl font-semibold text-neutral-dark hover:bg-gray-100 transition-colors focus:outline-none active:scale-95 transform duration-100"
                    >
                        {num}
                    </button>
                ))}
                <div className="flex items-center justify-center">
                    {/* Empty */}
                </div>
                <button
                    onClick={() => handleNumberClick("0")}
                    className="w-16 h-16 rounded-full text-2xl font-semibold text-neutral-dark hover:bg-gray-100 transition-colors focus:outline-none active:scale-95 transform duration-100"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-neutral-dark hover:bg-gray-100 transition-colors focus:outline-none active:scale-95 transform duration-100"
                >
                    <Delete size={24} />
                </button>
            </div>

            {/* Biometric Toggle */}
            <div className="w-full max-w-xs flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-primary">
                        <Fingerprint size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Activer Face ID / Touch ID</span>
                </div>
                <Switch
                    checked={biometricsEnabled}
                    onCheckedChange={setBiometricsEnabled}
                />
            </div>
        </div>
    );
};

export default PinCreation;
