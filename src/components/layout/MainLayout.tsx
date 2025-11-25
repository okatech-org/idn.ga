import { ReactNode } from "react";
import UserSpaceLayout from "./UserSpaceLayout";
import { useLocation } from "react-router-dom";
import { IAstedProvider } from "@/context/IAstedContext";
import IAstedOverlay from "@/components/iasted/IAstedOverlay";
import IAstedInterface from "@/components/iasted/IAstedInterface";

interface MainLayoutProps {
    children: ReactNode;
    showNav?: boolean;
    showAgent?: boolean;
}

export const MainLayout = ({
    children,
    showNav = true,
    showAgent = true
}: MainLayoutProps) => {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith("/auth") || location.pathname === "/";

    if (isAuthPage) {
        return <main className="min-h-screen bg-background">{children}</main>;
    }

    return (
        <IAstedProvider>
            <UserSpaceLayout showSidebar={showNav} showAgent={showAgent}>
                {children}
            </UserSpaceLayout>
            {showAgent && <IAstedInterface userRole="admin" />} {/* Hardcoded role for demo */}
            {showAgent && <IAstedOverlay />}
        </IAstedProvider>
    );
};
