"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { customer } from "@/app/(private)/data/customerDetails";
import { image } from "framer-motion/client";
import { deletePlanogramImage, planogramImageList } from "@/app/services/merchandiserApi";
import { useLoading } from "@/app/services/loadingContext";

interface PlanogramImageItem {
    id: string;
    customer: string;
    merchandiser: string;
    shelf: string;
    image: string;
}
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function PlanogramImage() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const {setLoading} = useLoading();

    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const handleConfirmDelete = async () => {
        if (selectedRowId) {
          const res = await deletePlanogramImage(selectedRowId);
          if (res.error) {
            showSnackbar(res.data.message, "error");
          } else {
            showSnackbar("Planogram Image deleted successfully", "success");
            setRefreshKey((prev) => prev + 1);
          }
        }
    };

    const fetchTableData = async (
        page: number = 1,
        pageSize: number = 10,
    ): Promise<listReturnType> => {
      setLoading(true);
      const res = await planogramImageList({
        page: page.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if(res.error) {
        showSnackbar(res.data.message || "Failed to fetch planogram image data", "error");
        throw new Error(res.data.message || "Failed to fetch planogram image data");
      } else {
        return {
          data: res.data || [],
          currentPage: res.pagination.page || 1,
          pageSize: res.pagination.limit || pageSize,
          total: res.pagination.total_pages || 1,
        }
      }
    };

    useEffect(() => {
      setLoading(true);
    }, []);

    return (
        <>
            {/* Table */}
            <div className="h-[calc(100%-60px)]">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                          list: fetchTableData
                        },
                        header: {
                            title: "Planogram Image",
                            wholeTableActions: [
                                <div
                                    key={0}
                                    className="flex gap-[12px] relative"
                                >
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
                            searchBar: false,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key="name"
                                    href="/dashboard/merchandiser/planogramImage/add"
                                    leadingIcon="lucide:plus"
                                    label="Add Planogram Image"
                                    labelTw="hidden lg:block"
                                    isActive
                                />,
                            ],
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns: [
                            { key: "customer_id", label: "Customer" },
                            { key: "merchandiser_id", label: "Merchandiser" },
                            { key: "shelf_id", label: "Shelf" },
                            {
                                key: "image_url",
                                label: "Image",
                                width: 150,
                                render: (row: TableDataType) => (
                                    <a href={row.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        View Image
                                    </a>
                                ),
                            },
                        ],
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(
                                        `/dashboard/merchandiser/planogramImage/${data.id}`
                                    );
                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (data: TableDataType) => {
                                    const id = parseInt(data.id);
                                    setSelectedRowId(id);
                                    setShowDeletePopup(true);
                                },
                            },
                        ],
                        pageSize: 10,
                    }}
                />
            </div>

            {/* Delete Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <DeleteConfirmPopup
                        title="planogram image"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}
