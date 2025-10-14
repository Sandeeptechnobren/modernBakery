"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { getPlanogramById } from "@/app/services/merchandiserApi";

interface Planogram {
  id: number;
  uuid: string;
  code: string;
  name: string;
  valid_from: string;
  valid_to: string;
  merchendisher: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
  };
  created_at: string;
}

export default function ViewPage() {
  const params = useParams();
  console.log(params.uuid,"rajneesh")
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] || "" : (params.id as string) || "";

  const [planogram, setPlanogram] = useState<Planogram | null>(null);
console.log(planogram,"datafhsdaghsa")
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

 useEffect(() => {
  if (!uuid) return;

  const fetchPlanogram = async () => {
    setLoading(true);
    try {
      const res = await getPlanogramById(uuid);
      console.log("Planogram API response:", res);

      if (!res) {
        showSnackbar("Unable to fetch planogram details", "error");
        return;
      }

      setPlanogram(res);
    } catch (error) {
      showSnackbar("Unable to fetch planogram details", "error");
    } finally {
      setLoading(false);
    }
  };

  fetchPlanogram();
}, [uuid, setLoading, showSnackbar]);

  if (!planogram) return <div>Loading planogram...</div>;

  return (
    <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
      {/* Left Section */}
      <div>
        <ContainerCard className="w-[350px] flex flex-col items-center gap-y-[20px] p-[20px]">
          <span className="text-[#181D27] text-[20px] font-semibold text-center">
            {planogram?.code || "-"} - {planogram?.name || "-"}
          </span>
        </ContainerCard>
      </div>

      {/* Right Section */}
      <div className="w-full flex flex-col gap-y-[20px]">
        <ContainerCard className="w-full h-fit">
          <KeyValueData
            title="Planogram Information"
            data={[
              { key: "Merchendisher", value: planogram?.merchendisher.name || "-" },
              { key: "Valid From", value: planogram?.valid_from || "-" },
              { key: "Valid To", value: planogram?.valid_to || "-" },
              { key: "Created At", value: planogram?.created_at || "-" },
            ]}
          />
        </ContainerCard>
      </div>
    </div>
  );
}
