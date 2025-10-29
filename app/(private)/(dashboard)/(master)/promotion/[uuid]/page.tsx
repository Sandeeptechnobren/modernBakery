
"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { itemList,addPromotionHeader ,promotionDetailById,promotionHeaderById} from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import { useRouter } from "next/navigation";
import CustomCheckbox from "@/app/components/customCheckbox";
import * as yup from "yup";

type KeyComboType = {
  Location: string[];
  Customer: string[];
  Item: string[];
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
      { id: "5", label: "Route", isSelected: false },
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
  const [keysArray, setKeysArray] = React.useState<KeyGroup[]>(() => {
    return initialKeys.map(group => ({
      ...group,
      options: group.options.map(opt => ({
        ...opt,
        isSelected: keyCombo[group.type as keyof KeyComboType]?.includes(opt.label) || false
      }))
    }));
  });
  const [selectedKey, setSelectedKey] = React.useState<string>("");

  React.useEffect(() => {
    setKeysArray(prev => {
      const next = initialKeys.map(group => ({
        ...group,
        options: group.options.map(opt => ({
          ...opt,
          isSelected: keyCombo[group.type as keyof KeyComboType]?.includes(opt.label) || false
        }))
      }));
      const isSame = prev.every((group, i) =>
        group.options.every((opt, j) => opt.isSelected === next[i].options[j].isSelected)
      );
      return isSame ? prev : next;
    });
  }, [keyCombo]);

  React.useEffect(() => {
    const selected: { Location: string[]; Customer: string[]; Item: string[] } = { Location: [], Customer: [], Item: [] };
    keysArray.forEach((group) => {
      if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
        selected[group.type] = group.options.filter((o) => o.isSelected).map((o) => o.label);
      }
    });
    setKeyCombo(selected);
  }, [keysArray, setKeyCombo]);

  function onKeySelect(index: number, optionIndex: number) {
    setKeysArray((prev) => {
      const newKeys = prev.map((group, i) => {
        if (i !== index) return group;
        return {
          ...group,
          options: group.options.map((opt, j) =>
            j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
          ),
        };
      });
      return newKeys;
    });
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSelectedKey(e.target.value);
  };

  return (
    <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
      <div className="font-semibold text-[20px] mb-4">Key Combination</div>
      <div className="grid grid-cols-3 gap-6">
        {keysArray.map((group, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm"
          >
            <div className="font-semibold text-[18px] mb-4 text-[#181D27]">{group.type}</div>
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
            const loc = keysArray.find(g => g.type === "Location")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return loc.length > 0 ? loc.map((k, i) => (
              <span key={"loc-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
            )) : null;
          })()}
          {(() => {
            const cust = keysArray.find(g => g.type === "Customer")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return cust.length > 0 ? [
              <span key="slash-cust" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...cust.map((k, i) => (
                <span key={"cust-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
          {(() => {
            const item = keysArray.find(g => g.type === "Item")?.options.filter(o => o.isSelected).map(o => o.label) || [];
            return item.length > 0 ? [
              <span key="slash-item" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...item.map((k, i) => (
                <span key={"item-"+i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}



export default function AddPricing() {
  const params = useParams();
  const rawParam = (params as any)?.uuid ?? (params as any)?.id;
  const id = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const isEditMode = id !== undefined && id !== "add" && id !== "";
  const { item, itemOptions, companyOptions, regionOptions, warehouseOptions, areaOptions, routeOptions, customerTypeOptions, channelOptions, customerCategoryOptions, companyCustomersOptions, itemCategoryOptions, fetchRegionOptions, fetchAreaOptions, fetchWarehouseOptions, fetchRouteOptions, fetchCustomerCategoryOptions, fetchCompanyCustomersOptions, fetchItemOptions } = useAllDropdownListData();
  useEffect(() => {
    async function fetchEditData() {
      if (!isEditMode || !id) return;
      setLoading(true);
      try {
        // Only call promotionHeaderById for edit mode
        const headerRes = await promotionHeaderById(id);
        if (headerRes && typeof headerRes === "object") {
          setPromotion(s => ({
            ...s,
            itemName: headerRes.promotion_name || "",
            from_date: headerRes.from_date || "",
            to_date: headerRes.to_date || "",
            offer_type: headerRes.offer_type || "",
            // type: headerRes.type || "",
            // discount_type: headerRes.discount_type || "",
            discount_apply_on: headerRes.discount_apply_on || "",
            bundle_combination: headerRes.bundle_combination || s.bundle_combination || "",
            status: headerRes.status !== undefined ? String(headerRes.status) : s.status,
          }));
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

  const [loading, setLoading] = useState(false);
  const validateStep = (step: number) => {
    if (step === 1) {
      // Only require the Item key to be selected. Other key groups (Location, Customer)
      // are optional per request.
      return keyCombo.Item.length > 0;
    }
    if (step === 2) {
      // Only require Item Category and Item values in Key Value step.
      // If these selects are present they must have at least one selection.
      const itemCategoryVals = keyValue["Item Category"] || [];
      const itemVals = keyValue["Item"] || [];
      if (!Array.isArray(itemCategoryVals) || itemCategoryVals.length === 0) return false;
      if (!Array.isArray(itemVals) || itemVals.length === 0) return false;
      return true;
    }
    if (step === 3) {
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
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
  // Only validate selected items at payload level. The stricter rule for Item Category
  // and Item selections in Key Value step is enforced separately in the UI validation
  // (validateStep and pre-submit checks).
  item: yup.array().of(yup.string()).min(1, "At least one item is required"),
});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearErrors = () => setErrors({});

 const handleSubmit = async () => {
  clearErrors();
  
  const initialKeys = [
    {
      type: "Location",
      options: [
        { id: "1", label: "Company", isSelected: false },
        { id: "2", label: "Region", isSelected: false },
        { id: "3", label: "Warehouse", isSelected: false },
        { id: "4", label: "Area", isSelected: false },
        { id: "5", label: "Route", isSelected: false },
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

  function getKeyIds(type: string, selectedLabels: string[]): string[] {
    const group = initialKeys.find(g => g.type === type);
    if (!group) return [];
    return selectedLabels.map((label: string) => {
      const found = group.options.find(opt => opt.label === label);
      return found ? found.id : label;
    });
  }

  // ✅ Fix: Join description IDs properly as comma-separated string
  const descriptionIds = [
    ...getKeyIds("Location", keyCombo.Location),
    ...getKeyIds("Customer", keyCombo.Customer),
    ...getKeyIds("Item", keyCombo.Item)
  ];
  const description = descriptionIds.join(",");

  const selectedItemIds = keyValue["Item"] || [];
  
  // ✅ Fix: Flatten promotion details properly
  let promotionDetails: any[] = [];
  if (Array.isArray(offerItems) && offerItems.length > 0 && Array.isArray(offerItems[0])) {
    promotionDetails = offerItems.flat();
  } else {
    promotionDetails = offerItems;
  }

  const payload = {
    promotion_name: promotion.itemName || "",
    from_date: promotion.startDate || "",
    to_date: promotion.endDate || "",
    status: promotion.status || "1",
    offer_type: promotion.offer_type || "",
    // type: promotion.type || "",
    // discount_type: promotion.discount_type || "",
    discount_apply_on: promotion.discount_apply_on || "",
    bundle_combination: promotion.bundle_combination || "",
    item: selectedItemIds,
    description: description,
    
    // ✅ Fix: Ensure pricing array structure
    pricing: selectedItemIds.map(itemId => {
      let itemData = selectedItemDetails.find(item => 
        String(item.code || item.itemCode) === String(itemId)
      );
      if (!itemData) {
        itemData = itemOptions.find(opt => String(opt.value) === String(itemId));
      }

      let itemCode = itemId;
      if (itemData) {
        if (itemData.code) itemCode = itemData.code;
        else if (itemData.itemCode) itemCode = itemData.itemCode;
        else if (itemData.label) {
          const labelParts = String(itemData.label).split(" - ");
          itemCode = labelParts.length > 1 ? labelParts[0] : String(itemData.label);
        }
      }

      const orderItem = orderTables.flat().find(
        (oi: any) => String(oi.itemCode) === String(itemCode)
      );

      return {
        item_id: String(itemId),
        price: orderItem ? Number(orderItem.price) || 0 : 0,
      };
    }),

    // ✅ Fix: Map promotion_details with correct field names
    promotion_details: (promotionDetails || []).map(detail => ({
      lower_qty: Number(detail.quantity || detail.lower_qty) || 0,
      upper_qty: Number(detail.toQuantity || detail.upper_qty) || 0,
      free_qty: Number(detail.free_qty || detail.toQuantity) || 0,
      uom: detail.uom || "CTN",
      promotion_group_name: detail.promotionGroupName || "",
    })),

    // ✅ Add key object for validation
    key: {
      Location: keyCombo.Location,
      Customer: keyCombo.Customer,
      Item: keyCombo.Item,
    }
  };

  try {
    // Pre-submit: ensure Item Category and Item key-values are present
    const missingErrors: Record<string, string> = {};
    if (!keyValue["Item Category"] || keyValue["Item Category"].length === 0) {
      missingErrors["Item Category"] = "Item Category is required";
    }
    if (!keyValue["Item"] || keyValue["Item"].length === 0) {
      missingErrors["Item"] = "Item is required";
    }
    if (Object.keys(missingErrors).length > 0) {
      setErrors(missingErrors);
      showSnackbar("Please fill Item Category and Item before submitting", "error");
      return;
    }

    // ✅ Validate payload-level required pieces (items)
    await pricingValidationSchema.validate(payload, { abortEarly: false });
    
    setLoading(true);
    const res = await addPromotionHeader(payload);
    
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
        validationError.inner.forEach((e: yup.ValidationError) => {
          if (e.path) {
            formErrors[e.path] = e.message;
            console.error(`Validation error at ${e.path}:`, e.message);
          }
        });
      }
      
      setErrors(formErrors);
      showSnackbar("Please fix validation errors before proceeding", "error");
      
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


  type KeyComboType = {
    Location: string[];
    Customer: string[];
    Item: string[];
  };

  const [keyCombo, setKeyCombo] = useState<KeyComboType>({
    Location: [],
    Customer: [],
    Item: [],
  });
  
  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [promotion, setPromotion] = useState({
    itemName: "",
    startDate: "",
    endDate: "",
    offer_type: "",
    // type: "",
    // discount_type: "",
    discount_apply_on : "",
    bundle_combination:"normal",
    status: "1", 
  });

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
    itemCode: string;
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
  const [offerItems, setOfferItems] = useState<OfferItemType[]>([
    { promotionGroupName: "", itemName: "", itemCode: "", uom: "BAG", toQuantity: "", is_discount: "0" },
  ]);

  type ItemDetail = {
    code?: string;
    itemCode?: string;
    name?: string;
    itemName?: string;
    label?: string;
    [key: string]: unknown;
  };
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetail[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  useEffect(() => {
    if (keyValue["Item"] && keyValue["Item"].length > 0) {
      itemList({ ids: keyValue["Item"] })
        .then(data => {
          let items: ItemDetail[] = [];
          if (Array.isArray(data)) {
            items = data as ItemDetail[];
          } else if (data && typeof data === "object" && Array.isArray(data.data)) {
            items = data.data as ItemDetail[];
          }

          // Enrich each returned item with uomSummary from provider `item` state when available
          const ctxItems: any[] = Array.isArray(item) ? item : [];
          const enriched = items.map((it: any) => {
            // match by id or code
            const match = ctxItems.find(ci => String(ci.id) === String(it.id) || String(ci.id) === String(it.code) || String(ci.id) === String(it.itemCode) || String(ci.uuid) === String(it.id));
            const uomSummary = match?.uomSummary ?? match?.uom ?? it.uom ?? [];
            return { ...it, uomSummary };
          });

          setSelectedItemDetails(enriched);
        })
        .catch(err => {
          console.error("Failed to fetch item details", err);
        });
    } else {
      setSelectedItemDetails([]);
    }
  }, [keyValue["Item"], item]);

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
    const channels = keyValue["Channel"];
    if (Array.isArray(channels) && channels.length > 0) {
      try {
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

  // When Item Category selection changes, fetch items for the first selected category.
  useEffect(() => {
    const itemCategories = keyValue["Item Category"];
    if (Array.isArray(itemCategories) && itemCategories.length > 0) {
      try {
        fetchItemOptions(itemCategories[0]);
      } catch (err) {
        console.error("Failed to fetch item options for category", itemCategories[0], err);
      }
    }
  }, [keyValue["Item Category"], fetchItemOptions]);

  // When Item Category selection changes, prefill category on existing table rows
  useEffect(() => {
    const itemCategories = keyValue["Item Category"];
    if (Array.isArray(itemCategories) && itemCategories.length > 0) {
      const firstCat = itemCategories[0];
      // Prefill orderTables' promotionGroupName if empty
      setOrderTables(tables => tables.map(table => table.map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat }))));

      // Prefill offerItems depending on bundle mode. offerItems may be either
      // OfferItemType[] or OfferItemType[][] (bundle mode uses nested arrays).
      const isBundle = promotion.bundle_combination === "slab";
      setOfferItems(prev => {
        const p: any = prev;
        if (isBundle && Array.isArray(p) && p.length > 0 && Array.isArray(p[0])) {
          // nested arrays
          const next = (p as any[][]).map(arr => arr.map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat })));
          return next as unknown as OfferItemType[];
        }
        // flat array
        return (p as any[]).map(row => ({ ...row, promotionGroupName: row.promotionGroupName || firstCat })) as OfferItemType[];
      });
    }
  }, [keyValue["Item Category"]]);


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
        Route: routeOptions,
      };
      const customerDropdownMap: Record<string, DropdownOption[]> = {
        Channel: channelOptions,
        "Customer Category": customerCategoryOptions,
        Customer: companyCustomersOptions,
      };
      const itemDropdownMap: Record<string, DropdownOption[]> = {
        "Item Category": itemCategoryOptions,
        Item: itemOptions,
      };
      return (
        <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
          <h2 className="text-xl font-semibold mb-6">Key Value</h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                <div className="font-semibold text-lg mb-4">Location</div>
                {keyCombo.Location.map((locKey) => (
                  <div key={locKey} className="mb-4">
                    <div className="mb-2 text-base font-medium">{locKey}</div>
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      options={locationDropdownMap[locKey] ? [{ label: `Select ${locKey}`, value: "" }, ...locationDropdownMap[locKey]] : [{ label: `Select ${locKey}`, value: "" }]}
                      value={keyValue[locKey] || []}
                      onChange={e => setKeyValue(s => ({ ...s, [locKey]: Array.isArray(e.target.value) ? e.target.value : [] }))}
                      width="w-full"
                    />
                  </div>
                ))}
              </ContainerCard>
            </div>
            <div className="flex-1">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                <div className="font-semibold text-lg mb-4">Customer</div>
                {keyCombo.Customer.map((custKey) => (
                  <div key={custKey} className="mb-4">
                    <div className="mb-2 text-base font-medium">{custKey}</div>
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      options={customerDropdownMap[custKey] ? [{ label: `Select ${custKey}`, value: "" }, ...customerDropdownMap[custKey]] : [{ label: `Select ${custKey}`, value: "" }]}
                      value={keyValue[custKey] || []}
                      onChange={e => setKeyValue(s => ({ ...s, [custKey]: Array.isArray(e.target.value) ? e.target.value : [] }))}
                      width="w-full"
                    />
                  </div>
                ))}
              </ContainerCard>
            </div>
            <div className="flex-1">
              <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                <div className="font-semibold text-lg mb-4">Item</div>
                {keyCombo.Item.map((itemKey) => (
                  <div key={itemKey} className="mb-4">
                    <div className="mb-2 text-base font-medium">{itemKey}</div>
                    <InputFields
                      label=""
                      type="select"
                      isSingle={false}
                      options={itemDropdownMap[itemKey] ? [{ label: `Select ${itemKey}`, value: "" }, ...itemDropdownMap[itemKey]] : [{ label: `Select ${itemKey}`, value: "" }]}
                      value={keyValue[itemKey] || []}
                      onChange={e => setKeyValue(s => ({ ...s, [itemKey]: Array.isArray(e.target.value) ? e.target.value : [] }))}
                      width="w-full"
                    />
                  </div>
                ))}
              </ContainerCard>
            </div>
          </div>
        </ContainerCard>
      );
    case 3:
      // Helper to update orderItems by row index for a specific table so each row
      // can store independent values even when itemCode is empty or duplicated.
      function updateOrderItem(tableIdx: number, rowIdx: string, key: keyof OrderItemType, value: string) {
        setOrderTables((tables) => tables.map((arr, idx) => {
          if (idx !== tableIdx) return arr;
          return arr.map((oi, i) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi);
        }));
      }

      function updateOfferItem(idx: string, key: keyof OfferItemType, value: string) {
        setOfferItems((arr) => arr.map((oi, i) => String(i) === String(idx) ? { ...oi, [key]: value } : oi));
      }
      // Options built from items selected in Step 2
      const selectedItemOptions = selectedItemDetails.map(d => {
        const name = String(d.name || d.itemName || d.itemName || d.label || "").trim();
        const code = String(d.code || d.itemCode || "").trim();
        const label = code ? `${name} - ${code}` : name;
        const value = code || name || "";
        return { label, value };
      });

      // Helper to set both itemCode and itemName for an order row
      function selectItemForOrder(tableIdx: number, row: any, value: string) {
        const foundItem = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === String(value) || String(it.name || it.itemName || it.label) === String(value)) || (Array.isArray(item) ? (item as any).find((ci: any) => String(ci.id) === String(value) || String(ci.id) === String(value)) : undefined);
        const name = foundItem ? String(foundItem.name || foundItem.itemName || foundItem.label || "") : "";
        // update itemCode then itemName using the row index so it applies to the correct row
        updateOrderItem(tableIdx, row.idx, "itemCode", value);
        updateOrderItem(tableIdx, row.idx, "itemName", name);

        // If UOM data exists on the selected item, prefill uom and price for this order row.
        // Prefer a UOM flagged as primary (uom_type === 'primary'), otherwise use the first available UOM.
        try {
          const uomList: any[] = (foundItem && ((foundItem as any).uomSummary || (foundItem as any).uom)) || [];
          if (Array.isArray(uomList) && uomList.length > 0) {
            const primary = uomList.find(u => String(u.uom_type || '').toLowerCase() === 'primary') || uomList[0];
            const uomName = String(primary?.name ?? primary?.uom ?? '');
            const uomPrice = primary && (primary.price !== undefined && primary.price !== null) ? String(primary.price) : '';
            if (uomName) updateOrderItem(tableIdx, row.idx, 'uom', uomName);
            if (uomPrice) updateOrderItem(tableIdx, row.idx, 'price', uomPrice);
          }
        } catch (err) {
          // non-fatal: skip prefill on error
          console.warn('prefill order uom failed', err);
        }
      }

      // Helper to set both itemCode and itemName for an offer row/table
      function selectItemForOffer(tableIdx: number, rowIdx: string, value: string) {
        const foundItem = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === String(value) || String(it.name || it.itemName || it.label) === String(value)) || (Array.isArray(item) ? (item as any).find((ci: any) => String(ci.id) === String(value) || String(ci.id) === String(value)) : undefined);
        const name = foundItem ? String(foundItem.name || foundItem.itemName || foundItem.label || "") : "";
        // choose primary UOM when available, otherwise first UOM
        const uomListOffer: any[] = (foundItem && ((foundItem as any).uomSummary || (foundItem as any).uom)) || [];
        const primaryUom = Array.isArray(uomListOffer) && uomListOffer.length > 0 ? (uomListOffer.find((uu: any) => String(uu.uom_type || '').toLowerCase() === 'primary') || uomListOffer[0]) : undefined;

        setOfferItems((prev: any) => {
          // bundle mode -> nested arrays
          if (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) {
            return prev.map((arr: any[], idx: number) =>
              idx === tableIdx
                ? arr.map((oi, i) => (String(i) === String(rowIdx) ? { ...oi, itemCode: value, itemName: name, uom: primaryUom ? String(primaryUom.name ?? '') : (oi.uom ?? '') } : oi))
                : arr
            );
          }
          // normal single array mode
          return prev.map((oi: any, i: number) => (String(i) === String(rowIdx) ? { ...oi, itemCode: value, itemName: name, uom: primaryUom ? String(primaryUom.name ?? '') : (oi.uom ?? '') } : oi));
        });
      }

      // Clamp percentage inputs to 0-100 when discount_apply_on is Percentage
      function clampPercentInput(val: string) {
        if (promotion.discount_apply_on !== "1") return val;
        const n = Number(val);
        if (Number.isNaN(n)) return "";
        const clamped = Math.max(0, Math.min(100, n));
        return String(clamped);
      }
      // Build UOM options for a given table row using selectedItemDetails or provider `item`.
      // Always returns an array of options so the UI can render a select dropdown.
      function getUomOptionsForRow(row: any) {
        const codeOrName = String(row.itemCode || row.itemName || "");
        let itemObj: any = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === codeOrName || String(it.name || it.itemName || it.label) === codeOrName);
        if (!itemObj && Array.isArray(item)) {
          itemObj = (item as any).find((ci: any) => String(ci.id) === codeOrName || String(ci.code) === codeOrName || String(ci.label) === codeOrName || String(ci.name) === codeOrName);
        }
        const uoms = (itemObj && (itemObj.uomSummary || itemObj.uom)) || [];
        // If no uoms available return a single placeholder option (so dropdown always shows)
        if (!Array.isArray(uoms) || uoms.length === 0) {
          const fallback = String(row.uom || "");
          if (fallback) return [{ label: fallback, value: fallback, price: undefined }];
          return [{ label: "-", value: "", price: undefined }];
        }
        return uoms.map((u: any) => ({ label: `${u.name}${u.uom_type ? ` (${u.uom_type})` : ""}${u.price ? ` - ${u.price}` : ""}`, value: String(u.name), price: u.price }));
      }
      // Render all order tables
      const renderOrderTables = () => {
        const isBundle = promotion.bundle_combination === "slab";
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
          const totalPages = Math.ceil(itemsData.length / pageSize);
          const paginatedData = itemsData.slice((page - 1) * pageSize, page * pageSize);
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
                      columns: (isBundle ? [
                        // Slab (bundle) mode: keep existing detailed columns
                       
                        {
                          key: "quantity",
                          label: (promotion.discount_apply_on === "1") ? "Percentage" : "From Quantity",
                            render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              value={row.quantity || ""}
                              onChange={e => updateOrderItem(tableIdx, row.idx, "quantity", clampPercentInput(e.target.value))}
                              width="w-full"
                            />
                          ),
                        },
                        {
                          key: "toQuantity",
                          label: (promotion.discount_apply_on === "1") ? "To Percentage" : "To Quantity",
                          render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              value={row.toQuantity || ""}
                              onChange={e => updateOrderItem(tableIdx, row.idx, "toQuantity", clampPercentInput(e.target.value))}
                              width="w-full"
                            />
                          ),
                        },
                        {
                          key: "uom",
                          label: "UOM",
                          render: (row) => {
                            const uomOptions = getUomOptionsForRow(row);
                            return (
                              <InputFields
                                label=""
                                type="select"
                                isSingle={true}
                                options={[{ label: `Select UOM`, value: "" }, ...uomOptions.map((o: any) => ({ label: o.label, value: o.value }))]}
                                value={row.uom || ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  updateOrderItem(tableIdx, row.idx, "uom", val);
                                  const found = uomOptions.find((u: any) => String(u.value) === String(val));
                                  if (found) updateOrderItem(tableIdx, row.idx, "price", String(found.price ?? ""));
                                }}
                                width="w-full"
                              />
                            );
                          }
                        },
                        // If offer_type is Item Range (0), show Item column populated from Step-2 selected items
                        ...(promotion.offer_type === "0" ? [
                          {
                            key: "selectedItem",
                            label: "Item",
                            render: (row: any) => (
                              <InputFields
                                label=""
                                type="select"
                                isSingle={true}
                                options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                                value={row.itemCode || ""}
                                onChange={e => selectItemForOrder(tableIdx, row, e.target.value)}
                                width="w-full"
                              />
                            ),
                          }
                        ] : []),

                        // If offer_type is Category Range (1), show Category column populated from Item Category options
                        ...(promotion.offer_type === "1" ? [
                          {
                            key: "promotionGroupName",
                            label: "Category",
                            render: (row: any) => (
                              <InputFields
                                label=""
                                type="select"
                                isSingle={true}
                                options={[{ label: `Select Category`, value: "" }, ...itemCategoryOptions]}
                                value={row.promotionGroupName || ""}
                                onChange={e => updateOrderItem(tableIdx, row.idx, "promotionGroupName", e.target.value)}
                                width="w-full"
                              />
                            ),
                          }
                        ] : []),
                        {
                          key: "free_qty",
                          label: "Free Qty",
                          render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              value={row.free_qty || ""}
                              onChange={e => updateOrderItem(tableIdx, row.idx, "free_qty", e.target.value)}
                              width="w-full"
                            />
                          ),
                        },
                      ] : [
                        // Normal mode: simplified order item columns (Qty, UOM)
                        // If offer_type is Item Range (0), show Item column populated from Step-2 selected items
                        ...(promotion.offer_type === "0" ? [
                          {
                            key: "selectedItem",
                            label: "Item",
                            render: (row: any) => (
                              <InputFields
                                label=""
                                type="select"
                                isSingle={true}
                                options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                                value={row.itemCode || ""}
                                onChange={e => selectItemForOrder(tableIdx, row, e.target.value)}
                                width="w-full"
                              />
                            ),
                          }
                        ] : []),

                        ...(promotion.offer_type === "1" ? [
                          {
                            key: "promotionGroupName",
                            label: "Category",
                            render: (row: any) => (
                              <InputFields
                                label=""
                                type="select"
                                isSingle={false}
                                options={[{ label: `Select Category`, value: "" }, ...itemCategoryOptions]}
                                value={row.promotionGroupName || ""}
                                onChange={e => updateOrderItem(tableIdx, row.idx, "promotionGroupName", e.target.value)}
                                width="w-full"
                              />
                            ),
                          }
                        ] : []),
                        {
                          key: "quantity",
                          label: (promotion.discount_apply_on === "1") ? "Percentage" : "Qty",
                          render: (row) => (
                            <InputFields
                              label=""
                              type="number"
                              value={row.quantity || ""}
                              onChange={e => updateOrderItem(tableIdx, row.idx, "quantity", clampPercentInput(e.target.value))}
                              width="w-full"
                            />
                          ),
                        },
                        {
                          key: "uom",
                          label: "UOM",
                          render: (row) => (
                            <InputFields
                              label=""
                              type="text"
                              value={row.uom || ""}
                              onChange={e => updateOrderItem(tableIdx, row.idx, "uom", e.target.value)}
                              width="w-full"
                            />
                          ),
                        },
                       
                      ]),
                      rowActions: [
                      {
                        icon: "material-symbols:add-circle-outline",
                        onClick: () => {
                          if (promotion.bundle_combination === "slab") {
                            // In slab mode, add a new row to the current table (tableIdx)
                            setOrderTables(tables => tables.map((arr, idx) => idx === tableIdx ? [
                              ...arr,
                              {
                                promotionGroupName: "",
                                itemName: "",
                                itemCode: "",
                                quantity: "",
                                toQuantity: "",
                                uom: "CTN",
                                price: "",
                                free_qty: "",
                              }
                            ] : arr));
                          } else {
                            // Add a new row to the last table
                            setOrderTables(tables =>
                              tables.map((arr, idx) =>
                                idx === tables.length - 1
                                  ? [
                                      ...arr,
                                      {
                                        promotionGroupName: "",
                                        itemName: "",
                                        itemCode: "",
                                        quantity: "",
                                        toQuantity: "",
                                        uom: "CTN",
                                        price: "",
                                        free_qty: "",
                                      }
                                    ]
                                  : arr
                              )
                            );
                          }
                        },
                      },
                      {
                        icon: "lucide:trash-2",
                        onClick: (row) => {
                          setOrderTables(tables => {
                            return tables.flatMap((arr, idx) => {
                              if (idx !== tableIdx) return [arr];
                              // Remove the row from the correct table
                              const newArr = arr.filter((oi, i) => String(i) !== String(row.idx));
                              // If the table is now empty and there is more than one table, remove the table
                              if (newArr.length === 0 && tables.length > 1) {
                                return [];
                              }
                              return [newArr];
                            });
                          });
                        },
                      },
                    ],
                    pageSize,
                  }}
                />
                {itemsData.length > pageSize && renderPaginationBar(totalPages)}
              </div>
            </React.Fragment>
          );
        });
      };

      // Show all offerItems, including custom added rows
      let offerItemsData: OfferItemType[] = offerItems.map((offerItem, idx) => ({
        ...offerItem,
        idx: String(idx),
      }));
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
          className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center mx-[2px] text-[14px] font-semibold transition-colors duration-150 border-none outline-none focus:ring-2 focus:ring-[#EA0A2A] select-none ${
            isActive ? "bg-[#FFF0F2] text-[#EA0A2A] shadow-sm" : "bg-white text-[#717680] hover:bg-[#F5F5F5]"
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
                  <PaginationBtn label={"..."} isActive={false} onClick={() => {}} />
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
          <h2 className="text-xl font-semibold mb-6">Promotion</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block mb-1 font-medium">Name<span className="text-red-500 ml-1">*</span></label>
              <InputFields
                type="text"
                value={promotion.itemName}
                onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))}
                width="w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Start Date<span className="text-red-500 ml-1">*</span></label>
              <InputFields
                type="date"
                value={promotion.startDate}
                onChange={e => setPromotion(s => ({ ...s, startDate: e.target.value }))}
                width="w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Date<span className="text-red-500 ml-1">*</span></label>
              <InputFields
                type="date"
                value={promotion.endDate}
                onChange={e => setPromotion(s => ({ ...s, endDate: e.target.value }))}
                width="w-full"
              />
            </div>
             
              <div>
                <label className="block mb-1 font-medium">Offer Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[{ label: "Category Range", value: "1" }, { label: "Item Range", value: "0" }]}
                  value={promotion.offer_type}
                  onChange={e => setPromotion(s => ({ ...s, offer_type: e.target.value }))}
                  width="w-full"
                />
              </div>
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
              <div>
                <label className="block mb-1 font-medium">Discount Apply On<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[ { label: "Quantity", value: "0" },{ label: "Percentage", value: "1" },]}
                  value={promotion.discount_apply_on}
                  onChange={e => setPromotion(s => ({ ...s, discount_apply_on: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  type="radio"
                  isSingle={true}
                  options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
                  value={promotion.status}
                  onChange={e => setPromotion(s => ({ ...s, status: e.target.value }))}
                  width="w-full"
                />
              </div>
          </div>
          <div className="mt-8">
            <div className="mb-4">
              <label className="block mb-1 font-medium">Mode</label>
              <InputFields
                type="radio"
                isSingle={true}
                options={[{ label: "Normal", value: "normal" }, { label: "Slab", value: "slab" }]}
                value={promotion.bundle_combination}
                onChange={e => setPromotion(s => ({ ...s, bundle_combination: e.target.value }))}
                width="w-full"
              />
            </div>
            <div className="font-semibold text-lg mb-4">Promotional Order Items</div>
            {renderOrderTables()}
            <div className="font-semibold text-lg mb-4">Promotional Offer Items</div>
            <div className="mb-6">
              {/* Multi-table logic for offerItems, similar to orderTables */}
              {(() => {
                // If 'slab' mode is selected, treat offerItems as an array of tables (array of arrays)
                const isBundle = promotion.bundle_combination === "slab";
                // For backward compatibility, if offerItems is not an array of arrays, wrap it
                let offerTables: any[][] = [];
                  if (isBundle) {
                  // If offerItems is already an array of arrays, use as is, else wrap each object in its own array
                  if (Array.isArray(offerItems) && offerItems.length > 0 && Array.isArray((offerItems as any)[0])) {
                    // Cast via unknown first to satisfy TypeScript when converting between incompatible array shapes
                    offerTables = offerItems as unknown as any[][];
                  } else {
                    offerTables = offerItems.map((oi: any) => [oi]);
                  }
                } else {
                  // Single table mode
                  offerTables = [offerItems];
                }

                // Helper to update offerItems by tableIdx and rowIdx
                function updateOfferItemTable(tableIdx: number, rowIdx: string, key: string, value: string) {
                  setOfferItems((prev: any) => {
                    if (isBundle) {
                      return prev.map((arr: any[], idx: number) =>
                        idx === tableIdx
                          ? arr.map((oi, i) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi)
                          : arr
                      );
                    } else {
                      return prev.map((oi: any, i: number) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi);
                    }
                  });
                }

                // Helper to add a new table or row
                function addOfferItem(tableIdx: number) {
                  if (isBundle) {
                    setOfferItems((prev: any) => ([
                      ...prev,
                      [
                        {
                          promotionGroupName: "",
                          itemName: "",
                          itemCode: "",
                          uom: "BAG",
                          toQuantity: "",
                          is_discount: "0"
                        }
                      ]
                    ]));
                  } else {
                    setOfferItems((prev: any) => ([
                      ...prev,
                      {
                        promotionGroupName: "",
                        itemName: "",
                        itemCode: "",
                        uom: "BAG",
                        toQuantity: "",
                        is_discount: "0"
                      }
                    ]));
                  }
                }

                // Helper to add a row to a specific table (only for bundle mode)
                function addRowToOfferTable(tableIdx: number) {
                  setOfferItems((prev: any) =>
                    prev.map((arr: any[], idx: number) =>
                      idx === tableIdx
                        ? [
                            ...arr,
                            {
                              promotionGroupName: "",
                              itemName: "",
                              itemCode: "",
                              uom: "BAG",
                              toQuantity: "",
                              is_discount: "0"
                            }
                          ]
                        : arr
                    )
                  );
                }

                // Helper to delete a row or table
                function deleteOfferItem(tableIdx: number, rowIdx: string) {
                  setOfferItems((prev: any) => {
                    if (isBundle) {
                      // Remove row from the correct table
                      const newTables = prev.map((arr: any[], idx: number) => {
                        if (idx !== tableIdx) return arr;
                        const filtered = arr.filter((oi, i) => String(i) !== String(rowIdx));
                        return filtered;
                      });
                      // Remove table if empty and more than one table exists
                      const filteredTables = newTables.filter((arr: any[]) => arr.length > 0);
                      return filteredTables.length > 0 ? filteredTables : [[{
                        promotionGroupName: "",
                        itemName: "",
                        itemCode: "",
                        uom: "BAG",
                        toQuantity: "",
                        is_discount: "0"
                      }]];
                    } else {
                      // Only allow delete if more than one row exists
                      if (prev.length > 1) {
                        return prev.filter((_: any, idx: number) => idx !== Number(rowIdx));
                      }
                      return prev;
                    }
                  });
                }

                return offerTables.map((offerArr, tableIdx) => {
                  let offerItemsData = offerArr.map((offerItem, idx) => ({ ...offerItem, idx: String(idx) }));
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
                      {isBundle && tableIdx > 0 && (
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
                            columns: (isBundle ? [
                                  // If offer_type is Item Range (0), show Item column populated from Step-2 selected items
                                  ...(promotion.offer_type === "0" ? [
                                    {
                                      key: "selectedItem",
                                      label: "Item",
                                      render: (row: any) => (
                                        <InputFields
                                          label=""
                                          type="select"
                                          isSingle={true}
                                          options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                                          value={row.itemCode || ""}
                                          onChange={e => selectItemForOffer(tableIdx, row.idx, e.target.value)}
                                          width="w-full"
                                        />
                                      ),
                                    }
                                  ] : []),

                                  ...(promotion.offer_type === "1" ? [
                                    {
                                      key: "promotionGroupName",
                                      label: "Category",
                                      render: (row: any) => (
                                        <InputFields
                                          label=""
                                          type="select"
                                          isSingle={false}
                                          options={[{ label: `Select Category`, value: "" }, ...itemCategoryOptions]}
                                          value={row.promotionGroupName || ""}
                                          onChange={e => updateOfferItemTable(tableIdx, row.idx, "promotionGroupName", e.target.value)}
                                          width="w-full"
                                        />
                                      ),
                                    }
                                  ] : []),
                              {
                                key: "itemName",
                                label: "Item Name",
                                render: (row) => (
                                  <InputFields
                                    label=""
                                    type="text"
                                    value={row.itemName || ""}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "itemName", e.target.value)}
                                    width="w-full"
                                  />
                                ),
                              },
                            
                             
                              {
                                key: "uom",
                                label: "UOM",
                                render: (row) => {
                                  const uomOptions = getUomOptionsForRow(row);
                                  return (
                                    <InputFields
                                      label=""
                                      type="select"
                                      isSingle={true}
                                      options={[{ label: `Select UOM`, value: "" }, ...uomOptions.map((o: any) => ({ label: o.label, value: o.value }))]}
                                      value={row.uom || ""}
                                      onChange={e => updateOfferItemTable(tableIdx, row.idx, "uom", e.target.value)}
                                      width="w-full"
                                    />
                                  );
                                }
                              },
                             
                              
                            ] : [
                                // If offer_type is Item Range (0), show Item column populated from Step-2 selected items
                                ...(promotion.offer_type === "0" ? [
                                  {
                                    key: "selectedItem",
                                    label: "Item",
                                    render: (row: any) => (
                                      <InputFields
                                        label=""
                                        type="select"
                                        isSingle={true}
                                        options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                                        value={row.itemCode || ""}
                                        onChange={e => selectItemForOffer(tableIdx, row.idx, e.target.value)}
                                        width="w-full"
                                      />
                                    ),
                                  }
                                ] : []),

                                ...(promotion.offer_type === "1" ? [
                                  {
                                    key: "promotionGroupName",
                                    label: "Category",
                                    render: (row: any) => (
                                      <InputFields
                                        label=""
                                        type="select"
                                        isSingle={true}
                                        options={[{ label: `Select Category`, value: "" }, ...itemCategoryOptions]}
                                        value={row.promotionGroupName || ""}
                                        onChange={e => updateOfferItemTable(tableIdx, row.idx, "promotionGroupName", e.target.value)}
                                        width="w-full"
                                      />
                                    ),
                                  }
                                ] : []),
                              // Normal mode: Offer items simplified to Item Name, UOM, Qty
                              {
                                key: "itemName",
                                label: "Item Name",
                                render: (row) => (
                                  <InputFields
                                    label=""
                                    type="text"
                                    value={row.itemName || ""}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "itemName", e.target.value)}
                                    width="w-full"
                                  />
                                ),
                              },
                              {
                                key: "uom",
                                label: "UOM",
                                render: (row) => (
                                  <InputFields
                                    label=""
                                    type="text"
                                    value={row.uom || ""}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "uom", e.target.value)}
                                    width="w-full"
                                  />
                                ),
                              },
                              {
                                key: "toQuantity",
                                label: (promotion.discount_apply_on === "1") ? "Percentage" : "Qty",
                                render: (row) => (
                                  <InputFields
                                    label=""
                                    type="number"
                                    value={row.toQuantity || ""}
                                      onChange={e => updateOfferItemTable(tableIdx, row.idx, "toQuantity", clampPercentInput(e.target.value))}
                                    width="w-full"
                                  />
                                ),
                              },
                            ]),
                            rowActions: [
                              {
                                icon: "material-symbols:add-circle-outline",
                                onClick: () => addOfferItem(tableIdx),
                              },
                              {
                                icon: "lucide:trash-2",
                                onClick: (row: any) => deleteOfferItem(tableIdx, row.idx),
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
          </div>

        </ContainerCard>
      );
    default:
      return null;
  }
};

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href="/promotion">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Edit Promotion" : "Add Promotion"}
        </h1>
      </div>
      <div className="flex justify-between items-center mb-6 pb-6">
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
          submitButtonText={isEditMode ? "Update" : "Submit"}
        >
          {renderStepContent()}
        </StepperForm>
      </div>
    </>
  );
}
