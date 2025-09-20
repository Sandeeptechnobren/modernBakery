"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import SearchableDropdown from "@/app/components/SearchableDropdown";
import Loading from "@/app/components/Loading";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getVehicleById, updateVehicle } from "@/app/services/allApi";

interface VehicleForm {
  vehicle_code: string;
  vehicle_name: string;
  vehicle_type: string;
  vehicle_category: string;
  registration_no: string;
  status: "Active" | "Inactive";
}

const validationSchema = Yup.object({
  vehicle_code: Yup.string().required("Vehicle code is required"),
  vehicle_name: Yup.string().required("Vehicle name is required"),
  vehicle_type: Yup.string().required("Vehicle type is required"),
  vehicle_category: Yup.string().required("Vehicle category is required"),
  registration_no: Yup.string().required("Registration number is required"),
  status: Yup.string().oneOf(["Active", "Inactive"]).required(),
});

// Static options for vehicle type and category
const VEHICLE_TYPES = [
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "car", label: "Car" },
];

const VEHICLE_CATEGORIES = [
  { value: "heavy", label: "Heavy" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
];

export default function UpdateVehiclePage() {
  const params = useParams();
  const vehicleId = params?.id as string | undefined;
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<VehicleForm>({
    vehicle_code: "",
    vehicle_name: "",
    vehicle_type: VEHICLE_TYPES[0].value,
    vehicle_category: VEHICLE_CATEGORIES[0].value,
    registration_no: "",
    status: "Active",
  });

  // Fetch current vehicle data
  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        const res = await getVehicleById(vehicleId);
        const vehicle = res?.data?.data || res?.data;
        if (!vehicle) throw new Error("Vehicle not found");

        setInitialValues({
          vehicle_code: vehicle.vehicle_code || "",
          vehicle_name: vehicle.vehicle_name || "",
          vehicle_type: vehicle.vehicle_type || VEHICLE_TYPES[0].value,
          vehicle_category: vehicle.vehicle_category || VEHICLE_CATEGORIES[0].value,
          registration_no: vehicle.registration_no || "",
          status: vehicle.status === 1 ? "Active" : "Inactive",
        });
      } catch (err) {
        console.error("Failed to fetch vehicle ❌", err);
        showSnackbar("Failed to fetch vehicle ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId, showSnackbar]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values: VehicleForm) => {
      if (!vehicleId) return;

      try {
        // ✅ Build FormData instead of raw object
        const formData = new FormData();
        formData.append("vehicle_code", values.vehicle_code.trim());
        formData.append("vehicle_name", values.vehicle_name.trim());
        formData.append("vehicle_type", values.vehicle_type);
        formData.append("vehicle_category", values.vehicle_category);
        formData.append("registration_no", values.registration_no.trim());
        formData.append("status", values.status === "Active" ? "1" : "0");

        console.log("Submitting payload:", Object.fromEntries(formData.entries()));
        await updateVehicle(vehicleId, formData);

        showSnackbar("Vehicle updated successfully ✅", "success");
        router.push("/dashboard/vehicle");
      } catch (err) {
        console.error("Update failed ❌", err);
        showSnackbar("Failed to update vehicle ❌", "error");
      }
    },
  });

  if (loading) return <Loading />;

  return (
    <ContainerCard>
      <div className="flex justify-between mb-4">
        <h1 className="text-[20px] font-semibold">Update Vehicle</h1>
        <SidebarBtn href="/dashboard/vehicle" label="Back" />
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        {/* Vehicle Code */}
        <InputFields
          label="Vehicle Code"
          name="vehicle_code"
          value={formik.values.vehicle_code}
          onChange={(e) => formik.setFieldValue("vehicle_code", e.target.value)}
        />

        {/* Vehicle Name */}
        <InputFields
          label="Vehicle Name"
          name="vehicle_name"
          value={formik.values.vehicle_name}
          onChange={(e) => formik.setFieldValue("vehicle_name", e.target.value)}
        />

        {/* Vehicle Type */}
        <SearchableDropdown
          label="Vehicle Type"
          name="vehicle_type"
          value={formik.values.vehicle_type}
          options={VEHICLE_TYPES}
          onChange={(val) => formik.setFieldValue("vehicle_type", String(val))}
        />

        {/* Vehicle Category */}
        <SearchableDropdown
          label="Vehicle Category"
          name="vehicle_category"
          value={formik.values.vehicle_category}
          options={VEHICLE_CATEGORIES}
          onChange={(val) => formik.setFieldValue("vehicle_category", String(val))}
        />

        {/* Registration Number */}
        <InputFields
          label="Registration Number"
          name="registration_no"
          value={formik.values.registration_no}
          onChange={(e) => formik.setFieldValue("registration_no", e.target.value)}
        />

        {/* Status */}
        <InputFields
          label="Status"
          name="status"
          type="select"
          value={formik.values.status}
          options={[
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          onChange={(e) => formik.setFieldValue("status", e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/vehicle")}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <SidebarBtn label="Update" isActive type="submit" leadingIcon="mdi:check" />
        </div>
      </form>
    </ContainerCard>
  );
}
