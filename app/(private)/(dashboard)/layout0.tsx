"use client";

import { useContext, useEffect, useReducer, useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar0";
import TopBar from "./topBar";
import { initialLinkData, LinkDataType, SidebarDataType } from "../data/dashboardLinks";
import LinkDataReducer from "../utils/linkDataReducer";
import { AllDropdownListDataProvider } from "@/app/components/contexts/allDropdownListData";
import { LoadingProvider } from "@/app/services/loadingContext";
import { getRoleById } from "@/app/services/allApi";
import { usePathname, useRouter } from "next/navigation";

// type MenuItem = {
//   isActive: boolean;
//   href: string;
//   label: string;
//   leadingIcon?: string;
//   trailingIcon?: string;
//   iconColor?: string;
//   children?: MenuItem[];
// };

/**
 * Filters a full sidebar menu array based on role menus/submenus permissions.
 */
export type ChildrenItems = {
  isActive: boolean;
  href: string;
  label: string;
  leadingIcon: string;
  trailingIcon?: string;  // optional if sometimes missing
  iconColor: string;
  children?: ChildrenItems[]; // optional if nested children exist
};

const DashboardLayout0 = ({ children }: { children: React.ReactNode }) => {

    const [horizontalSidebar, setHorizontalSidebar] = useState(false);
    const route = useRouter()
    const toggleSidebar = () => {
        setHorizontalSidebar(!horizontalSidebar);
    };
    const [isOpen, setIsOpen] = useState(false);

    // Use useReducer to manage the sidebar data
    const [_, dispatch] = useReducer(LinkDataReducer, initialLinkData);
    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        setIsOpen(false);
        dispatch({ type: "activate", payload: clickedHref });
    };

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-hidden bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar onClickHandler={handleLinkClick} isOpen={isOpen} setIsOpen={setIsOpen} />}
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
