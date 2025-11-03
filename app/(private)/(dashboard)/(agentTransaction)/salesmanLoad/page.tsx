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
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { salesmanLoadHeaderList} from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function SalemanLoad() {
    const columns: configType["columns"] = [
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "accepted_date", label: "Accepted Date" },
        { key: "accepted_time", label: "Accepted Time" },
        { key: "load_period_no", label: "Load Period Number" },
        { key: "routename", label: "Route Name" },
        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => {
                return row.status ? "Confirmed" : "Waiting";
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

    // const search = useCallback(
    //     async (
    //         searchQuery: string,
    //         pageSize: number,
    //         columnName?: string
    //     ): Promise<searchReturnType> => {
    //         let result;
    //         setLoading(true);
    //         if(columnName) {
    //             result = await agentCustomerList({
    //                 per_page: pageSize.toString(),
    //                 [columnName]: searchQuery
    //             });
    //         }
    //         setLoading(false);
    //         if (result.error) throw new Error(result.data.message);
    //         else {
    //             return {
    //                 data: result.data || [],
    //                 total: result.pagination.pagination.totalPages || 0,
    //                 currentPage: result.pagination.pagination.current_page || 0,
    //                 pageSize: result.pagination.pagination.limit || pageSize,
    //             };
    //         }
    //     },
    //     []
    // );

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
                        },
                        header: {
                            title: "Salesman Load",
                            searchBar: false,
                            columnFilter: true,
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
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(
                                        `/salesmanLoad/${row.uuid}`
                                    );
                                },
                            },
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
