"use client";

import React, { Fragment, ChangeEvent, useState, useEffect, useRef } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter, useParams } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import AutoSuggestion from "@/app/components/autoSuggestion";
import { createReturn, deliveryByUuid, updateDelivery, returnType, reasonList } from "@/app/services/agentTransaction";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import * as yup from "yup";
import { warehouseListGlobalSearch, routeList, agentCustomerList, getCompanyCustomers, itemGlobalSearch, genearateCode, saveFinalCode } from "@/app/services/allApi";

// TypeScript interfaces
interface Uom {
  id: string;
  name?: string;
  price?: string;
  uom_price?: string | number;
}

// Typed shape for reason API responses
interface Reason {
  id?: number | string;
  reson?: string;
  return_reason?: string;
  return_type?: string;
  reason?: string;
}

// Raw item UOM shape from different API shapes
interface ItemUomRaw {
  id?: number | string;
  name?: string;
  uom_price?: string | number;
  price?: string | number;
}

interface DeliveryDetail {
  item?: {
    id: number;
    code: string;
    name: string;
  };
  uom_id: number;
  uom_name?: string;
  quantity: number;
  item_price?: number | string;
  item_uoms?: Uom[];
  return_type: string;
  return_reason: string;
}

interface DeliveryResponse {
  warehouse?: {
    id: number;
    code: string;
    name: string;
  };
  customer?: {
    id: number;
    name: string;
  };
  customer_type?: {
    id: number;
    name: string;
  };
  route?: {
    id: number;
    name: string;
  };
  details?: DeliveryDetail[];
}


