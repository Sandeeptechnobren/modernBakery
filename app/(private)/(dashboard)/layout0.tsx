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

type MenuItem = {
    isActive: boolean;
    href?: string;
    label: string;
    leadingIcon: string;
    iconColor: string;
    trailingIcon?: string;
    children?: ChildrenItem[];
};

type ChildrenItem = {
    isActive?: boolean;
    href?: string;
    label?: string;
    leadingIcon?: string;
    iconColor?: string;
};

type PermissionSubmenu = {
    id: number;
    name: string;
    path: string;
    permissions: { permission_id: number; permission_name: string }[];
};

type PermissionMenu = {
    id: number;
    menu: { id: number; name: string; path: string };
    submenu: PermissionSubmenu[];
};

type Permission = {
    permission_id: number;
    permission_name: string;
};

type SubMenu = {
    id: number;
    name: string;
    path: string;
    permissions: Permission[];
};

type RoleMenu = {
    id: number;
    menu: {
        id: number;
        name: string;
        path: string;
    };
    submenu: SubMenu[];
};

type Role = {
    id: number;
    name: string;
    status: number;
    menus: RoleMenu[];
};

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
export function filterMenuByPermissions(
    allMenus: LinkDataType[],
    role: Role
): LinkDataType[] {
    const allowedMenus = role?.menus?.map((m) => m.menu.name);
    const allowedSubMenus = role?.menus?.flatMap((m) => m.submenu.map((s) => s.name));

    return allMenus
        .filter((menu) => allowedMenus.includes(menu.label))
        .map((menu) => {
            if (menu.children && menu.children.length > 0) {
                const filteredChildren = menu.children.filter((child) =>
                    allowedSubMenus.includes(child.label)
                );
                return { ...menu, children: filteredChildren };
            }
            return menu;
        });
}

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
    const [filterdMenu, setFilterdMenu] = useState<SidebarDataType[]>([])
    const route = useRouter()
    const toggleSidebar = () => {
        setHorizontalSidebar(!horizontalSidebar);
    };
    const [isOpen, setIsOpen] = useState(false);

    // Use useReducer to manage the sidebar data
    const [sidebarData, dispatch] = useReducer(LinkDataReducer, initialLinkData);
  const pathname = usePathname();
    // Handle a link click to dispatch an action
    const handleLinkClick = (clickedHref: string) => {
        setIsOpen(false);
        dispatch({ type: "activate", payload: clickedHref });
    };

    useEffect(() => {
        //    if (!isEditMode) return;
        const fetchPermission = async () => {
            //  setLoading(true);
            const id = localStorage.getItem("role")
            const res = await getRoleById(id as string);
            const data: LinkDataType[] = sidebarData[0].data
            const allFilterdMenu:LinkDataType[] = filterMenuByPermissions(data, res.data)
            console.log(allFilterdMenu,"allFilterdMenu")
            setFilterdMenu([{ data: allFilterdMenu }])

            const allChildernsUrl:string[] = []

            allFilterdMenu.map((filterdChildrenMerge:LinkDataType)=>{
                // allChildernsUrl = [...filterdChildrenMerge.children]
                // console.log([...filterdChildrenMerge.children])
                // if(filterdChildrenMerge){
                if(filterdChildrenMerge?.children)
                {
                filterdChildrenMerge?.children.map((child)=>{
                    allChildernsUrl.push(child?.href)

                })
            }

            // }
            })
            console.log("pathname",pathname)
            // if(!allChildernsUrl.includes(pathname))
            // {
            //     if(allChildernsUrl.length>0){
            //         route.push(`${allChildernsUrl[0]}`)
            //     } else {
            //         route.push("/dashboard")
            //     }
            // }

             console.log(allChildernsUrl,"allChildernsUrl")
            //  setLoading(false);

        };
        fetchPermission();
    }, []);

    useEffect(() => {
    }, [])

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-hidden bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar data={filterdMenu} onClickHandler={handleLinkClick} isOpen={isOpen} setIsOpen={setIsOpen} />}
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
