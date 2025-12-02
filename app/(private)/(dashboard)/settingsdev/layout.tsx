"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { initialLinkData } from "../../data/settingLinks";
import { LinkDataType, SidebarDataType } from "../../data/settingLinks";
import usePermissionManager from "@/app/components/contexts/usePermission";
import { useRouter } from "next/navigation";

export default function Settings({ children }: { children: React.ReactNode }) {
  const { settingsMenu, allowedPaths } = usePermissionManager();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [activeHref, setActiveHref] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? false),
    }));
  };

  const handleClick = (href: string, label: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleMenu(label);
    } else {
      setActiveHref(href);
    }
  };

  const isParentActive = (children: LinkDataType[] | undefined): boolean => {
    if (!children) return false;
    return Boolean(children.some((child) => child.href === activeHref));
  };

  const pathname = usePathname();

  useEffect(() => {
    const current = pathname ?? window.location.pathname;
    setActiveHref(current);

    // Initialize open menus so any parent with a matching child is opened
    const initialOpen: Record<string, boolean> = {};
    initialLinkData.forEach((group) => {
      group.data.forEach((link) => {
        if (link.children && link.children.length > 0) {
          const shouldOpen = link.children.some((child) => child.href === current);
          if (shouldOpen) initialOpen[link.label] = true;
        }
      });
    });

    setOpenMenus((prev) => ({ ...prev, ...initialOpen }));
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Page title */}
      <h1 className="text-lg sm:text-xl font-semibold text-[#181D27] mb-4">
        <div className="flex items-center gap-2">
          <span>Settings</span>
        </div>
      </h1>

      <div className="flex bg-white w-full h-full border border-[#E9EAEB] rounded-[8px] overflow-auto md:overflow-hidden transition-all duration-600 ease-in-out">
        {/* Sidebar */}
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`${isOpen ? "w-[250px]" : "w-[80px]"} md:${isOpen ? "w-[250px]" : "w-[80px]"} border-b md:border-b-0 md:border-r border-[#E9EAEB] p-3 flex-shrink-0 overflow-auto scrollbar-none transition-all duration-200`}
        >
          <div className="flex flex-col gap-[6px]">
            <div className={`${isOpen ? "mb-[20px]" : "m-0"}`}>
              <ul className="w-full flex flex-col gap-[6px]">
                {settingsMenu?.map(
                  (link: LinkDataType, linkIdx) => {
                    const hasChildren = Boolean(
                      link.children &&
                      link.children.length > 0
                    );
                    const isMenuOpen =
                      openMenus[link.label] ??
                      false;

                    const trailingIcon = hasChildren
                      ? isMenuOpen
                        ? "mdi-light:chevron-down"
                        : "mdi-light:chevron-right"
                      : link.trailingIcon;

                    const isActive = link.href === activeHref || isParentActive(link.children);

                    return (
                      <li
                        key={`${link.href || "parent"}-${link.label}-${linkIdx}`}
                      >
                        <SidebarBtn
                          isActive={isActive}
                          href={hasChildren ? "#" : link.href}
                          buttonTw="px-3 py-2 h-fit w-full"
                          label={link.label}
                          labelTw={`${isOpen ? "block" : "hidden"}`}
                          leadingIcon={link.leadingIcon}
                          trailingIcon={trailingIcon}
                          trailingIconTw={`${isOpen ? "block" : "hidden"}`}
                          onClick={() => handleClick(link.href, link.label, hasChildren)}
                        />

                        {hasChildren &&
                          isMenuOpen &&
                          link.children && (
                            <ul className={`${isOpen ? "block" : "hidden"} gap-[6px] mt-1 ml-[10px]`}>
                              {link.children.map(
                                (child: LinkDataType, childIdx) => {
                                  const isChildActive = child.href === activeHref;
                                  return (
                                    <li
                                      key={`${child.href || "child"}-${child.label}-${childIdx}`}
                                      className={`w-full cursor-pointer transition-all rounded-md ${isChildActive
                                        ? "text-[#2563eb] font-medium"
                                        : ""
                                        }`}
                                    >
                                      <div
                                        className="flex items-center gap-2 w-full"
                                        onClick={() => {
                                          setActiveHref(child.href)
                                        }}
                                      >
                                        <span className={`w-0.5 h-8 ml-4 flex-shrink-0 rounded ${isChildActive ? "bg-[var(--primary-btn-color)]" : "bg-gray-300"}`}></span>
                                        <div className="flex-1">
                                          <SidebarBtn
                                            isActive={false}
                                            href={child.href}
                                            label={child.label}
                                            labelTw={`${isOpen ? "block" : "hidden"}`}
                                            isSubmenu={true}
                                          />
                                        </div>
                                      </div>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          )}
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-auto p-3 md:p-5 scrollbar-none`}>
          {children}
        </div>
      </div>
    </div>
  );
}
