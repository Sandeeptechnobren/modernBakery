"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect,useRef } from "react";
import { exchangeByUUID } from "@/app/services/agentTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import PrintButton from "@/app/components/printButton";

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

interface detail {
  item_code?: string;
  item_name?: string;
  uom_name?: string;
  item_quantity?: number | string;
  item_price?: string;
  total?: string;
  return_type?: string;
  region?: string;
}

const dropdownDataList = [
  { icon: "humbleicons:radio", label: "Mark as Pending", iconWidth: 20 },
  // { icon: "hugeicons:delete-02", label: "Delete Delivery", iconWidth: 20 },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
   const printRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  interface ExchangeDetail {
    exchange_code?: string;
    warehouse_code?: string;
    warehouse_name?: string;
    customer_code?: string;
    customer_name?: string;
    comment?: string;
    invoices?: Array<{
      item_code?: string;
      item_name?: string;
      uom_name?: string;
      item_quantity?: number | string;
      item_price?: string;
      total?: string;
      return_type?: string;
      region?: string;
    }>;
    returns?: Array<{
      item_code?: string;
      item_name?: string;
      uom_name?: string;
      item_quantity?: number | string;
      item_price?: string;
      total?: string;
      return_type?: string;
      region?: string;
    }>;
  }
  const [deliveryData, setDeliveryData] = useState<ExchangeDetail | null>(null);
  const [invoiceTableData, setInvoiceTableData] = useState<TableRow[]>([]);
  const [returnsTableData, setReturnsTableData] = useState<TableRow[]>([]);

  const uuid = params?.uuid as string;

  useEffect(() => {
    if (uuid) {
      (async () => {
        try {
          setLoading(true);
          const response = await exchangeByUUID(uuid);
          const data = response?.data ?? response;
          setDeliveryData(data);
          // Map invoices to table data
          const goodOptions = [
            { label: "Near By Expiry", value: "1" },
            { label: "Package Issue", value: "1" },
          ];
          const badOptions = [
            { label: "Damage", value: "3" },
            { label: "Expiry", value: "4" },
          ];

          function getReturnTypeLabel(value: string) {
            if (value === "1") return "Good";
            if (value === "2") return "Bad";
            return "-";
          }

          function getRegionLabel(returnType: string, region: string) {
            if (returnType === "1") {
              const found = goodOptions.find(opt => opt.value === region);
              return found ? found.label : "-";
            }
            if (returnType === "2") {
              const found = badOptions.find(opt => opt.value === region);
              return found ? found.label : "-";
            }
            return "-";
          }

          if (data?.invoices && Array.isArray(data.invoices)) {
            const mappedInvoices = data.invoices.map(
              (
                detail: detail,
                index: number
              ) => ({
                id: (index + 1).toString(),
                itemCode: detail.item_code || "-",
                itemName: detail.item_name || "-",
                UOM: detail.uom_name || "-",
                Quantity: detail.item_quantity?.toString() || "0",
                Price: detail.item_price || "0",
                Total: detail.total || "0",
                return_type: getReturnTypeLabel(detail.return_type ?? ""),
                region: getRegionLabel(detail.return_type ?? "", detail.region ?? ""),
              })
            );
            setInvoiceTableData(mappedInvoices);
          }
          // Map returns to table data
          if (data?.returns && Array.isArray(data.returns)) {
            const mappedReturns = data.returns.map(
              (
                detail: detail,
                index: number
              ) => ({
                id: (index + 1).toString(),
                itemCode: detail.item_code || "-",
                itemName: detail.item_name || "-",
                UOM: detail.uom_name || "-",
                Quantity: detail.item_quantity?.toString() || "0",
                Price: detail.item_price || "0",
                Total: detail.total || "0",
                return_type: getReturnTypeLabel(detail.return_type ?? ""),
                region: getRegionLabel(detail.return_type ?? "", detail.region ?? ""),
              })
            );
            setReturnsTableData(mappedReturns);
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



  return (
    <>
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

        <div className="flex gap-[12px] relative">
          <div className="gap-[12px] hidden sm:flex">
            {/* <BorderIconButton 
              icon="lucide:edit-2" 
              onClick={() => router.push(`/agentCustomerDelivery/${uuid}`)}
            /> */}
            {/* <BorderIconButton icon="lucide:printer" /> */}
            {/* <BorderIconButton icon="lucide:mail" /> */}
            {/* <BorderIconButton icon="mdi:message-outline" /> */}
            {/* <DismissibleDropdown
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
            /> */}
          </div>
        </div>
      </div>

      {/* ---------- Order Info Card ---------- */}
      <ContainerCard className="rounded-[10px] space-y-[40px]">
        <div className="flex justify-between flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
            {/* <span className="text-primary font-normal text-[16px]">
              Hariss Trading Co., Dubai - UAE
            </span> */}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
              Exchange
            </span>
            <span className="text-primary text-[14px] tracking-[10px] mb-3">
              #{deliveryData?.exchange_code || ""}
            </span>

          </div>
        </div>

        <hr className="text-[#D5D7DA]" />

        {/* ---------- Order Details Section (three equal columns) ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">
          {/* From (Seller) */}
          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px] border-b md:border-b-0 pb-4 md:pb-0">
              <span className="font-bold">Warehouse</span>
              <div className="flex flex-col space-y-[10px]">
                <span>{deliveryData?.warehouse_code}</span>
                <span>{deliveryData?.warehouse_name}</span>
                {/* <span>
                  Phone: +971 123456789 <br /> Email: support@hariss.com
                </span> */}
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
              <span className="font-bold">Customer</span>
              <div className="flex flex-col space-y-[10px]">
                <span>{deliveryData?.customer_code || "-"}</span>
                <span>{deliveryData?.customer_name || "-"}</span>
                {/* <span>
                  Phone: {deliveryData?.customer?.phone || "-"} <br /> 
                  Email: {deliveryData?.customer?.email || "-"}
                </span> */}
              </div>
            </div>
          </div>

          {/* Dates / meta - right column */}
          {/* <div className="flex md:justify-end">
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
          </div> */}
        </div>

        <h3 className="text-[16px] font-semibold mb-2 mt-8">Received</h3>
        <Table
          data={returnsTableData}
          config={{
            columns: [
              { key: "id", label: "#", width: 60 },
              { key: "itemCode", label: "Product Code" },
              { key: "itemName", label: "Product Name", width: 250 },
              { key: "UOM", label: "UOM" },
              { key: "Quantity", label: "Quantity" },
              { key: "Price", label: "Price" },
              { key: "Total", label: "Total" },
              { key: "return_type", label: "Return Type" },
              { key: "region", label: "Reason" },
            ],
          }}
        />
        {/* ---------- Invoices Table ---------- */}
        <h3 className="text-[16px] font-semibold mb-2">Delivered</h3>
        <Table
          data={invoiceTableData}
          config={{
            columns: [
              { key: "id", label: "#", width: 60 },
              { key: "itemCode", label: "Product Code" },
              { key: "itemName", label: "Product Name", width: 250 },
              { key: "UOM", label: "UOM" },
              { key: "Quantity", label: "Quantity" },
              { key: "Price", label: "Price" },
              { key: "Total", label: "Total" },

            ],
          }}
        />

        {/* ---------- Returns Table ---------- */}


        {/* ---------- Order Summary ---------- */}
        <div className="flex justify-between text-primary">
          <div className="flex justify-between flex-wrap w-full">
            {/* Notes Section */}
            <div className="hidden flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">Customer Note</div>
                <div>
                  {deliveryData?.comment || "-"}
                </div>
              </div>

            </div>

            {/* Totals */}
            {/* <div className="flex flex-col gap-[10px] w-full lg:w-[350px] border-b-[1px] border-[#D5D7DA] lg:border-0 pb-[20px] lg:pb-0 mb-[20px] lg:mb-0">
              {keyValueData.map((kv) => (
                <div key={kv.key} className="w-full">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#6B6F76]">{kv.key}</span>
                    <span className="text-sm font-medium">{kv.value}</span>
                  </div>
                  <hr className="text-[#D5D7DA]" />
                </div>
              ))}
              <div className="font-semibold text-[#181D27] py-2 text-[18px] flex justify-between">
                <span>Total</span>
                <span>AED {deliveryData?.total || "0.00"}</span>
              </div>
            </div> */}

            {/* Notes (Mobile) */}
            <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px]">
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">Customer Note</div>
                <div>
                  {deliveryData?.comment || "-"}
                </div>
              </div>

            </div>
          </div>
        </div>

        <hr className="text-[#D5D7DA]" />

        <div className="flex flex-wrap justify-end gap-[20px] print:hidden" ref={printRef}>
          {/* <SidebarBtn
            leadingIcon={"lucide:download"}
            leadingIconSize={20}
            label="Download"
          /> */}
         <PrintButton targetRef={printRef as React.RefObject<HTMLDivElement>} />
        </div>
      </ContainerCard>
    </>
  );
}
