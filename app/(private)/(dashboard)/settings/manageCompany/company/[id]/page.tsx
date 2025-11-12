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
import ImagePreviewModal from "@/app/components/ImagePreviewModal";
import { useEffect, useState, useRef } from "react";
import { useLoading } from "@/app/services/loadingContext";

interface CompanyFormValues {
  company_name: string;
  company_code: string;
  company_type: string;
  website: string;
  logo: File | string | null;
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
  status: string;
}

const CompanySchema = Yup.object().shape({
  company_name: Yup.string().required("Company name is required"),
  company_code: Yup.string().required("Company code is required"),
  company_type: Yup.string().required("Company type is required"),
  website: Yup.string().required("Company website is required"),
  logo: Yup.mixed().nullable().required("Company Logo is required"),
  email: Yup.string().nullable().email("Invalid email"),
  country_id: Yup.string().required("Country is required"),
  selling_currency: Yup.string().required("Selling currency is required"),
  purchase_currency: Yup.string().required("Purchase currency is required"),
  vat: Yup.string()
    .required("VAT Number is a required field")
    .max(15, "VAT Number cannot be more than 15 characters"),
  status: Yup.string().required("Status is required"),
  city: Yup.string().required("City is required"),
  address: Yup.string().required("Address is required"),
  primary_contact: Yup.string()
    .nullable()
    .test(
      "is-valid-primary-contact",
      "Only numbers allowed and must be 9 to 10 digits",
      (value) => {
        if (value === null || value === undefined || value === "") return true;
        return /^\d{9,10}$/.test(value);
      }
    ),
  toll_free_no: Yup.string()
    .nullable()
    .test(
      "is-valid-toll-free",
      "Only numbers allowed and must be 9 to 10 digits",
      (value) => {
        if (value === null || value === undefined || value === "") return true;
        return /^\d{9,10}$/.test(value);
      }
    ),
  module_access: Yup.string().required("Module is required field "),
});

// 🔹 Step-wise schemas
// const stepSchemas = [
//   Yup.object({
//     company_name: Yup.string().required("Company name is required"),
//     company_code: Yup.string().required("Company code is required"),
//     company_type: Yup.string().required("Company type is required"),
//     website: Yup.string()
//       .required("Company website is required")
//       .test("is-valid-website", "Invalid website URL", (value) => {
//         if (!value) return false;
//         try {
//           const v = value.startsWith("http://") || value.startsWith("https://") ? value : `http://${value}`;
//           const parsed = new URL(v);
//           return !!parsed.hostname && parsed.hostname.indexOf(".") > -1;
//         } catch (e) {
//           return false;
//         }
//       }),
//     company_logo: Yup.string().required("Company Logo is required"),
//     address: Yup.string().required("address is required"),
//     city: Yup.string().required("city is required"),

//     country_id: Yup.string().required("Country is required"),
//     module_access: Yup.string().required("Module is required"),
//     status: Yup.string().required("Status is required"),
//   }),

//   Yup.object({
//     primary_contact: Yup.string()
//       .required("Primary contact is required")
//       .matches(/^[0-9]+$/, "Only numbers are allowed")
//       .min(9, "Must be at least 9 digits")
//       .max(10, "Must be at most 10 digits"),

//     primary_code: Yup.string(),
//     toll_free_no: Yup.string()
//       .required("Toll free number is required")
//       .matches(/^[0-9]+$/, "Only numbers are allowed")
//       .min(10, "Must be at least 9 digits")
//       .max(13, "Must be at most 10 digits"),

//     email: Yup.string().email("Invalid email").required("Email is required"),
//   }),



//   Yup.object({
//     selling_currency: Yup.string()
//       .trim()
//       .required("Please select a selling currency"),
//     purchase_currency: Yup.string()
//       .trim()
//       .required("Please select a purchase currency"),
//     vat: Yup.string()
//       .required("VAT Number is a required field")
//       .max(15, "VAT Number cannot be more than 15 characters"),
//   }),

// ];

const stepSchemas = [
  // Company basic info + logo + address/module/status
  CompanySchema.pick([
    "company_name",
    "company_code",
    "company_type",
    "website",
    "logo",
    "address",
    "city",
    "country_id",
    "module_access",
    "status",
  ]),

  // Contact info
  CompanySchema.pick([]),

  // Financial info
  CompanySchema.pick([
    "selling_currency",
    "purchase_currency",
    "vat",
  ]),
];

