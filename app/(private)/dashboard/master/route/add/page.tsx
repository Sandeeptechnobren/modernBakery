"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as yup from "yup";
import { addRoutes } from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

export default function Route() {
  const { routeTypeOptions, warehouseOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState<string[]>([]);
  const [warehouse, setWarehouse] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const clearErrors = () => setErrors({});

  type RouteTypeChangeEvent = { target: { value: string | string[] } };
  const handleRouteTypeChange = (e: RouteTypeChangeEvent) => {
    if (Array.isArray(e.target.value)) {
      setRouteType(e.target.value);
    } else {
      setRouteType([e.target.value]);
    }
  };

  const validationSchema = yup.object().shape({
    route_code: yup.string().required("Route code is required").max(10),
    route_name: yup.string().required("Route name is required").max(100),
    route_type: yup.array().of(yup.string()).required("Route type is required").min(1, "At least one route type is required"),
    warehouse: yup.string().required("Warehouse is required"),
    status: yup.string().required("Status is required").oneOf(["0", "1", "active", "inactive"], "Invalid status"),
  });

  const handleSubmit = async () => {
    clearErrors();
    try {
      await validationSchema.validate({
        route_code: routeCode,
        route_name: routeName,
        route_type: routeType,
        warehouse: warehouse,
        status: status,
      }, { abortEarly: false });

      type AddRoutePayload = {
        route_code?: string;
        route_name?: string;
        route_type?: number[] | undefined;
        status?: number | undefined;
        warehouse: string;
      };

      const payload: AddRoutePayload = {
        route_code: routeCode,
        route_name: routeName,
        route_type: routeType.length > 0 ? routeType.map(rt => Number(rt)) : undefined,
        status: status ? (status === "active" ? 1 : status === "inactive" ? 0 : Number(status)) : undefined,
        warehouse: warehouse
      };

      setSubmitting(true);
      await addRoutes(payload);
      showSnackbar("Route added successfully ", "success");
      router.push("/dashboard/master/route");
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
          <Link href="/dashboard/master/route">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Add New Route
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
              <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                  required
                  label="Route Code"
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                />


                <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]"
                  icon="mi:settings"
                  onClick={() => setIsOpen(true)}
                />

                <SettingPopUp
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  title="Route Code"
                />
                {errors.route_code && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_code}</p>
                )}
              </div>

              <div>
                <InputFields
                  required
                  label="Route Name"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
                {errors.route_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_name}</p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Route Type"
                  name="route_type"
                  value={routeType}
                  onChange={handleRouteTypeChange}
                  options={routeTypeOptions}
                  isSingle={false}
                />
                {errors.route_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_type}</p>
                )}

              </div>
            </div>
          </div>
        </div>
        {/* Location Information */}

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
                  name="warehouse"
                  label="Warehouse"
                  value={warehouse || ""}
                  options={warehouseOptions}
                  onChange={(e) => {
                    if (e && e.target && typeof e.target.value !== 'undefined') {
                      setWarehouse(String(e.target.value));
                    }
                  }}
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
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "In Active" },
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