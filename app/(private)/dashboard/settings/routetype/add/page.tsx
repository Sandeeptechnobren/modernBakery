"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addRouteType } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
// Define the validation schema using Yup
const validationSchema = Yup.object({
  routeTypeName: Yup.string()
    .trim()
    .required("Route Type Name is required")
    .min(3, "Route Type Name must be at least 3 characters")
    .max(50, "Route Type Name cannot exceed 50 characters"),
  status: Yup.string()
    .oneOf(["1", "0"], "Invalid status selected")
    .required("Status is required"),
});

export default function AddRouteType() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter(); // ✅ for redirect

  const formik = useFormik({
    initialValues: {
      routeTypeName: "",
      status: "1",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const res = await addRouteType({
          route_type_name: values.routeTypeName.trim(),
          status: Number(values.status),
        });

        console.log("👉 API Response:", res);

        if (res?.status) {
          showSnackbar("Route Type added successfully ✅", "success");
          resetForm();

          // ✅ Redirect to RouteType list page
          router.push("/dashboard/settings/routetype");
        } else {
          showSnackbar(
            "Failed to add Route Type ❌: " + (res?.message || "Unknown error"),
            "error"
          );
        }
      } catch (err) {
        console.error("Add Route Type error", err);
        showSnackbar("Error adding Route Type ❌", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });
      

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/routetype">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Route Type</h1>
        <h1 className="text-xl font-semibold">Add New Route Type</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Route Type Name Field */}
            <InputFields
              label="Route Type Name"
              type="text"
              name="routeTypeName"
              value={formik.values.routeTypeName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.routeTypeName && formik.errors.routeTypeName
                  ? formik.errors.routeTypeName
                  : ""
              }
            />

            {/* Status Field */}
            <InputFields
              label="Status"
              type="select"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              options={[
                { value: "1", label: "Active" },
                { value: "0", label: "Inactive" },
              ]}
              error={
                formik.touched.status && formik.errors.status
                  ? formik.errors.status
                  : ""
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 border rounded-lg"
              onClick={() => formik.resetForm()}
            >
              Cancel
            </button>

            <SidebarBtn
              type="submit"
              label="Submit"
              isActive
              leadingIcon="mdi:check"
              disabled={formik.isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
