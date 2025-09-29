"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import CustomSecurityCode from "@/app/components/customSecurityCode";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { addSalesman } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";


interface SalesmanFormValues {
  name: string;
  type: string;
  sub_type: string;
  designation: string;
  security_code: string;
  device_no: string;
  route_id: string;
  salesman_role: string;
  username: string;
  password: string;
  contact_no: string;
  warehouse_id: string;
  token_no: string;
  sap_id: string;
  is_login: string;
  status: string;
  email: string;
}

const SalesmanSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  sap_id: Yup.string().required("SAP ID is required"),
  type: Yup.string().required("Type is required"),
  sub_type: Yup.string().required("Sub Type is required"),
  designation: Yup.string().required("Designation is required"),
  contact_no: Yup.string().required("Contact is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
  security_code: Yup.string().required("Security code is required"),
  route_id: Yup.string().required("Route is required"),
  warehouse_id: Yup.string().required("Warehouse is required"),
});

const stepSchemas = [
  Yup.object({
    name: Yup.string().required("Name is required"),
    sap_id: Yup.string().required("SAP ID is required"),
    type: Yup.string().required("Type is required"),
    sub_type: Yup.string().required("Sub Type is required"),
    designation: Yup.string().required("Designation is required"),
    warehouse_id: Yup.string().required("Warehouse is required"),
    route_id: Yup.string().required("Route is required"),
  }),
  Yup.object({
    contact_no: Yup.string().required("Contact is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
    device_no: Yup.string(),
    token_no: Yup.string(),
    email: Yup.string().email("Invalid email"),
  }),
  Yup.object({
    security_code: Yup.string().required("Security code is required"),
    block_date_from: Yup.string(),
    block_date_to: Yup.string(),
    salesman_role: Yup.string(),
    status: Yup.string().required("Status is required"),
    is_login: Yup.string(),
  }),
];

export default function AddCustomerStepper() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const { salesmanTypeOptions, warehouseOptions, routeOptions } = useAllDropdownListData();


  const steps: StepperStep[] = [
    { id: 1, label: "Salesman Details" },
    { id: 2, label: "Contact & Login" },
    { id: 3, label: "Additional Info" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
    useStepperForm(steps.length);

  const initialValues: SalesmanFormValues = {
    name: "",
    type: "",
    sub_type: "",
    designation: "",
    security_code: "",
    device_no: "",
    route_id: "",
    salesman_role: "",
    username: "",
    password: "",
    contact_no: "",
    warehouse_id: "",
    token_no: "",
    sap_id: "",
    is_login: "0",
    status: "1",
    email: "",
  };

  const handleNext = async (
    values: SalesmanFormValues,
    actions: FormikHelpers<SalesmanFormValues>
  ) => {
    try {
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
                 (acc: Partial<Record<keyof SalesmanFormValues, string>>, curr) => ({
                   ...acc,
                   [curr.path as keyof SalesmanFormValues]: curr.message,
                 }),
                 {}
               )
             );
           }
           showSnackbar("Please fix validation errors before proceeding", "error");
         }
       };

  const handleSubmit = async (values: SalesmanFormValues) => {
     try {
       await SalesmanSchema.validate(values, { abortEarly: false });
 
       // Convert to FormData for API
       const formData = new FormData();
       (Object.keys(values) as (keyof SalesmanFormValues)[]).forEach((key) => {
         formData.append(key, values[key] ?? "");
       });
 
       const res = await addSalesman(formData);
       if (res.error) {
         showSnackbar(res.data?.message || "Failed to add salesman ❌", "error");
       } else {
         showSnackbar("Salesman added successfully ✅", "success");
         router.push("/dashboard/master/salesman");
       }
     } catch {
       showSnackbar("Add salesman failed ❌", "error");
     }
   };

  const renderStepContent = (
    values: SalesmanFormValues,
    setFieldValue: (field: keyof SalesmanFormValues, value: string, shouldValidate?: boolean) => void,
    errors: FormikErrors<SalesmanFormValues>,
    touched: FormikTouched<SalesmanFormValues>
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields label="Name" name="name" value={values.name} onChange={(e) => setFieldValue("name", e.target.value)} error={touched.name && errors.name} />
              <InputFields label="SAP ID" name="sap_id" value={values.sap_id} onChange={(e) => setFieldValue("sap_id", e.target.value)} error={touched.sap_id && errors.sap_id} />
              <InputFields label="Salesman Type" name="type" value={values.type} onChange={(e) => setFieldValue("type", e.target.value)} options={salesmanTypeOptions} />
              <InputFields label="Sub Type" name="sub_type" value={values.sub_type} onChange={(e) => setFieldValue("sub_type", e.target.value)} options={[{ value: "0", label: "None" }, { value: "1", label: "Merchandiser" }]} />
              <InputFields label="Designation" name="designation" value={values.designation} onChange={(e) => setFieldValue("designation", e.target.value)} />
              <InputFields label="Warehouse" name="warehouse_id" value={values.warehouse_id} onChange={(e) => setFieldValue("warehouse_id", e.target.value)} options={warehouseOptions} />
              <InputFields label="Route" name="route_id" value={values.route_id} onChange={(e) => setFieldValue("route_id", e.target.value)} options={routeOptions} />
            </div>
          </ContainerCard>
        );
      case 2:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFields label="Contact No" name="contact_no" value={values.contact_no} onChange={(e) => setFieldValue("contact_no", e.target.value)} />
              <InputFields label="Email" name="email" value={values.email} onChange={(e) => setFieldValue("email", e.target.value)} />
              <InputFields label="Username" name="username" value={values.username} onChange={(e) => setFieldValue("username", e.target.value)} />
              <CustomPasswordInput label="Password" value={values.password} onChange={(e) => setFieldValue("password", e.target.value)} />
              <InputFields label="Device No" name="device_no" value={values.device_no} onChange={(e) => setFieldValue("device_no", e.target.value)} />
              <InputFields label="Token No" name="token_no" value={values.token_no} onChange={(e) => setFieldValue("token_no", e.target.value)} />
            </div>
          </ContainerCard>
        );
      case 3:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSecurityCode label="Security Code" placeholder="Security Code" value={values.security_code} onChange={(e) => setFieldValue("security_code", e.target.value)} />
              <InputFields label="Salesman Role" name="salesman_role" value={values.salesman_role} onChange={(e) => setFieldValue("salesman_role", e.target.value)} />
              <InputFields label="Status" name="status" value={values.status} onChange={(e) => setFieldValue("status", e.target.value)} options={[{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }]} />
              <InputFields label="Is Login" name="is_login" value={values.is_login} onChange={(e) => setFieldValue("is_login", e.target.value)} options={[{ value: "1", label: "Yes" }, { value: "0", label: "No" }]} />
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
          <Link href="/dashboard/master/salesman">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Add New Salesman</h1>
        </div>
      </div>

     <Formik
  initialValues={initialValues}
  validationSchema={SalesmanSchema}
  onSubmit={handleSubmit}
>
  {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit, setErrors, setTouched }) => (
    <Form>
      <StepperForm
        steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
        currentStep={currentStep}
        onStepClick={() => {}}
        onBack={prevStep}
        onNext={() => handleNext(values, { setErrors, setTouched } as FormikHelpers<SalesmanFormValues>)} 
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
