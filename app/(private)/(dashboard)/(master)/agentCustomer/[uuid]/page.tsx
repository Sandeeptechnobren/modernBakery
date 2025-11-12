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
    customerCategoryList,
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

interface contactCountry { name: string; code?: string; flag?: string; }

const paymentTypeOptions = [
    { value: "1", label: "Cash" },
    { value: "2", label: "Cheque" },
    { value: "3", label: "Transfer" },
];

export default function AddEditAgentCustomer() {
    const {
        loading,
        warehouseOptions,
        customerTypeOptions,
        channelOptions,
        // onlyCountryOptions
    } = useAllDropdownListData();
    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
    const [prefix, setPrefix] = useState("");
    const [skeleton, setSkeleton] = useState({
        route: false,
        customerCategory: false,
        customerSubCategory: false,
    });
    const [country, setCountry] = useState<Record<string, contactCountry>>({
        contact_no: { name: "Uganda", code: "+256", flag: "🇺🇬" },
        contact_no2: { name: "Uganda", code: "+256", flag: "🇺🇬" },
        whatsapp_no: { name: "Uganda", code: "+256", flag: "🇺🇬" },
    });
    const [filteredRouteOptions, setFilteredRouteOptions] = useState([] as { label: string; value: string }[]);
    const [filteredCustomerCategoryOptions, setFilteredCustomerCategoryOptions] = useState([] as { label: string; value: string }[]);
    const [filteredCustomerSubCategoryOptions, setFilteredCustomerSubCategoryOptions] = useState([] as  { label: string; value: string }[]);
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
            contact_no2: "",
            whatsapp_no: "",
            street: "",
            landmark: "",
            town: "",
            district: "",
            payment_type: "",
            buyertype: "1",
            warehouse: "",
            route_id: "",
            category_id: "",
            subcategory_id: "",
            enable_promotion: "0",
            creditday: "",
            credit_limit: "",
            status: "1", 
            is_cash: "1",
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

    // Prevent double call of genearateCode in add mode
    const codeGeneratedRef = useRef(false);
    useEffect(() => {
        setLoading(true);
        if (isEditMode && agentCustomerId) {
            (async () => {
                const res = await agentCustomerById(String(agentCustomerId));
                const data = res?.data ?? res;
                if (res && !res.error) {
                    setInitialValues({
                        osa_code: String(data.osa_code ?? data.code ?? ""),
                        name: String(data.name ?? ""),
                        owner_name: String(data.owner_name ?? ""),
                        warehouse:
                            data.get_warehouse != null
                                ? data.get_warehouse?.id?.toString()
                                : "",
                        customer_type:
                            data.customertype != null
                                ? String(data.customertype?.id)
                                : "",
                        route_id:
                            data.route?.id != null
                                ? String(data.route?.id)
                                : "",
                        outlet_channel_id:
                            data.outlet_channel.id != null
                                ? String(data.outlet_channel?.id)
                                : "",
                        buyertype:
                            data.buyertype != null
                                ? String(data.buyertype)
                                : "1",
                        enable_promotion:
                            data.enable_promotion != null
                                ? String(data.enable_promotion)
                                : String(data.enable_promo_txn ?? "0"),
                        contact_no: data.contact_no ?? "",
                        contact_no2: data.contact_no2 ?? "",
                        whatsapp_no:
                            data.whatsapp_no != null
                                ? String(data.whatsapp_no)
                                : "",
                        street: String(data.road_street ?? data.street ?? ""),
                        landmark: String(data.landmark ?? ""),
                        town: String(data.town ?? ""),
                        district: String(data.district ?? ""),
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
                            data.category.id != null
                                ? String(data.category?.id)
                                : String(data.category?.id ?? ""),
                        subcategory_id:
                            data.subcategory?.id != null
                                ? String(data.subcategory?.id)
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
                    fetchRoutes(data.get_warehouse != null? String(data.get_warehouse?.id): "");
                    fetchCategories(data.outlet_channel.id != null? String(data.outlet_channel?.id): "");
                    fetchSubCategories(data.category.id != null? String(data.category?.id): String(data.category?.id ?? ""));
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
                setLoading(false);
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
        whatsapp_no: Yup.string()
            .nullable()
            .transform(emptyToNull)
            .min(9, "Must be at least 9 digits")
            .max(10, "Must be at most 10 digits"),
       
        contact_no: Yup.string()
            .required("Contact number is required")
            .matches(/^[0-9]+$/, "Only numbers are allowed")
            .min(9, "Must be at least 9 digits")
            .max(10, "Must be at most 10 digits"),

        contact_no2: Yup.string()
            .required("Contact number 2 is required")
            .matches(/^[0-9]+$/, "Only numbers are allowed")
            .min(9, "Must be at least 9 digits")
            .max(10, "Must be at most 10 digits"),  
    
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
                        "Credit days is required"
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
                        "Credit limit is required"
                    ),
                otherwise: (schema) => schema.nullable(),
            }),

        // additional
        category_id: Yup.mixed().required("Category is required"),
        subcategory_id: Yup.mixed().required("Subcategory is required"),
        latitude: Yup.string().matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Latitude must be a valid decimal number').nullable().transform(emptyToNull),
        longitude: Yup.string().matches(/^[-+]?\d{1,3}(?:\.\d+)?$/, 'Longitude must be a valid decimal number').nullable().transform(emptyToNull),
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
            latitude: AgentCustomerSchema.fields.latitude,
            longitude: AgentCustomerSchema.fields.longitude,
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
                    )?.value || "",
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
        touched: FormikTouched<AgentCustomerFormValues>,
        setFieldError?: (field: string, message?: string) => void
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
                                    {!isEditMode && false && (
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
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Customer Type"
                                        options={customerTypeOptions}
                                        name="customer_type"
                                        value={customerTypeOptions.length === 0 ? "" : values.customer_type?.toString() ?? ""}
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
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Warehouse"
                                        name="warehouse"
                                        value={values?.warehouse || ""}
                                        options={warehouseOptions}
                                        disabled={warehouseOptions.length === 0}
                                        onChange={(e) => {
                                            setFieldValue("warehouse", e.target.value);
                                            if (values.warehouse !== e.target.value) {
                                                setFieldValue("route_id", "");
                                                fetchRoutes(e.target.value);
                                            }
                                        }}
                                        error={
                                            touched.warehouse &&
                                            errors.warehouse
                                        }
                                    />
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Route"
                                        name="route_id"
                                        value={filteredRouteOptions.length === 0 ? "" : values.route_id?.toString() }
                                        onChange={(e) =>
                                            setFieldValue("route_id",e.target.value)
                                        }
                                        disabled={filteredRouteOptions.length === 0}
                                        showSkeleton={skeleton.route}
                                        error={
                                            touched.route_id && errors.route_id
                                        }
                                        options={filteredRouteOptions}
                                    />
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
                                </div>

                                <div>
                                    <InputFields
                                        label="Latitude"
                                        type="number"
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
                                </div>

                                <div>
                                    <InputFields
                                        label="Longitude"
                                        type="number"
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
                                        type="contact"
                                        label="Contact Number"
                                        name="contact_no"
                                        setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, contact_no: country }))}
                                        selectedCountry={country.contact_no}
                                        value={`${values.contact_no ?? ''}`}
                                        onChange={(e) => setFieldValue("contact_no", e.target.value)}
                                        error={errors?.contact_no && touched?.contact_no ? errors.contact_no : false}
                                    />
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        type="contact"
                                        label="Contact Number 2"
                                        name="contact_no2"
                                        setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, contact_no2: country }))}
                                        selectedCountry={country.contact_no2}
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
                                </div>

                                <div>
                                    <InputFields
                                        type="contact"
                                        label="Whatsapp No"
                                        name="whatsapp_no"
                                        value={values.whatsapp_no}
                                        setSelectedCountry={(country: contactCountry) => setCountry(prev => ({ ...prev, whatsapp_no: country }))}
                                        selectedCountry={country.whatsapp_no}
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
                                        { value: "1", label: "B2C" },
                                        { value: "0", label: "B2B" }
                                    ]}
                                />
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
                                        value={(channelOptions.length === 0) ? "" : values.outlet_channel_id?.toString()}
                                        onChange={(e) => {
                                            setFieldValue("outlet_channel_id", e.target.value);
                                            if (values.outlet_channel_id !== e.target.value) {
                                                setFieldValue("category_id", "");
                                                fetchCategories(e.target.value);
                                            }
                                        }}
                                        error={
                                            touched.outlet_channel_id &&
                                            errors.outlet_channel_id
                                        }
                                        options={channelOptions}
                                        disabled={channelOptions.length === 0}
                                    />
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Category"
                                        name="category_id"
                                        value={
                                            filteredCustomerCategoryOptions.length === 0 ? "" : values.category_id?.toString()
                                        }
                                        onChange={(e) => {
                                            setFieldValue("category_id", e.target.value);
                                            if (values.category_id !== e.target.value) {
                                                setFieldValue("subcategory_id", "");
                                                fetchSubCategories(e.target.value);
                                            }
                                            // clear any validation error for this field immediately
                                            if (typeof setFieldError === "function") {
                                                setFieldError("category_id", undefined);
                                            }
                                        }}
                                        error={
                                            touched.category_id &&
                                            errors.category_id
                                        }
                                        options={filteredCustomerCategoryOptions}
                                        showSkeleton={skeleton.customerCategory}
                                        disabled={filteredCustomerCategoryOptions.length === 0}
                                    />
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Subcategory"
                                        name="subcategory_id"
                                        value={
                                            filteredCustomerSubCategoryOptions.length === 0 ? "" : values.subcategory_id?.toString()
                                        }
                                        onChange={(e) => {
                                            setFieldValue(
                                                "subcategory_id",
                                                e.target.value
                                            );
                                            if (typeof setFieldError === "function") {
                                                setFieldError("subcategory_id", undefined);
                                            }
                                        }
                                        }
                                        error={
                                            touched.subcategory_id &&
                                            errors.subcategory_id
                                        }
                                        options={filteredCustomerSubCategoryOptions}
                                        showSkeleton={skeleton.customerSubCategory}
                                        disabled={filteredCustomerSubCategoryOptions.length === 0}
                                    />
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
                                </div>

                                <div>
                                    <InputFields
                                        label="Add QR Code"
                                        value={values.qr_code}
                                        name="qr_code"
                                        onChange={(e) => setFieldValue("qr_code", e.target.value)}
                                        error={touched.qr_code && errors.qr_code}
                                    />
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
                            ? "Update Agent Customer"
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
                        setFieldError,
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
                            onSubmit={() => formikSubmit()}
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText={
                                issubmitting
                                    ? (isEditMode ? "Updating..." : "Submitting...")
                                    : isEditMode
                                    ? "Update"
                                    : "Submit"
                            }
                        >
                            {renderStepContent(
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                setFieldError
                            )}
                        </StepperForm>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
