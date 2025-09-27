"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { addCompanyCustomers } from "@/app/services/allApi";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";

// ---------------------- API Call ----------------------
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
  balance: number;
  payment_type: number;
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
  merchendiser_ids: number;
  status: number;
}

// ---------------------- Validation Schema ----------------------
const CompanyCustomerSchema = Yup.object().shape({
  sapCode: Yup.string().required("SAP Code is required."),
  customerCode: Yup.string().required("Customer Code is required."),
  businessName: Yup.string().required("Business Name is required."),
  customerType: Yup.string().required("Customer Type is required."),
  ownerName: Yup.string().required("Owner Name is required."),
  ownerNumber: Yup.string().required("Owner Number is required."),
  email: Yup.string().email("Invalid email").required("Email is required."),
  language: Yup.string().required("Language is required."),
  balance: Yup.number().typeError("Balance must be a number").required("Balance is required."),
  paymentType: Yup.string().required("Payment Type is required."),
  bankName: Yup.string().required("Bank Name is required."),
  bankAccountNumber: Yup.string().required("Bank Account Number is required."),
  creditDay: Yup.number().typeError("Credit Day must be a number").required("Credit Day is required."),
  creditLimit: Yup.number().typeError("Credit Limit must be a number").required("Credit Limit is required."),
  totalCreditLimit: Yup.number().typeError("Total Credit Limit must be a number").required("Total Credit Limit is required."),
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
  channelId: Yup.string().required("Channel is required."),
  merchendiser_ids: Yup.string().required("Merchendiser is required."),
});

const stepSchemas = [
  Yup.object({
    sapCode: Yup.string().required("SAP Code is required."),
    customerCode: Yup.string().required("Customer Code is required."),
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
    balance: Yup.number().typeError("Balance must be a number").required("Balance is required."),
    paymentType: Yup.string().required("Payment Type is required."),
    bankName: Yup.string().required("Bank Name is required."),
    bankAccountNumber: Yup.string().required("Bank Account Number is required."),
    creditDay: Yup.number().typeError("Credit Day must be a number").required("Credit Day is required."),
    creditLimit: Yup.number().typeError("Credit Limit must be a number").required("Credit Limit is required."),
    totalCreditLimit: Yup.number().typeError("Total Credit Limit must be a number").required("Total Credit Limit is required."),
    guaranteeName: Yup.string().required("Guarantee Name is required."),
    guaranteeAmount: Yup.number().required("Guarantee Amount is required."),
    guaranteeFrom: Yup.date().required("Guarantee From is required."),
    guaranteeTo: Yup.date().required("Guarantee To is required."),
    vatNo: Yup.string().required("VAT No is required."),
    channelId: Yup.string().required("Channel is required."),
    merchendiser_ids: Yup.string().required("Merchendiser is required."),
  }),
];

