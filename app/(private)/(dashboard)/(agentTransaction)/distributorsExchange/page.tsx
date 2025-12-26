"use client";

import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { exchangeList, exportExchangeData } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { downloadFile } from "@/app/services/allApi";
import FilterComponent from "@/app/components/filterComponent";
import ApprovalStatus from "@/app/components/approvalStatus";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

const dropdownDataList = [
    // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table Columns
const columns = [
    {
        key: "exchange_code",
        label: "Code",
        showByDefault: true,
    },
    {
        key: "warehouse_code, warehouse_name",
        label: "Distributors",
        showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.warehouse_code || "";
            const name = row.warehouse_name || "";

            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },

    {
        key: "customer_code, customer_name",
        label: "Customer",
        showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.customer_code || "";
            const name = row.customer_name || "";

            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    {
        key: "approval_status",
        label: "Approval Status",
        showByDefault: true,
        render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
    },
];

export default function CustomerInvoicePage() {
    const { can, permissions } = usePagePermissions();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    // Delivery-style filter/search logic
    const [exchangeDataCache, setExchangeDataCache] = useState<{ [key: string]: any }>({});
    const [exchangeCacheKey, setExchangeCacheKey] = useState(0);

    // Helper to build cache key from params
    const getCacheKey = (params: Record<string, string | number>) => {
        return Object.entries(params).sort().map(([k, v]) => `${k}:${v}`).join("|");
    };

    // Unified fetch function
    const fetchExchangeData = useCallback(async (params: Record<string, string | number>) => {
        const cacheKey = getCacheKey(params);
        if (exchangeDataCache[cacheKey]) {
            return exchangeDataCache[cacheKey];
        }
        setLoading(true);
        try {
            // Ensure all values are strings for exchangeList
            const stringParams: Record<string, string> = {};
            Object.entries(params).forEach(([k, v]) => {
                stringParams[k] = String(v);
            });
            const result = await exchangeList(stringParams);
            setExchangeDataCache((prev) => ({ ...prev, [cacheKey]: result }));
            return result;
        } catch (error) {
            showSnackbar("Failed to fetch exchange list", "error");
            return null;
        } finally {
            setLoading(false);
        }
    }, [exchangeDataCache, setLoading, showSnackbar]);

    // Fetch for table (list)
    const fetchExchange = useCallback(async (
        page: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        const params = { page: page.toString(), per_page: pageSize.toString() };
        const result = await fetchExchangeData(params);
        if (!result) {
            return {
                data: [],
                total: 1,
                currentPage: 1,
                pageSize: pageSize,
            };
        }
        return {
            data: Array.isArray(result.data) ? result.data : [],
            total: result?.pagination?.totalPages || 1,
            currentPage: result?.pagination?.page || 1,
            pageSize: result?.pagination?.limit || pageSize,
        };
    }, [fetchExchangeData]);

    // Fetch for filter
    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number
        ): Promise<listReturnType> => {
            const params: Record<string, string> = { per_page: pageSize.toString() };
            Object.keys(payload || {}).forEach((k) => {
                const v = payload[k as keyof typeof payload];
                if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                    params[k] = String(v);
                }
            });
            const result = await fetchExchangeData(params);
            if (!result) {
                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize: pageSize,
                };
            }
            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            const pagination = result.pagination || {};
            return {
                data: result.data || [],
                total: pagination?.totalPages || 1,
                totalRecords: pagination?.total || 0,
                currentPage: pagination?.page || 1,
                pageSize: pagination?.limit || pageSize,
            };
        },
        [fetchExchangeData]
    );

    // 🔹 Fetch Invoices
    const fetchInvoices = useCallback(async (
        page: number = 1,
        pageSize: number = 50
    ): Promise<listReturnType> => {
        try {
            setLoading(true);
            
            const result = await exchangeList({
                page: page.toString(),
                per_page: pageSize.toString(),
            });

            return {
                data: Array.isArray(result.data) ? result.data : [],
                total: result?.pagination?.totalPages || 1,
                currentPage: result?.pagination?.page || 1,
                pageSize: result?.pagination?.limit || pageSize,
            };
        } catch (error) {
            console.error(error);
            showSnackbar("Failed to fetch invoices", "error");
            return {
                data: [],
                total: 1,
                currentPage: 1,
                pageSize: pageSize,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading, showSnackbar]);

    // 🔹 Search Invoices (Mock)
    const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
        try {
            setLoading(true);
            return {
                data: [],
                currentPage: 1,
                pageSize: 50,
                total: 0,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading]);


    const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
        try {
            // setLoading(true);
            // Pass selected format to the export API
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportExchangeData({ format });
            // const url = response?.url || response?.data?.url;
            const url = response?.download_url || response?.url || response?.data?.url;
            if (url) {
                await downloadFile(url);
                showSnackbar("File downloaded successfully", "success");
            } else {
                showSnackbar("Failed to get download file", "error");
            }
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } catch (error) {
            console.error("Export failed:", error);
            showSnackbar("Failed to download invoices", "error");
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } finally {
            // setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchExchange, filterBy },
                    header: {
                        title: "Exchange",
                        columnFilter: true,
                        searchBar: false,
                        threeDot: [
                            {
                                icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                                label: "Export CSV",
                                labelTw: "text-[12px] hidden sm:block",
                                onClick: () => !threeDotLoading.csv && exportFile("csv"),
                            },
                            {
                                icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                                label: "Export Excel",
                                labelTw: "text-[12px] hidden sm:block",
                                onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                            },],

                        actions: can("create") ? [
                            <SidebarBtn
                                key={1}
                                href="/distributorsExchange/add"
                                isActive
                                leadingIcon="mdi:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                            />
                        ] : [],
                        filterRenderer: FilterComponent,
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) =>
                                router.push(`/distributorsExchange/details/${row.uuid}`),
                        },
                        {
                            icon: "lucide:download",
                            onClick: (row: TableDataType) => exportFile()
                        }
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
