"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, { TableDataType } from "@/app/components/customTable";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { campaignInformationList,exportCompaignData } from "@/app/services/merchandiserApi";
import { div } from "framer-motion/client";



const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function CampaignPage() {
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Fetch Table Data
  const fetchComplaintFeedback = useCallback(
    async (pageNo = 1, pageSize = 10) => {
      setLoading(true);
      try {
        const res = await campaignInformationList({
          page: String(pageNo),
          per_page: String(pageSize),
        });
        setLoading(false);

        const dataArray: TableDataType[] = Array.isArray(res?.data)
          ? res.data
          : [];
        const pagination = res?.pagination;

        return {
          data: dataArray,
          currentPage: pagination.current_page,
          pageSize: pagination.per_page,
          total: pagination.last_page,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar("Failed to fetch campaign list", "error");
        console.error(err);
        return {
          data: [] as TableDataType[],
          currentPage: 1,
          pageSize,
          total: 0,
        };
      }
    },
    [setLoading, showSnackbar]
  );

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportCompaignData({ file_type: fileType });
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
      link.download = `campaign_info_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export campaign data", "error");
    } finally {
      setLoading(false);
      setShowExportDropdown(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
  

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchComplaintFeedback },
            header: {
              title:"Campaigns Information",
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
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "code", label: "Campaign Code" },
              {
                key: "merchendiser",
                label: "Merchandiser",
                render: (row) =>
                  typeof row.merchendiser === "object" &&
                  row.merchendiser !== null &&
                  "name" in row.merchendiser
                    ? (row.merchendiser as { name?: string })?.name || "-"
                    : "-",
              },
              {
                key: "customer",
                label: "Customer",
                render: (row) =>
                  typeof row.customer === "object" &&
                  row.customer !== null &&
                  "owner_name" in row.customer
                    ? (row.customer as { owner_name?: string })?.owner_name ||
                      "-"
                    : "-",
              },
              { key: "feedback", label: "Feedback" },
            ],
            rowSelection: true,
            pageSize: 10,
          }}
        />
      </div>
    </div>
  );
}
