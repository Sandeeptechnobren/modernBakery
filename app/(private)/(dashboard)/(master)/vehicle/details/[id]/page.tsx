
"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import StatusBtn from "@/app/components/statusBtn2";
import SummaryCard from "@/app/components/summaryCard";
import { getVehicleById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Vehicle = {
  number_plat: string;
  vehicle_brand: string;
  vehicle_code: string;
  plate_number: string;
  capacity: string;
  valid_from: string;
  valid_to: string;
  description: string;
  opening_odometer: string;
  vender_details: string[] | { id: number; name: string; code: string }[];
  manufacturer: string;
  country_id: number;
  type_name: string;
  sap_code: string;
  status: string | number;
  is_assign: number;
  customer_id: number;
  agreement_id: number;
  document_type: string;
  document_id: number;
};

const title = "Vehicle Details";

export default function ViewPage() {
  const params = useParams();
  let id: string = "";
  if (params.id) {
    id = Array.isArray(params.id) ? params.id[0] || "" : (params.id as string);
  }

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const { onlyCountryOptions, vendorOptions } = useAllDropdownListData();

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      setLoading(true);
      const res = await getVehicleById(id);
      setLoading(false);

      if (res.error) {
        showSnackbar(
          res.data.message || "Unable to fetch Vehicle Details",
          "error"
        );
        return;
      }
      setVehicle(res.data);
    };
    fetchVehicleDetails();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vehicle">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[20px]">
        {/* Left summary card */}
        <ContainerCard className="lg:w-[500px] space-y-[30px] p-[30px] h-fit">
          <SummaryCard
            icon="lucide:truck"
            iconWidth={40}
            iconCircleTw="flex items-center justify-center bg-[#E9EAEB] text-[#535862] w-[80px] h-[80px]"
            title={
              <span className="text-[20px] font-semibold">
                {vehicle?.vehicle_brand || "-"}
              </span>
            }
            description={`Vehicle Code: ${vehicle?.vehicle_code ?? "-"}`}
            isVertical={true}
          />

          <div className="flex justify-center">
            <StatusBtn isActive={!!vehicle?.status} />
          </div>

          <hr className="text-[#D5D7DA]" />


<div className="flex items-center justify-between w-full">
  <span className="font-medium text-gray-700">Plate Number</span>
  <div className="inline-block bg-[#FFD200] text-black font-bold text-lg tracking-wider rounded-md border border-black px-4 py-1 shadow-md text-center min-w-[120px]">
    {vehicle?.number_plat ?? "-"}
  </div>
</div>

        </ContainerCard>

        {/* Right details card */}
        <ContainerCard className="w-full">
          <KeyValueData
            title="Vehicle Information"
            data={[
              { value: vehicle?.capacity ?? "-", key: "Capacity", icon: "lucide:package" },
              { value: vehicle?.sap_code ?? "-", key: "ERP Code", icon: "lucide:file-text" },
              { value: vehicle?.description ?? "-", key: "Vehicle Description", icon: "lucide:truck" },
              { value: vehicle?.valid_from ?? "-", key: "Valid From", icon: "lucide:calendar" },
              { value: vehicle?.valid_to ?? "-", key: "Valid To", icon: "lucide:calendar" },
              { value: vehicle?.opening_odometer ?? "-", key: "Opening Odometer", icon: "lucide:gauge" },
              { value: "Agent", key: "Vehicle Owner", icon: "lucide:user" },
            ]}
          />
        </ContainerCard>
      </div>
    </>
  );
}
