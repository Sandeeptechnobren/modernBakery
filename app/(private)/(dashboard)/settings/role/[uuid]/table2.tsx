"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, { TableDataType } from "@/app/components/customTable";
import Toggle from "@/app/components/toggle";
import { Icon } from "@iconify-icon/react";
import { JSX, useEffect, useMemo, useRef, useState } from "react";

type Permission = { permission_id: number; permission_name: string; [k: string]: any };
type Submenu = { id?: number | null; uuid?: string | null; osa_code?: string | null; name?: string | null; path?: string | null; permissions?: Permission[]; [k: string]: any };
export type MenuItem = { id?: number | null; uuid?: string | null; osa_code?: string | null; name?: string | null; path?: string | null; submenu?: Submenu[]; sub_menus?: Submenu[]; menus?: any; menu?: any; [k: string]: any };

const DEFAULT_PERMS = ["view", "create", "edit", "delete"];

function deepClone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
}

export default function RolesPermissionTable({
    menus: initialMenus = [],
    roleMenus = [], // optional role-specific menus (with submenu.permissions)
    activeIndex = 0,
    onMenusChange,
}: {
    menus?: MenuItem[]; // master / base menus (submenus without permissions)
    roleMenus?: any[];   // incoming role data menus (may include submenu.permissions)
    activeIndex?: number;
    onMenusChange?: (menus: MenuItem[], permissionIds: number[]) => void;
}): JSX.Element {
    const { permissions } = useAllDropdownListData();

    const [menus, setMenus] = useState<MenuItem[]>(Array.isArray(initialMenus) ? deepClone(initialMenus) : []);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const lastSentRef = useRef<string | null>(null);

    // Normalize shape: ensure each item has submenu[] and do not share references.
    const normalizeMenus = (arr: any[] = []): MenuItem[] =>
        (arr || []).map((m) => {
            const subs =
                (Array.isArray(m.submenu) && m.submenu) ||
                (m.menu && Array.isArray(m.menu.submenu) && m.menu.submenu) ||
                (Array.isArray(m.sub_menus) && m.sub_menus) ||
                (Array.isArray(m.menus?.[0]?.menu?.submenu) && m.menus[0].menu.submenu) ||
                [];
            return { ...m, submenu: deepClone(subs) };
        });

    // Build quick map from roleMenus for applying permissions by menu_id -> submenu_id
    const buildRoleMap = (rmenus: any[] = []) => {
        const map = new Map<string, Map<string, Permission[]>>();
        (rmenus || []).forEach((rm) => {
            const menuId = String(rm.id ?? rm.menu?.id ?? rm.menu_id ?? rm.menuId ?? "");
            if (!menuId) return;
            const subArr = Array.isArray(rm.submenu) ? rm.submenu : (Array.isArray(rm.menu?.submenu) ? rm.menu.submenu : []);
            const subMap = new Map<string, Permission[]>();
            (subArr || []).forEach((s: any) => {
                const sid = String(s.id ?? s.submenu_id ?? s.uuid ?? "");
                if (sid) subMap.set(sid, Array.isArray(s.permissions) ? deepClone(s.permissions) : []);
            });
            map.set(menuId, subMap);
        });
        return map;
    };

    useEffect(() => {
        const base = normalizeMenus(Array.isArray(initialMenus) ? initialMenus : []);
        const roleMap = buildRoleMap(Array.isArray(roleMenus) ? roleMenus : []);

        // apply permissions from roleMap to base submenus (match by id)
        const merged = base.map((m) => {
            const menuId = String(m.id ?? m.menu?.id ?? m.osa_code ?? m.uuid ?? "");
            const subMap = roleMap.get(menuId);
            const baseSubs = Array.isArray(m.submenu) ? deepClone(m.submenu) : [];
            // apply permissions to matching submenus; preserve base order; append incoming-only subs optionally
            const applied = baseSubs.map((s) => {
                const sid = String(s.id ?? s.uuid ?? s.osa_code ?? "");
                if (subMap && subMap.has(sid)) {
                    return { ...s, permissions: deepClone(subMap.get(sid) || []) };
                }
                return s;
            });
            // also include role-only submenus that are not present in base (append)
            if (subMap) {
                for (const [sid, perms] of subMap) {
                    const exists = applied.some((x) => String(x.id ?? x.uuid ?? x.osa_code ?? "") === sid);
                    if (!exists) {
                        applied.push({ id: isFinite(Number(sid)) ? Number(sid) : undefined, permissions: deepClone(perms) } as Submenu);
                    }
                }
            }
            return { ...m, submenu: applied };
        });

        setMenus(merged);
        // mark initial load as already sent so we don't immediately emit to parent
        lastSentRef.current = JSON.stringify(merged);
        setRefreshKey((k) => k + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialMenus, JSON.stringify(roleMenus)]);

    const permExistsIn = (perms: Permission[] | undefined, key: string) => {
        if (!Array.isArray(perms)) return false;
        const k = key.toLowerCase();
        return perms.some((p) => {
            const pn = String(p.permission_name || "").toLowerCase();
            if (k === "view") return pn.includes("view") || pn.includes("list");
            return pn.includes(k);
        });
    };

    const extractPermissionIds = (ms: MenuItem[]) => {
        const set = new Set<number>();
        for (const r of ms) {
            const subs = Array.isArray(r.submenu) ? r.submenu : [];
            for (const s of subs) {
                const perms = s?.permissions ?? [];
                for (const p of perms) if (typeof p.permission_id === "number") set.add(p.permission_id);
            }
        }
        return Array.from(set);
    };

    const permissionIdForName = (name: string | undefined) => {
        if (!permissions || !Array.isArray(permissions)) return undefined;
        const key = String(name || "").toLowerCase();
        const found = permissions.find((p: any) => {
            const n = String(p.name || "").toLowerCase();
            return n === key || n.includes(key);
        });
        return found?.id;
    };

    // Toggle a permission on a specific submenu of the active menu
    const handleToggle = (submenuId: number | string, field: "all" | string) => {
        setMenus((prev) => {
            const newMenus = deepClone(prev);
            const idx = Math.max(0, Math.min(activeIndex, newMenus.length - 1));
            const menu = newMenus[idx];
            if (!menu) return prev;

            const subs = Array.isArray(menu.submenu) ? menu.submenu : [];
            // derive perm list names
            const permList = Array.isArray(permissions)
                ? permissions.map((p: any) => String(p.name ?? "").toLowerCase()).filter(Boolean)
                : DEFAULT_PERMS;

            const newSubs = subs.map((s) => {
                if (String(s.id) !== String(submenuId)) return s;
                let perms = Array.isArray(s.permissions) ? deepClone(s.permissions) : [];
                if (field === "all") {
                    const allCurrently = permList.every((pname) => permExistsIn(perms, pname));
                    if (!allCurrently) {
                        for (const pname of permList) {
                            if (!permExistsIn(perms, pname)) {
                                const id = permissionIdForName(pname) ?? Date.now();
                                perms.push({ permission_id: id, permission_name: pname });
                            }
                        }
                    } else {
                        perms = perms.filter((p) => {
                            const pn = String(p.permission_name || "").toLowerCase();
                            return !permList.includes(pn);
                        });
                    }
                } else {
                    const willAdd = !permExistsIn(perms, field);
                    if (willAdd) {
                        const id = permissionIdForName(field) ?? Date.now();
                        perms.push({ permission_id: id, permission_name: field });
                    } else {
                        perms = perms.filter((p) => {
                            const pn = String(p.permission_name || "").toLowerCase();
                            if (field === "view") return !(pn.includes("view") || pn.includes("list"));
                            return !pn.includes(field.toLowerCase());
                        });
                    }
                }
                return { ...s, permissions: perms };
            });

            newMenus[idx] = { ...menu, submenu: newSubs };
            setRefreshKey((k) => k + 1);
            return newMenus;
        });
    };

    // notify parent AFTER render asynchronously, but only when menus actually changed
    useEffect(() => {
        const ids = extractPermissionIds(menus);
        const json = JSON.stringify(menus || []);
        if (lastSentRef.current === json) return; // already sent this exact shape
        lastSentRef.current = json;

        if (typeof onMenusChange === "function") {
            setTimeout(() => {
                try {
                    onMenusChange(deepClone(menus), ids);
                } catch (e) {
                    // swallow
                }
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menus]);

    // build permission columns
    const permissionColumns = useMemo(() => {
        if (!permissions || !Array.isArray(permissions)) return [];
        return permissions.map((p: any) => ({
            key: p.name ?? "",
            label: p.name ?? "",
            render: (row: TableDataType) => {
                const m = row as unknown as Submenu;
                const checked = permExistsIn(m.permissions, p.name);
                return <Toggle isChecked={checked} onChange={() => handleToggle(m.id as number | string, p.name as any)} />;
            },
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissions, menus]);

    // build table config for submenus of active menu
    const tableConfig = useMemo(() => {
        const active = menus && menus.length > 0 ? menus[Math.max(0, Math.min(activeIndex, menus.length - 1))] : undefined;
        const subrows = active ? (Array.isArray(active.submenu) ? active.submenu : []) : [];
        return {
            columns: [
                { key: "name", label: "Submenu", width: 200, sticky: "left", align: "left", render: (row: TableDataType) => (row as any).name || (row as any).title || "-" },
                {
                    key: "search",
                    label: <Icon icon="lucide:search" />,
                    align: "center",
                    render: (row: TableDataType) => {
                        const r = row as unknown as Submenu;
                        const permList = Array.isArray(permissions)
                            ? permissions.map((p: any) => String(p.name ?? "").toLowerCase()).filter(Boolean)
                            : DEFAULT_PERMS;
                        const allChecked = permList.every((pname) => permExistsIn(r.permissions, pname));
                        return <Toggle isChecked={allChecked} onChange={() => handleToggle(r.id as number | string, "all")} />;
                    },
                },
                ...permissionColumns,
            ],
            rows: subrows,
            showNestedLoading: false,
        };
    }, [permissionColumns, menus, activeIndex, refreshKey]);

    return (
        <Table
            refreshKey={refreshKey}
            data={(tableConfig.rows || []) as unknown as TableDataType[]}
            config={tableConfig as any}
        />
    );
}