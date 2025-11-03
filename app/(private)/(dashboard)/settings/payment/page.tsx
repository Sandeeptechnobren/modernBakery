"use client";

import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/app/components/Loading";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  getbankList,
  addPayment,
  getCompanyCustomers,
} from "@/app/services/allApi";

// Proper dummy API functions with correct response structures
const getPaymentById = async (uuid: string) => {
  console.log("Fetching payment:", uuid);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    success: true,
    message: "Payment fetched successfully",
    data: {
      id: 1,
      uuid: "pay-12345",
      osa_code: "PAY001",
      payment_type: 2, // 2 for cheque
      companybank_id: "bank-1",
      cheque_no: "CHQ123456",
      cheque_date: "2024-01-15",
      agent_id: "1", // Using customer ID as agent_id
      amount: 5000.0,
      recipt_no: "RCPT78901",
      recipt_date: "2024-01-16",
      recipt_image: null,
      status: 1,
    },
  };
};

const updatePaymentById = async (payload: any, uuid: string) => {
  console.log("Updating payment:", { payload, uuid });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    status: "success",
    code: 200,
    message: "Payment updated successfully",
    data: { ...payload, uuid },
  };
};

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
  customer_code: string;
  business_name: string;
  customer_type: string;
  owner_name: string;
  owner_no: string;
  email: string;
  status: number;
}

interface ApiResponse {
  success?: boolean;
  status?: string;
  code?: number;
  message?: string;
  data?: any;
}

export default function AddPaymentPage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const codeGeneratedRef = useRef(false);

  // Fetch banks list from API
  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const res = await getbankList();

      console.log("Banks API Response:", res);

      // Handle both response structures
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

      // Handle both response structures
      if (res?.success === true || res?.status === "success") {
        const customersData = Array.isArray(res.data) ? res.data : [];
        setCustomers(customersData);

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
    agent_id: Yup.string().when("payment_type", {
      is: "transfer",
      then: (schema) => schema.required("Customer is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    amount: Yup.string()
      .required("Amount is required")
      .matches(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
    recipt_no: Yup.string().required("Receipt number is required"),
    recipt_date: Yup.string().required("Receipt date is required"),
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
        // Map payment type to numeric values
        const paymentTypeMap: { [key: string]: number } = {
          cash: 1,
          cheque: 2,
          transfer: 3,
        };

        // Base payload for all payment types
        const basePayload: any = {
          payment_type: paymentTypeMap[values.payment_type],
          companybank_id: values.companybank_id,
          amount: Number(values.amount),
          recipt_no: values.recipt_no,
          recipt_image: null,
          recipt_date: values.recipt_date,
          osa_code: values.osa_code,
          status: values.status === "active" ? 1 : 0,
        };

        // Add conditional fields based on payment type
        if (values.payment_type === "cheque") {
          basePayload.cheque_no = values.cheque_no;
          basePayload.cheque_date = values.cheque_date;
        }

        if (values.payment_type === "transfer") {
          basePayload.agent_id = Number(values.agent_id);
        }

        // Handle file upload if receipt image is selected
        if (values.recipt_image) {
          basePayload.recipt_image = values.recipt_image;
        }

        console.log("Submitting payload:", basePayload);

        let res: ApiResponse;
        if (isEditMode && params?.id && params.id !== "add") {
          res = await updatePaymentById(JSON.stringify(basePayload), String(params.id));
        } else {
          res = await addPayment(basePayload);
        }

        console.log("API Response:", res);

        // Handle both response structures
        const isSuccess =
          res?.success === true ||
          res?.status === "success" ||
          res?.code === 200;

        if (isSuccess) {
          showSnackbar(
            res?.message ||
              (isEditMode
                ? "Payment Updated Successfully"
                : "Payment Created Successfully"),
            "success"
          );
          setTimeout(() => {
            router.push("/settings/payment");
          }, 1500);
        } else {
          showSnackbar(res?.message || "Failed to submit form", "error");
        }
      } catch (error) {
        console.error("Submission error:", error);
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle bank selection
  const handleBankChange = (bankId: string) => {
    formik.setFieldValue("companybank_id", bankId);
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    formik.setFieldValue("recipt_image", file);
  };

  // Load existing data for edit mode and generate code in add mode
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getPaymentById(String(params.id));
          if (res?.data) {
            const data = res.data;

            // Map numeric payment type back to string
            const paymentTypeMap: { [key: number]: string } = {
              1: "cash",
              2: "cheque",
              3: "transfer",
            };

            formik.setValues({
              osa_code: data.osa_code || "",
              payment_type: paymentTypeMap[data.payment_type] || "",
              companybank_id: data.companybank_id || "",
              cheque_no: data.cheque_no || "",
              cheque_date: data.cheque_date || "",
              agent_id: data.agent_id || "",
              amount: data.amount?.toString() || "",
              recipt_no: data.recipt_no || "",
              recipt_date: data.recipt_date || "",
              recipt_image: data.recipt_image || null,
              status: data.status === 1 ? "active" : "inactive",
            });
          } else {
            showSnackbar("Failed to load payment data", "error");
          }
        } catch (error) {
          console.error("Failed to fetch Payment details", error);
          showSnackbar("Failed to load payment data", "error");
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      // Generate OSA code for new entries
      (async () => {
        try {
          const mockCode = `PAY${Date.now().toString().slice(-4)}`;
          formik.setFieldValue("osa_code", mockCode);
        } catch (error) {
          console.error("Failed to generate OSA code", error);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

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
          <Link href="/settings/payment">
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
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Payment Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* OSA Code */}
              <InputFields
                label="OSA Code"
                name="osa_code"
                value={formik.values.osa_code}
                onChange={formik.handleChange}
                disabled={isEditMode}
                error={formik.touched.osa_code && formik.errors.osa_code}
              />

              {/* Payment Type */}
              <InputFields
                type="radio"
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
                  type="select"
                  name="companybank_id"
                  label="Bank"
                  value={formik.values.companybank_id}
                  onChange={(e) => handleBankChange(e.target.value)}
                  onBlur={formik.handleBlur}
                  options={banks.map((bank) => ({
                    value: bank.id,
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

              {/* Cheque Number - Only for cheque payments */}
              {formik.values.payment_type === "cheque" && (
                <InputFields
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

              {/* Customer Selection - Only for transfer payments */}
              {formik.values.payment_type === "transfer" && (
                <InputFields
                  type="select"
                  name="agent_id"
                  label="Customer"
                  value={formik.values.agent_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  options={customers.map((customer) => ({
                    value: customer.id.toString(),
                    label: `${customer.business_name} (${customer.customer_code}) - ${customer.owner_name}`,
                  }))}
                  loading={loadingCustomers}
                  error={formik.touched.agent_id && formik.errors.agent_id}
                  placeholder="Select Customer"
                />
              )}

              {/* Common Fields */}
              <InputFields
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
                type="date"
                name="recipt_date"
                label="Receipt Date"
                value={formik.values.recipt_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.recipt_date && formik.errors.recipt_date}
              />

              {/* Receipt Image Upload - Separate input for better file handling */}
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
                  accept="image/*,.pdf,.doc,.docx"
                />
                {formik.touched.recipt_image &&
                  typeof formik.errors.recipt_image === "string" && (
                    <span className="text-xs text-red-500">
                      {formik.errors.recipt_image}
                    </span>
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
          </ContainerCard>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
              type="button"
              onClick={() => router.push("/settings/payment")}
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
        </form>
      )}
    </>
  );
}
