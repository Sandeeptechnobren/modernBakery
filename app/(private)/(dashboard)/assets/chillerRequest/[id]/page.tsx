"use client";

import StepperForm, {
    useStepperForm,
    StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import * as Yup from "yup";
import {
    Formik,
    Form,
    FormikHelpers,
    FormikErrors,
    FormikTouched,
    ErrorMessage,
} from "formik";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import { addChillerRequest, chillerRequestByUUID, updateChillerRequest } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useEffect, useState } from "react";

const validationSchema = Yup.object({
  outlet_name: Yup.string()
    .trim()
    .required("Outlet Name is required")
    .max(100, "Outlet Name cannot exceed 100 characters"),
  owner_name: Yup.string()
    .trim()
    .required("Owner Name is required")
    .max(100, "Owner Name cannot exceed 100 characters"),
  contact_number: Yup.string()
    .matches(/^\d{10}$/, "Contact Number must be exactly 10 digits")
    .required("Contact Number is required"),
  outlet_type: Yup.string()
    .trim()
    .required("Outlet Type is required")
    .max(50, "Outlet Type cannot exceed 50 characters"),
  machine_number: Yup.string()
    .trim()
    .required("Machine Number is required")
    .max(50, "Machine Number cannot exceed 50 characters"),
  asset_number: Yup.string()
    .trim()
    .required("Asset Number is required")
    .max(50, "Asset Number cannot exceed 50 characters"),
  agent_id: Yup.number()
    .required("Agent is required")
    .typeError("Agent must be a number"),
  salesman_id: Yup.number().nullable() 
    .typeError("Salesman ID must be a number"),
  route_id: Yup.number().nullable()
    .typeError("Route ID must be a number"),
  status: Yup.number()
    .oneOf([0, 1], "Invalid status selected")
    .required("Status is required"),
});

const stepSchemas = [
  // Step 1: Outlet and Owner Information
  Yup.object().shape({
    outlet_name: validationSchema.fields.outlet_name,
    outlet_type: validationSchema.fields.outlet_type,
    owner_name: validationSchema.fields.owner_name,
    contact_number: validationSchema.fields.contact_number,
  }),

  // Step 2: Outlet and Machine Details
  Yup.object().shape({
    machine_number: validationSchema.fields.machine_number,
    asset_number: validationSchema.fields.asset_number,
  }),

  // Step 3: Agent, Salesman, and Route Information
  Yup.object().shape({
    agent_id: validationSchema.fields.agent_id,
    salesman_id: validationSchema.fields.salesman_id,
    route_id: validationSchema.fields.route_id,
  }),

  // Step 4: Status
  Yup.object().shape({
    status: validationSchema.fields.status,
  }),
];

type chillerRequest = {
  outlet_name: string;
  owner_name: string;
  contact_number: string;
  outlet_type: string;
  machine_number: string;
  asset_number: string;
  agent_id?: string;
  salesman_id?: string; 
  route_id?: string; 
  status: string; 
  agent?: { id: string | number };
  salesman?: { id: string | number };
  route?: { id: string | number };
};

