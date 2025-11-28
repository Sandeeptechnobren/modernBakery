
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

import { warehouseList } from "@/app/services/allApi";
import {
  addChillerRequest,
  getChillerRequestById,
  updateChillerRequest,
} from "@/app/services/assetsApi";
import { salesmanList } from "@/app/services/allApi";
import { outletChannelList } from "@/app/services/allApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  contact_number: Yup.string()
    .matches(/^\d{10}$/, "Contact Number must be exactly 10 digits")
    .required("Contact Number is required"),
  landmark: Yup.string()
    .trim()
    .max(255, "Landmark cannot exceed 255 characters"),
  existing_coolers: Yup.string()
    .trim()
    .max(100, "Existing coolers cannot exceed 100 characters"),
  outlet_weekly_sale_volume: Yup.string()
    .trim()
    .max(100, "Outlet weekly sale volume cannot exceed 100 characters"),
  display_location: Yup.string()
    .trim()
    .max(100, "Display location cannot exceed 100 characters"),
  chiller_safty_grill: Yup.string()
    .trim()
    .max(100, "Chiller safety grill cannot exceed 100 characters"),
  warehouse_id: Yup.number()
    .required("Warehouse is required")
    .typeError("Warehouse must be a number"),
  salesman_id: Yup.number()
    .required("Salesman is required")
    .typeError("Salesman must be a number"),
  outlet_id: Yup.number()
    .required("Outlet is required")
    .typeError("Outlet must be a number"),
  manager_sales_marketing: Yup.number()
    .required("Manager Sales Marketing is required")
    .typeError("Manager Sales Marketing must be a number"),
  national_id: Yup.string()
    .trim()
    .max(50, "National ID cannot exceed 50 characters"),
  outlet_stamp: fileValidation,
  model: Yup.string().trim().max(50, "Model cannot exceed 50 characters"),
  hil: Yup.string().trim().max(50, "HIL cannot exceed 50 characters"),
  ir_reference_no: Yup.string()
    .trim()
    .max(50, "IR Reference No cannot exceed 50 characters"),
  installation_done_by: Yup.string()
    .trim()
    .max(100, "Installation done by cannot exceed 100 characters"),
  date_lnitial: Yup.date().typeError("Invalid date format for initial date"),
  date_lnitial2: Yup.date().typeError("Invalid date format for initial date 2"),
  contract_attached: fileValidation,
  machine_number: Yup.string()
    .trim()
    .max(50, "Machine number cannot exceed 50 characters"),
  brand: Yup.string().trim().max(50, "Brand cannot exceed 50 characters"),
  asset_number: Yup.string()
    .trim()
    .required("Asset Number is required")
    .max(50, "Asset Number cannot exceed 50 characters"),
  lc_letter: fileValidation,
  trading_licence: fileValidation,
  password_photo: fileValidation,
  outlet_address_proof: fileValidation,
  chiller_asset_care_manager: Yup.number().typeError(
    "Chiller asset care manager must be a number"
  ),
  national_id_file: fileValidation,
  password_photo_file: fileValidation,
  outlet_address_proof_file: fileValidation,
  trading_licence_file: fileValidation,
  lc_letter_file: fileValidation,
  outlet_stamp_file: fileValidation,
  sign__customer_file: fileValidation,
  chiller_manager_id: Yup.number().typeError(
    "Chiller manager ID must be a number"
  ),
  is_merchandiser: Yup.number()
    .oneOf([0, 1], "Invalid merchandiser status")
    .required("Merchandiser status is required"),
  status: Yup.number()
    .oneOf([0, 1], "Invalid status selected")
    .required("Status is required"),
  fridge_status: Yup.number()
    .oneOf([0, 1], "Invalid fridge status")
    .required("Fridge status is required"),
  iro_id: Yup.number()
    .required("IRO ID is required")
    .typeError("IRO ID must be a number"),
  remark: Yup.string().trim().max(500, "Remark cannot exceed 500 characters"),
});

