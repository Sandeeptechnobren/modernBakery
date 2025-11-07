"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    configType,
    listReturnType,
    TableDataType
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { salesmanLoadHeaderList } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface SalesmanLoadRow {
    osa_code?: string;
    warehouse?: {
        code?: string;
        name?: string;
    };
    route?: {
        code?: string;
        name?: string;
    };
    salesman?: {
        code?: string;
        name?: string;
    };
    project_type?: {
        code?: string;
        name?: string;
    };
    is_confirmed?: boolean;
    salesman_type?: string;
    status?: boolean;
    uuid?: string;
}


export default function SalemanLoad() {
    const [warehouseId, setWarehouseId] = useState<string>("");
    const [channelId, setChannelId] = useState<string>("");
    const [routeId, setRouteId] = useState<string>("");
    const { warehouseOptions, routeOptions,regionOptions } = useAllDropdownListData();
    const columns: configType["columns"] = [
        // { key: "osa_code", label: "Code" },
        {
            key: "warehouse",
            label: "Warehouse",
            render: (row: TableDataType) => {
                const salesmanRow = row as SalesmanLoadRow;
                return `${salesmanRow.warehouse?.code} - ${salesmanRow.warehouse?.name?.split("-")[0]} - (${salesmanRow.warehouse?.name?.split("-")[1]})` || "";
            }
        },
        {
            key: "route",
            label: "Route",
            render: (row: TableDataType) => {
                const salesmanRow = row as SalesmanLoadRow;
                return salesmanRow.route?.code || "-";
            }
        },
        {
            key: "salesman",
            label: "Salesman",
            render: (row: TableDataType) => {
                const salesmanRow = row as SalesmanLoadRow;
                return `${salesmanRow.salesman?.code} - ${salesmanRow.salesman?.name}` || "";
            }
        },
        {
  key: "project_type",
  label: "Salesman Role",
  render: (row: TableDataType) => {
    const s = row as SalesmanLoadRow;
    if (s.project_type && typeof s.project_type === "object") {
      const { code, name } = s.project_type;
      if (code || name) {
        return `${code ?? ""}${code && name ? " - " : ""}${name ?? ""}`;
      }
    }
    return s.salesman_type || "-";
  },
},
        {
            key: "is_confirmed",
            label: "Status",
            render: (row: TableDataType) => {
                const salesmanRow = row as SalesmanLoadRow;

                return (
                    <StatusBtn
                        isActive={salesmanRow?.status ? true : false}
                    // label={salesmanRow.status?.toString() === "Pending" ? true : false }
                    />
                );
            },
        }

    ];

    const { setLoading } = useLoading();
    const [refreshKey, setRefreshKey] = useState(0);
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
                const listRes = await salesmanLoadHeaderList({
                    // page: page.toString(),
                    // per_page: pageSize.toString(),
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
                result = await salesmanLoadHeaderList(params);
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
                            filterBy: filterBy
                        },
                        header: {
                            title: "Salesman Load",
                            searchBar: false,
                            columnFilter: true,
                            filterByFields: [
                                {
                                    key: "date_change",
                                    label: "Date Range",
                                    type: "dateChange"
                                },
                                {
                                    key: "region",
                                    label: "Region",
                                    isSingle: false,
                                    multiSelectChips: true,
                                    options: Array.isArray(regionOptions) ? regionOptions : [],
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
                                
                            ],
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/salesmanLoad/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />
                            ],
                        },
                        localStorageKey: "agentCustomer-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(`/salesmanLoad/details/${row.uuid}`);
                                },
                            },
                            // {
                            //     icon: "lucide:edit-2",
                            //     onClick: (data: object) => {
                            //         const row = data as TableRow;
                            //         router.push(
                            //             `/salesmanLoad/${row.uuid}`
                            //         );
                            //     },
                            // },
                        ],
                        pageSize: 50,
                      
                    }}
                />
            </div>

            {/* {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Agent Customer"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )} */}
        </>
    );
}
