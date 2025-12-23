"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Table, {
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { getPlanogramPost, exportPlanogram } from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { formatDate } from "@/app/(private)/(dashboard)/(master)/salesTeam/details/[uuid]/page";
import ImagePreviewModal from "@/app/components/ImagePreviewModal";

export const PlanogramPost = () => {
    const router = useRouter();
    const params = useParams();
    const planogramUuid = params?.uuid as string; // ✅ FIXED

    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();
    const [refreshKey, setRefreshKey] = useState(0);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imagesToShow, setImagesToShow] = useState<string[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    const IMAGE_BASE_URL =
        "https://api.coreexl.com/osa_developmentV2/public";

    const openImageModal = (images: string[], index = 0) => {
        setImagesToShow(images);
        setStartIndex(index);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setImagesToShow([]);
        setStartIndex(0);
    };

    // 🔥 Fetch planogram post list
    const fetchPlanogramPost = useCallback(
        async (pageNo: number = 1, pageSize: number = 50): Promise<searchReturnType> => {
            if (!planogramUuid) {
                return {
                    data: [],
                    currentPage: 1,
                    pageSize,
                    total: 0,
                };
            }

            const result = await getPlanogramPost(planogramUuid);

            if (result?.error) {
                throw new Error(result?.message || "Failed to fetch planogram posts");
            }

            return {
                data: result?.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.total || 0,
            };
        },
        [planogramUuid]
    );

    // 📦 Export handler
    const handleExport = async (fileType: "csv" | "xlsx") => {
        try {
            setLoading(true);

            const res = await exportPlanogram({ format: fileType });

            let downloadUrl = "";

            if (res?.url?.startsWith("http") || res?.url?.startsWith("blob:")) {
                downloadUrl = res.url;
            } else {
                const blob = new Blob([res], {
                    type:
                        fileType === "csv"
                            ? "text/csv;charset=utf-8;"
                            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                downloadUrl = URL.createObjectURL(blob);
            }

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `planogram_export.${fileType}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showSnackbar(`Exported ${fileType.toUpperCase()} successfully`, "success");
        } catch (err) {
            showSnackbar("Export failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { key: "date", label: "Date", render: (item: any) => formatDate(item.date) },
        { key: "merchendisher_name", label: "Merchandiser" },
        { key: "customer_code", label: "Customer Code" },
        { key: "customer_name", label: "Customer Name" },
        { key: "shelf_name", label: "Distribution Name" },
        {
            key: "images",
            label: "Images",
            render: (item: any) => {
                const images = [item.before_image, item.after_image]
                    .filter(Boolean)
                    .map((img: string) =>
                        img.startsWith("http")
                            ? img
                            : `${IMAGE_BASE_URL}${img}`
                    );

                if (images.length === 0) {
                    return <span className="text-gray-400">No images</span>;
                }

                return (
                    <button
                        onClick={() => openImageModal(images, 0)}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        View Images ({images.length})
                    </button>
                );
            },
        }


    ];

    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: {
                        list: fetchPlanogramPost,
                    },
                    header: {
                        searchBar: false,
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
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    pageSize: 50,
                }}

            />
            <ImagePreviewModal
                images={imagesToShow}
                isOpen={isImageModalOpen}
                onClose={closeImageModal}
                startIndex={startIndex}
            />
        </div>
    );
};
