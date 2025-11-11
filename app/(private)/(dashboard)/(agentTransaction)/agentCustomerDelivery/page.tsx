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
import { deliveryList } from "@/app/services/agentTransaction";
import StatusBtn from "@/app/components/statusBtn2";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// const dropdownDataList = [
//     // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//     // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//     // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//     { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//     { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

// 🔹 Table Columns
const columns = [
    {
        key: "delivery_date",
        label: "Date",
        showByDefault: true,
        render: (row: TableDataType) => {
            if (!row.delivery_date) return "-";
            const date = new Date(row.delivery_date as string);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    },
    { key: "delivery_code", label: "Delivery Code", showByDefault: true },
    // { key: "order_code", label: "Order Code",showByDefault: true },
    {
        key: "customer",
        label: "Customer Name",
        render: (row: TableDataType) => {
            const customer = typeof row.customer === "string" ? { code: "", name: row.customer } : (row.customer ?? {});
            const code = customer.code ?? "";
            const name = customer.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "route",
        label: "Route Name",
        render: (row: TableDataType) => {
            const route = typeof row.route === "string" ? { code: "", name: row.route } : (row.route ?? {});
            const code = route.code ?? "";
            const name = route.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "warehouse",
        label: "Warehouse Name",
        render: (row: TableDataType) => {
            const warehouse = typeof row.warehouse === "string" ? { code: "", name: row.warehouse } : (row.warehouse ?? {});
            const code = warehouse.code ?? "";
            const name = warehouse.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "salesman",
        label: "Salesman Name",
        render: (row: TableDataType) => {
            const salesman = typeof row.salesman === "string" ? { code: "", name: row.salesman } : (row.salesman ?? {});
            const code = salesman.code ?? "";
            const name = salesman.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    // { key: "Invoice_type", label: "Invoice Type" },
    // { key: "Invoice_no", label: "Invoice No" },
    // { key: "sap_id", label: "SAP ID" },
    // { key: "sap_status", label: "SAP Status" },
    { key: "total", label: "Amount", showByDefault: true },
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
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const { customerSubCategoryOptions, salesmanOptions, agentCustomerOptions, channelOptions, warehouseOptions, routeOptions } = useAllDropdownListData();

    // 🔹 Fetch Invoices
    const fetchInvoices = useCallback(async (
        page: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        try {
            setLoading(true);
            const result = await deliveryList({
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
                pageSize: 10,
                total: 0,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number
        ): Promise<listReturnType> => {
            let result;
            setLoading(true);
            try {
                const params: Record<string, string> = { per_page: pageSize.toString() };
                Object.keys(payload || {}).forEach((k) => {
                    const v = payload[k as keyof typeof payload];
                    if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                        params[k] = String(v);
                    }
                });
                result = await deliveryList(params);
            } finally {
                setLoading(false);
            }

            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination = result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination?.last_page || 1,
                    totalRecords: pagination?.total || 0,
                    currentPage: pagination?.current_page || 1,
                    pageSize: pagination?.per_page || pageSize,
                };
            }
        },
        [setLoading]
    );


    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [customerSubCategoryOptions, routeOptions, warehouseOptions, channelOptions]);

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchInvoices, search: searchInvoices, filterBy: filterBy },
                    header: {
                        title: "Customer Delivery",
                        columnFilter: true,
                        searchBar: false,
                        actions: [
                            <SidebarBtn
                                key={1}
                                href="/agentCustomerDelivery/add"
                                isActive
                                leadingIcon="mdi:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                            />
                        ],
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
                            {
                                key: "warehouse",
                                label: "Warehouse",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(warehouseOptions) ? warehouseOptions : [],
                            },
                            {
                                key: "route_id",
                                label: "Route",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(routeOptions) ? routeOptions : [],
                            },
                            {
                                key: "salesman_id",
                                label: "Salesman",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
                            },
                            {
                                key: "customer_id",
                                label: "Customer",
                                type: "select",
                                options: Array.isArray(agentCustomerOptions) ? agentCustomerOptions : [],
                                isSingle: false,
                                multiSelectChips: true,
                            }
                        ],
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
                                    `/agentCustomerDelivery/details/${row.uuid}`
                                ),
                        },
                        // {
                        //     icon: "lucide:edit-2",
                        //     onClick: (row: TableDataType) =>
                        //         router.push(
                        //             `/agentCustomerDelivery/${row.uuid}`
                        //         ),
                        // },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
