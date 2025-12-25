"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ImagePreviewModal from "@/app/components/ImagePreviewModal";
import { useRouter, useParams } from "next/navigation";
import InputFields from "@/app/components/inputFields";
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
  itemSubCategoryList,
} from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import CustomCheckbox from "@/app/components/customCheckbox";
import Table from "@/app/components/customTable";
import ContainerCard from '../../../../../components/containerCard';
import { useLoading } from "@/app/services/loadingContext";
import { Formik, FormikErrors, FormikHelpers, FormikTouched } from "formik";
import { getBrand } from "@/app/services/settingsAPI";

interface ItemFormValues {
  itemCode: string;
  itemName: string;
  ErpCode: string;
  itemDesc: string;
  itemImage: string | File | null;
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
  quantity: string;
  is_stock_keeping_unit: string;
  enable_for: string;
  caps_promotion: string;
  commodity_goods_code: string;
  excise_duty_code: string;
  status: string;
}

const ItemSchema = Yup.object().shape({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  itemCategory: Yup.string().required("Category is required"),
  itemDesc: Yup.string().required("Category is required"),
  ErpCode: Yup.string().required("ERP Code is required"),
  brand: Yup.string().required("Brand is required"),
  itemSubCategory: Yup.string().required("Sub Category is required"),
  itemWeight: Yup.number().typeError("Item Weight must be a number"),
  shelfLife: Yup.number().required("Shelf Life is required"),
  volume: Yup.number().required("Volume is required"),
  is_Promotional: Yup.string().required("Select if Promotional"),
  is_tax_applicable: Yup.string().required("Select if Tax Applicable"),
  excise: Yup.string().required("Excise is required"),
  caps_promotion: Yup.string().required("Caps Promotion is required"),
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
  commodity_goods_code: Yup.string().required("Commodity Goods Code is required"),
  excise_duty_code: Yup.string(),
});

const StepSchemas = [
  ItemSchema.pick([
    "itemCode",
    "ErpCode",
    "itemName",
    "itemCategory",
    "itemSubCategory",
    "itemDesc",
    "brand"
  ]),
  ItemSchema.pick([
    "itemWeight",
    "shelfLife",
    "volume",
    "excise",
    "caps_promotion",
    "is_Promotional",
    "is_tax_applicable",
    "status",
    "commodity_goods_code",
  ]),
  ItemSchema.pick([
    "uoms"
  ])
];

