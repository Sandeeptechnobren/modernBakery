"use client";

import DashboardLayout0 from "./layout0";
import DashboardLayout1 from "./layout1";
import { useContext, useEffect, useState } from "react";
import { isVerify } from "@/app/services/allApi";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import { ThemeProvider, useTheme } from "./contexts";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider>
            <LayoutSelector>{children}</LayoutSelector>
        </ThemeProvider>
    );
}

function LayoutSelector({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

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
            {theme === "layoutTheme2" ? (
                <DashboardLayout0>{children}</DashboardLayout0>
            ) : (
                <DashboardLayout1>{children}</DashboardLayout1>
            )}
        </>
    );
}
