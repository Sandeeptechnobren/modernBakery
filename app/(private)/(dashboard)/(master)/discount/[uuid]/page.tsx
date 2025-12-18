"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import * as yup from "yup";

import StepperForm, { useStepperForm } from "@/app/components/stepperForm";
import Loading from "@/app/components/Loading";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { addDiscount, updateDiscount, saveFinalCode } from "@/app/services/allApi";

import { useDiscountForm } from "./hooks/useDiscountForm";
import { useDiscountData } from "./hooks/useDiscountData";
import { steps } from "./utils/constants";
import { discountValidationSchema } from "./utils/validation";

import StepKeyCombination from "./components/StepKeyCombination";
import StepKeyValue from "./components/StepKeyValue";
import StepDiscount from "./components/StepDiscount";

export default function AddDiscount() {
  const params = useParams();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  
  const paramsTyped = params as { uuid?: string | string[]; id?: string | string[] } | undefined;
  const rawParam = (paramsTyped?.uuid ?? paramsTyped?.id) as string | string[] | undefined;
  const id = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const isEditMode = id !== undefined && id !== "add" && id !== "";

  // 1. Logic & State Hook
  const {
    keyCombo, setKeyCombo,
    keyValue, setKeyValue,
    discount, setDiscount,
  } = useDiscountForm();

  // 2. Data Fetching Hook
  const {
    companyOptions, regionOptions, warehouseOptions, areaOptions, channelOptions,
    customerCategoryOptions, companyCustomersOptions, itemCategoryOptions, fetchRegionOptions,
    fetchAreaOptions, fetchWarehouseOptions, fetchRouteOptions, fetchCustomerCategoryOptions,
    fetchCompanyCustomersOptions, fetchItemsCategoryWise, discountTypeOptions, salesmanTypeOptions, projectOptions,
    ensureCompanyLoaded, ensureChannelLoaded, ensureItemCategoryLoaded, ensureDiscountTypeLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, ensureItemLoaded
  } = useAllDropdownListData();

  const { loading: dataLoading } = useDiscountData({
    isEditMode, id, setDiscount, setKeyCombo, setKeyValue, fetchItemsCategoryWise
  });

  const [itemOptions, setItemOptions] = useState<any[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 3. Derived Data (Memoized Maps)
  const locationDropdownMap = useMemo(() => ({
    Company: companyOptions,
    Region: regionOptions,
    Warehouse: warehouseOptions,
    Area: areaOptions,
  }), [companyOptions, regionOptions, warehouseOptions, areaOptions]);

  const customerDropdownMap = useMemo(() => ({
    Channel: channelOptions,
    "Customer Category": customerCategoryOptions,
    Customer: companyCustomersOptions,
  }), [channelOptions, customerCategoryOptions, companyCustomersOptions]);

  const itemDropdownMap = useMemo(() => ({
    "Item Category": itemCategoryOptions,
    Item: Array.isArray(itemOptions) ? itemOptions : [],
  }), [itemCategoryOptions, itemOptions]);

  // 4. Effects
  useEffect(() => {
    ensureCompanyLoaded();
    ensureChannelLoaded();
    ensureItemCategoryLoaded();
    ensureDiscountTypeLoaded();
    ensureSalesmanTypeLoaded();
    ensureProjectLoaded();
    ensureItemLoaded();
  }, [ensureCompanyLoaded, ensureChannelLoaded, ensureItemCategoryLoaded, ensureDiscountTypeLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, ensureItemLoaded]);

  useEffect(() => {
    fetchRegionOptions("")
    fetchAreaOptions("");
    fetchWarehouseOptions("");
    fetchRouteOptions("")
    fetchCustomerCategoryOptions("");
    fetchCompanyCustomersOptions("")
  }, [fetchRegionOptions, fetchAreaOptions, fetchWarehouseOptions, fetchRouteOptions, fetchCustomerCategoryOptions, fetchCompanyCustomersOptions])

  // Item Category -> Items
  useEffect(() => {
    async function fetchItemsCategory(itemCategories: string[]) {
      setItemLoading(true);
      try {
        const result = await fetchItemsCategoryWise(itemCategories.toString());
        setItemOptions(result);
      } catch (error) {
        console.warn(error);
      } finally {
        setItemLoading(false);
      }
    }

    const itemCategories = keyValue["Item Category"];
    if (Array.isArray(itemCategories) && itemCategories.length > 0) {
      try {
        fetchItemsCategory(itemCategories ?? []);
      } catch (err) {
        console.error("Failed to fetch item options for category", itemCategories, err);
      }
    } else {
      setItemOptions([]);
    }
  }, [keyValue["Item Category"], fetchItemsCategoryWise]);

  // Filter keyValue["Item"]
  useEffect(() => {
    if (itemLoading) return;
    setKeyValue(prev => {
      const currentSelectedItems = prev["Item"] || [];
      if (currentSelectedItems.length === 0) return prev;
      const validItemIds = new Set(itemOptions.map(opt => String(opt.value)));
      const newSelectedItems = currentSelectedItems.filter(id => validItemIds.has(String(id)));
      if (newSelectedItems.length === currentSelectedItems.length) return prev;
      return { ...prev, "Item": newSelectedItems };
    });
  }, [itemOptions, itemLoading, setKeyValue]);

  // Filter discountItems
  useEffect(() => {
    if (itemLoading || keyCombo.Item !== "Item") return;
    setDiscount(prev => {
      const validValues = new Set(itemOptions.map(o => String(o.value)));
      const hasInvalid = prev.discountItems.some(p => p.key && !validValues.has(String(p.key)));
      if (!hasInvalid) return prev;
      return {
        ...prev,
        discountItems: prev.discountItems.map(p => {
          if (p.key && !validValues.has(String(p.key))) return { ...p, key: "" };
          return p;
        })
      };
    });
  }, [itemOptions, itemLoading, keyCombo.Item, setDiscount]);

  // Sync Discount Items with KeyValue
  useEffect(() => {
    if (discount.scope === "details") {
      const validKeys = discount.discountItems.map(di => di.key).filter(k => k && k.trim() !== "");
      const uniqueKeys = Array.from(new Set(validKeys));

      if (keyCombo.Item === "Item Category") {
        setKeyValue(prev => {
          const current = prev["Item Category"] || [];
          const sortedCurrent = [...current].sort();
          const sortedNew = [...uniqueKeys].sort();
          if (JSON.stringify(sortedCurrent) === JSON.stringify(sortedNew)) return prev;
          return { ...prev, "Item Category": uniqueKeys };
        });
      } else if (keyCombo.Item === "Item") {
        setKeyValue(prev => {
          const current = prev["Item"] || [];
          const sortedCurrent = [...current].sort();
          const sortedNew = [...uniqueKeys].sort();
          if (JSON.stringify(sortedCurrent) === JSON.stringify(sortedNew)) return prev;
          return { ...prev, "Item": uniqueKeys };
        });
      }
    }
  }, [discount.discountItems, discount.scope, keyCombo.Item, setKeyValue]);


  // 5. Validation & Submit
  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);

  const validateStep = (step: number) => {
    if (step === 1) {
      return !!keyCombo.Location && !!keyCombo.Item && !!keyCombo.Customer;
    }
    if (step === 2) {
      let allValid = true;
      if (keyCombo.Location) {
        if (!keyValue[keyCombo.Location] || keyValue[keyCombo.Location].length === 0) allValid = false;
      }
      if (keyCombo.Customer) {
        if (!keyValue[keyCombo.Customer] || keyValue[keyCombo.Customer].length === 0) allValid = false;
      }
      return allValid;
    }
    if (step === 3) {
      // Basic validation for new fields
      if (keyCombo.Item === "Item" && (!keyValue["Item Category"] || keyValue["Item Category"].length === 0)) return false;
      if (!discount.name || !discount.startDate || !discount.endDate || discount.salesTeam.length === 0) return false;
      if (discount.isProjectSpecific && discount.projects.length === 0) return false;
      if (discount.scope === "header" && !discount.headerRate) return false;
      if (discount.scope === "details") {
        if (discount.discountItems.length === 0) return false;
        // Check if every row has a key and a rate
        const allRowsValid = discount.discountItems.every(item => item.key && item.key !== "" && item.rate && item.rate !== "");
        if (!allRowsValid) return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const missing = [];
      if (!keyCombo.Location) missing.push("Location");
      if (!keyCombo.Item) missing.push("Item");
      if (!keyCombo.Customer) missing.push("Customer");
      
      if (missing.length > 0) {
        showSnackbar(`Please select ${missing.join(", ")} before proceeding.`, "warning");
        return;
      }
    } else if (!validateStep(currentStep)) {
      showSnackbar("Please fill in all required fields before proceeding.", "warning");
      return;
    }
    markStepCompleted(currentStep);
    if (!isLastStep) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    // Validate final step
    if (!validateStep(3)) {
       showSnackbar("Please fill in all required fields.", "error");
       return;
    }

    setSubmitLoading(true);
    try {
        const payload = new FormData();
        
        // ... Logic to map new state to payload ...
        // Using placeholder logic for now as API might not support new fields yet
        if (keyCombo.Item === "Item" && keyValue["Item"]?.[0]) payload.append("item_id", keyValue["Item"][0]);
        if (keyCombo.Item === "Item Category" && keyValue["Item Category"]?.[0]) payload.append("category_id", keyValue["Item Category"][0]);
        
        if (keyCombo.Customer === "Customer" && keyValue["Customer"]?.[0]) payload.append("customer_id", keyValue["Customer"][0]);
        if (keyCombo.Customer === "Channel" && keyValue["Channel"]?.[0]) payload.append("customer_channel_id", keyValue["Channel"][0]);
        
        payload.append("discount_code", discount.discount_code);
        // Map new fields to legacy if possible or send as is
        // payload.append("name", discount.name);
        payload.append("start_date", discount.startDate);
        payload.append("end_date", discount.endDate);
        payload.append("status", discount.status);

        let res;
        if (isEditMode && id) {
            res = await updateDiscount(String(id), payload);
        } else {
            res = await addDiscount(payload);
        }

        if (res.error) {
            showSnackbar(res.data?.message || "Failed to submit form", "error");
        } else {
            showSnackbar(
                isEditMode ? "Discount Updated Successfully" : "Discount Created Successfully",
                "success"
            );
            if (!isEditMode) {
                await saveFinalCode({
                    reserved_code: discount.discount_code,
                    model_name: "discounts",
                }).catch(() => { });
            }
            router.push("/discount");
        }

    } catch (err) {
        console.error("Submit error:", err);
        showSnackbar("An error occurred during submission", "error");
    } finally {
        setSubmitLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepKeyCombination keyCombo={keyCombo} setKeyCombo={setKeyCombo} />;
      case 2:
        return (
          <StepKeyValue
            keyCombo={keyCombo}
            keyValue={keyValue}
            setKeyValue={setKeyValue}
            locationDropdownMap={locationDropdownMap}
            customerDropdownMap={customerDropdownMap}
          />
        );
      case 3:
        return (
          <StepDiscount
            discount={discount}
            setDiscount={setDiscount}
            salesmanTypeOptions={salesmanTypeOptions}
            projectOptions={projectOptions}
            keyCombo={keyCombo}
            itemDropdownMap={itemDropdownMap}
            keyValue={keyValue}
            setKeyValue={setKeyValue}
            itemLoading={itemLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {(dataLoading || submitLoading) && <Loading />}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (currentStep > 1) {
              prevStep();
            } else {
              router.push("/discount");
            }
          }}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <Icon icon="lucide:arrow-left" width={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Update Discount" : "Add New Discount"}
        </h1>
      </div>
      <div className="flex justify-between items-center mb-6 pb-6">
        <StepperForm
          steps={steps.map(step => ({ ...step, isCompleted: isStepCompleted(step.id) }))}
          currentStep={currentStep}
          onStepClick={() => { }}
          onBack={prevStep}
          onNext={handleNext}
          onSubmit={handleSubmit}
          showSubmitButton={isLastStep}
          showNextButton={!isLastStep}
          nextButtonText="Save & Next"
          submitButtonText={isEditMode ? "Update" : "Submit"}
        >
          {renderStepContent()}
        </StepperForm>
      </div>
    </>
  );
}