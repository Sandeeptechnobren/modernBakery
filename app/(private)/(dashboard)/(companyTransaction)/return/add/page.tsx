"use client";

import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import { Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { companyCustomersGlobalSearch, genearateCode, returnWarehouseStock, saveFinalCode } from "@/app/services/allApi";
import { invoiceBatch, returnCreate } from "@/app/services/companyTransaction";
import { isValidDate } from "@/app/utils/formatDate";

interface FormData {
  item_id: number,
  item_name: string,
  erp_code: string,
  stock_qty: string,
  uoms: {
    upc: string,
    name: string,
    uom_id: number
  }[]
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
  UOM: { label: string; value: string, upc: string }[];
  uom_id?: string;
  Quantity: string;
  Price: string;
  Total: string;
  Type: string;
  SapId: number | string;
  Reason: string;
  Expiry: string;
  Batch: string;
  Batchs?: { label: string; value: string; upc?: string }[];
  [key: string]: string | number | { label: string; value: string, upc?: string }[] | undefined;
}

interface BatchData {
    header_id: number,
    batch_number: string,
    inv_position_no: string,
    quantity: string,
    batch_expiry_date: string,
    invoice_number: string,
    sap_id: number,
    item_price: string
}

export const reasonObj = {
  good: [
    { label: "Short Expiry", value: "1" },
    { label: "Non Moving", value: "2" },
    { label: "Replacement", value: "3" },
  ],
  bad: [
    { label: "Damaged", value: "1" },
    { label: "Quality Issue", value: "2" },
    { label: "Expired", value: "3" },
    { label: "Packing Issue", value: "4" },
  ]
};

export default function PurchaseOrderAddEditPage() {
  const itemRowSchema = Yup.object({
    item_id: Yup.string()
      .required("required"),
    uom_id: Yup.string()
      .required("required"),
    Quantity: Yup.number()
      .typeError("invalid")
      .min(1, "atleast 1")
      .required("required"),
    Expiry: Yup.string()
      .required("required")
      .test("is-valid-date", "invalid", (value) => {
        if (!value) return false;
        return !Number.isNaN(new Date(value).getTime());
      }),
    Type: Yup.string()
      .required("required"),
    Reason: Yup.string()
      .required("required"),
    Batch: Yup.string()
      .required("required"),
  });

  // Map Yup array validation errors into per-row field errors for the table
  const mapItemRowErrors = (err: any) => {
    const errors: Record<number, Record<string, string>> = {};
    if (err?.inner && Array.isArray(err.inner)) {
      err.inner.forEach((e: any) => {
        const match = typeof e.path === "string" ? e.path.match(/^\[(\d+)\]\.(.+)$/) : null;
        if (match) {
          const idx = Number(match[1]);
          const field = match[2];
          errors[idx] = { ...(errors[idx] || {}), [field]: e.message };
        }
      });
    }
    return errors;
  };

  const validationSchema = Yup.object({
    // warehouse: Yup.string().required("Warehouse is required"),
    turnman: Yup.string()
      .required("Turnman is required")
      .min(2, "Turnman must be at least 2 characters"),
    truckNo: Yup.string()
      .required("Truck Number is required")
      .min(2, "Truck Number must be at least 2 characters"),
    contactNo: Yup.string()
      .required("Contact is required"),
    // returnNo: Yup.string()
    //   .required("Return No is required"),
    // customer: Yup.string()
    //   .required("Customer is required"),
    // delivery_date: Yup.string()
    //   .required("Delivery date is required")
    //   .test("is-date", "Delivery date must be a valid date", (val) => {
    //     return Boolean(val && !Number.isNaN(new Date(val).getTime()));
    //   }),
    note: Yup.string().max(1000, "Note is too long"),
    items: Yup.mixed().notRequired(),
  });

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [skeleton, setSkeleton] = useState({
    route: false,
    customer: false,
    salesteam: false,
    item: false,
  });
  const CURRENCY = localStorage.getItem("country") || "";
  const [finalTotal, setFinalTotal] = useState(0);
  const [filteredCustomerOptions, setFilteredCustomerOptions] = useState<{ label: string; value: string }[]>([]);
  const [filteredSalesTeamOptions, setFilteredSalesTeamOptions] = useState<{ label: string; value: string }[]>([]);
  // const [filteredWarehouseOptions, setFilteredWarehouseOptions] = useState<{ label: string; value: string }[]>([]);
  const { warehouseOptions, ensureWarehouseLoaded } = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureWarehouseLoaded();
  }, [ensureWarehouseLoaded]);
  const form = {
    customer: "",
    note: "",
    delivery_date: new Date().toISOString().slice(0, 10),
  };

  const [orderData, setOrderData] = useState<FormData[]>([]);
  const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
    const [warehouseStocks, setWarehouseStocks] = useState<Record<string, WarehouseStock[]>>({});
    const [itemsWithUOM, setItemsWithUOM] = useState<Record<string, { uoms: ItemUOM[], stock_qty: string, uomDetails: Record<string, { upc: string }> }>>({});
  const [itemData, setItemData] = useState<ItemData[]>([
    {
        item_id: "",
        UOM: [],
        uom_id: "",
        Quantity: "1",
        Expiry: "",
        Batch: "",
        SapId: "",
        Type: "",
        Reason: "",
        Price: "",
        Total: "-",
      }
  ]);

  useEffect(() => {
    setFinalTotal(itemData.reduce((sum, item) => sum + (Number(item.Total) || 0), 0));
  }, [itemData]);
  
  // per-row validation errors for item rows (keyed by row index)
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});
  // per-row touched tracking so we only show errors after interaction
  const [itemTouched, setItemTouched] = useState<Record<number, Record<string, boolean>>>({});

  // per-row loading (for UOM / price) so UI can show skeletons while fetching
  const [itemLoading, setItemLoading] = useState<Record<number, { uom?: boolean; price?: boolean, Batch?: boolean, item?: boolean }>>({});

  // Ref to track debounce timeouts for quantity changes per row
  const quantityDebounceRef = useRef<Record<number, NodeJS.Timeout>>({});
  const warehouseDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: fetch base stock for an item (in smallest unit) from cached warehouse data
  const getBaseStockForItem = useCallback((itemId: string) => {
    if (!itemId) return 0;
    const stockFromWarehouse = itemsWithUOM[itemId]?.stock_qty;
    const stockFromOrder = orderData.find((od) => String(od.item_id) === String(itemId))?.stock_qty;
    const parsed = Number(stockFromWarehouse ?? stockFromOrder ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [itemsWithUOM, orderData]);

  // Helper: derive UPC/multiplier for an item's UOM (fallback to 1 to avoid divide-by-zero)
  const getUomMultiplier = useCallback((itemId: string, uomId?: string, row?: ItemData) => {
    const uomKey = String(uomId ?? "");
    const fromMap = itemsWithUOM[itemId]?.uomDetails?.[uomKey]?.upc;
    const fromRow = Array.isArray(row?.UOM) ? row?.UOM.find((u: any) => String(u.value) === uomKey)?.upc : undefined;
    const fromOrder = orderData
      .find((od) => String(od.item_id) === String(itemId))
      ?.uoms?.find((u) => String(u.uom_id) === uomKey)?.upc;
    const parsed = Number(fromMap ?? fromRow ?? fromOrder ?? 1);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [itemsWithUOM, orderData]);

  // Helper: keep available stock in sync across duplicate item rows (different UOMs included)
  const rebalanceStockForItem = useCallback((data: ItemData[], targetItemId?: string) => {
    const updated = [...data];
    const targetIds = targetItemId
      ? [String(targetItemId)]
      : Array.from(new Set(updated.map((row) => row.item_id).filter(Boolean).map(String)));

    targetIds.forEach((id) => {
      const baseStock = getBaseStockForItem(id);
      if (!baseStock) {
        updated.forEach((row, idx) => {
          if (String(row.item_id) === id) {
            updated[idx] = { ...row, inStock: "0" };
          }
        });
        return;
      }

      const rowsForItem = updated
        .map((row, idx) => ({ row, idx }))
        .filter(({ row }) => String(row.item_id) === id && row.uom_id);

      const allocations = rowsForItem.map(({ row }) => {
        const upc = getUomMultiplier(id, row.uom_id, row);
        return (Number(row.Quantity) || 0) * upc;
      });
      const totalAllocated = allocations.reduce((sum, qty) => sum + qty, 0);

      rowsForItem.forEach(({ row, idx }, allocIdx) => {
        const upc = getUomMultiplier(id, row.uom_id, row);
        const currentAllocation = allocations[allocIdx] ?? 0;
        const remainingBase = baseStock - (totalAllocated - currentAllocation);
        const availableQty = Math.max(0, Math.floor(remainingBase / upc));
        const adjustedRow: ItemData = { ...updated[idx], inStock: String(availableQty) } as ItemData;

        if ((Number(adjustedRow.Quantity) || 0) > availableQty) {
          adjustedRow.Quantity = String(availableQty);
          adjustedRow.Total = (Number(adjustedRow.Price) * availableQty).toString();
        }

        updated[idx] = adjustedRow;
      });
    });

    return updated;
  }, [getBaseStockForItem, getUomMultiplier]);
  

  // Debounced function for quantity changes (triggers batch fetch)
  const handleQuantityChange = (index: number, value: string, values: FormikValues) => {
    setItemTouched((prev) => ({ ...prev, [index]: { ...(prev[index] || {}), Quantity: true } }));
    const newData = [...itemData];
    const item: ItemData = newData[index] as ItemData;
    (item as any)["Quantity"] = value;
    const balanced = rebalanceStockForItem(newData, item.item_id);
    setItemData(balanced);

    // Clear any existing timeout for this row
    if (quantityDebounceRef.current[index]) {
      clearTimeout(quantityDebounceRef.current[index]);
    }

    // Set a new debounced timeout (300ms delay)
    quantityDebounceRef.current[index] = setTimeout(() => {
      recalculateItem(index, "Quantity", value, values);
      delete quantityDebounceRef.current[index];
    }, 500);
  };

  const validateRow = async (index: number, row?: ItemData, options?: { skipUom?: boolean }) => {
    const rowData = row ?? itemData[index];
    if (!rowData) return;
    // prepare data for Yup: convert numeric strings to numbers
    const toValidate = {
      item_id: String(rowData.item_id ?? ""),
      uom_id: String(rowData.uom_id ?? ""),
      Quantity: Number(rowData.Quantity) || 0,
      Price: Number(rowData.Price) || 0,
      Expiry: String((rowData as any).Expiry ?? ""),
      Type: String((rowData as any).Type ?? ""),
      Reason: String((rowData as any).Reason ?? ""),
      Batch: String((rowData as any).Batch ?? ""),
    };
    try {
      if (options?.skipUom) {
        // validate only item_id and Quantity to avoid showing UOM required immediately after selecting item
        const partialErrors: Record<string, string> = {};
        try {
          await itemRowSchema.validateAt("item_id", toValidate);
        } catch (e: any) {
          if (e?.message) partialErrors["item_id"] = e.message;
        }
        try {
          await itemRowSchema.validateAt("Quantity", toValidate);
        } catch (e: any) {
          if (e?.message) partialErrors["Quantity"] = e.message;
        }
        if (Object.keys(partialErrors).length === 0) {
          // clear errors for this row
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
        // clear errors for this row
        setItemErrors((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      }
    } catch (err: any) {
      const validationErrors: Record<string, string> = {};
      if (err && err.inner && Array.isArray(err.inner)) {
        err.inner.forEach((e: any) => {
          if (e.path) validationErrors[e.path] = e.message;
        });
      } else if (err && err.path) {
        validationErrors[err.path] = err.message;
      }
      // showSnackbar(`Row ${index + 1} has errors: ${Object.values(validationErrors).join(", ")}`, "error");
      setItemErrors((prev) => ({ ...prev, [index]: validationErrors }));
    }
  };

  const markTouched = (index: number, field: string) => {
    setItemTouched((prev) => ({ ...prev, [index]: { ...(prev[index] || {}), [field]: true } }));
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
        const stockRes = await returnWarehouseStock({warehouse_id: warehouseId});

        console.log(stockRes.data)
  
        // setItemsWithUOM(itemsUOMMap);
        setOrderData(stockRes.data);
  
        // Create dropdown options
        const options = stockRes.data.map((item: any) => ({
          value: String(item.item_id),
          label: `${item.erp_code || item.item_code || ''} - ${item.item_name || ''} (Stock: ${item.stock_qty})`
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

  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  useEffect(() => {
    // generate code
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({
          model_name: "ht_return",
        });
        if (res?.code) {
          setCode(res.code);
        }
        setLoading(false);
      })();
    }
  }, []);

  const recalculateItem = async (index: number, field: string, value: string, values?: FormikValues) => {
    const newData = [...itemData];
    const item: ItemData = newData[index] as ItemData;
    (item as any)[field] = value;
    // validateRow(index, newData[index]);

    // If user selects an item, update UI immediately and persist a label so selection survives searches
    if (field === "item_id") {
      // set item_id to the chosen value
      item.item_id = value;
      if (!value) {
        item.UOM = [];
        item.uom_id = "";
        item.Price = "";
        item.Quantity = "1";
        item.item_label = "";
        item.Type = "";
        item.Reason = "";
        item.Expiry = "";
        item.Vat = "-";
        item.Net = "-";
        item.Total = "-";

        setItemErrors((prev) => ({
          ...prev,
          [index]: { },
        }));
        const balanced = rebalanceStockForItem(newData);
        setItemData(balanced);
        return;
      } else {
        const selectedOrder = orderData.find((order: FormData) => order.item_id.toString() === value);
        // console.log(selectedOrder);
        item.item_id = selectedOrder ? String(selectedOrder.item_id || value) : value;
        item.UOM = selectedOrder?.uoms?.map(uom => ({ 
          label: uom.name, 
          value: uom?.uom_id?.toString(), 
          // price: uom.uom_type == "primary" ? String(selectedOrder.pricing.auom_pc_price ?? "0") 
          //   : uom.uom_type == "secondary" ? String(selectedOrder.pricing.buom_ctn_price ?? "0") 
          //   : "-",
          upc: uom.upc
        })) || [];
          console.log(item.UOM, selectedOrder);
        console.log(item.UOM, selectedOrder)
        item.uom_id = selectedOrder?.uoms?.[0]?.uom_id ? String(selectedOrder.uoms[0].uom_id) : "";
        // item.Price = item.UOM[0]?.price || "0";
        // availableStock(item.item_id, item.uom_id);
        const baseStock = getBaseStockForItem(item.item_id);
        const upc = getUomMultiplier(item.item_id, item.uom_id, item);
        item.inStock = String(Math.floor(baseStock / upc));
        item.Quantity = "1";
        // item.Expiry = new Date().toISOString().slice(0, 10);
        // item.Type = "good";
        // item.Reason = "1";
        // item.Total = (Number(item.Price) * Number(item.Quantity)).toString();
        // item.Vat = String(Number(item.Total) - Number(item.Total) / 1.18);
        // item.Net = String(Number(item.Total) - Number(item.Vat));

        const computedLabel = selectedOrder ? `${selectedOrder.erp_code ?? ''}${selectedOrder.erp_code ? ' - ' : ''}${selectedOrder.item_name ?? ''}` : "";
        item.item_label = computedLabel;
        if (item.item_label) {
          setItemsOptions((prev: { label: string; value: string }[] = []) => {
            if (prev.some(o => o.value === item.item_id)) return prev;
            return [...prev, { value: item.item_id, label: item.item_label as string }];
          });
        }
      }
    }

    if (field === "uom_id" || field === "item_id") {
      if (!item.item_id || !item.uom_id) {
        const balanced = rebalanceStockForItem(newData, item.item_id);
        setItemData(balanced);
        return;
      }
      // returnWarehouseStockByCustomer({ customer_id: values?.customer, item_id: item.item_id, quantity: "1", uom: item.uom_id }).then((res) => {
      //   if (res.error) {
      //     showSnackbar(res.data?.message || "Failed to fetch warehouse", "error");
      //     return;
      //   }
        
        // Update the state immediately with the stock status
      //   setItemData((prevData) => {
      //     const updatedData = [...prevData];
      //     const targetItem = updatedData[index];
      //     if (targetItem) {
      //       if (res.data.in_stock === false) {
      //         targetItem.availableInStock = "0";
      //         showSnackbar("Selected item is not in stock", "error");
      //       } else {
      //         targetItem.availableInStock = "1";
      //       }
      //     }
      //     return updatedData;
      //   });
      // });
    }

    if (field === "Expiry" || field === "Quantity" || (field === "uom_id" && item.Expiry)) {
      item.Total = (Number(item.Price) * Number(item.Quantity)).toString();
      if (!value) return;
      if (item.availableInStock === "0") return;
      if (!item.Quantity || !item.Expiry) return;
      if (field === "Expiry" && !isValidDate(new Date(value))) return;
      if (field === "Quantity" && Number(value) <= 0) return;

      setItemLoading((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), Batch: true },
      }));
      const res = await invoiceBatch({
        // customer_id: values?.customer,
        warehouse_id: values?.warehouse,
        item_id: item.item_id ?? "",
        uom: item.uom_id ?? "",
        quantity: item.Quantity ?? "",
        expiry_date: item.Expiry.toString() || ""
      });
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to fetch Batch", "error");
        setItemLoading((prev) => ({
          ...prev,
          [index]: { ...(prev[index] || {}), Batch: false },
        }));
      }
      item.Batchs = res.data?.map((batch: { batch_number: string; batch_expiry_date: string; quantity: number; item_price: number; }) => {
        // return { label: batch.batch_number + " (Stock: " + batch.quantity + ")", value: batch.batch_number, price: batch.item_price }
        return { label: batch.batch_number, value: batch.batch_number, price: batch.item_price }
      }) ?? [];
      item.SapId = (res.data?.[0] as BatchData | undefined)?.sap_id || "";
      item.Batch = (res.data?.[0] as BatchData | undefined)?.batch_number || "";
      item.Price = (res.data?.[0] as BatchData | undefined)?.item_price?.toString() || "0";
      item.Total = (Number(item.Price) * Number(item.Quantity)).toString();
      // item.Total = (Number(item.Price) * Number(item.Quantity)).toString();
      item.Vat = String(Number(item.Total) - Number(item.Total) / 1.18);
      item.Net = String(Number(item.Total) - Number(item.Vat));

      setItemLoading((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), Batch: false },
      }));

    }

    validateRow(index, newData[index]);
    const balanced = rebalanceStockForItem(newData, item.item_id);
    setItemData(balanced);
    const nonAffectedFields = ["item_id", "uom_id"];
    if(!nonAffectedFields.includes(field)) markTouched(index, field);
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        UOM: [],
        uom_id: "",
        Quantity: "1",
        Expiry: "",
        Batch: "",
        SapId: "",
        Type: "",
        Reason: "",
        Price: "",
        Total: "-",
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itemData.length <= 1) {
      setItemData([
        {
          item_id: "",
          UOM: [],
          uom_id: "",
          Quantity: "1",
          Expiry: "",
          SapId: "",
          Batch: "",
          Type: "",
          Reason: "",
          Price: "",
          Total: "-",
        }
      ]);
      setItemTouched({});
      return;
    }
    const newRows = itemData.filter((_, i) => i !== index);
    const balanced = rebalanceStockForItem(newRows);
    setItemData(balanced);
    setItemTouched({});
  };

  const resetTableData = () => {
    setItemData([
      {
        item_id: "",
        UOM: [],
        uom_id: "",
        Quantity: "1",
        Expiry: "",
        SapId: "",
        Batch: "",
        Type: "",
        Reason: "",
        Price: "",
        Total: "-",
      }
    ]);
  };

  // --- Compute totals for summary and payload
  const grossTotal = itemData.reduce(
    (sum, item) => sum + Number(item.Total || 0),
    0
  );
  const totalVat = itemData.reduce(
    (sum, item) => sum + Number(item.Vat || 0),
    0
  );
  const netAmount = itemData.reduce(
    (sum, item) => sum + Number(item.Net || 0),
    0
  );
  const totalExcise = itemData.reduce(
    (sum, item) => sum + Number(item.Excise || 0),
    0
  );
  const discount = itemData.reduce(
    (sum, item) => sum + Number(item.Discount || 0),
    0
  );
  const finalTotalValue = netAmount + totalVat + totalExcise;

  const keyValueData = [
    // { key: "Gross Total", value: `AED ${toInternationalNumber(grossTotal)}` },
    // { key: "Discount", value: `AED ${toInternationalNumber(discount)}` },
    { key: "Net Total", value: `${CURRENCY} ${toInternationalNumber(netAmount)}` },
    { key: "VAT", value: `${CURRENCY} ${toInternationalNumber(totalVat)}` },
    // { key: "Pre VAT", value: `AED ${toInternationalNumber(preVat)}` },
    // { key: "Delivery Charges", value: `AED ${toInternationalNumber(0.00)}` },
  ];

  const generatePayload = (values?: FormikValues) => {
    // Use the VAT formula from the order: vat = total - total / 1.18

    // Calculate total VAT and net for the payload
    let totalVat = 0;
    let totalNet = 0;
    const details = itemData.map((item) => {
      const total = Number(item.Total) || 0;
      const vat = +(total - total / 1.18).toFixed(2);
      const net = +(total - vat).toFixed(2);
      totalVat += vat;
      totalNet += net;
      // Ensure sap_id is a number or null, not an empty string
      let sapIdValue = (item as ItemData).SapId;
      if (sapIdValue === "" || sapIdValue === undefined) sapIdValue = "";
      else sapIdValue = Number(sapIdValue);
      return {
        item_id: Number(item.item_id) || null,
        item_price: Number(item.Price) || 0,
        quantity: Number(item.Quantity) || 0,
        uom_id: Number(item.uom_id) || null,
        vat,
        net_total: net,
        total,
        invoice_sap_id: sapIdValue,
        batch_number: (item as ItemData).Batch ?? "",
        expiry_date: (item as ItemData).Expiry ?? "",
        type: (item as ItemData).Type ?? "",
        reason: (item as ItemData).Reason ?? "",
      };
    });
    return {
      return_code: code,
      customer_id: Number(values?.customer) || null,
      turnman: values?.turnman || "",
      truck_no: values?.truckNo || "",
      contact_no: values?.contactNo || "",
      // return_no: values?.returnNo || "",
      warehouse_id: Number(values?.warehouse) || null,
      // driver_id: Number(values?.driver) || null,
      driver_id: null,
      total: finalTotal,
      vat: +totalVat.toFixed(2),
      net: +totalNet.toFixed(2),
      comment: values?.note || "",
      status: 1,
      details,
    };
  };

  const handleSubmit = async (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>) => {
    try {
      // validate item rows separately (they live in local state)
      const itemsSchema = Yup.array().of(itemRowSchema);
      // console.log("Validating rows", itemData);
      try {
        await itemsSchema.validate(itemData, { abortEarly: false });
      } catch (itemErr: any) {
        const rowErrors = mapItemRowErrors(itemErr);
        if (Object.keys(rowErrors).length > 0) {
          setItemErrors(rowErrors);
          // mark errored fields as touched so messages are visible after submit
          const touchedMap: Record<number, Record<string, boolean>> = {};
          Object.entries(rowErrors).forEach(([rowIdx, fields]) => {
            const idxNum = Number(rowIdx);
            touchedMap[idxNum] = Object.keys(fields).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {} as Record<string, boolean>);
          });
          setItemTouched(touchedMap);
        }
        formikHelpers.setErrors({ items: "Item rows validation failed" } as any);
        return;
      }

      formikHelpers.setSubmitting(true);
      const payload = generatePayload(values);
      // console.log("Submitting payload:", payload);
      const res = await returnCreate(payload);
      if (res.error) {
        showSnackbar(res.data.message || "Failed to create Return", "error");
        console.error("Create Return error:", res);
      } else {
        try {
          await saveFinalCode({
            reserved_code: code,
            model_name: "ht_return",
          });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
        showSnackbar("Return created successfully", "success");
        router.push("/return");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to submit return", "error");
    } finally {
      if (formikHelpers && typeof formikHelpers.setSubmitting === "function") {
        formikHelpers.setSubmitting(false);
      }
    }
  };



  const fetchAgentCustomers = async (values: FormikValues, search: string) => {
    const res = await companyCustomersGlobalSearch({
      warehouse_id: values.warehouse,
      query: search || "",
      per_page: "10"
    });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch customers", "error");
      setSkeleton({ ...skeleton, customer: false });
      return;
    }
    const data = res?.data || [];
    const options = data.map((customer: { id: number; osa_code: string; business_name: string }) => ({
      value: String(customer.id),
      label: customer.osa_code + " - " + customer.business_name
    }));
    setFilteredCustomerOptions(options);
    setSkeleton({ ...skeleton, customer: false });
    return options;
  }

  //   const fetchSalesTeams = async (values: FormikValues, search: string) => {
  //     const res = await SalesmanListGlobalSearch({
  //       warehouse_id: values.warehouse,
  //       query: search || "",
  //       per_page: "10"
  //     });
  //     if (res.error) {
  //       showSnackbar(res.data?.message || "Failed to fetch Sales Teams", "error");
  //       setSkeleton({ ...skeleton, salesteam: false });
  //       return;
  //     }
  //     const data = res?.data || [];
  //     const options = data.map((salesteam: { id: number; osa_code: string; name: string }) => ({
  //       value: String(salesteam.id),
  //       label: salesteam.osa_code + " - " + salesteam.name
  //     }));
  //     setFilteredSalesTeamOptions(options);
  //     setSkeleton({ ...skeleton, salesteam: false });
  //     return options;
  //   }

  // const fetchWarehouse = async (searchQuery?: string) => {
  //   const res = await warehouseListGlobalSearch({
  //     query: searchQuery || "",
  //     dropdown: "1",
  //     per_page: "50"
  //   });

  //   if (res.error) {
  //     showSnackbar(res.data?.message || "Failed to fetch Warehouse", "error");
  //     return;
  //   }
  //   const data = res?.data || [];
  //   const options = data.map((warehouse: { id: number; warehouse_code: string; warehouse_name: string }) => ({
  //     value: String(warehouse.id),
  //     label: warehouse.warehouse_code + " - " + warehouse.warehouse_name
  //   }));
  //   setFilteredWarehouseOptions(options);
  //   return options;
  // }

  // const fetchPrice = async (item_id: string, customer_id: string, warehouse_id?: string, route_id?: string) => {
  //   const res = await pricingHeaderGetItemPrice({ customer_id, item_id });
  //   if (res.error) {
  //     showSnackbar(res.data?.message || "Failed to fetch items", "error");
  //     setSkeleton({ ...skeleton, item: false });
  //     return;
  //   }
  //   const data = res?.data || [];
  //   return data;
  // };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
            Add Return
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Return</span>
            <span className="text-primary text-[14px] tracking-[8px]">#{code}</span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        <Formik<FormikValues>
          initialValues={form}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          enableReinitialize={true}
        >
          {({ values, touched, errors, setFieldValue, handleChange, submitForm, isSubmitting }: FormikProps<FormikValues>) => {
            // // Log Formik validation errors to console for easier debugging
            // useEffect(() => {
            //   if (errors && Object.keys(errors).length > 0) {
            //     console.warn("Formik validation errors:", errors);
            //   }
            //   console.log("Current Formik errors:", errors);
            //   console.log("Current Formik errors:", touched.comment);
            //   console.log(values, "values")
            // }, [errors]);

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-10">
                  <div>
                    <InputFields
                      required
                      label="Distributor"
                      name="warehouse"
                      placeholder="Search Distributor"
                      value={values.warehouse}
                      options={warehouseOptions}
                      searchable={true}
                      showSkeleton={warehouseOptions.length === 0}
                      onChange={(e) => {
                        if (values.warehouse !== e.target.value) {
                          setFieldValue("warehouse", e.target.value);
                          setSkeleton((prev) => ({ ...prev, customer: true }));
                          setFieldValue("customer", "");
                          handleWarehouseChange(e.target.value);
                        } else {
                          setFieldValue("warehouse", e.target.value);
                        }
                        resetTableData();
                      }}
                      error={touched.warehouse && (errors.warehouse as string)}
                    />
                  </div>
                  {/* <div>
                    <AutoSuggestion
                      required
                      label="Customer"
                      name="customer"
                      placeholder="Search customer"
                      onSearch={(q) => { return fetchAgentCustomers(values, q) }}
                      initialValue={filteredCustomerOptions.find(o => o.value === String(values?.customer))?.label || ""}
                      onSelect={async (opt) => {
                        if (values.customer !== opt.value) {
                          setFieldValue("customer", opt.value);
                          resetTableData();
                          setItemTouched({});
                        }
                      }}
                      onClear={() => {
                        setFieldValue("customer", "");
                        resetTableData();
                        setItemTouched({});
                      }}
                      // disabled={values.warehouse === ""}
                      error={touched.customer && (errors.customer as string)}
                      className="w-full"
                    />
                  </div> */}
                  <div>
                    <InputFields
                      required
                      label="Turnman"
                      type="text"
                      name="turnman"
                      value={values.turnman}
                      error={touched.turnman && (errors.turnman as string)}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Truck Number"
                      type="text"
                      name="truckNo"
                      value={values.truckNo}
                      error={touched.truckNo && (errors.truckNo as string)}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Contact Number"
                      type="contact2"
                      name="contactNo"
                      value={values.contactNo}
                      error={touched.contactNo && (errors.contactNo as string)}
                      onChange={handleChange}
                    />
                  </div>
                  {/* <div>
                    <InputFields
                      required
                      label="Delivery Date"
                      type="date"
                      name="delivery_date"
                      value={values.delivery_date}
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                      onChange={handleChange}
                    />
                  </div> */}
                </div>

                <Table
                  data={itemData.map((row, idx) => ({
                    ...row,
                    idx: idx.toString(),
                    UOM: Array.isArray(row.UOM) ? JSON.stringify(row.UOM) : "[]",
                    item_id: String(row.item_id ?? ""),
                    Quantity: String(row.Quantity ?? ""),
                    Price: String(row.Price ?? ""),
                    Excise: String(row.Excise ?? ""),
                    Discount: String(row.Discount ?? ""),
                    Net: String(row.Net ?? ""),
                    Vat: String(row.Vat ?? ""),
                    Total: String(row.Total ?? ""),
                    PreVat: String(row.PreVat ?? ""),
                  }))}
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
                                  recalculateItem(Number(row.idx), "item_id", e.target.value, values)
                                }}
                                showSkeleton={skeleton.item}
                                options={itemsOptions}
                                placeholder="Search item"
                                disabled={!values.warehouse}
                                error={err && err}
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
                          const touchedUom = itemTouched[idx]?.uom_id;
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
                                disabled={options.length === 0 || !row.item_id}
                                showSkeleton={Boolean(itemLoading[idx]?.uom)}
                                onChange={(e) => {
                                  recalculateItem(Number(row.idx), "uom_id", e.target.value, values)
                                  const price = options.find((uom: { value: string }) => String(uom.value) === e.target.value)?.price || "0.00";
                                  recalculateItem(Number(row.idx), "Price", price, values);
                                }}
                                error={touchedUom ? err : undefined}
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
                          const touchedQty = itemTouched[idx]?.Quantity;
                          return (
                            <div className="flex flex-col pt-5">
                              <InputFields
                                label=""
                                type="number"
                                name="Quantity"
                                min={0}
                                max={row.inStock}
                                integerOnly={true}
                                placeholder="Enter Qty"
                                value={row.Quantity}
                                disabled={!row.uom_id}
                                onChange={(e) => {
                                  const raw = (e.target as HTMLInputElement).value;
                                  const intPart = raw.split('.')[0];
                                  const sanitized = intPart === '' ? '' : String(Math.max(0, parseInt(intPart, 10) || 0));
                                  handleQuantityChange(idx, sanitized, values);
                                }}
                                error={touchedQty ? err : undefined}
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {row.inStock !== undefined && row.inStock !== null ? `In Stock: ${row.inStock}` : 'In Stock: -'}
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        key: "Expiry",
                        label: "Expiry",
                        width: 150,
                        render: (row) => {
                          const idx = Number(row.idx);
                          const err = itemErrors[idx]?.Expiry;
                          const touchedExpiry = itemTouched[idx]?.Expiry;
                          return (
                            <div>
                              <InputFields
                                label=""
                                type="date"
                                name="Expiry"
                                // integerOnly={true}
                                placeholder="Enter Expiry"
                                value={row.Expiry}
                                disabled={!row.uom_id}
                                onChange={(e) => {
                                  if (e.target.value && !isValidDate(new Date(e.target.value))) {
                                    return;
                                  }
                                  recalculateItem(Number(row.idx), "Expiry", e.target.value, values);
                                }}
                                // min={1}
                                integerOnly={true}
                                error={touchedExpiry ? err : undefined}
                              />
                            </div>
                          );
                        },
                      },
                      {
                        key: "Batch",
                        label: "Batch No",
                        width: 150,
                        render: (row) => {
                          const idx = Number(row.idx);
                          const loading = Boolean(itemLoading[idx]?.Batch);
                          const batchOptions = row.Batchs || [];
                          const batch = String(row.Batch ?? "");
                          const touchedBatch = itemTouched[idx]?.Batch;

                          if (loading) {
                            return <div className="flex justify-center items-center"><Icon className="text-gray-400 animate-spin" icon="mingcute:loading-fill" width={20} /></div>;
                          }
                          if(!batch){
                            return <span className="text-gray-400">-</span>;
                          }
                          return <>
                            <InputFields
                              label=""
                              type="text"
                              name="Batchs"
                              value={batch}
                              // disabled={!row.uom_id}
                              disabled={true}
                              options={batchOptions}
                              onChange={(e) => {
                                recalculateItem(Number(row.idx), "Batch", e.target.value);
                              }}
                              integerOnly={true}
                              width="w-[150px]"
                              error={touchedBatch ? itemErrors[idx]?.Batch : undefined}
                            />
                          </>;
                        }
                      },
                      {
                        key: "Type",
                        label: "Type",
                        width: 100,
                        render: (row) => {
                          const idx = Number(row.idx);
                          const type = String(row.Type ?? "");
                          const touchedType = itemTouched[idx]?.Type;
                          return <>
                            <InputFields
                              label=""
                              type="text"
                              name="Type"
                              // placeholder="Enter Type"
                              value={row.Type}
                              disabled={!row.uom_id}
                              options={[
                                { label: "Good", value: "good" },
                                { label: "Bad", value: "bad" }
                              ]}
                              onChange={(e) => {
                                recalculateItem(Number(row.idx), "Type", e.target.value);
                                // recalculateItem(Number(row.idx), "Reason", "");
                              }}
                              integerOnly={true}
                              width="w-[100px]"
                              error={touchedType ? itemErrors[idx]?.Type : undefined}
                            />
                          </>;
                        }
                      },
                      {
                        key: "Reason",
                        label: "Reason",
                        width: 150,
                        render: (row) => {
                          const idx = Number(row.idx);
                          const reason = String(row.Reason ?? "");
                          const touchedReason = itemTouched[idx]?.Reason;
                          return <>
                            <InputFields
                              label=""
                              type="text"
                              name="Reason"
                              // placeholder="Enter Reason"
                              value={reason}
                              disabled={!row.uom_id}
                              options={row.Type === "good" ? reasonObj.good : reasonObj.bad}
                              onChange={(e) => {
                                recalculateItem(Number(row.idx), "Reason", e.target.value);
                              }}
                              integerOnly={true}
                              width="w-[150px]"
                              error={touchedReason ? itemErrors[idx]?.Reason : undefined}
                            />
                          </>;
                        }
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
                          return <span>{toInternationalNumber(price)}</span>;
                        }
                      },
                      // { key: "excise", label: "Excise", render: (row) => <>{toInternationalNumber(row.Excise) || "0.00"}</> },
                      // { key: "discount", label: "Discount", render: (row) => <span>{toInternationalNumber(row.Discount) || "0.00"}</span> },
                      // { key: "preVat", label: "Pre VAT", render: (row) => <span>{toInternationalNumber(row.preVat) || "0.00"}</span> },
                      { key: "Net", label: "Net", render: (row) => <span>{toInternationalNumber(row.Net) || "0.00"}</span> },
                      { key: "Vat", label: "VAT", render: (row) => <span>{toInternationalNumber(row.Vat) || "0.00"}</span> },
                      // { key: "gross", label: "Gross", render: (row) => <span>{toInternationalNumber(row.gross) || "0.00"}</span> },
                      { key: "Total", label: "Total", render: (row) => <span>{toInternationalNumber(row.Total) || "0.00"}</span> },
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

                {/* --- Summary --- */}
                <div className="flex justify-between text-primary gap-0 mb-10">
                  <div className="flex justify-between flex-wrap w-full mt-[20px]">
                    <div className="flex flex-col justify-between gap-[20px] w-full lg:w-auto">
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
                      </div>
                      <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">
                        <InputFields
                          label="Note"
                          type="textarea"
                          name="note"
                          placeholder="Enter Note"
                          value={values.note}
                          onChange={handleChange}
                          error={touched.note && (errors.note as string)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-[10px] w-full lg:w-[350px]">
                      {keyValueData.map((item) => (
                        <Fragment key={item.key}>
                          <KeyValueData data={[item]} />
                          <hr className="text-[#D5D7DA]" />
                        </Fragment>
                      ))}
                      <div className="font-semibold text-[#181D27] text-[18px] flex justify-between">
                        <span>Total</span>
                        <span>{CURRENCY} {toInternationalNumber(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Buttons --- */}
                <hr className="text-[#D5D7DA]" />
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => router.push("/return")}
                  >
                    Cancel
                  </button>
                  <SidebarBtn
                    type="submit" isActive={true}
                    label={isSubmitting ? "Creating Return..." : "Create Return"}
                    disabled={isSubmitting || !values.turnman || !values.truckNo || !values.contactNo || !itemData || itemData.some(it => !it.item_id || !it.uom_id)}
                    onClick={() => submitForm()}
                  />
                </div>
              </>
            );
          }}
        </Formik>
      </ContainerCard>
    </div>
  );
}