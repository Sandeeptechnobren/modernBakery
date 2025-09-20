"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { addVehicle, warehouseList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";


interface Warehouse {
  id: number;
  warehouse_name: string;
}

interface VehicleFormValues {
  vehicleBrand: string;
  numberPlate: string;
  chassisNumber: string;
  description: string;
  vehicleType: string;
  ownerType: string;
  warehouseId: string;
  odoMeter: string;
  capacity: string;
  status: "active" | "inactive";
}

// Yup validation
const VehicleSchema = Yup.object().shape({
  vehicleBrand: Yup.string().required("Vehicle Brand is required"),
  numberPlate: Yup.string().required("Number Plate is required"),
  description: Yup.string().required("Description is required"),
  chassisNumber: Yup.string().required("Chassis Number is required"),
  vehicleType: Yup.string().required("Vehicle Type is required"),
  ownerType: Yup.string().required("Owner Type is required"),
  warehouseId: Yup.string().required("Warehouse is required"),
  odoMeter: Yup.string().required("Odometer is required"),
  capacity: Yup.string().required("Capacity is required"),
  status: Yup.string().oneOf(["active", "inactive"]).required(),
});

export default function AddVehicle() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseList();
        if (res?.data && Array.isArray(res.data)) {
          setWarehouses(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch warehouses ❌", err);
        showSnackbar("Failed to fetch warehouses ❌", "error");
      }
    };
    fetchWarehouses();
  }, [showSnackbar]);

  // submit handler
  const handleSubmit = async (values: VehicleFormValues) => {
    try {
      // convert all values to string
      const payload: Record<string, string> = {
        number_plat: values.numberPlate,
        vehicle_chesis_no: values.chassisNumber,
        description: values.vehicleBrand,
        capacity: values.capacity,
        discription: values.description,
        vehicle_type: values.vehicleType,
        owner_type: values.ownerType,
        warehouse_id: values.warehouseId,
        opening_odometer: values.odoMeter,
        status: values.status === "active" ? "1" : "0",
        valid_from: new Date().toISOString().split("T")[0],
        valid_to: "2026-09-01",
      };

      const res = await addVehicle(payload);
      if (res?.error) {
        showSnackbar(res.message || "Failed to add vehicle ❌", "error");
      } else {
        showSnackbar("Vehicle added successfully ✅", "success");
        router.push("/dashboard/master/vehicle");
      }
    } catch (err) {
      console.error("Add vehicle failed ❌", err);
      showSnackbar("Add vehicle failed ❌", "error");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Link href="/dashboard/master/vehicle">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
            Add New Vehicle
          </h1>
        </div>
      </div>

      <Formik<VehicleFormValues>
        initialValues={{
          vehicleBrand: "",
          numberPlate: "",
          chassisNumber: "",
          vehicleType: "",
          description: "",
          ownerType: "",
          warehouseId: "",
          odoMeter: "",
          capacity: "",
          status: "active",
        }}
        validationSchema={VehicleSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form className="space-y-8">
            {/* Vehicle Details */}
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields label="Vehicle Brand" value={values.vehicleBrand} onChange={handleChange} name="vehicleBrand" />
                <InputFields label="Number Plate" value={values.numberPlate} onChange={handleChange} name="numberPlate" />
                <InputFields label="Chassis Number" value={values.chassisNumber} onChange={handleChange} name="chassisNumber" />
                <InputFields
                  label="Vehicle Type"
                  value={values.vehicleType}
                  onChange={handleChange}
                  name="vehicleType"
                  options={[
                    { value: "1", label: "Truck" },
                    { value: "2", label: "Van" },
                    { value: "3", label: "Bike" },
                    { value: "4", label: "Tuktuk" },
                  ]}
                />

                <InputFields
                  label="Discription"
                  value={values.description}
                  onChange={handleChange}
                  name="description"
                />
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields
                  label="Owner Type"
                  value={values.ownerType}
                  onChange={handleChange}
                  name="ownerType"
                  options={[
                    { value: "0", label: "Company Owned" },
                    { value: "1", label: "Contractor" },
                  ]}
                />
                <InputFields
                  label="Warehouse"
                  value={values.warehouseId}
                  onChange={handleChange}
                  name="warehouseId"
                  options={warehouses.map((w) => ({ value: String(w.id), label: w.warehouse_name }))}
                />
                <InputFields
                  label="Route Type"
                  value={values.odoMeter}
                  onChange={handleChange}
                  name="odoMeter"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFields label="Odo Meter" value={values.odoMeter} onChange={handleChange} name="odoMeter" />
                <InputFields label="Capacity" value={values.capacity} onChange={handleChange} name="capacity" />
                <InputFields
                  label="Status"
                  value={values.status}
                  onChange={handleChange}
                  name="status"
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pr-0 mt-4">
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => router.push("/dashboard/master/vehicle")}
              >
                Cancel
              </button>
              <SidebarBtn label="Submit" isActive={true} leadingIcon="mdi:check" type="submit" />
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
