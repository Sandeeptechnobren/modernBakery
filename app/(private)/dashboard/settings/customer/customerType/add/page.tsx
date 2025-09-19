"use client";

import { useFormik } from "formik";
import * as Yup from "yup";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { addCustomerType } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

// 🔹 Predefined customer types for dropdown
const customerTypes = [
  { value: "retail", label: "Retail" },
  { value: "wholesale", label: "Wholesale" },
  { value: "corporate", label: "Corporate" },
];

export default function AddCustomerTypePage() {
  const { showSnackbar } = useSnackbar();

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
      try {
        const res = await addCustomerType(values);
        console.log("✅ Customer Type Added:", res);
        showSnackbar("Customer type added successfully!", "success");
        resetForm();
      } catch (error) {
        console.error("❌ Add Customer Type failed", error);
        showSnackbar("Failed to add customer type", "error");
      }
    },
  });

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Add Customer Type
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Customer Type Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Type Dropdown */}
            <InputFields
              type="select"
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
              type="text"
              name="customerCode"
              label="Customer Code"
              value={formik.values.customerCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.customerCode && formik.errors.customerCode}
            />

            {/* Status */}
            <InputFields
              type="select"
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
            onClick={() => formik.resetForm()}
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
