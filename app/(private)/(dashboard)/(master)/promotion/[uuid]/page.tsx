
"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { addPromotionHeader, editPromotionHeader, promotionHeaderById } from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import { useRouter } from "next/navigation";
import CustomCheckbox from "@/app/components/customCheckbox";
import * as yup from "yup";
import { Item } from "@/app/(private)/utils/excise";
import Loading from "@/app/components/Loading";

type KeyComboType = {
  Location: string;
  Customer: string;
  Item: string;
};
type KeyOption = { label: string; id: string; isSelected: boolean };
type KeyGroup = { type: string; options: KeyOption[] };
const initialKeys: KeyGroup[] = [
  {
    type: "Location",
    options: [
      { id: "1", label: "Company", isSelected: false },
      { id: "2", label: "Region", isSelected: false },
      { id: "4", label: "Area", isSelected: false },
      { id: "3", label: "Warehouse", isSelected: false },
    ],
  },
  {
    type: "Customer",
    options: [
      { id: "6", label: "Channel", isSelected: false },
      { id: "7", label: "Customer Category", isSelected: false },
      { id: "8", label: "Customer", isSelected: false },
    ],
  },
  {
    type: "Item",
    options: [
      { id: "9", label: "Item Category", isSelected: false },
      { id: "10", label: "Item", isSelected: false },
    ],
  },
];

