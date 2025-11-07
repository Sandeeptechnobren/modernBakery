"use client";

import React, { Fragment, ChangeEvent, useState, useEffect } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { agentCustomerList, getCompanyCustomers, itemList, pricingHeaderGetItemPrice, routeList, warehouseList, warehouseListGlobalSearch } from "@/app/services/allApi";
import { Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "@/app/services/snackbarContext";

interface FormData {
  id: number,
  erp_code: string,
  item_code: string,
  name: string,
  description: string,
  uom: {
    id: number,
    item_id: number,
    uom_type: string,
    name: string,
    price: string,
    is_stock_keeping: boolean,
    upc: string,
    enable_for: string
  }[],
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
  itemName: string;
  UOM: { label: string; value: string }[];
  uom_id?: string;
  Quantity: string;
  Price: string;
  Excise: string;
  Discount: string;
  Net: string;
  Vat: string;
  Total: string;
  [key: string]: string | { label: string; value: string }[] | undefined;
}

export default function OrderAddEditPage() {
  const itemRowSchema = Yup.object({
    item_id: Yup.string().required("Please select an item"),
    uom_id: Yup.string().required("Please select a UOM"),
    Quantity: Yup.number()
      .typeError("Quantity must be a number")
      .min(1, "Quantity must be at least 1")
      .required("Quantity is required"),
    Price: Yup.number()
      .typeError("Price must be a number")
      .min(0, "Price must be >= 0")
      .required("Price is required"),
  });

  const validationSchema = Yup.object({
    warehouse: Yup.string().required("Warehouse is required"),
    route: Yup.string().required("Route is required"),
    customer: Yup.string().required("Customer is required"),
    delivery_date: Yup.string()
      .required("Delivery date is required")
      .test("is-date", "Delivery date must be a valid date", (val) => {
        return Boolean(val && !Number.isNaN(new Date(val).getTime()));
      }),
    note: Yup.string().max(1000, "Note is too long"),
    items: Yup.array().of(itemRowSchema),
  });

  const { warehouseOptions, agentCustomerOptions, routeOptions } = useAllDropdownListData();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [skeleton, setSkeleton] = useState({
    route: false,
    customer: false,
    item: false,
  });
  const [filteredRouteOptions, setFilteredRouteOptions] = useState<{ label: string; value: string }[]>([]);
  const [filteredCustomerOptions, setFilteredCustomerOptions] = useState<{ label: string; value: string }[]>([]);
  const [filteredWarehouseOptions, setFilteredWarehouseOptions] = useState<{ label: string; value: string }[]>([]);
  const [form, setForm] = useState({
    warehouse: "",
    route: "",
    customer: "",
    note: "",
    delivery_date: new Date().toISOString().slice(0, 10),
  });

  const [orderData, setOrderData] = useState<FormData[]>([]);
  const [itemsOptions, setItemsOptions] = useState<{ label: string; value: string }[]>([]);
  const [itemData, setItemData] = useState<ItemData[]>([
    {
      item_id: "",
      itemName: "",
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

  const fetchItem = async (searchTerm: string) => {
    const res = await itemList({ per_page: "10", name: searchTerm });
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
  };

  useEffect(() => {
    setSkeleton({ ...skeleton, item: true });
    fetchItem("");
  }, []);

  const recalculateItem = async (index: number, field: string, value: string, values?: FormikValues) => {
    const newData = [...itemData];
    const item: ItemData = newData[index];
    (item as any)[field] = value;
    const qty = Number(item.Quantity) || 0;
    // const price = orderData.find((order: FormData) => order.id.toString() === item.item_id)?.find(uom => uom.id.toString() === item.uom_id)?.price ? Number(orderData.find((order: FormData) => order.id.toString() === item.item_id)?.uom?.find(uom => uom.id.toString() === item.uom_id)?.price) : Number(item.Price) || 0;
    let price = Number(item.Price) || 0;
    if (field === "itemName") {
      try {
        const customerId = values?.customer || "";
        const warehouseId = values?.warehouse || "";
        const routeId = values?.route || "";
        const res = await fetchPrice(item.itemName, customerId, warehouseId, routeId);
        if (Array.isArray(res)) {
          const first = (res as any)[0] || {};
          price = Number(first.ctn_price ?? first.price ?? price) || price;
        } else if (res && typeof res === "object") {
          price = Number((res as any).ctn_price ?? (res as any).price ?? price) || price;
        }
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    }

    const total = qty * price;
    const vat = total * 0.18;
    const net = total - vat;

    item.Price = price.toFixed(2);
    item.Total = total.toFixed(2);
    item.Vat = vat.toFixed(2);
    item.Net = net.toFixed(2);
    item.UOM = orderData.find((order: FormData) => order.id.toString() === item.itemName)?.uom?.map(uom => ({ label: uom.name, value: uom.id.toString() })) || [];

    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        itemName: "",
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
          itemName: "",
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
  const discount = itemData.reduce(
    (sum, item) => sum + Number(item.Discount || 0),
    0
  );
  const finalTotal = grossTotal + totalVat;

  const generatePayload = () => {
    return {
      currency: "UGX",
      country_id: 59,
      order_code: "ORD-2025-001",
      warehouse_id: Number(form.warehouse) || 116,
      route_id: Number(form.route) || 60,
      customer_id: Number(form.customer) || 75,
      salesman_id: 133,
      delivery_date: form.delivery_date,
      gross_total: Number(grossTotal.toFixed(2)),
      vat: Number(totalVat.toFixed(2)),
      net_amount: Number(netAmount.toFixed(2)),
      total: Number(finalTotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      details: itemData.map((item, i) => ({
        item_id: Number(item.item_id) || 135,
        item_price: Number(item.Price) || 0,
        quantity: Number(item.Quantity) || 0,
        vat: Number(item.Vat) || 0,
        uom_id: Number(item.uom_id) || 80,
        discount: Number(item.Discount) || 0,
        discount_id: 0,
        gross_total: Number(item.Total) || 0,
        net_total: Number(item.Net) || 0,
        total: Number(item.Total) || 0,
        is_promotional: false,
        parent_id: 1,
        promotion_id: 28,
      })),
    };
  };

  const handleSubmit = async (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>) => {
    try {
      const payload = generatePayload();
      console.log("Final Payload:", payload);
      showSnackbar("Payload logged in console!", "success");
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
    { key: "Gross Total", value: `AED ${grossTotal.toFixed(2)}` },
    { key: "Discount", value: `AED ${discount.toFixed(2)}` },
    { key: "Net Total", value: `AED ${netAmount.toFixed(2)}` },
    { key: "VAT", value: `AED ${totalVat.toFixed(2)}` },
    { key: "Delivery Charges", value: "AED 0.00" },
  ];

  // const fetchRoutes = async (value: string) => {
  //   setSkeleton({ ...skeleton, route: true });
  //   const filteredOptions = await routeList({
  //     warehouse_id: value,
  //     per_page: "10",
  //   });
  //   if (filteredOptions.error) {
  //     showSnackbar(filteredOptions.data?.message || "Failed to fetch routes", "error");
  //     return;
  //   }
  //   const options = filteredOptions?.data || [];
  //   setFilteredRouteOptions(options.map((route: { id: number; route_name: string }) => ({
  //     value: String(route.id),
  //     label: route.route_name,
  //   })));
  //   setSkeleton({ ...skeleton, route: false });
  // };

  const fetchAgentCustomers = async (values: FormikValues, search: string) => {
    const res = await agentCustomerList({
      warehouse_id: values.warehouse,
      search: search || "",
      // dropdown: "1",
      per_page: "10"
    });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch customers", "error");
      setSkeleton({ ...skeleton, customer: false });
      return;
    }
    const data = res?.data || [];
    const options = data.map((customer: { id: number; outlet_name: string }) => ({
      value: String(customer.id),
      label: customer.outlet_name
    }));
    console.log(options)
    setFilteredCustomerOptions(options);
    setSkeleton({ ...skeleton, customer: false });
  }

  const fetchWarehouse = async (searchQuery?: string) => {
    const res = await warehouseListGlobalSearch({
      query: searchQuery || "",
      dropdown: "1",
      per_page: "50"
    });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch customers", "error");
      return;
    }
    const data = res?.data || [];
    const options = data.map((warehouse: { id: number; warehouse_code: string; warehouse_name: string }) => ({
      value: String(warehouse.id),
      label: warehouse.warehouse_name
    }));
    setFilteredWarehouseOptions(options);
  }

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const fetchPrice = async (item_id: string, customer_id: string, warehouse_id?: string, route_id?: string) => {
    const res = await pricingHeaderGetItemPrice({ customer_id, item_id });
    if (res.error) {
      showSnackbar(res.data?.message || "Failed to fetch items", "error");
      setSkeleton({ ...skeleton, item: false });
      return;
    }
    const data = res?.data || [];
    return data;
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
            Add Order
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>
          <div className="flex flex-col">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Order</span>
            <span className="text-primary text-[14px] tracking-[8px]">#W1O20933</span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        <Formik<FormikValues>
          initialValues={form}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          enableReinitialize={true}
        >
          {({ values, touched, errors, setFieldValue, handleChange, submitForm }: FormikProps<FormikValues>) => {
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-10">
                  <div>
                    <InputFields
                      required
                      label="Warehouse"
                      name="warehouse"
                      value={values?.warehouse || ""}
                      options={filteredWarehouseOptions}
                      disabled={filteredWarehouseOptions.length === 0}
                      onSearch={(searchQuery) => fetchWarehouse(searchQuery)}
                      onChange={(e) => {
                        setFieldValue("warehouse", e.target.value);
                        setSkeleton((prev) => ({ ...prev, customer: true }));
                        if (values.warehouse !== e.target.value) {
                          setFieldValue("route", "");
                          fetchAgentCustomers(values, "");
                        }
                      }}
                      error={
                        touched.warehouse &&
                        (errors.warehouse as string)
                      }
                    />
                  </div>
                  {/* <div>
                    <InputFields
                      required
                      label="Route"
                      name="route"
                      value={filteredRouteOptions.length === 0 ? "" : (values.route?.toString() || "")}
                      onChange={(e) => {
                        setSkeleton((prev) => ({ ...prev, customer: true }));
                        setFieldValue("route", e.target.value);
                        setFieldValue("customer", "");
                        console.log(e.target.value, "route id");
                        fetchAgentCustomers(e.target.value);
                      }}
                      disabled={filteredRouteOptions.length === 0}
                      showSkeleton={skeleton.route}
                      error={
                        touched.route && (errors.route as string)
                      }
                      options={filteredRouteOptions}
                    />
                  </div> */}
                  <div>
                    <InputFields
                      required
                      label="Customer"
                      name="customer"
                      value={values.customer}
                      disabled={filteredCustomerOptions.length === 0}
                      showSkeleton={skeleton.customer}
                      options={filteredCustomerOptions}
                      onSearch={(search) => fetchAgentCustomers(values, search)}
                      onChange={handleChange}
                      error={touched.customer && (errors.customer as string)}
                    />
                  </div>
                  <div>
                    <InputFields
                      required
                      label="Delivery Date"
                      type="date"
                      name="delivery_date"
                      value={values.delivery_date}
                      onChange={handleChange}
                    />
                  </div>
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
                  }))}
                  config={{
                    columns: [
                      {
                        key: "itemName",
                        label: "Item Name",
                        width: 300,
                        render: (row) => (
                          <InputFields
                            label=""
                            name="itemName"
                            options={itemsOptions}
                            disabled={itemsOptions.length === 0}
                            onSearch={(searchTerm: string) => {
                              fetchItem(searchTerm);
                            }}
                            value={row.itemName}
                            onChange={(e) => {
                              recalculateItem(Number(row.idx), "itemName", e.target.value, values);
                            }}
                          />
                        ),
                      },
                      {
                        key: "UOM",
                        label: "UOM",
                        width: 150,
                        render: (row) => (
                          <InputFields
                            label=""
                            name="UOM"
                            value={row.uom_id}
                            options={JSON.parse(row.UOM ?? "[]")}
                            disabled={JSON.parse(row.UOM ?? "[]").length === 0}
                            onChange={(e) =>
                              // pass current Formik values so recalculateItem can fetch price using current customer/warehouse/route
                              recalculateItem(Number(row.idx), "uom_id", e.target.value, values)
                            }
                          />
                        ),
                      },
                      {
                        key: "Quantity",
                        label: "Qty",
                        width: 150,
                        render: (row) => (
                          <InputFields
                            label=""
                            type="number"
                            name="Quantity"
                            placeholder="Enter Qty"
                            value={row.Quantity}
                            onChange={(e) =>
                              recalculateItem(Number(row.idx), "Quantity", e.target.value)
                            }
                          />
                        ),
                      },
                      {
                        key: "Price",
                        label: "Price",
                        width: 200,
                        render: (row) => {
                          // Don't trigger side-effects from render. Show placeholder when price isn't set.
                          const price = String(row.Price ?? "");
                          if (!price || price === "" || price === "0" || price === "0.00" || price === "-") {
                            return <span className="text-gray-400">-</span>;
                          }
                          return <span>{price}</span>;
                        }
                      },
                      { key: "Net", label: "Net" },
                      { key: "Vat", label: "VAT" },
                      { key: "Total", label: "Total" },
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
                  }}
                />

                {/* --- Summary --- */}
                <div className="flex justify-between text-primary gap-0 mb-10">
                  <div className="flex justify-between flex-wrap w-full mt-[20px]">
                    <div className="flex flex-col justify-between gap-[20px]">
                      <div className="">
                        <button
                          type="button"
                          className="text-[#E53935] font-medium text-[16px] flex items-center gap-2"
                          onClick={handleAddNewItem}
                        >
                          <Icon icon="material-symbols:add-circle-outline" width={20} />
                          Add New Item
                        </button>
                      </div>
                      <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">
                        <InputFields
                          label="Note"
                          type="textarea"
                          name="note"
                          placeholder="Enter Description"
                          value={values.note}
                          onChange={handleChange}
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
                        <span>AED {finalTotal.toFixed(2)}</span>
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
                    onClick={() => router.push("/agentCustomerOrder")}
                  >
                    Cancel
                  </button>
                  <SidebarBtn isActive={true} label="Create Order" onClick={submitForm} />
                </div>
              </>
            );
          }}
        </Formik>
      </ContainerCard>
    </div>
  );
}
