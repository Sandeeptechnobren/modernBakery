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

export const initialLinkData: SidebarDataType[] = [
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

export const miscLinks = [
    {
        type: "icon",
        href: "",
        label: "maximize",
        icon: "humbleicons:maximize",
    },
    {
        type: "icon",
        href: "",
        label: "Notifications",
        icon: "lucide:bell",
    },
    {
        type: "icon",
        href: "/dashboard/settings",
        label: "Settings",
        icon: "mi:settings",
    },
    {
        type: "profile",
        href: "",
        src: "/dummyuser.jpg",
        label: "Profile"
    },
];