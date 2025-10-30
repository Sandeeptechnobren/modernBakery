"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { addCompanyType, getComponyTypeById, updateCompanyType, genearateCode, saveFinalCode } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Form, Formik, FormikHelpers } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import * as Yup from "yup";

interface CompanyTypeFormValues {
  company_type_code: string;
  name: string;
  status: number;
}

const CompanyTypeSchema = Yup.object().shape({
  company_type_code: Yup.string().required("Company Type Code is required"),
  name: Yup.string().required("Name is required"),
  status: Yup.number().oneOf([0, 1], "Invalid status").required("Status is required"),
});


export default function AddEditCompanyType() {
 
const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const codeGeneratedRef = useRef(false);
  const [initialValues, setInitialValues] = useState<CompanyTypeFormValues>({
    company_type_code: "",
    name: "",
    status: 1,
  });

  // Load company type for edit mode and generate code in add mode
  useEffect(() => {
    if (params?.uuid && params.uuid !== "add") {
      setIsEditMode(true);
      (async () => {
        const res = await getComponyTypeById(params.uuid as string);
        if (res && !res.error) {
          setInitialValues({
            company_type_code: res.data.code ?? "",
            name: res.data.name ?? "",
            status: res.data.status ?? 1,
          });
        }
      })();
    } else {
      setIsEditMode(false);
      // Only generate code once in add mode
      if (!codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        (async () => {
          let code = "";
          try {
            const res = await genearateCode({ model_name: "company_types" });
            if (res?.code) code = res.code;
            if (res?.prefix) {
              setPrefix(res.prefix);
            } else if (res?.code) {
              // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
              const match = res.prefix;
              if (match) setPrefix(prefix);
            }
          } catch {}
          setInitialValues({ company_type_code: code, name: "", status: 1 });
        })();
      } else {
        setInitialValues({ company_type_code: "", name: "", status: 1 });
      }
    }
  }, [params?.uuid]);

  const handleSubmit = async (values: CompanyTypeFormValues, { setSubmitting }: FormikHelpers<CompanyTypeFormValues>) => {
    try {
      await CompanyTypeSchema.validate(values, { abortEarly: false });
      let res;
      if (isEditMode) {
        res = await updateCompanyType(params.uuid as string, values);
      } else {
        res = await addCompanyType(values);
        if (!res?.error) {
          try {
            await saveFinalCode({ reserved_code: values.company_type_code, model_name: "company_types" });
          } catch (e) {}
        }
      }
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(isEditMode ? "Company Type Updated Successfully" : "Company Type Created Successfully", "success");
        router.push("/settings/company/companyType");
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
          {isEditMode ? "Edit Company Type" : "Add New Company Type"}
        </h1>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CompanyTypeSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => {
          const { values, setFieldValue, errors, touched, isSubmitting, resetForm } = formik;
          return (
            <Form>
              <ContainerCard>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Company Type Code (pattern-matched UI) */}
                  <div className="flex items-start gap-2 max-w-[406px]">
                  <InputFields
  label="Company Type Code"
  name="company_type_code"
  value={values.company_type_code}
  onChange={(e) => setFieldValue("company_type_code", e.target.value)}
  disabled={isEditMode || codeMode === 'auto'}
  error={touched.company_type_code && errors.company_type_code}
/>
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
                          title="Service Type Code"
                          prefix={prefix}
                          setPrefix={setPrefix}
                          onSave={(mode, code) => {
                            setCodeMode(mode);
                            if (mode === 'auto' && code) {
                              setFieldValue('service_type_code', code);
                            } else if (mode === 'manual') {
                              setFieldValue('service_type_code', '');
                            }
                          }}
                        />
                      </>
                    )}
                 
                  </div>
               <div>
                   <InputFields
                    required
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                    error={touched.name && errors.name}
                  />
                  <div className="text-sm text-red-500">
                    {touched.name && errors.name}
                  </div>
               </div>
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