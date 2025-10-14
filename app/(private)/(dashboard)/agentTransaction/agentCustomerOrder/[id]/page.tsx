"use client";

import React ,{ Fragment } from "react";
import ContainerCard from "@/app/components/containerCard";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "@/app/components/keyValueData";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const dropdownDataList = [
    { icon: "humbleicons:radio", label: "Inactive", iconWidth: 20 },
    { icon: "hugeicons:delete-02", label: "Delete", iconWidth: 20 },
];

const data = new Array(2).fill(null).map((_, index) => ({
    id: index.toString(),
    itemCode: "MMGW001",
    itemName: "Masafi Pure 4 Gallons(1 Bottle)",
    UOM: "BOT",
    Quantity: "5.00",
    Price: "14.00",
    Excise: "0.00",
    Discount: "0.00",
    Net: "70.00",
    Vat: "3.50",
    Total: "73.50",
}));

// Duplicate untyped columns removed; using the strongly-typed "columns" defined below.
// Strongly-typed table row and column definitions (no `any`)
type OrderItemRow = {
    idx: number;
    itemName: string;
    UOM: string;
    Quantity: string;
    Price: string;
    Excise: string;
    Discount: string;
    Net: string;
    Vat: string;
    Total: string;
};

type TableColumn<T> = {
    key: string;
    label: string;
    width?: number;
    render?: (row: T) => React.ReactNode;
};

// ...existing code...
const keyValueData = [
    { key: "Gross Total", value: "AED 84.00" },
    { key: "Discount", value: "AED 0.00" },
    { key: "Net Total", value: "AED 70.00" },
    { key: "Excise", value: "AED 0.00" },
    { key: "Vat", value: "AED 3.50" },
    { key: "Delivery Charges", value: "AED 0.00" },
];

