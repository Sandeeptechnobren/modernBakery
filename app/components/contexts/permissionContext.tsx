"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { getRoleById } from "@/app/services/allApi";
import { LinkDataType } from "../../(private)/data/dashboardLinks";

type PermissionContextType = {
  filteredMenu: LinkDataType[] | null;
  settingsMenu: LinkDataType[] | null;
  loading: boolean;
  error?: string | null;
  refreshPermissions: (
    allMenus: LinkDataType[] | null,
    type: string,
    options?: { roleId?: string; force?: boolean }
  ) => Promise<LinkDataType[]>;
  allowedPaths?: Set<string>;
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);
let allowedDashboardPaths = new Set<string>();
// let allowedSettingsPaths = new Set<string>();

export function filterMenuByPermissions(allMenus: LinkDataType[] = [], role: any): LinkDataType[] {
  if (!role || !Array.isArray(allMenus)) return [];
  const allowedMenus = (role?.menus || []).map((m: any) => m.menu?.name).filter(Boolean);

  // Create a map of submenu name to ID for easy lookup
  const submenuIdMap = new Map<string, number | string>();
  const permissions = new Map<string, number | string>();
  (role?.menus || []).forEach((m: any) => {
    if (Array.isArray(m.submenu)) {
      m.submenu.forEach((s: any) => {
        if (s.name && s.id) {
          submenuIdMap.set(s.name, s.id);
        }
        if (s.permissions) {
          permissions.set(s.name, s.permissions)
        }
      });
    }
  });

  const allowedSubMenus = (role?.menus || []).flatMap((m: any) => {
    const hrefs = Array.isArray(m.submenu) ? m.submenu.map((s: { path: string }) => s.path) : [];
    allowedDashboardPaths = new Set([...allowedDashboardPaths, ...hrefs]);
    return (Array.isArray(m.submenu) ? m.submenu.map((s: any) => s.name) : []);
  });

  return allMenus
    .filter((menu) => allowedMenus.includes(menu.label))
    .map((menu) => {
      if (menu.children && menu.children.length > 0) {
        const children = menu.children as any[];
        const filteredChildren = children
          .filter((child: any) => allowedSubMenus.includes(child.label))
          .map((child: any) => ({
            ...child,
            id: submenuIdMap.get(child.label),
            permissions: permissions.get(child.label)
          }));
        return { ...menu, children: filteredChildren };
      }
      return menu;
    });
}

function filterMenusByRole(allMenus: LinkDataType[] | null = [], roles: { path: string }[]) {
  // Extract allowed paths from role array
  const allowedPaths = new Set(roles.map(role => role.path));
  // allowedSettingsPaths = allowedPaths;

  // Recursive function to filter menu tree
  const filterRecursive = (menus: any) => {
    return menus
      .map((menu: any) => {
        // Clone menu object
        const newMenu = { ...menu };

        // If the menu has children, filter them too
        if (menu.children && menu.children.length > 0) {
          newMenu.children = filterRecursive(menu.children);
        }

        // Keep menu if it’s in allowed paths or has allowed children
        const isAllowed = allowedPaths.has(menu.href);
        const hasAllowedChildren = newMenu.children && newMenu.children.length > 0;

        return isAllowed || hasAllowedChildren ? newMenu : null;
      })
      .filter(Boolean); // remove nulls
  };

  return filterRecursive(allMenus);
}


export async function fetchFilteredMenu(allMenus: LinkDataType[] | null, type: string, roleId?: string): Promise<LinkDataType[]> {
  try {
    const rid = roleId ?? (typeof window !== "undefined" ? localStorage.getItem("role") : null);
    if (!rid) return [];
    const res = await getRoleById(rid);
    if (res?.error || !res?.data) return [];
    if (type === "settings") {
      const rolesSettings = res.data.menus.filter((menu: any) => menu.menu.name == "Settings")[0].submenu;
      return filterMenusByRole(allMenus, rolesSettings);
    }
    return filterMenuByPermissions(allMenus || [], res.data || {});
  } catch (err) {
    console.error("fetchFilteredMenu error", err);
    return [];
  }
}

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [filteredMenu, setFilteredMenu] = useState<LinkDataType[] | null>(null);
  const [settingsMenu, setSettingsMenu] = useState<LinkDataType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRoleId = useRef<string | null>(null);
  const inFlight = useRef<Promise<LinkDataType[]> | null>(null);

  const refreshPermissions = useCallback(
    async (allMenus: LinkDataType[] | null, type: string, options?: { roleId?: string; force?: boolean }) => {
      const roleId = options?.roleId ?? (typeof window !== "undefined" ? localStorage.getItem("role") : null);
      if (!roleId) return [] as LinkDataType[];

      // If not forced and we already have menus for this role, return cached
      if (!options?.force && lastRoleId.current === roleId && filteredMenu) {
        return filteredMenu;
      }

      // If a fetch is already in-flight for the same role, return that promise
      if (inFlight.current) {
        return inFlight.current;
      }

      setLoading(true);
      setError(null);

      const promise = (async () => {
        try {
          const fm = await fetchFilteredMenu(allMenus, type, roleId);
          if (type === "settings") setSettingsMenu(fm);
          if (type === "nav") setFilteredMenu(fm);
          lastRoleId.current = roleId;
          return fm;
        } catch (err: any) {
          setError(err?.message || "Failed to load permissions");
          setFilteredMenu([]);
          return [] as LinkDataType[];
        } finally {
          setLoading(false);
          inFlight.current = null;
        }
      })();

      inFlight.current = promise;
      return promise;
    },
    [filteredMenu]
  );

  return (
    <PermissionContext.Provider value={{ filteredMenu, settingsMenu, loading, error, refreshPermissions, allowedPaths: allowedDashboardPaths }}>
      {children}
    </PermissionContext.Provider>
  );
};

export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermission must be used within PermissionProvider");
  return ctx;
}

export default PermissionContext;
