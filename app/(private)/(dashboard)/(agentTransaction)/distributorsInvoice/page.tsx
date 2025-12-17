"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { invoiceList, exportInvoice, invoiceStatusUpdate, exportOrderInvoice } from "@/app/services/agentTransaction";
import { downloadFile } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";
import toInternationalNumber, { FormatNumberOptions } from "@/app/(private)/utils/formatNumber";
import { formatDate } from "@/app/(private)/utils/date";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { formatWithPattern } from "@/app/(private)/utils/date";
import FilterComponent from "@/app/components/filterComponent";
import ApprovalStatus from "@/app/components/approvalStatus";



// 🔹 Table Columns
const columns = [
    {
        key: "invoice_date",
        label: "Date",
        showByDefault: true,
        render: (row: TableDataType) => {
            if (!row.invoice_date) return "-";
            return formatWithPattern(new Date(row.invoice_date), "DD MMM YYYY", "en-GB").toLowerCase() || "-";
        }
    },
    {
        key: "invoice_time",
        label: "Time",
        showByDefault: true,
    },
    { key: "invoice_code", label: "Invoice Code", showByDefault: true },
    { key: "order_code", label: "Order Code" },
    {
        key: "customer_code", label: "Customer", showByDefault: true, render: (row: TableDataType) => {
            const code = row.customer_code || "-";
            const name = row.customer_name || "-";
            return `${code}${code && name ? " - " : "-"}${name}`;
        }
    },
    {
        key: "route_code", label: "Route", showByDefault: true, render: (row: TableDataType) => {
            const code = row.route_code || "-";
            const name = row.route_name || "-";
            return `${code}${code && name ? " - " : "-"}${name}`;
        }
    },
    {
        key: "warehouse_code", label: "Distributor ", showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.warehouse_code || "-";
            const name = row.warehouse_name || "-";
            return `${code}${code && name ? " - " : "-"}${name}`;
        }
    },
    {
        key: "salesman_code", label: "Slaes Team", showByDefault: true, render: (row: TableDataType) => {
            const code = row.salesman_code || "-";
            const name = row.salesman_name || "-";
            return `${code}${code && name ? " - " : "-"}${name}`;
        }
    },
    {
        key: "total_amount",
        label: "Invoice Amount",
        showByDefault: true,
        render: (row: TableDataType) => {
            // row.total_amount may be string or number; toInternationalNumber handles both
            return toInternationalNumber(row.total_amount, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            } as FormatNumberOptions);
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
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const { companyOptions, warehouseAllOptions, regionOptions, areaOptions, routeOptions, salesmanOptions, ensureAreaLoaded, ensureCompanyLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded } = useAllDropdownListData();

    // Load dropdown data
    useEffect(() => {
        ensureAreaLoaded();
        ensureCompanyLoaded();
        ensureRegionLoaded();
        ensureRouteLoaded();
        ensureSalesmanLoaded();
        ensureWarehouseAllLoaded();
    }, [ensureAreaLoaded, ensureCompanyLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded]);
    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        region: "",
        routeCode: "",
    });

    const [refreshKey, setRefreshKey] = useState(0);

    const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
        try {
            // setLoading(true);
            // Pass selected format to the export API
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportInvoice({ format });
            const url = response?.url || response?.data?.url;
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

    const downloadPdf = async (uuid: string) => {
        try {
            setLoading(true);
            const response = await exportOrderInvoice({ uuid: uuid, format: "pdf" });
            if (response && typeof response === 'object' && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            showSnackbar("Failed to download file", "error");
        } finally {
            setLoading(false);
        }
    };


    const statusUpdate = async (
        dataOrIds: TableDataType[] | (string | number)[] | undefined,
        selectedRowOrStatus?: number[] | number
    ) => {
        try {
            if (!dataOrIds || (Array.isArray(dataOrIds) && dataOrIds.length === 0)) {
                showSnackbar("No invoices selected", "error");
                return;
            }

            // Collect selected UUIDs (prefer `uuid` field from table rows). The API expects
            // invoice_ids to be an array of identifiers (use uuid when available).
            let selectedRowsData: (string | number)[] = [];
            let status: number | undefined;

            const first = dataOrIds[0] as any;
            if (typeof first === "object") {
                const data = dataOrIds as TableDataType[];
                const selectedRow = selectedRowOrStatus as number[] | undefined;
                if (!selectedRow || selectedRow.length === 0) {
                    showSnackbar("No invoices selected", "error");
                    return;
                }

                selectedRowsData = data
                    .filter((row: TableDataType, index) => selectedRow.includes(index))
                    .map((row: TableDataType) => {
                        const r = row as any;
                        return r.uuid ?? r.id ?? r.invoice_id ?? null;
                    })
                    .filter(Boolean) as (string | number)[];

                status = typeof selectedRowOrStatus === "number" ? selectedRowOrStatus : 0;
            } else {
                const ids = dataOrIds as (string | number)[];
                selectedRowsData = ids.filter(Boolean);
                status = typeof selectedRowOrStatus === "number" ? selectedRowOrStatus : 0;
            }

            if (selectedRowsData.length === 0) {
                showSnackbar("No invoices selected", "error");
                return;
            }

            await invoiceStatusUpdate({ invoice_ids: selectedRowsData, status: status ?? 0 });
            setRefreshKey((k) => k + 1);
            showSnackbar("Invoice status updated successfully", "success");
        } catch (error: any) {
            console.error("Status update failed:", error);
            // Try to extract meaningful message from API response
            let message = "Failed to update invoice status";

            const respData = error?.response?.data ?? error?.data ?? null;
            if (respData) {
                if (typeof respData === "string") {
                    message = respData;
                } else if (respData.message) {
                    message = respData.message;
                } else if (respData.errors && typeof respData.errors === 'object') {
                    // Flatten validation errors into a single string
                    try {
                        const vals = Object.values(respData.errors).flat();
                        if (Array.isArray(vals) && vals.length > 0) {
                            message = vals.join("; ");
                        }
                    } catch (e) {
                        // fallback to default
                    }
                }
            } else if (error?.message) {
                message = error.message;
            }

            showSnackbar(String(message), "error");
        }
    };

    // 🔹 Fetch Invoices
    const fetchInvoices = useCallback(async (
        page: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        try {
            setLoading(true);
            const result = await invoiceList({
                page: page.toString(),
                per_page: pageSize.toString(),
            });

            return {
                data: Array.isArray(result.data) ? result.data : [],
                total: result?.pagination?.last_page || 1,
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
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

    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number
        ): Promise<listReturnType> => {
            let result;
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                Object.keys(payload || {}).forEach((k) => {
                    const v = payload[k as keyof typeof payload];
                    if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                        params[k] = String(v);
                    }
                });
                result = await invoiceList(params);
            } finally {
                setLoading(false);
            }

            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination = result.pagination?.pagination || result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination?.last_page || result.pagination?.last_page || 0,
                    totalRecords: pagination?.total || result.pagination?.total || 0,
                    currentPage: pagination?.current_page || result.pagination?.current_page || 0,
                    pageSize: pagination?.per_page || pageSize,
                };
            }
        },
        [setLoading]
    );

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchInvoices, filterBy: filterBy },
                    header: {
                        title: "Distributor's Invoices",
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
                            },
                            {
                                icon: "lucide:radio",
                                label: "Inactive",
                                // showOnSelect: true,
                                showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                    if (!selectedRow || selectedRow.length === 0) return false;
                                    const status = selectedRow?.map((id) => data[id].status).map(String);
                                    return status?.includes("1") || false;
                                },
                                onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                    const status: string[] = [];
                                    const ids = selectedRow?.map((id) => {
                                        const currentStatus = data[id].status;
                                        if (!status.includes(currentStatus)) {
                                            status.push(currentStatus);
                                        }
                                        return data[id].uuid;
                                    })
                                    statusUpdate(ids, Number(0));
                                },
                            },
                            {
                                icon: "lucide:radio",
                                label: "Active",
                                // showOnSelect: true,
                                showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                    if (!selectedRow || selectedRow.length === 0) return false;
                                    const status = selectedRow?.map((id) => data[id].status).map(String);
                                    return status?.includes("0") || false;
                                },
                                onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                    const status: string[] = [];
                                    const ids = selectedRow?.map((id) => {
                                        const currentStatus = data[id].status;
                                        if (!status.includes(currentStatus)) {
                                            status.push(currentStatus);
                                        }
                                        return data[id].uuid;
                                    })
                                    statusUpdate(ids, Number(1));
                                },
                            },
                        ],
                        columnFilter: true,
                        filterRenderer: FilterComponent,
                        searchBar: false,
                        actions: [
                            <SidebarBtn
                                key={1}
                                href="/distributorsInvoice/add"
                                isActive
                                leadingIcon="mdi:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                            />
                        ]
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) =>
                                router.push(
                                    `/distributorsInvoice/details/${row.uuid}`
                                ),
                        },
                        {
                            icon: "lucide:download",
                            onClick: (row: TableDataType) => downloadPdf(row.uuid),
                        },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
