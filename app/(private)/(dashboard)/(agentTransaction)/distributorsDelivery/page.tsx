"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { agentDeliveryExport, agentOrderExport, deliveryList } from "@/app/services/agentTransaction";
import StatusBtn from "@/app/components/statusBtn2";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { downloadFile } from "@/app/services/allApi";
import { formatWithPattern } from "@/app/(private)/utils/date";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import FilterComponent from "@/app/components/filterComponent";
import ApprovalStatus from "@/app/components/approvalStatus";

// const dropdownDataList = [
//     // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//     // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//     // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//     { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//     { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

// 🔹 Table Columns
const columns = [
    {
        key: "delivery_date",
        label: "Delivery Date",
        // showByDefault: true,
        render: (row: TableDataType) => {
            if (!row.delivery_date) return "-";
            const date = new Date(row.delivery_date as string);
            return formatWithPattern(new Date(row.delivery_date), "DD MMM YYYY", "en-GB").toLowerCase() || "-";
        }
    },
    { key: "delivery_code", label: "Delivery Code", showByDefault: true },
    // { key: "order_code", label: "Order Code",showByDefault: true },
    {
        key: "customer",
        label: "Customer",
        showByDefault: true,
        render: (row: TableDataType) => {
            const customer = typeof row.customer === "string" ? { code: "", name: row.customer } : (row.customer ?? {});
            const code = customer.code ?? "";
            const name = customer.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "route",
        label: "Route",
        showByDefault: true,
        render: (row: TableDataType) => {
            const route = typeof row.route === "string" ? { code: "", name: row.route } : (row.route ?? {});
            const code = route.code ?? "";
            const name = route.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "warehouse",
        label: "Distributor",
        showByDefault: true,
        render: (row: TableDataType) => {
            const warehouse = typeof row.warehouse === "string" ? { code: "", name: row.warehouse } : (row.warehouse ?? {});
            const code = warehouse.code ?? "";
            const name = warehouse.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "salesman",
        label: "Sales Team",
        showByDefault: true,
        render: (row: TableDataType) => {
            const salesman = typeof row.salesman === "string" ? { code: "", name: row.salesman } : (row.salesman ?? {});
            const code = salesman.code ?? "";
            const name = salesman.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    // { key: "Invoice_type", label: "Invoice Type" },
    // { key: "Invoice_no", label: "Invoice No" },
    // { key: "sap_id", label: "SAP ID" },
    // { key: "sap_status", label: "SAP Status" },
    { key: "total", label: "Amount", showByDefault: true, render: (row: TableDataType) => toInternationalNumber(Number(row.total) || 0) },
    {
        key: "approval_status",
        label: "Approval Status",
        showByDefault: true,
        render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
    },
    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => {
            // Treat status 1 or 'active' (case-insensitive) as active
            const isActive =
                String(row.status) === "1" ||
                (typeof row.status === "string" &&
                    row.status.toLowerCase() === "active");
            return <StatusBtn isActive={isActive} />;
        },
        showByDefault: true,
    },
];

export default function CustomerInvoicePage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const { customerSubCategoryOptions, companyOptions, salesmanOptions, agentCustomerOptions, channelOptions, warehouseAllOptions, routeOptions, regionOptions, areaOptions , ensureAgentCustomerLoaded, ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded} = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAgentCustomerLoaded();
    ensureAreaLoaded();
    ensureChannelLoaded();
    ensureCompanyLoaded();
    ensureCustomerSubCategoryLoaded();
    ensureRegionLoaded();
    ensureRouteLoaded();
    ensureSalesmanLoaded();
    ensureWarehouseAllLoaded();
  }, [ensureAgentCustomerLoaded, ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded]);

    const fetchDelivery = useCallback(async (
        page: number = 1,
        pageSize: number = 10
    ): Promise<listReturnType> => {
        try {
            setLoading(true);
            const result = await deliveryList({
                page: page.toString(),
                per_page: pageSize.toString(),
            });

            return {
                data: Array.isArray(result.data) ? result.data : [],
                total: result?.pagination?.totalPages || 1,
                currentPage: result?.pagination?.page || 1,
                pageSize: result?.pagination?.limit || pageSize,
            };
        } catch (error) {
            console.error(error);
            showSnackbar("Failed to fetch invoices", "error");
            return {
                data: [],
                total: 1,
                currentPage: 1,
                pageSize: pageSize,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading, showSnackbar]);

    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number
        ): Promise<listReturnType> => {
            let result;
            setLoading(true);
            try {
                const params: Record<string, string> = { per_page: pageSize.toString() };
                Object.keys(payload || {}).forEach((k) => {
                    const v = payload[k as keyof typeof payload];
                    if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                        params[k] = String(v);
                    }
                });
                result = await deliveryList(params);
            } finally {
                setLoading(false);
            }

            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination = result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination?.last_page || 1,
                    totalRecords: pagination?.total || 0,
                    currentPage: pagination?.current_page || 1,
                    pageSize: pagination?.per_page || pageSize,
                };
            }
        },
        [setLoading]
    );

    const exportFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await agentDeliveryExport({ format });
            if (response && typeof response === 'object' && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } catch (error) {
            showSnackbar("Failed to download warehouse data", "error");
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } finally {
        }
    };

    const downloadPdf = async (uuid: string) => {
        try {
            setLoading(true);
            const response = await agentDeliveryExport({ uuid: uuid, format: "pdf" });
            if (response && typeof response === 'object' && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            showSnackbar("Failed to download file", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [customerSubCategoryOptions, routeOptions, warehouseAllOptions, channelOptions, companyOptions, salesmanOptions, agentCustomerOptions, regionOptions, areaOptions]);

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchDelivery, filterBy: filterBy },
                    header: {
                        title: "Distributor's Delivery",
                        columnFilter: true,
                        searchBar: false,
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
                        ],
                        actions: [
                            // <SidebarBtn
                            //     key={0}
                            //     href="#"
                            //     isActive
                            //     leadingIcon="mdi:download"
                            //     label="Download"
                            //     labelTw="hidden lg:block"
                            //     onClick={exportFile}
                            // />,
                            <SidebarBtn
                                key={1}
                                href="/distributorsDelivery/add"
                                isActive
                                leadingIcon="mdi:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                            />
                        ],
                        filterRenderer: FilterComponent,
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) =>
                                router.push(
                                    `/distributorsDelivery/details/${row.uuid}`
                                ),
                        },
                        {
                            icon: "lucide:download",
                            onClick: (row: TableDataType) =>
                                downloadPdf(row.uuid),
                        },
                        // {
                        //     icon: "lucide:edit-2",
                        //     onClick: (row: TableDataType) =>
                        //         router.push(
                        //             `/distributorsDelivery/${row.uuid}`
                        //         ),
                        // },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
