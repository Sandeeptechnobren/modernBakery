"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import InputFields from "@/app/components/inputFields";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import { itemById, addItem, editItem, genearateCode, saveFinalCode } from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Loading from "@/app/components/Loading";

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
  status: string;
}

const ItemSchema = Yup.object().shape({
  // Step 1
  // itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  // ErpCode: Yup.string().required("ERP Code is required"),
  // itemDesc: Yup.string(),
  // // itemImage: Yup.mixed().nullable(),
  // brand: Yup.string(),
  // itemCategory: Yup.string().required("Category is required"),
  // itemSubCategory: Yup.string().required("Sub Category is required"),

  // // Step 2
  // itemWeight: Yup.string(),
  // shelfLife: Yup.string(),
  // volume: Yup.string(),
  // is_Promotional: Yup.string().required("Please select promotional option"),
  // is_tax_applicable: Yup.string().required("Please select tax applicability"),
  // excise: Yup.string(),
  // status: Yup.string().required("Status is required"),

  // // Step 3
  // uom: Yup.string().required("UOM is required"),
  // uomType: Yup.string().required("UOM Type is required"),
  // upc: Yup.string().nullable(),
  // price: Yup.string().nullable(),
  // is_stock_keeping_unit: Yup.string().required("Please select stock keeping option"),
  // enable_for: Yup.string().required("Please select enable for option"),
});

// --- Yup Step-based Validation ---
// const stepSchemas = [
//   // Step 1: Basic Details
//   Yup.object({
//     // itemCode: Yup.string().required("Item Code is required"),
//     itemName: Yup.string().required("Item Name is required"),
//     // ErpCode: Yup.string().required("ERP Code is required"),
//     itemCategory: Yup.string().required("Item Category is required"),
//     itemSubCategory: Yup.string().required("Item Sub Category is required"),
//     itemDesc: Yup.string(),
//     // itemImage: Yup.mixed().nullable(), // optional file
//     brand: Yup.string(),
//   }),

//   // Step 2: Additional Info
//   Yup.object({
//     itemWeight: Yup.string()
//       .matches(/^[0-9]*\.?[0-9]*$/, "Weight must be a valid number")
//       .nullable(),
//     shelfLife: Yup.string(),
//     volume: Yup.string(),
//     is_Promotional: Yup.string().required("Promotional field is required"),
//     is_tax_applicable: Yup.string().required("Tax applicability is required"),
//     excise: Yup.string(),
//     status: Yup.string().required("Status is required"),
//   }),

//   // Step 3: UOM (Unit of Measurement & others)
//   Yup.object({
//     uom: Yup.string().required("UOM is required"),
//     uomType: Yup.string().required("UOM Type is required"),
//     upc: Yup.string(),
//     price: Yup.string()
//       .matches(/^[0-9]*\.?[0-9]*$/, "Price must be a valid number")
//       .required("Price is required"),
//     is_stock_keeping_unit: Yup.string().required("Stock Keeping Unit field is required"),
//     enable_for: Yup.string().required("Enable For field is required"),
//   }),
// ];



