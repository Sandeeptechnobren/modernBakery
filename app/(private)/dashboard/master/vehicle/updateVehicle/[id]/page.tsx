"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { warehouseList, getVehicleById, updateVehicle } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";

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
  validFrom: string;
  validTo: string;
}

const VehicleSchema = Yup.object().shape({
  vehicleBrand: Yup.string().required("Vehicle Brand is required"),
  numberPlate: Yup.string().required("Number Plate is required"),
  chassisNumber: Yup.string().required("Chassis Number is required"),
  description: Yup.string().required("Description is required"),
  vehicleType: Yup.string().required("Vehicle Type is required"),
  ownerType: Yup.string().required("Owner Type is required"),
  warehouseId: Yup.string().required("Warehouse is required"),
  odoMeter: Yup.string().required("Odometer is required"),
  capacity: Yup.string().required("Capacity is required"),
  status: Yup.string().oneOf(["active", "inactive"]).required("Status is required"),
  validFrom: Yup.date().required("Valid From date is required"),
  validTo: Yup.date()
    .min(Yup.ref("validFrom"), "Valid To must be after Valid From")
    .required("Valid To date is required"),
});

export default function UpdateVehicleWithStepper() {
  const steps: StepperStep[] = [
    { id: 1, label: "Vehicle Details" },
    { id: 2, label: "Location Information" },
    { id: 3, label: "Additional Information" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<VehicleFormValues>({
    vehicleBrand: "",
    numberPlate: "",
    chassisNumber: "",
    description: "",
    vehicleType: "",
    ownerType: "",
    warehouseId: "",
    odoMeter: "",
    capacity: "",
    status: "active",
    validFrom: "",
    validTo: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof VehicleFormValues, boolean>>>({});

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseList();
        if (res?.data && Array.isArray(res.data)) setWarehouses(res.data);
      } catch (err) {
        showSnackbar("Failed to fetch warehouses ❌", "error");
      }
    };
    fetchWarehouses();
  }, [showSnackbar]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      showSnackbar("Vehicle ID is missing ❌", "error");
      return;
    }
    const fetchVehicle = async () => {
      try {
        const res = await getVehicleById(id);
        if (res?.data) {
          const vehicle = res.data;
          setForm({
            vehicleBrand: vehicle.vehicle_brand || "",
            numberPlate: vehicle.number_plat || "",
            chassisNumber: vehicle.vehicle_chesis_no || "",
            description: vehicle.description || "",
            vehicleType: vehicle.vehicle_type || "",
            ownerType: vehicle.owner_type || "",
            warehouseId: String(vehicle.warehouse_id) || "",
            odoMeter: vehicle.opening_odometer || "",
            capacity: vehicle.capacity || "",
            status: vehicle.status === 1 ? "active" : "inactive",
            validFrom: vehicle.valid_from || "",
            validTo: vehicle.valid_to || "",
          });
        } else {
          showSnackbar("Vehicle data not found ❌", "error");
        }
      } catch (err) {
        showSnackbar("Failed to fetch vehicle ❌", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, showSnackbar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateCurrentStep = async (step: number) => {
    let fields: (keyof VehicleFormValues)[] = [];
    if (step === 1) fields = ["vehicleBrand", "numberPlate", "chassisNumber", "description", "vehicleType"];
    if (step === 2) fields = ["ownerType", "warehouseId"];
    if (step === 3) fields = ["odoMeter", "capacity", "status", "validFrom", "validTo"];
    try {
      await VehicleSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const stepErrors: Partial<Record<keyof VehicleFormValues, string>> = {};
        if (Array.isArray(err.inner)) {
          err.inner.forEach((validationErr) => {
            const path = validationErr.path as keyof VehicleFormValues;
            if (fields.includes(path)) {
              stepErrors[path] = validationErr.message;
            }
          });
        }
        setErrors(prev => ({ ...prev, ...stepErrors }));
        setTouched(prev => ({ ...prev, ...Object.fromEntries(fields.map(f => [f, true])) }));
        return Object.keys(stepErrors).length === 0;
      }
      return false;
    }
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (valid) {
      markStepCompleted(currentStep);
      nextStep();
    } else {
      showSnackbar("Please fill in all required fields before proceeding.", "error");
    }
  };

  const handleSubmit = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (!valid) {
      showSnackbar("Please fill in all required fields before submitting.", "error");
      return;
    }
    try {
      if (!id) return;
      const payload = {
        number_plate: form.numberPlate,
        vehicle_chassis_no: form.chassisNumber,
        description: form.description,
        vehicle_brand: form.vehicleBrand,
        capacity: form.capacity,
        vehicle_type: form.vehicleType,
        owner_type: form.ownerType,
        warehouse_id: form.warehouseId,
        opening_odometer: form.odoMeter,
        status: form.status === "active" ? "1" : "0",
        valid_from: form.validFrom,
        valid_to: form.validTo,
      };
      const res = await updateVehicle(id, payload);
      if (res?.error) {
        showSnackbar(res.message || "Failed to update vehicle ❌", "error");
      } else {
        showSnackbar("Vehicle updated successfully ✅", "success");
        router.push("/dashboard/master/vehicle");
      }
    } catch (err) {
      showSnackbar("Update vehicle failed ❌", "error");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields label="Vehicle Brand" value={form.vehicleBrand} onChange={handleChange} name="vehicleBrand" error={touched.vehicleBrand && errors.vehicleBrand} />
              <InputFields label="Number Plate" value={form.numberPlate} onChange={handleChange} name="numberPlate" error={touched.numberPlate && errors.numberPlate} />
              <InputFields label="Chassis Number" value={form.chassisNumber} onChange={handleChange} name="chassisNumber" error={touched.chassisNumber && errors.chassisNumber} />
              <InputFields label="Description" value={form.description} onChange={handleChange} name="description" error={touched.description && errors.description} />
              <InputFields label="Vehicle Type" value={form.vehicleType} onChange={handleChange} name="vehicleType" error={touched.vehicleType && errors.vehicleType} options={[
                { value: "1", label: "Truck" },
                { value: "2", label: "Van" },
                { value: "3", label: "Bike" },
                { value: "4", label: "Tuktuk" },
              ]} />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields label="Owner Type" value={form.ownerType} onChange={handleChange} name="ownerType" error={touched.ownerType && errors.ownerType} options={[
                { value: "0", label: "Company Owned" },
                { value: "1", label: "Contractor" },
              ]} />
              <InputFields label="Warehouse" value={form.warehouseId} onChange={handleChange} name="warehouseId" error={touched.warehouseId && errors.warehouseId} options={warehouses.map((w) => ({ value: String(w.id), label: w.warehouse_name }))} />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields label="Odo Meter" value={form.odoMeter} onChange={handleChange} name="odoMeter" error={touched.odoMeter && errors.odoMeter} />
              <InputFields label="Capacity" value={form.capacity} onChange={handleChange} name="capacity" error={touched.capacity && errors.capacity} />
              <InputFields label="Status" value={form.status} onChange={handleChange} name="status" error={touched.status && errors.status} options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]} />
              <InputFields label="Valid From" type="date" value={form.validFrom} onChange={handleChange} name="validFrom" error={touched.validFrom && errors.validFrom} />
              <InputFields label="Valid To" type="date" value={form.validTo} onChange={handleChange} name="validTo" error={touched.validTo && errors.validTo} />
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
   <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/master/vehicle">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Update Vehicle
          </h1>
        </div>
      </div>
      <StepperForm
        steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
        currentStep={currentStep}
        onStepClick={() => {}}
        onBack={prevStep}
        onNext={handleNext}
        onSubmit={handleSubmit}
        showSubmitButton={isLastStep}
        showNextButton={!isLastStep}
        nextButtonText="Save & Next"
        submitButtonText="Update"
      >
        {renderStepContent()}
      </StepperForm>
    </>
  );
}