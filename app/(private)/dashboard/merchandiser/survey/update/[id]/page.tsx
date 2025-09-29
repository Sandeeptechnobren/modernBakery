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
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getSurveyById, updateSurvey } from "@/app/services/allApi";

// 🔹 Validation schema
const SurveySchema = Yup.object().shape({
  surveyName: Yup.string().required("Survey Name is required."),
  startDate: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date"),
  endDate: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date")
    .min(Yup.ref("startDate"), "End Date cannot be before Start Date"),
  status: Yup.string().required("Please select a status."),
});

// 🔹 Form value types
type SurveyEditFormValues = {

  surveyName: string;
  startDate: string;
  endDate: string;
  status: string; // "active" | "inactive"
};

export default function EditSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [initialValues, setInitialValues] = useState<SurveyEditFormValues | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Format API date → yyyy-mm-dd
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // 🔹 Fetch survey by ID
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await getSurveyById(id);
        const s = res?.data ?? res;

        setInitialValues({
 
          surveyName: s?.survey_name ?? "",
          startDate: formatDate(s?.start_date),
          endDate: formatDate(s?.end_date),
          // ✅ normalise backend value to "active" | "inactive"
          status: s?.status === "inactive" ? "inactive" : "active",
        });
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load survey details ❌", "error");
      }
    };

    if (id) fetchSurvey();
  }, [id, showSnackbar]);

  // 🔹 Submit handler
  const handleSubmit = async (
    values: SurveyEditFormValues,
    { setSubmitting }: FormikHelpers<SurveyEditFormValues>
  ) => {
    try {
      const payload = {
        survey_name: values.surveyName.trim(),
        start_date: values.startDate,
        end_date: values.endDate,
        status: values.status, // directly "active" or "inactive"
      };

      const res = await updateSurvey(id, payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        setSubmitting(false);
        return;
      }

      showSnackbar("Survey updated successfully ✅", "success");
      router.push("/dashboard/merchandiser/survey");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to update survey ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialValues) return <div className="p-4">Loading survey details...</div>;

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/merchandiser/survey"
          className="text-gray-600 hover:text-gray-800"
        >
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Edit Survey</h1>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={SurveySchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Survey Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             

                {/* Survey Name */}
                <div>
                  <InputFields
                    label="Survey Name"
                    name="surveyName"
                    value={values.surveyName}
                    onChange={(e) => setFieldValue("surveyName", e.target.value)}
                  />
                  <ErrorMessage
                    name="surveyName"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <InputFields
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={values.startDate}
                    onChange={(e) => setFieldValue("startDate", e.target.value)}
                  />
                  <ErrorMessage
                    name="startDate"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <InputFields
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={values.endDate}
                    onChange={(e) => setFieldValue("endDate", e.target.value)}
                  />
                  <ErrorMessage
                    name="endDate"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <InputFields
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                  />
                  <ErrorMessage
                    name="status"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => router.push("/dashboard/merchandiser/survey")}
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
