"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addPlanogram } from "@/app/services/allApi";
const PlanogramSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  validFrom: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date"),
  validTo: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date")
    .min(Yup.ref("validFrom"), "Valid To date cannot be before Valid From date"),
  status: Yup.string().required("Please select a status."),
});

type PlanoFormValues = {
  name: string;
  validFrom: string;
  validTo: string;
  status: string;
};

export default function Planogram() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const initialValues: PlanoFormValues = {
  name: "",
  validFrom: "",
  validTo: "",
  status: "",
};
  // ✅ Local submit handler (no API)
const handleSubmit = async (
    values: PlanoFormValues,
    { setSubmitting }: FormikHelpers<PlanoFormValues>
  ) => {
    try {
      const payload = {
        name: values.name.trim(),
        valid_from: values.validFrom,
        valid_to: values.validTo,
        status: Number(values.status), // send as number
      };

      console.log("Payload ->", payload);
      const res = await addPlanogram(payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        setSubmitting(false);
        return;
      }

      showSnackbar("Planogram added successfully ✅", "success");
      router.push("/dashboard/merchandiser/planogram");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to add Planogram ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/merchandiser/planogram">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Planogram</h1>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={PlanogramSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">
          Planogram Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <InputFields
                    label=" Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                  />
                  <ErrorMessage
                    name="name"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    label="Valid From"
                    name="validFrom"
                    value={values.validFrom}
                    onChange={(e) => setFieldValue("validFrom", e.target.value)}
             type="date"
                  />
                  <ErrorMessage
                    name="validFrom"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    label="Valid To"
                    name="validTo"
                    value={values.validTo}
                    onChange={(e) => setFieldValue("validTo", e.target.value)}
                  type="date"
                  />
                  <ErrorMessage
                    name="validTo"
                    component="span"
                    className="text-xs text-red-500"
                  />    
                </div> 
                
                              <div>
                                           <InputFields
                                             label="Status"
                                             name="status"
                                             type="radio"
                                             value={values.status}
                                             onChange={(e) => setFieldValue("status", e.target.value)}
                                             options={[
                                               { value: "1", label: "Active" },
                                               { value: "0", label: "Inactive" },
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
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isSubmitting ? "Submitting..." : "Submit"}
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
