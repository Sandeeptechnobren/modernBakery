"use client";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import IconButton from "@/app/components/iconButton";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import SettingPopUp from "@/app/components/settingPopUp";
import { genearateCode, saveFinalCode } from "@/app/services/allApi";
import { addBulkTransfer } from "@/app/services/assetsApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as yup from "yup";

export default function AddRoute() {
  const { regionOptions, warehouseAllOptions, areaOptions, assetsModelOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filteredOptions, setFilteredRouteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [form, setForm] = useState({
    osa_code: "",
    region_id: "",
    area_id: "",
    warehouse_id: "",
    model_id: "",
    requestes_asset: "",
    available_stock: "",
    status: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skeleton, setSkeleton] = useState(false);
  const codeGeneratedRef = useRef(false);

  // Auto generate code
  useEffect(() => {
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          const res = await genearateCode({ model_name: "bulk_tran" });
          if (res?.code) setForm((prev) => ({ ...prev, osa_code: res.code }));
          if (res?.prefix) setPrefix(res.prefix);
        } catch (e) {
          console.error("Code generation failed", e);
        }
      })();
    }
  }, []);

  // Validation schema
  const validationSchema = yup.object().shape({
    osa_code: yup.string().required("Route Code is required"),
    region_id: yup.string().required("Region is required"),
    area_id: yup.string().required("Area is required"),
    warehouse_id: yup.string().required("Warehouse is required"),
    model_id: yup.string().required("Model Number is required"),
    available_stock: yup.string().required("Available Stock is required"),
    requestes_asset: yup.string().required("Requested Asset is required"),
    status: yup.string().required("Status is required"),
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const payload = {
        osa_code: form.osa_code,
        region_id: form.region_id,
        area_id: form.area_id,
        warehouse_id: form.warehouse_id,
        model_id: form.model_id,
        requestes_asset: form.requestes_asset,
        available_stock: form.available_stock,
        status: Number(form.status),
      };

      const res = await addBulkTransfer(payload);

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        await saveFinalCode({
          reserved_code: form.osa_code,
          model_name: "bulk_tran",
        });

        showSnackbar("Bulk Transfer added successfully", "success");
        router.push("/chillerInstallation/bulkTransfer");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Failed to add bulk transfer", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !warehouseAllOptions || !regionOptions) {
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
          <Link href="/chillerInstallation/bulkTransfer">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Add Bulk Transfer</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Bulk Transfer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Route Code */}
            <div className="flex items-start gap-2 max-w-[406px]">
              <InputFields
                required
                label="OSA Code"
                value={form.osa_code}
                onChange={(e) => handleChange("osa_code", e.target.value)}
                disabled={codeMode === "auto"}
              />
            </div>

            {/* Route Name */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Region"
                value={form.region_id}
                options={regionOptions}
                onChange={(e) => handleChange("region_id", e.target.value)}
              />
              {errors.region_id && (
                <p className="text-red-500 text-sm mt-1">{errors.region_id}</p>
              )}
            </div>

            {/* Route Type */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Area"
                value={form.area_id}
                onChange={(e) => handleChange("area_id", e.target.value)}
                options={areaOptions}
              />
              {errors.area_id && (
                <p className="text-red-500 text-sm mt-1">{errors.area_id}</p>
              )}
            </div>

            {/* Warehouse */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Distributor"
                searchable
                value={form.warehouse_id}
                options={warehouseAllOptions}
                onChange={(e) => handleChange("warehouse_id", e.target.value)}
              />
              {errors.warehouse_id && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse_id}</p>
              )}
            </div>

            <div className="flex flex-col">
              <InputFields
                required
                label="Model Number"
                searchable
                value={form.model_id}
                options={assetsModelOptions}
                onChange={(e) => handleChange("model_id", e.target.value)}
              />
              {errors.model_id && (
                <p className="text-red-500 text-sm mt-1">{errors.model_id}</p>
              )}
            </div>

            <div className="flex flex-col">
              <InputFields
                required
                label="Available Stock"
                searchable
                value={form.available_stock}
                onChange={(e) => handleChange("available_stock", e.target.value)}
              />
              {errors.available_stock && (
                <p className="text-red-500 text-sm mt-1">{errors.available_stock}</p>
              )}
            </div>

            <div className="flex flex-col">
              <InputFields
                required
                label="Requested Chiller"
                searchable
                value={form.requestes_asset}
                onChange={(e) => handleChange("requestes_asset", e.target.value)}
              />
              {errors.requestes_asset && (
                <p className="text-red-500 text-sm mt-1">{errors.requestes_asset}</p>
              )}
            </div>

            <div className="flex flex-col">
              <InputFields
                required
                label="Status"
                type="radio"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={[
                  { value: "1", label: "Active" },
                  { value: "0", label: "Inactive" },
                ]}
              />
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6 pr-0">
        <button
          type="button"
          className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${
            submitting
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : "border-gray-300"
          }`}
          onClick={() => router.push("/chillerInstallation/bulkTransfer")}
          disabled={submitting}
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
    </>
  );
}
