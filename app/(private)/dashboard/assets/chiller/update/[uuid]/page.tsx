"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { chillerByUUID, updateChiller } from "@/app/services/assetsApi";
import { useEffect, useState } from "react";
import { useLoading } from "@/app/services/loadingContext";

const validationSchema = Yup.object({
  serial_number: Yup.string()
    .trim()
    .required("Serial Number is required")
    .min(3, "Serial Number must be at least 3 characters")
    .max(50, "Serial Number cannot exceed 50 characters"),
  asset_number: Yup.string()
    .trim()
    .required("Asset Number is required")
    .min(3, "Asset Number must be at least 3 characters")
    .max(50, "Asset Number cannot exceed 50 characters"),
  model_number: Yup.string()
    .trim()
    .required("Model Number is required")
    .min(3, "Model Number must be at least 3 characters")
    .max(50, "Model Number cannot exceed 50 characters"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .max(255, "Description cannot exceed 255 characters"),
  acquisition: Yup.date()
    .required("Acquisition date is required")
    .typeError("Invalid date format"),
  vender_details: Yup.string()
    .required("Vendor Details are required")
    .max(100, "Vendor Details cannot exceed 100 characters"),
  manufacturer: Yup.string()
    .trim()
    .required("Manufacturer is required")
    .max(100, "Manufacturer cannot exceed 100 characters"),
  country_id: Yup.number()
    .required("Country ID is required")
    .typeError("Country ID must be a number"),
  type_name: Yup.string()
    .trim()
    .required("Type Name is required")
    .max(50, "Type Name cannot exceed 50 characters"),
  sap_code: Yup.string()
    .trim()
    .required("SAP Code is required")
    .max(50, "SAP Code cannot exceed 50 characters"),
  status: Yup.number()
    .oneOf([0, 1], "Invalid status selected")
    .required("Status is required"),
  is_assign: Yup.number()
    .oneOf([0, 1], "Invalid assignment status")
    .required("Assignment status is required"),
  customer_id: Yup.number()
    .required("Customer ID is required")
    .typeError("Customer ID must be a number"),
  agreement_id: Yup.number()
    .required("Agreement ID is required")
    .typeError("Agreement ID must be a number"),
  document_type: Yup.string()
    .trim()
    .required("Document Type is required")
    .max(10, "Document Type cannot exceed 10 characters"),
  document_id: Yup.number()
    .required("Document ID is required")
    .typeError("Document ID must be a number"),
});

const stepSchemas = [
  // Step 1: Chiller Basic Information
  Yup.object().shape({
    serial_number: Yup.string()
      .trim()
      .required("Serial Number is required")
      .min(3, "Serial Number must be at least 3 characters")
      .max(50, "Serial Number cannot exceed 50 characters"),
    asset_number: Yup.string()
      .trim()
      .required("Asset Number is required")
      .min(3, "Asset Number must be at least 3 characters")
      .max(50, "Asset Number cannot exceed 50 characters"),
    model_number: Yup.string()
      .trim()
      .required("Model Number is required")
      .min(3, "Model Number must be at least 3 characters")
      .max(50, "Model Number cannot exceed 50 characters"),
    description: Yup.string()
      .trim()
      .required("Description is required")
      .max(255, "Description cannot exceed 255 characters"),
    type_name: Yup.string()
      .trim()
      .required("Type Name is required")
      .max(50, "Type Name cannot exceed 50 characters"),
    sap_code: Yup.string()
      .trim()
      .required("SAP Code is required")
      .max(50, "SAP Code cannot exceed 50 characters"),
  }),

  // Step 2: Acquisition and Vendor Information
  Yup.object().shape({
    acquisition: Yup.date()
      .required("Acquisition date is required")
      .typeError("Invalid date format"),
    vender_details: Yup.string()
      .required("Vendor Details are required")
      .max(100, "Vendor Details cannot exceed 100 characters"),
    manufacturer: Yup.string()
      .trim()
      .required("Manufacturer is required")
      .max(100, "Manufacturer cannot exceed 100 characters"),
    country_id: Yup.number()
      .required("Country ID is required")
      .typeError("Country ID must be a number"),
  }),

  // Step 3: Status and Assignment/Location
  Yup.object().shape({
    status: Yup.number()
      .oneOf([0, 1], "Invalid status selected")
      .required("Status is required"),
    is_assign: Yup.number()
      .oneOf([0, 1], "Invalid assignment status")
      .required("Assignment status is required"),
    }),
    
    // Step 4: Documentation and Records
    Yup.object().shape({
    customer_id: Yup.number()
    .required("Customer ID is required")
    .typeError("Customer ID must be a number"),
    agreement_id: Yup.number()
    .required("Agreement ID is required")
    .typeError("Agreement ID must be a number"),
    document_type: Yup.string()
      .trim()
      .required("Document Type is required")
      .max(10, "Document Type cannot exceed 10 characters"),
    document_id: Yup.number()
      .required("Document ID is required")
      .typeError("Document ID must be a number"),
  }),
];

type chiller = {
  serial_number: string,
  asset_number: string,
  model_number: string,
  description: string,
  acquisition: string,
  vender_details: string[],
  manufacturer: string,
  country_id: number,
  type_name: string,
  sap_code: string,
  status: number,
  is_assign: number,
  customer_id: number,
  agreement_id: number,
  document_type: string,
  document_id: number
}

export default function AddCompanyWithStepper() {
    const params = useParams();
    let uuid = params?.uuid || "";
    if (Array.isArray(uuid)) {
        uuid = uuid[0] || "";
    }

  const { onlyCountryOptions, vendorOptions } = useAllDropdownListData();
  const steps: StepperStep[] = [
    { id: 1, label: "Basic Information" },
    { id: 2, label: "Acquisition and Vendor" },
    { id: 3, label: "Status and Assignment / Location" },
    { id: 4, label: "Documentation and Records" }
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const {setLoading} = useLoading();
  const [chiller, setChiller] = useState<chiller | null>(null);

  useEffect(() => {
     async function fetchData() {
        if(!uuid) return;
        setLoading(true);
        const res = await chillerByUUID(uuid as string);
        setLoading(false);
        if (res.error) {
            showSnackbar(res.data.message || "Failed to fetch chiller", "error");
            throw new Error("Unable to fetch chiller");
        } else {
         setChiller(res.data);
       }
     }
     fetchData()
  }, []);

  const initialValues: chiller = {
    serial_number: chiller?.serial_number || "",
    asset_number: chiller?.asset_number || "",
    model_number: chiller?.model_number || "",
    description: chiller?.description || "",
    acquisition: chiller?.acquisition || "",
    vender_details: chiller?.vender_details || [],
    manufacturer: chiller?.manufacturer || "",
    country_id: parseInt(onlyCountryOptions[0]?.value) || 0,
    type_name: chiller?.type_name || "",
    sap_code: chiller?.sap_code || "",
    status: chiller?.status || 1,
    is_assign: chiller?.is_assign || 1,
    customer_id: chiller?.customer_id || 1,
    agreement_id: chiller?.agreement_id || 1,
    document_type: chiller?.document_type || "ACF",
    document_id: chiller?.document_id || 1,
  };

  const handleNext = async (
    values: chiller,
    actions: FormikHelpers<chiller>
  ) => {
    try {
      // Validate only the current step's fields
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        // Only touch fields in the current step
        const fields = err.inner.map((e) => e.path);
        actions.setTouched(
          fields.reduce(
            (acc, key) => ({ ...acc, [key!]: true }),
            {} as Record<string, boolean>
          )
        );
        actions.setErrors(
          err.inner.reduce(
            (acc: Partial<Record<keyof chiller, string>>, curr) => ({
              ...acc,
              [curr.path as keyof chiller]: curr.message,
            }),
            {}
          )
        );
      }
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  const handleSubmit = async (values: chiller) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });

      const payload = {
        serial_number: values.serial_number,
        asset_number: values.asset_number,
        model_number: values.model_number,
        description: values.description,
        acquisition: values.acquisition,
        vender_details: values.vender_details ||[],
        manufacturer: values.manufacturer,
        country_id: Number(values.country_id),
        type_name: values.type_name,
        sap_code: values.sap_code,
        status: values.status,
        is_assign: values.is_assign,
        customer_id: Number(values.customer_id),
        agreement_id: Number(values.agreement_id),
        document_type: values.document_type || "ACF",
        document_id: values.document_id,
      };

      setLoading(true);
      const res = await updateChiller(uuid, payload);
      setLoading(false);
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to add Chiller", "error");
      } else {
        showSnackbar(res.message || "Chiller Updated successfully", "success");
        router.push("/dashboard/assets/chiller");
      }
    } catch {
      showSnackbar("Add Chiller failed ❌", "error");
    }
  };

  const renderStepContent = (
    values: chiller,
    setFieldValue: (
      field: keyof chiller,
      value: string | File,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<chiller>,
    touched: FormikTouched<chiller>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                required
                label="Serial Number"
                name="serial_number"
                value={values.serial_number}
                onChange={(e) => setFieldValue("serial_number", e.target.value)}
                error={touched.serial_number && errors.serial_number}
              />
              <InputFields
                required
                label="Asset Number"
                name="asset_number"
                value={values.asset_number}
                onChange={(e) => setFieldValue("asset_number", e.target.value)}
                error={touched.asset_number && errors.asset_number}
              />
              <InputFields
                required
                label="Model Number"
                name="model_number"
                value={values.model_number}
                onChange={(e) => setFieldValue("model_number", e.target.value)}
                error={touched.model_number && errors.model_number}
              />
              <InputFields
                required
                label="description"
                name="description"
                value={values.description}
                onChange={(e) => setFieldValue("description", e.target.value)}
                error={touched.description && errors.description}
              />
              <InputFields
                required
                label="Type Name"
                name="type_name"
                value={values.type_name}
                onChange={(e) => setFieldValue("type_name", e.target.value)}
                error={touched.type_name && errors.type_name}
              />
              <InputFields
                required
                label="SAP Code"
                name="sap_code"
                value={values.sap_code}
                onChange={(e) => setFieldValue("sap_code", e.target.value)}
                error={touched.sap_code && errors.sap_code}
              />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <InputFields
                required
                type="date"
                label="Acquisition"
                name="acquisition"
                value={values.acquisition}
                onChange={(e) => setFieldValue("acquisition", e.target.value)}
                error={touched.acquisition && errors.acquisition}
              />
            <InputFields
              required
              label="Vender Details"
              name="vender_details"
              value={values.vender_details}
              isSingle={false}
              options={vendorOptions}
              onChange={(e) => setFieldValue("vender_details", e.target.value)}
              error={
                touched.vender_details
                  ? Array.isArray(errors.vender_details)
                    ? errors.vender_details[0]
                    : errors.vender_details
                  : false
              }
            />
            <InputFields
                required
                label="Manufacturer"
                name="manufacturer"
                value={values.manufacturer}
                onChange={(e) => setFieldValue("manufacturer", e.target.value)}
                error={touched.manufacturer && errors.manufacturer}
              />
              <InputFields
                required
                label="Country"
                name="country_id"
                value={values.country_id.toString()}
                options={onlyCountryOptions}
                onChange={(e) => setFieldValue("country_id",e.target.value)}
                error={errors?.country_id && touched?.country_id ? errors.country_id : false}
              />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <InputFields
                required
                label="Status"
                name="status"
                value={values.status.toString()}
                onChange={(e) => setFieldValue("status", e.target.value)}
                options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                ]}
            />
            <InputFields
                required
                label="Is Assign"
                name="is_assign"
                value={values.is_assign.toString()}
                onChange={(e) => setFieldValue("is_assign", e.target.value)}
                options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" }
                ]}
            />
            </div>
          </ContainerCard>
        );
        
      case 4:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <InputFields
                required
                label="Customer Name"
                name="customer_id"
                value={values.customer_id.toString()}
                onChange={(e) => setFieldValue("customer_id", e.target.value)}
                options={[
                    { value: "1", label: "Customer 1" },
                    { value: "2", label: "Customer 2" },
                    { value: "3", label: "Customer 3" },
                    { value: "4", label: "Customer 4" },
                    { value: "5", label: "Customer 5" }
                ]}
            />
            <InputFields
                required
                label="Agreement"
                name="agreement_id"
                value={values.agreement_id.toString()}
                onChange={(e) => setFieldValue("agreement_id", e.target.value)}
                options={[
                    { value: "1", label: "Agreement 1" },
                    { value: "55", label: "Agreement 2" },
                    { value: "3", label: "Agreement 3" },
                    { value: "4", label: "Agreement 4" },
                    { value: "5", label: "Agreement 5" }
                ]}
            />
            <InputFields
                required
                label="Document Type"
                name="document_type"
                value={values.document_type.toString()}
                onChange={(e) => setFieldValue("document_type", e.target.value)}
                error={touched.document_type && errors.document_type}
            />
            <InputFields
                required
                label="Document"
                name="document_id"
                value={values.document_id.toString()}
                onChange={(e) => setFieldValue("document_id", e.target.value)}
                options={[
                    { value: "ACF", label: "ACF" }
                ]}
            />
            </div>
          </ContainerCard>
        );

      default:
        return null;
    }
  };

  return (
    <div>
     <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div onClick={() => router.back()}>
            <Icon icon="lucide:arrow-left" width={24} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Edit Chiller
          </h1>
        </div>
      </div>
      <Formik initialValues={initialValues} enableReinitialize={true} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
              currentStep={currentStep}
              onStepClick={() => {}}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, {
                  setErrors: () => {},
                  setTouched: () => {},
                } as unknown as FormikHelpers<chiller>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText="Submit"
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
