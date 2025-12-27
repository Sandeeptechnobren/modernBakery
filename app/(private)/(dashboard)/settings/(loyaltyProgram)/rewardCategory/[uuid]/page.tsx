"use client";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import { createRewardCategory,getRewardDetails ,updateReward} from "@/app/services/settingsAPI";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";

export default function AddEditRewardCategory() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const routeId = params.uuid as string | undefined;
  const isEditMode = routeId !== undefined && routeId !== "add";
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rewardName: "",
    rewardImage: null as File | string | null,
    points: "",
    stockQty: "",
    giftType: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isEditMode && routeId) {
      setLoading(true);
      (async () => {
        try {
          const res = await getRewardDetails(String(routeId));
          const data = res?.data ?? res;
          setForm({
            rewardName: data?.name || "",
            rewardImage: data?.image,
            points: data?.points_required,
            stockQty: data?.stock_qty,
            giftType: data?.type,
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
    rewardName: yup
      .string()
      .required("Reward Name is required"),
    // can be a File or existing string path
    rewardImage: yup.mixed().required("Image is required"),
    points: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Points must be a number")
      .required("Points is required")
      .min(0, "You cannot write negative value"),
    stockQty: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Stock Qty must be a number")
      .required("Stock Qty is required")
      .min(0, "You cannot write negative value"),
    giftType: yup.string().required("Gift Type is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear existing error for this field
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    // Live validation: prevent negative values being entered for number fields
    if (field === "points" || field === "stockQty") {
      // allow empty value (will be caught by required on submit)
      if (value === "") {
        setErrors((prev) => ({ ...prev, [field]: "" }));
        return;
      }
      const num = Number(value);
      if (!isNaN(num) && num < 0) {
        setErrors((prev) => ({ ...prev, [field]: "You cannot write negative value" }));
      } else {
        // clear negative error if fixed
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  // special handler to accept File from file input
  const handleFileChange = (field: string, file: File | null) => {
    setForm((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      // Build FormData to send multipart/form-data (backend expects form-data)
      const formData = new FormData();
      formData.append("name", String(form.rewardName ?? ""));
      formData.append("points_required", String(form.points ?? ""));
      formData.append("stock_qty", String(form.stockQty ?? ""));
      formData.append("type", String(form.giftType ?? ""));
      // If user selected a file, append the File; if there's an existing string path, append that
      if (form.rewardImage instanceof File) {
        formData.append("image", form.rewardImage);
      } else if (typeof form.rewardImage === "string" && form.rewardImage !== "") {
        // append existing image path/name so backend can keep it if no new file uploaded
        formData.append("image", form.rewardImage);
      }

      let res;
      if (isEditMode && routeId) {
        res = await updateReward(routeId, formData);
      } else {
        res = await createRewardCategory(formData);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Reward & Benefits updated successfully" : "Reward & Benefits added successfully",
          "success"
        );
        router.push("/settings/rewardCategory");
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
          <Link href="/settings/rewardCategory">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Reward & Benefits" : "Add Reward & Benefits"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Reward & Benefits Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           


            {/* Route Name */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Reward Name"
                value={form.rewardName}
                onChange={(e) => handleChange("rewardName", e.target.value)}
              />
              {errors.rewardName && (
                <p className="text-red-500 text-sm mt-1">{errors.rewardName}</p>
              )}
            </div>

            {/* Route Type */}
            <div className="flex flex-col">
              <InputFields
                required
                type="file"
                label="Image"
                // InputFields expects a string value for non-file display; when a File is selected we pass undefined
                value={typeof form.rewardImage === 'string' ? form.rewardImage : undefined}
                onChange={(e) => handleFileChange("rewardImage", (e.target as HTMLInputElement).files?.[0] ?? null)}
              />
              {errors.rewardImage && (
                <p className="text-red-500 text-sm mt-1">{errors.rewardImage}</p>
              )}
            </div>

            {/* Warehouse */}
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Points Rquired"
                value={form.points}
                onChange={(e) => {
                  handleChange("points", e.target.value);
                }}
              />
              {errors.points && (
                <p className="text-red-500 text-sm mt-1">{errors.points}</p>
              )}
            </div>
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Stock Qty"
                value={form.stockQty}
                onChange={(e) => {
                  handleChange("stockQty", e.target.value);
                }}
              />
              {errors.stockQty && (
                <p className="text-red-500 text-sm mt-1">{errors.stockQty}</p>
              )}
            </div>
            <div className="flex flex-col">
              <InputFields
                required
                label="Gift Type"
                value={form.giftType}
                onChange={(e) => {
                  handleChange("giftType", e.target.value);
                }}
              />
              {errors.giftType && (
                <p className="text-red-500 text-sm mt-1">{errors.giftType}</p>
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
          onClick={() => router.push("/settings/rewardCategory")}
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
