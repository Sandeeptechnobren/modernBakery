"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as yup from "yup";
import { createDiscountType } from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";

export default function CreateDiscountType() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [discountName, setDiscountname] = useState("");
  const [discountStatus, setDiscountStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const clearErrors = () => setErrors({});


  const validationSchema = yup.object().shape({
    discount_name: yup.string().required("Discount name is required").max(100),
    discount_status: yup.string().required("Status is required").oneOf(["0","1","active", "inactive"], "Invalid status"),
  });

  const handleSubmit = async () => {
    clearErrors();
    try {
      await validationSchema.validate({
        discount_name: discountName,
        discount_status: discountStatus,
      }, { abortEarly: false });

      type CreateDiscountTypePayload = {
        discount_name?: string;
        discount_status?: number | undefined;
      };

      const payload: CreateDiscountTypePayload = {
        discount_name: discountName,
        discount_status: discountStatus
          ? (discountStatus === "active" || discountStatus === "1"
              ? 1
              : discountStatus === "inactive" || discountStatus === "0"
              ? 0
              : Number(discountStatus))
          : undefined,
      };

      setSubmitting(true);
      await createDiscountType(payload);
      showSnackbar("Discount Type added successfully ", "success");
      router.push("/dashboard/settings/customer/discountType");
      setSubmitting(false);
    } catch (err: unknown) {
      setSubmitting(false);
      if (err instanceof yup.ValidationError && Array.isArray(err.inner)) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Failed to submit form", "error");
        console.error(err);
      }
    }
  };


  return (
    <>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings/customer/discountType">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Discount Type
          </h1>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">

          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Discount Type Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <InputFields 
required
                  label="Discount Name"
                  value={discountName}
                  onChange={(e) => setDiscountname(e.target.value)}
                />
                {errors.discount_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount_name}</p>
                )}
              </div>
              <div>
                <InputFields 
required
                  label="Status"
                  value={discountStatus}
                  onChange={(e) => setDiscountStatus(e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "In Active" },
                  ]}
                />
                {errors.discount_status && (
                  <p className="text-red-500 text-sm mt-1">{errors.discount_status}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6  pr-0">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <SidebarBtn
            label={submitting ? "Submitting..." : "Submit"}
            isActive={!submitting}
            leadingIcon="mdi:check"
            onClick={handleSubmit}
            disabled={submitting}
          />
        </div>
      </div>

    </>
  );
}