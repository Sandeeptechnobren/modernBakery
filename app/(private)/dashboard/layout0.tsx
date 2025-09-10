"use client";

import { useEffect, useReducer, useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar0";
import TopBar from "./topBar";
import { initialLinkData } from "../data/dashboardLinks";
import LinkDataReducer from "../utils/linkDataReducer";

const DashboardLayout0 = ({ children }: { children: React.ReactNode }) => {
    const [horizontalSidebar, setHorizontalSidebar] = useState<boolean>(true);

    const toggleSidebar = () => {
        localStorage?.setItem(
            "horizontalSidebar",
            (!horizontalSidebar).toString()
        );
        setHorizontalSidebar(!horizontalSidebar);
    };

    useEffect(() => {
        setHorizontalSidebar(
            localStorage?.getItem("horizontalSidebar") === "true"
        );
    }, []);

    // Use useReducer to manage the sidebar data
    const [sidebarData, dispatch] = useReducer(LinkDataReducer, initialLinkData);

    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-hidden bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar data={sidebarData} onClickHandler={handleLinkClick} />}
            <TopBar
                horizontalSidebar={horizontalSidebar}
                toggleSidebar={toggleSidebar}
            />
            <Main horizontalSidebar={horizontalSidebar}>{children}</Main>
        </div>
    );
};

export default DashboardLayout0;
