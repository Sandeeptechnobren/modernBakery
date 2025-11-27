"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";

import {
  addAssetsModel,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";


interface ManufacturerFormValues {
  id: string;
  name: string;
  status: string;
  code: string;
  asset_type?: string;
  manu_type?: string;
}


// ✅ Validation Schema
const ManufacturerSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  asset_type: Yup.string().required("Assets Category is required"),
  manu_type: Yup.string().required("Manufacturer is required"),
  status: Yup.string().required("Status is required"),
});

export default function AddEditCustomerSubCategory() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams<{ id?: string }>();

  const [loading, setLoading] = useState(false);
  const { assetsTypeOptions, manufacturerOptions } = useAllDropdownListData();
  // Code generation logic
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const codeGeneratedRef = useRef(false);

  const [initialValues, setInitialValues] = useState<ManufacturerFormValues>({
    id: "",
    name: "",
    status: "1",
    code: "",
  });

  // ✅ Fetch Customer Categories
  

  // ✅ Fetch data if editing or generate code if adding
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Run this only once
      if (!codeGeneratedRef.current) {
        codeGeneratedRef.current = true;

        const res = await genearateCode({ model_name: "ast_mod_code" });

        if (res?.code) {
          setInitialValues((prev) => ({ ...prev, code: res.code }));
        }

        if (res?.prefix) {
          setPrefix(res.prefix);
        }
      }
    } catch (err) {
      console.error("Error generating code", err);
      showSnackbar("Failed to generate code", "error");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [showSnackbar]);


  const handleSubmit = async (
  values: ManufacturerFormValues,
  { setSubmitting }: FormikHelpers<ManufacturerFormValues>
) => {
  const payload = {
    name: values.name,
    status: Number(values.status),
    code: values.code,
    asset_type: values.asset_type,
    manu_type: values.manu_type,
  };

  let res: any;

  try {
    // ---- ADD FLOW ----
    res = await addAssetsModel(payload);

    // Save code
    try {
      await saveFinalCode({
        reserved_code: values.code,
        model_name: "ast_mod_code",
      });
    } catch (e) {
      console.error("Code reservation failed", e);
    }

    // Handle response
    if (res?.error) {
      showSnackbar(res?.data?.message || "Failed to submit form", "error");
    } else {
      showSnackbar("Asset Type Added Successfully ✅", "success");
      router.push("/settings/manageAssets/assetsModel");
    }
  } catch (error) {
    console.error("Form submission error:", error);
    showSnackbar("Something went wrong while submitting", "error");
  } finally {
    setSubmitting(false);
  }
};



  // ✅ Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // ✅ JSX
  return (
    <div className="w-full h-full overflow-x-hidden p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/manageAssets/manufacturer">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add Asset Model
          </h1>
        </div>
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ManufacturerSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched ,isSubmitting}) => (
          <Form onSubmit={handleSubmit}>
            <ContainerCard>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Assets Model Details 
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sub Category Code */}
                <div className="flex items-start gap-2 max-w-[406px]">
                  <div className="w-full">
                    <InputFields
                      required
                      label="OSA Code"
                      value={values.code}
                      onChange={(e) =>
                        setFieldValue("code", e.target.value)
                      }
                      disabled={codeMode === "auto"}
                      error={
                        touched.code &&
                        errors.code
                      }
                    />
                    <ErrorMessage
                      name="osa_code"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <InputFields
                    required
                    label="Asset Model"
                    value={values.name}
                    onChange={(e) =>
                      setFieldValue("name", e.target.value)
                    }
                    error={
                      touched.name &&
                      errors.name
                    }
                  />
              
                </div>

                <div>
                  <InputFields
                    required
                    label="Asset Category"
                    value={values.asset_type}
                    options={assetsTypeOptions}
                    onChange={(e) =>
                      setFieldValue("asset_type", e.target.value)
                    }
                    error={
                      touched.asset_type &&
                      errors.asset_type
                    }
                  />
              
                </div>

                <div>
                  <InputFields
                    required
                    label="Manufacturer"
                    value={values.manu_type}
                    options={manufacturerOptions}
                    onChange={(e) =>
                      setFieldValue("manu_type", e.target.value)
                    }
                    error={
                      touched.manu_type &&
                      errors.manu_type
                    }
                  />
              
                </div>

                {/* Status */}
                <div>
                  <InputFields
                    label="Status"
                    name="status"
                    value={values.status}
                    options={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    type="radio"
                    required
                    error={errors.status && touched.status ? errors.status : false}
                  />
                </div>
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="button"
                // onClick={() => router.back()}
              onClick={() => router.push("/settings/manageAssets/assetsModel")}

                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={ (isSubmitting?"Submiting...":"Submit")}
                isActive={true}
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
