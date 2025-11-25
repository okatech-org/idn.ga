import { useState } from "react";
import UserSpaceLayout from "@/components/layout/UserSpaceLayout";
import { FileText, User, QrCode, History, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExternalConnectionModal from "@/components/modals/ExternalConnectionModal";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActionCard from "@/components/dashboard/QuickActionCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showApiModal, setShowApiModal] = useState(false);

  return (
    <UserSpaceLayout>
      <ExternalConnectionModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        serviceName="impots.ga"
        serviceUrl="https://impots.ga/auth/callback"
      />
      <div className="space-y-8 pb-24">
        {/* Header */}
        <DashboardHeader
          userName="Jean Dupont"
          userRole="Citoyen Gabonais"
        />

        {/* ID Card Preview */}
        <div onClick={() => navigate("/id-card")} className="cursor-pointer group">
          <div className="w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-primary to-green-700 p-6 text-white shadow-xl relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-inner">
                  <span className="font-bold text-sm">GA</span>
                </div>
                <span className="text-xs font-bold tracking-[0.2em] opacity-90">RÉPUBLIQUE GABONAISE</span>
              </div>
              <QrCode className="w-10 h-10 text-white/90 drop-shadow-md" />
            </div>

            <div className="flex items-end space-x-5 mt-4 relative z-10">
              <div className="w-24 h-28 bg-gray-300 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg">
                <img src="https://github.com/shadcn.png" alt="ID" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2 pb-1">
                <div>
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">Nom & Prénom</p>
                  <p className="font-bold text-lg leading-none text-white drop-shadow-sm">DUPONT Jean</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">NIP</p>
                  <p className="font-mono text-base tracking-widest text-white/90 drop-shadow-sm">1234 5678 9012</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 ml-1 uppercase tracking-wide">Accès Rapide</h3>
          <div className="grid grid-cols-2 gap-5">
            <QuickActionCard
              icon={FileText}
              label="Mes Documents"
              subLabel="12 documents"
              onClick={() => navigate("/documents")}
              colorClass="text-blue-600 dark:text-blue-400"
              bgClass="bg-blue-50 dark:bg-blue-900/20"
            />

            <QuickActionCard
              icon={User}
              label="Mon CV"
              subLabel="78% complété"
              onClick={() => navigate("/cv")}
              colorClass="text-yellow-600 dark:text-yellow-400"
              bgClass="bg-yellow-50 dark:bg-yellow-900/20"
            />

            <QuickActionCard
              icon={History}
              label="Historique"
              subLabel="Dernière: 10:42"
              colorClass="text-purple-600 dark:text-purple-400"
              bgClass="bg-purple-50 dark:bg-purple-900/20"
            />

            <QuickActionCard
              icon={QrCode}
              label="Scanner"
              subLabel="Vérifier un doc"
              colorClass="text-gray-600 dark:text-gray-400"
              bgClass="bg-gray-100 dark:bg-gray-800"
            />

            <QuickActionCard
              icon={Globe}
              label="Connexion Externe"
              subLabel="Simuler une authentification API"
              onClick={() => setShowApiModal(true)}
              colorClass="text-indigo-600 dark:text-indigo-400"
              bgClass="bg-indigo-50 dark:bg-indigo-900/20"
              className="col-span-2 flex-row space-y-0 space-x-4 justify-start px-6"
            />
          </div>
        </div>
      </div>
    </UserSpaceLayout>
  );
};

export default Dashboard;
