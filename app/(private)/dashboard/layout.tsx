"use client";

import DashboardLayout0 from "./layout0";
import DashboardLayout1 from "./layout1";
import Contexts, { SettingsContext, SettingsContextValue } from "./contexts";
import { useContext, useEffect, useState } from "react";
import { isVerify } from "@/app/services/allApi";
import { useThemeToggle } from "../utils/useThemeToggle";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Contexts>
            <LayoutSelector>{children}</LayoutSelector>
        </Contexts>
    );
}

function LayoutSelector({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { theme, toggle } = useThemeToggle();
    const context = useContext<SettingsContextValue | undefined>(
        SettingsContext
    );
    if (!context) {
        throw new Error(
            "LayoutSelector must be used within a SettingsContext.Provider"
        );
    }
    const { settings } = context;

    useEffect(() => {
        async function verifyUser(){
            const res = await isVerify();
            if(res.error) {
                localStorage.removeItem("token");
                return router.push("/");
            }
            setLoading(false);
        }
        verifyUser();
    }, []);

    return loading ? <Loading /> :(
        <>
            {settings.layout.dashboard.value === "0" ? (
                <DashboardLayout0>{children}</DashboardLayout0>
            ) : (
                <DashboardLayout1>{children}</DashboardLayout1>
            )}
        </>
    );
}
