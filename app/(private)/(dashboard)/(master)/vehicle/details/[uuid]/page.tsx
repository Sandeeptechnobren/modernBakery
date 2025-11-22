"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import SummaryCard from "@/app/components/summaryCard";
import { getVehicleById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate } from "../../../salesTeam/details/[uuid]/page";
import { TableDataType } from "@/app/components/customTable";
import TabBtn from "@/app/components/tabBtn";

type Vehicle = {
  id: number;
  vehicle_code: string;
  number_plat: string;
  vehicle_chesis_no: string;
  description: string;
  capacity: string;
  fuel_reading: string;
  vehicle_type: string;
  owner_type: string;
  warehouse_id: number;
  valid_from: string;
  valid_to: string;
  opening_odometer: string;
  status: number;
  vehicle_brand: string;
  warehouse?: {
    id: number;
    warehouse_name: string;
    warehouse_code?: string;
    owner_name?: string;
  };
};

const title = "Vehicle Details";

export default function ViewPage() {
  const params = useParams();
  const uuid =
    Array.isArray(params.uuid) && params.uuid.length > 0
      ? params.uuid[0]
      : (params.uuid as string);

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  const tabList = [
    { key: "info", label: "Vehicle Information" },
    { key: "base", label: "Vehicle Base" },
    // { key: "vehicle", label: "Vehicle" },
  ];

  const onTabClick = (idx: number) => {
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const res = await getVehicleById(uuid);
        setLoading(false);

        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch vehicle details ❌",
            "error"
          );
          return;
        }
        if (!res.status) {
          res.status = 0;
        }
        setVehicle(res.data);
      } catch (err) {
        setLoading(false);
        showSnackbar("Error fetching vehicle details", "error");
      }
    };
    fetchVehicleDetails();
  }, [uuid, setLoading, showSnackbar]);

  const ownerTypeLabel = (ownerType?: string) => {
    if (ownerType === "0") return "Company Owned";
    if (ownerType === "1") return "Contractor";
    return "-";
  };

  const vehicleTypeLabel = (type?: string) => {
    if (!type) return "-";
    const lower = type.toLowerCase();
    if (lower === "truck") return "Truck";
    if (lower === "van") return "Van";
    if (lower === "bike") return "Bike";
    if (lower === "tuktuk") return "Tuktuk";
    return type;
  };

  return (
    <>
      {/* 🔹 Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vehicle">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-[20px]">
        {/* 🔹 Left Summary Card */}
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
            isVertical
          />

          <div className="flex justify-center">
            <StatusBtn isActive={(vehicle?.status ?? 0) > 0} />
          </div>

          <hr className="text-[#D5D7DA]" />

          <div className="flex items-center justify-between w-full">
            <span className="font-medium text-gray-700">Plate Number</span>
            <div className="inline-block bg-[#FFD200] text-black font-bold text-lg uppercase tracking-wider rounded-md border border-black px-4 py-1 shadow-md text-center min-w-[120px]">
              {vehicle?.number_plat ?? "-"}
            </div>
          </div>
        </ContainerCard>

        {/* 🔹 Right Detailed Info */}
        <div className="w-full flex flex-col gap-[20px]">
          {/* Tabs */}
          <ContainerCard
            className="w-full flex gap-[4px] overflow-x-auto"
            padding="5px"
          >
            {tabList.map((tab, index) => (
              <div key={index}>
                <TabBtn
                  label={tab.label}
                  isActive={activeTab === tab.key}
                  onClick={() => onTabClick(index)}
                />
              </div>
            ))}
          </ContainerCard>

          {activeTab === "info" && (
            <ContainerCard className="w-full mb-[20px] ">
              <KeyValueData
                title="Vehicle Information"
                data={[
                  { key: "Vehicle Brand", value: vehicle?.vehicle_brand || "-" },
                  { key: "Number Plate", value: vehicle?.number_plat || "-" },
                  { key: "Chassis Number", value: vehicle?.vehicle_chesis_no || "-" },
                  { key: "Vehicle Type", value: vehicleTypeLabel(vehicle?.vehicle_type) },
                  { key: "Description", value: vehicle?.description || "-" },
                  { key: "Owner Type", value: ownerTypeLabel(vehicle?.owner_type) },
                ]}
              />
            </ContainerCard>
          )}

          {activeTab === "base" && (
            <ContainerCard className="w-full mb-[20px]">
              <KeyValueData
                title="Vehicle Base"
                data={[
                  { key: "Distributor", value: vehicle?.warehouse?.warehouse_name || "-" },
                  { key: "Valid From", value: vehicle?.valid_from ? formatDate(vehicle?.valid_from as string) : "-" },
                  { key: "Valid To", value: vehicle?.valid_to ? formatDate(vehicle?.valid_to as string) : "-" },
                  { key: "Capacity", value: vehicle?.capacity || "-" },
                  { key: "Fuel Reading", value: vehicle?.fuel_reading || "-" },
                  { key: "Opening Odometer", value: vehicle?.opening_odometer || "-" },
                ]}
              />
            </ContainerCard>
          )}

          {/* {activeTab === "vehicle" && (
            <ContainerCard className="w-full">
              <KeyValueData
                title="Vehicle"
                data={[
                  { key: "Capacity", value: vehicle?.capacity || "-" },
                  { key: "Fuel Reading", value: vehicle?.fuel_reading || "-" },
                  { key: "Opening Odometer", value: vehicle?.opening_odometer || "-" },
                ]}
              />
            </ContainerCard>
          )} */}
        </div>
      </div>
    </>
  );
}
