"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { addServiceTypes, getServiceTypesByUUID, updateServiceTypes } from "@/app/services/assetsApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Form, Formik, FormikHelpers } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

interface ServiceTypeFormValues {
  name: string;
  status: number;
}

const ServiceTypeSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  status: Yup.number().oneOf([0, 1], "Invalid status").required("Status is required"),
});

export default function AddEditServiceType() {
  const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState<ServiceTypeFormValues>({
    name: "",
    status: 1,
  });

  // Load service type for edit mode
  useEffect(() => {
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      (async () => {
        try {
          const res = await getServiceTypesByUUID(params.uuid as string);
          console.log(res.data);
          if (res && !res.error) {
            setInitialValues({
              name: res.data.name ?? "",
              status: res.data.status ?? 1,
            });
          }
        } catch (err) {
          console.error(err);
          showSnackbar("Failed to load Service Type", "error");
        }
      })();
    } else {
      setIsEditMode(false);
      setInitialValues({ name: "", status: 1 });
    }
  }, [params?.uuid, showSnackbar]);

  const handleSubmit = async (values: ServiceTypeFormValues, { setSubmitting }: FormikHelpers<ServiceTypeFormValues>) => {
    try {
      await ServiceTypeSchema.validate(values, { abortEarly: false });

      console.log("ServiceType submit", { isEditMode, uuid: params?.uuid, values });

      let res;
      if (isEditMode && params?.uuid) {
        res = await updateServiceTypes(params.uuid as string, values);
      } else {
        res = await addServiceTypes(values);
      }

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(isEditMode ? "Service Type Updated Successfully" : "Service Type Created Successfully", "success");
        router.push("/dashboard/settings/company/serviceType");
      }
    } catch (err) {
      console.error("Submit error:", err);
      if (err instanceof Error) {
        showSnackbar(err.message || "An error occurred", "error");
      } else {
        showSnackbar("Validation failed, please check your inputs", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Service Type" : "Add New Service Type"}
        </h1>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ServiceTypeSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => {
          const { values, setFieldValue, errors, touched, isSubmitting, resetForm } = formik;
          return (
            <Form>
              <ContainerCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputFields
                    required
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                    error={touched.name && errors.name}
                  />
                  <InputFields
                    required
                    label="Status"
                    name="status"
                    type="radio"
                    value={values.status.toString()}
                    onChange={(e) => setFieldValue("status", parseInt(e.target.value))}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                  />
                </div>
              </ContainerCard>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-lg"
                  onClick={() => {
                    if (isEditMode) {
                      router.back(); // go back on edit
                    } else {
                      resetForm(); // reset only on add
                    }
                  }}
                >
                  Cancel
                </button>

                <SidebarBtn
                  type="submit"
                  label={isEditMode ? "Update" : "Submit"}
                  isActive
                  leadingIcon="mdi:check"
                  disabled={isSubmitting}
                />
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
