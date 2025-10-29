"use client";

import { Icon } from "@iconify-icon/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputFields from "@/app/components/inputFields";
import StepperForm, {
    useStepperForm,
    StepperStep,
} from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
    agentCustomerById,
    routeList,
    customerSubCategoryList,
    customerCategoryList,
    updateAuthUser,
    registerAuthUser,
} from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import {
    Form,
    Formik,
    FormikErrors,
    FormikHelpers,
    FormikTouched,
} from "formik";
import { useLoading } from "@/app/services/loadingContext";
import CustomPasswordInput from "@/app/components/customPasswordInput";

interface user {
    name: string;
    email: string;
    username: string;
    contact_number: string;
    password: string;
    password_confirmation: string;
    role: string;
    company: string;
    warehouse?: string;
    route?: string;
    salesman?: string;
    region?: string;
    area?: string;
    outlet_channel?: string;
}

interface contactCountry { name: string; code?: string; flag?: string; }

export default function UserAddEdit() {
    // starting point
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const params = useParams();
    const userUUID = params?.uuid as string | undefined;
    const isEditMode = userUUID !== undefined && userUUID !== "add";

    // Dropdown options from context
    const { roleOptions ,labelOptions} = useAllDropdownListData();
    const [skeleton, setSkeleton] = useState({
        route: false,
        customerCategory: false,
        customerSubCategory: false,
    });
    const [filteredRouteOptions, setFilteredRouteOptions] = useState([] as { label: string; value: string }[]);
    const [filteredCustomerCategoryOptions, setFilteredCustomerCategoryOptions] = useState([] as { label: string; value: string }[]);
    const [filteredCustomerSubCategoryOptions, setFilteredCustomerSubCategoryOptions] = useState([] as  { label: string; value: string }[]);

    const [country, setCountry] = useState<Record<string, contactCountry>>({
        contact_number: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    });
    
    const steps: StepperStep[] = [
        { id: 1, label: "User Information" },
        { id: 2, label: "Roles and Permissions" }
    ];
    const {
        currentStep,
        nextStep,
        prevStep,
        markStepCompleted,
        isStepCompleted,
        isLastStep,
    } = useStepperForm(steps.length);

    const [initialValues, setInitialValues] = useState({
        name: '',
        email: '',
        username: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        role: '',
        company: '',
        warehouse: '',
        route: '',
        salesman: '',
        region: '',
        area: '',
        outlet_channel: ''
    });

    const fetchRoutes = async (value: string) => {
        setSkeleton({ ...skeleton, route: true });
        const filteredOptions = await routeList({
            warehouse_id: value,
            per_page: "10",
        });
        if(filteredOptions.error) {
            showSnackbar(filteredOptions.data?.message || "Failed to fetch routes", "error");
            return;
        }
        const options = filteredOptions?.data || [];
        setFilteredRouteOptions(options.map((route: { id: number; route_name: string }) => ({
            value: String(route.id),
            label: route.route_name,
        })));
        setSkeleton({ ...skeleton, route: false });
    };

    const fetchCategories = async (value: string) => {
        setSkeleton({ ...skeleton, customerCategory: true });
        const filteredOptions = await customerCategoryList({
            outlet_channel_id: value,
            per_page: "10",
        });
        if(filteredOptions.error) {
            showSnackbar(filteredOptions.data?.message || "Failed to fetch Customer Categories", "error");
            return;
        }
        const options = filteredOptions?.data || [];
        setFilteredCustomerCategoryOptions(options.map((category: { id: number; customer_category_code: string; customer_category_name: string }) => ({
            value: String(category.id),
            label: category.customer_category_name + " - " + category.customer_category_code,
        })));
        setSkeleton({ ...skeleton, customerCategory: false });
    }

    const fetchSubCategories = async (value: string) => {
        setSkeleton({ ...skeleton, customerSubCategory: true });
        const filteredOptions = await customerSubCategoryList({
            customer_category_id: value,
            per_page: "10",
        });
        if(filteredOptions.error) {
            showSnackbar(filteredOptions.data?.message || "Failed to fetch Customer Sub Categories", "error");
            return;
        }
        const options = filteredOptions?.data || [];
        setFilteredCustomerSubCategoryOptions(options.map((subCategory: { id: number; customer_sub_category_code: string; customer_sub_category_name: string }) => ({
            value: String(subCategory.id),
            label: subCategory.customer_sub_category_name + " - " + subCategory.customer_sub_category_code,
        })));
        setSkeleton({ ...skeleton, customerSubCategory: false });
    }

    useEffect(() => {
        setLoading(true);
        if (isEditMode && userUUID) {
            (async () => {
                const res = await agentCustomerById(String(userUUID));
                const data = res?.data ?? res;
                if (res && !res.error) {
                    setInitialValues({
                        name: String(data.name ?? ""),
                        email: String(data.email ?? ""),
                        username: String(data.username ?? ""),
                        contact_number: String(data.contact_number ?? ""),
                        password: String(data.password ?? ""),
                        password_confirmation: String(data.password_confirmation ?? ""),
                        role: String(data.role ?? ""),
                        company: String(data.company ?? ""),
                        warehouse: String(data.warehouse ?? ""),
                        route: String(data.route ?? ""),
                        salesman: String(data.salesman ?? ""),
                        region: String(data.region ?? ""),
                        area: String(data.area ?? ""),
                        outlet_channel: String(data.outlet_channel ?? ""),
                    });
                    fetchRoutes(data.get_warehouse != null? String(data.get_warehouse?.id): "");
                    fetchCategories(data.outlet_channel.id != null? String(data.outlet_channel?.id): "");
                    fetchSubCategories(data.category.id != null? String(data.category?.id): String(data.category?.id ?? ""));
                }
                setLoading(false);
            })();
        }
        setLoading(false);
    }, [isEditMode, userUUID]);

    const userSchema = Yup.object().shape({
        name: Yup.string().required("Name is required").max(255),
        email: Yup.string().email("Invalid email").required("Email is required"),
        username: Yup.string().required("Username is required").max(255),
        contact_number: Yup.string().required("Contact number is required").max(20),
        password: Yup.string().required("Password is required").min(6).max(100),
        password_confirmation: Yup.string()
            .oneOf([Yup.ref("password"), undefined], "Passwords must match")
            .required("Password confirmation is required"),

        // multi-value fields with hierarchical dependency validation
        role: Yup.array().of(Yup.string()).min(1, "Role is required"),

        company: Yup.array().of(Yup.string()).min(1, "Company is required"),

        warehouse: Yup.array()
            .of(Yup.string())
            .min(1, "Warehouse is required")
            .test(
                "warehouse-company",
                "Select company before selecting warehouse",
                function (value) {
                    if (!value || value.length === 0) return false;
                    const { company } = this.parent as any;
                    return Array.isArray(company) && company.length > 0;
                }
            ),

        route: Yup.array()
            .of(Yup.string())
            .min(1, "Route is required")
            .test(
                "route-warehouse",
                "Select warehouse before selecting route",
                function (value) {
                    if (!value || value.length === 0) return false;
                    const { warehouse } = this.parent as any;
                    return Array.isArray(warehouse) && warehouse.length > 0;
                }
            ),

        salesman: Yup.array()
            .of(Yup.string())
            .min(1, "Salesman is required")
            .test(
                "salesman-route",
                "Select route before selecting salesman",
                function (value) {
                    if (!value || value.length === 0) return false;
                    const { route } = this.parent as any;
                    return Array.isArray(route) && route.length > 0;
                }
            ),

        region: Yup.array()
            .of(Yup.string())
            .min(1, "Region is required")
            .test(
                "region-deps",
                "Select company, warehouse, route and salesman before selecting region",
                function (value) {
                    if (!value || value.length === 0) return false;
                    const { company, warehouse, route, salesman } = this.parent as any;
                    return (
                        Array.isArray(company) &&
                        company.length > 0 &&
                        Array.isArray(warehouse) &&
                        warehouse.length > 0 &&
                        Array.isArray(route) &&
                        route.length > 0 &&
                        Array.isArray(salesman) &&
                        salesman.length > 0
                    );
                }
            ),

        area: Yup.array()
            .of(Yup.string())
            .min(1, "Area is required")
            .test(
                "area-region",
                "Select region before selecting area",
                function (value) {
                    if (!value || value.length === 0) return false;
                    const { region } = this.parent as any;
                    return Array.isArray(region) && region.length > 0;
                }
            ),

        outlet_channel: Yup.array()
            .of(Yup.string())
            .min(1, "Outlet channel is required")
            .test(
                "outlet-area",
                "Select area before selecting outlet channel",
                function (value) {
                    if (!value || value.length === 0) return false;
                    const { area } = this.parent as any;
                    return Array.isArray(area) && area.length > 0;
                }
            ),
    });

    const stepSchemas = [
        Yup.object().shape({
            name: userSchema.fields.name,
            email: userSchema.fields.email,
            username: userSchema.fields.username,
            contact_number: userSchema.fields.contact_number,
            password: userSchema.fields.password,
            password_confirmation: userSchema.fields.password_confirmation,
        }),
        Yup.object().shape({
            role: userSchema.fields.role,
            company: userSchema.fields.company,
            warehouse: userSchema.fields.warehouse,
            route: userSchema.fields.route,
            salesman: userSchema.fields.salesman,
            region: userSchema.fields.region,
            area: userSchema.fields.area,
            outlet_channel: userSchema.fields.outlet_channel,
        }),
    ];

    const handleNext = async (
        values: user,
        actions: FormikHelpers<user>
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
                    err.inner.reduce((acc: Partial<Record<keyof user, string>>, curr) => ({
                            ...acc,
                            [curr.path as keyof user]:
                                curr.message,
                    }), {})
                );
            }
        }
    };

    const handleSubmit = async (
        values: user,
        actions?: Pick<FormikHelpers<user>, "setErrors" | "setTouched" | "setSubmitting">
    ) => {
        try {
            await userSchema.validate(values, { abortEarly: false });
            const payload = {
                ...values,
            };
            let res;
            if (isEditMode && userUUID) {
                res = await updateAuthUser(userUUID, payload);
            } else {
                res = await registerAuthUser(payload);
            }
            if (res?.error) {
                showSnackbar(res.data?.message || "Failed to submit form","error");
            } else {
                showSnackbar(
                    isEditMode
                        ? "User updated successfully"
                        : "User added successfully",
                    "success"
                );
                router.push("/settings/user");
            }
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                console.error("Yup ValidationError:", err);

                // Map inner errors to { fieldName: message }
                const fieldErrors = err.inner.reduce<Record<string, string>>(
                    (acc, e) => {
                        if (e.path) acc[e.path] = e.message;
                        return acc;
                    },
                    {}
                );

                // If caller provided Formik helpers, set field errors + touched so UI shows per-field messages
                if (actions?.setErrors) {
                    actions.setErrors(
                        fieldErrors as FormikErrors<user>
                    );
                }
                if (actions?.setTouched) {
                    const touchedMap = Object.keys(fieldErrors).reduce<
                        Record<string, boolean>
                    >((acc, k) => {
                        acc[k] = true;
                        return acc;
                    }, {});
                    actions.setTouched(
                        touchedMap as FormikTouched<user>
                    );
                }

                return;
            }

            // fallback for non-Yup errors
            console.error("Submit error:", err);
            showSnackbar(
                isEditMode
                    ? "Update Agent Customer failed"
                    : "Add Agent Customer failed",
                "error"
            );
        }
    };

    const renderStepContent = (
        values: user,
        setFieldValue: (
            field: keyof user,
            value: string | File | null,
            shouldValidate?: boolean
        ) => void,
        errors: FormikErrors<user>,
        touched: FormikTouched<user>
    ) => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                {steps[currentStep].label}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputFields
                                        required
                                        label="Name"
                                        name="name"
                                        value={values.name}
                                        onChange={(e) => setFieldValue("name",e.target.value)}
                                        error={touched.name && errors.name}
                                    />
                                    {touched.name && errors.name && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Email"
                                        name="email"
                                        value={values.email}
                                        onChange={(e) => setFieldValue("email",e.target.value)}
                                        error={touched.email && errors.email}
                                    />
                                    {touched.email && errors.email && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Username"
                                        name="username"
                                        value={values.username}
                                        onChange={(e) => setFieldValue("username",e.target.value)}
                                        error={touched.username && errors.username}
                                    />
                                    {touched.username && errors.username && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.username}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        type="contact"
                                        label="Contact Number"
                                        name="contact_number"
                                        value={values.contact_number}
                                        selectedCountry={country.contact_number}
                                        setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, contact_number: country }))}
                                        onChange={(e) => setFieldValue("contact_number",e.target.value)}
                                        error={touched.contact_number && errors.contact_number}
                                    />
                                    {touched.contact_number && errors.contact_number && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.contact_number}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <CustomPasswordInput
                                        label="Password"
                                        width="max-w-[406px]"
                                        value={values.password}
                                        onChange={(e) => setFieldValue("password",e.target.value)}
                                    />
                                    {touched.password && errors.password && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <CustomPasswordInput
                                        label="Confirm Password"
                                        width="max-w-[406px]"
                                        value={values.password_confirmation}
                                        onChange={(e) => setFieldValue("password_confirmation",e.target.value)}
                                    />
                                    {touched.password_confirmation && errors.password_confirmation && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.password_confirmation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                {steps[currentStep]?.label}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputFields
                                        required
                                        label="Role"
                                        name="role"
                                        value={values.role}
                                        options={roleOptions}
                                        onChange={(e) => setFieldValue("role",e.target.value)}
                                        error={touched.role && errors.role}
                                    />
                                    {touched.role && errors.role && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.role}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Label"
                                        name="role"
                                        value={values.role}
                                        options={labelOptions}
                                        onChange={(e) => setFieldValue("role",e.target.value)}
                                        error={touched.role && errors.role}
                                    />
                                    {touched.role && errors.role && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.role}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div
                        className="cursor-pointer"
                        onClick={() => router.back()}
                    >
                        <Icon icon="lucide:arrow-left" width={24} />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEditMode
                            ? "Edit User"
                            : "Add User"}
                    </h1>
                </div>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={userSchema}
                enableReinitialize={true}
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
                                } as unknown as FormikHelpers<user>)
                            }
                            onSubmit={() => handleSubmit(values)}
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText={issubmitting ? "Submitting..." : "Submit"}
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
