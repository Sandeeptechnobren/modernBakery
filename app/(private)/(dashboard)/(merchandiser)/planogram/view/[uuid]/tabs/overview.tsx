"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getPlanogramById } from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";
import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";

// --- Type Definitions ---
type planogramfData = {
  name?: string;
  valid_from?: string;
  valid_to?: string;
  uuid?: string;
  id?: number;
  code?: string;
  customer_ids?: number[];
  merchendiser_ids?: number[];
  created_by?: number;
  created_at?: string;
};

export const OverviewTab = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [planogramData, setShelfData] = useState<planogramfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageObjects, setImageObject] = useState<
    { shelf_id: number; image: string }[]
  >([]);
  const [images, setImages] = useState<string[]>([]);


  useEffect(() => {
    if (!uuid) return;

    const fetchPlanogramfData = async () => {
      try {
        setLoading(true);
        const response = await getPlanogramById(uuid);
        const data = response?.data?.data || response?.data;

        setImages(data?.images || []);
        setShelfData(data);
      } catch (error) {
        console.error("Error fetching planogram data:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchPlanogramfData();
  }, [uuid]);

  console.log(imageObjects);

  if (loading) return <Loading />;
  if (!planogramData)
    return <div className="text-red-500">No shelf data available</div>;

  return (
    <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
      <div className="w-full flex flex-col gap-y-[20px]">
        <ContainerCard className="w-full h-fit">
          <KeyValueData
            title="Planogram Details"
            data={[
              { key: " Name", value: planogramData?.name || "-" },
              {
                key: "Valid From",
                value: planogramData?.valid_from
                  ? planogramData.valid_from.slice(0, 10)
                  : "-",
              },
              {
                key: "Valid To",
                value: planogramData?.valid_to
                  ? planogramData.valid_to.slice(0, 10)
                  : "-",
              },
            ]}
          />
        </ContainerCard>
        <ContainerCard>
          {images.length > 0 ? (
            <div className="flex gap-4 flex-wrap">
              {images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Planogram image ${index + 1}`}
                  className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No images available.</p>
          )}
        </ContainerCard>

      </div>
    </div>
  );
};