export default function AddEditItem() {
  const { itemCategoryOptions,itemCategoryAllOptions, uomOptions, ensureItemCategoryLoaded, ensureUomLoaded,ensureAllItemCategoryLoaded } = useAllDropdownListData();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();

  const itemId = params?.id as string | undefined;
  const isEditMode = !!(itemId && itemId !== "add");
  const [skeleton, setSkeleton] = useState({
    itemSubCategory: false,
  });

  // Load dropdown data
  useEffect(() => {
    ensureItemCategoryLoaded();
    ensureUomLoaded();
    if(isEditMode){
    ensureAllItemCategoryLoaded();
    // console.log("ensured all item category loaded",itemCategoryAllOptions);
    }
  }, [ensureItemCategoryLoaded, ensureUomLoaded,ensureAllItemCategoryLoaded]);

  const steps: StepperStep[] = [
    { id: 1, label: "Basic Details" },
    { id: 2, label: "Additional Info" },
    { id: 3, label: "UOM" },
  ];

  const { currentStep, nextStep, prevStep, markStepCompleted, isStepCompleted, isLastStep } = useStepperForm(steps.length);

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
    quantity: "",
    is_stock_keeping_unit: "",
    caps_promotion: "",
    enable_for: "",
    commodity_goods_code: "",
    excise_duty_code: "",
    status: "active"
  });

  // for item Image
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const ALLOWED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    // "image/webp",
    // "image/svg+xml",
  ];
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB

  const [errors, setErrors] = useState<
    Partial<Record<keyof ItemFormValues, string>>
  >({});

  const [touched, setTouched] = useState<
    Partial<Record<keyof ItemFormValues, boolean>>
  >({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [filteredSubCategoryOptions, setFilteredSubCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [brandOptions, setBrandOptions] = useState<{ label: string; value: string }[]>([]);

  const fetchBrandOptions = async (searchTerm: string) => {
    setLoading(true);
    const res = await getBrand({ dropdown: "true" });
    setLoading(false);
    if (res.error) {
      showSnackbar("Failed to fetch brands", "error");
      throw new Error("Failed to fetch brands");
    }
    // ensure option values are strings so they match Formik string values
    const options = res.data.map((brand: any) => ({ label: brand.name, value: String(brand.id) }));
    setBrandOptions(options);
  }

  const fetchSubCategory = async (categoryId: string) => {
    setSkeleton({ ...skeleton, itemSubCategory: true });
    let res;
    if(!isEditMode){ res = await itemSubCategoryList({ category_id: categoryId, dropdown: "true" });}
    else{
       res = await itemSubCategoryList({ category_id: categoryId });
    }
    if (res.error) {
      showSnackbar("Failed to fetch sub categories", "error");
      throw new Error("Failed to fetch sub categories");
    }
    const options = res.data.map((subCategory: any) => ({ label: subCategory.sub_category_name, value: String(subCategory.id) }));
    setFilteredSubCategoryOptions(options);
    setSkeleton({ ...skeleton, itemSubCategory: false });
  }
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

  const handleUomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  useEffect(() => {
    fetchBrandOptions("");
    if (isEditMode && itemId) {
      setLoading(true);
      (async () => {
        setLoading(true);
        const res = await itemById(itemId);
        const data = res?.data ?? res;
        setLoading(false);
        if (!res?.error && data) {
          const primaryUom = Array.isArray(data.uom) ? data.uom[0] : (Array.isArray(data.item_uoms) ? data.item_uoms[0] : null);

          // normalize brand and uom-related prefills
          const normalizedBrand = data?.brand && typeof data.brand === 'object' ? String(data.brand.id ?? data.brand) : (data.brand ? String(data.brand) : "");

          // normalize first UOM values (data may provide uom or item_uoms with varying keys)
          const firstUom = primaryUom;
          const firstUomName = firstUom ? (firstUom.uom ?? firstUom.name ?? firstUom.uom_name ?? "") : "";
          const firstUomType = firstUom ? (firstUom.uom_type ?? firstUom.uomType ?? "primary") : "primary";
          const firstUomUpc = firstUom ? (firstUom.upc ?? firstUom.upc_code ?? "") : "";
          const firstUomPrice = firstUom ? ((firstUom.price ?? firstUom.uom_price ?? firstUom.uomPrice) !== undefined ? String(firstUom.price ?? firstUom.uom_price ?? firstUom.uomPrice) : "") : "";
          const firstUomQty = firstUom ? (firstUom.keeping_quantity ?? firstUom.keepingQuantity ?? "") : "";
          const firstUomIsStock = firstUom ? (firstUom.is_stock_keeping === true || firstUom.is_stock_keeping === 1 || firstUom.isStockKeeping === true || firstUom.is_stock_keeping === '1') : false;
          const firstUomEnableFor = firstUom ? (typeof firstUom.enable_for === 'string' ? firstUom.enable_for : Array.isArray(firstUom.enable_for) ? firstUom.enable_for.join(',') : (firstUom.enableFor && (Array.isArray(firstUom.enableFor) ? firstUom.enableFor.join(',') : String(firstUom.enableFor)))) : "";

          setForm({
            itemCode: data.item_code || "",
            itemName: data.name || "",
            ErpCode: data.erp_code || "",
            itemDesc: data.description || "",
            itemImage: data.image || "",
            brand: normalizedBrand,
            itemWeight: data.item_weight?.toString() || "",
            itemCategory: data.item_category?.id?.toString() || "",
            itemSubCategory: data.item_sub_category?.id?.toString() || "",
            shelfLife: data.shelf_life?.toString() || "",
            volume: data.volume?.toString() || "",
            is_Promotional: data.is_promotional ? "yes" : "no",
            is_tax_applicable: data.is_taxable ? "yes" : "no",
            excise: data.has_excies == true ? "1" : "0",
            caps_promotion: data.caps_promotion == true ? "1" : "0",
            uom: firstUomName || "",
            uomType: firstUomType || "primary",
            upc: firstUomUpc || "",
            price: firstUomPrice || "",
            quantity: firstUomQty ? String(firstUomQty) : "",
            is_stock_keeping_unit: firstUomIsStock ? "yes" : "no",
            enable_for: firstUomEnableFor || "",
            commodity_goods_code: data.commodity_goods_code || "",
            excise_duty_code: data.excise_duty_code || "",
            status: data.status === 1 ? "active" : "inactive",
          });

          // ensure sub-category options are loaded for the selected category so the select shows the current value
          try {
            const categoryId = data.item_category?.id ? String(data.item_category.id) : (data.item_category ? String(data.item_category) : null);
            if (categoryId) await fetchSubCategory(categoryId);
          } catch (e) {
            // ignore
          }

          // if editing and there's an existing image URL, show preview
          if (data.image && typeof data.image === "string") {
            setImagePreview(data.image as string);
          }

          interface UomItem {
            id: number;
            item_id: number;
            uom_type: string;
            name: string;
            price: string;
            is_stock_keeping: boolean | number;
            upc?: string | null;
            enable_for: string | string[];
            keeping_quantity?: number;
          }

          // Prefill UOM table - support both `data.uom` and `data.item_uoms` and different key names
          const uomSource = Array.isArray(data.uom) ? data.uom : (Array.isArray(data.item_uoms) ? data.item_uoms : []);
          if (Array.isArray(uomSource) && uomSource.length > 0) {
            setUomList(
              uomSource.map((u: any) => ({
                uom: String(u.uom ?? u.name ?? u.uom_name ?? ""),
                uomType: (u.uom_type ?? u.uomType ?? "primary") as string,
                upc: (u.upc ?? u.upc_code ?? "") as string,
                quantity: (u.keeping_quantity !== undefined ? String(u.keeping_quantity) : (u.keepingQuantity !== undefined ? String(u.keepingQuantity) : "")) as string,
                price: (u.price ?? u.uom_price ?? u.uomPrice) !== undefined ? String(u.price ?? u.uom_price ?? u.uomPrice) : "",
                isStockKeepingUnit: (u.is_stock_keeping === true || u.is_stock_keeping === 1 || u.isStockKeeping === true) ? "yes" : "no",
                enableFor: typeof u.enable_for === 'string' ? u.enable_for : (Array.isArray(u.enable_for) ? u.enable_for.join(',') : (u.enableFor && (Array.isArray(u.enableFor) ? u.enableFor.join(',') : String(u.enableFor))))
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
      })();
    }
  }, [isEditMode, itemId]);
  // console.log(uomList, "uomlist")

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

  // const handleNext = async () => {
  //   const valid = await validateCurrentStep(currentStep);
  //   if (valid) {
  //     setErrors({});
  //     setTouched({});
  //     markStepCompleted(currentStep);
  //     nextStep();
  //   }
  // };

  const handleSubmit = async (
    values: ItemFormValues,
    { setSubmitting, setErrors, setTouched, setFieldValue }: FormikHelpers<ItemFormValues>
  ) => {
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
        code: values.itemCode,
        erp_code: values.ErpCode,
        name: values.itemName,
        description: values.itemDesc,
        image: values.itemImage,
        brand: values.brand,
        category_id: values.itemCategory,
        sub_category_id: values.itemSubCategory,
        item_weight: values.itemWeight || "0",
        shelf_life: values.shelfLife || "0",
        volume: values.volume || "0",
        is_promotional: values.is_Promotional === "yes" ? "1" : "0",
        is_taxable: values.is_tax_applicable === "yes" ? "1" : "0",
        has_excies: values.excise === "true" ? "1" : "0",
        caps_promotion: values.caps_promotion === "true" ? "1" : "0",
        status: values.status === "active" ? "1" : "0",
        commodity_goods_code: values.commodity_goods_code,
        excise_duty_code: values.excise_duty_code,
        uoms: mappedUoms
      };

      const itemId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

      const reqType: "json" | "form-data" = values.itemImage instanceof File ? "form-data" : "json";
      // console.log("Submitting payload with request type:", reqType);
      const res = isEditMode
        ? await editItem(itemId, payload, reqType)
        : await addItem(payload, reqType);
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
    }
  };

  const renderStepContent = (
    values: ItemFormValues,
    setFieldValue: (
      field: keyof ItemFormValues,
      value: string | File,
      shouldValidate?: boolean
    ) => void,
    errors: FormikErrors<ItemFormValues>,
    touched: FormikTouched<ItemFormValues>,
    submitCount: number
  ) => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Basic Details</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <InputFields
                  required
                  label="Item Code"
                  name="itemCode"
                  value={values.itemCode}
                  onChange={(e) => setFieldValue("itemCode", e.target.value)}
                  disabled={true}
                  error={touched.itemCode && errors.itemCode}
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
                  value={values.ErpCode}
                  onChange={(e) => setFieldValue("ErpCode", e.target.value)}
                  error={touched.ErpCode && errors.ErpCode}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Item Name"
                  name="itemName"
                  value={values.itemName}
                  onChange={(e) => setFieldValue("itemName", e.target.value)}
                  error={touched.itemName && errors.itemName}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Item Description"
                  name="itemDesc"
                  value={values.itemDesc}
                  onChange={(e) => setFieldValue("itemDesc", e.target.value)}
                  error={touched.itemDesc && errors.itemDesc}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Brand"
                  name="brand"
                  value={values.brand}
                  options={brandOptions}
                  disabled={brandOptions.length === 0}
                  onChange={(e) => setFieldValue("brand", e.target.value)}
                  error={touched.brand && errors.brand}
                />
              </div>
              <div className="relative">
                <InputFields
                  label="Item Image"
                  value={typeof values.itemImage === 'string' ? values.itemImage : ''}
                  type="file"
                  name="itemImage"
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    const file = target.files?.[0] || null;
                    setImageError(null);
                    if (file) {
                      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                        setImageError('Unsupported file type. Please upload png or jpeg');
                        // setForm((prev) => ({ ...prev, itemImage: null }));
                        setFieldValue("itemImage", "");
                        setImagePreview(null);
                        return;
                      }
                      if (file.size > MAX_IMAGE_SIZE) {
                        setImageError('File too large. Maximum size is 1MB.');
                        // setForm((prev) => ({ ...prev, itemImage: null }));
                        setFieldValue("itemImage", "");
                        setImagePreview(null);
                        return;
                      }

                      // setForm((prev) => ({ ...prev, itemImage: file }));
                      setFieldValue("itemImage", file);
                      try {
                        if (imagePreview && imagePreview.startsWith('blob:')) {
                          try { URL.revokeObjectURL(imagePreview); } catch (e) { /* ignore */ }
                        }
                        setImagePreview(URL.createObjectURL(file));
                      } catch (err) {
                        setImagePreview(null);
                      }
                    } else {
                      // setForm((prev) => ({ ...prev, itemImage: null }));
                      setFieldValue("itemImage", "");
                      setImagePreview(null);
                    }
                  }}
                  error={touched.itemImage && errors.itemImage}
                />

                {/* view icon at top-right when image exists */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute right-1 xl:right-12 top-0 p-1 hover:text-blue-600 hover:cursor-pointer"
                    aria-label="View image"
                  >
                    <div className="flex items-center gap-[2px]">
                      <span className="text-[10px]">View Image</span>
                      <Icon icon="mdi:eye" width={18} />
                    </div>
                  </button>
                )}

                {imageError && <div className="text-xs text-red-500 mt-1">{imageError}</div>}
              </div>
              <div>
                <InputFields
                  required
                  label="Category"
                  name="itemCategory"
                  value={values.itemCategory}
                  onChange={(e) => {
                    setFieldValue("itemCategory", e.target.value);
                    fetchSubCategory(e.target.value);
                  }}
                  options={isEditMode ? itemCategoryAllOptions : itemCategoryOptions}
                  error={touched.itemCategory && errors.itemCategory}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Sub Category"
                  showSkeleton={skeleton.itemSubCategory}
                  name="itemSubCategory"
                  value={values.itemSubCategory}
                  onChange={(e) => setFieldValue("itemSubCategory", e.target.value)}
                  options={filteredSubCategoryOptions}
                  disabled={filteredSubCategoryOptions.length === 0 }
                  error={touched.itemSubCategory && errors.itemSubCategory}
                />
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
                  label="Item Weight (Litres)"
                  type="number"
                  name="itemWeight"
                  min={0}
                  step={0.01}
                  value={values.itemWeight}
                  onChange={(e) => setFieldValue("itemWeight", e.target.value)}
                  error={touched.itemWeight && errors.itemWeight}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Shelf Life (Months)"
                  type="number"
                  name="shelfLife"
                  min={0}
                  integerOnly={true}
                  value={values.shelfLife}
                  onChange={(e) => setFieldValue("shelfLife", e.target.value)}
                  error={touched.shelfLife && errors.shelfLife}
                />
              </div>
              <div>
                <InputFields
                  required
                  type="number"
                  label="Volume"
                  name="volume"
                  min={0}
                  step={0.01}
                  value={values.volume}
                  onChange={(e) => setFieldValue("volume", e.target.value)}
                  error={touched.volume && errors.volume}
                />
              </div>
              <div>
                <InputFields
                  type="radio"
                  required
                  label="Excise"
                  name="excise"
                  value={values.excise}
                  onChange={(e) => setFieldValue("excise", e.target.value)}
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                  error={touched.excise && errors.excise}
                />
              </div>
              <div>
                <InputFields
                  type="radio"
                  required
                  label="Caps Promotion"
                  name="caps_promotion"
                  value={values.caps_promotion}
                  onChange={(e) => setFieldValue("caps_promotion", e.target.value)}
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" },
                  ]}
                  error={touched.caps_promotion && errors.caps_promotion}
                />
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Is Promotional"
                  name="is_Promotional"
                  value={values.is_Promotional}
                  onChange={(e) => setFieldValue("is_Promotional", e.target.value)}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  error={touched.is_Promotional && errors.is_Promotional}
                />
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Tax Applicable"
                  name="is_tax_applicable"
                  value={values.is_tax_applicable}
                  onChange={(e) => setFieldValue("is_tax_applicable", e.target.value)}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                  error={touched.is_tax_applicable && errors.is_tax_applicable}
                />
              </div>
              <div>
                <InputFields
                  required
                  type="radio"
                  label="Status"
                  name="status"
                  value={values.status}
                  onChange={(e) => setFieldValue("status", e.target.value)}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  error={touched.status && errors.status}
                />
              </div>
            </div>
            <hr className="my-5 text-gray-300" />

            <div>
              <h2 className="text-lg font-medium mb-4">EFRIS Configuration</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <InputFields
                    required
                    label="Commodity Goods Code"
                    name="commodity_goods_code"
                    value={values.commodity_goods_code}
                    onChange={(e) => setFieldValue("commodity_goods_code", e.target.value)}
                    error={touched.commodity_goods_code && errors.commodity_goods_code}
                  />
                </div>
                <div>
                  <InputFields
                    label="Excise Duty Code"
                    name="excise_duty_code"
                    value={values.excise_duty_code}
                    onChange={(e) => setFieldValue("excise_duty_code", e.target.value)}
                    error={touched.excise_duty_code && errors.excise_duty_code}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col xl:flex-row gap-6 bg-white rounded-2xl shadow ">
            {/* Left: Add UOM Form */}
            <ContainerCard className="h-[100%] w-full xl:w-5/12" margin="0" >
              <div >
                <h2 className="text-xl font-bold mb-4">Add UOM</h2>
                {/* Use 2 columns in grid here */}
                <div className="grid grid-cols-2 gap-4">
                  <InputFields
                    required
                    label="UOM"
                    name="uom"
                    value={uomData.uom}
                    options={uomOptions}
                    onChange={handleUomChange}
                    error={touched.uom && errors.uom}
                  />
                  <InputFields
                    required
                    label="Type"
                    name="uomType"
                    value={uomData.uomType}
                    options={[
                      { label: "Primary", value: "primary" },
                      { label: "Secondary", value: "secondary" }
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
                    min={1}
                    integerOnly={true}
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
                    min={0}
                    step={0.01}
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
                  {uomData.isStockKeepingUnit === "yes" ? (
                    <div>
                      <InputFields
                        type="number"
                        label="Quantity"
                        name="quantity"
                        min={0}
                        integerOnly={true}
                        value={uomData.quantity || ""}
                        onChange={handleUomChange}
                        error={touched.quantity && errors.quantity}
                      />
                    </div>
                  ) : <div></div>}

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
            <div className="w-full xl:w-7/12 p-6">
              <h2 className="text-xl font-bold mb-4">UOM List</h2>
              <Table
                data={uomList.map((row, idx) => {
                  // console.log(row, "row")
                  return ({ ...row, idx: idx.toString() })
                })}
                config={{
                  showNestedLoading: false,
                  columns: [
                    {
                      key: "uom", label: "UOM", render: (row) => {
                        return (<span>{uomOptions.map((uom, index) => {
                          if (uom.value == row.uom) {
                            return (<span key={index}>{uom.label}</span>)
                          }
                        })}</span>)
                      }
                    },
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

  return (
    <>
      <div>
        <div className="flex items-center gap-4">
          <Link href="/item">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mb-[4px]">
            {isEditMode ? "Update Item" : "Add Item"}
          </h1>
        </div>
        <Formik
          enableReinitialize
          initialValues={form}
          validationSchema={ItemSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            setFieldValue,
            errors,
            touched,
            setTouched,
            handleSubmit: formikSubmit,
            isSubmitting,
            submitCount,
          }) => {
            // console.log("Formik errors:", errors);
            // console.log("Formik Values:", values);
            // console.log("Formik Values:", errors);
            const handleNextStep = async () => {
              try {
                const schema = StepSchemas[currentStep - 1];
                if (!schema) return;

                await schema.validate(values, { abortEarly: false });

                markStepCompleted(currentStep);
                nextStep();
              } catch (err: unknown) {
                if (err instanceof Yup.ValidationError) {
                  // mark all fields in this step as touched so errors show
                  try {
                    const schema = StepSchemas[currentStep - 1];
                    const fieldNames = schema && (schema as any).fields ? Object.keys((schema as any).fields) : [];
                    const formTouched: Record<string, boolean> = {};
                    fieldNames.forEach((f: string) => { formTouched[f] = true; });
                    // also mark specific errored paths as touched if available
                    if (err.inner && err.inner.length) {
                      err.inner.forEach((validationError: Yup.ValidationError) => {
                        if (validationError.path) formTouched[validationError.path] = true;
                      });
                    }
                    setTouched({ ...touched, ...formTouched });
                  } catch (e) {
                    // fallback: mark nothing explicit, but preserve previous behavior
                    if (err.inner) {
                      const formTouched: Record<string, boolean> = {};
                      err.inner.forEach((validationError: Yup.ValidationError) => {
                        if (validationError.path) formTouched[validationError.path] = true;
                      });
                      setTouched({ ...touched, ...formTouched });
                    }
                  }

                  // try {
                  //   if (err?.name === "ValidationError" && Array.isArray(err?.errors)) {
                  //     // Yup validation error
                  //     console.error("Yup ValidationError:", err);
                  //     const message = (err.errors || []).join(". ");
                  //     showSnackbar(message || "Validation failed, please check your inputs", "error");
                  //   } else if (err instanceof Error) {
                  //     console.error("Error:", err);
                  //     showSnackbar(err.message || "An unexpected error occurred", "error");
                  //   } else {
                  //     console.error("Unexpected error:", err);
                  //     const serialized = typeof err === "string" ? err : JSON.stringify(err, Object.getOwnPropertyNames(err));
                  //     showSnackbar(serialized || "An unexpected error occurred", "error");
                  //   }
                  // } catch (e) {
                  //   console.error("Error while handling submit error:", e, "original:", err);
                  //   showSnackbar("An unexpected error occurred", "error");
                  // }
                }
              }
            };

            return (
              <>
                <StepperForm
                  steps={steps.map((s) => ({ ...s, isCompleted: isStepCompleted(s.id) }))}
                  currentStep={currentStep}
                  onBack={prevStep}
                  onNext={handleNextStep}
                  onSubmit={formikSubmit}
                  showNextButton={!isLastStep}
                  showSubmitButton={isLastStep}
                  nextButtonText="Next"
                  submitButtonText={isEditMode ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Submitting..." : "Submit")}
                >
                  {renderStepContent(values, setFieldValue, errors, touched, submitCount)}
                </StepperForm>
                <ImagePreviewModal
                  images={imagePreview ? [imagePreview] : []}
                  isOpen={isImageModalOpen}
                  onClose={() => setIsImageModalOpen(false)}
                />
              </>
            )
          }}
        </Formik>

      </div>
    </>
  );
}
