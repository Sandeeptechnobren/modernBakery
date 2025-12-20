"use client";

import { useState, useCallback, useEffect } from "react";
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
    updateDiscountStatus,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

// 🔹 API response type
interface Discount {
    uuid?: string;
    id?: string | number;
    discount_name?: string;
    discount_apply_on?: string;
    discount_type?: string;
    bundle_combination?: string;
    status?: string | number;
    from_date?: string;
    to_date?: string;
    sales_team_type?: string[];
    project_list?: string[];
    items?: any[];
    item_category?: any[];
    location?: string[];
    customer?: string[];
    header?: {
        headerMinAmount?: string | null;
        headerRate?: string | null;
    };
    discount_details?: any[];
    key?: {
        Location?: string[];
        Customer?: string[];
        Item?: string[];
    };
}

// 🔹 Dropdown menu data
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table columns
const columns = [
    {
        key: "discount_name",
        label: "Discount Name",
    },
    { key: "from_date", label: "Start Date" },
    { key: "to_date", label: "End Date" },
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
    const { can, permissions } = usePagePermissions();
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Discount | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    // 🔹 Fetch Discounts
    const fetchDiscounts = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50
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
                    pageSize: result.pagination?.per_page || 50,
                    total: result.pagination?.total || 0,
                };
            }
        },
        [showSnackbar, setLoading]
    );

    const handleStatusChange = async (
                data: TableDataType[],
                selectedRow: number[] | undefined,
                status: "0" | "1"
              ) => {
                if (!selectedRow || selectedRow.length === 0) {
                  showSnackbar("Please select at least one salesman", "error");
                  return;
                }
              
                const selectedItem = data.filter((_, index) =>
                  selectedRow.includes(index)
                );
                // console.log(data, selectedRow)
              
                const failedUpdates: string[] = [];
              
                const selectedRowsData: string[] = data.filter((value, index)=> selectedRow?.includes(index)).map((item) => item.id);
                try {
                  setLoading(true);
                 
                      const res = await updateDiscountStatus({id: selectedRowsData, status});
                  
                  if (failedUpdates.length > 0) {
                    showSnackbar(
                      `Failed to update status for: ${failedUpdates.join(", ")}`,
                      "error"
                    );
                  } else {
               setRefreshKey((k) => k + 1);
                    showSnackbar("Status updated successfully", "success");
                    // fetchItems();
                  }
              
                } catch (error) {
                  console.error("Status update error:", error);
                  showSnackbar("An error occurred while updating status", "error");
                } finally {
                  setLoading(false);
                  setShowDropdown(false);
                }
              };

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
            <div className="h-full">
                <Table
                refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchDiscounts,
                        },
                        header: {
                            title: "Discount",
                             threeDot: [
                // {
                //   icon: "gala:file-document",
                //   label: "Export CSV",
                //   onClick: (data: TableDataType[], selectedRow?: number[]) => {
                //     handleExport("csv")
                //   },
                // },
                // {
                //   icon: "gala:file-document",
                //   label: "Export Excel",
                //   onClick: (data: TableDataType[], selectedRow?: number[]) => {
                //     handleExport("xlsx")
                //   },
                // },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  showOnSelect: true,
                 onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleStatusChange(data, selectedRow, "0");
                },
              }
              ],
                            searchBar: true,
                            columnFilter: true,
                            actions: can("create") ? [
                                <SidebarBtn
                                    key={0}
                                    href="/discount/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                            ] : [],
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
                            ...(can("edit") ? [{
                                icon: "lucide:edit-2",
                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    router.push(
                                        `/discount/${r.uuid}`
                                    );
                                },
                            }] : []),
                            // {
                            //     icon: "lucide:trash-2",
                            //     onClick: (row: object) => {
                            //         const r = row as TableDataType;
                            //         setSelectedRow({ uuid: r.uuid });
                            //         setShowDeletePopup(true);
                            //     },
                            // },
                        ],
                        pageSize: 50,
                        table: {
                            height: 500,
                        },
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
