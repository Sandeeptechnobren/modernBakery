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
import {
  getbankDetailbyId,
  updateBankbyId,
  createBank,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface BankFormValues {
  osa_code: string;
  bank_name: string;
  branch: string;
  city: string;
  account_number: string;
  status: string; // "active" | "inactive"
}

export default function AddBankPage() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const codeGeneratedRef = useRef(false);

  // ✅ Formik setup
  const formik = useFormik<BankFormValues>({
    initialValues: {
      osa_code: "",
      bank_name: "",
      branch: "",
      city: "",
      account_number: "",
      status: "active",
    },
    validationSchema: Yup.object({
      osa_code: Yup.string().required("OSA Code is required"),
      bank_name: Yup.string().required("Bank Name is required"),
      branch: Yup.string().required("Branch is required"),
      city: Yup.string().required("City is required"),
      account_number: Yup.string()
        .required("Account Number is required")
        .matches(/^\d+$/, "Account Number must contain only numbers")
        .min(5, "Account Number must be at least 5 digits")
        .max(20, "Account Number must not exceed 20 digits"),
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          osa_code: values.osa_code,
          bank_name: values.bank_name,
          branch: values.branch,
          city: values.city,
          account_number: Number(values.account_number),
          status: values.status === "active" ? 1 : 0,
        };

        console.log("Submitting payload:", payload);

        let res;
        if (isEditMode && params?.id && params.id !== "add") {
          // Update existing bank - body first, then uuid
          res = await updateBankbyId(payload, String(params.id));
        } else {
          // Create new bank - body only (uuid is optional for create)
          res = await createBank(payload);
        }

        console.log("API Response:", res);

        // ✅ FIXED: Handle both response structures
        const isSuccess =
          res?.success === true || // For create API
          res?.status === "success" || // For update API
          res?.code === 200; // Additional success check

        if (isSuccess) {
          const successMessage =
            res?.message ||
            (isEditMode
              ? "Bank Updated Successfully"
              : "Bank Created Successfully");

          console.log("Showing success message:", successMessage);
          showSnackbar(successMessage, "success");

          // ✅ FIXED: Redirect after successful submission
          setTimeout(() => {
            router.push("/settings/bank");
          }, 1500); // 1.5 second delay to see the success message
        } else {
          const errorMessage = res?.message || "Failed to submit form";
          console.log("Showing error message:", errorMessage);
          showSnackbar(errorMessage, "error");
        }
      } catch (error) {
        console.error("Submission error:", error);
        showSnackbar("Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ✅ Load existing data for edit mode and generate code in add mode
  useEffect(() => {
    if (params?.id && params.id !== "add") {
      setIsEditMode(true);
      setLoading(true);
      (async () => {
        try {
          const res = await getbankDetailbyId(String(params.id));
          if (res?.data) {
            formik.setValues({
              osa_code: res.data.osa_code || "",
              bank_name: res.data.bank_name || "",
              branch: res.data.branch || "",
              city: res.data.city || "",
              account_number: res.data.account_number?.toString() || "",
              status: res.data.status === 1 ? "active" : "inactive",
            });
          } else {
            showSnackbar("Failed to load bank data", "error");
          }
        } catch (error) {
          console.error("Failed to fetch Bank details", error);
          showSnackbar("Failed to load bank data", "error");
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      // Generate OSA code for new entries
      (async () => {
        try {
          // TODO: Uncomment and implement code generation
          // const res = await genearateCode({ model_name: "banks" });
          // if (res?.code) {
          //   formik.setFieldValue("osa_code", res.code);
          // }

          // Mock code generation for now
          const mockCode = `BNK${Date.now().toString().slice(-4)}`;
          formik.setFieldValue("osa_code", mockCode);
        } catch (error) {
          console.error("Failed to generate OSA code", error);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/settings/bank">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            {isEditMode ? "Edit Bank" : "Add Bank"}
          </h1>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* OSA Code */}
              <InputFields
                label="OSA Code"
                name="osa_code"
                disabled={true}
                value={formik.values.osa_code}
                onChange={formik.handleChange}
                error={formik.touched.osa_code && formik.errors.osa_code}
              />

              {/* Bank Name */}
              <InputFields
                type="text"
                name="bank_name"
                label="Bank Name"
                value={formik.values.bank_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.bank_name && formik.errors.bank_name}
                placeholder="Enter bank name"
              />

              {/* Branch */}
              <InputFields
                type="text"
                name="branch"
                label="Branch"
                value={formik.values.branch}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.branch && formik.errors.branch}
                placeholder="Enter branch name"
              />

              {/* City */}
              <InputFields
                type="text"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && formik.errors.city}
                placeholder="Enter city"
              />

              {/* Account Number */}
              <InputFields
                type="text"
                name="account_number"
                label="Account Number"
                value={formik.values.account_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.account_number && formik.errors.account_number
                }
                placeholder="Enter account number"
              />

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
              onClick={() => router.push("/settings/bank")}
            >
              Cancel
            </button>

            <SidebarBtn
              label={isEditMode ? (formik.isSubmitting?"Updating...":"Update") : (formik.isSubmitting?"Submitting":"Submit")}
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
