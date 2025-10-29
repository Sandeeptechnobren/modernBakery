"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  itemById,
  addItem,
  editItem,
  genearateCode,
} from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Loading from "@/app/components/Loading";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import CustomCheckbox from "@/app/components/customCheckbox";
import Table from "@/app/components/customTable";
import ContainerCard from '../../../../../components/containerCard';
import { useLoading } from "@/app/services/loadingContext";

interface ItemFormValues {
  itemCode: string;
  itemName: string;
  ErpCode: string;
  itemDesc: string;
  itemImage: string;
  brand: string;
  itemWeight: string;
  itemCategory: string;
  itemSubCategory: string;
  shelfLife: string;
  volume: string;
  is_Promotional: string;
  is_tax_applicable: string;
  excise: string;
  uom: string;
  uomType: string;
  upc: string;
  price: string;
  is_stock_keeping_unit: string;
  enable_for: string;
  commodity_goods_code: string;
  excise_duty_code: string;
  status: string;
}

const ItemSchema = Yup.object().shape({
  itemName: Yup.string().required("Item Name is required"),
  itemCategory: Yup.string().required("Category is required"),
  itemDesc: Yup.string().required("Category is required"),
  brand: Yup.string().required("Brand is required"),
  itemSubCategory: Yup.string().required("Sub Category is required"),
  itemWeight: Yup.number().typeError("Item Weight must be a number").nullable(),
  shelfLife: Yup.number().typeError("Shelf Life must be a number").nullable(),
  volume: Yup.number().typeError("Volume must be a number").nullable(),
  is_Promotional: Yup.string().required("Select if Promotional"),
  is_tax_applicable: Yup.string().required("Select if Tax Applicable"),
  excise: Yup.string().required("Excise is required"),
  
  status: Yup.string().required("Status is required"),
  uoms: Yup.array()
    .of(
      Yup.object().shape({
        uom: Yup.string().required("UOM is required"),
        uomType: Yup.string().required("UOM Type is required"),
        price: Yup.number()
          .typeError("Price must be a number")
          .required("Price is required"),
        upc: Yup.string().required("UPC is required"),
        isStockKeepingUnit: Yup.string().oneOf(
          ["yes", "no"],
          "Select Yes or No"
        ),
        enableFor: Yup.string().required("Enable For is required"),
      })
    )
    .min(1, "At least one UOM must be added"),
  commodity_goods_code: Yup.string(),
  excise_duty_code: Yup.string(),
});

const StepSchemas = [
  // Step 1: Basic Details
  Yup.object().shape({
    itemName: Yup.string().required("Item Name is required"),
    itemCategory: Yup.string().required("Category is required"),
    itemSubCategory: Yup.string().required("Sub Category is required"),
    itemDesc: Yup.string().required("Description is required"),
    brand: Yup.string().required("Brand is required"),
  }),
  // Step 2: Additional Info
  Yup.object().shape({
    itemWeight: Yup.number()
      .typeError("Item Weight must be a number")
      .nullable(),
    shelfLife: Yup.number().typeError("Shelf Life must be a number").nullable(),
    volume: Yup.number().typeError("Volume must be a number").nullable(),
    is_Promotional: Yup.string().required("Select if Promotional"),
    is_tax_applicable: Yup.string().required("Select if Tax Applicable"),
    excise: Yup.string().required("Excise is required"),
    commodity_goods_code: Yup.string(),
    excise_duty_code: Yup.string(),
    status: Yup.string().required("Status is required"),
  }),
  // Step 3: UOM
  Yup.object().shape({
    uoms: Yup.array()
      .of(
        Yup.object().shape({
          uom: Yup.string().required("UOM is required"),
          uomType: Yup.string().required("UOM Type is required"),
          price: Yup.number()
            .typeError("Price must be a number")
            .required("Price is required"),
          upc: Yup.string().required("UPC is required"),
          isStockKeepingUnit: Yup.string().oneOf(
            ["yes", "no"],
            "Select Yes or No"
          ),
          enableFor: Yup.string().required("Enable For is required"),
        })
      )
      .min(1, "At least one UOM must be added"),
  }),
];

