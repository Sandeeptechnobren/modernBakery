"use client";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";
import AutoSuggestion from "@/app/components/autoSuggestion";
import ContainerCard from "@/app/components/containerCard";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import {
  itemList,
  addPricingDetail,
  pricingDetailById,
  pricingHeaderById,
  editPricingDetail,
  companyList,
  companyListGlobalSearch,
  regionList,
  regionGlobalSearch,
  subRegionList,
  subRegionListGlobalSearch,
  warehouseList,
  warehouseListGlobalSearch,
  routeList,
  routeGlobalSearch,
  customerCategoryGlobalSearch,
  agentCustomerGlobalSearch,
  itemGlobalSearch,
  channelList,
  itemCategory,
} from "@/app/services/allApi";
import CustomCheckbox from "@/app/components/customCheckbox";
import InputFields from "@/app/components/inputFields";
import Table, { TableDataType } from "@/app/components/customTable";
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

const Buom = ({ row, details, setDetails }: any) => {
  const [buom, setBuom] = useState("");
  const primary_uom = row?.item_uoms.find((u: any) => u.uom_type === "primary");
  const trailingValue = primary_uom?.name + " - " + primary_uom?.uom_price;

  useEffect(() => {
    details.filter((ids: any, index: number) => {
      // console.log(ids, "ids", row?.id)
      if (ids.item_id == row?.id) {
        setBuom(ids.buom_ctn_price)
      }
    })
  }, [])

  return (<InputFields
    label=""
    type="number"
    min={0}
    step="0.01"
    value={buom}
    trailingElement={trailingValue || " "}
    onChange={(e) => {
      setBuom(e.target.value)
      let isAvailable = false
      let indexVal = 0
      if (details.length > 0) {

        details.filter((ids: any, index: number) => {
          console.log(ids, "ids", row?.id)
          if (ids.item_id == row?.id) {
            isAvailable = true
            indexVal = index

          }
        })

        if (isAvailable) {
          details[indexVal] = { ...details[indexVal], buom_ctn_price: e.target.value }
          setDetails(details)
        }
        else {
          const newdata = { buom_ctn_price: e.target.value, auom_pc_price: 0, item_id: row?.id, name: `${row?.item_code}-${row?.name}` }
          details.push(newdata)
          setDetails(details)
        }

        // let newdata = {buom_ctn_price:e.target.value,auom_pc_price:0,item_id:row?.id,name:`${row?.item_code}-${row?.name}`}    
        // details.push(newdata)
        // setDetails(details)

      }
      else {
        const newdata = { buom_ctn_price: e.target.value, auom_pc_price: 0, item_id: row?.id, name: `${row?.item_code}-${row?.name}` }
        details.push(newdata)
        setDetails(details)

      }

    }}
    width="w-full"
  />)
}

