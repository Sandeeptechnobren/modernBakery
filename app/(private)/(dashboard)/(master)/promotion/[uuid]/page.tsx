
"use client";
import StepperForm, { useStepperForm, StepperStep } from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { itemList, addPromotionHeader, promotionDetailById, promotionHeaderById } from "@/app/services/allApi";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import { useRouter } from "next/navigation";
import CustomCheckbox from "@/app/components/customCheckbox";
import * as yup from "yup";

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
  const [keysArray, setKeysArray] = React.useState<KeyGroup[]>(() => {
    return initialKeys.map(group => ({
      ...group,
      options: group.options.map(opt => ({
        ...opt,
        isSelected: keyCombo[group.type as keyof KeyComboType] === opt.label
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
          isSelected: keyCombo[group.type as keyof KeyComboType] === opt.label
        }))
      }));
      const isSame = prev.every((group, i) =>
        group.options.every((opt, j) => opt.isSelected === next[i].options[j].isSelected)
      );
      return isSame ? prev : next;
    });
  }, [keyCombo]);

  React.useEffect(() => {
    const selected: { Location: string; Customer: string; Item: string } = { Location: "", Customer: "", Item: "" };
    keysArray.forEach((group) => {
      if (group.type === "Location" || group.type === "Customer" || group.type === "Item") {
        const found = group.options.find((o) => o.isSelected);
        selected[group.type as keyof KeyComboType] = found ? found.label : "";
      }
    });
    setKeyCombo(selected);
  }, [keysArray, setKeyCombo]);

  function onKeySelect(index: number, optionIndex: number) {
    setKeysArray((prev) => {
      const newKeys = prev.map((group, i) => {
        if (i !== index) return group; // If not the current group, return as is

        // Determine if this group should be single-select
        // All groups (Location, Customer, Item) are now single-select as per request
        const isSingleSelectGroup = true;

        if (isSingleSelectGroup) {
          // Single-select logic: Toggle the clicked option, deselect others
          return {
            ...group,
            options: group.options.map((opt, j) => {
              if (j === optionIndex) {
                // Toggle the clicked option
                return { ...opt, isSelected: !opt.isSelected };
              } else {
                // Deselect all other options in this group
                return { ...opt, isSelected: false };
              }
            }),
          };
        } else {
          // Multi-select logic (original behavior for Customer)
          return {
            ...group,
            options: group.options.map((opt, j) =>
              j === optionIndex ? { ...opt, isSelected: !opt.isSelected } : opt
            ),
          };
        }
      });
      return newKeys;
    });
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSelectedKey(e.target.value);
  };

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
  const { item, itemOptions, companyOptions, regionOptions, warehouseOptions, areaOptions, routeOptions, customerTypeOptions, channelOptions, customerCategoryOptions, companyCustomersOptions, itemCategoryOptions, fetchRegionOptions, fetchAreaOptions, fetchWarehouseOptions, fetchRouteOptions, fetchCustomerCategoryOptions, fetchCompanyCustomersOptions, fetchItemOptions, salesmanTypeOptions, projectOptions } = useAllDropdownListData();
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
            promotionType: headerRes.promotionType || "",
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

      if (keyCombo.Item) {
        if (!keyValue[keyCombo.Item] || keyValue[keyCombo.Item].length === 0) {
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

    function getKeyId(type: string, label: string): string {
      const group = initialKeys.find(g => g.type === type);
      if (!group) return "";
      const found = group.options.find(opt => opt.label === label);
      return found ? found.id : label;
    }

    // ✅ Fix: Join description IDs properly as comma-separated string
    const descriptionIds = [
      getKeyId("Location", keyCombo.Location),
      getKeyId("Customer", keyCombo.Customer),
      getKeyId("Item", keyCombo.Item)
    ].filter(Boolean);
    const description = descriptionIds.join(",");

    const selectedItemIds = keyValue["Item"] || [];

    // ✅ Fix: Flatten promotion details properly
    type PromotionDetailInput = {
      quantity?: string | number;
      lower_qty?: string | number;
      toQuantity?: string | number;
      upper_qty?: string | number;
      free_qty?: string | number;
      uom?: string;
      promotionGroupName?: string;
    };

    let promotionDetails: PromotionDetailInput[] = [];
    if (Array.isArray(offerItems) && offerItems.length > 0 && Array.isArray(offerItems[0])) {
      promotionDetails = (offerItems as unknown as PromotionDetailInput[][]).flat();
    } else {
      promotionDetails = offerItems as unknown as PromotionDetailInput[];
    }

    const payload = {
      promotion_name: promotion.itemName || "",
      from_date: promotion.startDate || "",
      to_date: promotion.endDate || "",
      status: promotion.status || "1",
      // discount_type: "",
      promotionType: promotion.promotionType || "",
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
          (oi: OrderItemType) => String(oi.itemCode) === String(itemCode)
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
        Location: keyCombo.Location ? [keyCombo.Location] : [],
        Customer: keyCombo.Customer ? [keyCombo.Customer] : [],
        Item: keyCombo.Item ? [keyCombo.Item] : [],
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
    salesTeamType: "",
    projectList: "",
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
  const [offerItems, setOfferItems] = useState<OfferItemType[][]>([
    [{ promotionGroupName: "", itemName: "", itemCode: "", uom: "BAG", toQuantity: "", is_discount: "0" }],
  ]);

  type ItemDetail = {
    code?: string;
    itemCode?: string;
    name?: string;
    itemName?: string;
    label?: string;
    [key: string]: unknown;
  };
  type Uom = { name?: string; uom?: string; uom_type?: string; price?: number | string;[k: string]: unknown };
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
          const ctxItems: ItemDetail[] = Array.isArray(item) ? (item as ItemDetail[]) : [];
          const enriched = items.map((it: ItemDetail) => {
            // match by id or code
            const match = ctxItems.find(ci => String((ci as Record<string, unknown>)['id'] ?? (ci as Record<string, unknown>)['code'] ?? (ci as Record<string, unknown>)['itemCode'] ?? '') === String(it.id ?? it.code ?? it.itemCode ?? ''));
            const maybeUomSummary = match ? ((match as Record<string, unknown>)['uomSummary'] ?? (match as Record<string, unknown>)['uom']) : undefined;
            const uomSummary = Array.isArray(maybeUomSummary) ? (maybeUomSummary as unknown[]) : (Array.isArray((it as Record<string, unknown>)['uom']) ? (it as Record<string, unknown>)['uom'] as unknown[] : []);
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
    // Clear promotionType if bundle_combination is not 'range'
    if (promotion.bundle_combination !== "range" && promotion.promotionType !== "") {
      setPromotion(s => ({ ...s, promotionType: "" }));
    }
  }, [promotion.bundle_combination, promotion.promotionType]);

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
                        isSingle={true}
                        options={locationDropdownMap[keyCombo.Location] ? [{ label: `Select ${keyCombo.Location}`, value: "" }, ...locationDropdownMap[keyCombo.Location]] : [{ label: `Select ${keyCombo.Location}`, value: "" }]}
                        value={keyValue[keyCombo.Location]?.[0] || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setKeyValue(s => ({ ...s, [keyCombo.Location]: val ? [val] : [] }));
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
              <div className="flex-1">
                <ContainerCard className="bg-[#fff] border border-[#E5E7EB] rounded-xl p-6">
                  <div className="font-semibold text-lg mb-4">Item</div>
                  {keyCombo.Item && (
                    <div className="mb-4">
                      <div className="mb-2 text-base font-medium">
                        {keyCombo.Item}
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                      <InputFields
                        label=""
                        type="select"
                        isSingle={true}
                        options={itemDropdownMap[keyCombo.Item] ? [{ label: `Select ${keyCombo.Item}`, value: "" }, ...itemDropdownMap[keyCombo.Item]] : [{ label: `Select ${keyCombo.Item}`, value: "" }]}
                        value={keyValue[keyCombo.Item]?.[0] || ""}
                        onChange={e => {
                          const val = e.target.value;
                          setKeyValue(s => ({ ...s, [keyCombo.Item]: val ? [val] : [] }));
                        }}
                        width="w-full"
                      />
                    </div>
                  )}
                </ContainerCard>
              </div>
            </div>
          </ContainerCard>
        );
      case 3:
        // Helper to update orderItems by row index for a specific table so each row
        // can store independent values even when itemCode is empty or duplicated.
        function updateOrderItem(tableIdx: number, rowIdx: string | undefined, key: keyof OrderItemType, value: string) {
          setOrderTables((tables) => tables.map((arr, idx) => {
            if (idx !== tableIdx) return arr;
            return arr.map((oi, i) => String(i) === String(rowIdx) ? { ...oi, [key]: value } : oi);
          }));
        }


        // Options built from items selected in Step 2
        const selectedItemOptions = selectedItemDetails.map(d => {
          const name = String(d.name || d.itemName || d.itemName || d.label || "").trim();
          const code = String(d.code || d.itemCode || "").trim();
          const label = code ? `${name} - ${code}` : name;
          const value = code || name || "";
          return { label, value };
        });



        // Helper to set both itemCode and itemName for an offer row/table
        function selectItemForOffer(tableIdx: number, rowIdx: string, value: string) {
          const providerItems: ItemDetail[] = Array.isArray(item) ? (item as ItemDetail[]) : [];
          const foundItem = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === String(value) || String(it.name || it.itemName || it.label) === String(value)) || providerItems.find((ci) => String((ci as Record<string, unknown>)['id'] ?? '') === String(value));
          const name = foundItem ? String(foundItem.name || foundItem.itemName || foundItem.label || "") : "";
          // choose primary UOM when available, otherwise first UOM
          const uomListOffer = foundItem ? ((foundItem as Record<string, unknown>)['uomSummary'] ?? (foundItem as Record<string, unknown>)['uom']) : undefined;
          const primaryUom = Array.isArray(uomListOffer) && uomListOffer.length > 0 ? ((uomListOffer as Uom[]).find((uu) => String(uu.uom_type || '').toLowerCase() === 'primary') || (uomListOffer as Uom[])[0]) : undefined;

          setOfferItems((prev: OfferItemType[][] | any) => {
             // Always treat as nested array
             const tables = (Array.isArray(prev) && prev.length > 0 && Array.isArray(prev[0])) ? prev as OfferItemType[][] : [prev as unknown as OfferItemType[]];
             
             return tables.map((arr: OfferItemType[], idx: number) =>
                idx === tableIdx
                  ? arr.map((oi, i) => (String(i) === String(rowIdx) ? { ...oi, itemCode: value, itemName: name, uom: primaryUom ? String((primaryUom as Record<string, unknown>)['name'] ?? '') : (oi.uom ?? '') } : oi))
                  : arr
              );
          });
        }

        // Clamp percentage inputs to 0-100 when promotionType is Percentage
        function clampPercentInput(val: string) {
          if (promotion.promotionType !== "1") return val;
          const n = Number(val);
          if (Number.isNaN(n)) return "";
          const clamped = Math.max(0, Math.min(100, n));
          return String(clamped);
        }
        // Build UOM options for a given table row using selectedItemDetails or provider `item`.
        // Always returns an array of options so the UI can render a select dropdown.
        function getUomOptionsForRow(row: Record<string, unknown>) {
          const codeOrName = String((row as Record<string, unknown>)['itemCode'] ?? (row as Record<string, unknown>)['itemName'] ?? "");
          let itemObj: ItemDetail | undefined = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === codeOrName || String(it.name || it.itemName || it.label) === codeOrName);
          if (!itemObj && Array.isArray(item)) {
            itemObj = (item as ItemDetail[]).find((ci) => String((ci as Record<string, unknown>)['id'] ?? (ci as Record<string, unknown>)['code'] ?? '') === codeOrName || String((ci as Record<string, unknown>)['label'] ?? (ci as Record<string, unknown>)['name'] ?? '') === codeOrName);
          }
          const uoms = (itemObj ? ((itemObj as Record<string, unknown>)['uomSummary'] ?? (itemObj as Record<string, unknown>)['uom']) : undefined) ?? [];
          // If no uoms available return a single placeholder option (so dropdown always shows)
          if (!Array.isArray(uoms) || uoms.length === 0) {
            const fallback = String(row.uom || "");
            if (fallback) return [{ label: fallback, value: fallback, price: undefined }];
            return [{ label: "-", value: "", price: undefined }];
          }
          return (uoms as Uom[]).map((u) => ({ label: `${u.name ?? u.uom ?? ""}${u.uom_type ? ` (${u.uom_type})` : ""}${u.price ? ` - ${u.price}` : ""}`, value: String(u.name ?? u.uom ?? ""), price: u.price }));
        }
        // Helper to set item for the whole order table
        function selectItemForOrderTable(tableIdx: number, value: string) {
          const providerItems: ItemDetail[] = Array.isArray(item) ? (item as ItemDetail[]) : [];
          const foundItem = selectedItemDetails.find(it => String(it.code || it.itemCode || it.label) === String(value) || String(it.name || it.itemName || it.label) === String(value)) || providerItems.find((ci) => String((ci as Record<string, unknown>)['id'] ?? '') === String(value));
          
          const name = foundItem ? String(foundItem.name || foundItem.itemName || foundItem.label || "") : "";
          
           // Get primary UOM
           const uomList = (foundItem ? ((foundItem as Record<string, unknown>)['uomSummary'] ?? (foundItem as Record<string, unknown>)['uom']) : undefined) as unknown;
           let uomName = "CTN";
           let uomPrice = "";
           if (Array.isArray(uomList) && uomList.length > 0) {
              const uomArr = uomList as Uom[];
              const primary = uomArr.find(u => String(u.uom_type || '').toLowerCase() === 'primary') || uomArr[0];
              uomName = String(primary?.name ?? primary?.uom ?? '');
              uomPrice = primary && (primary.price !== undefined && primary.price !== null) ? String(primary.price) : '';
           }

          setOrderTables((tables) => tables.map((arr, idx) => {
            if (idx !== tableIdx) return arr;
            
            if (arr.length === 0) {
                 // Create a new row if empty
                 return [{
                    promotionGroupName: "", 
                    itemName: name,
                    itemCode: value,
                    quantity: "",
                    toQuantity: "",
                    uom: uomName,
                    price: uomPrice,
                    free_qty: "",
                 }];
            }

            return arr.map((oi) => ({ 
                ...oi, 
                itemCode: value, 
                itemName: name,
                uom: uomName || oi.uom,
                price: uomPrice || oi.price
            }));
          }));
        }

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
            const currentItemCode = orderItems[0]?.itemCode || "";
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
                  <div className="mb-4">
                        <label className="block mb-1 font-medium">Select Item</label>
                         <InputFields
                            label=""
                            type="select"
                            isSingle={true}
                            placeholder="Select Item"
                            options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                            value={currentItemCode}
                            onChange={e => selectItemForOrderTable(tableIdx, e.target.value)}
                            width="w-full"
                          />
                  </div>
                  <Table
                    data={paginatedData}
                    config={{
                                                                  columns: [
                                                                    {
                                                                      key: "quantity",
                                                                      label: (promotion.promotionType === "1") ? "Percentage" : "From Quantity",
                                                                      width: 120,
                                                                      render: (row) => (
                                                                        <InputFields
                                                                          label=""
                                                                          type="number"
                                                                          placeholder={(promotion.promotionType === "1") ? "Percentage" : "From Qty"}
                                                                          value={String((row as Record<string, unknown>)['quantity'] ?? "")}
                                                                          onChange={e => updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "quantity", clampPercentInput(e.target.value))}
                                                                          width="w-full"
                                                                        />
                                                                      ),
                                                                    },
                                                                    {
                                                                      key: "toQuantity",
                                                                      label: (promotion.promotionType === "1") ? "To Percentage" : "To Quantity",
                                                                      width: 120,
                                                                      render: (row) => (
                                                                        <InputFields
                                                                          label=""
                                                                          type="number"
                                                                          placeholder={(promotion.promotionType === "1") ? "To Percentage" : "To Qty"}
                                                                          value={String((row as Record<string, unknown>)['toQuantity'] ?? "")}
                                                                          onChange={e => updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "toQuantity", clampPercentInput(e.target.value))}
                                                                          width="w-full"
                                                                        />
                                                                      ),
                                                                    },
                                                                    {
                                                                      key: "uom",
                                                                      label: "UOM",
                                                                      width: 150,
                                                                      render: (row) => {
                                                                        const uomOptions = getUomOptionsForRow(row);
                                                                        return (
                                                                          <InputFields
                                                                            label=""
                                                                            type="select"
                                                                            isSingle={true}
                                                                            placeholder="Select UOM"
                                                                            options={[{ label: `Select UOM`, value: "" }, ...uomOptions.map((o: any) => ({ label: o.label, value: o.value }))]}
                                                                            value={String((row as Record<string, unknown>)['uom'] ?? "")}
                                                                            onChange={e => {
                                                                              const val = e.target.value;
                                                                              updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "uom", val);
                                                                              const found = uomOptions.find((u: any) => String(u.value) === String(val));
                                                                              if (found) updateOrderItem(tableIdx, String((row as Record<string, unknown>)['idx']), "price", String(found.price ?? ""));
                                                                            }}
                                                                            width="w-full"
                                                                          />
                                                                        );
                                                                      }
                                                                    },
                                                                    {
                                                                      key: "free_qty",
                                                                      label: "Free Qty",
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
                                                                          className="text-red-500 flex items-center justify-center w-full h-full"
                                                                          onClick={() => {
                                                                            setOrderTables(tables => {
                                                                              return tables.flatMap((arr, idx) => {
                                                                                if (idx !== tableIdx) return [arr];
                                                                                const newArr = arr.filter((oi, i) => String(i) !== String(row.idx));
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
                                                                  ],                      pageSize,
                    }}
                  />
                  {itemsData.length > pageSize && renderPaginationBar(totalPages)}

                  {/* Add Button */}
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
          offerItemsData = (offerItems as OfferItemType[]).map((offerItem, idx) => ({ ...offerItem, idx: String(idx) }));
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
            <h2 className="text-xl font-semibold mb-6">Promotion</h2>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-1 font-medium">Name<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  type="text"
                  value={promotion.itemName}
                  alt="Enter Name"
                  placeholder="Enter Name"
                  onChange={e => setPromotion(s => ({ ...s, itemName: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Mode</label>
                <InputFields
                  isSingle={true}
                  options={[{ label: "Range", value: "range" }, { label: "Slab", value: "slab" }, { label: "Normal", value: "normal" }]}
                  value={promotion.bundle_combination}
                  onChange={e => setPromotion(s => ({ ...s, bundle_combination: e.target.value }))}
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
                <label className="block mb-1 font-medium">Sales Team Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={salesmanTypeOptions.map((o: any) => ({ ...o, value: String(o.value) }))}
                  value={promotion.salesTeamType}
                  onChange={e => setPromotion(s => ({ ...s, salesTeamType: e.target.value }))}
                  width="w-full"
                />
              </div>
              {/* Show Project List only when salesTeamType id = 6 */}
              {promotion.salesTeamType === "6" && (
                <div>
                  <label className="block mb-1 font-medium">Project List</label>
                  <InputFields
                    isSingle={true}
                    options={projectOptions.map((o: any) => ({ ...o, value: String(o.value) }))}
                    value={promotion.projectList}
                    onChange={e => setPromotion(s => ({ ...s, projectList: e.target.value }))}
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
              {promotion.bundle_combination === "range" && (
                <div>
                  <label className="block mb-1 font-medium">Promotion Type<span className="text-red-500 ml-1">*</span></label>
                  <InputFields
                    isSingle={true}
                    options={[{ label: "Quantity", value: "0" }, { label: "Percentage", value: "1" },]}
                    value={promotion.promotionType}
                    onChange={e => setPromotion(s => ({ ...s, promotionType: e.target.value }))}
                    width="w-full"
                  />
                </div>
              )}
              <div>
                <label className="block mb-1 font-medium">Status<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]}
                  value={promotion.status}
                  onChange={e => setPromotion(s => ({ ...s, status: e.target.value }))}
                  width="w-full"
                />
              </div>
            </div>
            <div className="mt-8">
              <div className="font-semibold text-lg mb-4">Promotional Order Item</div>
              {renderOrderTables()}
              <div className="font-semibold text-lg mb-4">Promotional Offer Items</div>
              <div className="mb-6">
                {/* Multi-table logic for offerItems, similar to orderTables */}
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
                              columns: [
                                {
                                  key: "selectedItem",
                                  label: "Item",
                                  width: 300,
                                  render: (row: any) => (
                                    <InputFields
                                      label=""
                                      type="select"
                                      isSingle={true}
                                      placeholder="Select Item"
                                      options={[{ label: `Select Item`, value: "" }, ...selectedItemOptions]}
                                      value={String((row as Record<string, unknown>)['itemCode'] ?? "")}
                                      onChange={e => selectItemForOffer(tableIdx, row.idx, e.target.value)}
                                      width="w-full"
                                    />
                                  ),
                                },
                                {
                                  key: "itemName",
                                  label: "Item Name",
                                  width: 300,
                                  render: (row) => (
                                    <InputFields
                                      label=""
                                      type="text"
                                      placeholder="Item Name"
                                      value={String((row as Record<string, unknown>)['itemName'] ?? "")}
                                      onChange={e => updateOfferItemTable(tableIdx, row.idx, "itemName", e.target.value)}
                                      width="w-full"
                                    />
                                  ),
                                },
                                {
                                  key: "uom",
                                  label: "UOM",
                                  width: 150,
                                  render: (row) => {
                                    const uomOptions = getUomOptionsForRow(row);
                                    return (
                                      <InputFields
                                        label=""
                                        type="select"
                                        isSingle={true}
                                        placeholder="Select UOM"
                                        options={[{ label: `Select UOM`, value: "" }, ...uomOptions.map((o: any) => ({ label: o.label, value: o.value }))]}
                                        value={String((row as Record<string, unknown>)['uom'] ?? "")}
                                        onChange={e => updateOfferItemTable(tableIdx, row.idx, "uom", e.target.value)}
                                        width="w-full"
                                      />
                                    );
                                  }
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
