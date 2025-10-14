"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { deleteShelves, shelvesList } from "@/app/services/merchandiserApi";
import { useLoading } from "@/app/services/loadingContext";

interface ShelfDisplayItem {
  uuid: string;
  date: string;
  name: string;
  customer_code: string;
  customer_name: string;
  valid_from: string;
  valid_to: string;
}

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function ShelfDisplay() {
  const {setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ShelfDisplayItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const handleConfirmDelete = async () => {
    if (selectedRow) {
      setLoading(true);
      const res = await deleteShelves(String(selectedRow?.uuid));
      setLoading(false);
      if (res.error) {
        showSnackbar(res.data.message || "Failed to delete row", "error");
      } else {
        setRefreshKey(refreshKey + 1);
        showSnackbar(res.message || `Deleted Shelf Display successfully`, "success");
      }
      setShowDeletePopup(false);
    }
  };

  const fetchShelfDisplay = useCallback(
    async ( pageNo: number = 1, pageSize: number = 10) : Promise<listReturnType> => {
      setLoading(true);
      const res = await shelvesList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });

      console.log(res)
      setLoading(false);
      if(res.error) {
        showSnackbar(res.data.message || "failed to fetch the shelf display", "error");
        throw new Error("Unable to fetch the shelf display");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.current_page || 1,
          pageSize: res?.pagination?.per_page || pageSize,
          total: res?.pagination?.last_page || 0,
        };
      }
    }, []
  )

  useEffect(() => {
    setLoading(true);
  }, [])

  return (
    <>
      {/* Table */}
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchShelfDisplay
            },
            header: {
              title: "Shelf Display",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <DismissibleDropdown
                    isOpen={showDropdown}
                    setIsOpen={setShowDropdown}
                    button={<BorderIconButton icon="ic:sharp-more-vert" />}
                    dropdown={
                      <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                        <CustomDropdown>
                          {dropdownDataList.map((link, idx) => (
                            <div
                              key={idx}
                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                            >
                              <Icon icon={link.icon} width={link.iconWidth} className="text-[#717680]" />
                              <span className="text-[#181D27] font-[500] text-[16px]">{link.label}</span>
                            </div>
                          ))}
                        </CustomDropdown>
                      </div>
                    }
                  />
                </div>
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="name"
                  href="/merchandiser/shelfDisplay/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "shelf-display-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "shelf_name", label: "Shelf Name" },
              { key: "height", label: "Height" },
              { key: "width", label: "Width" },
              { key: "depth", label: "Depth" },
              { key: "valid_from", label: "Valid From", render: (row: TableDataType) => {
                  const dateStr = row.valid_from;
                  if (!dateStr) return "";
                  const [y, m, d] = dateStr.split("T")[0].split("-");
                  return `${d}-${m}-${y}`;
              }},
              { key: "valid_to", label: "Valid To", render: (row: TableDataType) => {
                  const dateStr = row.valid_to;
                  if (!dateStr) return "";
                  const [y, m, d] = dateStr.split("T")[0].split("-");
                  return `${d}-${m}-${y}`;
              } },
              // { key: "customer_details", label: "Customers", render: (data: TableDataType) => {
              //   if (Array.isArray(data.customer_details) && data.customer_details.length > 0) {
              //     return data.customer_details
              //       .map((customer) => `${customer.customer_code} - ${customer.owner_name}`)
              //       .join(", ");
              //   }
              //   return "-";
              //  }},
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  router.push(`/merchandiser/shelfDisplay/view/${row.uuid}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  router.push(`/merchandiser/shelfDisplay/${row.uuid}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  setSelectedRow({ uuid: row.uuid, ...row } as ShelfDisplayItem);
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
            title="Shelf Display"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}