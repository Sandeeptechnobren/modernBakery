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

const ShelfDisplaySchema = Yup.object().shape({
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

  height: Yup.string().required("Height is required."),
  width: Yup.string().required("Width is required."),
  depth: Yup.string().required("Width is required."),
  status: Yup.string().required("Status is required."),
  customer: Yup.string().required("Please select a customer."),
});

type ShelfDisplayFormValues = {
  name: string;
  validFrom: string;
  validTo: string;
  height: string;
  width: string;
  depth: string;
  customer: string;
};

export default function AddShelfDisplay() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const initialValues: ShelfDisplayFormValues = {
    name: "",
    validFrom: "",
    validTo: "",
    height: "",
    width: "",
    depth: "",
    customer: "",
  };

  // ✅ Local submit handler (no API)
  const handleSubmit = (
    values: ShelfDisplayFormValues,
    { setSubmitting }: FormikHelpers<ShelfDisplayFormValues>
  ) => {
    const localPayload = {
      name: values.name.trim(),
      validFrom: values.validFrom.trim(),
      validTo: values.validTo.trim(),
      height: values.height.trim(),
      width: values.width.trim(),
      depth: values.width.trim(),
      customer: values.customer,
    };

    console.log("Form submitted (local) ->", localPayload);
    showSnackbar("Shelf Display added locally ✅", "success");

    setSubmitting(false);
    router.push("/dashboard/merchandiser/shelfDisplay"); // navigate back
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/merchandiser/shelfDisplay">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Shelf Display</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ShelfDisplaySchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">
                Shelf Display Details
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
                    label="Height(CM)"
                    name="height"
                    value={values.height}
                    onChange={(e) => setFieldValue("height", e.target.value)}
                  />
                  <ErrorMessage
                    name="height"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    label=" Width(CM)"
                    name="width"
                    value={values.width}
                    onChange={(e) => setFieldValue("width", e.target.value)}
                  />
                  <ErrorMessage
                    name="width"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    label=" Depth(CM)"
                    name="depth"
                    value={values.depth}
                    onChange={(e) => setFieldValue("depth", e.target.value)}
                  />
                  <ErrorMessage
                    name="depth"
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
