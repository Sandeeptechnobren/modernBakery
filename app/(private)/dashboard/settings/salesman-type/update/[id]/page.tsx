"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getSalesmanTypeById,
  updateSalesmanType, // ✅ better naming for update function
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";

import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";

// ✅ Yup Validation Schema
const SalesmanSchema = Yup.object().shape({
  salesman_type_code: Yup.string().required("Salesman Type Code is required."),
  salesman_type_name: Yup.string().required("Salesman Type Name is required."),
  salesman_type_status: Yup.string().required("Status is required."),
});

type SalesmanTypeForm = {
  salesman_type_code: string;
  salesman_type_name: string;
  salesman_type_status: string;
};

export default function UpdateSalesmanTypePage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { id } = useParams<{ id: string }>();

  const [initialValues, setInitialValues] = useState<SalesmanTypeForm>({
    salesman_type_code: "",
    salesman_type_name: "",
    salesman_type_status: "1", // default active
  });

  // ✅ Fetch existing salesman type by id
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await getSalesmanTypeById(String(id));
        const data = res.data;
        console.log("RRRR",data)
        setInitialValues({
          salesman_type_code: data.salesman_type_code ?? "",
          salesman_type_name: data.salesman_type_name ?? "",
          salesman_type_status: data.salesman_type_status ?? "1",
        });
      } catch (err) {
        console.error("Failed to fetch salesman type:", err);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Submit update
  const handleSubmit = async (
    values: SalesmanTypeForm,
    { setSubmitting }: FormikHelpers<SalesmanTypeForm>
  ) => {
    try {
      await updateSalesmanType(String(id), values);
      showSnackbar("Salesman Type updated successfully ✅", "success");
      router.push("/dashboard/settings/salesman-type");
    } catch (err) {
      console.error("Update failed:", err);
      showSnackbar("Failed to update ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/salesman-type">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Update Salesman Type
          </h1>
        </div>
      </div>

      {/* ✅ Formik */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={SalesmanSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Salesman Type Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Salesman Type Code */}
                  <div>
                    <InputFields
                      label="Salesman Type Code"
                      name="salesman_type_code"
                      value={values.salesman_type_code}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="salesman_type_code"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Salesman Type Name */}
                  <div>
                    <InputFields
                      label="Salesman Type Name"
                      name="salesman_type_name"
                      value={values.salesman_type_name}
                      onChange={handleChange}
                    />
                    <ErrorMessage
                      name="salesman_type_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <InputFields
                      label="Status"
                      type="select"
                      name="salesman_type_status"
                      value={values.salesman_type_status}
                      onChange={handleChange}
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                    />
                    <ErrorMessage
                      name="salesman_type_status"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard/settings/salesman-type")}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <SidebarBtn
                label="Update"
                isActive={true}
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
