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
    {
        data: [
            {
                isActive: false,

               
                href: "/dashboard/settings/theme",
                label: "Theme",
                leadingIcon: "hugeicons:workflow-square-06",

                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard/settings/user",
                label: "Users",
                leadingIcon: "mdi:account-circle",
                iconColor: "text-green-500",
            },
              {
                isActive: false,
                href: "/dashboard/settings/user-types",
                label: "Users Types",
                leadingIcon: "mdi:account-circle",
                iconColor: "text-green-500",
            },

             {
                isActive: false,
                href: "/dashboard/settings/outlet-channel",
                label: "Outlet Channel",
                leadingIcon: "mdi:account-circle",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard/settings/role",
                label: "Roles",
                leadingIcon: "mdi:account-tie",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "#",
                label: "Master Data",
                leadingIcon: "tabler:database",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard",
                label: "Prefernce",
                leadingIcon: "hugeicons:sliders-vertical",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard",
                label: "Taxes",
                leadingIcon: "ic:round-percent",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard/settings/region",
                label: "Region",
                leadingIcon: "lucide:life-buoy",
                iconColor: "text-green-500",
            },
               {
                isActive: false,
                href: "/dashboard/settings/routetype",
                label: "Route Type",
                leadingIcon: "lucide:life-buoy",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard",
                label: "Bank",
                leadingIcon: "hugeicons:bank",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "#",
                label: "Company",
                leadingIcon: "fa-regular:building",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [
                    {
                        isActive: false,
                        href: "/dashboard/master/customer",
                        label: "Company Type",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Commission Range",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/route",
                        label: "Currency",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                    {
                            isActive: false,
                            href: "/dashboard/settings/country",
                            label: "Country",
                            leadingIcon: "mdi:earth",
                            iconColor: "text-green-500",
                        },
                    {
                        isActive: false,
                        href: "/dashboard/master/vehicle",
                        label: "Region",
                        leadingIcon: "mdi:car",
                        iconColor: "text-yellow-400",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/settings/company/subRegion",
                        label: "Sub Region",
                        leadingIcon: "tabler:building-warehouse",
                        iconColor: "text-violet-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/warehouse",
                        label: "Expense Category",
                        leadingIcon: "tabler:building-warehouse",
                        iconColor: "text-violet-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/warehouse",
                        label: "Reason",
                        leadingIcon: "tabler:building-warehouse",
                        iconColor: "text-violet-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/warehouse",
                        label: "Language",
                        leadingIcon: "tabler:building-warehouse",
                        iconColor: "text-violet-500",
                    },
                ],
            },
            {
                isActive: false,
                href: "#",
                label: "Customer",
                leadingIcon: "mdi:account-group",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [
                    {
                        isActive: false,
                        href: "/dashboard/settings/customer/customerType",
                        label: "Customer Type",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Customer Category",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/route",
                        label: "Customer Sub Category",
                        leadingIcon: "mdi:map",
                        iconColor: "text-yellow-400",
                    },
                ],
            },
            {
                isActive: false,
                href: "#",
                label: "Vehicle",
                leadingIcon: "qlementine-icons:items-grid-16",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [
                    {
                        isActive: false,
                        href: "/dashboard/master/customer",
                        label: "Vehicle Type",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Vehicle Brand",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                ],
            },
            {
                isActive: false,
                href: "#",
                label: "Item",
                leadingIcon: "mdi:car",
                trailingIcon: "qlementine-icons:items-grid-small-24",
                iconColor: "text-yellow-400",
                children: [
                    {
                        isActive: false,
                        href: "/dashboard/settings/item/category",
                        label: "Item Category",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/settings/item/subCategory",
                        label: "Item Sub Category",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                ],
            },
            {
                isActive: true,
                href: "/dashboard",
                label: "Payemnt Term",
                leadingIcon: "mdi:credit-card-clock-outline",
                iconColor: "text-blue-500",
            },
            {
                isActive: false,
                href: "#",
                label: "Material",
                leadingIcon: "mdi:cube",
                trailingIcon: "mdi-light:chevron-right",
                iconColor: "text-yellow-400",
                children: [
                    {
                        isActive: false,
                        href: "/dashboard/master/customer",
                        label: "Material Group",
                        leadingIcon: "lucide:user",
                        iconColor: "text-green-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Material Brand",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Unit of Measurement",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Material Category",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "Material Type",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                    {
                        isActive: false,
                        href: "/dashboard/master/item",
                        label: "City",
                        leadingIcon: "mdi:package-variant",
                        iconColor: "text-cyan-500",
                    },
                ],
            },
            {
                isActive: false,
                href: "/",
                label: "Field Services",
                leadingIcon: "mdi:briefcase-account",
                iconColor: "text-yellow-400",
            },
            {
                isActive: false,
                href: "/dashboard/company",
                label: "Salesman Type",
                leadingIcon: "mdi:account-tie",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Salesman Organization",
                leadingIcon: "mdi:account-multiple-outline",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Complaint Type",
                leadingIcon: "mdi:alert-circle-outline",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Expense Type",
                leadingIcon: "mdi:currency-usd",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Discount Type",
                leadingIcon: "mdi:tag-outline",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "BT & Route Configuration",
                leadingIcon: "mdi:map-marker-path",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Sales Target Type",
                leadingIcon: "mdi:bullseye-arrow",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Storage Location",
                leadingIcon: "mdi:warehouse",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Supplier Type",
                leadingIcon: "mdi:truck-delivery",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Unit Conversion",
                leadingIcon: "mdi:swap-horizontal",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Manage Code",
                leadingIcon: "mdi:code-tags",
                iconColor: "text-green-500",
            },

            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Distribution Org Structure",
                leadingIcon: "mdi:source-branch",
                iconColor: "text-green-500",
            },
            {
                isActive: false,
                href: "/dashboard/salesman",
                label: "Exit Reason",
                leadingIcon: "mdi:exit-to-app",
                iconColor: "text-green-500",
            },
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
        label: "Profile",
    },
];
