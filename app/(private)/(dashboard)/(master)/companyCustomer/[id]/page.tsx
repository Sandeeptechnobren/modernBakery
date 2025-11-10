"use client";

import React from "react";
import RegionWatcher from "./areaOptions";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import { useState, useEffect, useRef } from "react";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import {
  addCompanyCustomers,
  getCompanyCustomerById,
  updateCompanyCustomer,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import { useLoading } from "@/app/services/loadingContext";
import { number } from "framer-motion";

export type CompanyCustomerFormValues = {
  sap_code: string;
  osa_code: string;
  business_name: string;
  company_type: number;
  language: string;
  contact_number?: string;
  business_type: number;
  town: string;
  landmark: string;
  district: string;
  region_id: string;
  area_id: string;
  payment_type: string;
  creditday: string;
  tin_no: string;
  creditlimit: string;
  totalcreditlimit: string;
  credit_limit_validity?: string;
  bank_guarantee_name: string;
  bank_guarantee_amount: string;
  bank_guarantee_from: string;
  bank_guarantee_to: string;
  distribution_channel_id: string;
  merchendiser_ids: string;
  status: string;
};

interface CompanyCustomerPayload {
  sap_code: string;
  osa_code: string;
  business_name: string;
  company_type: number;
  language: string;
  contact_number?: string;
  business_type: number;
  town: string;
  landmark: string;
  district: string;
  region_id: number;
  area_id: number;
  payment_type: string;
  creditday: string;
  tin_no: string;
  creditlimit: number;
  totalcreditlimit: number;
  credit_limit_validity?: string;
  bank_guarantee_name: string;
  bank_guarantee_amount: number;
  bank_guarantee_from: string;
  bank_guarantee_to: string;
  distribution_channel_id: string;
  merchendiser_ids: string;
  status: string;
}



// Validation schema (Yup)
const validationSchema = Yup.object({
  sap_code: Yup.string().required("SAP Code is required."),
  business_name: Yup.string().required("Business Name is required."),
  company_type: Yup.string().required("Customer Type is required."),
  business_type: Yup.string().required("Invalid email").required("Email is required."),
  language: Yup.string().required("Language is required."),

  contact_number: Yup.string()
    .required("Contact Number  is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(9, "Must be at least 9 digits")
    .max(10, "Must be at most 10 digits"),
  town: Yup.string().required("Town is required."),
  landmark: Yup.string().required("Landmark is required."),
  district: Yup.string().required("District is required."),
  region_id: Yup.string().required("Region is required."),
  area_id: Yup.string().required("Area is required."),
  payment_type: Yup.string().required("Payment Type is required."),
  creditday: Yup.string().required("Credit Day is required."),
  tin_no: Yup.string().required("VAT No is required."),
  creditlimit: Yup.string().required("Credit Limit is required."),
  bank_guarantee_name: Yup.string().required("Guarantee Name is required."),
  bank_guarantee_amount: Yup.string().required("Guarantee Amount is required."),

  bank_guarantee_from: Yup.date()
    // .required("Guarantee From is required")
    .typeError("Please enter a valid date"),
  bank_guarantee_to: Yup.date()
    // .required("Guarantee To is required")
    .typeError("Please enter a valid date")
    .min(
      Yup.ref("bank_guarantee_from"),
      "Guarantee To date cannot be before Guarantee From date"
    ),

  totalcreditlimit: Yup.string(),
  // .required("Total Credit Limit is required."),
  credit_limit_validity: Yup.string(),
  dChannelId: Yup.string(),
  // .required("Channel is required."),
  merchendiser_ids: Yup.string(),
});

const stepSchemas = [
  Yup.object({
    sap_code: validationSchema.fields.sap_code,
    tin_no: validationSchema.fields.tin_no,
    business_name: validationSchema.fields.business_name,
    company_type: validationSchema.fields.company_type,
    language: validationSchema.fields.language,
  }),
  Yup.object({
    contact_number: validationSchema.fields.contact_number,
    business_type: validationSchema.fields.business_type,
  }),
  Yup.object({
    town: validationSchema.fields.town,
    landmark: validationSchema.fields.landmark,
    district: validationSchema.fields.district,
    region_id: validationSchema.fields.region_id,
    area_id: validationSchema.fields.area_id,
  }),
  Yup.object({
    payment_type: validationSchema.fields.payment_type,
    creditday: validationSchema.fields.creditday,
    creditlimit: validationSchema.fields.creditlimit,
    totalcreditlimit: validationSchema.fields.totalcreditlimit,
    bank_guarantee_name: validationSchema.fields.bank_guarantee_name,
    bank_guarantee_amount: validationSchema.fields.bank_guarantee_amount,
    bank_guarantee_from: validationSchema.fields.bank_guarantee_from,
    bank_guarantee_to: validationSchema.fields.bank_guarantee_to,
  }),
];

interface contactCountry {
  name: string;
  code?: string;
  flag?: string;
}

export default function AddCompanyCustomer() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    regionOptions,
    areaOptions,
    companyTypeOptions,
    channelOptions,
    fetchAreaOptions,
  } = useAllDropdownListData();
  const [skeleton, setSkeleton] = useState({
    area_id: false,
  });

  const [country, setCountry] = useState<Record<string, contactCountry>>({
    ownerNumber: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    contact_number: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    whatsappNo: { name: "Uganda", code: "+256", flag: "🇺🇬" },
  });

  const steps: StepperStep[] = [
    { id: 1, label: "Customer Details" },
    { id: 2, label: "Customer Contact" },
    { id: 3, label: "Customer Location" },
    { id: 4, label: "Customer Financial" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const { setLoading } = useLoading();
  const codeFetchedRef = useRef(false);
  const [initialValues, setInitialValues] = useState<CompanyCustomerFormValues>(
    {
      sap_code: "",
      osa_code: "",
      business_name: "",
      business_type: 0,
      company_type: 0,
      language: "",
      contact_number: "",
      town: "",
      landmark: "",
      district: "",
      region_id: "",
      area_id: "",
      payment_type: "",
      creditday: "",
      tin_no: "",
      creditlimit: "",
      bank_guarantee_name: "",
      bank_guarantee_amount: "",
      bank_guarantee_from: "",
      bank_guarantee_to: "",
      totalcreditlimit: "",
      credit_limit_validity: "",
      distribution_channel_id: "",
      status: "1",
      merchendiser_ids: "",
    }
  );

  const fetchData = async () => {
    try {
      const id = params?.id as string;
      setLoading(true);
      const res = await getCompanyCustomerById(id);

      const data = res.data;
      console.log("Fetched data:", data);



      setLoading(false);
      const mapped: CompanyCustomerFormValues = {
        sap_code: data.sap_code || "",
        osa_code: data.osa_code || "",
        business_name: data.business_name || "",
        company_type: Number(data.company_type || 0),
        language: data.language || "",
        contact_number: data.contact_number || "",
        business_type: Number(data.business_type || 0),
        town: data.town || "",
        landmark: data.landmark || "",
        district: data.district || "",
        region_id: String(data?.get_region?.id || ""),
        area_id: String(data?.get_area?.id || ""),
        payment_type: String(data.payment_type || "1"),
        creditday: String(data.creditday || ""),
        tin_no: data.tin_no || "",
        creditlimit: String(data.creditlimit || ""),
        bank_guarantee_name: data.bank_guarantee_name || "",
        bank_guarantee_amount: String(data.bank_guarantee_amount || ""),
        bank_guarantee_from: data.bank_guarantee_from || "",
        bank_guarantee_to: data.bank_guarantee_to || "",
        totalcreditlimit: String(data.totalcreditlimit || ""),
        credit_limit_validity: data.credit_limit_validity || "",
        distribution_channel_id: data.distribution_channel_id || "",
        status: String(data.status || "1"),
        merchendiser_ids: data.merchendiser_ids || "",
      };


      setInitialValues(mapped);
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to load data ❌", "error");
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!params?.id) return;
    const idStr = params.id.toString().trim().toLowerCase();
    if (idStr !== "add") {
      setIsEditMode(true);
      fetchData().finally(() => setLoading(false));
      return;
    }
    setIsEditMode(false);
    if (codeFetchedRef.current) return;
    codeFetchedRef.current = true;
    (async () => {
      setLoading(true);
      try {
        const res = await genearateCode({ model_name: "tbl_company_customer" });
        if (res?.code)
          setInitialValues((prev) => ({
            ...prev,
            osa_code: String(res.code),
          }));
        if (res?.prefix) setPrefix(res.prefix);
        setLoading(false);
      } catch (err) {
        console.error("Failed to generate code:", err);
      }
      setLoading(false);
    })();
  }, [params?.id]);

  const handleNext = async (
    values: CompanyCustomerFormValues,
    actions: FormikHelpers<CompanyCustomerFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err: unknown) {
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
            (
              acc: Partial<Record<keyof CompanyCustomerFormValues, string>>,
              curr
            ) => ({
              ...acc,
              [curr.path as keyof CompanyCustomerFormValues]: curr.message,
            }),
            {}
          )
        );
      }
    }
  };

  const handleSubmit = async (
    values: CompanyCustomerFormValues,
    
    {
      setSubmitting,
      setErrors,
      setTouched,
    }: FormikHelpers<CompanyCustomerFormValues>,
    actions?: Pick<
                FormikHelpers<CompanyCustomerFormValues>,
                "setErrors" | "setTouched" | "setSubmitting"
            >
  ) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      const payload: CompanyCustomerPayload = {
        sap_code: values.sap_code,
        osa_code: values.osa_code,
        business_name: values.business_name,
        company_type: values.company_type,
        language: values.language,
        town: values.town,
        contact_number: values.contact_number,
        business_type: values.business_type,
        distribution_channel_id: values.distribution_channel_id,
        landmark: values.landmark,
        district: values.district,
        region_id: Number(values.region_id),
        area_id: Number(values.area_id),
        payment_type: values.payment_type,
        creditday: values.creditday,
        tin_no: values.tin_no,
        creditlimit: Number(values.creditlimit),
        totalcreditlimit: Number(values.totalcreditlimit),
        credit_limit_validity: values.credit_limit_validity,
        bank_guarantee_name: values.bank_guarantee_name,
        bank_guarantee_amount: Number(values.bank_guarantee_amount),
        bank_guarantee_from: values.bank_guarantee_from,
        bank_guarantee_to: values.bank_guarantee_to,
        merchendiser_ids: values.merchendiser_ids || "",
        status: String(values.status),
      };

      let res;
      setLoading(true);
      if (isEditMode) {
        res = await updateCompanyCustomer(String(params.id), payload);
      } else {
        res = await addCompanyCustomers(payload);
      }
      setLoading(false);

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          res.message ||
            (isEditMode
              ? "Company Customer Updated Successfully"
              : "Company Customer Created Successfully"),
          "success"
        );

        if (!isEditMode) {
          try {
            await saveFinalCode({
              reserved_code: values.osa_code || "",
              model_name: "tbl_company_customer",
            });
          } catch (e) {
            console.error("❌ Error finalizing code:", e);
          }
        }

        router.push("/companyCustomer");
      }
    } catch (error: unknown) {
      if (error instanceof Yup.ValidationError) {
        const fields = error.inner.map((e) => e.path);
       
        actions?.setErrors(
          error.inner.reduce(
            (
              acc: Partial<Record<keyof CompanyCustomerFormValues, string>>,
              curr
            ) => ({
              ...acc,
              [curr.path as keyof CompanyCustomerFormValues]: curr.message,
            }),
            {}
          )
        );
      } else {
        showSnackbar(
          `Failed to ${isEditMode ? "update" : "add"} Company Customer `,
          "error"
        );
      }
    } finally {
      actions?.setSubmitting(false);
    }
  };

  const renderStepContent = (
    values: CompanyCustomerFormValues,
    setFieldValue: (
      field: keyof CompanyCustomerFormValues,
      value: string | File,
      shouldValidate?: boolean
    ) => void,
    errors: Record<string, string>,
    touched: Record<string, boolean>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Customer Code"
                  name="osa_code"
                  value={values.osa_code}
                  onChange={(e) =>
                    setFieldValue("osa_code", e.target.value)
                  }
                  disabled={codeMode === "auto"}
                  error={touched.osa_code && errors.osa_code}
                />
                {!isEditMode && false && (
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
                      title="Company Customer Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === "auto" && code) {
                          setFieldValue("osa_code", code);
                        } else if (mode === "manual") {
                          setFieldValue("osa_code", "");
                        }
                      }}
                    />
                  </>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="SAP Code"
                  name="sap_code"
                  value={values.sap_code}
                  onChange={(e) => setFieldValue("sap_code", e.target.value)}
                  error={touched.sap_code && errors.sap_code}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="TIN No"
                  name="tin_no"
                  value={values.tin_no}
                  onChange={(e) => setFieldValue("tin_no", e.target.value)}
                  error={touched.tin_no && errors.tin_no}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Business Name"
                  name="business_name"
                  value={values.business_name}
                  onChange={(e) =>
                    setFieldValue("business_name", e.target.value)
                  }
                  error={touched.business_name && errors.business_name}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Company Type"
                  name="company_type"
                  value={(  values.company_type).toString()}
                  onChange={(e) =>
                    setFieldValue("company_type", e.target.value)
                  }
                  options={companyTypeOptions}
                  error={touched.company_type && errors.company_type}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Language"
                  name="language"
                  options={[
                    { value: "English", label: "English" },
                    { value: "Hindi", label: "Hindi" },
                    { value: "Gujarati", label: "Gujarati" },
                    { value: "Marathi", label: "Marathi" },
                    { value: "Telugu", label: "Telugu" },
                    { value: "Tamil", label: "Tamil" },
                    { value: "Kannada", label: "Kannada" },
                    { value: "Malayalam", label: "Malayalam" },
                    { value: "Punjabi", label: "Punjabi" },
                    { value: "Bengali", label: "Bengali" },
                    { value: "Odia", label: "Odia" },
                    { value: "Assamese", label: "Assamese" },
                    { value: "Urdu", label: "Urdu" },
                  ]}
                  value={values.language}
                  onChange={(e) => setFieldValue("language", e.target.value)}
                  error={touched.language && errors.language}
                />
                {/* {errors?.language && touched?.language && (
                  <span className="text-xs text-red-500 mt-1">
                    {/* {errors.language} */}
              </div>
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <InputFields
                  required
                  type="contact"
                  label="Contact Number"
                  name="contact_number"
                  setSelectedCountry={(country: contactCountry) =>
                    setCountry((prev) => ({ ...prev, contact_number: country }))
                  }
                  selectedCountry={country.contact_number}
                  value={`${values.contact_number ?? ""}`}
                  onChange={(e) => setFieldValue("contact_number", e.target.value)}
                  error={
                    errors?.contact_number && touched?.contact_number
                      ? errors.contact_number
                      : false
                  }
                />
              </div>

              <div>
                <InputFields
                  label="Business Type"
                  name="business_type"
                  type="radio"
                  value={( values.business_type).toString()}
                  onChange={(e) => setFieldValue("business_type", e.target.value)}
                  options={[
                    { value: "0", label: "Buyer" },
                    { value: "1", label: "Seller" },
                  ]}
                />
            </div>
          </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <InputFields
                  required
                  label="Town"
                  name="town"
                  value={values.town}
                  onChange={(e) => setFieldValue("town", e.target.value)}
                  error={touched.town && errors.town}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Landmark"
                  name="landmark"
                  value={values.landmark}
                  onChange={(e) => setFieldValue("landmark", e.target.value)}
                  error={touched.landmark && errors.landmark}
                />
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
              </div>
              <div>
                <InputFields
                  required
                  label="Region"
                  name="region_id"
                  value={values.region_id}
                  onChange={(e) => setFieldValue("region_id", e.target.value)}
                  options={regionOptions}
                  error={touched.region_id && errors.region_id}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Area"
                  name="area_id"
                  value={values.area_id}
                  onChange={(e) => setFieldValue("area_id", e.target.value)}
                  // keep enabled if we already have a value (edit mode) so it shows the current selection
                  disabled={areaOptions.length === 0 && !values.area_id}
                  showSkeleton={skeleton.area_id}
                  options={
                    areaOptions && areaOptions.length > 0
                      ? areaOptions
                      : values.area_id
                      ? // show the existing area_id value as an option when areaOptions haven't loaded yet
                        [
                          {
                            value: values.area_id,
                            label: `Selected Area (${values.area_id})`,
                          },
                        ]
                      : [{ value: "", label: "No options" }]
                  }
                  error={touched.area_id && errors.area_id}
                />
              </div>
            </div>
          </ContainerCard>
        );
      case 4:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">
              Financial & Bank Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <InputFields
                  required
                  label="Payment Type"
                  name="payment_type"
                  type="radio"
                  value={values.payment_type}
                  onChange={(e) => setFieldValue("payment_type", e.target.value)}
                  options={[
                    { value: "1", label: "Cash" },
                    { value: "2", label: "Credit" },
                  ]}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Credit Day"
                  name="creditday"
                  value={values.creditday}
                  onChange={(e) => setFieldValue("creditday", e.target.value)}
                  error={touched.creditday && errors.creditday}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Credit Limit"
                  name="creditlimit"
                  value={values.creditlimit}
                  onChange={(e) => setFieldValue("creditlimit", e.target.value)}
                  error={touched.creditlimit && errors.creditlimit}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Total Credit Limit"
                  name="totalcreditlimit"
                  value={values.totalcreditlimit}
                  onChange={(e) =>
                    setFieldValue("totalcreditlimit", e.target.value)
                  }
                  error={touched.totalcreditlimit && errors.totalcreditlimit}
                />
              </div>
              <div>
                <InputFields
                  label="Credit Limit Validity"
                  name="credit_limit_validity"
                  value={values.credit_limit_validity}
                  onChange={(e) =>
                    setFieldValue("credit_limit_validity", e.target.value)
                  }
                  type="date"
                  error={
                    touched.credit_limit_validity && errors.credit_limit_validity
                  }
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee Name"
                  name="bank_guarantee_name"
                  value={values.bank_guarantee_name}
                  onChange={(e) =>
                    setFieldValue("bank_guarantee_name", e.target.value)
                  }
                  error={touched.bank_guarantee_name && errors.bank_guarantee_name}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee Amount"
                  name="bank_guarantee_amount"
                  value={values.bank_guarantee_amount}
                  onChange={(e) =>
                    setFieldValue("bank_guarantee_amount", e.target.value)
                  }
                  error={touched.bank_guarantee_amount && errors.bank_guarantee_amount}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee From"
                  name="bank_guarantee_from"
                  value={values.bank_guarantee_from}
                  onChange={(e) =>
                    setFieldValue("bank_guarantee_from", e.target.value)
                  }
                  type="date"
                  error={touched.bank_guarantee_from && errors.bank_guarantee_from}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee To"
                  name="bank_guarantee_to"
                  value={values.bank_guarantee_to}
                  onChange={(e) => setFieldValue("bank_guarantee_to", e.target.value)}
                  type="date"
                  error={touched.bank_guarantee_to && errors.bank_guarantee_to}
                />
              </div>

              <div>
                {!isEditMode && (
                  <>
                    <InputFields
                      label="Merchendiser"
                      name="merchendiser_ids"
                      value={values.merchendiser_ids}
                      onChange={(e) =>
                        setFieldValue("merchendiser_ids", e.target.value)
                      }
                      options={[
                        { value: "1", label: "Merchendiser 1" },
                        { value: "2", label: "Merchendiser 2" },
                        { value: "3", label: "Merchendiser 3" },
                      ]}
                      error={
                        touched.merchendiser_ids && errors.merchendiser_ids
                      }
                    />
                  </>
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
    <>
      <div className="flex align-middle items-center gap-3 text-gray-900 mb-6">
        <div className="cursor-pointer" onClick={() => router.back()}>
          <Icon icon="lucide:arrow-left" width={24} />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Update" : "Add"} Company Customer
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          setFieldValue,
          setErrors,
          setTouched,
          setSubmitting,
          errors,
          touched,
          handleSubmit: formikSubmit,
          isSubmitting,
        }) => (
          <Form>
            {/* Formik-aware watcher for region_id changes */}
            <RegionWatcher
              fetchAreaOptions={fetchAreaOptions}
              setSkeleton={setSkeleton}
              preserveExistingArea={isEditMode}
              initialArea={initialValues.area_id}
            />
            <StepperForm
              steps={steps.map((step) => ({
                ...step,
                isCompleted: isStepCompleted(step.id),
              }))}
              currentStep={currentStep}
              onStepClick={() => {}}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, {
                  setErrors,
                  setTouched,
                  setSubmitting,
                } as FormikHelpers<CompanyCustomerFormValues>)
              }
              onSubmit={formikSubmit}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={
                                isSubmitting
                                    ? (isEditMode ? "Updating..." : "Submitting...")
                                    : isEditMode
                                    ? "Update"
                                    : "Submit"
                            }
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </>
  );
}
