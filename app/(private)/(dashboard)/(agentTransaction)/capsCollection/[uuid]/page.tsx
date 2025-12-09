"use client";

import AutoSuggestion from "@/app/components/autoSuggestion";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import CustomTable, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import {
  capsCollectionByUuid,
  createCapsCollection,
  updateCapsCollection,
} from "@/app/services/agentTransaction";
import { agentCustomerList, genearateCode, getCompanyCustomers, itemGlobalSearch, itemList, warehouseListGlobalSearch, warehouseStockTopOrders } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import * as yup from "yup";
interface Uom {
  id: string;
  name?: string;
  price?: string;
  uom_type?: string;
}
interface Warehouse {
  id: number;
  code?: string;
  warehouse_code?: string;
  name?: string;
  warehouse_name?: string;
}
interface Route {
  id: number;
  route_code?: string;
  code?: string;
  route_name?: string;
  name?: string;
}
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
interface Item {
  id: number;
  item_code?: string;
  code?: string;
  name?: string;
  uom?: Uom[];
  uoms?: Uom[];
}

// Option type returned by item search
interface ItemOption {
  value: string;
  label: string;
  code?: string;
  name?: string;
  uoms?: Uom[];
}

// FormData interface for items (same structure as order page)
interface FormData {
  id: number;
  erp_code?: string;
  item_code?: string;
  name?: string;
  description?: string;
  item_uoms?: {
    id: number;
    item_id: number;
    uom_type: string;
    name: string;
    price: string;
    is_stock_keeping?: boolean;
    upc?: string;
    enable_for?: string;
  }[];
  pricing?: {
    buom_ctn_price?: string;
    auom_pc_price?: string;
  };
  brand?: string;
  image?: string;
  category?: {
    id: number;
    name: string;
    code: string;
  };
  itemSubCategory?: {
    id: number;
    name: string;
    code: string;
  };
  shelf_life?: string;
  commodity_goods_code?: string;
  excise_duty_code?: string;
  status?: number;
  is_taxable?: boolean;
  has_excies?: boolean;
  item_weight?: string;
  volume?: number;
}

interface ItemUOM {
  id: number;
  item_id: number;
  uom_type: string;
  name: string;
  price: string;
  is_stock_keeping?: boolean;
  upc?: string;
  enable_for?: string;
  uom_id?: number;
}



