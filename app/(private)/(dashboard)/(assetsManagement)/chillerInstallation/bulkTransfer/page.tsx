"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    searchReturnType
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { bulkTransferList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


// ✅ TYPE FOR BULK TRANSFER API ITEM
interface BulkTransferRow {
    id: number;
    uuid: string;
    transfer_no: string;
    osa_code: string;
    region?: { id?: string; code?: string; name?: string; };
    area?: { id?: string; code?: string; name?: string; };
    warehouse?: { id?: string; code?: string; name?: string; };
    model_number: { id?: string; code?: string; name?: string; };
    requestes_asset: number;
    available_stock: number;
    approved_qty: string;
    comment_reject: string;
    status: number;
}

// ✅ TABLE COLUMNS (CLEANED)
const columns = [
    {
        key: "osa_code",
        label: "OSA Code",
        render: (row: any) => <p>{row.osa_code || "-"}</p>,
    },
    {
        key: "region",
        label: "Region",
        render: (row: any) => (
            <p>{row.region?.name || '-'}</p>
        )
    },
    {
        key: "area",
        label: "Area",
        render: (row: any) => (
            <p>{row.area?.name || '-'}</p>
        ),
    },
    {
        key: "warehouse",
        label: "Distributors",
        render: (row: any) => (
            <p>{row.warehouse?.name || '-'}</p>
        ),
    },
    {
        key: "model_number",
        label: "Model Number",
        render: (row: any) => (
            <p>{row.model_number?.name || '-'}</p>
        ),
    },
    {
        key: "requestes_asset",
        label: "Requested Chiller",
        render: (row: any) => <p>{row.requestes_asset}</p>,
    },
    {
        key: "approved_qty",
        label: "Approved Chiller",
        render: (row: any) => <p>{row.approved_qty}</p>,
    },
    {
        key: "comment_reject",
        label: "Rejected Reason",
        render: (row: any) => <p>{row.comment_reject || "-"}</p>,
    },
    {
        key: "status",
        label: "Status",
        render: (row: any) => (
            <StatusBtn isActive={row.status === 1} />
        ),
    },
];


export default function BulkTransferListPage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();

    const { warehouseAllOptions, regionOptions, areaOptions, assetsModelOptions } =
        useAllDropdownListData();

    const [refreshKey, setRefreshKey] = useState(0);

    // -----------------------------------------
    // 🔥 FETCH FUNCTION FOR TABLE
    // -----------------------------------------
    const fetchBulkTransfer = useCallback(
        async (
            page: number = 1,
            pageSize: number = 20,
            appliedFilters: Record<string, any> = {}
        ): Promise<listReturnType> => {
            try {
                setLoading(true);

                const result = await bulkTransferList({
                    page: page.toString(),
                    per_page: pageSize.toString(),
                    ...appliedFilters,
                });

                return {
                    data: Array.isArray(result?.data) ? result.data : [],
                    total: result?.pagination?.total || 1,
                    currentPage: result?.pagination?.current_page || 1,
                    pageSize: result?.pagination?.per_page || pageSize,
                };
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch bulk transfer list", "error");

                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize: pageSize,
                };
            } finally {
                setLoading(false);
            }
        },
        [setLoading, showSnackbar]
    );

    // -----------------------------------------
    // 🔎 SEARCH (Mock because no search API)
    // -----------------------------------------
    const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
        return { data: [], currentPage: 1, total: 0, pageSize: 20 };
    }, []);


    // Refresh table when dropdown options load
    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [warehouseAllOptions, regionOptions, areaOptions, assetsModelOptions]);


    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchBulkTransfer, search: searchInvoices },

                    header: {
                        title: "Bulk Transfer",
                        columnFilter: true,
                        searchBar: false,
                        actions: [
                            <SidebarBtn
                                key="add"
                                href="/chillerInstallation/bulkTransfer/add"
                                leadingIcon="lucide:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                                isActive
                            />,
                            <SidebarBtn
                                key="addAllocated"
                                href="/chillerInstallation/bulkTransfer/addAllocated"
                                leadingIcon="lucide:plus"
                                label="Add Allocated"
                                labelTw="hidden lg:block"
                                isActive
                            />,
                        ],

                        // 🔥 FILTER FIELDS THAT MATCH YOUR API
                        filterByFields: [
                            {
                                key: "region_id",
                                label: "Region",
                                isSingle: false,
                                multiSelectChips: true,
                                options: regionOptions || [],
                            },
                            {
                                key: "area_id",
                                label: "Area",
                                isSingle: false,
                                multiSelectChips: true,
                                options: areaOptions || [],
                            },
                            {
                                key: "warehouse_id",
                                label: "Warehouse",
                                isSingle: false,
                                multiSelectChips: true,
                                options: warehouseAllOptions || [],
                            },
                            {
                                key: "assets_id",
                                label: "Model / Assets",
                                isSingle: false,
                                multiSelectChips: true,
                                options: assetsModelOptions || [],
                            },
                        ],
                    },

                    footer: { nextPrevBtn: true, pagination: true },

                    columns,

                    rowSelection: true,
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: any) => {
                                router.push(`/chillerInstallation/bulkTransfer/Detail/${row.uuid}`);
                            },
                        },
                    ],

                    pageSize: 20,
                    localStorageKey: "bulk-transfer-table",
                }}
            />
        </div>
    );
}
