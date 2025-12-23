"use client";

import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams } from "next/navigation";
import * as Yup from "yup";
import { Formik, Form, FormikHelpers, FormikValues } from "formik";
import { useEffect, useState, JSX } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { addChiller, assetsStatusList, chillerByUUID, updateChiller } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { genearateCode } from "@/app/services/allApi";

/* ----------------------------------------------------
   VALIDATION SCHEMA
---------------------------------------------------- */
const validationSchema = Yup.object({
  osa_code: Yup.string().required("Code is required"),
  serial_number: Yup.string().required("Serial Number is required"),
  model_number: Yup.string().required("Model Number is required"),
  assets_category: Yup.string().required("Assets Category is required"),
  sap_code: Yup.string().required("SAP Code is required"),

  acquisition: Yup.date().required("Acquisition date is required"),
  vender: Yup.string().required("Vendor is required"),
  manufacturer: Yup.string().required("Manufacturer is required"),
  country_id: Yup.string().required("Country is required"),

  branding: Yup.string().required("Branding is required"),
  trading_partner_number: Yup.string().required("Trading Partner Number is required"),
  capacity: Yup.string().required("Capacity is required"),
  manufacturing_year: Yup.string().required("Manufacturing year is required"),
  remarks: Yup.string().required("Remarks are required"),
  assets_type: Yup.string().required("Assets Type is required"),
  status: Yup.string().required("Status is required"),
});

/* ----------------------------------------------------
   STEP-WISE VALIDATION
---------------------------------------------------- */
const stepSchemas = [
  Yup.object({
    osa_code: validationSchema.fields.osa_code,
    serial_number: validationSchema.fields.serial_number,
    model_number: validationSchema.fields.model_number,
    assets_category: validationSchema.fields.assets_category,
    sap_code: validationSchema.fields.sap_code,
  }),
  Yup.object({
    acquisition: validationSchema.fields.acquisition,
    vender: validationSchema.fields.vender,
    manufacturer: validationSchema.fields.manufacturer,
    country_id: validationSchema.fields.country_id,
  }),
  Yup.object({
    branding: validationSchema.fields.branding,
    trading_partner_number: validationSchema.fields.trading_partner_number,
    capacity: validationSchema.fields.capacity,
    manufacturing_year: validationSchema.fields.manufacturing_year,
    remarks: validationSchema.fields.remarks,
    assets_type: validationSchema.fields.assets_type,
    status: validationSchema.fields.status,
  }),
];

