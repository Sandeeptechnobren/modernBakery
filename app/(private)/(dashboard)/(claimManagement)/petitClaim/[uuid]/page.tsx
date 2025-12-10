"use client";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import AutoSuggestion from "@/app/components/autoSuggestion";
import Loading from "@/app/components/Loading";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { createPetitClaim } from "@/app/services/claimManagement";
import { warehouseListGlobalSearch } from "@/app/services/allApi";
import * as yup from "yup";

export default function PetitClaimFormPage() {
  const { warehouseOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const claimId = params?.uuid as string | undefined;
  const isEditMode = claimId !== undefined && claimId !== "add";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    year: String(new Date().getFullYear()),
    month: "January",
    depot: "",
    claimFileName: "",
    fuel_amount: "",
    rent_amount: "",
  });
  const [claimFile, setClaimFile] = useState<File | null>(null);

  const years = [String(new Date().getFullYear() - 1), String(new Date().getFullYear()), String(new Date().getFullYear() + 1)];
  const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
  ];

  const validationSchema = yup.object().shape({
    year: yup.string().required("Year is required"),
    month: yup.string().required("Month is required"),
    depot: yup.string().required("Depot is required"),
    claimFileName: yup.string().required("Claim file is required"),
    fuel_amount: yup
      .string()
      .required("Fuel amount is required")
      .test("is-number", "Fuel amount must be a number", (val) => {
        if (val === undefined || val === null || String(val).trim() === "") return false;
        return !Number.isNaN(Number(String(val).replace(/,/g, "")));
      }),
    rent_amount: yup
      .string()
      .required("Rent amount is required")
      .test("is-number", "Rent amount must be a number", (val) => {
        if (val === undefined || val === null || String(val).trim() === "") return false;
        return !Number.isNaN(Number(String(val).replace(/,/g, "")));
      }),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleWarehouseSearch = async (searchText: string) => {
    try {
      if (!searchText || String(searchText).trim() === "") return [];
      const res = await warehouseListGlobalSearch({ query: searchText, per_page: "10000" });
      if (res?.error) return [];
      const data = Array.isArray(res?.data) ? res.data : [];
      return data.map((w: { id?: string | number; value?: string | number; warehouse_code?: string; code?: string; warehouse_name?: string; name?: string }) => ({
        value: String(w.id ?? w.value ?? ""),
        label: `${w.warehouse_code ?? w.code ?? ""}${w.warehouse_name || w.name ? " - " : ""}${w.warehouse_name ?? w.name ?? ""}`,
      }));
    } catch (e) {
      console.error("warehouse search failed", e);
      return [];
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setClaimFile(f);
    if (f) handleChange("claimFileName", f.name);
    else handleChange("claimFileName", "");
  };

  const handleSubmit = async () => {
    try {
      // Validate the raw form (strings) so empty values fail validation.
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      // prepare form data for multipart upload
      let res;
      if (claimFile) {
        const fd = new FormData();
        fd.append("year", String(form.year));
        fd.append("month_range", String(form.month));
        fd.append("warehouse_id", String(form.depot));
        fd.append("fuel_amount", String(Number(form.fuel_amount || 0)));
        fd.append("rent_amount", String(Number(form.rent_amount || 0)));
        // append file under 'claim_file' (server may expect this key)
        fd.append("claim_file", claimFile, claimFile.name);
        // also append the file name for backward compatibility
        // fd.append("claim_file_name", form.claimFileName || "");

        // Call API to create petit claim with FormData
        res = await createPetitClaim(fd as unknown as object);
      } else {
        const payload = {
          year: form.year,
          month_range: form.month,
          warehouse_id: form.depot,
          fuel_amount: Number(form.fuel_amount || 0),
          rent_amount: Number(form.rent_amount || 0),
          claim_file_name: form.claimFileName || "",
        };
        res = await createPetitClaim(payload);
      }
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to create petit claim", "error");
      } else {
        showSnackbar(res?.message || (isEditMode ? "Petit Claim updated" : "Petit Claim added"), "success");
        router.push("/petitClaim");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Failed to submit petit claim", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/petitClaim">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Add Petit Claims</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <InputFields
                required
                label="Year"
                value={form.year}
                options={years.map((y) => ({ value: y, label: y }))}
                onChange={(e) => handleChange("year", e.target.value)}
                error={errors.year}
              />
            </div>
            <div>
              <InputFields
                required
                label="Month"
                value={form.month}
                options={months.map((m) => ({ value: m, label: m }))}
                onChange={(e) => handleChange("month", e.target.value)}
                error={errors.month}
              />
            </div>

            <div>
              <AutoSuggestion
                required
                label="Distributors"
                name="depot"
                placeholder="Search distributor...."
                initialValue={(() => {
                  const found = (warehouseOptions || []).find((o: { value: string | number; label: string }) => String(o.value) === String(form.depot));
                  return found ? found.label : "";
                })()}
                onSearch={handleWarehouseSearch}
                onSelect={(option: { value: string | number; label: string }) => {
                  const val = option?.value ?? "";
                  handleChange("depot", String(val));
                  if (errors.depot) setErrors(prev => ({ ...prev, depot: "" }));
                }}
                onClear={() => handleChange("depot", "")}
                error={errors.depot}
              />
            </div>

            <div>
              <InputFields
                required
                label="Claim File"
                type="file"
                onChange={(e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>)}
                error={errors.claimFileName}
              />
            </div>
            <div>
              <InputFields
                required
                label="Fuel Amount"
                value={form.fuel_amount}
                type="number"
                onChange={(e) => handleChange("fuel_amount", e.target.value)}
                error={errors.fuel_amount}
              />
            </div>
            <div>
              <InputFields
                required
                label="Rent Amount"
                value={form.rent_amount}
                type="number"
                onChange={(e) => handleChange("rent_amount", e.target.value)}
                error={errors.rent_amount}
              />
            </div>
          </div>


        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6 pr-0">
        <button
          type="button"
          className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${submitting
            ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
            : "border-gray-300"
            }`}
          onClick={() => router.push("/petitClaim")}
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
