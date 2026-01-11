import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, ScanFace, ArrowRight, Eye, EyeOff, Shield, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import sceauGabon from "@/assets/sceau_gabon.png";

const Login = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px]" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 md:p-10 border border-slate-100 dark:border-slate-700">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner"
                        >
                            <img src={sceauGabon} alt="" className="h-[58px] w-[58px] object-contain" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connexion</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Accédez à votre identité numérique</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* NIP Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Numéro d'Identification Personnel (NIP)
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <Input
                                    type="text"
                                    placeholder="GA-1234-5678-9012"
                                    value={nip}
                                    onChange={(e) => setNip(e.target.value.replace(/[^A-Za-z0-9-]/g, '').slice(0, 16))}
                                    className="pl-12 h-14 text-lg tracking-wide bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20"
                                    required
                                />
                            </div>
                        </div>

                        {/* PIN Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Code PIN</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <Input
                                    type={showPin ? "text" : "password"}
                                    placeholder="••••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="pl-12 pr-12 h-14 text-lg tracking-[0.3em] bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary/20"
                                    maxLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                >
                                    {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl"
                            >
                                <Shield className="w-4 h-4 text-red-500" />
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                            </motion.div>
                        )}

                        {/* Forgot Password */}
                        <div className="flex items-center justify-end">
                            <a href="#" className="text-sm text-primary font-semibold hover:underline">
                                Mot de passe oublié ?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
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

                    {/* Divider */}
                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white dark:bg-slate-800 text-slate-500 font-medium">Ou continuer avec</span>
                        </div>
                    </div>

                    {/* Biometric Login */}
                    <div className="mt-6 flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/biometric-login")}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-primary/50 transition-colors"
                        >
                            <ScanFace size={32} className="text-primary" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Face ID / Touch ID</span>
                        </motion.button>
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm">
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
