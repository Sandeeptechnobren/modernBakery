"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useState } from "react";
// Define the form state type
interface ItemFormValues {
  itemCode: string;
  itemName: string;
  sapId: string;
  itemDesc: string;
  itemCategory: string;
  itemSubCategory: string;
  itemUpc: string;
  itemUom: string;
  vat: string;
  excise: string;
  itemBasePrice: string;
  exciseCode: string;
  communityCode: string;
  shelfLife: string;
  status: string;
}
import InputFields from "@/app/components/inputFields";

import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import { addItem } from "@/app/services/allApi";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import {useAllDropdownListData} from "@/app/components/contexts/allDropdownListData";

export default function AddItemStepper() {
  const { itemCategoryOptions, itemSubCategoryOptions } = useAllDropdownListData();
  const [isOpen, setIsOpen] = useState(false);
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const steps: StepperStep[] = [
    { id: 1, label: "Item Details" },
    { id: 2, label: "Item Information" },
    { id: 3, label: "Additional Information" },
  ];
  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);

  const [form, setForm] = useState<ItemFormValues>({
    itemCode: "",
    itemName: "",
    sapId: "",
    itemDesc: "",
    itemCategory: "",
    itemSubCategory: "",
    itemUpc: "",
    itemUom: "",
    vat: "",
    excise: "",
    itemBasePrice: "",
    exciseCode: "",
    communityCode: "",
    shelfLife: "",
    status: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ItemFormValues, boolean>>>({});

  const ItemSchema = Yup.object().shape({
    // itemCode: Yup.string().required("Item Code is required"),
    itemName: Yup.string().required("Item Name is required"),
    exciseCode: Yup.string().required("Excise Code is required"),
    communityCode: Yup.string().required("Community Code is required"),
    sapId: Yup.string().required("SAP Id is required"),
    itemCategory: Yup.string().required("Item Category is required"),
    itemSubCategory: Yup.string().required("Item Sub Category is required"),
    itemUpc: Yup.string().required("Item UPC is required"),
    itemUom: Yup.string().required("Item UOM is required"),
    vat: Yup.string().required("Vat is required"),
    excise: Yup.string().required("Excise is required"),
    itemBasePrice: Yup.string().required("Item Base Price is required"),
    status: Yup.string().required("Status is required"),
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as keyof ItemFormValues]: value }));
    setTouched((prev) => ({ ...prev, [name as keyof ItemFormValues]: true }));
  };

  const setFieldValue = (field: keyof ItemFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateCurrentStep = async (step: number) => {
    let fields: (keyof ItemFormValues)[] = [];
    if (step === 1) fields = [ "itemName", "exciseCode","communityCode"];
    if (step === 2) fields = ["itemCategory", "itemSubCategory", "itemUom","itemUpc","vat","excise"];
    if (step === 3) fields = ["status"];
    try {
      await ItemSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const stepErrors: Partial<Record<keyof ItemFormValues, string>> = {};
        if (Array.isArray(err.inner)) {
          err.inner.forEach((validationErr) => {
            const path = validationErr.path as keyof ItemFormValues;
            if (fields.includes(path)) {
              stepErrors[path] = validationErr.message;
            }
          });
        }
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map(f => [f, true])) }));
        return Object.keys(stepErrors).length === 0;
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
      showSnackbar("Please fill in all required fields before proceeding.", "error");
    }
  };

  const handleSubmit = async () => {
    const valid = await validateCurrentStep(currentStep);
    if (!valid) {
      showSnackbar("Please fill in all required fields before submitting.", "error");
      return;
    }
    try {
      const payload = {
        name: form.itemName,
        description: form.itemDesc,
        category_id: form.itemCategory,
        sub_category_id: form.itemSubCategory,
        upc: form.itemUpc,
        uom: form.itemUom,
        vat: form.vat,
        excies: form.excise,
        excise_code: form.exciseCode,
        community_code: form.communityCode,
        shelf_life: form.shelfLife,
        status: form.status === "active" ? 1 : form.status === "inactive" ? 0 : undefined,
      };
      const res = await addItem(payload);
      if (res?.error) {
        showSnackbar(res.message || "Failed to add item", "error");
      } else {
        showSnackbar("Item added successfully", "success");
        router.push("/dashboard/master/item");
      }
    } catch (err) {
      showSnackbar("Add item failed", "error");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Item Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* <div className="flex flex-col items-end gap-2 max-w-[406px]">
                  <div className="w-full">
                    <InputFields required label="Item Code" name="itemCode" value={form.itemCode} onChange={handleChange} error={touched.itemCode && errors.itemCode} />
                    {touched.itemCode && errors.itemCode && (
                      <div className="text-red-500 text-xs mt-1">{errors.itemCode}</div>
                    )}
                  </div>
                   
                  <IconButton bgClass="white" className="mb-2 cursor-pointer text-[#252B37]" icon="mi:settings" onClick={() => setIsOpen(true)} />
                  <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Item Code" />
                </div> */}
                <div className="flex items-end gap-2 max-w-[406px]">
                                  <InputFields
                                      label="Item Code"
                                      name="itemCode"
                                      value={form.itemCode}
                                      onChange={handleChange}
                                  />
                                 
                                  <IconButton
                                      bgClass="white"
                                      className="mb-2 cursor-pointer text-[#252B37]"
                                      icon="mi:settings"
                                      onClick={() => setIsOpen(true)}
                                  />
                  
                                  <SettingPopUp isOpen={isOpen} onClose={() => setIsOpen(false)} title="Item Code" />
                                    
                              </div>
                {/* <div className="flex flex-col">
                  <InputFields required label="SAP Id" name="sapId" value={form.sapId} onChange={handleChange} error={touched.sapId && errors.sapId} />
                  {touched.sapId && errors.sapId && (
                    <div className="text-red-500 text-xs mt-1">{errors.sapId}</div>
                  )}
                </div> */}
                
                <div>
                  <InputFields required label="Excise Code" name="exciseCode" value={form.exciseCode} onChange={handleChange} error={touched.exciseCode && errors.exciseCode}/>
                   {touched.exciseCode && errors.exciseCode && (
                    <div className="text-red-500 text-xs mt-1">{errors.exciseCode}</div>
                  )}
                </div>
                <div>
                  <InputFields required label="Community Code" name="communityCode" value={form.communityCode} onChange={handleChange} error={touched.communityCode && errors.communityCode}/>
                   {touched.communityCode && errors.communityCode && (
                    <div className="text-red-500 text-xs mt-1">{errors.communityCode}</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <InputFields required label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} error={touched.itemName && errors.itemName} />
                  {touched.itemName && errors.itemName && (
                    <div className="text-red-500 text-xs mt-1">{errors.itemName}</div>
                  )}
                </div>
                {/* <div className="flex flex-col">
                  <InputFields required label="Item Base Price" name="itemBasePrice" value={form.itemBasePrice} onChange={handleChange} error={touched.itemBasePrice && errors.itemBasePrice} />
                  {touched.itemBasePrice && errors.itemBasePrice && (
                    <div className="text-red-500 text-xs mt-1">{errors.itemBasePrice}</div>
                  )}
                </div> */}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <InputFields required label="Item Category" name="itemCategory" value={form.itemCategory} onChange={handleChange} error={touched.itemCategory && errors.itemCategory} options={itemCategoryOptions} />
                  {touched.itemCategory && errors.itemCategory && (
                    <div className="text-red-500 text-xs mt-1">{errors.itemCategory}</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <InputFields required label="Item Sub Category" name="itemSubCategory" value={form.itemSubCategory} onChange={handleChange} error={touched.itemSubCategory && errors.itemSubCategory} options={itemSubCategoryOptions} />
                  {touched.itemSubCategory && errors.itemSubCategory && (
                    <div className="text-red-500 text-xs mt-1">{errors.itemSubCategory}</div>
                  )}
                </div>
               
                <div className="flex flex-col">
                  <InputFields required label="Item UOM" name="itemUom" value={form.itemUom} onChange={handleChange} error={touched.itemUom && errors.itemUom} options={[
                    { value: "1", label: "BAG" },
                    { value: "2", label: "PKT" },
                    { value: "3", label: "BOX" },
                    { value: "4", label: "POUCH" },
                    { value: "5", label: "PCH" },
                    { value: "6", label: "TIN" },
                    { value: "7", label: "NUM" },
                    { value: "8", label: "CTN" },
                    { value: "9", label: "BOT" },
                  ]} />
                  {touched.itemUom && errors.itemUom && (
                    <div className="text-red-500 text-xs mt-1">{errors.itemUom}</div>
                  )}
                </div>
                 <div className="flex flex-col">
                  <InputFields required label="Item UPC" name="itemUpc" value={form.itemUpc} onChange={handleChange} error={touched.itemUpc && errors.itemUpc} />
                   {touched.itemUpc && errors.itemUpc && (
                    <div className="text-red-500 text-xs mt-1">{errors.itemUpc}</div>
                  )}
                </div>
                 <div className="flex flex-col">
                  <InputFields required label="Vat" name="vat" value={form.vat} onChange={handleChange} error={touched.vat && errors.vat}/>
                  {touched.vat && errors.vat && (
                    <div className="text-red-500 text-xs mt-1">{errors.vat}</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <InputFields required label="Excise" name="excise" value={form.excise} onChange={handleChange} error={touched.excise && errors.excise}/>
                  {touched.excise && errors.excise && (
                    <div className="text-red-500 text-xs mt-1">{errors.excise}</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <InputFields  label="Shelf Life" name="shelfLife" value={form.shelfLife} onChange={handleChange} />
                </div>
               
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 ">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputFields label="Item Description" name="itemDesc" value={form.itemDesc} onChange={handleChange} />
                </div>
               
                <div className="flex flex-col">
                  <InputFields required label="Status" name="status" value={form.status} onChange={handleChange} error={touched.status && errors.status} options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "In Active" },
                  ]} />
                  {touched.status && errors.status && (
                    <div className="text-red-500 text-xs mt-1">{errors.status}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/master/item">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Add New Item</h1>
        </div>
      </div>
      <StepperForm
        steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
        currentStep={currentStep}
        onStepClick={() => {}}
        onBack={prevStep}
        onNext={handleNext}
        onSubmit={handleSubmit}
        showSubmitButton={isLastStep}
        showNextButton={!isLastStep}
        nextButtonText="Save & Next"
        submitButtonText="Submit"
      >
        {renderStepContent()}
      </StepperForm>
    </>
  );
}