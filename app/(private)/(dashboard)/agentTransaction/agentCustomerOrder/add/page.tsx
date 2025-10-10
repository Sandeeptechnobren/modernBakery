
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import CustomButton from "@/app/components/customButton";
import Logo from "@/app/components/logo";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table from "@/app/components/customTable";
const invoiceTypeOptions = [
  { label: "Select", value: "" },
  { label: "Sales Invoice", value: "sales" },
  { label: "Purchase Invoice", value: "purchase" },
  { label: "Service Invoice", value: "service" },
];

const itemOptions = [
  { label: "Select Item", value: "" },
  { label: "Masafi Pure 4 Gallons (1 Bottle)", value: "MMGW001" },
  { label: "Al Ain Water 1.5L (12 Pack)", value: "ALAW002" },
  { label: "Pepsi Cola 330ml (24 Pack)", value: "PEPC003" },
];

const uomOptions = [
  { label: "Select UOM", value: "" },
  { label: "BOT", value: "BOT" },
  { label: "PCS", value: "PCS" },
  { label: "KG", value: "KG" },
  { label: "LTR", value: "LTR" },
];

const paymentTermsOptions = [
  { label: "7", value: "7" },
  { label: "15", value: "15" },
  { label: "30", value: "30" },
  { label: "45", value: "45" },
];

const transactionTypeOptions = [
  { label: "Online", value: "online" },
  { label: "Cash", value: "cash" },
  { label: "Credit", value: "credit" },
];

