import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";

export type SidebarDataType = {
    name?: string;
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
    // {
    //     name: "Main Menu",
    //     data: [
    //         {
    //             isActive: true,
    //             href: "/",
    //             label: "",
    //             leadingIcon: "hugeicons:home-01",
    //             iconColor: "text-blue-500"
    //         },
    //
    //     ],
    // },
    {
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
                        href: "/warehouse",
                        label: "Warehouse",
                        leadingIcon: "tabler:building-warehouse",
                        iconColor: "text-violet-500",
                    },
                    {
                        isActive: false,
                        href: "/vehicle",
                        label: "Vehicle",
                        leadingIcon: "mdi:car",
                        iconColor: "text-yellow-400",
                    },
                    {
                        isActive: false,
                        href: "/route",
                        label: "Route",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                    {
                        isActive: false,
                        href: "/agentCustomer",
                        label: "Agent Customer",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/companyCustomer",
                        label: "Company Customer",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                    //    {
                    //         isActive: false,
                    //         href: "/companyCustomer",
                    //         label: "Hariss Customer",
                    //         leadingIcon: "mdi:package-variant",
                    //         iconColor: "text-cyan-500"
                    //     },
                    {
                        isActive: false,
                        href: "/salesman",
                        label: "Salesman",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/item",
                        label: "Item",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/company",
                        label: "Company",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },

                    // {
                    //     isActive: false,
                    //     href: "/customer",
                    //     label: "Customer",
                    //     leadingIcon: "lucide:user",
                    //     iconColor: "text-green-500"
                    // },

                    // {
                    //     isActive: false,
                    //     href: "/discount",
                    //     label: "Discount",
                    //     leadingIcon: "mdi:package-variant",
                    //     iconColor: "text-cyan-500"
                    // },
                    // {
                    //     isActive: false,
                    //     href: "/item",
                    //     label: "Items",
                    //     leadingIcon: "mdi:package-variant",
                    //     iconColor: "text-cyan-500"
                    // },

                    //         {
                    //     isActive: false,
                    //     href: "/pricing",
                    //     label: "Pricing",
                    //     leadingIcon: "mdi:currency-usd",
                    //     iconColor: "text-yellow-400"
                    // },
                ],
            },
            {
                isActive: false,
                href: "#",
                label: "Pricing & Promotion",
                leadingIcon: "mdi:currency-usd",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [
                       {
                        isActive: false,
                        href: "/pricing",
                        label: "Pricing",
                        leadingIcon: "mdi:currency-usd",
                        iconColor: "text-yellow-400"
                    },
                       {
                isActive: false,
                href: "/promotion",
                label: "Promotion",
                leadingIcon: "hugeicons:promotion",
                iconColor: "text-red-500"
            },
                   
            {
                isActive: false,
                href: "/discount",
                label: "Discount",
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
                        href: "/merchandiser/shelfDisplay",
                        label: "Shelf Display",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                    {
                        isActive: false,
                        href: "/merchandiser/planogram",
                        label: "Planogram",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                       {
                        isActive: false,
                        href: "/merchandiser/campaign",
                        label: "Campaign Info",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                    //          {
                    //     isActive: false,
                    //     href: "/merchandiser/planogramImage",
                    //     label: "Planogram Image",
                    //     leadingIcon: "mdi:map",
                    //     iconColor: "text-yellow-400"
                    // },
                    // {
                    //     isActive: false,
                    //     href: "/merchandiser/planogramImage",
                    //     label: "Planogram Image",
                    //     leadingIcon: "mdi:map",
                    //     iconColor: "text-yellow-400",
                    // },
                 
                    // {
                    //     isActive: false,
                    //     href: "/merchandiser/survey",
                    //     label: "Survey",
                    //     leadingIcon: "mdi:map",
                    //     iconColor: "text-yellow-400",
                    // },
                    {
                        isActive: false,
                        href: "/merchandiser/complaintFeedback",
                        label: "Complaint Feedback",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                 
                    {
                        isActive: false,
                        href: "/merchandiser/competitor",
                        label: "Competitor Info",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                    // {
                    //     isActive: false,
                    //     href: "dashboard/merchandiser/complaintFeedback",
                    //     label: "Camplaint Feedback",
                    //     leadingIcon: "mdi:map",
                    //     iconColor: "text-yellow-400"
                    // },


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
                        href: "/assets/chiller",
                        label: "Chiller",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/assets/chillerRequest",
                        label: "Chiller Request",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/assets/vendor",
                        label: "Vendor",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                ],
            },
            // {
            //     isActive: false,
            //     href: "/report",
            //     label: "Report",
            //     leadingIcon: "tabler:file-text",
            //     trailingIcon: "mdi-light:chevron-right",
            //     iconColor: "text-red-500"
            // },
            // {
            //     isActive: false,
            //     href: "#",
            //     label: "Agent Transaction",
            //     leadingIcon: "mdi:account-cash-outline",
            //     iconColor: "text-violet-500"
            // },
 {
                isActive: false,
                href: "#",
                label: "Agent Transaction",
                leadingIcon: "mdi:account-cash-outline",
                iconColor: "text-green-500",
                trailingIcon: "mdi-light:chevron-right",
                children: [
                    {
                        isActive: false,
                        href: "/agentTransaction/agentCustomerOrder",
                        label: "Agent Order",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    },
                    // {
                    //     isActive: false,
                    //     href: "/agentTransaction/agentCustomerInvoice",
                    //     label: "Agent Invoice",
                    //     leadingIcon: "mdi:package-variant",
                    //     iconColor: "text-cyan-500"
                    // },
                    {
                        isActive: false,
                        href: "/invoice",
                        label: "Invoice",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500"
                    },
                ]
            },
            // {
            //     isActive: false,
            //     href: "/harissTransaction",
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
        href: "/settings",
        label: "Settings",
        icon: "mi:settings",
    },
    {
        type: "profile",
        href: "",
        src: "/dummyuser.jpg",
        label: "Profile",
    },
];
