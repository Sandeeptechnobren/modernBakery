"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType as CustomTableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";

const columns = [
  { key: "code", label: "Vehicle Code" },
  { key: "brand", label: "Brand" },
  { key: "numberPlate", label: "Number Plate" },
  { key: "chassisNumber", label: "Chassis Number" },
  { key: "odoMeter", label: "Odo Meter" },
  { key: "vehicleType", label: "Vehicle Type" },
  { key: "capacity", label: "Capacity" },
  { key: "ownerType", label: "Owner Type" },
  { key: "depotLocation", label: "Depot Location" },
  { key: "ownerReference", label: "Owner Reference" },
  { key: "vehicleRoute", label: "Vehicle Route" },
  {
    key: "status",
    label: "Status",
    render: (row: CustomTableDataType) => (
      <span
        className={`text-sm p-1 px-4 rounded-xl text-[12px] ${
          row.status === "Active"
            ? "text-[#027A48] bg-[#ECFDF3]"
            : "text-red-700 bg-red-200"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

interface VehicleApiResponse {
  id: string | number;
  vehicle_code?: string;
  description?: string;
  number_plat?: string;
  vehicle_chesis_no: string;
  opening_odometer?: string;
  vehicle_type?: string;
  capacity?: string;
  owner_type?: string;
  warehouse?: { warehouse_name: string };
  owner_reference?: string;
  vehicle_route?: string;
  status?: number;
}

const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Vehicle() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [vehicles, setVehicles] = useState<CustomTableDataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/vehicles"); // 🔥 replace with your real API
        const data: VehicleApiResponse[] = await res.json();

        const mapped: CustomTableDataType[] = data.map((v) => ({
          id: String(v.id),
          code: v.vehicle_code || "-",
          brand: v.description || "-",
          numberPlate: v.number_plat || "-",
          chassisNumber: v.vehicle_chesis_no || "-",
          odoMeter: v.opening_odometer || "-",
          vehicleType: v.vehicle_type || "-",
          capacity: v.capacity || "-",
          ownerType: v.owner_type || "-",
          depotLocation: v.warehouse?.warehouse_name || "-",
          ownerReference: v.owner_reference || "-",
          vehicleRoute: v.vehicle_route || "-",
          status: v.status === 1 ? "Active" : "Inactive", // ✅ must be string to match Table type
        }));

        setVehicles(mapped);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Vehicle</h1>

        <div className="flex gap-[12px] relative">
          <BorderIconButton
            icon="gala:file-document"
            label="Export CSV"
            labelTw="text-[12px] hidden sm:block"
          />
          <BorderIconButton icon="mage:upload" />
          <BorderIconButton
            icon="ic:sharp-more-vert"
            onClick={() => setShowDropdown(!showDropdown)}
          />

          {showDropdown && (
            <div className="w-[226px] absolute top-[40px] right-0 z-30">
              <CustomDropdown>
                {dropdownDataList.map((link, idx) => (
                  <div
                    key={idx}
                    className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                  >
                    <Icon
                      icon={link.icon}
                      width={link.iconWidth}
                      className="text-[#717680]"
                    />
                    <span className="text-[#181D27] font-[500] text-[16px]">
                      {link.label}
                    </span>
                  </div>
                ))}
              </CustomDropdown>
            </div>
          )}
        </div>
      </div>

      <div className="h-[calc(100%-60px)]">
        {loading ? (
          <Loading />
        ) : (
          <Table
            data={vehicles}
            config={{
              header: {
                searchBar: true,
                columnFilter: true,
                actions: [
                  <SidebarBtn
                    key={0}
                    href="/dashboard/master/vehicle/add"
                    isActive
                    leadingIcon="lucide:plus"
                    label="Add Vehicle"
                    labelTw="hidden sm:block"
                  />,
                ],
              },
              footer: { nextPrevBtn: true, pagination: true },
              columns,
              rowSelection: true,
              pageSize: 10,
            }}
          />
        )}
      </div>
    </>
  );
}
