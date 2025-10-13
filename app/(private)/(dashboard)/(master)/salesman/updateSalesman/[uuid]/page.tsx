"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import CustomPasswordInput from "@/app/components/customPasswordInput";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { Formik, Form, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter, useParams } from "next/navigation";
import { updateSalesman, getSalesmanById } from "@/app/services/allApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

// ✅ Same interface
interface SalesmanFormValues {
    name: string;
    type: string;
    sub_type: string;
    designation: string;
    device_no: string;
    route: string;
    salesman_role: string;
    username: string;
    password: string;
    contact_no: string;
    warehouse: string;
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
    route: Yup.string().required("Route is required"),
    warehouse: Yup.string().required("Warehouse is required"),
});

// ✅ Step schemas
const stepSchemas = [
    Yup.object({
        name: Yup.string().required("Name is required"),
        sap_id: Yup.string().required("SAP ID is required"),
        salesman_type: Yup.string().required("Type is required"),
        sub_type: Yup.string().required("Sub Type is required"),
        designation: Yup.string().required("Designation is required"),
        warehouse: Yup.string().required("Warehouse is required"),
        route: Yup.string().required("Route is required"),
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
        salesman_role: Yup.string(),
        status: Yup.string().required("Status is required"),
        is_login: Yup.string(),
    }),
];

export default function UpdateSalesmanStepper() {
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const params = useParams(); // ✅ get uuid from URL
    const uuid = params?.uuid as string;

    const { salesmanTypeOptions, warehouseOptions, routeOptions } = useAllDropdownListData();

    const steps: StepperStep[] = [
        { id: 1, label: "Salesman Details" },
        { id: 2, label: "Contact & Login" },
        { id: 3, label: "Additional Info" },
    ];

    const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } =
        useStepperForm(steps.length);

    // ✅ Initial state for Formik
    const [initialValues, setInitialValues] = useState<SalesmanFormValues>({
        name: "",
        type: "",
        sub_type: "",
        designation: "",
        device_no: "",
        route: "",
        salesman_role: "",
        username: "",
        password: "",
        contact_no: "",
        warehouse: "",
        token_no: "",
        sap_id: "",
        is_login: "0",
        status: "1",
        email: "",
    });

    // ✅ Fetch existing data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getSalesmanById(uuid);
                if (res?.status === "success" && res.data) {
                    setInitialValues({
                        name: res.data.name ?? "",
                        type: res.data.salesman_type.id.toString() ?? "",
                        sub_type: res.data.sub_type ?? "",
                        designation: res.data.designation ?? "",
                        device_no: res.data.device_no ?? "",
                        route: res.data.route.id.toString() ?? "",
                        salesman_role: res.data.salesman_role ?? "",
                        username: res.data.username ?? "",
                        password: "",
                        contact_no: res.data.contact_no ?? "",
                        warehouse: res.data.warehouse.id.toString() ?? "",
                        token_no: res.data.token_no ?? "",
                        sap_id: res.data.sap_id ?? "",
                        is_login: res.data.is_login.toString() ?? "0",
                        status: res.data.status.toString() ?? "1",
                        email: res.data.email ?? "",
                    });
                }
            } catch {
                showSnackbar("Failed to fetch salesman details ❌", "error");
            }
        };
        if (uuid) fetchData();
    }, [uuid, showSnackbar]);


    // ✅ Next step validation
    const handleNext = async (
        values: SalesmanFormValues,
        actions: FormikHelpers<SalesmanFormValues>
    ) => {
        try {
            const schema = stepSchemas[currentStep - 1];
            await schema.validate(values, { abortEarly: false });
            markStepCompleted(currentStep);
            nextStep();
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const fields = err.inner.map((e) => e.path);
                actions.setTouched(
                    fields.reduce((acc, key) => ({ ...acc, [key!]: true }), {} as Record<string, boolean>)
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

    // ✅ Update API call
    const handleSubmit = async (values: SalesmanFormValues) => {
        try {
            await SalesmanSchema.validate(values, { abortEarly: false });

            const formData = new FormData();
            (Object.keys(values) as (keyof SalesmanFormValues)[]).forEach((key) => {
                formData.append(key, values[key] ?? "");
            });

            const res = await updateSalesman(uuid, formData);
            if (!res || res.status !== "success") {
                showSnackbar(res.message || "Failed to update salesman ❌", "error");
            } else {
                showSnackbar("Salesman updated successfully ✅", "success");
                router.push("/salesman");
            }
        } catch {
            showSnackbar("Update salesman failed ❌", "error");
        }
    };

    // ✅ Render step content (same as before)
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
                            <InputFields label="Salesman Type" name="salesman_type" value={values.type} onChange={(e) => setFieldValue("type", e.target.value)} options={salesmanTypeOptions} />
                            <InputFields label="Sub Type" name="sub_type" value={values.sub_type} onChange={(e) => setFieldValue("sub_type", e.target.value)} options={[{ value: "0", label: "None" }, { value: "1", label: "Merchandiser" }]} />
                            <InputFields label="Designation" name="designation" value={values.designation} onChange={(e) => setFieldValue("designation", e.target.value)} />
                            <InputFields label="Warehouse" name="warehouse" value={values.warehouse} onChange={(e) => setFieldValue("warehouse", e.target.value)} options={warehouseOptions} />
                            <InputFields label="Route" name="route" value={values.route} onChange={(e) => setFieldValue("route", e.target.value)} options={routeOptions} />
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
                    <Link href="/salesman">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Update Salesman</h1>
                </div>
            </div>

            <Formik enableReinitialize initialValues={initialValues} validationSchema={SalesmanSchema} onSubmit={handleSubmit}>
                {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit, setErrors, setTouched }) => (
                    <Form>
                        <StepperForm
                            steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
                            currentStep={currentStep}
                            onStepClick={() => { }}
                            onBack={prevStep}
                            onNext={() => handleNext(values, { setErrors, setTouched } as FormikHelpers<SalesmanFormValues>)}
                            onSubmit={formikSubmit}  // <-- pass directly
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText="Update"
                        >

                            {renderStepContent(values, setFieldValue, errors, touched)}
                        </StepperForm>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