const stepSchemas = [
  // Step 1: Basic Outlet Information
  Yup.object().shape({
    owner_name: validationSchema.fields.owner_name,
    contact_number: validationSchema.fields.contact_number,
    landmark: validationSchema.fields.landmark,
    existing_coolers: validationSchema.fields.existing_coolers,
    outlet_weekly_sale_volume:
      validationSchema.fields.outlet_weekly_sale_volume,
    display_location: validationSchema.fields.display_location,
    chiller_safty_grill: validationSchema.fields.chiller_safty_grill,
  }),

  // Step 2: Location and Personnel
  Yup.object().shape({
    warehouse_id: validationSchema.fields.warehouse_id,
    salesman_id: validationSchema.fields.salesman_id,
    outlet_id: validationSchema.fields.outlet_id,
    manager_sales_marketing: validationSchema.fields.manager_sales_marketing,
  }),

  // Step 3: Chiller Details
  Yup.object().shape({
    national_id: validationSchema.fields.national_id,
    outlet_stamp: validationSchema.fields.outlet_stamp,
    model: validationSchema.fields.model,
    hil: validationSchema.fields.hil,
    ir_reference_no: validationSchema.fields.ir_reference_no,
    installation_done_by: validationSchema.fields.installation_done_by,
    date_lnitial: validationSchema.fields.date_lnitial,
    date_lnitial2: validationSchema.fields.date_lnitial2,
    contract_attached: validationSchema.fields.contract_attached,
    machine_number: validationSchema.fields.machine_number,
    brand: validationSchema.fields.brand,
    asset_number: validationSchema.fields.asset_number,
  }),

  // Step 4: Documentation and Status
  Yup.object().shape({
    lc_letter: validationSchema.fields.lc_letter,
    trading_licence: validationSchema.fields.trading_licence,
    password_photo: validationSchema.fields.password_photo,
    outlet_address_proof: validationSchema.fields.outlet_address_proof,
    chiller_asset_care_manager:
      validationSchema.fields.chiller_asset_care_manager,
    national_id_file: validationSchema.fields.national_id_file,
    password_photo_file: validationSchema.fields.password_photo_file,
    outlet_address_proof_file:
      validationSchema.fields.outlet_address_proof_file,
    trading_licence_file: validationSchema.fields.trading_licence_file,
    lc_letter_file: validationSchema.fields.lc_letter_file,
    outlet_stamp_file: validationSchema.fields.outlet_stamp_file,
    sign__customer_file: validationSchema.fields.sign__customer_file,
    chiller_manager_id: validationSchema.fields.chiller_manager_id,
    is_merchandiser: validationSchema.fields.is_merchandiser,
    status: validationSchema.fields.status,
    fridge_status: validationSchema.fields.fridge_status,
    iro_id: validationSchema.fields.iro_id,
    remark: validationSchema.fields.remark,
  }),
];

