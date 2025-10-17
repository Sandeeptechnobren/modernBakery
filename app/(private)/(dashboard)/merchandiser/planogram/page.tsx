"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import Table, {
  TableDataType,
  listReturnType,
  searchReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import StatusBtn from "@/app/components/statusBtn2";
import { planogramList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { exportPlanogram } from "@/app/services/merchandiserApi";
interface PlanogramItem {
  id: number | string;
  uuid: string; // <--- add this
  name: string;
  valid_from: string;
  valid_to: string;
}

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Planogram() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [showDropdown, setShowDropdown] = useState(false);
   const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(null);

  type TableRow = TableDataType & { id?: string };

  // Fetch planogram list
  const fetchPlanogram = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10
    ): Promise<listReturnType> => {
      setLoading(true);

      try {
        const res = await planogramList({
          page: page.toString(),
          limit: pageSize.toString(),
        });
        setLoading(false);
        if (res.error)
          throw new Error(res.message || "Failed to fetch planograms");

        // Normalize status
        const data: TableDataType[] = res.data.map((item: PlanogramItem) => ({
          id: item.id.toString(),
          uuid: item.uuid, // <--- add this
          name: item.name,
          valid_from: item.valid_from,
          valid_to: item.valid_to,
        }));

        return {
          data,
          total: res.pagination?.last_page || 0,
          currentPage: res.pagination?.current_page || 1,
          pageSize: res.pagination?.per_page || pageSize,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar((err as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize };
      }
    },
    [setLoading, showSnackbar]
  );

  // Global search
  const searchPlanogram = useCallback(
    async (searchQuery: string): Promise<searchReturnType> => {
      setLoading(true);
      try {
        console.log(searchQuery);
        // always start from page 1 for a new search
        const res = await planogramList({
          search: searchQuery,
        });

        setLoading(false);
        if (res.error) throw new Error(res.message || "Search failed");

        const data: TableDataType[] = res.data.map((item: PlanogramItem) => ({
          id: item.id.toString(),
          name: item.name,
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

  // Table columns
  const columns = [
    { key: "name", label: "Name" },
    { key: "valid_from", label: "Valid From" },
    { key: "valid_to", label: "Valid To" },
  ];

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportPlanogram({ format : fileType });
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
      link.download = `planogram_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export Planogram data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };

  

  return (
    <div className="flex flex-col h-full">
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchPlanogram,
            search: searchPlanogram,
          },
          header: {
            title: "Planogram",

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
             
              ],

            searchBar: true,
            columnFilter: true,
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
            actions: [
              <SidebarBtn
                key="add-planogram"
                href="/merchandiser/planogram/add"
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
                isActive
              />,
            ],
          },
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: TableDataType) =>
                router.push(`/merchandiser/planogram/view/${data.uuid}`),
            },
            {
              icon: "lucide:edit-2",
              onClick: (data: TableDataType) =>
                router.push(`/merchandiser/planogram/${data.uuid}`),
            },
            {
              icon: "lucide:trash-2",
              onClick: (data: TableDataType) => {
                setDeleteSelectedRow(
                  data?.uuid ? String(data.uuid) : data.uuid
                );
                setShowDeletePopup(true);
              },
            },
          ],
          pageSize: 10,
        }}
      />
    </div>
  );
}
