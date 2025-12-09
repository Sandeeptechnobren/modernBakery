"use client";

import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import AutoSuggestion from "@/app/components/autoSuggestion";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Logo from "@/app/components/logo";
import { addExchange, invoiceList, returnType, reasonList } from "@/app/services/agentTransaction";
import {
  agentCustomerGlobalSearch,
  genearateCode,
  itemGlobalSearch,
  itemList,
  saveFinalCode,
  warehouseListGlobalSearch,
  warehouseStockTopOrders
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";

interface FormData {
  id: number;
  erp_code: string;
  code: string;
  item_code: string;
  name: string;
  description: string;
  item_uoms: {
    id: number;
    item_id: number;
    uom_type: string;
    name: string;
    price: string;
    is_stock_keeping: boolean;
    upc: string;
    enable_for: string;
  }[];
  brand: string;
  image: string;
  category: {
    id: number;
    name: string;
    code: string;
  };
  itemSubCategory: {
    id: number;
    name: string;
    code: string;
  };
  shelf_life: string;
  commodity_goods_code: string;
  excise_duty_code: string;
  status: number;
  is_taxable: boolean;
  has_excies: boolean;
  item_weight: string;
  volume: number;
}

interface Reason {
  id?: number | string;
  reson?: string;
  return_reason?: string;
  return_type?: string;
  reason?: string;
}

interface WarehouseStock {
  item_id: number;
  warehouse_id: number;
  qty: string;
}

interface ItemUOM {
  id: number;
  item_id: number;
  uom_type: string;
  name: string;
  price: string;
  is_stock_keeping: boolean;
  upc: string;
  enable_for: string;
  uom_id: number;
}

interface ItemData {
  item_id: string;
  item_name: string;
  // stored human-readable label for a selected item (used when server results don't include it)
  item_label?: string;
  UOM: { label: string; value: string; price?: string; uom_type?: string }[];
  uom_id?: string;
  Quantity: string;
  Price: string;
  Total: string;
  available_stock?: string;
  return_type?: string;
  region?: string;
  Vat?: string | number;
  [key: string]: any;
}

export default function ExchangeAddEditPage() {
  const itemRowSchema = Yup.object({
    item_id: Yup.string().required("Please select an item"),
    uom_id: Yup.string().required("Please select a UOM"),
    Quantity: Yup.number()
      .typeError("Quantity must be a number")
      .min(1, "Quantity must be at least 1")
      .required("Quantity is required"),
  });

  const validationSchema = Yup.object({
    warehouse: Yup.string().required("Distributor is required"),
    customer: Yup.string().required("Customer is required"),
    comment: Yup.string().max(1000, "comment is too long"),
    items: Yup.array().of(itemRowSchema),
  });

  const goodOptions = [{ label: "Near By Expiry", value: "0" },
  { label: "Package Issue", value: "1" },
  { label: "Not Saleable", value: "2" },];
  const badOptions = [{ label: "Damage", value: "0" },
  { label: "Expiry", value: "1" },
  ];
  const router = useRouter();
  const [returnTypeOptions, setReturnTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [goodReasonOptions, setGoodReasonOptions] = useState<{ label: string; value: string }[]>([]);
  const [rowUomOptions, setRowUomOptions] = useState<Record<string, { value: string; label: string; price?: string }[]>>({});
  const [rowReasonOptions, setRowReasonOptions] = useState<Record<string, { label: string; value: string }[]>>({});
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const { warehouseOptions } = useAllDropdownListData();

  // // 🔹 Fetch invoices (for AutoSuggestion multi-select)
  // const fetchInvoices = async (searchText: string) => {
  //   try {
  //     const res = await invoiceList({ search: searchText || "", per_page: "50" });
  //     if (res && !res.error && Array.isArray(res.data)) {
  //       return res.data.map((inv: { id: number | string; invoice_code?: string; customer_name?: string }) => ({
  //         value: String(inv.id),
  //         label: `${inv.invoice_code ?? ""}${inv.invoice_code ? " - " : ""}${inv.customer_name ?? ""}`,
  //       }));
  //     }
  //     return [];
  //   } catch (e) {
  //     return [];
  //   }
  // };

  // const [skeleton, setSkeleton] = useState({
  //   route: false,
  //   customer: false,
  //   item: false,
  // });
  const [filteredCustomerOptions, setFilteredCustomerOptions] = useState<{ label: string; value: string }[]>([]);
  // const [filteredWarehouseOptions, setFilteredWarehouseOptions] = useState<{ label: string; value: string }[]>([]);
  const form = {
    warehouse: "",
    customer: "",
    comment: "",
    currency: "AED",
  };

  const [exchangeData, setExchangeData] = useState<FormData[]>([]);
  const [skeleton, setSkeleton] = useState({
    route: false,
    customer: false,
    item: false,
  });
  const [orderData, setOrderData] = useState<FormData[]>([]);
  const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<Record<string, WarehouseStock[]>>({});
  const [itemsWithUOM, setItemsWithUOM] = useState<Record<string, { uoms: ItemUOM[], stock_qty: string }>>({});
  const [itemData, setItemData] = useState<ItemData[]>([
    {
      item_id: "",
      item_name: "",
      item_label: "",
      UOM: [],
      uom_id: "",
      Quantity: "1",
      Price: "",
      Total: "0.00",
      available_stock: "",
      return_type: "",
      region: "",
      Vat: "0",
    },
  ]);

  // per-row validation errors for item rows (keyed by row index)
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});

  // per-row loading (for UOM / price) so UI can show skeletons while fetching
  const [itemLoading, setItemLoading] = useState<Record<number, { uom?: boolean; price?: boolean }>>({});

  const warehouseDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const validateRow = async (index: number, row?: ItemData, options?: { skipUom?: boolean }) => {
    const rowData = row ?? itemData[index];
    if (!rowData) return;
    // prepare data for Yup: convert numeric strings to numbers
    const toValidate = {
      item_id: String(rowData.item_id ?? ""),
      uom_id: String(rowData.uom_id ?? ""),
      Quantity: Number(rowData.Quantity) || 0,
      Price: Number(rowData.Price) || 0,
      return_type: String(rowData.return_type ?? ""),
      region: rowData.region ?? "",
    };
    try {
      if (options?.skipUom) {
        // validate only item_id and Quantity
        const partialErrors: Record<string, string> = {};
        try {
          await itemRowSchema.validateAt("item_id", toValidate);
        } catch (e: unknown) {
          const msg = typeof e === "object" && e !== null && "message" in e ? (e as any).message : undefined;
          if (msg) partialErrors["item_id"] = String(msg);
        }
        try {
          await itemRowSchema.validateAt("Quantity", toValidate);
        } catch (e: unknown) {
          const msg = typeof e === "object" && e !== null && "message" in e ? (e as any).message : undefined;
          if (msg) partialErrors["Quantity"] = String(msg);
        }

        // Stock validation when warehouse stock is available
        if (rowData?.item_id && rowData?.available_stock && rowData?.Quantity) {
          const availableStock = Number(rowData.available_stock);
          const requestedQty = Number(rowData.Quantity);
          if (requestedQty > availableStock) {
            partialErrors["Quantity"] = `Quantity cannot exceed available stock (${availableStock})`;
          }
        }
        if (Object.keys(partialErrors).length === 0) {
          setItemErrors((prev) => {
            const copy = { ...prev };
            delete copy[index];
            return copy;
          });
        } else {
          setItemErrors((prev) => ({ ...prev, [index]: partialErrors }));
        }
      } else {
        await itemRowSchema.validate(toValidate, { abortEarly: false });

        // Stock validation when warehouse stock is available
        if (rowData?.item_id && rowData?.available_stock && rowData?.Quantity) {
          const availableStock = Number(rowData.available_stock);
          const requestedQty = Number(rowData.Quantity);
          if (requestedQty > availableStock) {
            const validationErrors: Record<string, string> = {};
            validationErrors["Quantity"] = `Quantity cannot exceed available stock (${availableStock})`;
            setItemErrors((prev) => ({ ...prev, [index]: validationErrors }));
            return;
          }
        }
        setItemErrors((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      }
    } catch (err: unknown) {
      const validationErrors: Record<string, string> = {};
      const anyErr = err as any;
      if (anyErr && typeof anyErr === "object" && Array.isArray(anyErr.inner)) {
        anyErr.inner.forEach((e: any) => {
          if (e && e.path) validationErrors[e.path] = String(e.message);
        });
      } else if (anyErr && typeof anyErr === "object" && anyErr.path) {
        validationErrors[anyErr.path] = String(anyErr.message);
      }
      setItemErrors((prev) => ({ ...prev, [index]: validationErrors }));
    }
  };

   // Debounced function to fetch items when warehouse changes
    const fetchWarehouseItems = useCallback(async (warehouseId: string, searchTerm: string = "") => {
      if (!warehouseId) {
        setItemsOptions([]);
        setItemsWithUOM({});
        setWarehouseStocks({});
        return;
      }
  
      try {
        setSkeleton(prev => ({ ...prev, item: true }));
        
        // Fetch warehouse stocks - this API returns all needed data including pricing and UOMs
        const stockRes = await warehouseStockTopOrders(warehouseId);
        const stocksArray = stockRes.data?.stocks || stockRes.stocks || [];
  
        // Store warehouse stocks for validation
        setWarehouseStocks(prev => ({
          ...prev,
          [warehouseId]: stocksArray
        }));
  
        // Filter items based on search term and stock availability
        const filteredStocks = stocksArray.filter((stock: any) => {
          if (Number(stock.stock_qty) <= 0) return false;
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return stock.item_name?.toLowerCase().includes(searchLower) ||
                 stock.item_code?.toLowerCase().includes(searchLower);
        });
  
        // Create items with UOM data map for easy access
        const itemsUOMMap: Record<string, { uoms: ItemUOM[], stock_qty: string }> = {};
        
        const processedItems = filteredStocks.map((stockItem: any) => {
          // Process UOMs with pricing from warehouseStockTopOrders response
          const item_uoms = stockItem?.uoms ? stockItem.uoms.map((uom: any) => {
            let price = uom.price;
            // Override with specific pricing from the API response
            if (uom?.uom_type === "primary") {
              price = stockItem.buom_ctn_price || "-";
            } else if (uom?.uom_type === "secondary") {
              price = stockItem.auom_pc_price || "-";
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
          label: `${item.erp_code || item.item_code || ''} - ${item.name || ''} (Stock: ${item.warehouse_stock})`
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
  
    // Debounced warehouse change handler
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

  // // Function for fetching Item
  // const fetchItem = async (searchTerm: string, warehouse_id?: string) => {
  //   // Don't fetch items if no warehouse is selected
  //   if (!warehouse_id) {
  //     return [];
  //   }
  //   const res = await itemGlobalSearch({ perPage: "10", query: searchTerm, warehouse_id });
  //   if (res?.error) {
  //     showSnackbar(res.data?.message || "Failed to fetch items", "error");
  //     return [];
  //   }
  //   const data = res?.data || [];
  //   setExchangeData(data);
  //   const options = data.map((item: FormData) => ({
  //     value: String(item.id),
  //     label: (item?.erp_code ? item?.erp_code : item?.code) + (item.name ? " - " + item.name : ""),
  //   }));
  //   // Merge newly fetched options with existing ones so previously selected items remain available
  //   setItemsOptions((prev: { label: string; value: string }[] = []) => {
  //     const map = new Map<string, { label: string; value: string }>();
  //     prev.forEach((o) => map.set(o.value, o));
  //     options.forEach((o: { label: string; value: string }) => map.set(o.value, o));
  //     return Array.from(map.values());
  //   });
  //   return options;
  // };

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
  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  useEffect(() => {
    // generate code once on mount
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        try {
          setLoading(true);
          const res = await genearateCode({
            model_name: "exchange",
          });
          if (res?.code) {
            setCode(res.code);
          }
        } catch (e) {
          // ignore generate code failure gracefully
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [setLoading]);

  const recalculateItem = async (index: number, field: string, value: string, values?: FormikValues) => {
    const newData = [...itemData];
    const item: ItemData = newData[index] as ItemData;
    (item as any)[field] = value;

    // If user selects an item, update UI immediately and persist a label so selection survives searches
    if (field === "item_id") {
      item.item_id = value;
      if (!value) {
        item.item_name = "";
        item.UOM = [];
        item.uom_id = "";
        item.Price = "";
        item.Quantity = "1";
        item.region = "";
        item.return_type = "";
        item.item_label = "";
        item.Vat = "0";
        item.available_stock = "";
      } else {
        const selectedItem =
          orderData?.find((it: any) => String(it.id) === value) ??
          exchangeData.find((exchange: FormData) => exchange.id.toString() === value);

        item.item_id = selectedItem ? String(selectedItem.id || value) : value;
        item.item_name = selectedItem?.name ?? "";

        // Build UOM options with warehouse pricing overrides when present
        if (selectedItem?.item_uoms) {
          item.UOM = selectedItem.item_uoms.map((uom: any) => {
            let price = uom.price;
            if ((selectedItem as any)?.pricing) {
              if (uom.uom_type === "primary") {
                price = (selectedItem as any).pricing?.auom_pc_price || uom.price;
              } else if (uom.uom_type === "secondary") {
                price = (selectedItem as any).pricing?.buom_ctn_price || uom.price;
              }
            } else if ('uom_price' in uom) {
              price = (uom as any).uom_price;
            }
            return {
              label: uom.name,
              value: String(uom.id),
              price: String(price ?? ""),
              uom_type: uom.uom_type,
            };
          });
        } else {
          item.UOM = [];
        }

        // Default to first UOM
        item.uom_id = selectedItem?.item_uoms?.[0]?.id
          ? String(selectedItem.item_uoms[0].id)
          : "";

        // Price from first UOM with warehouse override
        if (selectedItem?.item_uoms?.[0]) {
          const firstUom = selectedItem.item_uoms[0];
          let price = firstUom.price;
          if ((selectedItem as any)?.pricing) {
            if (firstUom.uom_type === "primary") {
              price = (selectedItem as any).pricing?.auom_pc_price || firstUom.price;
            } else if (firstUom.uom_type === "secondary") {
              price = (selectedItem as any).pricing?.buom_ctn_price || firstUom.price;
            }
          } else if ('uom_price' in firstUom) {
            price = (firstUom as any).uom_price;
          }
          item.Price = String(price ?? "");
        } else {
          item.Price = "";
        }

        item.Quantity = "1";

        // Set available stock when present
        if ((selectedItem as any)?.warehouse_stock) {
          item.available_stock = String((selectedItem as any).warehouse_stock);
        } else {
          item.available_stock = "";
        }

        const computedLabel = selectedItem
          ? `${selectedItem.item_code ?? selectedItem.erp_code ?? ""}${selectedItem.item_code || selectedItem.erp_code ? " - " : ""}${selectedItem.name ?? ""}`
          : "";
        item.item_label = computedLabel;
        if (item.item_label) {
          setItemsOptions((prev: { label: string; value: string }[] = []) => {
            if (prev.some((o) => o.value === item.item_id)) return prev;
            return [...prev, { value: item.item_id, label: item.item_label as string }];
          });
        }
      }
    }

    // If user changes UOM, update price based on selected UOM pricing
    if (field === "uom_id" && value) {
      item.uom_id = value;
      const selectedUOM = item.UOM.find((uom: any) => uom.value === value);
      if (selectedUOM?.price) {
        item.Price = selectedUOM.price;
      }
    }

    const qty = Number(item.Quantity) || 0;
    const price = Number(item.Price) || 0;
    const total = qty * price;
    item.Total = isFinite(total) ? total.toFixed(2) : "0.00";

    if (field !== "item_id") {
      // When changing uom_id quickly after selecting item, skip immediate uom-required error
      const skipUom = field === "uom_id" && (!item.uom_id || item.uom_id === "");
      await validateRow(index, newData[index], { skipUom: skipUom });
    }
    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData((prev) => [
      ...prev,
      {
        item_id: "",
        item_name: "",
        item_label: "",
        UOM: [],
        uom_id: "",
        Quantity: "1",
        Price: "",
        Total: "0.00",
        available_stock: "",
        region: "",
        return_type: "",
        Vat: "0",
      },
    ]);
  };

  // Add an item from the fetched exchangeData list into the itemData rows
  const handleAddItemFromList = (exchange: FormData) => {
    const newRow: ItemData = {
      item_id: String(exchange.id ?? ""),
      item_name: exchange.name ?? "",
      item_label: `${exchange.item_code ?? exchange.erp_code ?? ""}${exchange.item_code || exchange.erp_code ? " - " : ""}${exchange.name ?? ""}`,
      UOM: exchange.item_uoms?.map((uom) => {
        const price = 'uom_price' in uom ? (uom as any).uom_price : uom.price;
        return {
          label: uom.name,
          value: String(uom.id),
          price: String(price ?? "")
        };
      }) || [],
      uom_id: exchange.item_uoms?.[0]?.id ? String(exchange.item_uoms[0].id) : "",
      Quantity: "1",
      Price: (() => {
        const firstUom = exchange.item_uoms?.[0];
        return firstUom ? ('uom_price' in firstUom ? String((firstUom as any).uom_price) : String(firstUom.price ?? "")) : "";
      })(),
      Total: "0.00",
      available_stock: "",
      region: "",
      return_type: "",
      Vat: "0",
    };
    setItemData((prev) => [...prev, newRow]);
    // ensure itemsOptions contains this selection so AutoSuggestion can show it
    setItemsOptions((prev: { label: string; value: string }[] = []) => {
      if (prev.some((o) => o.value === String(exchange.id))) return prev;
      return [...prev, { value: String(exchange.id), label: newRow.item_label as string }];
    });
  };

  const handleRemoveItem = (index: number) => {
    if (itemData.length <= 1) {
      setItemData([
        {
          item_id: "",
          item_name: "",
          item_label: "",
          UOM: [],
          uom_id: "",
          Quantity: "1",
          Price: "",
          Total: "0.00",
          available_stock: "",
          region: "",
          return_type: "",
          Vat: "0",
        },
      ]);
      return;
    }
    setItemData(itemData.filter((_, i) => i !== index));
  };


  // --- Compute totals for summary
  const grossTotal = itemData.reduce((sum, item) => sum + Number(item.Total || 0), 0);
  const totalVat = itemData.reduce((sum, item) => sum + Number(item.Vat || 0), 0);

  const finalTotal = grossTotal + totalVat;

  const generatePayload = (values?: FormikValues) => {
    // Invoices: all rows from the return table (itemData)
    const invoices = itemData.map((item) => ({
      item_id: Number(item.item_id) || null,
      item_price: Number(item.Price) || null,
      item_quantity: Number(item.Quantity) || null,
      uom_id: Number(item.uom_id) || null,
      total: Number(item.Total) || null,
      region: item.return_reason ? String(item.return_reason) : null,
      return_type: String(item.return_type) || null,
    }));

    // Returns: only selected items from the collect table (item_id present)
    const returns = itemData
      .filter((item) => item.item_id)
      .map((item) => ({
        item_id: Number(item.item_id) || null,
        item_price: Number(item.Price) || null,
        item_quantity: Number(item.Quantity) || null,
        uom_id: Number(item.uom_id) || null,
        total: Number(item.Total) || null,
        status: 1,
      }));

    return {
      exchange_code: code,
      warehouse_id: Number(values?.warehouse) || null,
      customer_id: Number(values?.customer) || null,
      total: Number(finalTotal.toFixed(2)),
      comment: values?.comment || "",
      status: 1,
      invoices,
      returns,
    };
  };

  const handleSubmit = async (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>) => {
    try {
      // validate item rows separately (they live in local state)
      const itemsSchema = Yup.array().of(itemRowSchema);
      try {
        await itemsSchema.validate(itemData, { abortEarly: false });
      } catch (itemErr: unknown) {
        // log detailed item validation errors and surface a friendly message (safely access unknown)
        const anyErr = itemErr as any;
        if (anyErr && typeof anyErr === "object" && Array.isArray(anyErr.inner)) {
          console.error("Item validation errors:", anyErr.inner);
        } else {
          console.error("Item validation errors:", anyErr);
        }
        const msg =
          (anyErr && typeof anyErr === "object" && Array.isArray(anyErr.inner) && anyErr.inner.map((err: any) => String(err.message)).join(", ")) ||
          (anyErr && typeof anyErr === "object" && "message" in anyErr ? String(anyErr.message) : undefined) ||
          "Item validation failed";
        showSnackbar(msg, "error");
        // set a top-level form error to prevent submission
        formikHelpers.setErrors({ items: "Item rows validation failed" } as any);
        return;
      }

      formikHelpers.setSubmitting(true);
      const payload = generatePayload(values);
      console.log("Submitting payload:", payload);
      const res = await addExchange(payload);
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to create Exchange", "error");
        console.error("Create exchange error:", res);
      } else {
        try {
          await saveFinalCode({
            reserved_code: code,
            model_name: "exchange",
          });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
        showSnackbar("Exchange created successfully", "success");
        router.push("/distributorsExchange");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to submit exchange", "error");
    } finally {
      if (formikHelpers && typeof formikHelpers.setSubmitting === "function") {
        formikHelpers.setSubmitting(false);
      }
    }
  };

  const fetchAgentCustomers = async (values: FormikValues, search: string) => {
    const res = await agentCustomerGlobalSearch({
      warehouse_id: values.warehouse,
      query: search || "",
      per_page: "10",
    });
    if (res?.error) {
      showSnackbar(res.data?.message || "Failed to fetch customers", "error");
      // setSkeleton((prev) => ({ ...prev, customer: false }));
      return [];
    }
    const data = res?.data || [];
    const options = data.map((customer: { id: number | string; osa_code?: string; name?: string }) => ({
      value: String(customer.id),
      label: `${customer.osa_code ?? ""} - ${customer.name ?? ""}`,
    }));
    setFilteredCustomerOptions(options);
    // setSkeleton((prev) => ({ ...prev, customer: false }));
    return options;
  };

  // const fetchWarehouse = async (searchQuery?: string) => {
  //   const res = await warehouseListGlobalSearch({
  //     query: searchQuery || "",
  //     dropdown: "1",
  //     per_page: "50",
  //   });

  //   if (res?.error) {
  //     showSnackbar(res.data?.message || "Failed to fetch customers", "error");
  //     return [];
  //   }
  //   const data = res?.data || [];
  //   const options = data.map((warehouse: { id: number | string; warehouse_code?: string; warehouse_name?: string }) => ({
  //     value: String(warehouse.id),
  //     label: `${warehouse.warehouse_code ?? ""} - ${warehouse.warehouse_name ?? ""}`,
  //   }));
  //   // setFilteredWarehouseOptions(options);
  //   return options;
  // };


  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon icon="lucide:arrow-left" className="curosor-pointer" width={24} onClick={() => router.back()} />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">Add Exchange</h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Exchange</span>
            <span className="text-primary text-[14px] tracking-[8px]">#{code}</span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        <Formik<FormikValues> initialValues={form} onSubmit={handleSubmit} validationSchema={validationSchema} enableReinitialize={true}>
          {({ values, touched, errors, setFieldValue, handleChange, submitForm, isSubmitting }: FormikProps<FormikValues>) => {
            // key/value summary data (use values.currency)


            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-10">
                  <div>
                    <InputFields
                      required
                      label="Distributor"
                      name="warehouse"
                      // placeholder="Search Distributor"
                      // onSearch={(q) => fetchWarehouse(q)}
                      value={values.warehouse}
                      options={warehouseOptions}
                      searchable={true}
                      // initialValue={filteredWarehouseOptions.find((o) => o.value === String(values?.warehouse))?.label || ""}
                      onChange={(e) => {
                        if (values.warehouse !== e.target.value) {
                          setFieldValue("warehouse", e.target.value);
                          // setSkeleton((prev) => ({ ...prev, customer: true }));
                          setFieldValue("customer", "");
                          setFilteredCustomerOptions([]);
                          // Clear items when warehouse changes
                          setItemsOptions([]);
                          setItemData([
                            {
                              item_id: "",
                              item_name: "",
                              item_label: "",
                              UOM: [],
                              uom_id: "",
                              Quantity: "1",
                              Price: "",
                              Total: "0.00",
                              available_stock: "",
                              region: "",
                              return_type: "",
                              Vat: "0",
                            },
                          ]);
                          handleWarehouseChange(e.target.value);
                        } else {
                          setFieldValue("warehouse", e.target.value);
                        }
                      }}
                      showSkeleton={warehouseOptions.length === 0}
                      error={touched.warehouse && (errors.warehouse as string)}
                    />
                  </div>
                  <div>
                    <AutoSuggestion
                      required
                      label="Customer"
                      name="customer"
                      placeholder="Search customer"
                      onSearch={(q) => {
                        return fetchAgentCustomers(values, q);
                      }}
                      initialValue={filteredCustomerOptions.find((o) => o.value === String(values?.customer))?.label || ""}
                      onSelect={(opt) => {
                        setFieldValue("customer", opt.value);
                      }}
                      onClear={() => {
                        setFieldValue("customer", "");
                      }}
                      disabled={!values.warehouse}
                      error={touched.customer && (errors.customer as string)}
                      className="w-full"
                    />
                  </div>

                  {/* spacer columns for grid alignment */}
                  <div className="lg:col-span-4" />

                </div>

                <div className="mt-6 mb-6">
                  <h3 className="text-[16px] font-semibold mb-2"> Received
                  </h3>
                  <Table
                    data={itemData.map((row, idx) => ({
                      ...row,
                      idx: String(idx),
                      UOM: Array.isArray(row.UOM) ? JSON.stringify(row.UOM) : "[]",
                      item_id: String(row.item_id ?? ""),
                      Quantity: String(row.Quantity ?? ""),
                      Price: String(row.Price ?? ""),
                      Total: String(row.Total ?? ""),
                      Vat: row.Vat !== undefined ? String(row.Vat) : "0",
                    }))}

                    config={{
                      showNestedLoading: false,
                      columns: [
                        {
                          key: "item_id",
                          label: "Item Name",
                          width: 300,
                          render: (row) => {
                            const idx = Number(row.idx);
                            const err = itemErrors[idx]?.item_id;
                            const matchedOption = itemsOptions.find((o) => o.value === row.item_id);
                            const initialLabel = matchedOption?.label ?? (row.item_label as string) ?? "";
                            return (
                              <div>
                                <InputFields
                                  label=""
                                  name={`item_id_${row.idx}`}
                                  placeholder="Search item"
                                  // onSearch={(q) => fetchItem(q, values.warehouse)}
                                  // initialValue={initialLabel}
                                  value={row.item_id}
                                  // minSearchLength={0}
                                  options={itemsOptions}
                                  searchable={true}
                                  onChange={(e) => {
                                    if (e.target.value !== row.item_id) {
                                      recalculateItem(Number(row.idx), "item_id", e.target.value);
                                    }
                                  }}
                                  // onClear={() => {
                                  //   recalculateItem(Number(row.idx), "item_id", "");
                                  // }}
                                  disabled={!values.warehouse || !values.customer}
                                  error={err && err}
                                  className="w-full"
                                />
                              </div>
                            );
                          },
                        },
                        {
                          key: "uom_id",
                          label: "UOM",
                          width: 150,
                          render: (row) => {
                            const idx = Number(row.idx);
                            const err = itemErrors[idx]?.uom_id;
                            const options = JSON.parse(row.UOM ?? "[]");
                            return (
                              <div>
                                <InputFields
                                  label=""
                                  value={row.uom_id}
                                  placeholder="Select UOM"
                                  width="max-w-[150px]"
                                  options={options}
                                  searchable={true}
                                  disabled={options.length === 0 || !values.customer}
                                  showSkeleton={Boolean(itemLoading[idx]?.uom)}
                                  onChange={(e) => {
                                    const chosen = (e.target as HTMLInputElement).value;
                                    recalculateItem(Number(row.idx), "uom_id", chosen);
                                  }}
                                  error={err && err}
                                />
                              </div>
                            );
                          },
                        },
                        {
                          key: "Quantity",
                          label: "Qty",
                          width: 150,
                          render: (row) => {
                            const idx = Number(row.idx);
                            const err = itemErrors[idx]?.Quantity;
                            const currentItem = itemData[idx];
                            const availableStock = currentItem?.available_stock;
                            return (
                              <div className={`${availableStock ? "pt-5" : ""}`}>
                                <InputFields
                                  label=""
                                  type="number"
                                  name="Quantity"
                                  placeholder="Enter Qty"
                                  value={row.Quantity}
                                  disabled={!row.uom_id || !values.customer}
                                  onChange={(e) => {
                                    const raw = (e.target as HTMLInputElement).value;
                                    const intPart = raw.split(".")[0];
                                    const sanitized = intPart === "" ? "" : String(Math.max(0, parseInt(intPart, 10) || 0));
                                    recalculateItem(Number(row.idx), "Quantity", sanitized);
                                  }}
                                  min={1}
                                  max={availableStock}
                                  integerOnly={true}
                                  error={err && err}
                                />
                                {availableStock && (
                                  <div className="text-xs text-gray-500 mt-1">Stock: {availableStock}</div>
                                )}
                              </div>
                            );
                          },
                        },
                        {
                          key: "Price",
                          label: "Price",
                          render: (row) => {
                            const idx = Number(row.idx);
                            const loading = Boolean(itemLoading[idx]?.price);
                            const price = String(row.Price ?? "");
                            if (loading) {
                              return <span className="text-gray-400 animate-pulse">Loading...</span>;
                            }
                            if (!price || price === "" || price === "0" || price === "-") {
                              return <span className="text-gray-400">-</span>;
                            }
                            return <span>{price}</span>;
                          },
                        },
                        {
                          key: "region",
                          label: "Reason",
                          width: 150,
                          render: (row) => {
                            const idx = Number(row.idx);
                            const err = itemErrors[idx]?.Quantity;
                            return (
                              <div>
                                <InputFields
                                  label=""
                                  name="region"
                                  placeholder="Enter Reason"
                                  value={row.region}
                                  disabled={!row.uom_id || !values.customer}
                                  onChange={(e) => {
                                    const raw = (e.target as HTMLInputElement).value;
                                    const intPart = raw.split(".")[0];
                                    const sanitized = intPart === "" ? "" : String(Math.max(0, parseInt(intPart, 10) || 0));
                                    recalculateItem(Number(row.idx), "region", sanitized);
                                  }}
                                  min={1}
                                  integerOnly={true}
                                  error={err && err}
                                />
                              </div>
                            );
                          },
                        },
                        {
                          key: "return_type",
                          label: "Reason Type",
                          width: 150,
                          render: (row) => {
                            const idx = Number(row.idx);
                            const err = itemErrors[idx]?.return_type;
                            return (
                              <div>
                                <InputFields
                                  label=""
                                  name="return_type"
                                  placeholder="Select Reason Type"
                                  value={row.return_type}
                                  disabled={!row.uom_id || !values.customer}
                                  onChange={(e) => {
                                    const raw = (e.target as HTMLInputElement).value;
                                    const intPart = raw.split(".")[0];
                                    const sanitized = intPart === "" ? "" : String(Math.max(0, parseInt(intPart, 10) || 0));
                                    recalculateItem(Number(row.idx), "return_type", sanitized);
                                  }}
                                  min={1}
                                  integerOnly={true}
                                  error={err && err}
                                />
                              </div>
                            );
                          },
                        },
                        {
                          key: "Total",
                          label: "Total",
                          render: (row) => <span>{toInternationalNumber(row.Total) || "0.00"}</span>,
                        },
                        {
                          key: "action",
                          label: "Action",
                          render: (row) => (
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
                    }}
                  />
                  <div className="mt-4">
                    <button type="button" className="text-[#E53935] font-medium text-[16px] flex items-center gap-2" onClick={handleAddNewItem}>
                      <Icon icon="material-symbols:add-circle-outline" width={20} />
                      Add New Item
                    </button>
                  </div>
                </div>

                {/* --- Collect table: SHOW ONLY SELECTED ITEMS (driven by itemData) --- */}
                <div className="mt-6 mb-6">
                  <h3 className="text-[16px] font-semibold mb-2"> Delivered</h3>
                  <Table
                    data={itemData
                      .filter((row) => row.item_id)
                      .map((row) => {
                        const original = exchangeData.find((it) => String(it.id) === String(row.item_id));
                        // Find selected UOM object
                        const selectedUom = Array.isArray(row.UOM)
                          ? row.UOM.find((uom) => String(uom.value) === String(row.uom_id))
                          : undefined;
                        return {
                          id: String(row.item_id ?? ""),
                          code: String(original?.item_code ?? original?.erp_code ?? ""),
                          name: String(original?.name ?? row.item_name ?? ""),
                          uom: selectedUom?.label || "",
                          uom_count: String(Array.isArray(original?.item_uoms) ? original.item_uoms.length : 0),
                          price: selectedUom?.price ?? row.Price ?? "0",
                          quantity: row.Quantity,
                          total: row.Total,
                        };
                      })}
                    config={{
                      showNestedLoading: false,
                      columns: [
                        {
                          key: "code_name",
                          label: "Item",
                          width: 300,
                          render: (r) => (
                            <span>
                              {r.code ? `${r.code} - ${r.name}` : r.name}
                            </span>
                          ),
                        },
                        { key: "uom", label: "UOM", align: "center", render: (r) => <span>{r.uom}</span> },
                        { key: "quantity", label: "Quantity", align: "center", render: (r) => <span>{r.quantity}</span> },
                        { key: "price", label: "Price", align: "right", render: (r) => <span>{toInternationalNumber(r.price) || "-"}</span> },
                        { key: "total", label: "Total", align: "right", render: (r) => <span>{toInternationalNumber(r.total) || "-"}</span> },
                      ],
                    }}
                  />
                </div>

                {/* --- Summary --- */}
                <div className="flex justify-between text-primary gap-0 mb-10">
                  <div className="flex justify-between flex-wrap w-full mt-[20px]">
                    <div className="flex flex-col justify-between gap-[20px] w-full lg:w-auto">

                      <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">
                        <InputFields label="comment" type="textarea" name="comment" placeholder="Enter comment" value={values.comment} onChange={handleChange} error={touched.comment && (errors.comment as string)} />
                      </div>
                    </div>


                  </div>
                </div>

                {/* --- Buttons --- */}
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100" onClick={() => router.push("/distributorsExchange")}>
                    Cancel
                  </button>
                  <SidebarBtn type="submit" isActive={true} label={isSubmitting ? "Creating Exchange..." : "Create Exchange"} disabled={isSubmitting} onClick={() => submitForm()} />
                </div>
              </>
            );
          }}
        </Formik>
      </ContainerCard>
    </div>
  );
}