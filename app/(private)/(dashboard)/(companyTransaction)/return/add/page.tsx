"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import AutoSuggestion from "@/app/components/autoSuggestion";
import { addAgentOrder } from "@/app/services/agentTransaction";
import { Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import getExcise from "@/app/(private)/utils/excise";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { agentCustomerGlobalSearch, companyCustomersGlobalSearch, genearateCode, itemGlobalSearch, saveFinalCode } from "@/app/services/allApi";
import { invoiceBatch, returnCreate, returnWarehouseStockByCustomer } from "@/app/services/companyTransaction";
import { isValidDate } from "@/app/utils/formatDate";

interface FormData {
  id: number,
  erp_code: string,
  item_code: string,
  name: string,
  description: string,
  item_uoms: {
    id: number,
    uom_id: number,
    item_id: number,
    uom_type: string,
    name: string,
    price: string,
    is_stock_keeping: boolean,
    upc: string,
    enable_for: string
  }[],
  pricing: {
    buom_ctn_price: string,
    auom_pc_price: string
  },
  brand: string,
  image: string,
  category: {
    id: number,
    name: string,
    code: string
  },
  itemSubCategory: {
    id: number,
    name: string,
    code: string
  },
  shelf_life: string,
  commodity_goods_code: string,
  excise_duty_code: string,
  status: number,
  is_taxable: boolean,
  has_excies: boolean,
  item_weight: string,
  volume: number
}

interface ItemData {
  item_id: string;
  item_name: string;
  item_label?: string;
  UOM: { label: string; value: string }[];
  uom_id?: string;
  Quantity: string;
  Price: string;
  Excise: string;
  Discount: string;
  Net: string;
  Vat: string;
  Total: string;
  Batchs?: { label: string; value: string; price: number }[];
  [key: string]: string | { label: string; value: string }[] | undefined;
}

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
    customer: Yup.string()
      .required("Customer is required"),
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
  const { warehouseAllOptions , ensureWarehouseAllLoaded} = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureWarehouseAllLoaded();
  }, [ensureWarehouseAllLoaded]);
  const form = {
    customer: "",
    note: "",
    delivery_date: new Date().toISOString().slice(0, 10),
  };

  const [orderData, setOrderData] = useState<FormData[]>([]);
  const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
  const [itemData, setItemData] = useState<ItemData[]>([
    {
      item_id: "",
      item_name: "",
      item_label: "",
      UOM: [],
      Quantity: "1",
      Price: "",
      Excise: "",
      Discount: "",
      Net: "",
      Vat: "",
      Total: "",
    },
  ]);

  // per-row validation errors for item rows (keyed by row index)
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});
  // per-row touched tracking so we only show errors after interaction
  const [itemTouched, setItemTouched] = useState<Record<number, Record<string, boolean>>>({});

  // per-row loading (for UOM / price) so UI can show skeletons while fetching
  const [itemLoading, setItemLoading] = useState<Record<number, { uom?: boolean; price?: boolean, Batch?: boolean }>>({});
  
  // Ref to track debounce timeouts for quantity changes per row
  const quantityDebounceRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Debounced function for quantity changes (triggers batch fetch)
  const handleQuantityChange = (index: number, value: string, values: FormikValues) => {
    setItemTouched((prev) => ({ ...prev, [index]: { ...(prev[index] || {}), Quantity: true } }));
    const newData = [...itemData];
    const item: ItemData = newData[index] as ItemData;
    (item as any)["Quantity"] = value;
    setItemData(newData);
    
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

  // Function for fetching Item
  const fetchItem = async (searchTerm: string, values?: FormikValues) => {
    const res = await itemGlobalSearch({ per_page: "10", query: searchTerm, warehouse: values?.warehouse || "" });
    if (res.error) {
      // showSnackbar(res.data?.message || "Failed to fetch items", "error");
      setSkeleton({ ...skeleton, item: false });
      return;
    }
    const data = res?.data || [];

    // sets the price directly in the item_uoms
    const updatedData = data.map((item: any) => {
      const item_uoms = item?.item_uoms ? item?.item_uoms?.map((uom: any) => {
        if (uom?.uom_type === "primary") {
          return { ...uom, price: item.pricing?.buom_ctn_price }
        } else if (uom?.uom_type === "secondary") {
          return { ...uom, price: item.pricing?.auom_pc_price }
        }
      }) : item?.item_uoms;
      return { ...item, item_uoms }
    })

    setOrderData(updatedData);
    const options = data.map((item: { id: number; name: string; code?: string; item_code?: string; erp_code?: string }) => ({
      value: String(item.id),
      label: (item.erp_code ?? item.item_code ?? item.code ?? "") + " - " + (item.name ?? "")
    }));
    // Merge newly fetched options with existing ones so previously selected items remain available
    setItemsOptions((prev: { label: string; value: string }[] = []) => {
      const map = new Map<string, { label: string; value: string }>();
      prev.forEach((o) => map.set(o.value, o));
      options.forEach((o: { label: string; value: string }) => map.set(o.value, o));
      return Array.from(map.values());
    });
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
    markTouched(index, field);
    const newData = [...itemData];
    const item: ItemData = newData[index] as ItemData;
    (item as any)[field] = value;
    validateRow(index, newData[index]);

    // If user selects an item, update UI immediately and persist a label so selection survives searches
    if (field === "item_id") {
      // set item_id to the chosen value
      item.item_id = value;
      if (!value) {
        // cleared selection
        item.item_name = "";
        item.UOM = [];
        item.uom_id = "";
        item.Price = "";
        item.Quantity = "1";
        item.item_label = "";
        item.Type = "";
        item.Reason = "";
        item.Expiry = "";
      } else {
        const selectedOrder = orderData.find((order: FormData) => order.id.toString() === value);
        // console.log(selectedOrder);
        item.item_id = selectedOrder ? String(selectedOrder.id || value) : value;
        item.item_name = selectedOrder?.name ?? "";
        item.UOM = selectedOrder?.item_uoms?.map(uom => ({ label: uom.name, value: uom.uom_id.toString(), price: uom.price })) || [];
        item.uom_id = selectedOrder?.item_uoms?.[0]?.uom_id ? String(selectedOrder.item_uoms[0].uom_id) : "";
        // item.Price = selectedOrder?.item_uoms?.[0]?.price ? String(selectedOrder.item_uoms[0].price) : "";
        item.Quantity = "1";
        item.Expiry = "";
        // const initialExc = getExcise({
        //   item: { ...selectedOrder, excies: 1 },
        //   uom: Number(item.uom_id) || 0,
        //   quantity: Number(item.Quantity) || 1,
        //   itemPrice: Number(item.Price) || null,
        //   orderType: 0,
        // });
        // const initialExcStr = (Math.round(initialExc * 100) / 100).toFixed(2);
        // item.Excise = initialExcStr;
        // console.log("Excise calculated:", item.Excise);
        const computedLabel = selectedOrder ? `${selectedOrder.item_code ?? selectedOrder.erp_code ?? ''}${selectedOrder.item_code || selectedOrder.erp_code ? ' - ' : ''}${selectedOrder.name ?? ''}` : "";
        item.item_label = computedLabel;
        if (item.item_label) {
          setItemsOptions((prev: { label: string; value: string }[] = []) => {
            if (prev.some(o => o.value === item.item_id)) return prev;
            return [...prev, { value: item.item_id, label: item.item_label as string }];
          });
        }
      }
    }

    if(field === "uom_id" || field === "item_id") {
      const res = await returnWarehouseStockByCustomer({ customer_id: values?.customer, item_id: item.item_id, quantity: "1", uom: item.uom_id });
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to fetch warehouse", "error");
        return;
      }
      if(res.data.in_stock === false){
        item.in_stock = "0";
        showSnackbar("Selected item is not in stock", "error");
        return;
      }
      item.in_stock = "1";
    }

    if (field === "Expiry" || field === "Quantity" || (field === "uom_id" && item.Expiry)) {
      if(!value) return;
      if(item.in_stock === "0") return;
      if(!item.Quantity || !item.Expiry) return;
      if(field === "Expiry" && !isValidDate(new Date(value))) return;
      if(field === "Quantity" && Number(value) <= 0) return;

      setItemLoading((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), Batch: true },
      }));
      const res = await invoiceBatch({
        customer_id: values?.customer,
        item_id: item.item_id ?? "",
        uom: item.uom_id ?? "",
        quantity: item.Quantity ?? "",
        expiry_date: item.Expiry.toString() || ""
      });
      if (res.error) {
        showSnackbar(res.data?.message || "Failed to fetch Batch", "error");
      }
      item.Batchs = res.data?.map((batch: { batch_number: string; batch_expiry_date: string; quantity: number; item_price: number; }) => {
        return { label: batch.batch_number + " (Stock: " + batch.quantity + ")", value: batch.batch_number, price: batch.item_price }
      }) ?? [];
      item.Batch = (res.data?.[0] as { batch_number: string; batch_expiry_date: string; quantity: number; item_price: number } | undefined)?.batch_number || "";
      setItemLoading((prev) => ({
        ...prev,
        [index]: { ...(prev[index] || {}), Batch: false },
      }));

    }

    if(field === "Batch") {
      const selectedBatch = item.Batchs?.find(b => b.value === value);
      if(selectedBatch) {
        item.Price = String(selectedBatch.price / 100);
        item.Total = (String((Number(item.Quantity) || 0) * selectedBatch.price/100)).toString();
        setFinalTotal(Number(item.Total));
      }
    }
    
    // const qty = Number(item.Quantity) || 0;
    // const price = Number(item.Price) || 0;
    // const total = qty * price;
    // const vat = total - total / 1.18;
    // const preVat = total - vat;
    // const net = total - vat;
    // compute excise: prefer the full item object from `orderData` (it contains category info)
    // const selectedOrder = orderData.find((od) => String(od.id) === String(item.item_id));
    // const exciseNumeric = getExcise({
    //   item: selectedOrder
    //     ? // normalize shape so `getExcise` can read `item_category` as a number
    //     ({
    //       ...selectedOrder,
    //       excies: 1,
    //       item_category: (selectedOrder as any).item_category?.id ?? (selectedOrder as any).category_id ?? (selectedOrder as any).category?.id ?? (selectedOrder as any).category ?? (selectedOrder as any).category_code ?? 0,
    //     } as any)
    //     : {
    //       id: Number(item.item_id) || 0,
    //       agent_excise: 0,
    //       direct_sell_excise: 0,
    //       base_uom_price: Number(item.Price) || 0,
    //       item_category: 0,
    //     },
    //   uom: Number(item.uom_id) || 0,
    //   quantity: Number(item.Quantity) || 1,
    //   itemPrice: Number(item.Price) || null,
    //   orderType: 0,
    // });
    // const excise = (Math.round(exciseNumeric * 100) / 100).toFixed(2);
    // // keep both `Excise` (existing row shape) and `excise` (table render key) in sync
    // item.Excise = excise;
    // console.log(item.Excise, (selectedOrder as any).item_category?.id);
    // const discount = 0;
    // const gross = total;

    // item.Total = total.toFixed(2);
    // item.Vat = vat.toFixed(2);
    // item.Net = net.toFixed(2);
    // item.preVat = preVat.toFixed(2);
    // item.Excise = excise.toFixed(2);
    // item.Discount = discount.toFixed(2);
    // item.gross = gross.toFixed(2);

    validateRow(index, newData[index]);
    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        item_name: "",
        item_label: "",
        UOM: [],
        uom_id: "",
        Quantity: "1",
        Price: "",
        Excise: "0.00",
        Discount: "0.00",
        Net: "0.00",
        Vat: "0.00",
        Total: "0.00",
      },
    ]);
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
          Excise: "",
          Discount: "",
          Net: "",
          Vat: "",
          Total: "",
        },
      ]);
      setItemTouched({});
      return;
    }
    const newRows = itemData.filter((_, i) => i !== index);
    setItemData(newRows);
    setItemTouched({});
  };

  // --- Compute totals for summary and payload
  // const computeTotals = () => {
  //   const grossTotal = itemData.reduce(
  //     (sum, item) => sum + Number(item.Total || 0),
  //     0
  //   );
  //   const totalVat = itemData.reduce(
  //     (sum, item) => sum + Number(item.Vat || 0),
  //     0
  //   );
  //   const netAmount = itemData.reduce(
  //     (sum, item) => sum + Number(item.Net || 0),
  //     0
  //   );
  //   const totalExcise = itemData.reduce(
  //     (sum, item) => sum + Number(item.Excise || 0),
  //     0
  //   );
  //   const discount = itemData.reduce(
  //     (sum, item) => sum + Number(item.Discount || 0),
  //     0
  //   );
  //   const finalTotalValue = netAmount + totalVat + totalExcise;

  //   return { grossTotal, totalVat, netAmount, totalExcise, discount, finalTotal: finalTotalValue };
  // };

  const generatePayload = (values?: FormikValues) => {
    // const { grossTotal, totalVat, netAmount, totalExcise, discount, finalTotal: computedFinalTotal } = computeTotals();

    return {
      order_code: code,
      customer_id: Number(values?.customer) || null,
      delivery_date: values?.delivery_date || form.delivery_date,
      turnman: values?.turnman || "",
      truck_no: values?.truckNo || "",
      contact_no: values?.contactNo || "",
      return_no: values?.returnNo || "",
      total: finalTotal,
      comment: values?.note || "",
      status: 1,
      details: itemData.map((item) => ({
        item_id: Number(item.item_id) || null,
        item_price: Number(item.Price) || 0,
        quantity: Number(item.Quantity) || 0,
        vat: Number(item.Vat) || 0,
        uom_id: Number(item.uom_id) || null,
        net_total: Number(item.Net) || 0,
        total: Number(item.Total) || 0,
        batch_number: (item as any).Batch ?? "",
        expiry_date: (item as any).Expiry ?? "",
        type: (item as any).Type ?? "",
        reason: (item as any).Reason ?? "",
      })),
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
        showSnackbar(res.data.message || "Failed to create purchase order", "error");
        console.error("Create Purchase order error:", res);
      } else {
        try {
          await saveFinalCode({
            reserved_code: code,
            model_name: "ht_return",
          });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
        showSnackbar("Order created successfully", "success");
        router.push("/purchaseOrder");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to submit order", "error");
    } finally {
      if (formikHelpers && typeof formikHelpers.setSubmitting === "function") {
        formikHelpers.setSubmitting(false);
      }
    }
  };

  const keyValueData = [
    // { key: "Gross Total", value: `AED ${toInternationalNumber(grossTotal)}` },
    // { key: "Discount", value: `AED ${toInternationalNumber(discount)}` },
    // { key: "Net Total", value: `${CURRENCY} ${toInternationalNumber(netAmount)}` },
    // { key: "VAT", value: `${CURRENCY} ${toInternationalNumber(totalVat)}` },
    // { key: "Excise", value: `${CURRENCY} ${toInternationalNumber(totalExcise)}` },
    // { key: "Pre VAT", value: `AED ${toInternationalNumber(preVat)}` },
    // { key: "Delivery Charges", value: `AED ${toInternationalNumber(0.00)}` },
  ];

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
                  {/* <div>
                    <InputFields
                      required
                      label="distributor"
                      name="warehouse"
                      placeholder="Search distributors."
                      value={values.warehouse}
                      options={warehouseAllOptions}
                      searchable={true}
                      onChange={(e) => {
                        setFieldValue("warehouse", e.target.value);
                      }}
                      showSkeleton={warehouseAllOptions.length === 0}
                      error={
                        touched.warehouse &&
                        (errors.warehouse as string)
                      }
                    />
                  </div> */}
                  <div>
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
                          setItemData([{ item_id: "", item_name: "", item_label: "", UOM: [], Quantity: "1", Price: "", Excise: "", Discount: "", Net: "", Vat: "", Total: "" }]);
                          setItemTouched({});
                        } 
                      }}
                      onClear={() => {
                        setFieldValue("customer", "");
                        setItemData([{ item_id: "", item_name: "", item_label: "", UOM: [], Quantity: "1", Price: "", Excise: "", Discount: "", Net: "", Vat: "", Total: "" }]);
                        setItemTouched({});
                      }}
                      // disabled={values.warehouse === ""}
                      error={touched.customer && (errors.customer as string)}
                      className="w-full"
                    />
                  </div>
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
                          const touchedItem = itemTouched[idx]?.item_id;
                          // Optimized: avoid mapping+filtering arrays on every render.
                          // Find the option for the current row (if still present) and fall back to stored label
                          // so the selection remains visible even when the option isn't returned by a search.
                          const matchedOption = itemsOptions.find((o) => o.value === row.item_id);
                          const initialLabel = matchedOption?.label ?? (row.item_label as string) ?? "";
                          // console.log(row);
                          return (
                            <div>
                              <AutoSuggestion
                                label=""
                                name={`item_id_${row.idx}`}
                                placeholder="Search item"
                                onSearch={(q) => fetchItem(q, values)}
                                initialValue={initialLabel}
                                onSelect={(opt) => {
                                  if (opt.value !== row.item_id) {
                                    recalculateItem(Number(row.idx), "item_id", opt.value, values);
                                  }
                                }}
                                onClear={() => {
                                  recalculateItem(Number(row.idx), "item_id", "", values);
                                }}
                                disabled={!values.customer}
                                error={touchedItem ? err : undefined}
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
                                disabled={options.length === 0 || !values.customer}
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
                            <div>
                              <InputFields
                                label=""
                                type="number"
                                name="Quantity"
                                // integerOnly={true}
                                placeholder="Enter Qty"
                                value={row.Quantity}
                                disabled={!row.uom_id || !values.customer || row.in_stock === "0"}
                                onChange={(e) => {
                                  const raw = (e.target as HTMLInputElement).value;
                                  const intPart = raw.split('.')[0];
                                  const sanitized = intPart === '' ? '' : String(Math.max(0, parseInt(intPart, 10) || 0));
                                  handleQuantityChange(idx, sanitized, values);
                                }}
                                min={1}
                                integerOnly={true}
                                error={touchedQty ? err : undefined}
                              />
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
                                disabled={!row.uom_id || !values.customer || row.in_stock === "0"}
                                onChange={(e) => {
                                  if(e.target.value && !isValidDate(new Date(e.target.value))) {
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
                          return <>
                            <InputFields
                              label=""
                              type="text"
                              name="Batchs"
                              // placeholder="Enter Type"
                              value={batch}
                              disabled={!row.uom_id || !values.customer || row.in_stock === "0"}
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
                              disabled={!row.uom_id || !values.customer || row.in_stock === "0"}
                              options={[
                                {label: "Good", value: "good"},
                                {label: "Bad", value: "bad"}
                              ]}
                              onChange={(e) => {
                                recalculateItem(Number(row.idx), "Type", e.target.value);
                                recalculateItem(Number(row.idx), "Reason", "");
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
                              value={row.Reason}
                              disabled={!row.uom_id || !values.customer || row.in_stock === "0"}
                              options={row.Type === "good" ? [
                                {label: "Short Expiry", value: "1"},
                                {label: "Non Moving", value: "2"},
                                {label: "Replacement", value: "3"},
                              ] : [
                                {label: "Damaged", value: "1"},
                                {label: "Quality Issue", value: "2"},
                                {label: "Expired", value: "3"},
                                {label: "Packing Issue", value: "4"},
                              ]}
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
                      // { key: "Net", label: "Net", render: (row) => <span>{toInternationalNumber(row.Net) || "0.00"}</span> },
                      // { key: "Vat", label: "VAT", render: (row) => <span>{toInternationalNumber(row.Vat) || "0.00"}</span> },
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
                      {/* {keyValueData.map((item) => (
                        <Fragment key={item.key}>
                          <KeyValueData data={[item]} />
                          <hr className="text-[#D5D7DA]" />
                        </Fragment>
                      ))} */}
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
                    disabled={isSubmitting || !values.customer || !values.turnman || !values.truckNo || !values.contactNo || !itemData || (itemData.length === 1 && !itemData[0].item_name)} 
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