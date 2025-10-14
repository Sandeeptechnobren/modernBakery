"use client";

import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import {
  Formik,
  Form,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
  ErrorMessage,
} from "formik";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import {
  addChiller,
  chillerByUUID,
  updateChiller,
} from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import IconButton from "@/app/components/iconButton";
import SettingPopUp from "@/app/components/settingPopUp";
import { genearateCode } from "@/app/services/allApi";

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
  vender_details: Yup.array()
    .of(Yup.string().required("ID is required"))
    .min(1, "Select at least one vendor")
    .required("Vender details are required"),

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
    serial_number: validationSchema.fields.serial_number,
    asset_number: validationSchema.fields.asset_number,
    model_number: validationSchema.fields.model_number,
    description: validationSchema.fields.description,
    type_name: validationSchema.fields.type_name,
    sap_code: validationSchema.fields.sap_code,
  }),

  // Step 2: Acquisition and Vendor Information
  Yup.object().shape({
    acquisition: validationSchema.fields.acquisition,
    vender_details: validationSchema.fields.vender_details,
    manufacturer: validationSchema.fields.manufacturer,
    country_id: validationSchema.fields.country_id,
  }),

  // Step 3: Status and Assignment/Location
  Yup.object().shape({
    status: validationSchema.fields.status,
    is_assign: validationSchema.fields.is_assign,
  }),

  // Step 4: Documentation and Records
  Yup.object().shape({
    customer_id: validationSchema.fields.customer_id,
    agreement_id: validationSchema.fields.agreement_id,
    document_type: validationSchema.fields.document_type,
    document_id: validationSchema.fields.document_id,
  }),
];

type chiller = {
  serial_number: string;
  asset_number: string;
  model_number: string;
  description: string;
  acquisition: string;
  vender_details: string[];
  manufacturer: string;
  country_id: number;
  type_name: string;
  sap_code: string;
  status: number;
  is_assign: number;
  customer_id: number;
  agreement_id: number;
  document_type: string;
  document_id: number;
};

