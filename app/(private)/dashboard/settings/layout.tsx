"use client";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { SettingsContext, SettingsContextValue } from "../contexts";
import { useContext, useState } from "react";
import { initialLinkData } from "../../data/settingLinks";
import { LinkDataType, SidebarDataType } from "../../data/settingLinks";

export default function Settings({ children }: { children: React.ReactNode }) {
  const context = useContext<SettingsContextValue | undefined>(SettingsContext);

  if (!context) {
    throw new Error("Settings must be used within a SettingsContext.Provider");
  }

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [activeHref, setActiveHref] = useState<string>("");

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

  return (
    <div className="flex flex-col h-full w-full">
      {/* Page title */}
      <h1 className="text-lg sm:text-xl font-semibold text-[#181D27] mb-4">
        Settings
      </h1>

      {/* Main container */}
      <div className="flex flex-col md:flex-row bg-white w-full h-full border border-[#E9EAEB] rounded-[8px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-[#E9EAEB] p-3 flex-shrink-0 overflow-auto">
         <div className="flex flex-col gap-[6px]">
  {initialLinkData.map((group: SidebarDataType, groupIdx) => (
    <div key={group.name || groupIdx} className="mb-[20px]">
      <ul className="w-full flex flex-col gap-[6px]">
        {group.data.map((link: LinkDataType, linkIdx) => {
  const hasChildren = Boolean(link.children && link.children.length > 0);
  const isOpen = openMenus[link.label] ?? false;

  const trailingIcon = hasChildren
    ? isOpen
      ? "mdi-light:chevron-down"
      : "mdi-light:chevron-right"
    : link.trailingIcon;

  const isActive = link.href === activeHref || isParentActive(link.children);

  return (
    <li key={`${link.href || "parent"}-${link.label}-${linkIdx}`}>
      <SidebarBtn
        isActive={isActive}
        href={hasChildren ? "#" : link.href}
        label={link.label}
        leadingIcon={link.leadingIcon}
        trailingIcon={trailingIcon}
        onClick={() => handleClick(link.href, link.label, hasChildren)}
      />

      {hasChildren && isOpen && link.children && (
        <ul className="gap-[6px] mt-1 ml-[10px]">
          {link.children.map((child: LinkDataType, childIdx) => {
            const isChildActive = child.href === activeHref;

            return (
              <li
                key={`${child.href || "child"}-${child.label}-${childIdx}`}
                className={`w-full cursor-pointer transition-all rounded-md ${
                  isChildActive
                    ? "text-[#2563eb] font-medium"
                    : "hover:bg-[#FFF0F2]"
                }`}
              >
                <div
                  className="flex items-center gap-2 w-full"
                  onClick={() => setActiveHref(child.href)}
                >
                  <span
                    className={`w-0.5 h-8 ml-4 flex-shrink-0 rounded ${
                      isChildActive ? "bg-red-500" : "bg-gray-300"
                    }`}
                  ></span>

                  <div className="flex-1">
                    <SidebarBtn
                      isActive={false}
                      href={child.href}
                      label={child.label}
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 md:p-5">{children}</div>
      </div>
    </div>
  );
}
