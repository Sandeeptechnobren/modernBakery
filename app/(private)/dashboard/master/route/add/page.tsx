"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
export default function Route() {
  const [isOpen, setIsOpen] = useState(false);
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [status, setStatus] = useState("");


  return (
    <>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/route">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Route
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">

          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Route Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                  label="Route Code"
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                />

                <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]"
                  icon="mi:settings"
                  onClick={() => setIsOpen(true)}
                />

                <SettingPopUp
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  title="Route Code"
                />
              </div>

              <div>
                <InputFields
                  label="Route Name"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
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
        {/* Location Information */}
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Warehouse"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  options={[
                    { value: "warehouseA", label: "warehouse A" },
                    { value: "warehouseB", label: "warehouse B" },
                    { value: "warehouseC", label: "warehouse C" },
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
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "In Active" },
                  ]}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6  pr-0">
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
      </div>

    </>
  );
}