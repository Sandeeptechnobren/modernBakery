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
import { addArea, getAreaById, updateAreaById, genearateCode, saveFinalCode } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Yup Schema
const SubRegionSchema = Yup.object().shape({
  area_code: Yup.string().required("SubRegion Code is required."),
  area_name: Yup.string().required("SubRegion Name is required."),
  status: Yup.string().required("Status is required."),
  region_id: Yup.string().required("Please select a region."),
});

export default function AddEditSubRegion() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams(); // 👈 gets route param
  const { regionOptions } = useAllDropdownListData();

  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const codeGeneratedRef = useRef(false);
  const [initialValues, setInitialValues] = useState({
    area_code: "",
    area_name: "",
    status: "1", // default Active
    region_id: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  type SubRegionFormValues = {
    area_code: string;
    area_name: string;
    status: string;
    region_id: string;
  };

  // ✅ Fetch data if editing, or generate code in add mode
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getAreaById(String(params.id));
          if (res?.data) {
            setInitialValues({
              area_code: res.data.area_code || "",
              area_name: res.data.area_name || "",
              status: String(res.data.status ?? "1"),
              region_id: String(res.data.region_id ?? ""),
            });
          }
        } catch (error) {
          console.error("Failed to fetch SubRegion", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "sub_region" });
        if (res?.code) {
          setInitialValues((prev) => ({ ...prev, area_code: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
          const match = res.prefix;
          if (match) setPrefix(prefix);
        }
      })();
    }
  }, [params?.id]);

  // ✅ Handle form submit
  const handleSubmit = async (
    values: SubRegionFormValues,
    { setSubmitting }: FormikHelpers<SubRegionFormValues>
  ) => {
    const payload = {
      ...values,
      status: Number(values.status),
      region_id: Number(values.region_id),
    };

    let res;
    if (isEditMode && params?.id !== "add") {
      res = await updateAreaById(String(params.id), payload);
    } else {
      res = await addArea(payload);
      try {
        await saveFinalCode({ reserved_code: values.area_code, model_name: "sub_region" });
      } catch (e) {}
    }

    if (res.error) {
      showSnackbar(res.data?.message || "Failed to submit form", "error");
    } else {
      showSnackbar(
        res.message ||
          (isEditMode
            ? "SubRegion Updated Successfully"
            : "SubRegion Created Successfully"),
        "success"
      );
      router.push("/settings/company/subRegion");
    }
    setSubmitting(false);
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
          <Link href="/settings/company/subRegion">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit SubRegion" : "Add New SubRegion"}
          </h1>
        </div>
      </div>

      {/* ✅ Formik + Yup */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={SubRegionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, values, setFieldValue, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  SubRegion Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* SubRegion Code */}
                  <div className="flex items-start gap-2 max-w-[406px]">
                    <div className="w-full">
                      <InputFields
                        required
                        label="SubRegion Code"
                        value={values.area_code}
                        onChange={(e) => setFieldValue("area_code", e.target.value)}
                        disabled={codeMode === 'auto'}
                        error={touched?.area_code && errors?.area_code}
                      />
                      <ErrorMessage
                        name="area_code"
                        component="span"
                        className="text-xs text-red-500"
                      />
                    </div>
                    {!isEditMode && (
                      <>
                        <IconButton
                          bgClass="white"
                           className="  cursor-pointer text-[#252B37] pt-12"
                          icon="mi:settings"
                          onClick={() => setIsOpen(true)}
                        />
                        <SettingPopUp
                          isOpen={isOpen}
                          onClose={() => setIsOpen(false)}
                          title="SubRegion Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                              setFieldValue('area_code', code);
                            } else if (mode === 'manual') {
                              setFieldValue('area_code', '');
                            }
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* SubRegion Name */}
                  <div>
                    <InputFields
                      required
                      label="SubRegion Name"
                      value={values.area_name}
                      onChange={(e) =>
                        setFieldValue("area_name", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="area_name"
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
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      type="radio"
                      required
                      error={
                        errors?.status && touched?.status
                          ? errors.status
                          : false
                      }
                    />
                  </div>

                  {/* Region */}
                  <div>
                    <InputFields
                      required
                      label="Region"
                      name="region_id"
                      value={values.region_id}
                      options={regionOptions}
                      onChange={(e) =>
                        setFieldValue("region_id", e.target.value)
                      }
                    />
                    <ErrorMessage
                      name="region_id"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6 pr-0">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? "Update" : "Submit"}
                isActive={true}
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
