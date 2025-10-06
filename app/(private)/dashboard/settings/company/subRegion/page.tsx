"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import StatusBtn from "@/app/components/statusBtn2";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, {
  listReturnType,
  searchReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
  getArea,
  subRegionListGlobalSearch,
  deleteArea,
} from "@/app/services/allApi";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

interface SubRegionItem {
  id?: number | string;
  area_code?: string;
  area_name?: string;
  region?: {
    region_name?: string;
  };

  // region_name?: string;
  status?: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "area_code", label: "SubRegion Code" },
  { key: "area_name", label: "SubRegion Name" },
  // { key: "region_name", label: "Region" },
  {
    key: "region_name",
    label: "Region",
    render: (data: TableDataType) => {
      const typeObj = data.region
        ? JSON.parse(JSON.stringify(data.region))
        : null;
      return typeObj?.region_name ? typeObj.region_name : "-";
    },
    // render: (row: SubRegionItem) => row.region.region_name || "-",
  },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => (
      <StatusBtn isActive={row.status ? true : false} />
    ),
  },
];

export default function SubRegion() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubRegionItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  type TableRow = TableDataType & { id?: string };

  // ✅ Fetch SubRegions
  const fetchSubRegions = useCallback(
    async (page: number = 1, pageSize: number = 5): Promise<listReturnType> => {
      try {
        setLoading(true);
        const listRes = await getArea({
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

  // ✅ Search SubRegions
  const searchSubRegions = useCallback(
    async (
      searchQuery: string,
      pageSize: number
    ): Promise<searchReturnType> => {
      setLoading(true);
      const result = await subRegionListGlobalSearch({
        search: searchQuery,
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if (result.error) throw new Error(result.data.message);
      else {
        const pagination =
          result.pagination && result.pagination.pagination
            ? result.pagination.pagination
            : {};
        return {
          data: result.data || [],
          total: pagination.totalPages || 10,
          currentPage: pagination.current_page || 1,
          pageSize: pagination.limit || pageSize,
        };
      }
    },
    []
  );

  // ✅ Delete SubRegion
  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    if (!selectedRow?.id) throw new Error("Missing id");
    const res = await deleteArea(String(selectedRow.id));
    if (res.error)
      return showSnackbar(
        res.data.message || "Failed to delete SubRegion",
        "error"
      );
    else {
      showSnackbar("SubRegion deleted successfully ✅", "success");
      setRefreshKey(refreshKey + 1);
    }
    setLoading(false);
    setShowDeletePopup(false);
    setSelectedRow(null);
  };

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <>
      <div className="h-[calc(100%-60px)] pb-[22px]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchSubRegions,
              search: searchSubRegions,
            },
            header: {
              title: "SubRegion",
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
                    }
                  />
                </div>,
              ],
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/company/subRegion/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add SubRegion"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
               {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(
                    `/dashboard/settings/company/subRegion/details/${data.id}`
                  );
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(
                    `/dashboard/settings/company/subRegion/${row.id}`
                  );
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

      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="SubRegion"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
