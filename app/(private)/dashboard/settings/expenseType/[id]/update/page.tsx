"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { updateExpenseType, getExpenseTypeById } from "@/app/services/allApi";

const ExpensetypeSchema = Yup.object().shape({
   expense_type_name: Yup.string().required("Expense Name is required."),
    expense_type_status: Yup.string().required("Status is required."),
});

export default function UpdateExpensetype() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Try reading id from route params first, then fall back to query params
  const params = useParams();
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";
  const queryName = searchParams.get("expense_type_name") || "";
  const queryCurrency = searchParams.get("expense_type_status") || "";

  const [loading, setLoading] = useState<boolean>(false);
  const [fetched, setFetched] = useState<null | {  expense_type_name?: string; expense_type_status?: string; }>(null);

  // fetch by id if available
  useEffect(() => {
    if (!queryId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getExpenseTypeById(String(queryId));
        const data = res?.data ?? res;
        if (!mounted) return;
        setFetched({  expense_type_name: data?.expense_type_name, expense_type_status: data?.expense_type_status });
      } catch (err) {
        console.error('Failed to fetch expense by id', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [queryId]);


  // ✅ Pre-filled initial values
  type expenseTypeFormValues = {
    expense_type_name: string;
    expense_type_status: number;
  };

  const initialValues: expenseTypeFormValues = {
    expense_type_name: fetched?.expense_type_name ?? queryName,
    expense_type_status: fetched?.expense_type_status !== undefined
      ? Number(fetched.expense_type_status)
      : Number(queryCurrency),
  };

  // ✅ Submit handler for editing only (Formik signature)
  const handleSubmit = async (values: expenseTypeFormValues) => {
    if (!queryId) return;

    try {
  await updateExpenseType(String(queryId), { ...values, expense_type_status: Number(values.expense_type_status) });
      showSnackbar("Expense Type updated successfully", "success");
      router.push("/dashboard/settings/expenseType");
    } catch (error) {
      console.error("Failed to edit Expense Type:", error);
      showSnackbar("Failed to update Expense Type", "error");
    }
  };

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/expenseType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Edit Expense Type</h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ExpensetypeSchema}
        enableReinitialize
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
                                    label="Expense Type Status"
                                    name="expense_type_status"
                                    value={String(values.expense_type_status)}
                                    onChange={(e) =>
                                        setFieldValue("expense_type_status", e.target.value)
                                    }
                                    options={[
                                        { value: "1", label: "Active" },
                                        { value: "0", label: "Inactive" },
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

              <SidebarBtn label="Update" isActive={true} leadingIcon="mdi:check" type="submit" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
