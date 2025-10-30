"use client";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import IconButton from "@/app/components/iconButton";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  getRouteById,
  addRoutes,
  updateRoute,
  genearateCode,
  saveFinalCode,
  vehicleListData,
} from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useLoading } from "@/app/services/loadingContext";
import ContainerCard from "@/app/components/containerCard";
import { salesmanLoadHeaderAdd, salesmanLoadHeaderUpdate } from "@/app/services/agentTransaction";

export default function AddEditSalesmanLoad() {
  const { salesmanTypeOptions, warehouseOptions } = useAllDropdownListData();
  const salesmanTypeOptionWithProject = salesmanTypeOptions.slice();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  const isEditMode = loadUUID !== undefined && loadUUID !== "add";

  const [submitting, setSubmitting] = useState(false);
  const [filteredOptions, setFilteredRouteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [form, setForm] = useState({
    salesmanType: "",
    depot: "",
    project: "",
    salesman: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skeleton, setSkeleton] = useState(false);

  // Fetch route details in edit mode
  useEffect(() => {
    if (isEditMode && loadUUID) {
      setLoading(true);
      (async () => {
        try {
          const res = await getRouteById(String(loadUUID));
          const data = res?.data ?? res;
          setForm({
            salesmanType: data?.salesmanType || "",
            depot: data?.depot || "",
            project: data?.project || "",
            salesman: data?.salesman || "",
          });
        } catch (err) {
          showSnackbar("Failed to fetch route details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, loadUUID]);

  // Validation schema
  const validationSchema = yup.object().shape({
    sdfsd: yup.string().required("Route Code is required"),
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
        salesmanType: form.salesmanType,
        depot: form.depot,
        project: form.project,
        salesman: form.salesman,
      };

      let res;
      if (isEditMode && loadUUID) {
        res = await salesmanLoadHeaderUpdate(loadUUID, form);
      } else {
        res = await salesmanLoadHeaderAdd(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Route updated successfully" : "Route added successfully",
          "success"
        );
        router.push("/salesmanLoad");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
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

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/salesmanLoad">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Salesman Load" : "Add Salesman Load"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <ContainerCard>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Salesman Load Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <InputFields
                required
                label="Salesman Type"
                value={form.salesmanType}
                options={salesmanTypeOptions}
                onChange={(e) => handleChange("salesmanType", e.target.value)}
              />
              {errors.salesmanType && (
                <p className="text-red-500 text-sm mt-1">{errors.salesmanType}</p>
              )}
            </div>

            { form.salesmanType !== "-1" ? <div className="flex flex-col">
              <InputFields
                required
                label="Depot"
                value={form.depot}
                onChange={(e) => handleChange("depot", e.target.value)}
                options={warehouseOptions}
              />
              {errors.depot && (
                <p className="text-red-500 text-sm mt-1">{errors.depot}</p>
              )}
            </div> : <div className="flex flex-col">
              <InputFields
                required
                label="Depot"
                value={form.depot}
                onChange={(e) => handleChange("depot", e.target.value)}
                options={warehouseOptions}
              />
              {errors.depot && (
                <p className="text-red-500 text-sm mt-1">{errors.depot}</p>
              )}
            </div>}

            {/* Warehouse */}
            {/* <div className="flex flex-col">
              <InputFields
                required
                label="Warehouse"
                value={form.warehouse}
                options={warehouseOptions}
                onChange={(e) => {
                  const newWarehouse = e.target.value;
                  handleChange("warehouse", newWarehouse);
                  handleChange("vehicleType", ""); // clear vehicle when warehouse changes
                  fetchRoutes(newWarehouse);
                }}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div> */}
          </div>
        </div>
      </ContainerCard>

      {/* Additional Information */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vehicle */}
            {/* <div className="flex flex-col">
              <InputFields
                required
                label="Vehicle"
                value={form.vehicleType}
                onChange={(e) => handleChange("vehicleType", e.target.value)}
                options={filteredOptions}
                showSkeleton={skeleton}
                disabled={filteredOptions.length === 0}
                placeholder={form.warehouse ? "Select Vehicle" : "Select warehouse first"}
              />
              {errors.vehicleType && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>
              )}
            </div> */}

            {/* Status */}
            {/* <div className="flex flex-col">
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
            </div> */}
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
          onClick={() => router.push("/route")}
          disabled={submitting} // disable while submitting
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
