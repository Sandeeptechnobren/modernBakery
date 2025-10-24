
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
      { id: "3", label: "Warehouse", isSelected: false },
      { id: "4", label: "Area", isSelected: false },
      { id: "5", label: "Route", isSelected: false },
    ],
  },
  {
    type: "Customer",
    options: [
      { id: "6", label: "Customer Type", isSelected: false },
      { id: "7", label: "Channel", isSelected: false },
      { id: "8", label: "Customer Category", isSelected: false },
      { id: "9", label: "Customer", isSelected: false },
    ],
  },
  {
    type: "Item",
    options: [
      { id: "10", label: "Item Category", isSelected: false },
      { id: "11", label: "Item", isSelected: false },
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
// --- End SelectKeyCombination component ---
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import { useRouter } from "next/navigation";
import CustomCheckbox from "@/app/components/customCheckbox";
import * as yup from "yup";

export default function AddPricing() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isEditMode = id !== undefined && id !== "add";
  const { itemOptions,companyOptions,regionOptions,warehouseOptions,areaOptions,routeOptions,customerTypeOptions,channelOptions,customerCategoryOptions,companyCustomersOptions,itemCategoryOptions } = useAllDropdownListData();
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
            itemName: headerRes.name || "",
            startDate: headerRes.start_date || "",
            endDate: headerRes.end_date || "",
            order_type: headerRes.order_type || "",
            offer_type: headerRes.offer_type || "",
            type: headerRes.type || "",
            discount_type: headerRes.discount_type || "",
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
      return (
        keyCombo.Location.length > 0 &&
        keyCombo.Customer.length > 0 &&
        keyCombo.Item.length > 0
      );
    }
    if (step === 2) {
      for (const locKey of keyCombo.Location) {
        if (!keyValue[locKey] || keyValue[locKey].length === 0) return false;
      }
      for (const custKey of keyCombo.Customer) {
        if (!keyValue[custKey] || keyValue[custKey].length === 0) return false;
      }
      for (const itemKey of keyCombo.Item) {
        if (!keyValue[itemKey] || keyValue[itemKey].length === 0) return false;
      }
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
    name: yup.string().required("Name is required"),
    start_date: yup.string().required("Start date is required"),
    end_date: yup.string().required("End date is required"),
    item: yup.array().of(yup.string()).min(1, "At least one item is required"),
    key: yup.object({
      Location: yup.array().of(yup.string()).min(1, "Location key required"),
      Customer: yup.array().of(yup.string()).min(1, "Customer key required"),
      Item: yup.array().of(yup.string()).min(1, "Item key required"),
    })
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
              { id: "6", label: "Customer Type", isSelected: false },
              { id: "7", label: "Channel", isSelected: false },
              { id: "8", label: "Customer Category", isSelected: false },
              { id: "9", label: "Customer", isSelected: false },
            ],
          },
          {
            type: "Item",
            options: [
              { id: "10", label: "Item Category", isSelected: false },
              { id: "11", label: "Item", isSelected: false },
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

        const description = [
          ...getKeyIds("Location", keyCombo.Location),
          ...getKeyIds("Customer", keyCombo.Customer),
          ...getKeyIds("Item", keyCombo.Item)
        ];

        const selectedItemIds = keyValue["Item"] || [];
        let promotionDetails: any[] = [];
        if (Array.isArray(offerItems) && Array.isArray(offerItems[0])) {
          promotionDetails = offerItems.flat();
        } else {
          promotionDetails = offerItems;
        }

        const payload = {
          ...promotion,
          name: promotion.itemName,
          start_date: promotion.startDate,
          end_date: promotion.endDate,
          status: promotion.status,
          order_type: promotion.order_type,
          offer_type: promotion.offer_type,
          type: promotion.type,
          discount_type: promotion.discount_type,
          discount_apply_on: promotion.discount_apply_on,
          bundle_combination: promotion.bundle_combination,
          item: selectedItemIds,
          description,
          pricing: selectedItemIds.map(itemId => {
            let itemData = selectedItemDetails.find(item => String(item.code || item.itemCode) === String(itemId));
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
            const orderItem = orderTables.flat().find((oi: any) => String(oi.itemCode) === String(itemCode));
            return {
              item_id: itemId,
              price: orderItem ? orderItem.price : ""
            };
          }),
          promotion_details: promotionDetails,
        };
    try {
      await pricingValidationSchema.validate(payload, { abortEarly: false });
      setLoading(true);
      const res = await addPromotionHeader(payload);
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit Promotion", "error");
      } else {
        showSnackbar(isEditMode ? "Promotion updated successfully" : "Promotion added successfully", "success");
        router.push("/promotion");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && Array.isArray((err as yup.ValidationError).inner)) {
        const formErrors: Record<string, string> = {};
        (err as yup.ValidationError).inner.forEach((e: yup.ValidationError) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix validation errors before proceeding", "error");
      } else {
        showSnackbar(isEditMode ? "Failed to update promotion" : "Failed to add promotion", "error");
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
    order_type: "",
    offer_type: "",
    type: "",
    discount_type: "",
    discount_apply_on : "",
    bundle_combination:"",
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
      { promotionGroupName: "", itemName: "", itemCode: "", quantity: "", toQuantity: "", uom: "CTN", price: "" },
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
          setSelectedItemDetails(items);
          
         
        })
        .catch(err => {
          console.error("Failed to fetch item details", err);});
    } else {
      setSelectedItemDetails([]);
    }
  }, [keyValue["Item"]]);

    const handleCheckboxChange = (value: string, isChecked: boolean) => {
      const selected = (promotion.bundle_combination || "").split(",").filter(Boolean);
      let updated: string[];
      if (isChecked) {
        updated = [...new Set([...selected, value])];
      } else {
        updated = selected.filter((v) => v !== value);
      }
      setPromotion(s => ({ ...s, bundle_combination: updated.join(",") }));
    };
  

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
        "Customer Type": customerTypeOptions,
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
      // Helper to update orderItems by itemCode and key for a specific table
      function updateOrderItem(tableIdx: number, itemCode: string, key: keyof OrderItemType, value: string) {
        setOrderTables((tables) => tables.map((arr, idx) => {
          if (idx !== tableIdx) return arr;
          const idxFound = arr.findIndex((oi) => oi.itemCode === itemCode);
          if (idxFound !== -1) {
            return arr.map((oi, i) => i === idxFound ? { ...oi, [key]: value } : oi);
          } else {
            const newItem: OrderItemType = {
              promotionGroupName: key === "promotionGroupName" ? value : "",
              itemName: "",
              itemCode,
              quantity: key === "quantity" ? value : "",
              toQuantity: key === "toQuantity" ? value : "",
              uom: key === "uom" ? value : "CTN",
              price: key === "price" ? value : "",
            };
            return [...arr, newItem];
          }
        }));
      }

      function updateOfferItem(idx: string, key: keyof OfferItemType, value: string) {
        setOfferItems((arr) => arr.map((oi, i) => String(i) === String(idx) ? { ...oi, [key]: value } : oi));
      }
      // Render all order tables
      const renderOrderTables = () => (
        orderTables.map((orderItems, tableIdx) => {
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
              uom: "CTN",
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
                    columns: [
                      ...(promotion.bundle_combination?.split(",").includes("bundle_combination") ? [
                        {
                          key: "type",
                          label: "Type",
                          render: (row: any) => (
                            <>
                              <InputFields
                                label=""
                                type="text"
                                value={row.type || ""}
                                onChange={e => updateOrderItem(tableIdx, row.itemCode, "type", e.target.value)}
                                width="w-full"
                              />
                              {promotion.bundle_combination?.split(",").includes("bundle_combination") && row.idx === "0" && (
                                <button
                                  type="button"
                                  className="flex items-center gap-2 mt-2 px-3 py-1 rounded bg-[#ffffff] text-[#EA0A2A] font-semibold hover:bg-[#FFF0F2]"
                                  onClick={() => {
                                    setOrderTables(tables => tables.map((arr, idx) => idx === tableIdx ? ([
                                      ...arr,
                                      {
                                        promotionGroupName: "",
                                        itemName: "",
                                        itemCode: "",
                                        quantity: "",
                                        toQuantity: "",
                                        uom: "CTN",
                                        price: ""
                                      }
                                    ]) : arr));
                                  }}
                                >
                                  <Icon icon="material-symbols:add-circle-outline" width={20} />
                                  Add Detail
                                </button>
                              )}
                            </>
                          ),
                        },
                      ] : []),
                      {
                        key: "promotionGroupName",
                        label: "Promotion Group Name",
                        render: (row) => (
                          <>
                          <div>
                            <InputFields
                              label=""
                              type="text"
                              value={row.promotionGroupName || ""}
                              onChange={e => updateOrderItem(tableIdx, row.itemCode, "promotionGroupName", e.target.value)}
                              width="w-full"
                            />
                          </div>
                         
                          </>
                        ),
                      },
                      {
                        key: "quantity",
                        label: "From Quantity",
                        render: (row) => (
                          <InputFields
                            label=""
                            type="number"
                            value={row.quantity || ""}
                            onChange={e => updateOrderItem(tableIdx, row.itemCode, "quantity", e.target.value)}
                            width="w-full"
                          />
                        ),
                      },
                      {
                        key: "toQuantity",
                        label: "To Quantity",
                        render: (row) => (
                          <InputFields
                            label=""
                            type="number"
                            value={row.toQuantity || ""}
                            onChange={e => updateOrderItem(tableIdx, row.itemCode, "toQuantity", e.target.value)}
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
                            type="number"
                            value={row.uom || ""}
                            onChange={e => updateOrderItem(tableIdx, row.itemCode, "uom", e.target.value)}
                            width="w-full"
                          />
                        ),
                      },
                      {
                        key: "price",
                        label: "Price",
                        render: (row) => (
                          <InputFields
                            label=""
                            type="number"
                            value={row.price || ""}
                            onChange={e => updateOrderItem(tableIdx, row.itemCode, "price", e.target.value)}
                            width="w-full"
                          />
                        ),
                      },
                    ],
                    rowActions: [
                      {
                        icon: "material-symbols:add-circle-outline",
                        onClick: () => {
                          if (promotion.bundle_combination?.split(",").includes("bundle_combination")) {
                            // Add a new table
                            setOrderTables(tables => ([
                              ...tables,
                              [
                                {
                                  promotionGroupName: "",
                                  itemName: "",
                                  itemCode: "",
                                  quantity: "",
                                  toQuantity: "",
                                  uom: "CTN",
                                  price: ""
                                }
                              ]
                            ]));
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
                                        price: ""
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
        })
      );

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
                <label className="block mb-1 font-medium">Order Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[{ label: "Any", value: "1" }, { label: "All", value: "0" }]}
                  value={promotion.order_type}
                  onChange={e => setPromotion(s => ({ ...s, order_type: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Offer Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[{ label: "Any", value: "1" }, { label: "All", value: "0" }]}
                  value={promotion.offer_type}
                  onChange={e => setPromotion(s => ({ ...s, offer_type: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[ { label: "Range", value: "0" },{ label: "Slab", value: "1" },{ label: "Normal", value: "2" },]}
                  value={promotion.type}
                  onChange={e => setPromotion(s => ({ ...s, type: e.target.value }))}
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Discount Type<span className="text-red-500 ml-1">*</span></label>
                <InputFields
                  isSingle={true}
                  options={[ { label: "Fixed", value: "0" },{ label: "Percentage", value: "1" },]}
                  value={promotion.discount_type}
                  onChange={e => setPromotion(s => ({ ...s, discount_type: e.target.value }))}
                  width="w-full"
                />
              </div>
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
               <CustomCheckbox
                                  id="bundle_combination"
                                  label="Bundle Combination"
                                  checked={promotion.bundle_combination?.split(",").includes("bundle_combination")}
                                  onChange={(e) =>
                                    handleCheckboxChange("bundle_combination", e.target.checked)
                                  }
                                />
            </div>
            <div className="font-semibold text-lg mb-4">Promotional Order Items</div>
            {renderOrderTables()}
            <div className="font-semibold text-lg mb-4">Promotional Offer Items</div>
            <div className="mb-6">
              {/* Multi-table logic for offerItems, similar to orderTables */}
              {(() => {
                // If bundle_combination is checked, treat offerItems as an array of tables (array of arrays)
                const isBundle = promotion.bundle_combination?.split(",").includes("bundle_combination");
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
                            columns: [
                              ...(isBundle ? [
                                {
                                  key: "type",
                                  label: "Type",
                                  render: (row: any) => (
                                    <>
                                      <InputFields
                                        label=""
                                        type="text"
                                        value={row.type || ""}
                                        onChange={e => updateOfferItemTable(tableIdx, row.idx, "type", e.target.value)}
                                        width="w-full"
                                      />
                                      {row.idx === "0" && (
                                        <button
                                          type="button"
                                          className="flex items-center gap-2 mt-2 px-3 py-1 rounded bg-[#ffffff] text-[#EA0A2A] font-semibold hover:bg-[#FFF0F2]"
                                          onClick={() => addRowToOfferTable(tableIdx)}
                                        >
                                          <Icon icon="material-symbols:add-circle-outline" width={20} />
                                          Add Detail
                                        </button>
                                      )}
                                    </>
                                  ),
                                },
                              ] : []),
                              {
                                key: "promotionGroupName",
                                label: "Promotion Group Name",
                                render: (row) => (
                                  <InputFields
                                    label=""
                                    type="text"
                                    value={row.promotionGroupName || ""}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "promotionGroupName", e.target.value)}
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
                                    type="number"
                                    value={row.uom || ""}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "uom", e.target.value)}
                                    width="w-full"
                                  />
                                ),
                              },
                              {
                                key: "toQuantity",
                                label: "Quantity",
                                render: (row) => (
                                  <InputFields
                                    label=""
                                    type="number"
                                    value={row.toQuantity || ""}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "toQuantity", e.target.value)}
                                    width="w-full"
                                  />
                                ),
                              },
                              {
                                key: "is_discount",
                                label: "Is Discount",
                                render: (row) => (
                                  <CustomCheckbox
                                    id={`is_discount_${row.idx}`}
                                    label="Is Discount"
                                    checked={row.is_discount === "1"}
                                    onChange={e => updateOfferItemTable(tableIdx, row.idx, "is_discount", e.target.checked ? "1" : "0")}
                                  />
                                ),
                              },
                            ],
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
