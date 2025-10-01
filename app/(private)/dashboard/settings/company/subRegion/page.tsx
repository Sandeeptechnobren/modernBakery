"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getArea, deleteArea } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import Popup from "@/app/components/popUp";
import { useLoading } from "@/app/services/loadingContext";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

interface SubRegionItem {
  id?: number | string;
  area_code?: string;
  region?: {
    region_name?: string;
  };
  region_name?: string;
  area_name?: string;
  status?: "Active" | "Inactive" | string;
}

const dropdownDataList: DropdownItem[] = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "area_code", label: "SubRegion Code" },
  { key: "area_name", label: "SubRegion Name" },
  {
    key: "region_name",
    label: "Region",
    render: (row: SubRegionItem) => row.region_name || "-",
  },
  {
    key: "status",
    label: "Status",
    render: (row: SubRegionItem) => (
      <div className="flex items-center">
        {row.status === "Active" ? (
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

export default function SubRegion() {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<number | string | null>(null);

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();

  // API fetch with pagination
  const fetchSubRegions = useCallback(
    async (pageNo: number = 1, pageSize: number = 10) => {
      setLoading(true);
      const result = await getArea({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);

      if (result.error) {
        showSnackbar(result.data.message, "error");
        throw new Error("Error fetching SubRegions");
      } else {
        const rows: TableDataType[] =
          result.data?.map((s: SubRegionItem) => ({
            id: s.id?.toString() ?? "",
            area_code: s.area_code ?? "",
            area_name: s.area_name ?? "",
            region_name: s.region?.region_name ?? "",
            status: s.status ?? "Inactive",
          })) || [];

        return {
          data: rows,
          currentPage: result.pagination.page || 1,
          pageSize: result.pagination.limit || 10,
          total: result.pagination.totalPages || 0,
        };
      }
    },
    []
  );

  async function handleConfirmDelete() {
    if (!deleteRowId) return;
    try {
      await deleteArea(String(deleteRowId));
      showSnackbar("SubRegion deleted successfully ✅", "success");
      router.refresh();
    } catch (error) {
      console.error("Delete failed ❌:", error);
      showSnackbar("Failed to delete SubRegion ❌", "error");
    } finally {
      setShowDeletePopup(false);
      setDeleteRowId(null);
    }
  }

  return (
    <>
      

      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            api: {
              list: fetchSubRegions,
            },
            header: {
              title: "Sub Region",
                            wholeTableActions: [
                              <div key={0} className="flex gap-[12px] relative">
                                <BorderIconButton
                                  icon="ic:sharp-more-vert"
                                  onClick={() =>
                                    setShowDropdown(!showDropdown)
                                  }
                                />
              
                                {showDropdown && (
                                  <div className="w-[226px] absolute top-[40px] right-0 z-30">
                                    <CustomDropdown>
                                      {dropdownDataList.map(
                                        (
                                          link,
                                          index: number
                                        ) => (
                                          <div
                                            key={index}
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
                                )}
                              </div>
                            ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/company/subRegion/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Sub Region"
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
                onClick: (data: Record<string, string>) => {
                  const id = data.id;
                  router.push(
                    `/dashboard/settings/company/subRegion/update/${id}`
                  );
                },
              },
              {
                icon: "lucide:trash-2",
                onClick: (data: Record<string, string>) => {
                  setDeleteRowId(data.id);
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {showDeletePopup && (
        <Popup isOpen={true} onClose={() => setShowDeletePopup(false)}>
          <DeleteConfirmPopup
            title="Delete SubRegion"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </Popup>
      )}
    </>
  );
}