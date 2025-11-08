"use client";

import { Icon } from "@iconify-icon/react";
import {
  ErrorMessage,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
  FormikTouched,
} from "formik";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import CustomCheckbox from "@/app/components/customCheckbox";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import StepperForm, {
  StepperStep,
  useStepperForm,
} from "@/app/components/stepperForm";
import {
  addSalesman,
  genearateCode,
  getSalesmanById,
  routeList,
  saveFinalCode,
  updateSalesman,
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";

interface SalesmanFormValues {
  osa_code: string;
  name: string;
  type: string;
  sub_type: string;
  designation: string;
  route_id: string;
  password: string;
  contact_no: string;
  warehouse_id: string;
  forceful_login: string;
  is_block: string;
  status: string;
  block_date_from: string;
  block_date_to: string;
  cashier_description_block?: string;
  invoice_block?: string;
  reason: string;
  email: string;
}

interface contactCountry {
  name: string;
  code?: string;
  flag?: string;
}

// ✅ Validation Schema
const SalesmanSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  designation: Yup.string().required("Designation is required"),
  contact_no: Yup.string()
    .required("Owner Contact number is required")
    .matches(/^[0-9]+$/, "Only numbers are allowed")
    .min(9, "Must be at least 9 digits")
    .max(10, "Must be at most 10 digits"),
  password: Yup.string()
    .required("Password is required")
    .min(12, "Password must be at least 12 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{12,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  warehouse_id: Yup.array().required("Warehouse is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
});

