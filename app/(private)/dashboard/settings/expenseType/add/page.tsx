
"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addExpenseType } from "@/app/services/allApi";

const ExpensetypeSchema = Yup.object().shape({
  expense_type_name: Yup.string().required("Expense Name is required."),
  expense_type_status: Yup.string().required("Status is required."),
});

export default function AddExpenseType() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  type expenseTypeFormValues = {
    expense_type_name: string;
    expense_type_status: string;
  };

  const initialValues: expenseTypeFormValues = {
    expense_type_name: "",
    expense_type_status: "1",
  };

  const handleSubmit = async (
    values: expenseTypeFormValues,
    { setSubmitting }: FormikHelpers<expenseTypeFormValues>
  ) => {
    try {
      const payload = {
        expense_type_name: values.expense_type_name,
        expense_type_status: values.expense_type_status === "1" ? 1 : 0,
      };
      const res = await addExpenseType(payload);
      showSnackbar("Expense Type added successfully ", "success");
      router.push("/dashboard/settings/expenseType");
    } catch (error) {
      console.error("Error submitting expense type ❌:", error);
      showSnackbar("Failed to submit form", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/expenseType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Expense Type
          </h1>
        </div>
      </div>

      {/* ✅ Formik + Yup */}
      <Formik
        initialValues={initialValues}
        validationSchema={ExpensetypeSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Expense Type Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <InputFields 
required
                      label="Expense Type Name"
                      value={values.expense_type_name}
                      onChange={(e) =>
                        setFieldValue("expense_type_name", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="expense_type_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <InputFields 
required
                      label="Status"
                      value={values.expense_type_status}
                      onChange={(e) => {
                        let val = e.target.value;
                        // If user selects from dropdown, ensure value is string '1' or '0'
                        if (val !== "1" && val !== "0") {
                          val = val === "Active" ? "1" : val === "Inactive" ? "0" : val;
                        }
                        setFieldValue("expense_type_status", val);
                      }}
                      options={[
                        { label: "Active", value: "1" },
                        { label: "Inactive", value: "0" },
                      ]}
                    />
                    <ErrorMessage
                      name="expense_type_status"
                      component="span"
                      className="text-xs text-red-500"
                    />
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
                            type="submit" />
             
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
