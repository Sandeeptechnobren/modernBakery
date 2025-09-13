"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";

export default function AddVehicle() {
  const [isOpen, setIsOpen] = useState(false)
  const [vehicleCode, setVehicleCode] = useState("");
  const [numberPlate, setNumberPlate] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [ownerType, setOwnerType] = useState("");
  const [reference, setReference] = useState("");
  const [routeType, setRouteType] = useState("");
  const [odoMeter, setOdoMeter] = useState("");
  const [status, setStatus] = useState("");
  return (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/master/vehicle">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add New Vehicle
          </h1>
        </div>
      </div>

      <div>
        <form className="space-y-8">
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Vehicle Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-end gap-2 max-w-[406px]">
                  <InputFields
                    label="Vehicle Code"
                    value={vehicleCode}
                    onChange={(e) => setVehicleCode(e.target.value)}
                  />

                  <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]"
                    icon="mi:settings"
                    onClick={() => setIsOpen(true)}
                  />

                  <SettingPopUp
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Vehicle Code"
                  />
                </div>

                <div>
                  <InputFields
                    label="Vehicle Brand"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                  />
                </div>
                <div>
                  <InputFields
                    label="Number Plate"
                    value={numberPlate}
                    onChange={(e) => setNumberPlate(e.target.value)}
                  />

                </div>
                <div>
                  <InputFields
                    label="Chassis Number"
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value)}
                  />

                </div>
                <div>
                  <InputFields
                    label="Vehicle Type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    options={[
                      { value: "tuktuk", label: "Tuktuk" },
                      { value: "truck", label: "Truck" },
                      { value: "bike", label: "Bike" },
                      { value: "van", label: "Van" },
                    ]}
                  />
                </div>

              </div>
            </div>
          </div>
          {/* Location Information */}
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Location Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputFields
                    label="Owner Type"
                    value={ownerType}
                    onChange={(e) => setOwnerType(e.target.value)}
                    options={[
                      { value: "central", label: "Central" },
                      { value: "warehouse", label: "Warehouse" },
                    ]}
                  />
                </div>
                <div>
                  <InputFields
                    label="Reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    options={[
                      { value: "warehouseA", label: "Warehouse A" },
                      { value: "warehouseB", label: "Warehouse B" },
                      { value: "warehouseC", label: "Warehouse C" },
                      { value: "warehouseD", label: "Warehouse D" },
                    ]}
                  />
                </div>
                <div>
                  <InputFields
                    label="Route Type"
                    value={routeType}
                    onChange={(e) => setRouteType(e.target.value)}
                    options={[
                      { value: "route1", label: "Route 1" },
                      { value: "route2", label: "Route 2" },
                      { value: "route3", label: "Route 3" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 ">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputFields
                    label="Odo Meter"
                    value={odoMeter}
                    onChange={(e) => setOdoMeter(e.target.value)}
                  />

                </div>
                <div>
                  <InputFields
                    label="Capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />

                </div>
                <div>
                  <InputFields
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inActive", label: "In Active" },
                    ]}
                  />

                </div>

              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4  pr-0">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <SidebarBtn
              label="Submit"
              isActive={true}
              leadingIcon="mdi:check"   // checkmark icon
              onClick={() => console.log("Form submitted ✅")} />
          </div>
        </form>
      </div>
    </>
  );
}