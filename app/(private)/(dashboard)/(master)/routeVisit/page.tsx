"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";

export default function RoutevisitPlan() {
  const router = useRouter();

  const [form, setForm] = useState({
    customer_type: "1",
    from_date: "",
    to_date: "",
    status: "1", // store as string for consistency with radio inputs
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSingleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.from_date) newErrors.from_date = "From Date is required";
    if (!form.to_date) newErrors.to_date = "To Date is required";
    if (!form.customer_type)
      newErrors.customer_type = "Customer Type is required";
    if (!form.status) newErrors.status = "Status is required";

    if (form.from_date && form.to_date) {
      const from = new Date(form.from_date);
      const to = new Date(form.to_date);
      if (to < from) {
        newErrors.to_date = "To Date must be after or equal to From Date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNavigate = (path: string) => {
    if (!validate()) return;

    // Build query string
    const query = new URLSearchParams({
      from_date: form.from_date,
      to_date: form.to_date,
      customer_type: form.customer_type,
      status: form.status,
    }).toString();

    router.push(`${path}?${query}`);
  };

  return (
    <ContainerCard>
      <h1 className="mb-4 text-lg font-semibold">Route Visit Plan</h1>
      <ContainerCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* From Date */}
          <div>
            <InputFields
              required
              label="From Date"
              type="date"
              value={form.from_date}
              onChange={(e) =>
                handleSingleSelectChange("from_date", e.target.value)
              }
              error={errors.from_date}
            />
            {errors.from_date && (
              <p className="text-red-500 text-sm mt-1">{errors.from_date}</p>
            )}
          </div>

          {/* To Date */}
          <div>
            <InputFields
              required
              label="To Date"
              type="date"
              value={form.to_date}
              onChange={(e) =>
                handleSingleSelectChange("to_date", e.target.value)
              }
              error={errors.to_date}
            />
            {errors.to_date && (
              <p className="text-red-500 text-sm mt-1">{errors.to_date}</p>
            )}
          </div>

          {/* Customer Type */}
          <div>
            <InputFields
              required
              label="Customer Type"
              value={form.customer_type}
              onChange={(e) =>
                handleSingleSelectChange("customer_type", e.target.value)
              }
              options={[
                { value: "1", label: "Agent Customer" },
                { value: "2", label: "Merchandiser" },
              ]}
              error={errors.customer_type}
            />
            {errors.customer_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.customer_type}
              </p>
            )}
          </div>

          {/* ✅ Status */}
          <div>
            <InputFields
              required
              label="Status"
              type="radio"
              value={form.status}
              onChange={(e) =>
                handleSingleSelectChange("status", e.target.value)
              }
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
              error={errors.status}
            />
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-6 mt-10">
          <button
            onClick={() => handleNavigate("/routeVisit/add")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Add
          </button>

          <button
            onClick={() => handleNavigate("/routeVisit/bulkUpload")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Bulk Upload
          </button>
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}
