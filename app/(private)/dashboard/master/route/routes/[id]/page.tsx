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
  const { routeTypeOptions,warehouseOptions } = useAllDropdownListData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const params = useParams();
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState<string[]>([]);
  const [warehouse, setWarehouse] = useState("");
  const [status, setStatus] = useState("");
  const routeSchema = yup.object().shape({
    routeCode: yup.string().required("Route Code is required"),
    routeName: yup.string().required("Route Name is required"),
    routeType: yup.array().of(yup.string()).min(1, "Route Type is required"),
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
    route_type?: number[] | number | string;
    vehicle_id?: number | string;
    status?: number | string;
  }>(null);
   type RouteTypeChangeEvent = { target: { value: string | string[] } };
  const handleRouteTypeChange = (e: RouteTypeChangeEvent) => {
    if (Array.isArray(e.target.value)) {
      setRouteType(e.target.value);
    } else {
      setRouteType([e.target.value]);
    }
  };
  useEffect(() => {
    if (!queryId) return;
    let mounted = true;
    (async () => {
        try {
        const res = await getRouteById(String(queryId));
        const data = res?.data ?? res;
        if (!mounted) return;
        
        // Handle route_type - convert to array if it's a single value
        let routeTypeArray: string[] = [];
        if (data?.route_type) {
          if (Array.isArray(data.route_type)) {
            routeTypeArray = data.route_type.map((rt: string) => String(rt));
          } else {
            routeTypeArray = [String(data.route_type)];
          }
        }
        
        setFetched({
          route_code: data?.route_code,
          route_name: data?.route_name,
          warehouse: data?.warehouse.id,
          route_type: data?.route_type,
          vehicle_id: data?.vehicle_id,
          status: data?.status,
        });
        
        // Set individual state values
        setRouteCode(data?.route_code || "");
        setRouteName(data?.route_name || "");
        setWarehouse(data?.warehouse.id || "");
        setRouteType(routeTypeArray);
        setStatus(data?.status ? String(data?.status) : "");
        
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
      route_type?: number[] | undefined;
      status?: number | undefined;
      warehouse?: string;
    };

    const payload: UpdateRoutePayload = {
      route_code: routeCode,
      route_name: routeName,
      route_type: routeType.length > 0 ? routeType.map(rt => Number(rt)) : undefined,
      status: status ? (status === "active" ? 1 : status === "inactive" ? 0 : Number(status)) : undefined,
      warehouse: warehouse
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
                                    onChange={(e)=>e.target.value}
                                    options={routeTypeOptions}
                                    
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