export default function Page() {
    const { setLoading } = useLoading();
    useEffect(() => setLoading(false), [setLoading]);
    const params = useParams();
    const id = params?.id || "";
    const isEditMode = id !== "add" && id !== "";
    let uuid = isEditMode ? id : null;
    if(uuid && Array.isArray(uuid)){
        uuid = uuid[0] || "";
    }
    
    const { agentCustomerOptions, salesmanOptions, routeOptions } = useAllDropdownListData();
    const steps: StepperStep[] = [
        { id: 1, label: "Outlet and Owner Information" },
        { id: 2, label: "Machine Details" },
        { id: 3, label: "Agent, Salesman and Route" },
        { id: 4, label: "Status" },
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
    const [chiller, setChiller] = useState<null | chillerRequest>(null);

    useEffect(() => {
        if (isEditMode && uuid) {
            const fetchData = async () => {
                setLoading(true);
                const res = await chillerRequestByUUID(uuid as string);
                setLoading(false);
                if (res.error) {
                    showSnackbar(res.data.message || "Failed to fetch chiller", "error");
                    throw new Error("Unable to fetch chiller");
                } else {
                    setChiller(res.data);
                }
            };
            fetchData();
        }
    }, []);
    const initialValues: chillerRequest = {
        outlet_name: chiller?.outlet_name || "",
        owner_name: chiller?.owner_name || "",
        contact_number: chiller?.contact_number || "",
        outlet_type: chiller?.outlet_type || "",
        machine_number: chiller?.machine_number || "",
        asset_number: chiller?.asset_number || "",
        agent_id: chiller?.agent_id?.toString() || chiller?.agent?.id.toString() || "",
        salesman_id: chiller?.salesman_id?.toString() || chiller?.salesman?.id.toString() || "",
        route_id: chiller?.route_id?.toString() || chiller?.route?.id.toString() || "",
        status: chiller?.status?.toString() || "1",
    };

    const handleNext = async (
        values: chillerRequest,
        actions: FormikHelpers<chillerRequest>
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
                        (
                            acc: Partial<Record<keyof chillerRequest, string>>,
                            curr
                        ) => ({
                            ...acc,
                            [curr.path as keyof chillerRequest]: curr.message,
                        }),
                        {}
                    )
                );
            }
            showSnackbar(
                "Please fix validation errors before proceeding",
                "error"
            );
        }
    };

    const handleSubmit = async (values: chillerRequest) => {
        console.log("Submitting form with values:", values);
        try {
            await validationSchema.validate(values, { abortEarly: false });

            const payload = {
                outlet_name: values.outlet_name,
                owner_name: values.owner_name,
                contact_number: values.contact_number,
                outlet_type: values.outlet_type,
                machine_number: values.machine_number,
                asset_number: values.asset_number,
                // agent_id: Number(values.agent_id),
                agent_id: 72,
                salesman_id: Number(values.salesman_id),
                route_id: Number(values.route_id),
                status: Number(values.status),
            };
            let res;
            if(isEditMode) {
                res = await updateChillerRequest(uuid ?? "", payload);
            }else {
                res = await addChillerRequest(payload);
            }
            if (res.error) {
                showSnackbar(
                    res.data?.message || "Failed to add Chiller Request ",
                    "error"
                );
            } else {
                showSnackbar(isEditMode ? "Chiller Request updated successfully" : "Chiller Request added successfully", "success");
                router.push("/assets/chillerRequest");
            }
        } catch {
            showSnackbar(isEditMode ? "Update Chiller Request failed" : "Add Chiller Request failed", "error");
        }
    };

    const renderStepContent = (
        values: chillerRequest,
        setFieldValue: (
            field: keyof chillerRequest,
            value: string | File,
            shouldValidate?: boolean
        ) => void,
        errors: FormikErrors<chillerRequest>,
        touched: FormikTouched<chillerRequest>
    ) => {
        switch (currentStep) {
            case 1:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <InputFields
                                    required
                                    label="Outlet Name"
                                    name="outlet_name"
                                    value={values.outlet_name}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "outlet_name",
                                            e.target.value
                                        )
                                    }
                                    error={
                                        touched.outlet_name &&
                                        errors.outlet_name
                                    }
                                />
                                <ErrorMessage
                                    name="outlet_name"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    required
                                    label="Outlet Type"
                                    name="outlet_type"
                                    value={values.outlet_type}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "outlet_type",
                                            e.target.value
                                        )
                                    }
                                    error={
                                        touched.outlet_type &&
                                        errors.outlet_type
                                    }
                                />
                                <ErrorMessage
                                    name="outlet_type"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    required
                                    label="Owner Name"
                                    name="owner_name"
                                    value={values.owner_name}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "owner_name",
                                            e.target.value
                                        )
                                    }
                                    error={
                                        touched.owner_name &&
                                        errors.owner_name
                                    }
                                />
                                <ErrorMessage
                                    name="owner_name"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Contact Number"
                                    name="contact_number"
                                    value={values.contact_number}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "contact_number",
                                            e.target.value
                                        )
                                    }
                                    error={
                                        touched.contact_number &&
                                        errors.contact_number
                                    }
                                />
                                <ErrorMessage
                                    name="contact_number"
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
                                    label="Machine Number"
                                    name="machine_number"
                                    value={values.machine_number}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "machine_number",
                                            e.target.value
                                        )
                                    }
                                    error={
                                        touched.machine_number &&
                                        errors.machine_number
                                    }
                                />
                                <ErrorMessage
                                    name="machine_number"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Asset Number"
                                    name="asset_number"
                                    value={values.asset_number}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "asset_number",
                                            e.target.value
                                        )
                                    }
                                    error={touched.asset_number && errors.asset_number}
                                />
                                <ErrorMessage
                                    name="asset_number"
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
                                    label="Agent"
                                    name="agent_id"
                                    value={values.agent_id?.toString()}
                                    options={agentCustomerOptions}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "agent_id",
                                            e.target.value
                                        )
                                    }
                                    error={touched.agent_id && errors.agent_id}
                                />
                                <ErrorMessage
                                    name="agent_id"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Salesman"
                                    name="salesman_id"
                                    options={salesmanOptions}
                                    value={values.salesman_id?.toString()}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "salesman_id",
                                            e.target.value
                                        )
                                    }
                                    error={touched.salesman_id && errors.salesman_id}
                                />
                                <ErrorMessage
                                    name="salesman_id"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Route"
                                    name="route_id"
                                    value={values.route_id?.toString()}
                                    options={routeOptions}
                                    onChange={(e) =>
                                        setFieldValue(
                                            "route_id",
                                            e.target.value
                                        )
                                    }
                                    error={touched.route_id && errors.route_id}
                                />
                                <ErrorMessage
                                    name="route_id"
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
                                    label="Status"
                                    name="status"
                                    value={values.status.toString()}
                                    onChange={(e) =>
                                        setFieldValue("status", e.target.value)
                                    }
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
                        {isEditMode ? "Edit Chiller Request" : "Add New Chiller Request"}
                    </h1>
                </div>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {({
                    values,
                    setFieldValue,
                    errors,
                    touched,
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
                                } as unknown as FormikHelpers<chillerRequest>)
                            }
                            onSubmit={() => handleSubmit(values)}
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText={
                                issubmitting ? "Submitting..." : "Submit"
                            }
                        >
                            {renderStepContent(
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}
                        </StepperForm>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
