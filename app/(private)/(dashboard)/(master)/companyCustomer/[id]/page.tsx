"use client";

import React from "react";
import RegionWatcher from "./areaOptions";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
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

export type CompanyCustomerFormValues = {
  sapCode: string;
  company_customer_code?: string;
  customerCode: string;
  businessName: string;
  customerType: string;
  ownerName: string;
  ownerNumber: string;
  isWhatsapp: string;
  whatsappNo: string;
  email: string;
  language: string;
  contactNo2: string;
  buyerType: string;
  roadStreet: string;
  town: string;
  landmark: string;
  district: string;
  region: string;
  area: string;
  paymentType: string;
  bankName: string;
  bankAccountNumber: string;
  creditDay: string;
  vatNo: string;
  accuracy: string;
  creditLimit: string;
  guaranteeName: string;
  guaranteeAmount: string;
  guaranteeFrom: string;
  guaranteeTo: string;
  totalCreditLimit: string;
  creditLimitValidity: string;
  longitude: string;
  latitude: string;
  thresholdRadius: string;
  dChannelId: string;
  status: string;
  merchendiser_ids: string;
};

interface CompanyCustomerPayload {
  sap_code: string;
  customer_code: string;
  business_name: string;
  customer_type: string;
  owner_name: string;
  owner_no: string;
  is_whatsapp: number;
  whatsapp_no?: string;
  email: string;
  language: string;
  contact_no2?: string;
  buyer_type: number;
  road_street: string;
  town: string;
  landmark: string;
  district: string;
  region_id: number;
  area_id: number;
  payment_type: string;
  bank_name: string;
  bank_account_number: string;
  creditday: string;
  vat_no: string;
  accuracy: string;
  creditlimit: number;
  totalcreditlimit: number;
  credit_limit_validity?: string;
  guarantee_name: string;
  guarantee_amount: number;
  guarantee_from: string;
  guarantee_to: string;
  longitude: string;
  latitude: string;
  threshold_radius: number;
  dchannel_id: number;
  merchendiser_ids: string;
  status: string;
  created_user?: number;
  updated_user?: number;
}

// Validation schema (Yup)
const validationSchema = Yup.object({
  sapCode: Yup.string().required("SAP Code is required."),
  customerCode: Yup.string().required("Customer Code is required."),
  businessName: Yup.string().required("Business Name is required."),
  customerType: Yup.string().required("Customer Type is required."),
  ownerName: Yup.string().required("Owner Name is required."),
  ownerNumber: Yup.string()
    .required("Owner Contact is required."),
  whatsappNo: Yup.string().when('isWhatsapp', {
  is: (val: string) => val === '1',
    then: (schema) => schema.required("Whatsapp Number is required."),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: Yup.string().email("Invalid email").required("Email is required."),
  language: Yup.string().required("Language is required."),
  contactNo2: Yup.string().required("Contact No 2 is required."),
  roadStreet: Yup.string().required("Road/Street is required."),
  town: Yup.string().required("Town is required."),
  landmark: Yup.string().required("Landmark is required."),
  district: Yup.string().required("District is required."),
  region: Yup.string().required("Region is required."),
  area: Yup.string().required("Area is required."),
  paymentType: Yup.string().required("Payment Type is required."),
  bankName: Yup.string().required("Bank Name is required."),
  bankAccountNumber: Yup.string().required("Bank Account Number is required."),
  creditDay: Yup.string().required("Credit Day is required."),
  vatNo: Yup.string().required("VAT No is required."),
  accuracy: Yup.string(),
  creditLimit: Yup.string().required("Credit Limit is required."),
  guaranteeName: Yup.string().required("Guarantee Name is required."),
  guaranteeAmount: Yup.string().required("Guarantee Amount is required."),
  guaranteeFrom: Yup.string().required("Guarantee From is required."),
  guaranteeTo: Yup.string().required("Guarantee To is required."),
  totalCreditLimit: Yup.string().required("Total Credit Limit is required."),
  creditLimitValidity: Yup.string(),
  longitude: Yup.string().required("Longitude is required.").matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, "Longitude must be a valid decimal number"),
  latitude: Yup.string().required("Latitude is required.").matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, "Latitude must be a valid decimal number"),
  thresholdRadius: Yup.string().required("Threshold Radius is required."),
  dChannelId: Yup.string().required("Channel is required."),
  merchendiser_ids: Yup.string(),
});

