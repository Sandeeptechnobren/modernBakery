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
    children?: LinkDataType[];
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
            // {
            //     isActive: false,
            //     href: "/dashboard/promotion",
            //     label: "Promotion",
            //     leadingIcon: "hugeicons:promotion",
            //     iconColor: "text-red-500"
            // },
        ],
    },
    {
        name: "CRM",
        data: [
            {
                isActive: false,
                href: "#",
                label: "Masters",
                leadingIcon: "hugeicons:workflow-square-06",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [ 
                    {
                        isActive: false,
                        href: "/dashboard/master/company",
                        label: "Company",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500"
                    },
                   
                    // {
                    //     isActive: false,
                    //     href: "/dashboard/master/customer",
                    //     label: "Customer",
                    //     leadingIcon: "lucide:user",
                    //     iconColor: "text-green-500"
                    // },
                    {
                isActive: false,
                href: "/dashboard/master/salesman",
                label: "Salesman",
                leadingIcon: "mdi:package-variant",
                iconColor: "text-cyan-500"
            },
            // {
            //     isActive: false,
            //     href: "/dashboard/master/discount",
            //     label: "Discount",
            //     leadingIcon: "mdi:package-variant",
            //     iconColor: "text-cyan-500"
            // },
            // {
            //     isActive: false,
            //     href: "/dashboard/master/item",
            //     label: "Items",
            //     leadingIcon: "mdi:package-variant",
            //     iconColor: "text-cyan-500"
            // },
                    {
                        isActive: false,
                        href: "/dashboard/master/route",
                        label: "Route",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400"
                    },
                    //         {
                    //     isActive: false,
                    //     href: "/dashboard/master/pricing",
                    //     label: "Pricing",
                    //     leadingIcon: "mdi:currency-usd",
                    //     iconColor: "text-yellow-400"
                    // },
                    {
                        isActive: false,
                        href: "/dashboard/master/vehicle",
                        label: "Vehicle",
                        leadingIcon: "mdi:car",
                        iconColor: "text-yellow-400"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/warehouse",
                        label: "Warehouse",
                        leadingIcon: "tabler:building-warehouse",
                        iconColor: "text-violet-500"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/agentCustomer",
                        label: "Agent Customer",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Items",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    },
                ],
            },
            {
                isActive: false,
                href: "#",
                label: "Merchandisers",
                leadingIcon: "picon:business",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [

                    {
                        isActive: false,
                        href: "/dashboard/merchandiser/planogram",
                        label: "Planogram",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500"
                    },
            //          {
            //     isActive: false,
            //     href: "/dashboard/merchandiser/planogramImage",
            //     label: "Planogram Image",
            //     leadingIcon: "mdi:map",
            //     iconColor: "text-yellow-400"
            // },
                    {
                        isActive: false,
                        href: "/dashboard/merchandiser/planogramImage",
                        label: "Planogram Image",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/merchandiser/shelfDisplay",
                        label: "Shelf Display",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/merchandiser/survey",
                        label: "Survey",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400"
                    },


                ],
            },

            {
                isActive: false,
                href: "#",
                label: "Assets",
                leadingIcon: "streamline-freehand:money-bag",
                iconColor: "text-green-500",
                trailingIcon: "mdi-light:chevron-right",
                children: [ 
                    {
                        isActive: false,
                        href: "/dashboard/assets/types",
                        label: "Service Types",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/assets/chiller",
                        label: "Chiller",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    },
                    {
                        isActive: false,
                        href: "/dashboard/assets/vendor",
                        label: "Vendor",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    }
                ]
            },
            // {
            //     isActive: false,
            //     href: "/dashboard/report",
            //     label: "Report",
            //     leadingIcon: "tabler:file-text",
            //     trailingIcon: "mdi-light:chevron-right",
            //     iconColor: "text-red-500"
            // },
            // {
            //     isActive: false,
            //     href: "/dashboard/agentTransaction",
            //     label: "Agent Transaction",
            //     leadingIcon: "mdi:account-cash-outline",
            //     iconColor: "text-violet-500"
            // },

            // {
            //     isActive: false,
            //     href: "/dashboard/harissTransaction",
            //     label: "Report",
            //     leadingIcon: "hugeicons:transaction",
            //     iconColor: "text-fuchsia-500"
            // },


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