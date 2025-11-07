"use client";

import React, { Fragment, ChangeEvent, useState, useEffect, useRef } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import {genearateCode} from "@/app/services/allApi";
import { addAgentOrder, editAgentOrder, getAgentOrderById } from "@/app/services/allApi";

export default function OrderAddEditPage() {
  const { warehouseOptions, agentCustomerOptions, itemOptions, routeOptions } = useAllDropdownListData();
  const router = useRouter();
  const hasFetchedCode = useRef(false);
  
  const [form, setForm] = useState({
    customerType: "",
    order_code: "",
    warehouse: "",
    route: "",
    customer: "",
    note: "",
    delivery_date: new Date().toISOString().slice(0, 10),
    transactionType: "1",
    paymentTerms: "1",
    paymentTermsUnit: "1",
  });

  const [itemData, setItemData] = useState([
    {
      item_id: "",
      itemName: "",
      UOM: "",
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (hasFetchedCode.current) return; // Prevent duplicate calls
    
    const fetchOrderCode = async () => {
      try {
        hasFetchedCode.current = true; // Mark as fetched
        const response = await genearateCode({ model_name: "agent_order_headers" });
        if (response && response.code) {
          setForm((prevForm) => ({
            ...prevForm,
            order_code: response.code,
          }));
        }
      } catch (error) {
        console.error("Error generating order code:", error);
        hasFetchedCode.current = false; // Reset on error to allow retry
      }
    };

    fetchOrderCode();
  }, []);

  // --- Calculate totals and VAT dynamically
  const recalculateItem = (index: number, field: string, value: string) => {
    const newData = [...itemData];
    const item = newData[index];
    item[field as keyof typeof item] = value;

    const qty = Number(item.Quantity) || 0;
    const price = Number(item.Price) || 0;
    const total = qty * price;
    const vat = total - total / 1.18; // 18% VAT
    const net = total - vat;

    item.Total = total.toFixed(2);
    item.Vat = vat.toFixed(2);
    item.Net = net.toFixed(2);

    setItemData(newData);
  };

  const handleAddNewItem = () => {
    setItemData([
      ...itemData,
      {
        item_id: "",
        itemName: "",
        UOM: "",
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
  };

  const handleRemoveItem = (index: number) => {
    if (itemData.length <= 1) {
      setItemData([
        {
          item_id: "",
          itemName: "",
          UOM: "",
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

  // --- Create Payload for API
  const generatePayload = () => {
    return {
      currency: "UGX",
      country_id: 59,
      order_code: form.order_code,
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

  // --- On Submit
  const handleSubmit = async () => {
    const payload = generatePayload();
    console.log("Final Payload:", payload);
    alert("Payload logged in console!");
    // Here you can POST it to your API endpoint
  };

  const keyValueData = [
    { key: "Gross Total", value: `AED ${grossTotal.toFixed(2)}` },
    { key: "Discount", value: `AED ${discount.toFixed(2)}` },
    { key: "Net Total", value: `AED ${netAmount.toFixed(2)}` },
    { key: "VAT", value: `AED ${totalVat.toFixed(2)}` },
    { key: "Delivery Charges", value: "AED 0.00" },
  ];

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
            Add Order
          </h1>
        </div>
      </div>

      <ContainerCard className="rounded-[10px] scrollbar-none">
        {/* --- Header Section --- */}
        <div className="flex justify-between mb-10 flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            <span className="text-primary font-normal text-[16px]">
              Emma-Köhler-Allee 4c, Germering - 13907
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              O r d e r
            </span>
            <span className="text-primary text-[14px] tracking-[10px]">
              #{form.order_code}
            </span>
          </div>
        </div>
        <hr className="w-full text-[#D5D7DA]" />

        {/* --- Form Fields --- */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 mb-10 flex-wrap">
          <InputFields
            label="Customer Type"
            name="customerType"
            value={form.customerType}
            options={[
              { label: "Agent Customer", value: "1" },
              { label: "Company Customer", value: "2" },
            ]}
            onChange={handleChange}
          />
          <InputFields
            label="Warehouse"
            name="warehouse"
            searchable={true}
            value={form.warehouse}
            options={warehouseOptions}
            onChange={handleChange}
          />
          <InputFields
            label="Route"
            name="route"
            value={form.route}
            options={routeOptions}
            onChange={handleChange}
          />
          <InputFields
            label="Customer"
            name="customer"
            searchable={true}
            value={form.customer}
            options={agentCustomerOptions}
            onChange={handleChange}
          />
          <InputFields
            label="Delivery Date"
            type="date"
            name="delivery_date"
            value={form.delivery_date}
            onChange={handleChange}
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
                render: (row) => (
                  <InputFields
                    label=""
                    name="itemName"
                    searchable={true}
                    options={itemOptions}
                    value={row.itemName}
                    onChange={(e) =>
                      recalculateItem(Number(row.idx), "itemName", e.target.value)
                    }
                  />
                ),
              },
              {
                key: "UOM",
                label: "UOM",
                render: (row) => (
                  <InputFields
                    label=""
                    name="UOM"
                    value={row.UOM}
                    onChange={(e) =>
                      recalculateItem(Number(row.idx), "UOM", e.target.value)
                    }
                  />
                ),
              },
              {
                key: "Quantity",
                label: "Qty",
                render: (row) => (
                  <InputFields
                    label=""
                    type="number"
                    name="Quantity"
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
                render: (row) => (
                  <InputFields
                    label=""
                    type="number"
                    name="Price"
                    value={row.Price}
                    onChange={(e) =>
                      recalculateItem(Number(row.idx), "Price", e.target.value)
                    }
                  />
                ),
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
                    className={`${
                      itemData.length <= 1
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

        {/* --- Summary --- */}
        <div className="flex justify-between text-primary gap-0 mb-10">
          <div></div>
          <div className="flex justify-between flex-wrap w-full">
            <div className="flex flex-col justify-end gap-[20px] w-full lg:w-[400px]">
              <InputFields
                label="Note"
                type="textarea"
                name="note"
                placeholder="Enter Description"
                value={form.note}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA]">
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
          <SidebarBtn isActive={true} label="Create Order" onClick={handleSubmit} />
        </div>
      </ContainerCard>
    </div>
  );
}