function SelectKeyCombinationInline({ keyCombo, setKeyCombo }: { keyCombo: KeyComboType; setKeyCombo: React.Dispatch<React.SetStateAction<KeyComboType>> }) {
  const [keysArray, setKeysArray] = useState<KeyGroup[]>(() => {
    return initialKeys.map(group => ({
      ...group,
      options: group.options.map(opt => ({
        ...opt,
        isSelected: keyCombo[group.type as keyof KeyComboType] === opt.label
      }))
    }));
  });

  useEffect(() => {
    setKeysArray(prev => {
      const next = initialKeys.map(group => ({
        ...group,
        options: group.options.map(opt => ({
          ...opt,
          isSelected: keyCombo[group.type as keyof KeyComboType] === opt.label
        }))
      }));
      const isSame = prev.every((group, i) =>
        group.options.every((opt, j) => opt.isSelected === next[i].options[j].isSelected)
      );
      return isSame ? prev : next;
    });
  }, [keyCombo]);

  function onKeySelect(index: number, optionIndex: number) {
    // 1. Calculate the new state based on the CURRENT keysArray state
    const newKeys = keysArray.map((group, i) => {
      if (i !== index) return group;

      // Determine if this group should be single-select
      // Location, Customer and Item are single-select
      const isSingleSelectGroup = (group.type === "Location" || group.type === "Customer" || group.type === "Item");

      if (isSingleSelectGroup) {
        return {
          ...group,
          options: group.options.map((opt, j) => {
            if (j === optionIndex) {
              return { ...opt, isSelected: !opt.isSelected };
            } else {
              return { ...opt, isSelected: false };
            }
          }),
        };
      } else {
        // Multi-select logic (legacy/unused for these groups now but kept for structure)
        return {
          ...group,
          options: group.options.map((opt, j) =>
            j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
          ),
        };
      }
    });

    // 2. Update local state
    setKeysArray(newKeys);

    // 3. Update parent state
    const selected: { Location: string; Customer: string; Item: string } = { Location: "", Customer: "", Item: "" };
    newKeys.forEach((group) => {
      if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
        const found = group.options.find((o) => o.isSelected);
        selected[group.type as keyof KeyComboType] = found ? found.label : "";
      }
    });
    setKeyCombo(selected);
  }




  return (
    <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-[20px]">Key Combination</div>
        <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {keysArray.map((group, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm"
          >
            <div className="font-semibold text-[18px] mb-4 text-[#181D27]">
              {group.type}
              {(group.type === "Location" || group.type === "Item") && <span className="text-red-500 ml-1">*</span>}
            </div>
            <div className="flex flex-col gap-4">
              {group.options.map((option, optionIndex) => (
                <CustomCheckbox
                  key={optionIndex}
                  id={option.label + index}
                  label={option.label}
                  checked={option.isSelected}
                  onChange={() => onKeySelect(index, optionIndex)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ContainerCard className="mt-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none p-4 flex items-center gap-2">
        <span className="font-semibold text-[#181D27] text-[16px]">Key</span>
        <div className="flex flex-wrap items-center gap-2">
          {(() => {
            const loc = keyCombo.Location;
            return loc ? (
              <span className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{loc}</span>
            ) : null;
          })()}
          {(() => {
            const cust = keyCombo.Customer;
            return cust ? (
              <>
                <span className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>
                <span className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{cust}</span>
              </>
            ) : null;
          })()}
          {(() => {
            const item = keyCombo.Item;
            return item ? (
              <>
                <span className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>
                <span className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{item}</span>
              </>
            ) : null;
          })()}
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}



export default function AddPricing() {
  const params = useParams();
  const paramsTyped = params as { uuid?: string | string[]; id?: string | string[] } | undefined;
  const rawParam = (paramsTyped?.uuid ?? paramsTyped?.id) as string | string[] | undefined;
  const id = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const isEditMode = id !== undefined && id !== "add" && id !== "";
  const {
    companyOptions, regionOptions, warehouseOptions, uomOptions, areaOptions, channelOptions,
    customerCategoryOptions, companyCustomersOptions, itemCategoryOptions, fetchRegionOptions,
    fetchAreaOptions, fetchWarehouseOptions, fetchRouteOptions, fetchCustomerCategoryOptions,
    fetchCompanyCustomersOptions, fetchItemsCategoryWise, salesmanTypeOptions, projectOptions,
    ensureCompanyLoaded, ensureChannelLoaded, ensureItemCategoryLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, ensureUomLoaded
  } = useAllDropdownListData();

  useEffect(() => {
    ensureCompanyLoaded();
    ensureChannelLoaded();
    ensureItemCategoryLoaded();
    ensureSalesmanTypeLoaded();
    ensureProjectLoaded();
    ensureUomLoaded();
  }, [ensureCompanyLoaded, ensureChannelLoaded, ensureItemCategoryLoaded, ensureSalesmanTypeLoaded, ensureProjectLoaded, ensureUomLoaded]);


  useEffect(() => {
    async function fetchEditData() {
      if (!isEditMode || !id) return;
      setLoading(true);
      try {
        // Only call promotionHeaderById for edit mode
        const headerRes = await promotionHeaderById(id);
        if (headerRes && typeof headerRes === "object") {
          const data = headerRes.data; // Alias for easier access
          // Set Promotion specific fields
          setPromotion(s => ({
            ...s,
            itemName: data.promotion_name || "",
            startDate: data.from_date || "", // Map from_date -> startDate
            endDate: data.to_date || "",     // Map to_date -> endDate
            offer_type: data.offer_type || "",
            promotionType: data.promotion_type || "", // Map promotion_type -> promotionType
            bundle_combination: data.bundle_combination || s.bundle_combination || "",
            status: data.status !== undefined ? String(data.status) : s.status,
            salesTeamType: Array.isArray(data.sales_team_type) ? data.sales_team_type.map(String) : (data.sales_team_type ? [String(data.sales_team_type)] : []),
            projectList: Array.isArray(data.project_list) ? data.project_list.map(String) : (data.project_list ? [String(data.project_list)] : []),
          }));

          // Determine Key Combo (prioritize percentage_discounts if present)
          let newKeyComboItem = "";
          if (Array.isArray(data.percentage_discounts) && data.percentage_discounts.length > 0) {
            if (data.percentage_discounts[0].percentage_item_category) {
              newKeyComboItem = "Item Category";
            } else if (data.percentage_discounts[0].percentage_item_id) {
              newKeyComboItem = "Item";
            }
          } else {
            newKeyComboItem = data.item_category?.length > 0 ? "Item Category" : (data.items?.length > 0 ? "Item" : "");
          }
          const keys = data.key || {};
          const newKeyCombo = {
            Location: keys.Location?.[0] || "",
            Customer: keys.Customer?.[0] || "",
            Item: newKeyComboItem,
          };
          setKeyCombo(newKeyCombo);

          // Populate Percentage Discounts
          if (Array.isArray(data.percentage_discounts) && data.percentage_discounts.length > 0) {
            const mappedPercentageDiscounts = data.percentage_discounts.map((pd: any) => ({
              key: pd.percentage_item_id || pd.percentage_item_category || "",
              percentage: String(pd.percentage || ""),
              idx: String(Math.random())
            }));
            setPercentageDiscounts(mappedPercentageDiscounts);
          }

          // Set Key Values (for Location and Customer, Item/Category handled by Percentage Discounts or sync effect)
          const newKeyValue: Record<string, string[]> = {};
          if (newKeyCombo.Location) newKeyValue[newKeyCombo.Location] = data.location?.map(String) || [];
          if (newKeyCombo.Customer) newKeyValue[newKeyCombo.Customer] = data.customer?.map(String) || [];
          // Item/Item Category for keyValue is populated via sync effect from percentageDiscounts
          // or directly from data.item_category / data.items if not percentage promotion.
          if (!newKeyComboItem) { // Only set if not percentage_discounts driven
            if (newKeyCombo.Item === "Item Category") {
              const categories = data.item_category?.map(String) || [];
              newKeyValue["Item Category"] = categories;
              if (categories.length > 0) {
                fetchItemsCategoryWise(categories.toString());
              }
              if (data.items && data.items.length > 0) {
                newKeyValue["Item"] = data.items.map(String);
              }
            }
            if (newKeyCombo.Item === "Item") {
              newKeyValue["Item"] = data.items?.map(String) || [];
            }
          }
          setKeyValue(newKeyValue);

          // Set UOM
          setSelectedUom(String(data.uom || ""));

          // Set Order Tables (Promotion Details)
          if (Array.isArray(data.promotion_details) && data.promotion_details.length > 0) {
            const details = data.promotion_details.map((d: any) => ({
              promotionGroupName: "", // Not in response, maybe infer?
              itemName: "", // Will be filled by item fetch logic if needed
              itemCode: "",
              quantity: String(d.from_qty || ""),
              toQuantity: String(d.to_qty || ""),
              uom: String(data.uom || "CTN"), // Use header UOM as fallback?
              price: "",
              free_qty: String(d.free_qty || ""),
              idx: String(d.id || Math.random())
            }));
            setOrderTables([details]);
          }

          // Set Offer Items
          // Response has `offer_items` as object, but state expects array of arrays (for tables)
          if (data.offer_items) {
            const offerData = Array.isArray(data.offer_items) ? data.offer_items : [data.offer_items];
            const offers = offerData.map((o: any) => ({
              promotionGroupName: "",
              itemName: "", // Can fetch name if needed
              itemCode: String(o.item_id || ""),
              uom: String(o.uom || ""),
              toQuantity: "", // Not in example response?
              is_discount: "0",
              idx: String(Math.random())
            }));
            setOfferItems([offers]);
          }
        }
      } catch (err) {
        showSnackbar("Failed to fetch promotion data for edit mode", "error");
      }
      setLoading(false);
    }
    fetchEditData();
  }, [isEditMode, id]);
  const steps: StepperStep[] = [
    { id: 1, label: "Key Combination" },
    { id: 2, label: "Key Value" },
    { id: 3, label: "Promotion" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep
  } = useStepperForm(steps.length);
  const { showSnackbar } = useSnackbar();
  const [itemOptions, setItemOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false);
  const validateStep = (step: number) => {
    if (step === 1) {
      // Require both Location and Item to be selected.
      return !!keyCombo.Location && !!keyCombo.Item;
    }
    if (step === 2) {
      // Validate all selected Location and Item key-value fields.
      // Customer key-value fields are optional.
      let allValid = true;

      if (keyCombo.Location) {
        if (!keyValue[keyCombo.Location] || keyValue[keyCombo.Location].length === 0) {
          allValid = false;
        }
      }

      if (keyCombo.Customer) {
        if (!keyValue[keyCombo.Customer] || keyValue[keyCombo.Customer].length === 0) {
          allValid = false;
        }
      }
      return allValid;
    }
    if (step === 3) {
      if (promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity")) {
        // Validate Percentage Discount Table
        const isPercentageValid = percentageDiscounts.every(pd => pd.key && pd.percentage);
        if (!isPercentageValid) {
          return false;
        }
        // In percentage mode, we don't enforce the global keyValue dropdowns for Item/Category
        // because they are populated from the table.
      } else {
        if (keyCombo.Item === "Item Category") {
          if (!keyValue["Item Category"] || keyValue["Item Category"].length === 0) {
            return false;
          }
        } else if (keyCombo.Item === "Item") {
          if (!keyValue["Item"] || keyValue["Item"].length === 0) {
            return false;
          }
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

  const router = useRouter();
  const pricingValidationSchema = yup.object().shape({
    promotion_name: yup.string().required("Promotion Name is required"),
    from_date: yup.string().required("Start Date is required"),
    to_date: yup.string()
      .required("End Date is required")
      .test(
        'is-after-start',
        'End Date must be after Start Date',
        function (value) {
          const { from_date } = this.parent;
          if (!from_date || !value) {
            return true; // Don't validate if either date is missing (handled by .required)
          }
          return new Date(value) > new Date(from_date);
        }
      ),
    sales_team_type: yup.array().of(yup.string()).min(1, "Sales Team Type is required"),
    project_list: yup.array().when("sales_team_type", {
      is: (val: string[]) => val && val.includes("6"),
      then: (schema) => schema.of(yup.string()).min(1, "Project List is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    items: yup.array().when("item_category", {
      is: (val: any[]) => val && val.length > 0,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.of(yup.string()).min(1, "At least one item is required"),
    }),
    item_category: yup.array(),
    promotion_details: yup.array().of(
      yup.object().shape({
        from_qty: yup.number()
          .required("From Quantity is required")
          .moreThan(0, "From Quantity must be greater than 0")
          .transform((value) => (isNaN(value) ? undefined : value)),
        to_qty: yup.number()
          .required("To Quantity is required")
          .moreThan(0, "To Quantity must be greater than 0")
          .transform((value) => (isNaN(value) ? undefined : value))
          .test('is-greater', 'To Quantity must be greater than From Quantity', function (value) {
            const { from_qty } = this.parent;
            return !from_qty || !value || value > from_qty;
          }),
        free_qty: yup.number()
          .required("Free Quantity is required")
          .transform((value) => (isNaN(value) ? undefined : value)),
      })
    ).min(1, "At least one promotion detail is required"),
    offer_items: yup.array().of(
      yup.object().shape({
        item_id: yup.string().required("Offer Item is required"),
        uom: yup.string().required("Offer Item UOM is required"),
      })
    ).min(1, "At least one offer item is required"),
  });
  // const [errors, setErrors] = useState<Record<string, string>>({});
  // const clearErrors = () => setErrors({});

  const handleSubmit = async () => {

    // const initialKeys = [
    //   {
    //     type: "Location",
    //     options: [
    //       { id: "1", label: "Company", isSelected: false },
    //       { id: "2", label: "Region", isSelected: false },
    //       { id: "3", label: "Warehouse", isSelected: false },
    //       { id: "4", label: "Area", isSelected: false },
    //     ],
    //   },
    //   {
    //     type: "Customer",
    //     options: [
    //       { id: "6", label: "Channel", isSelected: false },
    //       { id: "7", label: "Customer Category", isSelected: false },
    //       { id: "8", label: "Customer", isSelected: false },
    //     ],
    //   },
    //   {
    //     type: "Item",
    //     options: [
    //       { id: "9", label: "Item Category", isSelected: false },
    //       { id: "10", label: "Item", isSelected: false },
    //     ],
    //   },
    // ];

    // function getKeyId(type: string, label: string): string {
    //   const group = initialKeys.find(g => g.type === type);
    //   if (!group) return "";
    //   const found = group.options.find(opt => opt.label === label);
    //   return found ? found.id : label;
    // }

    // ✅ Fix: Join description IDs properly as comma-separated string
    // const descriptionIds = [
    //   getKeyId("Location", keyCombo.Location),
    //   getKeyId("Customer", keyCombo.Customer),
    //   getKeyId("Item", keyCombo.Item)
    // ].filter(Boolean);
    // const description = descriptionIds.join(",");

    let selectedItemIds = keyValue["Item"] || [];

    if (keyCombo.Item === "Item Category") {

      selectedItemIds = [];

    }

    // Validate Percentage Discounts before payload construction
    if (promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity")) {
      const isPercentageValid = percentageDiscounts.every(pd => pd.key && pd.percentage);
      if (!isPercentageValid) {
        showSnackbar("Please fill in all Item/Category and Percentage/Quantity fields in the table.", "error");
        return;
      }
    }

    // ✅ Fix: Flatten promotion details properly
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
      // discount_type: "",
      promotion_type: promotion.promotionType || "quantity",
      bundle_combination: promotion.bundle_combination || "",
      sales_team_type: promotion.salesTeamType || "",
      project_list: promotion.projectList || "",
      items: selectedItemIds,
      item_category: keyValue["Item Category"] || [],
      uom: selectedUom || "CTN",
      location: keyValue[keyCombo.Location],
      customer: keyValue[keyCombo.Customer],
      // description: description,
      // ✅ Fix: Map promotion_details with correct field names
      promotion_details: (promotionDetails || []).map(detail => ({
        from_qty: Number(detail.quantity || detail.from_qty) || 0,
        to_qty: Number(detail.toQuantity || detail.to_qty) || 0,
        free_qty: Number(detail.free_qty || detail.toQuantity) || 0,
        // Use row specific UOM or globally selected UOM
        // promotion_group_name: detail.promotionGroupName || "",
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
          // promotion_group_name: detail.promotionGroupName || "",
          // is_discount: detail.is_discount || "0",
          // quantity: Number(detail.toQuantity) || 0
        }));
      }),

      // ✅ Add key object for validation
      key: {
        Location: keyCombo.Location ? [keyCombo.Location] : [],
        Customer: keyCombo.Customer ? [keyCombo.Customer] : [],
        Item: keyCombo.Item ? [keyCombo.Item] : [],
      }
    };

    try {
      // Pre-submit: ensure Item Category and Item key-values are present
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
        // setErrors(missingErrors);
        showSnackbar(`Please fill ${Object.keys(missingErrors).join(", ")} before submitting`, "error");
        return;
      }

      // ✅ Validate payload-level required pieces (items)
      await pricingValidationSchema.validate(payload, { abortEarly: false });
      console.log(payload, "payload")
      return
      setLoading(true);

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
      setLoading(false);
    } catch (err) {
      setLoading(false);

      if (err && typeof err === "object" && "name" in err && err.name === "ValidationError") {
        const formErrors: Record<string, string> = {};
        const validationError = err as yup.ValidationError;

        if (Array.isArray(validationError.inner)) {
          // Get the first error message to show in snackbar
          const firstError = validationError.inner[0];
          if (firstError) {
            showSnackbar(firstError.message, "error");
          }

          validationError.inner.forEach((e: yup.ValidationError) => {
            if (e.path) {
              formErrors[e.path] = e.message;
              console.error(`Validation error at ${e.path}:`, e.message);
            }
          });
        }

        // setErrors(formErrors);
        // showSnackbar("Please fix validation errors before proceeding", "error");

        // Log which fields failed for debugging
        console.log("Validation errors:", formErrors);
      } else {
        console.error("Submit error:", err);
        showSnackbar(
          isEditMode ? "Failed to update promotion" : "Failed to add promotion",
          "error"
        );
      }
    }
  };




  const [keyCombo, setKeyCombo] = useState<KeyComboType>({
    Location: "",
    Customer: "",
    Item: "",
  });

  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [promotion, setPromotion] = useState({
    itemName: "",
    startDate: "",
    endDate: "",
    // type: "",
    // discount_type: "",
    promotionType: "",
    bundle_combination: "range",
    status: "1",
    salesTeamType: [] as string[],
    projectList: [] as string[],
  });

  const [selectedUom, setSelectedUom] = useState("");
  const [itemLoading, setItemLoading] = useState(false);
  console.log(itemLoading, "itemLoading")
  console.log(selectedUom, "selectedUom")
  type OrderItemType = {
    promotionGroupName: string;
    itemName: string;
    itemCode: string;
    quantity: string;
    toQuantity: string;
    uom: string;
    price: string;
    free_qty?: string;
    type?: string;
    idx?: string;
  };
  type OfferItemType = {
    promotionGroupName: string;
    itemName: string;
    itemCode: string | string[];
    uom: string;
    toQuantity: string;
    is_discount: string;
    idx?: string;
  };
  const [orderTables, setOrderTables] = useState<OrderItemType[][]>([
    [
      { promotionGroupName: "", itemName: "", itemCode: "", quantity: "", toQuantity: "", uom: "CTN", price: "", free_qty: "" },
    ]
  ]);
  const [offerItems, setOfferItems] = useState<OfferItemType[][]>([
    [{ promotionGroupName: "", itemName: "", itemCode: "", uom: "BAG", toQuantity: "", is_discount: "0" }],
  ]);

  type PercentageDiscountType = {
    key: string;
    percentage: string;
    idx: string;
  };
  const [percentageDiscounts, setPercentageDiscounts] = useState<PercentageDiscountType[]>([{ key: "", percentage: "", idx: "0" }]);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const companies = keyValue["Company"];
    if (Array.isArray(companies) && companies.length > 0) {
      try {
        fetchRegionOptions(companies[0]);
      } catch (err) {
        console.error("Failed to fetch region options for company", companies[0], err);
      }
    }
  }, [keyValue["Company"], fetchRegionOptions]);

  // When Region selection changes, fetch areas for the first selected region.
  useEffect(() => {
    const regions = keyValue["Region"];
    if (Array.isArray(regions) && regions.length > 0) {
      try {
        fetchAreaOptions(regions[0]);
      } catch (err) {
        console.error("Failed to fetch area options for region", regions[0], err);
      }
    }
  }, [keyValue["Region"], fetchAreaOptions]);

  // When Area selection changes, fetch warehouses for the first selected area.
  useEffect(() => {
    const areas = keyValue["Area"];
    if (Array.isArray(areas) && areas.length > 0) {
      try {
        fetchWarehouseOptions(areas[0]);
      } catch (err) {
        console.error("Failed to fetch warehouse options for area", areas[0], err);
      }
    }
  }, [keyValue["Area"], fetchWarehouseOptions]);

  // When Warehouse selection changes, fetch routes for the first selected warehouse.
  useEffect(() => {
    const warehouses = keyValue["Warehouse"];
    if (Array.isArray(warehouses) && warehouses.length > 0) {
      try {
        fetchRouteOptions(warehouses[0]);
      } catch (err) {
        console.error("Failed to fetch route options for warehouse", warehouses[0], err);
      }
    }
  }, [keyValue["Warehouse"], fetchRouteOptions]);

  // When Channel selection changes, fetch customer categories for the first selected channel.
  useEffect(() => {
    console.log(keyValue["Channel"], "keyValue")
    const channels = keyValue["Channel"];
    if (Array.isArray(channels) && channels.length > 0) {
      try {
        console.log("fetchCustomerCategoryOptions")
        fetchCustomerCategoryOptions(channels[0]);
      } catch (err) {
        console.error("Failed to fetch customer category options for channel", channels[0], err);
      }
    }
  }, [keyValue["Channel"], fetchCustomerCategoryOptions]);

  // When Customer Category selection changes, fetch customers for the first selected category.
  useEffect(() => {
    const categories = keyValue["Customer Category"];
    if (Array.isArray(categories) && categories.length > 0) {
      try {
        fetchCompanyCustomersOptions(categories[0]);
      } catch (err) {
        console.error("Failed to fetch company customers for category", categories[0], err);
      }
    }
  }, [keyValue["Customer Category"], fetchCompanyCustomersOptions]);

  // When Item Category selection changes, fetch items for the selected categories.
  async function fetchItemsCategory(itemCategories: string[]) {
    setItemLoading(true)
    try {
      const result = await fetchItemsCategoryWise(itemCategories.toString())
      setItemOptions(result);
    } catch (error) {
      console.warn(error)
    } finally {
      setItemLoading(false)
    }
  }
  useEffect(() => {
    const itemCategories = keyValue["Item Category"];
    if (Array.isArray(itemCategories) && itemCategories.length > 0) {
      try {
        fetchItemsCategory(itemCategories ?? [])
      } catch (err) {
        console.error("Failed to fetch item options for category", itemCategories, err);
      } finally {
      }
    } else {
      setItemOptions([]);
    }
  }, [keyValue["Item Category"], fetchItemsCategoryWise]);

  // When Item Category selection changes, prefill category on existing table rows
  useEffect(() => {
    const itemCategories = keyValue["Item Category"];
    if (Array.isArray(itemCategories) && itemCategories.length > 0) {
      const firstCat = itemCategories[0];
      // Prefill orderTables' promotionGroupName if empty
      setOrderTables(tables => tables.map(table => table.map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat }))));

      // Prefill offerItems depending on bundle mode. offerItems may be either
      // OfferItemType[] or OfferItemType[][] (bundle mode uses nested arrays).
      setOfferItems(prev => {
        const p: any = prev;
        if (Array.isArray(p) && p.length > 0 && Array.isArray(p[0])) {
          // nested arrays
          const next = (p as any[][]).map(arr => arr.map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat })));
          return next as unknown as OfferItemType[][];
        }
        // flat array - wrap it to nested
        return [(p as any[]).map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat }))] as OfferItemType[][];
      });
    }
  }, [keyValue["Item Category"]]);


  useEffect(() => {
    // Clear promotionType if bundle_combination is not 'slab'
    if (promotion.bundle_combination !== "slab" && promotion.promotionType !== "") {
      setPromotion(s => ({ ...s, promotionType: "" }));
    }
  }, [promotion.bundle_combination, promotion.promotionType]);

  // Sync percentageDiscounts to keyValue when in percentage mode
  useEffect(() => {
    if (promotion.promotionType === "percentage") {
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
  }, [percentageDiscounts, promotion.promotionType, keyCombo.Item]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SelectKeyCombinationInline keyCombo={keyCombo} setKeyCombo={setKeyCombo} />;
      case 2:
        type DropdownOption = { label: string; value: string };
        const locationDropdownMap: Record<string, DropdownOption[]> = {
          Company: companyOptions,
          Region: regionOptions,
          Warehouse: warehouseOptions,
          Area: areaOptions,
        };
        const customerDropdownMap: Record<string, DropdownOption[]> = {
          Channel: channelOptions,
          "Customer Category": customerCategoryOptions,
          Customer: companyCustomersOptions,
        };
        // const itemDropdownMap: Record<string, DropdownOption[]> = {
        //   "Item Category": itemCategoryOptions,
        //   Item: itemOptions,
        // };
        return (
          <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Key Value</h2>
              <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
            </div>
            <div className="flex gap-6">
              <div className="flex-1">
                <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                  <div className="font-semibold text-lg mb-4">Location</div>
                  {keyCombo.Location && (
                    <div className="mb-4">
                      <div className="mb-2 text-base font-medium">
                        {keyCombo.Location}
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                      <InputFields
                        label=""
                        type="select"
                        isSingle={false}
                        options={locationDropdownMap[keyCombo.Location] ? [{ label: `Select ${keyCombo.Location}`, value: "" }, ...locationDropdownMap[keyCombo.Location]] : [{ label: `Select ${keyCombo.Location}`, value: "" }]}
                        value={keyValue[keyCombo.Location] || ""}
                        onChange={e => {
                          const valueFromEvent = e.target.value;
                          let selectedValues: string[];
                          if (Array.isArray(valueFromEvent)) {
                            selectedValues = valueFromEvent;
                          } else {
                            selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                          }
                          setKeyValue(s => ({ ...s, [keyCombo.Location]: selectedValues.filter(val => val !== "") }));
                        }}
                        width="w-full"
                      />
                    </div>
                  )}
                </ContainerCard>
              </div>
              {keyCombo.Customer && (
                <div className="flex-1">
                  <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                    <div className="font-semibold text-lg mb-4">Customer</div>
                    <div className="mb-4">
                      <div className="mb-2 text-base font-medium">
                        {keyCombo.Customer}
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                      <InputFields
                        label=""
                        type="select"
                        isSingle={false}
                        options={customerDropdownMap[keyCombo.Customer] ? [{ label: `Select ${keyCombo.Customer}`, value: "" }, ...customerDropdownMap[keyCombo.Customer]] : [{ label: `Select ${keyCombo.Customer}`, value: "" }]}
                        value={keyValue[keyCombo.Customer] || []}
                        onChange={e => {
                          const valueFromEvent = e.target.value;
                          let selectedValues: string[];
                          if (Array.isArray(valueFromEvent)) {
                            selectedValues = valueFromEvent;
                          } else {
                            selectedValues = valueFromEvent ? [String(valueFromEvent)] : [];
                          }
                          setKeyValue(s => ({ ...s, [keyCombo.Customer]: selectedValues.filter(val => val !== "") }));
                        }}
                        width="w-full"
                      />
                    </div>
                  </ContainerCard>
                </div>
              )}
            </div>
          </ContainerCard>
        );
      case 3:
        const itemDropdownMap: Record<string, DropdownOption[]> = {
          "Item Category": itemCategoryOptions,
          Item: Array.isArray(itemOptions) ? itemOptions : [],
        };
        // Helper to update orderItems by row index for a specific table so each row
        // can store independent values even when itemCode is empty or duplicated.
        function updateOrderItem(tableIdx: number, rowIdx: string | undefined, key: keyof OrderItemType, value: string) {
          setOrderTables((tables) => tables.map((arr, idx) => {
            if (idx !== tableIdx) return arr;
            return arr.map((oi, i) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi);
          }));
        }


        // Options built from items selected in Step 2
        const selectedItemOptions = itemOptions;




        // Helper to set itemCode for an offer row/table
        function selectItemForOffer(tableIdx: number, rowIdx: string, value: string | string[]) {
          // If value is array, we might want to default UOM based on the first item or leave it.
          // For now, let's just update the itemCode.

          setOfferItems((prev: OfferItemType[][] | any) => {
            // Always treat as nested array
            const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev as OfferItemType[][] : [prev as unknown as OfferItemType[]];

            return tables.map((arr: OfferItemType[], idx: number) =>
              idx === tableIdx
                ? arr.map((oi, i) => (String(i) === String(rowIdx) ? { ...oi, itemCode: value } : oi))
                : arr
            );
          });
        }

        // Clamp percentage inputs to 0-100 when promotionType is Percentage
        function clampPercentInput(val: string) {
          if (promotion.promotionType !== "percentage") return val;
          const n = Number(val);
          if (Number.isNaN(n)) return "";
          const clamped = Math.max(0, Math.min(100, n));
          return String(clamped);
        }
        // Build UOM options for a given table row using selectedItemDetails or provider `item`.
        // Always returns an array of options so the UI can render a select dropdown.
        // function getUomOptionsForRow(row: Record<string, unknown>) {
        //   const codeOrName = String((row as Record<string, unknown>)['itemCode'] ?? (row as Record<string, unknown>)['itemName'] ?? "");
        //   let itemObj: ItemDetail | undefined = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === codeOrName || String(it.name || it.itemName || it.label) === codeOrName);
        //   if (!itemObj && Array.isArray(item)) {
        //     itemObj = (item as ItemDetail[]).find((ci) => String((ci as Record<string, unknown>)['id'] ?? (ci as Record<string, unknown>)['code'] ?? '') === codeOrName || String((ci as Record<string, unknown>)['label'] ?? (ci as Record<string, unknown>)['name'] ?? '') === codeOrName);
        //   }
        //   const uoms = (itemObj ? ((itemObj as Record<string, unknown>)['uomSummary'] ?? (itemObj as Record<string, unknown>)['uom']) : undefined) ?? [];
        //   // If no uoms available return a single placeholder option (so dropdown always shows)
        //   if (!Array.isArray(uoms) || uoms.length === 0) {
        //     const fallback = String(row.uom || "");
        //     if (fallback) return [{ label: fallback, value: fallback, price: undefined }];
        //     return [{ label: "-", value: "", price: undefined }];
        //   }
        //   return (uoms as Uom[]).map((u) => ({ label: `${u.name ?? u.uom ?? ""}${u.uom_type ? ` (${u.uom_type})` : ""}${u.price ? ` - ${u.price}` : ""}`, value: String(u.name ?? u.uom ?? ""), price: u.price }));
        // }
        // Helper to set item for the whole order table
        // function selectItemForOrderTable(tableIdx: number, value: string) {
        //   const providerItems: ItemDetail[] = Array.isArray(item) ? (item as ItemDetail[]) : [];
        //   const foundItem = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === String(value) || String(it.name || it.itemName || it.label) === String(value)) || providerItems.find((ci) => String((ci as Record<string, unknown>)['id'] ?? '') === String(value));

        //   const name = foundItem ? String(foundItem.name || foundItem.itemName || foundItem.label || "") : "";

        //   // Get primary UOM
        //   const uomList = (foundItem ? ((foundItem as Record<string, unknown>)['uomSummary'] ?? (foundItem as Record<string, unknown>)['uom']) : undefined) as unknown;
        //   let uomName = "CTN";
        //   let uomPrice = "";
        //   if (Array.isArray(uomList) && uomList.length > 0) {
        //     const uomArr = uomList as Uom[];
        //     const primary = uomArr.find(u => String(u.uom_type || '').toLowerCase() === 'primary') || uomArr[0];
        //     uomName = String(primary?.name ?? primary?.uom ?? '');
        //     uomPrice = primary && (primary.price !== undefined && primary.price !== null) ? String(primary.price) : '';
        //   }

        //   setOrderTables((tables) => tables.map((arr, idx) => {
        //     if (idx !== tableIdx) return arr;

        //     if (arr.length === 0) {
        //       // Create a new row if empty
        //       return [{
        //         promotionGroupName: "",
        //         itemName: name,
        //         itemCode: value,
        //         quantity: "",
        //         toQuantity: "",
        //         uom: uomName,
        //         price: uomPrice,
        //         free_qty: "",
        //       }];
        //     }

        //     return arr.map((oi) => ({
        //       ...oi,
        //       itemCode: value,
        //       itemName: name,
        //       uom: uomName || oi.uom,
        //       price: uomPrice || oi.price
        //     }));
        //   }));
        // }

        const renderPercentageDiscountTable = () => {
          const isCategoryMode = keyCombo.Item === "Item Category";
          const dropdownLabel = isCategoryMode ? "Item Category" : "Item";
          const dropdownOptions = isCategoryMode
            ? (itemDropdownMap["Item Category"] ? [{ label: `Select ${dropdownLabel}`, value: "" }, ...itemDropdownMap["Item Category"]] : [])
            : (itemDropdownMap["Item"] ? [{ label: `Select ${dropdownLabel}`, value: "" }, ...itemDropdownMap["Item"]] : []);

          return (
            <div className="mb-6 mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-lg">{promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? "Quantity Discount" : "Percentage Discount"}</div>
              </div>
              <Table
                data={percentageDiscounts}
                config={{
                  showNestedLoading: false,
                  columns: [
                    {
                      key: "key",
                      label: (
                        <span>
                          {dropdownLabel}
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 250,
                      render: (row) => {
                        const currentVal = String((row as Record<string, unknown>)['key'] ?? "");
                        const otherSelectedValues = percentageDiscounts
                          .filter(p => String(p.idx) !== String((row as Record<string, unknown>)['idx']))
                          .map(p => p.key)
                          .filter(k => k && k !== "");

                        const filteredOptions = dropdownOptions.filter(opt =>
                          opt.value === "" || opt.value === currentVal || !otherSelectedValues.includes(opt.value)
                        );

                        return (
                          <InputFields
                            label=""
                            type="select"
                            isSingle={true}
                            placeholder={`Select ${dropdownLabel}`}
                            options={filteredOptions}
                            value={currentVal}
                            onChange={e => {
                              const val = e.target.value;
                              setPercentageDiscounts(prev => prev.map((p) => String(p.idx) === String((row as Record<string, unknown>)['idx']) ? { ...p, key: val } : p));
                            }}
                            width="w-full"
                          />
                        );
                      },
                    },
                    {
                      key: "percentage",
                      label: (
                        <span>
                          {promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? "Quantity" : "Percentage"}
                          <span className="text-red-500 ml-1">*</span>
                        </span>
                      ),
                      width: 150,
                      render: (row) => (
                        <InputFields
                          label=""
                          type="number"
                          placeholder={promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? "Quantity" : "Percentage"}
                          value={String((row as Record<string, unknown>)['percentage'] ?? "")}
                          onChange={e => {
                            const val = e.target.value;
                            // Clamp 0-100 only if it's percentage type
                            if (promotion.promotionType === "percentage") {
                              const n = Number(val);
                              if (Number.isNaN(n)) return;
                              const clamped = Math.max(0, Math.min(100, n));
                              setPercentageDiscounts(prev => prev.map((p) => String(p.idx) === String((row as Record<string, unknown>)['idx']) ? { ...p, percentage: String(clamped) } : p));
                            } else {
                              setPercentageDiscounts(prev => prev.map((p) => String(p.idx) === String((row as Record<string, unknown>)['idx']) ? { ...p, percentage: val } : p));
                            }
                          }}
                          width="w-full"
                          trailingElement={promotion.bundle_combination === "slab" && promotion.promotionType === "quantity" ? undefined : <span className="text-gray-500 font-semibold">%</span>}
                        />
                      ),
                    },
                    {
                      key: "action",
                      label: "Action",
                      width: 30,
                      render: (row) => (
                        <button
                          type="button"
                          disabled={percentageDiscounts.length <= 1}
                          className={`flex w-full h-full ${percentageDiscounts.length <= 1 ? "text-gray-300 cursor-not-allowed" : "text-red-500"}`}
                          onClick={() => {
                            if (percentageDiscounts.length <= 1) return;
                            setPercentageDiscounts(prev => prev.filter(p => String(p.idx) !== String((row as Record<string, unknown>)['idx'])));
                          }}
                        >
                          <Icon icon="lucide:trash-2" width={20} />
                        </button>
                      ),
                    },
                  ],
                  pageSize: 10,
                }}
              />
              < div className="mt-4" >
                <button
                  type="button"
                  className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
                  onClick={() => {
                    setPercentageDiscounts(prev => [...prev, { key: "", percentage: "", idx: String(Math.random()) }]);
                  }}
                >
                  <Icon icon="material-symbols:add-circle-outline" width={20} />
                  Add New Item
                </button>
              </div >
            </div >
          );
        };

        // Render all order tables
        const renderOrderTables = () => {
          return orderTables.map((orderItems, tableIdx) => {
            let itemsData = orderItems.map((orderItem, idx) => ({
              ...orderItem,
              idx: String(idx),
            }));
            if (itemsData.length === 0) {
              itemsData = [{
                promotionGroupName: "",
                itemName: "",
                itemCode: "",
                quantity: "",
                toQuantity: "",
                uom: "",
                price: "",
                idx: "0",
              }];
            }
            // const currentItemCode = orderItems[0]?.itemCode || "";
            const totalPages = Math.ceil(itemsData.length / pageSize);
            const paginatedData = itemsData.slice((page - 1) * pageSize, page * pageSize);

            // const firstItemId = keyValue["Item"]?.[0] || "";
            // const uomOptions = getUomOptionsForRow({ itemCode: firstItemId });
            // const currentUom = orderItems[0]?.uom || "";

            return (
              <React.Fragment key={tableIdx}>
                {tableIdx > 0 && (
                  <div className="flex items-center my-4">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="mx-4 font-bold text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>
                )}
                <div className="mb-6">
                  <Table
                    data={paginatedData}
                    config={{
                      showNestedLoading: false,
                      columns: [
                        {
                          key: "quantity",
                          label: (
                            <span>
                              From Quantity
                              <span className="text-red-500 ml-1">*</span>
                            </span>
                          ),
                          width: 120,
                          render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              placeholder="From Qty"
                              value={String((row as Record<string, unknown>)['quantity'] ?? "")}
                              onChange={e => updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "quantity", clampPercentInput(e.target.value))}
                              width="w-full"
                            />
                          ),
                        },
                        {
                          key: "toQuantity",
                          label: (
                            <span>
                              To Quantity
                              <span className="text-red-500 ml-1">*</span>
                            </span>
                          ),
                          width: 120,
                          render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              placeholder="To Qty"
                              value={String((row as Record<string, unknown>)['toQuantity'] ?? "")}
                              onChange={e => updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "toQuantity", clampPercentInput(e.target.value))}
                              width="w-full"
                            />
                          ),
                        },
                        {
                          key: "free_qty",
                          label: (
                            <span>
                              Free Qty
                              <span className="text-red-500 ml-1">*</span>
                            </span>
                          ),
                          width: 120,
                          render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              placeholder="Free Qty"
                              value={String((row as Record<string, unknown>)['free_qty'] ?? "")}
                              onChange={e => updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "free_qty", e.target.value)}
                              width="w-full"
                            />
                          ),
                        },
                        {
                          key: "action",
                          label: "Action",
                          width: 20,
                          render: (row) => (
                            <button
                              type="button"
                              disabled={String((row as Record<string, unknown>)['idx']) === "0"}
                              className={`flex  w-full h-full ${String((row as Record<string, unknown>)['idx']) === "0" ? "text-gray-300 cursor-not-allowed" : "text-red-500"}`}
                              onClick={() => {
                                if (String((row as Record<string, unknown>)['idx']) === "0") return;
                                setOrderTables(tables => {
                                  return tables.flatMap((arr, idx) => {
                                    if (idx !== tableIdx) return [arr];
                                    const newArr = arr.filter((oi, i) => String(i) !== String((row as Record<string, unknown>)['idx']));
                                    if (newArr.length === 0 && tables.length > 1) {
                                      return [];
                                    }
                                    return [newArr];
                                  });
                                });
                              }}
                            >
                              <Icon icon="lucide:trash-2" width={20} />
                            </button>
                          ),
                        },
                      ], pageSize,
                    }}
                  />
                  {itemsData.length > pageSize && renderPaginationBar(totalPages)}

                  {/* Add Button */}
                  {promotion.bundle_combination === "range" && (
                    <div className="mt-4">
                      <button
                        type="button"
                        className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
                        onClick={() => {
                          setOrderTables(tables => tables.map((arr, idx) => {
                            if (idx !== tableIdx) return arr;
                            const first = arr[0];
                            return [
                              ...arr,
                              {
                                promotionGroupName: first?.promotionGroupName || "",
                                itemName: first?.itemName || "",
                                itemCode: first?.itemCode || "",
                                quantity: "",
                                toQuantity: "",
                                uom: first?.uom || "CTN",
                                price: first?.price || "",
                                free_qty: "",
                              }
                            ];
                          }));
                        }}
                      >                      <Icon icon="material-symbols:add-circle-outline" width={20} />
                        Add New Item
                      </button>
                    </div>
                  )}

                </div>
              </React.Fragment>
            );
          });
        };

        // Show all offerItems, including custom added rows
        let offerItemsData: OfferItemType[] = [];
        if (Array.isArray(offerItems) && offerItems.length > 0 && Array.isArray(offerItems[0])) {
          offerItemsData = (offerItems as OfferItemType[][]).flat().map((offerItem, idx) => ({ ...offerItem, idx: String(idx) }));
        } else {
          offerItemsData = (offerItems as unknown as OfferItemType[]).map((offerItem, idx) => ({ ...offerItem, idx: String(idx) }));
        }
        if (offerItemsData.length === 0) {
          offerItemsData = [{
            promotionGroupName: "",
            itemName: "",
            itemCode: "",
            uom: "BAG",
            toQuantity: "",
            is_discount: "0",
            idx: "0",
          }];
        }



        type PaginationBtnProps = {
          label: string;
          isActive: boolean;
          onClick: () => void;
        };
        const PaginationBtn = ({ label, isActive, onClick }: PaginationBtnProps) => (
          <button
            className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center mx-[2px] text-[14px] font-semibold transition-colors duration-150 border-none outline-none focus:ring-2 focus:ring-[#EA0A2A] select-none ${isActive ? "bg-[#FFF0F2] text-[#EA0A2A] shadow-sm" : "bg-white text-[#717680] hover:bg-[#F5F5F5]"
              }`}
            style={{ minWidth: 32 }}
            onClick={onClick}
            disabled={label === "..."}
          >
            {label}
          </button>
        );

        const renderPaginationBar = (totalPages: number) => {
          if (totalPages <= 1) return null;
          const firstThreePageIndices = [1, 2, 3];
          const lastThreePageIndices = totalPages > 3 ? [totalPages - 2, totalPages - 1, totalPages] : [];
          return (
            <div className="flex justify-between items-center px-[8px] py-[12px] mt-2">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <span className="text-[16px]">←</span>
                Previous
              </button>
              <div className="flex gap-[2px] text-[14px] select-none">
                {totalPages > 6 ? (
                  <>
                    {firstThreePageIndices.map((pageNo) => (
                      <PaginationBtn
                        key={pageNo}
                        label={pageNo.toString()}
                        isActive={page === pageNo}
                        onClick={() => setPage(pageNo)}
                      />
                    ))}
                    <PaginationBtn label={"..."} isActive={false} onClick={() => { }} />
                    {lastThreePageIndices.map((pageNo) => (
                      <PaginationBtn
                        key={pageNo}
                        label={pageNo.toString()}
                        isActive={page === pageNo}
                        onClick={() => setPage(pageNo)}
                      />
                    ))}
                  </>
                ) : (
                  <>
                    {[...Array(totalPages)].map((_, idx) => (
                      <PaginationBtn
                        key={idx + 1}
                        label={(idx + 1).toString()}
                        isActive={page === idx + 1}
                        onClick={() => setPage(idx + 1)}
                      />
                    ))}
                  </>
                )}
              </div>
              <button
                className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <span className="text-[16px]">→</span>
              </button>
            </div>
          );
        };

        return (
          <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
            <div className="flex justify-end items-center mb-6">
              <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                {/* <label className="block mb-1 font-medium">Name<span className="text-red-500 ml-1">*</span></label> */}
                <InputFields
                  type="text"
                  value={promotion.itemName}
                  label="Name"
                  required={true}
                  placeholder="Enter Name"
                  onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                {/* <label className="block mb-1 font-medium">Mode</label> */}
                <InputFields
                  isSingle={true}
                  options={[{ label: "Range", value: "range" }, { label: "Slab", value: "slab" }, { label: "Normal", value: "normal" }]}
                  value={promotion.bundle_combination}
                  label="Mode"
                  required={true}
                  onChange={e => {
                    const val = e.target.value;
                    setPromotion(s => ({ ...s, bundle_combination: val }));
                    setPercentageDiscounts([{ key: "", percentage: "", idx: "0" }]);
                    if (val !== "range") {
                      // Reset to single row if not range
                      setOrderTables(tables => tables.map(arr => [arr[0]]));
                    }
                  }}
                  width="w-full"
                />
              </div>
              <div>
                {/* <label className="block mb-1 font-medium">Start Date<span className="text-red-500 ml-1">*</span></label> */}
                <InputFields
                  type="date"
                  label="Start Date"
                  required={true}
                  value={promotion.startDate}
                  max={promotion.endDate}
                  onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                {/* <label className="block mb-1 font-medium">End Date<span className="text-red-500 ml-1">*</span></label> */}
                <InputFields
                  required={true}
                  label="End Date"
                  type="date"
                  value={promotion.endDate}
                  min={promotion.startDate}
                  onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))}
                  width="w-full"
                />
              </div>


              <div>
                {/* <label className="block mb-1 font-medium">Sales Team Type<span className="text-red-500 ml-1">*</span></label> */}
                <InputFields
                  isSingle={false}
                  required={true}
                  options={salesmanTypeOptions.map((o: any) => ({ ...o, value: String(o.value) }))}
                  value={Array.isArray(promotion.salesTeamType) ? promotion.salesTeamType : (promotion.salesTeamType ? [String(promotion.salesTeamType)] : [])}
                  placeholder="Sales Team Type"
                  label="Sales Team Type"
                  onChange={e => {
                    const val = e.target.value;
                    let selectedValues: string[];
                    if (Array.isArray(val)) {
                      selectedValues = val;
                    } else {
                      selectedValues = val ? [String(val)] : [];
                    }
                    setPromotion(s => ({
                      ...s,
                      salesTeamType: selectedValues,
                      // Clear projectList if "6" (Project) is not in the selection
                      projectList: selectedValues.includes("6") ? s.projectList : []
                    }))
                  }}
                  width="w-full"
                />
              </div>
              {/* Show Project List only when salesTeamType includes id = 6 */}
              {(Array.isArray(promotion.salesTeamType) ? promotion.salesTeamType : [promotion.salesTeamType]).includes("6") && (
                <div>
                  {/* <label className="block mb-1 font-medium">Project List<span className="text-red-500 ml-1">*</span></label> */}
                  <InputFields
                    placeholder=""
                    required={true}
                    label="Project List"
                    isSingle={false}
                    options={projectOptions.map((o: any) => ({ ...o, value: String(o.value) }))}
                    value={Array.isArray(promotion.projectList) ? promotion.projectList : (promotion.projectList ? [String(promotion.projectList)] : [])}
                    onChange={e => {
                      const val = e.target.value;
                      let selectedValues: string[];
                      if (Array.isArray(val)) {
                        selectedValues = val;
                      } else {
                        selectedValues = val ? [String(val)] : [];
                      }
                      setPromotion(s => ({ ...s, projectList: selectedValues }))
                    }}
                    width="w-full"
                  />
                </div>
              )}
              {/* <div>
                <label className="block mb-1 font-medium">Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[ { label: "Range", value: "0" },{ label: "Slab", value: "1" },{ label: "Normal", value: "2" },]}
                  value={promotion.type}
                  onChange={e => setPromotion(s => ({ ...s, type: e.target.value }))}
                  width="w-full"
                />
              </div> */}
              {/* <div>
                <label className="block mb-1 font-medium">Discount Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[ { label: "Fixed", value: "0" },{ label: "Percentage", value: "1" },]}
                  value={promotion.discount_type}
                  onChange={e => setPromotion(s => ({ ...s, discount_type: e.target.value }))}
                  width="w-full"
                />
              </div> */}
              {promotion.bundle_combination === "slab" && (
                <div>
                  {/* <label className="block mb-1 font-medium">Promotion Type<span className="text-red-500 ml-1">*</span></label> */}
                  <InputFields
                    required={true}
                    label="Promotion Type"
                    isSingle={true}
                    options={[{ label: "Quantity", value: "quantity" }, { label: "Percentage", value: "percentage" },]}
                    value={promotion.promotionType}
                    onChange={e => {
                      setPromotion(s => ({ ...s, promotionType: e.target.value }));
                      setPercentageDiscounts([{ key: "", percentage: "", idx: "0" }]);
                    }}
                    width="w-full"
                  />
                </div>
              )}
              <div>
                {/* <label className="block mb-1 font-medium">Status<span className="text-red-500 ml-1">*</span></label> */}
                <InputFields
                  required={true}
                  label="Status"
                  isSingle={true}
                  options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
                  value={promotion.status}
                  onChange={e => setPromotion(s => ({ ...s, status: e.target.value }))}
                  width="w-full"
                />
              </div>
            </div>
            <div className="mt-8">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold text-lg">Promotional Order Item</div>
                  <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-5">
                  {((keyCombo.Item === "Item Category" && promotion.promotionType !== "percentage") || keyCombo.Item === "Item") && (
                    <>
                      <div>
                        {/* <div className="mb-2 text-base font-medium">
                          Item Category
                          <span className="text-red-500 ml-1">*</span>
                        </div> */}
                        <InputFields
                          label="Item Category"
                          required={true}
                          type="select"
                          isSingle={false}
                          options={itemDropdownMap["Item Category"] ? [{ label: `Select Item Category`, value: "" }, ...itemDropdownMap["Item Category"]] : [{ label: `Select Item Category`, value: "" }]}
                          value={keyValue["Item Category"] || []}
                          onChange={e => {
                            const val = e.target.value;
                            let selectedValues: string[];
                            if (Array.isArray(val)) {
                              selectedValues = val;
                            } else {
                              selectedValues = val ? [String(val)] : [];
                            }
                            setKeyValue(s => ({ ...s, "Item Category": selectedValues.filter(v => v !== "") }));
                            // fetchItemsCategoryWise(selectedValues.toString());
                          }}
                          width="w-full"
                        />
                      </div>
                    </>
                  )}
                  {keyCombo.Item === "Item" && promotion.promotionType !== "percentage" && (
                    <div>
                      <div className="mb-2 text-base font-medium">
                        Item
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                      <InputFields
                        label="Item"
                        required={true}
                        type="select"
                        isSingle={false}
                        options={itemDropdownMap["Item"] ? [{ label: `Select Item`, value: "" }, ...itemDropdownMap["Item"]] : [{ label: `Select Item`, value: "" }]}
                        value={keyValue["Item"] || []}
                        showSkeleton={itemLoading}
                        onChange={e => {
                          const val = e.target.value;
                          let selectedValues: string[];
                          if (Array.isArray(val)) {
                            selectedValues = val;
                          } else {
                            selectedValues = val ? [String(val)] : [];
                          }
                          setKeyValue(s => ({ ...s, "Item": selectedValues.filter(v => v !== "") }));
                        }}
                        width="w-full"
                      />
                    </div>
                  )}

                  <div>

                    <InputFields
                      label="UOM"
                      type="select"
                      required={true}
                      isSingle={true}
                      placeholder="Select UOM"
                      options={uomOptions}
                      value={selectedUom}
                      onChange={e => {
                        console.log(e)
                        const val = e.target.value;
                        setSelectedUom(val);
                      }}
                      width="w-full"
                    />
                  </div>
                </div>
                {renderOrderTables()}
                {(promotion.promotionType === "percentage" || (promotion.bundle_combination === "slab" && promotion.promotionType === "quantity")) && renderPercentageDiscountTable()}

              </ContainerCard>

              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-lg">Promotional Offer Items</div>
                <div className="text-sm text-gray-500"><span className="text-red-500">*</span> Required</div>
              </div>
              {(() => {
                // Always treat as array of tables (nested array)
                let offerTables: OfferItemType[][] = [];
                if (Array.isArray(offerItems) && offerItems.length > 0 && Array.isArray((offerItems as unknown[])[0])) {
                  offerTables = offerItems as unknown as OfferItemType[][];
                } else {
                  // Fallback if somehow flat
                  offerTables = [(offerItems as unknown as OfferItemType[])];
                }

                // Helper to update offerItems by tableIdx and rowIdx
                function updateOfferItemTable(tableIdx: number, rowIdx: string, key: string, value: string) {
                  setOfferItems((prev: OfferItemType[][] | any) => {
                    const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev as OfferItemType[][] : [prev as unknown as OfferItemType[]];

                    return tables.map((arr: OfferItemType[], idx: number) =>
                      idx === tableIdx
                        ? arr.map((oi, i) => (String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi))
                        : arr
                    );
                  });
                }



                return offerTables.map((offerArr, tableIdx) => {
                  let offerItemsData = offerArr.map((offerItem: OfferItemType, idx: number) => ({ ...offerItem, idx: String(idx) }));
                  if (offerItemsData.length === 0) {
                    offerItemsData = [{
                      promotionGroupName: "",
                      itemName: "",
                      itemCode: "",
                      uom: "BAG",
                      toQuantity: "",
                      is_discount: "0",
                      idx: "0",
                    }];
                  }
                  const totalPages = Math.ceil(offerItemsData.length / pageSize);
                  const paginatedData = offerItemsData.slice((page - 1) * pageSize, page * pageSize);
                  return (
                    <React.Fragment key={tableIdx}>
                      {tableIdx > 0 && (
                        <div className="flex items-center my-4">
                          <div className="flex-1 h-px bg-gray-300" />
                          <span className="mx-4 font-bold text-gray-500">OR</span>
                          <div className="flex-1 h-px bg-gray-300" />
                        </div>
                      )}
                      <div className="mb-6">
                        <Table

                          data={paginatedData}
                          config={{
                            showNestedLoading: false,
                            columns: [
                              {
                                key: "selectedItem",
                                label: (
                                  <span>
                                    Item
                                    <span className="text-red-500 ml-1">*</span>
                                  </span>
                                ),
                                width: 300,
                                render: (row: any) => (
                                  <InputFields
                                    label="Item"
                                    required={true}
                                    type="select"
                                    isSingle={false}
                                    placeholder="Select Item"
                                    showSkeleton={itemLoading}
                                    options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                                    value={Array.isArray(row.itemCode) ? row.itemCode : (row.itemCode ? [String(row.itemCode)] : [])}
                                    onChange={e => {
                                      const val = e.target.value;
                                      let selectedValues: string[];
                                      if (Array.isArray(val)) {
                                        selectedValues = val;
                                      } else {
                                        selectedValues = val ? [String(val)] : [];
                                      }
                                      selectItemForOffer(tableIdx, row.idx, selectedValues);
                                    }}
                                    width="w-full"
                                  />
                                ),
                              },
                              {
                                key: "uom",
                                label: (
                                  <span>
                                    UOM
                                    <span className="text-red-500 ml-1">*</span>
                                  </span>
                                ),
                                width: 150,
                                render: (row) => {
                                  return (
                                    <InputFields
                                      label=""
                                      type="select"
                                      isSingle={true}
                                      placeholder="Select UOM"
                                      options={uomOptions}
                                      value={String((row as Record<string, unknown>)['uom'] ?? "")}
                                      onChange={e => updateOfferItemTable(tableIdx, row.idx, "uom", e.target.value)}
                                      width="w-full"
                                    />
                                  );
                                }
                              },
                              {
                                key: "action",
                                label: "Action",
                                width: 30,
                                render: (row) => (
                                  <button
                                    type="button"
                                    disabled={String((row as Record<string, unknown>)['idx']) === "0"}
                                    className={`flex  w-full h-full ${String((row as Record<string, unknown>)['idx']) === "0" ? "text-gray-300 cursor-not-allowed" : "text-red-500"}`}
                                    onClick={() => {
                                      if (String((row as Record<string, unknown>)['idx']) === "0") return;
                                      setOfferItems((prev: OfferItemType[][] | any) => {
                                        const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev as OfferItemType[][] : [prev as unknown as OfferItemType[]];
                                        return tables.flatMap((arr, idx) => {
                                          if (idx !== tableIdx) return [arr];
                                          const newArr = arr.filter((oi, i) => String(i) !== String((row as Record<string, unknown>)['idx']));
                                          if (newArr.length === 0 && tables.length > 1) {
                                            return [];
                                          }
                                          return [newArr];
                                        });
                                      });
                                    }}
                                  >
                                    <Icon icon="lucide:trash-2" width={20} />
                                  </button>
                                ),
                              },
                            ],
                            pageSize,
                          }}
                        />
                        {offerItemsData.length > pageSize && renderPaginationBar(totalPages)}
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </ContainerCard>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div className="flex items-center gap-2">
        <Link href="/promotion">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
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
  );
}
