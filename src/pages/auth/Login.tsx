import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, ScanFace, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";

const Login = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [nip, setNip] = useState("");
    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (nip.length >= 5 && pin.length >= 4) {
                navigate("/dashboard");
            } else {
                setError("Identifiants invalides. Veuillez réessayer.");
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-neutral-light flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="neu-card p-8 md:p-10 relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto bg-neutral-light rounded-2xl neu-pressed flex items-center justify-center mb-4 text-primary">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-dark font-header">Connexion</h1>
                        <p className="text-gray-500 mt-2">Accédez à votre identité numérique</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-dark ml-1">Numéro NIP</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="text"
                                    placeholder="Ex: 12345678901234"
                                    value={nip}
                                    onChange={(e) => setNip(e.target.value.replace(/\D/g, '').slice(0, 14))}
                                    className="neu-input pl-12 h-12 text-lg tracking-wide"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-dark ml-1">Code PIN</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type={showPin ? "text" : "password"}
                                    placeholder="••••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="neu-input pl-12 pr-12 h-12 text-lg tracking-widest"
                                    maxLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-red-500 text-sm text-center font-medium"
                            >
                                {error}
                            </motion.p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <a href="#" className="text-sm text-primary font-bold hover:underline">
                                Mot de passe oublié ?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 text-lg font-bold neu-button bg-primary text-white hover:bg-primary/90 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Se connecter <ArrowRight size={20} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-neutral-light text-gray-500 font-medium">Ou continuer avec</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/biometric-login")}
                            className="w-16 h-16 rounded-2xl neu-flat flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                        >
                            <ScanFace size={32} />
                        </motion.button>
                    </div>
                </div>

                <p className="text-center mt-8 text-gray-500 text-sm">
                    Pas encore de compte ?{" "}
                    <button onClick={() => navigate("/onboarding/profile")} className="text-primary font-bold hover:underline">
                        S'inscrire
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
