"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { downloadFile } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";
import toInternationalNumber, { FormatNumberOptions } from "@/app/(private)/utils/formatNumber";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { formatWithPattern } from "@/app/(private)/utils/date";
import { invoiceExportHeader, invoiceList } from "@/app/services/companyTransaction";



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
    { key: "order_code", label: "Order Code"},
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
        key: "warehouse_code", label: "Distributor", showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.warehouse_code || "-";
            const name = row.warehouse_name || "-";
            return `${code}${code && name ? " - " : "-"}${name}`;
        }
    },
    {
        key: "salesman_code", label: "Sales Team", showByDefault: true, render: (row: TableDataType) => {
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
        key: "status",
        label: "Status",
        render: (row: TableDataType) => {
            // Treat status 1 or 'active' (case-insensitive) as active
            const isActive =
                String(row.status) === "1" ||
                (typeof row.status === "string" &&
                    row.status.toLowerCase() === "active");
            return <StatusBtn isActive={isActive} />;
        },
        showByDefault: true,
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
    const { companyOptions, warehouseAllOptions, regionOptions, areaOptions, routeOptions, salesmanOptions } = useAllDropdownListData();
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
            const response = await invoiceExportHeader({ format });
            const url = response?.download_url || response?.data?.download_url;
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
                        title: "Company Invoices",
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
                        ],
                        columnFilter: true,
                        filterByFields: [
                            {
                                key: "start_date",
                                label: "Start Date",
                                type: "date"
                            },
                            {
                                key: "end_date",
                                label: "End Date",
                                type: "date"
                            },
                            // {
                            //     key: "company_id",
                            //     label: "Company",
                            //     isSingle: false,
                            //     multiSelectChips: true,
                            //     options: Array.isArray(companyOptions) ? companyOptions : [],
                            // },
                            // {
                            //     key: "warehouse_id",
                            //     label: "Warehouse",
                            //     isSingle: false,
                            //     multiSelectChips: true,
                            //     options: Array.isArray(warehouseAllOptions) ? warehouseAllOptions : [],
                            // },
                            // {
                            //     key: "region_id",
                            //     label: "Region",
                            //     isSingle: false,
                            //     multiSelectChips: true,
                            //     options: Array.isArray(regionOptions) ? regionOptions : [],
                            // },
                            // {
                            //     key: "sub_region_id",
                            //     label: "Sub Region",
                            //     isSingle: false,
                            //     multiSelectChips: true,
                            //     options: Array.isArray(areaOptions) ? areaOptions : [],
                            // },
                            // {
                            //     key: "route_id",
                            //     label: "Route",
                            //     isSingle: false,
                            //     multiSelectChips: true,
                            //     options: Array.isArray(routeOptions) ? routeOptions : [],
                            // },
                            // {
                            //     key: "salesman_id",
                            //     label: "Sales Team",
                            //     isSingle: false,
                            //     multiSelectChips: true,
                            //     options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
                            // }

                        ],
                        searchBar: false
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
                                    `/invoice/details/${row.uuid}`
                                ),
                        },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
