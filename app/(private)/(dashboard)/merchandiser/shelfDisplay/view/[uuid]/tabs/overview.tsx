"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getShelfById } from "@/app/services/merchandiserApi";
import Loading from "@/app/components/Loading";
import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";

// --- Type Definitions ---
type ShelfData = {
  shelf_name?: string;
  height?: string | number;
  width?: string | number;
  depth?: string | number;
  valid_from?: string;
  valid_to?: string;
  status?: number | string;
  // Include other possible fields for completeness
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
  const [shelfData, setShelfData] = useState<ShelfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;

    const fetchShelfData = async () => {
      try {
        setLoading(true);
        const response = await getShelfById(uuid);
        const data = response?.data?.data || response?.data;
        setShelfData(data);
      } catch (error) {
        console.error("Error fetching shelf data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid]);

  if (loading) return <Loading />;
  if (!shelfData)
    return <div className="text-red-500">No shelf data available</div>;

  const isActive =
    shelfData?.status === 1 || shelfData?.status === "1" ? true : false;

  return (
    <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
      <div className="w-full flex flex-col gap-y-[20px]">
        <ContainerCard className="w-full h-fit">
          <KeyValueData
            title="Shelf Details"
            data={[
              { key: "Shelf Name", value: shelfData?.shelf_name || "-" },
              { key: "Height", value: shelfData?.height || "-" },
              { key: "Width", value: shelfData?.width || "-" },
              { key: "Depth", value: shelfData?.depth || "-" },
              {
                key: "Valid From",
                value: shelfData?.valid_from
                  ? shelfData.valid_from.slice(0, 10)
                  : "-",
              },
              {
                key: "Valid To",
                value: shelfData?.valid_to
                  ? shelfData.valid_to.slice(0, 10)
                  : "-",
              },
            ]}
          />
        </ContainerCard>
      </div>
    </div>
  );
};
