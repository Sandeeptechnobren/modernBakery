"use client";
// Unified Add/Edit Warehouse Page
import WarehouseDetails from "./warehouseDetails";
import WarehouseContact from "./warehouseContact";
import WarehouseLocationInformation from "./warehouseLocationInfo";
import WarehouseAdditionalInformation from "./warehouseAdditionalInformation";
import { useParams, useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import * as Yup from "yup";
import {
  addWarehouse,
  getWarehouseById,
  updateWarehouse,
  genearateCode,
  saveFinalCode,
} from "@/app/services/allApi";
import StepperForm, {
  StepperStep,
  useStepperForm,
} from "@/app/components/stepperForm";
import { useEffect, useState, useRef } from "react";
import Loading from "@/app/components/Loading";
import {
  Formik,
  Form,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
  ErrorMessage,
} from "formik";

type FormValues = {
  warehouse_code: string;
  warehouse_type: string;
  warehouse_name: string;
  owner_name: string;
  owner_number: string;
  owner_email: string;
  tin_no: string;
  password: string;
  agreed_stock_capital: string;
  company: string;
  agent_customer: string;
  warehouse_manager: string;
  ownerContactCountry: string;
  managerContactCountry: string;
  warehouse_manager_contact: string;
  location: string;
  city: string;
  region_id: string;
  area_id: string;
  // district: string;
  // address: string;
  town_village: string;
  street: string;
  landmark: string;
  latitude: string;
  longitude: string;
  p12_file: string | File;
  is_efris: string;
  is_branch: string;
  status: string;
};

export default function AddEditWarehouse() {
  const params = useParams();
  const warehouseId = params.id as string | undefined;
  const isEditMode = warehouseId !== undefined && warehouseId !== "add";
  const steps: StepperStep[] = [
    { id: 1, label: "Warehouse Details" },
    { id: 2, label: "Warehouse Contact" },
    { id: 3, label: "Location Information" },
    { id: 4, label: "EFRIS Information" },
  ];
  const [selectedCountry, setSelectedCountry] = useState<{
    code: string;
    flag: string;
    name: string;
  }>({ name: "Uganda", code: "+256", flag: "🇺🇬" });

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState("WH");
  const codeGeneratedRef = useRef(false);

  // Validation schema (Yup)
  const validationSchema = Yup.object({
    warehouse_code: Yup.string().required("Warehouse Code is required"),
    tin_no: Yup.string().required("TIN No. is required"),
    warehouse_type: Yup.string().required("Warehouse Type is required"),
    warehouse_name: Yup.string().required("Warehouse Name is required"),
    owner_name: Yup.string().required("Owner Name is required"),
    company: Yup.string().required("Company is required"),
    agreed_stock_capital: Yup.string(),
    agent_customer: Yup.string().required("Agent Customer is required"),
    warehouse_manager: Yup.string().required("Warehouse Manager is required"),
    owner_number: Yup.string()
      .required("Owner Contac is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .min(9, "Must be at least 9 digits")
      .max(10, "Must be at most 10 digits"),
    owner_email: Yup.string()
      .email("Invalid email")
      .required("Email is required."),

    warehouse_manager_contact: Yup.string()
      .required("Warehouse Manager Contact is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .min(9, "Must be at least 9 digits")
      .max(10, "Must be at most 10 digits"),
    location: Yup.string().required("Location is required"),
    city: Yup.string().required("City is required"),
    region_id: Yup.string().required("Region is required"),
    area_id: Yup.string().required("Area ID is required"),
    // district: Yup.string(),
    // address: Yup.string().required('Address is required'),
    town_village: Yup.string(),
    street: Yup.string(),
    landmark: Yup.string(),
    latitude: Yup.string()
      .required("Latitude is required")
      .matches(
        /^[-+]?\d{1,3}(?:\.\d+)?$/,
        "Latitude must be a valid decimal number"
      ),
    longitude: Yup.string()
      .required("Longitude is required")
      .matches(
        /^[-+]?\d{1,3}(?:\.\d+)?$/,
        "Longitude must be a valid decimal number"
      ),
    // p12_file: Yup.string().required('P12 File is required'),
    // p12_file: isEditMode ? Yup.string() : Yup.string().required('P12 File is required'),
    is_efris: Yup.string()
      .oneOf(["0", "1"], "EFRIS Configuration is required")
      .required("EFRIS Configuration is required"),
    is_branch: Yup.string(),
  });

  // Step-wise schemas
  const stepSchemas = [
    Yup.object().shape({
      warehouse_code: validationSchema.fields.warehouse_code,
      tin_no: validationSchema.fields.tin_no,
      warehouse_type: validationSchema.fields.warehouse_type,
      warehouse_name: validationSchema.fields.warehouse_name,
      owner_name: validationSchema.fields.owner_name,
      company: validationSchema.fields.company,
      agent_customer: validationSchema.fields.agent_customer,
      warehouse_manager: validationSchema.fields.warehouse_manager,
    }),
    Yup.object().shape({
      owner_number: validationSchema.fields.owner_number,
    }),
    Yup.object().shape({
      location: validationSchema.fields.location,
      city: validationSchema.fields.city,
      region_id: validationSchema.fields.region_id,
      area_id: validationSchema.fields.area_id,
      latitude: validationSchema.fields.latitude,
      longitude: validationSchema.fields.longitude,
      // address: validationSchema.fields.address,
    }),
    Yup.object().shape({
      // p12_file: validationSchema.fields.p12_file,
      is_efris: validationSchema.fields.is_efris,
      is_branch: validationSchema.fields.is_branch,
    }),
  ];

  // Initial values
  const [initialValues, setInitialValues] = useState<FormValues>({
    warehouse_code: "",
    warehouse_type: "",
    warehouse_name: "",
    owner_name: "",
    company: "",
    agreed_stock_capital: "",
    password: "",
    tin_no: "",
    agent_customer: "",
    warehouse_manager: "",
    ownerContactCountry: "",
    owner_number: "",
    managerContactCountry: "",
    warehouse_manager_contact: "",
    owner_email: "",
    location: "",
    city: "",
    region_id: "",
    area_id: "",
    // district: "",
    // address: "",
    town_village: "",
    street: "",
    landmark: "",
    latitude: "",
    longitude: "",
    p12_file: "",
    is_efris: "0", // Default to 'Disable' (0)
    is_branch: "",
    status: "1",
  });

  useEffect(() => {
    async function fetchData() {
      if (isEditMode && warehouseId) {
        setLoading(true);
        const res = await getWarehouseById(warehouseId);
        setLoading(false);
        const data = res?.data ?? res;
        if (res && !res.error && data) {
          setInitialValues({
            warehouse_code: data?.warehouse_code || "",
            warehouse_type: String(data?.warehouse_type || ""),
            warehouse_name: data?.warehouse_name || "",
            owner_name: data?.owner_name || "",
            company: String(data?.get_company?.id || ""),
            agreed_stock_capital: String(data?.agreed_stock_capital || ""),
            tin_no: String(data?.tin_no || ""),
            agent_customer: String(data?.get_company_customer?.id) || "",
            warehouse_manager: data?.warehouse_manager || "",
            ownerContactCountry: data?.ownerContactCountry || "",
            owner_number: data?.owner_number || "",
            managerContactCountry: data?.managerContactCountry || "",
            warehouse_manager_contact: data?.warehouse_manager_contact || "",
            owner_email: data?.owner_email || "",
            location: data?.location || "",
            city: data?.city || "",
            region_id: String(data?.region_id || ""),
            area_id: String(data?.area_id || ""),
            // district: String(data?.district || ''),
            // address: String(data?.address || ''),
            town_village: String(data?.town_village || ""),
            street: String(data?.street || ""),
            landmark: data?.landmark || "",
            latitude: String(data?.latitude || ""),
            longitude: String(data?.longitude || ""),
            p12_file: data?.p12_file || "",
            password: data?.password || "",
            is_efris: String(data?.is_efris || ""),
            is_branch: String(data?.is_branch || ""),
            status: "1",
          });
        }
      } else if (!isEditMode && !codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        const res = await genearateCode({ model_name: "warehouse" });
        if (res?.code) {
          setInitialValues((prev) => ({ ...prev, warehouse_code: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        }
      }
    }
    fetchData();
  }, [isEditMode, warehouseId]);

  // Stepper navigation
  const handleNext = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        actions.setErrors(
          err.inner.reduce(
            (acc: Partial<Record<keyof FormValues, string>>, curr) => ({
              ...acc,
              [curr.path as keyof FormValues]: curr.message,
            }),
            {}
          )
        );
      }
    }
  };

  // Submit
  const handleSubmit = async (values: FormValues) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      // normalize fields expected by API
      const isBranchStr = String(values.is_branch).toLowerCase();
      const isBranchPayload =
        isBranchStr === "true" || isBranchStr === "1" || isBranchStr === "yes"
          ? "1"
          : "0";
      // Build payload. The API expects the file key to be 'p12'.
      const base = {
        ...values,
        warehouse_type: values.warehouse_type,
        is_branch: isBranchPayload,
      } as Record<string, unknown>;

      const p12 = values.p12_file;
      let res;

      if (p12 instanceof File) {
        const form = new FormData();
        // append all keys except p12_file
        Object.keys(base).forEach((k) => {
          if (k === "p12_file") return;
          const v = base[k];
          if (typeof v === "object" && v !== null) {
            form.append(k, JSON.stringify(v));
          } else if (typeof v !== "undefined") {
            form.append(k, String(v));
          }
        });
        // append file as 'p12' (backend expects p12:p12.xlsx)
        form.append("p12", p12);

        if (isEditMode && warehouseId) {
          res = await updateWarehouse(warehouseId, form as unknown as object);
        } else {
          res = await addWarehouse(form as unknown as object);
          if (!res?.error) {
            try {
              await saveFinalCode({
                reserved_code: values.warehouse_code,
                model_name: "warehouse",
              });
            } catch (e) {}
          }
        }
      } else {
        // send JSON where backend expects 'p12' key with filename string
        const jsonPayload = {
          ...base,
          ownerContactCountry: selectedCountry,
          managerContactCountry: selectedCountry,
          p12: typeof p12 === "string" ? p12 : "",
        };
        if (isEditMode && warehouseId) {
          res = await updateWarehouse(warehouseId, jsonPayload);
        } else {
          res = await addWarehouse(jsonPayload);
          if (!res?.error) {
            try {
              await saveFinalCode({
                reserved_code: values.warehouse_code,
                model_name: "warehouse",
              });
            } catch (e) {}
          }
        }
      }
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          res.message ||
            (isEditMode
              ? "Warehouse updated successfully"
              : "Warehouse added successfully"),
          "success"
        );
        router.push("/warehouse");
      }
    } catch {
      showSnackbar("Add/Update Warehouse failed ❌", "error");
    }
  };

  // Step content
  const renderStepContent = (
    values: FormValues,
    setFieldValue: (
      field: keyof FormValues,
      value: unknown,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<FormValues>,
    touched: FormikTouched<FormValues>
  ) => {
    const heading = (
      <h2 className="text-lg font-semibold mb-6">
        {steps[currentStep - 1].label}
      </h2>
    );
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            {heading}
            <WarehouseDetails
              values={{
                ...values,
                p12_file:
                  typeof values.p12_file === "string" ? values.p12_file : "",
              }}
              errors={errors}
              touched={touched}
              handleChange={(e) =>
                setFieldValue(e.target.name as keyof FormValues, e.target.value)
              }
              setFieldValue={(field: string, value: unknown) =>
                setFieldValue(
                  field as keyof FormValues,
                  value as string | File,
                  true
                )
              }
              isEditMode={isEditMode}
            />
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            {heading}
            <WarehouseContact
              values={{
                ...values,
                p12_file:
                  typeof values.p12_file === "string" ? values.p12_file : "",
              }}
              errors={errors}
              touched={touched}
              handleChange={(e) =>
                setFieldValue(e.target.name as keyof FormValues, e.target.value)
              }
              setFieldValue={(field: string, value: unknown) =>
                setFieldValue(
                  field as keyof FormValues,
                  value as string | File,
                  true
                )
              }
            />
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            {heading}
            <WarehouseLocationInformation
              values={{
                ...values,
                p12_file:
                  typeof values.p12_file === "string" ? values.p12_file : "",
              }}
              errors={errors}
              touched={touched}
              handleChange={(e) =>
                setFieldValue(e.target.name as keyof FormValues, e.target.value)
              }
              setFieldValue={(field: string, value: unknown) =>
                setFieldValue(
                  field as keyof FormValues,
                  value as string | File,
                  true
                )
              }
            />
          </ContainerCard>
        );
      case 4:
        return (
          <ContainerCard>
            {heading}
            <WarehouseAdditionalInformation
              values={{
                ...values,
                p12_file:
                  typeof values.p12_file === "string" ? values.p12_file : "",
              }}
              errors={errors}
              touched={touched}
              handleChange={(e) =>
                setFieldValue(e.target.name as keyof FormValues, e.target.value)
              }
              setFieldValue={(field: string, value: unknown) =>
                setFieldValue(
                  field as keyof FormValues,
                  value as string | File,
                  true
                )
              }
            />
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  if (isEditMode && loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/warehouse">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Warehouse" : "Add Warehouse"}
          </h1>
        </div>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          handleSubmit: formikSubmit,
          setErrors,
          setTouched,
          isSubmitting,
        }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({
                ...step,
                isCompleted: isStepCompleted(step.id),
              }))}
              currentStep={currentStep}
              onStepClick={() => {}}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, {
                  setErrors,
                  setTouched,
                } as unknown as FormikHelpers<FormValues>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={
                isSubmitting
                  ? "Submitting..."
                  : isEditMode
                  ? "Update"
                  : "Submit"
              }
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
