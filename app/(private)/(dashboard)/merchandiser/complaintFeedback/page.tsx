"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, { listReturnType } from "@/app/components/customTable";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import {
  complaintFeedbackList,
  exportCmplaintFeedback,
} from "@/app/services/merchandiserApi";
const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Complaint() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [popupImages, setPopupImages] = useState<string[]>([]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Fetch Table Data
  const fetchComplainedFeedback = useCallback(
    async (pageNo = 1, pageSize = 10): Promise<listReturnType> => {
      setLoading(true);
      try {
        const res = await complaintFeedbackList({
          page: String(pageNo),
          per_page: String(pageSize),
        });
        setLoading(false);

        if (res.error) {
          showSnackbar(
            res.data?.message || "Failed to fetch Complaint Feedback list",
            "error"
          );
          return { data: [], currentPage: 1, pageSize, total: 0 };
        }

        return {
          data: res?.data || [],
          currentPage: res?.pagination?.current_page,
          pageSize: res?.pagination?.per_page,
          total: res?.pagination?.last_page, 
        };
      } catch (err) {
        setLoading(false);
        showSnackbar("Failed to fetch Complaint Feedback list", "error");
        return { data: [], currentPage: 1, pageSize, total: 0 };
      }
    },
    [setLoading, showSnackbar]
  );

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      // ✅ Use correct API and param name
      const res = await exportCmplaintFeedback({ format: fileType });

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
      link.download = `complaint_feedback_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export complaint feedback data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };

  // Handle image popup open
  //   const BASE_URL ="http://127.0.0.1:8000";
  //   const handleOpenImagePopup = (row: any) => {
  //     const images: string[] = [];
  //  if (row.image?.image1) images.push(BASE_URL + row.image.image1);
  //     if (row.image?.image2) images.push(BASE_URL + row.image.image2);
  //     if (row.image?.image3) images.push(BASE_URL + row.image.image3);

  //     if (images.length === 0) {
  //       showSnackbar("No images available", "info");
  //       return;
  //     }

  //     setPopupImages(images);
  //   };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] font-semibold text-[#181D27]">
            Complaint Feedback
          </h1>

          {/* Export & Options */}
          <div className="flex gap-2 relative">
            {/* Export Button */}
            <div className="relative">
              <BorderIconButton
                icon="gala:file-document"
                label="Export"
                labelTw="text-[12px] hidden sm:block"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              />

              {showExportDropdown && (
                <div className="absolute top-full right-0 mt-2 z-30 w-[160px] bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="py-1">
                    <button
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleExport("csv")}
                    >
                      <Icon
                        icon="vscode-icons:file-type-csv"
                        width={20}
                        className="text-green-600"
                      />
                      CSV
                    </button>
                    <button
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleExport("xlsx")}
                    >
                      <Icon
                        icon="vscode-icons:file-type-excel"
                        width={20}
                        className="text-green-600"
                      />
                      XLSX
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Options Dropdown */}
            <DismissibleDropdown
              isOpen={showDropdown}
              setIsOpen={setShowDropdown}
              button={<BorderIconButton icon="ic:sharp-more-vert" />}
              dropdown={
                <div className="absolute top-full right-0 mt-2 z-30 w-[226px] bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="py-1">
                    {dropdownDataList.map((link, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Icon
                          icon={link.icon}
                          width={link.iconWidth}
                          className="text-gray-500"
                        />
                        <span>{link.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
          </div>
        </div>

        <Table
          refreshKey={refreshKey}

          config={{
            api: { list: fetchComplainedFeedback },
            header: {
   title: "Complaint Feedback",

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
              { key: "complaint_code", label: "Complaint Code" },
              { key: "complaint_title", label: "Title" },
              {
                key: "merchendiser",
                label: "Merchendiser",
                render: (row) =>
                  typeof row.merchendiser === "object" &&
                  row.merchendiser !== null &&
                  "name" in row.merchendiser
                    ? (row.merchendiser as { name?: string })?.name || "-"
                    : "-",
              },
              {
                key: "item",
                label: "Item",
                render: (row) =>
                  typeof row.item === "object" &&
                  row.item !== null &&
                  "item_name" in row.item
                    ? (row.item as { item_name?: string }).item_name || "-"
                    : "-",
              },
              { key: "type", label: "Type" },
            
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data) => {
                  router.push(
                    `/merchandiser/complaintFeedback/view/${data.uuid}`
                  );
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      Image Preview Popup
      {popupImages.length > 0 && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 "
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
