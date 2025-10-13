"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import { LinkDataType, SidebarDataType } from "../data/dashboardLinks";

export default function HorizontalSidebar({
  data,
  onClickHandler,
}: {
  data: SidebarDataType[];
  onClickHandler: (href: string) => void;
}) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [activeHref, setActiveHref] = useState<string>("");
  const pathname = usePathname();

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
  }, [pathname]);

  return (
    <div className="w-full h-[44px] bg-white border-b-[1px] border-[#E9EAEB] flex items-center px-[16px] py-[12px] gap-[32px] overflow-x-auto overflow-y-visible relative z-40">
      {data && Array.isArray(data) && data.map((group: SidebarDataType, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-[32px]">
          {group.data.map((link: LinkDataType, linkIndex) => {
            const hasChildren = Boolean(link.children && link.children.length > 0);
            const isChildrenOpen = openMenus[link.label] ?? false;
            const isActive = link.href === activeHref || isParentActive(link.children);

            return (
              <div key={link.href + linkIndex} className="relative z-50">
                {/* Main menu item */}
                <div
                  className={`text-[#414651] flex items-center gap-[4px] justify-between cursor-pointer hover:text-[#EA0A2A] transition-colors ${
                    isActive ? "text-[#EA0A2A] font-medium" : ""
                  }`}
                  onClick={() => handleClick(link.href, link.label, hasChildren)}
                >
                  <div className="flex items-center gap-[8px] whitespace-nowrap">
                    <Icon icon={link.leadingIcon} width={20} />
                    <span>{link.label}</span>
                  </div>
                  {hasChildren && (
                    <Icon
                      icon={isChildrenOpen ? "mdi-light:chevron-down" : "mdi-light:chevron-right"}
                      width={18}
                      className={isChildrenOpen ? "rotate-0" : "rotate-90"}
                    />
                  )}
                </div>

                {/* Dropdown for children */}
                {hasChildren && isChildrenOpen && link.children && (
                  <div className="sticky top-full left-0 mt-1 bg-white border border-[#E9EAEB] rounded-md shadow-lg z-[9999] min-w-[200px] max-h-[300px] overflow-y-auto">
                    {link.children.map((child: LinkDataType, childIndex) => {
                      const isChildActive = child.href === activeHref;
                      
                      return (
                        <div
                          key={child.href + childIndex}
                          className={`px-4 py-3 cursor-pointer hover:bg-[#FFF0F2] transition-colors border-b border-[#E9EAEB] last:border-b-0 ${
                            isChildActive ? "text-[#EA0A2A] bg-[#FFF0F2] font-medium" : "text-[#414651]"
                          }`}
                          onClick={() => {
                            setActiveHref(child.href);
                            onClickHandler(child.href);
                            setOpenMenus({}); // Close all dropdowns after selection
                          }}
                        >
                          <div className="flex items-center gap-[8px] whitespace-nowrap">
                            <Icon icon={child.leadingIcon} width={16} />
                            <span className="text-sm">{child.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
