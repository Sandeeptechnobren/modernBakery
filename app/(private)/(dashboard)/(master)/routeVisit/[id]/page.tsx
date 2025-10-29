"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Loading from "@/app/components/Loading";
import { useSearchParams } from "next/navigation";
import {
  regionList,
  getArea,
  warehouseList,
  routeList,
  saveRouteVisit,
  updateRouteVisitDetails,
  getRouteVisitDetails,
  subRegionList,
  agentCustomerList,
} from "@/app/services/allApi";
import Table from "./toggleTable";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";

// Types for customer data
type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

export default function AddEditRouteVisit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const visitId = params?.id as string | undefined;
  const isEditMode = !!(visitId && visitId !== "add");
  const [skeleton, setSkeleton] = useState({
    route: false,
    region: false,
    area: false,
    warehouse: false,
  });

  const [commonData, setCommonData] = useState<{
    from_date: string | null;
    to_date: string | null;
    customer_type: string | null;
    status: string | null;
  }>({ from_date: "", to_date: "", customer_type: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Commented out dropdown options since they're no longer needed in payload
  /*
  const [regionOptions, setRegionOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [areaOptions, setAreaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [routeOptions, setRouteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  */
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSchedules, setCustomerSchedules] = useState<
    CustomerSchedule[]
  >([]);

  useEffect(() => {
    const from_date = searchParams.get("from_date");
    const to_date = searchParams.get("to_date");
    const customer_type = searchParams.get("customer_type");
    const status = searchParams.get("status");

    const urlData = {
      from_date: from_date && from_date.toString(),
      to_date: to_date && to_date.toString(),
      customer_type: customer_type && customer_type.toString(),
      status: status && status.toString(),
    };

    setCommonData(urlData);

    commonData &&
      urlData.customer_type &&
      setSelectedCustomerType(urlData.customer_type);
  }, [searchParams]);

  const [selectedCustomerType, setSelectedCustomerType] = useState<string>();

  // Commented out form state since region/area/warehouse/route are no longer needed
  /*
  const [form, setForm] = useState({
    region: [] as string[],
    area: [] as string[],
    warehouse: [] as string[],
    route: [] as string[],
    days: [] as string[],
  });
  */

  // ✅ Updated validation schema - removed region/area/warehouse/route validation
  const validationSchema = yup.object().shape({
    // No fields required since we only need customer schedules
  });

  // ✅ Fetch dropdowns - commented out since no longer needed
  /*
  const loadDropdownData = async () => {
    try {
      const regions = await regionList();

      setRegionOptions(
        regions?.data?.map((r: any) => ({
          value: String(r.id),
          label: r.region_name || r.name,
        })) || []
      );
    } catch {
      showSnackbar("Failed to load dropdown data", "error");
    }
  };
  */

  // ✅ Load data for editing
  // const loadVisitData = async (uuid: string) => {
  //   setLoading(true);
  //   try {
  //     const res = await getRouteVisitDetails(uuid);
  //     console.log(res);
  //     const allVisits = res?.data || [];
  //     const existing = allVisits.find(
  //       (item: any) => String(item.uuid) === String(uuid)
  //     );

  //     if (existing) {
  //       // Commented out form setting since we don't need region/area/warehouse/route
  //       /*
  //       setForm({
  //         region: existing.region_ids?.map(String) || [],
  //         area: existing.area_ids?.map(String) || [],
  //         warehouse: existing.warehouse_ids?.map(String) || [],
  //         route: existing.route_ids?.map(String) || [],
  //         days: existing.days || [],
  //       });
  //       */

  //       // If there are existing customer schedules, load them
  //       if (existing.customers && Array.isArray(existing.customers)) {
  //         setCustomerSchedules(
  //           existing.customers.map((customer: any) => ({
  //             customer_id: customer.customer_id,
  //             days: customer.days || [],
  //           }))
  //         );
  //       }
  //     } else {
  //       showSnackbar("Route visit not found", "error");
  //     }
  //   } catch {
  //     showSnackbar("Failed to fetch route visit details", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchCustomers = async () => {
      let res = null;
      if (selectedCustomerType == "1") {
        res = await agentCustomerList();
      } else {
        res = await agentCustomerList();
      }

      console.log(res, selectedCustomerType);
      setCustomers(res.data);
    };

    fetchCustomers();
  }, [selectedCustomerType]);

  // Commented out region/area/warehouse/route dependency effects since no longer needed
  /*
  // 1️⃣ When Region changes → Fetch Areas
  useEffect(() => {
    if (!form.region.length) {
      setAreaOptions([]);
      setForm((prev) => ({ ...prev, area: [], warehouse: [], route: [] }));
      return;
    }

    const fetchAreas = async () => {
      try {
        setSkeleton({ ...skeleton, area: true });
        const res = await subRegionList({ region_id: String(form.region[0]) });
        const areaList = res?.data?.data || res?.data || [];

        setAreaOptions(
          areaList.map((a: any) => ({
            value: String(a.id),
            label: a.area_name || a.name,
          }))
        );
        setSkeleton({ ...skeleton, area: false });
      } catch (err) {
        console.error("Failed to fetch area list:", err);
        setAreaOptions([]);
      }
    };

    fetchAreas();
  }, [form.region]);

  // 2️⃣ When Area changes → Fetch Warehouses
  useEffect(() => {
    if (!form.area.length) {
      setWarehouseOptions([]);
      setForm((prev) => ({ ...prev, warehouse: [], route: [] }));
      return;
    }

    const fetchWarehouses = async () => {
      try {
        setSkeleton({ ...skeleton, warehouse: true });
        const res = await warehouseList({ area_id: String(form.area[0]) });
        const warehousesList = res?.data?.data || res?.data || [];

        setWarehouseOptions(
          warehousesList.map((w: any) => ({
            value: String(w.id),
            label: w.warehouse_name || w.name,
          }))
        );
        setSkeleton({ ...skeleton, warehouse: false });
      } catch (err) {
        console.error("Failed to fetch warehouse list:", err);
        setWarehouseOptions([]);
      }
    };

    fetchWarehouses();
  }, [form.area]);

  // 3️⃣ When Warehouse changes → Fetch Routes
  useEffect(() => {
    if (!form.warehouse.length) {
      setRouteOptions([]);
      setForm((prev) => ({ ...prev, route: [] }));
      return;
    }

    const fetchRoutes = async () => {
      try {
        setSkeleton({ ...skeleton, route: true });
        const res = await routeList({
          warehouse_id: String(form.warehouse[0]),
        });
        console.log(res);
        const routeListData = res?.data?.data || res?.data || [];

        setRouteOptions(
          routeListData.map((r: any) => ({
            value: String(r.id),
            label: r.route_name || r.name,
          }))
        );
        setSkeleton({ ...skeleton, route: false });
      } catch (err) {
        console.error("Failed to fetch route list:", err);
        setRouteOptions([]);
      }
    };

    fetchRoutes();
  }, [form.warehouse]);
  */

  // useEffect(() => {
  //   // loadDropdownData(); // Commented out since no longer needed
  //   if (isEditMode && visitId == "add") loadVisitData(visitId);
  // }, [isEditMode, visitId]);

  // ✅ Single select handler - commented out since no longer needed
  /*
  const handleSingleSelectChange = (field: string, value: string) => {
    console.log(field);
    if (field == "customer_type") {
      setSelectedCustomerType(value);
      setForm((prev) => ({ ...prev, [field]: value }));
    } else if (["region", "area", "warehouse", "route"].includes(field)) {
      // For array fields, store as single element array
      setForm((prev) => ({
        ...prev,
        [field]: value ? [value] : [],
        // Reset dependent fields when parent changes
        ...(field === "region" && { area: [], warehouse: [], route: [] }),
        ...(field === "area" && { warehouse: [], route: [] }),
        ...(field === "warehouse" && { route: [] }),
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };
  */

  // ✅ Handle customer schedule updates from Table component
  const handleCustomerScheduleUpdate = useCallback(
    (schedules: CustomerSchedule[]) => {
      setCustomerSchedules(schedules);
    },
    []
  );

  // ✅ Handle submit
  const handleSubmit = async () => {
    try {
      // Validate route details - commented out since no validation needed
      // await validationSchema.validate(form, { abortEarly: false });

      // Validate that at least one customer has days selected
      const hasValidSchedules = customerSchedules.some(
        (schedule) => schedule.days && schedule.days.length > 0
      );

      if (!hasValidSchedules) {
        showSnackbar("Please select days for at least one customer", "error");
        return;
      }

      setErrors({});
      setSubmitting(true);

      // ✅ Build payload in the required format (updated to match your new payload structure)
      const payload = {
        customer_type: Number(commonData.customer_type),
        customers: customerSchedules
          .filter((schedule) => schedule.days && schedule.days.length > 0)
          .map((schedule) => ({
            customer_id: Number(schedule.customer_id),
            days: schedule.days,
            from_date: commonData.from_date,
            to_date: commonData.to_date,
            status: Number(commonData.status),
          })),
      };

      console.log("Submitting payload:", payload);

      let res;
      if (isEditMode) {
        res = await updateRouteVisitDetails(payload);
      } else {
        res = await saveRouteVisit(payload);
      }

      if (res?.error) {
        showSnackbar(
          res?.data?.message || "Failed to save route visit",
          "error"
        );
      } else {
        showSnackbar(
          isEditMode
            ? "Route visit updated successfully"
            : "Route visit created successfully",
          "success"
        );
        router.push("/routeVisit");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Failed to submit form", "error");
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/routeVisit">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Route Visit" : "Add Route Visit"}
          </h1>
        </div>
      </div>

      {/* Commented out Route Details Section since no longer needed */}
      {/*
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Route Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <InputFields
                required
                label="Region"
                value={form.region[0] || ""}
                showSkeleton={skeleton.region}
                onChange={(e) =>
                  handleSingleSelectChange("region", e.target.value)
                }
                options={regionOptions}
                error={errors.region}
              />
              {errors.region && (
                <p className="text-red-500 text-sm mt-1">{errors.region}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                disabled={form.region.length === 0}
                label="Area"
                value={form.area[0] || ""}
                showSkeleton={skeleton.area}
                onChange={(e) =>
                  handleSingleSelectChange("area", e.target.value)
                }
                options={areaOptions}
                error={errors.area}
              />
              {errors.area && (
                <p className="text-red-500 text-sm mt-1">{errors.area}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                disabled={form.area.length === 0 || areaOptions.length === 0}
                label="Warehouse"
                value={form.warehouse[0] || ""}
                showSkeleton={skeleton.warehouse}
                onChange={(e) =>
                  handleSingleSelectChange("warehouse", e.target.value)
                }
                options={warehouseOptions}
                error={errors.warehouse}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div>

            <div>
              <InputFields
                required
                disabled={form.warehouse.length === 0}
                label="Route"
                value={form.route[0] || ""}
                showSkeleton={skeleton.route}
                onChange={(e) =>
                  handleSingleSelectChange("route", e.target.value)
                }
                options={routeOptions}
                error={errors.route}
              />
              {errors.route && (
                <p className="text-red-500 text-sm mt-1">{errors.route}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Customer Schedule Section - Only this section remains */}
      <ContainerCard>
        <div className="">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Schedule
          </h2>
          <Table
            isEditMode={isEditMode}
            selectedCustomerType={
              selectedCustomerType ? selectedCustomerType : "Agent Customer"
            }
            customers={customers}
            onScheduleUpdate={handleCustomerScheduleUpdate}
            initialSchedules={customerSchedules}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => router.push("/routeVisit")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </ContainerCard>
    </>
  );
}
