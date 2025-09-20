"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { addCustomerType } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function AddCustomerTypePage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      status: "active", // default string (we'll convert later)
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      status: Yup.string().required("Status is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        // 🔹 Map status string -> number
        const payload = {
          name: values.name,
          status: values.status === "active" ? 1 : 0,
        };

        const res = await addCustomerType(payload);
        console.log("✅ Add Customer Type response:", res);
        showSnackbar("Customer type added successfully!", "success");
        resetForm();
        router.push("/dashboard/settings/customer/customerType");
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
       <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/settings/customer/customerType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add Customer Type
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Customer Type Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Name */}
            <InputFields
              type="text"
              name="name"
              label="Customer Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
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
