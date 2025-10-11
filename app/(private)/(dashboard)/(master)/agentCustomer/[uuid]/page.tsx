"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
} from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Loading from "@/app/components/Loading";
import { Form, Formik, FormikErrors, FormikHelpers, FormikTouched } from "formik";

interface AgentCustomerFormValues {
    // customer
    osa_code: string;
    name: string;
    customer_type: number | string;

    // contact
    contact_no1: string;
    is_whatsapp: number | string;
    whatsapp_no: string;

    // Location
	street: string;
    landmark: string;
    town: string;
    district: string;

    // financial
	vat: string;
    payment_type: number | string;
	buyertype: number | string;

    // transaction
	warehouse: string;
    route_id: number | string;
	outlet_channel_id: number | string;
    category_id: number | string;
    subcategory_id: number | string;

    // Additional
	enablePromoTxn: string;
}

export default function AddEditAgentCustomer() {
    const {
		warehouseOptions,
        routeOptions,
        customerTypeOptions,
        customerCategoryOptions,
        customerSubCategoryOptions,
        channelOptions,
    } = useAllDropdownListData();
    const [isOpen, setIsOpen] = useState(false);
    const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();
    const router = useRouter();
    const params = useParams();
    const agentCustomerId = params?.uuid as string | undefined;
    const isEditMode =
        agentCustomerId !== undefined && agentCustomerId !== "new";
    const steps: StepperStep[] = [
        // { id: 1, label: "Customer" },
        // { id: 2, label: "Contact" },
        // { id: 3, label: "Location" },
        // { id: 4, label: "Financial" },
        // { id: 5, label: "Transaction" },
        // { id: 6, label: "Additional" }
        { id: 1, label: "Agent Customer Details" },
        { id: 2, label: "Location Information" },
    ];
    const {
        currentStep,
        nextStep,
        prevStep,
        markStepCompleted,
        isStepCompleted,
        isLastStep,
    } = useStepperForm(steps.length);

    const [initialValues, setInitialValues] = useState<AgentCustomerFormValues>({
        osa_code: "",
        name: "",
		warehouse: "",
        customer_type: "",
        route_id: "",
        is_whatsapp: "",
        whatsapp_no: "",
        vat: "",
        contact_no1: "",
        street: "",
        landmark: "",
        town: "",
        district: "",
        enablePromoTxn: "",
        buyertype: "",
        payment_type: "",
        outlet_channel_id: "",
        category_id: "",
        subcategory_id: "",
    });

    // Show loader in edit mode while loading (must be after all hooks and before return)

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
                        osa_code: (data.osa_code ?? data.code ?? "") as string,
                        name: (data.name ?? "") as string,
                        warehouse: data.warehouse ? String(data.warehouse) : "",
                        customer_type: data.customer_type != null ? String(data.customer_type) : "",
                        route_id: data.route_id != null ? String(data.route_id) : String(data.route?.id ?? ""),
                        is_whatsapp: data.is_whatsapp != null ? String(data.is_whatsapp) : "",
                        whatsapp_no: data.whatsapp_no != null ? String(data.whatsapp_no) : "",
                        vat: (data.vat ?? data.tin_no ?? "") as string,
                        contact_no1: (data.contact_no1 ?? data.contact_no2 ?? "") as string,
                        street: (data.road_street ?? data.street ?? "") as string,
                        landmark: (data.landmark ?? "") as string,
                        town: (data.town ?? "") as string,
                        district: (data.district ?? "") as string,
                        enablePromoTxn: (data.enablePromoTxn ?? data.enable_promo_txn ?? "") as string,
                        buyertype: data.buyertype != null ? String(data.buyertype) : "",
                        payment_type: data.payment_type != null ? String(data.payment_type) : "",
                        outlet_channel_id: data.outlet_channel_id != null ? String(data.outlet_channel_id) : String(data.outlet_channel?.id ?? ""),
                        category_id: data.category_id != null ? String(data.category_id) : String(data.category?.id ?? ""),
                        subcategory_id: data.subcategory_id != null ? String(data.subcategory_id) : String(data.subcategory?.id ?? ""),
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
                    setInitialValues((prev) => ({ ...prev, osa_code: res.code }));
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

    const AgentCustomerSchema = Yup.object().shape({
        osa_code: Yup.string().required("Agent Customer Code is required"),
        name: Yup.string().required("Name is required"),
        customer_type: Yup.string().required("Customer Type is required"),
        route_id: Yup.string().required("Route is required"),
        warehouse: Yup.string().required("Warehouse is required"),
        is_whatsapp: Yup.string(),
        whatsapp_no: Yup.number().nullable().when("is_whatsapp", {
            is: (val: string) => val === "1",
            then: (schema) => schema.required("Whatsapp Number is required"),
            otherwise: (schema) =>
                schema.notRequired()
                    .nullable()
                    // transform empty string to null so Yup treats it as nullable
                    .transform((value, originalValue) =>
                      originalValue === "" ? null : value
                    ),
        }),
        vat: Yup.string(),
        contact_no1: Yup.string().required("Contact Number is required"),
        street: Yup.string().required("Street is required"),
        landmark: Yup.string().required("Landmark is required"),
        town: Yup.string().required("Town is required"),
        district: Yup.string().required("District is required"),
        enablePromoTxn: Yup.string().required("Enable Promo Txn is required"),
        buyertype: Yup.string().required("Buyer Type is required"),
        payment_type: Yup.string().required("Payment Type is required"),
        outlet_channel_id: Yup.string().required("Outlet Channel is required"),
        category_id: Yup.string().required("Category is required"),
        subcategory_id: Yup.string().required("Subcategory is required"),
    });

    const stepSchemas = [
        Yup.object().shape({
            osa_code: AgentCustomerSchema.fields.osa_code,
            name: AgentCustomerSchema.fields.name,
            warehouse: AgentCustomerSchema.fields.warehouse,
            customer_type: AgentCustomerSchema.fields.customer_type,
            route_id: AgentCustomerSchema.fields.route_id,
            outlet_channel_id: AgentCustomerSchema.fields.outlet_channel_id,
            category_id: AgentCustomerSchema.fields.category_id,
            subcategory_id: AgentCustomerSchema.fields.subcategory_id,
            contact_no1: AgentCustomerSchema.fields.contact_no1,
        }),
        Yup.object().shape({
            street: AgentCustomerSchema.fields.street,
            landmark: AgentCustomerSchema.fields.landmark,
            town: AgentCustomerSchema.fields.town,
            district: AgentCustomerSchema.fields.district,
            enablePromoTxn: AgentCustomerSchema.fields.enablePromoTxn,
            buyertype: AgentCustomerSchema.fields.buyertype,
            payment_type: AgentCustomerSchema.fields.payment_type,
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
                (acc: Partial<Record<keyof AgentCustomerFormValues, string>>, curr) => ({
                  ...acc,
                  [curr.path as keyof AgentCustomerFormValues]: curr.message,
                }),
                {}
              )
            );
          }
          showSnackbar("Please fix validation errors before proceeding", "error");
        }
      };

    const handleSubmit = async (
      values: AgentCustomerFormValues,
      actions?: Pick<FormikHelpers<AgentCustomerFormValues>, "setErrors" | "setTouched" | "setSubmitting">
    ) => {
       try {
           console.log(values)
           await AgentCustomerSchema.validate(values, { abortEarly: false });
           const payload = {
               ...values,
               customer_type: Number(values.customer_type),
               route_id: Number(values.route_id),
               is_whatsapp: Number(values.is_whatsapp),
               buyertype: Number(values.buyertype),
               payment_type: Number(values.payment_type),
               outlet_channel_id: Number(values.outlet_channel_id),
               category_id: Number(values.category_id),
               subcategory_id: Number(values.subcategory_id),
               whatsapp_no:
                 values.whatsapp_no === "" || values.whatsapp_no == null
                   ? null
                   : values.whatsapp_no,
               status: 1
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
               router.push("/dashboard/master/agentCustomer");
           }
       } catch (err) {
            if (err instanceof Yup.ValidationError) {
                console.error("Yup ValidationError:", err);

                // Map inner errors to { fieldName: message }
                const fieldErrors = err.inner.reduce<Record<string, string>>((acc, e) => {
                    if (e.path) acc[e.path] = e.message;
                    return acc;
                }, {});

                // If caller provided Formik helpers, set field errors + touched so UI shows per-field messages
                if (actions?.setErrors) {
                    actions.setErrors(fieldErrors as FormikErrors<AgentCustomerFormValues>);
                }
                if (actions?.setTouched) {
                    const touchedMap = Object.keys(fieldErrors).reduce<Record<string, boolean>>((acc, k) => {
                        acc[k] = true;
                        return acc;
                    }, {});
                    actions.setTouched(touchedMap as FormikTouched<AgentCustomerFormValues>);
                }

                // Show a summary snackbar
                showSnackbar(err.errors.join("; "), "error");
                return;
            }
 
             // fallback for non-Yup errors
             console.error("Submit error:", err);
             showSnackbar(isEditMode? "Update Agent Customer failed": "Add Agent Customer failed","error");
         }
     };

    const renderStepContent = (
        values: AgentCustomerFormValues,
        setFieldValue: (
            field: keyof AgentCustomerFormValues,
            value: string | File,
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
                                Agent Customer Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-end gap-2 max-w-[406px]">
                                    <InputFields
                                        label="OSA Code"
                                        name="osa_code"
                                        value={values.osa_code}
                                        onChange={(e) => {
                                            setFieldValue("osa_code", e.target.value);
                                        }}
                                        disabled={codeMode === "auto"}
                                    />
                                    {!isEditMode && (
                                        <>
                                            <IconButton
                                                bgClass="white"
                                                className="mb-2 cursor-pointer text-[#252B37]"
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
                                                        setFieldValue("osa_code", code);
                                                    } else if (
                                                        mode === "manual"
                                                    ) {
                                                        setFieldValue("osa_code", "");
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                                <div>
                                    <InputFields
                                        required
                                        label="Name"
                                        name="name"
                                        value={values.name}
                                        onChange={(e) => setFieldValue("name", e.target.value)}
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
                                        label="Customer Type"
                                        options={customerTypeOptions}
                                        name="customer_type"
                                        value={
                                            values.customer_type?.toString() ?? ""
                                        }
                                        onChange={(e) => setFieldValue("customer_type", e.target.value)}
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
                                        onChange={(e) => setFieldValue("warehouse", e.target.value)}
                                        error={touched.warehouse && errors.warehouse}
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
                                        label="Outlet Channel"
                                        name="outlet_channel_id"
                                        value={
                                            values.outlet_channel_id?.toString() ??
                                            ""
                                        }
                                        onChange={(e) => setFieldValue("outlet_channel_id", e.target.value)}
                                        error={
                                            touched.outlet_channel_id &&
                                            errors.outlet_channel_id
                                        }
                                        options={channelOptions}
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
                                        onChange={(e) => setFieldValue("category_id", e.target.value)}
                                        error={
                                            touched.category_id &&
                                            errors.category_id
                                        }
                                        options={customerCategoryOptions}
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
                                        onChange={(e) => setFieldValue("subcategory_id", e.target.value)}
                                        error={
                                            touched.subcategory_id &&
                                            errors.subcategory_id
                                        }
                                        options={customerSubCategoryOptions}
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
                                        label="Route"
                                        name="route_id"
                                        value={values.route_id?.toString() ?? ""}
                                        onChange={(e) => setFieldValue("route_id", e.target.value)}
                                        error={
                                            touched.route_id && errors.route_id
                                        }
                                        options={routeOptions}
                                    />
                                    {touched.route_id && errors.route_id && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.route_id}
                                        </div>
                                    )}
                                </div>

								<div>
                                    <InputFields
                                        required
                                        label="Contact No 1"
                                        name="contact_no1"
                                        value={values.contact_no1}
                                        onChange={(e) => setFieldValue("contact_no1", e.target.value)}
                                        error={touched.contact_no1 && errors.contact_no1}
                                    />
                                    {touched.contact_no1 && errors.contact_no1 && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.contact_no1}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Is Whatsapp"
                                        name="is_whatsapp"
                                        value={
                                            values.is_whatsapp?.toString() ?? ""
                                        }
                                        type="radio"
                                        onChange={(e) => setFieldValue("is_whatsapp", e.target.value)}
                                        error={
                                            touched.is_whatsapp &&
                                            errors.is_whatsapp
                                        }
                                        options={[
                                            { value: "1", label: "Yes" },
                                            { value: "0", label: "No" },
                                        ]}
                                    />
                                    {touched.is_whatsapp &&
                                        errors.is_whatsapp && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.is_whatsapp}
                                            </div>
                                        )}
                                    {/* Show Whatsapp No only if is_whatsapp is '1' */}
                                </div>
                                {values.is_whatsapp?.toString() === "1" && (
                                    <div>
                                        <InputFields
                                            required
                                            label="Whatsapp No"
                                            name="whatsapp_no"
                                            value={values.whatsapp_no}
                                            onChange={(e) => setFieldValue("whatsapp_no", e.target.value)}
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
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">
                                Location Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

								<div>
                                    <InputFields
                                        required
										type="radio"
                                        label="Buyer Type"
                                        name="buyertype"
                                        value={values.buyertype?.toString() ?? ""}
                                        onChange={(e) => setFieldValue("buyertype", e.target.value)}
                                        error={
                                            touched.buyertype &&
                                            errors.buyertype
                                        }
                                        options={[
											{ value: "0", label: "B2B" },
											{ value: "1", label: "B2C" }
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
                                        label="VAT"
                                        name="vat"
                                        value={values.vat}
                                        onChange={(e) => setFieldValue("vat", e.target.value)}
                                        error={touched.vat && errors.vat}
                                    />
                                    {touched.vat && errors.vat && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.vat}
                                        </div>
                                    )}
                                </div>

								<div>
                                    <InputFields
                                        required
                                        label="Street"
                                        name="street"
                                        value={values.street}
                                        onChange={(e) => setFieldValue("street", e.target.value)}
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
                                        onChange={(e) => setFieldValue("landmark", e.target.value)}
                                        error={touched.landmark && errors.landmark}
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
                                        onChange={(e) => setFieldValue("town", e.target.value)}
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
                                        onChange={(e) => setFieldValue("district", e.target.value)}
                                        error={touched.district && errors.district}
                                    />
                                    {touched.district && errors.district && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.district}
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <InputFields
                                        required
                                        label="Payment Type"
                                        name="payment_type"
                                        value={
                                            values.payment_type?.toString() ?? ""
                                        }
                                        onChange={(e) => setFieldValue("payment_type", e.target.value)}
                                        error={
                                            touched.payment_type &&
                                            errors.payment_type
                                        }
                                        options={[
											{ value: "1", label: "Cash" },
											{ value: "2", label: "Credit" },
											{ value: "3", label: "B2B" }
										]}
                                    />
                                    {touched.payment_type &&
                                        errors.payment_type && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.payment_type}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <InputFields
                                        required
                                        label="Enable Promo Txn"
                                        name="enable_promo_txn"
                                        value={
                                            values.enablePromoTxn?.toString() ?? ""
                                        }
                                        onChange={(e) => setFieldValue("enablePromoTxn", e.target.value)}
                                        error={
                                            touched.enablePromoTxn &&
                                            errors.enablePromoTxn
                                        }
                                        options={[
											{ value: "1", label: "Cash" },
											{ value: "2", label: "Credit" },
											{ value: "3", label: "B2B" }
										]}
                                    />
                                    {touched.enablePromoTxn &&
                                        errors.enablePromoTxn && (
                                            <div className="text-red-500 text-xs mt-1">
                                                {errors.enablePromoTxn}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (isEditMode && loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loading />
            </div>
        );
    }
    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/master/agentCustomer">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEditMode
                            ? "Edit Agent Customer"
                            : "Add Agent Customer"}
                    </h1>
                </div>
            </div>
            <Formik initialValues={initialValues} validationSchema={AgentCustomerSchema} enableReinitialize={true} onSubmit={handleSubmit}>
                {({ values, setFieldValue, errors, touched, handleSubmit: formikSubmit, setErrors, setTouched, isSubmitting: issubmitting }) => (
                    <Form>
                    <StepperForm
                        steps={steps.map((step) => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
                        currentStep={currentStep}
                        onStepClick={() => {}}
                        onBack={prevStep}
                        onNext={() =>
                        handleNext(values, { setErrors, setTouched } as unknown as FormikHelpers<AgentCustomerFormValues>)
                        }
                        onSubmit={() => handleSubmit(values)}
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
        </>
    );
}
