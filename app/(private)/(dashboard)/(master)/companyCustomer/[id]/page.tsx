// ------
// ---------------- Form Values Type ----------------------
"use client";

type CompanyCustomerFormValues = {
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
  balance: string;
  paymentType: string;
  bankName: string;
  bankAccountNumber: string;
  creditDay: string;
  tinNo: string;
  accuracy: string;
  creditLimit: string;
  guaranteeName: string;
  guaranteeAmount: string;
  guaranteeFrom: string;
  guaranteeTo: string;
  totalCreditLimit: string;
  creditLimitValidity: string;
  vatNo: string;
  longitude: string;
  latitude: string;
  thresholdRadius: string;
  dChannelId: string;
  status: string;
  merchendiser_ids: string;
};

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Formik,
  Form,
  ErrorMessage,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
} from "formik";
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
import Loading from "@/app/components/Loading";

// ---------------------- API Call ----------------------
interface CompanyCustomerPayload {
  sap_code: string;
  // company_customer_code?: string;
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
  balance: number;
  payment_type: string;
  bank_name: string;
  bank_account_number: string;
  creditday: string;
  tin_no: string;
  accuracy: string;
  creditlimit: number;
  totalcreditlimit: number;
  credit_limit_validity?: string;
  guarantee_name: string;
  guarantee_amount: number;
  guarantee_from: string;
  guarantee_to: string;
  vat_no: string;
  longitude: string;
  latitude: string;
  threshold_radius: number;
  dchannel_id: number;
  merchendiser_ids: string;
  status: number;
  created_user?: number; // Added for backend
  updated_user?: number; // Added for backend
}

// ---------------------- Validation Schema ----------------------
const CompanyCustomerSchema = Yup.object().shape({
    customerCode: Yup.string().notRequired(),

  sapCode: Yup.string().required("SAP Code is required."),
  businessName: Yup.string().required("Business Name is required."),
  customerType: Yup.string().required("Customer Type is required."),
  ownerName: Yup.string().required("Owner Name is required."),
  ownerNumber: Yup.string().required("Owner Number is required."),
  email: Yup.string().email("Invalid email").required("Email is required."),
  language: Yup.string().required("Language is required."),
  balance: Yup.number()
    .typeError("Balance must be a number")
    .required("Balance is required."),
  paymentType: Yup.string().required("Payment Type is required."),
  bankName: Yup.string().required("Bank Name is required."),
  bankAccountNumber: Yup.string().required("Bank Account Number is required."),
  creditDay: Yup.number()
    .typeError("Credit Day must be a number")
    .required("Credit Day is required."),
  creditLimit: Yup.number()
    .typeError("Credit Limit must be a number")
    .required("Credit Limit is required."),
  totalCreditLimit: Yup.number()
    .typeError("Total Credit Limit must be a number")
    .required("Total Credit Limit is required."),
  guaranteeName: Yup.string().required("Guarantee Name is required."),
  guaranteeAmount: Yup.number().required("Guarantee Amount is required."),
  guaranteeFrom: Yup.date().required("Guarantee From is required."),
  guaranteeTo: Yup.date().required("Guarantee To is required."),
  town: Yup.string().required("Town is required."),
  roadStreet: Yup.string().required("Road/Street is required."),
  contactNo2: Yup.string().required("Contact No 2 is required."),
  whatsappNo: Yup.string().required("WhatsApp No is required."),
  landmark: Yup.string().required("Landmark is required."),
  district: Yup.string().required("District is required."),
  region: Yup.string().required("Region is required."),
  area: Yup.string().required("Area is required."),
  status: Yup.string().required("Status is required."),
  vatNo: Yup.string().required("VAT No is required."),
  tinNo: Yup.string().required("TIN No is required."),
  longitude: Yup.string().required("Longitude is required."),
  latitude: Yup.string().required("Latitude is required."),
  thresholdRadius: Yup.number().required("Threshold Radius is required."),
  dChannelId: Yup.string().required("Channel is required."),
  // merchendiser_ids: Yup.string(), // Made optional to match backend
});

