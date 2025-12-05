"use client";

import React, { Fragment, useState, useEffect, useRef } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import AutoSuggestion from "@/app/components/autoSuggestion";
import {
  genearateCode,
  getAllActiveWarehouse,
  itemGlobalSearch,
  salesmanList,
  SalesmanListGlobalSearch,
  saveFinalCode,
  warehouseListGlobalSearch,
} from "@/app/services/allApi";
import {
  addAgentOrder,
  agentOrderList,
  createDelivery,
} from "@/app/services/agentTransaction";
import { Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import { toTitleCase } from "@/app/(private)/utils/text";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

interface FormData {
  id: number;
  erp_code: string;
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

interface OrderData {
  id: number;
  uuid: string;
  order_code: string;
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  warehouse_email: string;
  warehouse_number: string;
  warehouse_address: string;
  customer_id: string;
  customer_code: string;
  customer_name: string;
  customer_email: string;
  customer_street: string;
  customer_town: string;
  customer_contact: string;
  route_id: number;
  route_code: string;
  route_name: string;
  salesman_id: string;
  salesman_code: string;
  salesman_name: string;
  delivery_date: string;
  comment: string;
  status: number;
  created_at: string;
  details: {
    id: number;
    uuid: string;
    header_id: number;
    order_code: string;
    item_id: number;
    item_code: string;
    item_name: string;
    uom_id: number;
    uom_name: string;
    item_price: number;
    quantity: number;
    vat: number;
    discount: number;
    gross_total: number;
    net_total: number;
    total: number;
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
  }[];
}

interface ItemData {
  item_id: string;
  item_name: string;
  // stored human-readable label for a selected item (used when server results don't include it)
  item_label?: string;
  UOM: { label: string; value: string; price?: string }[];
  uom_id?: string;
  Quantity: string;
  Price: string;
  Excise: string;
  Discount: string;
  Net: string;
  Vat: string;
  Total: string;
  [key: string]:
    | string
    | { label: string; value: string; price?: string }[]
    | undefined;
}

export default function DeliveryAddEditPage() {
  const itemRowSchema = Yup.object({
    item_id: Yup.string().required("Please select an item"),
    uom_id: Yup.string().required("Please select a UOM"),
    Quantity: Yup.number()
      .typeError("Quantity must be a number")
      .min(1, "Quantity must be at least 1")
      .required("Quantity is required"),
  });

  const validationSchema = Yup.object({
    warehouse: Yup.string().required("Warehouse is required"),
    order_code: Yup.string().required("Delivery is required"),
    salesman_id: Yup.string().required("Salesteam is required"),
    note: Yup.string().max(1000, "Note is too long"),
    items: Yup.array().of(itemRowSchema),
  });

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const CURRENCY = localStorage.getItem("country") || "";
  const [skeleton, setSkeleton] = useState({
    route: false,
    order_code: false,
    item: false,
  });
  const [filteredDeliveryOptions, setFilteredDeliveryOptions] = useState<
    { label: string; value: string; order_code?: string }[]
  >([]);
  const [filteredWarehouseOptions, setFilteredWarehouseOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const form = {
    warehouse: "",
    route: "",
    order_code: "",
    note: "",
    delivery_date: new Date().toISOString().slice(0, 10),
  };

  const { warehouseAllOptions } = useAllDropdownListData();
  const [deliveryData, setDeliveryData] = useState<OrderData[]>([]);
  const [searchedItem, setSearchedItem] = useState<FormData[] | null>(null);
  const [itemsOptions, setItemsOptions] = useState<
    { label: string; value: string }[]
  >([]);
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
  const [itemErrors, setItemErrors] = useState<
    Record<number, Record<string, string>>
  >({});

  // per-row loading (for UOM / price) so UI can show skeletons while fetching
  const [itemLoading, setItemLoading] = useState<
    Record<number, { uom?: boolean; price?: boolean }>
  >({});
  const validateRow = async (
    index: number,
    row?: ItemData,
    options?: { skipUom?: boolean }
  ) => {
    const rowData = row ?? itemData[index];
    if (!rowData) return;
    // prepare data for Yup: convert numeric strings to numbers
    const toValidate = {
      item_id: String(rowData.item_id ?? ""),
      uom_id: String(rowData.uom_id ?? ""),
      Quantity: Number(rowData.Quantity) || 0,
      Price: Number(rowData.Price) || 0,
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
      setItemErrors((prev) => ({ ...prev, [index]: validationErrors }));
    }
  };

  // Function for fetching Item
  const fetchItem = async (searchTerm: string, values?: FormikValues) => {
    const res = await itemGlobalSearch({
      per_page: "10",
      query: searchTerm,
      warehouse: values?.warehouse || "",
    });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch items", "error");
      setSkeleton({ ...skeleton, item: false });
      return;
    }
    const data = res?.data || [];

    // sets the price directly in the item_uoms
    const updatedData = data.map((item: any) => {
      const item_uoms = item?.item_uoms
        ? item?.item_uoms?.map((uom: any) => {
            if (uom?.uom_type === "primary") {
              return { ...uom, price: item.pricing?.auom_pc_price };
            } else if (uom?.uom_type === "secondary") {
              return { ...uom, price: item.pricing?.buom_ctn_price };
            }
          })
        : item?.item_uoms;
      return { ...item, item_uoms };
    });

    // console.log(updatedData);

    setSearchedItem(updatedData);
    const options = data.map(
      (item: {
        id: number;
        name: string;
        code?: string;
        item_code?: string;
        erp_code?: string;
      }) => ({
        value: String(item.id),
        label:
          (item.erp_code ?? item.item_code ?? item.code ?? "") +
          " - " +
          (item.name ?? ""),
      })
    );
    // Merge newly fetched options with existing ones so previously selected items remain available
    setItemsOptions((prev: { label: string; value: string }[] = []) => {
      const map = new Map<string, { label: string; value: string }>();
      prev.forEach((o) => map.set(o.value, o));
      options.forEach((o: { label: string; value: string }) =>
        map.set(o.value, o)
      );
      return Array.from(map.values());
    });
    setSkeleton({ ...skeleton, item: false });
    return options;
  };

  const codeGeneratedRef = useRef(false);
  const [code, setCode] = useState("");
  const [orderCode, setOrderCode] = useState("");
  useEffect(() => {
    // generate code
    if (!codeGeneratedRef.current) {
      codeGeneratedRef.current = true;
      (async () => {
        const res = await genearateCode({
          model_name: "delivery",
        });
        if (res?.code) {
          setCode(res.code);
        }
        setLoading(false);
      })();
    }
  }, []);

  const recalculateItem = async (
    index: number,
    field: string,
    value: string,
    values?: FormikValues
  ) => {
    const newData = [...itemData];
    const item: ItemData = newData[index] as ItemData;
    (item as any)[field] = value;

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
      } else {
        const selectedOrder =
          searchedItem?.find((order: FormData) => String(order.id) === value) ??
          null;
        item.item_id = selectedOrder
          ? String(selectedOrder.id || value)
          : value;
        item.item_name = selectedOrder?.name ?? "";
        item.UOM =
          selectedOrder?.item_uoms?.map((uom) => ({
            label: uom.name,
            value: uom.id.toString(),
            price: uom.price,
          })) || [];
        item.uom_id = selectedOrder?.item_uoms?.[0]?.id
          ? String(selectedOrder.item_uoms[0].id)
          : "";
        item.Price = selectedOrder?.item_uoms?.[0]?.price
          ? String(selectedOrder.item_uoms[0].price)
          : "";
        item.Quantity = "1";
        // persist a readable label
        const computedLabel = selectedOrder
          ? `${selectedOrder.item_code ?? selectedOrder.erp_code ?? ""}${
              selectedOrder.item_code || selectedOrder.erp_code ? " - " : ""
            }${selectedOrder.name ?? ""}`
          : "";
        item.item_label = computedLabel;
        // ensure the selected item is available in itemsOptions
        if (item.item_label) {
          setItemsOptions((prev: { label: string; value: string }[] = []) => {
            if (prev.some((o) => o.value === item.item_id)) return prev;
            return [
              ...prev,
              { value: item.item_id, label: item.item_label as string },
            ];
          });
        }
      }
    }
    const qty = Number(item.Quantity) || 0;
    const price = Number(item.Price) || 0;
    const total = qty * price;
    const vat = total - total / 1.18;
    const preVat = total - vat;
    const net = total - vat;
    // const excise = 0;
    // const discount = 0;
    // const gross = total;

    item.Total = total.toFixed(2);
    item.Vat = vat.toFixed(2);
    item.Net = net.toFixed(2);
    item.preVat = preVat.toFixed(2);
    // item.Excise = excise.toFixed(2);
    // item.Discount = discount.toFixed(2);
    // item.gross = gross.toFixed(2);

    if (field !== "item_id") {
      validateRow(index, newData[index]);
    }
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
      return;
    }
    setItemData(itemData.filter((_, i) => i !== index));
  };

  // --- Compute totals for summary
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
  const preVat = totalVat ? grossTotal - totalVat : grossTotal;
  const discount = itemData.reduce(
    (sum, item) => sum + Number(item.Discount || 0),
    0
  );
  const finalTotal = netAmount + totalVat;

  const generatePayload = (values?: FormikValues) => {
    return {
      delivery_code: code,
      order_code: filteredDeliveryOptions.find(option => option.value === values?.order_code)?.order_code || null,
      warehouse_id: Number(values?.warehouse) || null,
      customer_id: Number(values?.customer_id) || null,
      delivery_date: values?.delivery_date || form.delivery_date,
      salesman_id: Number(values?.salesman_id) || null,
      // gross_total: Number(grossTotal.toFixed(2)),
      vat: Number(totalVat.toFixed(2)),
      net_amount: Number(netAmount.toFixed(2)),
      total: Number(finalTotal.toFixed(2)),
      // discount: Number(discount.toFixed(2)),
      comment: values?.note || "",
      status: 1,
      details: itemData.map((item, i) => ({
        item_id: Number(item.item_id) || null,
        item_price: Number(item.Price) || null,
        quantity: Number(item.Quantity) || null,
        vat: Number(item.Vat) || null,
        uom_id: Number(item.uom_id) || null,
        // discount: Number(item.Discount) || null,
        // discount_id: 0,
        // gross_total: Number(item.Total) || null,
        net_total: Number(item.Net) || null,
        total: Number(item.Total) || null,
      })),
    };
  };

  const handleSubmit = async (
    values: FormikValues,
    formikHelpers: FormikHelpers<FormikValues>
  ) => {
    try {
      // validate item rows separately (they live in local state)
      const itemsSchema = Yup.array().of(itemRowSchema);
      try {
        await itemsSchema.validate(itemData, { abortEarly: false });
      } catch (itemErr: any) {
        // log detailed item validation errors and surface a friendly message
        console.error("Item validation errors:", itemErr.inner || itemErr);
        showSnackbar(
          itemErr.inner.map((err: any) => err.message).join(", "),
          "error"
        );
        // set a top-level form error to prevent submission
        formikHelpers.setErrors({
          items: "Item rows validation failed",
        } as any);
        return;
      }

      formikHelpers.setSubmitting(true);
      const payload = generatePayload(values);
      // console.log(payload)
      // console.log("Submitting payload:", payload);
      const res = await createDelivery(payload);
      if (res.error) {
        showSnackbar(res.data.message || "Failed to create Delivery", "error");
        console.error("Create Delivery error:", res);
      } else {
        try {
          await saveFinalCode({
            reserved_code: code,
            model_name: "delivery",
          });
        } catch (e) {
          // Optionally handle error, but don't block success
        }
        showSnackbar("Delivery created successfully", "success");
        router.push("/distributorsDelivery");
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
    {
      key: "Net Total",
      value: `${CURRENCY} ${toInternationalNumber(netAmount)}`,
    },
    { key: "VAT", value: `${CURRENCY} ${toInternationalNumber(totalVat)}` },
    // { key: "Pre VAT", value: `${CURRENCY} ${toInternationalNumber(preVat)}` },
    // { key: "Delivery Charges", value: `AED ${toInternationalNumber(0.00)}` },
  ];

  const fetchAgentDeliveries = async (values: FormikValues, search: string) => {
    setSkeleton({ ...skeleton, order_code: true });
    const res = await agentOrderList({
      warehouse_id: values.warehouse,
      delivery_date: values.delivery_date,
      query: search || "",
      no_delivery: "true",
      per_page: "10",
    });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch Deliveries", "error");
      setSkeleton({ ...skeleton, order_code: false });
      return;
    }
    const data = res?.data || [];
    const options = data.map(
      (delivery: {
        id: number;
        osa_code: string;
        customer_name: string;
        customer_code: string;
        order_code: string;
      }) => {
        const capitalizedCustomerName = toTitleCase(
          String(delivery.customer_name || "")
        );
        return {
          value: String(delivery.id),
          label: `${delivery.order_code ? delivery.order_code : ""} (${
            delivery.customer_code ? delivery.customer_code : ""
          } - ${capitalizedCustomerName})`,
          order_code: delivery.order_code,
        };
      }
    );
    setFilteredDeliveryOptions(options);
    setDeliveryData(data);
    setSkeleton({ ...skeleton, order_code: false });
    return options;
  };

  const fetchWarehouse = async (searchQuery?: string) => {
    const res = await getAllActiveWarehouse({
      search: searchQuery || "",
      dropdown: "1",
      status: "1",
      per_page: "50",
    });

    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch Warehouses", "error");
      return;
    }
    const data = res?.data || [];
    const options = data.map(
      (warehouse: {
        id: number;
        warehouse_code: string;
        warehouse_name: string;
      }) => ({
        value: String(warehouse.id),
        label: warehouse.warehouse_code + " - " + warehouse.warehouse_name,
      })
    );
    setFilteredWarehouseOptions(options);
    return options;
  };

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
    <div
      className="
        flex flex-col
      "
    >
      <div
        className="
          flex
          mb-[20px]
          justify-between items-center
        "
      >
        <div
          className="
            flex
            items-center gap-[16px]
          "
        >
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
            className="cursor-pointer"
          />
          <h1
            className="
              flex
              text-[20px] font-semibold text-[#181D27] leading-[30px]
              items-center
            "
          >
            Add Delivery
          </h1>
        </div>
      </div>

      <ContainerCard
        className="
          rounded-[10px]
          scrollbar-none
        "
      >
        {/* --- Header Section --- */}
        <div
          className="
            flex flex-wrap
            mb-10
            justify-between gap-[20px]
          "
        >
          <div
            className="
              flex flex-col
              gap-[10px]
            "
          >
            <Logo type="full" />
          </div>
          <div
            className="
              flex flex-col
              items-end
            "
          >
            <span
              className="
                mb-[10px]
                text-[42px] text-[#A4A7AE]
                uppercase
              "
            >
              Delivery
            </span>
            <span
              className="
                text-primary text-[14px] tracking-[8px]
              "
            >
              #{code}
            </span>
          </div>
        </div>
        <hr
          className="
            w-full
            text-[#D5D7DA]
          "
        />

        <Formik<FormikValues>
          initialValues={form}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          enableReinitialize={true}
        >
          {({
            values,
            touched,
            errors,
            setFieldValue,
            handleChange,
            submitForm,
            isSubmitting,
          }: FormikProps<FormikValues>) => {
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
                <div
                  className="
                    grid grid-cols-1
                    mt-6 mb-10
                    gap-6
                    md:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  <div>
                    <InputFields
                      required
                      label="Distributor"
                      name="warehouse"
                      placeholder="Search Distributor"
                      value={values.warehouse}
                      options={warehouseAllOptions}
                      showSkeleton={warehouseAllOptions.length === 0}
                      searchable={true}
                      onChange={(e) => {
                        if (values.warehouse !== e.target.value) {
                          setFieldValue("warehouse", e.target.value);
                          setFieldValue("order_code", "");
                          setFieldValue("salesman_id", "");
                          setItemData([{
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
                          }]);
                          setSkeleton((prev) => ({ ...prev, order_code: true }));
                          (async () => {
                            await fetchAgentDeliveries(
                              { ...values, warehouse: e.target.value },
                              ""
                            );
                          })();
                        } else {
                          setFieldValue("warehouse", e.target.value);
                        }
                      }}
                      error={touched.warehouse && (errors.warehouse as string)}
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Delivery Date"
                      type="date"
                      name="delivery_date"
                      value={
                        values.delivery_date ||
                        new Date(Date.now() - 24 * 60 * 60 * 1000)
                          .toISOString()
                          .slice(0, 10)
                      }
                      min={new Date().toISOString().slice(0, 10)} // today
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue("order_code", "");
                        setFieldValue("salesman_id", "");
                        setItemData([{
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
                        }]);
                        (async () => {
                          await fetchAgentDeliveries(
                            { ...values, delivery_date: e.target.value },
                            ""
                          );
                        })();
                      }}
                    />
                  </div>

                  <div>
                    <InputFields
                      required
                      label="Delivery"
                      name="order_code"
                      value={values.order_code}
                      options={filteredDeliveryOptions}
                      searchable={true}
                      placeholder="Select delivery"
                      onChange={(e) => {
                        const val = (e.target as HTMLSelectElement).value;
                        if (values.order_code !== val) {
                          setFieldValue("order_code", val);
                          setFieldValue("salesman_id", "");
                          const currentDelivery = deliveryData.find(
                            (o) => String(o.id) === val
                          );
                          setFieldValue(
                            "customer_id",
                            currentDelivery?.customer_id || ""
                          );
                          const details = currentDelivery?.details ?? [];
                          const mapped = details.map((d) => {
                            const qty = Number(d.quantity || 0);
                            const price = Number(d.item_price || 0);
                            const computedTotal =
                              d.total != null ? Number(d.total) : qty * price;
                            const computedVat =
                              d.vat != null ? Number(d.vat) : 0;
                            const preVat = computedTotal - computedVat;
                            return {
                              item_id: String(d.item_id ?? ""),
                              item_name: d.item_name ?? "",
                              item_label: `${d.item_code ?? ""}${
                                d.item_code ? " - " : ""
                              }${d.item_name ?? ""}`,
                              UOM: d.item_uoms
                                ? d.item_uoms.map((uom: any) => ({
                                    label: uom.name ?? "",
                                    value: String(uom.id),
                                    price: String(uom.price ?? ""),
                                  }))
                                : [],
                              uom_id: d.uom_id ? String(d.uom_id) : "",
                              Quantity: String(d.quantity ?? "1"),
                              Price:
                                d.item_price != null
                                  ? String(d.item_price)
                                  : "",
                              Excise: String((d as any).excise ?? "0.00"),
                              Discount: String(d.discount ?? "0.00"),
                              Net: String(
                                d.net_total ??
                                  d.net_total ??
                                  computedTotal - computedVat
                              ),
                              Vat: String(
                                computedVat.toFixed
                                  ? computedVat.toFixed(2)
                                  : String(computedVat)
                              ),
                              Total: String(
                                computedTotal.toFixed
                                  ? computedTotal.toFixed(2)
                                  : String(computedTotal)
                              ),
                              preVat: String(
                                preVat.toFixed
                                  ? preVat.toFixed(2)
                                  : String(preVat)
                              ),
                            } as ItemData;
                          });
                          setItemData(
                            mapped.length
                              ? mapped
                              : [
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
                                ]
                          );
                        }
                      }}
                      // onClear={() => {
                      //   setFieldValue("delivery", "");
                      //   setItemData([{ item_id: "", item_name: "", item_label: "", UOM: [], Quantity: "1", Price: "", Excise: "", Discount: "", Net: "", Vat: "", Total: "" }]);
                      // }}
                      disabled={!values.warehouse || !values.delivery_date}
                      showSkeleton={skeleton.order_code}
                      error={touched.order_code && (errors.order_code as string)}
                    />
                  </div>

                  <div>
                    <AutoSuggestion
                      required
                      label="Sales Team"
                      name="salesman_id"
                      placeholder="Search Sales Team"
                      disabled={!values.order_code}
                      selectedOption={values.salesman_id ? undefined : null}
                      onSearch={async (q) => {
                        const res = await SalesmanListGlobalSearch({
                          query: q,
                          per_page: "10",
                        });
                        const options = res.error
                          ? []
                          : (res.data || []).map((item: any) => ({
                              value: item.id,
                              label: item.osa_code + " - " + item.name,
                            }));
                        return options;
                      }}
                      // selectedOption={}
                      onSelect={(opt) => {
                        setFieldValue("salesman_id", opt.value);

                      }}
                      onClear={() => {
                        setFieldValue("salesman_id", "");
                      }}
                      error={touched.salesman_id && (errors.salesman_id as string)}
                    />
                  </div>
                </div>

                <Table
                  data={itemData.map((row, idx) => ({
                    ...row,
                    idx: idx.toString(),
                    UOM: Array.isArray(row.UOM)
                      ? JSON.stringify(row.UOM)
                      : "[]",
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
                          // Optimized: avoid mapping+filtering arrays on every render.
                          // Find the option for the current row (if still present) and fall back to stored label
                          // so the selection remains visible even when the option isn't returned by a search.
                          const matchedOption = itemsOptions.find(
                            (o) => o.value === row.item_id
                          );
                          const fallbackOption = row.item_label
                            ? { value: row.item_id, label: row.item_label }
                            : undefined;
                          const selectedOpt = matchedOption ?? fallbackOption;
                          const initialLabel = selectedOpt?.label ?? "";
                          // console.log(row);
                          return (
                            <div>
                              <AutoSuggestion
                                label=""
                                name={`item_id_${row.idx}`}
                                placeholder="Search item"
                                onSearch={(q) => fetchItem(q, values)}
                                initialValue={initialLabel}
                                selectedOption={selectedOpt ?? null}
                                onSelect={(opt) => {
                                  if (opt.value !== row.item_id) {
                                    recalculateItem(
                                      Number(row.idx),
                                      "item_id",
                                      opt.value
                                    );
                                  }
                                }}
                                onClear={() => {
                                  recalculateItem(
                                    Number(row.idx),
                                    "item_id",
                                    ""
                                  );
                                }}
                                disabled={!values.order_code}
                                error={err && err}
                                className="
                                  w-full
                                "
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
                                disabled={
                                  options.length === 0 || !values.order_code
                                }
                                showSkeleton={Boolean(itemLoading[idx]?.uom)}
                                onChange={(e) => {
                                  recalculateItem(
                                    Number(row.idx),
                                    "uom_id",
                                    e.target.value
                                  );
                                  const price =
                                    options.find(
                                      (uom: { value: string }) =>
                                        String(uom.value) === e.target.value
                                    )?.price || "0.00";
                                  recalculateItem(
                                    Number(row.idx),
                                    "Price",
                                    price
                                  );
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
                          return (
                            <div>
                              <InputFields
                                label=""
                                type="number"
                                name="Quantity"
                                // integerOnly={true}
                                placeholder="Enter Qty"
                                value={row.Quantity}
                                disabled={!row.uom_id || !values.order_code}
                                onChange={(e) => {
                                  const raw = (e.target as HTMLInputElement)
                                    .value;
                                  const intPart = raw.split(".")[0];
                                  const sanitized =
                                    intPart === ""
                                      ? ""
                                      : String(
                                          Math.max(
                                            0,
                                            parseInt(intPart, 10) || 0
                                          )
                                        );
                                  recalculateItem(
                                    Number(row.idx),
                                    "Quantity",
                                    sanitized
                                  );
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
                        key: "Price",
                        label: "Price",
                        render: (row) => {
                          const idx = Number(row.idx);
                          const loading = Boolean(itemLoading[idx]?.price);
                          const price = String(row.Price ?? "");
                          if (loading) {
                            return (
                              <span
                                className="
                                  text-gray-400
                                  animate-pulse
                                "
                              >
                                Loading...
                              </span>
                            );
                          }
                          if (
                            !price ||
                            price === "" ||
                            price === "0" ||
                            price === "-"
                          ) {
                            return (
                              <span
                                className="
                                  text-gray-400
                                "
                              >
                                -
                              </span>
                            );
                          }
                          return <span>{toInternationalNumber(price)}</span>;
                        },
                      },
                      // { key: "excise", label: "Excise", render: (row) => <span>{toInternationalNumber(row.Excise) || "0.00"}</span> },
                      // { key: "discount", label: "Discount", render: (row) => <span>{toInternationalNumber(row.Discount) || "0.00"}</span> },
                      // { key: "preVat", label: "Pre VAT", render: (row) => <span>{toInternationalNumber(row.preVat) || "0.00"}</span> },
                      {
                        key: "Net",
                        label: "Net",
                        render: (row) => (
                          <span>
                            {toInternationalNumber(row.Net) || "0.00"}
                          </span>
                        ),
                      },
                      {
                        key: "Vat",
                        label: "VAT",
                        render: (row) => (
                          <span>
                            {toInternationalNumber(row.Vat) || "0.00"}
                          </span>
                        ),
                      },
                      // { key: "gross", label: "Gross", render: (row) => <span>{toInternationalNumber(row.gross) || "0.00"}</span> },
                      {
                        key: "Total",
                        label: "Total",
                        render: (row) => (
                          <span>
                            {toInternationalNumber(row.Total) || "0.00"}
                          </span>
                        ),
                      },
                      {
                        key: "action",
                        label: "Action",
                        render: (row) => (
                          <button
                            type="button"
                            onClick={() =>
                              itemData.length > 1 &&
                              handleRemoveItem(Number(row.idx))
                            }
                            className={`
                              flex
                              text-red-500
                              items-center
                              ${
                                itemData.length <= 1
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
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
                <div
                  className="
                    flex
                    mb-10
                    text-primary
                    justify-between gap-0
                  "
                >
                  <div
                    className="
                      flex flex-wrap
                      w-full
                      mt-[20px]
                      justify-between
                    "
                  >
                    <div
                      className="
                        flex flex-col
                        w-full
                        justify-start gap-[20px]
                        lg:w-auto
                      "
                    >
                      <div
                        className="
                          mt-4
                        "
                      >
                        {(() => {
                          // disable add when there's already an empty/new item row
                          const hasEmptyRow = itemData.some(
                            (it) =>
                              String(it.item_id ?? "").trim() === "" &&
                              String(it.uom_id ?? "").trim() === ""
                          );
                          return (
                            <button
                              type="button"
                              disabled={hasEmptyRow}
                              onClick={() => {
                                if (!hasEmptyRow) handleAddNewItem();
                              }}
                              className={`
                                flex
                                text-[#E53935] font-medium text-[16px]
                                items-center gap-2
                                ${
                                  hasEmptyRow
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                              `}
                            >
                              <Icon
                                icon="material-symbols:add-circle-outline"
                                width={20}
                              />
                              Add New Item
                            </button>
                          );
                        })()}
                      </div>
                      {/* <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">
                        <InputFields
                          label="Note"
                          type="textarea"
                          name="note"
                          placeholder="Enter Note"
                          value={values.note}
                          onChange={handleChange}
                          error={touched.note && (errors.note as string)}
                        />
                      </div> */}
                    </div>

                    <div
                      className="
                        flex flex-col
                        w-full
                        gap-[10px]
                        lg:w-[350px]
                      "
                    >
                      {keyValueData.map((item) => (
                        <Fragment key={item.key}>
                          <KeyValueData data={[item]} />
                          <hr
                            className="
                              text-[#D5D7DA]
                            "
                          />
                        </Fragment>
                      ))}
                      <div
                        className="
                          flex
                          font-semibold text-[#181D27] text-[18px]
                          justify-between
                        "
                      >
                        <span>Total</span>
                        <span>
                          {CURRENCY} {toInternationalNumber(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Buttons --- */}
                <hr
                  className="
                    text-[#D5D7DA]
                  "
                />
                <div
                  className="
                    flex
                    mt-6
                    justify-end gap-4
                  "
                >
                  <button
                    type="button"
                    onClick={() => router.push("/distributorsDelivery")}
                    className="
                      px-6 py-2
                      text-gray-700
                      rounded-lg border border-gray-300
                      hover:bg-gray-100
                    "
                  >
                    Cancel
                  </button>
                  <SidebarBtn
                    type="submit"
                    isActive={true}
                    label={
                      isSubmitting ? "Creating Delivery..." : "Create Delivery"
                    }
                    disabled={
                      isSubmitting ||
                      !values.warehouse ||
                      !values.delivery_date ||
                      !values.order_code ||
                      !values.salesman_id ||
                      !itemData ||
                      itemData.some((item) => !item.item_id)
                    }
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
