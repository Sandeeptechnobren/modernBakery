"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "../../components/logo";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { LinkDataType, SidebarDataType } from "../data/dashboardLinks";
import { useRouter } from "next/navigation";
import { usePermissionManager } from "@/app/components/contexts/usePermission";

export default function Sidebar({
  onClickHandler,
  isOpen,
  setIsOpen
}: {
  onClickHandler: (href: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { filteredMenu } = usePermissionManager();
  const data: SidebarDataType[] = (() => {
    if (!filteredMenu) return [];
    // If filteredMenu items are grouped (have 'data') treat as SidebarDataType[]
    if (Array.isArray(filteredMenu) && filteredMenu.length > 0 && 'data' in filteredMenu[0]) {
      return filteredMenu as unknown as SidebarDataType[];
    }
    // Otherwise assume it's a flat LinkDataType[] and wrap into a single group
    return [
      {
        name: undefined,
        data: filteredMenu as unknown as LinkDataType[],
      },
    ];
  })();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [activeHref, setActiveHref] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? false),
    }));
  };

  const handleClick = (href: string, label: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleMenu(label);
      setIsOpen(true); // Ensure sidebar is open when interacting with menus
    } else {
      setActiveHref(href);
      onClickHandler(href);
    }
  };

  // Helper to check if a parent menu should be active if any child is active
  const isParentActive = (children: LinkDataType[] | undefined): boolean => {
    if (!children) return false;
    return Boolean(children.some((child) => child.href === activeHref));
  };

  useEffect(() => {
    const current = pathname ?? window.location.pathname;
    setActiveHref(current);

    const initialOpen: Record<string, boolean> = {};
    data.forEach((group) => {
      group.data.forEach((link) => {
        if (link.children && link.children.length > 0) {
          const shouldOpen = link.children.some((child) => child.href === current);
          if (shouldOpen) {
            initialOpen[link.label] = true;
          }
        }
      });
    });

    setOpenMenus((prev) => ({ ...prev, ...initialOpen }));
  }, [])

  // close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && e.target instanceof Node && !wrapperRef.current.contains(e.target)) {
        try { setIsOpen(false); } catch (err) { /* ignore */ }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="group peer" ref={wrapperRef}>
      <div className={`${isOpen ? "w-[250px]" : "w-[80px]"} group-hover:w-[250px] h-[100vh] absolute ease-in-out duration-600 bg-white z-50 pb-[40px]`}>
        {/* logo */}
        <div className="w-full h-[60px] px-[16px] py-[12px] border-r-[1px] border-b-[1px] border-[#E9EAEB]">
          <div
            onClick={() => router.push("/")}
            className={`${isOpen ? "w-full" : "w-[24px]"}  group-hover:w-full h-full m-auto cursor-pointer`}>
            <Logo
              width={128}
              height={35}
              twClass="object-cover h-full object-[0%_center]"
            />
          </div>
        </div>

        {/* menu */}
        <div className={`w-full h-[calc(100vh-60px)] text-sm py-5 ${isOpen ? "px-2" : "px-4"} group-hover:px-2 transition-all ease-in-out border-[1px] border-[#E9EAEB] border-t-0 overflow-y-auto scrollbar-none`}>
          <div className="mb-5 w-full h-full">
            {data.map((group: SidebarDataType,index) => (
              <div key={index} className={`${isOpen ? "mb-[20px]" : "m-0" } group-hover:mb-[20px]`}>
                {/* <div className={`text-[#717680] text-[14px] mb-3 ${isOpen ? "block" : "hidden"} group-hover:block`}>
                  {group.name}
                </div> */}
                <ul className="w-full flex flex-col gap-[6px]">
                  {group.data.map((link: LinkDataType, index) => {
                    const hasChildren = Boolean(link.children && link.children.length > 0);
                    const isChildrenOpen = openMenus[link.label] ?? false;

                    // Determine trailing icon based on open state for menus with children
                    const trailingIcon = hasChildren
                      ? isChildrenOpen
                        ? "mdi-light:chevron-down"
                        : "mdi-light:chevron-right"
                      : link.trailingIcon;

                    // Determine if this link or its children are active
                    const isActive = link.href === activeHref || isParentActive(link.children);

                    return (
                      <li key={link.href+index}>
                        <SidebarBtn
                          isActive={isActive}
                          href={hasChildren ? "#" : link.href} // don't redirect if parent
                          label={link.label}
                          labelTw={`${isOpen ? "block" : "hidden" } group-hover:block text-sm`}
                          leadingIcon={link.leadingIcon}
                          leadingIconSize={20}
                          trailingIcon={trailingIcon}
                          trailingIconTw={`${isOpen ? "block" : "hidden" } group-hover:block`}
                          // className={isOpen ? "" : "justify-center"}
                          onClick={() => handleClick(link.href, link.label, hasChildren)}
                        />

                        {hasChildren && isChildrenOpen && link.children && (
                          <ul className={`${isOpen ? "block" : "hidden"} group-hover:block mt-1 ml-[10px]`}>
                            {link.children.map((child: LinkDataType) => {
                              const isChildActive = child.href === activeHref;

                              return (
                                <li
                                  key={child.href}
                                  className={`w-full cursor-pointer transition-all rounded-md ${isChildActive ? "text-[#2563eb] font-medium" : "hover:bg-[#FFF0F2]"
                                    }`}
                                >
                                  <div
                                    className="flex items-center gap-2 w-full"
                                    onClick={() => {
                                      setActiveHref(child.href);
                                      onClickHandler(child.href);
                                    }}
                                  >
                                    {/* Line indicator */}
                                    <span
                                      className={`w-0.5 h-8 ml-4 flex-shrink-0 rounded ${isChildActive ? "bg-red-500" : "bg-gray-300"
                                        }`}
                                    ></span>

                                    {/* Label (fills remaining space, clickable too) */}
                                    <div className="flex-1">
                                      <SidebarBtn
                                        isActive={false} // no background
                                        href={child.href}
                                        label={child.label}
                                        labelTw={`${isOpen ? "block" : "hidden"} group-hover:block`}
                                        isSubmenu={true}
                                      />
                                    </div>
                                  </div>
                                </li>








                              );
                            })}
                          </ul>
                        )}

                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}