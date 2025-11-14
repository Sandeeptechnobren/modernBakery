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
        href: "#",
        label: "Masters",
        leadingIcon: "hugeicons:workflow-square-06",
        trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
        children: [
          {
            isActive: false,
            href: "/distributors",
            label: "Distributors",
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
            href: "/routeVisit",
            label: "Route Visit Plan",
            leadingIcon: "icon-park-solid:plan",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/fieldCustomer",
            label: "Field Customers",
            leadingIcon: "carbon:customer",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/keyCustomer",
            label: "Key Customers",
            leadingIcon: "lucide:user",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/salesTeam",
            label: "Sales Team",
            leadingIcon: "carbon:sales-ops",
            iconColor: "text-cyan-500",
          },

          {
            isActive: false,
            href: "/item",
            label: "Item",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500",
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
        label: "Distributors",
        leadingIcon: "mdi:account-cash-outline",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
        children: [
          {
            isActive: false,
            href: "/distributorsStock",
            label: "Distributors Stock",
            leadingIcon: "carbon:delivery-parcel",
            iconColor: "text-cyan-500"
          }
         
        ]
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
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/promotion",
            label: "Promotion",
            leadingIcon: "hugeicons:promotion",
            iconColor: "text-red-500",
          },

          {
            isActive: false,
            href: "/discount",
            label: "Discount",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500",
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
            leadingIcon: "streamline:shelf",
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
            leadingIcon: "material-symbols:info-rounded",
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

          {
            isActive: false,
            href: "/merchandiser/survey",
            label: "Survey",
            leadingIcon: "wpf:survey",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/merchandiser/complaintFeedback",
            label: "Complaint Feedback",
            leadingIcon: "hugeicons:chat-feedback",
            iconColor: "text-yellow-400",
          },

          {
            isActive: false,
            href: "/merchandiser/competitor",
            label: "Competitor Info",
            leadingIcon: "akar-icons:info",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/merchandiser/stockinstore",
            label: "Stock in Store",
            leadingIcon: "vaadin:stock",
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
            leadingIcon: "guidance:refrigeration",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/assets/chillerRequest",
            label: "Chiller Request",
            leadingIcon: "si:pull-request-duotone",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/assets/vendor",
            label: "Vendor",
            leadingIcon: "streamline-freehand:shop",
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
            href: "/agentOrder",
            label: "Agent Order",
            leadingIcon: "carbon:delivery-parcel",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/agentCustomerDelivery",
            label: "Agent Delivery",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/invoice",
            label: "Agent Invoice",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/return",
            label: "Return",
            leadingIcon: "mdi:truck-remove-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/exchange",
            label: "Exchange",
            leadingIcon: "mdi:truck-remove-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/salesTeamLoad",
            label: "Sales Team Load",
            leadingIcon: "mdi:tanker-truck",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/salesTeamUnload",
            label: "Sales Team Unload",
            leadingIcon: "mdi:truck-remove-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/capsCollection",
            label: "CAPS Master Collection",
            leadingIcon: "game-icons:bottle-cap",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/collection",
            label: "Collection",
            leadingIcon: "heroicons-outline:collection",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/newCustomer",
            label: "Approval Customers",
            leadingIcon: "mdi:truck-remove-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/advancePayment",
            label: "Advance Payment",
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
