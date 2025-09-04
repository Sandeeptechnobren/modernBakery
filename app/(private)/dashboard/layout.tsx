"use client";

import { useEffect, useReducer, useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar";
import TopBar from "./topBar";
import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";

export type SidebarDataType = {
    name: string;
    data: LinkDataType[];
};

export type LinkDataType = {
    isActive: boolean;
    href: string;
    label: string;
    leadingIcon: IconifyIcon | string;
    trailingIcon?: IconifyIcon | string;
};

const initialLinkData: SidebarDataType[] = [
    {
        name: "Main Menu",
        data: [
            {
                isActive: true,
                href: "/dashboard",
                label: "Dashboard",
                leadingIcon: "hugeicons:home-01",
            },
            {
                isActive: false,
                href: "/dashboard/customer",
                label: "Customer",
                leadingIcon: "lucide:user",
            },
            {
                isActive: false,
                href: "/dashboard/landmark",
                label: "Landmark",
                leadingIcon: "hugeicons:truck-delivery",
            },
            {
                isActive: false,
                href: "/dashboard/inbox",
                label: "Items",
                leadingIcon: "lucide:inbox",
            }
        ],
    },
    {
        name: "CRM",
        data: [
            {
                isActive: false,
                href: "/dashboard/masters",
                label: "Masters",
                leadingIcon: "hugeicons:workflow-square-06",
                trailingIcon: "mdi-light:chevron-right"
            },
            {
                isActive: false,
                href: "/dashboard/report",
                label: "Report",
                leadingIcon: "tabler:file-text",
                trailingIcon: "mdi-light:chevron-right"
            },
            {
                isActive: false,
                href: "/dashboard/agentTransaction",
                label: "Agent Transaction",
                leadingIcon: "mingcute:bill-line"
            },
            {
                isActive: false,
                href: "/dashboard/harissTransaction",
                label: "Report",
                leadingIcon: "hugeicons:transaction",
            }
        ],
    },
];

const LinkDataReducer = (
    state: SidebarDataType[],
    action: { type: string; payload: string }
) => {
    switch (action.type) {
        case "activate":
            // Return a new state based on the dispatched action
            return state.map((group: SidebarDataType) => ({
                ...group,
                data: group.data.map((link: LinkDataType) => ({
                    ...link,
                    isActive: link.href === action.payload,
                })),
            }));
        default:
            return state;
    }
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [horizontalSidebar, setHorizontalSidebar] = useState<boolean>(true);

    const toggleSidebar = () => {
        localStorage?.setItem(
            "horizontalSidebar",
            (!horizontalSidebar).toString()
        );
        setHorizontalSidebar(!horizontalSidebar);
    };

    useEffect(() => {
        setHorizontalSidebar(
            localStorage?.getItem("horizontalSidebar") === "true"
        );
    }, []);

    // Use useReducer to manage the sidebar data
    const [sidebarData, dispatch] = useReducer(LinkDataReducer, initialLinkData);

    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-scroll bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar data={sidebarData} onClickHandler={handleLinkClick} />}
            <TopBar
                horizontalSidebar={horizontalSidebar}
                toggleSidebar={toggleSidebar}
            />
            <Main horizontalSidebar={horizontalSidebar}>{children}</Main>
        </div>
    );
};

export default DashboardLayout;
