"use client";

import { useState } from "react";
import Logo from "../../components/logo";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { LinkDataType, SidebarDataType } from "../data/dashboardLinks";

export default function Sidebar({
  data,
  onClickHandler,
}: {
  data: SidebarDataType[];
  onClickHandler: (href: string) => void;
}) {
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
      onClickHandler(href);
    }
  };

  // Helper to check if a parent menu should be active if any child is active
  const isParentActive = (children: LinkDataType[] | undefined): boolean => {
    if (!children) return false;
    return Boolean(children.some((child) => child.href === activeHref));
  };

  return (
    <div className="group peer">
      <div className="w-[80px] group-hover:w-[250px] h-[100vh] fixed ease-in-out duration-300 bg-white">
        {/* logo */}
        <div className="w-full h-[60px] px-[16px] py-[12px] border-r-[1px] border-b-[1px] border-[#E9EAEB]">
          <div className="w-[24px] group-hover:w-full h-full m-auto">
            <Logo
              width={128}
              height={35}
              twClass="object-cover h-full object-[0%_center]"
            />
          </div>
        </div>

        {/* menu */}
        <div className="w-full h-[900px] py-5 px-4 border-[1px] border-[#E9EAEB] border-t-0">
          <div className="mb-5 w-full h-full">
            {data.map((group: SidebarDataType) => (
              <div key={group.name} className="group-hover:mb-[20px]">
                <div className="text-[#717680] text-[14px] mb-3 hidden group-hover:block">
                  {group.name}
                </div>
                <ul className="w-full flex flex-col gap-[6px]">
                  {group.data.map((link: LinkDataType) => {
                    const hasChildren = Boolean(link.children && link.children.length > 0);
                    const isOpen = openMenus[link.label] ?? false;

                    // Determine trailing icon based on open state for menus with children
                    const trailingIcon = hasChildren
                      ? isOpen
                        ? "mdi-light:chevron-down"
                        : "mdi-light:chevron-right"
                      : link.trailingIcon;

                    // Determine if this link or its children are active
                    const isActive = link.href === activeHref || isParentActive(link.children);

                    return (
                      <li key={link.href}>
                        <SidebarBtn
                          isActive={isActive}
                          href={hasChildren ? "#" : link.href} // don't redirect if parent
                          label={link.label}
                          labelTw="hidden group-hover:block"
                          leadingIcon={link.leadingIcon}
                          trailingIcon={trailingIcon}
                          trailingIconTw="hidden group-hover:block"
                          onClick={() => handleClick(link.href, link.label, hasChildren)}
                        />

                        {hasChildren && isOpen && link.children && (
                          <ul className="gap-[6px] mt-1">
                          {link.children.map((child: LinkDataType) => (
                            <SidebarBtn
                              key={child.href}
                              isActive={child.href === activeHref}
                              href={child.href}
                              label={child.label}
                              labelTw="hidden group-hover:block"
                              leadingIcon={child.leadingIcon}
                              isSubmenu={true}
                              onClick={() => {
                                setActiveHref(child.href);
                                onClickHandler(child.href);
                              }}
                            />
                          ))}
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
