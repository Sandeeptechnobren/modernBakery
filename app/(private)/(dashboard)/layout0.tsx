"use client";

import { useContext, useEffect, useReducer, useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar0";
import TopBar from "./topBar";
import { initialLinkData } from "../data/dashboardLinks";
import LinkDataReducer from "../utils/linkDataReducer";
import { AllDropdownListDataProvider } from "@/app/components/contexts/allDropdownListData";
import { LoadingProvider } from "@/app/services/loadingContext";
const DashboardLayout0 = ({ children }: { children: React.ReactNode }) => {

    const [horizontalSidebar, setHorizontalSidebar] = useState(false);
    const toggleSidebar = () => {
        setHorizontalSidebar(!horizontalSidebar);
    };
    const [isOpen, setIsOpen] = useState(false);

    // Use useReducer to manage the sidebar data
    const [sidebarData, dispatch] = useReducer(LinkDataReducer, initialLinkData);

    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        setIsOpen(false);
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-hidden bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar data={sidebarData} onClickHandler={handleLinkClick} isOpen={isOpen} setIsOpen={setIsOpen} />}
            <TopBar
                horizontalSidebar={horizontalSidebar}
                toggleSidebar={toggleSidebar}
                isOpen={isOpen}
                toggleOpen={() => setIsOpen(!isOpen)}
            />
            <Main horizontalSidebar={horizontalSidebar} isOpen={isOpen}>
                        <AllDropdownListDataProvider>
                <LoadingProvider >

                {children}
                       </LoadingProvider>
                       </AllDropdownListDataProvider>
                </Main>
        </div>
    );
};

export default DashboardLayout0;
