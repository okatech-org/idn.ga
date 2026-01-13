import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProfileSelection from "./pages/onboarding/ProfileSelection";
import KYCVerification from "./pages/onboarding/KYCVerification";
import SelfieVerification from "./pages/onboarding/SelfieVerification";
import PinCreation from "./pages/onboarding/PinCreation";
import Success from "./pages/onboarding/Success";
import Dashboard from "./pages/dashboard/Home";
import IDocumentPage from "./pages/documents/IDocumentPage";
import DocumentDetail from "./pages/documents/DocumentDetail";
import AddDocument from "./pages/documents/AddDocument";
import RequestDocument from "./pages/documents/RequestDocument";
import DocumentVault from "./pages/documents/DocumentVault";
import DigitalID from "./pages/id-card/DigitalID";
import CVDashboard from "./pages/cv/CVDashboard";
import EditCV from "./pages/cv/EditCV";
import ICVPage from "./pages/cv/iCVPage";
import GeneralSettings from "./pages/settings/GeneralSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import NotificationCenter from "./pages/notifications/NotificationCenter";
import ICartePage from "./pages/icarte/ICartePage";
import HealthCNAMGSPage from "./pages/health/HealthCNAMGSPage";
import ConsularPage from "./pages/consular/ConsularPage";
import IBoitePage from "./pages/iboite/IBoitePage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import ControllerDashboardLegacy from "@/pages/admin/ControllerDashboard";
import ControllerSpace from "./pages/ControllerSpace";
import DemoPage from "./pages/DemoPage";
import IAstedPage from "./pages/IAstedPage";
import Login from "@/pages/auth/Login";
import BiometricLogin from "@/pages/auth/BiometricLogin";
import OAuthAuthorize from "@/pages/oauth/Authorize";
import DeveloperPortal from "@/pages/oauth/DeveloperPortal";

// New Controller Pages
import {
  ControllerLayout,
  ControllerDashboard,
  ControllerQueuePage,
  ControllerHistoryPage,
  ControllerScannerPage,
  ControllerSettingsPage
} from "./pages/controller";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SuperAdminFloatingButton } from "@/components/admin/SuperAdminFloatingButton";

const queryClient = new QueryClient();

const App = () => (
  // Force refresh
  <ThemeProvider>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Onboarding */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding/profile" element={<ProfileSelection />} />
              <Route path="/onboarding/kyc" element={<KYCVerification />} />
              <Route path="/onboarding/selfie" element={<SelfieVerification />} />
              <Route path="/onboarding/pin" element={<PinCreation />} />
              <Route path="/onboarding/success" element={<Success />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/biometric-login" element={<BiometricLogin />} />

              {/* Dashboard & Main App */}
              <Route path="/profil" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/profil" replace />} />
              <Route path="/idocument" element={<IDocumentPage />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/documents/add" element={<AddDocument />} />
              <Route path="/documents/request" element={<RequestDocument />} />
              <Route path="/id-card" element={<DigitalID />} />
              <Route path="/icv" element={<ICVPage />} />
              <Route path="/icv/edit" element={<ICVPage />} />
              <Route path="/icv/dashboard" element={<CVDashboard />} />
              <Route path="/parametres" element={<GeneralSettings />} />
              <Route path="/settings" element={<Navigate to="/parametres" replace />} />
              <Route path="/settings/security" element={<SecuritySettings />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/icarte" element={<ICartePage />} />
              <Route path="/health/cnamgs" element={<HealthCNAMGSPage />} />
              <Route path="/consular" element={<ConsularPage />} />
              <Route path="/vault" element={<DocumentVault />} />
              <Route path="/iboite" element={<IBoitePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/verifications" element={<AdminDashboard />} />

              {/* New Controller Space with nested routes */}
              <Route path="/controller" element={<ControllerLayout />}>
                <Route index element={<ControllerDashboard />} />
                <Route path="queue" element={<ControllerQueuePage />} />
                <Route path="history" element={<ControllerHistoryPage />} />
                <Route path="scanner" element={<ControllerScannerPage />} />
                <Route path="settings" element={<ControllerSettingsPage />} />
              </Route>

              {/* Legacy routes */}
              <Route path="/controller-legacy" element={<ControllerDashboardLegacy />} />
              <Route path="/controller-old" element={<ControllerSpace />} />
              <Route path="/demo" element={<DemoPage />} />

              {/* iAsted - Keeping the existing route for reference/testing */}
              <Route path="/iasted" element={<IAstedPage />} />

              {/* OAuth 2.0 / OpenID Connect */}
              <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
              <Route path="/developers" element={<DeveloperPortal />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Components like iAsted Button can be placed here if they need to persist */}
            <SuperAdminFloatingButton />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;

