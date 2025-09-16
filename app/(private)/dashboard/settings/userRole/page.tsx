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
        <>
            {/* Right Side Content */}
            <div className="p-[20px] hidden sm:block">
                <h1 className="text-[18px] font-semibold">Users & Roles</h1>

                <div className="mt-3">
                    <Toggle
                        isChecked={theme === "layoutTheme2"}
                        onChange={toggle}
                        label="Dark Mode"
                    />
                </div>

                <div className="w-[200px] mt-[10px]">
                    <SidebarBtn
                        isActive={true}
                        label="Add Role"
                        leadingIcon={"tabler:plus"}
                        trailingIconTw="hidden group-hover:block"
                        onClick={() => setIsPopupOpen(true)}
                    />
                </div>

                {/* Popup with AddRole Form */}
                {isPopupOpen && (
                    <Popup
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                    >
                        <AddRole onClose={() => setIsPopupOpen(false)} />
                    </Popup>
                )}
            </div>
        </>
    );
}
