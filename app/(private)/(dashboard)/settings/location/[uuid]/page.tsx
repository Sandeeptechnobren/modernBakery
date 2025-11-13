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
import { addLocation, LocationById, editLocation, genearateCode, saveFinalCode } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";

// ✅ Simplified Yup Schema - Only Code and Name
const LocationSchema = Yup.object().shape({
  code: Yup.string().required("Location Code is required."),
  name: Yup.string().required("Location Name is required."),
});

export default function AddEditLocation() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState("");
  const codeGeneratedRef = useRef(false);
  const [initialValues, setInitialValues] = useState({
    code: "",
    name: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  type LocationFormValues = {
    code: string;
    name: string;
  };

  // ✅ Fetch data if editing
  useEffect(() => {
    // Check if we have a uuid parameter (edit mode)
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await LocationById(String(params.uuid));
          console.log("Location fetch response:", res);
          if (res?.data) {
            setInitialValues({
              code: res.data.code || "",
              name: res.data.name || "",
            });
          } else {
            showSnackbar("Location data not found", "error");
          }
        } catch (error) {
          console.error("Failed to fetch location", error);
          showSnackbar("Failed to fetch location details", "error");
        } finally {
          setLoading(false);
        }
      })();
    } else if (!codeGeneratedRef.current) {
      // Generate code for new entry
      codeGeneratedRef.current = true;
      (async () => {
        try {
          const res = await genearateCode({ model_name: "location" });
          console.log("Code generation response:", res);
          if (res?.code) {
            setCode(res.code);
            setInitialValues((prev) => ({ ...prev, code: res.code }));
          }
          if (res?.prefix) {
            setPrefix(res.prefix);
          }
        } catch (error) {
          console.error("Failed to generate code:", error);
          showSnackbar("Failed to generate location code", "error");
        }
      })();
    }
  }, [params?.uuid, showSnackbar]);

  // ✅ Handle form submit
  const handleSubmit = async (
    values: LocationFormValues,
    { setSubmitting }: FormikHelpers<LocationFormValues>
  ) => {
    try {
      const payload = {
        code: values.code,
        name: values.name,
      };

      let res;
      if (isEditMode && params?.uuid !== "add") {
        res = await editLocation(String(params.uuid), payload);
      } else {
        res = await addLocation(payload);
        // Save the final code
        try {
          await saveFinalCode({ 
            reserved_code: values.code, 
            model_name: "locations" 
          });
        } catch (e) {
          console.error("Failed to save final code", e);
        }
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          res?.message || (isEditMode ? "Location Updated Successfully" : "Location Created Successfully"),
          "success"
        );
        router.push("/settings/location");
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
          <Link href="/settings/location">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Location" : "Add New Location"}
          </h1>
        </div>
      </div>

      {/* ✅ Formik + Yup */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={LocationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Location Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Code */}
                  <div className="flex items-start gap-2 max-w-[406px]">
                    <div className="w-full">
                      <InputFields
                        required
                        label="Location Code"
                        value={values.code}
                        onChange={(e) => setFieldValue("code", e.target.value)}
                        disabled={isEditMode || (codeMode === 'auto' && !isEditMode)}
                        placeholder="Enter location code"
                      />
                      <ErrorMessage
                        name="code"
                        component="span"
                        className="text-xs text-red-500"
                      />
                    </div>
                    {!isEditMode && (
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
                          title="Location Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                              setFieldValue('code', code);
                            } else if (mode === 'manual') {
                              setFieldValue('code', '');
                            }
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* Location Name */}
                  <div>
                    <InputFields
                      required
                      label="Location Name"
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
              <Link href="/settings/location">
                <button
                  type="button"
              onClick={() => router.push("/settings/location")}
                  
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