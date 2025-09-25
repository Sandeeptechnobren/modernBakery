"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { addVehicle, warehouseList } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import SearchableDropdown from "@/app/components/SearchableDropdown";

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

export default function AddVehicleWithStepper() {
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
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const setFieldValue = (field: string, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      setTouched(prev => ({ ...prev, [field]: true }));
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
      // Yup.ValidationError type
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
      // Unexpected error
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
      const res = await addVehicle(payload);
      if (res?.error) {
        showSnackbar(res.message || "Failed to add vehicle ❌", "error");
      } else {
        showSnackbar("Vehicle added successfully ✅", "success");
        router.push("/dashboard/master/vehicle");
      }
    } catch (err) {
      showSnackbar("Add vehicle failed ❌", "error");
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
              <SearchableDropdown  label="Vehicle Type" value={form.vehicleType} onChange={(val) => setFieldValue("vehicleType", String(val))} name="vehicleType" error={touched.vehicleType && errors.vehicleType} options={[
                { value: "1", label: "Truck" },
                { value: "2", label: "Van" },
                { value: "3", label: "Bike" },
                { value: "4", label: "Tuktuk" },
              ]} />
              <InputFields label="Description" value={form.description} onChange={handleChange} name="description" error={touched.description && errors.description} />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <h2 className="text-lg font-semibold mb-6">Location Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableDropdown label="Owner Type" value={form.ownerType} onChange={(val) => setFieldValue("ownerType", String(val))} name="ownerType" error={touched.ownerType && errors.ownerType} options={[
                { value: "0", label: "Company Owned" },
                { value: "1", label: "Contractor" },
              ]} />
              <SearchableDropdown label="Warehouse" value={form.warehouseId} onChange={(val) => setFieldValue("warehouseId", String(val))} name="warehouseId" error={touched.warehouseId && errors.warehouseId} options={warehouses.map((w) => ({ value: String(w.id), label: w.warehouse_name }))} />
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
              <SearchableDropdown label="Status" value={form.status} onChange={(val) => setFieldValue("status", String(val))} name="status" error={touched.status && errors.status} options={[
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>
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
        submitButtonText="Submit"
      >
        {renderStepContent()}
      </StepperForm>
    </div>
  );
}
