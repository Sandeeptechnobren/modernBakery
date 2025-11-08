"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";

const dropdownDataList = [
  { icon: "humbleicons:radio", label: "Mark as Pending", iconWidth: 20 },
  { icon: "hugeicons:delete-02", label: "Delete Order", iconWidth: 20 },
];

const data = new Array(2).fill(null).map((_, index) => ({
  id: index.toString(),
  itemCode: "MMGW001",
  itemName: "Masafi Pure 4 Gallons (1 Bottle)",
  UOM: "BOT",
  Quantity: "5.00",
  Price: "14.00",
  Excise: "0.00",
  Discount: "0.00",
  Net: "70.00",
  Vat: "3.50",
  Total: "73.50",
}));

const columns = [
  { key: "id", label: "#", width: 60 },
  { key: "itemCode", label: "Product Code" },
  { key: "itemName", label: "Product Name", width: 250 },
  { key: "UOM", label: "UOM" },
  { key: "Quantity", label: "Quantity" },
  { key: "Price", label: "Price" },
  { key: "Excise", label: "Excise" },
  { key: "Discount", label: "Discount" },
  { key: "Net", label: "Net" },
  { key: "Vat", label: "Vat" },
  { key: "Total", label: "Total" },
];

const keyValueData = [
  { key: "Gross Total", value: "AED 84.00" },
  { key: "Discount", value: "AED 0.00" },
  { key: "Net Total", value: "AED 70.00" },
  { key: "Excise", value: "AED 0.00" },
  { key: "Vat", value: "AED 3.50" },
  { key: "Delivery Charges", value: "AED 0.00" },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const orderId = "#W120933";

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.back()}
            className="cursor-pointer"
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
            Order {orderId}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          <div className="gap-[12px] hidden sm:flex">
            <BorderIconButton icon="lucide:edit-2" />
            <BorderIconButton icon="lucide:printer" />
            <BorderIconButton icon="lucide:mail" />
            <BorderIconButton icon="mdi:message-outline" />
            <DismissibleDropdown
              isOpen={showDropdown}
              setIsOpen={setShowDropdown}
              button={
                <BorderIconButton
                  icon="ic:sharp-more-vert"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              }
              dropdown={
                <div className="w-[160px] absolute top-[40px] right-0 z-30">
                  <CustomDropdown data={dropdownDataList} />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* ---------- Order Info Card ---------- */}
      <ContainerCard className="rounded-[10px] space-y-[40px]">
        <div className="flex justify-between flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            <span className="text-primary font-normal text-[16px]">
              Hariss Trading Co., Dubai - UAE
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              O R D E R
            </span>
            <span className="text-primary text-[14px] tracking-[10px] mb-3">
            {orderId}
            </span>
           
          </div>
        </div>

        <hr className="text-[#D5D7DA]" />

        {/* ---------- Order Details Section (three equal columns) ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">
          {/* From (Seller) */}
          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px] border-b md:border-b-0 pb-4 md:pb-0">
              <span>From (Seller)</span>
              <div className="flex flex-col space-y-[10px]">
                <span className="font-semibold">Hariss Store</span>
                <span>Business Bay, Dubai - UAE</span>
                <span>
                  Phone: +971 123456789 <br /> Email: support@hariss.com
                </span>
              </div>
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
              <span>To (Customer)</span>
              <div className="flex flex-col space-y-[10px]">
                <span className="font-semibold">John Doe</span>
                <span>Al Barsha, Dubai - UAE</span>
                <span>
                  Phone: +971 987654321 <br /> Email: john@example.com
                </span>
              </div>
            </div>
          </div>

          {/* Dates / meta - right column */}
          <div className="flex md:justify-end">
            <div className="text-primary-bold text-[14px] md:text-right">
              <div>
                Order Date: <span className="font-bold">04 Oct 2025</span>
              </div>
              <div className="mt-2">
                Delivery Date: <span className="font-bold">06 Oct 2025</span>
              </div>
              <div className="mt-2">
                Order Source: <span className="font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Order Table ---------- */}
        <Table
          data={data}
          config={{
            columns: columns,
          }}
        />

        {/* ---------- Order Summary ---------- */}
        <div className="flex justify-between text-primary">
          <div className="flex justify-between flex-wrap w-full">
            {/* Notes Section */}
            <div className="hidden flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">Customer Note</div>
                <div>
                  Please deliver between 10 AM to 1 PM. Contact before delivery.
                </div>
              </div>
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">
                  Payment Method
                </div>
                <div>Cash on Delivery</div>
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA] lg:border-0 pb-[20px] lg:pb-0 mb-[20px] lg:mb-0">
              {keyValueData.map((kv) => (
                <div key={kv.key} className="w-full">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#6B6F76]">{kv.key}</span>
                    <span className="text-sm font-medium">{kv.value}</span>
                  </div>
                  <hr className="text-[#D5D7DA]" />
                </div>
              ))}
              {/* <hr className="text-[#D5D7DA]" /> */}
              <div className="font-semibold text-[#181D27] py-2 text-[18px] flex justify-between">
                <span>Total</span>
                <span>AED73.50</span>
              </div>
            </div>

            {/* Notes (Mobile) */}
            <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px]">
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">Customer Note</div>
                <div>
                  Please deliver between 10 AM to 1 PM. Contact before delivery.
                </div>
              </div>
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">
                  Payment Method
                </div>
                <div>Cash on Delivery</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="text-[#D5D7DA]" />

        {/* ---------- Footer Buttons ---------- */}
        <div className="flex flex-wrap justify-end gap-[20px]">
          <SidebarBtn
            leadingIcon={"lucide:download"}
            leadingIconSize={20}
            label="Download"
          />
          <SidebarBtn
            isActive
            leadingIcon={"lucide:printer"}
            leadingIconSize={20}
            label="Print Now"
          />
        </div>
      </ContainerCard>
    </>
  );
}
