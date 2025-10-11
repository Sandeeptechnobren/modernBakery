"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import FormInputField from "@/app/components/formInputField";
import { addCompany, getCompanyById, updateCompany, genearateCode, saveFinalCode } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Link from "next/link";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useEffect, useState, useRef } from "react";

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
  region: string;
  sub_region: string;
  district: string;
  town: string;
  street: string;
  landmark: string;
  selling_currency: string;
  purchase_currency: string;
  vat: string;
  module_access: string;
  service_type: string;
  status: string;
}

// 🔹 Full form schema (used on submit)
const CompanySchema = Yup.object().shape({
  company_name: Yup.string().required("Company name is required"),
  company_code: Yup.string().required("Company code is required"),
  company_type: Yup.string().required("Company type is required"),
 website: Yup.string()
  .url("Invalid website URL")
  .required("Company website is required"),
    company_logo: Yup.string().required("Company Logo is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
      region: Yup.string().required("Region is required"),
  country_id: Yup.string().required("Country is required"),
  selling_currency: Yup.string().required("Selling currency is required"),
  purchase_currency: Yup.string().required("Purchase currency is required"),
   vat: Yup.string()
  .required("VAT Number is a required field")
  .max(15, "VAT Number cannot be more than 15 characters"),

  service_type: Yup.string().required("Service type is required"),
  status: Yup.string().required("Status is required"),
  district: Yup.string().required("District is required"),
  town: Yup.string().required("Town is required"),
  street: Yup.string().required("Street is required"),
  landmark: Yup.string().required("Landmark is required"),
  sub_region: Yup.string().required("Sub Region is required"),
  primary_contact: Yup.string().required("Primary contact is required").min(10).max(13),
  toll_free_no: Yup.string().required("Toll free number is required"),
    module_access: Yup.string().required("Module is required field "),
    
    

});


// 🔹 Step-wise schemas
const stepSchemas = [
Yup.object({
  company_name: Yup.string().required("Company name is required"),
  company_code: Yup.string().required("Company code is required"),
  company_type: Yup.string().required("Company type is required"),
  website: Yup.string()
    .url("Invalid website URL")
    .required("Company website is required"),
  company_logo: Yup.string().required("Company Logo is required"),
}),

  Yup.object({
    primary_contact: Yup.string().required("Primary contact is required").min(10).max(13),
    primary_code: Yup.string(),
    toll_free_no: Yup.string().required("Toll free number is required"),
    toll_free_code: Yup.string(),
    email: Yup.string().email("Invalid email").required("Email is required"),
  }),
  Yup.object({
    region: Yup.string().required("Region is required"),
    sub_region: Yup.string().required("Sub Region is required"),
    district: Yup.string().required("District is required"),
    town: Yup.string().required("Town is required"),
    street: Yup.string().required("Street is required"),
    landmark: Yup.string(),
    country_id: Yup.string().required("Country is required"),
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

  Yup.object({
    module_access: Yup.string(),
    service_type: Yup.string().required("Service type is required"),
    status: Yup.string().required("Status is required"),
  }),
];

export default function AddEditCompany() {
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const { regionOptions, areaOptions, onlyCountryOptions, countryCurrency } = useAllDropdownListData();
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
    region: "",
    sub_region: "",
    district: "",
    town: "",
    street: "",
    landmark: "",
    selling_currency: "",
    purchase_currency: "",
    vat: "",
    module_access: "",
    service_type: "",
    status: "1",
  });

  // Load company for edit mode or generate code for add mode
  const codeGeneratedRef = useRef(false);
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      (async () => {
        const res = await getCompanyById(params.id as string);
        if (res && !res.error) {
          setInitialValues({
            ...res.data,
            country_id: res.data.country?.id?.toString() || "",
            region: res.data.region?.id?.toString() || "",
            sub_region: res.data.sub_region?.id?.toString() || "",
            selling_currency: res.data.selling_currency || "",
            purchase_currency: res.data.purchase_currency || "",
            primary_contact: res.data.primary_contact || "",
            toll_free_no: res.data.toll_free_no || "",
            company_code: res.data.company_code || "",
            company_name: res.data.company_name || "",
            email: res.data.email || "",
            vat: res.data.vat || "",
            street: res.data.street || "",
            town: res.data.town || "",
            district: res.data.district || "",
            landmark: res.data.landmark || "",
            module_access: res.data.module_access || "",
            service_type: res.data.service_type || "",
            status: res.data.status || "1",
          });
        }

      })();
    } else if ((params?.id === "add" || !params?.id) && !codeGeneratedRef.current) {
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
            // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
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
    { id: 3, label: "Location" },
    { id: 4, label: "Financial" },
    { id: 5, label: "Additional" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const handleSubmit = async (values: CompanyFormValues, { setSubmitting }: FormikHelpers<CompanyFormValues>) => {
    try {
      await CompanySchema.validate(values, { abortEarly: false });

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
        showSnackbar(isEditMode ? "Company Updated Successfully" : "Company Created Successfully", "success");
        router.push("/company");
        try {
          await saveFinalCode({ reserved_code: values.company_code, model_name: "companies" });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
      }
    } catch (err) {
      showSnackbar("Validation failed, please check your inputs", "error");
    } finally {
      setSubmitting(false);
    }
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
                  onChange={(e) => setFieldValue("company_code", e.target.value)}
                  disabled={codeMode === 'auto'}
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
                      title="Company Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === 'auto' && code) {
                          setFieldValue('company_code', code);
                        } else if (mode === 'manual') {
                          setFieldValue('company_code', '');
                        }
                      }}
                    />
                  </>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Company Name"
                  name="company_name"
                  value={values.company_name}
                  onChange={(e) => setFieldValue("company_name", e.target.value)}
                  error={touched.company_name && errors.company_name}
                />
                {errors.company_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
                )}
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
              {errors.company_type && (
                <p className="text-red-500 text-sm mt-1">{errors.company_type}</p>
              )}
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
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website}</p>
              )}
            </div>
          <div>
              <InputFields
                label="Logo"
                name="company_logo"
                type="file"
                value={values.company_logo}
                onChange={(e) => setFieldValue("company_logo", e.target.value)}
                error={touched.company_logo && errors.company_logo}
              />
                 {errors.company_logo && (
                <p className="text-red-500 text-sm mt-1">{errors.company_logo}</p>
              )}
               </div>
              
          </div>
        </ContainerCard>
      );

    case 2:
      return (
        <ContainerCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <FormInputField
                required
                type="contact"
                label="Primary Contact"
                contact={values.primary_contact}
                code={values.primary_code}
                onContactChange={(e) => setFieldValue("primary_contact", e.target.value)}
                onCodeChange={(e) => setFieldValue("primary_code", e.target.value)}
                options={onlyCountryOptions}
                error={touched.primary_contact && errors.primary_contact}
              />
              {errors.primary_contact && (
                <p className="text-red-500 text-sm mt-1">{errors.primary_contact}</p>
              )}
            </div>

            <div>
              <FormInputField
                required
                type="contact"
                label="Toll Free Number"
                contact={values.toll_free_no}
                code={values.toll_free_code}
                onContactChange={(e) => setFieldValue("toll_free_no", e.target.value)}
                onCodeChange={(e) => setFieldValue("toll_free_code", e.target.value)}
                options={onlyCountryOptions}
                error={touched.toll_free_no && errors.toll_free_no}
              />
              {errors.toll_free_no && (
                <p className="text-red-500 text-sm mt-1">{errors.toll_free_no}</p>
              )}
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
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
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
                label="Region"
                name="region"
                value={String(values.region)}
                options={regionOptions}
                onChange={(e) => setFieldValue("region", e.target.value)}
                error={touched.region && errors.region}
              />
              {errors.region && (
                <p className="text-red-500 text-sm mt-1">{errors.region}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                label="Sub Region"
                name="sub_region"
                value={String(values.sub_region)}
                options={areaOptions}
                onChange={(e) => setFieldValue("sub_region", e.target.value)}
                error={touched.sub_region && errors.sub_region}
              />
              {errors.sub_region && (
                <p className="text-red-500 text-sm mt-1">{errors.sub_region}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                label="District"
                name="district"
                value={values.district}
                onChange={(e) => setFieldValue("district", e.target.value)}
                error={touched.district && errors.district}
              />
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                label="Town"
                name="town"
                value={values.town}
                onChange={(e) => setFieldValue("town", e.target.value)}
                error={touched.town && errors.town}
              />
              {errors.town && (
                <p className="text-red-500 text-sm mt-1">{errors.town}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                label="Street"
                name="street"
                value={values.street}
                onChange={(e) => setFieldValue("street", e.target.value)}
                error={touched.street && errors.street}
              />
              {errors.street && (
                <p className="text-red-500 text-sm mt-1">{errors.street}</p>
              )}
            </div>

            <div>
              <InputFields
                label="Landmark"
                name="landmark"
                value={values.landmark}
                onChange={(e) => setFieldValue("landmark", e.target.value)}
                error={touched.landmark && errors.landmark}
              />
              {errors.landmark && (
                <p className="text-red-500 text-sm mt-1">{errors.landmark}</p>
              )}
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
              {errors.country_id && (
                <p className="text-red-500 text-sm mt-1">{errors.country_id}</p>
              )}
            </div>

          </div>
        </ContainerCard>
      );

    case 4:
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
              {errors.selling_currency && (
                <p className="text-red-500 text-sm mt-1">{errors.selling_currency}</p>
              )}
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
              {errors.purchase_currency && (
                <p className="text-red-500 text-sm mt-1">{errors.purchase_currency}</p>
              )}
            </div>

            <div>
              <InputFields
                label="VAT Number"
                name="vat"
                value={values.vat}
                onChange={(e) => setFieldValue("vat", e.target.value)}
                error={touched.vat && errors.vat}
              />
              {errors.vat && (
                <p className="text-red-500 text-sm mt-1">{errors.vat}</p>
              )}
            </div>
          </div>
        </ContainerCard>
      );

    case 5:
      return (
        <ContainerCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <InputFields
                label="Module"
                name="module_access"
                value={values.module_access}
                onChange={(e) => setFieldValue("module_access", e.target.value)}
                error={touched.module_access && errors.module_access}
              />
              {errors.module_access && (
                <p className="text-red-500 text-sm mt-1">{errors.module_access}</p>
              )}
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
              {errors.service_type && (
                <p className="text-red-500 text-sm mt-1">{errors.service_type}</p>
              )}
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
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
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
          <Link href="/company">
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
        {({ values, setFieldValue, errors, touched, setTouched, handleSubmit: formikSubmit }) => {
          const handleNextStep = async () => {
            try {
              const schema = stepSchemas[currentStep - 1];
              if (!schema) return;

              await schema.validate(values, { abortEarly: false });

              // ✅ Mark current step as completed
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
                steps={steps.map((s) => ({ ...s, isCompleted: isStepCompleted(s.id) }))}
                currentStep={currentStep}
                onStepClick={() => { }}
                onBack={prevStep}
                onNext={handleNextStep} // ✅ step-wise validation
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
