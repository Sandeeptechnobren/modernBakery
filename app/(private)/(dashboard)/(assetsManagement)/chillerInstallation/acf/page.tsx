"use client";

import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { acfList, addAcf } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { downloadFile } from "@/app/services/allApi";
import { useFormik } from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import InputFields from "@/app/components/inputFields";
// import { Icon } from "lucide-react";
import { Icon } from "@iconify-icon/react";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { button } from "framer-motion/client";

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
    return "-"; 99999999999
};

// 🔹 Table Columns
const columns = [
    // Essential Information
    {
        key: "osa_code",
        label: "OSA Code",
        render: (data: TableDataType) =>
            renderCombinedField(data, "osa_code"),
    },
    {
        key: "owner_name",
        label: "Owner Name",
        render: (data: TableDataType) =>
            renderCombinedField(data, "owner_name"),
    },
    {
        key: "contact_number",
        label: "Contact Number",
        render: (data: TableDataType) =>
            renderCombinedField(data, "contact_number"),
    },

    // Combined Relationship Fields
    {
        key: "customer",
        label: "Customer",
        render: (data: TableDataType) =>
            renderCombinedField(data, "customer"),
    },
    {
        key: "warehouse",
        label: "Distributor",
        render: (data: TableDataType) =>
            renderCombinedField(data, "warehouse"),
    },
    {
        key: "outlet",
        label: "Outlet",
        render: (data: TableDataType) =>
            renderCombinedField(data, "outlet"),
    },
    {
        key: "salesman",
        label: "Sales Team",
        render: (data: TableDataType) =>
            renderCombinedField(data, "salesman"),
    },

    // Key Chiller Details
    {
        key: "machine_number",
        label: "Machine No",
        render: (data: TableDataType) =>
            renderCombinedField(data, "machine_number"),
    },
    {
        key: "asset_number",
        label: "Asset No",
        render: (data: TableDataType) =>
            renderCombinedField(data, "asset_number"),
    },
    {
        key: "model",
        label: "Model",
        render: (data: TableDataType) =>
            renderCombinedField(data, "model"),
    },
    {
        key: "brand",
        label: "Brand",
        render: (data: TableDataType) =>
            renderCombinedField(data, "brand"),
    },

    // Status
    {
        key: "status",
        label: "Status",
        render: (data: TableDataType) =>
            renderCombinedField(data, "status"),
    },
]

