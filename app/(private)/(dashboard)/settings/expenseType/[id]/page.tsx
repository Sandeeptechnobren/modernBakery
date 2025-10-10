"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Loading from "@/app/components/Loading";
import { addExpenseType, getExpenseTypeById, updateExpenseType } from "@/app/services/allApi";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";

const ExpenseTypeSchema = Yup.object().shape({
  expense_type_code: Yup.string().required("Expense Type Code is required"),
  expense_name: Yup.string().required("Expense name is required").max(100),
  expense_status: Yup.string().required("Status is required").oneOf(["1", "0"], "Invalid status"),
});

type ExpenseTypeFormValues = {
  expense_type_code: string;
  expense_name: string;
  expense_status: string;
};

export default function AddEditExpenseType() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [initialValues, setInitialValues] = useState<ExpenseTypeFormValues>({
    expense_type_code: "",
    expense_name: "",
    expense_status: "1",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState("");
  const codeGeneratedRef = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getExpenseTypeById(String(params.id));
          if (res?.data) {
            setInitialValues({
              expense_type_code: res.data.expense_type_code || "",
              expense_name: res.data.expense_type_name || "",
              expense_status: String(res.data.expense_status ?? "1"),
            });
          }
        } catch (error) {
          console.error("Failed to fetch expense type", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "expense_type" });
        if (res?.code) {
          setCode(res.code);
          setInitialValues((prev) => ({ ...prev, expense_type_code: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          // fallback: extract prefix from code if possible
          const match = res.prefix;
          if (match) setPrefix(prefix);
        }
      })();
    }
  }, [params?.id]);

  const handleSubmit = async (
    values: ExpenseTypeFormValues,
    { setSubmitting }: FormikHelpers<ExpenseTypeFormValues>
  ) => {
    const payload = {
      expense_type_code: values.expense_type_code,
      expense_type_name: values.expense_name,
      expense_type_status: Number(values.expense_status),
    };
    try {
      let res;
      if (isEditMode && params?.id !== "add") {
        res = await updateExpenseType(String(params.id), payload);
      } else {
        res = await addExpenseType(payload);
        try {
          await saveFinalCode({ reserved_code: values.expense_type_code, model_name: "expense_type" });
        } catch (e) {}
      }
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          res.message || (isEditMode ? "Expense Type Updated Successfully" : "Expense Type Created Successfully"),
          "success"
        );
        router.push("/settings/expenseType");
      }
    } catch (err) {
      showSnackbar("Failed to submit form", "error");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/expenseType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Expense Type" : "Add New Expense Type"}
          </h1>
        </div>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ExpenseTypeSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Expense Type Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Expense Type Code (auto-generated, disabled, with settings icon/popup) */}
                  <div className="flex items-start gap-2 max-w-[406px]">
                    <InputFields
                      required
                      label="Expense Type Code"
                      name="expense_type_code"
                      value={values.expense_type_code}
                      onChange={(e) => setFieldValue("expense_type_code", e.target.value)}
                      disabled={codeMode === 'auto'}
                      error={touched?.expense_type_code && errors?.expense_type_code}
                    />
                    {!isEditMode && (
                      <>
                        <IconButton
                          bgClass="white"
                           className="  cursor-pointer text-[#252B37] pt-12"
                          icon="mi:settings"
                          onClick={() => setIsOpen(true)}
                        />
                        <SettingPopUp
                          isOpen={isOpen}
                          onClose={() => setIsOpen(false)}
                          title="Expense Type Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                              setFieldValue('expense_type_code', code);
                            } else if (mode === 'manual') {
                              setFieldValue('expense_type_code', '');
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Expense Name"
                      value={values.expense_name}
                      onChange={(e) => setFieldValue("expense_name", e.target.value)}
                    />
                    <ErrorMessage
                      name="expense_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Status"
                      name="expense_status"
                      value={values.expense_status}
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                      onChange={(e) => setFieldValue("expense_status", e.target.value)}
                      type="radio"
                      error={errors?.expense_status && touched?.expense_status ? errors.expense_status : false}
                    />
                    <ErrorMessage
                      name="expense_status"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? "Update" : "Submit"}
                isActive={!isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
