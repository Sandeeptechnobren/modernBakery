"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    searchReturnType
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { irServiceTerrtList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import ServiceTerritoryDetailsDrawer from "./ServiceTerritoryDetailsDrawer";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";


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

}


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
        // {
        //     key: "region_id",
        //     label: "Region",
        //     render: (row: any) => {
        //         let label = "-";
        //         if (row.region && typeof row.region === "object" && "code" in row.region) {
        //             label = row.region.code || "-";
        //         } else {
        //             const opt = regionOptions.find(o => String(o.value) === String(row.region_id));
        //             if (opt) label = opt.label;
        //             else if (row.region_id) label = String(row.region_id);
        //         }
        //         return <p>{label}</p>;
        //     }
        // },
        // {
        //     key: "area_id",
        //     label: "Area",
        //     render: (row: any) => {
        //         let label = "-";
        //         if (row.area && typeof row.area === "object" && "code" in row.area) {
        //             label = row.area.code || "-";
        //         } else {
        //             const opt = areaOptions.find(o => String(o.value) === String(row.area_id));
        //             if (opt) label = opt.label;
        //             else if (row.area_id) label = String(row.area_id);
        //         }
        //         return <p>{label}</p>;
        //     }
        // },

        // {
        //     key: "warehouse_id",
        //     label: "Warehouse",
        //     render: (row: any) => {
        //         let label = "-";
        //         // Try reading from object first (some APIs return 'warehouse' object)
        //         if (row.warehouse && typeof row.warehouse === "object" && ("name" in row.warehouse || "code" in row.warehouse)) {
        //             label = row.warehouse.name || row.warehouse.code || "-";
        //         } else {
        //             // Fallback to options
        //             const opt = warehouseOptions.find(w => String(w.value) === String(row.warehouse_id));
        //             if (opt) label = opt.label;
        //             else if (row.warehouse_id) label = String(row.warehouse_id);
        //         }
        //         return <p>{label}</p>;
        //     },
        // },
        // {
        //     key: "warehouse",
        //     label: "Warehouse",
        //     // showByDefault: true,
        //     render: (row: any) =>
        //         typeof row.warehouse === "object" &&
        //             row.warehouse !== null &&
        //             "code" in row.warehouse
        //             ? (row.warehouse as { code?: string }).code || "-"
        //             : "-",

        // },
        {
            key: "technician_code",
            label: "Technician Code",
            render: (row: any) => <p>{row.technician?.code || "-"}</p>,
        },
        {
            key: "technician_name",
            label: "Technician Name",
            render: (row: any) => <p>{row.technician?.name || "-"}</p>,
        },
        // {
        //     key: "created_at",
        //     label: "Created Date",
        //     render: (row: any) => <p>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}</p>,
        // },
    ];


export default function ServiceTerritoryListPage() {
    const { can, permissions } = usePagePermissions();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();

    const { warehouseAllOptions, regionOptions, areaOptions, assetsModelOptions, ensureAreaLoaded, ensureAssetsModelLoaded, ensureRegionLoaded, ensureWarehouseAllLoaded } =
        useAllDropdownListData();

    // Load dropdown data
    useEffect(() => {
        ensureAreaLoaded();
        ensureAssetsModelLoaded();
        ensureRegionLoaded();
        ensureWarehouseAllLoaded();
    }, [ensureAreaLoaded, ensureAssetsModelLoaded, ensureRegionLoaded, ensureWarehouseAllLoaded]);

    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

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
                    current_current_page: page.toString(),
                    per_page: pageSize.toString(),
                    ...appliedFilters,
                });

                // Handle object response with data property (your actual API response)
                if (result?.data && result?.pagination) {
                    const totalPages = Math.ceil(result.pagination.total / result.pagination.per_page);
                    return {
                        data: Array.isArray(result.data) ? result.data : [],
                        total: totalPages, // total number of PAGES, not records
                        currentPage: result.pagination.current_page,
                        pageSize: result.pagination.per_page,
                    };
                }

                // Handle direct array response
                if (result?.data && result?.pagination) {
                    const totalPages = Math.ceil(result.pagination.total / result.pagination.per_page);
                    return {
                        data: Array.isArray(result.data) ? result.data : [],
                        total: totalPages, // total number of PAGES, not records
                        currentPage: result.pagination.current_page,
                        pageSize: result.pagination.per_page,
                    };
                }

                if (Array.isArray(result)) {
                    return {
                        data: result,
                        total: result.length,
                        currentPage: page,
                        pageSize: pageSize,
                    };
                }

                // Handle object response without pagination
                if (result?.data) {
                    return {
                        data: Array.isArray(result.data) ? result.data : [],
                        total: result?.pagination?.total || (Array.isArray(result.data) ? result.data.length : 0),
                        currentPage: result?.pagination?.current_page || page,
                        pageSize: result?.pagination?.per_page || pageSize,
                    };
                }

                return {
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: pageSize,
                };
            } catch (error) {
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
                        actions: can("create") ? [
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
                        ] : [],

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
                                setSelectedUuid(row.uuid);
                                setDrawerOpen(true);
                            },
                        },
                    ],

                    pageSize: 20,
                    localStorageKey: "service-territory-table",
                }}
            />

            {/* Drawer for Details */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '45.333%',
                        minWidth: '400px',
                        maxWidth: '600px',
                    },
                }}
            >
                {selectedUuid && (
                    <ServiceTerritoryDetailsDrawer
                        uuid={selectedUuid}
                        onClose={() => setDrawerOpen(false)}
                    />
                )}
            </Drawer>
        </div>
    );
}