// ✅ Step-wise validation
const stepSchemas = [
  Yup.object({
    name: Yup.string().required("Name is required"),
    type: Yup.string().required("Type is required"),
    designation: Yup.string().required("Designation is required"),
    warehouse_id: Yup.array().required("Warehouse is required"),
  }),
  Yup.object({
    contact_no: Yup.string()
      .required("Contact number is required")
      .matches(/^[0-9]+$/, "Only numbers are allowed")
      .min(9, "Must be at least 9 digits")
      .max(13, "Must be at most 13 digits"),
    password: Yup.string()
      .required("Password is required")
      .min(12, "Password must be at least 12 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{12,}$/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    email: Yup.string().required("Email is required").email("Invalid email"),
  }),
  Yup.object({
    status: Yup.string().required("Status is required"),
    is_block: Yup.string(),
    cashier_description_block: Yup.string(),
    invoice_block: Yup.string(),
  }).test(
    "only-one-block",
    "Select only one: Is Block, Cashier Description Block, or Invoice Block",
    (values) => {
      const selected = [
        values.is_block,
        values.cashier_description_block,
        values.invoice_block,
      ].filter((v) => v === "1");
      return selected.length <= 1;
    }
  ),
];

type props = {
  selectedCountry: { name: string; code?: string; flag?: string };
  setSelectedCountry: { name: string; code?: string; flag?: string };
};

export default function AddEditSalesman({
  selectedCountry,
  setSelectedCountry,
}: props) {
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams<{ uuid?: string | string[] }>();
  const salesmanId = params?.uuid as string | undefined;
  const isEditMode = salesmanId && salesmanId !== "add";
  const codeGeneratedRef = useRef(false);

  const { salesmanTypeOptions, warehouseOptions, routeOptions, projectOptions } =
    useAllDropdownListData();
  const [filteredRouteOptions, setFilteredRouteOptions] =
    useState(routeOptions);

  const [country, setCountry] = useState<Record<string, contactCountry>>({
    contact_no: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    contact_no2: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    whatsapp_no: { name: "Uganda", code: "+256", flag: "🇺🇬" },
  });

  const [initialValues, setInitialValues] = useState<SalesmanFormValues>({
    osa_code: "",
    name: "",
    type: "",
    designation: "",
    route_id: "",
    forceful_login: "0",
    is_block: "0",
    password: "",
    contact_no: "",
    sub_type: "",
    warehouse_id: "",
    status: "1",
    cashier_description_block: "0",
    invoice_block: "0",
    block_date_from: "",
    block_date_to: "",
    reason: "",
    email: "",
  });

  const steps: StepperStep[] = [
    { id: 1, label: "Salesman Details" },
    { id: 2, label: "Contact & Login" },
    { id: 3, label: "Additional Info" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const fetchRoutes = async (value: string) => {
    const filteredOptions = await routeList({
      warehouse_id: value,
      per_page: "10",
    });
    if (filteredOptions.error) {
      showSnackbar(
        filteredOptions.data?.message || "Failed to fetch routes",
        "error"
      );
      return;
    }
    const options = filteredOptions?.data || [];
    setFilteredRouteOptions(
      options.map((route: { id: number; route_name: string }) => ({
        value: String(route.id),
        label: route.route_name,
      }))
    );
  };

  // ✅ Fetch data
  useEffect(() => {
    (async () => {
      if (isEditMode) {
        try {
          const res = await getSalesmanById(salesmanId as string);
          if (res && !res.error && res.data) {
            const d = res.data;
            setInitialValues({
              osa_code: d.osa_code || "",
              name: d.name || "",
              type: d.salesman_type?.id?.toString() || "",
              sub_type: d.sub_type?.id?.toString() || "",
              designation: d.designation || "",
              route_id: d.route?.id?.toString() || "",
              password: d.password, // password is not returned from API → leave empty
              contact_no: d.contact_no || "",
              warehouse_id: d.warehouse?.id?.toString() || "",
              is_block: d.is_block?.toString() || "0",
              forceful_login: d.forceful_login?.toString() || "1",
              status: d.status?.toString() || "1",
              block_date_from: d.block_date_from || "",
              block_date_to: d.block_date_to || "",
              reason: d.is_block_reason || "",
              cashier_description_block:
                d.cashier_description_block?.toString() || "0",
              invoice_block: d.invoice_block?.toString() || "0",
              email: d.email || "",
            });
          }
        } catch (e) {
          console.error("Failed to fetch salesman:", e);
        }
        setLoading(false);
      } else if (!codeGeneratedRef.current) {
        codeGeneratedRef.current = true;
        try {
          const res = await genearateCode({ model_name: "salesman" });
          if (res?.code) {
            setInitialValues((prev) => ({ ...prev, osa_code: res.code }));
          }
          if (res?.prefix) {
            setPrefix(res.prefix);
          }
        } catch (e) {
          console.error("Code generation failed:", e);
        }
        setLoading(false);
      }
    })();
  }, [isEditMode, salesmanId]);

  const handleNext = async (
    values: SalesmanFormValues,
    actions: FormikHelpers<SalesmanFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });

      markStepCompleted(currentStep);
      actions.setErrors({});
      actions.setTouched({});
      nextStep();
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const fieldErrors = err.inner.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path as keyof SalesmanFormValues]: curr.message,
          }),
          {}
        );
        actions.setErrors(fieldErrors);
        actions.setTouched(
          Object.keys(fieldErrors).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          )
        );
      }
      // showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  const handlePrev = (actions: FormikHelpers<SalesmanFormValues>) => {
    actions.setErrors({});
    actions.setTouched({});
    prevStep();
  };

  // ✅ Submit handler
  const handleSubmit = async (
    values: SalesmanFormValues,
    { setSubmitting }: FormikHelpers<SalesmanFormValues>
  ) => {
    try {
      await SalesmanSchema.validate(values, { abortEarly: false });
      const formData = new FormData();
      (Object.keys(values) as (keyof SalesmanFormValues)[]).forEach((key) => {
        formData.append(key, values[key] ?? "");
      });

      let res;
      if (isEditMode) {
        res = await updateSalesman(salesmanId as string, formData);
      } else {
        res = await addSalesman(formData);
      }

      if (res.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Salesman Updated Successfully"
            : "Salesman Created Successfully",
          "success"
        );
        router.push("/salesman");
        try {
          await saveFinalCode({
            reserved_code: values.osa_code,
            model_name: "salesman",
          });
        } catch { }
      }
    } catch {
      showSnackbar("Validation failed, please check your inputs", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Step content renderer
  const renderStepContent = (
    values: SalesmanFormValues,
    setFieldValue: (
      field: keyof SalesmanFormValues,
      value: string,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<SalesmanFormValues>,
    touched: FormikTouched<SalesmanFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields
                required
                label="OSA Code"
                disabled
                name="osa_code"
                value={values.osa_code}
                onChange={(e) => setFieldValue("osa_code", e.target.value)}
                error={touched.osa_code && errors.osa_code}
              />

              <div>
                <InputFields
                  required
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={(e) => setFieldValue("name", e.target.value)}
                // error={touched.name && errors.name}
                />
                {/* <ErrorMessage
                  name="name"
                  component="span"
                  className="text-xs text-red-500"
                /> */}
              </div>
              <div className="flex flex-col w-full">
                <InputFields
                  label="Salesman Type"
                  name="salesman_type"
                  value={values.type}
                  options={salesmanTypeOptions}
                  onChange={(e) => setFieldValue("type", e.target.value)}
                />
                {errors.type && (
                  <p className="text-red-500 text-sm">{errors.type}</p>
                )}
              </div>

              {/* Show Project List only when salesman_type id = 6 */}
              {values.type === "6" && (
                <div className="flex flex-col w-full">
                  <InputFields
                    label="Project List"
                    value={values.sub_type}
                    options={projectOptions}
                    onChange={(e) => setFieldValue("sub_type", e.target.value)}
                  />
                </div>
              )}

              <div>
                <InputFields
                  required
                  label="Designation"
                  name="designation"
                  value={values.designation}
                  onChange={(e) => setFieldValue("designation", e.target.value)}
                />
                <ErrorMessage
                  name="designation"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Warehouse"
                  type="select"
                  name="warehouse_id"
                  value={values.warehouse_id}
                  options={warehouseOptions}
                  disabled={warehouseOptions.length === 0}
                  isSingle={!values.sub_type}
                  onChange={(e) => {
                    setFieldValue("warehouse_id", e.target.value);
                    if (values.warehouse_id !== e.target.value) {
                      fetchRoutes(e.target.value);
                    }
                  }}
                />
                <ErrorMessage
                  name="warehouse_id"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              <div>
                <InputFields
                  label="Route"
                  name="route_id"
                  value={values.route_id?.toString() ?? ""}
                  onChange={(e) => setFieldValue("route_id", e.target.value)}
                  options={filteredRouteOptions}
                  // 👇 Disable when project is selected
                  disabled={!!values.sub_type}
                />
              </div>

            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div >
                <InputFields
                  required
                  type="contact"
                  label="Owner Contact Number"
                  name="contact_no"
                  // setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, contact_no: country }))}
                  selectedCountry={country.contact_no}
                  value={`${values.contact_no ?? ""}`}
                  onChange={(e) => setFieldValue("contact_no", e.target.value)}
                // error={
                //   errors?.contact_no && touched?.contact_no
                //     ? errors.contact_no
                //     : false
                // }
                />
                {errors?.contact_no && touched?.contact_no && (
                  <span className="text-xs text-red-500 mt-1">
                    {/* {errors.contact_no} */}
                  </span>
                )}
              </div>

              <div>
                <InputFields
                  required
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={(e) => setFieldValue("email", e.target.value)}
                />
                <ErrorMessage
                  name="email"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <CustomPasswordInput
                  required
                  label="Password"
                  value={values.password}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                />
                <ErrorMessage
                  name="password"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              <div></div>
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Forceful login"
                  type="radio"
                  name="forceful_login"
                  value={values.forceful_login}
                  onChange={(e) =>
                    setFieldValue("forceful_login", e.target.value)
                  }
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                />
                <ErrorMessage
                  name="forceful_login"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Status"
                  name="status"
                  type="radio"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                />
                <ErrorMessage
                  name="status"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div className="col-span-3">
                <div className="font-medium mb-2"></div>
                <div className="flex gap-93">
                  <CustomCheckbox
                    id="is_block"
                    label="Is Block"
                    checked={values.is_block === "1"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFieldValue("is_block", "1");
                        setFieldValue("cashier_description_block", "0");
                        setFieldValue("invoice_block", "0");
                      } else {
                        setFieldValue("is_block", "0");
                      }
                    }}
                  />
                  <CustomCheckbox
                    id="cashier_description_block"
                    label="Cashier Description Block"
                    checked={values.cashier_description_block === "1"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFieldValue("is_block", "0");
                        setFieldValue("cashier_description_block", "1");
                        setFieldValue("invoice_block", "0");
                      } else {
                        setFieldValue("cashier_description_block", "0");
                      }
                    }}
                  />
                  <CustomCheckbox
                    id="invoice_block"
                    label="Invoice Block"
                    checked={values.invoice_block === "1"}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFieldValue("is_block", "0");
                        setFieldValue("cashier_description_block", "0");
                        setFieldValue("invoice_block", "1");
                      } else {
                        setFieldValue("invoice_block", "0");
                      }
                    }}
                  />
                </div>
                {errors.is_block && (
                  <span className="text-xs text-red-500">
                    {errors.is_block}
                  </span>
                )}
              </div>
              {values.is_block === "1" && (
                <>
                  <div>
                    <InputFields
                      label="Block Date From"
                      type="date"
                      name="block_date_from"
                      value={values.block_date_from || ""}
                      onChange={(e) =>
                        setFieldValue("block_date_from", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputFields
                      label="Block Date To"
                      type="date"
                      name="block_date_to"
                      value={values.block_date_to || ""}
                      onChange={(e) =>
                        setFieldValue("block_date_to", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
              {values.invoice_block === "1" && (
                <div>
                  <InputFields
                    label="Reason"
                    name="reason"
                    value={values.reason || ""}
                    onChange={(e) => setFieldValue("reason", e.target.value)}
                  />
                </div>
              )}
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/salesman">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Salesman" : "Add New Salesman"}
          </h1>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={SalesmanSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          setFieldValue,
          errors,
          touched,
          handleSubmit: formikSubmit,
          setErrors,
          setTouched,
          isSubmitting: isSubmitting,
        }) => (
          <Form>
            <>{console.log(values)}</>
            <StepperForm
              steps={steps.map((step) => ({
                ...step,
                isCompleted: isStepCompleted(step.id),
              }))}
              currentStep={currentStep}
              onStepClick={() => { }}
              onBack={() =>
                handlePrev({
                  setErrors,
                  setTouched,
                } as FormikHelpers<SalesmanFormValues>)
              }
              onNext={() =>
                handleNext(values, {
                  setErrors,
                  setTouched,
                } as FormikHelpers<SalesmanFormValues>)
              }
              onSubmit={() => formikSubmit()}
              showSubmitButton={isLastStep}
              showNextButton={!isLastStep}
              nextButtonText="Save & Next"
              submitButtonText={
                isSubmitting
                  ? (isEditMode ? "Updating..." : "Submitting...")
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
