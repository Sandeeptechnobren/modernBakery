"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Table, { searchReturnType, TableDataType } from "@/app/components/customTable";
import ImagePreviewModal from "@/app/components/ImagePreviewModal";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import {
  campaignInformationList,
  exportCompaignData,
} from "@/app/services/merchandiserApi";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

interface CampaignInformationItem {
  uuid: string;
  code: string;
  merchandiser: string;
  customer: string;
  feedback: string;
}

export default function CampaignPage() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);

  const IMAGE_BASE_URL =
    "https://api.coreexl.com/osa_developmentV2/public";

  /* ================= IMAGE MODAL STATE ================= */
  const [imageModal, setImageModal] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const openImageModal = (images: string[], index = 0) => {
    setImageModal({ images, index });
  };

  const closeImageModal = () => {
    setImageModal(null);
  };

  /* ================= FETCH TABLE DATA ================= */
  const fetchComplaintFeedback = useCallback(
    async (pageNo = 1, pageSize = 50) => {
      setLoading(true);
      try {
        const res = await campaignInformationList({
          page: String(pageNo),
          per_page: String(pageSize),
        });

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
        console.error(err);
        showSnackbar("Failed to fetch campaign list", "error");
        return {
          data: [],
          currentPage: 1,
          pageSize,
          total: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showSnackbar]
  );

  /* ================= EXPORT ================= */
  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

      const res = await exportCompaignData({ file_type: fileType });

      let downloadUrl = "";

      if (res?.url?.startsWith("http")) {
        downloadUrl = res.url;
      } else if (typeof res === "string") {
        const blob = new Blob([res], {
          type:
            fileType === "csv"
              ? "text/csv;charset=utf-8;"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        showSnackbar("No valid file returned", "error");
        return;
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `campaign_info_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `${fileType.toUpperCase()} download started`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showSnackbar("Export failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const searchCampaign = useCallback(
    async (searchQuery: string): Promise<searchReturnType> => {
      setLoading(true);
      try {
        console.log(searchQuery);
        // always start from page 1 for a new search
        const res = await campaignInformationList({
          search: searchQuery,
        });

        setLoading(false);
        if (res.error) throw new Error(res.message || "Search failed");

        const data: TableDataType[] = res.data.map((item: CampaignInformationItem) => ({
          id: item.uuid,
          code: item.code,
          merchandiser: item.merchandiser,
          customer: item.customer,
          feedback: item.feedback,
        }));
        return {
          data,
          total: res.pagination?.last_page || data.length,
          currentPage: res.pagination?.current_page || 1,
          pageSize: res.pagination?.per_page,
        };
      } catch (err) {
        setLoading(false);
        showSnackbar((err as Error).message, "error");
        return { data: [], total: 0, currentPage: 1, pageSize: 50 };
      }
    },
    [setLoading, showSnackbar]
  );

  /* ================= RENDER ================= */
  return (
    <div className="flex flex-col h-full">
      <div className="h-[calc(100%-60px)]">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchComplaintFeedback, search: searchCampaign },
            header: {
              title: "Campaigns Information",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: () => handleExport("csv"),
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: () => handleExport("xlsx"),
                },
              ],
              searchBar: true,
            },
            footer: { nextPrevBtn: true, pagination: true },
            rowSelection: true,
            pageSize: 50,
            table: {
              height: "400px"
            },
            columns: [
              {
                key: "code",
                label: "Campaign Code",
              },
              {
                key: "merchandiser",
                label: "Merchandiser",
                render: (row) => row?.merchandiser?.name ?? "-",
              },
              {
                key: "customer",
                label: "Customer",
                render: (row) => row?.customer?.owner_name ?? "-",
              },
              {
                key: "feedback",
                label: "Feedback",
                render: (row) => row?.feedback ?? "-",
              },
              {
                key: "images",
                label: "Images",
                render: (row) => {
                  const images =
                    row?.images && typeof row.images === "object"
                      ? Object.values(row.images)
                        .filter((img): img is string => typeof img === "string")
                        .map((img) => `${IMAGE_BASE_URL}${img}`)
                      : [];

                  if (images.length === 0) {
                    return <span className="text-gray-400">No images</span>;
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => openImageModal(images, 0)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      View Images ({images.length})
                    </button>
                  );
                },
              }
            ],
          }}
        />

        {/* 🔥 IMAGE PREVIEW MODAL */}
        <ImagePreviewModal
          images={imageModal?.images ?? []}
          isOpen={!!imageModal}
          onClose={closeImageModal}
          startIndex={imageModal?.index ?? 0}
        />
      </div>
    </div>
  );
}
