"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    agentCustomerList,
    deleteAgentCustomer,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar
import { useLoading } from "@/app/services/loadingContext";

interface DropdownItem {
    icon: string;
    label: string;
    iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
    // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
    { key: "osa_code", label: "Agent Customer Code", render: (row: TableDataType) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.osa_code || "-"}</span>) },
    { key: "tin_no", label: "TIN No." },
    { key: "name", label: "Name" },
    { key: "business_name", label: "Business Name" },
    { 
        key: "customer_type", 
        label: "Customer Type",
    },
    { 
        key: "category", 
        label: "Customer Category",
        render: (row: TableDataType) => 
            typeof row.category === "object" && row.category !== null && "customer_category_name" in row.category
                ? (row.category as { customer_category_name?: string }).customer_category_name || '-'
                : '-'
    },
    { 
        key: "subcategory", 
        label: "Customer Sub Category",
        render: (row: TableDataType) => 
            typeof row.subcategory === "object" && row.subcategory !== null && "customer_sub_category_name" in row.subcategory
                ? (row.subcategory as { customer_sub_category_name?: string }).customer_sub_category_name || '-'
                : '-'
    },
    { 
        key: "outlet_channel", 
        label: "Outlet Channel",
        render: (row: TableDataType) => 
            typeof row.outlet_channel === "object" && row.outlet_channel !== null && "outlet_channel" in row.outlet_channel
                ? (row.outlet_channel as { outlet_channel?: string }).outlet_channel || '-'
                : '-'
    },
    { 
        key: "region", 
        label: "Region",
        render: (row: TableDataType) => 
            typeof row.region === "object" && row.region !== null && "region_name" in row.region
                ? (row.region as { region_name?: string }).region_name || '-'
                : '-'
    },
    { 
        key: "area", 
        label: "Area",
        render: (row: TableDataType) => 
            typeof row.area === "object" && row.area !== null && "area_name" in row.area
                ? (row.area as { area_name?: string }).area_name || '-'
                : '-'
    },
    { 
        key: "route_id", 
        label: "Route",
    },
    { key: "email", label: "Email" },
    { key: "whatsapp_no", label: "Whatsapp No." },
    { key: "buyertype", label: "Buyer Type" },
    { key: "payment_type", label: "Payment Type" },
    { key: "creditday", label: "Credit Day" },
    { key: "longitude", label: "Longitude" },
    { key: "latitude", label: "Latitude" },
    { key: "accuracy", label: "Accuracy" },
    { key: "threshold_radius", label: "Threshold Radius" },
    { key: "language", label: "Language" },
    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => {
            // Treat status 1 or 'active' (case-insensitive) as active
            const isActive = String(row.status) === "1" || (typeof row.status === "string" && row.status.toLowerCase() === "active");
            return <StatusBtn isActive={isActive} />;
        },
    },
];

export default function AgentCustomer() {
    interface AgentCustomer {
        uuid?: number | string;
        id?: number | string;
        country_code?: string;
        country_name?: string;
        currency?: string;
    }

    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<AgentCustomer | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar(); // ✅ snackbar hook
    type TableRow = TableDataType & { id?: string };

    const fetchAgentCustomers = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            try {
              setLoading(true);
                const listRes = await agentCustomerList({
                    // limit: pageSize.toString(),
                    // page: page.toString(),
                });
                setLoading(false);
                return {
                    data: listRes.data || [],
                    total: listRes.pagination.totalPages ,
                    currentPage: listRes.pagination.page ,
                    pageSize: listRes.pagination.limit ,
                };
            } catch (error: unknown) {
                console.error("API Error:", error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    // const searchCountries = useCallback(
    //     async (
    //         searchQuery: string,
    //         pageSize: number
    //     ): Promise<searchReturnType> => {
    //         setLoading(true);
    //         const result = await countryListGlobalSearch({
    //             query: searchQuery,
    //             per_page: pageSize.toString(),
    //         });
    //         setLoading(false);
    //         if (result.error) throw new Error(result.data.message);
    //         else {
    //             return {
    //                 data: result.data || [],
    //                 total: result.pagination.pagination.totalPages || 0,
    //                 currentPage: result.pagination.pagination.current_page || 0,
    //                 pageSize: result.pagination.pagination.limit || pageSize,
    //             };
    //         }
    //     },
    //     []
    // );

    const handleConfirmDelete = async () => {
        if (!selectedRow) return;

        if (!selectedRow?.uuid) throw new Error("Missing id");
        const res = await deleteAgentCustomer(String(selectedRow.uuid));
        if (res.error)
            return showSnackbar(
                res.data.message || "Failed to delete Agent Customer",
                "error"
            );
        else {
            showSnackbar("Agent Customer deleted successfully ", "success");
            setRefreshKey(refreshKey + 1);
        }
        setLoading(false);
        setShowDeletePopup(false);
        setSelectedRow(null);
    };

    useEffect(() => {
        setLoading(true);
    }, []);

    return (
        <>
            <div className="h-[calc(100%-60px)] pb-[22px]">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchAgentCustomers,
                        },
                        header: {
                            title: "Agent Customer",
                            wholeTableActions: [
                                <div key={0} className="flex gap-[12px] relative">
                                    <DismissibleDropdown
                                        isOpen={showDropdown}
                                        setIsOpen={setShowDropdown}
                                        button={
                                            <BorderIconButton icon="ic:sharp-more-vert" />
                                        }
                                        dropdown={
                                            <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                                <CustomDropdown>
                                                    {dropdownDataList.map(
                                                        (link, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                                            >
                                                                <Icon
                                                                    icon={
                                                                        link.icon
                                                                    }
                                                                    width={
                                                                        link.iconWidth
                                                                    }
                                                                    className="text-[#717680]"
                                                                />
                                                                <span className="text-[#181D27] font-[500] text-[16px]">
                                                                    {
                                                                        link.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </CustomDropdown>
                                            </div>
                                        }
                                    />
                                </div>
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/dashboard/master/agentCustomer/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Agent Customer"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    router.push(
                                        `/dashboard/master/agentCustomer/update/${row.uuid}`
                                    );
                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    setSelectedRow({ uuid: row.uuid });
                                    setShowDeletePopup(true);
                                },
                            },
                        ],
                        pageSize: 5,
                    }}
                />
            </div>

            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Agent Customer"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}