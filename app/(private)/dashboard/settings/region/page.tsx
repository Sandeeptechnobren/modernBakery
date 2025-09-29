"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType, listReturnType, searchReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { regionList, deleteRegion, regionGlobalSearch } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";

interface RegionItem {
  id?: number | string;
  region_code?: string;
  region_name?: string;
  status?: number | "Active" | "Inactive";
  country?: {
    id?: number;
    country_name?: string;
    country_code?: string;   // ✅ Add country_code
  };
}
const dropdownDataList = [
  // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Region() {
  const { setLoading } = useLoading();
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RegionItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // Normalize API data for table
const tableData: TableDataType[] = regions.map((s) => ({
  id: s.id?.toString() ?? "",
  region_code: s.region_code ?? "",
  region_name: s.region_name ?? "",
  country_code: s.country?.country_code ?? "",   
  country_name: s.country?.country_name ?? "", 
  status: s.status === 1 || s.status === "Active" ? "Active" : "Inactive",
}));

  // async function fetchRegions() {
  //     const listRes = await regionList();
  //     if(listRes.error) {
  //       showSnackbar("Failed to fetch Regions ❌", "error");
  //     } else {
  //       setRegions(listRes.data);
  //     }
  //     setLoading(false);
  //   };



  const fetchRegions = useCallback(
    async (
      page: number = 1,
      pageSize: number = 5
    ): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await regionList({
          limit: pageSize.toString(),
          page: page.toString(),
        });
        setLoading(false);
        return {
          data: listRes.data || [],
          total: listRes.pagination.totalPages,
          currentPage: listRes.pagination.page,
          pageSize: listRes.pagination.limit,
        };
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  const searchRegions = useCallback(
    async (
      searchQuery: string,
      pageSize: number
    ): Promise<searchReturnType> => {
      setLoading(true);
      const result = await regionGlobalSearch({
        query: searchQuery,
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if (result.error) throw new Error(result.data.message);
      else {
        return {
          data: result.data || [],
          total: result.pagination.pagination.totalPages || 0,
          currentPage: result.pagination.pagination.current_page || 0,
          pageSize: result.pagination.pagination.limit || pageSize,
        };
      }
    },
    []
  );

  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    const res = await deleteRegion(String(selectedRow.id));
    if (res.error) {
      showSnackbar(res.data.message || "Failed to delete Region", "error");
    } else {
      showSnackbar(res.message || "Region deleted successfully", "success");
      setLoading(false);
    }
    setShowDeletePopup(false);
  };

  useEffect(() => {
    setLoading(true);
  }, []);


  return (
    <>


      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            api: {
              list: fetchRegions,
              search: searchRegions,
            },
            header: {
              title: "Region",
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
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-region"
                  href="/dashboard/settings/region/add"
                  leadingIcon="lucide:plus"
                  label="Add Region"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "region_code", label: "Region Code" },
              { key: "region_name", label: "Region Name" },
              {
                key: "status",
                label: "Status",
                render: (row: TableDataType) => (<StatusBtn isActive={row.status ? true : false} />),
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/settings/region/update/${row.id}`);
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

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Region"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}