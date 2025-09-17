"use client";

import { useState, useEffect } from "react";
import { listCountries, addRegion } from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";

interface Country {
  id: number;
  country_name: string;
}

export default function AddRegion() {
  const [regionName, setRegionName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [status, setStatus] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data: Country[] = await listCountries();
        const options = data.map((c) => ({ value: c.id.toString(), label: c.country_name }));
        setCountries(options);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };
    fetchCountries();
  }, []);

  const handleSubmit = async () => {
    if (!regionName || !countryId) {
      alert("Please fill all fields!");
      return;
    }
    setLoading(true);
    try {
      const res = await addRegion(regionName, countryId, status === "1" ? 1 : 0);
      if (res.status) {
        alert("Region added successfully ✅");
        setRegionName("");
        setCountryId("");
        setStatus("1");
      } else {
        alert("Failed to add region ❌");
      }
    } catch (err) {
      console.error("Add region failed:", err);
      alert("Error adding region");
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/settings/region">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Region</h1>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputFields label="Region Name" value={regionName} onChange={(e) => setRegionName(e.target.value)} />
          <InputFields
            label="Country"
            type="select"
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            options={countries}
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
      </div>

      <div className="flex justify-end gap-4">
        <button
          className="px-6 py-2 border rounded-lg"
          onClick={() => {
            setRegionName("");
            setCountryId("");
            setStatus("1");
          }}
        >
          Cancel
        </button>
        <SidebarBtn label={loading ? "Submitting..." : "Submit"} isActive onClick={handleSubmit} />
      </div>
    </div>
  );
}
