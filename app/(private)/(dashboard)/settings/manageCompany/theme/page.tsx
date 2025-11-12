"use client";

import Toggle from "@/app/components/toggle";
import { useTheme } from "../../../contexts";

export default function UserRole() {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            {/* Right Side Content */}
            <div className="p-[20px] hidden sm:block">
                <h1 className="text-[18px] font-semibold">Theme</h1>

                <div className="mt-3">
                    <Toggle
                        isChecked={theme === "layoutTheme2"}
                        onChange={toggleTheme}
                        label="Dark Mode"
                    />
                </div>


                
            </div>
        </>
    );
}
