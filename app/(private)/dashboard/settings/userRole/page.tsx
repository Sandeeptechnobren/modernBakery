"use client";

import { useThemeToggle } from "@/app/(private)/utils/useThemeToggle";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Popup from "@/app/components/popUp";
import Toggle from "@/app/components/toggle";
import { useState } from "react";
import AddRole from "./addRole";

export default function UserRole() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { theme, toggle } = useThemeToggle();



  return (
    <div className="flex bg-white w-full h-[calc(100%-46px)] border border-[#E9EAEB] rounded-[8px] overflow-hidden">
      {/* Right Side Content */}
      <div className="p-[20px] hidden sm:block">
        <h1 className="text-[18px] font-semibold">Users & Roles</h1>



        {/* Change Theme with Toggle Switch */}
        <div className="mt-3">
          <Toggle
            isChecked={theme === "layoutTheme2"}
            onChange={toggle}
            label="Dark Mode"
          />
        </div>

        <SidebarBtn
          isActive={true}
          label="Add Role"
          // don't redirect if parent


          leadingIcon={"tabler:plus"}


          trailingIconTw="hidden group-hover:block"
          onClick={() => setIsPopupOpen(true)}
        />

        {/* Popup with AddRole Form */}
        {isPopupOpen && (
          <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
            <AddRole onClose={() => setIsPopupOpen(false)} />
          </Popup>
        )}
      </div>
    </div>
  );
}
