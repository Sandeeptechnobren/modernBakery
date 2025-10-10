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
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate route code only once on add
  const codeGeneratedRef = useRef(false);
  useEffect(() => {
    if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          const res = await genearateCode({ model_name: "routes" });
          if (res?.code) {
            setRouteCode(res.code);
          }
          if (res?.prefix) {
            setPrefix(res.prefix);
          } else if (res?.code) {
            // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
            const match = res.prefix;
            if (match) setPrefix(prefix);
          }
        } catch (e) {
          // Optionally handle error
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode && routeId) {
      setLoading(true);
      (async () => {
        try {
          const res = await getRouteById(String(routeId));
          const data = res?.data ?? res;
          setRouteCode(data?.route_code || "");
          setRouteName(data?.route_name || "");
          setWarehouse(data?.warehouse?.id !== undefined && data?.warehouse?.id !== null ? String(data?.warehouse?.id) : "");
          setVehicleType(data?.vehicle?.id !== undefined && data?.vehicle?.id !== null ? String(data?.vehicle.id) : "");
          setRouteType(data?.route_Type?.id !== undefined && data?.route_Type?.id !== null ? String(data?.route_Type.id) : "");
          setStatus(data?.status !== undefined && data?.status !== null ? String(data?.status) : "");
        } catch (err) {
          showSnackbar("Failed to fetch route details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, routeId]);

  const validationSchema = yup.object().shape({
    routeCode: yup.string().required("Route Code is required"),
    routeName: yup.string().required("Route Name is required"),
    routeType: yup.string().required("Route Type is required"),
    vehicleType: yup.string().required("Vehicle is required"),
    warehouse: yup.string().required("Warehouse is required"),
    status: yup.string().required("Status is required"),
  });

  const clearErrors = () => setErrors({});

  const handleSubmit = async () => {
    clearErrors();
    try {
      await validationSchema.validate({
        routeCode,
        routeName,
        routeType,
        vehicleType,
        warehouse,
        status,
      }, { abortEarly: false });

      const payload = {
        route_code: routeCode,
        route_name: routeName,
        route_type: routeType,
        vehicle_id: vehicleType,
        status: status ? (status === "active" ? 1 : status === "inactive" ? 0 : Number(status)) : undefined,
        warehouse_id: warehouse
      };

      setSubmitting(true);
      let res;
      if (isEditMode && routeId) {
        res = await updateRoute(String(routeId), payload);
      } else {
        res = await addRoutes(payload);
        if (!res?.error) {
          try {
            await saveFinalCode({ reserved_code: routeCode, model_name: "routes" });
          } catch (e) {
            // Optionally handle error, but don't block success
          }
        }
      }
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(isEditMode ? "Route updated successfully" : "Route added successfully", "success");
        router.push("/route");
      }
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof yup.ValidationError && Array.isArray(err.inner)) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix validation errors before proceeding", "error");
      } else {
        showSnackbar(isEditMode ? "Failed to update route" : "Failed to add route", "error");
      }
    }
  };

  if (isEditMode && loading) {
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
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                  disabled={codeMode === 'auto'}
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
                        if (mode === 'auto' && code) {
                          setRouteCode(code);
                        } else if (mode === 'manual') {
                          setRouteCode('');
                        }
                      }}
                    />
                  </>
                )}
                {errors.routeCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.routeCode}</p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Route Name"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
                {errors.routeName && (
                  <p className="text-red-500 text-sm mt-1">{errors.routeName}</p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Route Type"
                  name="route_type"
                  value={routeType}
                  onChange={(e) => setRouteType(e.target.value)}
                  options={routeTypeOptions}
                />
                {errors.routeType && (
                  <p className="text-red-500 text-sm mt-1">{errors.routeType}</p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Vehicle"
                  name="vehicle_id"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  options={vehicleListOptions}
                />
                {errors.vehicleType && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 ">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Warehouse"
                  value={warehouse}
                  options={warehouseOptions}
                  onChange={(e) => setWarehouse(e.target.value)}
                />
                {errors.warehouse && (
                  <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Status"
                  value={status}
                  type="radio"
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "In Active" },
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
