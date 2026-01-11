import { useState } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import {
  FileText,
  User,
  QrCode,
  Plus,
  Scan,
  Globe,
  Bell,
  Settings,
  ChevronRight,
  Shield,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExternalConnectionModal from "@/components/modals/ExternalConnectionModal";
import CompactWallet from "@/components/dashboard/DigitalWallet";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const stats = [
    { label: "Documents", value: "12", color: "text-blue-500" },
    { label: "Services", value: "4", color: "text-green-500" },
    { label: "Score CV", value: "78%", color: "text-amber-500" }
  ];

  const quickActions = [
    { id: "documents", icon: FileText, label: "Documents", onClick: () => navigate("/documents"), color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "cv", icon: User, label: "Mon CV", onClick: () => navigate("/cv"), color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "scanner", icon: Scan, label: "Scanner", onClick: () => { }, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "request", icon: Plus, label: "Demander", onClick: () => navigate("/documents/request"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "qrcode", icon: QrCode, label: "Mon QR", onClick: () => navigate("/id-card"), color: "text-green-500", bg: "bg-green-500/10" },
    { id: "services", icon: Globe, label: "Services", onClick: () => setShowApiModal(true), color: "text-indigo-500", bg: "bg-indigo-500/10" }
  ];

  const services = [
    { id: "impots", name: "Impôts", connected: true },
    { id: "cnss", name: "CNSS", connected: false },
    { id: "sante", name: "Santé", connected: true }
  ];

  return (
    <UserSpaceLayout>
      <ExternalConnectionModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        serviceName={selectedService || "Service"}
        serviceUrl={`https://${selectedService}.ga/auth/callback`}
      />

      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-foreground">iProfil</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/notifications")}
              className={cn(
                "relative p-2 rounded-lg transition-all",
                "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                "border border-slate-200/60 dark:border-white/10",
                "hover:border-primary/30"
              )}
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className={cn(
                "p-2 rounded-lg transition-all",
                "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
                "border border-slate-200/60 dark:border-white/10",
                "hover:border-primary/30"
              )}
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
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
              "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
              "border border-slate-200/60 dark:border-white/10"
            )}
          >
            {/* Profile Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-white/10">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary/20">
                  <img
                    src="https://github.com/shadcn.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm text-foreground truncate">Jean Dupont</h2>
                <p className="text-[10px] text-muted-foreground truncate">jean.dupont@example.com</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Shield className="w-2.5 h-2.5 text-green-500" />
                  <span className="text-[9px] font-semibold text-green-500">Niveau 3</span>
                </div>
              </div>
              <button onClick={() => navigate("/settings")} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-200/60 dark:border-white/10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={cn("text-sm font-bold", stat.color)}>{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions - 3x2 grid */}
            <div className="flex-1 pt-3">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Actions Rapides</p>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={action.onClick}
                    className={cn(
                      "p-2 rounded-xl text-center transition-all",
                      "bg-slate-100/50 dark:bg-white/5",
                      "hover:bg-slate-200/50 dark:hover:bg-white/10",
                      "border border-transparent hover:border-primary/20",
                      "group"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1", action.bg)}>
                      <action.icon className={cn("w-3.5 h-3.5", action.color)} />
                    </div>
                    <p className="text-[9px] font-medium text-foreground">{action.label}</p>
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
              "p-3 rounded-2xl flex flex-col",
              "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
              "border border-slate-200/60 dark:border-white/10"
            )}
          >
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Porte-Cartes</p>
            <div className="flex-1 overflow-hidden">
              <CompactWallet onCardClick={(id) => console.log("Card:", id)} />
            </div>
          </motion.div>
        </div>

        {/* Bottom: Services - Compact Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "shrink-0 p-3 rounded-xl",
            "bg-white/60 dark:bg-white/5 backdrop-blur-sm",
            "border border-slate-200/60 dark:border-white/10"
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Services Publics</p>
            <button className="text-[9px] text-primary font-medium hover:underline">Tout voir</button>
          </div>
          <div className="flex gap-2 mt-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => { setSelectedService(service.id); setShowApiModal(true); }}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-center transition-all",
                  "bg-slate-100/50 dark:bg-white/5",
                  "hover:bg-slate-200/50 dark:hover:bg-white/10",
                  "border border-transparent"
                )}
              >
                <p className="text-[10px] font-medium text-foreground">{service.name}</p>
                <p className={cn("text-[8px] mt-0.5", service.connected ? "text-green-500" : "text-muted-foreground")}>
                  {service.connected ? "Connecté" : "Non connecté"}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </UserSpaceLayout>
  );
};

export default Dashboard;
