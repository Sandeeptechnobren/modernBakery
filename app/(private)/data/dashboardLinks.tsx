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
    iconColor?: string;
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
                iconColor: "text-blue-500"
            },
            {
                isActive: false,
                href: "/dashboard/customer",
                label: "Customer",
                leadingIcon: "lucide:user",
                iconColor: "text-green-500"
            },
            {
                isActive: false,
                href: "/dashboard/landmark",
                label: "Landmark",
                leadingIcon: "hugeicons:truck-delivery",
                iconColor: "text-purple-500"
            },
            {
                isActive: false,
                href: "/dashboard/inbox",
                label: "Items",
                leadingIcon: "lucide:inbox",
                iconColor: "text-cyan-500"
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
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400"
            },
            {
                isActive: false,
                href: "/dashboard/report",
                label: "Report",
                leadingIcon: "tabler:file-text",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-red-500"
            },
            {
                isActive: false,
                href: "/dashboard/agentTransaction",
                label: "Agent Transaction",
                leadingIcon: "mingcute:bill-line",
                iconColor: "text-violet-500"
            },
            {
                isActive: false,
                href: "/dashboard/harissTransaction",
                label: "Report",
                leadingIcon: "hugeicons:transaction",
                iconColor: "text-fuchsia-500"
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