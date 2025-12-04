"use client";
import AutoSuggestion, { Option } from "@/app/components/autoSuggestion";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import {createBonus,getTierDetails,updateTier} from "@/app/services/settingsAPI";
import { itemGlobalSearch } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";

interface ItemOption {
  id?: string | number;
  erp_code?: string;
  item_code?: string;
  code?: string;
  name?: string;
}
export default function AddEditTier() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const routeId = params?.uuid as string | undefined;
  const isEditMode = routeId !== undefined && routeId !== "add";
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    item: "",
    rewardBasis: "",
    thresholdValue: "",
    rewardPoints: "",
  });

  // keep the selected option (label + value) for AutoSuggestion so the input
  // can show the human-friendly label while `form.item` stores the id
  const [selectedItemOption, setSelectedItemOption] = useState<Option | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isEditMode && routeId) {
      setLoading(true);
      (async () => {
        try {
          const res = await getTierDetails(String(routeId));
          const data = res?.data ?? res;
          // store the item id in form.item and also set the selected option
          const itemId = data?.item_id ?? data?.itemId ?? data?.id ?? "";
          const labelParts = [];
          if (data?.erp_code) labelParts.push(data.erp_code);
          else if (data?.item_code) labelParts.push(data.item_code);
          else if (data?.code) labelParts.push(data.code);
          if (data?.name) labelParts.push(data.name);
          const itemLabel = labelParts.join(" - ") || (data?.name ?? "");

          setForm({
            item: itemId ? String(itemId) : "",
            rewardBasis: data?.period,
            thresholdValue: data?.minpurchase,
            rewardPoints: data?.maxpurchase,
          });
          setSelectedItemOption(itemId ? { value: String(itemId), label: itemLabel } : null);

       
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
    item: yup
      .string()
      .required("Item is required"),

    rewardBasis: yup.string().required("Reward Basis is required"),
    thresholdValue: yup
      .number()
      .transform((value, originalValue) => {
        // treat empty string as undefined so required() triggers
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Threshold Value must be a number")
      .required("Threshold Value is required")
      .min(0, "You cannot write negative value"),
    rewardPoints: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Reward Points must be a number")
      .required("Reward Point is required")
      .min(0, "You cannot write negative value"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear existing error for this field
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    // Live validation: prevent negative values being entered for number fields
    if (field === "thresholdValue" || field === "rewardPoints") {
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

  const fetchItems = async (searchTerm: string) => {
    try {
      const res = await itemGlobalSearch({ per_page: "10", query: searchTerm });
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to fetch items", "error");
        return [];
      }
      const data = res?.data || [];
      const options = data.map((item: ItemOption) => ({
        value: String(item.id),
        label: (item.erp_code ?? item.item_code ?? item.code ?? "") + (item.name ? ` - ${item.name}` : ""),
      }));
      return options;
    } catch (err) {
      showSnackbar("Failed to fetch items", "error");
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const payload = {
        item_id: Number(form.item),
        reward_basis: form.rewardBasis,
        volume: Number(form.thresholdValue),
        bonus_points: Number(form.rewardPoints),
      };

      let res;
      if (isEditMode && routeId) {
        res = await updateTier(routeId, payload);
      } else {
        res = await createBonus(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Bonus Points updated successfully" : "Bonus Points added successfully",
          "success"
        );
        router.push("/settings/bonusPoints");
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
          <Link href="/settings/bonusPoints">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Bonus Points" : "Add Bonus Points"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Bonus Points Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           


            {/* Route Name */}
            <div className="flex flex-col">
              <AutoSuggestion
                required
                label="Item"
                placeholder="Search item"
                onSearch={(q) => fetchItems(q)}
                // show the human-friendly label via selectedOption; keep id in form.item
                selectedOption={selectedItemOption}
                onSelect={(opt) => {
                  // store id and remember label for display
                  setForm(prev => ({ ...prev, item: String(opt.value) }));
                  setSelectedItemOption(opt);
                }}
                onClear={() => {
                  setForm(prev => ({ ...prev, item: "" }));
                  setSelectedItemOption(null);
                }}
                className="w-full"
              />
              {errors.item && (
                <p className="text-red-500 text-sm mt-1">{errors.item}</p>
              )}
            </div>

            {/* Route Type */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Reward Basis"
                value={form.rewardBasis}
                onChange={(e) => handleChange("rewardBasis", e.target.value)}
                options={[
                  { value: "1", label: "Quantity" },
                  { value: "2", label: "Amount" },
                ]}
              />
              {errors.rewardBasis && (
                <p className="text-red-500 text-sm mt-1">{errors.rewardBasis}</p>
              )}
            </div>

            {/* Warehouse */}
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Threshold Value"
                value={form.thresholdValue}
                onChange={(e) => {
                  handleChange("thresholdValue", e.target.value);
                }}
                error={(errors.thresholdValue)}
              />
              
            </div>
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Reward Points"
                value={form.rewardPoints}
                onChange={(e) => {
                  handleChange("rewardPoints", e.target.value);
                }}
                error={(errors.rewardPoints)}
              />
              {/* {errors.rewardPoints && (
                <p className="text-red-500 text-sm mt-1">{errors.rewardPoints}</p>
              )} */}
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
          onClick={() => router.push("/settings/bonusPoints")}
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
