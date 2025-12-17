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
            href: "/routeTransfer",
            label: "Route Transfer",
            leadingIcon: "mdi-light:transfer",
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
        label: "Manage Distributors",
        leadingIcon: "tabler:building-warehouse",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
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
        label: "Distributor's Transaction",
        leadingIcon: "mdi:account-cash-outline",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
        children: [
          {
            isActive: false,
            href: "/distributorsOrder",
            label: "Distributor's Order",
            leadingIcon: "carbon:delivery-parcel",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/distributorsDelivery",
            label: "Distributor's Delivery",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/distributorsInvoice",
            label: "Distributor's Invoice",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/distributorsReturn",
            label: "Distributor's Return",
            leadingIcon: "mdi:truck-remove-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/distributorsExchange",
            label: "Distributor's Exchange",
            leadingIcon: "mdi:truck-remove-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/salesTeamRouteLinkage",
            label: "Sales Team Linkage",
            leadingIcon: "mdi:tanker-truck",
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
          {
            isActive: false,
            href: "/stocktransfer",
            label: "Stock Transfer",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/salesTeamTracking",
            label: "Sales Team Tracking",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/salesTeamRecosite",
            label: "Sales Team Reconsite",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500"
          },
        ]
      },
      {
        isActive: false,
        href: "#",
        label: "Company Transaction",
        leadingIcon: "streamline-ultimate:accounting-bill-stack-1",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
        children: [
          {
            isActive: false,
            href: "/purchaseOrder",
            label: "Purchase Order",
            leadingIcon: "carbon:delivery-parcel",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/order",
            label: "Order",
            leadingIcon: "carbon:delivery-parcel",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/delivery",
            label: "Delivery",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/invoice",
            label: "Invoice",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/return",
            label: "Return",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/tmpReturn",
            label: "Temporary Return",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/caps",
            label: "CAPS Collection",
            leadingIcon: "game-icons:bottle-cap",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/creditNote",
            label: "Credit Note",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/sapIntegration",
            label: "SAP Integration",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },

        ]
      },
      {
        isActive: false,
        href: "#",
        label: "Claim Management",
        leadingIcon: "lucide:baggage-claim",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
        children: [
          {
            isActive: false,
            href: "/compiledClaims",
            label: "Compiled Claims",
            leadingIcon: "carbon:delivery-parcel",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/petitClaim",
            label: "Petit Claim",
            leadingIcon: "mdi:file-document-outline",
            iconColor: "text-cyan-500"
          },
          {
            isActive: false,
            href: "/compensationReport",
            label: "Compensation Report",
            leadingIcon: "hugeicons:invoice",
            iconColor: "text-cyan-500"
          },

        ]
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
            href: "/shelfDisplay",
            label: "Shelf Display",
            leadingIcon: "streamline:shelf",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/planogram",
            label: "Planogram",
            leadingIcon: "lucide:user",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/campaign",
            label: "Campaign Info",
            leadingIcon: "material-symbols:info-rounded",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/survey",
            label: "Survey",
            leadingIcon: "wpf:survey",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/complaintFeedback",
            label: "Complaint Feedback",
            leadingIcon: "hugeicons:chat-feedback",
            iconColor: "text-yellow-400",
          },

          {
            isActive: false,
            href: "/competitor",
            label: "Competitor Info",
            leadingIcon: "akar-icons:info",
            iconColor: "text-yellow-400",
          },
          {
            isActive: false,
            href: "/stockinstore",
            label: "Stock in Store",
            leadingIcon: "vaadin:stock",
            iconColor: "text-yellow-400",
          },
        ],
      },
      {
        isActive: false,
        href: "#",
        label: "Assets Management",
        leadingIcon: "streamline-freehand:money-bag",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
        children: [
          {
            isActive: false,
            href: "/assetsMaster",
            label: "Assets Master",
            leadingIcon: "guidance:refrigeration",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/assetsRequest",
            label: "Assets Request",
            leadingIcon: "si:pull-request-duotone",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "#",
            label: "Chiller Installation",
            leadingIcon: "streamline-freehand:money-bag",
            iconColor: "text-green-500",
            trailingIcon: "mdi-light:chevron-right",
            children: [
              {
                isActive: false,
                href: "/chillerInstallation/acf",
                label: "Approve CRF Request",
                leadingIcon: "guidance:refrigeration",
                iconColor: "text-cyan-500",
              },
              {
                isActive: false,
                href: "/chillerInstallation/iro",
                label: "Installation Order",
                leadingIcon: "guidance:refrigeration",
                iconColor: "text-cyan-500",
              },
              {
                isActive: false,
                href: "/chillerInstallation/installationReport",
                label: "Installation Report",
                leadingIcon: "guidance:refrigeration",
                iconColor: "text-cyan-500",
              },
              {
                isActive: false,
                href: "/chillerInstallation/bulkTransfer",
                label: "Bulk Transfer Report",
                leadingIcon: "guidance:refrigeration",
                iconColor: "text-cyan-500",
              },
            ],
          },
          {
            isActive: false,
            href: "/callRegister",
            label: "Call Register",
            leadingIcon: "si:pull-request-duotone",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/serviceVisit",
            label: "Service Visit",
            leadingIcon: "si:pull-request-duotone",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/serviceTerritory",
            label: "Service Territory",
            leadingIcon: "si:pull-request-duotone",
            iconColor: "text-cyan-500",
          },
        ],
      },
      {
        isActive: false,
        href: "#",
        label: "Loyalty Program",
        leadingIcon: "fa-solid:award",
        iconColor: "text-green-500",
        trailingIcon: "mdi-light:chevron-right",
        children: [
          {
            isActive: false,
            href: "/customerLoyaltyPoints",
            label: "Customer Loyalty Points",
            leadingIcon: "mdi:star-circle",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/pointsAdjustment",
            label: "Points Adjustment",
            leadingIcon: "mdi:adjust",
            iconColor: "text-cyan-500",
          },

        ],
      },
    ],
  },
];
