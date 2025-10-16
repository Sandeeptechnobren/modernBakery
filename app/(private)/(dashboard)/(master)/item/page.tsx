"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import StatusBtn from "@/app/components/statusBtn2";
import { updateItemStatus, itemList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface DropdownItem {
    icon: string;
    label: string;
    iconWidth: number;
    onClick?: () => void;
    status?: string;
}

interface LocalTableDataType {
    id?: number | string;
    erp_code?: string;
    name?: string;
    category?: { name?: string };
    uom?: Array<{ name?: string; uom_type?: string; price?: string }>;
    status?: number | string;
}

const dropdownDataList: DropdownItem[] = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20, status: "inactive" },
    // { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  {
    key: "erp_code",
    label: "ERP Code",
    render: (row: LocalTableDataType) => row.erp_code || "-",
  },
  { key: "name", label: "Name" },
  {
    key: "category",
    label: "Category",
    render: (row: LocalTableDataType) => row.category?.name || "-",
  },
  {
    key: "uom",
    label: "Base UOM",
    render: (row: LocalTableDataType) => {
      if (!row.uom || row.uom.length === 0) return "-";
      return row.uom[0]?.name ?? "-"; // ✔️ Base UOM
    },
  },
  {
    key: "uom",
    label: "Base UOM Price",
    render: (row: LocalTableDataType) => {
      if (!row.uom || row.uom.length === 0) return "-";
      return row.uom[0]?.price ?? "-"; // ✔️ Base UOM Price
    },
  },
  {
    key: "uom",
    label: "Secondary UOM",
    render: (row: LocalTableDataType) => {
      if (!row.uom || row.uom.length < 2) return "-";
      return row.uom[1]?.name ?? "-"; // ✔️ Secondary UOM
    },
  },
  {
    key: "uom",
    label: "Secondary UOM Price",
    render: (row: LocalTableDataType) => {
      if (!row.uom || row.uom.length < 2) return "-";
      return row.uom[1]?.price ?? "-"; // ✔️ Secondary UOM Price
    },
  },
  {
    key: "status",
    label: "Status",
    render: (row: LocalTableDataType) => {
      const isActive =
        String(row.status) === "1" ||
        (typeof row.status === "string" &&
          row.status.toLowerCase() === "active");
      return <StatusBtn isActive={isActive} />;
    },
  },
];


export default function Item() {
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<LocalTableDataType | null>(
        null
    );
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const fetchItems = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50
        ): Promise<listReturnType> => {
            try {
                setLoading(true);
                const res = await itemList({ page: page.toString() });
                setLoading(false);
                const data = res.data.map((item: LocalTableDataType) => ({
                    ...item,
                }));
                return {
                    data,
                    total: res.pagination.totalPages,
                    currentPage: res.pagination.page,
                    pageSize: res.pagination.limit,
                };
            } catch (error) {
                setLoading(false);
                console.error(error);
                throw error;
            }
        },
        []
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
             
                  const res = await updateItemStatus({item_ids: selectedRowsData, status});
              
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

   

    useEffect(() => {
        setLoading(true);
    }, []);

    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchItems },
                        header: {
                            title: "Item",
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
                            // wholeTableActions: [
                            //     <div key={0} className="flex gap-[12px] relative">
                            //         <DismissibleDropdown
                            //             isOpen={showDropdown}
                            //             setIsOpen={setShowDropdown}
                            //             button={<BorderIconButton icon="ic:sharp-more-vert" />}
                            //             dropdown={
                            //                 <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                            //                     <CustomDropdown>
                            //                         {dropdownDataList.map((link, idx) => (
                            //                             <div
                            //                                 key={idx}
                            //                                 className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA] cursor-pointer"
                            //                                 onClick={(data: TableDataType[], selectedRow?: number[]) => {
                            //                                     handleStatusChange(data, selectedRow, link.status === "active" ? "1" : "0");
                            //                                     setShowDropdown(false); // Optionally close dropdown after action
                            //                                 }}
                            //                             >
                            //                                 <Icon
                            //                                     icon={link.icon}
                            //                                     width={link.iconWidth}
                            //                                     className="text-[#717680]"
                            //                                 />
                            //                                 <span className="text-[#181D27] font-[500] text-[16px]">
                            //                                     {link.label}
                            //                                 </span>
                            //                             </div>
                            //                         ))}
                            //                     </CustomDropdown>
                            //                 </div>
                            //             }
                            //         />
                            //     </div>,
                            // ],
                            searchBar: false,
                            columnFilter: true,
                            actions: [
                                <SidebarBtn
                                    key={0}
                                    href="/item/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden sm:block"
                                />,
                            ],
                        },
                        localStorageKey: "item-table",
                        table: {
                            height: 500,
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (row: LocalTableDataType) =>
                                    router.push(`/item/details/${row.id}`),
                            },
                            {
                                icon: "lucide:edit-2",
                                onClick: (row: LocalTableDataType) =>
                                    router.push(`/item/${row.id}`),
                            },
                        ],
                        pageSize: 50,
                    }}
                />
            </div>
        </>
    );
}