export default function AddEditItem() {
  const {
    itemCategoryOptions,
    itemSubCategoryOptions,
    fetchItemSubCategoryOptions,
  } = useAllDropdownListData();
  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const {loading, setLoading} = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const itemId = params?.id as string | undefined;
  const isEditMode = !!(itemId && itemId !== "add");
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [skeleton, setSkeleton] = useState({
          itemSubCategory: false,
      });

  const steps: StepperStep[] = [
    { id: 1, label: "Basic Details" },
    { id: 2, label: "Additional Info" },
    { id: 3, label: "UOM" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  const [form, setForm] = useState<ItemFormValues>({
    itemCode: "",
    itemName: "",
    ErpCode: "",
    itemDesc: "",
    itemImage: "",
    brand: "",
    itemWeight: "",
    itemCategory: "",
    itemSubCategory: "",
    shelfLife: "",
    volume: "",
    is_Promotional: "",
    is_tax_applicable: "",
    excise: "",
    uom: "",
    uomType: "",
    upc: "",
    price: "",
    is_stock_keeping_unit: "",
    enable_for: "",
    commodity_goods_code: "",
    excise_duty_code: "",
    status: "active", // Default to 'active'
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ItemFormValues, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof ItemFormValues, boolean>>
  >({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);

  useEffect(() => {
    if (form.itemCategory) {
      setSubCategoryLoading(true);
      setSkeleton({ ...skeleton, itemSubCategory: true });
      fetchItemSubCategoryOptions(form.itemCategory)
      .then(() => {
        setSubCategoryLoading(false);
        setSkeleton({ ...skeleton, itemSubCategory: false });
        })
        .catch(() => {
          setSubCategoryLoading(false);
        });
    }
    
  }, [form.itemCategory]);

  useEffect(() => {
    if (isEditMode && itemId) {
      setLoading(true);
      (async () => {
        setLoading(true);
        const res = await itemById(itemId);
        const data = res?.data ?? res;
        setLoading(false);
        if (!res?.error && data) {
          const primaryUom = Array.isArray(data.uom) ? data.uom[0] : null;

          setForm({
            itemCode: data.item_code || "",
            itemName: data.name || "",
            ErpCode: data.erp_code || "",
            itemDesc: data.description || "",
            itemImage: data.image || "",
            brand: data.brand || "",
            itemWeight: data.item_weight?.toString() || "",
            itemCategory: data.category?.id?.toString() || "",
            itemSubCategory: data.itemSubCategory?.id?.toString() || "",
            shelfLife: data.shelf_life?.toString() || "",
            volume: data.volume?.toString() || "",
            is_Promotional: data.is_promotional ? "yes" : "no",
            is_tax_applicable: data.is_taxable ? "yes" : "no",
            excise: data.has_excies ? "yes" : "no", 
            uom: data.uom?.[0]?.name || "",
            uomType: data.uom?.[0]?.uom_type || "primary",
            upc: data.uom?.[0]?.upc || "",
            price: data.uom?.[0]?.price?.toString() || "",
            is_stock_keeping_unit: data.uom?.[0]?.is_stock_keeping
              ? "yes"
              : "no",
            enable_for:
              typeof data.uom?.[0]?.enable_for === "string"
                ? data.uom[0].enable_for
                : Array.isArray(data.uom?.[0]?.enable_for)
                ? data.uom[0].enable_for.join(", ")
                : "",
            commodity_goods_code: data.commodity_goods_code || "",
            excise_duty_code: data.excise_duty_code || "",
            status: data.status === 1 ? "active" : "inactive", 
          });

          interface UomItem {
            id: number;
            item_id: number;
            uom_type: string;
            name: string;
            price: string;
            is_stock_keeping: boolean | number;
            upc?: string | null;
            enable_for: string | string[];
          }

          // Prefill UOM table
          if (Array.isArray(data.uom)) {
            setUomList(
              data.uom.map((u: UomItem) => ({
                uom: u.name || "",
                uomType: u.uom_type || "primary",
                upc: u.upc || "",
                price: u.price?.toString() || "",
                isStockKeepingUnit: u.is_stock_keeping ? "yes" : "no",
                enableFor:
                  typeof u.enable_for === "string"
                    ? u.enable_for
                    : u.enable_for.join(", "),
              }))
            );
          }
        }
        setLoading(false);
      })();
    } else {
      (async () => {
        setLoading(true);
        const res = await genearateCode({ model_name: "items" });
        if (res?.code) setForm((prev) => ({ ...prev, itemCode: res.code }));
        setLoading(false);
        if (res?.prefix) setPrefix(res.prefix);
      })();
    }
  }, [isEditMode, itemId]);

  // ------------------ UOM State ------------------
  interface UomRow {
    uom: string;
    uomType: string;
    upc: string;
    price: string;
    isStockKeepingUnit: string;
    quantity?: string;
    enableFor: string;
  }

  const [uomList, setUomList] = useState<UomRow[]>([]);
  const [uomData, setUomData] = useState<UomRow>({
    uom: "",
    uomType: "",
    upc: "",
    price: "",
    isStockKeepingUnit: "no",
    quantity: "",
    enableFor: "",
  });

  const handleUomChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUom = () => {
    

    if (editingIndex !== null) {
      // Update existing UOM
      setUomList((prev) => {
        const updated = [...prev];
        updated[editingIndex] = uomData;
        return updated;
      });
      setEditingIndex(null); // Reset editing
      showSnackbar("UOM updated successfully", "success");
    } else {
      // Add new UOM
      setUomList((prev) => [...prev, uomData]);
      showSnackbar("UOM added successfully", "success");
    }

     

    // Reset input fields
    setUomData({
      uom: "",
      uomType: "",
      upc: "",
      price: "",
      isStockKeepingUnit: "no",
      quantity: "",
      enableFor: "",
    });
  };

  const handleEditUom = (index: number) => {
    const u = uomList[index];
    setUomData(u);
    setEditingIndex(index);
  };

  const handleDeleteUom = (index: number) => {
    setUomList((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null); // Reset if deleting the one being edited
    showSnackbar("UOM deleted successfully", "success");
  };

  // ------------------ Form Handlers ------------------
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
  setTouched((prev) => ({ ...prev, [name]: true }));
};

  const validateCurrentStep = async (step: number) => {
    try {
      await StepSchemas[step - 1].validate(form, { abortEarly: false }); 
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const stepErrors: Partial<Record<keyof ItemFormValues, string>> = {};
        const newTouched: Partial<Record<keyof ItemFormValues, boolean>> = {};
        err.inner.forEach((e) => {
          if (e.path) {
            stepErrors[e.path as keyof ItemFormValues] = e.message;
            newTouched[e.path as keyof ItemFormValues] = true;
          }
        });
        setErrors(stepErrors);
        setTouched((prev) => ({ ...prev, ...newTouched }));
        return false;
      }
      return false;
    }
  };

  const handleCheckboxChange = (value: string, isChecked: boolean) => {
    const selected = (uomData.enableFor || "").split(",").filter(Boolean);

    const updated = isChecked
      ? [...new Set([...selected, value])]
      : selected.filter((v) => v !== value);

    setUomData({
      ...uomData,
      enableFor: updated.join(","),
    });
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (valid) {
      markStepCompleted(currentStep);
      nextStep();
    } 
  };

  const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0] || null;

};


  const handleSubmit = async () => {
  setLoading(true);

 const mappedUoms = uomList.map((u) => ({
  "uom": u.uom,
  "uom_type": u.uomType || "primary",
  "price": parseFloat(u.price),
  "upc": u.upc || null,
  "is_stock_keeping": u.isStockKeepingUnit === "yes" ? 1 : 0,
  "keeping_quantity": u.isStockKeepingUnit === "yes" ? parseFloat(u.quantity || "0") : undefined,
  "enable_for": u.enableFor || "sales",
}));


  try {
const payload = {
  code: form.itemCode,
  erp_code: form.ErpCode,
  name: form.itemName,
  description: form.itemDesc,
  brand: form.brand,
  category_id: form.itemCategory,
  sub_category_id: form.itemSubCategory,
  item_weight: form.itemWeight || "0",
  shelf_life: form.shelfLife || "0",
  volume: form.volume || "0",
  is_promotional: form.is_Promotional === "yes" ? "1" : "0",
  is_taxable: form.is_tax_applicable === "yes" ? "1" : "0",
  has_excies: form.excise === "yes" ? "1" : "0",
  status: form.status === "active" ? "1" : "0",
  commodity_goods_code: form.commodity_goods_code,
  excise_duty_code: form.excise_duty_code,
  uoms: mappedUoms 
};

    const itemId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

const res = isEditMode
  ? await editItem(itemId, payload)
  : await addItem(payload);
    if (res?.status === "success" || res?.success) {
      showSnackbar(
        isEditMode ? "Item updated successfully!" : "Item created successfully!",
        "success"
      );
      router.push("/item");
    } else {
      //  console.error("Error:", res);
      throw new Error(res?.data?.message || "Something went wrong");
    }

  } catch (error: unknown) {
 

  if (error instanceof Error) {
    showSnackbar(error.message || "Failed to submit form", "error");
  } else if (typeof error === "string") {
    showSnackbar(error, "error");
  } else {
    showSnackbar("Failed to submit form", "error");
  }
} finally {
    setLoading(false);
  }
};

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Basic Details</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-end gap-2 max-w-[406px]">
                <InputFields
                  required
                  label="Item Code"
                  name="itemCode"
                  value={form.itemCode}
                  onChange={handleChange}
                  disabled={codeMode === "auto"}
                />
                {/* {!isEditMode && (
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
                      title="Item Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === "auto" && code) {
                          setForm((prev) => ({ ...prev, itemCode: code }));
                        } else if (mode === "manual") {
                          setForm((prev) => ({ ...prev, itemCode: "" }));
                        }
                      }}
                    />
                  </>
                )} */}
              </div>

              <div>
                <InputFields
                  required
                  label="ERP Code"
                  name="ErpCode"
                  value={form.ErpCode}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Item Name"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  error={touched.itemName && errors.itemName}
                />
                {touched.itemName && errors.itemName && (
                  <p className="text-red-500 text-sm mt-1">{errors.itemName}</p>
                )}
              </div>
              <div>
                <InputFields
                required
                  label="Item Description"
                  name="itemDesc"
                  value={form.itemDesc}
                  onChange={handleChange}
                  error={touched.itemDesc && errors.itemDesc}
                />
                {touched.itemDesc && errors.itemDesc && (
                  <p className="text-red-500 text-sm mt-1">{errors.itemDesc}</p>
                )}
              </div>
              <div>
                <InputFields
                required
                  label="Brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  error={touched.brand && errors.brand}
                />
                {touched.brand && errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
              </div>
              <div>
                <InputFields
                  
                  label="Item Image"
                  value={form.itemImage}
                  type="file"
                  name="itemImage"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Category"
                  name="itemCategory"
                  value={form.itemCategory}
                  onChange={handleChange}
                  options={itemCategoryOptions}
                  error={touched.itemCategory && errors.itemCategory}
                />
                {touched.itemCategory && errors.itemCategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.itemCategory}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Sub Category"
                  showSkeleton={skeleton.itemSubCategory}
                  name="itemSubCategory"
                  value={form.itemSubCategory}
                  onChange={handleChange}
                  options={
                    loading
                      ? [{ value: "", label: "Loading..." }]
                      : itemSubCategoryOptions &&
                        itemSubCategoryOptions.length > 0
                      ? itemSubCategoryOptions
                      : [{ value: "", label: "No options available" }]
                  }
                  error={touched.itemSubCategory && errors.itemSubCategory}
                />
                {touched.itemSubCategory && errors.itemSubCategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.itemSubCategory}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium mb-4">Additional Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Item Weight"
                  type="number"
                  name="itemWeight"
                  value={form.itemWeight}
                  onChange={handleChange}
                  error={touched.itemWeight && errors.itemWeight}
                />
                {touched.itemWeight && errors.itemWeight && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.itemWeight}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  label="Shelf Life (Months)"
                  type="number"
                  name="shelfLife"
                  value={form.shelfLife}
                  onChange={handleChange}
                  error={touched.shelfLife && errors.shelfLife}
                />
                {touched.shelfLife && errors.shelfLife && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.shelfLife}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  type="number"
                  label="Volume"
                  name="volume"
                  value={form.volume}
                  onChange={handleChange}
                  error={touched.volume && errors.volume}
                />
                {touched.volume && errors.volume && (
                  <p className="text-red-500 text-sm mt-1">{errors.volume}</p>
                )}
              </div>
              <div>
                <InputFields
                
                  required
                  type="number"
                  label="Excise"
                  name="excise"
                  value={form.excise}
                  onChange={handleChange}
                />
                {errors.excise && (
                  <p className="text-red-500 text-sm mt-1">{errors.excise}</p>
                )}
              </div>
              <div>
                <InputFields
                required
                  label="Commodity Goods Code"
                  name="commodity_goods_code"
                  value={form.commodity_goods_code}
                  onChange={handleChange}
                  error={
                    touched.commodity_goods_code && errors.commodity_goods_code
                  }
                />
                {touched.commodity_goods_code && errors.commodity_goods_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.commodity_goods_code}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                required
                  label="Excise Duty Code"
                  name="excise_duty_code"
                  value={form.excise_duty_code}
                  onChange={handleChange}
                  error={touched.excise_duty_code && errors.excise_duty_code}
                />
                {touched.excise_duty_code && errors.excise_duty_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.excise_duty_code}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Is Promotional"
                  name="is_Promotional"
                  value={form.is_Promotional}
                  onChange={handleChange}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                {errors.is_Promotional && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.is_Promotional}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Tax Applicable"
                  name="is_tax_applicable"
                  value={form.is_tax_applicable}
                  onChange={handleChange}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                {errors.is_tax_applicable && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.is_tax_applicable}
                  </p>
                )}
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl shadow ">
            {/* Left: Add UOM Form */}
            <ContainerCard className="h-[100%] w-1/4" margin="0" >
               <div >
              <h2 className="text-xl font-bold mb-4">Add UOM</h2>
              {/* Use 2 columns in grid here */}
              <div className="grid grid-cols-2 gap-4">
                <InputFields
                  required
                  label="UOM"
                  name="uom"
                  value={uomData.uom}
                  options={[
                    { label: "Pieces", value: "pieces" },
                    { label: "Cartoon", value: "cartoon" },
                  ]}
                  onChange={handleUomChange}
                  error={touched.uom && errors.uom}
                  // Make full width inside grid cell
                />
                <InputFields
                  required
                  label="Type"
                  name="uomType"
                  value={uomData.uomType}
                  options={[
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                    { label: "Third", value: "third" },
                    { label: "Forth", value: "forth" },
                  ]}
                  onChange={handleUomChange}
                  error={touched.uomType && errors.uomType}
                />
                {/* Add all other inputs also with className="w-full" */}
                <InputFields
                  required
                  label="UPC"
                  type="number"
                  name="upc"
                  value={uomData.upc}
                  onChange={handleUomChange}
                  error={touched.upc && errors.upc}
                  placeholder="Enter UPC"
                />
                <InputFields
                  required
                  label="Price"
                  type="number"
                  name="price"
                  value={uomData.price}
                  onChange={handleUomChange}
                  error={touched.price && errors.price}
                  placeholder="e.g. 500.00"
                />

                <div>
                  <InputFields
                    type="radio"
                    label="Is Stock Keeping Unit"
                    name="isStockKeepingUnit"
                    value={uomData.isStockKeepingUnit}
                    onChange={handleUomChange}
                    options={[
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ]}
                  />
                </div>
                {uomData.isStockKeepingUnit === "yes" && (
                  <div>
                    <InputFields
                    type="number"
                      label="Quantity"
                      name="quantity"
                      value={uomData.quantity || ""}
                      onChange={handleUomChange}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  
                  <CustomCheckbox
                    id="enable_for_sales"
                    label="Sales"
                    checked={uomData.enableFor?.split(",").includes("sales")}
                    onChange={(e) =>
                      handleCheckboxChange("sales", e.target.checked)
                    }
                  />
                  <CustomCheckbox
                    id="enable_for_return"
                    label="Return"
                    checked={uomData.enableFor?.split(",").includes("return")}
                    onChange={(e) =>
                      handleCheckboxChange("return", e.target.checked)
                    }
                  />
                </div>

                <div className="col-span-2 mt-2">
                  <SidebarBtn
                    label="Add"
                    isActive={true}
                    leadingIcon="mdi:check"
                    type="button"
                    onClick={handleAddUom}
                  />
                </div>
              </div>
            </div>
            </ContainerCard>
           
            
            {/* Right: UOM List */}
            <div className="flex-1 w-full p-6">
              <h2 className="text-xl font-bold mb-4">UOM List</h2>
              <Table
                data={uomList.map((row, idx) => ({
                  ...row,
                  idx: idx.toString(),
                }))}
                config={{
                  columns: [
                    { key: "uom", label: "UOM" },
                    { key: "uomType", label: "UOM Type" },
                    { key: "upc", label: "UPC" },
                    { key: "price", label: "Price", width: 80 },
                    {
                      key: "isStockKeepingUnit",
                      label: "Stock Keeping",
                      width: 120,
                    },
                    { key: "quantity", label: "Quantity" },
                    { key: "enableFor", label: "Enable For", width: 120 },
                    {
                      key: "action",
                      label: "Action",
                      width: 100,
                      render: (row) => (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditUom(parseInt(row.idx))}
                          >
                            <Icon icon="lucide:edit-2" className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUom(parseInt(row.idx))}
                          >
                            <Icon icon="lucide:trash" className="w-5 h-5" />
                          </button>
                        </div>
                      ),
                    },
                  ],
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isEditMode && loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/item">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Item" : "Add Item"}
          </h1>
        </div>
      </div>

      <StepperForm
        steps={steps.map((s) => ({ ...s, isCompleted: isStepCompleted(s.id) }))}
        currentStep={currentStep}
        onBack={prevStep}
        onNext={handleNext}
        onSubmit={handleSubmit}
        showNextButton={!isLastStep}
        showSubmitButton={isLastStep}
        nextButtonText="Next"
        submitButtonText={isEditMode ? "Update" : "Submit"}
      >
        {renderStepContent()}
      </StepperForm>
    </>
  );
}