export default function AddAgentCustomerOrderPage() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();
  const { customerTypeOptions } = useAllDropdownListData();

  const [formData, setFormData] = useState({
    invoiceType: "",
    customerName: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    note: "",
    paymentTerms: "7",
    transactionType: "online",
  });

  const [items, setItems] = useState([
    {
      id: "1",
      itemName: "",
      uom: "",
      quantity: "1",
      price: "0.00",
      excise: "0.00",
      discount: "0.00",
      net: "0.00",
      vat: "0.00",
      total: "0.00",
    }
  ]);

  // Handle input changes
  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Handle item changes
  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate totals when quantity or price changes
    if (field === "quantity" || field === "price" || field === "discount" || field === "excise") {
      const item = updatedItems[index];
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      const excise = parseFloat(item.excise) || 0;
      
      const net = (quantity * price) - discount + excise;
      const vat = net * 0.05; // 5% VAT
      const total = net + vat;
      
      updatedItems[index] = {
        ...updatedItems[index],
        net: net.toFixed(2),
        vat: vat.toFixed(2),
        total: total.toFixed(2),
      };
    }
    
    setItems(updatedItems);
  };

  // Add new item row
  const addNewItem = () => {
    setItems([...items, {
      id: (items.length + 1).toString(),
      itemName: "",
      uom: "",
      quantity: "1",
      price: "0.00",
      excise: "0.00",
      discount: "0.00",
      net: "0.00",
      vat: "0.00",
      total: "0.00",
    }]);
  };

  // Remove item row
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculate grand totals
  const calculateTotals = () => {
    const grossTotal = items.reduce((sum, item) => sum + (parseFloat(item.net) || 0), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
    const totalExcise = items.reduce((sum, item) => sum + (parseFloat(item.excise) || 0), 0);
    const totalVat = items.reduce((sum, item) => sum + (parseFloat(item.vat) || 0), 0);
    const grandTotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    
    return {
      grossTotal: grossTotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      netTotal: (grossTotal - totalDiscount).toFixed(2),
      totalExcise: totalExcise.toFixed(2),
      totalVat: totalVat.toFixed(2),
      deliveryCharges: "0.00",
      grandTotal: grandTotal.toFixed(2),
    };
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.invoiceType || !formData.customerName) {
      showSnackbar("Please fill in Order Type and Customer Name", "error");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      showSnackbar("Order created successfully", "success");
      router.push("/agentTransaction/agentCustomerOrder");
    } catch (err) {
      showSnackbar("Failed to create Order", "error");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className=" flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-[16px]">
        <Icon
          icon="lucide:arrow-left"
          width={24}
          onClick={() => router.back()}
          className="cursor-pointer"
        />
        <h1 className="text-[20px] font-semibold text-[#181D27]">Add Order</h1>
      </div>

      <ContainerCard className="rounded-[10px] space-y-[30px]">
        {/* Invoice Header */}
        <div className="flex justify-between items-start flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            <span className="text-[#414651] font-normal text-[14px]">
              Emma-Köhler-Allee 4c, Germering - 13907
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              ORDER
            </span>
            <span className="text-[#414651] text-[14px] tracking-[2px]">
              # W1020933
            </span>
          </div>
        </div>

        {/* Invoice Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
          <InputFields
            label="Order Type"
            type="select"
            name="invoiceType"
            value={formData.invoiceType}
            options={invoiceTypeOptions}
            onChange={(e) => handleChange("invoiceType", e.target.value)}
          />
          
          <InputFields
            label="Customer Name"
            type="text"
            name="customerName"
            value={formData.customerName}
            searchable={true}
            onChange={(e) => handleChange("customerName", e.target.value)}
          />
          
          <InputFields
            label="Delivery Date"
            type="date"
            name="invoiceDate"
            value={formData.invoiceDate}
            onChange={(e) => handleChange("invoiceDate", e.target.value)}
          />
        </div>

        {/* Items Table using custom Table component */}
        <div className="space-y-[15px]">
          <Table
            data={items}
            config={{
              columns: [
                {
                  key: "itemName",
                  label: "Item Name",
                  render: (row) => (
                    <InputFields
                      label=""
                      type="select"
                      value={row.itemName}
                      options={itemOptions}
                      onChange={(e) => handleItemChange(parseInt(row.id) - 1, "itemName", e.target.value)}
                      width="w-[140px]"
                    />
                  ),
                },
                {
                  key: "uom",
                  label: "UOM",
                  render: (row) => (
                    <InputFields
                      label=""
                      type="select"
                      value={row.uom}
                      options={uomOptions}
                      onChange={(e) => handleItemChange(parseInt(row.id) - 1, "uom", e.target.value)}
                      width="w-[140px]"
                    />
                  ),
                },
                {
                  key: "quantity",
                  label: "Quantity",
                  render: (row) => (
                    <InputFields
                      label=""
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleItemChange(parseInt(row.id) - 1, "quantity", e.target.value)}
                      width="w-[140px]"
                    />
                  ),
                },
                {
                  key: "price",
                  label: "Price",
                  render: (row) => <span>{row.price}</span>,
                },
                {
                  key: "excise",
                  label: "Excise",
                  render: (row) => <span>{row.excise}</span>,
                },
                {
                  key: "discount",
                  label: "Discount",
                  render: (row) => <span>{row.discount}</span>,
                },
                {
                  key: "net",
                  label: "Net",
                  render: (row) => <span>{row.net}</span>,
                },
                {
                  key: "vat",
                  label: "Vat",
                  render: (row) => <span>{row.vat}</span>,
                },
                {
                  key: "total",
                  label: "Total",
                  render: (row) => <span className="font-semibold">{row.total}</span>,
                },
              ],
              rowActions: [
                {
                  icon: "lucide:trash-2",
                  onClick: (row) => removeItem(parseInt(row.id) - 1),
                },
              ],
              footer: { nextPrevBtn: false, pagination: false },
            }}
          />
          {/* Add New Item Button */}
          <button
            onClick={addNewItem}
            className="flex items-center gap-2 text-[#EA0A2A] hover:text-[#EA0A2A]/80 font-medium"
          >
            <Icon icon="ic:round-add" width={20} />
            Add New Item
          </button>
        </div>

        {/* Note, Payment Terms, and Sales Summary side by side below the table */}
        <div className="flex flex-col lg:flex-row gap-[40px] w-full">
          {/* Left: Note and Payment Terms */}
          <div className="flex-1 space-y-[20px]">
            <div className="flex flex-col space-y-[8px]">
              <label className="text-[#414651] font-medium text-sm">Note</label>
              <textarea
                className="w-full px-[12px] py-[8px] border border-[#E9EAEB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA0A2A] focus:border-transparent resize-none"
                rows={4}
                value={formData.note}
                placeholder="Enter a description..."
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-[15px]">
              <InputFields
                label="Payment Terms"
                type="select"
                name="paymentTerms"
                value={formData.paymentTerms}
                options={paymentTermsOptions}
                onChange={(e) => handleChange("paymentTerms", e.target.value)}
              />
              <InputFields
                label="Transaction Type"
                type="select"
                name="transactionType"
                value={formData.transactionType}
                options={transactionTypeOptions}
                onChange={(e) => handleChange("transactionType", e.target.value)}
              />
            </div>
          </div>
          {/* Right: Sales Summary */}
          <div className="flex-1 flex flex-col justify-start">
              <div className="space-y-[10px]">
                <div className="flex justify-between text-[#414651]">
                  <span>Gross Total</span>
                  <span>AED {totals.grossTotal}</span>
                  
                </div>
                <hr className="border-[#E9EAEB]" />
                <div className="flex justify-between text-[#414651]">
                  <span>Discount</span>
                  <span>AED {totals.totalDiscount}</span>
                </div>
                <hr className="border-[#E9EAEB]" />
                <div className="flex justify-between text-[#414651]">
                  <span>Net Total</span>
                  <span>AED {totals.netTotal}</span>
                </div>
                <hr className="border-[#E9EAEB]" />
                <div className="flex justify-between text-[#414651]">
                  <span>Excise</span>
                  <span>AED {totals.totalExcise}</span>
                </div>
                <hr className="border-[#E9EAEB]" />
                <div className="flex justify-between text-[#414651]">
                  <span>Vat</span>
                  <span>AED {totals.totalVat}</span>
                </div>
                <hr className="border-[#E9EAEB]" />
                <div className="flex justify-between text-[#414651]">
                  <span>Delivery Charges</span>
                  <span>AED {totals.deliveryCharges}</span>
                </div>
                <hr className="border-[#E9EAEB]" />
                <div className="flex justify-between text-[#181D27] font-bold text-lg">
                  <span>Total</span>
                  <span>AED {totals.grandTotal}</span>
                </div>
              </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-[15px] pt-[20px] border-t border-[#E9EAEB]">
          <CustomButton
            onClick={() => router.back()}
            className="px-[24px] py-[10px] border border-[#E9EAEB] text-[#414651] bg-white hover:bg-[#F8F9FA]"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit}
            className="px-[24px] py-[10px] bg-[#EA0A2A] text-white hover:bg-[#EA0A2A]/90"
          >
            Create Order
          </CustomButton>
        </div>
      </ContainerCard>
    </div>
  );
}