const stepSchemas = [
  Yup.object({
    customerCode: validationSchema.fields.customerCode,
    sapCode: validationSchema.fields.sapCode,
    vatNo: validationSchema.fields.vatNo,
    ownerName: validationSchema.fields.ownerName,
    businessName: validationSchema.fields.businessName,
    customerType: validationSchema.fields.customerType,
    dChannelId: validationSchema.fields.dChannelId,
    language: validationSchema.fields.language,

  }),
  Yup.object({
    ownerNumber: validationSchema.fields.ownerNumber,
    contactNo2: validationSchema.fields.contactNo2,
    whatsappNo: validationSchema.fields.whatsappNo,
    email: validationSchema.fields.email,
  }),
  Yup.object({
    town: validationSchema.fields.town,
    roadStreet: validationSchema.fields.roadStreet,
    landmark: validationSchema.fields.landmark,
    district: validationSchema.fields.district,
    region: validationSchema.fields.region,
    area: validationSchema.fields.area,
    longitude: validationSchema.fields.longitude,
    latitude: validationSchema.fields.latitude,
    thresholdRadius: validationSchema.fields.thresholdRadius,
  }),
  Yup.object({

    paymentType: validationSchema.fields.paymentType,
    bankName: validationSchema.fields.bankName,
    bankAccountNumber: validationSchema.fields.bankAccountNumber,
    creditDay: validationSchema.fields.creditDay,
    creditLimit: validationSchema.fields.creditLimit,
    totalCreditLimit: validationSchema.fields.totalCreditLimit,
    guaranteeName: validationSchema.fields.guaranteeName,
    guaranteeAmount: validationSchema.fields.guaranteeAmount,
    guaranteeFrom: validationSchema.fields.guaranteeFrom,
    guaranteeTo: validationSchema.fields.guaranteeTo,
    merchendiser_ids: validationSchema.fields.merchendiser_ids,
    // accuracy: validationSchema.fields.accuracy,
    // creditLimitValidity: validationSchema.fields.creditLimitValidity,
  }),
];

interface contactCountry { name: string; code?: string; flag?: string; }