export default function OrderAddEditPage() {
  const { warehouseOptions, agentCustomerOptions, companyCustomersOptions, itemOptions, fetchAgentCustomerOptions, routeOptions } = useAllDropdownListData();
  const [returnTypeOptions, setReturnTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [goodReasonOptions, setGoodReasonOptions] = useState<{ label: string; value: string }[]>([]);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  const CURRENCY = localStorage.getItem("country") || "";
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
    customer_type: "",
    route: "",
    route_name: "",
  });

  form.warehouse_name = form.warehouse_name || "";
  const goodOptions = [{ label: "Near By Expiry", value: "0" },
  { label: "Package Issue", value: "1" },
  { label: "Not Saleable", value: "2" },];
  const badOptions = [{ label: "Damage", value: "0" },
  { label: "Expiry", value: "1" },
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Store UOM options for each row
  const [rowUomOptions, setRowUomOptions] = useState<Record<string, { value: string; label: string; price?: string }[]>>({});
  const [rowReasonOptions, setRowReasonOptions] = useState<Record<string, { label: string; value: string }[]>>({});

  const [itemData, setItemData] = useState([
    {
      item_id: "",
      itemName: "",
      itemLabel: "", // Store the display label separately
      UOM: "",
      uom_id: "",
      Price: "",
      Total: "0.00",
      Quantity: "1",
      return_type: "",
      return_reason: "",
    },
  ]);
  useEffect(() => {
    // Fetch reason list on component mount
    (async () => {
      try {
        setLoading(true);
        const res = await returnType();
        if (res && Array.isArray(res.data)) {
          const list = res.data as Reason[];
          const options = list.map((reason: Reason) => ({
            label: reason.reson || reason.return_reason || reason.return_type || String(reason.id),
            value: String(reason.id),
          }));
          setReturnTypeOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch reason list:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    // Fetch reason list on component mount
    (async () => {
      try {
        setLoading(true);
        const res = await reasonList();
        if (res && Array.isArray(res.data)) {
          const list = res.data as Reason[];
          const options = list.map((reason: Reason) => ({
            label: reason.reson || reason.return_reason || reason.return_type || String(reason.id),
            value: String(reason.id),
          }));
          setGoodReasonOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch reason list:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  // Fetch delivery data in edit mode
  useEffect(() => {
    if (isEditMode && uuid && itemOptions.length > 0) {
      (async () => {
        try {
          setLoading(true);
          const response = await deliveryByUuid(uuid);
          const data = (response?.data ?? response) as DeliveryResponse;

          // Build display labels defensively (APIs vary in property names)
          const warehouseObj = data?.warehouse as Record<string, unknown> | undefined;
          const warehouseCode = warehouseObj && typeof (warehouseObj['code'] ?? warehouseObj['warehouse_code']) === 'string' ? String(warehouseObj['code'] ?? warehouseObj['warehouse_code']) : '';
          const warehouseName = warehouseObj && typeof (warehouseObj['name'] ?? warehouseObj['warehouse_name']) === 'string' ? String(warehouseObj['name'] ?? warehouseObj['warehouse_name']) : '';
          const warehouseLabel = `${warehouseCode ? warehouseCode + ' - ' : ''}${warehouseName}`.trim();

          const customerObj = data?.customer as Record<string, unknown> | undefined;
          const customerLabel = customerObj && typeof (customerObj['name'] ?? customerObj['outlet_name']) === 'string' ? String(customerObj['name'] ?? customerObj['outlet_name']) : '';

          const routeObj = data?.route as Record<string, unknown> | undefined;
          const routeLabel = routeObj && typeof (routeObj['name'] ?? routeObj['route_name']) === 'string' ? String(routeObj['name'] ?? routeObj['route_name']) : '';

          // Set form data (include display labels so AutoSuggestion shows the label instead of the id)
          setForm({
            warehouse: data?.warehouse?.id ? String(data.warehouse.id) : "",
            warehouse_name: warehouseLabel,
            customer: data?.customer?.id ? String(data.customer.id) : "",
            customer_name: customerLabel,
            customer_type: data?.customer_type?.id ? String(data.customer_type?.id) : "",
            route: data?.route?.id ? String(data.route?.id) : "",
            route_name: routeLabel,
          });

          // If the delivery/return response included a reserved code, capture it so we can display/save it
          try {
            const dataObj = data as Record<string, unknown>;
            const maybeCode = String(dataObj['return_code'] ?? dataObj['delivery_code'] ?? dataObj['code'] ?? "");
            if (maybeCode) setCode(maybeCode);
          } catch (e) {
            // ignore
          }

          if (data?.warehouse?.id) {
            await fetchAgentCustomerOptions(String(data.warehouse.id));
          }

          if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
            const loadedItemData = data.details.map((detail: DeliveryDetail, index: number) => {
              const itemId = detail.item?.id ? String(detail.item.id) : "";
              const uomId = detail.uom_id ? String(detail.uom_id) : "";
              const rowIdx = index.toString();

              const selectedItem = itemOptions.find(item => item.value === itemId);
              let matchedPrice = "";
              if (selectedItem && selectedItem.uoms && selectedItem.uoms.length > 0) {
                const uomOpts = (selectedItem.uoms as Uom[]).map((uom: Uom) => ({
                  value: uom.id || "",
                  label: uom.name || "",
                  price: uom.price || "0"
                }));

                // set options for this row
                setRowUomOptions(prev => ({
                  ...prev,
                  [rowIdx]: uomOpts
                }));

                const matched = uomOpts.find(u => u.value === uomId);
                matchedPrice = matched ? String(matched.price ?? "") : String(uomOpts[0]?.price ?? "");
              } else {
                // try to use item price from delivery detail if available
                matchedPrice = String(detail.item_price ?? "");
              }



              return {
                item_id: itemId,
                itemName: itemId,
                itemLabel: detail.item?.name || "", // Store the display label
                UOM: uomId,
                uom_id: uomId,
                Price: matchedPrice,
                Quantity: (detail?.quantity ?? 1).toString(),
                Total: ((Number(matchedPrice) || 0) * Number(detail?.quantity ?? 0)).toFixed(2),
                return_type: detail?.return_type || "",
                return_reason: detail?.return_reason || "",
              };
            });

            setItemData(loadedItemData);
            // Fetch reason lists for any preloaded rows that have a return_type
            (async () => {
              try {
                const promises = loadedItemData.map(async (d, idx) => {
                  const rt = d.return_type;
                  if (!rt) return null;
                  try {
                    const res = await reasonList({ return_id: rt });
                    const list = Array.isArray(res?.data) ? (res.data as Reason[]) : (Array.isArray(res) ? (res as Reason[]) : []);
                    const options = list.map((reason: Reason) => ({
                      label: reason.reson || reason.return_reason || reason.return_type || String(reason.id),
                      value: String(reason.id),
                    }));
                    return { idx: idx.toString(), options };
                  } catch (err) {
                    return { idx: idx.toString(), options: [] };
                  }
                });

                const results = await Promise.all(promises);
                const map: Record<string, { label: string; value: string }[]> = {};
                results.forEach((r) => {
                  if (r && r.idx) map[r.idx] = r.options;
                });
                if (Object.keys(map).length > 0) setRowReasonOptions((prev) => ({ ...prev, ...map }));
              } catch (err) {
                console.error('Failed to preload reason lists for rows', err);
              }
            })();
          }
        } catch (error) {
          console.error("Error fetching delivery data:", error);

          // Extract error message from API response
          let errorMessage = "Failed to fetch delivery details";

          if (error && typeof error === 'object') {
            // Check for error message in response
            if ('response' in error && error.response && typeof error.response === 'object') {
              const response = error.response as { data?: { message?: string } };
              if (response.data?.message) {
                errorMessage = response.data.message;
              }
            } else if ('data' in error && error.data && typeof error.data === 'object') {
              const data = error.data as { message?: string };
              if (data.message) {
                errorMessage = data.message;
              }
            } else if ('message' in error && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }

          showSnackbar(errorMessage, "error");
        } finally {
          setLoading(false);
        }
      })();
    }

  }, [isEditMode, uuid ?? ""]);

  // Auto-generate return code in add mode only (prevent on edit)
  useEffect(() => {
    if (!isEditMode && !codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          setLoading(true);
          const res = await genearateCode({ model_name: "agent_returns" });
          if (res?.code) {
            setCode(res.code);
          }
        } catch (err) {
          console.error("Failed to generate return code:", err);
          showSnackbar("Failed to generate return code", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, setLoading, showSnackbar]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation schema
  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Warehouse is required"),
    customer: yup.string().required("Customer is required"),
    customer_type: yup.string().required("Customer Typa is required"),
    route: yup.string().required("Route is required"),
  });

  // --- Calculate totals and VAT dynamically
  const recalculateItem = (index: number, field: string, value: string) => {
    const newData = [...itemData];
    const item = newData[index];
    item[field as keyof typeof item] = value;
    // Recompute total as Price * Quantity whenever either changes
    const priceNum = Number(item.Price) || 0;
    const qtyNum = Number(item.Quantity) || 0;
    // store as string to keep consistency with the rest of the row fields
    item.Total = (priceNum * qtyNum).toFixed(2);
    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        itemName: "",
        itemLabel: "",
        UOM: "",
        uom_id: "",
        Price: "",
        Total: "",
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
          Total: "",
          Quantity: "1",
          return_type: "",
          return_reason: "",
        },
      ]);
      return;
    }
    setItemData(itemData.filter((_, i) => i !== index));
  };



  // --- Create Payload for API
  const generatePayload = () => {
    return {
      warehouse_id: Number(form.warehouse),
      customer_id: Number(form.customer),
      osa_code: code,
      customer_type: Number(form.customer_type),
      route_id: Number(form.route),
      details: itemData
        .filter(item => item.item_id && item.uom_id) // Only include rows with item and UOM selected
        .map((item) => ({
          item_id: Number(item.item_id),
          uom_id: Number(item.uom_id),
          item_price: Number(item.Price) || 0,
          item_quantity: Number(item.Quantity) || 0,
          item_total: Number(parseFloat(String(item.Total)) || 0),
          return_type: item.return_type,
          return_reason: item.return_reason,
        })),
    };
  };

  // --- On Submit
  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    try {
      // Validate form using yup schema
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      // Validate that at least one item is added
      const validItems = itemData.filter(item => item.item_id && item.uom_id);
      if (validItems.length === 0) {
        showSnackbar("Please add at least one item with UOM selected", "error");
        return;
      }

      setIsSubmitting(true);
      const payload = generatePayload();

      let res;
      if (isEditMode && uuid) {
        // Update existing delivery
        res = await updateDelivery(uuid, payload);
      } else {
        // Create new delivery
        res = await createReturn(payload);
      }

      // Check if response contains an error
      if (res?.error) {
        showSnackbar(
          res.data?.message || (isEditMode ? "Failed to update delivery" : "Failed to create delivery"),
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      // Success
      // Save the generated code after successful creation (add mode only)
      if (!isEditMode && code) {
        try {
          await saveFinalCode({ reserved_code: code, model_name: "agent_returns" });
        } catch (e) {
          // Don't block success flow if saving the final code fails
          console.error("Failed to save final code:", e);
        }
      }

      showSnackbar(
        isEditMode
          ? "Return updated successfully!"
          : "Return created successfully!",
        "success"
      );
      router.push("/return");
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        // Handle yup validation errors
        const formErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            formErrors[err.path] = err.message;
          }
        });
        setErrors(formErrors);
      } else {
        console.error("Error saving delivery:", error);

        // Extract error message from API response (similar to agentCustomer)
        let errorMessage = isEditMode
          ? "Failed to update delivery. Please try again."
          : "Failed to create delivery. Please try again.";

        if (error && typeof error === 'object') {
          // Check for error message in response
          if ('response' in error && error.response && typeof error.response === 'object') {
            const response = error.response as { data?: { message?: string } };
            if (response.data?.message) {
              errorMessage = response.data.message;
            }
          } else if ('data' in error && error.data && typeof error.data === 'object') {
            const data = error.data as { message?: string };
            if (data.message) {
              errorMessage = data.message;
            }
          } else if ('message' in error && typeof error.message === 'string') {
            errorMessage = error.message;
          }
        }

        showSnackbar(errorMessage, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  // Search functions for AutoSuggestion components
  const handleWarehouseSearch = async (searchText: string) => {
    try {
      const response = await warehouseListGlobalSearch({ query: searchText });
      const data = Array.isArray(response?.data) ? response.data : [];
      interface Warehouse {
        id: number;
        code?: string;
        warehouse_code?: string;
        name?: string;
        warehouse_name?: string;
      }
      return data.map((warehouse: Warehouse) => ({
        value: String(warehouse.id),
        label: `${warehouse.code || warehouse.warehouse_code || ""} - ${warehouse.name || warehouse.warehouse_name || ""}`,
        code: warehouse.code || warehouse.warehouse_code,
        name: warehouse.name || warehouse.warehouse_name,
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
      interface Route {
        id: number;
        route_code?: string;
        code?: string;
        route_name?: string;
        name?: string;
      }
      return data.map((route: Route) => ({
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
      let response;
      if (form.customer_type === "1") {
        response = await getCompanyCustomers({ route_id: form.route, search: searchText, per_page: "50" });
      } else {
        response = await agentCustomerList({ route_id: form.route, search: searchText, per_page: "50" });
      }
      const data = Array.isArray(response?.data) ? response.data : [];
      interface CompanyCustomer {
        id: number;
        osa_code?: string;
        business_name?: string;
      }
      interface AgentCustomer {
        id: number;
        osa_code?: string;
        outlet_name?: string;
        customer_name?: string;
        name?: string;
      }
      return data.map((customer: CompanyCustomer | AgentCustomer) => {
        if (form.customer_type === "1") {
          // Company customer: show osa_code - business_name
          const company = customer as CompanyCustomer;
          return {
            value: String(company.id),
            label: `${company.osa_code || ""} - ${company.business_name || ""}`.trim(),
            name: company.business_name || "",
          };
        } else {
          // Agent customer
          const agent = customer as AgentCustomer;
          return {
            value: String(agent.id),
            label: `${agent.osa_code || ""} - ${agent.name || ""}`,
            name: agent.outlet_name || agent.customer_name || agent.name || '',
          };
        }
      });
    } catch {
      return [];
    }
  };

  const handleItemSearch = async (searchText: string) => {
    if (!form.warehouse) return [];  // Prevent fetching before selecting warehouse

    try {
      const response = await itemGlobalSearch({
        query: searchText,
        warehouse_id: form.warehouse, // <- Add warehouse filter
      });

      const data = Array.isArray(response?.data) ? response.data : [];

      return data.map((item: any) => ({
        value: String(item.id),
        label: `${item.item_code || item.code || ""} - ${item.name || ""}`,
        code: item.item_code || item.code,
        name: item.name,
        uoms: Array.isArray(item.item_uoms)
          ? item.item_uoms.map((u: any) => ({
            id: String(u.id ?? ""),
            name: String(u.name ?? ""),
            price: String(u.uom_price ?? u.price ?? "0"),
          }))
          : item.uom || item.uoms || [],
      }));
    } catch {
      return [];
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
            {isEditMode ? "Update Return" : "Add Return"}
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            {/* <span className="text-primary font-normal text-[16px]">
              Emma-Köhler-Allee 4c, Germering - 13907
            </span> */}
          </div>
          <div className="flex flex-col">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              Return
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">
              #{code}
            </span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        {/* --- Form Fields --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-10 flex-wrap">
          <InputFields
            label="Customer Type"
            required
            name="customer_type"
            value={form.customer_type}
            options={[{ label: "Agent Customer", value: "0" }, { label: "Company Customer", value: "1" }]}
            onChange={handleChange}
            error={errors.customer_type}
          />
          <AutoSuggestion
            required
            label="Warehouse"
            name="warehouse"
            placeholder="Search warehouse..."
            initialValue={form.warehouse_name}
            onSearch={handleWarehouseSearch}
            onSelect={(option) => {
              setForm(prev => ({
                ...prev,
                warehouse: option.value,
                warehouse_name: option.label,
                // clear dependent selections
                route: "",
                route_name: "",
                customer: "",
                customer_name: "",
              }));
              if (errors.warehouse) setErrors(prev => ({ ...prev, warehouse: "" }));
              // fetch customers for selected warehouse
              try {
                fetchAgentCustomerOptions(option.value);
              } catch (e) {
                // ignore fetch errors here
              }
            }}
            onClear={() => setForm(prev => ({ ...prev, warehouse: "", warehouse_name: "", route: "", route_name: "", customer: "", customer_name: "" }))}
            error={errors.warehouse}
          />
          <AutoSuggestion
            required
            label="Route"
            name="route"
            placeholder="Search route..."
            initialValue={form.route_name}
            onSearch={handleRouteSearch}
            onSelect={(option) => {
              setForm(prev => ({ ...prev, route: option.value, route_name: option.label, customer: "", customer_name: "" }));
              if (errors.route) setErrors(prev => ({ ...prev, route: "" }));
            }}
            onClear={() => setForm(prev => ({ ...prev, route: "", route_name: "", customer: "", customer_name: "" }))}
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
            onSelect={(option) => {
              setForm(prev => ({ ...prev, customer: option.value, customer_name: option.label }));
              if (errors.customer) setErrors(prev => ({ ...prev, customer: "" }));
            }}
            onClear={() => setForm(prev => ({ ...prev, customer: "", customer_name: "" }))}
            error={errors.customer}
            disabled={!form.route}
            noOptionsMessage={!form.route ? "Please select a route first" : "No customers found"}
          />

        </div>
        {/* --- Table --- */}
        <Table
          data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
          config={{
            columns: [
              {
                key: "itemName",
                label: "Item Name",
                width: 390,
                render: (row) => (
                  <div style={{ minWidth: '390px', maxWidth: '390px' }}>
                    <AutoSuggestion
                      key={`item-${row.idx}`}
                      placeholder="Search item..."
                      initialValue={row.itemLabel}
                      onSearch={handleItemSearch}
                      minSearchLength={0}
                      disabled={!form.warehouse_name}
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
                ),
              },
              {
                key: "UOM",
                label: "UOM",
                width: 120,
                render: (row) => {
                  const uomOptions = rowUomOptions[row.idx] || [];
                  return (
                    <div style={{ minWidth: '120px', maxWidth: '120px' }}>
                      <InputFields
                        label=""
                        name="UOM"
                        options={uomOptions}
                        value={row.uom_id}
                        disabled={uomOptions.length === 0}
                        onChange={(e) => {
                          const selectedUomId = e.target.value;
                          const selectedUom = uomOptions.find(uom => uom.value === selectedUomId);
                          const newData = [...itemData];
                          const index = Number(row.idx);
                          newData[index].uom_id = selectedUomId;
                          newData[index].UOM = selectedUom?.label ?? selectedUomId;
                          newData[index].Price = String(selectedUom?.price ?? "");
                          // compute total immediately from updated price and existing qty
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
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '100px' }}>
                    <InputFields
                      label=""
                      type="number"
                      name="Quantity"
                      value={row.Quantity}
                      integerOnly={true}
                      min={1}
                      onChange={(e) => {
                        recalculateItem(Number(row.idx), "Quantity", e.target.value);
                      }}
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
                key: "Total",
                label: "Total",
                render: (row) => (

                  <span > {Number(row.Total || 0).toFixed(2)}</span>
                ),
              },

              {
                key: "return_type",
                label: "Return Type",
                width: 100,
                render: (row) => (
                  <div style={{ minWidth: '100px', maxWidth: '100px' }}>
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
                        // Reset return_reason when type changes
                        newData[index].return_reason = "";
                        setItemData(newData);
                        // Fetch reason list for this return type and row
                        (async () => {
                          try {
                            const res = await reasonList({ return_id: value });
                            const list = Array.isArray(res?.data) ? (res.data as Reason[]) : (Array.isArray(res) ? (res as Reason[]) : []);
                            const options = list.map((reason: Reason) => ({
                              label: reason.reson || reason.return_reason || reason.reason || reason.return_type || String(reason.id),
                              value: String(reason.id),
                            }));
                            setRowReasonOptions(prev => ({ ...prev, [row.idx]: options }));
                          } catch (err) {
                            console.error('Failed to fetch reasons for return type', value, err);
                            setRowReasonOptions(prev => ({ ...prev, [row.idx]: [] }));
                          }
                        })();
                      }}
                    />
                  </div>
                ),
              },
              {
                key: "return_reason",
                label: "Return Reason",
                width: 200,
                render: (row) => {
                  // Prefer fetched reason options for the specific row, fall back to static lists
                  const fetched = rowReasonOptions[row.idx] || [];
                  const fallback = row.return_type === "1" ? goodOptions : row.return_type === "2" ? badOptions : [];
                  const options = fetched.length > 0 ? fetched : fallback;
                  return (
                    <div style={{ minWidth: '200px', maxWidth: '200px' }}>
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
                key: "action",
                label: "Action",
                render: (row) => (
                  <button
                    type="button"
                    className={`${itemData.length <= 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                      } text-red-500 flex items-center`}
                    onClick={() =>
                      itemData.length > 1 && handleRemoveItem(Number(row.idx))
                    }
                  >
                    <Icon icon="hugeicons:delete-02" width={20} />
                  </button>
                ),
              },
            ],
            showNestedLoading: false,
          }}
        />

        {/* --- Add New Item --- */}
        <div className="mt-4">
          <button
            type="button"
            className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
            onClick={handleAddNewItem}
          >
            <Icon icon="material-symbols:add-circle-outline" width={20} />
            Add New Item
          </button>
        </div>



        {/* --- Buttons --- */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/return")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <SidebarBtn
            isActive={!isSubmitting}
            label={
              isSubmitting
                ? (isEditMode ? "Updating Return..." : "Creating Return...")
                : (isEditMode ? "Update Return" : "Create Return")
            }
            onClick={handleSubmit}
          />
        </div>
      </ContainerCard>
    </div>
  );
}
