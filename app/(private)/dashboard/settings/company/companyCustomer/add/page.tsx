"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addCompanyCustomers } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Validation Schema
export const CompanyCustomerSchema = Yup.object().shape({
  sapCode: Yup.string().required("Sap Code is required."),
  customerCode: Yup.string().required("Customer Code is required."),
  businessName: Yup.string().required("Business Name is required."),
  customerType: Yup.string().required("Customer Type is required."),
  ownerName: Yup.string().required("Owner Name is required."),
  ownerNo: Yup.string().required("Owner Number is required."),
  whatsappNo: Yup.string().nullable(),
  email: Yup.string().email("Invalid email format").required("Email is required."),
  language: Yup.string().required("Language is required."),
  contactNo2: Yup.string().required("Contact 2 is required."),
  buyerType: Yup.string().required("Buyer Type is required."),
  roadStreet: Yup.string().required("Road Street is required."),
  town: Yup.string().required("Town is required."),
  landmark: Yup.string().required("Landmark is required."),
  district: Yup.string().required("District is required."),
  balance: Yup.string().required("Balance is required."),
  paymentType: Yup.string().required("Payment Type is required."),
  bankName: Yup.string().required("Bank Name is required."),
  bankAccountNumber: Yup.string().required("Bank Account Number is required."),
  creditDay: Yup.string().required("Credit Day is required."),
  tinNo: Yup.string().required("Tin Number is required."),
  accuracy: Yup.string().required("Accuracy is required."),
  creditLimit: Yup.string().required("Credit Limit is required."),
  guaranteeName: Yup.string().required("Guarantee Name is required."),
  guaranteeAmount: Yup.string().required("Guarantee Amount is required."),
  guaranteeFrom: Yup.string().required("Guarantee From is required."),
  guaranteeTo: Yup.string().required("Guarantee To is required."),
  totalCreditLimit: Yup.string().required("Total Credit Limit is required."),
  creditLimitValidity: Yup.string().required("Credit Limit Validity is required."),
  regionId: Yup.string().required("Region is required."),
  areaId: Yup.string().required("Area is required."),
  vatNo: Yup.string().required("VAT No is required."),
  longitude: Yup.string().required("Longitude is required."),
  latitude: Yup.string().required("Latitude is required."),
  thresholdRadius: Yup.string().required("Threshold Radius is required."),
  dchannelId: Yup.string().required("DChannel ID is required."),
  isWhatsapp: Yup.string().required("Whatsapp status is required."),
  status: Yup.string().required("Status is required."),
});

type CompanyCustomerFormValues = {
  sapCode: string;
  customerCode: string;
  businessName: string;
  customerType: string;
  ownerName: string;
  ownerNo: string;
  whatsappNo: string;
  email: string;
  language: string;
  contactNo2: string;
  buyerType: string;
  roadStreet: string;
  town: string;
  landmark: string;
  district: string;
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
  regionId: string;
  areaId: string;
  vatNo: string;
  longitude: string;
  latitude: string;
  thresholdRadius: string;
  dchannelId: string;
  isWhatsapp: string;
  status: string;
};

export default function AddCompanyCustomers() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { regionOptions, areaOptions } = useAllDropdownListData();

  // ✅ Initial Values
  const initialValues: CompanyCustomerFormValues = {
    sapCode: "",
    customerCode: "",
    businessName: "",
    customerType: "1",
    ownerName: "",
    ownerNo: "",
    balance: "",
    isWhatsapp: "",
    whatsappNo: "",
    email: "",
    language: "",
    contactNo2: "",
    buyerType: "0",
    roadStreet: "",
    town: "",
    landmark: "",
    district: "",
    paymentType: "0",
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
    regionId: "",
    areaId: "",
    vatNo: "",
    longitude: "",
    latitude: "",
    thresholdRadius: "",
    dchannelId: "",
    status: "1", // default Active
  };

  // ✅ Submit Handler
  const handleSubmit = async (
    values: CompanyCustomerFormValues,
    { setSubmitting }: FormikHelpers<CompanyCustomerFormValues>
  ) => {
    try {
      const payload = {
        sap_code: values.sapCode.trim(),
        customer_code: values.customerCode.trim(),
        business_name: values.businessName.trim(),
        customer_type: Number(values.customerType) || 1,
        owner_name: values.ownerName.trim(),
        owner_no: values.ownerNo.trim(),
        is_whatsapp: Number(values.isWhatsapp) || 0,
        whatsapp_no: values.whatsappNo?.trim() || "",
        email: values.email.trim(),
        language: values.language.trim(),
        contact_no2: values.contactNo2?.trim() || "",
        buyerType: Number(values.buyerType) || 0,
        road_street: values.roadStreet.trim(),
        town: values.town.trim(),
        landmark: values.landmark.trim(),
        district: values.district.trim(),
        balance: parseFloat(values.balance) || 0,
        payment_type: Number(values.paymentType) || 0,
        bank_name: values.bankName.trim(),
        bank_account_number: values.bankAccountNumber.trim(),
        creditday: values.creditDay.trim(),
        tin_no: values.tinNo.trim(),
        accuracy: values.accuracy.trim(),
        creditlimit: Number(values.creditLimit) || 0,
        guarantee_name: values.guaranteeName.trim(),
        guarantee_amount: Number(values.guaranteeAmount) || 0,
        guarantee_from: values.guaranteeFrom.trim(),
        guarantee_to: values.guaranteeTo.trim(),
        totalcreditlimit: Number(values.totalCreditLimit) || 0,
        credit_limit_validity: values.creditLimitValidity.trim(),
        region_id: Number(values.regionId) || 0,
        area_id: Number(values.areaId) || 0,
        vat_no: values.vatNo.trim(),
        longitude: values.longitude.trim(),
        latitude: values.latitude.trim(),
        threshold_radius: Number(values.thresholdRadius) || 0,
        dchannel_id: Number(values.dchannelId) || 0,
        status: Number(values.status) || 1,
      };

      const res = await addCompanyCustomers(payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        setSubmitting(false);
        return;
      }

      showSnackbar("Company Customer added successfully ✅", "success");
      router.push("/dashboard/settings/region");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to add Company Customer ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings/region">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Company Customer</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={CompanyCustomerSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Company Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: "SAP Code", name: "sapCode" },
                  { label: "Customer Code", name: "customerCode" },
                  { label: "Business Name", name: "businessName" },
                ].map((field) => (
                  <div key={field.name}>
                    <Field
                      name={field.name}
                      as={InputFields}
                      label={field.label}
                      value={values[field.name as keyof typeof values]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFieldValue(field.name, e.target.value)
                      }
                    />
                    <ErrorMessage
                      name={field.name}
                      component="span"
                      className="text-xs text-red-500 mt-1"
                    />
                  </div>
                ))}
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                label={isSubmitting ? "Submitting..." : "Submit"}
                isActive={!isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}