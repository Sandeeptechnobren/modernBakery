"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import Table, {
    configType,
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { agentCustomerList, agentCustomerStatusUpdate, exportAgentCustomerData, downloadFile, agentCustomerGlobalSearch } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import InputFields from "@/app/components/inputFields";

export default function AgentCustomer() {
    const { customerSubCategoryOptions, itemCategoryOptions, channelOptions, warehouseOptions, routeOptions } = useAllDropdownListData();
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
    const [warehouseId, setWarehouseId] = useState<string>("");
    const [channelId, setChannelId] = useState<string>("");
    const [routeId, setRouteId] = useState<string>("");
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
            key: "customer_type",
            label: "Customer Type",
            render: (row: TableDataType) => {
                if (
                    typeof row.customer_type === "object" &&
                    row.customer_type !== null &&
                    "name" in row.customer_type
                ) {
                    return (row.customer_type as { name?: string }).name || "-";
                }
                return row.customer_type || "-";
            },
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
            showByDefault: true
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
        { key: "payment_type", label: "Payment Type" },
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

    const { setLoading } = useLoading();
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    type TableRow = TableDataType & { id?: string };

    const fetchAgentCustomers = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            try {
                setLoading(true);
                const params: Record<string, string> = {
                    page: page.toString(),
                };
                if (selectedSubCategoryId) {
                    params.subcategory_id = String(selectedSubCategoryId);
                }
                if (warehouseId) {
                    params.warehouse = String(warehouseId);
                }
                if (channelId) {
                    params.outlet_channel_id = String(channelId);
                }
                if (routeId) {
                    params.route_id = String(routeId);
                }
                const listRes = await agentCustomerList(params);
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
        [selectedSubCategoryId, warehouseId, channelId, routeId, setLoading]
    );

    const exportfile = async (ids: string[] | undefined) => {
        if (!ids) return;
        try {
            const response = await exportAgentCustomerData({
                ids: ids
            });
            if (response && typeof response === 'object' && response.url) {
                await downloadFile(response.url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            showSnackbar("Failed to download warehouse data", "error");
        } finally {
        }
    }

    const handleStatusChange = async (ids: (string | number)[] | undefined, status: number) => {
        if (!ids || ids.length === 0) return;
        const res = await agentCustomerStatusUpdate({
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
        ): Promise<listReturnType> => {
            let result;
            setLoading(true);
            if (columnName) {
                result = await agentCustomerList({
                    per_page: pageSize.toString(),
                    [columnName]: searchQuery
                });
            }
            else {
                result = await agentCustomerGlobalSearch({
                    per_page: pageSize.toString(),
                    query: searchQuery
                });
            }
            setLoading(false);
            if (result.error) throw new Error(result.data.message);
            else {
                if (columnName) {
                    return {
                        data: result.data || [],
                        total: result.pagination.pagination.totalPages || 0,
                        currentPage: result.pagination.pagination.current_page || 0,
                        pageSize: result.pagination.pagination.limit || pageSize,
                    };
                }
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
        setRefreshKey((k) => k + 1);
    }, [customerSubCategoryOptions, routeOptions, warehouseOptions, channelOptions, selectedSubCategoryId, warehouseId, channelId, routeId]);

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchAgentCustomers,
                            search: search
                        },
                        header: {
                            title: "Agent Customer",
                            threeDot: [
                                {
                                    icon: "gala:file-document",
                                    label: "Export CSV",
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const ids = selectedRow?.map((id) => {
                                            return data[id].id;
                                        })
                                        exportfile(ids);
                                    }
                                },
                                {
                                    icon: "gala:file-document",
                                    label: "Export Excel",
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const ids = selectedRow?.map((id) => {
                                            return data[id].id;
                                        })
                                        exportfile(ids);
                                    }
                                },
                                {
                                    icon: "lucide:radio",
                                    label: "Inactive",
                                    // showOnSelect: true,
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
                                    // showOnSelect: true,
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
                                        handleStatusChange(ids, Number(1));
                                    },
                                },
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/agentCustomer/new"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        localStorageKey: "agentCustomer-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(`/agentCustomer/details/${row.uuid}`);
                                },
                            },
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(
                                        `/agentCustomer/${row.uuid}`
                                    );
                                },
                            },
                        ],
                        pageSize: 50,
                    }}
                />
            </div>
        </>
    );
}
