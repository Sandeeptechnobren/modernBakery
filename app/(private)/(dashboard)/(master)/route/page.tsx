"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import StatusBtn from "@/app/components/statusBtn2";
import {
    deleteRoute,
    downloadFile,
    exportRoutes,
    routeGlobalSearch,
    routeList,
    routeStatusUpdate,
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";


export default function Route() {
    const { can, permissions } = usePagePermissions();
    const { warehouseAllOptions , ensureWarehouseAllLoaded} = useAllDropdownListData();
    console.log(permissions)
  // Load dropdown data
  useEffect(() => {
    ensureWarehouseAllLoaded();
  }, [ensureWarehouseAllLoaded]);

    const [warehouseId, setWarehouseId] = useState<string>("");
    const [selectedRowId, setSelectedRowId] = useState<number | undefined>();
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const { setLoading } = useLoading();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });

    const columns = [
        {
            key: "route_code, route_name",
            label: "Route",
            render: (data: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {`${data.route_code || ""} - ${data.route_name || ""}` || "-"}
                </span>
            ),
        },
        {
            key: "getrouteType",
            label: "Route Type",
            render: (data: TableDataType) => {
                const typeObj = data.getrouteType
                    ? JSON.parse(JSON.stringify(data.getrouteType))
                    : null;
                return typeObj?.name ? typeObj.name : "-";
            },
            width: 218,
        },
        {
            key: "warehouse",
            label: "Distributor",
            render: (data: TableDataType) =>
                typeof data.warehouse === "object" && data.warehouse !== null
                    ? `${(data.warehouse as { code?: string }).code || ""} - ${(data.warehouse as { name?: string }).name || ""}`
                    : "-",
            filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(warehouseAllOptions) ? warehouseAllOptions : [],
                onSelect: (selected: string | string[]) => {
                    setWarehouseId((prev) => (prev === selected ? "" : (selected as string)));
                },
                selectedValue: warehouseId,
            },
        },
        {
            key: "vehicle",
            label: "Vehicle",
            render: (data: TableDataType) => {
                const vehicleObj =
                    typeof data.vehicle === "string"
                        ? JSON.parse(data.vehicle)
                        : data.vehicle;
                return vehicleObj?.code ? vehicleObj.code : "-";
            },
        },
        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn
                    isActive={
                        row.status && row.status.toString() === "1" ? true : false
                    }
                />
            ),
        },
    ];

    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [warehouseId]);

    const fetchRoutes = async (
        pageNo: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        try {
            const params: any = {
                page: pageNo.toString(),
                per_page: pageSize.toString(),
            };
            if (warehouseId) {
                params.warehouse_id = warehouseId;
            }
            const listRes = await routeList(params);
            return {
                data: listRes?.data || [],
                currentPage: listRes?.pagination?.page || pageNo,
                pageSize: listRes?.pagination?.limit || pageSize,
                total: listRes?.pagination?.totalPages || 1,
            };
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        } finally {
            // setLoading(false);
        }
    };

    const searchRoute = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 10,
            columnName?: string,
            page: number = 1
        ): Promise<searchReturnType> => {
            // setLoading(true);
            let result;
            if (columnName && columnName !== "") {
                result = await routeList({
                    per_page: pageSize.toString(),
                    [columnName]: searchQuery,
                    page: page.toString(),
                });
            } else {
                result = await routeGlobalSearch({
                    search: searchQuery,
                    per_page: pageSize.toString(),
                    page: page.toString(),
                });
            }
            // setLoading(false);
            if (result.error) throw new Error(result.data.message);
            const pagination = result?.pagination || result?.pagination?.pagination || {};
            return {
                data: result.data || [],
                total: pagination?.totalPages || 1,
                currentPage: pagination?.page || 1,
                pageSize: pagination?.limit || 1,
            };
        },
        []
    );

    const handleStatusChange = async (ids: (string | number)[] | undefined, status: number) => {
        if (!ids || ids.length === 0) return;
        setLoading(true);
        const res = await routeStatusUpdate({
            ids: ids,
            status: Number(status)
        });
        setLoading(true);

        if (res.error) {
            showSnackbar(res.data.message || "Failed to update status", "error");
            throw new Error(res.data.message);
        }
        setRefreshKey(refreshKey + 1);
        showSnackbar("Status updated successfully", "success");
        return res;
    }

    // useEffect(() => {
    //     setLoading(true);
    // }, []);

    
    const exportFile = async (format: string) => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportRoutes({ format });
            if (response && typeof response === 'object' && response.url) {
                await downloadFile(response.url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } catch (error) {
            showSnackbar("Failed to download warehouse data", "error");
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        }
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchRoutes,
                            search: searchRoute,
                        },
                        header: {
                            title: "Routes",
                            threeDot: [
                                {
                                    icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                                    label: "Export CSV",
                                    labelTw: "text-[12px] hidden sm:block",
                                    onClick: () => !threeDotLoading.csv && exportFile("csv"),
                                },
                                {
                                    icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                                    label: "Export Excel",
                                    labelTw: "text-[12px] hidden sm:block",
                                    onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                                },
                                {
                                    icon: "lucide:radio",
                                    label: "Inactive",
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if (!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("1") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if (!status.includes(currentStatus)) {
                                                status.push(currentStatus);
                                            }
                                            return data[id].id;
                                        })
                                        handleStatusChange(ids, Number(0));
                                    },
                                },
                                {
                                    icon: "lucide:radio",
                                    label: "Active",
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if (!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("0") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if (!status.includes(currentStatus)) {
                                                status.push(currentStatus);
                                            }
                                            return data[id].id;
                                        })
                                        handleStatusChange(ids, Number(0));
                                    },
                                }
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: can("create") ? [
                                <SidebarBtn
                                    key={0}
                                    href="/route/add"
                                    isActive={true}
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                                // <SidebarBtn
                                //     key={1}
                                //     leadingIcon="lucide:download"
                                //     onClick={handleDownloadCSV}
                                //     label="Download CSV"
                                //     labelTw="hidden sm:block"
                                // />
                            ] : [],
                        },
                        localStorageKey: "route-table",
                        footer: {
                            nextPrevBtn: true,
                            pagination: true,
                        },
                        columns: columns,
                        rowSelection: true,
                        rowActions: can("edit") ? [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(`/route/${data.uuid}`);
                                },
                            },
                        ] : [],
                        pageSize: 50,
                    }}
                />
            </div>

           
        </>
    );
}
