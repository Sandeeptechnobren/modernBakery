"use client";

import DashboardLayout0 from "./layout0";
import DashboardLayout1 from "./layout1";
import { useEffect, useState } from "react";
import { isVerify } from "@/app/services/allApi";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import { ThemeProvider, useTheme } from "./contexts";
import usePermissionManager from "@/app/components/contexts/usePermission";
import { PermissionProvider } from "@/app/components/contexts/permissionContext";

type Role = {
    id: number;
    name: string;
    status: number;
    menus: RoleMenu[];
};

type MenuItem = {
    isActive: boolean;
    href?: string;
    label: string;
    leadingIcon: string;
    iconColor: string;
    trailingIcon?: string;
    children?: ChildrenItem[];
};

type ChildrenItem = {
    isActive?: boolean;
    href?: string;
    label?: string;
    leadingIcon?: string;
    iconColor?: string;
};

type PermissionSubmenu = {
    id: number;
    name: string;
    path: string;
    permissions: { permission_id: number; permission_name: string }[];
};

type PermissionMenu = {
    id: number;
    menu: { id: number; name: string; path: string };
    submenu: PermissionSubmenu[];
};

type Permission = {
    permission_id: number;
    permission_name: string;
};

type SubMenu = {
    id: number;
    name: string;
    path: string;
    permissions: Permission[];
};

type RoleMenu = {
    id: number;
    menu: {
        id: number;
        name: string;
        path: string;
    };
    submenu: SubMenu[];
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider>
            <PermissionProvider>
                <LayoutSelector>{children}</LayoutSelector>
            </PermissionProvider>
        </ThemeProvider>
    );
}
// Permission filtering lives in the PermissionContext now. Layout consumes that context via usePermissionManager.
function LayoutSelector({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const pathname = usePathname();
    const { preload, allowedPaths } = usePermissionManager();
    // const [num, setnum] = useState(0);
    // console.log("LayoutSelector render with theme:");
    // setInterval(() => {
    //     setnum((prev) => prev + 1);
    // }, 5000);
    
    useEffect(() => {
        async function verifyUser(){
            if(!localStorage.getItem("token")){
                return router.push("/");
            }
            const res = await isVerify();
            if(res.error) {
                // localStorage.removeItem("token");
                return router.push("/");
            }
            try {
                await preload();
            } catch (e) {
                console.error("permission preload failed", e);
            }
            setLoading(false);
        }
        verifyUser();
    }, [preload]);

    useEffect(() => {
        if (!loading) {
            const normalize = (p: string) => (p?.startsWith("/") ? p : `/${p}`);
            const current = normalize(pathname || "");

            let isAllowed = false;
            if (allowedPaths) {
                const entries = Array.isArray(allowedPaths)
                    ? allowedPaths
                    : Array.from(allowedPaths);
                isAllowed = entries.some((ap) => {
                    const allowed = normalize(ap);
                    // allow exact match or allowed path being a prefix of the current pathname
                    return current === allowed || current?.startsWith(allowed);
                });
            }

            // Redirect if not allowed
            // if (!isAllowed) {
            //     router.replace(allowedPaths && allowedPaths.size > 0 ? Array.from(allowedPaths)[0] : "/");
            //     console.error("You are not allowed to access this page.");
            // }
        }
    }, [allowedPaths, pathname, loading, router]);

    return loading ? <Loading /> :(
        <>
            {theme === "layoutTheme" ? (
                <DashboardLayout0>{children}</DashboardLayout0>
            ) : (
                <DashboardLayout1>{children}</DashboardLayout1>
            )}
        </>
    );
}
