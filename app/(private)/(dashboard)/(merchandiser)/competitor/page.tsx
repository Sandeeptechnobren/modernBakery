"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { competitorList, exportCompetitor } from "@/app/services/merchandiserApi";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Competitor() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [popupImages, setPopupImages] = useState<string[]>([]);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Fetch Table Data
  const fetchCompetitorList = useCallback(
    async (pageNo = 1, pageSize = 50): Promise<listReturnType> => {
      setLoading(true);
      try {
        const res = await competitorList({
          page: String(pageNo),
          per_page: String(pageSize),
        });
        setLoading(false);

        if (res.error) {
          showSnackbar(
            res.data?.message || "Failed to fetch competitor list",
            "error"
          );
          return { data: [], currentPage: 1, pageSize, total: 0 };
        }

        return {
          data: res?.data || [],
          currentPage: res?.pagination?.current_page,
          pageSize: res?.pagination?.per_page,
          total: res?.pagination?.last_page, // Use last_page for total pages
        };
      } catch (err) {
        setLoading(false);
        showSnackbar("Failed to fetch competitor list", "error");
        return { data: [], currentPage: 1, pageSize, total: 0 };
      }
    },
    [setLoading, showSnackbar]
  );

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      // ✅ Use correct API and param name
      const res = await exportCompetitor({ format: fileType });

      if (!res) {
        showSnackbar("No data returned from server", "error");
        return;
      }

      // ✅ Create blob for download
      const blob = new Blob([res], {
        type:
          fileType === "csv"
            ? "text/csv;charset=utf-8;"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `competitor_info_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(`Download started for ${fileType.toUpperCase()} file`, "success");
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export competitor data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };


  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchCompetitorList },
            header: {
              title: "Competitor Information",
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

              searchBar: false,
              columnFilter: true,
              // actions: [
              //   <SidebarBtn
              //     key="add"
              //     href="/merchandiser/complaintFeedback/add"
              //     leadingIcon="lucide:plus"
              //     label="Add Feedback"
              //     labelTw="hidden lg:block"
              //     isActive
              //   />,
              // ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "code", label: "Competitor Code" },
              { key: "company_name", label: "Company Name" },
              { key: "brand", label: "Brand" },

              {
                key: "merchendiser_info",
                label: "Merchandiser Info",
                render: (row: TableDataType) => {
                  const info = row.merchendiser_info as
                    | { name?: string; osa_code?: string }
                    | string
                    | null
                    | undefined;

                  if (typeof info === "object" && info !== null) {
                    return `${info.name || ""}`;
                  }
                  return info || "-";
                },
              },
              { key: "item_name", label: "Item Name" },
              { key: "price", label: "Price" },
              { key: "promotion", label: "Promotion" },
              { key: "notes", label: "Notes" },
            ],

            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/competitor/view/${data.uuid}`);
                },
              },
            ],
            pageSize: 50,
          }}
        />
      </div>

      {/* Image Preview Popup */}
      {popupImages.length > 0 && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={() => setPopupImages([])}
        >
          <div
            className="bg-white rounded-xl p-4 max-w-[80%] max-h-[80%] overflow-auto shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-4 justify-center">
              {popupImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="w-[200px] h-[200px] object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
            <button
              onClick={() => setPopupImages([])}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}