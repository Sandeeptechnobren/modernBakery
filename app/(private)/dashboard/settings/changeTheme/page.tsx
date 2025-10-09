"use client";

import Toggle from "@/app/components/toggle";
import { useTheme } from "../../contexts";

export default function UserRole() {
    const { theme, setTheme, toggleTheme } = useTheme();

    return (
        <>
            {/* Right Side Content */}
            <div className="p-[20px]">
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
