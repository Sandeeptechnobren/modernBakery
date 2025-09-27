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
const PlanogramImageSchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  customer: Yup.string().required("Please select a customer."),
  merchandiser: Yup.string().required("Please select a merchandiser."),
  shelf: Yup.string().required("Please select a shelf."),
    image: Yup.string().required("Image is required."),
});
type PlanogramImageFormValues = {
  image: string;
  customer: string;
    merchandiser: string;
    shelf: string;
};

export default function AddPlanogramImage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const initialValues: PlanogramImageFormValues = {


    customer: "",
    merchandiser: "",
    shelf: "",
        image: "",
  };
  // ✅ Local submit handler (no API)
  const handleSubmit = (
    values: PlanogramImageFormValues,
    { setSubmitting }: FormikHelpers<PlanogramImageFormValues>
  ) => {
    const localPayload = {
        image: values.image.trim(),
      customer: values.customer,
      merchandiser: values.merchandiser,
      shelf: values.shelf,
    };
    console.log("Form submitted (local) ->", localPayload);
    showSnackbar("Planogram Image added locally ✅", "success");
    setSubmitting(false);
    router.push("/dashboard/merchandiser/planogram"); // navigate back
  };
  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/merchandiser/planogramImage">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Planogram Image</h1>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={PlanogramImageSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">
          Planogram Image Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                    label="Merchandiser"
                    name="merchandiser"
                    value={values.merchandiser}
                    onChange={(e) => setFieldValue("merchandiser", e.target.value)}
                    options={[
                      { value: "1", label: "merchandiser A" },
                      { value: "2", label: "merchandiser B" },
                      { value: "3", label: "merchandiser C" },
                      { value: "4", label: "merchandiser D" },
                    ]}
                  />    
                  <ErrorMessage
                    name="merchandiser"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                 <div>
                  <InputFields
                    label="Shelf"
                    name="shelf"
                    value={values.shelf}
                    onChange={(e) => setFieldValue("shelf", e.target.value)}
                    options={[
                      { value: "1", label: "Shelf A" },
                      { value: "2", label: "Shelf B" },
                      { value: "3", label: "Shelf C" },
                      { value: "4", label: "Shelf D" },
                    ]}
                  />    
                  <ErrorMessage
                    name="shelf"
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
