"use client";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getDiscountTypeById, updateDiscountType } from "@/app/services/allApi";



export default function EditDiscounttype() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const params = useParams();
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";
  const [discountName, setDiscountName] = useState("");
  const [discountStatus, setDiscountStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [fetched, setFetched] = useState<null | {
    discount_name?: string;
    discount_status?: number | string;
  }>(null);

  useEffect(() => {
    if (!queryId) return;
    let mounted = true;
    (async () => {
        try {
        const res = await getDiscountTypeById(String(queryId));
        const data = res?.data ?? res;
        if (!mounted) return;
        
        setFetched({
          discount_name: data?.discount_name,
          discount_status: data?.discount_status,
        });
        
        // Set individual state values
        setDiscountName(data?.discount_name || "");
        setDiscountStatus(data?.discount_status ? String(data?.status) : "");
        
      } catch (err: unknown) {
        console.error("Failed to fetch Discount Type by id", err);
      } finally {
      }
    })();
    return () => { mounted = false; };
  }, [queryId]);

  const clearErrors = () => setErrors({});

  const handleSubmit = async () => {
    if (!queryId) return;
    clearErrors();
    
    type UpdateDiscountTypePayload = {
      discount_name?: string;
      discount_status?: number | undefined;
    };

    const payload: UpdateDiscountTypePayload = {
      discount_name: discountName,
      discount_status: discountStatus ? (status === "active" ? 1 : status === "inactive" ? 0 : Number(status)) : undefined,
    };

    try {
      setSubmitting(true);
      await updateDiscountType(String(queryId), payload);
      showSnackbar("Discount Type updated successfully", "success");
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
        showSnackbar("Failed to update Discount Type", "error");
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
            Edit Discount Type
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
                  onChange={(e) => setDiscountName(e.target.value)}
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
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "In Active" },
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
            label={submitting ? "Updating..." : "Update"}
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