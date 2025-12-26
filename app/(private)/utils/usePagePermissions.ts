"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getSubmenuBasedPermissions } from "@/app/services/allApi";
import { usePermissionManager } from "@/app/components/contexts/usePermission";
import { LinkDataType } from "@/app/(private)/data/dashboardLinks";

/**
 * Custom hook to handle page-level permissions.
 * Centralizes the logic for finding menu IDs and fetching permissions.
 * @param path - Optional path to check permissions for. Defaults to current pathname.
 */
export const usePagePermissions = (path?: string) => {
  const pathname = usePathname();
  const targetPath = path || pathname;
  const { filteredMenu } = usePermissionManager();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const findMenuId = useCallback((menus: LinkDataType[], target: string): number | string | undefined => {
    // First pass: exact match
    for (const menu of menus) {
      if (menu.href === target) return menu.id;
      if (menu.children) {
        const id = findMenuId(menu.children, target);
        if (id) return id;
      }
    }
    // Second pass: prefix match for sub-routes (e.g., /item/add matching /item)
    // for (const menu of menus) {
    //   if (menu.href && menu.href !== "#" && menu.href !== "/" && target.startsWith(menu.href + "/")) {
    //     return menu.id;
    //   }
    //   if (menu.children) {
    //     const id = findMenuId(menu.children, target);
    //     if (id) return id;
    //   }
    // }
    return undefined;
  }, []);

  const findMenuPermission = useCallback((menus: LinkDataType[], target: string): any[] | undefined => {
    // First pass: exact match
    for (const menu of menus) {
      if (menu.href === target) return menu.permissions;
      if (menu.children) {
        const permissions = findMenuPermission(menu.children, target);
        if (permissions) return permissions;
      }
    }

    // Second pass: prefix match for sub-routes (e.g., /item/add matching /item)
    for (const menu of menus) {
      if (menu.href && menu.href !== "#" && menu.href !== "/" && target.startsWith(menu.href + "/")) {
        return menu.permissions;
      }
      if (menu.children) {
        const permissions = findMenuPermission(menu.children, target);
        if (permissions) return permissions;
      }
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!filteredMenu) return;
    const menuPermissions = findMenuPermission(filteredMenu as LinkDataType[], targetPath);
    if (menuPermissions && menuPermissions.length) {
      const perms = menuPermissions.map((p: any) => p.permission_name.toLowerCase());
      setPermissions(perms);
    } else {
      setPermissions([]);
    }
    setLoading(false);
  }, [filteredMenu, targetPath, findMenuPermission]);

  /**
   * Helper function to check if a user has a specific permission.
   * e.g., can('create'), can('edit'), can('export')
   */
  const can = (action: string) => permissions.includes(action.toLowerCase());

  return {
    permissions,
    can,
    loading,
    // Add specific common checks for convenience
    canCreate: can('create'),
    canEdit: can('edit'),
    canDelete: can('delete'),
    canView: can('view') || can('list'),
    canExport: can('export')
  };
};