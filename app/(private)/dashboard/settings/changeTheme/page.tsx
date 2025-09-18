"use client";

import { useThemeToggle } from "@/app/(private)/utils/useThemeToggle";
import Toggle from "@/app/components/toggle";

export default function UserRole() {
    const { theme, toggle } = useThemeToggle();

    return (
        <>
            {/* Right Side Content */}
            <div className="p-[20px]">
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
