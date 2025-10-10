"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { deleteCustomerType, getCustomerType } from "@/app/services/allApi";

interface CustomerType {
  id?: string | number;
  code?: string;
  name?: string;
  status?: number;
  [key: string]: string | number | undefined;
}

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "code", label: "Code",
    render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.code}
            </span>
        ),
   },
  { key: "name", label: "Name" },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <div className="flex items-center">
        {Number(row.status) === 1 ? (
          <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
            Active
          </span>
        ) : (
          <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
            Inactive
          </span>
        )}
      </div>
    ),
  },
];

export default function CustomerPage() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // Fetch list for Table
  const fetchCustomerType = useCallback(
    async (page: number = 1, pageSize: number = 5): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await getCustomerType({
          per_page: pageSize.toString(),
          page: page.toString(),
        });
        console.log(listRes)
        setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes?.pagination?.totalPages || 1,
          currentPage: listRes?.pagination?.page || 1, 
          pageSize: listRes?.pagination?.limit || pageSize,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  // Delete handler with refresh
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;
    try {
      const res = await deleteCustomerType(String(selectedRow.id));
      if (res?.success || res?.message || res) {
        showSnackbar("Customer deleted successfully ✅", "success");
        setShowDeletePopup(false);
        setSelectedRow(null);
        setRefreshKey((prev) => prev + 1); // <-- trigger table refresh
      } else {
        showSnackbar("Failed to delete customer ❌", "error");
      }
    } catch (error) {
      console.error("Delete failed ❌", error);
      showSnackbar("Delete failed ❌", "error");
    }
  };

  return (
    <>
      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchCustomerType,
            },
            header: {
              title: "Customer Type",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  <BorderIconButton
                    icon="ic:sharp-more-vert"
                    onClick={() => setShowDropdown(!showDropdown)}
                  />
                  {showDropdown && (
                    <div className="w-[226px] absolute top-[40px] right-0 z-30">
                      <CustomDropdown>
                        {dropdownDataList.map((link, index: number) => (
                          <div
                            key={index}
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
                        ))}
                      </CustomDropdown>
                    </div>
                  )}
                </div>,
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-customer-type"
                  href="/settings/customer/customerType/add"
                  leadingIcon="lucide:plus"
                  label="Add Customer Type"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "customerType",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(
                    `/settings/customer/customerType/${r.id}`
                  );
                },
              },
              // {
              //   icon: "lucide:trash",
              //   onClick: (row: object) => {
              //     const r = row as TableDataType;
              //     setSelectedRow({
              //       id: r.id,
              //       code: r.code,
              //       name: r.name,
              //       status: Number(r.status) === 1 ? 1 : 0,
              //     });
              //     setShowDeletePopup(true);
              //   },
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
            title="Delete Customer Type"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}