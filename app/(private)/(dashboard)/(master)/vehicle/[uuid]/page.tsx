"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import StepperForm, {
  StepperStep,
  useStepperForm,
} from "@/app/components/stepperForm";
import {
  addVehicle,
  genearateCode,
  getVehicleById,
  saveFinalCode,
  updateVehicle,
  warehouseList,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

interface Warehouse {
  id: number;
  warehouse_name: string;
}

interface VehicleFormValues {
  vehicle_code: string;
  vehicleBrand: string;
  numberPlate: string;
  chassisNumber: string;
  description: string;
  vehicleType: string;
  ownerType: string;
  warehouseId: string;
  odoMeter: string;
  capacity: string;
  fuel_reading: string;
  status: string;
  validFrom: string;
  validTo: string;
}

const VehicleSchema = Yup.object().shape({
  vehicleBrand: Yup.string().required("Vehicle Brand is required"),
  numberPlate: Yup.string().required("Number Plate is required"),
  chassisNumber: Yup.string().required("Chassis Number is required"),
  vehicleType: Yup.string().required("Vehicle Type is required"),
  ownerType: Yup.string().required("Owner Type is required"),
  odoMeter: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Odometer is required"),
  capacity: Yup.string()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Capacity is required"),
  fuel_reading: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Fuel Reading is required")
    .max(999, "Fuel Reading must be at most 3 digits"),

  status: Yup.string().required("Status is required"),
  validFrom: Yup.date()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .required("Valid From date is required"),
  validTo: Yup.date()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .min(Yup.ref("validFrom"), "Valid To must be after Valid From")
    .required("Valid To date is required"),
});

export default function AddEditVehicleWithStepper() {
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
    isLastStep,
  } = useStepperForm(steps.length);
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [prefix, setPrefix] = useState("");
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const uuid = Array.isArray(params?.uuid) ? params.uuid[0] : params?.uuid;
  const isEditMode = uuid !== undefined && uuid !== "add";
  const { warehouseOptions } = useAllDropdownListData();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<VehicleFormValues>({
    vehicle_code: "",
    vehicleBrand: "",
    numberPlate: "",
    chassisNumber: "",
    description: "",
    vehicleType: "",
    ownerType: "",
    warehouseId: "",
    odoMeter: "",
    capacity: "",
    status: "1",
    fuel_reading: "",
    validFrom: "",
    validTo: "",
  });

  // Prevent double call of genearateCode in add mode
  const codeGeneratedRef = useRef(false);
  useEffect(() => {
    if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        setLoading(true);
        const res = await genearateCode({ model_name: "vehicle" });
        setLoading(false);
        if (res?.code) {
          setForm((prev) => ({ ...prev, vehicle_code: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
          const match = res.prefix;
          if (match) setPrefix(prefix);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof VehicleFormValues, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof VehicleFormValues, boolean>>
  >({});

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseList();
        if (res?.data && Array.isArray(res.data)) setWarehouses(res.data);
      } catch (err) {
        showSnackbar("Failed to fetch warehouses", "error");
      }
    };
    fetchWarehouses();
  }, [showSnackbar]);

  useEffect(() => {
    if (isEditMode && uuid) {
      setLoading(true);
      (async () => {
        try {
          const res = await getVehicleById(uuid);
          if (res?.data) {
            const vehicle = res.data;
            setForm({
              vehicle_code: vehicle.vehicle_code || "",
              vehicleBrand: vehicle.vehicle_brand || "",
              numberPlate: vehicle.number_plat || "",
              chassisNumber: vehicle.vehicle_chesis_no || "",
              description: vehicle.description || "",
              vehicleType: vehicle.vehicle_type || "",
              ownerType: vehicle.owner_type || "",
              warehouseId: vehicle.warehouse?.id?.toString() || "",
              odoMeter: vehicle.opening_odometer || "",
              capacity: vehicle.capacity || "",
              fuel_reading: vehicle.fuel_reading || "",
              status: vehicle.status === 1 ? "1" : "0",
              validFrom: vehicle.valid_from || "",
              validTo: vehicle.valid_to || "",
            });
          } else {
            showSnackbar("Vehicle data not found", "error");
          }
        } catch (err) {
          showSnackbar("Failed to fetch vehicle", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, uuid, showSnackbar]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // ✅ Remove error if user has typed something
    setErrors((prev) => {
      if (prev[name as keyof VehicleFormValues]) {
        const newErrors = { ...prev };
        delete newErrors[name as keyof VehicleFormValues];
        return newErrors;
      }
      return prev;
    });
  };

  const setFieldValue = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateCurrentStep = async (step: number) => {
    let fields: (keyof VehicleFormValues)[] = [];
    if (step === 1)
      fields = ["vehicleBrand", "numberPlate", "chassisNumber", "vehicleType"];
    if (step === 2) fields = ["ownerType", "warehouseId"];
    if (step === 3)
      fields = [
        "odoMeter",
        "capacity",
        "status",
        "validFrom",
        "validTo",
        "description",
      ];
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
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        setTouched((prev) => ({
          ...prev,
          ...Object.fromEntries(fields.map((f) => [f, true])),
        }));
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
      showSnackbar(
        "Please fill in all required fields before proceeding.",
        "error",
      );
    }
  };

  const handleSubmit = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (!valid) {
      showSnackbar(
        "Please fill in all required fields before submitting.",
        "error",
      );
      return;
    }

    try {
      const finalWarehouseId =
        form.ownerType === "company" ? "" : form.warehouseId;
      const payload = {
        vehicle_code: form.vehicle_code,
        number_plat: form.numberPlate,
        vehicle_chesis_no: form.chassisNumber,
        description: form.description,
        vehicle_brand: form.vehicleBrand,
        capacity: form.capacity,
        fuel_reading: form.fuel_reading,
        vehicle_type: form.vehicleType,
        owner_type: form.ownerType,
        warehouse_id: finalWarehouseId, // ← updated
        opening_odometer: form.odoMeter,
        status: Number(form.status) || 0,
        valid_from: form.validFrom,
        valid_to: form.validTo,
      };

      let res;

      if (isEditMode && uuid) {
        res = await updateVehicle(uuid, payload);
      } else {
        res = await addVehicle(payload);

        if (!res?.error) {
          try {
            await saveFinalCode({
              reserved_code: form.vehicle_code,
              model_name: "vehicle",
            });
          } catch (e) {
            // optional
          }
        }
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Vehicle updated successfully"
            : "Vehicle added successfully",
          "success",
        );
        router.push("/vehicle");
      }
    } catch (err) {
      showSnackbar(
        isEditMode ? "Update vehicle failed" : "Add vehicle failed",
        "error",
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <h2
              className="
                mb-6
                text-lg font-semibold
              "
            >
              Vehicle Details
            </h2>
            <div
              className="
                grid grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >
              <div
                className="
                  flex
                  max-w-[406px]
                  items-start gap-2
                "
              >
                <InputFields
                  label="Vehicle Code"
                  name="vehicle_code"
                  value={form.vehicle_code}
                  onChange={handleChange}
                  disabled={codeMode === "auto"}
                />
                {/* {!isEditMode && (
                  <>
                    <IconButton
                      bgClass="white"
                       className="  cursor-pointer text-[#252B37] pt-12"
                      icon="mi:settings"
                      onClick={() => setIsOpen(true)}
                    />
                    <SettingPopUp
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      title="Vehicle Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === "auto" && code) {
                          setForm((prev) => ({ ...prev, vehicle_code: code }));
                        } else if (mode === "manual") {
                          setForm((prev) => ({ ...prev, vehicle_code: "" }));
                        }
                      }}
                    />
                  </>
                )} */}
              </div>
              <div>
                <InputFields
                  required
                  label="Vehicle Brand"
                  value={form.vehicleBrand}
                  onChange={handleChange}
                  name="vehicleBrand"
                  error={touched.vehicleBrand && errors.vehicleBrand}
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Number Plate"
                  value={form.numberPlate}
                  onChange={handleChange}
                  name="numberPlate"
                  error={touched.numberPlate && errors.numberPlate}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Chassis Number"
                  value={form.chassisNumber}
                  onChange={handleChange}
                  name="chassisNumber"
                  error={touched.chassisNumber && errors.chassisNumber}
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Vehicle Type"
                  value={form.vehicleType}
                  onChange={handleChange}
                  name="vehicleType"
                  error={touched.vehicleType && errors.vehicleType}
                  options={[
                    { value: "truck", label: "Truck" },
                    { value: "van", label: "Van" },
                    { value: "bike", label: "Bike" },
                    { value: "tuktuk", label: "Tuktuk" },
                  ]}
                />
              </div>
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <h2
              className="
                mb-6
                text-lg font-semibold
              "
            >
              Location Information
            </h2>
            <div
              className="
                grid grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >
              <div>
                <InputFields
                  required
                  label="Owner Type"
                  value={form.ownerType}
                  onChange={handleChange}
                  name="ownerType"
                  error={touched.ownerType && errors.ownerType}
                  options={[
                    { value: "company", label: "Company" },
                    { value: "agent", label: "Agent" },
                  ]}
                />
              </div>

              {form.ownerType !== "company" && (
                <div>
                  <InputFields
                    label="Warehouse"
                    value={form.warehouseId}
                    searchable={true}
                    onChange={handleChange}
                    name="warehouseId"
                    options={warehouseOptions}
                  />
                </div>
              )}
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <h2
              className="
                mb-6
                text-lg font-semibold
              "
            >
              Additional Information
            </h2>
            <div
              className="
                grid grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >
              <div>
                <InputFields
                  required
                  label="Odometer"
                  value={form.odoMeter}
                  onChange={handleChange}
                  name="odoMeter"
                  error={touched.odoMeter && errors.odoMeter}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  name="capacity"
                  error={touched.capacity && errors.capacity}
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Fuel Reading"
                  type="number"
                  value={form.fuel_reading}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  name="fuel_reading"
                  maxLength={3}
                  error={touched.fuel_reading && errors.fuel_reading}
                />
                {/* {touched.fuel_reading && errors.fuel_reading && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.fuel_reading}
                  </div>
                )} */}
              </div>
              <div>
                <InputFields
                  label="Description"
                  value={form.description}
                  onChange={handleChange}
                  name="description"
                />
                {/* {touched.description && errors.description && (
                  <div className="text-red-500 text-xs mt-1">
                    {/* {errors.description} */}
              </div>

              <div>
                <InputFields
                  required
                  label="Valid From"
                  type="date"
                  value={form.validFrom}
                  onChange={handleChange}
                  name="validFrom"
                  error={touched.validFrom && errors.validFrom}
                />
                {/* {touched.validFrom && errors.validFrom && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.validFrom}
                  </div>
                )} */}
              </div>
              <div>
                <InputFields
                  required
                  label="Valid To"
                  type="date"
                  value={form.validTo}
                  onChange={handleChange}
                  name="validTo"
                  error={touched.validTo && errors.validTo}
                />
                {/* {touched.validTo && errors.validTo && (
                  <div className="text-red-500 text-xs mt-1">
                    {/* {errors.validTo} */}
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Status"
                  name="status"
                  value={"1"}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  error={touched.status && errors.status}
                />
                {/* {touched.status && errors.status && (
                  <div className="text-red-500 text-xs mt-1">
                    {/* {errors.status} */}
              </div>
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  if (isEditMode && loading) {
    return (
      <div
        className="
          flex
          w-full h-full
          items-center justify-center
        "
      >
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div
        className="
          flex
          items-center gap-2
        "
      >
        <Link href="/vehicle">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1
          className="
            mb-[4px]
            text-xl font-semibold text-gray-900
          "
        >
          {isEditMode ? "Update Vehicle" : "Add Vehicle"}
        </h1>
      </div>
      <div
        className="
          flex
          mb-6
          justify-between items-center
        "
      >
        <StepperForm
          steps={steps.map((step) => ({
            ...step,
            isCompleted: isStepCompleted(step.id),
          }))}
          currentStep={currentStep}
          onStepClick={() => {}}
          onBack={prevStep}
          onNext={handleNext}
          onSubmit={handleSubmit}
          showSubmitButton={isLastStep}
          showNextButton={!isLastStep}
          nextButtonText="Save & Next"
          submitButtonText={isEditMode ? "Update" : "Submit"}
        >
          {renderStepContent()}
        </StepperForm>
      </div>
    </>
  );
}
