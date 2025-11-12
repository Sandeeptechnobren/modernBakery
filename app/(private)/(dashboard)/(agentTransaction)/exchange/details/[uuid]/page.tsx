"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { deliveryByUuid,exchangeByUUID } from "@/app/services/agentTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

interface DeliveryDetail {
  id: number;
  item?: {
    id: number;
    code: string;
    name: string;
  };
  uom: number | string;
  quantity: number;
  item_price: string;
  excise?: string;
  discount?: string;
  net_total?: string;
  vat?: string;
  total?: string;
}

interface DeliveryData {
  delivery_code?: string;
  delivery_date?: string;
  customer?: {
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  route?: {
    code?: string;
    name?: string;
  };
  salesman?: {
    code?: string;
    name?: string;
  };
  warehouse?: {
    code?: string;
    name?: string;
  };
  details?: DeliveryDetail[];
  gross_total?: string;
  discount?: string;
  net_total?: string;
  excise?: string;
  vat?: string;
  delivery_charges?: string;
  total?: string;
}

interface TableRow {
  id: string;
  itemCode: string;
  itemName: string;
  UOM: string;
  Quantity: string;
  Price: string;
  Excise: string;
  Discount: string;
  Net: string;
  Vat: string;
  Total: string;
  [key: string]: string;
}

const dropdownDataList = [
  { icon: "humbleicons:radio", label: "Mark as Pending", iconWidth: 20 },
  // { icon: "hugeicons:delete-02", label: "Delete Delivery", iconWidth: 20 },
];

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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  
  const uuid = params?.uuid as string;

  useEffect(() => {
    if (uuid) {
      (async () => {
        try {
          setLoading(true);
          const response = await exchangeByUUID(uuid);
          const data = response?.data ?? response;
          setDeliveryData(data);
          
          // Map details to table data
          if (data?.details && Array.isArray(data.details)) {
            const mappedData = data.details.map((detail: DeliveryDetail, index: number) => ({
              id: (index + 1).toString(),
              itemCode: detail.item?.code || "-",
              itemName: detail.item?.name || "-",
              UOM: detail.uom ? (typeof detail.uom === 'string' ? detail.uom : detail.uom.toString()) : "-",
              Quantity: detail.quantity?.toString() || "0",
              Price: detail.item_price || "0",
              Excise: detail.excise || "0",
              Discount: detail.discount || "0",
              Net: detail.net_total || "0",
              Vat: detail.vat || "0",
              Total: detail.total || "0",
            }));
            setTableData(mappedData);
          }
        } catch (error) {
          console.error("Error fetching delivery data:", error);
          showSnackbar("Failed to fetch delivery details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [uuid, setLoading, showSnackbar]);

  const keyValueData = [
    { key: "Gross Total", value: `AED ${deliveryData?.gross_total || "0.00"}` },
    { key: "Discount", value: `AED ${deliveryData?.discount || "0.00"}` },
    { key: "Net Total", value: `AED ${deliveryData?.net_total || "0.00"}` },
    { key: "Excise", value: `AED ${deliveryData?.excise || "0.00"}` },
    { key: "Vat", value: `AED ${deliveryData?.vat || "0.00"}` },
    { key: "Delivery Charges", value: `AED ${deliveryData?.delivery_charges || "0.00"}` },
  ];

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
            Exchange Details
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          <div className="gap-[12px] hidden sm:flex">
            <BorderIconButton 
              icon="lucide:edit-2" 
              onClick={() => router.push(`/agentCustomerDelivery/${uuid}`)}
            />
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
              DELIVERY
            </span>
            <span className="text-primary text-[14px] tracking-[10px] mb-3">
              #{deliveryData?.delivery_code || ""}
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
                <span className="font-semibold">{deliveryData?.customer?.name || "-"}</span>
                <span>{deliveryData?.customer?.address || "-"}</span>
                <span>
                  Phone: {deliveryData?.customer?.phone || "-"} <br /> 
                  Email: {deliveryData?.customer?.email || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Dates / meta - right column */}
          <div className="flex md:justify-end">
            <div className="text-primary-bold text-[14px] md:text-right">
              <div>
                Delivery Date: <span className="font-bold">{deliveryData?.delivery_date ? new Date(deliveryData.delivery_date).toLocaleDateString('en-GB') : "-"}</span>
              </div>
              <div className="mt-2">
                Route: <span className="font-bold">{deliveryData?.route?.code || "-"} - {deliveryData?.route?.name || "-"}</span>
              </div>
              <div className="mt-2">
                Salesman: <span className="font-bold">{deliveryData?.salesman?.code || "-"} - {deliveryData?.salesman?.name || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Order Table ---------- */}
        <Table
          data={tableData}
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
                <span>AED {deliveryData?.total || "0.00"}</span>
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
