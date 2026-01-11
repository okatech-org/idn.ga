import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogIn, Shield, Users, Lock, UserCheck, Lightbulb, Moon, Sun, Languages, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleFeedbackModal } from "@/components/RoleFeedbackModal";
import sceauGabon from "@/assets/sceau_gabon.png";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, languages } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type AppRole = Database['public']['Enums']['app_role'];

interface DemoAccount {
  role: string;
  level: string;
  email: string;
  password: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const Demo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { prefetchPresidentSpace, prefetchDashboard } = usePrefetch();
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ role: string; email: string } | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    // Auto-initialize demo accounts on page load
    const initializeAccounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (roles && roles.length > 0) {
          await supabase.functions.invoke('initialize-demo-accounts', { body: {} });
          console.log('Demo accounts auto-initialized');
        }
      } catch (error) {
        console.error('Auto-initialization failed:', error);
      }
    };
    initializeAccounts();
  }, []);

  const demoAccounts: DemoAccount[] = [
    {
      role: "Administrateur Système IDN.GA",
      level: "Système IDN",
      email: "idn.admin@gabon.ga",
      password: "IDNAdmin2025!",
      description: "Administration complète du système IDN.GA. Gestion des citoyens, documents, statistiques et configuration.",
      icon: <Shield className="h-6 w-6" />,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      role: "Contrôleur d'Identité",
      level: "Émission & Vérification",
      email: "controleur.idn@gabon.ga",
      password: "Controleur2025!",
      description: "Traitement des demandes de documents, vérification d'identité et émission des documents officiels.",
      icon: <UserCheck className="h-6 w-6" />,
      gradient: "from-yellow-500 to-amber-600",
    },
    {
      role: "Citoyen Test",
      level: "Utilisateur",
      email: "citoyen.test@gabon.ga",
      password: "Citoyen2025!",
      description: "Espace citoyen pour consulter ses documents, faire des demandes et suivre leur état.",
      icon: <Users className="h-6 w-6" />,
      gradient: "from-blue-500 to-indigo-600",
    },
  ];

  const handleLogin = async (email: string, password: string) => {
    setLoadingAccount(email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: "Identifiants incorrects ou compte non créé.",
          variant: "destructive",
        });
        return;
      }

      if (data.session && data.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id);

        let destination = "/dashboard";

        if (roles && roles.length > 0) {
          const roleHierarchy: AppRole[] = ['president', 'admin', 'system_admin', 'identity_controller', 'dgss', 'dgr', 'cabinet_private', 'sec_gen', 'minister', 'protocol', 'courrier', 'reception', 'citizen', 'user'];
          const userRoles = roles.map(r => r.role as AppRole);
          const userRole = roleHierarchy.find(role => userRoles.includes(role)) || 'user';

          const destinations: Record<string, string> = {
            'president': '/president-space',
            'admin': '/admin-space',
            'system_admin': '/idn-admin-space',
            'identity_controller': '/idn-controller-space',
            'citizen': '/citizen-space',
            'dgss': '/dgss-space',
            'dgr': '/cabinet-director-space',
            'minister': '/protocol-director-space',
            'cabinet_private': '/private-cabinet-director-space',
            'sec_gen': '/secretariat-general-space',
            'courrier': '/service-courriers-space',
            'reception': '/service-reception-space',
            'protocol': '/protocol-director-space',
          };
          destination = destinations[userRole] || '/dashboard';
        }

        toast({ title: "Connexion réussie", description: "Bienvenue !" });
        navigate(destination, { replace: true });
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setLoadingAccount(null);
    }
  };

  const handleOpenFeedback = (role: string, email: string) => {
    setSelectedAccount({ role, email });
    setFeedbackModalOpen(true);
  };

  const handleAdminClick = () => {
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);
    if (newClicks === 2) {
      setShowAdminDialog(true);
      setAdminClicks(0);
    }
    setTimeout(() => setAdminClicks(0), 2000);
  };

  const handleAdminCodeChange = async (value: string) => {
    setAdminCode(value);
    if (value.length === 6) {
      if (value !== "011282") {
        toast({ title: "Code incorrect", description: "Le code maître est invalide", variant: "destructive" });
        setAdminCode("");
        return;
      }

      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: "president@presidence.ga",
          password: "President2025!",
        });

        if (authError) {
          toast({ title: "Erreur de connexion", description: "Impossible de se connecter.", variant: "destructive" });
          setAdminCode("");
          return;
        }

        const { data, error } = await supabase.functions.invoke("secure-admin-access", { body: { password: value } });

        if (error) throw error;

        toast({ title: "✅ Accès Admin Système", description: (data as any)?.message ?? "Bienvenue Administrateur", duration: 2000 });
        setShowAdminDialog(false);
        setAdminCode("");
        setTimeout(() => navigate("/admin-space"), 500);
      } catch (err) {
        toast({ title: "Code incorrect", description: "Le code maître est invalide", variant: "destructive" });
        setAdminCode("");
      }
    }
  };

  return (
    <div className={cn(
      "min-h-screen w-full font-sans overflow-y-auto relative transition-colors duration-500",
      "text-slate-900 dark:text-white bg-slate-50 dark:bg-black"
    )}>
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={sceauGabon} alt="Sceau du Gabon" className="h-12 w-12 lg:h-[58px] lg:w-[58px] object-contain" />
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">Comptes Démo</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">IDN.GA - Testez l'application</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn("cursor-pointer", language === lang.code && "bg-primary/10 text-primary")}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-wider border border-green-100 dark:border-green-800">
            <Zap className="w-3 h-3" /> Mode Démonstration
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Explorez IDN.GA
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Testez le système d'identité numérique avec différents rôles et niveaux d'accès.
          </p>

          <div className="mt-6 glass p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50 inline-flex items-center gap-3">
            <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Les données affichées sont fictives et à but de démonstration uniquement.
            </p>
          </div>
        </motion.div>

        {/* Demo Accounts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {demoAccounts.map((account, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white shadow-lg", account.gradient)}>
                  {account.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{account.role}</h3>
                  <Badge className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs">
                    {account.level}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                {account.description}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                  onClick={() => handleOpenFeedback(account.role, account.email)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Contribuer
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  onClick={() => handleLogin(account.email, account.password)}
                  onMouseEnter={() => {
                    if (account.role === "Président de la République") {
                      prefetchPresidentSpace();
                    } else {
                      prefetchDashboard();
                    }
                  }}
                  disabled={loadingAccount === account.email}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {loadingAccount === account.email ? "..." : "Connexion"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mt-10 glass p-6 rounded-2xl border border-slate-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Comment tester ?
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAdminClick}
              className="h-10 w-10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Lock className="h-4 w-4" />
            </Button>
          </div>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            {["Choisissez un compte ci-dessus", "Cliquez sur \"Connexion\"", "Explorez l'interface selon le rôle", "Testez les fonctionnalités disponibles"].map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </main>

      {/* Feedback Modal */}
      {selectedAccount && (
        <RoleFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          roleName={selectedAccount.role}
          userEmail={selectedAccount.email}
        />
      )}

      {/* Admin Access Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md glass border border-slate-200 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Shield className="h-5 w-5 text-primary" />
              Accès Administrateur Système
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Entrez le code à 6 chiffres pour accéder à l'administration
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <InputOTP maxLength={6} value={adminCode} onChange={handleAdminCodeChange}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Demo;
