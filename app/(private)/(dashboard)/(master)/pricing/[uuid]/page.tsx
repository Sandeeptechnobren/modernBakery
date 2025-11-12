"use client";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { itemList, addPricingDetail, pricingDetailById, pricingHeaderById, editPricingDetail } from "@/app/services/allApi";
import CustomCheckbox from "@/app/components/customCheckbox";
import InputFields from "@/app/components/inputFields";
import Table from "@/app/components/customTable";
import Loading from "@/app/components/Loading";
import { useRouter } from "next/navigation";
import * as yup from "yup";

type KeyOption = { label: string; id: string; isSelected: boolean };
type KeyGroup = { type: string; options: KeyOption[] };

const initialKeys: KeyGroup[] = [
  {
    type: "Location",
    options: [
      { id: "1", label: "Company", isSelected: false },
      { id: "2", label: "Region", isSelected: false },
      { id: "3", label: "Area", isSelected: false },
      { id: "4", label: "Warehouse", isSelected: false },
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

type SelectKeyProps = {
  keyCombo: { Location: string[]; Customer: string[]; Item: string[] };
  setKeyCombo: React.Dispatch<
    React.SetStateAction<{ Location: string[]; Customer: string[]; Item: string[] }>
  >;
};

function SelectKeyCombination({ keyCombo, setKeyCombo }: SelectKeyProps) {
  const [keysArray, setKeysArray] = useState<KeyGroup[]>(() => {
    return initialKeys.map((group) => ({
      ...group,
      options: group.options.map((opt) => ({
        ...opt,
        isSelected:
          keyCombo[group.type as keyof SelectKeyProps['keyCombo']]?.includes(
            opt.label
          ) || false,
      })),
    }));
  });

  useEffect(() => {
    setKeysArray((prev) => {
      const next = initialKeys.map((group) => ({
        ...group,
        options: group.options.map((opt) => ({
          ...opt,
          isSelected:
            keyCombo[group.type as keyof SelectKeyProps['keyCombo']]?.includes(
              opt.label
            ) || false,
        })),
      }));
      const isSame = prev.every((group, i) =>
        group.options.every((opt, j) => opt.isSelected === next[i].options[j].isSelected)
      );
      return isSame ? prev : next;
    });
  }, [keyCombo]);

  useEffect(() => {
    const selected: { Location: string[]; Customer: string[]; Item: string[] } = {
      Location: [],
      Customer: [],
      Item: [],
    };
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

  return (
    <ContainerCard className="h-fit mt-[20px] flex flex-col gap-2 p-6 bg-white border border-[#E5E7EB] rounded-[12px] shadow-none text-[#181D27]">
      <div className="font-semibold text-[20px] mb-4">Key Combination</div>
      <div className="grid grid-cols-3 gap-6">
        {keysArray.map((group, index) => (
          <div key={index} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col shadow-sm">
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
            const loc = keysArray.find((g) => g.type === "Location")?.options.filter((o) => o.isSelected).map((o) => o.label) || [];
            return loc.length > 0 ? loc.map((k, i) => (
              <span key={"loc-" + i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
            )) : null;
          })()}
          {(() => {
            const cust = keysArray.find((g) => g.type === "Customer")?.options.filter((o) => o.isSelected).map((o) => o.label) || [];
            return cust.length > 0 ? [
              <span key="slash-cust" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...cust.map((k, i) => (
                <span key={"cust-" + i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
          {(() => {
            const item = keysArray.find((g) => g.type === "Item")?.options.filter((o) => o.isSelected).map((o) => o.label) || [];
            return item.length > 0 ? [
              <span key="slash-item" className="mx-1 text-[#A0A4AB] text-[18px] font-bold">/</span>,
              ...item.map((k, i) => (
                <span key={"item-" + i} className="bg-[#F3F4F6] text-[#181D27] px-3 py-1 rounded-full text-[15px] border border-[#E5E7EB]">{k}</span>
              ))
            ] : null;
          })()}
        </div>
      </ContainerCard>
    </ContainerCard>
  );
}

export default function AddPricing() {
  const {
    itemOptions,
    companyOptions,
    regionOptions,
    warehouseOptions,
    areaOptions,
    routeOptions,
    customerTypeOptions,
    channelOptions,
    customerCategoryOptions,
    companyCustomersOptions,
    itemCategoryOptions,
  } = useAllDropdownListData();
  const steps: StepperStep[] = [
    { id: 1, label: "Key Combination" },
    { id: 2, label: "Key Value" },
    { id: 3, label: "Pricing" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  // support routes that use either [uuid] or [id] as the segment name
  const rawParam = (typeof params === "object" && params !== null ? (params as Record<string, unknown>)?.uuid : undefined) ?? (typeof params === "object" && params !== null ? (params as Record<string, unknown>)?.id : undefined);
  const id = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const isEditMode = id !== undefined && id !== "add" && id !== "";

  // Fetch existing pricing details in edit mode
  useEffect(() => {
    async function fetchEditData() {
      if (!isEditMode || !id) return;
      setLoading(true);
      try {
        // Prefer the detailed endpoint for edit-mode population
        const raw = await pricingHeaderById(id);
  // API sometimes wraps result under `data` or returns object directly
  const res = raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw;
        if (res && typeof res === "object") {
          // populate basic fields if available
          setPromotion((s) => ({
            ...s,
            itemName: res.name || res.title || s.itemName,
            startDate: res.start_date || s.startDate,
            endDate: res.end_date || s.endDate,
            status: res.status !== undefined ? String(res.status) : s.status,
          }));

          // Map description (array of key ids) back to checkbox labels
          try {
            const descArr: number[] = Array.isArray((res as Record<string, unknown>).description)
              ? ((res as Record<string, unknown>).description as unknown[]).map((d) => Number(d)).filter((n: number) => !Number.isNaN(n))
              : [];

            const selectedForCombo: { Location: string[]; Customer: string[]; Item: string[] } = {
              Location: [],
              Customer: [],
              Item: [],
            };

            // initialKeys (top-level) defines the id->label mapping for checkboxes
            initialKeys.forEach((group) => {
              group.options.forEach((opt) => {
                const optId = Number(opt.id);
                if (!Number.isNaN(optId) && descArr.includes(optId)) {
                  // push label into the corresponding group
                  if (group.type === "Location") selectedForCombo.Location.push(opt.label);
                  else if (group.type === "Customer") selectedForCombo.Customer.push(opt.label);
                  else if (group.type === "Item") selectedForCombo.Item.push(opt.label);
                }
              });
            });
            // apply if anything found
            if (
              selectedForCombo.Location.length > 0 ||
              selectedForCombo.Customer.length > 0 ||
              selectedForCombo.Item.length > 0
            ) {
              setKeyCombo(selectedForCombo);
            }

            // Map API arrays to keyValue entries. Use a defensive mapping between labels and response fields.
            const labelToField: Record<string, string> = {
              Company: "company",
              Region: "region",
              Warehouse: "warehouse",
              Area: "area",
              Route: "route",
              Channel: "outlet_channel",
              "Customer Category": "customer_category",
              Customer: "customer",
              "Item Category": "item_category",
              Item: "item",
            };

            // helper to coerce various server shapes into string id arrays
            const toIdStrings = (val: unknown): string[] => {
              if (val == null) return [];
              if (Array.isArray(val)) {
                if (val.length === 0) return [];
                // if elements are objects, try to extract common id fields
                if (typeof val[0] === "object") {
                  return val.map((v) => {
                    if (typeof v === "object" && v !== null) {
                      const obj = v as Record<string, unknown>;
                      return String(obj.id ?? obj.item_id ?? obj.code ?? obj.itemCode ?? obj.erp_code ?? obj.value ?? "");
                    }
                    return String(v);
                  }).filter(Boolean);
                }
                return val.map((v) => String(v));
              }
              if (typeof val === "string") return val.includes(",") ? val.split(",").map((s) => s.trim()) : [val];
              return [String(val)];
            };

            // populate keyValue for every mapped label
            const nextKeyValue: Record<string, string[]> = {};
            Object.keys(labelToField).forEach((label) => {
              const field = labelToField[label];
              const rawVal = (res as Record<string, unknown>)[field];
              // special handling for `item` which may contain objects
              nextKeyValue[label] = toIdStrings(rawVal);
            });

            // set keyValue in one go
            setKeyValue((kv) => ({ ...kv, ...nextKeyValue }));

            // If API returned full item objects, use them; otherwise fetch details by ids
            const itemField = (res as Record<string, unknown>).item || nextKeyValue["Item"] || [];
            const itemArr = (res as Record<string, unknown>).item as ItemDetail[] | undefined;
            if (Array.isArray(itemArr) && itemArr.length > 0 && typeof itemArr[0] === "object") {
              setSelectedItemDetails(itemArr);
            } else if (Array.isArray(nextKeyValue["Item"]) && nextKeyValue["Item"].length > 0) {
              // try to fetch full item objects when we only have ids
              try {
                const items = await itemList({ ids: nextKeyValue["Item"] });
                if (Array.isArray(items)) setSelectedItemDetails(items as ItemDetail[]);
                else if (items && typeof items === "object" && Array.isArray((items as Record<string, unknown>).data)) setSelectedItemDetails((items as Record<string, unknown>).data as ItemDetail[]);
              } catch (innerErr) {
                console.error("Failed to fetch item details for edit mode", innerErr);
              }
            }
          } catch (innerErr) {
            console.error("Failed to map pricing detail for edit mode", innerErr);
          }
        }
      } catch (err) {
        console.error("Failed to fetch pricing detail for edit mode", err);
        showSnackbar("Failed to load pricing details for edit", "error");
      }
      setLoading(false);
    }
    fetchEditData();
  }, [isEditMode, id]);
  const [loading, setLoading] = useState(false);
  // While loading in edit-mode, show a full-page loader until data is ready
 
  const validateStep = (step: number) => {
    if (step === 1) {
      return (
        keyCombo.Location.length > 0 &&
        keyCombo.Customer.length > 0 &&
        keyCombo.Item.length > 0
      );
    }
    if (step === 2) {
      if (keyCombo.Location.includes("Route") && !keyValue.Route) return false;
      if (
        keyCombo.Customer.includes("Sales Organisation") &&
        !keyValue.SalesOrganisation
      )
        return false;
      if (keyCombo.Customer.includes("Sub Channel") && !keyValue.SubChannel)
        return false;
      if (keyCombo.Item.includes("Item Group") && !keyValue.ItemGroup)
        return false;
      return true;
    }
    if (step === 3) {
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      showSnackbar(
        "Please fill in all required fields before proceeding.",
        "warning"
      );
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
    }),
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
    function getKeyIds(type: string, selectedLabels: string[]): number[] {
      const group = initialKeys.find((g) => g.type === type);
      if (!group) return [];
      return selectedLabels.map((label: string) => {
        const found = group.options.find((opt) => opt.label === label);
        // Convert both the found id and label to a number
        return found ? Number(found.id) : Number(label);
      });
    }

    // Flatten all selected key ids into a single array for description
    const description = [
      ...getKeyIds("Location", keyCombo.Location),
      ...getKeyIds("Customer", keyCombo.Customer),
      ...getKeyIds("Item", keyCombo.Item),
    ];

    // Use selected item ids from keyValue["Item"] for item and pricing
    const selectedItemIds = keyValue["Item"] || [];
    // Build payload fields that include arrays of selected ids for each key
    const payload = {
      name: promotion.itemName,
      description, // adjust this as needed
      start_date: promotion.startDate,
      end_date: promotion.endDate,
      apply_on: 1, // static/mapped as per requirement
      status: promotion.status, // or fix to 1 if static
      // arrays of selected ids for each key (as requested)
      company: keyValue["Company"] || [],
      region: keyValue["Region"] || [],
      area: keyValue["Area"] || [],
      warehouse: keyValue["Warehouse"] || [],
      route: keyValue["Route"] || [],
      outlet_channel: keyValue["Channel"] || [],
      customer_category: keyValue["Customer Category"] || [],
      customer: keyValue["Customer"] || [],
      item_category: keyValue["Item Category"] || [],
      item: selectedItemIds,
      // keep legacy CSV field for compatibility
      item_id: selectedItemIds.join(","),
      details: selectedItemIds.map((itemId) => {
        // Find the matching item data (same logic as itemsData builder)
        let itemData = selectedItemDetails.find(
          (item) => String(item.code || item.itemCode) === String(itemId)
        );
        if (!itemData) {
          itemData = itemOptions.find(
            (opt) => String(opt.value) === String(itemId)
          );
        }

        // Recreate the display itemCode string (so matching with promotion.orderItems is consistent)
        let itemCodeStr = "";
        if (itemData) {
          if (itemData.code) itemCodeStr = String(itemData.code);
          else if (itemData.itemCode) itemCodeStr = String(itemData.itemCode);
          else if (itemData.label) {
            const labelParts = String(itemData.label).split(" - ");
            itemCodeStr = labelParts.length > 1 ? labelParts[0] : String(itemData.label);
          }
        } else {
          itemCodeStr = String(itemId);
        }

        const itemName = itemData?.name || itemData?.label || "";

        // Find the order item for prices. Try multiple fallbacks: match by itemCode (string), or by numeric id
        const orderItem = promotion.orderItems.find((oi) => {
          return (
            String(oi.itemCode) === String(itemCodeStr) ||
            String(oi.itemCode) === String(itemId) ||
            String((oi as any).item_id) === String(itemId)
          );
        });

        // Convert stored price strings to numbers (if present) and fallback sensibly
        const buom = orderItem?.buom_ctn_price ?? orderItem?.price ?? "";
        const auom = orderItem?.auom_pc_price ?? "";

        return {
          name: itemName,
          item_id: Number(itemId),
          buom_ctn_price: buom !== undefined && buom !== null && buom !== "" ? Number(buom) : 0,
          auom_pc_price: auom !== undefined && auom !== null && auom !== "" ? Number(auom) : 0,
          status: 1,
        };
      }),
    };

    try {
      await pricingValidationSchema.validate(payload, { abortEarly: false });
  setLoading(true);
  const res = isEditMode && id ? await editPricingDetail(id, payload) : await addPricingDetail(payload);
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit pricing", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "Pricing updated successfully"
            : "Pricing added successfully",
          "success"
        );
        router.push("/pricing");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        err.name === "ValidationError" &&
        Array.isArray((err as yup.ValidationError).inner)
      ) {
        const formErrors: Record<string, string> = {};
        (err as yup.ValidationError).inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix validation errors before proceeding", "error");
      } else {
        showSnackbar(
          isEditMode ? "Failed to update pricing" : "Failed to add pricing",
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

  type OrderItem = {
    itemName: string;
    itemCode: string;
    quantity: string;
    toQuantity: string;
    uom: string;
    price?: string;
    buom_ctn_price?: string;
    auom_pc_price?: string;
  };

  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [promotion, setPromotion] = useState<{
    itemName: string;
    startDate: string;
    endDate: string;
    status: string;
    orderType: string;
    offerType: string;
    type: string;
    discountType: string;
    discountApplyOn: string;
    bundle: boolean;
    orderItems: OrderItem[];
    offerItems: Array<{ itemName: string; uom: string; quantity: string }>;
  }>({
    itemName: "",
    startDate: "",
    endDate: "",
    status: "active",
    orderType: "All",
    offerType: "All",
    type: "Slab",
    discountType: "Fixed",
    discountApplyOn: "Quantity",
    bundle: false,
    orderItems: [
      {
        itemName: "",
        itemCode: "",
        quantity: "",
        toQuantity: "",
        uom: "CTN",
        price: "",
        buom_ctn_price: "",
        auom_pc_price: "",
      },
    ],
    offerItems: [{ itemName: "", uom: "BAG", quantity: "" }],
  });

  type ItemDetail = {
    code?: string;
    itemCode?: string;
    name?: string;
    itemName?: string;
    label?: string;
    [key: string]: unknown;
  };
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetail[]>(
    []
  );
  const [page, setPage] = useState(1);
  const pageSize = 5;
  useEffect(() => {
    if (keyValue["Item"] && keyValue["Item"].length > 0) {
      itemList({ ids: keyValue["Item"] })
        .then((data) => {
          let items: ItemDetail[] = [];
          if (Array.isArray(data)) {
            items = data as ItemDetail[];
          } else if (
            data &&
            typeof data === "object" &&
            Array.isArray(data.data)
          ) {
            items = data.data as ItemDetail[];
          }
          setSelectedItemDetails(items);
        })
        .catch((err) => {
          console.error("Failed to fetch item details", err);
        });
    } else {
      setSelectedItemDetails([]);
    }
  }, [keyValue["Item"]]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectKeyCombination keyCombo={keyCombo} setKeyCombo={setKeyCombo} />
        );
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
                        searchable={true}
                        isSingle={false}
                        options={
                          locationDropdownMap[locKey]
                            ? [
                              { label: `Select ${locKey}`, value: "" },
                              ...locationDropdownMap[locKey],
                            ]
                            : [{ label: `Select ${locKey}`, value: "" }]
                        }
                        value={keyValue[locKey] || []}
                        onChange={(e) =>
                          setKeyValue((s) => ({
                            ...s,
                            [locKey]: Array.isArray(e.target.value)
                              ? e.target.value
                              : [],
                          }))
                        }
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
                      <div className="mb-2 text-base font-medium">
                        {custKey}
                      </div>
                      <InputFields
                        label=""
                        type="select"
                        isSingle={false}
                        searchable={true}
                        options={
                          customerDropdownMap[custKey]
                            ? [
                              { label: `Select ${custKey}`, value: "" },
                              ...customerDropdownMap[custKey],
                            ]
                            : [{ label: `Select ${custKey}`, value: "" }]
                        }
                        value={keyValue[custKey] || []}
                        onChange={(e) =>
                          setKeyValue((s) => ({
                            ...s,
                            [custKey]: Array.isArray(e.target.value)
                              ? e.target.value
                              : [],
                          }))
                        }
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
                      <div className="mb-2 text-base font-medium">
                        {itemKey}
                      </div>
                      <InputFields
                        label=""
                        type="select"
                        isSingle={false}
                        searchable={true}
                        options={
                          itemDropdownMap[itemKey]
                            ? [
                              { label: `Select ${itemKey}`, value: "" },
                              ...itemDropdownMap[itemKey],
                            ]
                            : [{ label: `Select ${itemKey}`, value: "" }]
                        }
                        value={keyValue[itemKey] || []}
                        onChange={(e) =>
                          setKeyValue((s) => ({
                            ...s,
                            [itemKey]: Array.isArray(e.target.value)
                              ? e.target.value
                              : [],
                          }))
                        }
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
        const itemsData = (keyValue["Item"] || []).map((itemId, idx) => {
          let itemData = selectedItemDetails.find(
            (item) => String(item.code || item.itemCode) === String(itemId)
          );
          if (!itemData) {
            itemData = itemOptions.find(
              (opt) => String(opt.value) === String(itemId)
            );
          }
          let itemCode = "-";
          if (itemData) {
            if (itemData.code) itemCode = itemData.code;
            else if (itemData.itemCode) itemCode = itemData.itemCode;
            else if (itemData.label) {
              const labelParts = String(itemData.label).split(" - ");
              itemCode =
                labelParts.length > 1 ? labelParts[0] : String(itemData.label);
            }
          } else {
            itemCode = String(itemId);
          }
          let itemName = "-";
          if (itemData) {
            if (itemData.name) itemName = itemData.name;
            else if (itemData.itemName) itemName = itemData.itemName;
            else if (itemData.label) {
              const labelParts = String(itemData.label).split(" - ");
              itemName =
                labelParts.length > 1
                  ? labelParts.slice(1).join(" - ")
                  : labelParts[0];
            }
          }
          const orderItem = promotion.orderItems.find((oi) => oi.itemCode === itemCode);
          return {
            itemName,
            itemCode,
            price: orderItem?.price || "",
            buom_ctn_price: orderItem?.buom_ctn_price || "",
            auom_pc_price: orderItem?.auom_pc_price || "",
            idx: String(idx),
          };
        });

        const totalPages = Math.ceil(itemsData.length / pageSize);
        const paginatedData = itemsData.slice(
          (page - 1) * pageSize,
          page * pageSize
        );
        type PaginationBtnProps = {
          label: string;
          isActive: boolean;
          onClick: () => void;
        };
        const PaginationBtn = ({
          label,
          isActive,
          onClick,
        }: PaginationBtnProps) => (
          <button
            className={`w-[32px] h-[32px] rounded-[6px] flex items-center justify-center mx-[2px] text-[14px] font-semibold transition-colors duration-150 border-none outline-none focus:ring-2 focus:ring-[#EA0A2A] select-none ${isActive
                ? "bg-[#FFF0F2] text-[#EA0A2A] shadow-sm"
                : "bg-white text-[#717680] hover:bg-[#F5F5F5]"
              }`}
            style={{ minWidth: 32 }}
            onClick={onClick}
            disabled={label === "..."}
          >
            {label}
          </button>
        );
        const firstThreePageIndices = [1, 2, 3];
        const lastThreePageIndices =
          totalPages > 3 ? [totalPages - 2, totalPages - 1, totalPages] : [];
        // const renderPaginationBar = () => {
        //   if (totalPages <= 1) return null;
        //   return (
        //     <div className="flex justify-between items-center px-[8px] py-[12px] mt-2">
        //       <button
        //         className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
        //         onClick={() => setPage(page - 1)}
        //         disabled={page === 1}
        //       >
        //         <span className="text-[16px]">←</span>
        //         Previous
        //       </button>
        //       <div className="flex gap-[2px] text-[14px] select-none">
        //         {totalPages > 6 ? (
        //           <>
        //             {firstThreePageIndices.map((pageNo) => (
        //               <PaginationBtn
        //                 key={pageNo}
        //                 label={pageNo.toString()}
        //                 isActive={page === pageNo}
        //                 onClick={() => setPage(pageNo)}
        //               />
        //             ))}
        //             <PaginationBtn label={"..."} isActive={false} onClick={() => { }} />
        //             {lastThreePageIndices.map((pageNo) => (
        //               <PaginationBtn
        //                 key={pageNo}
        //                 label={pageNo.toString()}
        //                 isActive={page === pageNo}
        //                 onClick={() => setPage(pageNo)}
        //               />
        //             ))}
        //           </>
        //         ) : (
        //           <>
        //             {[...Array(totalPages)].map((_, idx) => (
        //               <PaginationBtn
        //                 key={idx + 1}
        //                 label={(idx + 1).toString()}
        //                 isActive={page === idx + 1}
        //                 onClick={() => setPage(idx + 1)}
        //               />
        //             ))}
        //           </>
        //         )}
        //       </div>
        //       <button
        //         className="flex items-center gap-1 px-4 py-2 rounded bg-[#F5F5F5] text-[#717680] font-semibold disabled:opacity-50"
        //         onClick={() => setPage(page + 1)}
        //         disabled={page === totalPages}
        //       >
        //         Next
        //         <span className="text-[16px]">→</span>
        //       </button>
        //     </div>
        //   );
        // };
 if (isEditMode && loading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Loading />
      </div>
    );
  }
        return (
          <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
            <h2 className="text-xl font-semibold mb-6">Pricing</h2>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium">
                  Name<span className="text-red-500 ml-1">*</span>
                </label>
                <InputFields
                  label=""
                  type="text"
                  value={promotion.itemName}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, itemName: e.target.value }))
                  }
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Start Date<span className="text-red-500 ml-1">*</span>
                </label>
                <InputFields
                  label=""
                  type="date"
                  value={promotion.startDate}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, startDate: e.target.value }))
                  }
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  End Date<span className="text-red-500 ml-1">*</span>
                </label>
                <InputFields
                  label=""
                  type="date"
                  value={promotion.endDate}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, endDate: e.target.value }))
                  }
                  width="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">
                  Status<span className="text-red-500 ml-1">*</span>
                </label>
                <InputFields
                  label=""
                  type="radio"
                  isSingle={true}
                  options={[
                    { label: "Active", value: "1" },
                    { label: "Inactive", value: "0" },
                  ]}
                  value={promotion.status}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, status: e.target.value }))
                  }
                  width="w-full"
                />
              </div>
            </div>
            <div className="mt-8">
              <div className="font-semibold text-lg mb-4">Items</div>
              <div className="mb-6">
                <Table
                  data={paginatedData}
                  config={{
                    table: {
                      height: 500,
                    },
                    showNestedLoading: false,
                    columns: [
                      {
                        key: "itemCode",
                        label: "Item Code",
                        render: (row) => (
                          <span className="font-semibold text-[#181D27] text-[14px]">
                            {row.itemCode || "-"}
                          </span>
                        ),
                      },
                      {
                        key: "itemName",
                        label: "Item Name",
                        render: (row) => {return row.itemName || "-";}
                        
                      },
                      {
                        key: "price",
                        label: "Price",
                        render: (row) => (
                          <div className="text-[14px] text-[#181D27] font-semibold space-y-1">
                            {Array.isArray(row?.uom) && row.uom.length > 0 ? (
                              row.uom.map((u) => (
                                <div key={u.id}>
                                  {u.name ? `${u.name} - ₹${u.price}` : `₹${u.price}`}
                                </div>
                              ))
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "buom_ctn_price",
                        label: "Base Price",
                        render: (row) => (
                          <InputFields
                            label=""
                            type="text"
                            value={row.buom_ctn_price || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPromotion((s) => {
                                const arr = [...s.orderItems];
                                const idxFound = arr.findIndex(
                                  (oi) => oi.itemCode === row.itemCode
                                );
                                if (idxFound !== -1) {
                                  arr[idxFound] = {
                                    ...arr[idxFound],
                                    buom_ctn_price: val,
                                  };
                                } else {
                                  arr.push({
                                    itemName: row.itemName,
                                    itemCode: row.itemCode,
                                    quantity: "",
                                    toQuantity: "",
                                    uom: "CTN",
                                    price: row.price,
                                    buom_ctn_price: val,
                                    auom_pc_price: val,
                                  });
                                }
                                // filter logic, etc... as before.
                                return { ...s, orderItems: arr };
                              });
                            }}
                            width="w-full"
                          />
                        ),
                      },
                      {
                        key: "auom_pc_price",
                        label: "Secondary Price",
                        render: (row) => (
                          <InputFields
                            label=""
                            type="text"
                            value={row.auom_pc_price || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPromotion((s) => {
                                const arr = [...s.orderItems];
                                const idxFound = arr.findIndex(
                                  (oi) => oi.itemCode === row.itemCode
                                );
                                if (idxFound !== -1) {
                                  arr[idxFound] = {
                                    ...arr[idxFound],
                                    auom_pc_price: val,
                                  };
                                } else {
                                  arr.push({
                                    itemName: row.itemName,
                                    itemCode: row.itemCode,
                                    quantity: "",
                                    toQuantity: "",
                                    uom: "CTN",
                                    price: row.price,
                                    auom_pc_price: val,
                                    buom_ctn_price: val,
                                  });
                                }
                                // filter logic, etc... as before.
                                return { ...s, orderItems: arr };
                              });
                            }}
                            width="w-full"
                          />
                        ),
                      },
                    ],
                    rowActions: [
                      {
                        icon: "lucide:trash-2",
                        onClick: (row) => {
                          // Remove from selected items in keyValue["Item"]
                          setKeyValue((prev) => ({
                            ...prev,
                            Item: (prev.Item || []).filter((itemId) => {
                              let itemData = selectedItemDetails.find(
                                (item) =>
                                  String(item.code || item.itemCode) ===
                                  String(itemId)
                              );
                              if (!itemData) {
                                itemData = itemOptions.find(
                                  (opt) => String(opt.value) === String(itemId)
                                );
                              }
                              let itemCode = "-";
                              if (itemData) {
                                if (itemData.code) itemCode = itemData.code;
                                else if (itemData.itemCode)
                                  itemCode = itemData.itemCode;
                                else if (itemData.label) {
                                  const labelParts = String(
                                    itemData.label
                                  ).split(" - ");
                                  itemCode =
                                    labelParts.length > 1
                                      ? labelParts[0]
                                      : String(itemData.label);
                                }
                              } else {
                                itemCode = String(itemId);
                              }
                              return itemCode !== row.itemCode;
                            }),
                          }));

                          // Remove from promotion orderItems if set
                          setPromotion((s) => ({
                            ...s,
                            orderItems: s.orderItems.filter(
                              (oi) => oi.itemCode !== row.itemCode
                            ),
                          }));
                        },
                      },
                    ],

                    pageSize: 50,
                  }}
                />
                {/* {itemsData.length > pageSize && renderPaginationBar()} */}
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
        <Link href="/pricing">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Update Pricing" : "Add Pricing"}
        </h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <StepperForm
          steps={steps.map((step) => ({
            ...step,
            isCompleted: isStepCompleted(step.id),
          }))}
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
