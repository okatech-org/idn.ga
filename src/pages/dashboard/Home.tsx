import { useState } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import {
  FileText,
  User,
  QrCode,
  Scan,
  Bell,
  Settings,
  ChevronRight,
  Shield,
  CheckCircle2,
  CreditCard,
  Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CompactWallet from "@/components/dashboard/DigitalWallet";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();

  // User profile data (mock - replace with actual user context/API)
  const user = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    photoUrl: "https://github.com/shadcn.png",
    level: 3,
    stats: { documents: 12, services: 4, cvScore: 78 }
  };

  const stats = [
    { label: "Documents", value: String(user.stats.documents), color: "text-blue-500", onClick: () => navigate("/idocument") },
    { label: "Services", value: String(user.stats.services), color: "text-green-500", onClick: () => navigate("/parametres?tab=applications") },
    { label: "Score CV", value: `${user.stats.cvScore}%`, color: "text-amber-500", onClick: () => navigate("/icv") }
  ];

  const quickActions = [
    { id: "documents", icon: FileText, label: "Documents", onClick: () => navigate("/idocument"), color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "cv", icon: User, label: "Mon CV", onClick: () => navigate("/icv"), color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "cartes", icon: CreditCard, label: "Mes Cartes", onClick: () => navigate("/icarte"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "boite", icon: Mail, label: "iBoîte", onClick: () => navigate("/iboite"), color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "qrcode", icon: QrCode, label: "Mon QR", onClick: () => navigate("/id-card"), color: "text-green-500", bg: "bg-green-500/10" },
    { id: "scanner", icon: Scan, label: "Scanner", onClick: () => toast.info("Fonctionnalité Scanner bientôt disponible"), color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <UserSpaceLayout>
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-bold text-foreground">iProfil</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/notifications")}
              className={cn(
                "relative p-2 rounded-lg transition-all",
                "bg-white/90 dark:bg-white/5 backdrop-blur-sm",
                "border border-slate-300/80 dark:border-white/10",
                "shadow-sm hover:shadow-md",
                "hover:border-primary/40 hover:bg-white"
              )}
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-muted-foreground" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className={cn(
                "p-2 rounded-lg transition-all",
                "bg-white/90 dark:bg-white/5 backdrop-blur-sm",
                "border border-slate-300/80 dark:border-white/10",
                "shadow-sm hover:shadow-md",
                "hover:border-primary/40 hover:bg-white"
              )}
            >
              <Settings className="w-5 h-5 text-slate-600 dark:text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Content - 2:1 ratio (profile 2/3, wallet 1/3) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Left: Profile + Quick Actions (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-4 rounded-2xl flex flex-col lg:col-span-2",
              "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
              "border border-slate-300/80 dark:border-white/10",
              "shadow-md dark:shadow-none"
            )}
          >
            {/* Profile Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-300/60 dark:border-white/10">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20">
                  <img
                    src="https://github.com/shadcn.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-foreground truncate">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-slate-500 dark:text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">Niveau {user.level}</span>
                </div>
              </div>
              <button onClick={() => navigate("/settings")} className="p-2 rounded-lg hover:bg-slate-200/80 dark:hover:bg-white/5 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-500 dark:text-muted-foreground" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-300/60 dark:border-white/10">
              {stats.map((stat) => (
                <button
                  key={stat.label}
                  onClick={stat.onClick}
                  className="text-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground uppercase font-medium">{stat.label}</p>
                </button>
              ))}
            </div>

            {/* Quick Actions - 3x2 grid */}
            <div className="flex-1 pt-4">
              <p className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-wider mb-3">Actions Rapides</p>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={action.onClick}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-3 rounded-xl text-center transition-all",
                      "bg-slate-100/90 dark:bg-white/5",
                      "hover:bg-slate-200/90 dark:hover:bg-white/10",
                      "border border-slate-300/60 dark:border-transparent",
                      "shadow-sm hover:shadow-md",
                      "group"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2", action.bg)}>
                      <action.icon className={cn("w-6 h-6", action.color)} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Wallet (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-4 rounded-2xl flex flex-col",
              "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
              "border border-slate-300/80 dark:border-white/10",
              "shadow-md dark:shadow-none"
            )}
          >
            <p className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-wider mb-3">Porte-Cartes</p>
            <div className="flex-1 overflow-hidden">
              <CompactWallet onCardClick={(id) => console.log("Card:", id)} />
            </div>
          </motion.div>
        </div>

        {/* Bottom: Accès Rapides - Favorite sites/apps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "shrink-0 p-4 rounded-xl",
            "bg-white/95 dark:bg-white/5 backdrop-blur-sm",
            "border border-slate-300/80 dark:border-white/10",
            "shadow-sm dark:shadow-none"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-600 dark:text-muted-foreground uppercase tracking-wider">Accès Rapides</p>
            <button
              onClick={() => navigate("/settings")}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Gérer
            </button>
          </div>
          <div className="flex gap-3 mt-3">
            {[
              { id: "mairie", name: "Mairie", url: "https://mairie.ga", icon: "🏛️", color: "bg-emerald-500/10 ring-emerald-500/30" },
              { id: "impots", name: "Impôts", url: "https://dgi.ga", icon: "💰", color: "bg-blue-500/10 ring-blue-500/30" },
              { id: "cnss", name: "CNSS", url: "https://cnss.ga", icon: "🏥", color: "bg-red-500/10 ring-red-500/30" },
              { id: "emploi", name: "Emploi", url: "https://one.ga", icon: "💼", color: "bg-indigo-500/10 ring-indigo-500/30" },
            ].map((site) => (
              <button
                key={site.id}
                onClick={() => window.open(site.url, "_blank")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg text-center transition-all",
                  "bg-slate-100/90 dark:bg-white/5",
                  "hover:bg-slate-200/90 dark:hover:bg-white/10",
                  "border border-slate-300/60 dark:border-transparent",
                  "shadow-sm hover:shadow-md hover:scale-[1.02]",
                  "ring-1", site.color
                )}
              >
                <span className="text-2xl mb-1 block">{site.icon}</span>
                <p className="text-sm font-semibold text-foreground">{site.name}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </UserSpaceLayout>
  );
};

export default Dashboard;
