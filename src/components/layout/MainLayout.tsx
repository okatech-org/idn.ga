import { ReactNode } from "react";
import UserSpaceLayout from "./UserSpaceLayout";
import { useLocation } from "react-router-dom";
import { IAstedProvider } from "@/context/IAstedContext";
import IAstedOverlay from "@/components/iasted/IAstedOverlay";

export const MainLayout = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith("/auth") || location.pathname === "/";

    if (isAuthPage) {
        return <main className="min-h-screen bg-background">{children}</main>;
    }

    return (
        <IAstedProvider>
            <UserSpaceLayout>
                {children}
            </UserSpaceLayout>
            <IAstedOverlay />
        </IAstedProvider>
    );
};
