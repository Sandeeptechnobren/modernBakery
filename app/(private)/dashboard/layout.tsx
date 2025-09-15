"use client";

import DashboardLayout0 from "./layout0";
import DashboardLayout1 from "./layout1";
import Contexts, { SettingsContext, SettingsContextValue } from "./contexts";
import { useContext, useEffect } from "react";
import { isVerify } from "@/app/services/allApi";

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

  useEffect(()=>{
    isVerify().then((res)=>{
        console.log(res)
    })
  },[])

    const context = useContext<SettingsContextValue | undefined>(
        SettingsContext
    );
    if (!context) {
        throw new Error(
            "LayoutSelector must be used within a SettingsContext.Provider"
        );
    }
    const { settings } = context;

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
