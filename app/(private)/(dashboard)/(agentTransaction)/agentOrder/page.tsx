"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { agentOrderList, changeStatusAgentOrder } from "@/app/services/agentTransaction";
import OrderStatus from "@/app/components/orderStatus";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const columns = [
    { key: "created_at", label: "Order Date", showByDefault: true, render: (row: TableDataType) => <span className="font-bold cursor-pointer">{row.created_at.split("T")[0]}</span> },
    { key: "order_code", label: "Order Number", showByDefault: true, render: (row: TableDataType) => <span className="font-bold cursor-pointer">{row.order_code}</span> },
    {
        key: "warehouse_name",
        label: "Warehouse Name",
        showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.warehouse_code ?? "";
            const name = row.warehouse_name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    {
        key: "customer_name",
        label: "Customer Name",
        showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.customer_code ?? "";
            const name = row.customer_name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    {
        key: "salesman_name",
        label: "Salesman Name",
        render: (row: TableDataType) => {
            const code = row.salesman_code ?? "";
            const name = row.salesman_name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    {
        key: "route_name",
        label: "Route Name",
        render: (row: TableDataType) => {
            const code = row.route_code ?? "";
            const name = row.route_name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    { key: "payment_method", label: "Payment Method", render: (row: TableDataType) => row.payment_method || "-" },
    { key: "order_source", label: "Order Source", render: (row: TableDataType) => row.order_source || "-" },
    { key: "delivery_date", label: "Delivery Date", showByDefault: true, render: (row: TableDataType) => row.delivery_date || "-" },
    { key: "comment", label: "Comment", render: (row: TableDataType) => row.comment || "-" },
    {
        key: "status", label: "Status", showByDefault: true, render: (row: TableDataType) => (
            <OrderStatus status={row.status} />
        )
    },
];

export default function CustomerInvoicePage() {
    const { setLoading } = useLoading();
    const { customerSubCategoryOptions, salesmanOptions, agentCustomerOptions, channelOptions, warehouseOptions, routeOptions } = useAllDropdownListData();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    const [refreshKey, setRefreshKey] = useState(0);

    const fetchOrders = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            setLoading(true);
            const params: Record<string, string> = {
                page: page.toString(),
                pageSize: pageSize.toString()
            };
            const listRes = await agentOrderList(params);
            setLoading(false);
            return {
                data: Array.isArray(listRes.data) ? listRes.data : [],
                total: listRes?.pagination?.totalPages || 1,
                currentPage: listRes?.pagination?.page || 1,
                pageSize: listRes?.pagination?.limit || pageSize,
            };
        }, [setLoading, showSnackbar]);

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
                result = await agentOrderList(params);
            } finally {
                setLoading(false);
            }

            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination = result.pagination?.pagination || result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination.totalPages || result.pagination?.totalPages || 0,
                    totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
                    currentPage: pagination.current_page || result.pagination?.currentPage || 0,
                    pageSize: pagination.limit || pageSize,
                };
            }
        },
        [setLoading]
    );

    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [customerSubCategoryOptions, routeOptions, warehouseOptions, channelOptions]);


    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchOrders, filterBy: filterBy },
                        header: {
                            title: "Customer Orders",
                            searchBar: false,
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
                            actions: [
                                // <SidebarBtn
                                //     key={0}
                                //     href="#"
                                //     isActive
                                //     leadingIcon="mdi:download"
                                //     label="Download"
                                //     labelTw="hidden lg:block"
                                // />,
                                <SidebarBtn
                                    key={1}
                                    href="/agentOrder/add"
                                    isActive
                                    leadingIcon="mdi:plus"
                                    label="Add"
                                    labelTw="hidden lg:block"
                                />
                            ],
                        },
                        rowSelection: true,
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (row: TableDataType) =>
                                    router.push(
                                        `/agentOrder/details/${row.uuid}`
                                    ),
                            }
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}
