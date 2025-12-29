
"use client";

import StepperForm, {
    useStepperForm,
    StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
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
import axios from "axios";

import {
    addChillerRequest,
    fridgeUpdateCustomerByUUID,
    updateFridgeUpdateCustomer,
} from "@/app/services/assetsApi";
import { channelList } from "@/app/services/allApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loading from "@/app/components/Loading";

// File validation helper
const FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const SUPPORTED_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileValidation = Yup.mixed()
    .test("fileSize", "File too large (max 10MB)", (value) => {
        if (!value) return true; // No file is valid (optional field)
        if (value instanceof File) {
            return value.size <= FILE_SIZE;
        }
        return true; // If it's a string (existing file), it's valid
    })
    .test("fileFormat", "Unsupported Format", (value) => {
        if (!value) return true; // No file is valid (optional field)
        if (value instanceof File) {
            return SUPPORTED_FORMATS.includes(value.type);
        }
        return true; // If it's a string (existing file), it's valid
    });

const validationSchema = Yup.object({
    owner_name: Yup.string()
        .trim()
        .required("Owner Name is required")
        .max(100, "Owner Name cannot exceed 100 characters"),
    outlet_name: Yup.string()
        .trim()
        .required("Outlet Name is required")
        .max(100, "Outlet Name cannot exceed 100 characters"),
    contact_number: Yup.string()
        .matches(/^\d{9}$/, "Contact Number must be exactly 10 digits")
        .required("Contact Number is required"),
    landmark: Yup.string()
        .trim()
        .max(255, "Landmark cannot exceed 255 characters"),
    existing_coolers: Yup.string()
        .trim()
        .max(100, "Existing coolers cannot exceed 100 characters"),
    outlet_weekly_sale_volume_current: Yup.string()
        .trim()
        .max(100, "Outlet weekly sale volume cannot exceed 100 characters"),
    outlet_weekly_sale_volume: Yup.string()
        .trim()
        .max(100, "Outlet weekly sale volume cannot exceed 100 characters"),
    display_location: Yup.string()
        .trim()
        .max(100, "Display location cannot exceed 100 characters"),
    chiller_size_requested: Yup.string()
        .trim()
        .max(100, "Chiller size requested cannot exceed 100 characters"),
    national_id: Yup.string()
        .trim()
        .max(50, "National ID cannot exceed 50 characters"),
    stock_share_with_competitor: Yup.string()
        .trim()
        .max(50, "Stock Share With Competitor cannot exceed 50 characters"),
    lc_letter: fileValidation,
    trading_licence: fileValidation,
    password_photo: fileValidation,
    outlet_address_proof: fileValidation,
    outlet_stamp: fileValidation,
    national_id_file: fileValidation,
    password_photo_file: fileValidation,
    outlet_address_proof_file: fileValidation,
    trading_licence_file: fileValidation,
    lc_letter_file: fileValidation,
    outlet_stamp_file: fileValidation,
});

const stepSchemas = [
    // Step 1: Basic Outlet Information
    Yup.object({
        owner_name: validationSchema.fields.owner_name,
        outlet_name: validationSchema.fields.outlet_name,
        contact_number: validationSchema.fields.contact_number,
        landmark: validationSchema.fields.landmark,
    }),

    // Step 2: Location and Personnel
    Yup.object({
        existing_coolers: validationSchema.fields.existing_coolers,
        outlet_weekly_sale_volume: validationSchema.fields.outlet_weekly_sale_volume,
        stock_share_with_competitor: validationSchema.fields.stock_share_with_competitor,
        display_location: validationSchema.fields.display_location,
        chiller_size_requested: validationSchema.fields.chiller_size_requested,
    }),

    // Step 3: Chiller Details
    Yup.object({
        national_id: validationSchema.fields.national_id,
        national_id_file: validationSchema.fields.national_id_file,

        password_photo: validationSchema.fields.password_photo,
        password_photo_file: validationSchema.fields.password_photo_file,

        outlet_address_proof: validationSchema.fields.outlet_address_proof,
        outlet_address_proof_file: validationSchema.fields.outlet_address_proof_file,

        outlet_stamp: validationSchema.fields.outlet_stamp,
        outlet_stamp_file: validationSchema.fields.outlet_stamp_file,

        lc_letter: validationSchema.fields.lc_letter,
        lc_letter_file: validationSchema.fields.lc_letter_file,

        trading_licence: validationSchema.fields.trading_licence,
        trading_licence_file: validationSchema.fields.trading_licence_file,
    })
];

type Chiller = {
    osa_code: string;
    outlet_name: string;
    outlet_type: string;
    owner_name: string;
    contact_number: string;
    landmark: string;
    location: string;
    postal_address: string;
    existing_coolers: string;
    outlet_weekly_sale_volume: string;
    outlet_weekly_sales: string;
    stock_share_with_competitor: string;
    display_location: string;
    serial_no: string;
    chiller_size_requested: string;
    specify_if_other_type: string;
    agent_id: number;
    national_id: string;
    outlet_stamp: string;
    trading_licence: string;
    password_photo: string;
    outlet_address_proof: string;
    lc_letter: string;
    contract_attached: string;
    status: number;
    fridge_status: number;
    request_document_status: number;
    remark: string;
    national_id_file: string | File;
    password_photo_file: string | File;
    outlet_address_proof_file: string | File;
    trading_licence_file: string | File;
    lc_letter_file: string | File;
    outlet_stamp_file: string | File;
    sign_customer_file: string | File;
    national_id1_file: string | File;
    password_photo1_file: string | File;
    outlet_address_proof1_file: string | File;
    trading_licence1_file: string | File;
    lc_letter1_file: string | File;
    outlet_stamp1_file: string | File;
    sign_salesman_file: string | File;
    fridge_scan_img: string | File;
};

type DropdownOption = {
    value: string;
    label: string;
};

type FileField = {
    fieldName: keyof Chiller;
    label: string;
    accept?: string;
};

const fileFields: FileField[] = [
    {
        fieldName: "national_id_file",
        label: "National ID File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "password_photo_file",
        label: "Password Photo File",
        accept: "image/*",
    },
    {
        fieldName: "outlet_address_proof_file",
        label: "Outlet Address Proof File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "trading_licence_file",
        label: "Trading Licence File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "lc_letter_file",
        label: "LC Letter File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "outlet_stamp_file",
        label: "Outlet Stamp File",
        accept: "image/*,.pdf",
    },
    {
        fieldName: "sign_customer_file",
        label: "Sign Customer File",
        accept: "image/*,.pdf",
    },
    {
        fieldName: "national_id1_file",
        label: "National ID File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "password_photo1_file",
        label: "Password Photo File",
        accept: "image/*",
    },
    {
        fieldName: "outlet_address_proof1_file",
        label: "Outlet Address Proof File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "trading_licence1_file",
        label: "Trading Licence File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "lc_letter1_file",
        label: "LC Letter File",
        accept: ".pdf,.doc,.docx,image/*",
    },
    {
        fieldName: "outlet_stamp1_file",
        label: "Outlet Stamp File",
        accept: "image/*,.pdf",
    },
    {
        fieldName: "sign_salesman_file",
        label: "Sign Salesman File",
        accept: "image/*,.pdf",
    },
    {
        fieldName: "fridge_scan_img",
        label: "Fridge Scan Image",
        accept: "image/*,.pdf",
    },
];

// Create axios instance for form data
const APIFormData = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

APIFormData.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default function AddCompanyWithStepper() {
    console.log("ashdfvazbfavhj")
    const [warehouseOptions, setWarehouseOptions] = useState<DropdownOption[]>(
        []
    );

    const [uploadedFiles, setUploadedFiles] = useState<
        Record<string, { file: File; preview?: string }>
    >({});
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [existingData, setExistingData] = useState<Chiller | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { agentCustomerOptions, channelOptions, salesmanOptions, routeOptions, brandingOptions, ensureBrandingLoaded, ensureSalesmanLoaded, ensureRouteLoaded, ensureAgentCustomerLoaded, ensureChannelLoaded } = useAllDropdownListData();

    const params = useParams();
    const uuid = params?.id;
    console.log("UUID from params:", params);

    const steps: StepperStep[] = [
        { id: 1, label: "Outlet Information" },
        { id: 2, label: "Location & Personnel" },
        { id: 3, label: "Assets Details" },
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

    useEffect(() => {
        ensureAgentCustomerLoaded();
        ensureChannelLoaded();
        ensureSalesmanLoaded();
        ensureRouteLoaded();
        ensureBrandingLoaded();
    }, []);

    useEffect(() => {
        const checkEditMode = async () => {
            if (uuid && uuid !== "add") {
                setIsEditMode(true);
                await fetchExistingData(uuid.toString());
            } else {
                setIsEditMode(false);
                setIsLoading(false);
            }
        };

        checkEditMode();
    }, [uuid]);


    const fetchExistingData = async (uuid: string) => {
        try {
            setIsLoading(true);
            const res = await fridgeUpdateCustomerByUUID(uuid);

            if (res.status === "success" && res.data) {
                const data = res.data;

                // Transform the API response to match our Chiller type
                const transformedData: Chiller = {
                    osa_code: data.osa_code || "",
                    outlet_name: data.outlet_name || "",
                    outlet_type: data.outlet_type || "",
                    location: data.location || "",
                    postal_address: data.postal_address || "",
                    serial_no: data.serial_no || "",
                    owner_name: data.owner_name || "",
                    contact_number: data.contact_number || "",
                    landmark: data.landmark || "",
                    existing_coolers: data.existing_coolers || "",
                    stock_share_with_competitor: data.stock_share_with_competitor || "",
                    outlet_weekly_sale_volume: data.outlet_weekly_sale_volume || "",
                    outlet_weekly_sales: data.outlet_weekly_sales || "",
                    display_location: data.display_location || "",
                    chiller_size_requested: data.chiller_size_requested || "",
                    national_id: data.national_id || "",
                    password_photo: data.password_photo || "",
                    outlet_address_proof: data.outlet_address_proof || "",
                    outlet_stamp: data.outlet_stamp || "",
                    lc_letter: data.lc_letter || "",
                    trading_licence: data.trading_licence || "",
                    national_id_file: data.national_id_file || "",
                    password_photo_file: data.password_photo_file || "",
                    outlet_address_proof_file: data.outlet_address_proof_file || "",
                    trading_licence_file: data.trading_licence_file || "",
                    lc_letter_file: data.lc_letter_file || "",
                    outlet_stamp_file: data.outlet_stamp_file || "",
                    sign_customer_file: data.sign_customer_file || "",
                    sign_salesman_file: data.sign_salesman_file || "",
                    fridge_scan_img: data.fridge_scan_img || "",
                    national_id1_file: data.national_id1_file || "",
                    password_photo1_file: data.password_photo1_file || "",
                    outlet_address_proof1_file: data.outlet_address_proof1_file || "",
                    trading_licence1_file: data.trading_licence1_file || "",
                    lc_letter1_file: data.lc_letter1_file || "",
                    outlet_stamp1_file: data.outlet_stamp1_file || "",
                    specify_if_other_type: data.specify_if_other_type || "",
                    agent_id: data.agent_id || 0,
                    contract_attached: data.contract_attached || "",
                    status: data.status || 1,
                    fridge_status: data.fridge_status || 0,
                    request_document_status: data.request_document_status || 0,
                    remark: data.remark || "",
                };

                setExistingData(transformedData);

                // Set uploaded files for existing file names
                const fileFieldsToCheck = [
                    "outlet_stamp",
                    "contract_attached",
                    "lc_letter",
                    "trading_licence",
                    "password_photo",
                    "outlet_address_proof",
                    "national_id_file",
                    "password_photo_file",
                    "outlet_address_proof_file",
                    "trading_licence_file",
                    "lc_letter_file",
                    "outlet_stamp_file",
                    "sign_customer_file",
                    "sign_salesman_file",
                    "fridge_scan_img",
                    "national_id1_file",
                    "password_photo1_file",
                    "outlet_address_proof1_file",
                    "trading_licence1_file",
                    "lc_letter1_file",
                    "outlet_stamp1_file",
                    "sign_customer_file",
                    "sign_salesman_file",
                    "fridge_scan_img",
                ];

                const initialUploadedFiles: Record<
                    string,
                    { file: File; preview?: string }
                > = {};
                fileFieldsToCheck.forEach((field) => {
                    if (transformedData[field as keyof Chiller]) {
                        initialUploadedFiles[field] = {
                            file: new File(
                                [],
                                transformedData[field as keyof Chiller] as string
                            ),
                            preview: undefined,
                        };
                    }
                });
                setUploadedFiles(initialUploadedFiles);
            } else {
                showSnackbar("Failed to fetch assets request data", "error");
            }
        } catch (error) {
            console.error("Error fetching existing data:", error);
            showSnackbar("Failed to fetch assets request data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (
        fieldName: keyof Chiller,
        event: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: FormikHelpers<Chiller>["setFieldValue"]
    ) => {
        const file = event.target.files?.[0];
        if (file) {

            if (file.size > FILE_SIZE) {
                showSnackbar(
                    `File size must be less than 10MB for ${fieldName}`,
                    "error"
                );
                event.target.value = "";
                return;
            }


            if (!SUPPORTED_FORMATS.includes(file.type)) {
                showSnackbar(
                    `Unsupported file format for ${fieldName}. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF`,
                    "error"
                );
                event.target.value = ""; // Clear the input
                return;
            }

            setFieldValue(fieldName, file);

            // Generate preview for images
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedFiles((prev) => ({
                        ...prev,
                        [fieldName]: {
                            file,
                            preview: e.target?.result as string,
                        },
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                setUploadedFiles((prev) => ({
                    ...prev,
                    [fieldName]: { file },
                }));
            }

            showSnackbar(`File "${file.name}" selected for ${fieldName}`, "success");
        }
    };

    const removeFile = (
        fieldName: keyof Chiller,
        setFieldValue: (
            field: keyof Chiller,
            value: Chiller,
            shouldValidate?: boolean
        ) => void
    ) => {
        setUploadedFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[fieldName];
            return newFiles;
        });
        showSnackbar(`File removed from ${fieldName}`, "info");
    };

    const renderFileInput = (
        fieldName: keyof Chiller,
        label: string,
        values: Chiller,
        setFieldValue: FormikHelpers<Chiller>["setFieldValue"],
        errors: FormikErrors<Chiller>,
        touched: FormikTouched<Chiller>,
        accept?: string
    ) => {
        const fileInfo = uploadedFiles[fieldName];
        const currentValue = values[fieldName];
        const hasFile =
            fileInfo || (typeof currentValue === "string" && currentValue);

        return (
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>

                {!hasFile ? (
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Icon
                                    icon="lucide:upload"
                                    className="w-8 h-8 mb-4 text-gray-500"
                                />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    PDF, DOC, JPG, PNG, GIF (MAX 10MB)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept={accept || ".pdf,.doc,.docx,image/*"}
                                onChange={(e) => handleFileChange(fieldName, e, setFieldValue)}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                            {fileInfo?.preview ? (
                                <img
                                    src={fileInfo.preview}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded"
                                />
                            ) : (
                                <Icon icon="lucide:file" className="w-8 h-8 text-gray-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {fileInfo
                                        ? fileInfo.file.name
                                        : typeof currentValue === "string"
                                            ? currentValue
                                            : "File"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {fileInfo
                                        ? `${(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB`
                                        : "Uploaded file"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeFile(fieldName, setFieldValue)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Icon icon="lucide:trash-2" className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {touched[fieldName] && errors[fieldName] && (
                    <div className="text-sm text-red-600 mt-1">
                        {errors[fieldName] as string}
                    </div>
                )}
            </div>
        );
    };

    const initialValues: Chiller = {
        osa_code: "",
        outlet_name: "",
        outlet_type: "",
        owner_name: "",
        contact_number: "",
        landmark: "",
        location: "",
        postal_address: "",
        existing_coolers: "",
        outlet_weekly_sale_volume: "",
        outlet_weekly_sales: "",
        stock_share_with_competitor: "",
        display_location: "",

        serial_no: "",
        chiller_size_requested: "",
        agent_id: 0,
        national_id: "",
        outlet_stamp: "",
        trading_licence: "",
        password_photo: "",
        outlet_address_proof: "",
        lc_letter: "",
        contract_attached: "",
        status: 1,
        fridge_status: 0,
        request_document_status: 0,
        remark: "",
        national_id_file: "",
        password_photo_file: "",
        outlet_address_proof_file: "",
        trading_licence_file: "",
        lc_letter_file: "",
        outlet_stamp_file: "",
        specify_if_other_type: "",
        sign_customer_file: "",
        sign_salesman_file: "",
        fridge_scan_img: "",
        national_id1_file: "",
        password_photo1_file: "",
        outlet_address_proof1_file: "",
        trading_licence1_file: "",
        lc_letter1_file: "",
        outlet_stamp1_file: "",
    };

    const stepFields = [
        ["owner_name", "contact_number", "landmark", "existing_coolers", "outlet_weekly_sale_volume", "display_location", "chiller_safty_grill"],
        ["warehouse_id", "salesman_id", "outlet_id", "manager_sales_marketing"],
        ["national_id", "outlet_stamp", "model", "hil", "ir_reference_no", "installation_done_by", "date_lnitial", "date_lnitial2", "contract_attached", "machine_number", "brand", "asset_number"],
        ["lc_letter", "trading_licence", "password_photo", "outlet_address_proof", "chiller_asset_care_manager", "national_id_file", "password_photo_file", "outlet_address_proof_file", "trading_licence_file", "lc_letter_file", "outlet_stamp_file", "sign__customer_file", "chiller_manager_id", "is_merchandiser", "status", "fridge_status", "iro_id", "remark"]
    ];

    const handleNext = async (
        values: Chiller,
        actions: FormikHelpers<Chiller>
    ) => {
        try {
            const schema = stepSchemas[currentStep - 1];
            await schema.validate(values, { abortEarly: false });
            markStepCompleted(currentStep);
            nextStep();
        } catch (err: unknown) {
            if (err instanceof Yup.ValidationError) {
                const errors: FormikErrors<Chiller> = {};
                const touched: FormikTouched<Chiller> = {};
                // Only include fields for the current step
                const fields = stepFields[currentStep - 1];
                err.inner.forEach((error) => {
                    if (error.path && fields.includes(error.path)) {
                        errors[error.path as keyof Chiller] = error.message;
                        touched[error.path as keyof Chiller] = true;
                    }
                });
                actions.setErrors(errors);
                actions.setTouched(touched);
            }
            showSnackbar("Please fix validation errors before proceeding", "error");
        }
    };

    const handleSubmit = async (values: Chiller) => {
        try {
            setIsSubmitting(true);
            await validationSchema.validate(values, { abortEarly: false });

            // Create FormData for file upload
            const formData = new FormData();

            // Append all non-file fields
            Object.keys(values).forEach((key) => {
                const value = values[key as keyof Chiller];

                // Skip file fields for now (they will be appended separately)
                if (value instanceof File) {
                    return;
                }

                if (value !== null && value !== undefined && value !== "") {
                    formData.append(key, value.toString());
                }
            });

            // Append file fields
            fileFields.forEach((fileField) => {
                const fileValue = values[fileField.fieldName];
                if (fileValue instanceof File) {
                    formData.append(fileField.fieldName, fileValue);
                } else if (typeof fileValue === "string" && fileValue) {
                    // For existing files in edit mode, you might want to handle them differently
                    // If it's a string (existing file path), you can append it as is or skip
                    // formData.append(fileField.fieldName, fileValue);
                }
            });

            let res;
            if (isEditMode && uuid) {
                // Update existing record with FormData
                res = await updateFridgeUpdateCustomer(uuid.toString(), formData);
            } else {
                // Create new record with FormData
                res = await addChillerRequest(formData);
            }

            if (res.error) {
                showSnackbar(
                    res.data?.message ||
                    `Failed to ${isEditMode ? "update" : "add"} Chiller`,
                    "error"
                );
            } else {
                showSnackbar(
                    `Chiller ${isEditMode ? "updated" : "added"} successfully`,
                    "success"
                );
                router.push("/fridgeUpdateCustomer");
            }
        } catch (error) {
            console.error("Submit error:", error);
            showSnackbar(
                `${isEditMode ? "Update" : "Add"} Chiller failed ❌`,
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = (
        values: Chiller,
        setFieldValue: FormikHelpers<Chiller>["setFieldValue"],
        errors: FormikErrors<Chiller>,
        touched: FormikTouched<Chiller>
    ) => {
        if (loading) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <Loading />
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputFields
                                    label="OSA Code"
                                    name="osa_code"
                                    value={values.osa_code}
                                    onChange={(e) => setFieldValue("osa_code", e.target.value)}
                                // error={touched.owner_name && errors.owner_name}
                                />
                                <ErrorMessage
                                    name="osa_code"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Agent"
                                    name="agent_id"
                                    value={values.agent_id.toString()}
                                    options={agentCustomerOptions}
                                    onChange={(e) => setFieldValue("agent_id", parseInt(e.target.value, 10))}
                                // error={touched.owner_name && errors.owner_name}
                                />
                                <ErrorMessage
                                    name="agent"
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
                                    onChange={(e) => setFieldValue("owner_name", e.target.value)}
                                // error={touched.owner_name && errors.owner_name}
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
                                    label="Outlet Name"
                                    name="outlet_name"
                                    options={channelOptions}
                                    value={values.outlet_name}
                                    onChange={(e) => setFieldValue("outlet_name", e.target.value)}
                                // error={touched.owner_name && errors.owner_name}
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
                                    label="Contact Number"
                                    name="contact_number"
                                    value={values.contact_number}
                                    onChange={(e) =>
                                        setFieldValue("contact_number", e.target.value)
                                    }
                                // error={touched.contact_number && errors.contact_number}
                                />
                                <ErrorMessage
                                    name="contact_number"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Landmark"
                                    name="landmark"
                                    value={values.landmark}
                                    onChange={(e) => setFieldValue("landmark", e.target.value)}
                                // error={touched.landmark && errors.landmark}
                                />
                                <ErrorMessage
                                    name="landmark"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Location"
                                    name="location"
                                    value={values.location}
                                    onChange={(e) => setFieldValue("location", e.target.value)}
                                // error={touched.landmark && errors.landmark}
                                />
                                <ErrorMessage
                                    name="location"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Outlet Type"
                                    name="outlet_type"
                                    value={values.outlet_type}
                                    onChange={(e) => setFieldValue("outlet_type", e.target.value)}
                                // error={touched.landmark && errors.landmark}
                                />
                                <ErrorMessage
                                    name="outlet_type"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Postal Address"
                                    name="postal_address"
                                    value={values.postal_address}
                                    onChange={(e) => setFieldValue("postal_address", e.target.value)}
                                // error={touched.landmark && errors.landmark}
                                />
                                <ErrorMessage
                                    name="postal_address"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Specify If Other Type"
                                    name="specify_if_other_type"
                                    value={values.specify_if_other_type}
                                    onChange={(e) => setFieldValue("specify_if_other_type", e.target.value)}
                                // error={touched.owner_name && errors.owner_name}
                                />
                                <ErrorMessage
                                    name="specify_if_other_type"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <InputFields
                                    label="Existing Coolers"
                                    name="existing_coolers"
                                    isSingle={false}
                                    value={values.existing_coolers}
                                    options={[
                                        { value: "CC", label: "CC" },
                                        { value: "PC", label: "PC" },
                                        { value: "HI", label: "HI" },
                                        { value: "Own", label: "Own" },
                                        { value: "Other", label: "Other" },
                                    ]}
                                    onChange={(e) =>
                                        setFieldValue("existing_coolers", e.target.value)
                                    }
                                // error={touched.existing_coolers && errors.existing_coolers}
                                />
                                <ErrorMessage
                                    name="existing_coolers"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Outlet Weekly Sale Volume"
                                    name="outlet_weekly_sale_volume"
                                    value={values.outlet_weekly_sale_volume}
                                    onChange={(e) =>
                                        setFieldValue("outlet_weekly_sale_volume", e.target.value)
                                    }
                                // error={
                                //   touched.outlet_weekly_sale_volume &&
                                //   errors.outlet_weekly_sale_volume
                                // }
                                />
                                <ErrorMessage
                                    name="outlet_weekly_sale_volume"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Chiller Size Requested"
                                    name="chiller_size_requested"
                                    value={values.chiller_size_requested}
                                    onChange={(e) =>
                                        setFieldValue("chiller_size_requested", e.target.value)
                                    }
                                // error={touched.display_location && errors.display_location}
                                />
                                <ErrorMessage
                                    name="chiller_size_requested"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Serial No"
                                    name="serial_no"
                                    value={values.serial_no}
                                    onChange={(e) =>
                                        setFieldValue("serial_no", e.target.value)
                                    }
                                // error={
                                //   touched.chiller_safty_grill && errors.chiller_safty_grill
                                // }
                                />
                                <ErrorMessage
                                    name="serial_no"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Stock Share With Competitor In"
                                    name="stock_share_with_competitor"
                                    value={values.stock_share_with_competitor}
                                    onChange={(e) =>
                                        setFieldValue("stock_share_with_competitor", e.target.value)
                                    }
                                // error={touched.existing_coolers && errors.existing_coolers}
                                />
                                <ErrorMessage
                                    name="stock_share_with_competitor"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>



                            <div>
                                <InputFields
                                    label="Display Location"
                                    name="display_location"
                                    value={values.display_location}
                                    onChange={(e) =>
                                        setFieldValue("display_location", e.target.value)
                                    }
                                // error={touched.display_location && errors.display_location}
                                />
                                <ErrorMessage
                                    name="display_location"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputFields
                                    label="National ID"
                                    name="national_id"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    value={typeof values.national_id === "string" ? values.national_id : ""}
                                    onChange={(e) => setFieldValue("national_id", e.target.value)}
                                />
                                <ErrorMessage
                                    name="national_id"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "national_id_file",
                                "National ID File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            <div>
                                <InputFields
                                    label="Password Photo"
                                    name="password_photo"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    value={typeof values.password_photo === "string" ? values.password_photo : ""}
                                    onChange={(e) => setFieldValue("password_photo", e.target.value)}
                                />
                                <ErrorMessage
                                    name="password_photo"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "password_photo_file",
                                "Password Photo File",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*"
                            )}

                            <div>
                                <InputFields
                                    label="Outlet Address Proof"
                                    name="outlet_address_proof"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    value={typeof values.outlet_address_proof === "string" ? values.outlet_address_proof : ""}
                                    onChange={(e) => setFieldValue("outlet_address_proof", e.target.value)}
                                />
                                <ErrorMessage
                                    name="outlet_address_proof"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "outlet_address_proof_file",
                                "Outlet Address Proof File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            <div>
                                <InputFields
                                    label="Outlet Stamp"
                                    name="outlet_stamp"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    value={typeof values.outlet_stamp === "string" ? values.outlet_stamp : ""}
                                    onChange={(e) => setFieldValue("outlet_stamp", e.target.value)}
                                />
                                <ErrorMessage
                                    name="outlet_stamp"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "outlet_stamp_file",
                                "Outlet Stamp File",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            <div>
                                <InputFields
                                    label="LC Letter"
                                    name="lc_letter"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    value={typeof values.lc_letter === "string" ? values.lc_letter : ""}
                                    onChange={(e) => setFieldValue("lc_letter", e.target.value)}
                                />
                                <ErrorMessage
                                    name="lc_letter"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "lc_letter_file",
                                "LC Letter File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            <div>
                                <InputFields
                                    label="Trading Licence"
                                    name="trading_licence"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    value={typeof values.trading_licence === "string" ? values.trading_licence : ""}
                                    onChange={(e) => setFieldValue("trading_licence", e.target.value)}
                                />
                                <ErrorMessage
                                    name="trading_licence"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "trading_licence",
                                "Trading Licence",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "sign_customer_file",
                                "Sign Customer File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}


                            {renderFileInput(
                                "national_id1_file",
                                "National ID1 File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "password_photo1_file",
                                "Password Photo1 File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "outlet_address_proof1_file",
                                "Outlet Address Proof1 File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "trading_licence1_file",
                                "Trading Licence1 File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}
                            {renderFileInput(
                                "lc_letter1_file",
                                "LC Letter1 File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "outlet_stamp1_file",
                                "Outlet Stamp1 File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "sign_salesman_file",
                                "Sign Salesman File",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}

                            {renderFileInput(
                                "fridge_scan_img",
                                "Fridge Scan Image",
                                values,
                                setFieldValue,
                                errors,
                                touched
                            )}
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
                        {isEditMode ? "Update Fridge Update Customer" : "Add New Fridge Update Customer"}
                    </h1>
                </div>
            </div>

            <Formik
                initialValues={existingData || initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({
                    values,
                    setFieldValue,
                    errors,
                    touched,
                    setErrors,
                    setTouched,
                    isSubmitting: formikSubmitting,
                }) => (
                    <Form>
                        <StepperForm
                            steps={steps.map((step) => ({
                                ...step,
                                isCompleted: isStepCompleted(step.id),
                            }))}
                            currentStep={currentStep}
                            onStepClick={() => { }}
                            onBack={prevStep}
                            onNext={() =>
                                handleNext(values, {
                                    setErrors,
                                    setTouched,
                                } as unknown as FormikHelpers<Chiller>)
                            }
                            onSubmit={() => handleSubmit(values)}
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText={
                                isSubmitting
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Submitting..."
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
