"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import Table, {
    configType,
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import { capsCollectionList, collectionList } from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import { useLoading } from "@/app/services/loadingContext";
import toInternationalNumber, { FormatNumberOptions } from "@/app/(private)/utils/formatNumber";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

export default function SalemanLoad() {
    const { can, permissions } = usePagePermissions();
    const { warehouseOptions, salesmanOptions, routeOptions, agentCustomerOptions , ensureAgentCustomerLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseLoaded} = useAllDropdownListData();

    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

  // Load dropdown data
  useEffect(() => {
    ensureAgentCustomerLoaded();
    ensureRouteLoaded();
    ensureSalesmanLoaded();
    ensureWarehouseLoaded();
  }, [ensureAgentCustomerLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseLoaded]);
    const columns: configType["columns"] = [
        { key: "code", label: "Invoice Code" },
        { key: "collection_no", label: "Collection No." },
        {
            key: "ammount", label: "Amout", render: (row: TableDataType) => {
                // row.total_amount may be string or number; toInternationalNumber handles both
                return toInternationalNumber(row.total, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                } as FormatNumberOptions);
            },
        },
        { key: "outstanding", label: "Outstanding" },
        // { key: "date", label: "Collection Date" },
        {
            key: "warehouse_code", label: "Warehouse Code", render: (row: TableDataType) => {
                const code = row.warehouse_code || "-";
                const name = row.warehouse_name || "-";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "route_code", label: "Route Code", render: (row: TableDataType) => {
                const code = row.route_code || "-";
                const name = row.route_name || "-";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "customer_code", label: "Customer", render: (row: TableDataType) => {
                const code = row.customer_code || "-";
                const name = row.customer_name || "-";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "salesman_code", label: "Salesman", render: (row: TableDataType) => {
                const code = row.salesman_code || "-";
                const name = row.salesman_name || "-";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => {
                return row.status ? "Confirmed" : "Waiting";
            },
        }
    ];

    const { setLoading } = useLoading();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    type TableRow = TableDataType & { id?: string };

    const fetchSalesmanLoadHeader = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            try {
                setLoading(true);
                const listRes = await collectionList({
                    page: page.toString(),
                    per_page: pageSize.toString(),
                });
                setLoading(false);
                return {
                    data: Array.isArray(listRes.data) ? listRes.data : [],
                    total: listRes?.pagination?.totalPages || 1,
                    currentPage: listRes?.pagination?.page || 1,
                    pageSize: listRes?.pagination?.limit || pageSize,
                };
            } catch (error: unknown) {
                setLoading(false);
                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize: 5,
                };
            }
        }, [setLoading]);

    useEffect(() => {
        setLoading(true);
    }, []);

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchSalesmanLoadHeader,
                            // filterBy: filterBy,
                        },
                        header: {
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
                                    label: "Sales Team",
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
                            title: "Collection",
                            searchBar: false,
                            columnFilter: true,
                            // actions: [
                            //     <SidebarBtn
                            //         key={0}
                            //         href="/c/add"
                            //         isActive
                            //         leadingIcon="lucide:plus"
                            //         label="Add"
                            //         labelTw="hidden sm:block"
                            //     />
                            // ],
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        // rowActions: [
                        //     {
                        //         icon: "lucide:eye",
                        //         onClick: (data: object) => {
                        //             const row = data as TableRow;
                        //             router.push(`/capsCollection/details/${row.uuid}`);
                        //         },
                        //     },
                        // ],
                        pageSize: 50,
                    }}
                />
            </div>
        </>
    );
}
