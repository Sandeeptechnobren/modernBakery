"use client";
import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    downloadFile,
    exportRoutes,
    routeGlobalSearch,
    routeStatusUpdate,
} from "@/app/services/allApi";
import { pointsList } from "@/app/services/loyaltyProgramApis";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import { useCallback, useEffect, useState } from "react";


export default function Tier() {
    const [warehouseId, setWarehouseId] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);
    const { setLoading } = useLoading();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });

    const columns = [
        {
            key: "osa_code",
            label: "Code",
            render: (data: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {`${data.osa_code || ""}`}
                </span>
            ),
        },
        {
            key: "customer_code,customer_name",
            label: "Customer",
            render: (data: TableDataType) => {
                return `${data?.customer_code ||  "-"} - ${data?.customer_name ||  "-"}`;
            },
        },
        {
            key: "tier_code,tier_name",
            label: "Tier",
            render: (data: TableDataType) => {
                return `${data?.tier_code ||  ""} - ${data?.tier_name ||  ""}`;
            },
        },
        {
            key: "total_earning",
            label: "Total Earning",
            render: (data: TableDataType) => {
                return toInternationalNumber(data?.total_earning ||  "-");
            },
        },
        {
            key: "total_spend",
            label: "Total Spend",
            render: (data: TableDataType) => {
                return toInternationalNumber(data?.total_spend ||  "-");
            },
        },
        {
            key: "total_closing",
            label: "Total Closing",
            render: (data: TableDataType) => {
                return toInternationalNumber(data?.total_closing ||  "-");
            },
        },
        
    ];

    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [warehouseId]);

    const fetchTiers = async (
        pageNo: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        try {
           
            const listRes = await pointsList();
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

    const searchTier = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 10,
            columnName?: string,
            page: number = 1
        ): Promise<searchReturnType> => {
            // setLoading(true);
            let result;
            if (columnName && columnName !== "") {
                result = await pointsList({
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
                            list: fetchTiers,
                            search: searchTier,
                        },
                        header: {
                            title: "Customer Loyalty Points",
                            // threeDot: [
                            //     {
                            //         icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                            //         label: "Export CSV",
                            //         labelTw: "text-[12px] hidden sm:block",
                            //         onClick: () => !threeDotLoading.csv && exportFile("csv"),
                            //     },
                            //     {
                            //         icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                            //         label: "Export Excel",
                            //         labelTw: "text-[12px] hidden sm:block",
                            //         onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                            //     },
                            //     {
                            //         icon: "lucide:radio",
                            //         label: "Inactive",
                            //         showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                            //             if (!selectedRow || selectedRow.length === 0) return false;
                            //             const status = selectedRow?.map((id) => data[id].status).map(String);
                            //             return status?.includes("1") || false;
                            //         },
                            //         onClick: (data: TableDataType[], selectedRow?: number[]) => {
                            //             const status: string[] = [];
                            //             const ids = selectedRow?.map((id) => {
                            //                 const currentStatus = data[id].status;
                            //                 if (!status.includes(currentStatus)) {
                            //                     status.push(currentStatus);
                            //                 }
                            //                 return data[id].id;
                            //             })
                            //             handleStatusChange(ids, Number(0));
                            //         },
                            //     },
                            //     {
                            //         icon: "lucide:radio",
                            //         label: "Active",
                            //         showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                            //             if (!selectedRow || selectedRow.length === 0) return false;
                            //             const status = selectedRow?.map((id) => data[id].status).map(String);
                            //             return status?.includes("0") || false;
                            //         },
                            //         onClick: (data: TableDataType[], selectedRow?: number[]) => {
                            //             const status: string[] = [];
                            //             const ids = selectedRow?.map((id) => {
                            //                 const currentStatus = data[id].status;
                            //                 if (!status.includes(currentStatus)) {
                            //                     status.push(currentStatus);
                            //                 }
                            //                 return data[id].id;
                            //             })
                            //             handleStatusChange(ids, Number(0));
                            //         },
                            //     }
                            // ],
                            // searchBar: true,
                            columnFilter: true,
                            actions: [
                                // <SidebarBtn
                                //     key={0}
                                //     href="/customerLoyaltyPoints/add"
                                //     isActive={true}
                                //     leadingIcon="lucide:plus"
                                //     label="Add"
                                //     labelTw="hidden sm:block"
                                // />,
                                // <SidebarBtn
                                //     key={1}
                                //     leadingIcon="lucide:download"
                                //     onClick={handleDownloadCSV}
                                //     label="Download CSV"
                                //     labelTw="hidden sm:block"
                                // />
                            ],
                        },
                        localStorageKey: "route-table",
                        footer: {
                            nextPrevBtn: true,
                            pagination: true,
                        },
                        columns: columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: TableDataType) => {
                                    router.push(`/customerLoyaltyPoints/details/${data.uuid}`);
                                },
                            },
                            // {
                            //     icon: "lucide:edit-2",
                            //     onClick: (data: TableDataType) => {
                            //         router.push(`/settings/bonusPoints/${data.uuid}`);
                            //     },
                            // },
                        ],
                        pageSize: 50,
                    }}
                />
            </div>

           
        </>
    );
}
