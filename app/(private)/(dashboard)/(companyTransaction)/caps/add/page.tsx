"use client";

import toInternationalNumber from "@/app/(private)/utils/formatNumber";
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
import { capsByUUID, capsCreate, capsQuantityCollected, driverList } from "@/app/services/companyTransaction";
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
interface StockItem {
  id: number,
  item_id: number,
  item_name: string
  item_code: string,
  erp_code: string,
  stock_qty: string,
  warehouse_id: number,
  warehouse_name: string,
  warehouse_code: string,
  buom_ctn_price: string,
  auom_pc_price: string,
  uoms: {
      id: number,
      item_id: number,
      name: string,
      uom_type: string,
      upc: string,
      price: string
  }[],
  total_sold_qty: number,
  purchase: number
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

// Calculate how much quantity remains for a given row when the same item/uom is used in multiple rows.
// Remaining = row.quantity - sum(otherRows.deposit_qty for same item_id + uom_id)
const getRemainingQtyForRow = (
  rows: any[],
  rowIdx: number,
  itemId: string,
  uomId: string,
  totalQty: number
) => {
  if (!itemId || !uomId) return Math.max(0, totalQty);

  const usedByOthers = rows.reduce((sum, r, i) => {
    if (i === rowIdx) return sum;
    if (String(r?.item_id ?? "") !== String(itemId)) return sum;
    if (String(r?.uom_id ?? "") !== String(uomId)) return sum;
    const v = Number(r?.deposit_qty ?? 0);
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);

  return Math.max(0, totalQty - usedByOthers);
};

// Convert a row's entered deposit_qty into base unit (PCS) usage.
// - primary UOM: deposit_qty PCS
// - secondary UOM: deposit_qty * UPC PCS
const getRowDepositQtyInBase = (row: any) => {
  const raw = Number(row?.deposit_qty ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const selected = row?.UOM?.find?.((u: any) => String(u?.value ?? "") === String(row?.uom_id ?? ""));
  if (String(selected?.uom_type ?? "") === "secondary") {
    return raw * getUpcForSelectedUom(row);
  }
  return raw;
};

// Remaining stock for a row when the same item is used across multiple rows (even with different UOMs).
// RemainingBase = totalBaseQty - sum(otherRows.deposit_qty converted to base PCS)
const getRemainingBaseQtyForRow = (
  rows: any[],
  rowIdx: number,
  itemId: string,
  totalBaseQty: number
) => {
  if (!itemId) return Math.max(0, totalBaseQty);
  const usedByOthersBase = rows.reduce((sum, r, i) => {
    if (i === rowIdx) return sum;
    if (String(r?.item_id ?? "") !== String(itemId)) return sum;
    return sum + getRowDepositQtyInBase(r);
  }, 0);
  return Math.max(0, totalBaseQty - usedByOthersBase);
};

// Remaining quantity in the row's currently selected UOM, but accounting for other rows' usage in base.
const getRemainingQtyForRowMixedUom = (
  rows: any[],
  rowIdx: number,
  itemId: string,
  totalBaseQty: number,
  row: any
) => {
  const remainingBase = getRemainingBaseQtyForRow(rows, rowIdx, itemId, totalBaseQty);
  const selected = row?.UOM?.find?.((u: any) => String(u?.value ?? "") === String(row?.uom_id ?? ""));
  if (String(selected?.uom_type ?? "") === "secondary") {
    return Math.floor(remainingBase / getUpcForSelectedUom(row));
  }
  return remainingBase;
};

const getUpcForSelectedUom = (row: any) => {
  const selected = row?.UOM?.find?.((u: any) => String(u?.value ?? "") === String(row?.uom_id ?? ""));
  const upc = Number(selected?.upc ?? 1);
  return Number.isFinite(upc) && upc > 0 ? upc : 1;
};

// `quantity` value returned by API is assumed to be in base unit (PCS).
// When secondary UOM (e.g., CSE) is selected, show/limit quantity in that UOM by dividing by UPC.
const getDisplayQuantityByUom = (row: any) => {
  const baseQty = Number(row?.quantity ?? 0);
  if (!Number.isFinite(baseQty)) return 0;
  const selected = row?.UOM?.find?.((u: any) => String(u?.value ?? "") === String(row?.uom_id ?? ""));
  if (String(selected?.uom_type ?? "") === "secondary") {
    // Only full secondary units (e.g., full cases). Remainder stays in primary.
    return Math.floor(baseQty / getUpcForSelectedUom(row));
  }
  return baseQty;
};

export default function CapsAddPage() {
  const {
    warehouseOptions,
   ensureAgentCustomerLoaded, ensureItemLoaded, ensureWarehouseLoaded} = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAgentCustomerLoaded();
    ensureItemLoaded();
    ensureWarehouseLoaded();
  }, [ensureAgentCustomerLoaded, ensureItemLoaded, ensureWarehouseLoaded]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const params = useParams();
  const loadUUID = params?.uuid as string | undefined;
  // const isEditMode = loadUUID && loadUUID !== "add";
  const backBtnUrl = "/caps";
  const [driverOptions, setDriverOptions] = useState<{ label: string; value: string }[]>([]);

  // Fetch driver options on mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await driverList();
        const data = Array.isArray(response?.data) ? response.data : [];
        const options = data.map((driver: Record<string, unknown>) => ({
          value: String(driver['id'] ?? ""),
          label: String(driver['driver_name'] + " (" + (driver['vehicle_code'] ?? "") + ")"),
        }));
        setDriverOptions(options);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        setDriverOptions([]);
      }
    };

