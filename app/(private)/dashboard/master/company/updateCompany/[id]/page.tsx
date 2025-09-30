"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import * as Yup from "yup";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import FormInputField from "@/app/components/formInputField";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

import {
  getCompanyById,
  updateCompany,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

/* ---------------- SCHEMAS ---------------- */
const CompanySchema = Yup.object({
  companyCode: Yup.string().required("Company code is required"),
  companyName: Yup.string().required("Company name is required"),
  companyType: Yup.string().required("Company type is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  country: Yup.string().required("Country is required"),
  tinNumber: Yup.string().required("TIN Number is required"),
  sellingCurrency: Yup.string().required("Selling currency is required"),
  purchaseCurrency: Yup.string().required("Purchase currency is required"),
  serviceType: Yup.string().required("Service type is required"),
  status: Yup.string().required("Status is required"),
  district: Yup.string().required("District is required"),
  town: Yup.string().required("Town is required"),
  street: Yup.string().required("Street is required"),
  subRegion: Yup.string().required("Sub Region is required"),
  primaryContact: Yup.string().required("Primary contact is required"),
  tollFreeNumber: Yup.string().required("Toll free number is required"),
});

const stepSchemas = [
  Yup.object({
    companyCode: Yup.string().required("Company code is required"),
    companyName: Yup.string().required("Company name is required"),
    companyType: Yup.string().required("Company type is required"),
    companyWebsite: Yup.string(),
  }),
  Yup.object({
    primaryContact: Yup.string().required("Primary contact is required"),
    tollFreeNumber: Yup.string().required("Toll free number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  }),
  Yup.object({
    region: Yup.string().required("Region is required"),
    subRegion: Yup.string().required("Sub Region is required"),
    district: Yup.string().required("District is required"),
    town: Yup.string().required("Town is required"),
    street: Yup.string().required("Street is required"),
    country: Yup.string().required("Country is required"),
    tinNumber: Yup.string().required("TIN Number is required"),
  }),
  Yup.object({
    sellingCurrency: Yup.string().required("Selling currency is required"),
    purchaseCurrency: Yup.string().required("Purchase currency is required"),
  }),
  Yup.object({
    module_access: Yup.string().required("Modules is required"),
    serviceType: Yup.string().required("Service type is required"),
    status: Yup.string().required("Status is required"),
  }),
];


interface CompanyFormValues {
  companyType: string;
  companyCode: string;
  companyName: string;
  companyWebsite: string;
  primaryCode: string;
  primaryContact: string;
  tollFreeCode: string;
  tollFreeNumber: string;
  email: string;
  region: {id: string};  
  subRegion: {id: string};
  district: string;
  town: string;
  street: string;
  landmark: string;
 country: string; 
  tinNumber: string;
  sellingCurrency: string;
  purchaseCurrency: string;
  vatNo: string;
  module_access: string;
  serviceType: string;
  status: string;
}



/* ---------------- COMPONENT ---------------- */
export default function EditCompany() {
  const { id: queryId } = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState(false);

  const { regionOptions,areaOptions, onlyCountryOptions, countryCurrency} = useAllDropdownListData();

  const steps: StepperStep[] = [
    { id: 1, label: "Company" },
    { id: 2, label: "Contact" },
    { id: 3, label: "Location" },
    { id: 4, label: "Financial" },
    { id: 5, label: "Additional" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  /* ---------------- FORMIK ---------------- */
  const formik = useFormik<CompanyFormValues>({
    initialValues: {
      companyType: "",
      companyCode: "",
      companyName: "",
      companyWebsite: "",
      primaryCode: "uae",
      primaryContact: "",
      tollFreeCode: "uae",
      tollFreeNumber: "",
      email: "",
      region: {id: ""},
      subRegion: {id: ""},
      district: "",
      town: "",
      street: "",
      landmark: "",
      country: "",
      tinNumber: "",
      sellingCurrency: "USD",
      purchaseCurrency: "USD",
      vatNo: "",
      module_access: "",
      serviceType: "",
      status: "1",
    },
    validationSchema: CompanySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
  if (!queryId) return;
  try {
    const payload = {
      company_code: values.companyCode,
      company_name: values.companyName,
      company_type: values.companyType,
      email: values.email,
      country_id: values.country,
      tin_number: values.tinNumber,
      selling_currency: values.sellingCurrency,
      purchase_currency: values.purchaseCurrency,
      service_type: values.serviceType,
      status: values.status,
      district: values.district,
      town: values.town,
      street: values.street,
      region: String(values.region?.id) || "",
      sub_region: String(values.subRegion?.id)|| "",
      primary_contact: values.primaryContact,
      toll_free_no: values.tollFreeNumber,
      vat: values.vatNo,
      module_access: values.module_access, // assuming API expects array
      website: values.companyWebsite,
      logo: "logo.png", // optional if you want to send static
      address: `${values.street}, ${values.town}`, // optional if API wants a single address string
    };

        const res = await updateCompany(queryId as string, payload);
        if (res?.error) {
          showSnackbar(res?.data?.message || "Failed to update company ❌", "error");
        } else {
          showSnackbar("Company updated successfully ✅", "success");
          router.push("/dashboard/master/company");
        }
      } catch (err) {
        console.error(err);
        showSnackbar("Update failed ❌", "error");
      }
    },
  });

  /* ---------------- HANDLE STEP NAVIGATION ---------------- */
  const handleNext = async (
    values: CompanyFormValues,
    actions: FormikHelpers<CompanyFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        actions.setErrors(
          err.inner.reduce(
            (acc: FormikErrors<CompanyFormValues>, curr) => {
              if (curr.path === "region" || curr.path === "subRegion") {
                return {
                  ...acc,
                  [curr.path]: { id: curr.message }
                };
              }
              return {
                ...acc,
                [curr.path as keyof CompanyFormValues]: curr.message
              };
            },
            {} as FormikErrors<CompanyFormValues>
          )
        );
      }
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchCompany = async  () =>{
        if (queryId) {
          const res = await getCompanyById(queryId as string);
          const company = res?.data?.data || res?.data || res;
          console.log(company)
          const Daya = {
            companyType: company.company_type,
            companyCode: company.company_code,
            companyName: company.company_name,
            companyWebsite: company.website,
            primaryCode: "uae",
            primaryContact: company.primary_contact || "",
            tollFreeCode: "uae",
            tollFreeNumber: company.toll_free_no || "",
            email: company.email,
            region: company.region.id,
            subRegion: company.sub_region.id,
            district: company.district,
            town: company.town,
            street: company.street,
            landmark: company.landmark,
            country: company.country.id || "",
            tinNumber: company.tin_number,
            sellingCurrency: company.selling_currency,
            purchaseCurrency: company.purchase_currency,
            vatNo: company.vat,
            module_access: company.module_access,
            serviceType: company.service_type,
            status: company.status,
          };
          formik.setValues(Daya)
          console.log("sjdkfrbg",Daya)
       }
    };
    fetchCompany()
  }, [queryId]);


  /* ---------------- RENDER STEP CONTENT ---------------- */
  const renderStepContent = (
    values: CompanyFormValues,
    errors: FormikErrors<CompanyFormValues>,
    touched: FormikTouched<CompanyFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <h2 className="text-lg font-medium mb-4">Company Details</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields name="companyCode" label="Company Code" value={values.companyCode} onChange={formik.handleChange} />
                <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]" icon="mi:settings" onClick={() => setIsOpen(true)} />
                <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Company Code" />
              </div>
              <InputFields name="companyName" label="Company Name" value={values.companyName} onChange={formik.handleChange} />
              <InputFields
                name="companyType"
                label="Company Type"
                value={values.companyType}
                onChange={formik.handleChange}
                options={[
                  { value: "manufacturing", label: "Manufacturing" },
                  { value: "trading", label: "Trading" },
                ]}
              />
              <InputFields name="companyWebsite" label="Website" value={values.companyWebsite} onChange={formik.handleChange} />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-medium mb-4">Contact</h2>
            <div className="flex flex-wrap gap-4">
              <FormInputField
                type="contact"
                label="Primary Contact"
                contact={values.primaryContact}
                code={values.primaryCode}
                onContactChange={(e) => formik.setFieldValue("primaryContact", e.target.value)}
                onCodeChange={(e) => formik.setFieldValue("primaryCode", e.target.value)}
                options={countryCurrency}
              />
              <FormInputField
                type="contact"
                label="Toll Free Number"
                contact={values.tollFreeNumber}
                code={values.tollFreeCode}
                options={countryCurrency}
                onContactChange={(e) => formik.setFieldValue("tollFreeNumber", e.target.value)}
                onCodeChange={(e) => formik.setFieldValue("tollFreeCode", e.target.value)}
              />
              <InputFields name="email" label="Email" value={values.email} onChange={formik.handleChange} />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2 className="text-lg font-medium mb-4">Location</h2>
            <div className="flex flex-wrap gap-4">
              <InputFields name="district" label="District" value={values.district} onChange={formik.handleChange} />
              <InputFields name="town" label="Town/Village" value={values.town} onChange={formik.handleChange} />
              <InputFields name="street" label="Street" value={values.street} onChange={formik.handleChange} />
              <InputFields name="landmark" label="Landmark" value={values.landmark} onChange={formik.handleChange} />
              <InputFields name="region" label="Region" value={String(values.region)} onChange={formik.handleChange} options={regionOptions} />
              <InputFields name="subRegion" label="Sub Region" value={String(values.subRegion)} onChange={formik.handleChange} options={areaOptions} />
              <InputFields name="country" label="Country" value={String(values.country)} onChange={formik.handleChange} options={onlyCountryOptions} />
              <InputFields name="tinNumber" label="TIN Number" value={String(values.tinNumber)} onChange={formik.handleChange} />
            </div>
          </ContainerCard>
        );
      case 4:
        return (
          <ContainerCard>
            <h2 className="text-lg font-medium mb-4">Financial</h2>
            <div className="flex flex-wrap gap-4">
              <InputFields name="sellingCurrency" label="Selling Currency" value={values.sellingCurrency} onChange={formik.handleChange} />
              <InputFields name="purchaseCurrency" label="Purchase Currency" value={values.purchaseCurrency} onChange={formik.handleChange} />
              <InputFields name="vatNo" label="VAT (%)" value={values.vatNo} onChange={formik.handleChange} />
            </div>
          </ContainerCard>
        );
      case 5:
        return (
          <ContainerCard>
            <h2 className="text-lg font-medium mb-4">Additional</h2>
            <div className="flex flex-wrap gap-4">
              <InputFields name="module_access" label="Modules" value={values.module_access} onChange={formik.handleChange} />
              <InputFields name="serviceType" label="Service Type" value={values.serviceType} onChange={formik.handleChange} />
              <InputFields
                name="status"
                label="Status"
                type="select"
                value={values.status}
                onChange={formik.handleChange}
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

  /* ---------------- RENDER ---------------- */
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/company">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Update Company</h1>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <StepperForm
          steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
          currentStep={currentStep}
          onStepClick={() => {}}
          onBack={prevStep}
          onNext={() =>
            handleNext(formik.values, {
              setErrors: formik.setErrors,
              setTouched: formik.setTouched,
            } as unknown as FormikHelpers<CompanyFormValues>)
          }
          onSubmit={() => formik.handleSubmit()}
          showSubmitButton={isLastStep}
          showNextButton={!isLastStep}
          nextButtonText="Save & Next"
          submitButtonText="Submit"
        >
          {renderStepContent(formik.values, formik.errors, formik.touched)}
        </StepperForm>
      </form>
    </div>
  );
}
