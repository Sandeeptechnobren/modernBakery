"use client";

import { useThemeToggle } from "@/app/(private)/utils/useThemeToggle";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Popup from "@/app/components/popUp";
import Toggle from "@/app/components/toggle";
import { useState } from "react";

export default function UserRole() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { theme, toggle } = useThemeToggle();

    return (
        <>
            {/* Right Side Content */}
            <div className="p-[20px] hidden sm:block">

                <div className="mt-3">
                    <Toggle
                        isChecked={theme === "layoutTheme2"}
                        onChange={toggle}
                        label="Dark Mode"
                    />
                </div>

               

                
            </div>
        </>
    );
}
