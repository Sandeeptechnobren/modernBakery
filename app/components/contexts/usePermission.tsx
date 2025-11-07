"use client";

import { useCallback } from "react";
import { usePermission as usePermCtx } from "./permissionContext";
import { initialLinkData } from "../../(private)/data/dashboardLinks";
import { initialLinkData as settingInitialLinkData } from "../../(private)/data/settingLinks";

// Lightweight custom hook that exposes permission context and a preload helper
export function usePermissionManager() {
  const ctx = usePermCtx();
  const menus = Array.isArray(initialLinkData) && initialLinkData[0] ? initialLinkData[0].data : null;
  const settings = Array.isArray(settingInitialLinkData) && settingInitialLinkData[0] ? settingInitialLinkData[0].data : null;
  
  const preload = useCallback(async () => {
    try {
      if (ctx && ctx.refreshPermissions) {
        await ctx.refreshPermissions(menus as any,"nav");
        await ctx.refreshPermissions(settings as any,"settings");
      }
    } catch (e) {
      console.error("usePermissionManager.preload failed", e);
    }
  }, [ctx]);

  return {
    ...ctx,
    preload,
    // convenience wrapper to call refreshPermissions with options
    refresh: async (options?: { roleId?: string; force?: boolean }) => {
      try {
        await ctx.refreshPermissions(menus as any,"nav", options);
        await ctx.refreshPermissions(settings as any,"settings", options);
      } catch (e) {
        console.error("usePermissionManager.refresh failed", e);
      }
    },
  };
}

export default usePermissionManager;
