"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    searchReturnType
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { irList, irReportList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


// ✅ TYPE FOR INSTALLATION REPORT API ITEM
interface InstallationReportRow {
    id: number;
    uuid: string;
    osa_code: string;
    iro_id: number;
    salesman_id: number;
    schedule_date: string;
    status: number;
    created_user: number;
    created_at: string;
    iro_code: string;
    warehouse_code: string;
    warehouse_name: string;
    salesman_code: string;
    salesman_name: string;
    count: number;
}

// ✅ TABLE COLUMNS FOR INSTALLATION REPORT
const columns = [
    {
        key: "osa_code",
        label: "IR Code",
        render: (row: any) => <p>{row.osa_code || "-"}</p>,
    },
    {
        key: "iro_code",
        label: "IRO Code",
        render: (row: any) => <p>{row.iro_code || "-"}</p>,
    },
    {
        key: "warehouse_code",
        label: "Warehouse Code",
        render: (row: any) => <p>{row.warehouse_code || "-"}</p>,
    },
    {
        key: "warehouse_name",
        label: "Warehouse Name",
        render: (row: any) => <p>{row.warehouse_name || "-"}</p>,
    },
    {
        key: "salesman_code",
        label: "Salesman Code",
        render: (row: any) => <p>{row.salesman_code || "-"}</p>,
    },
    {
        key: "salesman_name",
        label: "Salesman Name",
        render: (row: any) => <p>{row.salesman_name || "-"}</p>,
    },
    {
        key: "schedule_date",
        label: "Schedule Date",
        render: (row: any) => <p>{row.schedule_date || "-"}</p>,
    },
    {
        key: "count",
        label: "Chiller Count",
        render: (row: any) => <p>{row.count || 0}</p>,
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

                const result = await irReportList({
                    page: page.toString(),
                    per_page: pageSize.toString(),
                    ...appliedFilters,
                });

                // console.log("🔍 API Response:", result);
                // console.log("🔍 Result Type:", typeof result);
                // console.log("🔍 Is Array?:", Array.isArray(result));

                // Handle direct array response
                if (Array.isArray(result)) {
                    // console.log("✅ Direct array response detected");
                    return {
                        data: result,
                        total: result.length,
                        currentPage: page,
                        pageSize: result.length,
                    };
                }

                // Handle object response with data property
                if (result?.data) {
                    // console.log("✅ Object response with data property");
                    return {
                        data: Array.isArray(result.data) ? result.data : [],
                        total: result?.pagination?.total || result.data.length || 0,
                        currentPage: result?.pagination?.current_page || page,
                        pageSize: result?.pagination?.per_page || pageSize,
                    };
                }

                // Fallback
                console.warn("⚠️ Unexpected response structure");
                return {
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: pageSize,
                };
            } catch (error) {
                // console.error("❌ Error fetching installation reports:", error);
                showSnackbar("Failed to fetch installation report list", "error");

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
                        title: "Installation Report",
                        columnFilter: true,
                        searchBar: false,
                        actions: [
                            <SidebarBtn
                                key="add"
                                href="/chillerInstallation/installationReport/add"
                                leadingIcon="lucide:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                                isActive
                            />,
                            // <SidebarBtn
                            //     key="addAllocate"
                            //     href="/chillerInstallation/bulkTransfer/addAllocate"
                            //     leadingIcon="lucide:plus"
                            //     label="Add Allocate"
                            //     labelTw="hidden lg:block"
                            //     isActive
                            // />,
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
                                router.push(`/chillerInstallation/bulkTransfer/view/${row.uuid}`);
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
