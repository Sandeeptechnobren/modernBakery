"use client";

import DashboardLayout0 from "./layout0";
import DashboardLayout1 from "./layout1";
import Contexts, { SettingsContext, SettingsContextValue } from "./contexts";
import { useContext } from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Contexts>
                <LayoutSelector>{children}</LayoutSelector>
            </Contexts>
        </>
    );
}

function LayoutSelector({ children }: { children: React.ReactNode }) {
    const context = useContext<SettingsContextValue | undefined>(
        SettingsContext
    );
    if (!context) {
        throw new Error(
            "LayoutSelector must be used within a SettingsContext.Provider"
        );
    }
    const { settings, dispatchSettings } = context;

    return (
        <>
            {settings.layout.dashboard.value === "0" ? (
                <DashboardLayout0>{children}</DashboardLayout0>
            ) : (
                <DashboardLayout1>{children}</DashboardLayout1>
            )}
        </>
    );
}
