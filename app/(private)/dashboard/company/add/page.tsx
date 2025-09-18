"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useState, useEffect } from "react";
import { customerTypeList, addCustomerType } from "@/app/services/allApi";

// API response type
type ApiCustomerType = {
  id: string;
  code: string;
  name: string;
  status?: string;
};

export default function AddCustomerType() {
  const [customerTypes, setCustomerTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [formData, setFormData] = useState({
    customerType: "",
    customerCode: "",
    status: "active",
  });


  useEffect(() => {
    const fetchCustomerTypes = async () => {
      try {
        const listRes = await customerTypeList({ page: "1", limit: "200" });
        const options = (listRes.data || []).map((c: ApiCustomerType) => ({
          value: c.id,
          label: c.name,
        }));
        setCustomerTypes(options);
      } catch (error) {
        console.error("Failed to fetch customer types ❌", error);
      }
    };

    fetchCustomerTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await addCustomerType(formData);
      console.log("✅ Customer Type Added:", res);
      alert("Customer type added successfully!");
      setFormData({ customerType: "", customerCode: "", status: "active" });
    } catch (error) {
      console.error("❌ Add Customer Type failed", error);
      alert("Failed to add customer type");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add Customer Type
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Type Details */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Customer Type Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Type Dropdown */}
            <InputFields
              name="customerType"
              label="Customer Type"
              value={formData.customerType}
              onChange={handleChange}
              options={customerTypes}
            />

            {/* Customer Code */}
            <InputFields
              name="customerCode"
              label="Customer Code"
              value={formData.customerCode}
              onChange={handleChange}
            />

            {/* Status Dropdown */}
            <InputFields
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>
        </ContainerCard>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => setFormData({ customerType: "", customerCode: "", status: "active" })}
          >
            Cancel
          </button>
          <SidebarBtn
            label="Submit"
            isActive={true}
            leadingIcon="mdi:check"
            type="submit"
          />
        </div>
      </form>
    </>
  );
}