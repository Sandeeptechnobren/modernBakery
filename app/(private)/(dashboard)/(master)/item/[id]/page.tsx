"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputFields from "@/app/components/inputFields";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import { itemById, addItem, editItem, genearateCode } from "@/app/services/allApi";
import * as Yup from "yup";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Loading from "@/app/components/Loading";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

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
});

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
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");

  const steps: StepperStep[] = [
    { id: 1, label: "Basic Details" },
    { id: 2, label: "Additional Info" },
    { id: 3, label: "UOM" },
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
    { id: 4, label: "EFRIS" },
=======
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
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
    status: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ItemFormValues, boolean>>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx

=======
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
  // ---------- Fetch/Edit or Generate Code ----------
  useEffect(() => {
    if (isEditMode && itemId) {
      setLoading(true);
      (async () => {
        const res = await itemById(itemId);
        const data = res?.data ?? res;
        if (!res?.error && data) {
          const primaryUom = Array.isArray(data.uom) ? data.uom[0] : null;

          setForm({
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
  itemCode: data.item_code || "",
  itemName: data.name || "",
  ErpCode: data.erp_code || "",
  itemDesc: data.description || "",
  itemImage: data.image || "",
  brand: data.brand || "",
  itemWeight: data.item_weight?.toString() || "",
  // ✅ FIXED — use nested object IDs
  itemCategory: data.category?.id?.toString() || "",
  itemSubCategory: data.itemSubCategory?.id?.toString() || "",
  shelfLife: data.shelf_life?.toString() || "",
  volume: data.volume?.toString() || "",
  is_Promotional: data.is_promotional ? "yes" : "no",
  is_tax_applicable: data.is_taxable ? "yes" : "no",
  excise: data.has_excies ? "yes" : "no", // ✅ derive from boolean
  uom: data.uom?.[0]?.name || "",
  uomType: data.uom?.[0]?.uom_type || "primary",
  upc: data.uom?.[0]?.upc || "",
  price: data.uom?.[0]?.price?.toString() || "",
  is_stock_keeping_unit: data.uom?.[0]?.is_stock_keeping ? "yes" : "no",
  enable_for:
    typeof data.uom?.[0]?.enable_for === "string"
      ? data.uom[0].enable_for
      : Array.isArray(data.uom?.[0]?.enable_for)
      ? data.uom[0].enable_for.join(", ")
      : "",
  commodity_goods_code: data.commodity_goods_code || "",
  excise_duty_code: data.excise_duty_code || "",
  status: data.status === 1 ? "active" : "inactive", // ✅ 0/1 mapped correctly
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
    enableFor: typeof u.enable_for === "string" ? u.enable_for : u.enable_for.join(", "),
  }))
);

          }
=======
            itemCode: data.code || "",
            itemName: data.name || "",
            ErpCode: data.erp_code || "",
            itemDesc: data.description || "",
            itemImage: "", // keep file null
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
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
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

  // ------------------ UOM State ------------------
  interface UomRow {
    uom: string;
    uomType: string;
    upc: string;
    price: string;
    isStockKeepingUnit: string;
    quantity?: string;
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
    enableFor: string;
=======
    enableFor: string[];
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
  }

  const [uomList, setUomList] = useState<UomRow[]>([]);
  const [uomData, setUomData] = useState<UomRow>({
    uom: "",
    uomType: "",
    upc: "",
    price: "",
    isStockKeepingUnit: "no",
    quantity: "",
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
    enableFor: "",
=======
    enableFor: [],
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
  });

  const handleUomChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
    const { name, value } = e.target;
    setUomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUom = () => {
  if (!uomData.uom || !uomData.upc || !uomData.price) {
    showSnackbar("Please fill all required UOM fields", "error");
    return;
  }

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
=======
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setUomData((prev) => ({
        ...prev,
        enableFor: checked
          ? [...prev.enableFor, value]
          : prev.enableFor.filter((v) => v !== value),
      }));
    } else {
      setUomData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddUom = () => {
    if (!uomData.uom || !uomData.upc || !uomData.price) {
      showSnackbar("Please fill all required UOM fields", "error");
      return;
    }

    setUomList((prev) => [...prev, uomData]);

    // Reset
    setUomData({
      uom: "",
      uomType: "",
      upc: "",
      price: "",
      isStockKeepingUnit: "no",
      quantity: "",
      enableFor: [],
    });
    showSnackbar("UOM added successfully", "success");
  };
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx

  // ------------------ Form Handlers ------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setForm((prev) => ({ ...prev, [e.target.name]: file }));
  // };

  const validateCurrentStep = async (step: number) => {
    try {
      await ItemSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const stepErrors: Partial<Record<keyof ItemFormValues, string>> = {};
        err.inner.forEach((e) => {
          if (e.path) stepErrors[e.path as keyof ItemFormValues] = e.message;
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

<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
   const mappedUoms = uomList.map((u) => ({
  uom: u.uom,
  uom_type: u.uomType || "primary",
  price: parseFloat(u.price),
  upc: u.upc || null,
  is_stock_keeping: u.isStockKeepingUnit === "yes" ? 1 : 0,
  keeping_quantity:
    u.isStockKeepingUnit === "yes" ? parseFloat(u.quantity || "0") : undefined,
  enable_for: u.enableFor || "sales",
}));


    const payload = {
      code: form.itemCode,
      erp_code: form.ErpCode,
      name: form.itemName,
      description: form.itemDesc,
      image: form.itemImage || 1, // Replace with uploaded image ID if applicable
      brand: form.brand,
      category_id: parseInt(form.itemCategory),
      sub_category_id: parseInt(form.itemSubCategory),
      item_weight: parseFloat(form.itemWeight || "0"),
      shelf_life: parseInt(form.shelfLife || "0"),
      volume: parseFloat(form.volume || "0"),
      is_promotional: form.is_Promotional === "yes" ? 1 : 0,
      is_taxable: form.is_tax_applicable === "yes" ? 1 : 0,
      has_excies: form.excise ? 1 : 0,
      status: form.status === "active" ? 1 : 0,
      commodity_goods_code: form.commodity_goods_code,
      excise_duty_code: form.excise_duty_code,
      uoms: mappedUoms,
    };

    try {
      const res = isEditMode
        ? await editItem(itemId, payload)
        : await addItem(payload);

      if (res?.error) {
        showSnackbar(res.message || "Action failed", "error");
      } else {
        showSnackbar(isEditMode ? "Item updated" : "Item added", "success");
        router.push("/dashboard/master/item");
      }
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message || "Something went wrong", "error");
      } else {
        showSnackbar("Unexpected error occurred", "error");
      }
    }
  };


=======
    const payload = { ...form, uomList };
    const res = isEditMode ? await editItem(itemId, payload) : await addItem(payload);
    if (res?.error) showSnackbar(res.message || "Action failed", "error");
    else {
      showSnackbar(isEditMode ? "Item updated" : "Item added", "success");
      router.push("/dashboard/master/item");
    }
  };

>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
  // ------------------ Render Steps ------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Basic Details</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2 max-w-[406px]">
                <InputFields
                  required
                  label="Item Code"
                  name="itemCode"
                  value={form.itemCode}
                  onChange={handleChange}
                  disabled={codeMode === "auto"}
                />
                {!isEditMode && (
                  <>
                    <IconButton
                      bgClass="white"
                       className="  cursor-pointer text-[#252B37] pt-12"
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
                )}
              </div>

              <InputFields required label="ERP Code" name="ErpCode" value={form.ErpCode} onChange={handleChange} />
              <InputFields required label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} />
              <InputFields label="Item Description" name="itemDesc" value={form.itemDesc} onChange={handleChange} />
              <InputFields label="Brand" name="brand" value={form.brand} onChange={handleChange} />
              <InputFields
                label="Item Image"
                value={form.itemImage}
                type="file"
                name="itemImage"
                onChange={handleChange}
              />
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
        return (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium mb-4">UOM</h2>

            <div className="grid md:grid-cols-3 gap-4">
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
              <InputFields required label="UOM" name="uom" value={uomData.uom} options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]} onChange={handleUomChange} />
              <InputFields label="UOM Type" name="uomType" options={[
                { label: "Primary", value: "primary" },
                { label: "Secondary", value: "secondary" },
              ]} value={uomData.uomType} onChange={handleUomChange} />
=======
              <InputFields required label="UOM" name="uom" value={uomData.uom} onChange={handleUomChange} />
              <InputFields label="UOM Type" name="uomType" value={uomData.uomType} onChange={handleUomChange} />
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
              <InputFields required label="UPC" name="upc" value={uomData.upc} onChange={handleUomChange} />
              <InputFields required label="Price" name="price" value={uomData.price} onChange={handleUomChange} />
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
              {uomData.isStockKeepingUnit === "yes" && (
                <InputFields
                  label="Quantity"
                  name="quantity"
                  value={uomData.quantity || ""}
                  onChange={handleUomChange}
                />
              )}
              <InputFields
                type="radio"
                label="Enable For"
                name="enableFor"
                onChange={handleUomChange}
                options={[
                  { label: "Sales", value: "sales" },
                  { label: "Return", value: "return" },
                ]}
              />
<<<<<<< HEAD:app/(private)/dashboard/master/item/[id]/page.tsx
            </div>

            <div className="mt-4 flex justify-end">
              <SidebarBtn
                label="Add"
                isActive={true}
                leadingIcon="mdi:check"
                type="button"
                onClick={handleAddUom}
              />
            </div>

            {uomList.length > 0 && (
  <div className="mt-6 overflow-x-auto rounded-xl ">
    <table className="min-w-full px-5 border border-[#FAFAFA] text-[#535862] rounded-lg">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">UOM</th>
          <th className="p-2 text-left">UOM Type</th>
          <th className="p-2 text-left">UPC</th>
          <th className="p-2 text-left">Price</th>
          <th className="p-2 text-left">Stock Keeping Unit</th>
          <th className="p-2 text-left">Quantity</th>
          <th className="p-2 text-left">Enable For</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {uomList.map((item, idx) => (
          <tr
            key={idx}
            className={`border-t ${editingIndex === idx ? "bg-red-100" : ""}`} // Highlight in red
          >
            <td className="p-2">{item.uom}</td>
            <td className="p-2">{item.uomType}</td>
            <td className="p-2">{item.upc}</td>
            <td className="p-2">{item.price}</td>
            <td className="p-2">{item.isStockKeepingUnit}</td>
            <td className="p-2">{item.quantity || "-"}</td>
            <td className="p-2">{item.enableFor}</td>
            <td className="p-2 flex gap-2">
              <SidebarBtn
                isActive={false}
                leadingIcon="mdi:pencil"
                type="button"
                onClick={() => handleEditUom(idx)}
              />
              <SidebarBtn
                isActive={false}
                leadingIcon="mdi:delete"
                type="button"
                onClick={() => handleDeleteUom(idx)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium mb-4">Additional Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <InputFields
                label="Commodity Goods Code"
                name="commodity_goods_code"
                value={form.commodity_goods_code}
                onChange={handleChange}
              />
              <InputFields
                label="Excise Duty Code"
                name="excise_duty_code"
                value={form.excise_duty_code}
                onChange={handleChange}
              />

=======
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/[id]/page.tsx
            </div>

            <div className="mt-4 flex justify-end">
              <SidebarBtn
                label="Add"
                isActive={true}
                leadingIcon="mdi:check"
                type="button"
                onClick={handleAddUom}
              />
            </div>

            {uomList.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">UOM</th>
                      <th className="p-2 text-left">UPC</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Stock Keeping Unit</th>
                      <th className="p-2 text-left">Quantity</th>
                      <th className="p-2 text-left">UOM Type</th>
                      <th className="p-2 text-left">Enable For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uomList.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{item.uom}</td>
                        <td className="p-2">{item.upc}</td>
                        <td className="p-2">{item.price}</td>
                        <td className="p-2">{item.isStockKeepingUnit}</td>
                        <td className="p-2">{item.quantity || "-"}</td>
                        <td className="p-2">{item.uomType}</td>
                        <td className="p-2">{item.enableFor.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