type Chiller = {
  owner_name: string;
  contact_number: string;
  landmark: string;
  existing_coolers: string;
  outlet_weekly_sale_volume: string;
  display_location: string;
  chiller_safty_grill: string;
  warehouse_id: number;
  salesman_id: number;
  outlet_id: number;
  manager_sales_marketing: number;
  national_id: string;
  outlet_stamp: string | File;
  model: string;
  hil: string;
  ir_reference_no: string;
  installation_done_by: string;
  date_lnitial: string;
  date_lnitial2: string;
  contract_attached: string | File;
  machine_number: string;
  brand: string;
  asset_number: string;
  lc_letter: string | File;
  trading_licence: string | File;
  password_photo: string | File;
  outlet_address_proof: string | File;
  chiller_asset_care_manager: number;
  national_id_file: string | File;
  password_photo_file: string | File;
  outlet_address_proof_file: string | File;
  trading_licence_file: string | File;
  lc_letter_file: string | File;
  outlet_stamp_file: string | File;
  sign__customer_file: string | File;
  chiller_manager_id: number;
  is_merchandiser: number;
  status: number;
  fridge_status: number;
  iro_id: number;
  remark: string;
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
  { fieldName: "outlet_stamp", label: "Outlet Stamp", accept: "image/*,.pdf" },
  {
    fieldName: "contract_attached",
    label: "Contract Attached",
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    fieldName: "lc_letter",
    label: "LC Letter",
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    fieldName: "trading_licence",
    label: "Trading Licence",
    accept: ".pdf,.doc,.docx,image/*",
  },
  { fieldName: "password_photo", label: "Password Photo", accept: "image/*" },
  {
    fieldName: "outlet_address_proof",
    label: "Outlet Address Proof",
    accept: ".pdf,.doc,.docx,image/*",
  },
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
    fieldName: "sign__customer_file",
    label: "Customer Signature",
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
  const [salesmanOptions, setSalesmanOptions] = useState<DropdownOption[]>([]);
  const [outletOptions, setOutletOptions] = useState<DropdownOption[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, { file: File; preview?: string }>
  >({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingData, setExistingData] = useState<Chiller | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useParams();
  const uuid = params?.id;
  console.log("UUID from params:", params);

  const steps: StepperStep[] = [
    { id: 1, label: "Outlet Information" },
    { id: 2, label: "Location & Personnel" },
    { id: 3, label: "Chiller Details" },
    { id: 4, label: "Documentation & Status" },
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

  useEffect(() => {
    if (!isEditMode || existingData) {
      fetchDropdownData();
    }
  }, [isEditMode, existingData]);

  const fetchExistingData = async (uuid: string) => {
    try {
      setIsLoading(true);
      const res = await getChillerRequestById(uuid);

      if (res.status === "success" && res.data) {
        const data = res.data;

        // Transform the API response to match our Chiller type
        const transformedData: Chiller = {
          owner_name: data.owner_name || "",
          contact_number: data.contact_number || "",
          landmark: data.landmark || "",
          existing_coolers: data.existing_coolers || "",
          outlet_weekly_sale_volume: data.outlet_weekly_sale_volume || "",
          display_location: data.display_location || "",
          chiller_safty_grill: data.chiller_safty_grill || "",
          warehouse_id: data.warehouse?.id || 0,
          salesman_id: data.salesman?.id || 0,
          outlet_id: data.outlet?.id || 0,
          manager_sales_marketing: data.manager_sales_marketing || 0,
          national_id: data.national_id || "",
          outlet_stamp: data.outlet_stamp || "",
          model: data.model || "",
          hil: data.hil || "",
          ir_reference_no: data.ir_reference_no || "",
          installation_done_by: data.installation_done_by || "",
          date_lnitial: data.date_lnitial || "",
          date_lnitial2: data.date_lnitial2 || "",
          contract_attached: data.contract_attached || "",
          machine_number: data.machine_number || "",
          brand: data.brand || "",
          asset_number: data.asset_number || "",
          lc_letter: data.lc_letter || "",
          trading_licence: data.trading_licence || "",
          password_photo: data.password_photo || "",
          outlet_address_proof: data.outlet_address_proof || "",
          chiller_asset_care_manager: data.chiller_asset_care_manager || 0,
          national_id_file: data.national_id_file || "",
          password_photo_file: data.password_photo_file || "",
          outlet_address_proof_file: data.outlet_address_proof_file || "",
          trading_licence_file: data.trading_licence_file || "",
          lc_letter_file: data.lc_letter_file || "",
          outlet_stamp_file: data.outlet_stamp_file || "",
          sign__customer_file: data.sign__customer_file || "",
          chiller_manager_id: data.chiller_manager_id || 0,
          is_merchandiser: data.is_merchandiser || 0,
          status: data.status || 1,
          fridge_status: data.fridge_status || 0,
          iro_id: data.iro_id || 0,
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
          "sign__customer_file",
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
        showSnackbar("Failed to fetch chiller request data", "error");
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
      showSnackbar("Failed to fetch chiller request data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch warehouse data
      const warehouseRes = await warehouseList();
      if (warehouseRes.status === "success") {
        const warehouseOpts = warehouseRes.data.map((warehouse: {
          id: string,
          warehouse_code: string,
          warehouse_name: string
        }) => ({
          value: warehouse.id.toString(),
          label: `${warehouse.warehouse_code} - ${warehouse.warehouse_name}`,
        }));
        setWarehouseOptions(warehouseOpts);
      }

      // Fetch salesman data
      const salesmanRes = await salesmanList({});
      if (salesmanRes.status === "success") {
        const salesmanOpts = salesmanRes.data.map((salesman: {
          id: string,
          osa_code: string,
          name: string
        }) => ({
          value: salesman.id.toString(),
          label: `${salesman.osa_code} - ${salesman.name}`,
        }));
        setSalesmanOptions(salesmanOpts);
      }

      // Fetch outlet data
      const outletRes = await outletChannelList();
      if (outletRes.status === "success") {
        const outletOpts = outletRes.data.map((outlet: {
          id: string,
          outlet_channel_code: string,
          outlet_channel: string
        }) => ({
          value: outlet.id.toString(),
          label: `${outlet.outlet_channel_code} - ${outlet.outlet_channel}`,
        }));
        setOutletOptions(outletOpts);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      showSnackbar("Failed to load dropdown data", "error");
    }
  };

  const handleFileChange = (
    fieldName: keyof Chiller,
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<Chiller>["setFieldValue"]
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size
      if (file.size > FILE_SIZE) {
        showSnackbar(
          `File size must be less than 10MB for ${fieldName}`,
          "error"
        );
        event.target.value = ""; // Clear the input
        return;
      }

      // Check file type
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
    owner_name: "",
    contact_number: "",
    landmark: "",
    existing_coolers: "",
    outlet_weekly_sale_volume: "",
    display_location: "",
    chiller_safty_grill: "",
    warehouse_id: 0,
    salesman_id: 0,
    outlet_id: 0,
    manager_sales_marketing: 0,
    national_id: "",
    outlet_stamp: "",
    model: "",
    hil: "",
    ir_reference_no: "",
    installation_done_by: "",
    date_lnitial: "",
    date_lnitial2: "",
    contract_attached: "",
    machine_number: "",
    brand: "",
    asset_number: "",
    lc_letter: "",
    trading_licence: "",
    password_photo: "",
    outlet_address_proof: "",
    chiller_asset_care_manager: 0,
    national_id_file: "",
    password_photo_file: "",
    outlet_address_proof_file: "",
    trading_licence_file: "",
    lc_letter_file: "",
    outlet_stamp_file: "",
    sign__customer_file: "",
    chiller_manager_id: 0,
    is_merchandiser: 0,
    status: 1, // Default to active
    fridge_status: 0,
    iro_id: 0,
    remark: "",
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
        res = await updateChillerRequest(uuid.toString(), formData);
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
        router.push("/assets/chillerRequest");
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
    if (isLoading) {
      return (
        <ContainerCard>
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        </ContainerCard>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputFields
                  required
                  label="Owner Name"
                  name="owner_name"
                  value={values.owner_name}
                  onChange={(e) => setFieldValue("owner_name", e.target.value)}
                  error={touched.owner_name && errors.owner_name}
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
                    setFieldValue("contact_number", e.target.value)
                  }
                  error={touched.contact_number && errors.contact_number}
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
                  error={touched.landmark && errors.landmark}
                />
                <ErrorMessage
                  name="landmark"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  label="Existing Coolers"
                  name="existing_coolers"
                  value={values.existing_coolers}
                  onChange={(e) =>
                    setFieldValue("existing_coolers", e.target.value)
                  }
                  error={touched.existing_coolers && errors.existing_coolers}
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
                  error={
                    touched.outlet_weekly_sale_volume &&
                    errors.outlet_weekly_sale_volume
                  }
                />
                <ErrorMessage
                  name="outlet_weekly_sale_volume"
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
                  error={touched.display_location && errors.display_location}
                />
                <ErrorMessage
                  name="display_location"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  label="Chiller Safety Grill"
                  name="chiller_safty_grill"
                  value={values.chiller_safty_grill}
                  onChange={(e) =>
                    setFieldValue("chiller_safty_grill", e.target.value)
                  }
                  error={
                    touched.chiller_safty_grill && errors.chiller_safty_grill
                  }
                />
                <ErrorMessage
                  name="chiller_safty_grill"
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
                  required
                  label="Warehouse"
                  name="warehouse_id"
                  value={values.warehouse_id.toString()}
                  options={warehouseOptions}
                  onChange={(e) =>
                    setFieldValue("warehouse_id", e.target.value)
                  }
                  error={touched.warehouse_id && errors.warehouse_id}
                />
                <ErrorMessage
                  name="warehouse_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Salesman"
                  name="salesman_id"
                  value={values.salesman_id.toString()}
                  options={salesmanOptions}
                  onChange={(e) => setFieldValue("salesman_id", e.target.value)}
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
                  required
                  label="Outlet"
                  name="outlet_id"
                  value={values.outlet_id.toString()}
                  options={outletOptions}
                  onChange={(e) => setFieldValue("outlet_id", e.target.value)}
                  error={touched.outlet_id && errors.outlet_id}
                />
                <ErrorMessage
                  name="outlet_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Manager Sales Marketing"
                  name="manager_sales_marketing"
                  value={values.manager_sales_marketing.toString()}
                  onChange={(e) =>
                    setFieldValue("manager_sales_marketing", e.target.value)
                  }
                  error={
                    touched.manager_sales_marketing &&
                    errors.manager_sales_marketing
                  }
                />
                <ErrorMessage
                  name="manager_sales_marketing"
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
                  value={values.national_id}
                  onChange={(e) => setFieldValue("national_id", e.target.value)}
                  error={touched.national_id && errors.national_id}
                />
                <ErrorMessage
                  name="national_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              {renderFileInput(
                "outlet_stamp",
                "Outlet Stamp",
                values,
                setFieldValue,
                errors,
                touched,
                "image/*,.pdf"
              )}

              <div>
                <InputFields
                  label="Model"
                  name="model"
                  value={values.model}
                  onChange={(e) => setFieldValue("model", e.target.value)}
                  error={touched.model && errors.model}
                />
                <ErrorMessage
                  name="model"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  label="HIL"
                  name="hil"
                  value={values.hil}
                  onChange={(e) => setFieldValue("hil", e.target.value)}
                  error={touched.hil && errors.hil}
                />
                <ErrorMessage
                  name="hil"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  label="IR Reference No"
                  name="ir_reference_no"
                  value={values.ir_reference_no}
                  onChange={(e) =>
                    setFieldValue("ir_reference_no", e.target.value)
                  }
                  error={touched.ir_reference_no && errors.ir_reference_no}
                />
                <ErrorMessage
                  name="ir_reference_no"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  label="Installation Done By"
                  name="installation_done_by"
                  value={values.installation_done_by}
                  onChange={(e) =>
                    setFieldValue("installation_done_by", e.target.value)
                  }
                  error={
                    touched.installation_done_by && errors.installation_done_by
                  }
                />
                <ErrorMessage
                  name="installation_done_by"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  type="date"
                  label="Date Initial"
                  name="date_lnitial"
                  value={values.date_lnitial}
                  onChange={(e) =>
                    setFieldValue("date_lnitial", e.target.value)
                  }
                  error={touched.date_lnitial && errors.date_lnitial}
                />
                <ErrorMessage
                  name="date_lnitial"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  type="date"
                  label="Date Initial 2"
                  name="date_lnitial2"
                  value={values.date_lnitial2}
                  onChange={(e) =>
                    setFieldValue("date_lnitial2", e.target.value)
                  }
                  error={touched.date_lnitial2 && errors.date_lnitial2}
                />
                <ErrorMessage
                  name="date_lnitial2"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              {renderFileInput(
                "contract_attached",
                "Contract Attached",
                values,
                setFieldValue,
                errors,
                touched
              )}

              <div>
                <InputFields
                  label="Machine Number"
                  name="machine_number"
                  value={values.machine_number}
                  onChange={(e) =>
                    setFieldValue("machine_number", e.target.value)
                  }
                  error={touched.machine_number && errors.machine_number}
                />
                <ErrorMessage
                  name="machine_number"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  label="Brand"
                  name="brand"
                  value={values.brand}
                  onChange={(e) => setFieldValue("brand", e.target.value)}
                  error={touched.brand && errors.brand}
                />
                <ErrorMessage
                  name="brand"
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
                    setFieldValue("asset_number", e.target.value)
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

      case 4:
        return (
          <ContainerCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFileInput(
                "lc_letter",
                "LC Letter",
                values,
                setFieldValue,
                errors,
                touched
              )}

              {renderFileInput(
                "trading_licence",
                "Trading Licence",
                values,
                setFieldValue,
                errors,
                touched
              )}

              {renderFileInput(
                "password_photo",
                "Password Photo",
                values,
                setFieldValue,
                errors,
                touched,
                "image/*"
              )}

              {renderFileInput(
                "outlet_address_proof",
                "Outlet Address Proof",
                values,
                setFieldValue,
                errors,
                touched
              )}

              <div>
                <InputFields
                  label="Chiller Asset Care Manager"
                  name="chiller_asset_care_manager"
                  value={values.chiller_asset_care_manager.toString()}
                  onChange={(e) =>
                    setFieldValue("chiller_asset_care_manager", e.target.value)
                  }
                  error={
                    touched.chiller_asset_care_manager &&
                    errors.chiller_asset_care_manager
                  }
                />
                <ErrorMessage
                  name="chiller_asset_care_manager"
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

              {renderFileInput(
                "password_photo_file",
                "Password Photo File",
                values,
                setFieldValue,
                errors,
                touched,
                "image/*"
              )}

              {renderFileInput(
                "outlet_address_proof_file",
                "Outlet Address Proof File",
                values,
                setFieldValue,
                errors,
                touched
              )}

              {renderFileInput(
                "trading_licence_file",
                "Trading Licence File",
                values,
                setFieldValue,
                errors,
                touched
              )}

              {renderFileInput(
                "lc_letter_file",
                "LC Letter File",
                values,
                setFieldValue,
                errors,
                touched
              )}

              {renderFileInput(
                "outlet_stamp_file",
                "Outlet Stamp File",
                values,
                setFieldValue,
                errors,
                touched,
                "image/*,.pdf"
              )}

              {renderFileInput(
                "sign__customer_file",
                "Customer Signature",
                values,
                setFieldValue,
                errors,
                touched,
                "image/*,.pdf"
              )}

              <div>
                <InputFields
                  label="Chiller Manager ID"
                  name="chiller_manager_id"
                  value={values.chiller_manager_id.toString()}
                  onChange={(e) =>
                    setFieldValue("chiller_manager_id", e.target.value)
                  }
                  error={
                    touched.chiller_manager_id && errors.chiller_manager_id
                  }
                />
                <ErrorMessage
                  name="chiller_manager_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Is Merchandiser"
                  name="is_merchandiser"
                  value={values.is_merchandiser.toString()}
                  onChange={(e) =>
                    setFieldValue("is_merchandiser", e.target.value)
                  }
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                  error={touched.is_merchandiser && errors.is_merchandiser}
                />
                <ErrorMessage
                  name="is_merchandiser"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  required
                  label="Status"
                  name="status"
                  value={values.status.toString()}
                  onChange={(e) => setFieldValue("status", e.target.value)}
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

              <div>
                <InputFields
                  required
                  label="Fridge Status"
                  name="fridge_status"
                  value={values.fridge_status.toString()}
                  onChange={(e) =>
                    setFieldValue("fridge_status", e.target.value)
                  }
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  error={touched.fridge_status && errors.fridge_status}
                />
                <ErrorMessage
                  name="fridge_status"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div>
                <InputFields
                  required
                  label="IRO ID"
                  name="iro_id"
                  value={values.iro_id.toString()}
                  onChange={(e) => setFieldValue("iro_id", e.target.value)}
                  error={touched.iro_id && errors.iro_id}
                />
                <ErrorMessage
                  name="iro_id"
                  component="div"
                  className="text-sm text-red-600 mb-1"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <InputFields
                  label="Remark"
                  name="remark"
                  value={values.remark}
                  onChange={(e) => setFieldValue("remark", e.target.value)}
                  error={touched.remark && errors.remark}
                />
                <ErrorMessage
                  name="remark"
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
            {isEditMode ? "Update Chiller" : "Add New Chiller"}
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
