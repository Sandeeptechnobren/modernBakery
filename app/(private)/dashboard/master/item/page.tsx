"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    TableDataType as ImportedTableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    itemList,
    deleteItem,
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

interface LocalTableDataType {
    [key: string]: string | number | object | null | undefined;
    category?: { category_name?: string } | string | null;
    sub_category?: { sub_category_name?: string } | string | null;
}

const dropdownDataList: DropdownItem[] = [
    // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
    { 
        key: "code", 
        label: "Item Code",
        render: (row: LocalTableDataType) => {
            const value = row.code;
            let displayValue: string | number = "-";
            if (typeof value === "string" || typeof value === "number") {
                displayValue = value;
            }
            return (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {displayValue}
                </span>
            );
        }
    },
    { 
        key: "sap_id", 
        label: "SAP Id", 
        render: (row: LocalTableDataType) => {
            const value = row.sap_id;
            let displayValue: string | number = "-";
            if (typeof value === "string" || typeof value === "number") {
                displayValue = value;
            }
            return (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {displayValue}
                </span>
            );
        } 
    },
    { key: "name", label: "Item Name" },
    { key: "description", label: "Description" },
    { key: "community_code", label: "Community Code" },
    { key: "excise_code", label: "Excise Code" },
    { 
        key: "category", 
        label: "Item Category",
        render: (data: LocalTableDataType) => {
            if (typeof data.category === "object" && data.category !== null && "category_name" in data.category) {
                return data.category.category_name?.toString() || "-";
            }
            return typeof data.category === "string" ? data.category : "-";
        }
    },
    { key: "sub_category", label: "Item Sub Category",
         render: (data: LocalTableDataType) => {
            if (typeof data.sub_category === "object" && data.sub_category !== null && "sub_category_name" in data.sub_category) {
                return data.sub_category.sub_category_name?.toString() || "-";
            }
            return typeof data.sub_category === "string" ? data.sub_category : "-";
        }
     },
        { 
            key: "uom", 
            label: "UOM",
            render: (data: LocalTableDataType) => {
                const uomMap: Record<string, string> = {
                    "1": "BAG",
                    "2": "PKT",
                    "3": "BOX",
                    "4": "POUCH",
                    "5": "PCH",
                    "6": "TIN",
                    "7": "NUM",
                    "8": "CTN",
                    "9": "BOT"
                };
                const value = data.uom !== undefined && data.uom !== null ? data.uom.toString() : "";
                return value && uomMap[value] ? uomMap[value] : value || "-";
            }
        },
    { key: "upc", label: "UPC" },
    { key: "vat", label: "Vat" },
    { key: "excies", label: "Excise" },
    { key: "shelf_life", label: "Shelf Life" },
    {
        key: "status",
        label: "Status",
        render: (row: LocalTableDataType) => {
            // Treat status 1 or 'active' (case-insensitive) as active
            const isActive = String(row.status) === "1" || (typeof row.status === "string" && row.status.toLowerCase() === "active");
            return <StatusBtn isActive={isActive} />;
        },
    },
];

export default function Item() {
    interface Item {
        id?: number | string;
        country_code?: string;
        country_name?: string;
        currency?: string;
    }

    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Item | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar(); // ✅ snackbar hook
    type TableRow = LocalTableDataType & { id?: string };

    const fetchItems = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            try {
              setLoading(true);
                const listRes = await itemList({
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

        if (!selectedRow?.id) throw new Error("Missing id");
        const res = await deleteItem(String(selectedRow.id));
        if (res.error)
            return showSnackbar(
                res.data.message || "Failed to delete Item",
                "error"
            );
        else {
            showSnackbar("Item deleted successfully ", "success");
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
                            list: fetchItems,
                        },
                        header: {
                            title: "Item",
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
                                    href="/dashboard/master/item/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Item"
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
                                        `/dashboard/master/item/edit/${row.id}`
                                    );
                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (data: object) => {
                                    const row = data as TableRow;
                                    setSelectedRow({ id: row.id });
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
                        title="Item"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}