export default function OrderAddEditPage() {
    const { warehouseOptions, agentCustomerOptions ,itemOptions} = useAllDropdownListData();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const orderId = "#W1O20933";

    const [form, setForm] = useState({
        warehouse: "",
        customer: "",
        note: "",
        delivery_date: new Date().toISOString().slice(0, 10),
        transactionType: "1",
        paymentTerms: "1",
        paymentTermsUnit: "1",
    });

    const [itemData, setItemData] = useState([
        {
            itemName: "",
            UOM: "",
            Quantity: "1",
            Price: "",
            Excise: "",
            Discount: "",
            Net: "",
            Vat: "",
            Total: "",
        },
    ]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Add new item row
    const handleAddNewItem = () => {
        setItemData([
            ...itemData,
            {
                itemName: "",
                UOM: "",
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

    // Remove item row
    const handleRemoveItem = (index: number) => {
        // keep at least one empty row
        if (itemData.length <= 1) {
            // reset the only row to empty values instead of removing it
            setItemData([
                {
                    itemName: "",
                    UOM: "",
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
            <ContainerCard className="rounded-[10px]  scrollbar-none">
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
                            {orderId}
                        </span>
                    </div>
                </div>
                <hr className="w-full text-[#D5D7DA]" />

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center mt-10 mb-10">
                    <InputFields
                        label="Warehouse"
                        type="text"
                        name="warehouse"
                        value={form.warehouse}
                        options={warehouseOptions}
                        onChange={handleChange}
                    />
                    <InputFields
                        label="Customer"
                        type="text"
                        name="customer"
                        value={form.customer}
                        options={agentCustomerOptions}
                        onChange={handleChange}
                    />
                    <div className="ml-auto">
                        <InputFields
                            label="Delivery Date"
                            type="date"
                            name="delivery_date"
                            value={form.delivery_date}
                            onChange={handleChange}
                        />
                    </div>

                </div>


                <Table
                    data={itemData.map((row, idx) => ({ ...row, idx: idx.toString() }))}
                    config={{
                        columns: [
                            {
                                key: "itemName",
                                label: "Item Name",
                                width: 180,
                                render: (row) => (
                                    <InputFields
                                        label=""
                                        type="text"
                                        name="itemName"
                                        options={itemOptions}
                                        value={row.itemName}
                                        onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                            const newData = [...itemData];
                                            const rowIndex = Number(row.idx);
                                            newData[rowIndex].itemName = e.target.value;
                                            setItemData(newData);
                                        }}
                                        placeholder="Select Item"
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
                                        type="text"
                                        name="UOM"
                                        value={row.UOM}
                                        onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                            const newData = [...itemData];
                                            const rowIndex = Number(row.idx);
                                            newData[rowIndex].UOM = e.target.value;
                                            setItemData(newData);
                                        }}
                                        placeholder="Select UOM"
                                    />
                                ),
                            },
                            {
                                key: "Quantity",
                                label: "Quantity",
                                width: 80,
                                render: (row) => (
                                    <InputFields
                                        label=""
                                        type="number"
                                        name="Quantity"
                                        value={row.Quantity}
                                        onChange={(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                                            const newData = [...itemData];
                                            const rowIndex = Number(row.idx);
                                            const raw = e.target.value;
                                            // allow user to clear the field while typing, otherwise enforce minimum 1
                                            if (raw === '') {
                                                newData[rowIndex].Quantity = '';
                                            } else {
                                                const n = Number(raw);
                                                newData[rowIndex].Quantity = String(isNaN(n) ? 1 : Math.max(1, Math.floor(n)));
                                            }
                                            setItemData(newData);
                                        }}
                                       
                                    />
                                ),
                            },
                            { key: "Price", label: "Price", width: 80 },
                            { key: "Excise", label: "Excise", width: 80 },
                            { key: "Discount", label: "Discount", width: 80 },
                            { key: "Net", label: "Net", width: 80 },
                            { key: "Vat", label: "Vat", width: 80 },
                            { key: "Total", label: "Total", width: 80 },
                            {
                                key: "action",
                                label: "Action",
                                width: 60,
                                render: (row) => (
                                    <button
                                        type="button"
                                        className={`${itemData.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''} text-red-500 flex items-center`}
                                        onClick={() => itemData.length > 1 && handleRemoveItem(Number(row.idx))}
                                        aria-label="Delete Item"
                                        disabled={itemData.length <= 1}
                                        title={itemData.length <= 1 ? 'At least one item is required' : 'Delete Item'}
                                    >
                                        <Icon icon="hugeicons:delete-02" width={20} />
                                    </button>
                                ),
                            },
                        ],
                    }}
                        
                    
                />

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
                <div className="flex justify-between text-primary gap-0 mb-10">
                    <div></div>
                    <div className="flex justify-between flex-wrap w-full">
                        <div className="flex flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
                            <div className="flex flex-col space-y-[10px]">
                                <InputFields 
                                    label="Note"
                                    type="textarea"
                                    name="note"
                                    placeholder="Enter Your Description"
                                    value={form.note}
                                    textareaCols={10}
                                    textareaResize={false}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex space-x-[10px]">
                                <InputFields
                                    label="Payment Terms"
                                    name="paymentTerms"
                                    value={form.paymentTerms}
                                    placeholder=" "
                                    trailingElement={
                                        <select
                                            value={form.paymentTermsUnit}
                                            onChange={handleChange}
                                            className="h-full outline-0 bg-[#FAFAFA]"
                                        >
                                            <option value="1">Days</option>
                                            <option value="2">Months</option>
                                        </select>
                                    }
                                    onChange={handleChange}
                                />
                                <InputFields
                                    label="Transaction Type"
                                    name="transactionType"
                                    value={form.transactionType}
                                    options={[
                                        { label: "Cash", value: "1" },
                                        { label: "Online", value: "2" },
                                    ]}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA] lg:border-0  lg:pb-0  lg:mb-0 mt-0">
                            {keyValueData.map((item) => (
                                <Fragment key={item.key}>
                                    <KeyValueData data={[item]} />
                                    <hr className="text-[#D5D7DA]" />
                                </Fragment>
                            ))}
                            <div className="font-semibold text-[#181D27] text-[18px] flex justify-between">
                                <span>Total</span>
                                <span>AED 7.00</span>
                            </div>
                            
                        </div>

                        
                    </div>
                </div>
                <hr className="text-[#D5D7DA]" />

 <div className="flex justify-end gap-4 mt-6  pr-0">
          <button
            type="button"
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.push("/agentCustomerOrder") }
          >
            Cancel
          </button>
          <SidebarBtn
          isActive={true}
            label={ "Create Order" }
          />
        </div>
               
            </ContainerCard>
        </div>
    );
}
