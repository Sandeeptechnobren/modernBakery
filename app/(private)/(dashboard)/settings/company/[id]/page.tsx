"use client";

import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import {
  addCompany,
  getCompanyById,
  updateCompany,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import {
  Formik,
  Form,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
} from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Link from "next/link";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useEffect, useState, useRef } from "react";
import Loading from "@/app/components/Loading";
import { address } from "framer-motion/client";

interface CompanyFormValues {
  company_name: string;
  company_code: string;
  company_type: string;
  website: string;
  company_logo: string;
  primary_contact: string;
  primary_code: string;
  toll_free_no: string;
  toll_free_code: string;
  email: string;
  country_id: string;
  address: string;
  city: string;
  selling_currency: string;
  purchase_currency: string;
  vat: string;
  module_access: string;
  service_type: string;
  status: string;
}

const CompanySchema = Yup.object().shape({
  company_name: Yup.string().required("Company name is required"),
  company_code: Yup.string().required("Company code is required"),
  company_type: Yup.string().required("Company type is required"),
  website: Yup.string()
    .required("Company website is required")
    .test("is-valid-website", "Invalid website URL", (value) => {
      if (!value) return false;
      try {
        const v = value.startsWith("http://") || value.startsWith("https://") ? value : `http://${value}`;
        const parsed = new URL(v);
        return !!parsed.hostname && parsed.hostname.indexOf(".") > -1;
      } catch (e) {
        return false;
      }
    }),
  company_logo: Yup.string().required("Company Logo is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  country_id: Yup.string().required("Country is required"),
  selling_currency: Yup.string().required("Selling currency is required"),
  purchase_currency: Yup.string().required("Purchase currency is required"),
  vat: Yup.string()
    .required("VAT Number is a required field")
    .max(15, "VAT Number cannot be more than 15 characters"),
  service_type: Yup.string().required("Service type is required"),
  status: Yup.string().required("Status is required"),
  city: Yup.string().required("City is required"),
  address: Yup.string().required("Address is required"),
  primary_contact: Yup.string()
    .required("Primary contact is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(9, "Must be at least 9 digits")
    .max(10, "Must be at most 10 digits"),

  toll_free_no: Yup.string()
    .required("Toll free number is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(10, "Must be at least 10 digits")
    .max(13, "Must be at most 13 digits"),

  module_access: Yup.string().required("Module is required field "),
 
});

// 🔹 Step-wise schemas
const stepSchemas = [
  Yup.object({
    company_name: Yup.string().required("Company name is required"),
    company_code: Yup.string().required("Company code is required"),
    company_type: Yup.string().required("Company type is required"),
    website: Yup.string()
      .required("Company website is required")
      .test("is-valid-website", "Invalid website URL", (value) => {
        if (!value) return false;
        try {
          const v = value.startsWith("http://") || value.startsWith("https://") ? value : `http://${value}`;
          const parsed = new URL(v);
          return !!parsed.hostname && parsed.hostname.indexOf(".") > -1;
        } catch (e) {
          return false;
        }
      }),
    company_logo: Yup.string().required("Company Logo is required"),
    address: Yup.string().required("address is required"),
    city: Yup.string().required("city is required"),
    
    country_id: Yup.string().required("Country is required"),
     module_access: Yup.string().required("Module is required"),
    service_type: Yup.string().required("Service type is required"),
    status: Yup.string().required("Status is required"),
  }),

  Yup.object({
    primary_contact: Yup.string()
      .required("Primary contact is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .min(9, "Must be at least 9 digits")
      .max(10, "Must be at most 10 digits"),

    primary_code: Yup.string(),
    toll_free_no: Yup.string()
      .required("Toll free number is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .min(10, "Must be at least 9 digits")
      .max(13, "Must be at most 10 digits"),
   
    email: Yup.string().email("Invalid email").required("Email is required"),
  }),

 

  Yup.object({
    selling_currency: Yup.string()
      .trim()
      .required("Please select a selling currency"),
    purchase_currency: Yup.string()
      .trim()
      .required("Please select a purchase currency"),
    vat: Yup.string()
      .required("VAT Number is a required field")
      .max(15, "VAT Number cannot be more than 15 characters"),
  }),

];

export default function AddEditCompany() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const { regionOptions, areaOptions, onlyCountryOptions, countryCurrency } =
    useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState<CompanyFormValues>({
    company_name: "",
    company_code: "",
    company_type: "",
    website: "",
    company_logo: "",
    email: "",
    primary_contact: "",
    primary_code: "",
    toll_free_no: "",
    toll_free_code: "",
    country_id: "",
    address: "",
    city: "",
    selling_currency: "",
    purchase_currency: "",
    vat: "",
    module_access: "",
    service_type: "",
    status: "1",
  });

  // Local country selector state for contact fields (used by InputFields contact type)
  const [primaryCountry, setPrimaryCountry] = useState<{ name: string; code?: string; flag?: string }>({
    name: "Uganda",
    code: "+256",
    flag: "🇺🇬",
  });

  const [tollFreeCountry, setTollFreeCountry] = useState<{ name: string; code?: string; flag?: string }>({
    name: "Uganda",
    code: "+256",
    flag: "🇺🇬",
  });

  // Load company for edit mode or generate code for add mode
  const codeGeneratedRef = useRef(false);
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      (async () => {
        setLoading(true);
        try {
          const res = await getCompanyById(params.id as string);
          if (res && !res.error) {
            setInitialValues({
              ...res.data,
              country_id: res.data.country?.id?.toString() || "",
              selling_currency: res.data.selling_currency || "",
              purchase_currency: res.data.purchase_currency || "",
              primary_contact: res.data.primary_contact || "",
              toll_free_no: res.data.toll_free_no || "",
              company_code: res.data.company_code || "",
              company_name: res.data.company_name || "",
              email: res.data.email || "",
              vat: res.data.vat || "",
              city: res.data.city || "",
              address: res.data.address || "",
              module_access: res.data.module_access || "",
              service_type: res.data.service_type || "",
              status: res.data.status || "1",
            });
          }
        } catch (err) {
          showSnackbar("Failed to fetch company details", "error");
        } finally {
          setLoading(false);
        }
      })();
    } else if (
      (params?.id === "add" || !params?.id) &&
      !codeGeneratedRef.current
    ) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          const res = await genearateCode({ model_name: "company" });
          if (res?.code) {
            setInitialValues((prev) => ({ ...prev, company_code: res.code }));
          }
          if (res?.prefix) {
            setPrefix(res.prefix);
          } else if (res?.code) {
            const match = res.prefix;
            if (match) setPrefix(prefix);
          }
        } catch (e) {
          // Optionally handle error
        }
      })();
    }
  }, [params?.id]);

  const steps: StepperStep[] = [
    { id: 1, label: "Company" },
    { id: 2, label: "Contact" },
    { id: 3, label: "Financial" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const handleSubmit = async (
    values: CompanyFormValues,
    { setSubmitting }: FormikHelpers<CompanyFormValues>
  ) => {
    try {
      await CompanySchema.validate(values, { abortEarly: false });
      setLoading(true);
      const formData = new FormData();
      (Object.keys(values) as (keyof CompanyFormValues)[]).forEach((key) => {
        formData.append(key, values[key] ?? "");
      });

      let res;
      if (isEditMode) {
        res = await updateCompany(params.id as string, formData);
      } else {
        res = await addCompany(formData);
      }

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Company Updated Successfully"
            : "Company Created Successfully",
          "success"
        );
        router.push("/settings/company");
        try {
          await saveFinalCode({
            reserved_code: values.company_code,
            model_name: "company",
          });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
      }
    } catch (err) {
      showSnackbar("Validation failed, please check your inputs", "error");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // 🔹 Helper function to allow only numeric input
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, setFieldValue: any) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    setFieldValue(fieldName, value);
  };

  const renderStepContent = (
    values: CompanyFormValues,
    setFieldValue: (
      field: keyof CompanyFormValues,
      value: string | File,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<CompanyFormValues>,
    touched: FormikTouched<CompanyFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Company Code"
                  name="company_code"
                  value={values.company_code}
                  onChange={(e) =>
                    setFieldValue("company_code", e.target.value)
                  }
                  disabled={codeMode === "auto"}
                />
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
                      title="Company Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === "auto" && code) {
                          setFieldValue("company_code", code);
                        } else if (mode === "manual") {
                          setFieldValue("company_code", "");
                        }
                      }}
                    />
                  </>
                )} */}
              </div>
              <div>
                <InputFields
                  required
                  label="Company Name"
                  name="company_name"
                  value={values.company_name}
                  onChange={(e) =>
                    setFieldValue("company_name", e.target.value)
                  }
                  error={
                    errors?.company_name && touched.company_name
                      ? errors.company_name
                      : false
                  }
                />
                
              </div>

              <div>
                <InputFields
                  required
                  label="Company Type"
                  name="company_type"
                  value={values.company_type}
                  onChange={(e) => setFieldValue("company_type", e.target.value)}
                  options={[
                    { value: "manufacturing", label: "Manufacturing" },
                    { value: "trading", label: "Trading" },
                  ]}
                  error={touched.company_type && errors.company_type}
                />
                
              </div>

              <div>
                <InputFields
                  required
                  label="Website"
                  name="website"
                  value={values.website}
                  onChange={(e) => setFieldValue("website", e.target.value)}
                  error={touched.website && errors.website}
                />
                
              </div>
              <div>
                <InputFields
                required
                  label="Logo"
                  name="company_logo"
                  type="file"
                  value={values.company_logo}
                  onChange={(e) => setFieldValue("company_logo", e.target.value)}
                  error={touched.company_logo && errors.company_logo}
                />
                
              </div>
              <div>
                <InputFields
                required
                  label="Module"
                  name="module_access"
                  value={values.module_access}
                  onChange={(e) => setFieldValue("module_access", e.target.value)}
                  error={touched.module_access && errors.module_access}
                />
                
              </div>

              <div>
                <InputFields
                  required
                  label="Service Type"
                  name="service_type"
                  value={values.service_type}
                  onChange={(e) => setFieldValue("service_type", e.target.value)}
                  options={[
                    { value: "branch", label: "Branch" },
                    { value: "warehouse", label: "Warehouse" },
                  ]}
                  error={touched.service_type && errors.service_type}
                />
                
              </div>

              <div>
                <InputFields
                  required
                  label="Address"
                  name="address"
                  value={values.address}
                  onChange={(e) => setFieldValue("address", e.target.value)}
                  error={touched.address && errors.address}
                />
                
              </div>

              <div>
                <InputFields
                  required
                  label="City"
                  name="city"
                  value={values.city}
                  onChange={(e) => setFieldValue("city", e.target.value)}
                  error={touched.city && errors.city}
                />
                
              </div>

             
              <div>
                <InputFields
                  required
                  label="Country"
                  name="country_id"
                  value={values.country_id ? values.country_id.toString() : ""}
                  options={onlyCountryOptions}
                  onChange={(e) => setFieldValue("country_id", e.target.value)}
                  error={touched.country_id && errors.country_id}
                />
                
              </div>
              <div>
                <InputFields
                  required
                  label="Status"
                  name="status"
                  type="radio"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  error={touched.status && errors.status}
                />
                
              </div>
            </div>
          </ContainerCard>
        );

      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  type="contact"
                  label="Primary Contact"
                  name="primary_contact"
                  selectedCountry={primaryCountry}
                  setSelectedCountry={(c: { name: string; code?: string; flag?: string } | undefined) => {
                    setPrimaryCountry(c ?? { name: "", code: "", flag: "" });
                    setFieldValue("primary_code", c?.code ?? "");
                  }}
                  value={values.primary_contact}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleNumericInput(e as React.ChangeEvent<HTMLInputElement>, "primary_contact", setFieldValue)}
                  error={touched.primary_contact && errors.primary_contact}
                />
              </div>

              <div>
                <InputFields
                  required
                  type="contact"
                  label="Toll Free Number"
                  name="toll_free_no"
                  selectedCountry={tollFreeCountry}
                  setSelectedCountry={(c: { name: string; code?: string; flag?: string } | undefined) => {
                    setTollFreeCountry(c ?? { name: "", code: "", flag: "" });
                    setFieldValue("toll_free_code", c?.code ?? "");
                  }}
                  value={values.toll_free_no}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleNumericInput(e as React.ChangeEvent<HTMLInputElement>, "toll_free_no", setFieldValue)}
                  error={touched.toll_free_no && errors.toll_free_no}
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                  error={touched.email && errors.email}
                />
                
              </div>
            </div>
          </ContainerCard>
        );


      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Selling Currency"
                  name="selling_currency"
                  value={values.selling_currency}
                  options={countryCurrency}
                  onChange={(e) => setFieldValue("selling_currency", e.target.value)}
                  error={touched.selling_currency && errors.selling_currency}
                />
                
              </div>

              <div>
                <InputFields
                  required
                  label="Purchase Currency"
                  name="purchase_currency"
                  value={values.purchase_currency}
                  options={countryCurrency}
                  onChange={(e) => setFieldValue("purchase_currency", e.target.value)}
                  error={touched.purchase_currency && errors.purchase_currency}
                />
                
              </div>

              <div>
                <InputFields
                required
                  label="VAT Number"
                  name="vat"
                  value={values.vat}
                  onChange={(e) => setFieldValue("vat", e.target.value)}
                  error={touched.vat && errors.vat}
                />
                
              </div>
            </div>
          </ContainerCard>
        );

     
      default:
        return null;
    }
  };

  if ((isEditMode && loading) || !onlyCountryOptions || !countryCurrency) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Company" : "Add New Company"}
          </h1>
        </div>
      </div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CompanySchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          setTouched,
          handleSubmit: formikSubmit,
        }) => {
          const handleNextStep = async () => {
            try {
              const schema = stepSchemas[currentStep - 1];
              if (!schema) return;

              await schema.validate(values, { abortEarly: false });

              markStepCompleted(currentStep);
              nextStep();
            } catch (err: unknown) {
              if (err instanceof Yup.ValidationError && err.inner) {
                const formTouched: Record<string, boolean> = {};
                err.inner.forEach((validationError: Yup.ValidationError) => {
                  if (validationError.path) {
                    formTouched[validationError.path] = true;
                  }
                });
                setTouched({ ...touched, ...formTouched });
              }
            }
          };

          return (
            <Form>
              <StepperForm
                steps={steps.map((s) => ({
                  ...s,
                  isCompleted: isStepCompleted(s.id),
                }))}
                currentStep={currentStep}
                onStepClick={() => {}}
                onBack={prevStep}
                onNext={handleNextStep}
                onSubmit={() => formikSubmit()}
                showSubmitButton={isLastStep}
                showNextButton={!isLastStep}
                nextButtonText="Save & Next"
                submitButtonText="Submit"
              >
                {renderStepContent(values, setFieldValue, errors, touched)}
              </StepperForm>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}