export default function AddCompanyCustomer() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const { regionOptions, areaOptions, customerTypeOptions,channelOptions,fetchAreaOptions } =
    useAllDropdownListData();
  const [skeleton, setSkeleton] = useState({
    area: false,
  });

  const [country, setCountry] = useState<Record<string, contactCountry>>({
      ownerNumber: { name: "Uganda", code: "+256", flag: "🇺🇬" },
      contactNo2: { name: "Uganda", code: "+256", flag: "🇺🇬" },
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
  const {setLoading} = useLoading();
  const codeFetchedRef = useRef(false);
  const [initialValues, setInitialValues] = useState<CompanyCustomerFormValues>(
    {
      sapCode: "",
      customerCode: "",
      businessName: "",
      customerType: "",
      ownerName: "",
      ownerNumber: "",
      isWhatsapp: "",
      email: "",
      language: "",
      contactNo2: "",
      whatsappNo: "",
      buyerType: "",
      roadStreet: "",
      town: "",
      landmark: "",
      district: "",
      region: "",
      area: "",
      paymentType: "",
      bankName: "",
      bankAccountNumber: "",
      creditDay: "",
      vatNo: "",
      accuracy: "",
      creditLimit: "",
      guaranteeName: "",
      guaranteeAmount: "",
      guaranteeFrom: "",
      guaranteeTo: "",
      totalCreditLimit: "",
      creditLimitValidity: "",
      longitude: "",
      latitude: "",
      thresholdRadius: "",
      dChannelId: "",
      status: "1",
      merchendiser_ids: "",
    }
  );


  const fetchData = async () => {
    try {
      const id = params?.id as string;
      setLoading(true);
      const data = await getCompanyCustomerById(id);
      setLoading(false);
      const mapped: CompanyCustomerFormValues = {
        sapCode: data.sap_code || "",
        customerCode: data.customer_code || "",
        businessName: data.business_name || "",
        customerType: String(data.customer_type|| ""),
        ownerName: data.owner_name || "",
        ownerNumber: data.owner_no || "",
        isWhatsapp: String(data.is_whatsapp ?? "1"),
        whatsappNo: data.whatsapp_no || "",
        email: data.email || "",
        language: data.language || "",
        contactNo2: data.contact_no2 || "",
        buyerType: String(data.buyer_type || "0"),
        roadStreet: data.road_street || "",
        town: data.town || "",
        landmark: data.landmark || "",
        district: data.district || "",
        region: String(data.region_id || ""),
        area: String(data.area_id || ""),
        paymentType: String(data.payment_type || "1"),
        bankName: data.bank_name || "",
        bankAccountNumber: data.bank_account_number || "",
        creditDay: String(data.creditday || ""),
        vatNo: data.vat_no || "",
        accuracy: data.accuracy || "",
        creditLimit: String(data.creditlimit || ""),
        guaranteeName: data.guarantee_name || "",
        guaranteeAmount: String(data.guarantee_amount || ""),
        guaranteeFrom: data.guarantee_from || "",
        guaranteeTo: data.guarantee_to || "",
        totalCreditLimit: String(data.totalcreditlimit || ""),
        creditLimitValidity: data.credit_limit_validity || "",
        longitude: data.longitude || "",
        latitude: data.latitude || "",
        thresholdRadius: String(data.threshold_radius || ""),
        dChannelId: String(data.dchannel_id || ""),
        status: String(data.status || "1"),
        merchendiser_ids: data.merchendiser_ids || "",
      };

      console.log(mapped);
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
        if (res?.code) setInitialValues((prev) => ({ ...prev, customerCode: String(res.code) }));
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
    console.log(values);
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
            (acc: Partial<Record<keyof CompanyCustomerFormValues, string>>, curr) => ({
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
    { setSubmitting, setErrors, setTouched }: FormikHelpers<CompanyCustomerFormValues>
  ) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      const payload: CompanyCustomerPayload = {
        sap_code: values.sapCode,
        customer_code: values.customerCode,
        business_name: values.businessName,
        customer_type: values.customerType,
        owner_name: values.ownerName,
        owner_no: values.ownerNumber,
        is_whatsapp: Number(values.isWhatsapp),
        whatsapp_no: (values.whatsappNo),
        email: values.email,
        language: values.language,
        contact_no2: (values.contactNo2),
        buyer_type: Number(values.buyerType),
        road_street: values.roadStreet,
        town: values.town,
        landmark: values.landmark,
        district: values.district,
        region_id: Number(values.region),
        area_id: Number(values.area),
        payment_type: values.paymentType,
        bank_name: values.bankName,
        bank_account_number: values.bankAccountNumber,
        creditday: values.creditDay,
        vat_no: values.vatNo,
        accuracy: values.accuracy || "",
        creditlimit: Number(values.creditLimit),
        totalcreditlimit: Number(values.totalCreditLimit),
        credit_limit_validity: values.creditLimitValidity,
        guarantee_name: values.guaranteeName,
        guarantee_amount: Number(values.guaranteeAmount),
        guarantee_from: values.guaranteeFrom,
        guarantee_to: values.guaranteeTo,
        longitude: values.longitude,
        latitude: values.latitude,
        threshold_radius: Number(values.thresholdRadius),
        dchannel_id: Number(values.dChannelId),
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
              reserved_code: values.customerCode || "",
              model_name: "tbl_company_customer",
            });
          } catch (e) {
            console.error("❌ Error finalizing code:", e);
          }
        }

        router.push("/companyCustomer");
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const fields = error.inner.map((e) => e.path);
        setTouched(
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        setErrors(
          error.inner.reduce(
            (acc: Partial<Record<keyof CompanyCustomerFormValues, string>>, curr) => ({
              ...acc,
              [curr.path as keyof CompanyCustomerFormValues]: curr.message,
            }),
            {}
          )
        );
        showSnackbar("Please fix the errors in the form.", "error");
      } else {
        showSnackbar(`Failed to ${isEditMode ? "update" : "add"} Company Customer `, "error");
      }
    } finally {
      setSubmitting(false);
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
                  name="customerCode"
                  value={values.customerCode}
                  onChange={(e) =>
                    setFieldValue("customerCode", e.target.value)
                  }
                  disabled={codeMode === "auto"}
                  error={touched.customerCode && errors.customerCode}
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
                          setFieldValue("customerCode", code);
                        } else if (mode === "manual") {
                          setFieldValue("customerCode", "");
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
                  name="sapCode"
                  value={values.sapCode}
                  onChange={(e) => setFieldValue("sapCode", e.target.value)}
                  error={touched.sapCode && errors.sapCode}
                />
                {errors?.sapCode && touched?.sapCode && (
                  <span className="text-xs text-red-500 mt-1">{errors.sapCode}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="VAT No"
                  name="vatNo"
                  value={values.vatNo}
                  onChange={(e) => setFieldValue("vatNo", e.target.value)}
                  error={touched.vatNo && errors.vatNo}
                />
                {errors?.vatNo && touched?.vatNo && (
                  <span className="text-xs text-red-500 mt-1">{errors.vatNo}</span>
                )}
              </div>
  <div>
                <InputFields
                  required
                  label="Owner Name"
                  name="ownerName"
                  value={values.ownerName}
                  onChange={(e) => setFieldValue("ownerName", e.target.value)}
                  error={touched.ownerName && errors.ownerName}
                />
                {errors?.ownerName && touched?.ownerName && (
                  <span className="text-xs text-red-500 mt-1">{errors.ownerName}</span>
                )}
              </div>
              
              <div>
                <InputFields
                  required
                  label="Business Name"
                  name="businessName"
                  value={values.businessName}
                  onChange={(e) => setFieldValue("businessName", e.target.value)}
                  error={touched.businessName && errors.businessName}
                />
                {errors?.businessName && touched?.businessName && (
                  <span className="text-xs text-red-500 mt-1">{errors.businessName}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Customer Type"
                  name="customerType"
                  value={values.customerType}
                  onChange={(e) => setFieldValue("customerType", e.target.value)}
                  options={customerTypeOptions}
                  error={touched.customerType && errors.customerType}
                />
                {errors?.customerType && touched?.customerType && (
                  <span className="text-xs text-red-500 mt-1">{errors.customerType}</span>
                )}
              </div>
            
             
              <div>
                <InputFields
                  required
                  label="Outlet Channel"
                  name="dChannelId"
                  options={channelOptions}
                  value={values.dChannelId}
                  onChange={(e) => setFieldValue("dChannelId", e.target.value)}
                  error={touched.dChannelId && errors.dChannelId}
                />
                {errors?.dChannelId && touched?.dChannelId && (
                  <span className="text-xs text-red-500 mt-1">{errors.dChannelId}</span>
                )}
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
                {errors?.language && touched?.language && (
                  <span className="text-xs text-red-500 mt-1">{errors.language}</span>
                )}
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
                  label="Owner Number"
                  name="ownerNumber"
                  setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, ownerNumber: country }))}
                  selectedCountry={country.ownerNumber}
                  value={`${values.ownerNumber ?? ''}`}
                  onChange={(e) => setFieldValue("ownerNumber", e.target.value)}
                  error={errors?.ownerNumber && touched?.ownerNumber ? errors.ownerNumber : false}
              />
              {errors?.ownerNumber && touched?.ownerNumber && (
              <span className="text-xs text-red-500 mt-1">{errors.ownerNumber}</span>
              )}
              </div>

              <div className="flex flex-col gap-2">
                <InputFields
                  required
                  type="contact"
                  label="Contact Number"
                  name="contactNo2"
                  setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, contactNo2: country }))}
                  selectedCountry={country.contactNo2}
                  value={`${values.contactNo2 ?? ''}`}
                  onChange={(e) => setFieldValue("contactNo2", e.target.value)}
                  error={errors?.contactNo2 && touched?.contactNo2 ? errors.contactNo2 : false}
              />
              {errors?.contactNo2 && touched?.contactNo2 && (
              <span className="text-xs text-red-500 mt-1">{errors.contactNo2}</span>
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
                {errors?.email && touched?.email && (
                  <span className="text-xs text-red-500 mt-1">{errors.email}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Whatsapp Available?"
                  name="isWhatsapp"
                  type="radio"
                  value={values.isWhatsapp}
                  onChange={(e) => setFieldValue("isWhatsapp", e.target.value)}
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                />
                {errors?.isWhatsapp && touched?.isWhatsapp && (
                  <span className="text-xs text-red-500 mt-1">{errors.isWhatsapp}</span>
                )}
              </div>

              {values.isWhatsapp === "1" && <div className="flex flex-col gap-2">
                <InputFields
                  required
                  type="contact"
                  label="Whatsapp Number"
                  name="whatsappNo"
                  setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, whatsappNo: country }))}
                  selectedCountry={country.whatsappNo}
                  value={`${values.whatsappNo ?? ''}`}
                  onChange={(e) => setFieldValue("whatsappNo", e.target.value)}
                  error={errors?.whatsappNo && touched?.whatsappNo ? errors.whatsappNo : false}
              />
              {errors?.whatsappNo && touched?.whatsappNo && (
              <span className="text-xs text-red-500 mt-1">{errors.whatsappNo}</span>
              )}
              </div>}
             
              <div>
                <InputFields
                  label="Buyer Type"
                  name="buyerType"
                  type="radio"
                  value={values.buyerType}
                  onChange={(e) => setFieldValue("buyerType", e.target.value)}
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
                {errors?.town && touched?.town && (
                  <span className="text-xs text-red-500 mt-1">{errors.town}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Road / Street"
                  name="roadStreet"
                  value={values.roadStreet}
                  onChange={(e) => setFieldValue("roadStreet", e.target.value)}
                  error={touched.roadStreet && errors.roadStreet}
                />
                {errors?.roadStreet && touched?.roadStreet && (
                  <span className="text-xs text-red-500 mt-1">{errors.roadStreet}</span>
                )}
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
                {errors?.landmark && touched?.landmark && (
                  <span className="text-xs text-red-500 mt-1">{errors.landmark}</span>
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
                {errors?.district && touched?.district && (
                  <span className="text-xs text-red-500 mt-1">{errors.district}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Region"
                  name="region"
                  value={values.region}
                  onChange={(e) => setFieldValue("region", e.target.value)}
                  options={regionOptions}
                  error={touched.region && errors.region}
                />
                {errors?.region && touched?.region && (
                  <span className="text-xs text-red-500 mt-1">{errors.region}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Area"
                  name="area"
                  value={values.area}
                  onChange={(e) => setFieldValue("area", e.target.value)}
                  // keep enabled if we already have a value (edit mode) so it shows the current selection
                  disabled={areaOptions.length === 0 && !values.area}
                  showSkeleton={skeleton.area}
                  options={
                    areaOptions && areaOptions.length > 0
                      ? areaOptions
                      : values.area
                      ? // show the existing area value as an option when areaOptions haven't loaded yet
                        [{ value: values.area, label: `Selected Area (${values.area})` }]
                      : [{ value: "", label: "No options" }]
                  }
                  error={touched.area && errors.area}
                />
                {errors?.area && touched?.area && (
                  <span className="text-xs text-red-500 mt-1">{errors.area}</span>
                )}
              </div>


              <div>
                <InputFields
                  required
                  label="Longitude"
                  type="number"
                  name="longitude"
                  value={values.longitude}
                  onChange={(e) => setFieldValue("longitude", e.target.value)}
                  error={touched.longitude && errors.longitude}
                />
                {errors?.longitude && touched?.longitude && (
                  <span className="text-xs text-red-500 mt-1">{errors.longitude}</span>
                )}
              </div>
              <div>

                <InputFields
                  required
                  label="Latitude"
                  type="number"
                  name="latitude"
                  value={values.latitude}
                  onChange={(e) => setFieldValue("latitude", e.target.value)}
                  error={touched.latitude && errors.latitude}
                />
                {errors?.latitude && touched?.latitude && (
                  <span className="text-xs text-red-500 mt-1">{errors.latitude}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Threshold Radius"
                  name="thresholdRadius"
                  value={values.thresholdRadius}
                  onChange={(e) =>
                    setFieldValue("thresholdRadius", e.target.value)
                  }
                  error={touched.thresholdRadius && errors.thresholdRadius}
                />
                {errors?.thresholdRadius && touched?.thresholdRadius && (
                  <span className="text-xs text-red-500 mt-1">{errors.thresholdRadius}</span>
                )}
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
                  name="paymentType"
                  type="radio"
                  value={values.paymentType}
                  onChange={(e) => setFieldValue("paymentType", e.target.value)}
                  options={[
                    { value: "1", label: "Cash" },
                    { value: "2", label: "Credit" },
                  ]}
                />
                {errors?.paymentType && touched?.paymentType && (
                  <span className="text-xs text-red-500 mt-1">{errors.paymentType}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Bank Name"
                  name="bankName"
                  value={values.bankName}
                  onChange={(e) => setFieldValue("bankName", e.target.value)}
                  error={touched.bankName && errors.bankName}
                />
                {errors?.bankName && touched?.bankName && (
                  <span className="text-xs text-red-500 mt-1">{errors.bankName}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Bank Account Number"
                  name="bankAccountNumber"
                  value={values.bankAccountNumber}
                  onChange={(e) =>
                    setFieldValue("bankAccountNumber", e.target.value)
                  }
                  error={touched.bankAccountNumber && errors.bankAccountNumber}
                />
                {errors?.bankAccountNumber && touched?.bankAccountNumber && (
                  <span className="text-xs text-red-500 mt-1">{errors.bankAccountNumber}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Credit Day"
                  name="creditDay"
                  value={values.creditDay}
                  onChange={(e) => setFieldValue("creditDay", e.target.value)}
                  error={touched.creditDay && errors.creditDay}
                />
                {errors?.creditDay && touched?.creditDay && (
                  <span className="text-xs text-red-500 mt-1">{errors.creditDay}</span>
                )}
              </div>
              <div>
                <InputFields
                  label="Accuracy"
                  name="accuracy"
                  value={values.accuracy}
                  onChange={(e) => setFieldValue("accuracy", e.target.value)}
                  error={touched.accuracy && errors.accuracy}
                />
                {errors?.accuracy && touched?.accuracy && (
                  <span className="text-xs text-red-500 mt-1">{errors.accuracy}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Credit Limit"
                  name="creditLimit"
                  value={values.creditLimit}
                  onChange={(e) => setFieldValue("creditLimit", e.target.value)}
                  error={touched.creditLimit && errors.creditLimit}
                />
                {errors?.creditLimit && touched?.creditLimit && (
                  <span className="text-xs text-red-500 mt-1">{errors.creditLimit}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Total Credit Limit"
                  name="totalCreditLimit"
                  value={values.totalCreditLimit}
                  onChange={(e) =>
                    setFieldValue("totalCreditLimit", e.target.value)
                  }
                  error={touched.totalCreditLimit && errors.totalCreditLimit}
                />
                {errors?.totalCreditLimit && touched?.totalCreditLimit && (
                  <span className="text-xs text-red-500 mt-1">{errors.totalCreditLimit}</span>
                )}
              </div>
              <div>
                <InputFields
                  label="Credit Limit Validity"
                  name="creditLimitValidity"
                  value={values.creditLimitValidity}
                  onChange={(e) =>
                    setFieldValue("creditLimitValidity", e.target.value)
                  }
                  type="date"
                  error={touched.creditLimitValidity && errors.creditLimitValidity}
                />
                {errors?.creditLimitValidity && touched?.creditLimitValidity && (
                  <span className="text-xs text-red-500 mt-1">{errors.creditLimitValidity}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee Name"
                  name="guaranteeName"
                  value={values.guaranteeName}
                  onChange={(e) => setFieldValue("guaranteeName", e.target.value)}
                  error={touched.guaranteeName && errors.guaranteeName}
                />
                {errors?.guaranteeName && touched?.guaranteeName && (
                  <span className="text-xs text-red-500 mt-1">{errors.guaranteeName}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee Amount"
                  name="guaranteeAmount"
                  value={values.guaranteeAmount}
                  onChange={(e) =>
                    setFieldValue("guaranteeAmount", e.target.value)
                  }
                  error={touched.guaranteeAmount && errors.guaranteeAmount}
                />
                {errors?.guaranteeAmount && touched?.guaranteeAmount && (
                  <span className="text-xs text-red-500 mt-1">{errors.guaranteeAmount}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee From"
                  name="guaranteeFrom"
                  value={values.guaranteeFrom}
                  onChange={(e) => setFieldValue("guaranteeFrom", e.target.value)}
                  type="date"
                  error={touched.guaranteeFrom && errors.guaranteeFrom}
                />
                {errors?.guaranteeFrom && touched?.guaranteeFrom && (
                  <span className="text-xs text-red-500 mt-1">{errors.guaranteeFrom}</span>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Guarantee To"
                  name="guaranteeTo"
                  value={values.guaranteeTo}
                  onChange={(e) => setFieldValue("guaranteeTo", e.target.value)}
                  type="date"
                  error={touched.guaranteeTo && errors.guaranteeTo}
                />
                {errors?.guaranteeTo && touched?.guaranteeTo && (
                  <span className="text-xs text-red-500 mt-1">{errors.guaranteeTo}</span>
                )}
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
                      error={touched.merchendiser_ids && errors.merchendiser_ids}
                    />
                    {errors?.merchendiser_ids && touched?.merchendiser_ids && (
                      <span className="text-xs text-red-500 mt-1">{errors.merchendiser_ids}</span>
                    )}
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
        <div
            className="cursor-pointer"
            onClick={() => router.back()}
        >
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
            {/* Formik-aware watcher for region changes */}
            <RegionWatcher
              fetchAreaOptions={fetchAreaOptions}
              setSkeleton={setSkeleton}
              preserveExistingArea={isEditMode} 
              initialArea={initialValues.area} 
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
              submitButtonText={isSubmitting ? "Submitting..." : "Submit"}
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </>
  );
}
