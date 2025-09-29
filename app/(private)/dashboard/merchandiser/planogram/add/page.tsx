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

const PlanogramSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  validFrom: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date"),
  validTo: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date")
    .min(
      Yup.ref("validFrom"),
      "Valid To date cannot be before Valid From date"
    ),
  image: Yup.string().required("Image is required."),

  customer: Yup.string().required("Please select a customer."),
});

type PlanoFormValues = {
  name: string;
  validFrom: string;
  validTo: string;
  image: string;
  customer: string;
};

export default function Planogram() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const initialValues: PlanoFormValues = {
    name: "",
    validFrom: "",
    validTo: "",
    customer: "",
        image: "",
  };

  // ✅ Local submit handler (no API)
  const handleSubmit = (
    values: PlanoFormValues,
    { setSubmitting }: FormikHelpers<PlanoFormValues>
  ) => {
    const localPayload = {
      name: values.name.trim(),
      validFrom: values.validFrom.trim(),
      validTo: values.validTo.trim(),
        image: values.image.trim(),
      customer: values.customer,
    };

    console.log("Form submitted (local) ->", localPayload);
    showSnackbar("Planogram added locally ✅", "success");

    setSubmitting(false);
    router.push("/dashboard/merchandiser/planogram"); // navigate back
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
                    label="Customer"
                    name="customer"
                    value={values.customer}
                    onChange={(e) => setFieldValue("customer", e.target.value)}
                    options={[
                      { value: "1", label: "Customer A" },
                      { value: "2", label: "Customer B" },
                      { value: "3", label: "Customer C" },
                      { value: "4", label: "Customer D" },
                    ]}
                  />
                  <ErrorMessage
                    name="customer"
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
                  />
                  <ErrorMessage
                    name="validTo"
                    component="span"
                    className="text-xs text-red-500"
                  />    
                </div>
                  <div>
                    <InputFields
                                label="Add Image"
                                name="image"
                                type="file"
                                value={values.image}
                                onChange={(e) => setFieldValue("image", e.target.value)}
                              />
                  <ErrorMessage
                    name="image"
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
