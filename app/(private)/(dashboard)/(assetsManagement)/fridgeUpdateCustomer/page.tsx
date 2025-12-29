"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { fridgeUpdateCustomerList } from "@/app/services/assetsApi";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function FridgeUpdateCustomer() {
    const { can, permissions } = usePagePermissions();
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const Status: Record<string, string> = {
        "1": "Sales Team Requested",
        "2": "Area Sales Manager Accepted",
        "3": "Area Sales Manager Rejected",
        "4": "Chiller officer Accepted",
        "5": "Chiller officer Rejected",
        "6": "Completed",
        "7": "Chiller Manager Rejected",
    };

    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const fetchServiceTypes = useCallback(
        async (pageNo: number = 1, pageSize: number = 10): Promise<listReturnType> => {
            setLoading(true);
            const res = await fridgeUpdateCustomerList({
                page: pageNo.toString(),
                per_page: pageSize.toString(),
            });
            setLoading(false);
            if (res.error) {
                showSnackbar(res.data.message || "failed to fetch the Chillers", "error");
                throw new Error("Unable to fetch the Chillers");
            } else {
                return {
                    data: res.data || [],
                    currentPage: res?.pagination?.page || 0,
                    pageSize: res?.pagination?.limit || 10,
                    total: res?.pagination?.totalPages || 0,
                };
            }
        }, []
    )
    // const searchChiller = useCallback(
    //     async (
    //         query: string,
    //         pageSize: number = 10,
    //         columnName?: string
    //     ): Promise<listReturnType> => {
    //         try {
    //             setLoading(true);

    //             // 🔒 Guard clause
    //             if (!columnName) {
    //                 return {
    //                     data: [],
    //                     currentPage: 0,
    //                     pageSize,
    //                     total: 0,
    //                 };
    //             }

    //             const res = await chillerList({
    //                 query,
    //                 per_page: pageSize.toString(),
    //                 [columnName]: query,
    //             });

    //             if (res?.error) {
    //                 showSnackbar(
    //                     res?.data?.message || "Failed to search the Chillers",
    //                     "error"
    //                 );
    //                 throw new Error("Unable to search the Chillers");
    //             }

    //             return {
    //                 data: res?.data || [],
    //                 currentPage: res?.pagination?.page || 0,
    //                 pageSize: res?.pagination?.limit || pageSize,
    //                 total: res?.pagination?.totalPages || 0,
    //             };
    //         } finally {
    //             // ✅ always runs (success or error)
    //             setLoading(false);
    //         }
    //     },
    //     []
    // );

    // const handleExport = async (fileType: "csv" | "xlsx") => {
    //     try {
    //         setLoading(true);

    //         const res = await assetsMasterExport({ format: fileType });
    //         console.log("Export API Response:", res);

    //         let downloadUrl = "";

    //         if (res?.url && res.url.startsWith("blob:")) {
    //             downloadUrl = res.url;
    //         } else if (res?.url && res.url.startsWith("http")) {
    //             downloadUrl = res.url;
    //         } else if (typeof res === "string" && res.includes(",")) {
    //             const blob = new Blob([res], {
    //                 type:
    //                     fileType === "csv"
    //                         ? "text/csv;charset=utf-8;"
    //                         : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //             });
    //             downloadUrl = URL.createObjectURL(blob);
    //         } else {
    //             showSnackbar("No valid file or URL returned from server", "error");
    //             return;
    //         }

    //         // ⬇️ Trigger browser download
    //         const link = document.createElement("a");
    //         link.href = downloadUrl;
    //         link.download = `assets_export.${fileType}`;
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);

    //         showSnackbar(
    //             `Download started for ${fileType.toUpperCase()} file`,
    //             "success"
    //         );
    //     } catch (error) {
    //         console.error("Export error:", error);
    //         showSnackbar("Failed to export Assets Master data", "error");
    //     } finally {
    //         setLoading(false);
    //         setShowExportDropdown(false);
    //     }
    // };


    useEffect(() => {
        setLoading(true);
    }, [])

    return (
        <>
            {/* Table */}
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchServiceTypes,
                            // search: searchChiller
                        },
                        header: {
                            title: "Fridge Update Customer",
                            // threeDot: [
                            //     {
                            //         icon: "gala:file-document",
                            //         label: "Export CSV",
                            //         onClick: (data: TableDataType[], selectedRow?: number[]) => {
                            //             handleExport("csv");
                            //         },
                            //     },
                            //     {
                            //         icon: "gala:file-document",
                            //         label: "Export Excel",
                            //         onClick: (data: TableDataType[], selectedRow?: number[]) => {
                            //             handleExport("xlsx");
                            //         },
                            //     },
                            // ],
                            searchBar: true,
                            columnFilter: true,
                        },
                        localStorageKey: "fridgeUpdateCustomerTable",
                        table: {
                            height: 400
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns: [
                            {
                                key: "osa_code", label: "Code",
                                render: (row: TableDataType) => (
                                    <span className="font-semibold text-[#181D27] text-[14px]">
                                        {row.osa_code}
                                    </span>
                                ),
                            },
                            { key: "created_at", label: "Date", render: (row: TableDataType) => formatDate(row.created_at) },
                            { key: "agent", label: "Agent" },
                            { key: "area_manager", label: "Area Manager" },
                            { key: "outlet_name", label: "Outlet Name" },
                            { key: "location", label: "Location" },
                            { key: "contact_number", label: "Contact Number" },
                            { key: "outlet_type", label: "Outlet Type" },
                            { key: "serial_no", label: "Captured Serial No." },
                            { key: "asset_number", label: "Asset Number" },
                            { key: "model", label: "Model Number" },
                            { key: "brand", label: "Branding" },
                            { key: "remark", label: "Remarks" },
                            {
                                key: "status",
                                label: "Status",
                                render: (data: TableDataType) => {
                                    const statusKey = String(data.status);
                                    return Status[statusKey] ?? "-";
                                },
                            },
                        ],
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: TableDataType) => {
                                    router.push(`/fridgeUpdateCustomer/view/${data.uuid}`);
                                },
                            },
                            ...(can("edit") ? [{
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(`/fridgeUpdateCustomer/${data.uuid}`);
                                },
                            }] : []),
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}