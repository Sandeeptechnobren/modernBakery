"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
// import { pricingHeaderById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Your static mapping
const initialKeys = [
  {
    type: "Location",
    options: [
      { id: "1", label: "Company", isSelected: false },
      { id: "2", label: "Region", isSelected: false },
      { id: "3", label: "Warehouse", isSelected: false },
      { id: "4", label: "Area", isSelected: false },
      { id: "5", label: "Route", isSelected: false },
    ],
  },
  {
    type: "Customer",
    options: [
      { id: "6", label: "Customer Type", isSelected: false },
      { id: "7", label: "Channel", isSelected: false },
      { id: "8", label: "Customer Category", isSelected: false },
      { id: "9", label: "Customer", isSelected: false },
    ],
  },
  {
    type: "Item",
    options: [
      { id: "10", label: "Item Category", isSelected: false },
      { id: "11", label: "Item", isSelected: false },
    ],
  },
];

// Build mapping object for quick lookup
const keyIdLabelMap: Record<number, string> = {};
initialKeys.forEach(group => {
  group.options.forEach(opt => {
    keyIdLabelMap[Number(opt.id)] = opt.label;
  });
});

function getDescriptionLabels(desc: number[] | string): string {
  let descArray: number[] = [];
  if (Array.isArray(desc)) {
    descArray = desc;
  } else if (typeof desc === "string") {
    descArray = desc.split(",").map(x => Number(x.trim())).filter(Boolean);
  }
  return descArray.map(id => keyIdLabelMap[id] || id).join(", ");
}

interface PricingItem {
  uuid?: string;
  id?: number | string;
  code?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: number[] | string;
  status?: string;
}

interface OverviewProps {
  pricing: PricingItem | null;
}

export default function Overview({ pricing }: OverviewProps) {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

  const [isChecked, setIsChecked] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  // useEffect(() => {
  //   if (!uuid) return;

  //   const fetchPricingDetails = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await pricingHeaderById(uuid);
  //       if (res.error) {
  //         showSnackbar(
  //           res.data?.message || "Unable to fetch pricing Details",
  //           "error"
  //         );
  //         return;
  //       }
  //       setpricing(res.data);
  //     } catch (error) {
  //       showSnackbar("Unable to fetch pricing Details", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPricingDetails();
  // }, [uuid, setLoading, showSnackbar]);

 return (
    <>
      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
        <div className="w-full flex flex-col gap-y-[20px]">
          <ContainerCard className="w-full">
            <KeyValueData
              data={[
                { key: "Code", value: pricing?.code || "-" },
                { key: "Name", value: pricing?.name || "-" },
                { key: "Start Date", value: pricing?.start_date || "-" },
                { key: "End Date", value: pricing?.end_date || "-" },
                { key: "Description", value: pricing?.description ? getDescriptionLabels(pricing.description) : "-" }
              ]}
            />
          </ContainerCard>
        </div>
      </div>
    </>
  );
}