export default function AddEditCapsCollection() {
  const {
    warehouseOptions,
    agentCustomerOptions,
    fetchAgentCustomerOptions,
    itemOptions,
  } = useAllDropdownListData();

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  const isEditMode = loadUUID && loadUUID !== "add";

  const [form, setForm] = useState({
    code: "",
    warehouse: "",
    customer: "",
    status: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [customerContactNo, setCustomerContactNo] = useState("");
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});
  const [skeleton, setSkeleton] = useState({
    route: false,
    customer: false,
    item: false,
  });
  const [orderData, setOrderData] = useState<FormData[]>([]);
  const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
  // Store items with UOM data for easy access (same as order page)
  const [itemsWithUOM, setItemsWithUOM] = useState<Record<string, { uoms: ItemUOM[], stock_qty?: string }>>({});

  const [rowUomOptions, setRowUomOptions] = useState<
    Record<string, { value: string; label: string; price?: string }[]>
  >({});

  // Debounce timeout ref for warehouse selection
  const warehouseDebounceRef = useRef<NodeJS.Timeout | null>(null);


  // AutoSuggestion search functions (same as return page)
  const handleWarehouseSearch = async (searchText: string) => {
    try {
      const response = await warehouseListGlobalSearch({ query: searchText });
      const data = Array.isArray(response?.data) ? response.data : [];
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

  const handleCustomerSearch = async (searchText: string, warehouseId: string, customerType: string) => {
    if (!warehouseId) return [];
    try {
      let response;
      if (customerType === "1") {
        response = await getCompanyCustomers({ warehouse_id: warehouseId, search: searchText, per_page: "50" });
      } else {
        response = await agentCustomerList({ warehouse_id: warehouseId, search: searchText, per_page: "50" });
      }
      const data = Array.isArray(response?.data) ? response.data : [];
      return data.map((customer: Record<string, unknown>) => {
        // Always include contact_no in the returned option
        const id = String(customer['id'] ?? "");
        const osa = String(customer['osa_code'] ?? "");
        const contactNo = String(customer['contact_no'] ?? "");
        if (customerType === "1") {
          const businessName = String(customer['business_name'] ?? "");
          return {
            value: id,
            label: `${osa || ""} - ${businessName || ""}`.trim(),
            name: businessName,
            contact_no: contactNo,
          };
        } else {
          const outletName = String(customer['outlet_name'] ?? "");
          const customerName = String(customer['customer_name'] ?? "");
          const name = String(customer['name'] ?? "");
          // Always show name in label
          return {
            value: id,
            label: `${osa || ""} - ${customerName || outletName || name || ""}`.trim(),
            name: customerName || outletName || name || "",
            contact_no: contactNo,
          };
        }
      });
    } catch {
      return [];
    }
  };

  // Fetch warehouse items using warehouseStockTopOrders API (same as order page)
  const fetchWarehouseItems = useCallback(async (warehouseId: string) => {
    if (!warehouseId) {
      setItemsOptions([]);
      setItemsWithUOM({});
      setOrderData([]);
      return;
    }

    try {
      setSkeleton(prev => ({ ...prev, item: true }));
      
      // Fetch warehouse stocks - this API returns all needed data including pricing and UOMs
      const stockRes = await warehouseStockTopOrders(warehouseId);
      const stocksArray = stockRes.data?.stocks || stockRes.stocks || [];

      // Filter items with stock availability
      const filteredStocks = stocksArray.filter((stock: any) => {
        return Number(stock.stock_qty) > 0;
      });

      // Create items with UOM data map for easy access
      const itemsUOMMap: Record<string, { uoms: ItemUOM[], stock_qty?: string }> = {};
      
      const processedItems = filteredStocks.map((stockItem: any) => {
        const item_uoms = stockItem?.uoms ? stockItem.uoms.map((uom: any) => {
          let price = uom.price;
          // Override with specific pricing from the API response (same as order page)
          if (uom?.uom_type === "primary") {
            price = stockItem.buom_ctn_price || uom.price;
          } else if (uom?.uom_type === "secondary") {
            price = stockItem.auom_pc_price || uom.price;
          }
          return { 
            ...uom, 
            price,
            id: uom.id || `${stockItem.item_id}_${uom.uom_type}`,
            item_id: stockItem.item_id
          };
        }) : [];

        // Store UOM data for this item
        itemsUOMMap[stockItem.item_id] = {
          uoms: item_uoms,
          stock_qty: stockItem.stock_qty
        };

        return { 
          id: stockItem.item_id,
          name: stockItem.item_name,
          item_code: stockItem.item_code,
          erp_code: stockItem.erp_code,
          item_uoms,
          warehouse_stock: stockItem.stock_qty,
          pricing: {
            buom_ctn_price: stockItem.buom_ctn_price,
            auom_pc_price: stockItem.auom_pc_price
          }
        };
      });

      setItemsWithUOM(itemsUOMMap);
      setOrderData(processedItems);

      // Create dropdown options
      const options = processedItems.map((item: any) => ({
        value: String(item.id),
        label: `${item.erp_code || item.item_code || ''} - ${item.name || ''}`
      }));

      setItemsOptions(options);
      setSkeleton(prev => ({ ...prev, item: false }));
      
      return options;
    } catch (error) {
      console.error("Error fetching warehouse items:", error);
      setSkeleton(prev => ({ ...prev, item: false }));
      return [];
    }
  }, []);

  // Debounced warehouse change handler (same as order page)
  const handleWarehouseChange = useCallback((warehouseId: string) => {
    // Clear existing timeout
    if (warehouseDebounceRef.current) {
      clearTimeout(warehouseDebounceRef.current);
    }

    // Set new timeout for debounced API call
    warehouseDebounceRef.current = setTimeout(() => {
      fetchWarehouseItems(warehouseId);
    }, 500); // 500ms debounce delay
  }, [fetchWarehouseItems]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (warehouseDebounceRef.current) {
        clearTimeout(warehouseDebounceRef.current);
      }
    };
  }, []);

  const [tableData, setTableData] = useState<TableDataType[]>([
    {
      id: "1",
      item: "",
      uom: "",
      collectQty: "1",
      price: "0",
      total: "0",
    },
  ]);

  // 🧩 Fetch data in edit mode
  useEffect(() => {
    if (isEditMode && loadUUID) {
      (async () => {
        setLoading(true);
        try {
          const res = await capsCollectionByUuid(loadUUID);
          const data = res?.data ?? res;

          setForm({
            code: data?.code || "",
            warehouse: data?.warehouse_id ? String(data.warehouse_id) : "",
            customer: data?.customer ? String(data.customer) : "",
            status: data?.status ? String(data.status) : "1",
          });

          if (data?.warehouse_id) {
            await fetchAgentCustomerOptions(String(data.warehouse_id));
            setTimeout(() => {
              const selectedCustomer = agentCustomerOptions.find(
                (opt) => opt.value === String(data.customer)
              );
              setCustomerContactNo(selectedCustomer?.contact_no || "");
            }, 200);
          }

          if (Array.isArray(data?.details)) {
            const loadedRows = data.details.map((detail: Record<string, unknown>, idx: number) => {
              const rowId = String(idx + 1);
              const itemId = String(detail['item_id'] ?? "");
              const selectedItem = itemOptions.find((item) => item.value === itemId);
              let uomOpts: { value: string; label: string; price?: string }[] = [];
              if (selectedItem?.uoms && Array.isArray(selectedItem.uoms) && selectedItem.uoms.length) {
                uomOpts = selectedItem.uoms.map((uom) => {
                  const uu = uom as Record<string, unknown>;
                  return {
                    value: String(uu['id'] ?? ""),
                    label: String(uu['name'] ?? ""),
                    price: String(uu['price'] ?? "0"),
                  };
                });
                setRowUomOptions((prev) => ({ ...prev, [rowId]: uomOpts }));
              }

              const selectedUom = uomOpts.find((u) => u.value === String(detail['uom_id'] ?? ""));
              const price = selectedUom?.price || "0";
              const qty = String(detail['collected_quantity'] ?? 0);
              const total = String((parseFloat(price) || 0) * (parseFloat(qty) || 0));

              return {
                id: rowId,
                item: itemId,
                uom: String(detail['uom_id'] ?? ""),
                collectQty: qty,
                price,
                total,
              };
            });
            setTableData(loadedRows);
          }
        } catch {
          showSnackbar("Failed to fetch CAPS collection details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, loadUUID]);

  // 🧾 Validation
  const validationSchema = yup.object().shape({
    warehouse: yup.string().required("Distributor is required"),
    customer: yup.string().required("Customer is required"),
  });

  // 🪄 Handlers
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTableChange = (id: string, field: string, value: string) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          const qty =
            parseFloat(field === "collectQty" ? value : updated.collectQty) || 0;
          const price = parseFloat(field === "price" ? value : updated.price) || 0;
          updated.total = String(qty * price);
          return updated;
        }
        return row;
      })
    );
  };

  const handleAddRow = () => {
    const newId = String(tableData.length + 1);
    setTableData((prev) => [
      ...prev,
      { id: newId, item: "", uom: "", collectQty: "1", price: "0", total: "0" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (tableData.length <= 1) return;
    setTableData((prev) => prev.filter((row) => row.id !== id));
  };

  const fetchItem = async (searchTerm: string) => {
    const res = await itemList({ name: searchTerm });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch items", "error");
      setSkeleton({ ...skeleton, item: false });
      return;
    }
    const data = res?.data || [];
    setOrderData(data);
    const options = data.map((item: { id: number; name: string; }) => ({
      value: String(item.id),
      label: item.name
    }));
    setItemsOptions(options);
    setSkeleton({ ...skeleton, item: false });
    return options;
  };

  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  useEffect(() => {
    // generate code
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({
          model_name: "caps_collections",
        });
        if (res?.code) {
          setCode(res.code);
        }
        setLoading(false);
      })();
    }
  }, []);


  // 🚀 Submit
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      const validRows = tableData.filter((r) => r.item && r.uom && r.collectQty);
      if (validRows.length === 0) {
        showSnackbar("Please add at least one valid item.", "error");
        return;
      }

      setSubmitting(true);
      const payload = {
        code: code || form.code,
        warehouse_id: parseInt(form.warehouse),
        customer: form.customer,
        status: parseInt(form.status),
        details: validRows.map((r) => ({
          item_id: parseInt(r.item),
          uom_id: parseInt(r.uom),
          collected_quantity: parseFloat(r.collectQty),
          status: 1,
        })),
      };

      const res = isEditMode
        ? await updateCapsCollection(loadUUID!, payload)
        : await createCapsCollection(payload);

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode
            ? "CAPS Master Collection updated successfully"
            : "CAPS Master Collection added successfully",
          "success"
        );
        router.push("/capsCollection");
      }
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Something went wrong while saving.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/capsCollection">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit CAPS Master Collection" : "Add CAPS Master Collection"}
          </h1>
        </div>
      </div>

      <ContainerCard>
        {/* Header Info */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              CAPS COLLECTION
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">#{code}</span>
          </div>
        </div>

        <hr className="my-6 w-full text-[#D5D7DA]" />

        {/* Form */}
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          CAPS Master Collection Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div>
            <AutoSuggestion
              required
              label="Distributor"
              name="warehouse"
              placeholder="Search Distributor"
              initialValue={warehouseOptions.find(o => o.value === String(form.warehouse))?.label || ""}
              onSearch={handleWarehouseSearch}
              onSelect={(option: { value: string }) => {
                handleChange("warehouse", option.value);
                handleChange("customer", "");
                if (option.value) {
                  fetchAgentCustomerOptions(option.value);
                  // Trigger warehouse items fetch (same as order page)
                  handleWarehouseChange(option.value);
                }
              }}
              onClear={() => {
                handleChange("warehouse", "");
                // Clear items when warehouse is cleared
                setItemsOptions([]);
                setItemsWithUOM({});
                setOrderData([]);
              }}
              error={errors.warehouse}
            />
           
          </div>

          <div>
            <AutoSuggestion
              required
              label="Customer"
              name="customer"
              placeholder="Search customer..."
              initialValue={agentCustomerOptions.find(o => o.value === String(form.customer))?.label || ""}
              onSearch={(searchText: string) => handleCustomerSearch(searchText, form.warehouse, "0")}
              onSelect={(option: { value: string; contact_no?: string }) => {
                handleChange("customer", option.value);
                setCustomerContactNo(option.contact_no || "");
              }}
              onClear={() => handleChange("customer", "")}
              error={errors.customer}
              disabled={!form.warehouse}
              noOptionsMessage={!form.warehouse ? "Please select a warehouse first" : "No customers found"}
            />
            
          </div>

          <InputFields
            label="Contact No."
            value={customerContactNo}
            disabled
            onChange={() => { }}
          />
        </div>

        <hr className="my-6 w-full text-[#D5D7DA]" />

        {/* Table */}
        <CustomTable
          data={tableData}
          config={{
            header: { title: "Items" },
            columns: [
              {
                key: "item",
                label: "Item",
                render: (row) => (
                  <InputFields
                    label=""
                    name={`item_${row.id}`}
                    value={row.item}
                    searchable={true}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleTableChange(row.id, "item", value);

                      if (!value) {
                        // Clear selection
                        setRowUomOptions((prev) => {
                          const newOpts = { ...prev };
                          delete newOpts[row.id];
                          return newOpts;
                        });
                        handleTableChange(row.id, "uom", "");
                        handleTableChange(row.id, "price", "0");
                        return;
                      }

                      // Find the selected item from orderData (same as order page)
                      const selectedOrder = orderData.find((order: FormData) => String(order.id) === value);
                      const itemUOMData = itemsWithUOM[value];

                      // Priority 1: Use itemUOMData from itemsWithUOM (populated by warehouseStockTopOrders)
                      if (itemUOMData?.uoms && itemUOMData.uoms.length > 0) {
                        const uomOpts = itemUOMData.uoms.map((uom: ItemUOM) => ({
                          value: String(uom.id ?? ""),
                          label: String(uom.name ?? ""),
                          price: String(uom.price ?? "0"),
                        }));
                        setRowUomOptions((prev) => ({ ...prev, [row.id]: uomOpts }));
                        const first = uomOpts[0];
                        if (first) {
                          handleTableChange(row.id, "uom", first.value);
                          handleTableChange(row.id, "price", first.price || "0");
                        }
                        return;
                      }

                      // Priority 2: Use UOMs from selectedOrder with pricing (same as order page)
                      if (selectedOrder && Array.isArray(selectedOrder.item_uoms)) {
                        const uomOpts = selectedOrder.item_uoms.map((uom: any) => {
                          let price = uom.price;
                          // Override with specific pricing from the API response (same as order page)
                          if (uom?.uom_type === "primary") {
                            price = selectedOrder.pricing?.auom_pc_price || "-";
                          } else if (uom?.uom_type === "secondary") {
                            price = selectedOrder.pricing?.buom_ctn_price || "-";
                          }
                          return {
                            value: String(uom.id ?? ""),
                            label: String(uom.name ?? ""),
                            price: String(price ?? "0"),
                          };
                        });

                        setRowUomOptions((prev) => ({ ...prev, [row.id]: uomOpts }));

                        // Set price based on first UOM (same as order page)
                        const firstUom = selectedOrder.item_uoms[0];
                        if (firstUom) {
                          handleTableChange(row.id, "uom", String(firstUom.id || ""));
                          let firstPrice = firstUom.price;
                          if (firstUom.uom_type === "primary") {
                            firstPrice = selectedOrder.pricing?.auom_pc_price || firstUom.price;
                          } else if (firstUom.uom_type === "secondary") {
                            firstPrice = selectedOrder.pricing?.buom_ctn_price || firstUom.price;
                          }
                          handleTableChange(row.id, "price", String(firstPrice || "0"));
                        }
                        return;
                      }

                      // Fallback: no UOM data available
                      setRowUomOptions((prev) => ({ ...prev, [row.id]: [] }));
                      handleTableChange(row.id, "uom", "");
                      handleTableChange(row.id, "price", "0");
                    }}
                    options={itemsOptions}
                    placeholder="Search item"
                    disabled={!form.customer}
                  />
                ),
              },
              {
                key: "uom",
                label: "UOM",
                render: (row) => {
                  const opts = rowUomOptions[row.id] || [];
                  return (
                    <InputFields
                      options={opts}
                      value={row.uom}
                      placeholder="select UOM"
                      disabled={opts.length === 0}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleTableChange(row.id, "uom", val);
                        const selected = opts.find((o) => o.value === val);
                        if (selected)
                          handleTableChange(row.id, "price", selected.price || "0");
                      }}
                    />
                  );
                },
              },
              {
                key: "collectQty",
                label: "Collect Qty",
                render: (row) => (
                  <InputFields
                    type="number"
                    value={row.collectQty}
                    onChange={(e) =>
                      handleTableChange(row.id, "collectQty", e.target.value)
                    }
                  />
                ),
              },
              {
                key: "price",
                label: "Price",
                render: (row) => (
                  <span>{parseFloat(row.price || "0").toFixed(2)}</span>
                ),
              },
              {
                key: "total",
                label: "Total",
                render: (row) => (
                  <span>{parseFloat(row.total || "0").toFixed(2)}</span>
                ),
              },
              {
                key: "action",
                label: "Action",
                render: (row) => (
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={tableData.length <= 1}
                  >
                    <Icon icon="hugeicons:delete-02" width={20} />
                  </button>
                ),
              },
            ],
            showNestedLoading: false,
            footer: { pagination: false },
          }}
        />
        <div className="mt-4">
          {(() => {
            // Disable add when there's already an empty/incomplete item row
            const hasEmptyRow = tableData.some(row => !row.item || !row.uom);
            return (
              <button
                type="button"
                disabled={hasEmptyRow}
                className={`text-[#E53935] font-medium text-[16px] flex items-center gap-2 ${hasEmptyRow ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => { if (!hasEmptyRow) handleAddRow(); }}
              >
                <Icon icon="material-symbols:add-circle-outline" width={20} />
                Add New Item
              </button>
            );
          })()}
        </div>

        <hr className="my-6 w-full text-[#D5D7DA]" />

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/capsCollection")}
          >
            Cancel
          </button>
          <SidebarBtn
            isActive={!submitting}
            label={submitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update CAPS Collection" : "Create CAPS Collection")}
            onClick={handleSubmit}
            disabled={submitting || !form.warehouse || !form.customer || tableData.some(row => !row.item || !row.uom)}
          />
        </div>
      </ContainerCard>
    </div>
  );
}
