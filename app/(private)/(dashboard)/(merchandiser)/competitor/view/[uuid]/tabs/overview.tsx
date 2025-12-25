"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getCompititorById } from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";
import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import ImagePreviewModal from "@/app/components/ImagePreviewModal";

// --- Type Definitions ---
type CompititorData = {
  company_name?: string;
  brand?: string | number;
  item_name?: string | number;
  price?: string | number;
  promotion?: string;
  uuid?: string;
  id?: number;
  notes?: string;
  merchendiser_info?: string;
  merchendiser_ids?: number[];
  created_by?: number;
  created_at?: string;
  image?: {
    image1?: string;
    image2?: string;
  };
};

export const OverviewTab = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [compititorData, setCompititorData] = useState<CompititorData | null>(null);
  const [loading, setLoading] = useState(true);
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


  const IMAGE_BASE_URL =
    "https://api.coreexl.com/osa_developmentV2/public";

  useEffect(() => {
    if (!uuid) return;

    const fetchCompitor = async () => {
      try {
        setLoading(true);
        const response = await getCompititorById(uuid);
        const data = response?.data?.data || response?.data;
        setCompititorData(data);
      } catch (error) {
        console.error("Error fetching Compititor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompitor();
  }, [uuid]);

  const allImageFiles: string[] =
    compititorData?.image
      ? [
        compititorData.image.image1
          ? `${IMAGE_BASE_URL}${compititorData.image.image1}`
          : null,
        compititorData.image.image2
          ? `${IMAGE_BASE_URL}${compititorData.image.image2}`
          : null,
      ].filter(Boolean) as string[]
      : [];


  const getFileView = (file?: string | null) =>
    file ? (
      <button
        className="text-blue-600 underline hover:text-blue-800 transition"
        onClick={() =>
          openImageModal(allImageFiles, allImageFiles.indexOf(file))
        }
      >
        View Image
      </button>
    ) : (
      "-"
    );


  if (loading) return <Loading />;
  if (!compititorData)
    return <div className="text-red-500">No Compititor data available</div>;



  return (
    <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
      <div className="w-full flex flex-col ">
        <ContainerCard className="w-full h-fit">
          <KeyValueData
            title="Compititor Details"
            data={[
              { key: "Company Name", value: compititorData?.company_name || "-" },
              { key: "Brand", value: compititorData?.brand || "-" },
              { key: "Item Name", value: compititorData?.item_name || "-" },
              { key: "Promotion", value: compititorData?.promotion || "-" },
              { key: "Notes", value: compititorData?.notes || "-" },
              //   { key: "Merchendiser Info", value: compititorData?.merchendiser_info || "-" },
              {
                key: "Merchandiser Info",
                value:
                  typeof compititorData?.merchendiser_info === "object" &&
                    compititorData?.merchendiser_info !== null
                    ? `${(compititorData.merchendiser_info as { name?: string; osa_code?: string }).name || "-"}`
                    : "-",
              },
              {
                key: "Image",
                value: getFileView(
                  compititorData?.image?.image1
                    ? `${IMAGE_BASE_URL}${compititorData.image.image1}`
                    : null
                ),
              },
            ]}
          />
          {/* {compititorData?.image && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Competitor Images</h3>
              <div className="flex gap-4 flex-wrap">
                {compititorData?.image?.image1 && (
                  <img
                    src={`https://api.coreexl.com/osa_developmentV2/public${compititorData.image.image1}`}
                    alt="Competitor Image 1"
                    className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                  />
                )}
                {compititorData?.image?.image2 && (
                  <img
                    src={`https://api.coreexl.com/osa_developmentV2/public${compititorData.image.image2}`}
                    alt="Competitor Image 2"
                    className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>
            </div>
          )} */}
          <ImagePreviewModal
            images={imageModal?.images ?? []}
            isOpen={!!imageModal}
            onClose={closeImageModal}
            startIndex={imageModal?.index ?? 0}
          />

        </ContainerCard>
      </div>
    </div>
  );
};
