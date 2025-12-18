"use client";

import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { auditTrailList } from "@/app/services/settingsAPI";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Drawer from "@mui/material/Drawer";
import AuditTrailDetailDrawer from "./AuditTrailDetailDrawer";

// ---------------- TYPE ----------------
interface AuditTrailItem {
    id: number;
    uuid: string;
    created_at: string;
    ip_address: string;
    user_agent: string;
    browser: string;
    os: string;
    user: { name: string };
    role: { name: string };
    menu: { name: string };
    sub_menu: { name: string };
    action: string;
    [key: string]: any;
}

// ---------------- TABLE RENDER ----------------
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
    { key: "role_name", label: "Role", render: (data: TableDataType) => renderCombinedField(data, "role_name") },
    { key: "menu_id", label: "Menu", render: (data: TableDataType) => renderCombinedField(data, "menu_id") },
    { key: "sub_menu_id", label: "Sub Menu", render: (data: TableDataType) => renderCombinedField(data, "sub_menu_id") },
    { key: "mode", label: "Activity Mode", render: (data: TableDataType) => renderCombinedField(data, "mode") },
];

// ---------------- COMPONENT ----------------
export default function CustomerInvoicePage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const router = useRouter();

    const {
        roleOptions,
        userOptions,
        menuOptions,
        submenuOptions,
        ensureRolesLoaded,
        ensureUserLoaded,
        ensureMenuListLoaded,
        ensureSubmenuLoaded
    } = useAllDropdownListData();

    // Load dropdowns on mount
    useEffect(() => {
        ensureRolesLoaded();
        ensureUserLoaded();
        ensureMenuListLoaded();
        ensureSubmenuLoaded();
    }, []);

    // 🔥 COMMON API LOADER
    const loadData = async (
        params: Record<string, any> = {},
        pageSize: number = 10
    ): Promise<listReturnType> => {
        try {
            setLoading(true);
            const result = await auditTrailList({
                per_page: pageSize.toString(),
                ...params,
            });

            return {
                data: Array.isArray(result.data) ? result.data : [],
                total: result?.pagination?.last_page || 1,
                totalRecords: result?.pagination?.total || 0,
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
            };
        } catch (error) {
            showSnackbar("Failed to fetch data", "error");
            return {
                data: [],
                total: 1,
                currentPage: 1,
                pageSize,
                totalRecords: 0
            };
        } finally {
            setLoading(false);
        }
    };

    // 🔥 SIMPLE LISTING
    const fetchList = useCallback(
        (page: number, pageSize: number) => loadData({ page }, pageSize),
        []
    );

    // 🔥 FILTER LISTING
    const filterBy = useCallback(
        (payload: Record<string, string | number | null>, pageSize: number) => {
            const params: Record<string, string> = {};

            // Extract page from payload if present
            if (payload.page) {
                params.page = String(payload.page);
            }

            // Add filters
            Object.keys(payload || {}).forEach((k) => {
                if (k === "page") return; // Skip page as it's already handled

                const v = payload[k];
                if (v !== null && v !== "" && v !== undefined) {
                    params[k] = String(v);
                }
            });

            return loadData(params, pageSize);
        },
        []
    );

    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { filterBy, list: fetchList },
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
                                isSingle: false,
                                multiSelectChips: true,
                                options: roleOptions || [],
                            },
                            {
                                key: "user_id",
                                label: "User",
                                isSingle: false,
                                multiSelectChips: true,
                                options: userOptions || [],
                            },
                            {
                                key: "menu_id",
                                label: "Menu",
                                isSingle: false,
                                multiSelectChips: true,
                                options: menuOptions || [],
                            },
                            {
                                key: "sub_menu_id",
                                label: "Sub Menu",
                                isSingle: false,
                                multiSelectChips: true,
                                options: submenuOptions || [],
                            },
                        ],
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    floatingInfoBar: {
                        showByDefault: true,
                        showSelectedRow: true,
                    },
                    localStorageKey: "audit-trail-table",
                    rowActions: [
                        {
                            icon: "mdi:eye",
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
