"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState ,useRef} from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addRegion, getRegionById, updateRegion } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const RegionSchema = Yup.object().shape({
  region_code: Yup.string().required("Region Code is required."),
  region_name: Yup.string().required("Region Name is required."),
  status: Yup.string().required("Status is required."),
  company_id: Yup.string().required("Please select a company."),
});

type RegionFormValues = {
  region_code: string;
  region_name: string;
  status: string;
  company_id: string;
};

import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";

export default function AddEditRegion() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const { companyOptions } = useAllDropdownListData();

  // Determine if edit mode (edit if id is present and not 'add')
  const routeId = params?.id ?? "";
  const isEditMode = routeId && routeId !== "add";
  const queryId = isEditMode ? routeId : "";

  const [initialValues, setInitialValues] = useState<RegionFormValues>({
    region_code: "",
    region_name: "",
    status: "1",
    company_id: "",
  });

  // Code logic
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [code, setCode] = useState("");
  const codeGeneratedRef = useRef(false);

  // Fetch region data if editing, or generate code in add mode
  useEffect(() => {
    if (isEditMode) {
      let mounted = true;
      setLoading(true);
      (async () => {
        try {
          const res = await getRegionById(String(queryId));
          if (!mounted) return;
          setInitialValues({
            region_code: res?.data.region_code || "",
            region_name: res?.data.region_name || "",
            status: res?.data.status?.toString() ?? "1",
            company_id: res?.data.company_id?.toString() ?? "",
          });
        } catch (err) {
          console.error("Failed to fetch Region by id", err);
        } finally {
          setLoading(false);
        }
      })();
      return () => { mounted = false; };
    } else if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({ model_name: "Region" });
        if (res?.code) {
          setCode(res.code);
          setInitialValues((prev) => ({ ...prev, region_code: res.code }));
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
  }, [isEditMode, queryId]);

  // Submit handler
  const handleSubmit = async (
    values: RegionFormValues,
    { setSubmitting }: FormikHelpers<RegionFormValues>
  ) => {
    try {
      const payload = {
        region_code: values.region_code,
        region_name: values.region_name.trim(),
        status: Number(values.status),
        company_id: Number(values.company_id),
      };
      if (isEditMode) {
        await updateRegion(String(queryId), payload);
        showSnackbar("Region updated successfully ✅", "success");
      } else {
        await addRegion(payload);
        try {
          await saveFinalCode({ reserved_code: values.region_code, model_name: "Region" });
        } catch (e) {}
        showSnackbar("Region added successfully ✅", "success");
      }
      router.push("/settings/region");
    } catch (error) {
      showSnackbar(isEditMode ? "Failed to update Region" : "Failed to add Region", "error");
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
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings/region">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Update Region" : "Add New Region"}
        </h1>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={RegionSchema}
        onSubmit={handleSubmit}
      >
  {({ values, setFieldValue, isSubmitting, touched, errors }) => (
          <Form>
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Region Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Region Code (auto-generated, disabled, with settings icon/popup) */}
                  <div className="flex items-start gap-2 max-w-[406px]">
                    <InputFields
                      label="Region Code"
                      name="region_code"
                      value={values.region_code}
                      onChange={(e) => setFieldValue("region_code", e.target.value)}
                      disabled={codeMode === 'auto'}
                      error={touched?.region_code && errors?.region_code}
                    />
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
                          title="Region Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                              setFieldValue('region_code', code);
                            } else if (mode === 'manual') {
                              setFieldValue('region_code', '');
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <InputFields
                      label="Region Name"
                      name="region_name"
                      value={values.region_name}
                      onChange={(e) => setFieldValue("region_name", e.target.value)}
                    />
                    <ErrorMessage
                      name="region_name"
                      component="span"
                      className="text-xs text-red-500"
                    />
                  </div>
                  <div>
                    <InputFields
                      label="Company"
                      name="company_id"
                      value={values.company_id}
                      onChange={(e) => setFieldValue("company_id", e.target.value)}
                      options={companyOptions}
                    />
                    <ErrorMessage
                      name="company_id"
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
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
              onClick={() => router.push("/settings/region")}
 type="button"
                // type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isEditMode ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Submitting..." : "Submit")}
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
