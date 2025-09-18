"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { addCustomerType, customerTypeList } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as Yup from "yup";

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

  // ✅ Fetch customer type list for dropdown
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

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      customerType: "",
      customerCode: "",
      status: "active",
    },
    validationSchema: Yup.object({
      customerType: Yup.string().required("Customer type is required"),
      customerCode: Yup.string().required("Customer code is required"),
      status: Yup.string().required("Status is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
        console.log("Submitting values:", values);
      try {
        const res = await addCustomerType(values);
        console.log("✅ Customer Type Added:", res);
        alert("Customer type added successfully!");
        resetForm();
      } catch (error) {
        console.error("❌ Add Customer Type failed", error);
        alert("Failed to add customer type");
      }
    },
  });

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

      <form onSubmit={formik.handleSubmit}>
        {/* Customer Type Details */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Customer Type Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Type Dropdown */}
            <InputFields
              name="customerType"
              label="Customer Type"
              value={formik.values.customerType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.customerType && formik.errors.customerType}
              options={customerTypes}
            />

            {/* Customer Code */}
            <InputFields
              name="customerCode"
              label="Customer Code"
              value={formik.values.customerCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.customerCode && formik.errors.customerCode}
            />

            {/* Status */}
            <InputFields
              name="status"
              label="Status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && formik.errors.status}
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
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 bg-red-600 text-white-500 text-gray-700 hover:bg-gray-100"
            type="submit"
           
          >
            submit
          </button>
        </div>
      </form>
    </>
  );
}
