"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getPlanogramById, updatePlanogram } from "@/app/services/allApi";

// 🔹 Validation schema
const PlanogramSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  validFrom: Yup.date()
    .required("Valid From is required.")
    .typeError("Please enter a valid date"),
  validTo: Yup.date()
    .required("Valid To is required.")
    .typeError("Please enter a valid date")
    .min(Yup.ref("validFrom"), "Valid To date cannot be before Valid From date"),
  status: Yup.string().required("Please select a status."),
});

// 🔹 Form values (string for fields, convert to number in submit)
type EditFormValues = {
  name: string;
  validFrom: string;
  validTo: string;
  status: string; // "1" | "0"
};

export default function EditPlanogramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [initialValues, setInitialValues] = useState<EditFormValues | null>(null);

  // Fetch planogram details by id
  useEffect(() => {
  const fetchPlanogram = async () => {
  try {
    const res = await getPlanogramById(id);
    const p = res?.data ?? res; // <-- adjust depending on API
    setInitialValues({
      name: p?.name ?? "",
      validFrom: p?.valid_from ?? "",
      validTo: p?.valid_to ?? "",
      status: String(p?.status ?? "1"),
    });
  } catch (err) {
    console.error(err);
    showSnackbar("Failed to load planogram details ❌", "error");
  }
};
    if (id) fetchPlanogram();
  }, [id, showSnackbar]);

  // Submit handler
  const handleSubmit = async (
    values: EditFormValues,
    { setSubmitting }: FormikHelpers<EditFormValues>
  ) => {
    try {
      const payload = {
        name: values.name.trim(),
        valid_from: values.validFrom,
        valid_to: values.validTo,
        status: Number(values.status),
      };

      const res = await updatePlanogram(id, payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        setSubmitting(false);
        return;
      }

      showSnackbar("Planogram updated successfully ✅", "success");
      router.push("/dashboard/merchandiser/planogram");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to update planogram ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialValues) {
    return <div className="p-4">Loading planogram details...</div>;
  }

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/merchandiser/planogram">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Edit Planogram</h1>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={PlanogramSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Planogram Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <InputFields
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                  />
                  <ErrorMessage name="name" component="span" className="text-xs text-red-500" />
                </div>

                <div>
                  <InputFields
                    label="Valid From"
                    name="validFrom"
                    type="date"
                    value={values.validFrom}
                    onChange={(e) => setFieldValue("validFrom", e.target.value)}
                  />
                  <ErrorMessage name="validFrom" component="span" className="text-xs text-red-500" />
                </div>

                <div>
                  <InputFields
                    label="Valid To"
                    name="validTo"
                    type="date"
                    value={values.validTo}
                    onChange={(e) => setFieldValue("validTo", e.target.value)}
                  />
                  <ErrorMessage name="validTo" component="span" className="text-xs text-red-500" />
                </div>

                <div>
                  <InputFields
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                  />
                  <ErrorMessage name="status" component="span" className="text-xs text-red-500" />
                </div>
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard/merchandiser/planogram")}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isSubmitting ? "Updating..." : "Update"}
                isActive={!isSubmitting}
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
