"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, { TableDataType } from "@/app/components/customTable";
import Toggle from "@/app/components/toggle";
import { Icon } from "@iconify-icon/react";
import { JSX, useEffect, useMemo, useState } from "react";

type Permission = { permission_id: number; permission_name: string };
type Submenu = { id?: number | null; name?: string | null; path?: string | null; permissions?: Permission[] };
type Menu = { id?: number | null; name?: string | null; path?: string | null; submenu?: Submenu[] };
type MenuWrapper = { menu?: Menu | null };
type RoleRow = { id: number | string; name?: string | null; guard_name?: string | null; menus?: MenuWrapper[] };

const DEFAULT_PERMS = ["view", "create", "edit", "delete"];

const SAMPLE_DATA: RoleRow[] = [
    {
        id: 100,
        name: "Organization",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 10,
                    name: "Organization",
                    path: "/organization",
                    submenu: [
                        {
                            id: 101,
                            name: "Manage Organizations",
                            path: "/organization/manage",
                            permissions: [
                                { permission_id: 1, permission_name: "create" },
                                { permission_id: 4, permission_name: "view" },
                                { permission_id: 2, permission_name: "edit" },
                                { permission_id: 3, permission_name: "delete" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 110,
        name: "Customer",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 11,
                    name: "Customer",
                    path: "/customer",
                    submenu: [
                        {
                            id: 111,
                            name: "Customer List",
                            path: "/customer/list",
                            permissions: [
                                { permission_id: 4, permission_name: "view" },
                                { permission_id: 1, permission_name: "create" },
                                { permission_id: 2, permission_name: "edit" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 120,
        name: "Salesman",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 12,
                    name: "Salesman",
                    path: "/salesman",
                    submenu: [
                        {
                            id: 121,
                            name: "Salesman Directory",
                            path: "/salesman/directory",
                            permissions: [
                                { permission_id: 4, permission_name: "view" },
                                { permission_id: 2, permission_name: "edit" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 130,
        name: "Merchandiser",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 13,
                    name: "Merchandiser",
                    path: "/merchandiser",
                    submenu: [
                        {
                            id: 131,
                            name: "Manage Merchandisers",
                            path: "/merchandiser/manage",
                            permissions: [
                                { permission_id: 1, permission_name: "create" },
                                { permission_id: 4, permission_name: "view" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 140,
        name: "Journey Plan",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 14,
                    name: "Journey Plan",
                    path: "/journey-plan",
                    submenu: [
                        {
                            id: 141,
                            name: "Plans",
                            path: "/journey-plan/plans",
                            permissions: [
                                { permission_id: 4, permission_name: "view" },
                                { permission_id: 2, permission_name: "edit" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 150,
        name: "Promotion",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 15,
                    name: "Promotion",
                    path: "/promotion",
                    submenu: [
                        {
                            id: 151,
                            name: "Campaigns",
                            path: "/promotion/campaigns",
                            permissions: [
                                { permission_id: 1, permission_name: "create" },
                                { permission_id: 4, permission_name: "view" },
                                { permission_id: 3, permission_name: "delete" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 160,
        name: "Assets",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 6,
                    name: "Assets",
                    path: "/assets",
                    submenu: [
                        {
                            id: 601,
                            name: "Manage Assets",
                            path: "/assets/manage",
                            permissions: [
                                { permission_id: 2, permission_name: "edit" },
                                { permission_id: 4, permission_name: "view" },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: 170,
        name: "Dashboard",
        guard_name: "api",
        menus: [
            {
                menu: {
                    id: 1,
                    name: "Dashboard",
                    path: "/dashboard",
                    submenu: [
                        {
                            id: 171,
                            name: "Overview",
                            path: "/dashboard/overview",
                            permissions: [{ permission_id: 4, permission_name: "view" }],
                        },
                    ],
                },
            },
        ],
    },
];

function deepClone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
}

export default function RolesPermissionTable({
    data: initialData = SAMPLE_DATA,
    onRowsChange,
}: {
    data?: RoleRow[];
    // only emit changes to parent, do NOT call Formik here
    onRowsChange?: (rows: RoleRow[], permissionIds: number[]) => void;
} = {}): JSX.Element {
    const { permissions } = useAllDropdownListData();

    const [rows, setRows] = useState<RoleRow[]>(Array.isArray(initialData) ? deepClone(initialData) : []);
    const [refreshKey, setRefreshKey] = useState<number>(0);

    useEffect(() => {
        if (Array.isArray(initialData)) setRows(deepClone(initialData));
    }, [initialData]);

    const permExistsIn = (perms: Permission[] | undefined, key: string) => {
        if (!Array.isArray(perms)) return false;
        const k = key.toLowerCase();
        return perms.some((p) => {
            const pn = String(p.permission_name || "").toLowerCase();
            if (k === "view") return pn.includes("view") || pn.includes("list");
            return pn.includes(k);
        });
    };

    const rowHas = (row: RoleRow, key: string) => {
        if (!Array.isArray(row?.menus)) return false;
        for (const mw of row.menus) {
            const m = mw?.menu;
            if (!m || !Array.isArray(m.submenu)) continue;
            for (const s of m.submenu) {
                if (permExistsIn(s.permissions, key)) return true;
            }
        }
        return false;
    };

    const extractPermissionIds = (rs: RoleRow[]) => {
        const set = new Set<number>();
        for (const r of rs) {
            if (!Array.isArray(r.menus)) continue;
            for (const mw of r.menus) {
                const m = mw?.menu;
                if (!m || !Array.isArray(m.submenu)) continue;
                for (const s of m.submenu) {
                    const perms = s?.permissions ?? [];
                    for (const p of perms) if (typeof p.permission_id === "number") set.add(p.permission_id);
                }
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

    const updateRowPermissionsNested = (row: RoleRow, key: string, shouldAdd: boolean) => {
        if (!Array.isArray(row.menus)) return row;
        const newMenus = row.menus.map((mw) => {
            if (!mw || !mw.menu) return mw;
            const menu = deepClone(mw.menu);
            if (!Array.isArray(menu.submenu)) return { ...mw, menu };
            menu.submenu = menu.submenu.map((s) => {
                const perms = Array.isArray(s.permissions) ? deepClone(s.permissions) : [];
                if (shouldAdd) {
                    const exists = permExistsIn(perms, key);
                    if (!exists) {
                        const id = permissionIdForName(key) ?? Date.now();
                        perms.push({ permission_id: id, permission_name: key });
                    }
                    return { ...s, permissions: perms };
                } else {
                    const filtered = perms.filter((p) => {
                        const pn = String(p.permission_name || "").toLowerCase();
                        if (key === "view") return !(pn.includes("view") || pn.includes("list"));
                        return !pn.includes(key.toLowerCase());
                    });
                    return { ...s, permissions: filtered };
                }
            });
            return { ...mw, menu };
        });
        return { ...row, menus: newMenus };
    };

    // Toggle handler
    const handleToggle = (rowId: number | string, field: "all" | "view" | "create" | "edit" | "delete") => {
        setRows((prev) => {
            const newRows = deepClone(prev).map((r) => {
                if (String(r.id) !== String(rowId)) return r;
                if (field === "all") {
                    const allCurrently = ["view", "create", "edit", "delete"].every((p) => rowHas(r, p));
                    let updated = r;
                    for (const p of ["view", "create", "edit", "delete"]) updated = updateRowPermissionsNested(updated, p, !allCurrently);
                    return updated;
                } else {
                    const willAdd = !rowHas(r, field);
                    return updateRowPermissionsNested(r, field, willAdd);
                }
            });
            setRefreshKey((k) => k + 1);
            return newRows;
        });
    };

    // notify parent AFTER render and asynchronously to avoid setState during render
    useEffect(() => {
        const ids = extractPermissionIds(rows);
        if (typeof onRowsChange === "function") {
            setTimeout(() => {
                try {
                    onRowsChange(deepClone(rows), ids);
                } catch (e) {
                    // swallow
                }
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    // build permission columns (stable references returned from useMemo)
    const permissionColumns = useMemo(() => {
        if (!permissions || !Array.isArray(permissions)) return [];
        return permissions.map((p: any) => ({
            key: p.name ?? "",
            label: p.name ?? "",
            render: (row: TableDataType) => {
                const r = row as unknown as RoleRow;
                const checked = rowHas(r, p.name);
                return <Toggle isChecked={checked} onChange={() => handleToggle(r.id as number | string, p.name as any)} />;
            },
        }));
        // dependencies: permissions and rows (rowHas uses rows indirectly via closure but it's fine)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissions, rows]);

    // memoize full table config to avoid customTable rerender loops
    const tableConfig = useMemo(() => {
        return {
            columns: [
                { key: "name", label: "Master", width: 200, sticky: "left" },
                {
                    key: "search",
                    label: <Icon icon="lucide:search" />,
                    sticky: "center",
                    render: (row: TableDataType) => {
                        const r = row as unknown as RoleRow;
                        const allChecked = DEFAULT_PERMS.every((p) => rowHas(r, p));
                        return <Toggle isChecked={allChecked} onChange={() => handleToggle(r.id as number | string, "all")} />;
                    },
                },
                 ...permissionColumns,
             ],
         };
     }, [permissionColumns]);
 
    return (
        <Table
            refreshKey={refreshKey}
            data={rows as unknown as TableDataType[]}
            config={tableConfig as any}
        />
    );
}