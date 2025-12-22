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
import { addPromotionHeader, editPromotionHeader } from "@/app/services/allApi";

import { usePromotionForm } from "./hooks/usePromotionForm";
import { usePromotionData } from "./hooks/usePromotionData";
import { steps } from "./utils/constants";
import { pricingValidationSchema } from "./utils/validation";
import { OfferItemType } from "./types";

import StepKeyCombination from "./components/StepKeyCombination";
import StepKeyValue from "./components/StepKeyValue";
import StepPromotion from "./components/StepPromotion";

export default function AddPricing() {
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
    promotion, setPromotion,
    selectedUom, setSelectedUom,
    orderTables, setOrderTables,
    offerItems, setOfferItems,
    percentageDiscounts, setPercentageDiscounts,
    updateOrderItem, updateOfferItem, selectItemForOffer
  } = usePromotionForm();

  // 2. Data Fetching Hook (Dropdowns & Edit Data)
  const {
    companyOptions, regionOptions, warehouseOptions, uomOptions, areaOptions, channelOptions,
    customerCategoryOptions, companyCustomersOptions, itemCategoryOptions, fetchRegionOptions,
    fetchAreaOptions, fetchWarehouseOptions, fetchRouteOptions, fetchCustomerCategoryOptions,
    fetchCompanyCustomersOptions, fetchItemsCategoryWise, salesmanTypeOptions, projectOptions,
    ensureCompanyLoaded, ensureChannelLoaded, ensureItemCategoryLoaded, ensureSalesmanTypeLoaded,
    ensureProjectLoaded, ensureUomLoaded
  } = useAllDropdownListData();

  const { loading: dataLoading } = usePromotionData({
    isEditMode, id, setPromotion, setKeyCombo, setKeyValue,
    setPercentageDiscounts, setSelectedUom, setOrderTables, setOfferItems, fetchItemsCategoryWise, router
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
    ensureSalesmanTypeLoaded();
    ensureProjectLoaded();
    ensureUomLoaded();
  }, [ensureCompanyLoaded, ensureChannelLoaded, ensureItemCategoryLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, ensureUomLoaded]);

  // Cascading Dropdown Effects
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

  // Filter offerItems
  useEffect(() => {
    if (itemLoading) return;
    setOfferItems((prevOrTables: any) => {
      const tables = (Array.isArray(prevOrTables) && prevOrTables.length > 0 && Array.isArray(prevOrTables[0]))
        ? prevOrTables as OfferItemType[][]
        : [prevOrTables as unknown as OfferItemType[]];

      const validItemValues = new Set(itemOptions.map(opt => opt.value));
      return tables.map(table =>
        table.map(row => {
          const codes = Array.isArray(row.itemCode) ? row.itemCode : (row.itemCode ? [String(row.itemCode)] : []);
          if (codes.length === 0 || (codes.length === 1 && codes[0] === "")) return row;
          const isInvalid = codes.some(c => !validItemValues.has(c));
          if (isInvalid) return { ...row, itemCode: "" };
          return row;
        })
      );
    });
  }, [itemOptions, itemLoading, setOfferItems]);

  // Filter percentageDiscounts
  useEffect(() => {
    if (itemLoading || keyCombo.Item !== "Item") return;
    setPercentageDiscounts(prev => {
      const validValues = new Set(itemOptions.map(o => String(o.value)));
      const hasInvalid = prev.some(p => p.key && !validValues.has(p.key));
      if (!hasInvalid) return prev;
      return prev.map(p => {
        if (p.key && !validValues.has(p.key)) return { ...p, key: "" };
        return p;
      });
    });
  }, [itemOptions, itemLoading, keyCombo.Item, setPercentageDiscounts]);

  // Prefill orderTables/offerItems category
  useEffect(() => {
    const itemCategories = keyValue["Item Category"];
    if (Array.isArray(itemCategories) && itemCategories.length > 0) {
      const firstCat = itemCategories[0];
      setOrderTables(tables => tables.map(table => table.map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat }))));
      setOfferItems(prev => {
        const p: any = prev;
        if (Array.isArray(p) && p.length > 0 && Array.isArray(p[0])) {
          const next = (p as any[][]).map(arr => arr.map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat })));
          return next as unknown as OfferItemType[][];
        }
        return [(p as any[]).map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat }))] as OfferItemType[][];
      });
    }
  }, [keyValue["Item Category"], setOrderTables, setOfferItems]);

  // Sync Bundle/Type
  useEffect(() => {
    if (promotion.bundle_combination !== "slab" && promotion.promotionType !== "") {
      setPromotion(s => ({ ...s, promotionType: "" }));
    }
  }, [promotion.bundle_combination, promotion.promotionType, setPromotion]);

  // Sync Percentage Discounts
  useEffect(() => {
    if (promotion.promotionType === "percentage" || promotion.bundle_combination === "slab") {
      const validKeys = percentageDiscounts.map(pd => pd.key).filter(k => k && k.trim() !== "");
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
  }, [percentageDiscounts, promotion.promotionType, keyCombo.Item, promotion.bundle_combination, setKeyValue]);


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
      return !!keyCombo.Location && !!keyCombo.Item;
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
      if (promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity")) {
        const isPercentageValid = percentageDiscounts.every(pd => pd.key && pd.percentage);
        if (!isPercentageValid) return false;
      } else {
        if (keyCombo.Item === "Item Category") {
          if (!keyValue["Item Category"] || keyValue["Item Category"].length === 0) return false;
        } else if (keyCombo.Item === "Item") {
          if (!keyValue["Item"] || keyValue["Item"].length === 0) return false;
        }
      }
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const missing = [];
      if (!keyCombo.Location) missing.push("Location");
      if (!keyCombo.Item) missing.push("Item");
      if (missing.length > 0) {
        showSnackbar(`Please select ${missing.join(" and ")} before proceeding.`, "warning");
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
    let selectedItemIds = keyValue["Item"] || [];
    if (keyCombo.Item === "Item Category") {
      selectedItemIds = [];
    }

    if (promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity")) {
      const isPercentageValid = percentageDiscounts.every(pd => pd.key && pd.percentage);
      if (!isPercentageValid) {
        showSnackbar("Please fill in all Item/Category and Percentage/Quantity fields in the table.", "error");
        return;
      }
    }

    type PromotionDetailInput = {
      quantity?: string | number;
      from_qty?: string | number;
      toQuantity?: string | number;
      to_qty?: string | number;
      free_qty?: string | number;
      uom?: string;
      promotionGroupName?: string;
    };

    let promotionDetails: PromotionDetailInput[] = [];
    if (Array.isArray(orderTables) && orderTables.length > 0 && Array.isArray(orderTables[0])) {
      promotionDetails = (orderTables as unknown as PromotionDetailInput[][]).flat();
    } else {
      promotionDetails = orderTables as unknown as PromotionDetailInput[];
    }

    let offerDetails: OfferItemType[] = [];
    if (Array.isArray(offerItems) && offerItems.length > 0 && Array.isArray(offerItems[0])) {
      offerDetails = (offerItems as unknown as OfferItemType[][]).flat();
    } else {
      offerDetails = offerItems as unknown as OfferItemType[];
    }

    const payload = {
      promotion_name: promotion.itemName || "",
      from_date: promotion.startDate || "",
      to_date: promotion.endDate || "",
      status: promotion.status || "1",
      promotion_type: promotion.promotionType || "quantity",
      bundle_combination: promotion.bundle_combination || "",
      sales_team_type: promotion.salesTeamType || "",
      project_list: promotion.projectList || "",
      items: selectedItemIds,
      item_category: keyValue["Item Category"] || [],
      uom: selectedUom || "CTN",
      location: keyValue[keyCombo.Location],
      customer: keyValue[keyCombo.Customer],
      promotion_details: (promotionDetails || []).map(detail => ({
        from_qty: Number(detail.quantity || detail.from_qty) || 0,
        to_qty: Number(detail.toQuantity || detail.to_qty) || 0,
        free_qty: Number(detail.free_qty || detail.toQuantity) || 0,
      })),
      percentage_discounts: ((promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity"))
        ? percentageDiscounts.map(pd => ({
          percentage_item_id: keyCombo.Item === "Item" ? (pd.key || "") : null,
          percentage_item_category: keyCombo.Item === "Item Category" ? (pd.key || "") : null,
          percentage: Number(pd.percentage) || 0,
        }))
        : []
      ),
      offer_items: (offerDetails || []).flatMap(detail => {
        const itemCodes = Array.isArray(detail.itemCode) ? detail.itemCode : [detail.itemCode];
        return itemCodes.map(code => ({
          item_id: code || "",
          uom: detail.uom || "",
        }));
      }),
      key: {
        Location: keyCombo.Location ? [keyCombo.Location] : [],
        Customer: keyCombo.Customer ? [keyCombo.Customer] : [],
        Item: keyCombo.Item ? [keyCombo.Item] : [],
      }
    };

    try {
      const missingErrors: Record<string, string> = {};
      if (keyCombo.Item) {
        if (!keyValue[keyCombo.Item] || keyValue[keyCombo.Item].length === 0) {
          missingErrors[keyCombo.Item] = `${keyCombo.Item} is required`;
        }
      }
      if (keyCombo.Location) {
        if (!keyValue[keyCombo.Location] || keyValue[keyCombo.Location].length === 0) {
          missingErrors[keyCombo.Location] = `${keyCombo.Location} is required`;
        }
      }

      if (Object.keys(missingErrors).length > 0) {
        showSnackbar(`Please fill ${Object.keys(missingErrors).join(", ")} before submitting`, "error");
        return;
      }

      await pricingValidationSchema.validate(payload, { abortEarly: false });
      setSubmitLoading(true);

      let res;
      if (isEditMode && id) {
        res = await editPromotionHeader(String(id), payload);
      } else {
        res = await addPromotionHeader(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit Promotion", "error");
      } else {
        showSnackbar(
          isEditMode ? "Promotion updated successfully" : "Promotion added successfully",
          "success"
        );
        router.push("/promotion");
      }
      setSubmitLoading(false);
    } catch (err) {
      setSubmitLoading(false);
      if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
        const validationError = err as yup.ValidationError;
        if (Array.isArray(validationError.inner)) {
          const firstError = validationError.inner[0];
          if (firstError) {
            showSnackbar(firstError.message, "error");
          }
        }
      } else {
        console.error("Submit error:", err);
        showSnackbar(isEditMode ? "Failed to update promotion" : "Failed to add promotion", "error");
      }
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
          <StepPromotion
            keyCombo={keyCombo}
            keyValue={keyValue}
            setKeyValue={setKeyValue}
            promotion={promotion}
            setPromotion={setPromotion}
            itemDropdownMap={itemDropdownMap}
            salesmanTypeOptions={salesmanTypeOptions}
            projectOptions={projectOptions}
            uomOptions={uomOptions}
            selectedUom={selectedUom}
            setSelectedUom={setSelectedUom}
            itemLoading={itemLoading}
            itemOptions={itemOptions}
            percentageDiscounts={percentageDiscounts}
            setPercentageDiscounts={setPercentageDiscounts}
            orderTables={orderTables}
            setOrderTables={setOrderTables}
            updateOrderItem={updateOrderItem}
            offerItems={offerItems}
            setOfferItems={setOfferItems}
            selectItemForOffer={selectItemForOffer}
            updateOfferItem={updateOfferItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {(dataLoading || submitLoading) ? <Loading /> :
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentStep > 1) {
                  prevStep();
                } else {
                  router.push("/promotion");
                }
              }}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <Icon icon="lucide:arrow-left" width={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Update Promotion" : "Add Promotion"}
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
      }
    </>
  );
}