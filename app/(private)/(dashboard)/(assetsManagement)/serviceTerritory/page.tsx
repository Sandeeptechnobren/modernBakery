"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    searchReturnType
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { irServiceTerrtList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


// ✅ TYPE FOR SERVICE TERRITORY API ITEM
interface ServiceTerritoryRow {
    uuid: string;
    osa_code: string;
    warehouse_id: number;
    region_id: number;
    area_id: number;
    technician: {
        id: number;
        name: string | null;
        code: string | null;
    };
    // created_user: number;
    // updated_user: number;
    // deleted_user: number | null;
    // created_at: string;
    // updated_at: string;
    // deleted_at: string | null;
}

// ✅ TABLE COLUMNS FUNCTION FOR SERVICE TERRITORY
const getColumns = (
    regionOptions: Array<{ value: string; label: string }>,
    areaOptions: Array<{ value: string; label: string }>,
    warehouseOptions: Array<{ value: string; label: string }>
) => [
        {
            key: "osa_code",
            label: "ST Code",
            render: (row: any) => <p>{row.osa_code || "-"}</p>,
        },
        {
            key: "region_id",
            label: "Region",
            render: (row: any) => {
                const region = regionOptions.find(r => r.value === String(row.region_id));
                return <p>{region?.label || row.region_id || "-"}</p>;
            },
        },
        {
            key: "area_id",
            label: "Area",
            render: (row: any) => {
                const area = areaOptions.find(a => a.value === String(row.area_id));
                return <p>{area?.label || row.area_id || "-"}</p>;
            },
        },
        {
            key: "warehouse_id",
            label: "Warehouse",
            render: (row: any) => {
                const warehouse = warehouseOptions.find(w => w.value === String(row.warehouse_id));
                return <p>{warehouse?.label || row.warehouse_id || "-"}</p>;
            },
        },
        {
            key: "technician",
            label: "Technician",
            render: (row: any) => {
                const code = row.technician?.code;
                const name = row.technician?.name;

                if (code && name) return <p>{`${code} - ${name}`}</p>;
                if (code) return <p>{code}</p>;
                if (name) return <p>{name}</p>;
                return <p>-</p>;
            },
        },
        // {
        //     key: "created_at",
        //     label: "Created Date",
        //     render: (row: any) => <p>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}</p>,
        // },
    ];


export default function ServiceTerritoryListPage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();

    const { warehouseAllOptions, regionOptions, areaOptions, assetsModelOptions } =
        useAllDropdownListData();

    const [refreshKey, setRefreshKey] = useState(0);

    // -----------------------------------------
    // 🔥 FETCH FUNCTION FOR TABLE
    // -----------------------------------------
    const fetchServiceTerritory = useCallback(
        async (
            page: number = 1,
            pageSize: number = 20,
            appliedFilters: Record<string, any> = {}
        ): Promise<listReturnType> => {
            try {
                setLoading(true);

                const result = await irServiceTerrtList({
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
                    console.log("✅ Object response with data property");
                    return {
                        data: Array.isArray(result.data) ? result.data : [],
                        total: result?.pagination?.total || result.data.length || 0,
                        currentPage: result?.pagination?.current_page || page,
                        pageSize: result?.pagination?.per_page || pageSize,
                    };
                }

                // Fallback
                // console.warn("⚠️ Unexpected response structure");
                return {
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: pageSize,
                };
            } catch (error) {
                console.error("❌ Error fetching service territory:", error);
                showSnackbar("Failed to fetch service territory list", "error");

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
                    api: { list: fetchServiceTerritory, search: searchInvoices },

                    header: {
                        title: "Service Territory",
                        columnFilter: true,
                        searchBar: false,
                        actions: [
                            <SidebarBtn
                                key="add"
                                href="/serviceTerritory/add"
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

                    columns: getColumns(regionOptions || [], areaOptions || [], warehouseAllOptions || []),

                    rowSelection: true,
                    rowActions: [
                        {
                            icon: "lucide:edit",
                            onClick: (row: any) => {
                                router.push(`/serviceTerritory/${row.uuid}`);
                            },
                        },
                        {
                            icon: "lucide:eye",
                            onClick: (row: any) => {
                                router.push(`/assetsManagement/serviceTerritory/view/${row.uuid}`);
                            },
                        },
                    ],

                    pageSize: 20,
                    localStorageKey: "service-territory-table",
                }}
            />
        </div>
    );
}
