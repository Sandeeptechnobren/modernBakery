"use client";

import { Icon } from "@iconify-icon/react";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import InputFields from "@/app/components/inputFields";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import StepperForm, {
    useStepperForm,
    StepperStep,
} from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
    agentCustomerById,
    editAgentCustomer,
    genearateCode,
    addAgentCustomer,
    saveFinalCode,
    routeList,
    customerSubCategoryList,
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

interface AgentCustomerFormValues {
    osa_code: string;
    name: string;
    owner_name: string;
    outlet_channel_id: number | string;
    customer_type: number | string;
    contact_no: string;
    // country_code_contact_no: string;
    contact_no2: string;
    whatsapp_no: string;
    street: string;
    landmark: string;
    town: string;
    district: string;
    payment_type: string;
    buyertype: number | string;
    warehouse: string;
    route_id: number | string;
    category_id: number | string;
    subcategory_id: number | string;
    enable_promotion: string;
    creditday: string;
    credit_limit: string;
    status: string;
    is_cash: string;
    vat_no: string | null;
    latitude: string | null;
    longitude: string | null;
    qr_code: string;
}

const paymentTypeOptions = [
    { value: "1", label: "cash" },
    { value: "2", label: "credit" },
    { value: "3", label: "billTobill" },
];

export default function AddEditAgentCustomer() {
    const {
        loading,
        warehouseOptions,
        routeOptions,
        customerTypeOptions,
        customerCategoryOptions,
        customerSubCategoryOptions,
        channelOptions,
        // onlyCountryOptions
    } = useAllDropdownListData();
    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
    const [prefix, setPrefix] = useState("");
    const [filteredRouteOptions, setFilteredRouteOptions] = useState(routeOptions);
    const [filteredCustomerSubCategoryOptions, setFilteredCustomerSubCategoryOptions] = useState(customerSubCategoryOptions);

    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const params = useParams();
    const agentCustomerId = params?.uuid as string | undefined;
    const isEditMode =
        agentCustomerId !== undefined && agentCustomerId !== "new";
    const steps: StepperStep[] = [
        { id: 1, label: "Customer" },
        { id: 2, label: "Location" },
        { id: 3, label: "Contact" },
        { id: 4, label: "Financial" },
        { id: 6, label: "Additional" }
    ];
    const {
        currentStep,
        nextStep,
        prevStep,
        markStepCompleted,
        isStepCompleted,
        isLastStep,
    } = useStepperForm(steps.length);

    const [initialValues, setInitialValues] = useState<AgentCustomerFormValues>(
        {
            osa_code: "",
            name: "",
            owner_name: "",
            outlet_channel_id: "",
            customer_type: "",
            contact_no: "",
            // country_code_contact_no: "",
            contact_no2: "",
            whatsapp_no: "",
            street: "",
            landmark: "",
            town: "",
            district: "",
            payment_type: "", // will be validated against allowed values
            buyertype: "0", // "0" or "1"
            warehouse: "",
            route_id: "",
            category_id: "",
            subcategory_id: "",
            enable_promotion: "0", // "0" or "1"
            creditday: "",
            credit_limit: "",
            status: "1", // default active
            is_cash: "1", // default cash
            vat_no: null,
            latitude: null,
            longitude: null,
            qr_code: "",
        }
    );

    useEffect(() => {
        if(loading) setLoading(true);
        else setLoading(false);
    }, [loading, setLoading]);

    const fetchRoutes = async (value: string) => {
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
    };

    const fetchSubCategories = async (value: string) => {
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
    }

    // Prevent double call of genearateCode in add mode
    const codeGeneratedRef = useRef(false);
    useEffect(() => {
        if (isEditMode && agentCustomerId) {
            setLoading(true);
            (async () => {
                const res = await agentCustomerById(String(agentCustomerId));
                const data = res?.data ?? res;
                if (res && !res.error) {
                    setInitialValues({
                        osa_code: String(data.osa_code ?? data.code ?? ""),
                        name: String(data.name ?? ""),
                        owner_name: String(data.owner_name ?? ""),
                        warehouse:
                            data.warehouse != null
                                ? String(data.warehouse)
                                : "",
                        customer_type:
                            data.customer_type != null
                                ? String(data.customer_type)
                                : "",
                        route_id:
                            data.route_id != null
                                ? String(data.route_id)
                                : String(data.route?.id ?? ""),
                        outlet_channel_id:
                            data.outlet_channel_id != null
                                ? String(data.outlet_channel_id)
                                : String(data.outlet_channel?.id ?? ""),
                        buyertype:
                            data.buyertype != null
                                ? String(data.buyertype)
                                : "0",
                        enable_promotion:
                            data.enable_promotion != null
                                ? String(data.enable_promotion)
                                : String(data.enable_promo_txn ?? "0"),
                        // contacts
                        contact_no: String(data.contact_no ?? ""),
                        // country_code_contact_no: String(data.country_code_contact_no ?? ""),
                        contact_no2: String(data.contact_no2 ?? ""),
                        whatsapp_no:
                            data.whatsapp_no != null
                                ? String(data.whatsapp_no)
                                : "",
                        // address
                        street: String(data.road_street ?? data.street ?? ""),
                        landmark: String(data.landmark ?? ""),
                        town: String(data.town ?? ""),
                        district: String(data.district ?? ""),
                        // financial
                        vat_no: data.vat_no ?? data.tin_no ?? null,
                        payment_type:
                            data.payment_type != null
                                ? paymentTypeOptions.find((p) => p.label === String(data.payment_type))?.value || "1"
                                : "",
                        is_cash:
                            (data.payment_type != null
                                ? paymentTypeOptions.find((p) => p.label === String(data.payment_type))?.value || "1"
                                : "") === "1" ? "1" : "0",
                        creditday:
                            data.creditday != null
                                ? String(data.creditday)
                                : "",
                        credit_limit:
                            data.credit_limit != null
                                ? String(data.credit_limit)
                                : "",
                        // categories
                        category_id:
                            data.category_id != null
                                ? String(data.category_id)
                                : String(data.category?.id ?? ""),
                        subcategory_id:
                            data.subcategory_id != null
                                ? String(data.subcategory_id)
                                : String(data.subcategory?.id ?? ""),
                        // extras
                        status: data.status != null ? String(data.status) : "1",
                        latitude:
                            data.latitude != null
                                ? String(data.latitude)
                                : null,
                        longitude:
                            data.longitude != null
                                ? String(data.longitude)
                                : null,
                        qr_code:
                            data.qr_code != null ? String(data.qr_code) : "",
                    });
                }
                setLoading(false);
            })();
        } else if (!isEditMode && !codeGeneratedRef.current) {
            codeGeneratedRef.current = true;
            (async () => {
                const res = await genearateCode({
                    model_name: "agent_customers",
                });
                if (res?.code) {
                    setInitialValues((prev) => ({
                        ...prev,
                        osa_code: res.code,
                    }));
                }
                if (res?.prefix) {
                    setPrefix(res.prefix);
                } else if (res?.code) {
                    // fallback: extract prefix from code if possible (e.g. ABC-00123 => ABC-)
                    const match = res.prefix;
                    if (match) setPrefix(prefix);
                }
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, agentCustomerId]);

    const emptyToNull = (value: unknown, original: unknown) =>
        original === "" ? null : value;

    const AgentCustomerSchema = Yup.object().shape({
        // customer
        osa_code: Yup.string().required("OSA code is required").max(200),
        name: Yup.string().required("Name is required").max(255),
        owner_name: Yup.string().required("Owner Name is required").max(255),
        customer_type: Yup.string().required("Customer type is required"), // validate existence server-side
        warehouse: Yup.string().required("Warehouse is required"),
        route_id: Yup.string().required("Route is required"),
        outlet_channel_id: Yup.string().required("Outlet channel is required"),

        // location
        landmark: Yup.string().required("Landmark is required"),
        district: Yup.string().required("District is required"),
        street: Yup.string().required("Street is required"),
        town: Yup.string().required("Town is required"),

        // contact
        whatsapp_no: Yup.string().nullable().transform(emptyToNull).max(200),
        contact_no: Yup.string().required("Contact number is required").max(20),
        contact_no2: Yup.string()
            .required("Secondary contact number is required")
            .max(20),

        // financial
        buyertype: Yup.mixed()
            .oneOf([0, 1, "0", "1"], "Invalid buyer type")
            .required("Buyer type is required"),
        payment_type: Yup.string()
            .oneOf(["1", "2", "3"], "Invalid payment type")
            .required("Payment type is required"),
        vat_no: Yup.string().nullable().transform(emptyToNull),

        is_cash: Yup.mixed()
            .oneOf([0, 1, "0", "1"], "Invalid is_cash value")
            .required("is_cash is required"),
        creditday: Yup.number()
            .nullable()
            .transform((v, o) => (o === "" ? null : v))
            .typeError("Credit days must be a number")
            .when("is_cash", {
                is: (val: unknown) => String(val) === "0",
                then: (schema) =>
                    schema.required(
                        "Credit days is required when is_cash is 0"
                    ),
                otherwise: (schema) => schema.nullable(),
            }),
        credit_limit: Yup.number()
            .nullable()
            .transform((v, o) => (o === "" ? null : v))
            .typeError("Credit limit must be a number")
            .when("is_cash", {
                is: (val: unknown) => String(val) === "0",
                then: (schema) =>
                    schema.required(
                        "Credit limit is required when is_cash is 0"
                    ),
                otherwise: (schema) => schema.nullable(),
            }),

        // additional
        category_id: Yup.mixed().required("Category is required"),
        subcategory_id: Yup.mixed().required("Subcategory is required"),
        latitude: Yup.string().nullable().transform(emptyToNull),
        longitude: Yup.string().nullable().transform(emptyToNull),
        qr_code: Yup.string().nullable().transform(emptyToNull),

        status: Yup.mixed()
            .oneOf([0, 1, "0", "1"], "Invalid status")
            .required("Status is required"),
        enable_promotion: Yup.mixed()
            .oneOf([0, 1, "0", "1"], "Invalid enable_promotion value")
            .required("enable_promotion is required"),
    });

    const stepSchemas = [
        // 1. Customer / basic
        Yup.object().shape({
            osa_code: AgentCustomerSchema.fields.osa_code,
            name: AgentCustomerSchema.fields.name,
            owner_name: AgentCustomerSchema.fields.owner_name,
            customer_type: AgentCustomerSchema.fields.customer_type,
            warehouse: AgentCustomerSchema.fields.warehouse,
            route_id: AgentCustomerSchema.fields.route_id,
        }),

        // 2. Location
        Yup.object().shape({
            street: AgentCustomerSchema.fields.street,
            landmark: AgentCustomerSchema.fields.landmark,
            town: AgentCustomerSchema.fields.town,
            district: AgentCustomerSchema.fields.district,
        }),

        // 3. Contact
        Yup.object().shape({
            contact_no: AgentCustomerSchema.fields.contact_no,
            contact_no2: AgentCustomerSchema.fields.contact_no2,
            whatsapp_no: AgentCustomerSchema.fields.whatsapp_no,
        }),

        // 4. Financial
        Yup.object().shape({
            buyertype: AgentCustomerSchema.fields.buyertype,
            vat_no: AgentCustomerSchema.fields.vat_no,
            payment_type: AgentCustomerSchema.fields.payment_type,
            is_cash: AgentCustomerSchema.fields.is_cash,
            creditday: AgentCustomerSchema.fields.creditday,
            credit_limit: AgentCustomerSchema.fields.credit_limit,
        }),

        // 5. Additional / extras
        Yup.object().shape({
            outlet_channel_id: AgentCustomerSchema.fields.outlet_channel_id,
            category_id: AgentCustomerSchema.fields.category_id,
            subcategory_id: AgentCustomerSchema.fields.subcategory_id,
            latitude: AgentCustomerSchema.fields.latitude,
            longitude: AgentCustomerSchema.fields.longitude,
            qr_code: AgentCustomerSchema.fields.qr_code,
            enable_promotion: AgentCustomerSchema.fields.enable_promotion,
        }),
    ];

    const handleNext = async (
        values: AgentCustomerFormValues,
        actions: FormikHelpers<AgentCustomerFormValues>
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
                            acc: Partial<
                                Record<keyof AgentCustomerFormValues, string>
                            >,
                            curr
                        ) => ({
                            ...acc,
                            [curr.path as keyof AgentCustomerFormValues]:
                                curr.message,
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

    const handleSubmit = async (
        values: AgentCustomerFormValues,
        actions?: Pick<
            FormikHelpers<AgentCustomerFormValues>,
            "setErrors" | "setTouched" | "setSubmitting"
        >
    ) => {
        try {
            console.log(values);
            await AgentCustomerSchema.validate(values, { abortEarly: false });
            const payload = {
                ...values,
                is_cash: Number(values.is_cash),
                customer_type: Number(values.customer_type),
                route_id: Number(values.route_id),
                buyertype: Number(values.buyertype),
                creditday: Number(values.creditday),
                payment_type:
                    paymentTypeOptions.find(
                        (option) => option.value === String(values.payment_type)
                    )?.label || "",
                outlet_channel_id: Number(values.outlet_channel_id),
                category_id: Number(values.category_id),
                subcategory_id: Number(values.subcategory_id),
                whatsapp_no:
                    values.whatsapp_no === "" || values.whatsapp_no == null
                        ? null
                        : values.whatsapp_no,
                status: 1,
            };
            let res;
            if (isEditMode && agentCustomerId) {
                res = await editAgentCustomer(agentCustomerId, payload);
            } else {
                res = await addAgentCustomer(payload);
                try {
                    await saveFinalCode({
                        reserved_code: values.osa_code,
                        model_name: "agent_customers",
                    });
                } catch (e) {
                    // Optionally handle error, but don't block success
                }
            }
            if (res?.error) {
                showSnackbar(
                    res.data?.message || "Failed to submit form",
                    "error"
                );
            } else {
                showSnackbar(
                    isEditMode
                        ? "Agent Customer updated successfully"
                        : "Agent Customer added successfully",
                    "success"
                );
                router.push("/agentCustomer");
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
                        fieldErrors as FormikErrors<AgentCustomerFormValues>
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
                        touchedMap as FormikTouched<AgentCustomerFormValues>
                    );
                }

                // Show a summary snackbar
                showSnackbar(err.errors.join("; "), "error");
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
        values: AgentCustomerFormValues,
        setFieldValue: (
            field: keyof AgentCustomerFormValues,
            value: string | File | null,
            shouldValidate?: boolean
        ) => void,
        errors: FormikErrors<AgentCustomerFormValues>,
        touched: FormikTouched<AgentCustomerFormValues>
    ) => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                Customer
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-start gap-2 max-w-[406px]">
                                    <InputFields
                                        label="OSA Code"
                                        name="osa_code"
                                        value={values.osa_code}
                                        onChange={(e) => {
                                            setFieldValue(
                                                "osa_code",
                                                e.target.value
                                            );
                                        }}
                                        disabled={codeMode === "auto"}
                                    />
                                    {!isEditMode && (
                                        <>
                                            <IconButton
                                                bgClass="white"
                                                className="mt-[45px] cursor-pointer text-[#252B37]"
                                                icon="mi:settings"
                                                onClick={() => setIsOpen(true)}
                                            />
                                            <SettingPopUp
                                                isOpen={isOpen}
                                                onClose={() => setIsOpen(false)}
                                                title="OSA Code"
                                                prefix={prefix}
                                                setPrefix={setPrefix}
                                                onSave={(mode, code) => {
                                                    setCodeMode(mode);
                                                    if (
                                                        mode === "auto" &&
                                                        code
                                                    ) {
                                                        setFieldValue(
                                                            "osa_code",
                                                            code
                                                        );
                                                    } else if (
                                                        mode === "manual"
                                                    ) {
                                                        setFieldValue(
                                                            "osa_code",
                                                            ""
                                                        );
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Outlet Name"
                                        name="name"
                                        value={values.name}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "name",
                                                e.target.value
                                            )
                                        }
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
                                        label="Owner Name"
                                        name="owner_name"
                                        value={values.owner_name}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "owner_name",
                                                e.target.value
                                            )
                                        }
                                        error={touched.owner_name && errors.owner_name}
                                    />
                                    {touched.owner_name && errors.owner_name && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.owner_name}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Customer Type"
                                        options={customerTypeOptions}
                                        name="customer_type"
                                        value={values.customer_type?.toString() ??""}
                                        disabled={customerTypeOptions.length === 0}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "customer_type",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.customer_type &&
                                            errors.customer_type
                                        }
                                    />
                                    {touched.customer_type &&
                                        errors.customer_type && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.customer_type}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Warehouse"
                                        name="warehouse"
                                        value={values.warehouse}
                                        options={warehouseOptions}
                                        disabled={warehouseOptions.length === 0}
                                        onChange={(e) => {
                                            setFieldValue("warehouse", e.target.value);
                                            if (values.warehouse !== e.target.value) {
                                                fetchRoutes(e.target.value);
                                            }
                                        }}
                                        error={
                                            touched.warehouse &&
                                            errors.warehouse
                                        }
                                    />
                                    {touched.warehouse && errors.warehouse && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.warehouse}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Route"
                                        name="route_id"
                                        value={
                                            values.route_id?.toString() ?? ""
                                        }
                                        onChange={(e) =>
                                            setFieldValue("route_id",e.target.value)
                                        }
                                        disabled={filteredRouteOptions.length === 0}
                                        error={
                                            touched.route_id && errors.route_id
                                        }
                                        options={filteredRouteOptions}
                                    />
                                    {touched.route_id && errors.route_id && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.route_id}
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
                                Location
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputFields
                                        required
                                        label="Street"
                                        name="street"
                                        value={values.street}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "street",
                                                e.target.value
                                            )
                                        }
                                        error={touched.street && errors.street}
                                    />
                                    {touched.street && errors.street && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.street}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Landmark"
                                        name="landmark"
                                        value={values.landmark}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "landmark",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.landmark && errors.landmark
                                        }
                                    />
                                    {touched.landmark && errors.landmark && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.landmark}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Town"
                                        name="town"
                                        value={values.town}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "town",
                                                e.target.value
                                            )
                                        }
                                        error={touched.town && errors.town}
                                    />
                                    {touched.town && errors.town && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.town}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="District"
                                        name="district"
                                        value={values.district}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "district",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.district && errors.district
                                        }
                                    />
                                    {touched.district && errors.district && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.district}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                Contact
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputFields
                                        required
                                        label="Contact Number"
                                        name="contact_no"
                                        value={values.contact_no}
                                        // leadingElement={
                                        //     <InputFields
                                        //         name="country_code_contact_no"
                                        //         value={values.country_code_contact_no}
                                        //         showBorder={false}
                                        //         onChange={(e) =>
                                        //             setFieldValue(
                                        //                 "country_code_contact_no",
                                        //                 e.target.value
                                        //             )}
                                        //         options={onlyCountryOptions}
                                        //     />
                                        // }
                                        onChange={(e) =>
                                            setFieldValue(
                                                "contact_no",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.contact_no &&
                                            errors.contact_no
                                        }
                                    />
                                    {touched.contact_no &&
                                        errors.contact_no && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.contact_no}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Contact Number 2"
                                        name="contact_no2"
                                        value={values.contact_no2}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "contact_no2",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.contact_no2 &&
                                            errors.contact_no2
                                        }
                                    />
                                    {touched.contact_no2 &&
                                        errors.contact_no2 && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.contact_no2}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        label="Whatsapp No"
                                        name="whatsapp_no"
                                        value={values.whatsapp_no}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "whatsapp_no",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.whatsapp_no &&
                                            errors.whatsapp_no
                                        }
                                    />
                                    {touched.whatsapp_no &&
                                        errors.whatsapp_no && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.whatsapp_no}
                                            </div>
                                        )}
                                </div>

                            </div>
                        </div>
                    </div>
                );

            case 4:
            return (
                <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">
                            Financial
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <InputFields
                                    required
                                    type="radio"
                                    label="Buyer Type"
                                    name="buyertype"
                                    value={
                                        values.buyertype?.toString() ?? ""
                                    }
                                    onChange={(e) =>
                                        setFieldValue(
                                            "buyertype",
                                            e.target.value
                                        )
                                    }
                                    error={
                                        touched.buyertype &&
                                        errors.buyertype
                                    }
                                    options={[
                                        { value: "0", label: "B2B" },
                                        { value: "1", label: "B2C" },
                                    ]}
                                />
                                {touched.buyertype && errors.buyertype && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.buyertype}
                                    </div>
                                )}
                            </div>

                            <div>
                                <InputFields
                                    label="VAT No"
                                    name="vat_no"
                                    value={values.vat_no?.toString()}
                                    onChange={(e) =>
                                        setFieldValue("vat_no", e.target.value)
                                    }
                                    error={touched.vat_no && errors.vat_no}
                                />
                                {touched.vat_no && errors.vat_no && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.vat_no}
                                    </div>
                                )}
                            </div>

                            <div>
                                <InputFields
                                    required
                                    label="Payment Type"
                                    name="payment_type"
                                    value={values.payment_type?.toString() ??""}
                                    onChange={(e) =>{
                                        setFieldValue("payment_type",e.target.value)
                                        setFieldValue("is_cash", (e.target.value === "1") ? "1" : "0")
                                    }}
                                    error={
                                        touched.payment_type &&
                                        errors.payment_type
                                    }
                                    options={paymentTypeOptions}
                                />
                                {touched.payment_type &&
                                    errors.payment_type && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.payment_type}
                                        </div>
                                    )}
                            </div>

                            { values.is_cash === "0" && 
                            <>
                                <div>
                                    <InputFields
                                        label="Credit Day"
                                        name="creditday"
                                        value={values.creditday}
                                        onChange={(e) =>
                                            setFieldValue("creditday", e.target.value)
                                        }
                                        error={touched.creditday && errors.creditday}
                                    />
                                    {touched.creditday && errors.creditday && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.creditday}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        label="Credit Limit"
                                        name="credit_limit"
                                        value={values.credit_limit}
                                        onChange={(e) =>
                                            setFieldValue("credit_limit", e.target.value)
                                        }
                                        error={touched.credit_limit && errors.credit_limit}
                                    />
                                    {touched.credit_limit && errors.credit_limit && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.credit_limit}
                                        </div>
                                    )}
                                </div>
                            </>
                            }

                        </div>
                    </div>
                </div>
            );
            
            case 5: 
                return(
                    <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                Additional
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <InputFields
                                        required
                                        label="Outlet Channel"
                                        name="outlet_channel_id"
                                        value={
                                            values.outlet_channel_id?.toString() ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            setFieldValue(
                                                "outlet_channel_id",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.outlet_channel_id &&
                                            errors.outlet_channel_id
                                        }
                                        options={channelOptions}
                                        disabled={channelOptions.length === 0}
                                    />
                                    {touched.outlet_channel_id &&
                                        errors.outlet_channel_id && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.outlet_channel_id}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Category"
                                        name="category_id"
                                        value={
                                            values.category_id?.toString() ?? ""
                                        }
                                        onChange={(e) => {
                                            setFieldValue("category_id", e.target.value);
                                            if (values.category_id !== e.target.value) {
                                                fetchSubCategories(e.target.value);
                                            }
                                        }}
                                        error={
                                            touched.category_id &&
                                            errors.category_id
                                        }
                                        options={customerCategoryOptions}
                                        disabled={customerCategoryOptions.length === 0}
                                    />
                                    {touched.category_id &&
                                        errors.category_id && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.category_id}
                                            </div>
                                        )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Subcategory"
                                        name="subcategory_id"
                                        value={
                                            values.subcategory_id?.toString() ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            setFieldValue(
                                                "subcategory_id",
                                                e.target.value
                                            )
                                        }
                                        disabled={filteredCustomerSubCategoryOptions.length === 0}
                                        error={
                                            touched.subcategory_id &&
                                            errors.subcategory_id
                                        }
                                        options={filteredCustomerSubCategoryOptions}
                                    />
                                    {touched.subcategory_id &&
                                        errors.subcategory_id && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.subcategory_id}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Enable Promo Txn"
                                        name="enable_promo_txn"
                                        value={
                                            values.enable_promotion?.toString() ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            setFieldValue(
                                                "enable_promotion",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.enable_promotion &&
                                            errors.enable_promotion
                                        }
                                        options={[
                                            { label: "Yes", value: "1" },
                                            { label: "No", value: "0" },
                                        ]}
                                    />
                                    {touched.enable_promotion &&
                                        errors.enable_promotion && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.enable_promotion}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        label="Latitude"
                                        name="latitude"
                                        value={values.latitude?.toString()}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "latitude",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.latitude && errors.latitude
                                        }
                                    />
                                    {touched.latitude && errors.latitude && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.latitude}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        label="Longitude"
                                        name="longitude"
                                        value={values.longitude?.toString()}
                                        onChange={(e) =>
                                            setFieldValue(
                                                "longitude",
                                                e.target.value
                                            )
                                        }
                                        error={
                                            touched.longitude && errors.longitude
                                        }
                                    />
                                    {touched.longitude && errors.longitude && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.longitude}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        label="Add QR Code"
                                        name="qr_code"
                                        type="file"
                                        onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                            // For file inputs, target has 'files'; ensure the property exists before accessing it
                                            if ("files" in e.target) {
                                                const file = e.target.files?.[0] ?? null;
                                                // store the selected file's name in the qr_code field
                                                setFieldValue("qr_code", file ? file.name : "");
                                                // if you need the actual File object as well, store it in a separate field:
                                                // setFieldValue("qr_file", file);
                                            } else {
                                                // fallback for other element types (selects etc.)
                                                setFieldValue("qr_code", "");
                                            }
                                        }}
                                    />
                                    {touched.qr_code && errors.qr_code && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.qr_code}
                                        </div>
                                    )}
                                </div>

                            </div>
                            </div>
                    </div>
                )
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
                            ? "Edit Agent Customer"
                            : "Add Agent Customer"}
                    </h1>
                </div>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={AgentCustomerSchema}
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
                                } as unknown as FormikHelpers<AgentCustomerFormValues>)
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
