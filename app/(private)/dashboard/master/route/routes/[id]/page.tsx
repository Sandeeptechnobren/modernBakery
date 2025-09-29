"use client";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import IconButton from "@/app/components/iconButton";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import SettingPopUp from "@/app/components/settingPopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getRouteById, updateRoute } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";



export default function EditRoute() {
  const { routeTypeOptions,warehouseOptions,vehicleListOptions } = useAllDropdownListData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const params = useParams();
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState("");
    const [vehicleType, setVehicleType] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [status, setStatus] = useState("");
  const routeSchema = yup.object().shape({
    routeCode: yup.string().required("Route Code is required"),
    routeName: yup.string().required("Route Name is required"),
    routeType: yup.string().required( "Route Type is required"),
    vehicleType: yup.string().required("Vehicle is required"),
    warehouse: yup.string().required("Warehouse is required"),
    status: yup.string().required("Status is required"),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [fetched, setFetched] = useState<null | {
    route_code?: string;
    route_name?: string;
    warehouse?: string;
    route_type?:  string;
    vehicle_id?: number | string;
    status?: number | string;
  }>(null);
  
  useEffect(() => {
    if (!queryId) return;
    let mounted = true;
    (async () => {
        try {
        const res = await getRouteById(String(queryId));
        const data = res?.data ?? res;
        if (!mounted) return;
        
       
        

        setFetched({
          route_code: data?.route_code,
          route_name: data?.route_name,
          warehouse: data?.warehouse?.id ?? "",
          route_type: data?.route_Type?.id ?? "",
          vehicle_id: data?.vehicle_id,
          status: data?.status,
        });

        // Set individual state values
        setRouteCode(data?.route_code || "");
        setRouteName(data?.route_name || "");
        setWarehouse(data?.warehouse?.id !== undefined && data?.warehouse?.id !== null ? String(data?.warehouse?.id) : "");
        setVehicleType(data?.vehicle.id !== undefined && data?.vehicle.id !== null ? String(data?.vehicle.id) : "");
        setRouteType(data?.route_Type?.id !== undefined && data?.route_Type?.id !== null ? String(data?.route_Type?.id) : "");
        setStatus(data?.status !== undefined && data?.status !== null ? String(data?.status) : "");
        
      } catch (err: unknown) {
        console.error("Failed to fetch route by id", err);
      } finally {
      }
    })();
    return () => { mounted = false; };
  }, [queryId]);

  const clearErrors = () => setErrors({});

  const handleSubmit = async () => {
    if (!queryId) return;
    clearErrors();

    // Validate form fields using Yup
    try {
      await routeSchema.validate(
        {
          routeCode,
          routeName,
          routeType,
          warehouse,
          vehicleType,
          status,
        },
        { abortEarly: false }
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix validation errors before proceeding", "error");
        return;
      }
    }

    type UpdateRoutePayload = {
      route_code?: string;
      route_name?: string;
      route_type?: string;
      vehicle_id?: string;
      status?: number | undefined;
      warehouse_id?: string;
    };

    const payload: UpdateRoutePayload = {
      route_code: routeCode,
      route_name: routeName,
      route_type: routeType,
      vehicle_id: vehicleType,
      status: status ? (status === "active" ? 1 : status === "inactive" ? 0 : Number(status)) : undefined,
      warehouse_id: warehouse
    };

    try {
      setSubmitting(true);
      await updateRoute(String(queryId), payload);
      showSnackbar("Route updated successfully", "success");
      router.push("/dashboard/master/route");
      setSubmitting(false);
    } catch (err: unknown) {
      setSubmitting(false);
      showSnackbar("Failed to update route", "error");
      console.error(err);
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
            Edit Route
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
                {errors.route_code && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_code}</p>
                )}

                <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]"
                  icon="mi:settings"
                  onClick={() => setIsOpen(true)}
                />

                <SettingPopUp
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  title="Route Code"
                />
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
                                    onChange={(e)=>setRouteType(e.target.value)}
                                    options={routeTypeOptions}
                                    
                                  />
                {errors.route_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.route_type}</p>
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
                {errors.vehicle_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.vehicle_id}</p>
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
                  label="Warehouse"
                  value={warehouse}
                  options={warehouseOptions}
                  onChange={(e) => {
                    
                      setWarehouse((e.target.value));
                    }
                  }
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