export default function AddOrEditChiller() {
  const [codeMode] = useState<"auto" | "manual">("auto");
  const {
    vendorOptions,
    manufacturerOptions,
    onlyCountryOptions,
    assetsTypeOptions,
    assetsModelOptions,
    brandingOptions,
    ensureAssetsModelLoaded, ensureAssetsTypeLoaded, ensureBrandingLoaded, ensureCountryLoaded, ensureManufacturerLoaded, ensureVendorLoaded } = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAssetsModelLoaded();
    ensureAssetsTypeLoaded();
    ensureBrandingLoaded();
    ensureCountryLoaded();
    ensureManufacturerLoaded();
    ensureVendorLoaded();
  }, [ensureAssetsModelLoaded, ensureAssetsTypeLoaded, ensureBrandingLoaded, ensureCountryLoaded, ensureManufacturerLoaded, ensureVendorLoaded]);

  const steps: StepperStep[] = [
    { id: 1, label: "Basic Information" },
    { id: 2, label: "Acquisition & Vendor" },
    { id: 3, label: "Additional Details" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  console.log(params)
  const { setLoading } = useLoading();

  const [assetsStatusOptions, setAssetsStatusOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const isEditMode = params?.id && params.id !== "add";
  console.log(isEditMode)
  const chillerId = isEditMode ? String(params.id) : null;

  /* ----------------------------------------------------
     INITIAL VALUES
  ---------------------------------------------------- */
  const [chiller, setChiller] = useState({
    osa_code: "",
    serial_number: "",
    model_number: "",
    acquisition: "",
    vender: "",
    manufacturer: "",
    country_id: "",
    assets_category: "",
    sap_code: "",
    status: "1",
    assets_type: "",
    branding: "1",
    trading_partner_number: "",
    capacity: "",
    manufacturing_year: "",
    remarks: "",
  });

  /* ----------------------------------------------------
     FETCH + PREFILL + AUTO CODE GENERATION
  ---------------------------------------------------- */
  useEffect(() => {
    async function fetchData() {
      if (isEditMode && chillerId) {
        setLoading(true);
        const res = await chillerByUUID(chillerId);
        setLoading(false);

        if (res.error) {
          showSnackbar(res.data?.message || "Failed to fetch details", "error");
          return;
        }

        const d = res.data;

        // FIXED MAPPING
        setChiller({
          osa_code: d.osa_code || "",
          serial_number: d.serial_number || "",
          model_number: String(d.model_number?.id || ""),
          assets_category: String(d.assets_category?.id || ""),
          sap_code: d.sap_code || "",
          acquisition: d.acquisition || "",

          vender: String(d.vendor?.id || ""),

          manufacturer: String(d.manufacturer?.id || ""),
          country_id: String(d.country?.id || ""),

          branding: String(d.branding?.id || ""),
          trading_partner_number: String(d.trading_partner_number || ""),
          capacity: d.capacity || "",
          manufacturing_year: d.manufacturing_year || "",
          assets_type: d.assets_type || "",
          remarks: d.remarks || "",
          status: String(d.status?.id ?? "1"),
        });
      } else {
        const res = await genearateCode({ model_name: "chiller" });
        setChiller((prev) => ({ ...prev, osa_code: res?.code || "" }));
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await assetsStatusList({});
        const data = Array.isArray(res) ? res : res?.data;

        if (Array.isArray(data)) {
          const options = data.map((item: any) => ({
            value: String(item.id),
            label: `${item.name}`,
          }));
          setAssetsStatusOptions(options);
        }
      } catch {
        showSnackbar("Failed to fetch model numbers", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------------------------------------
     NEXT STEP VALIDATION
  ---------------------------------------------------- */
  const handleNext = async (values: any, actions: FormikHelpers<any>) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
    } catch (err: any) {
      if (err.inner) {
        const errors: any = {};
        const touched: any = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
          touched[e.path] = true;
        });
        actions.setErrors(errors);
        actions.setTouched(touched);
      }
      showSnackbar("Please correct highlighted errors", "error");
    }
  };

  /* ----------------------------------------------------
       FINAL SUBMIT
    ---------------------------------------------------- */
  const handleSubmit = async (values: any) => {
    const payload = {
      osa_code: values.osa_code,
      serial_number: values.serial_number,
      model_number: values.model_number,
      assets_category: values.assets_category,
      sap_code: values.sap_code,

      acquisition: values.acquisition,
      vender: values.vender,
      manufacturer: values.manufacturer,
      country_id: Number(values.country_id),

      branding: Number(values.branding),
      trading_partner_number: values.trading_partner_number,
      capacity: values.capacity,
      manufacturing_year: values.manufacturing_year,
      assets_type: values.assets_type,
      remarks: values.remarks,
      status: Number(values.status),
    };

    let res;
    if (isEditMode) res = await updateChiller(chillerId!, payload as any);
    else res = await addChiller(payload as any);

    if (res.error) {
      showSnackbar(res.data?.message || "Failed to save", "error");
    } else {
      showSnackbar(`Assets ${isEditMode ? "updated" : "added"} successfully`, "success");
      router.push("/assetsMaster");
    }
  };

  /* ----------------------------------------------------
     RENDER STEP CONTENT
  ---------------------------------------------------- */
  const renderStepContent = (
    values: FormikValues,
    setFieldValue: (field: string, value: any) => void,
    errors: FormikValues,
    touched: FormikValues
  ): JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                required
                label="Code"
                name="osa_code"
                value={values.osa_code}
                disabled={codeMode === "auto"}
                onChange={(e) => setFieldValue("osa_code", e.target.value)}
                error={touched.osa_code && errors.osa_code}
              />

              <InputFields
                required
                label="Assets Category"
                name="assets_category"
                options={assetsTypeOptions}
                value={values.assets_category}
                onChange={(e) => setFieldValue("assets_category", e.target.value)}
                error={touched.assets_category && errors.assets_category}
              />

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
                label="Model Number"
                name="model_number"
                value={values.model_number}
                options={assetsModelOptions}
                onChange={(e) => setFieldValue("model_number", e.target.value)}
                error={touched.model_number && errors.model_number}
              />

              <InputFields
                required
                label="ERP Code"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

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
                label="Vendor"
                name="vender"
                options={vendorOptions}
                value={values.vender}
                onChange={(e) => setFieldValue("vender", e.target.value)}
                error={touched.vender && errors.vender}
              />

              <InputFields
                required
                label="Manufacturer"
                name="manufacturer"
                options={manufacturerOptions}
                value={values.manufacturer}
                onChange={(e) => setFieldValue("manufacturer", e.target.value)}
                error={touched.manufacturer && errors.manufacturer}
              />

              <InputFields
                required
                label="Country"
                name="country_id"
                options={onlyCountryOptions}
                value={values.country_id}
                onChange={(e) => setFieldValue("country_id", e.target.value)}
                error={touched.country_id && errors.country_id}
              />
            </div>
          </ContainerCard>
        );

      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <InputFields
                required
                label="Branding"
                name="branding"
                value={values.branding}
                options={brandingOptions}
                onChange={(e) => setFieldValue("branding", e.target.value)}
                error={touched.branding && errors.branding}
              />

              <InputFields
                required
                label="Trading Partner Number"
                name="trading_partner_number"
                value={values.trading_partner_number}
                onChange={(e) =>
                  setFieldValue("trading_partner_number", e.target.value)
                }
                error={touched.trading_partner_number && errors.trading_partner_number}
              />

              <InputFields
                required
                label="Capacity"
                name="capacity"
                value={values.capacity}
                onChange={(e) => setFieldValue("capacity", e.target.value)}
                error={touched.capacity && errors.capacity}
              />

              <InputFields
                required
                label="Assets Type"
                name="assets_type"
                options={[
                  { value: "Single Door", label: "Single Door" },
                  { value: "Double Door", label: "Double Door" },
                  { value: "Solar", label: "Solar" },
                ]}
                value={values.assets_type}
                onChange={(e) => setFieldValue("assets_type", e.target.value)}
                error={touched.assets_type && errors.assets_type}
              />

              <InputFields
                required
                label="Manufacturing Year"
                name="manufacturing_year"
                options={[
                  { value: "2020", label: "2020" },
                  { value: "2021", label: "2021" },
                  { value: "2022", label: "2022" },
                  { value: "2023", label: "2023" },
                  { value: "2024", label: "2024" },
                  { value: "2025", label: "2025" },
                ]}
                value={values.manufacturing_year}
                onChange={(e) => setFieldValue("manufacturing_year", e.target.value)}
                error={touched.manufacturing_year && errors.manufacturing_year}
              />

              <InputFields
                required
                label="Remarks"
                name="remarks"
                value={values.remarks}
                onChange={(e) => setFieldValue("remarks", e.target.value)}
                error={touched.remarks && errors.remarks}
              />

              <InputFields
                required
                label="Status"
                name="status"
                type="radio"
                options={assetsStatusOptions}
                value={values.status}
                onChange={(e) => setFieldValue("status", e.target.value)}
                error={touched.status && errors.status}
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
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <div onClick={() => router.back()}>
          <Icon icon="lucide:arrow-left" width={24} />
        </div>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Update Assets Master" : "Add New Assets Master"}
        </h1>
      </div>

      {/* FORMIK */}
      <Formik
        initialValues={chiller}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched, handleSubmit, setErrors, setTouched }) => (
          <Form>
            <StepperForm
              steps={steps.map((step) => ({
                ...step,
                isCompleted: isStepCompleted(step.id),
              }))}
              currentStep={currentStep}
              onBack={prevStep}
              onNext={() =>
                handleNext(values, {
                  setErrors,
                  setTouched,
                } as FormikHelpers<any>)
              }
              onSubmit={handleSubmit}
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
