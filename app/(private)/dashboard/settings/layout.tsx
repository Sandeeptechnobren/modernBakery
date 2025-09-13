"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { SettingsContext, SettingsContextValue } from "../contexts";
import { useContext } from "react";

export default function Settings({ children }: { children: React.ReactNode }) {
  const context = useContext<SettingsContextValue | undefined>(SettingsContext);

  if (!context) {
    throw new Error("Settings must be used within a SettingsContext.Provider");
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Page title */}
      <h1 className="text-lg sm:text-xl font-semibold text-[#181D27] mb-4">
        Settings
      </h1>

      {/* Main container */}
      <div className="flex flex-col md:flex-row bg-white w-full h-full border border-[#E9EAEB] rounded-[8px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-[#E9EAEB] p-3 flex-shrink-0 overflow-auto">
          <div className="flex flex-col gap-[6px]">
            <SidebarBtn
              isActive={true}
              label="Add Roles"
              leadingIcon="hugeicons:workflow-square-06"
              leadingIconSize={20}
              href="/dashboard/settings/userRole"
            />
            <SidebarBtn
              label="Users"
              leadingIcon="mdi:account-circle"
              leadingIconSize={20}
              href="/dashboard/settings/user"
            />
            <SidebarBtn
              label="Roles"
              leadingIcon="mdi:account-tie"
              leadingIconSize={20}
              href="/dashboard/settings/role"
            />
            <SidebarBtn
              label="Change Password"
              leadingIcon="mynaui:lock"
              leadingIconSize={20}
              href="/dashboard/settings/changePassword"
            />
            <SidebarBtn
              label="Master Data"
              leadingIcon="tabler:database"
              leadingIconSize={20}
            />
            <SidebarBtn
              label="Preferences"
              leadingIcon="hugeicons:sliders-vertical"
              leadingIconSize={20}
            />
            <SidebarBtn
              label="Taxes"
              leadingIcon="ic:round-percent"
              leadingIconSize={20}
            />
            <SidebarBtn
              label="Reason"
              leadingIcon="lucide:life-buoy"
              leadingIconSize={20}
            />
            <SidebarBtn
              label="Bank"
              leadingIcon="hugeicons:bank"
              leadingIconSize={20}
            />
            <SidebarBtn
              label="Currency"
              leadingIcon="hugeicons:money-04"
              leadingIconSize={20}
            />
            <SidebarBtn
              label="Warehouse"
              leadingIcon="hugeicons:warehouse"
              leadingIconSize={20}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 md:p-5">{children}</div>
      </div>
    </div>
  );
}
