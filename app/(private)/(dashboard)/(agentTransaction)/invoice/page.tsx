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
import { invoiceList,exportInvoice,invoiceStatusUpdate } from "@/app/services/agentTransaction";
import { downloadFile } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";



// 🔹 Table Columns
const columns = [
    { 
        key: "invoice_date", 
        label: "Date",
        showByDefault: true,
        
    },
    { 
        key: "invoice_time", 
        label: "Time",
        showByDefault: true,
        
    },
    { key: "invoice_code", label: "Invoice Code",showByDefault: true },
    { key: "order_code", label: "Order Code",showByDefault: true },
    { key: "customer_code", label: "Customer",showByDefault: true , render: (row: TableDataType) => {
        const code = row.customer_code || "";
        const name = row.customer_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }},
    { key: "route_code", label: "Route",showByDefault: true , render: (row: TableDataType) => {
        const code = row.route_code || "";
        const name = row.route_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }},
    { key: "warehouse_code", label: "Warehouse", showByDefault: true,
      render: (row: TableDataType) => {
        const code = row.warehouse_code || "";
        const name = row.warehouse_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
    },
    { key: "salesman_code", label: "Salesman",showByDefault: true  , render: (row: TableDataType) => {
        const code = row.salesman_code || "";
        const name = row.salesman_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }},
    { key: "total_amount", label: "Invoice Amount",showByDefault: true },
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
    const { warehouseOptions, salesmanOptions, routeOptions, agentCustomerOptions } = useAllDropdownListData();

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        region: "",
        routeCode: "",
    });

    const [refreshKey, setRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
        try {
            setLoading(true);
            // Pass selected format to the export API
            const response = await exportInvoice({ format });
            const url = response?.url || response?.data?.url;
            if (url) {
                await downloadFile(url);
                showSnackbar("File downloaded successfully", "success");
            } else {
                showSnackbar("Failed to get download file", "error");
            }
        } catch (error) {
            console.error("Export failed:", error);
            showSnackbar("Failed to download invoices", "error");
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
        } catch (error:any) {
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

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
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
                    const params: Record<string, string> = { };
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
                        total: pagination.totalPages || result.pagination?.totalPages || 0,
                        totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
                        currentPage: pagination.current_page || result.pagination?.currentPage || 0,
                        pageSize: pagination.limit || pageSize,
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
                        api: { list: fetchInvoices, search: searchInvoices,filterBy: filterBy, },
                        header: {
                            title: "Customer Invoices",
                             threeDot: [
                                {
                                    icon: "gala:file-document",
                                    label: "Export CSV",
                                    labelTw: "text-[12px] hidden sm:block",
                                    onClick: () => exportFile('csv'),
                                },
                                {
                                    icon: "gala:file-document",
                                    label: "Export Excel",
                                    labelTw: "text-[12px] hidden sm:block",
                                    onClick: () => exportFile('xlsx'),

                                },
                
                 {
                                    icon: "lucide:radio",
                                    label: "Inactive",
                                    // showOnSelect: true,
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if(!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("1") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if(!status.includes(currentStatus)){
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
                                        if(!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("0") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if(!status.includes(currentStatus)){
                                                status.push(currentStatus);
                                            }
                                            return data[id].uuid;
                                        })
                                        statusUpdate(ids, Number(1));
                                    },
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
                                {
                                    key: "warehouse",
                                    label: "Warehouse",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(warehouseOptions) ? warehouseOptions : [],
                                },
                                 {
                                    key: "salesman",
                                    label: "Salesman",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
                                },
                                {
                                    key: "route_id",
                                    label: "Route",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(routeOptions) ? routeOptions : [],
                                },

                               
                                {
                                    key: "customer",
                                    label: "Customer",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(agentCustomerOptions) ? agentCustomerOptions : [],
                                },
                                
                            ],
                           
                            searchBar: false,
                            actions: [
                            
                              <SidebarBtn
                                  key={1}
                                  href="/invoice/add"
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
                                        `/invoice/details/${row.uuid}`
                                    ),
                            },
                            // {
                            //     icon: "lucide:edit-2",
                            //     onClick: (row: TableDataType) =>
                            //         router.push(
                            //             `/invoice/${row.uuid}`
                            //         ),
                            // },
                        ],
                        pageSize: 10,
                    }}
                />
        </div>
    );
}
