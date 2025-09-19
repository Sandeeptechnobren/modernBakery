"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import { useState, useEffect, ChangeEvent } from "react";
import { addSubRegion, subRegionList } from "@/app/services/allApi";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

interface RegionOption {
  label: string;
  value: string;
}

interface InputFieldsProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
}

function InputFields({ name, label, value, onChange, options }: InputFieldsProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor={name}>
        {label}
      </label>
      {options ? (
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          className="border px-3 py-2 rounded w-full"
          required
        >
          {options.map((option) => (
            <option key={option.value + option.label} value={option.value} disabled={option.value === ""}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          className="border px-3 py-2 rounded w-full"
          required
        />
      )}
    </div>
  );
}

export default function AddCustomer() {
  const [companyName, setCompanyName] = useState<string>("");
  const [status, setStatus] = useState<string>("1"); // default to "Active"
  const [region, setRegion] = useState<string>(""); // will hold either id or area_code
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await subRegionList();
        // Build label/value robustly: prefer a human name and prefer an id for the value if present
        const options: RegionOption[] = (res?.data || [])
          .map((r: any) => ({
            label:
              r.area_code ||
              r.code ||
              r.area_code ||
              r.code ||
              r.label ||
              (r.id ? `#${r.id}` : "") ||
              "",
            value: String(r.id ?? r.area_code ?? r.code ?? r.value ?? ""),
          }))
          .filter((option) => option.value && option.label);

        setRegionOptions(options);
      } catch (error) {
        console.error("Failed to fetch regions", error);
      }
    };
    fetchRegions();
  }, []);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      alert("Please enter SubRegion Name!");
      return;
    }

    if (!region) {
      alert("Please select a Region!");
      return;
    }

    // Build payload with multiple possible field names so backend validation passes:
    const payload: any = {
      area_name: companyName.trim(),
      status: Number(status), // ensure numeric (many APIs expect 0/1)
      // include the raw region selection as area_code (if backend expects a code)
      area_code: region,
      // include a 'region' field too (if backend expects that)
      region: region,
    };

    // If the selected region looks numeric, also include region_id (some APIs expect an id)
    if (/^\d+$/.test(region)) {
      payload.region_id = Number(region);
    }

    console.log("Sending addSubRegion payload:", payload);

    try {
      await addSubRegion(payload);
      alert("Subregion added successfully!");
      // reset (optional)
      setCompanyName("");
      setStatus("1");
      setRegion("");
    } catch (error: any) {
      console.error("Add Subregion failed ❌", error);

      // Better error alerting dependent on error structure
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string" ? error.response.data : null);

      if (serverMessage) {
        alert(`Failed to add subregion: ${serverMessage}`);
      } else if (error?.message) {
        alert(`Failed to add subregion: ${error.message}`);
      } else {
        alert("Failed to add subregion!");
      }
    }
  };

  const handleCompanyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value);
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/settings/company/subRegion">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add New Sub Region
          </h1>
        </div>
      </div>

      <div>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Sub Region Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
              name="companyName"
              label="SubRegion Name"
              value={companyName}
              onChange={handleCompanyNameChange}
            />
            <InputFields
              name="status"
              label="Status"
              value={status}
              onChange={handleStatusChange}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
            />
            <InputFields
              name="region"
              label="Region"
              value={region}
              onChange={handleRegionChange}
              options={[{ value: "", label: "Select Region" }, ...regionOptions]}
            />
          </div>
        </ContainerCard>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
          type="button"
          onClick={() => {
            // simple cancel: reset
            setCompanyName("");
            setStatus("1");
            setRegion("");
          }}
        >
          Cancel
        </button>
        <SidebarBtn label="Submit" isActive={true} leadingIcon="mdi:check" onClick={handleSubmit} />
      </div>
    </>
  );
}
