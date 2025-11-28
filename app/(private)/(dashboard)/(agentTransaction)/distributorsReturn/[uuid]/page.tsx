"use client";

import AutoSuggestion from "@/app/components/autoSuggestion";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  createReturn,
  deliveryByUuid,
  reasonList,
  returnType,
  updateDelivery,
} from "@/app/services/agentTransaction";
import {
  agentCustomerList,
  genearateCode,
  itemGlobalSearch,
  routeList,
  saveFinalCode,
  warehouseListGlobalSearch,
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import * as yup from "yup";

// ---- Types ----
interface Uom {
  id: string;
  name?: string;
  price?: string | number;
  uom_price?: string | number;
  uom_type?: string | number;
}

interface Pricing {
  buom_ctn_price?: string | number;
  auom_pc_price?: string | number;
}

interface Reason {
  id?: number | string;
  reson?: string;
  return_reason?: string;
  return_type?: string;
  reason?: string;
}

interface DeliveryDetail {
  item?: {
    id?: number;
    code?: string;
    name?: string;
  };
  uom_id?: number | string;
  uom_name?: string;
  quantity?: number;
  item_price?: number | string;
  item_uoms?: Uom[];
  return_type?: string;
  return_reason?: string;
}

interface DeliveryResponse {
  warehouse?: { id?: number; code?: string; name?: string };
  customer?: { id?: number; name?: string; outlet_name?: string };
  route?: { id?: number; name?: string; route_name?: string };
  details?: DeliveryDetail[];
  // possibly code fields
  return_code?: string;
  delivery_code?: string;
  code?: string;
}

interface ItemOption {
  value: string;
  label: string;
  name?: string;
  uoms?: Uom[];
  pricing?: Pricing;
}

type ItemRow = {
  idx?: string;
  item_id: string;
  itemName: string;
  itemLabel: string;
  UOM: string;
  uom_id: string;
  Price: string;
  Total: string;
  Quantity: string;
  return_type: string;
  return_reason: string;
};

// ---- Component ----
export default function OrderAddEditPage() {
  const {
    warehouseOptions,
    agentCustomerOptions,
    companyCustomersOptions,
    itemOptions: rawItemOptions,
    fetchAgentCustomerOptions,
    routeOptions,
  } = useAllDropdownListData();

  // cast itemOptions coming from context to our ItemOption[] (defensive)
  const itemOptions = (rawItemOptions as unknown as ItemOption[]) ?? [];

  const [returnTypeOptions, setReturnTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [goodReasonOptions, setGoodReasonOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams() as { uuid?: string } | undefined;
  const CURRENCY = typeof window !== "undefined" ? localStorage.getItem("country") || "" : "";
  const uuid = params?.uuid as string | undefined;
  const isEditMode = uuid !== undefined && uuid !== "add";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  const [form, setForm] = useState({
    warehouse: "",
    warehouse_name: "",
    customer: "",
    customer_name: "",
    route: "",
    route_name: "",
  });

  // static fallback options
  const goodOptions = [
    { label: "Near By Expiry", value: "0" },
    { label: "Package Issue", value: "1" },
    { label: "Not Saleable", value: "2" },
  ];
  const badOptions = [
    { label: "Damage", value: "0" },
    { label: "Expiry", value: "1" },
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});
  // UOM options per row
  const [rowUomOptions, setRowUomOptions] = useState<
    Record<string, { value: string; label: string; price?: string | number; uom_type?: string | number }[]>
  >({});
  // reason options per row
  const [rowReasonOptions, setRowReasonOptions] = useState<Record<string, { label: string; value: string }[]>>(
    {}
  );

  const [itemData, setItemData] = useState<ItemRow[]>([
    {
      item_id: "",
      itemName: "",
      itemLabel: "",
      UOM: "",
      uom_id: "",
      Price: "",
      Total: "0.00",
      Quantity: "1",
      return_type: "",
      return_reason: "",
    },
  ]);

  // ---------- Fetch returnType list ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await returnType();
        const list = Array.isArray(res?.data) ? (res.data as Reason[]) : [];
        const options = list.map((r) => ({
          label: r.reson || r.return_reason || r.return_type || String(r.id),
          value: String(r.id),
        }));
        setReturnTypeOptions(options);
      } catch (err) {
        console.error("Failed to fetch returnType:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Fetch reason list (good/bad) ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await reasonList();
        const list = Array.isArray(res?.data) ? (res.data as Reason[]) : [];
        const options = list.map((reason: Reason) => ({
          label: reason.reson || reason.return_reason || reason.return_type || String(reason.id),
          value: String(reason.id),
        }));
        setGoodReasonOptions(options);
      } catch (err) {
        console.error("Failed to fetch reason list:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Load delivery for edit mode ----------
  useEffect(() => {
    if (!isEditMode || !uuid || itemOptions.length === 0) return;

    (async () => {
      try {
        setLoading(true);
        const response = await deliveryByUuid(uuid);
        const data = (response?.data ?? response) as DeliveryResponse;

        const warehouseObj = data?.warehouse;
        const warehouseCode = warehouseObj?.code ?? "";
        const warehouseName = warehouseObj?.name ?? "";
        const warehouseLabel = `${warehouseCode ? warehouseCode + " - " : ""}${warehouseName}`.trim();

        const customerObj = data?.customer;
        const customerLabel = customerObj?.name ?? customerObj?.outlet_name ?? "";

        const routeObj = data?.route;
        const routeLabel = routeObj?.name ?? routeObj?.route_name ?? "";

        setForm({
          warehouse: data?.warehouse?.id ? String(data.warehouse.id) : "",
          warehouse_name: warehouseLabel,
          customer: data?.customer?.id ? String(data.customer.id) : "",
          customer_name: customerLabel,
          route: data?.route?.id ? String(data.route.id) : "",
          route_name: routeLabel,
        });

        // prefer multiple possible code fields
        const maybeCode = String((data as any)?.return_code ?? (data as any)?.delivery_code ?? (data as any)?.code ?? "");
        if (maybeCode) setCode(maybeCode);

        if (data?.warehouse?.id) {
          await fetchAgentCustomerOptions(String(data.warehouse.id));
        }

        if (Array.isArray(data?.details) && data.details.length > 0) {
          const loadedItemData: ItemRow[] = data.details.map((detail, idx) => {
            const itemId = detail.item?.id ? String(detail.item.id) : "";
            const uomId = detail.uom_id ? String(detail.uom_id) : "";
            const selectedItem = itemOptions.find((it) => it.value === itemId);
            let matchedPrice = "";

            if (selectedItem && Array.isArray(selectedItem.uoms) && selectedItem.uoms.length > 0) {
              const uomOpts = selectedItem.uoms.map((uom) => {
                // determine final price using pricing override if present
                let finalPrice: string | number = uom.price ?? "";
                if (uom.uom_type === "primary") {
                  finalPrice = selectedItem.pricing?.buom_ctn_price ?? uom.price ?? "";
                } else if (uom.uom_type === "secondary") {
                  finalPrice = selectedItem.pricing?.auom_pc_price ?? uom.price ?? "";
                }
                return { value: uom.id ?? "", label: uom.name ?? "", price: finalPrice, uom_type: uom.uom_type };
              });

              // set row UOM options
              setRowUomOptions((prev) => ({ ...prev, [idx.toString()]: uomOpts }));

              const matched = uomOpts.find((u) => u.value === uomId);
              matchedPrice = matched ? String(matched.price ?? "") : String(uomOpts[0]?.price ?? "");
            } else {
              // fallback to item_price from delivery detail (if any)
              matchedPrice = String(detail.item_price ?? "");
            }

            return {
              item_id: itemId,
              itemName: itemId,
              itemLabel: detail.item?.name ?? "",
              UOM: uomId,
              uom_id: uomId,
              Price: matchedPrice,
              Quantity: String(detail.quantity ?? 1),
              Total: ((Number(matchedPrice) || 0) * Number(detail.quantity ?? 0)).toFixed(2),
              return_type: detail.return_type ?? "",
              return_reason: detail.return_reason ?? "",
            };
          });

          setItemData(loadedItemData);

          // Preload reason lists for rows that already have return_type
          const reasonPromises = loadedItemData.map(async (d, idx) => {
            if (!d.return_type) return { idx: idx.toString(), options: [] as { label: string; value: string }[] };
            try {
              const res = await reasonList({ return_id: d.return_type });
              const list = Array.isArray(res?.data) ? (res.data as Reason[]) : (Array.isArray(res) ? (res as Reason[]) : []);
              const options = list.map((r) => ({ label: r.reson || r.return_reason || r.return_type || String(r.id), value: String(r.id) }));
              return { idx: idx.toString(), options };
            } catch {
              return { idx: idx.toString(), options: [] as { label: string; value: string }[] };
            }
          });

          const results = await Promise.all(reasonPromises);
          const map: Record<string, { label: string; value: string }[]> = {};
          results.forEach((r) => {
            if (r) map[r.idx] = r.options;
          });
          if (Object.keys(map).length > 0) setRowReasonOptions((prev) => ({ ...prev, ...map }));
        }
      } catch (error: any) {
        console.error("Error fetching delivery data:", error);
        let errorMessage = "Failed to fetch delivery details";
        if (error?.response?.data?.message) errorMessage = error.response.data.message;
        else if (error?.data?.message) errorMessage = error.data.message;
        else if (typeof error?.message === "string") errorMessage = error.message;
        showSnackbar(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    })();
    // we want to re-run when itemOptions becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, uuid, itemOptions.length]);

  // Auto-generate code in add mode only
  useEffect(() => {
    if (isEditMode || codeGeneratedRef.current) return;
    codeGeneratedRef.current = true;

    (async () => {
      try {
        setLoading(true);
        const res = await genearateCode({ model_name: "agent_returns" });
        if (res?.code) setCode(res.code);
      } catch (err) {
        console.error("Failed to generate return code:", err);
        showSnackbar("Failed to generate return code", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Warehouse is required"),
    customer: yup.string().required("Customer is required"),
    route: yup.string().required("Route is required"),
  });

  const recalculateItem = (index: number, field: keyof ItemRow, value: string) => {
    const newData = [...itemData];
    const item = { ...newData[index], [field]: value } as ItemRow;
    // Recompute total
    const priceNum = Number(item.Price) || 0;
    const qtyNum = Number(item.Quantity) || 0;
    item.Total = (priceNum * qtyNum).toFixed(2);
    newData[index] = item;
    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData((prev) => [
      ...prev,
      {
        item_id: "",
        itemName: "",
        itemLabel: "",
        UOM: "",
        uom_id: "",
        Price: "",
        Total: "0.00",
        Quantity: "1",
        return_type: "",
        return_reason: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itemData.length <= 1) {
      setItemData([
        {
          item_id: "",
          itemName: "",
          itemLabel: "",
          UOM: "",
          uom_id: "",
          Price: "",
          Total: "0.00",
          Quantity: "1",
          return_type: "",
          return_reason: "",
        },
      ]);
      return;
    }
    setItemData((prev) => prev.filter((_, i) => i !== index));
  };

  // Create payload
  const generatePayload = () => ({
    warehouse_id: Number(form.warehouse),
    customer_id: Number(form.customer),
    osa_code: code,
    route_id: Number(form.route),
    details: itemData
      .filter((item) => item.item_id && item.uom_id)
      .map((item) => ({
        item_id: Number(item.item_id),
        uom_id: Number(item.uom_id),
        item_price: Number(item.Price) || 0,
        item_quantity: Number(item.Quantity) || 0,
        total: Number(parseFloat(String(item.Total)) || 0),
        return_type: item.return_type,
        return_reason: item.return_reason,
      })),
  });

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      const validItems = itemData.filter((item) => item.item_id && item.uom_id);
      if (validItems.length === 0) {
        showSnackbar("Please add at least one item with UOM selected", "error");
        return;
      }

      setIsSubmitting(true);
      const payload = generatePayload();

      let res: any;
      if (isEditMode && uuid) {
        res = await updateDelivery(uuid, payload);
      } else {
        res = await createReturn(payload);
      }

      if (res?.error) {
        showSnackbar(res?.data?.message || (isEditMode ? "Failed to update delivery" : "Failed to create delivery"), "error");
        setIsSubmitting(false);
        return;
      }

      // Save final code if add mode
      if (!isEditMode && code) {
        try {
          await saveFinalCode({ reserved_code: code, model_name: "agent_returns" });
        } catch (e) {
          console.error("Failed to save final code:", e);
        }
      }

      showSnackbar(isEditMode ? "Return updated successfully!" : "Return created successfully!", "success");
      router.push("/distributorsReturn");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) formErrors[err.path] = err.message;
        });
        setErrors(formErrors);
      } else {
        console.error("Error saving delivery:", error);
        let errorMessage = isEditMode ? "Failed to update delivery. Please try again." : "Failed to create delivery. Please try again.";
        if ((error as any)?.response?.data?.message) errorMessage = (error as any).response.data.message;
        else if ((error as any)?.data?.message) errorMessage = (error as any).data.message;
        else if (typeof (error as any)?.message === "string") errorMessage = (error as any).message;
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Search helpers ---
  const handleWarehouseSearch = async (searchText: string) => {
    try {
      const response = await warehouseListGlobalSearch({ query: searchText });
      const data = Array.isArray(response?.data) ? response.data : [];
      return data.map((w: any) => ({
        value: String(w.id),
        label: `${w.code || w.warehouse_code || ""} - ${w.name || w.warehouse_name || ""}`,
        code: w.code || w.warehouse_code,
        name: w.name || w.warehouse_name,
      }));
    } catch {
      return [];
    }
  };

  const handleRouteSearch = async (searchText: string) => {
    if (!form.warehouse) return [];
    try {
      const response = await routeList({ warehouse_id: form.warehouse, search: searchText, per_page: "50" });
      const data = Array.isArray(response?.data) ? response.data : [];
      return data.map((route: any) => ({
        value: String(route.id),
        label: `${route.route_code || route.code || ""} - ${route.route_name || route.name || ""}`,
        code: route.route_code || route.code,
        name: route.route_name || route.name,
      }));
    } catch {
      return [];
    }
  };

  const handleCustomerSearch = async (searchText: string) => {
    if (!form.route) return [];
    try {
      const response = await agentCustomerList({ route_id: form.route, search: searchText });
      const data = Array.isArray(response?.data) ? response.data : [];
      return data.map((customer: any) => ({
        value: String(customer.id),
        label: `${customer.osa_code || ""} - ${customer.name || customer.outlet_name || customer.customer_name || ""}`,
        name: customer.outlet_name || customer.customer_name || customer.name || "",
      }));
    } catch {
      return [];
    }
  };

  const handleItemSearch = async (searchText: string) => {
    if (!form.warehouse) return [];
    try {
      const response = await itemGlobalSearch({ query: searchText, warehouse_id: form.warehouse });
      const data = Array.isArray(response?.data) ? response.data : [];
      return data.map((item: any) => ({
        value: String(item.id),
        label: `${item.erp_code || ""} - ${item.name || ""}`,
        name: item.name,
        uoms: Array.isArray(item.item_uoms)
          ? item.item_uoms.map((u: any) => {
            let finalPrice = "0";
            if (u.uom_type === "primary") finalPrice = item.pricing?.buom_ctn_price ?? "0";
            else if (u.uom_type === "secondary") finalPrice = item.pricing?.auom_pc_price ?? "0";
            return { id: String(u.id), name: String(u.name), price: finalPrice, uom_type: u.uom_type };
          })
          : [],
      }));
    } catch {
      return [];
    }
  };

  const hasValidItems = itemData.some((item) => item && item.item_id && item.uom_id);

  // --- Render ---
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon icon="lucide:arrow-left" width={24} onClick={() => router.back()} />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
            {isEditMode ? "Update Return" : "Add Return"}
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>
          <div className="flex flex-col">
            <span className="flex justify-end text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Return</span>
            <span className="text-primary text-[14px] tracking-[10px]">#{code}</span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-10 flex-wrap">
          <AutoSuggestion
            required
            label="Distributor"
            name="warehouse"
            placeholder="Search distributor..."
            initialValue={form.warehouse_name}
            onSearch={handleWarehouseSearch}
            onSelect={(option: any) => {
              setForm((prev) => ({
                ...prev,
                warehouse: option.value,
                warehouse_name: option.label,
                route: "",
                route_name: "",
                customer: "",
                customer_name: "",
              }));
              if (errors.warehouse) setErrors((prev) => ({ ...prev, warehouse: "" }));
              try {
                fetchAgentCustomerOptions(option.value);
              } catch {
                //
              }
            }}
            onClear={() => setForm((prev) => ({ ...prev, warehouse: "", warehouse_name: "", route: "", route_name: "", customer: "", customer_name: "" }))}
            error={errors.warehouse}
          />

          <AutoSuggestion
            required
            label="Route"
            name="route"
            placeholder="Search route..."
            initialValue={form.route_name}
            onSearch={handleRouteSearch}
            onSelect={(option: any) => {
              setForm((prev) => ({ ...prev, route: option.value, route_name: option.label, customer: "", customer_name: "" }));
              if (errors.route) setErrors((prev) => ({ ...prev, route: "" }));
            }}
            onClear={() => setForm((prev) => ({ ...prev, route: "", route_name: "", customer: "", customer_name: "" }))}
            error={errors.route}
            disabled={!form.warehouse}
            noOptionsMessage={!form.warehouse ? "Please select a warehouse first" : "No routes found"}
          />

          <AutoSuggestion
            required
            label="Customer"
            name="customer"
            placeholder="Search customer..."
            initialValue={form.customer_name}
            onSearch={handleCustomerSearch}
            onSelect={(option: any) => {
              setForm((prev) => ({ ...prev, customer: option.value, customer_name: option.label }));
              if (errors.customer) setErrors((prev) => ({ ...prev, customer: "" }));
            }}
            onClear={() => setForm((prev) => ({ ...prev, customer: "", customer_name: "" }))}
            error={errors.customer}
            disabled={!form.route}
            noOptionsMessage={!form.route ? "Please select a route first" : "No customers found"}
          />
        </div>

        <Table
          data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
          config={{
            columns: [
              {
                key: "itemName",
                label: "Item Name",
                width: 390,
                render: (row) => {
                  const selectedOpt = (() => {
                    const selectedItemId = row.item_id;
                    if (!selectedItemId) return null;
                    // Try to find in global itemOptions first
                    const typedItemOptions = itemOptions;
                    const found = typedItemOptions?.find?.((it) => it.value === String(selectedItemId));
                    if (found) return found;
                    // Fallback to building a minimal option from the row label
                    return { value: String(selectedItemId), label: row.itemLabel || String(selectedItemId) };
                  })();
                  return (
                    <div style={{ minWidth: '390px', maxWidth: '390px' }}>
                      <AutoSuggestion
                        key={`item-${row.idx}`}
                        placeholder="Search item..."
                        initialValue={row.itemLabel}
                        selectedOption={selectedOpt ?? null}
                        onSearch={handleItemSearch}
                        minSearchLength={0}
                        disabled={!form.customer_name && !row.item_id}
                        // disabled={!form.customer_name}
                        onSelect={async (option: { value: string; label: string; uoms?: Uom[] }) => {
                          const selectedItemId = option.value;
                          const newData = [...itemData];
                          const index = Number(row.idx);
                          newData[index].item_id = selectedItemId;
                          newData[index].itemName = selectedItemId;
                          newData[index].itemLabel = option.label;

                          // Try to get UOMs from the selected option first
                          let uoms: Uom[] | undefined = option.uoms;

                          // If option doesn't include UOMs, fetch item info by searching the id
                          if ((!uoms || uoms.length === 0) && selectedItemId) {
                            try {
                              const resp = await itemGlobalSearch({ query: selectedItemId });
                              const items = Array.isArray(resp?.data) ? resp.data : (resp ? [resp] : []);
                              // Find the matching item by id (or value) and extract uoms/uom/item_uoms
                              const found = (items as unknown[]).find((it) => {
                                const obj = it as Record<string, unknown>;
                                const idVal = obj['id'] ?? obj['value'];
                                return String(idVal ?? '') === String(selectedItemId);
                              }) as Record<string, unknown> | undefined;
                              if (found) {
                                // handle both `item_uoms` and `uom` shapes
                                const rawUoms = Array.isArray(found['item_uoms']) ? (found['item_uoms'] as unknown[]) : (Array.isArray(found['uom']) ? (found['uom'] as unknown[]) : []);
                                if (Array.isArray(rawUoms) && rawUoms.length > 0) {
                                  uoms = rawUoms.map((u) => {
                                    const uu = u as Record<string, unknown>;
                                    return { id: String(uu['id'] ?? ''), name: String(uu['name'] ?? ''), price: String(uu['uom_price'] ?? uu['price'] ?? '') } as Uom;
                                  });
                                }
                              }
                            } catch (err) {
                              // ignore fetch error and continue without UOMs
                              console.error('Failed to fetch item UOMs for selected item:', err);
                            }
                          }

                          if (uoms && uoms.length > 0) {
                            const uomOpts = uoms.map((uom: Uom) => ({ value: String(uom.id || ""), label: uom.name || "", price: String(uom.uom_price ?? uom.price ?? "0") }));
                            setRowUomOptions(prev => ({ ...prev, [row.idx]: uomOpts }));

                            // Auto-select first UOM and store friendly label for display
                            const firstUom = uomOpts[0];
                            if (firstUom) {
                              newData[index].uom_id = firstUom.value;
                              newData[index].UOM = firstUom.label;
                              newData[index].Price = String(firstUom.price ?? "");
                              newData[index].Total = ((Number(firstUom.price) || 0) * (Number(newData[index].Quantity) || 0)).toFixed(2);
                            }
                          } else {
                            setRowUomOptions(prev => {
                              const newOpts = { ...prev };
                              delete newOpts[row.idx];
                              return newOpts;
                            });
                            newData[index].uom_id = "";
                            newData[index].UOM = "";
                            newData[index].Price = "";
                            newData[index].Total = "0.00";
                          }

                          setItemData(newData);
                        }}
                        onClear={() => {
                          const newData = [...itemData];
                          const index = Number(row.idx);
                          newData[index].item_id = "";
                          newData[index].itemName = "";
                          newData[index].itemLabel = "";
                          newData[index].uom_id = "";
                          newData[index].UOM = "";
                          newData[index].Total = "0.00";
                          setRowUomOptions(prev => {
                            const newOpts = { ...prev };
                            delete newOpts[row.idx];
                            return newOpts;
                          });
                          setItemData(newData);
                        }}
                      />
                    </div>
                  );
                },
              },
              {
                key: "UOM",
                label: "UOM",
                width: 120,
                render: (row: any) => {
                  const uomOptions = rowUomOptions[row.idx] || [];
                  return (
                    <div style={{ minWidth: "120px", maxWidth: "120px" }}>
                      <InputFields
                        label=""
                        name="UOM"
                        options={uomOptions}
                        value={row.uom_id}
                        disabled={uomOptions.length === 0}
                        onChange={(e) => {
                          const selectedUomId = e.target.value;
                          const selectedUom = uomOptions.find((u) => u.value === selectedUomId);
                          const newData = [...itemData];
                          const index = Number(row.idx);
                          newData[index].uom_id = selectedUomId;
                          newData[index].UOM = selectedUom?.label ?? selectedUomId;
                          newData[index].Price = String(selectedUom?.price ?? "");
                          newData[index].Total = ((Number(newData[index].Price) || 0) * (Number(newData[index].Quantity) || 0)).toFixed(2);
                          setItemData(newData);
                        }}
                      />
                    </div>
                  );
                },
              },
              {
                key: "Quantity",
                label: "Qty",
                width: 100,
                render: (row: any) => (
                  <div style={{ minWidth: "100px", maxWidth: "100px" }}>
                    <InputFields
                      label=""
                      type="number"
                      name="Quantity"
                      value={row.Quantity}
                      integerOnly={true}
                      min={1}
                      onChange={(e) => recalculateItem(Number(row.idx), "Quantity", e.target.value)}
                    />
                  </div>
                ),
              },
              {
                key: "Price",
                label: "Price",
                render: (row) => <span>{Number(row.Price || 0).toFixed(2)}</span>
              },


              {
                key: "return_type",
                label: "Reason Type",
                width: 100,
                render: (row: any) => (
                  <div style={{ minWidth: "100px", maxWidth: "100px" }}>
                    <InputFields
                      label=""
                      name="return_type"
                      value={row.return_type}
                      options={returnTypeOptions}
                      disabled={!row.item_id}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newData = [...itemData];
                        const index = Number(row.idx);
                        newData[index].return_type = value;
                        newData[index].return_reason = "";
                        setItemData(newData);

                        (async () => {
                          try {
                            const res = await reasonList({ return_id: value });
                            const list = Array.isArray(res?.data) ? (res.data as Reason[]) : (Array.isArray(res) ? (res as Reason[]) : []);
                            const options = list.map((reason) => ({ label: reason.reson || reason.return_reason || reason.reason || reason.return_type || String(reason.id), value: String(reason.id) }));
                            setRowReasonOptions((prev) => ({ ...prev, [row.idx]: options }));
                          } catch (err) {
                            console.error("Failed to fetch reasons for return type", value, err);
                            setRowReasonOptions((prev) => ({ ...prev, [row.idx]: [] }));
                          }
                        })();
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "return_reason",
                label: "Reason Reason",
                width: 200,
                render: (row: any) => {
                  const fetched = rowReasonOptions[row.idx] || [];
                  const fallback = row.return_type === "1" ? goodOptions : row.return_type === "2" ? badOptions : [];
                  const options = fetched.length > 0 ? fetched : fallback;
                  return (
                    <div style={{ minWidth: "200px", maxWidth: "200px" }}>
                      <InputFields
                        label=""
                        name="return_reason"
                        value={row.return_reason}
                        options={options}
                        disabled={!row.return_type}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newData = [...itemData];
                          const index = Number(row.idx);
                          newData[index].return_reason = value;
                          setItemData(newData);
                        }}
                      />
                    </div>
                  );
                },
              },
              {
                key: "Total",
                label: "Total",
                render: (row: any) => <span>{Number(row.Total || 0).toFixed(2)}</span>,
              },
              {
                key: "action",
                label: "Action",
                render: (row: any) => (
                  <button
                    type="button"
                    className={`${itemData.length <= 1 ? "opacity-50 cursor-not-allowed" : ""} text-red-500 flex items-center`}
                    onClick={() => itemData.length > 1 && handleRemoveItem(Number(row.idx))}
                  >
                    <Icon icon="hugeicons:delete-02" width={20} />
                  </button>
                ),
              },
            ],
            showNestedLoading: false,
          }}
        />

        <div className="mt-4">
          {(() => {
            // disable add when there's already an empty/new item row
            const hasEmptyRow = itemData.some(it => (String(it.item_id ?? '').trim() === '' && String(it.uom_id ?? '').trim() === ''));
            return (
              <button
                type="button"
                disabled={hasEmptyRow}
                className={`text-[#E53935] font-medium text-[16px] flex items-center gap-2 ${hasEmptyRow ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => { if (!hasEmptyRow) handleAddNewItem(); }}
              >
                <Icon icon="material-symbols:add-circle-outline" width={20} />
                Add New Item
              </button>
            );
          })()}
          {/* <button
            type="button"
            className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
            onClick={handleAddNewItem}
          >
            <Icon icon="material-symbols:add-circle-outline" width={20} />
            Add New Item
          </button> */}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/distributorsReturn")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <SidebarBtn
            disabled={!hasValidItems}
            disabled={!hasValidItems}
            isActive={!isSubmitting}
            label={isSubmitting ? (isEditMode ? "Updating Return..." : "Creating Return...") : (isEditMode ? "Update Return" : "Create Return")}
            onClick={handleSubmit}
          />
        </div>
      </ContainerCard>
    </div>
  );
}
