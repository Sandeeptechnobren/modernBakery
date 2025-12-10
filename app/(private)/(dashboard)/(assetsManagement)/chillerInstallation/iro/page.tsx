"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    TableDataType
} from "@/app/components/customTable";
import StatusBtn from "@/app/components/statusBtn2";
import { iroList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Type definitions for the ACF API response
interface ChillerRequest {
    id: number;
    uuid: string;
    osa_code: string | null;
    owner_name: string;
    contact_number: string;
    landmark: string;
    outlet_id: number;
    existing_coolers: string;
    outlet_weekly_sale_volume: string;
    display_location: string;
    chiller_safty_grill: string;
    customer_id: number;
    machine_number: string;
    brand: string;
    asset_number: string | null;
    model: string;
    salesman_id: number;
    warehouse_id: number;
    status: number;
    fridge_status: number;
    iro_id: number;
    model_number: number;
    [key: string]: any; // For other fields we don't explicitly need
}

interface WorkflowStep {
    id: number;
    workflow_request_id: number;
    step_order: number;
    title: string;
    approval_type: string;
    status: string;
    uuid: string;
    [key: string]: any;
}

interface ACFDataRow {
    chiller_request: ChillerRequest;
    workflow_request_id: number;
    approved_steps: WorkflowStep[];
    pending_steps: WorkflowStep[];
    customer?: { code?: string; name?: string };
    warehouse?: { code?: string; name?: string };
    outlet?: { code?: string; name?: string };
    salesman?: { code?: string; name?: string };
}

const hasChillerRequest = (data: TableDataType): data is TableDataType & { chiller_request: ChillerRequest } => {
    return data && typeof data === 'object' && 'chiller_request' in data &&
        data.chiller_request !== null && typeof data.chiller_request === 'object';
};

const renderNestedField = (
    data: TableDataType,
    field: string,
    subField: string
) => {
    if (
        data[field] &&
        typeof data[field] === "object" &&
        data[field] !== null &&
        subField in (data[field] as object)
    ) {
        return (data[field] as Record<string, string>)[subField] || "-";
    }
    return "-";
};


const renderCombinedField = (data: TableDataType, field: string) => {
    const code = renderNestedField(data, field, "code");
    const name = renderNestedField(data, field, "name");
    if (code !== "-" && name !== "-") {
        return `${code} - ${name}`;
    } else if (name !== "-") {
        return name;
    } else if (code !== "-") {
        return code;
    }
    return "-";
};

// 🔹 Table Columns
const columns = [
    {
        key: "osa_code",
        label: "OSA Code",
    },
    {
        key: "warehouse",
        label: "Distributors",
    },
    {
        key: "created_user",
        label: "Regional Manager",
    },
    {
        key: "created_at",
        label: "Created Date",
        render: (data: any) => (
            <p>{new Date(data.created_at).toLocaleDateString() || "-"}</p>
        )
    },
    {
        key: "status",
        label: "Status",
        render: (data: any) => (
            <StatusBtn isActive={data.status === 1} />
        )
    },

];


export default function CustomerInvoicePage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        region: "",
        routeCode: "",
    });
    const {
        warehouseAllOptions,
        routeOptions,
        regionOptions,
        areaOptions,
        assetsModelOptions
    } = useAllDropdownListData();

    const [refreshKey, setRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Fetch Invoices
    const fetchIRO = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50,
            appliedFilters: Record<string, any> = {}
        ): Promise<listReturnType> => {
            try {
                setLoading(true);

                const result = await iroList({
                    ...appliedFilters,   // no pagination params needed
                });

                const mapped =
                    result?.count?.headers?.map((h: any) => {
                        const crfCount = Array.isArray(h.details) ? h.details.length : 0;

                        return {
                            osa_code: `${h.osa_code} (${crfCount} CRF)`,
                            warehouse: h.warehouse_id,
                            created_at: h.created_at,
                            status: h.status,
                            created_user: h.created_user,
                        };
                    }) || [];

                // ✅ Return mapped data without pagination
                return {
                    data: mapped,
                    total: mapped.length,
                    currentPage: 1,
                    pageSize: mapped.length, // show all rows
                };

            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch IRO list", "error");

                return {
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: 0,
                };

            } finally {
                setLoading(false);
            }
        },
        [setLoading, showSnackbar]
    );



    // const filterBy = useCallback(
    //     async (
    //         payload: Record<string, string | number | null>,
    //         pageSize: number,
    //     ): Promise<listReturnType> => {
    //         let result;
    //         // setLoading(true);
    //         try {
    //             const params: Record<string, string> = {
    //                 per_page: pageSize.toString(),
    //             };
    //             Object.keys(payload || {}).forEach((k) => {
    //                 const v = payload[k as keyof typeof payload];
    //                 if (v !== null && typeof v !== "undefined" && String(v) !== "") {
    //                     params[k] = String(v);
    //                 }
    //             });
    //             result = await iroList(params);
    //         } finally {
    //             // setLoading(false);
    //         }

    //         if (result?.error)
    //             throw new Error(result.data?.message || "Filter failed");
    //         else {
    //             const pagination =
    //                 result.pagination?.pagination || result.pagination || {};
    //             return {
    //                 data: result.data || [],
    //                 total: pagination.last_page || result.pagination?.last_page || 1,
    //                 totalRecords:
    //                     pagination.total || result.pagination?.total || 0,
    //                 currentPage: pagination.current_page || result.pagination?.current_page || 1,
    //                 pageSize: pagination.per_page || pageSize,
    //             };
    //         }
    //     },
    //     [],
    // );

    // 🔹 Search Invoices (Mock)
    // const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
    //     try {
    //         setLoading(true);
    //         return {
    //             data: [],
    //             currentPage: 1,
    //             pageSize: 50,
    //             total: 0,
    //         };
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [setLoading]);


    // const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
    //     try {
    //         // setLoading(true);
    //         // Pass selected format to the export API
    //         setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
    //         const response = await exportExchangeData({ format });
    //         // const url = response?.url || response?.data?.url;
    //         const url = response?.download_url || response?.url || response?.data?.url;
    //         if (url) {
    //             await downloadFile(url);
    //             showSnackbar("File downloaded successfully", "success");
    //         } else {
    //             showSnackbar("Failed to get download file", "error");
    //         }
    //         setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    //     } catch (error) {
    //         console.error("Export failed:", error);
    //         showSnackbar("Failed to download invoices", "error");
    //         setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    //     } finally {
    //         // setLoading(false);
    //     }
    // };

    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [
        routeOptions,
        warehouseAllOptions,
        areaOptions,
        regionOptions,
        assetsModelOptions
    ]);

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchIRO },
                    header: {
                        title: "Installation Request Order",
                        columnFilter: true,
                        searchBar: false,
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
                        //     },],
                        // filterByFields: [
                        //     {
                        //         key: "warehouse_id",
                        //         label: "Warehouse",
                        //         isSingle: false,
                        //         multiSelectChips: true,
                        //         options: Array.isArray(warehouseAllOptions)
                        //             ? warehouseAllOptions
                        //             : [],
                        //     },
                        //     {
                        //         key: "region_id",
                        //         label: "Region",
                        //         isSingle: false,
                        //         multiSelectChips: true,
                        //         options: Array.isArray(regionOptions) ? regionOptions : [],
                        //     },
                        //     {
                        //         key: "sub_region_id",
                        //         label: "Sub Region",
                        //         isSingle: false,
                        //         multiSelectChips: true,
                        //         options: Array.isArray(areaOptions) ? areaOptions : [],
                        //     },
                        //     {
                        //         key: "route_id",
                        //         label: "Route",
                        //         isSingle: false,
                        //         multiSelectChips: true,
                        //         options: Array.isArray(routeOptions) ? routeOptions : [],
                        //     },
                        //     {
                        //         key: "model_number",
                        //         label: "Model Number",
                        //         isSingle: false,
                        //         multiSelectChips: true,
                        //         options: Array.isArray(assetsModelOptions)
                        //             ? assetsModelOptions
                        //             : [],
                        //     },
                        // ],
                        // actionsWithData: (data: TableDataType[], selectedRow?: number[]) => {
                        //     // gets the ids of the selected rows with type narrowing
                        //     const ids = selectedRow
                        //         ?.map((index) => {
                        //             const row = data[index];
                        //             if (hasChillerRequest(row)) {
                        //                 return row.chiller_request.id;
                        //             }
                        //             return null;
                        //         })
                        //         .filter((id): id is number => id !== null);

                        //     return [
                        //         <SidebarBtn
                        //             key="key-companu-customer-with-data"
                        //             onClick={async () => {
                        //                 if (!ids || ids.length === 0) {
                        //                     showSnackbar("No valid rows selected", "error");
                        //                     return;
                        //                 }
                        //                 try {
                        //                     const res = await addAcf({ crf_id: ids.join(",") });
                        //                     console.log(res);
                        //                     if (res.error) {
                        //                         showSnackbar(res.message || "Failed to add ACF", "error");
                        //                     } else {
                        //                         showSnackbar(res.message || "ACF added successfully", "success");
                        //                         setRefreshKey(k => k + 1);
                        //                     }
                        //                 } catch (error) {
                        //                     showSnackbar("Failed to add ACF", "error");
                        //                 }
                        //             }}
                        //             leadingIcon="lucide:plus"
                        //             label="Convert IRO"
                        //             labelTw="hidden sm:block"
                        //             isActive
                        //         />
                        //     ];
                        // },
                        // selectedCount: {
                        //     label: "Selected Rows: ",
                        //     onClick: (data: TableDataType[], selectedRow?: number[]) => {
                        //         const ids = selectedRow
                        //             ?.map((id) => {
                        //                 const row = data[id];
                        //                 if (hasChillerRequest(row)) {
                        //                     return row.chiller_request.id;
                        //                 }
                        //                 return null;
                        //             })
                        //             .filter((id): id is number => id !== null);
                        //         console.log("Selected Rows:", ids);
                        //     }
                        // },
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,

                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) => {
                                router.push(`/chillerInstallation/iro/view/${row.id}`);
                            },
                        },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
