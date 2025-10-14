"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Formik,
  Form,
  FormikHelpers,
  FormikErrors,
  FormikTouched,
  ErrorMessage,
} from "formik";
import * as Yup from "yup";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import CustomSecurityCode from "@/app/components/customSecurityCode";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import Loading from "@/app/components/Loading";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import {
  addSalesman,
  genearateCode,
  saveFinalCode,
  updateSalesman,
  getSalesmanById,
} from "@/app/services/allApi";

interface SalesmanFormValues {
  osa_code: string;
  name: string;
  type: string;
  designation: string;
  route_id: string;
  username: string;
  password: string;
  contact_no: string;
  warehouse_id: string;
  forceful_login: string;
  is_block: string;
  status: string;
  is_block_reason: string;
  email: string;
}

// ✅ Validation Schema
const SalesmanSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  designation: Yup.string().required("Designation is required"),
  contact_no: Yup.string().required("Contact is required").min(9).max(13),
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .required("Password is required")
    .min(12, "Password must be at least 12 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{12,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  route_id: Yup.string().required("Route is required"),
  warehouse_id: Yup.string().required("Warehouse is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
});

// ✅ Step-wise validation
const stepSchemas = [
  Yup.object({
    name: Yup.string().required("Name is required"),
    type: Yup.string().required("Type is required"),
    designation: Yup.string().required("Designation is required"),
    warehouse_id: Yup.string().required("Warehouse is required"),
    route_id: Yup.string().required("Route is required"),
  }),
  Yup.object({
    contact_no: Yup.string().required("Contact is required").min(9).max(13),
    username: Yup.string().required("Username is required"),
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
    is_login: Yup.string(),
  }),
];

export default function AddEditSalesman() {
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams<{ uuid?: string | string[] }>();
  const salesmanId = params?.uuid as string | undefined;
  const isEditMode = salesmanId && salesmanId !== "add";
  const codeGeneratedRef = useRef(false);

  const { salesmanTypeOptions, warehouseOptions, routeOptions } =
    useAllDropdownListData();

  const [initialValues, setInitialValues] = useState<SalesmanFormValues>({
    osa_code: "",
    name: "",
    type: "",
    designation: "",
    route_id: "",
    forceful_login: "0",
    is_block: "0",
    username: "",
    password: "",
    contact_no: "",
    warehouse_id: "",
    status: "1",
    is_block_reason: "",
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
              designation: d.designation || "",
              route_id: d.route?.id?.toString() || "",
              username: d.username || "",
              password: d.password, // password is not returned from API → leave empty
              contact_no: d.contact_no || "",
              warehouse_id: d.warehouse?.id?.toString() || "",
              is_block: d.is_block?.toString() || "0",
              forceful_login: d.forceful_login?.toString() || "0",
              status: d.status?.toString() || "1",
              is_block_reason: d.is_block_reason || "",
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

  // // ✅ Step validation
  // const handleNext = async (
  //   values: SalesmanFormValues,
  //   actions: FormikHelpers<SalesmanFormValues>
  // ) => {
  //   try {
  //     const schema = stepSchemas[currentStep - 1];
  //     await schema.validate(values, { abortEarly: false });
  //     markStepCompleted(currentStep);
  //     nextStep();
  //   } catch (err: unknown) {
  //     if (err instanceof Yup.ValidationError) {
  //       actions.setTouched(
  //         err.inner.reduce((acc, curr) => ({ ...acc, [curr.path!]: true }), {})
  //       );
  //       actions.setErrors(
  //         err.inner.reduce(
  //           (acc, curr) => ({
  //             ...acc,
  //             [curr.path as keyof SalesmanFormValues]: curr.message,
  //           }),
  //           {}
  //         )
  //       );
  //     }
  //     showSnackbar("Please fix validation errors before proceeding", "error");
  //   }
  // };

  const handleNext = async (
    values: SalesmanFormValues,
    actions: FormikHelpers<SalesmanFormValues>
  ) => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(values, { abortEarly: false });

      markStepCompleted(currentStep);
      // ✅ Clear errors/touched when moving to next step
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
      showSnackbar("Please fix validation errors before proceeding", "error");
    }
  };

  const handlePrev = (
    actions: FormikHelpers<SalesmanFormValues>
  ) => {
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
        showSnackbar(isEditMode ? "Salesman Updated Successfully" : "Salesman Created Successfully", "success");
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
                  error={touched.name && errors.name}
                />
                <ErrorMessage
                  name="name"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <InputFields
                  label="Salesman Type"
                  name="type"
                  value={values.type}
                  onChange={(e) => setFieldValue("type", e.target.value)}
                  options={salesmanTypeOptions}
                />
                <ErrorMessage
                  name="type"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              <div>
                <InputFields
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
                  label="Warehouse"
                  type="select"
                  name="warehouse_id"
                  value={values.warehouse_id}
                  onChange={(e) => setFieldValue("warehouse_id", e.target.value)}
                  options={warehouseOptions}
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
                  value={values.route_id}
                  onChange={(e) => setFieldValue("route_id", e.target.value)}
                  options={routeOptions}
                />
                <ErrorMessage
                  name="route_id"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label="Contact No"
                  name="contact_no"
                  value={values.contact_no}
                  onChange={(e) => setFieldValue("contact_no", e.target.value)}
                />
                <ErrorMessage
                  name="contact_no"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              <div>
                <InputFields
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
                <InputFields
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={(e) => setFieldValue("username", e.target.value)}
                />
                <ErrorMessage
                  name="username"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              <div>
                <CustomPasswordInput
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
             
              <div>
              </div>
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  label=" forceful login"
                  type="radio"
                  name="forceful_login"
                  value={values.forceful_login}
                  onChange={(e) => setFieldValue("forceful_login", e.target.value)}
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
                  label="Is block"
                  name="is_block"
                  type="radio"
                  value={values.is_block}
                  onChange={(e) => setFieldValue("is_block", e.target.value)}
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                />
                <ErrorMessage
                  name="is_block"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>
              {values.is_block === "1" && (
                <div>
                  <InputFields
                    label="Block Region"
                    type="select"
                    name="is_block_reason"
                    value={values.is_block_reason || ""}
                    onChange={(e) => setFieldValue("is_block_reason", e.target.value)}
                    options={[
                    { value: "Cashier Description", label: "Cashier Description" },
                    { value: "Invoice", label: "Invoice" },
                  ]}
                  />
                </div>
              )}
              <div>
                <InputFields
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
            {isEditMode ? "Edit Salesman" : "Add New Salesman"}
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
              onBack={() => handlePrev({ setErrors, setTouched } as FormikHelpers<SalesmanFormValues>)}
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
              submitButtonText={isEditMode ? "Update" : "Submit"}
            >
              {renderStepContent(values, setFieldValue, errors, touched)}
            </StepperForm>
          </Form>
        )}
      </Formik>
    </div>
  );
}
