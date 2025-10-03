"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import FormInputField from "@/app/components/formInputField";
import { addCompany, getCompanyById, updateCompany } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Link from "next/link";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { useEffect, useState } from "react";

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
  tin_number: string;
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
  email: Yup.string().email("Invalid email").required("Email is required"),
  country_id: Yup.string().required("Country is required"),
  tin_number: Yup.string().required("TIN Number is required"),
  selling_currency: Yup.string().required("Selling currency is required"),
  purchase_currency: Yup.string().required("Purchase currency is required"),
  service_type: Yup.string().required("Service type is required"),
  status: Yup.string().required("Status is required"),
  district: Yup.string().required("District is required"),
  town: Yup.string().required("Town is required"),
  street: Yup.string().required("Street is required"),
  sub_region: Yup.string().required("Sub Region is required"),
  primary_contact: Yup.string().required("Primary contact is required"),
  toll_free_no: Yup.string().required("Toll free number is required"),
});

// 🔹 Step-wise schemas
const stepSchemas = [
  Yup.object({
    company_name: Yup.string().required("Company name is required"),
    company_code: Yup.string().required("Company code is required"),
    company_type: Yup.string().required("Company type is required"),
    website: Yup.string(),
    company_logo: Yup.string(),
  }),
  Yup.object({
    primary_contact: Yup.string().required("Primary contact is required"),
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
    tin_number: Yup.string().required("TIN Number is required"),
  }),
  Yup.object({
    selling_currency: Yup.string().required("Selling currency is required"),
    purchase_currency: Yup.string().required("Purchase currency is required"),
    vat: Yup.string(),
  }),
  Yup.object({
    module_access: Yup.string(),
    service_type: Yup.string().required("Service type is required"),
    status: Yup.string().required("Status is required"),
  }),
];

export default function AddEditCompany() {
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
    tin_number: "",
    selling_currency: "USD",
    purchase_currency: "USD",
    vat: "",
    module_access: "",
    service_type: "",
    status: "1",
  });

  // Load company for edit mode
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      (async () => {
        const res = await getCompanyById(params.id as string);
        if (res && !res.error) {
          setInitialValues(res.data);
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
        router.push("/dashboard/master/company");
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
              <InputFields
              required
                label="Company Code"
                name="company_code"
                value={values.company_code}
                onChange={(e) => setFieldValue("company_code", e.target.value)}
                error={touched.company_code && errors.company_code}
              />
              <InputFields
              required
                label="Company Name"
                name="company_name"
                value={values.company_name}
                onChange={(e) => setFieldValue("company_name", e.target.value)}
                error={touched.company_name && errors.company_name}
              />
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
              />
              <InputFields
                label="Website"
                name="website"
                value={values.website}
                onChange={(e) => setFieldValue("website", e.target.value)}
              />
              <InputFields
                label="Logo"
                name="company_logo"
                type="file"
                value={values.company_logo}
                onChange={(e) => setFieldValue("company_logo", e.target.value)}
              />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <FormInputField
              required
                type="contact"
                label="Primary Contact"
                contact={values.primary_contact}
                code={values.primary_code}
                onContactChange={(e) => setFieldValue("primary_contact", e.target.value)}
                onCodeChange={(e) => setFieldValue("primary_code", e.target.value)}
                options={onlyCountryOptions}
              />
              <FormInputField
              required
                type="contact"
                label="Toll Free Number"
                contact={values.toll_free_no}
                code={values.toll_free_code}
                onContactChange={(e) => setFieldValue("toll_free_no", e.target.value)}
                onCodeChange={(e) => setFieldValue("toll_free_code", e.target.value)}
                options={onlyCountryOptions}
              />
              <InputFields
              required
                label="Email"
                name="email"
                value={values.email}
                onChange={(e) => setFieldValue("email", e.target.value)}
                error={touched.email && errors.email}
              />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
              required
                label="Region"
                name="region"
                value={values.region}
                options={regionOptions}
                onChange={(e) => setFieldValue("region", e.target.value)}
                error={errors?.region && touched?.region ? errors.region : false}
              />
              <InputFields
              required
                label="Sub Region"
                name="sub_region"
                value={values.sub_region}
                options={areaOptions}
                onChange={(e) => setFieldValue("sub_region", e.target.value)}
                error={errors?.sub_region && touched?.sub_region ? errors.sub_region : false}
              />
              <InputFields
              required
                label="District"
                name="district"
                value={values.district}
                onChange={(e) => setFieldValue("district", e.target.value)}
              />
              <InputFields
                label="Town"
                name="town"
                value={values.town}
                onChange={(e) => setFieldValue("town", e.target.value)}
              />
              <InputFields
                label="Street"
                name="street"
                value={values.street}
                onChange={(e) => setFieldValue("street", e.target.value)}
              />
              <InputFields
                label="Landmark"
                name="landmark"
                value={values.landmark}
                onChange={(e) => setFieldValue("landmark", e.target.value)}
              />
              <InputFields
              required
                label="Country"
                name="country_id"
                value={values.country_id ? values.country_id.toString() : ""}
                options={onlyCountryOptions}
                onChange={(e) => setFieldValue("country_id", e.target.value)}
                error={errors?.country_id && touched?.country_id ? errors.country_id : false}
              />
              <InputFields
                label="TIN Number"
                name="tin_number"
                value={values.tin_number}
                onChange={(e) => setFieldValue("tin_number", e.target.value)}
                error={touched.tin_number && errors.tin_number}
              />
            </div>
          </ContainerCard>
        );
      case 4:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                label="Selling Currency"
                name="selling_currency"
                value={values.selling_currency}
                options={countryCurrency}
                onChange={(e) => setFieldValue("selling_currency", e.target.value)}
              />
              <InputFields
                label="Purchase Currency"
                name="purchase_currency"
                value={values.purchase_currency}
                options={countryCurrency}
                onChange={(e) => setFieldValue("purchase_currency", e.target.value)}
              />
              <InputFields
                label="VAT Number"
                name="vat"
                value={values.vat}
                onChange={(e) => setFieldValue("vat", e.target.value)}
              />
            </div>
          </ContainerCard>
        );
      case 5:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
              required
                label="Module"
                name="module_access"
                value={values.module_access}
                onChange={(e) => setFieldValue("module_access", e.target.value)}
              />
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
              />
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
              />
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
          <Link href="/dashboard/master/company">
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
                onStepClick={() => {}}
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
