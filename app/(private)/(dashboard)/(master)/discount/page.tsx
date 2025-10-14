"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
    listReturnType,
    TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
    discountList,
    deleteDiscount,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";

// 🔹 API response type
interface Discount {
    uuid?: string;
    id?: string | number;
    osa_code?: string;
    item?: {
        id?: number;
        code?: string;
        name?: string;
    };
    item_category?: { id?: number; category_name?: string; category_code?: string };
    customer_id?: string;
    customer_channel_id?: string;
    discount_type?: {
        id?: number;
        discount_code?: string;
        discount_name?: string;
    };
    discount_value?: string;
    min_quantity?: string;
    min_order_value?: string;
    start_date?: string;
    end_date?: string;
    status?: string | number;
}

// 🔹 Dropdown menu data
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table columns
const columns = [
    { key: "osa_code", label: "Discount Code",
        render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.osa_code}
            </span>
        ),
     },
    {
        key: "item",
        label: "Item",
        render: (data: TableDataType) => {
            const discountObj =
                typeof data.item === "string"
                    ? JSON.parse(data.item)
                    : data.item;
            return discountObj?.name || "-";
        },
    },
    {
        key: "item_category",
        label: "Item Category",
        render: (data: TableDataType) => {
            const discountObj =
                typeof data.item_category === "string"
                    ? JSON.parse(data.item_category)
                    : data.item_category;
            return discountObj?.category_name || "-";
        },
    },
    { key: "customer_id", label: "Customer" },
    { key: "customer_channel_id", label: "Customer Channel" },
    { key: "discount_value", label: "Discount Value" },
    {
        key: "discount_type",
        label: "Discount Type",
        render: (data: TableDataType) => {
            const discountObj =
                typeof data.discount_type === "string"
                    ? JSON.parse(data.discount_type)
                    : data.discount_type;
            return discountObj?.discount_name || "-";
        },
    },
    { key: "min_quantity", label: "Min Quantity" },
    { key: "min_order_value", label: "Min Order Value" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => {
            const statusValue = String(row.status); // normalize to string
            return <StatusBtn isActive={statusValue === "1"} />;
        },
    },
];

const DiscountPage = () => {
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Discount | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    // 🔹 Fetch Discounts
    const fetchDiscounts = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            setLoading(true);
            const result = await discountList({
                page: pageNo.toString(),
                per_page: pageSize.toString(),
            });
            setLoading(false);

            if (result.error) {
                showSnackbar(result.data?.message || "Failed to load discounts ❌", "error");
                throw new Error("Error fetching data");
            } else {
                return {
                    data: result.data as TableDataType[],
                    currentPage: result.pagination?.current_page || 1,
                    pageSize: result.pagination?.per_page || 5,
                    total: result.pagination?.total || 0,
                };
            }
        },
        [showSnackbar, setLoading]
    );

    // 🔹 Handle Delete
    const handleConfirmDelete = async () => {
        if (!selectedRow?.uuid) return;

        const res = await deleteDiscount(String(selectedRow.uuid));
        if (res.error) {
            showSnackbar(res.message || "Failed to delete discount ❌", "error");
        } else {
            showSnackbar("Discount deleted successfully ✅", "success");
            setRefreshKey(refreshKey + 1);
        }

        fetchDiscounts();
        setShowDeletePopup(false);
        setSelectedRow(null);
    };

    return (
        <>
            {/* Table */}
            <div className="h-[calc(100%-60px)]">
                <Table
                refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchDiscounts,
                        },
                        header: {
                            title: "Discount",
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
                                                                    icon={link.icon}
                                                                    width={link.iconWidth}
                                                                    className="text-[#717680]"
                                                                />
                                                                <span className="text-[#181D27] font-[500] text-[16px]">
                                                                    {link.label}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </CustomDropdown>
                                            </div>
                                        }
                                    />
                                </div>,
                            ],
                            searchBar: true,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/discount/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Discount"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        localStorageKey: "discount-table",
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/discount/details/${data.uuid}`);
                },
              },
                            {
                                icon: "lucide:edit-2",
                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    router.push(
                                        `/discount/${r.uuid}`
                                    );
                                },
                            },
                            // {
                            //     icon: "lucide:trash-2",
                            //     onClick: (row: object) => {
                            //         const r = row as TableDataType;
                            //         setSelectedRow({ uuid: r.uuid });
                            //         setShowDeletePopup(true);
                            //     },
                            // },
                        ],
                        pageSize: 5,
                    }}
                />
            </div>

            {/* Delete Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="Delete Discount"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
};

export default DiscountPage;
