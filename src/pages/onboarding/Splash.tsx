import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Smartphone, Globe, Monitor, Laptop, ShieldCheck } from "lucide-react";

const Splash = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-primary/90 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10 flex flex-col items-center text-center space-y-8"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-32 h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-4 relative overflow-hidden"
                >
                    {/* Logo Representation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-yellow-400 to-blue-500 opacity-20"></div>
                    <span className="text-4xl font-bold text-primary relative z-10">IDN</span>
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-md">IDN.GA</h1>
                    <p className="text-xl text-white/90 font-light tracking-wide">
                        Votre identité, partout avec vous
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-full max-w-xs pt-12 space-y-4"
                >
                    <Button
                        className="w-full h-14 text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg transition-all hover:scale-105"
                        onClick={() => navigate("/onboarding/profile")}
                    >
                        Commencer
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => navigate("/demo")}
                    >
                        Mode Démo
                    </Button>
                </motion.div>

                {/* Download Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="w-full max-w-md mt-12 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
                >
                    <div className="text-sm font-medium text-white/80 mb-4 uppercase tracking-wider">Télécharger l'application</div>

                    <Tabs defaultValue="citizens" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-4">
                            <TabsTrigger value="citizens" className="data-[state=active]:bg-white/20 text-white">Citoyens</TabsTrigger>
                            <TabsTrigger value="agents" className="data-[state=active]:bg-white/20 text-white">Agents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="citizens" className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/20 hover:text-white text-white/90 border-0">
                                    <Apple className="w-6 h-6" />
                                    <span className="text-[10px]">App Store</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/20 hover:text-white text-white/90 border-0">
                                    <Smartphone className="w-6 h-6" />
                                    <span className="text-[10px]">Play Store</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/20 hover:text-white text-white/90 border-0">
                                    <Globe className="w-6 h-6" />
                                    <span className="text-[10px]">Web / PWA</span>
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="agents" className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/20 hover:text-white text-white/90 border-0">
                                    <Monitor className="w-6 h-6" />
                                    <span className="text-[10px]">Portal Web</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/20 hover:text-white text-white/90 border-0">
                                    <Laptop className="w-6 h-6" />
                                    <span className="text-[10px]">Desktop</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-1 bg-white/5 border-white/10 hover:bg-white/20 hover:text-white text-white/90 border-0">
                                    <ShieldCheck className="w-6 h-6" />
                                    <span className="text-[10px]">Control App</span>
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </motion.div>

            <div className="absolute bottom-6 text-xs text-white/60 font-medium">
                République Gabonaise © {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default Splash;
