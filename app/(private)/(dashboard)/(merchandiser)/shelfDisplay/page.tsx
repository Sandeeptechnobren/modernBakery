"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, {
  listReturnType,
  searchReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  deleteShelves,
  exportShelveData,
  shelvesList,
} from "@/app/services/merchandiserApi";
import { useLoading } from "@/app/services/loadingContext";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { shelfDisplayGlobalSearch } from "@/app/services/assetsApi";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";

interface ShelfDisplayItem {
  uuid: string;
  self_name: string;
  height: string;
  width: string;
  depth: string;
  valid_from: string;
  valid_to: string;
}

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
];

export default function ShelfDisplay() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ShelfDisplayItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();



  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportShelveData({ format: fileType });
      console.log("Export API Response:", res);

      let downloadUrl = "";

      if (res?.url && res.url.startsWith("blob:")) {
        downloadUrl = res.url;
      } else if (res?.url && res.url.startsWith("http")) {
        downloadUrl = res.url;
      } else if (typeof res === "string" && res.includes(",")) {
        const blob = new Blob([res], {
          type:
            fileType === "csv"
              ? "text/csv;charset=utf-8;"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        showSnackbar("No valid file or URL returned from server", "error");
        return;
      }

      // ⬇️ Trigger browser download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `shelf_display_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export Shelf Display data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };

  const fetchShelfDisplay = useCallback(
    async (
      pageNo: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      setLoading(true);
      const res = await shelvesList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });

      console.log(res);
      setLoading(false);
      if (res.error) {
        showSnackbar(
          res.data.message || "failed to fetch the shelf display",
          "error"
        );
        throw new Error("Unable to fetch the shelf display");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.current_page || 1,
          pageSize: res?.pagination?.per_page || pageSize,
          total: res?.pagination?.last_page || 0,
        };
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
  }, []);

  const searchShelfDisplay = useCallback(
    async (searchQuery: string): Promise<searchReturnType> => {
      setLoading(true);
      try {
        console.log(searchQuery);
        // always start from page 1 for a new search
        const res = await shelfDisplayGlobalSearch({
          search: searchQuery,
        });

        setLoading(false);
        if (res.error) throw new Error(res.message || "Search failed");

        const data: TableDataType[] = res.data.map((item: ShelfDisplayItem) => ({
          id: item.uuid,
          self_name: item.self_name,
          height: item.height,
          width: item.width,
          depth: item.depth,
          valid_from: item.valid_from,
          valid_to: item.valid_to,
        }));
        return {
          data,
          total: res.pagination?.total || data.length,
          currentPage: res.pagination?.current_page || 1,
          pageSize: res.pagination?.per_page,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar((err as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize: 10 };
      }
    },
    [setLoading, showSnackbar]
  );

  return (
    <>

      {/* Table */}
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchShelfDisplay,
              search: searchShelfDisplay,
            },
            header: {
              title: "Shelf Display",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("csv")
                  },
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("xlsx")
                  },
                },
                // {
                //   icon: "lucide:radio",
                //   label: "Inactive",
                //  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                //     handleStatusChange(data, selectedRow, "0");
                // },
                // }
              ],
              searchBar: true,
              columnFilter: true,
              actions: can("create") ? [
                <SidebarBtn
                  key="name"
                  href="/shelfDisplay/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ] : [],
            },
            localStorageKey: "shelf-display-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "shelf_name", label: "Shelf Name" },
              { key: "height", label: "Height" },
              { key: "width", label: "Width" },
              { key: "depth", label: "Depth" },
              {
                key: "valid_from",
                label: "Valid From",
                render: (row: TableDataType) => formatDate(row.valid_from),
              },
              {
                key: "valid_to",
                label: "Valid To",
                render: (row: TableDataType) => formatDate(row.valid_to),
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  router.push(`/shelfDisplay/view/${row.uuid}`);
                },
              },
              ...(can("edit") ? [{
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableDataType;
                  router.push(`/shelfDisplay/${row.uuid}`);
                },
              }] : []),
              // {
              //   icon: "lucide:trash-2",
              //   onClick: (data: object) => {
              //     const row = data as TableDataType;
              //     setSelectedRow({ uuid: row.uuid, ...row } as ShelfDisplayItem);
              //     setShowDeletePopup(true);
              //   },
              // },
            ],
            pageSize: 50,
          }}
        />
      </div>


    </>
  );
}