const stepSchemas = [
  Yup.object({
    sapCode: Yup.string().required("SAP Code is required."),
    customerCode: Yup.string().notRequired(),
    businessName: Yup.string().required("Business Name is required."),
    customerType: Yup.string().required("Customer Type is required."),
    ownerName: Yup.string().required("Owner Name is required."),
    ownerNumber: Yup.string().required("Owner Number is required."),
    email: Yup.string().email("Invalid email").required("Email is required."),
    language: Yup.string().required("Language is required."),
  }),
  Yup.object({
    contactNo2: Yup.string().required("Contact No 2 is required."),
    whatsappNo: Yup.string().required("WhatsApp No is required."),
  }),
  Yup.object({
    town: Yup.string().required("Town is required."),
    roadStreet: Yup.string().required("Road/Street is required."),
    landmark: Yup.string().required("Landmark is required."),
    district: Yup.string().required("District is required."),
    region: Yup.string().required("Region is required."),
    area: Yup.string().required("Area is required."),
    tinNo: Yup.string().required("TIN No is required."),
    longitude: Yup.string().required("Longitude is required."),
    latitude: Yup.string().required("Latitude is required."),
    thresholdRadius: Yup.number().required("Threshold Radius is required."),
  }),
  Yup.object({
    balance: Yup.number()
      .typeError("Balance must be a number")
      .required("Balance is required."),
    paymentType: Yup.string().required("Payment Type is required."),
    bankName: Yup.string().required("Bank Name is required."),
    bankAccountNumber: Yup.string().required(
      "Bank Account Number is required."
    ),
    creditDay: Yup.number()
      .typeError("Credit Day must be a number")
      .required("Credit Day is required."),
    creditLimit: Yup.number()
      .typeError("Credit Limit must be a number")
      .required("Credit Limit is required."),
    totalCreditLimit: Yup.number()
      .typeError("Total Credit Limit must be a number")
      .required("Total Credit Limit is required."),
    guaranteeName: Yup.string().required("Guarantee Name is required."),
    guaranteeAmount: Yup.number().required("Guarantee Amount is required."),
    guaranteeFrom: Yup.date().required("Guarantee From is required."),
    guaranteeTo: Yup.date().required("Guarantee To is required."),
    vatNo: Yup.string().required("VAT No is required."),
    dChannelId: Yup.string().required("Channel is required."), // Fixed field name
    merchendiser_ids: Yup.string(), // Make optional if not always required
  }),
];
// ---------------------- Component ----------------------
export default function AddCompanyCustomer() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const { regionOptions, areaOptions, customerTypeOptions } =
    useAllDropdownListData();

  const steps: StepperStep[] = [
    { id: 1, label: "Company Customer" },
    { id: 2, label: "Contact" },
    { id: 3, label: "Location" },
    { id: 4, label: "Financial" },
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
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<CompanyCustomerFormValues>(
    {
      sapCode: "",
      // company_customer_code: "",
      customerCode: "",
      businessName: "",
      customerType: "",
      ownerName: "",
      ownerNumber: "",
      isWhatsapp: "",
      whatsappNo: "",
      email: "",
      language: "",
      contactNo2: "",
      buyerType: "",
      roadStreet: "",
      town: "",
      landmark: "",
      district: "",
      region: "",
      area: "",
      balance: "",
      paymentType: "",
      bankName: "",
      bankAccountNumber: "",
      creditDay: "",
      tinNo: "",
      accuracy: "",
      creditLimit: "",
      guaranteeName: "",
      guaranteeAmount: "",
      guaranteeFrom: "",
      guaranteeTo: "",
      totalCreditLimit: "",
      creditLimitValidity: "",
      vatNo: "",
      longitude: "",
      latitude: "",
      thresholdRadius: "",
      dChannelId: "",
      status: "",
      merchendiser_ids: "",
    }
  );

  const fetchData = async () => {
    try {
      const id = params?.id as string;
      const data = await getCompanyCustomerById(id);
      console.log(data);
      const mapped: CompanyCustomerFormValues = {
        sapCode: data.sap_code || "",
        // company_customer_code: data.company_customer_code || "",
        customerCode: data.customer_code || "",
        businessName: data.business_name || "",
        customerType: String(data.customer_type || ""),
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
        balance: String(data.balance || ""),
        paymentType: String(data.payment_type || "1"),
        bankName: data.bank_name || "",
        bankAccountNumber: data.bank_account_number || "",
        creditDay: String(data.creditday || ""),
        tinNo: data.tin_no || "",
        accuracy: data.accuracy || "",
        creditLimit: String(data.creditlimit || ""),
        guaranteeName: data.guarantee_name || "",
        guaranteeAmount: String(data.guarantee_amount || ""),
        guaranteeFrom: data.guarantee_from || "",
        guaranteeTo: data.guarantee_to || "",
        totalCreditLimit: String(data.totalcreditlimit || ""),
        creditLimitValidity: data.credit_limit_validity || "",
        vatNo: data.vat_no || "",
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
    if (!params?.id) return;

    if (params.id.toString().trim().toLowerCase() !== "add") {
      setIsEditMode(true);
      setLoading(true);
      fetchData();
      setLoading(false);
    } else if (params.id.toString().trim().toLowerCase() == "add") {
      setIsEditMode(false);
      (async () => {
        const res = await genearateCode({ model_name: "tbl_company_customer" });

        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          const match = res.prefix;
          if (match) setPrefix(match);
        }
      })();
    }
  }, []);

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
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  const handleSubmit = async (
    values: CompanyCustomerFormValues,
    { setSubmitting }: FormikHelpers<CompanyCustomerFormValues>
  ) => {
    console.log("🚀 handleSubmit STARTED - Form submission triggered");
    console.log("📝 Current form values:", values);

    try {
      // Create payload that matches your backend requirements
      const payload: CompanyCustomerPayload = {
        sap_code: values.sapCode,
        customer_code: values.customerCode,
        business_name: values.businessName,
        customer_type: values.customerType, // Already string from form
        owner_name: values.ownerName,
        owner_no: values.ownerNumber,
        is_whatsapp: Number(values.isWhatsapp),
        whatsapp_no: values.whatsappNo,
        email: values.email,
        language: values.language,
        contact_no2: values.contactNo2,
        buyer_type: Number(values.buyerType),
        road_street: values.roadStreet,
        town: values.town,
        landmark: values.landmark,
        district: values.district,
        region_id: Number(values.region),
        area_id: Number(values.area),
        balance: Number(values.balance),
        payment_type: values.paymentType,
        bank_name: values.bankName,
        bank_account_number: values.bankAccountNumber,
        creditday: values.creditDay, // Already string from form
        tin_no: values.tinNo,
        accuracy: values.accuracy || "",
        creditlimit: Number(values.creditLimit),
        totalcreditlimit: Number(values.totalCreditLimit),
        credit_limit_validity: values.creditLimitValidity,
        guarantee_name: values.guaranteeName,
        guarantee_amount: Number(values.guaranteeAmount),
        guarantee_from: values.guaranteeFrom,
        guarantee_to: values.guaranteeTo,
        vat_no: values.vatNo,
        longitude: values.longitude,
        latitude: values.latitude,
        threshold_radius: Number(values.thresholdRadius),
        dchannel_id: Number(values.dChannelId), // Fixed field name mapping
        merchendiser_ids: values.merchendiser_ids || "",
        status: Number(values.status),
        // Add user fields that your backend expects
        created_user: 1, // You might want to get this from auth context
        updated_user: 2, // You might want to get this from auth context
      };

      console.log(
        "📦 Final Payload for Backend:",
        JSON.stringify(payload, null, 2)
      );

      let res;
      if (isEditMode) {
        console.log("✏️ Updating existing company customer");
        // For edit mode, only exclude fields that shouldn't be sent during update
        // const { created_user, ...updatePayload } =
        //   payload;
        console.log("📤 Edit Payload:", JSON.stringify(payload, null, 2));
        res = await updateCompanyCustomer(String(params.id), payload);
      } else {
        console.log("➕ Adding new company customer");
        res = await addCompanyCustomers(payload);
      }

      console.log("📨 API Response:", res);

      if (res.error) {
        console.error("❌ API Error:", res.error);
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        console.log("✅ Success - Company customer saved");
        showSnackbar(
          res.message ||
            (isEditMode
              ? "Company Customer Updated Successfully"
              : "Company Customer Created Successfully"),
          "success"
        );

        // Finalize the reserved code after successful add (not for edit)
        if (!isEditMode) {
          try {
            await saveFinalCode({
              reserved_code: values.customerCode || "",
              model_name: "tbl_company_customer",
            });
            console.log("✅ Code finalized successfully");
          } catch (e) {
            console.error("❌ Error finalizing code:", e);
          }
        }

        router.push("/companyCustomer");
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
      showSnackbar(
        `Failed to ${isEditMode ? "update" : "add"} Company Customer ❌`,
        "error"
      );
    } finally {
      console.log("🏁 handleSubmit COMPLETED");
      setSubmitting(false);
    }
  };

  //   values: CompanyCustomerFormValues,
  //   { setSubmitting }: FormikHelpers<CompanyCustomerFormValues>
  // ) => {
  //   console.log("Submitting values:", values);
  //   try {
  //     const payload: CompanyCustomerPayload = {
  //       sap_code: values.sapCode,
  //       company_customer_code: values.company_customer_code,
  //       customer_code: values.customerCode,
  //       business_name: values.businessName,
  //       customer_type: String(values.customerType),
  //       owner_name: values.ownerName,
  //       owner_no: values.ownerNumber,
  //       is_whatsapp: Number(values.isWhatsapp),
  //       whatsapp_no: values.whatsappNo || "",
  //       email: values.email,
  //       language: values.language,
  //       contact_no2: values.contactNo2 || "",
  //       buyer_type: Number(values.buyerType),
  //       road_street: values.roadStreet,
  //       town: values.town,
  //       landmark: values.landmark,
  //       district: values.district,
  //       region_id: Number(values.region),
  //       area_id: Number(values.area),
  //       balance: Number(values.balance),
  //       payment_type: values.paymentType,
  //       bank_name: values.bankName,
  //       bank_account_number: values.bankAccountNumber,
  //       creditday: String(values.creditDay),
  //       tin_no: values.tinNo,
  //       accuracy: values.accuracy || "",
  //       creditlimit: Number(values.creditLimit),
  //       totalcreditlimit: Number(values.totalCreditLimit),
  //       credit_limit_validity: values.creditLimitValidity,
  //       guarantee_name: values.guaranteeName,
  //       guarantee_amount: Number(values.guaranteeAmount),
  //       guarantee_from: values.guaranteeFrom,
  //       guarantee_to: values.guaranteeTo,
  //       vat_no: values.vatNo,
  //       longitude: values.longitude,
  //       latitude: values.latitude,
  //       threshold_radius: Number(values.thresholdRadius),
  //       dchannel_id: Number(values.dChannelId),
  //       merchendiser_ids: Array.isArray(values.merchendiser_ids)
  //         ? values.merchendiser_ids.map((id) => id.replace(/"/g, "")).join(",")
  //         : String(values.merchendiser_ids).replace(/"/g, ""),
  //       status: Number(values.status),
  //     };

  //     console.log("Final Payload:", payload);

  //     let res;
  //     if (isEditMode) {
  //       const { merchendiser_ids, ...newPayload } = payload;
  //       console.log("Edit Payload:", newPayload);
  //       res = await updateCompanyCustomer(String(params.id), newPayload);
  //     } else {
  //       res = await addCompanyCustomers(payload);
  //     }

  //     if (res.error) {
  //       showSnackbar(res.data?.message || "Failed to submit form", "error");
  //     } else {
  //       showSnackbar(
  //         res.message ||
  //           (isEditMode
  //             ? "Company Customer Updated Successfully"
  //             : "Company Customer Created Successfully"),
  //         "success"
  //       );
  //       // Finalize the reserved code after successful add/update
  //       try {
  //         await saveFinalCode({
  //           reserved_code: values.company_customer_code,
  //           model_name: "tbl_company_customer",
  //         });
  //       } catch (e) {}
  //       router.push("/dashboard/settings/company/companyCustomer");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     showSnackbar(
  //       `Failed to ${isEditMode ? "update" : "add"} "Company Customer" ❌`,
  //       "error"
  //     );
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const renderStepContent = (
    values: CompanyCustomerFormValues,
    setFieldValue: (
      field: keyof CompanyCustomerFormValues,
      value: string | File,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<CompanyCustomerFormValues>,
    touched: FormikTouched<CompanyCustomerFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Company Customer Code (pattern-matched UI) */}
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  label="Customer Code"
                  name="customerCode"
                  value={values.customerCode}
                  onChange={(e) =>
                    setFieldValue("customerCode", e.target.value)
                  }
                  disabled={codeMode === "auto"}
                  error={
                    touched.customerCode &&
                    errors.customerCode
                  }
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
              <InputFields
                label="SAP Code"
                name="sapCode"
                value={values.sapCode}
                onChange={(e) => setFieldValue("sapCode", e.target.value)}
              />
              <ErrorMessage
                name="sapCode"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              {/* <InputFields
                label="Customer Code"
                name="customerCode"
                value={values.customerCode}
                onChange={(e) => setFieldValue("customerCode", e.target.value)}
              />
              <ErrorMessage
                name="customerCode"
                component="span"
                className="text-xs text-red-500 mt-1"
              /> */}

              <InputFields
                label="Business Name"
                name="businessName"
                value={values.businessName}
                onChange={(e) => setFieldValue("businessName", e.target.value)}
              />
              <ErrorMessage
                name="businessName"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Customer Type"
                name="customerType"
                value={values.customerType}
                onChange={(e) => setFieldValue("customerType", e.target.value)}
                options={customerTypeOptions}
              />
              <ErrorMessage
                name="customerType"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Owner Name"
                name="ownerName"
                value={values.ownerName}
                onChange={(e) => setFieldValue("ownerName", e.target.value)}
              />
              <ErrorMessage
                name="ownerName"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Owner Number"
                name="ownerNumber"
                value={values.ownerNumber}
                onChange={(e) => setFieldValue("ownerNumber", e.target.value)}
              />
              <ErrorMessage
                name="ownerNumber"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Email"
                name="email"
                value={values.email}
                onChange={(e) => setFieldValue("email", e.target.value)}
              />
              <ErrorMessage
                name="email"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Language"
                name="language"
                value={values.language}
                onChange={(e) => setFieldValue("language", e.target.value)}
              />
              <ErrorMessage
                name="language"
                component="span"
                className="text-xs text-red-500 mt-1"
              />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputFields
                label="Whatsapp Available?"
                name="isWhatsapp"
                value={values.isWhatsapp}
                onChange={(e) => setFieldValue("isWhatsapp", e.target.value)}
                options={[
                  { value: "1", label: "Yes" },
                  { value: "0", label: "No" },
                ]}
              />
              <ErrorMessage
                name="isWhatsapp"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Whatsapp Number"
                name="whatsappNo"
                value={values.whatsappNo}
                onChange={(e) => setFieldValue("whatsappNo", e.target.value)}
              />
              <ErrorMessage
                name="whatsappNo"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Contact No 2"
                name="contactNo2"
                value={values.contactNo2}
                onChange={(e) => setFieldValue("contactNo2", e.target.value)}
              />
              <ErrorMessage
                name="contactNo2"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Buyer Type"
                name="buyerType"
                value={values.buyerType}
                onChange={(e) => setFieldValue("buyerType", e.target.value)}
                options={[
                  { value: "0", label: "Buyer" },
                  { value: "1", label: "Seller" },
                ]}
              />
              <ErrorMessage
                name="buyerType"
                component="span"
                className="text-xs text-red-500 mt-1"
              />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputFields
                label="Town"
                name="town"
                value={values.town}
                onChange={(e) => setFieldValue("town", e.target.value)}
              />
              <ErrorMessage
                name="town"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Road Street"
                name="roadStreet"
                value={values.roadStreet}
                onChange={(e) => setFieldValue("roadStreet", e.target.value)}
              />
              <ErrorMessage
                name="roadStreet"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Landmark"
                name="landmark"
                value={values.landmark}
                onChange={(e) => setFieldValue("landmark", e.target.value)}
              />
              <ErrorMessage
                name="landmark"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="District"
                name="district"
                value={values.district}
                onChange={(e) => setFieldValue("district", e.target.value)}
              />
              <ErrorMessage
                name="district"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Region"
                name="region"
                value={values.region}
                onChange={(e) => setFieldValue("region", e.target.value)}
                options={regionOptions}
              />
              <ErrorMessage
                name="region"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Area"
                name="area"
                value={values.area}
                onChange={(e) => setFieldValue("area", e.target.value)}
                options={areaOptions}
              />
              <ErrorMessage
                name="area"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="TIN No"
                name="tinNo"
                value={values.tinNo}
                onChange={(e) => setFieldValue("tinNo", e.target.value)}
              />
              <ErrorMessage
                name="tinNo"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Longitude"
                name="longitude"
                value={values.longitude}
                onChange={(e) => setFieldValue("longitude", e.target.value)}
              />
              <ErrorMessage
                name="longitude"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Latitude"
                name="latitude"
                value={values.latitude}
                onChange={(e) => setFieldValue("latitude", e.target.value)}
              />
              <ErrorMessage
                name="latitude"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Threshold Radius"
                name="thresholdRadius"
                value={values.thresholdRadius}
                onChange={(e) =>
                  setFieldValue("thresholdRadius", e.target.value)
                }
              />
              <ErrorMessage
                name="thresholdRadius"
                component="span"
                className="text-xs text-red-500 mt-1"
              />
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
              
             </div>

              <InputFields
                label="Payment Type"
                name="paymentType"
                value={values.paymentType}
                onChange={(e) => setFieldValue("paymentType", e.target.value)}
                options={[
                  { value: "1", label: "Cash" },
                  { value: "2", label: "Credit" },
                ]}
              />
              <ErrorMessage
                name="paymentType"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Bank Name"
                name="bankName"
                value={values.bankName}
                onChange={(e) => setFieldValue("bankName", e.target.value)}
              />
              <ErrorMessage
                name="bankName"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Bank Account Number"
                name="bankAccountNumber"
                value={values.bankAccountNumber}
                onChange={(e) =>
                  setFieldValue("bankAccountNumber", e.target.value)
                }
              />
              <ErrorMessage
                name="bankAccountNumber"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Credit Day"
                name="creditDay"
                value={values.creditDay}
                onChange={(e) => setFieldValue("creditDay", e.target.value)}
              />
              <ErrorMessage
                name="creditDay"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Accuracy"
                name="accuracy"
                value={values.accuracy}
                onChange={(e) => setFieldValue("accuracy", e.target.value)}
              />
              <ErrorMessage
                name="accuracy"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Credit Limit"
                name="creditLimit"
                value={values.creditLimit}
                onChange={(e) => setFieldValue("creditLimit", e.target.value)}
              />
              <ErrorMessage
                name="creditLimit"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Total Credit Limit"
                name="totalCreditLimit"
                value={values.totalCreditLimit}
                onChange={(e) =>
                  setFieldValue("totalCreditLimit", e.target.value)
                }
              />
              <ErrorMessage
                name="totalCreditLimit"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Credit Limit Validity"
                name="creditLimitValidity"
                value={values.creditLimitValidity}
                onChange={(e) =>
                  setFieldValue("creditLimitValidity", e.target.value)
                }
                type="date"
              />
              <ErrorMessage
                name="creditLimitValidity"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Guarantee Name"
                name="guaranteeName"
                value={values.guaranteeName}
                onChange={(e) => setFieldValue("guaranteeName", e.target.value)}
              />
              <ErrorMessage
                name="guaranteeName"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Guarantee Amount"
                name="guaranteeAmount"
                value={values.guaranteeAmount}
                onChange={(e) =>
                  setFieldValue("guaranteeAmount", e.target.value)
                }
              />
              <ErrorMessage
                name="guaranteeAmount"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Guarantee From"
                name="guaranteeFrom"
                value={values.guaranteeFrom}
                onChange={(e) => setFieldValue("guaranteeFrom", e.target.value)}
                type="date"
              />
              <ErrorMessage
                name="guaranteeFrom"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Guarantee To"
                name="guaranteeTo"
                value={values.guaranteeTo}
                onChange={(e) => setFieldValue("guaranteeTo", e.target.value)}
                type="date"
              />
              <ErrorMessage
                name="guaranteeTo"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="VAT No"
                name="vatNo"
                value={values.vatNo}
                onChange={(e) => setFieldValue("vatNo", e.target.value)}
              />
              <ErrorMessage
                name="vatNo"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              <InputFields
                label="Channel ID"
                name="dChannelId"
                value={values.dChannelId}
                onChange={(e) => setFieldValue("dChannelId", e.target.value)}
              />
              <ErrorMessage
                name="dChannelId"
                component="span"
                className="text-xs text-red-500 mt-1"
              />

              {!isEditMode && (
                <>
                  <InputFields
                    label="Merchendiser"
                    name="merchendiser_ids"
                    value={values.merchendiser_ids}
                    onChange={(e) =>
                      setFieldValue("merchendiser_ids", e.target.value)
                    }
                    isSingle={false}
                    options={[
                      { value: "1", label: "Merchendiser 1" },
                      { value: "2", label: "Merchendiser 2" },
                      { value: "3", label: "Merchendiser 3" },
                    ]}
                  />
                  <ErrorMessage
                    name="merchendiser_ids"
                    component="span"
                    className="text-xs text-red-500 mt-1"
                  />
                </>
              )}

              <InputFields
                label="Status"
                name="status"
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
                className="text-xs text-red-500 mt-1"
              />
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="flex align-middle items-center gap-3 text-gray-600 mb-6">
        <Link
          href="/companyCustomer"
          className="hover:underline"
        >
          <Icon icon="mdi:arrow-left" className="text-xl" />
        </Link>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Update" : "Add"} Company Customer
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={CompanyCustomerSchema}
        onSubmit={handleSubmit} // ✅ Direct function reference
        enableReinitialize={true}
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          handleSubmit: formikSubmit,
          isSubmitting, // ✅ Add this to get submitting state
        }) => (
          <Form>
            
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
                  setErrors: () => {},
                  setTouched: () => {},
                  setSubmitting: () => {},
                } as unknown as FormikHelpers<CompanyCustomerFormValues>)
              }
              onSubmit={formikSubmit} // ✅ This should be the Formik handleSubmit
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={isSubmitting ? "Submitting..." : "Submit"} // ✅ Show loading state
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </>
  );
}
