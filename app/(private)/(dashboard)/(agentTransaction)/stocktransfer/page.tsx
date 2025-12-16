"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    configType,
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { StockTransferList } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function StockTransferPage() {
    const router = useRouter();
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();

    const {
        regionOptions,
        warehouseOptions,
        routeOptions,
        channelOptions,
        itemCategoryOptions,
        customerSubCategoryOptions,
    } = useAllDropdownListData();

    const [refreshKey, setRefreshKey] = useState(0);

    /* -------------------------------------------------------
       FETCH LIST (TABLE API)
    ------------------------------------------------------- */
    const fetchStockTransferList = useCallback(
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

                const res = await StockTransferList(params);

                return {
                    data: Array.isArray(res?.data) ? res.data : [],
                    total: res?.meta?.last_page || 1,
                    totalRecords: res?.meta?.total || 0,
                    currentPage: res?.meta?.current_page || 1,
                    pageSize: res?.meta?.per_page || pageSize,
                };
            } catch (error) {
                showSnackbar("Failed to load stock transfer list", "error");
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

            const res = await StockTransferList(params);

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
            key: "transfer_date",
            label: "Transfer Date",
        },
        {
            key: "source_warehouse",
            label: "Source Warehouse",
            render: (row: TableDataType) =>
                row.source_warehouse
                    ? `${row.source_warehouse.code} - ${row.source_warehouse.name}`
                    : "-",
        },
        {
            key: "destiny_warehouse",
            label: "Destination Warehouse",
            render: (row: TableDataType) =>
                row.destiny_warehouse
                    ? `${row.destiny_warehouse.code} - ${row.destiny_warehouse.name}`
                    : "-",
        },
        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={row.status === 1} />
            ),
        },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h1 className="text-lg font-semibold">Stock Transfer</h1>
            </div>

            <Table
                refreshKey={refreshKey}
                config={{
                    api: {
                        list: fetchStockTransferList,
                        filterBy,
                    },
                    header: {
                        searchBar: false,
                        columnFilter: true,
                        filterByFields: [
                            { key: "start_date", label: "From Date", type: "date" },
                            { key: "end_date", label: "To Date", type: "date" },
                            {
                                key: "source_warehouse",
                                label: "Source Warehouse",
                                isSingle: false,
                                multiSelectChips: true,
                                options: warehouseOptions || [],
                            },
                            {
                                key: "destiny_warehouse",
                                label: "Destination Warehouse",
                                isSingle: false,
                                multiSelectChips: true,
                                options: warehouseOptions || [],
                            },
                            {
                                key: "region_id",
                                label: "Region",
                                isSingle: false,
                                multiSelectChips: true,
                                options: regionOptions || [],
                            },
                        ],
                        actions: [
                            <SidebarBtn
                                key="add"
                                href="/stocktransfer/add"
                                isActive
                                leadingIcon="lucide:plus"
                                label="Add"
                                labelTw="hidden sm:block"
                            />,
                        ],
                    },
                    localStorageKey: "stock-transfer-table",
                    footer: { pagination: true, nextPrevBtn: true },
                    columns,
                    rowSelection: true,
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row) => {
                                if (row.uuid) {
                                    router.push(`/stocktransfer/details/${row.uuid}`);
                                }
                            },
                        },
                    ],
                    pageSize: 50,
                }}
            />
        </div>
    );
}
