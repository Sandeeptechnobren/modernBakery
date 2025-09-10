"use client";

import { initialLinkData } from "@/app/(private)/data/dashboardLinks";
import LinkDataReducer from "@/app/(private)/utils/linkDataReducer";
import { useReducer } from "react";
import Sidebar from "./sidebar1";

export default function DashboardLayout1({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Use useReducer to manage the sidebar data
    const [sidebarData, dispatch] = useReducer(
        LinkDataReducer,
        initialLinkData
    );

    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <div className="flex h-screen">
            <Sidebar data={sidebarData} onClickHandler={handleLinkClick} />

            <div className="w-full p-[20px] pb-[22px] h-screen bg-gray-200 text-black overflow-auto">
                {children}
            </div>
        </div>
    );
}