export default function AddEditItem() {
  const { itemCategoryOptions, itemSubCategoryOptions } = useAllDropdownListData();
  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id as string | undefined;
  const isEditMode = !!(itemId && itemId !== "add");
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');

  const steps: StepperStep[] = [
    { id: 1, label: "Basic Details" },
    { id: 2, label: "Additional Info" },
    { id: 3, label: "UOM"}
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
    status: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ItemFormValues, boolean>>>({});

  useEffect(() => {
    if (isEditMode && itemId) {
      setLoading(true);
      (async () => {
        const res = await itemById(itemId);
        const data = res?.data ?? res;
        if (!res?.error && data) {
          setForm({
            itemCode: data.code || "",
            itemName: data.name || "",
            ErpCode: data.erp_code || "",
            itemDesc: data.description || "",
            itemImage: data.image || "",
            brand: data.brand || "",
            itemWeight: data.item_weight || "",
            itemCategory: data.category_id || "",
            itemSubCategory: data.sub_category_id || "",
            shelfLife: data.shelf_life || "",
            volume: data.volume || "",
            is_Promotional: data.is_promotional ? "yes" : "no",
            is_tax_applicable: data.is_tax_applicable ? "yes" : "no",
            excise: data.excise || "",
            uom: data.uom || "",
            uomType: data.uomType || "",
            upc: data.upc || "",
            price: data.price || "",
            is_stock_keeping_unit: data.is_stock_keeping_unit ? "yes" : "no",
            enable_for: data.enable_for ? "sales" : "return",
            status: data.status ? "active" : "inactive",
          });
        }
        setLoading(false);
      })();
    } else {
      (async () => {
        const res = await genearateCode({ model_name: "items" });
        if (res?.code) setForm((prev) => ({ ...prev, itemCode: res.code }));
        if (res?.prefix) setPrefix(res.prefix);
      })();
    }
  }, [isEditMode, itemId]);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateCurrentStep = async (step: number) => {
    const fields: Record<number, (keyof ItemFormValues)[]> = {
      1: ["itemCode", "itemName", "ErpCode", "itemCategory", "itemSubCategory"],
      2: ["status"],
    };

    try {
      await ItemSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const stepErrors: Partial<Record<keyof ItemFormValues, string>> = {};
        err.inner.forEach((e) => {
          const path = e.path as keyof ItemFormValues;
          if (fields[step].includes(path)) stepErrors[path] = e.message;
        });
        setErrors(stepErrors);
        return false;
      }
      return false;
    }
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (valid) {
      markStepCompleted(currentStep);
      nextStep();
    } else {
      showSnackbar("Please fill all required fields.", "error");
    }
  };

  const handleSubmit = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (!valid) return showSnackbar("Please fill required fields before submit.", "error");

    const payload = { ...form };
    const res = isEditMode ? await editItem(itemId, payload) : await addItem(payload);
    if (res?.error) showSnackbar(res.message || "Action failed", "error");
    else {
      showSnackbar(isEditMode ? "Item updated" : "Item added", "success");
      router.push("/dashboard/master/item");
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
                  disabled={codeMode === 'auto'}
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
                      title="Item Code"
                      prefix={prefix}
                      setPrefix={setPrefix}
                      onSave={(mode, code) => {
                        setCodeMode(mode);
                        if (mode === 'auto' && code) {
                          setForm((prev) => ({ ...prev, itemCode: code }));
                        } else if (mode === 'manual') {
                          setForm((prev) => ({ ...prev, itemCode: '' }));
                        }
                      }}
                    />
                  </>
                )}
              </div>

              <InputFields required label="ERP Code" name="ErpCode" value={form.ErpCode} onChange={handleChange} />
              <InputFields required label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} />
              <InputFields label="Item Description" name="itemDesc" value={form.itemDesc} onChange={handleChange} />
              <InputFields label="Brand" name="brand" value={form.brand} onChange={handleChange} />
              <InputFields label="Item Image" type="file" name="itemImage" value={form.itemImage} onChange={handleChange} />
              <InputFields required label="Category" name="itemCategory" value={form.itemCategory} onChange={handleChange} options={itemCategoryOptions} />
              <InputFields required label="Sub Category" name="itemSubCategory" value={form.itemSubCategory} onChange={handleChange} options={itemSubCategoryOptions} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium mb-4">Additional Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <InputFields label="Item Weight" name="itemWeight" value={form.itemWeight} onChange={handleChange} />
              <InputFields label="Shelf Life" name="shelfLife" value={form.shelfLife} onChange={handleChange} />
              <InputFields label="Volume" name="volume" value={form.volume} onChange={handleChange} />
              <InputFields type="radio" label="Is Promotional" name="is_Promotional" value={form.is_Promotional} onChange={handleChange}
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
              <InputFields type="radio" label="Tax Applicable" name="is_tax_applicable" value={form.is_tax_applicable} onChange={handleChange}
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
              <InputFields label="Excise" name="excise" value={form.excise} onChange={handleChange} />
              <InputFields required type="radio" label="Status" name="status" value={form.status} onChange={handleChange}
                options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
            </div>
          </div>
        );
        case 3: 
        return(
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium mb-4">UOM & Pricing</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <InputFields required label="UOM" name="uom" value={form.uom} onChange={handleChange} />
              <InputFields required label="UOM Type" name="uomType" value={form.uomType} onChange={handleChange} />
              <InputFields label="UPC" name="upc" value={form.upc} onChange={handleChange} />
              <InputFields label="Price" name="price" value={form.price} onChange={handleChange} />
              <InputFields required type="radio" label="Is Stock Keeping Unit" name="is_stock_keeping_unit" value={form.is_stock_keeping_unit} onChange={handleChange}
                options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
              <InputFields required type="radio" label="Enable For" name="enable_for" value={form.enable_for} onChange={handleChange}
                options={[{ value: "sales", label: "Sales" }, { value: "return", label: "Return" }]} />
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
          <Link href="/dashboard/master/item">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{isEditMode ? "Edit Item" : "Add Item"}</h1>
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
