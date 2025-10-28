"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    promotionHeaderList,
    deletePricingHeader,
    pricingDetailGlobalSearch,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; 
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
    // { key: "code", label: "Promotion Code" },
    { key: "promotion_name", label: "Name" },
    // { key: "description", label: "Description" },
    { key: "from_date", label: "From Date" },
    { key: "to_date", label: "To Date" },
  
    {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={row.status ? true : false} />
            ),
        },
];

export default function Pricing() {
    interface PricingItem {

        uuid?: string;
        id?: number | string;
        ose_code?: string;
        country_name?: string;
        currency?: string;
    }

    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<PricingItem | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar(); 
    type TableRow = TableDataType & { uuid?: string };

    const fetchCountries = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            try {
              setLoading(true);
                const listRes = await promotionHeaderList({
                    // limit: pageSize.toString(),
                    limit: pageSize.toString(),
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

    const searchCountries = useCallback(
        async (
            searchQuery: string,
            pageSize: number
        ): Promise<searchReturnType> => {
            setLoading(true);
            const result = await pricingDetailGlobalSearch({
                query: searchQuery,
                per_page: pageSize.toString(),
            });
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

    const handleConfirmDelete = async () => {
        if (!selectedRow) return;

        if (!selectedRow?.uuid) throw new Error("Missing id");
        const res = await deletePricingHeader(String(selectedRow.uuid));
        if (res.error)
            return showSnackbar(
                res.data.message || "Failed to delete Promotion",
                "error"
            );
        else {
            showSnackbar("Promotion deleted successfully ", "success");
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
                            list: fetchCountries,
                            search: searchCountries,
                        },
                        header: {
                            title: "Promotion",
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
                                    href="/promotion/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Promotion"
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
                                onClick: (row: object) => {
                                    const r = row as TableDataType & { uuid?: string };
                                    // Always open the edit page (use uuid if present, fallback to id)
                                    const targetId = String(r.uuid ?? (r as any).id ?? "");
                                    if (!targetId) return;
                                    router.push(`/promotion/${encodeURIComponent(targetId)}`);
                                },
                            },
                        ],
                        pageSize: 50,
                    }}
                />
            </div>

            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Promotion"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}