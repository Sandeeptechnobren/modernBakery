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
import { invoiceList } from "@/app/services/agentTransaction";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

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
                            columnFilter: true,
                             filterByFields: [
                                {
                                    key: "date_change",
                                    label: "Date Range",
                                    type: "dateChange"
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
                            wholeTableActions: [
                              <div key={0} className="flex gap-[12px] relative">
                                  <DismissibleDropdown
                                      isOpen={showDropdown}
                                      setIsOpen={setShowDropdown}
                                      button={
                                          <BorderIconButton icon="ic:sharp-more-vert" />
                                      }
                                      dropdown={
                                          <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                              <CustomDropdown>
                                                  {dropdownDataList.map(
                                                      (link, idx) => (
                                                          <div
                                                              key={idx}
                                                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                                          >
                                                              <Icon
                                                                  icon={
                                                                      link.icon
                                                                  }
                                                                  width={
                                                                      link.iconWidth
                                                                  }
                                                                  className="text-[#717680]"
                                                              />
                                                              <span className="text-[#181D27] font-[500] text-[16px]">
                                                                  {
                                                                      link.label
                                                                  }
                                                              </span>
                                                          </div>
                                                      )
                                                  )}
                                              </CustomDropdown>
                                          </div>
                                      }
                                  />
                              </div>
                            ],
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
