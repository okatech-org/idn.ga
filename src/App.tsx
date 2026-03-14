import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SuperAdminFloatingButton } from "@/components/admin/SuperAdminFloatingButton";

// ─── Loading Fallback ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Chargement…</p>
    </div>
  </div>
);

// ─── Lazy-loaded Pages ───────────────────────────────────────────────
// Public
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("@/pages/auth/Login"));
const BiometricLogin = lazy(() => import("@/pages/auth/BiometricLogin"));
const DemoPage = lazy(() => import("./pages/DemoPage"));

// Onboarding
const ProfileSelection = lazy(() => import("./pages/onboarding/ProfileSelection"));
const KYCVerification = lazy(() => import("./pages/onboarding/KYCVerification"));
const SelfieVerification = lazy(() => import("./pages/onboarding/SelfieVerification"));
const PinCreation = lazy(() => import("./pages/onboarding/PinCreation"));
const Success = lazy(() => import("./pages/onboarding/Success"));

// Dashboard & Main App
const Dashboard = lazy(() => import("./pages/dashboard/Home"));
const IDocumentPage = lazy(() => import("./pages/documents/IDocumentPage"));
const DocumentDetail = lazy(() => import("./pages/documents/DocumentDetail"));
const AddDocument = lazy(() => import("./pages/documents/AddDocument"));
const RequestDocument = lazy(() => import("./pages/documents/RequestDocument"));
const DocumentVault = lazy(() => import("./pages/documents/DocumentVault"));
const DigitalID = lazy(() => import("./pages/id-card/DigitalID"));
const CVDashboard = lazy(() => import("./pages/cv/CVDashboard"));
const ICVPage = lazy(() => import("./pages/cv/iCVPage"));
const GeneralSettings = lazy(() => import("./pages/settings/GeneralSettings"));
const SecuritySettings = lazy(() => import("./pages/settings/SecuritySettings"));
const NotificationCenter = lazy(() => import("./pages/notifications/NotificationCenter"));
const ICartePage = lazy(() => import("./pages/icarte/ICartePage"));
const HealthCNAMGSPage = lazy(() => import("./pages/health/HealthCNAMGSPage"));
const ConsularPage = lazy(() => import("./pages/consular/ConsularPage"));
const IBoitePage = lazy(() => import("./pages/iboite/IBoitePage"));
const IAstedPage = lazy(() => import("./pages/IAstedPage"));

// Admin
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));

// Controller
const ControllerSpace = lazy(() => import("./pages/ControllerSpace"));

// Controller v2 (nested layout)
const ControllerLayout = lazy(() =>
  import("./pages/controller").then((m) => ({ default: m.ControllerLayout }))
);
const ControllerDashboard = lazy(() =>
  import("./pages/controller").then((m) => ({ default: m.ControllerDashboard }))
);
const ControllerQueuePage = lazy(() =>
  import("./pages/controller").then((m) => ({ default: m.ControllerQueuePage }))
);
const ControllerHistoryPage = lazy(() =>
  import("./pages/controller").then((m) => ({
    default: m.ControllerHistoryPage,
  }))
);
const ControllerScannerPage = lazy(() =>
  import("./pages/controller").then((m) => ({
    default: m.ControllerScannerPage,
  }))
);
const ControllerSettingsPage = lazy(() =>
  import("./pages/controller").then((m) => ({
    default: m.ControllerSettingsPage,
  }))
);

// OAuth
const OAuthAuthorize = lazy(() => import("@/pages/oauth/Authorize"));
const DeveloperPortal = lazy(() => import("@/pages/oauth/DeveloperPortal"));

// ─── Query Client ────────────────────────────────────────────────────
const queryClient = new QueryClient();

// ─── App ─────────────────────────────────────────────────────────────
const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public ─────────────────────────────────── */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth" element={<Login />} />
                  <Route path="/biometric-login" element={<BiometricLogin />} />
                  <Route path="/demo" element={<DemoPage />} />

                  {/* ── Onboarding ─────────────────────────────── */}
                  <Route path="/onboarding/profile" element={<ProfileSelection />} />
                  <Route path="/onboarding/kyc" element={<KYCVerification />} />
                  <Route path="/onboarding/selfie" element={<SelfieVerification />} />
                  <Route path="/onboarding/pin" element={<PinCreation />} />
                  <Route path="/onboarding/success" element={<Success />} />

                  {/* ── Protected: Dashboard & App ─────────────── */}
                  <Route element={<ProtectedRoute />}>
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
                    <Route path="/iasted" element={<IAstedPage />} />
                  </Route>

                  {/* ── Protected: Admin ────────────────────────── */}
                  <Route element={<ProtectedRoute requiredRole="admin" />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/verifications" element={<AdminDashboard />} />
                  </Route>

                  {/* ── Protected: Controller ───────────────────── */}
                  <Route element={<ProtectedRoute requiredRole="controller" />}>
                    <Route path="/controller" element={<ControllerLayout />}>
                      <Route index element={<ControllerDashboard />} />
                      <Route path="queue" element={<ControllerQueuePage />} />
                      <Route path="history" element={<ControllerHistoryPage />} />
                      <Route path="scanner" element={<ControllerScannerPage />} />
                      <Route path="settings" element={<ControllerSettingsPage />} />
                    </Route>
                  </Route>

                  {/* ── OAuth (public endpoints) ────────────────── */}
                  <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
                  <Route path="/developers" element={<DeveloperPortal />} />

                  {/* ── Fallback ────────────────────────────────── */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>

              <SuperAdminFloatingButton />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
