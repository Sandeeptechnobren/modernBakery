"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addBrand, BrandById, editBrand, genearateCode, saveFinalCode } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";

// ✅ Yup Schema - Only Code and Name
const BrandSchema = Yup.object().shape({
  osa_code: Yup.string().required("Brand Code is required."),
  name: Yup.string().required("Brand Name is required."),
});

export default function AddEditBrand() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState("");
  const codeGeneratedRef = useRef(false);
  const [initialValues, setInitialValues] = useState({
    osa_code: "",
    name: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  type BrandFormValues = {
    osa_code: string;
    name: string;
  };

  // ✅ Fetch data if editing OR generate code if adding
  useEffect(() => {
    // Check if we have a uuid parameter (edit mode)
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await BrandById(String(params.uuid));
          console.log("Brand fetch response:", res);
          if (res?.data) {
            setInitialValues({
              osa_code: res.data.osa_code || "",
              name: res.data.name || "",
            });
          } else {
            showSnackbar("Brand data not found", "error");
          }
        } catch (error) {
          console.error("Failed to fetch brand", error);
          showSnackbar("Failed to fetch brand details", "error");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Add mode
      setIsEditMode(false);
      if (!codeGeneratedRef.current) {
        // Generate code for new entry
        codeGeneratedRef.current = true;
        (async () => {
          try {
            const res = await genearateCode({ model_name: "brand" });
            console.log("Code generation response:", res);
            if (res?.code) {
              setCode(res.code);
              setInitialValues((prev) => ({ ...prev, osa_code: res.code }));
            }
            if (res?.prefix) {
              setPrefix(res.prefix);
            }
          } catch (error) {
            console.error("Failed to generate code:", error);
            showSnackbar("Failed to generate brand code", "error");
          }
        })();
      }
    }
  }, [params?.uuid, showSnackbar]);

  // ✅ Handle form submit
  const handleSubmit = async (
    values: BrandFormValues,
    { setSubmitting }: FormikHelpers<BrandFormValues>
  ) => {
    try {
      const payload = {
        osa_code: values.osa_code,
        name: values.name,
      };

      let res;
      if (isEditMode && params?.uuid !== "add") {
        res = await editBrand(String(params.uuid), payload);
      } else {
        res = await addBrand(payload);
        // Save the final code
        try {
          await saveFinalCode({
            reserved_code: values.osa_code,
            model_name: "brand"
          });
        } catch (e) {
          console.error("Failed to save final code", e);
        }
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          res?.message || (isEditMode ? "Brand Updated Successfully" : "Brand Created Successfully"),
          "success"
        );
        router.push("/settings/brand");
      }
    } catch (error) {
      console.error("Submit error", error);
      showSnackbar("An error occurred while submitting", "error");
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
          <Link href="/settings/brand">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Brand" : "Add New Brand"}
          </h1>
        </div>
      </div>

      {/* ✅ Formik + Yup */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={BrandSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Brand Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Brand Code */}
                  <div className="flex items-start gap-2 max-w-[406px]">
                    <div className="w-full">
                      <InputFields
                        required
                        label="Brand Code"
                        value={values.osa_code}
                        onChange={(e) => setFieldValue("osa_code", e.target.value)}
                        disabled={isEditMode || (codeMode === 'auto' && !isEditMode)}
                        placeholder="Enter brand code"
                      />
                      <ErrorMessage
                        name="osa_code"
                        component="span"
                        className="text-xs text-red-500"
                      />
                    </div>
                    {/* {!isEditMode && (
                      <>
                        <IconButton
                          bgClass="white"
                          className="cursor-pointer text-[#252B37] pt-12"
                          icon="mi:settings"
                          onClick={() => setIsOpen(true)}
                        />
                        <SettingPopUp
                          isOpen={isOpen}
                          onClose={() => setIsOpen(false)}
                          title="Brand Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, generatedCode) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && generatedCode) {
                              setFieldValue('osa_code', generatedCode);
                            } else if (mode === 'manual') {
                              setFieldValue('osa_code', '');
                            }
                          }}
                        />
                      </>
                    )} */}
                  </div>

                  {/* Brand Name */}
                  <div>
                    <InputFields
                      required
                      label="Brand Name"
                      value={values.name}
                      onChange={(e) => setFieldValue("name", e.target.value)}
                    />
                    <ErrorMessage
                      name="name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <Link href="/settings/brand">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </Link>
              <SidebarBtn
                label={isEditMode ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Submitting..." : "Submit")}
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