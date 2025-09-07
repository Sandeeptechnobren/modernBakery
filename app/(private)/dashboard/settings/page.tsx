"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { SettingsContext, SettingsContextValue } from "../contexts";
import { useContext } from "react";

export default function Settings() {
    const context = useContext<SettingsContextValue | undefined>(SettingsContext);
    if (!context) {
        throw new Error("Settings must be used within a SettingsContext.Provider");
    }
    const { settings, dispatchSettings } = context;

    return (
        <>
            <h1 className="text-[20px] font-semibold text-[#181D27] mb-[16px]">
                Settings
            </h1>
            <div className="flex bg-white w-full h-[calc(100%-46px)] border-[1px] border-[#E9EAEB] rounded-[8px] overflow-hidden">
                {/* Settings sub-options */}
                <div className="overflow-auto w-[240px] border-r-[1px] border-[#E9EAEB] p-[12px] flex flex-col gap-[6px]">
                    <SidebarBtn
                        isActive={true}
                        label="Users & Roles"
                        leadingIcon="hugeicons:workflow-square-06"
                        leadingIconSize={20}
                    />
                    <SidebarBtn
                        label="Change Password"
                        leadingIcon="mynaui:lock"
                        leadingIconSize={20}
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

                {/* Sub Options details */}
                <div className="p-[20px] hidden sm:block">
                    <h1 className="text-[18px] font-semibold">Users & Roles</h1>
                    <button
                        className="bg-text-primary text-white p-2 rounded"
                        onClick={() => {
                            console.log(settings.layout.dashboard.value);
                            
                            dispatchSettings({
                                type: "layoutToggle",
                                payload: {}
                            });
                        }}
                    >
                        Toggle Layout
                    </button>

                    <button className="bg-text-secondary text-white p-2 rounded" onClick={() => {
                    }}>change theme color</button>
                </div>
            </div>
        </>
    );
}