const Auom = ({ row, details, setDetails }: any) => {
  const [auom, setAuom] = useState("");
  const secondary_uom = row?.item_uoms.find((u: any) => u.uom_type === "secondary");
  const trailingValue = secondary_uom?.name + " - " + secondary_uom?.uom_price;

  useEffect(() => {
    details.filter((ids: any, index: number) => {
      // console.log(ids, "ids", row?.id)
      if (ids.item_id == row?.id) {
        setAuom(ids.auom_pc_price)

      }
    })
  }, [])
  return (<InputFields
    label=""
    type="number"
    min={0}
    step="0.01"
    value={auom || ""}
    trailingElement={trailingValue || " "}
    onChange={(e) => {
      setAuom(e.target.value)
      let isAvailable = false
      let indexVal = 0
      if (details.length > 0) {

        details.filter((ids: any, index: number) => {
          // console.log(ids, "ids", row?.id)
          if (ids.item_id == row?.id) {
            isAvailable = true
            indexVal = index

          }
        })

        if (isAvailable) {
          details[indexVal] = { ...details[indexVal], auom_pc_price: e.target.value }
          setDetails(details)
        }
        else {
          const newdata = { buom_ctn_price: 0, auom_pc_price: e.target.value, item_id: row?.id, name: `${row?.item_code}-${row?.name}` }
          details.push(newdata)
          setDetails(details)
        }

        // let newdata = {buom_ctn_price:e.target.value,auom_pc_price:0,item_id:row?.id,name:`${row.item_code}-${row.name}`}    
        // details.push(newdata)
        // setDetails(details)
      }
      else {
        const newdata = { buom_ctn_price: 0, auom_pc_price: e.target.value, item_id: row?.id, name: `${row?.item_code}-${row?.name}` }
        details.push(newdata)
        setDetails(details)

      }
    }}
    width="w-full"
  />)
}

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
  // All dropdown state declarations and keyValue at the very top
  const [keyValue, setKeyValue] = useState<Record<string, string[]>>({});
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: string }[]>([]);
  const [regionOptions, setRegionOptions] = useState<{ label: string; value: string }[]>([]);
  const [areaOptions, setAreaOptions] = useState<{ label: string; value: string }[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<{ label: string; value: string }[]>([]);
  const [routeOptions, setRouteOptions] = useState<{ label: string; value: string }[]>([]);
  const [channelOptions, setChannelOptions] = useState<{ label: string; value: string }[]>([]);
  const [customerCategoryOptions, setCustomerCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [itemCategoryOptions, setItemCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [itemOptions, setItemOptions] = useState<{ label: string; value: string }[]>([]);

  // Removed duplicate dropdown state declarations

  // Removed duplicate keyValue declaration
  useEffect(() => {
    async function loadCompanies() {
      const companies = await companyList();
      setCompanyOptions(companies?.data?.map((c: any) => ({ label: c.company_name || c.name, value: String(c.id) })) || []);
    }
    loadCompanies();
    // preload some channel and categories for better UX
    (async () => {
      try {
        const ch = await channelList({ per_page: "50" });
        setChannelOptions((ch?.data || []).map((c: any) => ({
          label: `${c.outlet_channel || c.outlet_channel_name || c.channel_name || c.name || ''}`,
          value: String(c.id),
        })));
      } catch (e) {}
      try {
        const cat = await customerCategoryGlobalSearch({ per_page: "50" });
        setCustomerCategoryOptions((cat?.data || []).map((c: any) => ({ label: `${c.customer_category_name  || ''}`, value: String(c.id) })));
      } catch (e) {}
      try {
        const ic = await itemCategory({ per_page: "50" });
        setItemCategoryOptions((ic?.data || []).map((c: any) => ({ label: c.category_name || c.name || "", value: String(c.id) })));
      } catch (e) {}
    })();
  }, []);

  // When company changes, fetch regions and reset children
  useEffect(() => {
    if (!keyValue["Company"] || keyValue["Company"].length === 0) {
      setRegionOptions([]);
      setAreaOptions([]);
      setWarehouseOptions([]);
      setRouteOptions([]);
      setKeyValue((kv) => ({ ...kv, Region: [], Area: [], Warehouse: [], Route: [] }));
      return;
    }
    async function fetchRegions() {
      const regions = await regionList({ company_id: keyValue["Company"].join(",") });
      setRegionOptions(regions?.data?.map((r: any) => ({ label: r.region_name || r.name, value: String(r.id) })) || []);
      setKeyValue((kv) => ({ ...kv, Region: [], Area: [], Warehouse: [], Route: [] }));
    }
    fetchRegions();
  }, [keyValue["Company"]]);

  // When region changes, fetch areas and reset children
  useEffect(() => {
    if (!keyValue["Region"] || keyValue["Region"].length === 0) {
      setAreaOptions([]);
      setWarehouseOptions([]);
      setRouteOptions([]);
      setKeyValue((kv) => ({ ...kv, Area: [], Warehouse: [], Route: [] }));
      return;
    }
    async function fetchAreas() {
      const areas = await subRegionList({ region_id: keyValue["Region"].join(",") });
      setAreaOptions(areas?.data?.map((a: any) => ({ label: a.area_name || a.name, value: String(a.id) })) || []);
      setKeyValue((kv) => ({ ...kv, Area: [], Warehouse: [], Route: [] }));
    }
    fetchAreas();
  }, [keyValue["Region"]]);

  // When area changes, fetch warehouses and reset children
  useEffect(() => {
    if (!keyValue["Area"] || keyValue["Area"].length === 0) {
      setWarehouseOptions([]);
      setRouteOptions([]);
      setKeyValue((kv) => ({ ...kv, Warehouse: [], Route: [] }));
      return;
    }
    async function fetchWarehouses() {
      const warehouses = await warehouseList({ area_id: keyValue["Area"].join(",") });
      setWarehouseOptions(warehouses?.data?.map((w: any) => ({ label: w.warehouse_name || w.name, value: String(w.id) })) || []);
      setKeyValue((kv) => ({ ...kv, Warehouse: [], Route: [] }));
    }
    fetchWarehouses();
  }, [keyValue["Area"]]);

  // When warehouse changes, fetch routes and reset child
  useEffect(() => {
    if (!keyValue["Warehouse"] || keyValue["Warehouse"].length === 0) {
      setRouteOptions([]);
      setKeyValue((kv) => ({ ...kv, Route: [] }));
      return;
    }
    async function fetchRoutes() {
      const routes = await routeList({ warehouse_id: keyValue["Warehouse"].join(",") });
      setRouteOptions(routes?.data?.map((r: any) => ({ label: r.route_name || r.name, value: String(r.id) })) || []);
      setKeyValue((kv) => ({ ...kv, Route: [] }));
    }
    fetchRoutes();
  }, [keyValue["Warehouse"]]);
  
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
  const router = useRouter();
  const params = useParams();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearErrors = () => setErrors({});
  // support routes that use either [uuid] or [id] as the segment name
  const rawParam = (typeof params === "object" && params !== null ? (params as Record<string, unknown>)?.uuid : undefined) ?? (typeof params === "object" && params !== null ? (params as Record<string, unknown>)?.id : undefined);
  const id = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const isEditMode = id !== undefined && id !== "add" && id !== "";
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState([])

  // Fetch existing pricing details in edit mode
  useEffect(() => {
    async function fetchEditData() {
      if (!isEditMode || !id) return;
      setLoading(true);
      try {
        const raw = await pricingHeaderById(id);
        setDetails(raw.data.details)
        const res = raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw;
        if (res && typeof res === "object") {
          setPromotion((s) => ({
            ...s,
            itemName: res.name || res.title || s.itemName,
            applicable_for: res.applicable_for || s.applicable_for,
            startDate: res.start_date || s.startDate,
            endDate: res.end_date || s.endDate,
            status: res.status !== undefined ? String(res.status) : s.status,
          }));

          try {
            const descArr: number[] = Array.isArray((res as Record<string, unknown>).description)
              ? ((res as Record<string, unknown>).description as unknown[]).map((d) => Number(d)).filter((n: number) => !Number.isNaN(n))
              : [];

            const selectedForCombo: { Location: string[]; Customer: string[]; Item: string[] } = {
              Location: [],
              Customer: [],
              Item: [],
            };

            initialKeys.forEach((group) => {
              group.options.forEach((opt) => {
                const optId = Number(opt.id);
                if (!Number.isNaN(optId) && descArr.includes(optId)) {
                  if (group.type === "Location") selectedForCombo.Location.push(opt.label);
                  else if (group.type === "Customer") selectedForCombo.Customer.push(opt.label);
                  else if (group.type === "Item") selectedForCombo.Item.push(opt.label);
                }
              });
            });
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
                console.log(nextKeyValue);
                
                const items = await itemList({ ids: nextKeyValue["Item"] });
                if (Array.isArray(items)) setSelectedItemDetails(items as ItemDetail[]);
                else if (items && typeof items === "object" && Array.isArray((items as Record<string, unknown>).data)) setSelectedItemDetails((items as Record<string, unknown>).data as ItemDetail[]);
              } catch (innerErr) {
                console.error("Failed to fetch item details for edit mode", innerErr);
              }
            }
            // If API returned pricing details (per-item prices), map them into promotion.orderItems
            try {
              const detailsArr = Array.isArray((res as Record<string, unknown>).details)
                ? ((res as Record<string, unknown>).details as unknown[])
                : [];
              if (detailsArr.length > 0) {
                const mappedOrderItems = detailsArr.map((d) => {
                  const det = d as Record<string, unknown>;
                  const rec = det as Record<string, unknown>;
                  const itemName = typeof rec["item_name"] === "string"
                    ? (rec["item_name"] as string)
                    : typeof rec["name"] === "string"
                      ? (rec["name"] as string)
                      : "";
                  let itemCodeStr = "";
                  if (rec["item_code"] != null) itemCodeStr = String(rec["item_code"]);
                  else if (rec["item_id"] != null) itemCodeStr = String(rec["item_id"]);
                  const itemIdNum = rec["item_id"] != null ? Number(rec["item_id"]) : undefined;
                  const buom = rec["buom_ctn_price"] != null ? String(rec["buom_ctn_price"]) : "";
                  const auom = rec["auom_pc_price"] != null ? String(rec["auom_pc_price"]) : "";

                  return {
                    itemName,
                    // keep both itemCode (string code) and item_id for flexible matching
                    itemCode: itemCodeStr,
                    item_id: itemIdNum,
                    quantity: "",
                    toQuantity: "",
                    uom: "CTN",
                    // keep `price` empty — use buom/auom fields for base/secondary prices
                    price: "",
                    buom_ctn_price: buom,
                    auom_pc_price: auom,
                  };
                });
                setPromotion((p) => ({ ...p, orderItems: mappedOrderItems }));
              }
            } catch (mapErr) {
              console.error("Failed to map details to orderItems", mapErr);
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

  const validateStep = (step: number) => {
    if (step === 1) {
      return (
        // keyCombo.Location.length > 0 &&
        // keyCombo.Customer.length > 0 &&
        keyCombo.Item.length > 0
      );
    }
    if (step === 2) {
      // Require values only for keys that the user selected in Step 1.
      // For each selected label in keyCombo, ensure keyValue[label] exists and has at least one selection.
      const requireSelectedValues = (labels: string[]) => {
        for (const label of labels) {
          const vals = keyValue[label] || [];
          if (!Array.isArray(vals) || vals.length === 0) return false;
        }
        return true;
      };

      // If any selected key group has no corresponding values, block progression.
      // if (!requireSelectedValues(keyCombo.Location)) return false;
      // if (!requireSelectedValues(keyCombo.Customer)) return false;
      if (!requireSelectedValues(keyCombo.Item)) return false;

      return true;
    }
    if (step === 3) {
      return promotion.itemName && promotion.startDate && promotion.endDate;
    }
    return true;
  };

  const handleNext = () => {
    try {
      validateStep(currentStep);
    } catch (itemErr: any) {
      console.error("Item validation errors:", itemErr.inner || itemErr);
      showSnackbar(itemErr.inner.map((err: any) => err.message).join(", "), "error");
    }
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

  const pricingValidationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    applicable_for: yup.string().required("Pricing Type is Required"),
    start_date: yup.string().required("Start date is required"),
    end_date: yup.string().required("End date is required"),
    item: yup.array().of(yup.string()).min(1, "At least one item is required"),
    key: yup.object({
      // Location: yup.array().of(yup.string()).min(1, "Location key required"),
      // Customer: yup.array().of(yup.string()).min(1, "Customer key required"),
      Item: yup.array().of(yup.string()).min(1, "Item key required"),
    }),
  });

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
      applicable_for: promotion.applicable_for,
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
      details: details,
    };
    console.log(payload, "payload567");

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
        console.log(formErrors, "formerrors");
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
    Item: ["Item"],
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
    item_id?: number;
  };

  // Removed duplicate keyValue declaration
  const [promotion, setPromotion] = useState<{
    itemName: string;
    applicable_for: string;
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
    applicable_for: "Primary",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    status: "1",
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
  // useEffect(() => {
  //   if (keyValue["Item"] && keyValue["Item"].length > 0) {
  //     itemList({ ids: keyValue["Item"].join(",") })
  //       .then((data) => {
  //         let items: ItemDetail[] = [];
  //         if (Array.isArray(data)) {
  //           items = data as ItemDetail[];
  //         } else if (
  //           data &&
  //           typeof data === "object" &&
  //           Array.isArray(data.data)
  //         ) {
  //           items = data.data as ItemDetail[];
  //         }
  //         setSelectedItemDetails(items);
  //       })
  //       .catch((err) => {
  //         console.error("Failed to fetch item details", err);
  //       });
  //   } else {
  //     setSelectedItemDetails([]);
  //   }
  // console.log(keyValue["Item"], "keyvalueitem520");
  // }, [keyValue["Item"]]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectKeyCombination keyCombo={keyCombo} setKeyCombo={setKeyCombo} />
        );
      case 2:
        // Helper functions for dynamic fetching
        const handleCompanySearch = async (q: string) => {
          if (!q || q.trim().length === 0) return companyOptions;
          try {
            const res = await companyListGlobalSearch({ query: q, per_page: "50" });
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((c: any) => ({ value: String(c.id), label: `${c.company_code || c.name || ""} - ${c.company_name || c.name || ""}` }));
          } catch (err) {
            return [];
          }
        };

        const handleRegionSearch = async (q: string) => {
          if (!q || q.trim().length === 0) return regionOptions;
          try {
            const params: any = { query: q, per_page: "50" };
            if (keyValue["Company"] && keyValue["Company"].length > 0) params.company_id = keyValue["Company"].join(",");
            const res = await regionGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((r: any) => ({ value: String(r.id), label: `${r.region_code || r.code || ""} - ${r.region_name || r.name || ""}` }));
          } catch (err) {
            return [];
          }
        };

        const handleAreaSearch = async (q: string) => {
          if (!q || q.trim().length === 0) return areaOptions;
          try {
            const params: any = { query: q, per_page: "50" };
            if (keyValue["Region"] && keyValue["Region"].length > 0) params.region_id = keyValue["Region"].join(",");
            const res = await subRegionListGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((a: any) => ({ value: String(a.id), label: `${a.area_code || a.code || ""} - ${a.area_name || a.name || ""}` }));
          } catch (err) {
            return [];
          }
        };

        const handleWarehouseSearch = async (q: string) => {
          if (!q || q.trim().length === 0) return warehouseOptions;
          try {
            const params: any = { query: q, per_page: "50" };
            if (keyValue["Area"] && keyValue["Area"].length > 0) params.area_id = keyValue["Area"].join(",");
            const res = await warehouseListGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((w: any) => ({ value: String(w.id), label: `${w.warehouse_code || w.code || ""} - ${w.warehouse_name || w.name || ""}` }));
          } catch (err) {
            return [];
          }
        };

        const handleRouteSearch = async (q: string) => {
          if (!q || q.trim().length === 0) return routeOptions;
          try {
            const params: any = { query: q, per_page: "50" };
            if (keyValue["Warehouse"] && keyValue["Warehouse"].length > 0) params.warehouse_id = keyValue["Warehouse"].join(",");
            const res = await routeGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((r: any) => ({ value: String(r.id), label: `${r.route_code || r.code || ""} - ${r.route_name || r.name || ""}` }));
          } catch (err) {
            return [];
          }
        };

        const handleCustomerCategorySearch = async (q: string) => {
          if (!q || q.trim().length === 0) return customerCategoryOptions || [];
          try {
            const params: any = { query: q, per_page: "50" };
            if (keyValue["Channel"] && keyValue["Channel"].length > 0) {
              params.channel_id = keyValue["Channel"].join(",");
            }
            const res = await customerCategoryGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((c: any) => ({ value: String(c.id), label: c.customer_category_name || c.name || "" }));
          } catch (err) {
            return [];
          }
        };

        const handleChannelSearch = async (q: string) => {
          if (!q || q.trim().length === 0) return channelOptions || [];
          try {
            const res = await channelList({ query: q, per_page: "50" });
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((c: any) => ({
              value: String(c.id),
              label: `${c.outlet_channel || c.outlet_channel_name || c.channel_name || c.name || ''}`,
            }));
          } catch (err) {
            return [];
          }
        };

        const handleItemCategorySearch = async (q: string) => {
          if (!q || q.trim().length === 0) return itemCategoryOptions || [];
          try {
            const res = await itemCategory({ query: q, per_page: "50" });
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((c: any) => ({ value: String(c.id), label: c.category_name || c.name || "" }));
          } catch (err) {
            return [];
          }
        };

        const handleCustomerSearch = async (q: string) => {
          if (!q || q.trim().length === 0) return [];
          try {
            const params: any = { query: q, per_page: "10" };
            if (keyValue["Customer Category"] && keyValue["Customer Category"].length > 0) params.customer_category_id = keyValue["Customer Category"].join(",");
            const res = await agentCustomerGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((c: any) => ({ value: String(c.id), label: `${c.osa_code || c.code || ""}${c.name ? " - " + (c.name || c.customer_name || c.outlet_name) : ""}` }));
          } catch (err) {
            return [];
          }
        };

        const handleItemSearch = async (q: string) => {
          // allow empty query to return cached itemOptions
          if (!q || q.trim().length === 0) return itemOptions || [];
          try {
            const params: any = { query: q};
            // if item category is selected, filter items by category
            if (keyValue["Item Category"] && keyValue["Item Category"].length > 0) {
              params.item_category_id = keyValue["Item Category"].join(",");
            }
            const res = await itemGlobalSearch(params);
            const data = Array.isArray(res?.data) ? res.data : [];
            return data.map((it: any) => ({ data: it, value: String(it.id), label: `${it.erp_code || ""}${it.name ? " - " + it.name : ""}`, code: it.item_code || it.code, name: it.name }));
          } catch (err) {
            return [];
          }
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
                      <AutoSuggestion
                        key={`autosuggest-location-${locKey}`}
                        name={locKey}
                        placeholder={`Search ${locKey}`}
                        // multiple={true}
                        initialSelected={(() => {
                          const sel = keyValue[locKey] || [];
                          const opts = locKey === "Company" ? companyOptions : locKey === "Region" ? regionOptions : locKey === "Area" ? areaOptions : locKey === "Warehouse" ? warehouseOptions : routeOptions;
                          return opts.filter((o) => sel.includes(o.value));
                        })()}
                        onSearch={async (q: string) => {
                          if (locKey === "Company") return await handleCompanySearch(q as string);
                          if (locKey === "Region") return await handleRegionSearch(q as string);
                          if (locKey === "Area") return await handleAreaSearch(q as string);
                          if (locKey === "Warehouse") return await handleWarehouseSearch(q as string);
                          if (locKey === "Route") return await handleRouteSearch(q as string);
                          return [];
                        }}
                        onChangeSelected={(selected) => {
                          setKeyValue((s) => ({ ...s, [locKey]: selected.map((o) => o.value) }));
                        }}
                        onSelect={(opt: { value: string }) => {
                          // maintain backward compatibility: add selection if not present
                          setKeyValue((s) => {
                            const prev = s[locKey] || [];
                            if (prev.includes(String(opt.value))) return s;
                            return { ...s, [locKey]: [...prev, String(opt.value)] };
                          });
                        }}
                        onClear={() => setKeyValue((s) => ({ ...s, [locKey]: [] }))}
                        error={undefined}
                        className="w-full"
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
                      <AutoSuggestion
                        key={`autosuggest-customer-${custKey}`}
                        label=""
                        name={custKey}
                        placeholder={`Search ${custKey}`}
                        multiple={true}
                        initialSelected={(() => {
                          const sel = keyValue[custKey] || [];
                          // for customer category we may not have a local cache; fall back to empty
                          if (custKey === "Customer Category") return customerCategoryOptions.filter((o) => sel.includes(o.value));
                          if (custKey === "Channel") return channelOptions.filter((o) => sel.includes(o.value));
                          if (custKey === "Customer") return [];
                          return [];
                        })()}
                        onSearch={async (q: string) => {
                          if (custKey === "Channel") return await handleChannelSearch(q as string);
                          if (custKey === "Customer Category") return await handleCustomerCategorySearch(q as string);
                          if (custKey === "Customer") return await handleCustomerSearch(q as string);
                          return [];
                        }}
                        onChangeSelected={(selected) => {
                          setKeyValue((s) => ({ ...s, [custKey]: selected.map((o) => o.value) }));
                        }}
                        onSelect={(opt: { value: string }) => {
                          setKeyValue((s) => {
                            const prev = s[custKey] || [];
                            if (prev.includes(String(opt.value))) return s;
                            return { ...s, [custKey]: [...prev, String(opt.value)] };
                          });
                        }}
                        onClear={() => setKeyValue((s) => ({ ...s, [custKey]: [] }))}
                        error={undefined}
                        className="w-full"
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
                      <AutoSuggestion
                        key={`autosuggest-item-${itemKey}`}
                        label=""
                        name={itemKey}
                        placeholder={`Search ${itemKey}`}
                        multiple={true}
                        initialSelected={(() => {
                          const sel = keyValue[itemKey] || [];
                          if (itemKey === "Item") {
                            return selectedItemDetails
                              .filter((it) => sel.includes(String(it.id)))
                              .map((it) => ({ value: String((it as any).id || ""), label: `${(it as any).item_code || (it as any).code || ""}${(it as any).name ? " - " + (it as any).name : ""}` }));
                          }
                          if (itemKey === "Item Category") return itemCategoryOptions.filter((o) => sel.includes(o.value));
                          return [];
                        })()}
                        onSearch={async (q: string) => {
                          if (itemKey === "Item Category") return await handleItemCategorySearch(q as string);
                          if (itemKey === "Item") return await handleItemSearch(q as string);
                          return [];
                        }}
                        onChangeSelected={(selected) => {
                          setSelectedItemDetails(selected);
                          setKeyValue((s) => ({ ...s, [itemKey]: selected.map((o) => o.value) }));
                        }}
                        onSelect={(opt: { value: string }) => {
                          setKeyValue((s) => {
                            const prev = s[itemKey] || [];
                            if (prev.includes(String(opt.value))) return s;
                            return { ...s, [itemKey]: [...prev, String(opt.value)] };
                          });
                        }}
                        onClear={() => setKeyValue((s) => ({ ...s, [itemKey]: [] }))}
                        error={undefined}
                        className="w-full"
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
          const itemData = selectedItemDetails.find(
            (item) => String(item.code || item.itemCode) === String(itemId)
          );
          if (!itemData) {
            // No itemData available, use safe defaults
          }
          let itemCode = "-";
          // No itemData, use itemId as code
          itemCode = typeof itemId !== "undefined" ? String(itemId) : "-";
          let itemName = "-";
          // No itemData, use itemId as name
          itemName = typeof itemId !== "undefined" ? String(itemId) : "-";
          const orderItem = promotion.orderItems.find((oi) =>
            oi.itemCode === itemCode || String(oi.item_id) === String(itemId) || String(oi.itemCode) === String(itemId)
          );
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
        const paginatedData = itemsData
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

        return (
          <ContainerCard className="bg-[#fff] p-6 rounded-xl border border-[#E5E7EB]">
            <h2 className="text-xl font-semibold mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              <div>
                <InputFields
                  required
                  label="Name"
                  type="text"
                  value={promotion.itemName}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, itemName: e.target.value }))
                  }
                  width="w-full"
                  error={errors.itemName}
                />
              </div>
              <div>
                <InputFields
                  type="select"
                  label="Pricing Type"
                  placeholder="Select Pricing Type"
                  value={promotion.applicable_for}
                  options={[
                    { label: "Primary", value: "Primary" },
                    { label: "Secondary", value: "Secondary" },
                  ]}
                  onChange={(e) => setPromotion({...promotion, applicable_for: e.target.value})}
                  error={errors.applicable_for}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="Status"
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
              <div>
                <InputFields
                  required
                  label="Start Date"
                  type="date"
                  value={promotion.startDate || new Date(Date.now()).toISOString().slice(0, 10)}
                  min={new Date(Date.now()).toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, startDate: e.target.value }))
                  }
                  width="w-full"
                  error={errors.startDate}
                />
              </div>
              <div>
                <InputFields
                  required
                  label="End Date"
                  type="date"
                  value={promotion.endDate || new Date(Date.now()).toISOString().slice(0, 10)}
                  min={promotion.startDate || new Date(Date.now()).toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setPromotion((s) => ({ ...s, endDate: e.target.value }))
                  }
                  width="w-full"
                  error={errors.endDate}
                />
              </div>
            </div>
            <div className="mt-8">
              <div className="font-semibold text-lg mb-4">Items</div>
              <div className="mb-6">
                <Table
                  data={selectedItemDetails.map((it) => it.data) as TableDataType[]}
                  config={{
                    table: {
                      height: 500,
                    },
                    showNestedLoading: false,
                    columns: [
                      {
                        key: "item_code",
                        label: "Item Code",
                        render: (row) => (
                          <span className="font-semibold text-[#181D27] text-[14px]">
                            {row?.code}- {row?.name}
                          </span>
                        ),
                      },

                      // {
                      //   key: "price",
                      //   label: "Price",
                      //   render: (row) => (
                      //     <div className="text-[14px] text-[#181D27] font-semibold space-y-1">
                      //       {Array.isArray(row?.item_uoms) && row?.item_uoms.length > 0 ? (
                      //         row?.item_uoms.map((u) => (
                      //           <div key={u?.id}>
                      //             {`${u?.name} - ${u?.uom_price}`}
                      //           </div>
                      //         ))
                      //       ) : (
                      //         <span>-</span>
                      //       )}
                      //     </div>
                      //   ),
                      // },
                      {
                        key: "buom_ctn_price",
                        label: "Base Price",
                        render: (row) => (
                          <Buom row={row} setDetails={setDetails} details={details} />
                        ),
                      },
                      {
                        key: "auom_pc_price",
                        label: "Secondary Price",
                        render: (row) => (
                          <Auom row={row} setDetails={setDetails} details={details} />
                        ),
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
  if (
    isEditMode && loading
  ) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <Link href="/pricing">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
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
          onSubmit={() => {
            handleNext();
            handleSubmit();
          }}
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