export default function CustomerInvoicePage() {
    const { can, permissions } = usePagePermissions();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const [selectedRowsData, setSelectedRowsData] = useState<any[]>([]);
    const { values, setFieldValue } = useFormik({
        initialValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        onSubmit: (values) => {
            console.log(values);
        },
    });
    const [showSidebar, setShowSidebar] = useState(false);
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
        , ensureAreaLoaded, ensureAssetsModelLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureWarehouseAllLoaded } = useAllDropdownListData();

    // Load dropdown data
    useEffect(() => {
        ensureAreaLoaded();
        ensureAssetsModelLoaded();
        ensureRegionLoaded();
        ensureRouteLoaded();
        ensureWarehouseAllLoaded();
    }, [ensureAreaLoaded, ensureAssetsModelLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureWarehouseAllLoaded]);

    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Fetch Invoices
    // const fetchInvoices = useCallback(
    //     async (
    //         page: number = 1,
    //         pageSize: number = 50,
    //         appliedFilters: Record<string, any> = {}
    //     ): Promise<listReturnType> => {
    //         try {
    //             setLoading(true);

    //             const result = await acfList({
    //                 page: page.toString(),
    //                 per_page: pageSize.toString(),
    //                 ...appliedFilters, // ⬅️ Merge filters into API call
    //             });

    //             return {
    //                 data: Array.isArray(result.data) ? result.data : [],
    //                 total: result?.pagination?.totalPages || 1,
    //                 currentPage: result?.pagination?.page || 1,
    //                 pageSize: result?.pagination?.limit || pageSize,
    //             };
    //         } catch (error) {
    //             console.error(error);
    //             showSnackbar("Failed to fetch invoices", "error");
    //             return {
    //                 data: [],
    //                 total: 1,
    //                 currentPage: 1,
    //                 pageSize: pageSize,
    //             };
    //         } finally {
    //             setLoading(false);
    //         }
    //     },
    //     [setLoading, showSnackbar]
    // );

    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number,
        ): Promise<listReturnType> => {
            let result;
            // setLoading(true);
            try {
                const params: Record<string, string> = {
                    per_page: pageSize.toString(),
                };
                Object.keys(payload || {}).forEach((k) => {
                    const v = payload[k as keyof typeof payload];
                    if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                        params[k] = String(v);
                    }
                });
                result = await acfList(params);
            } finally {
                // setLoading(false);
            }

            if (result?.error)
                throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination =
                    result.pagination?.pagination || result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination.last_page || result.pagination?.last_page || 1,
                    totalRecords:
                        pagination.total || result.pagination?.total || 0,
                    currentPage: pagination.current_page || result.pagination?.current_page || 1,
                    pageSize: pagination.per_page || pageSize,
                };
            }
        },
        [refreshKey],
    );

    // 🔹 Search Invoices (Mock)
    const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
        try {
            setLoading(true);
            return {
                data: [],
                currentPage: 1,
                pageSize: 50,
                total: 0,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading]);


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
                    api: { filterBy: filterBy },
                    header: {
                        title: "Approve Chiller Request",
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
                        filterByFields: [
                            {
                                key: "warehouse_id",
                                label: "Warehouse",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(warehouseAllOptions)
                                    ? warehouseAllOptions
                                    : [],
                            },
                            {
                                key: "region_id",
                                label: "Region",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(regionOptions) ? regionOptions : [],
                            },
                            {
                                key: "sub_region_id",
                                label: "Sub Region",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(areaOptions) ? areaOptions : [],
                            },
                            {
                                key: "route_id",
                                label: "Route",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(routeOptions) ? routeOptions : [],
                            },
                            {
                                key: "model_number",
                                label: "Model Number",
                                isSingle: false,
                                multiSelectChips: true,
                                options: Array.isArray(assetsModelOptions)
                                    ? assetsModelOptions
                                    : [],
                            },
                        ],
                        actionsWithData: (data: TableDataType[], selectedRow?: number[]) => {
                            // if (!can("create")) return [];
                            // gets the ids of the selected rows with type narrowing
                            const ids = selectedRow
                                ?.map((index) => {
                                    const row = data[index];
                                    console.log("row", row)
                                    console.log(hasChillerRequest(row))
                                    // if (hasChillerRequest(row)) {
                                    //     console.log(row.id)
                                    return row.id;
                                    // }
                                    // return null;
                                })
                                .filter((id): id is number => id !== null);

                            console.log(ids);

                            return [
                                <SidebarBtn
                                    disabled={!ids || ids.length === 0}
                                    key="key-companu-customer-with-data"
                                    onClick={async () => {
                                        if (!ids || ids.length === 0) {
                                            showSnackbar("No valid rows selected", "error");
                                            return;
                                        }
                                        try {
                                            const res = await addAcf({ crf_id: ids.join(",") });
                                            console.log(res);
                                            if (res.error) {
                                                showSnackbar(res.message || "Failed to add ACF", "error");
                                            } else {
                                                showSnackbar(res.message || "ACF added successfully", "success");
                                                setRefreshKey(k => k + 1);
                                            }
                                        } catch (error) {
                                            showSnackbar("Failed to add ACF", "error");
                                        }
                                    }}
                                    leadingIcon="lucide:plus"
                                    label="Convert IRO"
                                    labelTw="hidden sm:block"
                                    isActive
                                />
                            ];
                        },
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    floatingInfoBar: {
                        showByDefault: true,
                        showSelectedRow: true,
                        buttons: [
                            {
                                label: "Selected Rows",
                                onClick: (data, selectedRow) => {
                                    const rows = selectedRow?.map(i => data[i]) || [];
                                    console.log('Selected rows:', rows);
                                    setSelectedRowsData(rows);
                                    setSidebarRefreshKey(k => k + 1);
                                    setShowSidebar(true);
                                }
                            }
                        ]
                    },

                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) => {
                                if (hasChillerRequest(row)) {
                                    router.push(`/assetsRequest/view/${row.chiller_request.uuid}`);
                                } else {
                                    showSnackbar("Invalid row data", "error");
                                }
                            },
                        },
                    ],
                    pageSize: 10,
                }}
            />
            {showSidebar && (
                <>
                    {/* Overlay */}
                    <div
                        className="h-full fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setShowSidebar(false)}
                    />

                    {/* Sidebar */}
                    <div className="fixed top-0 right-0 h-full w-1/3 bg-white z-50 shadow-lg transform transition-transform duration-300">

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="text-lg font-semibold">Selected Chiller</h2>
                            <button onClick={() => setShowSidebar(false)}>
                                <Icon icon="lucide:x" width={22} />
                            </button>
                        </div>

                        {/* TABLE INSIDE SIDEBAR */}
                        <div className="p-5">
                            <Table
                                refreshKey={sidebarRefreshKey}
                                data={selectedRowsData && selectedRowsData.length > 0 ? selectedRowsData : []}
                                config={{
                                    columns: [
                                        {
                                            key: "osa_code",
                                            label: "Code",
                                            render: (row: any) =>
                                                row?.chiller_request?.osa_code || row?.osa_code || "-",
                                        },
                                        {
                                            key: "model",
                                            label: "Model Code",
                                            render: (row: any) =>
                                                row?.chiller_request?.model || row?.model || "-",
                                        },
                                    ],
                                    pageSize: 5,
                                    rowSelection: false,
                                    footer: { pagination: false },
                                    header: { title: "", searchBar: false },
                                }}
                            />

                        </div>
                    </div>
                </>
            )}


        </div>
    );
}
