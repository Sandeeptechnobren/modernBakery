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
import { chillerList, deleteChiller, deleteServiceTypes, serviceTypesList } from "@/app/services/assetsApi";
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

  const handleConfirmDelete = async () => {
    if (deleteSelectedRow) {
      // Call the API to delete the row
      const res = await deleteChiller(deleteSelectedRow.toString());
      if(res.error) {
        showSnackbar(res.data.message || "failed to delete the chiller", "error");
        throw new Error("Unable to delete the chiller");
      } else {
          showSnackbar( res.message || `Deleted chiller with ID: ${deleteSelectedRow}`, "success");
          setShowDeletePopup(false);
          setRefreshKey(prev => prev +1);
      }
    }
  };

  const fetchServiceTypes = useCallback(
    async ( pageNo: number = 1, pageSize: number = 10) : Promise<listReturnType> => {
      setLoading(true);
      const res = await chillerList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if(res.error) {
        showSnackbar(res.data.message || "failed to fetch the Chillers", "error");
        throw new Error("Unable to fetch the Chillers");
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
      <div className="h-[calc(100%-60px)]">
        <Table
        refreshKey={refreshKey}
          config={{
            api: {
              list: fetchServiceTypes
            },
            header: {
              title: "Chillers",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  {/* <BorderIconButton icon="gala:file-document" label="Export CSV" /> */}
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
                  href="/dashboard/assets/chiller/add"
                  leadingIcon="lucide:plus"
                  label="Add Chiller"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "serial_number", label: "Serial Number" },
              { key: "sap_code", label: "SAP Code" },
              { key: "asset_number", label: "Asset Number" },
              { key: "model_number", label: "Model Number" },
              { key: "description", label: "Description" },
              { key: "acquisition", label: "Acquisition" },
              { key: "vender_details", label: "Vender Details", render: (data: TableDataType) => {
                  if(data.vender_details && Array.isArray(data.vender_details)) {
                    return data.vender_details.map((item: {id: number, code: string, name: string}) => {
                      return item.name || "";
                    }).join(", ")                    
                  } else return "-";
              } },
              { key: "document_id", label: "Document Id" },
              { key: "document_type", label: "Document Type" },
              { key: "manufacturer", label: "Manufacturer" },
              { key: "country_id", label: "Country Id" },
              { key: "type_name", label: "Type Name" },
              { key: "is_assign", label: "Is Assign" },
              { key: "customer_id", label: "Country Id" },
              { key: "agreement_id", label: "Agreement Id" },
              { key: "status", label: "Status", render: (data: TableDataType) => (
                  <StatusBtn isActive={data.status && data.status.toString() === "1" ? true : false} />
              )},
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/dashboard/assets/chiller/view/${data.uuid}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/dashboard/assets/chiller/${data.uuid}`);
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: TableDataType) => {
                  setDeleteSelectedRow(data?.uuid ? String(data.uuid) : data.uuid);
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