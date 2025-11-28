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
import { useLoading } from "@/app/services/loadingContext";
import { deleteVendor, vendorList } from "@/app/services/assetsApi";
import StatusBtn from "@/app/components/statusBtn2";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function ShelfDisplay() {
  const {setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();


  const fetchVendor = useCallback(
    async ( pageNo: number = 1, pageSize: number = 10) : Promise<listReturnType> => {
      setLoading(true);
      const res = await vendorList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if(res.error) {
        showSnackbar(res.data.message || "failed to fetch the Vendor List", "error");
        throw new Error("Unable to fetch the Vendor List");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.page || 0,
          pageSize: res?.pagination?.limit || 10,
          total: res?.pagination?.totalPages || 0,
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
              list: fetchVendor
            },
            header: {
              title: "Vendor",
             
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="name"
                  href="/assets/vendor/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "code", label: "Code",
                render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.code}
            </span>
        ),
               },
              { key: "name", label: "Name" },
              { key: "address", label: "Address" },
              { key: "contact", label: "Contact" },
              { key: "email", label: "Email" },
              { key: "status", label: "Status", render: (data: TableDataType) => (
                  <StatusBtn isActive={data.status && data.status.toString() === "1" ? true : false} />
              )},
          
            ],
            rowSelection: true,
            rowActions: [
              // {
              //   icon: "lucide:eye",
              //   onClick: (data: TableDataType) => {
              //     router.push(`/assets/vendor/view/${data.uuid}`);
              //   },
              // },
              {
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/assets/vendor/${data.uuid}`);
                },
              },
            ],
            pageSize: 5,
          }}
        />
      </div>

    </>
  );
}