// ---------------------- Form Values ----------------------
type CompanyCustomerFormValues = {
  sapCode: string;
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

// ---------------------- Component ----------------------
export default function AddCompanyCustomer() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { regionOptions, areaOptions, customerTypeOptions } = useAllDropdownListData();

  const steps: StepperStep[] = [
    { id: 1, label: "Company Customer" },
    { id: 2, label: "Contact" },
    { id: 3, label: "Location" },
    { id: 4, label: "Financial" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const initialValues: CompanyCustomerFormValues = {
    sapCode: "",
    customerCode: "",
    businessName: "",
    customerType: "",
    ownerName: "",
    ownerNumber: "",
    isWhatsapp: "1",
    whatsappNo: "",
    email: "",
    language: "",
    contactNo2: "",
    buyerType: "0",
    roadStreet: "",
    town: "",
    landmark: "",
    district: "",
    region: "",
    area: "",
    balance: "",
    paymentType: "1",
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
    merchendiser_ids: "",
    status: "1",
  };

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
            (acc: Partial<Record<keyof CompanyCustomerFormValues, string>>, curr) => ({
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
    try {
      const payload: CompanyCustomerPayload = {
        sap_code: values.sapCode,
        customer_code: values.customerCode,
        business_name: values.businessName,
        customer_type: String(values.customerType),
        owner_name: values.ownerName,
        owner_no: values.ownerNumber,
        is_whatsapp: Number(values.isWhatsapp),
        whatsapp_no: values.whatsappNo || "",
        email: values.email,
        language: values.language,
        contact_no2: values.contactNo2 || "",
        buyer_type: Number(values.buyerType),
        road_street: values.roadStreet,
        town: values.town,
        landmark: values.landmark,
        district: values.district,
        region_id: Number(values.region),
        area_id: Number(values.area),
        balance: Number(values.balance),
        payment_type: Number(values.paymentType),
        bank_name: values.bankName,
        bank_account_number: values.bankAccountNumber,
        creditday: String(values.creditDay),
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
        dchannel_id: Number(values.dChannelId),
       merchendiser_ids: Number(values.merchendiser_ids),
        status: Number(values.status),
      };

      console.log("Payload sent:", payload);
      const res = await addCompanyCustomers(payload);
      console.log("Response:", res);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        return;
      }

      showSnackbar("Company Customer added successfully ✅", "success");
      router.push("/dashboard/settings/company/companyCustomer");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to add Company Customer ❌", "error");
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
    errors: FormikErrors<CompanyCustomerFormValues>,
    touched: FormikTouched<CompanyCustomerFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Company Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputFields
                label="SAP Code"
                name="sapCode"
                value={values.sapCode}
                onChange={(e) => setFieldValue("sapCode", e.target.value)}
              />
              <ErrorMessage name="sapCode" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Customer Code"
                name="customerCode"
                value={values.customerCode}
                onChange={(e) => setFieldValue("customerCode", e.target.value)}
              />
              <ErrorMessage name="customerCode" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Business Name"
                name="businessName"
                value={values.businessName}
                onChange={(e) => setFieldValue("businessName", e.target.value)}
              />
              <ErrorMessage name="businessName" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Customer Type"
                name="customerType"
                value={values.customerType}
                onChange={(e) => setFieldValue("customerType", e.target.value)}
                options={customerTypeOptions}
              />
              <ErrorMessage name="customerType" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Owner Name"
                name="ownerName"
                value={values.ownerName}
                onChange={(e) => setFieldValue("ownerName", e.target.value)}
              />
              <ErrorMessage name="ownerName" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Owner Number"
                name="ownerNumber"
                value={values.ownerNumber}
                onChange={(e) => setFieldValue("ownerNumber", e.target.value)}
              />
              <ErrorMessage name="ownerNumber" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Email"
                name="email"
                value={values.email}
                onChange={(e) => setFieldValue("email", e.target.value)}
              />
              <ErrorMessage name="email" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Language"
                name="language"
                value={values.language}
                onChange={(e) => setFieldValue("language", e.target.value)}
              />
              <ErrorMessage name="language" component="span" className="text-xs text-red-500 mt-1" />
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
                options={[{ value: "1", label: "Yes" }, { value: "0", label: "No" }]}
              />
              <ErrorMessage name="isWhatsapp" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Whatsapp Number"
                name="whatsappNo"
                value={values.whatsappNo}
                onChange={(e) => setFieldValue("whatsappNo", e.target.value)}
              />
              <ErrorMessage name="whatsappNo" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Contact No 2"
                name="contactNo2"
                value={values.contactNo2}
                onChange={(e) => setFieldValue("contactNo2", e.target.value)}
              />
              <ErrorMessage name="contactNo2" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Buyer Type"
                name="buyerType"
                value={values.buyerType}
                onChange={(e) => setFieldValue("buyerType", e.target.value)}
                options={[{ value: "0", label: "Buyer" }, { value: "1", label: "Seller" }]}
              />
              <ErrorMessage name="buyerType" component="span" className="text-xs text-red-500 mt-1" />
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
              <ErrorMessage name="town" component="span" className="text-xs text-red-500 mt-1" />


              <InputFields
                label="Road Street"
                name="roadStreet"
                value={values.roadStreet}
                onChange={(e) => setFieldValue("roadStreet", e.target.value)}
              />
              <ErrorMessage name="roadStreet" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Landmark"
                name="landmark"
                value={values.landmark}
                onChange={(e) => setFieldValue("landmark", e.target.value)}
              />
              <ErrorMessage name="landmark" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="District"
                name="district"
                value={values.district}
                onChange={(e) => setFieldValue("district", e.target.value)}
              />
              <ErrorMessage name="district" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Region"
                name="region"
                value={values.region}
                onChange={(e) => setFieldValue("region", e.target.value)}
                options={regionOptions}
              />
              <ErrorMessage name="region" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Area"
                name="area"
                value={values.area}
                onChange={(e) => setFieldValue("area", e.target.value)}
                options={areaOptions}
              />
              <ErrorMessage name="area" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="TIN No"
                name="tinNo"
                value={values.tinNo}
                onChange={(e) => setFieldValue("tinNo", e.target.value)}
              />
              <ErrorMessage name="tinNo" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Longitude"
                name="longitude"
                value={values.longitude}
                onChange={(e) => setFieldValue("longitude", e.target.value)}
              />
              <ErrorMessage name="longitude" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Latitude"
                name="latitude"
                value={values.latitude}
                onChange={(e) => setFieldValue("latitude", e.target.value)}
              />
              <ErrorMessage name="latitude" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Threshold Radius"
                name="thresholdRadius"
                value={values.thresholdRadius}
                onChange={(e) => setFieldValue("thresholdRadius", e.target.value)}
              />
              <ErrorMessage name="thresholdRadius" component="span" className="text-xs text-red-500 mt-1" />
            </div>
          </ContainerCard>

        );
      case 4:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Financial & Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <InputFields
                label="Balance"
                name="balance"
                value={values.balance}
                onChange={(e) => setFieldValue("balance", e.target.value)}
              />
              <ErrorMessage name="balance" component="span" className="text-xs text-red-500 mt-1" />

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
              <ErrorMessage name="paymentType" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Bank Name"
                name="bankName"
                value={values.bankName}
                onChange={(e) => setFieldValue("bankName", e.target.value)}
              />
              <ErrorMessage name="bankName" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Bank Account Number"
                name="bankAccountNumber"
                value={values.bankAccountNumber}
                onChange={(e) => setFieldValue("bankAccountNumber", e.target.value)}
              />
              <ErrorMessage name="bankAccountNumber" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Credit Day"
                name="creditDay"
                value={values.creditDay}
                onChange={(e) => setFieldValue("creditDay", e.target.value)}
              />
              <ErrorMessage name="creditDay" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Accuracy"
                name="accuracy"
                value={values.accuracy}
                onChange={(e) => setFieldValue("accuracy", e.target.value)}
              />
              <ErrorMessage name="accuracy" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Credit Limit"
                name="creditLimit"
                value={values.creditLimit}
                onChange={(e) => setFieldValue("creditLimit", e.target.value)}
              />
              <ErrorMessage name="creditLimit" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Total Credit Limit"
                name="totalCreditLimit"
                value={values.totalCreditLimit}
                onChange={(e) => setFieldValue("totalCreditLimit", e.target.value)}
              />
              <ErrorMessage name="totalCreditLimit" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Credit Limit Validity"
                name="creditLimitValidity"
                value={values.creditLimitValidity}
                onChange={(e) => setFieldValue("creditLimitValidity", e.target.value)}
                type="date"
              />
              <ErrorMessage name="creditLimitValidity" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Guarantee Name"
                name="guaranteeName"
                value={values.guaranteeName}
                onChange={(e) => setFieldValue("guaranteeName", e.target.value)}
              />
              <ErrorMessage name="guaranteeName" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Guarantee Amount"
                name="guaranteeAmount"
                value={values.guaranteeAmount}
                onChange={(e) => setFieldValue("guaranteeAmount", e.target.value)}
              />
              <ErrorMessage name="guaranteeAmount" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Guarantee From"
                name="guaranteeFrom"
                value={values.guaranteeFrom}
                onChange={(e) => setFieldValue("guaranteeFrom", e.target.value)}
                type="date"
              />
              <ErrorMessage name="guaranteeFrom" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Guarantee To"
                name="guaranteeTo"
                value={values.guaranteeTo}
                onChange={(e) => setFieldValue("guaranteeTo", e.target.value)}
                type="date"
              />
              <ErrorMessage name="guaranteeTo" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="VAT No"
                name="vatNo"
                value={values.vatNo}
                onChange={(e) => setFieldValue("vatNo", e.target.value)}
              />
              <ErrorMessage name="vatNo" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Channel ID"
                name="dChannelId"
                value={values.dChannelId}
                onChange={(e) => setFieldValue("dChannelId", e.target.value)}
              />
              <ErrorMessage name="dChannelId" component="span" className="text-xs text-red-500 mt-1" />

              <InputFields
                label="Merchendiser"
                name="merchendiser_ids"
                value={values.merchendiser_ids}
                onChange={(e) => setFieldValue("merchendiser_ids", e.target.value)}
                isSingle={false}
                options={[
                  { value: "1", label: "Merchendiser 1" },
                  { value: "2", label: "Merchendiser 2" },
                  { value: "3", label: "Merchendiser 3" },
                ]}
              />
              <ErrorMessage name="merchendiser_ids" component="span" className="text-xs text-red-500 mt-1" />

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
              <ErrorMessage name="status" component="span" className="text-xs text-red-500 mt-1" />

            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 text-gray-600">
        <Link href="/dashboard/settings/company/companyCustomer" className="hover:underline">
          <Icon icon="mdi:arrow-left" className="text-xl" />
        </Link>
        <h1 className="text-xl font-semibold">Add Company Customer</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={CompanyCustomerSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
              currentStep={currentStep}
              onStepClick={() => { }}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, {
                  setErrors: () => { },
                  setTouched: () => { },
                } as unknown as FormikHelpers<CompanyCustomerFormValues>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText="Submit"
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </>
  );
}