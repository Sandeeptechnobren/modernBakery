import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";
import { env } from "process";

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
        href: "/settings/profile",
        label: "Profile ",
        leadingIcon: "mdi:account-multiple",
        // trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
      },
{
        isActive: false,
        href: "/settings/process",
        label: "Process ",
        leadingIcon: "mdi:account-multiple",
        // trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
      },

      {
        isActive: false,
        href: "#",
        label: "Users & Role",
        leadingIcon: "mdi:account-multiple",
        trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
        children: [
          {
            isActive: false,
            href: "/settings/user",
            label: "Users",
            leadingIcon: "mdi:account",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/role",
            label: "Roles",
            leadingIcon: "mdi:account-tie",
            iconColor: "text-green-500",
          },
          ...(process.env.NODE_ENV === "development" ? [{
            isActive: false,
            href: "/settings/permission",
            label: "Permissions",
            leadingIcon: "mdi:lock-check",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/menu",
            label: "Menus",
            leadingIcon: "duo-icons:menu",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/submenu",
            label: "Sub Menus",
            leadingIcon: "ci:arrow-sub-down-right",
            iconColor: "text-green-500",
          }] : []),
        ],
      },
      {
        isActive: false,
        href: "#",
        label: "Manage Company",
        leadingIcon: "fa-regular:building",
        trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
        children: [
          {
            isActive: false,
            href: "/settings/manageCompany/company",
            label: "Company",
            leadingIcon: "lucide:user",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/manageCompany/salesman-type",
            label: "Salesman Type",
            leadingIcon: "mdi:account-tie",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/manageCompany/expenseType",
            label: "Expense Type",
            leadingIcon: "mdi:currency-usd",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/manageCompany/theme",
            label: "Theme",
            leadingIcon: "mdi:theme-light-dark",
            iconColor: "text-green-500",
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
            href: "/settings/outlet-channel",
            label: "Outlet Channel",
            leadingIcon: "mdi:storefront",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/customer/customerCategory",
            label: "Customer Category",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500",
          },
          {
            isActive: false,
            href: "/settings/customer/customerSubCategory",
            label: "Customer Sub Category",
            leadingIcon: "mdi:map",
            iconColor: "text-yellow-400",
          },
          // {
          //   isActive: false,
          //   href: "/settings/customer/discountType",
          //   label: "Discount Types",
          //   leadingIcon: "mdi:map",
          //   iconColor: "text-yellow-400",
          // },
        ],
      },
      {
        isActive: false,
        href: "#",
        label: "Location",
        leadingIcon: "mdi:map-marker",
        trailingIcon: "mdi-light:chevron-right",
        iconColor: "text-yellow-400",
        children: [
          {
            isActive: false,
            href: "/settings/country",
            label: "Country",
            leadingIcon: "mdi:earth",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/region",
            label: "Region",
            leadingIcon: "mdi:map-outline",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/area",
            label: "Area",
            leadingIcon: "tabler:building-warehouse",
            iconColor: "text-violet-500",
          },
          {
            isActive: false,
            href: "/settings/location",
            label: "Location",
            leadingIcon: "mdi:earth",
            iconColor: "text-green-500",
          },
          // {
          //   isActive: false,
          //   href: "/settings/routetype",
          //   label: "Route Type",
          //   leadingIcon: "mdi:map-marker-path",
          //   iconColor: "text-green-500",
          // },
        ],
      },
      {
        isActive: false,
        href: "#",
        label: "Item",
        leadingIcon: "mdi:package-variant-closed",
        trailingIcon: "qlementine-icons:items-grid-small-24",
        iconColor: "text-yellow-400",
        children: [
          {
            isActive: false,
            href: "/settings/brand",
            label: "Brand",
            leadingIcon: "mdi:earth",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/item/category",
            label: "Item Category",
            leadingIcon: "lucide:user",
            iconColor: "text-green-500",
          },
          {
            isActive: false,
            href: "/settings/item/subCategory",
            label: "Item Sub Category",
            leadingIcon: "mdi:package-variant",
            iconColor: "text-cyan-500",
          },
        ],
      },
      {
        isActive: false,
        href: "/settings/bank",
        label: "Bank",
        leadingIcon: "mdi:bank",
        iconColor: "text-yellow-400",
      },
      {
        isActive: false,
        href: "/settings/distributorsStock",
        label: "Distributors Stock",
        leadingIcon: "tabler:building-warehouse",
        iconColor: "text-green-500",
      },
      {
        isActive: false,
        href: "/settings/promotionTypes",
        label: "Promotion Type",
        leadingIcon: "hugeicons:promotion",
        iconColor: "text-green-500",
      },
      {
        isActive: false,
        href: "/settings/globalSetting",
        label: "Global Settings",
        leadingIcon: "mi:settings",
        iconColor: "text-green-500",
      },
      {
        isActive: false,
        href: "/settings/approval",
        label: "Approval Settings",
        leadingIcon: "mi:settings",
        iconColor: "text-green-500",
      }
    ],
  },
];