export default function AddEditCompany() {
  const [isOpen, setIsOpen] = useState(false);
  const { setLoading } = useLoading();
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const { regionOptions, areaOptions, onlyCountryOptions, countryCurrency } =
    useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const ALLOWED_LOGO_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];
  const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1MB
  const [initialValues, setInitialValues] = useState<CompanyFormValues>({
    company_name: "",
    company_code: "",
    company_type: "",
    website: "",
    logo: "",
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
    status: "1",
  });

  // if editing and there's an existing logo URL, show preview
  useEffect(() => {
    if (initialValues.logo && typeof initialValues.logo === "string") {
      setLogoPreview(initialValues.logo as string);
    }
  }, [initialValues.logo]);

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
              // service_type: res.data.service_type || "",
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
          setLoading(true);
          const res = await genearateCode({ model_name: "company" });
          setLoading(false);

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
    { setSubmitting, setErrors, setTouched, setFieldValue }: FormikHelpers<CompanyFormValues>
  ) => {
    try {
      // Normalize website: ensure it starts with https:// (or http://) — prefer https
      const rawWebsite = (values.website || "").toString().trim();
      const normalizedWebsite = rawWebsite
        ? /^https?:\/\//i.test(rawWebsite)
          ? rawWebsite
          : `https://${rawWebsite}`
        : rawWebsite;

      const normalizedValues: CompanyFormValues = {
        ...values,
        website: normalizedWebsite as string,
      };

      // update Formik UI value so user sees the prefixed website
      if (normalizedWebsite && normalizedWebsite !== values.website) {
        try {
          setFieldValue("website", normalizedWebsite, false);
        } catch (e) {
          // ignore if setFieldValue not available
        }
      }

      await CompanySchema.validate(normalizedValues, { abortEarly: false });
      setLoading(true);
      const formData = new FormData();
      (Object.keys(normalizedValues) as (keyof CompanyFormValues)[]).forEach((key) => {
        if (key === "logo") {
          const v = normalizedValues.logo as any;
          if (v instanceof File) {
            formData.append("logo", v);
          }
          // if it's a string (existing URL) we don't append — backend should keep existing logo
        } else {
          const val = normalizedValues[key] as any;
          formData.append(key as string, val ?? "");
        }
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
        showSnackbar(isEditMode ? "Company Updated Successfully" : "Company Created Successfully", "success");
        router.push("/settings/manageCompany/company");
        try {
          await saveFinalCode({
            reserved_code: values.company_code,
            model_name: "company",
          });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
      }
    } catch (err: any) {
      // Improved error handling: handle Yup validation errors, API errors, and unexpected errors
      try {
        if (err?.name === "ValidationError" && Array.isArray(err?.errors)) {
          // Yup validation error
          console.error("Yup ValidationError:", err);
          const message = (err.errors || []).join(". ");
          showSnackbar(message || "Validation failed, please check your inputs", "error");
        } else if (err?.response?.data) {
          // Axios / API error shape
          console.error("API Error:", err.response);
          const msg = err.response?.data?.message || JSON.stringify(err.response.data);
          showSnackbar(msg || "Server error while submitting the form", "error");
        } else if (err instanceof Error) {
          console.error("Error:", err);
          showSnackbar(err.message || "An unexpected error occurred", "error");
        } else {
          console.error("Unexpected error:", err);
          const serialized = typeof err === "string" ? err : JSON.stringify(err, Object.getOwnPropertyNames(err));
          showSnackbar(serialized || "An unexpected error occurred", "error");
        }
      } catch (e) {
        console.error("Error while handling submit error:", e, "original:", err);
        showSnackbar("An unexpected error occurred", "error");
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  // 🔹 Helper function to allow only numeric input
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, setFieldValue: any) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
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
    touched: FormikTouched<CompanyFormValues>,
    submitCount: number
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  error={((touched.company_name || submitCount > 0) && errors?.company_name) || false}
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
                  error={((touched.company_type || submitCount > 0) && errors.company_type) || false}
                />

              </div>

              <div>
                <InputFields
                  required
                  label="Website"
                  name="website"
                  value={values.website}
                  onChange={(e) => setFieldValue("website", e.target.value)}
                  error={((touched.website || submitCount > 0) && errors.website) || false}
                />

              </div>
              <div className="relative">
                <InputFields
                  required
                  label="Logo"
                  name="logo"
                  type="file"
                  value={typeof values.logo === 'string' ? values.logo : ''}
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    const file = input.files?.[0] ?? null;
                    setLogoError(null);
                    if (file) {
                      if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
                        setLogoError('Unsupported file type. Please upload png, jpeg, webp or svg.');
                        setFieldValue('logo', null as any);
                        setLogoPreview(null);
                        return;
                      }
                      if (file.size > MAX_LOGO_SIZE) {
                        setLogoError('File too large. Maximum size is 1MB.');
                        setFieldValue('logo', null as any);
                        setLogoPreview(null);
                        return;
                      }
                      setFieldValue('logo', file as any);
                      try {
                        if (logoPreview && logoPreview.startsWith('blob:')) {
                          try { URL.revokeObjectURL(logoPreview); } catch (e) { /** ignore */ }
                        }
                        setLogoPreview(URL.createObjectURL(file));
                      } catch (err) {
                        setLogoPreview(null);
                      }
                    } else {
                      setFieldValue('logo', null as any);
                      setLogoPreview(null);
                    }
                  }}
                  error={((touched.logo || submitCount > 0) && (errors.logo as any)) || false}
                />

                {/* view icon at top-right when image exists */}
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute right-1 top-0 p-1 hover:text-blue-600 hover:cursor-pointer"
                    aria-label="View logo"
                  >
                    <div className="flex items-center gap-[2px]">
                      <span className="text-[10px]">View Logo</span>
                      <Icon icon="mdi:eye" width={18} />
                    </div>
                  </button>
                )}

                {/* thumbnail preview removed - use view (eye) button to open modal */}
                {logoError && <div className="text-xs text-red-500 mt-1">{logoError}</div>}
              </div>
              <div>
                <InputFields
                  required
                  label="Module"
                  name="module_access"
                  value={values.module_access}
                  onChange={(e) => setFieldValue("module_access", e.target.value)}
                  error={((touched.module_access || submitCount > 0) && errors.module_access) || false}
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Address"
                  name="address"
                  value={values.address}
                  onChange={(e) => setFieldValue("address", e.target.value)}
                  error={((touched.address || submitCount > 0) && errors.address) || false}
                />
              </div>

              <div>
                <InputFields
                  required
                  label="City"
                  name="city"
                  value={values.city}
                  onChange={(e) => setFieldValue("city", e.target.value)}
                  error={((touched.city || submitCount > 0) && errors.city) || false}
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
                  error={((touched.country_id || submitCount > 0) && errors.country_id) || false}
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
                  error={((touched.status || submitCount > 0) && errors.status) || false}
                />
              </div>
            </div>
          </ContainerCard>
        );

      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <InputFields
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
                  error={((touched.primary_contact || submitCount > 0) && errors.primary_contact) || false}
                />
              </div>

              <div>
                <InputFields
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
                  error={((touched.toll_free_no || submitCount > 0) && errors.toll_free_no) || false}
                />
              </div>

              <div>
                <InputFields
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                  error={((touched.email || submitCount > 0) && errors.email) || false}
                />

              </div>
            </div>
          </ContainerCard>
        );

      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Selling Currency"
                  name="selling_currency"
                  value={values.selling_currency}
                  options={countryCurrency}
                  onChange={(e) => setFieldValue("selling_currency", e.target.value)}
                  error={((touched.selling_currency || submitCount > 0) && errors.selling_currency) || false}
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
                  error={((touched.purchase_currency || submitCount > 0) && errors.purchase_currency) || false}
                />

              </div>

              <div>
                <InputFields
                  required
                  label="VAT Number"
                  name="vat"
                  value={values.vat}
                  onChange={(e) => setFieldValue("vat", e.target.value)}
                  error={((touched.vat || submitCount > 0) && errors.vat) || false}
                />

              </div>
            </div>
          </ContainerCard>
        );

      default:
        return null;
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/manageCompany/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Company" : "Add New Company"}
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
          isSubmitting,
          submitCount,
        }) => {
          // console.log("Formik errors:", errors);
          console.log("Formik Values:", values);
          const handleNextStep = async () => {
            try {
              const schema = stepSchemas[currentStep - 1];
              if (!schema) return;

              await schema.validate(values, { abortEarly: false });

              markStepCompleted(currentStep);
              nextStep();
            } catch (err: unknown) {
              if (err instanceof Yup.ValidationError) {
                // mark all fields in this step as touched so errors show
                try {
                  const schema = stepSchemas[currentStep - 1];
                  const fieldNames = schema && (schema as any).fields ? Object.keys((schema as any).fields) : [];
                  const formTouched: Record<string, boolean> = {};
                  fieldNames.forEach((f: string) => { formTouched[f] = true; });
                  // also mark specific errored paths as touched if available
                  if (err.inner && err.inner.length) {
                    err.inner.forEach((validationError: Yup.ValidationError) => {
                      if (validationError.path) formTouched[validationError.path] = true;
                    });
                  }
                  setTouched({ ...touched, ...formTouched });
                } catch (e) {
                  // fallback: mark nothing explicit, but preserve previous behavior
                  if (err.inner) {
                    const formTouched: Record<string, boolean> = {};
                    err.inner.forEach((validationError: Yup.ValidationError) => {
                      if (validationError.path) formTouched[validationError.path] = true;
                    });
                    setTouched({ ...touched, ...formTouched });
                  }
                }
              }
            }
          };

          return (
            <>
              <Form>
                <StepperForm
                  steps={steps.map((s) => ({
                    ...s,
                    isCompleted: isStepCompleted(s.id),
                  }))}
                  currentStep={currentStep}
                  onStepClick={() => { }}
                  onBack={prevStep}
                  onNext={handleNextStep}
                  onSubmit={() => formikSubmit()}
                  showSubmitButton={isLastStep}
                  showNextButton={!isLastStep}
                  nextButtonText="Save & Next"
                  submitButtonText={isSubmitting ? "Submitting..." : "Submit"}
                >
                  {renderStepContent(values, setFieldValue, errors, touched, submitCount)}
                </StepperForm>
              </Form>
              <ImagePreviewModal
                images={logoPreview ? [logoPreview] : []}
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
              />
            </>
          );
        }}
      </Formik>
    </div>
  );
}