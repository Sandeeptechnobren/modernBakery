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

const schema = yup.object().shape({
  route_code: yup.string().required("Route code is required").max(10),
  route_name: yup.string().required("Route name is required").max(100),
  route_type: yup.array().of(yup.number()).required("Route type is required").min(1, "At least one route type is required"),
  status: yup.number().required("Status is required").oneOf([0, 1, 2], "Invalid status"),
});

export default function EditRoute() {
  const { routeTypeOptions, loading, areaOptions } = useAllDropdownListData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const params = useParams();
  const routeId = params?.id ?? "";
  const queryId = searchParams.get("id") || routeId || "";
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeType, setRouteType] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [fetched, setFetched] = useState<null | {
    route_code?: string;
    route_name?: string;
    description?: string;
    route_type?: number[] | number | string;
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
        
        // Handle route_type - convert to array if it's a single value
        let routeTypeArray: string[] = [];
        if (data?.route_type) {
          if (Array.isArray(data.route_type)) {
            routeTypeArray = data.route_type.map((rt: any) => String(rt));
          } else {
            routeTypeArray = [String(data.route_type)];
          }
        }
        
        setFetched({
          route_code: data?.route_code,
          route_name: data?.route_name,
          description: data?.description,
          route_type: data?.route_type,
          vehicle_id: data?.vehicle_id,
          status: data?.status,
        });
        
        // Set individual state values
        setRouteCode(data?.route_code || "");
        setRouteName(data?.route_name || "");
        setDescription(data?.description || "");
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
    
    type UpdateRoutePayload = {
      route_code?: string;
      route_name?: string;
      route_type?: number[] | undefined;
      status?: number | undefined;
      description?: string;
    };

    const payload: UpdateRoutePayload = {
      route_code: routeCode,
      route_name: routeName,
      route_type: routeType.length > 0 ? routeType.map(rt => Number(rt)) : undefined,
      status: status ? (status === "active" ? 1 : status === "inactive" ? 0 : Number(status)) : undefined,
      description: description
    };

    try {
      setSubmitting(true);
      await updateRoute(String(queryId), payload);
      showSnackbar("Route updated successfully", "success");
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
        showSnackbar("Failed to update route", "error");
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
                  label="Route Type"
                  value={routeType.join(",")}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue && !routeType.includes(selectedValue)) {
                      setRouteType([...routeType, selectedValue]);
                    }
                  }}
                  options={routeTypeOptions}
                />
                {/* Display selected route types */}
                {routeType.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {routeType.map((type, index) => {
                      const label = routeTypeOptions?.find(opt => opt.value === type)?.label || type;
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={() => {
                              setRouteType(routeType.filter((_, i) => i !== index));
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
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
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
               
              </div>
              <div>
                <InputFields
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
  // );
  // return (
  //   <div className="w-full h-full overflow-x-hidden p-4">
  //     <div className="flex justify-between items-center mb-6">
  //       <div className="flex items-center gap-4">
  //         <Link href="/dashboard/master/route">
  //           <Icon icon="lucide:arrow-left" width={24} />
  //         </Link>
  //         <h1 className="text-xl font-semibold text-gray-900">Edit Route</h1>
  //       </div>
  //     </div>

  //     <Formik
  //       initialValues={initialValues}
  //       validationSchema={RouteSchema}
  //       enableReinitialize
  //       onSubmit={handleSubmit}
  //     >
  //       {({ values, setFieldValue, handleSubmit }) => (
  //         <Form onSubmit={handleSubmit}>
  //           <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
  //             <div className="p-6">
  //               <h2 className="text-lg font-medium text-gray-800 mb-4">Route Details</h2>
  //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //                 <div className="flex items-end gap-2 max-w-[406px]">
  //                   <div className="w-full">
  //                     <InputFields
  //                       label="Route Code"
  //                       value={values.route_code}
  //                       onChange={(e) => setFieldValue("route_code", e.target.value)}
  //                     />
  //                     <ErrorMessage name="route_code" component="span" className="text-xs text-red-500" />
  //                   </div>
  //                   <IconButton
  //                     bgClass="white"
  //                     className="mb-2 cursor-pointer text-[#252B37]"
  //                     icon="mi:settings"
  //                     onClick={() => setIsOpen(true)}
  //                   />
  //                   <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Route Code" />
  //                 </div>

  //                 <div>
  //                   <InputFields label="Route Name" value={values.route_name} onChange={(e) => setFieldValue("route_name", e.target.value)} />
  //                   <ErrorMessage name="route_name" component="span" className="text-xs text-red-500" />
  //                 </div>

  //                 <div>
  //                   <InputFields
  //                     label="Route Type"
  //                     value={values.route_type}
  //                     onChange={(e) => setFieldValue("route_type", e.target.value)}
  //                     options={[{ value: "1", label: "Route 1" }, { value: "2", label: "Route 2" }, { value: "3", label: "Route 3" }]}
  //                   />
  //                   <ErrorMessage name="route_type" component="span" className="text-xs text-red-500" />
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

           

  //           <div className="bg-white rounded-2xl shadow divide-y divide-gray-200">
  //             <div className="p-6">
  //               <h2 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h2>
  //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //                 <div>
  //                   <InputFields label="Status" value={values.status} onChange={(e) => setFieldValue("status", e.target.value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "In Active" }]} />
  //                   <ErrorMessage name="status" component="span" className="text-xs text-red-500" />
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  