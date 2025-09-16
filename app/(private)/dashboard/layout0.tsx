"use client";

import { useContext, useEffect, useReducer, useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar0";
import TopBar from "./topBar";
import { initialLinkData } from "../data/dashboardLinks";
import LinkDataReducer from "../utils/linkDataReducer";
import { SettingsContext } from "./contexts";

const DashboardLayout0 = ({ children }: { children: React.ReactNode }) => {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error("useThemeToggle must be used within SettingsContext.Provider");
    }

    const { settings, dispatchSettings } = context;
    const horizontalSidebar = settings.layout.dashboard.horizontalSidebar;
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        localStorage?.setItem(
            "horizontalSidebar",
            (!horizontalSidebar).toString()
        );
        dispatchSettings({ type: "toggleHorizontalSidebar", payload: { } });
    };

    useEffect(() => {
        if(localStorage?.getItem("horizontalSidebar") === "true" && !horizontalSidebar){
            dispatchSettings({ type: "toggleHorizontalSidebar", payload: { } });
        }
    }, []);

    // Use useReducer to manage the sidebar data
    const [sidebarData, dispatch] = useReducer(LinkDataReducer, initialLinkData);

    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-hidden bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar data={sidebarData} onClickHandler={handleLinkClick} isOpen={isOpen} />}
            <TopBar
                horizontalSidebar={horizontalSidebar}
                toggleSidebar={toggleSidebar}
                isOpen={isOpen}
                toggleOpen={() => setIsOpen(!isOpen)}
            />
            <Main horizontalSidebar={horizontalSidebar} isOpen={isOpen}>{children}</Main>
        </div>
    );
};

export default DashboardLayout0;