    fetchDrivers();
  }, []);

  const [form, setForm] = useState({
    warehouse_id: "",
    driver_id: "",
    truck_no: "",
    contact_no: "",
    claim_no: "",
    claim_date: "",
    claim_amount: ""
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
  const [orderData, setOrderData] = useState<StockItem[]>([]);
  const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
  // Store items with UOM data for easy access (same as order page)
  const [itemsWithUOM, setItemsWithUOM] = useState<Record<string, { uoms: ItemUOM[], stock_qty?: string }>>({});

  const [rowUomOptions, setRowUomOptions] = useState<
    Record<string, { value: string; label: string; price?: string }[]>
  >({});

  // Debounce timeout ref for warehouse selection
  const warehouseDebounceRef = useRef<NodeJS.Timeout | null>(null);


  // AutoSuggestion search functions (same as return page)
  // const handleWarehouseSearch = async (searchText: string) => {
  //   try {
  //     const response = await warehouseListGlobalSearch({ query: searchText });
  //     const data = Array.isArray(response?.data) ? response.data : [];
  //     return data.map((warehouse: Warehouse) => ({
  //       value: String(warehouse.id),
  //       label: `${warehouse.code || warehouse.warehouse_code || ""} - ${warehouse.name || warehouse.warehouse_name || ""}`,
  //       code: warehouse.code || warehouse.warehouse_code,
  //       name: warehouse.name || warehouse.warehouse_name,
  //     }));
  //   } catch {
  //     return [];
  //   }
  // };

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
      const stockRes = await warehouseStockTopOrders(warehouseId, { is_promo: "true" });
      const stocksArray: StockItem[] = stockRes.data?.stocks || stockRes.stocks || [];

      // Filter items with stock availability
      // const filteredStocks = stocksArray.filter((stock: any) => {
      //   return Number(stock.stock_qty) > 0;
      // });

      // Create items with UOM data map for easy access
      // const itemsUOMMap: Record<string, { uoms: ItemUOM[], stock_qty?: string }> = {};
      
      // const processedItems = filteredStocks.map((stockItem: any) => {
      //   const item_uoms = stockItem?.uoms ? stockItem.uoms.map((uom: any) => {
      //     let price = uom.price;
      //     // Override with specific pricing from the API response (same as order page)
      //     if (uom?.uom_type === "primary") {
      //       price = stockItem.buom_ctn_price || uom.price;
      //     } else if (uom?.uom_type === "secondary") {
      //       price = stockItem.auom_pc_price || uom.price;
      //     }
      //     return { 
      //       ...uom, 
      //       price,
      //       id: uom.id || `${stockItem.item_id}_${uom.uom_type}`,
      //       item_id: stockItem.item_id
      //     };
      //   }) : [];

      //   // Store UOM data for this item
      //   itemsUOMMap[stockItem.item_id] = {
      //     uoms: item_uoms,
      //     stock_qty: stockItem.stock_qty
      //   };

      //   return { 
      //     id: stockItem.item_id,
      //     name: stockItem.item_name,
      //     item_code: stockItem.item_code,
      //     erp_code: stockItem.erp_code,
      //     item_uoms,
      //     warehouse_stock: stockItem.stock_qty,
      //     pricing: {
      //       buom_ctn_price: stockItem.buom_ctn_price,
      //       auom_pc_price: stockItem.auom_pc_price
      //     }
      //   };
      // });

      // setItemsWithUOM(itemsUOMMap);
      setOrderData(stocksArray);

      // Create dropdown options
      const options = stocksArray.map((item: StockItem) => ({
        value: String(item.item_id),
        label: `${item.erp_code || item.item_code || ''} - ${item.item_name || ''}`
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
      item_id: "",
      uom_id: "",
      quantity: "-",
      deposit_qty: "",
      price: "-",
      total: "-"
    },
  ]);

  const [rowSkeletons, setRowSkeletons] = useState<Record<string, boolean>[]>([]);

  // 🧩 Fetch data in edit mode
  // useEffect(() => {
  //   if (isEditMode && loadUUID) {
  //     (async () => {
  //       setLoading(true);
  //       try {
  //         const res = await capsByUUID(loadUUID);
  //         const data = res?.data ?? res;

  //         setForm({
  //           code: data?.code || "",
  //           warehouse: data?.warehouse_id ? String(data.warehouse_id) : "",
  //           customer: data?.customer ? String(data.customer) : "",
  //           status: data?.status ? String(data.status) : "1",
  //         });

  //         if (data?.warehouse_id) {
  //           await fetchAgentCustomerOptions(String(data.warehouse_id));
  //           setTimeout(() => {
  //             const selectedCustomer = agentCustomerOptions.find(
  //               (opt) => opt.value === String(data.customer)
  //             );
  //             setCustomerContactNo(selectedCustomer?.contact_no || "");
  //           }, 200);
  //         }

  //         if (Array.isArray(data?.details)) {
  //           const loadedRows = data.details.map((detail: Record<string, unknown>, idx: number) => {
  //             const rowId = String(idx + 1);
  //             const itemId = String(detail['item_id'] ?? "");
  //             const selectedItem = itemOptions.find((item) => item.value === itemId);
  //             let uomOpts: { value: string; label: string; price?: string }[] = [];
  //             if (selectedItem?.uoms && Array.isArray(selectedItem.uoms) && selectedItem.uoms.length) {
  //               uomOpts = selectedItem.uoms.map((uom) => {
  //                 const uu = uom as Record<string, unknown>;
  //                 return {
  //                   value: String(uu['id'] ?? ""),
  //                   label: String(uu['name'] ?? ""),
  //                   price: String(uu['price'] ?? "0"),
  //                 };
  //               });
  //               setRowUomOptions((prev) => ({ ...prev, [rowId]: uomOpts }));
  //             }

  //             const selectedUom = uomOpts.find((u) => u.value === String(detail['uom_id'] ?? ""));
  //             const price = selectedUom?.price || "0";
  //             const qty = String(detail['collected_quantity'] ?? 0);
  //             const total = String((parseFloat(price) || 0) * (parseFloat(qty) || 0));

  //             return {
  //               id: rowId,
  //               item: itemId,
  //               uom: String(detail['uom_id'] ?? ""),
  //               collectQty: qty,
  //               price,
  //               total,
  //             };
  //           });
  //           setTableData(loadedRows);
  //         }
  //       } catch {
  //         showSnackbar("Failed to fetch CAPS collection details", "error");
  //       } finally {
  //         setLoading(false);
  //       }
  //     })();
  //   }
  // }, [isEditMode, loadUUID]);

  // 🧾 Validation
  const validationSchema = yup.object().shape({
    warehouse_id: yup.string().required("Distributor is required"),
    driver_id: yup.string().required("Driver is required"),
    truck_no: yup.string().required("Truck No. is required"),
    contact_no: yup.string().required("Contact No. is required"),
    claim_no: yup.string().required("Claim No. is required"),
    claim_date: yup.string().required("Claim Date is required"),
    claim_amount: yup
      .number()
      .min(0, "Claim Amount must be at least 0")
      .typeError("Claim Amount must be a number")
      .required("Claim Amount is required"),
  });

  const itemsValidationSchema = yup.object().shape({
    item_id: yup.string().required("Item is required"),
    uom_id: yup.string().required("UOM is required"),
    deposit_qty: yup
      .number()
      .typeError("Deposit Quantity must be a number")
      .min(0, "Deposit Quantity must be at least 0")
      .required("Deposit Quantity is required"),
  });

  // 🪄 Handlers
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTableChange = async (idx: number, field: string, value: string) => {
    const newData = [...tableData];
    const item = newData[idx];
    // For numeric fields, enforce constraints at state level (HTML max/min can be bypassed via typing/paste)
    if (field === "deposit_qty") {
        const baseTotal = Number(item?.quantity ?? 0);
        const maxQty = getRemainingQtyForRowMixedUom(
          newData,
          idx,
          String(item.item_id ?? ""),
          Number.isFinite(baseTotal) ? baseTotal : 0,
          item
        );
      const raw = value ?? "";

      // Allow empty while typing
      if (raw === "") {
        (item as any)[field] = "";
      } else {
        let next = Number(raw);
        if (Number.isNaN(next)) next = 0;
        // prevent negative
        next = Math.max(0, next);
        // clamp to available quantity
        next = Math.min(next, Math.max(0, maxQty));
        // keep it as string to match other table fields
        (item as any)[field] = String(next);
      }

      item.total = Number(item.price || "0") * Number(item.deposit_qty || "0");
    } else {
      (item as any)[field] = value;
    }

    if(field === "item_id") {
      const selectedItem = orderData.find((it) => it?.item_id?.toString() === value);
      item.UOM = selectedItem?.uoms?.map((uom) => ({
        value: String(uom.id ?? ""),
        label: String(uom.name ?? ""),
        uom_type: String(uom.uom_type ?? ""),
        upc: String(uom.upc ?? ""),
        price: uom.uom_type == "primary" ? String(selectedItem.auom_pc_price ?? "0") 
        : uom.uom_type == "secondary" ? String(selectedItem.buom_ctn_price ?? "0") 
        : "-",
      })) || [];
      (item as any)["uom_id"] = item.UOM[0]?.value || "";
      item.price = item.UOM[0]?.price || "0";

      setRowSkeletons((prev) => ({
        ...prev,
        [idx]: { ...(prev[idx] || {}), qty: true },
      }));

      // Use functional updates so we don't rely on stale references and we always clear qtyLoading.
      const currentRowId = String(item.id ?? idx);
      const warehouseId = form.warehouse_id;
      capsQuantityCollected({ item_id: value, warehouse_id: warehouseId })
        .then((res) => {
          const qty = String(res?.data?.quantity ?? "0");
          setTableData((prev) =>
            prev.map((r: any) =>
              String(r.id) === currentRowId
                ? { ...r, quantity: qty, qtyLoading: false }
                : r
            )
          );
        })
        .catch(() => {
          setTableData((prev) =>
            prev.map((r: any) =>
              String(r.id) === currentRowId
                ? { ...r, quantity: "0", qtyLoading: false }
                : r
            )
          );
        });
    }
    // capsQuantityCollected({ item_id: value, warehouse_id: form.warehouse_id }).then((res) => {
    //     item.quantity = res?.quantity || "0";
    //     item.qtyLoading = false;
    //     setTableData(newData);
    //   }).catch(() => {
    //     item.quantity = "0";
    //     item.qtyLoading = false;
    //     setTableData(newData);
    //   });
    // }

    if(field === "uom_id") {
      const selectedUom = item.UOM.find((u: any) => u.value === value);
      item.price = selectedUom.price || "0";

      // When switching UOM, ensure deposit_qty remains within the new max
      const baseTotal = Number(item?.quantity ?? 0);
      const nextRow = { ...item, uom_id: value };
      const maxQty = getRemainingQtyForRowMixedUom(
        newData,
        idx,
        String(item.item_id ?? ""),
        Number.isFinite(baseTotal) ? baseTotal : 0,
        nextRow
      );
      const currentDeposit = Number(item.deposit_qty ?? 0);
      if (Number.isFinite(currentDeposit)) {
        item.deposit_qty = String(Math.min(Math.max(0, currentDeposit), Math.max(0, maxQty)));
      }
    }

    setTableData(newData);

    // Clear stale validation errors for this row/field once user edits.
    setItemErrors((prev) => {
      if (!prev?.[idx]) return prev;
      if (!field) return prev;
      const nextRowErr = { ...prev[idx] };
      if (nextRowErr[field]) delete nextRowErr[field];
      // If the edited field affects validation of dependent fields, also clear them.
      if (field === "item_id") {
        delete nextRowErr.uom_id;
        delete nextRowErr.deposit_qty;
      }
      if (field === "uom_id") {
        delete nextRowErr.deposit_qty;
      }
      if (Object.keys(nextRowErr).length === 0) {
        const { [idx]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [idx]: nextRowErr };
    });
  };

  const handleAddRow = () => {
    const newId = String(tableData.length + 1);
    setTableData((prev) => [
      ...prev,
      { 
        id: newId,
        item_id: "",
        uom_id: "",
        quantity: ""
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (tableData.length <= 1) return;
    setTableData((prev) => prev.filter((row, idx) => {
      return (idx !== index);
    }));
  };

  const resetTable = () => {
    setTableData([{
      id: "1",
      item_id: "",
      uom_id: "",
      quantity: "-",
      deposit_qty: "0",
      price: "-",
      total: "-"
    }]);
  };

  // const fetchItem = async (searchTerm: string) => {
  //   const res = await itemList({ name: searchTerm });
  //   if (res.error) {
  //     showSnackbar(res.data?.message || "Failed to fetch items", "error");
  //     setSkeleton({ ...skeleton, item: false });
  //     return;
  //   }
  //   const data = res?.data || [];
  //   setOrderData(data);
  //   const options = data.map((item: { id: number; name: string; }) => ({
  //     value: String(item.id),
  //     label: item.name
  //   }));
  //   setItemsOptions(options);
  //   setSkeleton({ ...skeleton, item: false });
  //   return options;
  // };

  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  // useEffect(() => {
  //   // generate code
  //   if (!codeGeneratedRef.current) {
  //     codeGeneratedRef.current = true;
  //     let mounted = true;
  //     (async () => {
  //       setLoading(true);
  //       try {
  //         const res = await genearateCode({
  //           model_name: "hariss_caps_collections",
  //         });
  //         if (mounted && res?.code) {
  //           setCode(res.code);
  //         }
  //       } finally {
  //         if (mounted) setLoading(false);
  //       }
  //     })();

  //     return () => {
  //       mounted = false;
  //     };
  //   }
  // }, [setLoading]);


  // 🚀 Submit
   useEffect(() => {
    // generate code
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({
          model_name: "hariss_caps_collections",
        });
        if (res?.code) {
          setCode(res.code);
        }
        setLoading(false);
      })();
    }
  }, []);
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate form data
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});

      // Filter out empty rows and validate items. Keep original indexes so errors show on the right row.
      const validRowEntries = tableData
        .map((r, idx) => ({ row: r, idx }))
        .filter(({ row }) => row.item_id && row.uom_id);
      
      if (validRowEntries.length === 0) {
        showSnackbar("Please add at least one valid item.", "error");
        return;
      }

      // Validate each item
      const itemValidationErrors: Record<number, Record<string, string>> = {};
      let hasItemErrors = false;

      for (let i = 0; i < validRowEntries.length; i++) {
        const { row, idx } = validRowEntries[i];
        try {
          await itemsValidationSchema.validate(row, { abortEarly: false });
        } catch (err) {
          if (err instanceof yup.ValidationError) {
            const errors: Record<string, string> = {};
            err.inner.forEach((e) => {
              if (e.path) errors[e.path] = e.message;
            });
            itemValidationErrors[idx] = errors;
            hasItemErrors = true;
          }
        }
      }

      if (hasItemErrors) {
        setItemErrors(itemValidationErrors);
        showSnackbar("Please fix item validation errors", "error");
        return;
      }

      // Cross-row stock validation (mixed UOM): total deposited per item (converted to base PCS) must not exceed available base qty.
      const mixedStockErrors: Record<number, Record<string, string>> = { ...itemValidationErrors };
      let hasMixedStockErrors = false;

      // Group rows by item_id and validate against an item's base quantity.
      const rowsByItem: Record<string, Array<{ row: any; idx: number }>> = {};
      validRowEntries.forEach(({ row, idx }) => {
        const id = String(row?.item_id ?? "");
        if (!id) return;
        if (!rowsByItem[id]) rowsByItem[id] = [];
        rowsByItem[id].push({ row, idx });
      });

      Object.entries(rowsByItem).forEach(([itemId, entries]) => {
        // Base available qty (PCS) from API; assumed to be same for the same item across rows.
        const baseTotal = Number(entries[0]?.row?.quantity ?? 0);
        const safeBaseTotal = Number.isFinite(baseTotal) ? baseTotal : 0;
        const totalUsedBase = entries.reduce((sum, e) => sum + getRowDepositQtyInBase(e.row), 0);

        if (totalUsedBase > safeBaseTotal) {
          hasMixedStockErrors = true;
          entries.forEach(({ idx }) => {
            mixedStockErrors[idx] = {
              ...(mixedStockErrors[idx] || {}),
              deposit_qty: "Deposit quantity exceeds available stock for this item.",
            };
          });
        }
      });

      if (hasMixedStockErrors) {
        setItemErrors(mixedStockErrors);
        showSnackbar("Please adjust quantities (stock exceeded)", "error");
        return;
      }

      setItemErrors({});
      setSubmitting(true);

      // Build payload
      const payload = {
        warehouse_id: form.warehouse_id,
        driver_id: form.driver_id,
        truck_no: form.truck_no,
        contact_no: form.contact_no,
        claim_no: form.claim_no,
        claim_date: form.claim_date,
        claim_amount: form.claim_amount,
        details: validRowEntries.map(({ row: r }) => ({
          item_id: parseInt(r.item_id),
          uom_id: parseInt(r.uom_id),
          quantity: parseFloat(r.quantity || "0"),
          receive_qty: parseFloat(r.deposit_qty || "0"),
          receive_amount: parseFloat(r.receive_amount || "0"),
          receive_date: form.claim_date,
          // remarks: r.remarks,
          // remarks2: r.remarks2 || "",
        })),
      };

      console.log("Payload:", payload);

      const res = await capsCreate(payload);

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar("CAPS Collection added successfully", "success");
        router.push("/caps");
      }
    } catch (err: unknown) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        showSnackbar("Please fix form validation errors", "error");
      } else {
        showSnackbar("Something went wrong while saving.", "error");
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href={backBtnUrl}>
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {/* {isEditMode ? "Edit Hariss Caps Collection" : "Add Hariss Caps Collection"} */}
            Add Caps Deposit
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
              CAPS DEPOSIT
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">#{code}</span>
          </div>
        </div>

        <hr className="my-6 w-full text-[#D5D7DA]" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">

          <div>
            <InputFields
              required
              label="Distributor"
              name="warehouse"
              placeholder="Search Distributor"
              value={form.warehouse_id}
              options={warehouseOptions}
              searchable={true}
              showSkeleton={warehouseOptions.length === 0}
              onChange={(e) => {
                if (form.warehouse_id !== e.target.value) {
                  handleChange("warehouse_id", e.target.value);
                  resetTable();
                  handleWarehouseChange(e.target.value);
                } else {
                  handleChange("warehouse_id", e.target.value);
                }
              }}
              error={errors.warehouse as string}
            />
          </div>
          <div>
            <InputFields
              required
              label="Driver"
              name="driver_id"
              value={form.driver_id}
              placeholder="Select Driver"
              searchable={true}
              options={driverOptions}
              onChange={(e) => {
                handleChange("driver_id", e.target.value);
              }}
              error={errors.driver_id as string}
            />
          </div>
          <div>
            <InputFields
              required
              label="Truck No"
              name="truck_no"
              value={form.truck_no}
              placeholder="Select Truck No."
              onChange={(e) => {
                handleChange("truck_no", e.target.value);
              }}
              error={errors.truck_no as string} 
            />
          </div>
          <div>
            <InputFields
              required
              type="contact2"
              label="Contact No"
              name="contact_no"
              value={form.contact_no}
              placeholder="Select Contact No."
              onChange={(e) => {
                handleChange("contact_no", e.target.value);
              }}
              error={errors.contact_no as string}
            />
          </div>
          <div>
            <InputFields
              required
              label="Claim No."
              name="claim_no"
              value={form.claim_no}
              placeholder="Select Claim No."
              onChange={(e) => {
                handleChange("claim_no", e.target.value);
              }} 
              error={errors.claim_no as string}
            />
          </div>
          <div>
            <InputFields
              required
              type="date"
              label="Claim Date"
              name="claim_date"
              value={form.claim_date}
              placeholder="Select Claim Date"
              onChange={(e) => {
                handleChange("claim_date", e.target.value);
              }}
              error={errors.claim_date as string}
            />
          </div>
          <div>
            <InputFields
              required
              label="Claim Amount"
              name="claim_amount"
              type="number"
              min={0}
              value={form.claim_amount}
              placeholder="Enter Claim Amount"
              onChange={(e) => {
                handleChange("claim_amount", e.target.value);
              }}
              trailingElement={localStorage.getItem("country") || null}
              error={errors.claim_amount as string}
            />
          </div>
        </div>

        {/* Table */}
        <CustomTable
          data={tableData.map((row, idx) => ({ ...row, idx }))}
          config={{
            columns: [
              {
                key: "item_id",
                label: "Item Name",
                width: 300,
                render: (row) => {
                  const idx = Number(row.idx);
                  const err = itemErrors[idx]?.item_id;
                  return (
                    <div>
                      <InputFields
                        label=""
                        name={`item_id_${row.idx}`}
                        value={row.item_id}
                        searchable={true}
                        onChange={(e) => {
                          handleTableChange(Number(row.idx), "item_id", e.target.value)
                        }}
                        options={itemsOptions}
                        showSkeleton={skeleton.item}
                        placeholder="Search item"
                        disabled={!form.warehouse_id}
                        error={err && err}
                      />
                    </div>
                  );
                },
              },
              {
                key: "uom_id",
                label: "UOM",
                render: (row) => {
                  const opts = row.UOM || [];
                  return (
                    <InputFields
                      options={opts}
                      value={row.uom_id}
                      placeholder="select UOM"
                      disabled={opts.length === 0 || !row.item_id || !form.warehouse_id}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleTableChange(Number(row.idx), "uom_id", val);
                      }}
                      width="100px"
                    />
                  );
                },
              },
              {
                key: "quantity",
                label: "Quantity",
                render: (row) => {
                  if (row.qtyLoading) {
                    return (
                      <div className="flex justify-center items-center">
                        <Icon className="text-gray-400 animate-spin" icon="mingcute:loading-fill" width={20} />
                      </div>
                    );
                  }
                  const baseQty = Number(row.quantity ?? 0);
                  if (!Number.isFinite(baseQty)) return row.quantity ?? "-";

                  const selected = row?.UOM?.find?.((u: any) => String(u?.value ?? "") === String(row?.uom_id ?? ""));
                  const isSecondary = String(selected?.uom_type ?? "") === "secondary";
                  const upc = Number(selected?.upc ?? 1);
                  const safeUpc = Number.isFinite(upc) && upc > 0 ? upc : 1;
                  // Secondary (e.g. CSE): show only full units. Remainder stays in primary (PCS).
                  const displayQty = isSecondary ? Math.floor(baseQty / safeUpc) : baseQty;
                  return toInternationalNumber(String(displayQty), {minimumFractionDigits: 0});
                },
              },
              {
                key: "deposit_qty",
                label: "Deposit Quantity",
                render: (row) => {
                  const max = getRemainingQtyForRow(
                      tableData.map((r, i) => ({ ...r, idx: i })),
                      Number(row.idx),
                      String(row.item_id ?? ""),
                      String(row.uom_id ?? ""),
                      (() => {
                        const baseQty = Number(row.quantity ?? 0);
                        if (!Number.isFinite(baseQty)) return 0;
                        const selected = row?.UOM?.find?.((u: any) => String(u?.value ?? "") === String(row?.uom_id ?? ""));
                        const isSecondary = String(selected?.uom_type ?? "") === "secondary";
                        const upc = Number(selected?.upc ?? 1);
                        const safeUpc = Number.isFinite(upc) && upc > 0 ? upc : 1;
                        // Secondary (e.g. CSE): limit to full units only.
                        return isSecondary ? Math.floor(baseQty / safeUpc) : baseQty;
                      })()
                    );
                  return <div className="pt-5">
                  <InputFields
                    type="number"
                    min={0}
                    max={max}
                    integerOnly={true}
                    placeholder="Enter Quantity"
                    value={row.deposit_qty}
                    disabled={!row.item_id || !row.uom_id || !row.quantity }
                    onChange={(e) =>
                      handleTableChange(Number(row.idx), "deposit_qty", e.target.value)
                    }
                    width={"200px"}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    In Stock: {max ? toInternationalNumber(String(max), {minimumFractionDigits: 0}) : "0"}
                  </span>
                  </div>
                },
              },
              {
                key: "price",
                label: "Price",
                render: (row) => (toInternationalNumber(row.price) ?? "-"),
              },
              {
                key: "total",
                label: "Total",
                render: (row) => row.total ? toInternationalNumber(row.total) ?? "-" : "-",
              },
              {
                key: "action",
                label: "Action",
                render: (row) => (
                  <button
                    type="button"
                    className="text-red-500 flex items-center justify-center cursor-pointer"
                    onClick={() => handleRemoveRow(Number(row.idx))}
                    disabled={tableData.length <= 1}
                  >
                    <Icon icon="hugeicons:delete-02" width={20} />
                  </button>
                ),
              },
            ],
            showNestedLoading: false,
          }}
        />
        <div className="mt-4 mb-48">
          {(() => {
            // Disable add when there's already an empty/incomplete item row
            const hasEmptyRow = tableData.some(row => !row.item_id);
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
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => router.push(backBtnUrl)}
          >
            Cancel
          </button>
          <SidebarBtn
            isActive={!submitting}
            label={submitting ? "Creating CAPS Deposit..." : "Create CAPS Deposit"}
            // label={submitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update CAPS Collection" : "Create CAPS Collection")}
            onClick={handleSubmit}
            disabled={
              submitting ||
              !form.warehouse_id || 
              !form.driver_id || 
              !form.truck_no ||
              !form.contact_no ||
              !form.claim_no ||
              !form.claim_date ||
              !form.claim_amount ||
              tableData.some(row => {
                return !row.item_id || 
                !row.uom_id ||
                !row.deposit_qty;
              })}
          />
        </div>
      </ContainerCard>
    </div>
  );
}