"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    configType,
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { StockTransferList, salesTeamRecontionOrdersList } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
// import 

export default function SalesTeamReconciliationPage() {
    const { can, permissions } = usePagePermissions();
    const router = useRouter();
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();

    const {
        warehouseOptions,
    } = useAllDropdownListData();

    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    /* -------------------------------------------------------
       FETCH LIST (TABLE API)
    ------------------------------------------------------- */
    const fetchList = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            try {
                setLoading(true);

                const params = {
                    page: String(page),
                    per_page: String(pageSize),
                };

                const res = await salesTeamRecontionOrdersList(params);

                return {
                    data: Array.isArray(res?.data) ? res.data : [],
                    total: res?.meta?.last_page || 1,
                    totalRecords: res?.meta?.total || 0,
                    currentPage: res?.meta?.current_page || 1,
                    pageSize: res?.meta?.per_page || pageSize,
                };
            } catch (error) {
                showSnackbar("Failed to load list", "error");
                return {
                    data: [],
                    total: 0,
                    totalRecords: 0,
                    currentPage: 1,
                    pageSize,
                };
            } finally {
                setLoading(false);
            }
        },
        [setLoading, showSnackbar]
    );

    /* -------------------------------------------------------
       FILTER API
    ------------------------------------------------------- */
    const filterBy = useCallback(
        async (
            payload: Record<string, any>,
            pageSize: number
        ): Promise<listReturnType> => {
            const params: Record<string, string> = {
                page: String(payload.page ?? 1),
                per_page: String(pageSize),
            };

            Object.keys(payload || {}).forEach((key) => {
                if (key === "page") return;
                const value = payload[key];
                if (!value) return;

                if (Array.isArray(value)) {
                    params[key] = value.join(",");
                } else {
                    params[key] = String(value);
                }
            });

            const res = await salesTeamRecontionOrdersList(params);

            return {
                data: res?.data || [],
                total: res?.meta?.last_page || 1,
                totalRecords: res?.meta?.total || 0,
                currentPage: res?.meta?.current_page || 1,
                pageSize: res?.meta?.per_page || pageSize,
            };
        },
        []
    );

    /* -------------------------------------------------------
       TABLE COLUMNS
    ------------------------------------------------------- */
    const columns: configType["columns"] = [
        {
            key: "reconsile_date",
            label: "Date",
            render: (row: any) => {
                const date = row.reconsile_date ? new Date(row.reconsile_date) : null;
                return date ? date.toLocaleDateString() : "-";
            }
        },
        {
            key: "warehouse_name",
            label: "Warehouse",
            render: (row: any) =>
                row.warehouse_code && row.warehouse_name
                    ? `${row.warehouse_code} - ${row.warehouse_name}`
                    : row.warehouse_name || "-",
        },
        {
            key: "salesman_name",
            label: "Salesman",
            render: (row: any) =>
                row.salesman_code && row.salesman_name
                    ? `${row.salesman_code} - ${row.salesman_name}`
                    : row.salesman_name || "-",
        },
        {
            key: "cash_amount",
            label: "Cash Amount",
            render: (row: any) => row.cash_amount || "0",
        },
        {
            key: "credit_amount",
            label: "Credit Amount",
            render: (row: any) => row.credit_amount || "0",
        },
        {
            key: "grand_total_amount",
            label: "Total Amount",
            render: (row: any) => row.grand_total_amount || "0",
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h1 className="text-lg font-semibold">Sales Team Reconciliation</h1>
            </div>

            <Table
                refreshKey={refreshKey}
                config={{
                    api: {
                        list: fetchList,
                        filterBy,
                    },
                    header: {
                        searchBar: false,
                        columnFilter: true,
                        filterByFields: [
                            { key: "start_date", label: "From Date", type: "date" },
                            { key: "end_date", label: "To Date", type: "date" },
                            {
                                key: "warehouse_id",
                                label: "Warehouse",
                                isSingle: false,
                                multiSelectChips: true,
                                options: warehouseOptions || [],
                            },
                        ],
                        actions: can("create") ? [
                            <SidebarBtn
                                key="add"
                                href="/salesTeamReconcile/add"
                                isActive
                                leadingIcon="lucide:plus"
                                label="Add"
                                labelTw="hidden sm:block"
                            />,
                        ] : [],
                    },
                    localStorageKey: "sales-team-reconciliation-table",
                    footer: { pagination: true, nextPrevBtn: true },
                    columns,
                    rowSelection: true,
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row) => {
                                if (row.uuid) {
                                    router.push(`/salesTeamRecosite/details/${row.uuid}`);
                                }
                            },
                        },
                    ],
                    // rowActions: [], 
                    pageSize: 50,
                }}
            />
        </div>
    );
}
