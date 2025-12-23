"use client";

import Table, {
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";

import { auditTrailList } from "@/app/services/settingsAPI";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useEffect, useState, useCallback } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Drawer from "@mui/material/Drawer";
import AuditTrailDetailDrawer from "./AuditTrailDetailDrawer";

// ---------------- TABLE HELPERS ----------------
const renderNestedField = (data: TableDataType, field: string, subField: string) => {
    if (
        data[field] &&
        typeof data[field] === "object" &&
        data[field] !== null &&
        subField in (data[field] as object)
    ) {
        return (data[field] as Record<string, string>)[subField] || "-";
    }
    return "-";
};

const renderCombinedField = (data: TableDataType, field: string) => {
    if (typeof data[field] === "string" || typeof data[field] === "number") {
        return data[field];
    }
    const name = renderNestedField(data, field, "name");
    return name !== "-" ? name : "-";
};

// ---------------- COLUMNS ----------------
const columns = [
    { key: "created_at", label: "Date", render: (data: TableDataType) => renderCombinedField(data, "created_at") },
    { key: "ip_address", label: "Client IP", render: (data: TableDataType) => renderCombinedField(data, "ip_address") },
    { key: "os", label: "OS", render: (data: TableDataType) => renderCombinedField(data, "os") },
    { key: "browser", label: "Browser", render: (data: TableDataType) => renderCombinedField(data, "browser") },
    { key: "user_name", label: "User", render: (data: TableDataType) => renderCombinedField(data, "user_name") },
    { key: "user_role", label: "Role", render: (data: TableDataType) => renderCombinedField(data, "user_role") },
    { key: "menu_id", label: "Menu", render: (data: TableDataType) => renderCombinedField(data, "menu_id") },
    { key: "sub_menu_id", label: "Sub Menu", render: (data: TableDataType) => renderCombinedField(data, "sub_menu_id") },
    { key: "mode", label: "Activity Mode", render: (data: TableDataType) => renderCombinedField(data, "mode") },
];

// ---------------- COMPONENT ----------------
export default function AuditTrailPage() {
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

    const {
        roleOptions,
        userOptions,
        menuOptions,
        submenuOptions,
        roles,
        menuList,
        userList, // Destructure raw lists
        ensureRolesLoaded,
        ensureUserLoaded,
        ensureMenuListLoaded,
        ensureSubmenuLoaded,
    } = useAllDropdownListData();

    // Load dropdowns
    useEffect(() => {
        ensureRolesLoaded();
        ensureUserLoaded();
        ensureMenuListLoaded();
        ensureSubmenuLoaded();
    }, []);

    // 🔥 API LOADER
    const loadData = async (params: Record<string, any> = {}, pageSize = 10): Promise<listReturnType> => {
        try {
            setLoading(true);

            const response = await auditTrailList({
                per_page: pageSize.toString(),
                ...params,
            });

            return {
                data: response.data || [],
                total: response?.pagination?.last_page || 1,
                totalRecords: response?.pagination?.total || 0,
                currentPage: response?.pagination?.current_page || 1,
                pageSize: response?.pagination?.per_page || pageSize,
            };
        } catch (error) {
            showSnackbar("Failed to load audit trail", "error");
            return {
                data: [],
                total: 1,
                currentPage: 1,
                pageSize,
                totalRecords: 0,
            };
        } finally {
            setLoading(false);
        }
    };

    const fetchList = useCallback(
        async (page?: number, pageSize?: number) => {
            return loadData({ page: page?.toString() }, pageSize);
        },
        [loadData]
    );

    // ✔ FILTER LIST
    const filterBy = useCallback(
        (payload: Record<string, any>, pageSize: number) => {
            const params: Record<string, any> = {};

            // page number
            if (payload.page) params.page = String(payload.page);

            // Helper to map single value
            const mapValue = (key: string, val: string | number): string | number => {
                const strVal = String(val);
                if (key === "role_id") {
                    const found = roles.find((r) => String(r.id) === strVal);
                    return found ? found.name : strVal;
                }
                if (key === "menu_id") {
                    const found = menuList.find((m) => String(m.id) === strVal);
                    return found ? (found.osa_code || found.name || strVal) : strVal;
                }
                if (key === "sub_menu_id") {
                    const found = submenuOptions.find((o) => String(o.value) === strVal);
                    // Match API expectation (e.g., agent_customer)
                    return found ? found.label.toLowerCase().replace(/\s+/g, '_') : strVal;
                }
                if (key === "user_id") {
                    const found = userList.find((u) => String(u.id) === strVal);
                    return found ? found.name : strVal;
                }
                return val;
            };

            Object.keys(payload || {}).forEach((key) => {
                if (key === "page") return;

                const value = payload[key];
                if (value === null || value === "" || value === undefined) return;

                let targetKey = key;
                if (key === "role_id") targetKey = "user_role";
                if (key === "user_id") targetKey = "user_name";

                params[targetKey] = mapValue(key, value);
            });

            return loadData(params, pageSize);
        },
        [roles, menuList, submenuOptions, userList, loadData]
    );

    return (
        <div className="flex flex-col h-full">
            <Table
                config={{
                    api: { list: fetchList, filterBy },
                    header: {
                        title: "Audit Trail",
                        columnFilter: true,
                        searchBar: false,
                        filterByFields: [
                            { key: "from_date", label: "From Date", type: "date" },
                            { key: "to_date", label: "To Date", type: "date" },
                            {
                                key: "role_id",
                                label: "Role",
                                type: "select",
                                isSingle: true,
                                multiSelectChips: true,
                                options: roleOptions || [],
                            },
                            {
                                key: "user_id",
                                label: "User",
                                type: "select",
                                isSingle: true,
                                multiSelectChips: true,
                                options: userOptions || [],
                            },
                            {
                                key: "menu_id",
                                label: "Menu",
                                type: "select",
                                isSingle: true,
                                multiSelectChips: true,
                                options: menuOptions || [],
                            },
                            {
                                key: "sub_menu_id",
                                label: "Sub Menu",
                                type: "select",
                                isSingle: true,
                                multiSelectChips: true,
                                options: submenuOptions || [],
                            },
                        ],
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: any) => {
                                setSelectedUuid(row.id);
                                setDrawerOpen(true);
                            },
                        },
                    ],
                    pageSize: 10,
                }}
            />

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: "40.333%",
                        minWidth: "400px",
                        maxWidth: "600px",
                    },
                }}
            >
                {selectedUuid && (
                    <AuditTrailDetailDrawer
                        uuid={selectedUuid}
                        onClose={() => setDrawerOpen(false)}
                    />
                )}
            </Drawer>
        </div>
    );
}
