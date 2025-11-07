"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Loading from "@/app/components/Loading";
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
  companyList,
} from "@/app/services/allApi";
import Table from "./toggleTable";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";

// Types for customer schedule
type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

export default function AddEditRouteVisit() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const visitId = params?.id as string | undefined;
  const isEditMode = !!(visitId && visitId !== "add");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const [companyOptions, setCompanyOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSchedules, setCustomerSchedules] = useState<
    CustomerSchedule[]
  >([]);

  const [selectedCustomerType, setSelectedCustomerType] = useState<string>();

  const [skeleton, setSkeleton] = useState({
    region: false,
    route: false,
    warehouse: false,
    area: false,
    company: false,
  });

  const [form, setForm] = useState({
    salesman_type: "1",
    region: [] as string[],
    area: [] as string[],
    warehouse: [] as string[],
    route: [] as string[],
    company: [] as string[],
    days: [] as string[],
    from_date: "",
    to_date: "",
    status: "1",
  });

  // Stepper setup
  const steps: StepperStep[] = [
    { id: 1, label: "Route Details" },
    { id: 2, label: "Customer Schedule" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  // ✅ Validation schema for multi-selects
  const validationSchema = yup.object().shape({
    salesman_type: yup.string().required("Customer type is required"),
    region: yup.array().min(1, "At least one region is required"),
    area: yup.array().min(1, "At least one area is required"),
    warehouse: yup.array().min(1, "At least one warehouse is required"),
    route: yup.array().min(1, "At least one route is required"),
    company: yup.array().min(1, "At least one company is required"),
    days: yup.array().min(1, "At least one day is required"),
    from_date: yup.string().required("From date is required"),
    to_date: yup
      .string()
      .required("To date is required")
      .test(
        "is-after-or-equal",
        "To Date must be after or equal to From Date",
        function (value) {
          const { from_date } = this.parent;
          if (!from_date || !value) return true;
          return new Date(value) >= new Date(from_date);
        }
      ),
    status: yup.string().required("Status is required"),
  });

  // Step-specific validation schemas
  const stepSchemas = [
    // Step 1: Route Details validation
    yup.object().shape({
      region: validationSchema.fields.region,
      area: validationSchema.fields.area,
      warehouse: validationSchema.fields.warehouse,
      route: validationSchema.fields.route,
      company: validationSchema.fields.company,
      from_date: validationSchema.fields.from_date,
      to_date: validationSchema.fields.to_date,
      status: validationSchema.fields.status,
    }),
    // Step 2: Customer Schedule validation
    yup.object().shape({
      salesman_type: validationSchema.fields.salesman_type,
    }),
  ];

  // ✅ Fetch dropdowns
  const loadDropdownData = async () => {
    try {
      !isEditMode && setLoading(true);
      // Fetch companies
      setSkeleton({ ...skeleton, company: true });
      const companies = await companyList();
      setCompanyOptions(
        companies?.data?.map((c: any) => ({
          value: String(c.id),
          label: c.company_name || c.name,
        })) || []
      );
      setSkeleton({ ...skeleton, company: false });
      !isEditMode && setLoading(false);
    } catch {
      showSnackbar("Failed to load dropdown data", "error");
    }
  };

  // ✅ Load data for editing - UPDATED BASED ON API RESPONSE
  const loadVisitData = async (uuid: string) => {
    setLoading(true);
    try {
      const res = await getRouteVisitDetails(uuid);
      console.log("API Response for edit:", res);

      if (res?.data) {
        const existing = res.data;

        // Format dates from "2025-10-31T00:00:00.000000Z" to "2025-10-31"
        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          return dateString.split("T")[0];
        };

        // ✅ FIX: Properly handle status conversion
        const backendStatus = existing.status;
        console.log(
          "Backend status:",
          backendStatus,
          "Type:",
          typeof backendStatus
        );

        // Convert status to string for the form, but ensure it matches your radio options
        const statusValue = backendStatus === 0 ? "0" : "1";

        // Set form values based on API response
        setForm({
          salesman_type: existing.customer_type || "1",
          region: existing.region?.map((r: any) => String(r.id)) || [],
          area: existing.area?.map((a: any) => String(a.id)) || [],
          warehouse: existing.warehouse?.map((w: any) => String(w.id)) || [],
          route: existing.route?.map((r: any) => String(r.id)) || [],
          company: existing.companies?.map((c: any) => String(c.id)) || [],
          days: existing.days || [],
          from_date: formatDate(existing.from_date),
          to_date: formatDate(existing.to_date),
          status: statusValue, // ✅ Use the properly converted value
        });

        // Set customer type for fetching customers
        setSelectedCustomerType(existing.customer_type || "1");

        // Create customer schedule from the API response
        if (existing.customer && existing.customer.id) {
          const schedule: CustomerSchedule = {
            customer_id: existing.customer.id,
            days: existing.days || [],
          };
          setCustomerSchedules([schedule]);
        }

        console.log("Form set with values:", {
          salesman_type: existing.customer_type,
          region: existing.region?.map((r: any) => String(r.id)),
          area: existing.area?.map((a: any) => String(a.id)),
          warehouse: existing.warehouse?.map((w: any) => String(w.id)),
          route: existing.route?.map((r: any) => String(r.id)),
          company: existing.companies?.map((c: any) => String(c.id)),
          days: existing.days,
          from_date: formatDate(existing.from_date),
          to_date: formatDate(existing.to_date),
          status: statusValue, // ✅ Log the correct value
        });
      } else {
        showSnackbar("Route visit not found", "error");
      }
    } catch (error) {
      console.error("Error loading visit data:", error);
      showSnackbar("Failed to fetch route visit details", "error");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        let res = null;
        res = await agentCustomerList({ type: form.salesman_type });

        console.log("Fetched customers:", res);
        setCustomers(res.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      }
    };

    if (form.salesman_type) {
      fetchCustomers();
    }
  }, [form.salesman_type]);

  // ✅ When Company changes → Fetch Regions
  useEffect(() => {
    if (!form.company.length) {
      setRegionOptions([]);
      setForm((prev) => ({
        ...prev,
        region: [],
        area: [],
        warehouse: [],
        route: [],
      }));
      return;
    }

    const fetchRegions = async () => {
      try {
        setSkeleton({ ...skeleton, region: true });
        // Pass company IDs as parameters to regionList
        const regions = await regionList({
          company_id: form.company.join(","),
        });
        setRegionOptions(
          regions?.data?.map((r: any) => ({
            value: String(r.id),
            label: r.region_name || r.name,
          })) || []
        );
        setSkeleton({ ...skeleton, region: false });
      } catch (err) {
        console.error("Failed to fetch region list:", err);
        setRegionOptions([]);
      }
    };

    fetchRegions();
  }, [form.company]);

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
        const res = await subRegionList({ region_id: form.region.join(",") });
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
        const res = await warehouseList({ area_id: form.area.join(",") });
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
    // isEditMode && setLoading(true);
    if (!form.warehouse.length) {
      setRouteOptions([]);
      setForm((prev) => ({ ...prev, route: [] }));
      return;
    }

    const fetchRoutes = async () => {
      try {
        setSkeleton({ ...skeleton, route: true });
        const res = await routeList({ warehouse_id: form.warehouse.join(",") });
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

      isEditMode && setLoading(false);
    };

    fetchRoutes();
  }, [form.warehouse]);

  useEffect(() => {
    loadDropdownData();
    if (isEditMode && visitId) {
      console.log("Loading edit data for ID:", visitId);
      loadVisitData(visitId);
    }
  }, [isEditMode, visitId]);

  // ✅ Multi-select handler
  const handleMultiSelectChange = (field: string, value: string[]) => {
    if (field == "salesman_type") {
      console.log(value);
      setSelectedCustomerType(value[0] || "");
      setForm((prev) => ({ ...prev, [field]: value[0] || "" }));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: value,
        // Reset dependent fields when parent changes
        ...(field === "company" && {
          region: [],
          area: [],
          warehouse: [],
          route: [],
        }),
        ...(field === "region" && { area: [], warehouse: [], route: [] }),
        ...(field === "area" && { warehouse: [], route: [] }),
        ...(field === "warehouse" && { route: [] }),
      }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Step navigation
  const handleNext = async () => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(form, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
      setErrors({});
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      }
    }
  };

  // ✅ Convert rowStates object to array format
  const convertRowStatesToSchedules = (rowStates: Record<number, any>) => {
    return Object.entries(rowStates)
      .map(([customerId, daysObj]) => {
        const days = Object.entries(daysObj)
          .filter(([_, isSelected]) => isSelected)
          .map(([day]) => day);
        return {
          customer_id: Number(customerId),
          days,
        };
      })
      .filter((schedule) => schedule.days.length > 0);
  };

  // ✅ Handle submit
  const handleSubmit = async () => {
    try {
      if (form.from_date && form.to_date) {
        const fromDate = new Date(form.from_date);
        const toDate = new Date(form.to_date);
        if (toDate < fromDate) {
          setErrors({
            ...errors,
            to_date: "To Date must be after or equal to From Date",
          });
          return;
        }
      }

      console.log("Form data:", form);
      console.log("Raw customerSchedules (rowStates):", customerSchedules);

      // ✅ Convert your raw object to expected format
      const formattedSchedules = convertRowStatesToSchedules(customerSchedules);

      console.log("✅ Converted customer schedules:", formattedSchedules);

      // Validate if at least one customer has days
      if (formattedSchedules.length === 0) {
        showSnackbar("Please select days for at least one customer", "error");
        return;
      }

      setErrors({});
      setSubmitting(true);

      // ✅ Build payload in correct format
      const payload = {
        customer_type: Number(form.salesman_type),
        customers: formattedSchedules.map((schedule) => ({
          customer_id: Number(schedule.customer_id),
          company_id: form.company.join(","),
          region: form.region.join(","),
          area: form.area.join(","),
          warehouse: form.warehouse.join(","),
          route: form.route.join(","),
          days: schedule.days.join(","), // ✅ Join days
          from_date: form.from_date,
          to_date: form.to_date,
          status: Number(form.status),
        })),
      };

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      let res;
      if (isEditMode && visitId) {
        console.log("Updating existing route visit...");
        res = await updateRouteVisitDetails(payload);
      } else {
        console.log("Creating new route visit...");
        res = await saveRouteVisit(payload);
      }

      if (res?.error) {
        console.error("API Error:", res.error);
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
      console.error("Error in handleSubmit:", err);

      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix the form errors", "error");
      } else {
        showSnackbar("Failed to submit form", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* From Date */}
              <div>
                <InputFields
                  required
                  label="From Date"
                  type="date"
                  value={form.from_date.slice(0, 10)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, from_date: e.target.value }))
                  }
                  error={errors.from_date}
                />
              </div>

              {/* To Date */}
              <div>
                <InputFields
                  required
                  label="To Date"
                  type="date"
                  value={form.to_date.slice(0, 10)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, to_date: e.target.value }))
                  }
                  error={errors.to_date}
                />
              </div>

              {/* Company - Multi Select */}
              <div>
                <InputFields
                  required
                  label="Company"
                  value={form.company}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "company",
                      Array.isArray(e.target.value) ? e.target.value : []
                    )
                  }
                  showSkeleton={skeleton.company}
                  options={companyOptions}
                  isSingle={false}
                  error={errors.company}
                />
              </div>

              {/* Region - Multi Select */}
              <div>
                <InputFields
                  required
                  disabled={form.company.length === 0}
                  label="Region"
                  value={form.region}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "region",
                      Array.isArray(e.target.value) ? e.target.value : []
                    )
                  }
                  options={regionOptions}
                  showSkeleton={skeleton.region}
                  isSingle={false}
                  error={errors.region}
                />
              </div>

              {/* Area - Multi Select */}
              <div>
                <InputFields
                  required
                  disabled={form.region.length === 0}
                  label="Area"
                  value={form.area}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "area",
                      Array.isArray(e.target.value) ? e.target.value : []
                    )
                  }
                  showSkeleton={skeleton.area}
                  options={areaOptions}
                  isSingle={false}
                  error={errors.area}
                />
              </div>

              {/* Warehouse - Multi Select */}
              <div>
                <InputFields
                  required
                  disabled={form.area.length === 0 || areaOptions.length === 0}
                  label="Warehouse"
                  value={form.warehouse}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "warehouse",
                      Array.isArray(e.target.value) ? e.target.value : []
                    )
                  }
                  showSkeleton={skeleton.warehouse}
                  options={warehouseOptions}
                  isSingle={false}
                  error={errors.warehouse}
                />
              </div>

              {/* Route - Multi Select */}
              <div>
                <InputFields
                  required
                  disabled={form.warehouse.length === 0}
                  label="Route"
                  value={form.route}
                  onChange={(e) =>
                    handleMultiSelectChange(
                      "route",
                      Array.isArray(e.target.value) ? e.target.value : []
                    )
                  }
                  showSkeleton={skeleton.route}
                  options={routeOptions}
                  isSingle={false}
                  error={errors.route}
                />
              </div>

              {/* Status */}
              <div>
                <InputFields
                  required
                  label="Status"
                  type="radio"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  error={errors.status}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Salesman Type */}
                <div>
                  <InputFields
                    required
                    label="Salesman Type"
                    value={form.salesman_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        salesman_type: e.target.value,
                      }))
                    }
                    options={[
                      { value: "1", label: "Agent Customer" },
                      { value: "2", label: "Merchandiser" },
                    ]}
                    error={errors.salesman_type}
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Customer Schedule
              </h3>
              <Table
                customers={customers}
                setCustomerSchedules={setCustomerSchedules}
                initialSchedules={customerSchedules}
                loading={loading}
                editMode={isEditMode}
                visitUuid={visitId} // Pass the visit ID when in edit mode
              />
            </div>
          </div>
        );
      default:
        return null;
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
    <div className="pb-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/routeVisit">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Route Visit" : "Add Route Visit"}
          </h1>
        </div>
      </div>

      {/* Stepper Form */}
      <StepperForm
        steps={steps.map((step) => ({
          ...step,
          isCompleted: isStepCompleted(step.id),
        }))}
        currentStep={currentStep}
        onBack={prevStep}
        onNext={handleNext}
        onSubmit={handleSubmit}
        showSubmitButton={isLastStep}
        showNextButton={!isLastStep}
        nextButtonText="Save & Next"
        submitButtonText={submitting ? "Submitting..." : "Submit"}
      >
        {renderStepContent()}
      </StepperForm>
    </div>
  );
}
