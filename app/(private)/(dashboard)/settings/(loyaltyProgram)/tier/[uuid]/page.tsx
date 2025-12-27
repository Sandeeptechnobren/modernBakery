"use client";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import {createTier,getTierDetails,updateTier} from "@/app/services/settingsAPI";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";

export default function AddEditTier() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const routeId = params.uuid as string | undefined;
  const isEditMode = routeId !== undefined && routeId !== "add";
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tierName: "",
    tierPeriod: "",
    min: "",
    max: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isEditMode && routeId) {
      setLoading(true);
      (async () => {
        try {
          const res = await getTierDetails(String(routeId));
          const data = res?.data ?? res;
          setForm({
            tierName: data?.name,
            tierPeriod: data?.period,
            min: data?.minpurchase,
            max: data?.maxpurchase,
          });

       
        } catch (err) {
          showSnackbar("Failed to fetch route details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, routeId]);

  // Validation schema
  const validationSchema = yup.object().shape({
    tierName: yup
      .string()
      .required("Tier Name is required"),

    tierPeriod: yup.string().required("Purchase Period is required"),
    min: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Purchase Volume Min must be a number")
      .required("Purchase Volumne Min is required")
      .min(0, "You cannot write negative value"),
    max: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Purchase Volume Max must be a number")
      .required("Purchae Volume Max is required")
      .min(0, "You cannot write negative value"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "min" || field === "max") {
      if (value === "") {
        setErrors((prev) => ({ ...prev, [field]: "" }));
        return;
      }
      const num = Number(value);
      if (!isNaN(num) && num < 0) {
        setErrors((prev) => ({ ...prev, [field]: "You cannot write negative value" }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const payload = {
        name: form.tierName,
        period: form.tierPeriod,
        minpurchase: form.min,
        maxpurchase: form.max,
      };

      let res;
      if (isEditMode && routeId) {
        res = await updateTier(routeId, payload);
      } else {
        res = await createTier(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Tier updated successfully" : "Tier added successfully",
          "success"
        );
        router.push("/settings/tier");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        // showSnackbar("Please fix validation errors before submitting", "error");
      } else {
        showSnackbar(
          isEditMode ? "Failed to update route" : "Failed to add route",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if ((isEditMode && loading)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/settings/tier">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Tier" : "Add Tier"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Tier Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           


            {/* Route Name */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Tier Name"
                value={form.tierName}
                onChange={(e) => handleChange("tierName", e.target.value)}
              />
              {errors.tierName && (
                <p className="text-red-500 text-sm mt-1">{errors.tierName}</p>
              )}
            </div>

            {/* Route Type */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Purchase Period"
                value={form.tierPeriod}
                onChange={(e) => handleChange("tierPeriod", e.target.value)}
                options={[
                  { value: "1", label: "Monthly" },
                  { value: "2", label: "Quarterly" },
                  { value: "3", label: "Half Yearly" },
                  { value: "4", label: "Yearly" },
                ]}
              />
              {errors.tierPeriod && (
                <p className="text-red-500 text-sm mt-1">{errors.tierPeriod}</p>
              )}
            </div>

            {/* Warehouse */}
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Purchase Volume Min"
                value={form.min}
                onChange={(e) => {
                  handleChange("min", e.target.value);
                }}
              />
              {errors.min && (
                <p className="text-red-500 text-sm mt-1">{errors.min}</p>
              )}
            </div>
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Purchase Volume Max"
                value={form.max}
                onChange={(e) => {
                  handleChange("max", e.target.value);
                }}
              />
              {errors.max && (
                <p className="text-red-500 text-sm mt-1">{errors.max}</p>
              )}
            </div>
          </div>
        </div>
      </div>

   

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6 pr-0">
        <button
          type="button"
          className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${submitting
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : "border-gray-300"
            }`}
          onClick={() => router.push("/settings/tier")}
          disabled={submitting}
        // disable while submitting
        >
          Cancel
        </button>
        <SidebarBtn
          label={
            submitting
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
                ? "Update"
                : "Submit"
          }
          isActive={!submitting}
          leadingIcon="mdi:check"
          onClick={handleSubmit}
          disabled={submitting}
        />
      </div>
    </>
  );
}
