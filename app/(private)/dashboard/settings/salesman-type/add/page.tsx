"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";

import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addSalesmanType } from "@/app/services/allApi";

export default function SalesmanType() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  type SalesmanTypeForm = {
    salesman_type_code: string;
    salesman_type_name: string;
    salesman_type_status: string;
  };

  const initialValues: SalesmanTypeForm = {
    salesman_type_code: "",
    salesman_type_name: "",
    salesman_type_status: "",
  };

  // ✅ Yup Validation Schema
  const validationSchema = Yup.object({
    salesman_type_code: Yup.string()
      .required("Salesman Type Code is required")
      .max(10, "Max 10 characters allowed"),
    salesman_type_name: Yup.string()
      .required("Salesman Type Name is required")
      .max(50, "Max 50 characters allowed"),
    salesman_type_status: Yup.string().required("Status is required"),
  });

  const handleSubmit = async (
    values: SalesmanTypeForm,
    { setSubmitting }: FormikHelpers<SalesmanTypeForm>
  ) => {
    try {
      const payload = { ...values };
      console.log("vvv", values);

      const res = await addSalesmanType(payload);

      showSnackbar("Salesman Type added successfully ", "success");
      console.log("API response ✅:", res);
      router.push("/dashboard/settings/salesman-type");
    } catch (error) {
      console.error("Error submitting User ❌:", error);
      showSnackbar("Failed to submit form", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/country">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Salesman Type
          </h1>
        </div>
      </div>

      {/* ✅ Formik with Yup validation */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Salesman Type Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Salesman Code */}
                  <div className="flex flex-col max-w-[406px]">
                    <div className="flex items-end gap-2">
                      <div className="w-full">
                        <InputFields
                          label="Salesman Type Code"
                          value={values.salesman_type_code}
                          onChange={(e) =>
                            setFieldValue("salesman_type_code", e.target.value)
                          }
                        />
                      </div>
                      <IconButton
                        bgClass="white"
                        className="mb-2 cursor-pointer text-[#252B37]"
                        icon="mi:settings"
                        onClick={() => setIsOpen(true)}
                      />
                      <SettingPopUp
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Salesman Code"
                      />
                    </div>
                    {errors.salesman_type_code && touched.salesman_type_code && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.salesman_type_code}
                      </div>
                    )}
                  </div>

                  {/* Salesman Name */}
                  <div>
                    <InputFields
                      label="Salesman Type Name"
                      value={values.salesman_type_name}
                      onChange={(e) =>
                        setFieldValue("salesman_type_name", e.target.value)
                      }
                    />
                    {errors.salesman_type_name && touched.salesman_type_name && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.salesman_type_name}
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <InputFields
                      label="Status"
                      type="select"
                      name="salesman_type_status"
                      value={values.salesman_type_status}
                      onChange={(e) =>
                        setFieldValue("salesman_type_status", e.target.value)
                      }
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                    />
                    {errors.salesman_type_status &&
                      touched.salesman_type_status && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.salesman_type_status}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
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
          </Form>
        )}
      </Formik>
    </div>
  );
}
