"use client";

import Loading from "@/app/components/Loading";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  addPayment,
  genearateCode,
  getbankList,
  getCompanyCustomers
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

interface PaymentFormValues {
  osa_code: string;
  payment_type: string; // "cash" | "cheque" | "transfer"
  companybank_id: string;
  cheque_no: string;
  cheque_date: string;
  agent_id: string;
  amount: string;
  recipt_no: string;
  recipt_date: string;
  recipt_image: File | null;
  status: string;
}

interface Bank {
  id: string;
  osa_code: string;
  bank_name: string;
  branch: string;
  city: string;
  account_number: string;
  status: number;
}

interface Customer {
  id: number;
  sap_code: string;
  osa_code: string;
  business_name: string;
  customer_type: string;
  owner_name: string;
  owner_no: string;
  email: string;
  status: number;
  bank_name: string;
  bank_account_number: string;
}

export default function AddPaymentPage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  // const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const codeGeneratedRef = useRef(false);
   const CURRENCY = localStorage.getItem("country") || "";
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [selectedBankInfo, setSelectedBankInfo] = useState({
    bank_name: "",
    branch: "",
    account_number: "",
  });
  const [selectedCustomerBankInfo, setSelectedCustomerBankInfo] = useState({
    bank_name: "",
    account_number: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        setLoading(true);
        const res = await genearateCode({ model_name: "advance_payment" });
        setLoading(false);
        if (res?.code) {
          formik.setFieldValue("osa_code", res.code);
        }
      })();
    }
  }, []);

  // Fetch banks list from API
  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const res = await getbankList();

      console.log("Banks API Response:", res);

      if (res?.success === true || res?.status === "success") {
        const banksData = Array.isArray(res.data) ? res.data : [];
        setBanks(banksData);

        if (banksData.length === 0) {
          showSnackbar("No banks found", "info");
        }
      } else {
        showSnackbar(res?.message || "Failed to fetch banks", "error");
        setBanks([]);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
      showSnackbar("Error fetching banks", "error");
      setBanks([]);
    } finally {
      setLoadingBanks(false);
    }
  };

  // Fetch customers list from getCompanyCustomers API
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await getCompanyCustomers();

      console.log("Customers API Response:", res);

      if (res?.success === true || res?.status === "success") {
        const customersData = Array.isArray(res.data) ? res.data : [];
        setCustomers(customersData);

        // console.log(customersData)

        if (customersData.length === 0) {
          showSnackbar("No customers found", "info");
        }
      } else {
        showSnackbar(res?.message || "Failed to fetch customers", "error");
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      showSnackbar("Error fetching customers", "error");
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  console.log(customers)

  // Handle bank selection change
  const handleBankChange = (bankId: string) => {
    formik.setFieldValue("companybank_id", bankId);

    const selectedBank = banks.find((bank) => bank.id.toString() === bankId);

    if (selectedBank) {
      setSelectedBankInfo({
        bank_name: selectedBank.bank_name || "",
        branch: selectedBank.branch || "",
        account_number: selectedBank.account_number || "",
      });
    } else {
      setSelectedBankInfo({
        bank_name: "",
        branch: "",
        account_number: "",
      });
    }
  };

  // Handle customer selection change
  const handleCustomerChange = (customerId: string) => {
    formik.setFieldValue("agent_id", customerId);

    const selectedCustomer = customers.find(
      (customer) => customer.id.toString() === customerId
    );

    if (selectedCustomer) {
      setSelectedCustomerBankInfo({
        bank_name: selectedCustomer.bank_name || "",
        account_number: selectedCustomer.bank_account_number || "",
      });
    } else {
      setSelectedCustomerBankInfo({
        bank_name: "",
        account_number: "",
      });
    }
  };

  // Handle file upload and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Validate file type based on backend requirements
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        showSnackbar(
          "Please select a valid file (jpg, jpeg, png, pdf only)",
          "error"
        );
        // Clear the invalid file
        event.target.value = "";
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("File size should be less than 5MB", "error");
        event.target.value = "";
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(""); // Clear preview for PDFs
      }
    } else {
      setImagePreview(""); // Clear preview if no file
    }

    formik.setFieldValue("recipt_image", file);
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Form validation schema
  const validationSchema = Yup.object({
    osa_code: Yup.string().required("OSA Code is required"),
    payment_type: Yup.string()
      .oneOf(["cash", "cheque", "transfer"], "Invalid payment type")
      .required("Payment type is required"),
    companybank_id: Yup.string().when("payment_type", {
      is: (type: string) => ["cash", "cheque", "transfer"].includes(type),
      then: (schema) => schema.required("Bank is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    cheque_no: Yup.string().when("payment_type", {
      is: "cheque",
      then: (schema) => schema.required("Cheque number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    cheque_date: Yup.string().when("payment_type", {
      is: "cheque",
      then: (schema) => schema.required("Cheque date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    agent_id: Yup.string().required("Customer is required"),
    amount: Yup.string()
      .required("Amount is required")
      .matches(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
    recipt_no: Yup.string().required("Receipt number is required"),
    recipt_date: Yup.string().required("Receipt date is required"),
    recipt_image: Yup.mixed()
      .test("fileSize", "File size is too large", (value: any) => {
        if (!value) return true; // File is optional
        return value.size <= 5 * 1024 * 1024; // 5MB
      })
      .test(
        "fileType",
        "Unsupported file format. Only jpg, jpeg, png, pdf are allowed",
        (value: any) => {
          if (!value) return true; // File is optional
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
          ];
          return allowedTypes.includes(value.type);
        }
      )
      .notRequired(),
    status: Yup.string().required("Status is required"),
  });

  // Formik setup
  const formik = useFormik<PaymentFormValues>({
    initialValues: {
      osa_code: "",
      payment_type: "",
      companybank_id: "",
      cheque_no: "",
      cheque_date: "",
      agent_id: "",
      amount: "",
      recipt_no: "",
      recipt_date: "",
      recipt_image: null,
      status: "active",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("Form values:", values);

        // Create FormData object
        const formData = new FormData();

        // Map payment type to numeric values
        const paymentTypeMap: { [key: string]: number } = {
          cash: 1,
          cheque: 2,
          transfer: 3,
        };

        // Add all form fields to FormData
        formData.append(
          "payment_type",
          paymentTypeMap[values.payment_type].toString()
        );
        formData.append("companybank_id", values.companybank_id);
        formData.append("amount", values.amount);
        formData.append("recipt_no", values.recipt_no);
        formData.append("recipt_date", values.recipt_date);
        formData.append("osa_code", values.osa_code);
        formData.append("status", values.status === "active" ? "1" : "0");
        formData.append("agent_id", values.agent_id);

        // Conditional fields for cheque
        if (values.payment_type === "cheque") {
          formData.append("cheque_no", values.cheque_no);
          formData.append("cheque_date", values.cheque_date);
        } else {
          formData.append("cheque_no", "");
          formData.append("cheque_date", "");
        }

        if (values.recipt_image && values.recipt_image instanceof File) {
          console.log(
            "Appending file:",
            values.recipt_image.name,
            values.recipt_image.type
          );
          formData.append("recipt_image", values.recipt_image);
        } else {
          console.log("No file to append");
        }

        // Log FormData contents for debugging
        console.log("FormData contents:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(
              key,
              `File: ${value.name}, Type: ${value.type}, Size: ${value.size} bytes`
            );
          } else {
            console.log(key, value);
          }
        }

        let res = null;
        res = await addPayment(formData);

        console.log("API Response:", res);

        // Check for successful response
        const isSuccess = res?.status === "success";

        if (isSuccess) {
          showSnackbar(
            res?.message ||
            (isEditMode
              ? "Payment Updated Successfully"
              : "Payment Created Successfully"),
            "success"
          );
          setTimeout(() => {
            router.push("/advancePayment");
          }, 1500);
        } else {
          // Show backend validation errors if available
          if (res?.errors) {
            Object.values(res.errors).forEach((errorArray: unknown) => {
              if (Array.isArray(errorArray)) {
                errorArray.forEach((error) => showSnackbar(error, "error"));
              }
            });
          } else {
            showSnackbar(res?.message || "Failed to submit form", "error");
          }
        }
      } catch (error) {
        console.error("Submission error:", error);
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch banks and customers on component mount
  useEffect(() => {
    fetchBanks();
    fetchCustomers();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/advancePayment">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit Payment" : "Add Payment"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading />
      ) : (

        <form
          onSubmit={formik.handleSubmit}
          className="border border-gray-300 rounded-lg mb-10"
        >
          <ContainerCard>
            <div className="flex justify-between mb-10 px-5 py-10 flex-wrap gap-[20px] border-b border-gray-300">
              <div className="flex flex-col gap-[10px]">
                <Logo type="full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                  PAYMENT
                </span>
                <span className="text-primary text-end text-[14px] tracking-[10px]">
                  {"#" + formik.values.osa_code}
                </span>
              </div>
            </div>

            <div className="m-10">
              <h2 className="text-lg font-semibold mb-6">Payment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* OSA Code */}
                <InputFields
                  label="OSA Code"
                  name="osa_code"
                  value={formik.values.osa_code}
                  onChange={formik.handleChange}
                  disabled={codeMode === "auto"}
                  error={formik.touched.osa_code && formik.errors.osa_code}
                />

                {/* Payment Type */}
                <InputFields
                  required
                  type="select"
                  name="payment_type"
                  label="Payment Type"
                  value={formik.values.payment_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.payment_type && formik.errors.payment_type
                  }
                  options={[
                    { value: "cash", label: "Cash" },
                    { value: "cheque", label: "Cheque" },
                    { value: "transfer", label: "Transfer" },
                  ]}
                />

                {/* Bank Selection - Show for all payment types */}
                {(formik.values.payment_type === "cash" ||
                  formik.values.payment_type === "cheque" ||
                  formik.values.payment_type === "transfer") && (
                    <InputFields
                      required
                      type="select"
                      name="companybank_id"
                      label="Bank"
                      value={formik.values.companybank_id}
                      onChange={(e) => handleBankChange(e.target.value)}
                      onBlur={formik.handleBlur}
                      options={banks.map((bank) => ({
                        value: bank.id.toString(),
                        label: `${bank.bank_name} - ${bank.branch}`,
                      }))}
                      loading={loadingBanks}
                      error={
                        formik.touched.companybank_id &&
                        formik.errors.companybank_id
                      }
                      placeholder="Select Bank"
                    />
                  )}

                {/* Bank Information Display Fields */}
                {formik.values.companybank_id && (
                  <>
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium text-gray-700">
                        Company Bank Name
                      </label>
                      <input
                        type="text"
                        value={selectedBankInfo.bank_name}
                        disabled
                        className="border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] bg-gray-100 text-gray-600 cursor-not-allowed"
                        placeholder="Bank name will appear here"
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium text-gray-700">
                        Company Branch
                      </label>
                      <input
                        type="text"
                        value={selectedBankInfo.branch}
                        disabled
                        className="border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] bg-gray-100 text-gray-600 cursor-not-allowed"
                        placeholder="Branch will appear here"
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium text-gray-700">
                        Company Account Number
                      </label>
                      <input
                        type="text"
                        value={selectedBankInfo.account_number}
                        disabled
                        className="border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] bg-gray-100 text-gray-600 cursor-not-allowed"
                        placeholder="Account number will appear here"
                      />
                    </div>
                  </>
                )}

                {/* Cheque Number - Only for cheque payments */}
                {formik.values.payment_type === "cheque" && (
                  <InputFields
                    required
                    type="text"
                    name="cheque_no"
                    label="Cheque Number"
                    value={formik.values.cheque_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.cheque_no && formik.errors.cheque_no}
                    placeholder="Enter cheque number"
                  />
                )}

                {/* Cheque Date - Only for cheque payments */}
                {formik.values.payment_type === "cheque" && (
                  <InputFields
                    required
                    type="date"
                    name="cheque_date"
                    label="Cheque Date"
                    value={formik.values.cheque_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.cheque_date && formik.errors.cheque_date
                    }
                  />
                )}

                {/* Customer Selection */}
                <InputFields
                  required
                  name="agent_id"
                  label="Customer"
                  value={formik.values.agent_id}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  onBlur={formik.handleBlur}
                  options={customers.map((customer) => ({
                    value: customer.id.toString(),
                    label: `${customer.osa_code} - ${customer.business_name}`,
                  }))}
                  loading={loadingCustomers}
                  error={formik.touched.agent_id && formik.errors.agent_id}
                  placeholder="Select Customer"
                />

                {/* Customer Bank Information Display Fields */}
                {formik.values.agent_id && (
                  <>
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium text-gray-700">
                        Customer Bank Name
                      </label>
                      <input
                        type="text"
                        value={selectedCustomerBankInfo.bank_name}
                        disabled
                        className="border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] bg-gray-100 text-gray-600 cursor-not-allowed"
                        placeholder="Customer bank name will appear here"
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-sm font-medium text-gray-700">
                        Customer Account Number
                      </label>
                      <input
                        type="text"
                        value={selectedCustomerBankInfo.account_number}
                        disabled
                        className="border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] bg-gray-100 text-gray-600 cursor-not-allowed"
                        placeholder="Customer account number will appear here"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <InputFields
                  required
                  type="number"
                  name="amount"
                  label="Amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.amount && formik.errors.amount}
                  placeholder="Enter amount"
                />

                <InputFields
                  required
                  type="text"
                  name="recipt_no"
                  label="Receipt Number"
                  value={formik.values.recipt_no}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.recipt_no && formik.errors.recipt_no}
                  placeholder="Enter receipt number"
                />

                <InputFields
                  required
                  type="date"
                  name="recipt_date"
                  label="Receipt Date"
                  value={formik.values.recipt_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.recipt_date && formik.errors.recipt_date}
                />

                {/* Receipt Image Upload */}
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="recipt_image"
                    className="text-sm font-medium text-gray-700"
                  >
                    Receipt Image
                  </label>
                  <input
                    id="recipt_image"
                    type="file"
                    name="recipt_image"
                    onChange={handleFileChange}
                    onBlur={formik.handleBlur}
                    className="border h-[44px] w-full rounded-md px-3 py-1 mt-[6px] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold border-gray-300"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPG, JPEG, PNG, PDF (Max 5MB)
                  </p>
                  {formik.touched.recipt_image && formik.errors.recipt_image && (
                    <span className="text-xs text-red-500">
                      {formik.errors.recipt_image}
                    </span>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Receipt preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Show file name if selected */}
                  {formik.values.recipt_image && !imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Selected file: {formik.values.recipt_image.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <InputFields
                  type="radio"
                  name="status"
                  label="Status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.status && formik.errors.status}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>

              {/* Footer Actions - Moved inside the form with proper spacing */}
              <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-200">
                <button
                  className="px-6 py-2 h-[44px] min-w-[100px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  type="button"
                  onClick={() => router.push("/advancePayment")}
                >
                  Cancel
                </button>

                <SidebarBtn
                  label={formik.isSubmitting ? "Submitting..." : "Submit"}
                  isActive={!formik.isSubmitting}
                  leadingIcon="mdi:check"
                  type="submit"
                  disabled={formik.isSubmitting}
                />
              </div>
            </div>
          </ContainerCard>
        </form>


      )}
    </>
  );
}
