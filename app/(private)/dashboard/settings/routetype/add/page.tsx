"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { routeTypeList, addRouteType } from "@/app/services/allApi";

// ✅ RouteType interface matches API
interface RouteTypeOption {
  route_type_code: string;
  route_type_name: string;
  status: number; // 1 = Active, 0 = Inactive
}

export default function AddRouteType() {
  const [routeTypes, setRouteTypes] = useState<RouteTypeOption[]>([]);
  const [routeType, setRouteType] = useState(""); // selected route type code
  const [status, setStatus] = useState("1"); // default Active

  // ✅ Fetch all route types from API
  useEffect(() => {
    const fetchRouteTypes = async () => {
      try {
        const res = await routeTypeList();
        const dataArray: RouteTypeOption[] = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setRouteTypes(dataArray);
      } catch (err) {
        console.error("Failed to fetch route types", err);
      }
    };
    fetchRouteTypes();
  }, []);

  // ✅ Submit handler with correct property names
  const handleSubmit = async () => {
    if (!routeType) return alert("Please select a Route Type");

    const selected = routeTypes.find((r) => r.route_type_code === routeType);
    if (!selected) return alert("Invalid Route Type selected");

    try {
      const res = await addRouteType({
        route_type_code: selected.route_type_code,
        route_type_name: selected.route_type_name,
        status: Number(status),
      });

      if (res.status) {
        alert("Route Type added successfully ✅");
        setRouteType("");
        setStatus("1");
      } else {
        alert("Failed to add Route Type ❌: " + res.message);
      }
    } catch (err) {
      console.error("Add Route Type error", err);
      alert("Error adding Route Type ❌");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/routetype">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Route Type</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputFields
            label="Route Type"
            type="select"
            value={routeType}
            onChange={(e) => setRouteType(e.target.value)}
            options={routeTypes.map((r) => ({
              value: r.route_type_code,
              label: r.route_type_name,
            }))}
       
          />

          <InputFields
            label="Status"
            type="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "1", label: "Active" },
              { value: "0", label: "Inactive" },
            ]}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 border rounded-lg"
            onClick={() => {
              setRouteType("");
              setStatus("1");
            }}
          >
            Cancel
          </button>

          <SidebarBtn
            label="Submit"
            isActive
            leadingIcon="mdi:check"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