export default function AddOrEditCompanyWithStepper() {
  const [isOpen, setIsOpen] = useState(false);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');
  const [prefix, setPrefix] = useState('CHL');
  const { onlyCountryOptions, vendorOptions, companyCustomersOptions } = useAllDropdownListData();
  const steps: StepperStep[] = [
    { id: 1, label: "Basic Information" },
    { id: 2, label: "Acquisition and Vendor" },
    { id: 3, label: "Status and Assignment / Location" },
    { id: 4, label: "Documentation and Records" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const { setLoading } = useLoading();
  const params = useParams();
  const codeGeneratedRef = useState<{ current: boolean }>({ current: false });
  const isEditMode = params?.id && params.id !== "add";
  const chillerId = isEditMode ? (params?.id as string) : null;
  const [chiller, setChiller] = useState<chiller>({
    serial_number: "",
    asset_number: "",
    model_number: "",
    description: "",
    acquisition: "",
    vender_details: [],
    manufacturer: "",
    country_id: parseInt(onlyCountryOptions[0]?.value) || 0,
    type_name: "",
    sap_code: "",
    status: 1,
    is_assign: 1,
    customer_id: 1,
    agreement_id: 1,
    document_type: "1",
    document_id: 1,
  });

  useEffect(() => {
    async function fetchData() {
      if (isEditMode && chillerId) {
        setLoading(true);
        const res = await chillerByUUID(chillerId);
        setLoading(false);
        if (res.error) {
          showSnackbar(res.data.message || "Failed to fetch chiller", "error");
          throw new Error("Unable to fetch chiller");
        } else {
          setChiller({
            ...res.data,
            vender_details: res.data.vender_details.map((v: { id: number }) => String(v.id)),
            customer_id: res.data.customer_id || companyCustomersOptions[0]?.value || 0,
            agreement_id: res.data.agreement_id || 1,
            document_id: res.data.document_id || 1,
          } as chiller);
        } 
      } else if(!isEditMode && !codeGeneratedRef[0].current){
        codeGeneratedRef[0].current = true;
        const res = await genearateCode({ model_name: "chiller" });
        if (res?.code) {
          setChiller((prev) => ({ ...prev, serial_number: res.code }));
        }
        if (res?.prefix) {
          setPrefix(res.prefix);
        } else if (res?.code) {
          const match = res.prefix;
          if (match) setPrefix(match);
        }
      }
    }
    fetchData();
  }, [isEditMode, chillerId]);

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
        vender_details: values.vender_details
          .map((v): string | null => {
            // Type narrowing: check if v is an object and not null, and has an 'id' property
            if (v && typeof v === "object" && "id" in v) {
              return String((v as { id: number }).id); // safely cast and convert to number
            }
            return null; // ignore invalid entries
          })
          .filter((id): id is string => id !== null),
        manufacturer: values.manufacturer,
        country_id: Number(values.country_id),
        type_name: values.type_name,
        sap_code: values.sap_code,
        status: values.status,
        is_assign: values.is_assign,
        customer_id: Number(values.customer_id),
        agreement_id: Number(values.agreement_id),
        document_type: "ACF",
        document_id: values.document_id,
      };

      // console.log("payload", payload);

      let res;
      if (params?.id && params.id !== "add") {
        res = await updateChiller(String(params.id), payload);
      } else {
        res = await addChiller(payload);
      }

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to add Chiller", "error");
      } else {
        showSnackbar(
          `${
            params.id !== "add" ? "Chiller updated" : "Chiller added"
          } successfully`,
          "success"
        );
        router.push("/assets/chiller");
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
              <div>
                <div className="flex items-start gap-2 max-w-[406px]">
                  <InputFields
                    required
                    label="Serial Number"
                    name="serial_number"
                    value={values.serial_number}
                    onChange={(e) => setFieldValue("serial_number", e.target.value)}
                    disabled={codeMode === 'auto'}
                  />
                  {!isEditMode && (
                    <>
                      <IconButton bgClass="white"  className="  cursor-pointer text-[#252B37] pt-12" icon="mi:settings" onClick={() => setIsOpen(true)} />
                      <SettingPopUp
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        title="Serial Number"
                        prefix={prefix}
                        setPrefix={setPrefix}
                        onSave={(mode, code) => {
                          setCodeMode(mode);
                          if (mode === 'auto' && code) {
                            setFieldValue("serial_number", code);
                          } else if (mode === 'manual') {
                            setFieldValue("serial_number", '');
                          }
                        }}
                      />
                    </>
                  )}
                </div>
              </div>

              <div>
                <InputFields
                  required
                  label="Asset Number"
                  name="asset_number"
                  value={values.asset_number}
                  onChange={(e) =>
                    setFieldValue("asset_number", e.target.value)
                  }
                  error={touched.asset_number && errors.asset_number}
                />
                <ErrorMessage
                  name="asset_number"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Model Number"
                  name="model_number"
                  value={values.model_number}
                  onChange={(e) =>
                    setFieldValue("model_number", e.target.value)
                  }
                  error={touched.model_number && errors.model_number}
                />
                <ErrorMessage
                  name="model_number"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Description"
                  name="description"
                  value={values.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  error={touched.description && errors.description}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Type Name"
                  name="type_name"
                  value={values.type_name}
                  onChange={(e) => setFieldValue("type_name", e.target.value)}
                  error={touched.type_name && errors.type_name}
                />
                <ErrorMessage
                  name="type_name"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="SAP Code"
                  name="sap_code"
                  value={values.sap_code}
                  onChange={(e) => setFieldValue("sap_code", e.target.value)}
                  error={touched.sap_code && errors.sap_code}
                />
                <ErrorMessage
                  name="sap_code"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  type="date"
                  label="Acquisition"
                  name="acquisition"
                  value={values.acquisition}
                  onChange={(e) => setFieldValue("acquisition", e.target.value)}
                  error={touched.acquisition && errors.acquisition}
                />
                <ErrorMessage
                  name="acquisition"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Vender Details"
                  name="vender_details"
                  value={values.vender_details}
                  isSingle={false}
                  options={vendorOptions}
                  onChange={(e) => {
                    setFieldValue("vender_details", e.target.value);
                  }}
                  error={
                    touched.vender_details
                      ? Array.isArray(errors.vender_details)
                        ? errors.vender_details[0]
                        : errors.vender_details
                      : false
                  }
                />

                <ErrorMessage
                  name="vender_details"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Manufacturer"
                  name="manufacturer"
                  value={values.manufacturer}
                  onChange={(e) =>
                    setFieldValue("manufacturer", e.target.value)
                  }
                  error={touched.manufacturer && errors.manufacturer}
                />
                <ErrorMessage
                  name="manufacturer"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Country"
                  name="country_id"
                  value={values.country_id.toString()}
                  options={onlyCountryOptions}
                  onChange={(e) => setFieldValue("country_id", e.target.value)}
                  error={
                    errors?.country_id && touched?.country_id
                      ? errors.country_id
                      : false
                  }
                />
                <ErrorMessage
                  name="country_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
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
                  error={touched.status && errors.status}
                />
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Is Assign"
                  name="is_assign"
                  value={values.is_assign.toString()}
                  onChange={(e) => setFieldValue("is_assign", e.target.value)}
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                  error={touched.is_assign && errors.is_assign}
                />
                <ErrorMessage
                  name="is_assign"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
            </div>
          </ContainerCard>
        );
      case 4:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Customer Name"
                  name="customer_id"
                  value={values.customer_id.toString()}
                  onChange={(e) => setFieldValue("customer_id", e.target.value)}
                  options={companyCustomersOptions}
                  error={touched.customer_id && errors.customer_id}
                />
                <ErrorMessage
                  name="customer_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Agreement"
                  name="agreement_id"
                  value={values.agreement_id.toString()}
                  onChange={(e) =>
                    setFieldValue("agreement_id", e.target.value)
                  }
                  options={[
                    { value: "1", label: "Agreement 1" },
                    { value: "2", label: "Agreement 2" },
                    { value: "3", label: "Agreement 3" },
                    { value: "4", label: "Agreement 4" },
                    { value: "5", label: "Agreement 5" },
                  ]}
                  error={touched.agreement_id && errors.agreement_id}
                />
                <ErrorMessage
                  name="agreement_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Document Type"
                  name="document_type"
                  value={values.document_type} // directly "ACF"
                  onChange={(e) =>
                    setFieldValue("document_type", e.target.value)
                  }
                  options={[{ value: "ACF", label: "ACF" }]} // match backend
                  error={touched.document_type && errors.document_type}
                />

                <ErrorMessage
                  name="document_type"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Document"
                  name="document_id"
                  value={values.document_id.toString()}
                  onChange={(e) => setFieldValue("document_id", e.target.value)}
                  options={[
                    { value: "1", label: "Document 1" },
                    { value: "2", label: "Document 2" },
                    { value: "3", label: "Document 3" },
                    { value: "4", label: "Document 4" },
                    { value: "5", label: "Document 5" },
                  ]}
                  error={touched.document_id && errors.document_id}
                />
                <ErrorMessage
                  name="document_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>
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
            {params.id == "add" ? "Add New Chiller" : "Edit Chiller"}
          </h1>
        </div>
      </div>
      <Formik
        initialValues={chiller}
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
          isSubmitting: issubmitting,
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
                } as unknown as FormikHelpers<chiller>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={issubmitting ? "Submitting..." : "Submit"}
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
