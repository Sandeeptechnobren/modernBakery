"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import Table, {
    configType,
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import { downloadFile } from "@/app/services/allApi";
import { newCustomerList, newCustomerStatusUpdate, exportNewCustomer } from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function NewCustomer() {
    const { customerSubCategoryOptions, channelOptions, warehouseOptions, routeOptions } = useAllDropdownListData();
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
    const [warehouseId, setWarehouseId] = useState<string>("");
    const [channelId, setChannelId] = useState<string>("");
    const [routeId, setRouteId] = useState<string>("");
    const [approvalStatus, setApprovalStatus] = useState<string>("");
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const columns: configType["columns"] = [
        {
            key: "osa_code",
            label: "Outlet Code",
            render: (row: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.osa_code || "-"}
                </span>
            ),
            showByDefault: true,
        },
        { key: "outlet_name", label: "Outlet Name", showByDefault: true },
        { key: "owner_name", label: "Owner Name" },
        {
            key: "customertype",
            label: "Customer Type",
            render: (row: TableDataType) =>
                typeof row.customertype === "object" &&
                    row.customertype !== null &&
                    "route_name" in row.customertype
                    ? (row.customertype as { route_name?: string }).route_name || "-"
                    : "-",
        },
        {
            key: "category",
            label: "Customer Category",
            render: (row: TableDataType) =>
                typeof row.category === "object" &&
                    row.category !== null &&
                    "customer_category_name" in row.category
                    ? (row.category as { customer_category_name?: string })
                        .customer_category_name || "-"
                    : "-",
        },
        {
            key: "subcategory",
            label: "Customer Sub Category",
            render: (row: TableDataType) =>
                typeof row.subcategory === "object" &&
                    row.subcategory !== null &&
                    "customer_sub_category_name" in row.subcategory
                    ? (row.subcategory as { customer_sub_category_name?: string })
                        .customer_sub_category_name || "-"
                    : "-",
            filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(customerSubCategoryOptions) ? customerSubCategoryOptions : [], // [{ value, label }]
                onSelect: (selected) => {
                    setSelectedSubCategoryId((prev) => prev === selected ? "" : (selected as string));
                },
                selectedValue: selectedSubCategoryId,
            },
            showByDefault: true,
        },
        {
            key: "outlet_channel",
            label: "Outlet Channel",
            render: (row: TableDataType) =>
                typeof row.outlet_channel === "object" &&
                    row.outlet_channel !== null &&
                    "outlet_channel" in row.outlet_channel
                    ? (row.outlet_channel as { outlet_channel?: string })
                        .outlet_channel || "-"
                    : "-",
            filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(channelOptions) ? channelOptions : [], // [{ value, label }]
                onSelect: (selected) => {
                    setChannelId((prev) => prev === selected ? "" : (selected as string));
                },
                selectedValue: channelId,
            },

            showByDefault: true,
        },
        { key: "landmark", label: "Landmark" },
        { key: "district", label: "District" },
        { key: "street", label: "Street" },
        { key: "town", label: "Town" },
        {
            key: "getWarehouse",
            label: "Warehouse",
            render: (row: TableDataType) =>
                typeof row.getWarehouse === "object" &&
                    row.getWarehouse !== null &&
                    "warehouse_name" in row.getWarehouse
                    ? (row.getWarehouse as { warehouse_name?: string })
                        .warehouse_name || "-"
                    : "-",
            filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(warehouseOptions) ? warehouseOptions : [], // [{ value, label }]
                onSelect: (selected) => {
                    setWarehouseId((prev) => prev === selected ? "" : (selected as string));
                },
                selectedValue: warehouseId,
            },

            showByDefault: true,
        },
        {
            key: "route",
            label: "Route",
            render: (row: TableDataType) => {
                if (
                    typeof row.route === "object" &&
                    row.route !== null &&
                    "route_name" in row.route
                ) {
                    return (row.route as { route_name?: string }).route_name || "-";
                }
                return typeof row.route === 'string' ? row.route : "-";
            },
            filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(routeOptions) ? routeOptions : [],
                onSelect: (selected) => {
                    setRouteId((prev) => prev === selected ? "" : (selected as string));
                },
                selectedValue: routeId,
            },

            showByDefault: true,
        },
        { key: "contact_no", label: "Contact No." },



        { key: "whatsapp_no", label: "Whatsapp No." },
        { key: "buyertype", label: "Buyer Type", render: (row: TableDataType) => (row.buyertype === "0" ? "B2B" : "B2C") },

        {
            key: "customer",
            label: "Customer",
            render: (row: TableDataType) =>
                typeof row.customer === "object" &&
                    row.customer !== null &&
                    "route_name" in row.customer
                    ? (row.customer as { route_name?: string }).route_name || "-"
                    : "-",
        },
        {
            key: "payment_type",
            label: "Payment Type",
            render: (row: TableDataType) => {
                const paymentTypes: Record<string, string> = {
                    "1": "Cash",
                    "2": "Credit",
                    "3": "bill Tobill", // add more if needed
                };
                return paymentTypes[String(row.payment_type)] || "-";
            },
        },

        //   { key: "reject_reason", label: "Reject Reason" },
        {
            key: "approval_status",
            label: "Approval Status",
            render: (row) => {
                const value = String(row.approval_status);

                const statusMap: Record<string, { label: string; color: string }> = {
                    "1": { label: "Approved", color: "bg-green-100 text-green-700" },
                    "2": { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
                    "3": { label: "Rejected", color: "bg-red-100 text-red-700" }
                };

                const status = statusMap[value];

                if (!status) return "-";

                return (
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}
                    >
                        {status.label}
                    </span>
                );
            },
            filter: {
                isFilterable: true,
                width: 320,
                options: [
                    { value: "1", label: "Approved" },
                    { value: "2", label: "Pending" },
                    { value: "3", label: "Rejected" }
                ],
                onSelect: (selected) => {
                    setApprovalStatus((prev) => prev === selected ? "" : (selected as string));
                },
                selectedValue: approvalStatus,
            },
            showByDefault: true,
        },
    ];

    const { setLoading } = useLoading();
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    type TableRow = TableDataType & { id?: string };

    const fetchNewCustomers = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            try {
                setLoading(true);
                const params: any = {
                    page: page.toString(),
                };
                if (selectedSubCategoryId) {
                    params.subcategory_id = selectedSubCategoryId;
                }
                if (warehouseId) {
                    params.warehouse = warehouseId;
                }
                if (channelId) {
                    params.outlet_channel_id = channelId;
                }
                if (routeId) {
                    params.route_id = routeId;
                }
                if (approvalStatus) {
                    params.approval_status = approvalStatus;
                }
                const listRes = await newCustomerList(params);
                setLoading(false);
                return {
                    data: Array.isArray(listRes.data) ? listRes.data : [],
                    total: listRes?.pagination?.totalPages || 1,
                    currentPage: listRes?.pagination?.page || 1,
                    pageSize: listRes?.pagination?.limit || pageSize,
                };
            } catch (error: unknown) {
                setLoading(false);
                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize: 5,
                };
            }
        },
        [selectedSubCategoryId, warehouseId, channelId, routeId, approvalStatus, setLoading]
    );

    //  const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
    //               try {
    //                 const response = await exportNewCustomer(    ); 
    //                 if (response && typeof response === 'object' && response.download_url) {
    //                  await downloadFile(response.download_url);
    //                   showSnackbar("File downloaded successfully ", "success");
    //                 } else {
    //                   showSnackbar("Failed to get download URL", "error");
    //                 }
    //               } catch (error) {
    //                 showSnackbar("Failed to download warehouse data", "error");
    //               } finally {
    //               }
    //             };


    const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
        try {
            // setLoading(true);
            // Pass selected format to the export API
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportNewCustomer({ format });
            const url = response?.download_url || response?.url || response?.data?.url;
            if (url) {
                await downloadFile(url);
                showSnackbar("File downloaded successfully", "success");
            } else {
                showSnackbar("Failed to get download file", "error");
            }
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } catch (error) {
            console.error("Export failed:", error);
            showSnackbar("Failed to download invoices", "error");
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } finally {
            // setLoading(false);
        }
    };


    const handleStatusChange = async (ids: (string | number)[] | undefined, status: number) => {
        if (!ids || ids.length === 0) return;
        const res = await newCustomerStatusUpdate({
            ids: ids,
            status: Number(status)
        });

        if (res.error) {
            showSnackbar(res.data.message || "Failed to update status", "error");
            throw new Error(res.data.message);
        }
        setRefreshKey(refreshKey + 1);
        showSnackbar("Status updated successfully", "success");
        return res;
    }

    const search = useCallback(
        async (
            searchQuery: string,
            pageSize: number,
            columnName?: string
        ): Promise<searchReturnType> => {
            let result;
            setLoading(true);
            if (columnName) {
                result = await newCustomerList({
                    per_page: pageSize.toString(),
                    [columnName]: searchQuery
                });
            }
            // result = await agentCustomer({
            //     query: searchQuery,
            //     per_page: pageSize.toString(),
            // });
            setLoading(false);
            if (result.error) throw new Error(result.data.message);
            else {
                return {
                    data: result.data || [],
                    total: result.pagination.pagination.totalPages || 0,
                    currentPage: result.pagination.pagination.current_page || 0,
                    pageSize: result.pagination.pagination.limit || pageSize,
                };
            }
        },
        []
    );

    useEffect(() => {
        setLoading(true);
    }, []);

    // Refresh table when subcategory filter changes
    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [customerSubCategoryOptions, routeOptions, warehouseOptions, channelOptions, selectedSubCategoryId, warehouseId, channelId, routeId, approvalStatus]);

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchNewCustomers,
                            search: search,
                        },
                        header: {
                            title: "Approval Customers",
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
                                },],

                            searchBar: false,
                            columnFilter: true,
                            // actions: [
                            //     <SidebarBtn
                            //         key={0}
                            //         href="/newCustomer/new"
                            //         isActive
                            //         leadingIcon="lucide:plus"
                            //         label="Add"
                            //         labelTw="hidden sm:block"
                            //     />,
                            // ],
                        },
                        localStorageKey: "newCustomer-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(`/newCustomer/details/${row.uuid}`);
                                },
                            },
                            // {
                            //     icon: "lucide:edit-2",
                            //     onClick: (data: object) => {
                            //         const row = data as TableRow;
                            //         router.push(
                            //             `/newCustomer/${row.uuid}`
                            //         );
                            //     },
                            // },
                            // {
                            //     icon: "lucide:edit-2",
                            //     onClick: (data: object) => {
                            //         const row = data as TableRow;
                            //         router.push(
                            //             `/newCustomer/${row.uuid}`
                            //         );
                            //     },
                            // },
                        ],
                        pageSize: 50,
                    }}
                />
            </div>

            {/* {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Agent Customer"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )} */}
        </>
    );
}
