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
    for (const menu of menus) {
      if (menu.href === target) return menu.id;
      if (menu.children) {
        const id = findMenuId(menu.children, target);
        if (id) return id;
      }
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!filteredMenu) return;

    const menuId = findMenuId(filteredMenu as LinkDataType[], targetPath);
    if (menuId) {
      setLoading(true);
      getSubmenuBasedPermissions(menuId).then((res: any) => {
        if (res?.status === "success" && Array.isArray(res?.data)) {
          const perms = res.data.map((p: any) => p.name.toLowerCase());
          setPermissions(perms);
        }
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [filteredMenu, targetPath, findMenuId]);

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
