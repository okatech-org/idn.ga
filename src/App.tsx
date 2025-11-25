import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/onboarding/Splash";
import ProfileSelection from "./pages/onboarding/ProfileSelection";
import KYCVerification from "./pages/onboarding/KYCVerification";
import SelfieVerification from "./pages/onboarding/SelfieVerification";
import PinCreation from "./pages/onboarding/PinCreation";
import Success from "./pages/onboarding/Success";
import Dashboard from "./pages/dashboard/Home";
import DocumentList from "./pages/documents/DocumentList";
import DocumentDetail from "./pages/documents/DocumentDetail";
import AddDocument from "./pages/documents/AddDocument";
import DigitalID from "./pages/id-card/DigitalID";
import CVDashboard from "./pages/cv/CVDashboard";
import EditCV from "./pages/cv/EditCV";
import GeneralSettings from "./pages/settings/GeneralSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import NotificationCenter from "./pages/notifications/NotificationCenter";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import ControllerDashboard from "@/pages/admin/ControllerDashboard";
import DemoPage from "./pages/DemoPage";
import IAstedPage from "./pages/IAstedPage";
import Login from "@/pages/auth/Login";
import BiometricLogin from "@/pages/auth/BiometricLogin";

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
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding/profile" element={<ProfileSelection />} />
              <Route path="/onboarding/kyc" element={<KYCVerification />} />
              <Route path="/onboarding/selfie" element={<SelfieVerification />} />
              <Route path="/onboarding/pin" element={<PinCreation />} />
              <Route path="/onboarding/success" element={<Success />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/biometric-login" element={<BiometricLogin />} />

              {/* Dashboard & Main App */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/documents/add" element={<AddDocument />} />
              <Route path="/id-card" element={<DigitalID />} />
              <Route path="/cv" element={<CVDashboard />} />
              <Route path="/cv/edit" element={<EditCV />} />
              <Route path="/settings" element={<GeneralSettings />} />
              <Route path="/settings/security" element={<SecuritySettings />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/verifications" element={<AdminDashboard />} /> {/* Reusing Dashboard for now as queue is there */}
              <Route path="/controller" element={<ControllerDashboard />} />
              <Route path="/demo" element={<DemoPage />} />

              {/* iAsted - Keeping the existing route for reference/testing */}
              <Route path="/iasted" element={<IAstedPage />} />

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
