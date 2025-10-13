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
import { getRouteById, addRoutes, updateRoute, genearateCode, saveFinalCode } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Loading from "@/app/components/Loading";

export default function AddEditRoute() {
  const { routeTypeOptions, warehouseOptions, vehicleListOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const routeId = params?.id as string | undefined;
  const isEditMode = routeId !== undefined && routeId !== "add";

  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto'|'manual'>('auto');
  const [prefix, setPrefix] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    routeCode: '',
    routeName: '',
    routeType: '',
    vehicleType: '',
    warehouse: '',
    status: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const codeGeneratedRef = useRef(false);

  // Auto-generate route code for add mode
  useEffect(() => {
    if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          const res = await genearateCode({ model_name: "routes" });
          if (res?.code) setForm(prev => ({ ...prev, routeCode: res.code }));
          if (res?.prefix) setPrefix(res.prefix);
        } catch (e) {}
      })();
    }
  }, [isEditMode]);

  // Fetch route details in edit mode
  useEffect(() => {
    if (isEditMode && routeId) {
      setLoading(true);
      (async () => {
        try {
          const res = await getRouteById(String(routeId));
          const data = res?.data ?? res;
          setForm({
            routeCode: data?.route_code || "",
            routeName: data?.route_name || "",
            routeType: data?.route_Type?.id ? String(data?.route_Type.id) : "",
            vehicleType: data?.vehicle?.id ? String(data?.vehicle.id) : "",
            warehouse: data?.warehouse?.id ? String(data?.warehouse.id) : "",
            status: data?.status !== undefined && data?.status !== null ? String(data.status) : "",
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
    routeCode: yup.string().required("Route Code is required"),
    routeName: yup
      .string()
      .required("Route Name is required")
      .matches(/^[A-Za-z][A-Za-z0-9 ]*$/, "Must start with a letter and no special characters"),
    routeType: yup.string().required("Route Type is required"),
    vehicleType: yup.string().required("Vehicle is required"),
    warehouse: yup.string().required("Warehouse is required"),
    status: yup.string().required("Status is required"),
  });

  // Handle input change and clear error immediately
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const payload = {
        route_code: form.routeCode,
        route_name: form.routeName,
        route_type: form.routeType,
        vehicle_id: form.vehicleType,
        warehouse_id: form.warehouse,
        status: Number(form.status),
      };

      let res;
      if (isEditMode && routeId) {
        res = await updateRoute(routeId, payload);
      } else {
        res = await addRoutes(payload);
        if (!res?.error) {
          await saveFinalCode({ reserved_code: form.routeCode, model_name: "routes" });
        }
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(isEditMode ? "Route updated successfully" : "Route added successfully", "success");
        router.push("/route");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach(e => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix validation errors before submitting", "error");
      } else {
        showSnackbar(isEditMode ? "Failed to update route" : "Failed to add route", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return <div className="w-full h-full flex items-center justify-center"><Loading /></div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/route">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Route" : "Add Route"}
          </h1>
        </div>
      </div>
      {/* Content */}
      <div>
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
          {/* Route Details */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Route Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  required
                  label="Route Code"
                  value={form.routeCode}
                  onChange={(e) => handleChange("routeCode", e.target.value)}
                  disabled={codeMode === "auto"}
                />
                {!isEditMode && (
                  <>
                    <IconButton bgClass="white"  className="  cursor-pointer text-[#252B37] pt-12"
                      icon="mi:settings"
                      onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      title="Route Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === "auto" && code) handleChange("routeCode", code);
                        else if (mode === "manual") handleChange("routeCode", "");
                      }}
                    />
                  </>
                )}
              </div>
              {errors.routeCode && <p className="text-red-500 text-sm mt-1">{errors.routeCode}</p>}
            </div>

            {/* Route Name */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Route Name"
                value={form.routeName}
                onChange={(e) => handleChange("routeName", e.target.value)}
              />
              {errors.routeName && <p className="text-red-500 text-sm mt-1">{errors.routeName}</p>}
            </div>

            {/* Route Type */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Route Type"
                value={form.routeType}
                onChange={(e) => handleChange("routeType", e.target.value)}
                options={routeTypeOptions}
              />
              {errors.routeType && <p className="text-red-500 text-sm mt-1">{errors.routeType}</p>}
            </div>

            {/* Vehicle */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Vehicle"
                value={form.vehicleType}
                onChange={(e) => handleChange("vehicleType", e.target.value)}
                options={vehicleListOptions}
              />
              {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Warehouse */}
            <div className="flex flex-col">
              <InputFields
                required
                label="Warehouse"
                value={form.warehouse}
                options={warehouseOptions}
                onChange={(e) => handleChange("warehouse", e.target.value)}
              />
              {errors.warehouse && <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>}
            </div>

            {/* Status */}
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
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6  pr-0">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/route")}
          >
            Cancel
          </button>
          <SidebarBtn
            label={submitting ? (isEditMode ? "Updating..." : "Submitting...") : (isEditMode ? "Update" : "Submit")}
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
