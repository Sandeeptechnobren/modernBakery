"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { deliveryList,exchangeList } from "@/app/services/agentTransaction";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";

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
    { key: "delivery_code", label: "Delivery Code",showByDefault: true },
    // { key: "order_code", label: "Order Code",showByDefault: true },
    {
        key: "warehouse",
        label: "Warehouse Name",
        showByDefault: true,
        render: (row: TableDataType) => {
            const wh = row.warehouse;
            let code = "";
            let name = "";

            if (typeof wh === "string") {
                code = wh;
            } else if (wh && typeof wh === "object") {
                code = (wh as {code: string}).code ?? "";
                name = (wh as {name: string}).name ?? "";
            }

            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    {
        key: "customer",
        label: "Customer Name",
        showByDefault: true,
        render: (row: TableDataType) => {
            const wh = row.customer;
            let code = "";
            let name = "";
            if (typeof wh === "string") {
                code = wh;
            } else if (wh && typeof wh === "object") {
                code = (wh as {code: string}).code ?? "";
                name = (wh as {name: string}).name ?? "";
            }

            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    // {
    //     key: "salesman",
    //     label: "Salesman Name",
    //     render: (row: TableDataType) => {
    //         const code = row.salesman_code ?? "";
    //         const name = row.salesman_name ?? "";
    //         if (!code && !name) return "-";
    //         return `${code}${code && name ? " - " : ""}${name}`;
    //     },
    // },
    // {
    //     key: "route",
    //     label: "Route Name",
    //     render: (row: TableDataType) => {
    //         const code = row.route_code ?? "";
    //         const name = row.route_name ?? "";
    //         if (!code && !name) return "-";
    //         return `${code}${code && name ? " - " : ""}${name}`;
    //     },
    // },
    // { key: "Invoice_type", label: "Invoice Type" },
    // { key: "Invoice_no", label: "Invoice No" },
    // { key: "sap_id", label: "SAP ID" },
    // { key: "sap_status", label: "SAP Status" },
    { key: "total", label: "Amount",showByDefault: true },
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

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        region: "",
        routeCode: "",
    });

    const [refreshKey, setRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

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

    return (
        <div className="flex flex-col h-full">
                {/* 🔹 Table Section */}
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchInvoices, search: searchInvoices },
                        header: {
                            title: "Exchange",
                            columnFilter: true,
                            searchBar: false,
                            actions: [
                            //   <SidebarBtn
                            //       key={0}
                            //       href="#"
                            //       isActive
                            //       leadingIcon="mdi:download"
                            //       label="Download"
                            //       labelTw="hidden lg:block"
                            //   />,
                              <SidebarBtn
                                  key={1}
                                  href="/exchange/add"
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
                                        `/exchange/details/${row.uuid}`
                                    ),
                            }
                        ],
                        pageSize: 10,
                    }}
                />
        </div>
    );
}
