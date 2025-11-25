import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogIn, Shield, Users, Lock, FileText, Calendar, Mail, UserCheck, Lightbulb, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleFeedbackModal } from "@/components/RoleFeedbackModal";
import emblemGabon from "@/assets/emblem_gabon.png";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useTheme } from "next-themes";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];
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

interface DemoAccount {
  role: string;
  level: string;
  email: string;
  password: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const Demo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { prefetchPresidentSpace, prefetchDashboard } = usePrefetch();
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ role: string; email: string } | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [initializingAccounts, setInitializingAccounts] = useState(false);

  useEffect(() => {
    setMounted(true);
    
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
          await supabase.functions.invoke('initialize-demo-accounts', {
            body: {},
          });
          console.log('Demo accounts auto-initialized');
        }
      } catch (error) {
        console.error('Auto-initialization failed:', error);
      }
    };
    
    initializeAccounts();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const demoAccounts: DemoAccount[] = [
    {
      role: "Administrateur Système IDN.GA",
      level: "Système IDN",
      email: "idn.admin@gabon.ga",
      password: "IDNAdmin2025!",
      description: "**Administration complète du système IDN.GA** - Gestion de l'identité numérique nationale.\n\n**Attributions :**\n• Gestion de tous les citoyens inscrits\n• Supervision de tous les documents d'identité\n• Accès aux statistiques globales\n• Configuration du système\n• Gestion des contrôleurs d'identité\n\n**Missions :**\n• Assurer la fiabilité du système d'identité\n• Superviser les opérations quotidiennes\n• Garantir la sécurité des données\n• Optimiser les processus",
      icon: <Shield className="h-6 w-6" />,
      color: "from-primary to-primary/80",
    },
    {
      role: "Contrôleur d'Identité",
      level: "Émission & Vérification",
      email: "controleur.idn@gabon.ga",
      password: "Controleur2025!",
      description: "**Traitement des demandes de documents** et vérification d'identité.\n\n**Attributions :**\n• Traiter les demandes de CNI, passeports, actes de naissance\n• Vérifier l'identité des demandeurs\n• Émettre les documents officiels\n• Valider les pièces justificatives\n• Enregistrer les vérifications\n\n**Missions :**\n• Assurer la conformité des demandes\n• Détecter les fraudes potentielles\n• Garantir la qualité des documents émis\n• Respecter les délais de traitement",
      icon: <UserCheck className="h-6 w-6" />,
      color: "from-secondary to-secondary/80",
    },
    {
      role: "Citoyen Test",
      level: "Utilisateur",
      email: "citoyen.test@gabon.ga",
      password: "Citoyen2025!",
      description: "**Espace citoyen** pour consulter ses documents et faire des demandes.\n\n**Attributions :**\n• Consulter mes documents d'identité\n• Faire une demande de nouveau document\n• Suivre l'état de mes demandes\n• Télécharger mes documents numériques\n• Mettre à jour mes informations\n\n**Missions :**\n• Gérer son identité numérique\n• Effectuer des demandes en ligne\n• Suivre l'avancement des dossiers",
      icon: <Users className="h-6 w-6" />,
      color: "from-muted to-muted/80",
    },
  ];

  const handleLogin = async (email: string, password: string) => {
    setLoadingAccount(email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: "Identifiants incorrects ou compte non créé. Veuillez contacter l'administrateur.",
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
          // Hiérarchie des rôles: president > admin > system_admin > identity_controller > autres
          const roleHierarchy: AppRole[] = ['president', 'admin', 'system_admin', 'identity_controller', 'dgss', 'dgr', 'cabinet_private', 'sec_gen', 'minister', 'protocol', 'courrier', 'reception', 'citizen', 'user'];
          const userRoles = roles.map(r => r.role as AppRole);
          
          // Trouver le rôle le plus élevé dans la hiérarchie
          const userRole = roleHierarchy.find(role => userRoles.includes(role)) || 'user';

          switch (userRole) {
            case 'president':
              destination = "/president-space";
              break;
            case 'admin':
              destination = "/admin-space";
              break;
            case 'system_admin':
              destination = "/idn-admin-space";
              break;
            case 'identity_controller':
              destination = "/idn-controller-space";
              break;
            case 'citizen':
              destination = "/citizen-space";
              break;
            case 'dgss':
              destination = "/dgss-space";
              break;
            case 'dgr':
              destination = "/cabinet-director-space";
              break;
            case 'minister':
              destination = "/protocol-director-space";
              break;
            case 'cabinet_private':
              destination = "/private-cabinet-director-space";
              break;
            case 'sec_gen':
              destination = "/secretariat-general-space";
              break;
            case 'courrier':
              destination = "/service-courriers-space";
              break;
            case 'reception':
              destination = "/service-reception-space";
              break;
            case 'protocol':
              destination = "/protocol-director-space";
              break;
            case 'user':
              destination = "/dashboard";
              break;
            default:
              destination = "/dashboard";
              break;
          }
        }

        toast({
          title: "Connexion réussie",
          description: `Bienvenue !`,
        });

        navigate(destination, {
          replace: true,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setLoadingAccount(null);
    }
  };

  const copyCredentials = (email: string, password: string) => {
    const credentials = `Email: ${email}\nMot de passe: ${password}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Identifiants copiés",
      description: "Les identifiants ont été copiés dans votre presse-papiers",
    });
  };

  const handleOpenFeedback = (role: string, email: string) => {
    setSelectedAccount({ role, email });
    setFeedbackModalOpen(true);
  };

  const handleInitializeDemoAccounts = async () => {
    setInitializingAccounts(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentification requise",
          description: "Veuillez d'abord vous connecter avec un compte administrateur",
          variant: "destructive",
        });
        setInitializingAccounts(false);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        toast({
          title: "Accès refusé",
          description: "Seuls les administrateurs peuvent initialiser les comptes démo",
          variant: "destructive",
        });
        setInitializingAccounts(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('initialize-demo-accounts', {
        body: {},
      });

      if (error) {
        throw error;
      }

      const results = data?.results;

      toast({
        title: "Comptes démo initialisés",
        description: `Créés: ${results?.created?.length || 0}, Existants: ${results?.existing?.length || 0}, Erreurs: ${results?.errors?.length || 0}`,
      });

      console.log('Initialization results:', data);

    } catch (error) {
      console.error('Error initializing demo accounts:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser les comptes démo",
        variant: "destructive",
      });
    } finally {
      setInitializingAccounts(false);
    }
  };

  const handleAdminClick = () => {
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);

    if (newClicks === 2) {
      setShowAdminDialog(true);
      setAdminClicks(0);
    }

    setTimeout(() => {
      setAdminClicks(0);
    }, 2000);
  };

  const handleAdminCodeChange = async (value: string) => {
    setAdminCode(value);

    if (value.length === 6) {
      if (value !== "011282") {
        toast({
          title: "Code incorrect",
          description: "Le code maître est invalide",
          variant: "destructive",
        });
        setAdminCode("");
        return;
      }

      try {
        // 1) Connexion automatique avec le compte Président (compte technique)
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: "president@presidence.ga",
          password: "President2025!",
        });

        if (authError) {
          console.error("Erreur de connexion auto admin:", authError);
          toast({
            title: "Erreur de connexion",
            description: "Impossible de se connecter au compte administrateur.",
            variant: "destructive",
          });
          setAdminCode("");
          return;
        }

        // 2) Appel de la fonction sécurisée qui attribue le rôle admin
        const { data, error } = await supabase.functions.invoke("secure-admin-access", {
          body: { password: value },
        });

        if (error) {
          console.error("Erreur secure-admin-access:", error);
          throw error;
        }

        toast({
          title: "✅ Accès Admin Système",
          description: (data as any)?.message ?? "Bienvenue Administrateur",
          duration: 2000,
        });

        setShowAdminDialog(false);
        setAdminCode("");

        setTimeout(() => {
          navigate("/admin-space");
        }, 500);
      } catch (err: any) {
        console.error("Erreur lors de la validation du code admin:", err);
        toast({
          title: "Code incorrect",
          description: "Le code maître est invalide",
          variant: "destructive",
        });
        setAdminCode("");
      }
    }
  };
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 transition-colors duration-300">
      {/* Header */}
      <header className="neu-card backdrop-blur-xl sticky top-0 z-50 mb-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="neu-raised hover:shadow-neo-md transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <div className="flex items-center gap-3">
                <div className="neu-raised w-12 h-12 rounded-full flex items-center justify-center p-2">
                  <img
                    src={emblemGabon}
                    alt="Emblème de la République Gabonaise"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    Comptes Démo
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Testez l'application avec différents niveaux d'accès
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="neu-raised rounded-full w-10 h-10"
            >
              {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Comptes de Démonstration IDN.GA</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Explorez le système d'identité numérique gabonais avec différents rôles. Chaque compte offre
            une vue et des fonctionnalités spécifiques selon les responsabilités du poste.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <div className="neu-inset px-6 py-3 rounded-xl">
              <div className="inline-flex items-center gap-2 text-warning">
                <Lock className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Ces comptes sont uniquement pour la démonstration. Les données sont fictives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {demoAccounts.map((account, index) => (
            <div
              key={index}
              className="neu-card p-6 hover:shadow-neo-lg transition-smooth animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`neu-raised p-3 rounded-xl bg-gradient-to-br ${account.color} text-white`}>
                  {account.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{account.role}</h3>
                  <Badge variant="secondary" className="neu-raised text-xs">
                    {account.level}
                  </Badge>
                </div>
              </div>

              <div className="mb-6 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {account.description}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 neu-inset hover:shadow-neo-sm transition-all"
                  onClick={() => handleOpenFeedback(account.role, account.email)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Contribuer
                </Button>
                <Button
                  className="flex-1 neu-raised bg-primary text-primary-foreground hover:shadow-neo-md transition-all"
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
                  {loadingAccount === account.email ? "Connexion..." : "Se connecter"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-12 neu-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Comment tester ?</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAdminClick}
              className="neu-raised rounded-full w-10 h-10 text-muted-foreground hover:text-foreground"
            >
              <Lock className="h-5 w-5" />
            </Button>
          </div>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full neu-raised bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>Choisissez un compte de démonstration ci-dessus</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full neu-raised bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>Copiez les identifiants (email et mot de passe)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full neu-raised bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>Cliquez sur "Se connecter" pour accéder à la page d'authentification</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full neu-raised bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                4
              </span>
              <span>Collez les identifiants et découvrez l'interface selon le rôle choisi</span>
            </li>
          </ol>
        </div>
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
        <DialogContent className="sm:max-w-md neu-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Accès Administrateur Système
            </DialogTitle>
            <DialogDescription>
              Entrez le code à 6 chiffres pour accéder à l'administration
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <InputOTP
              maxLength={6}
              value={adminCode}
              onChange={handleAdminCodeChange}
            >
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
