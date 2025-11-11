"use client";

import ContainerCard from "@/app/components/containerCard";
import Table, { TableDataType } from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, RefObject } from "react";
// import KeyValueData from "../master/customer/[customerId]/keyValueData";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { downloadFile, getAgentOrderById } from "@/app/services/allApi";
import KeyValueData from "@/app/components/keyValueData";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import PrintButton from "@/app/components/printButton";
import { agentOrderExport } from "@/app/services/agentTransaction";
import { format } from "path/win32";

const columns = [
  { key: "index", label: "#" },
  { key: "item_name", label: "Item Name" },
  { key: "uom_name", label: "UOM" },
  { key: "quantity", label: "Quantity" },
  { key: "item_price", label: "Price", render: (value: TableDataType) => <>{toInternationalNumber(value.item_price) || '0.00'}</> },
  { key: "vat", label: "VAT", render: (value: TableDataType) => <>{toInternationalNumber(value.vat) || '0.00'}</> },
  { key: "preVat", label: "Pre VAT", render: (value: TableDataType) => <>{toInternationalNumber(Number(value.total) - Number(value.vat)) || '0.00'}</> },
  // { key: "discount", label: "Discount", render: (value: TableDataType) => <>{toInternationalNumber(value.discount) || '0.00'}</> },
  { key: "net_total", label: "Net", render: (value: TableDataType) => <>{toInternationalNumber(value.net_total) || '0.00'}</> },
  // { key: "total_gross", label: "Gross", render: (value: TableDataType) => <>{toInternationalNumber(value.total_gross) || '0.00'}</> },
  { key: "total", label: "Total", render: (value: TableDataType) => <>{toInternationalNumber(value.total) || '0.00'}</> },
];

interface OrderData {
  id: number,
  uuid: string,
  order_code: string,
  warehouse_id: number,
  warehouse_code: string,
  warehouse_name: string,
  warehouse_address: string,
  warehouse_contact: string,
  warehouse_email: string,
  customer_id: number,
  customer_code: string,
  customer_name: string,
  customer_email: string,
  customer_contact: string,
  customer_street: string,
  customer_city: string,
  delivery_date: string,
  comment: string,
  created_at: string,
  order_source: string,
  payment_method: string,
  status: string,
  details: [
    {
      id: number,
      uuid: string,
      header_id: number,
      order_code: string,
      item_id: number,
      item_code: string,
      item_name: string,
      uom_id: number,
      uom_name: string,
      item_price: number,
      quantity: number,
      vat: number,
      discount: number,
      gross_total: number,
      net_total: number,
      total: number,
    }
  ]
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<OrderData | null>(null);
  const params = useParams();
  const UUID = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const fetchOrder = async () => {
    setLoading(true);
    const listRes = await getAgentOrderById(UUID || "");
    if (listRes.error) {
      showSnackbar(listRes.error.message || "Failed to fetch order details", "error");
      setLoading(false);
      throw new Error(listRes.error.message);
    } else {
      setData(listRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [UUID]);

  const grossTotal = data?.details?.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  ) ?? 0;
  const totalVat = data?.details?.reduce(
    (sum, item) => sum + Number(item.vat || 0),
    0
  ) ?? 0;
  const netAmount = data?.details?.reduce(
    (sum, item) => sum + Number(item.net_total || 0),
    0
  ) ?? 0;
  const preVat = totalVat ? grossTotal - totalVat : grossTotal;
  const discount = data?.details?.reduce(
    (sum, item) => sum + Number(item.discount || 0),
    0
  ) ?? 0;
  const finalTotal = grossTotal + totalVat;

  const keyValueData = [
    { key: "Net Total", value: "AED "+toInternationalNumber( netAmount ?? 0) },
    // { key: "Gross Total", value: "AED "+toInternationalNumber( grossTotal ?? 0 ) },
    // { key: "Discount", value: "AED "+toInternationalNumber( discount ?? 0 ) },
    // { key: "Excise", value: "AED 0.00" },
    { key: "Vat", value: "AED "+toInternationalNumber( totalVat ?? 0 ) },
    { key: "Pre VAT", value: "AED "+toInternationalNumber(preVat ?? 0) },
    // { key: "Delivery Charges", value: "AED 0.00" },
  ];

  const targetRef = useRef<HTMLDivElement | null>(null);

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
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
            Order #{data?.order_code || "-"}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          {/* <div className="gap-[12px] hidden sm:flex">
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
          </div> */}
        </div>
      </div>

      <div ref={targetRef}>
        <ContainerCard className="rounded-[10px] space-y-[40px]">
        <div className="flex justify-between flex-wrap gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <Logo type="full" />
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">Order</span>
            <span className="text-primary text-[14px] tracking-[8px]">#{data?.order_code || "-"}</span>
          </div>
        </div>

        <hr className="text-[#D5D7DA]" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">
          {/* From (Seller) */}
          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px] border-b md:border-b-0 pb-4 md:pb-0">
              <span>From (Seller)</span>
              <div className="flex flex-col space-y-[10px]">
                <span className="font-semibold">{data?.warehouse_code && data?.warehouse_name  
                  ? `${data?.warehouse_code} - ${data?.warehouse_name } ` : "-"}</span>
                <span>{data?.warehouse_address ?? ""} {data?.warehouse_address && ", "}</span>
                <span>
                  {data?.warehouse_contact && <>Phone: {data?.warehouse_contact}</>} <br /> {data?.warehouse_email && <>Email: {data?.warehouse_email}</>}
                </span>
              </div>
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
              <span>To (Customer)</span>
              <div className="flex flex-col space-y-[10px]">
                <span className="font-semibold">{data?.customer_code && data?.customer_name  ? `${data?.customer_code} - ${data?.customer_name}` : "-"}</span>
                <span>{data?.customer_street && ` ${data?.customer_street}`}</span>
                <span>
                  {data?.customer_contact && `Phone: ${data?.customer_contact}`} <br /> {data?.customer_email && `Email: ${data?.customer_email}`}
                </span>
              </div>
            </div>
          </div>

          {/* Dates / meta - right column */}
          <div className="flex md:justify-end">
            <div className="text-primary-bold text-[14px] md:text-right">
              {data?.created_at && <div>
                Order Date: <span className="font-bold">{data?.created_at.split("T")[0] || ""}</span>
              </div>}
              {data?.delivery_date && <div className="mt-2">
                Delivery Date: <span className="font-bold">{data?.delivery_date || ""}</span>
              </div>}
              {data?.order_source && <div className="mt-2">
                Order Source: <span className="font-bold">{data?.order_source || "Online"}</span>
              </div>}
            </div>
          </div>
        </div>

        {/* ---------- Order Table ---------- */}
        <Table
          data={(data?.details || []).map((row, index) => {
            const mappedRow: Record<string, string> = { index: String(index + 1) };
            Object.keys(row).forEach((key) => {
              const value = (row as any)[key];
              mappedRow[key] = value === null || value === undefined ? "" : String(value);
            });
            return mappedRow;
          })}
          config={{
            columns: columns,
          }}
        />

        {/* ---------- Order Summary ---------- */}
        <div className="flex justify-between text-primary">
          <div className="flex justify-between flex-wrap w-full">
            {/* Notes Section */}
            <div className="hidden flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
              {data?.comment && <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">Customer Note</div>
                <div>{data?.comment}</div>
              </div>}
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">
                  Payment Method
                </div>
                <div>{"Cash on Delivery"}</div>
              </div>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-[10px] w-full lg:w-[350px]">
              {keyValueData.map((item) => (
                <Fragment key={item.key}>
                  <KeyValueData data={[item]} />
                  <hr className="text-[#D5D7DA]" />
                </Fragment>
              ))}
              <div className="font-semibold text-[#181D27] text-[18px] flex justify-between">
                <span>Total</span>
                {/* <span>AED {toInternationalNumber(finalTotal) || 0}</span> */}
                <span>AED {toInternationalNumber(finalTotal) || 0}</span>
              </div>
            </div>

            {/* Notes (Mobile) */}
            <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px] mt-[20px]">
              {data?.comment && <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">Customer Note</div>
                <div>{data?.comment}</div>
              </div>}
              <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">
                  Payment Method
                </div>
                <div>{"Cash on Delivery"}</div>
              </div>
              {/* {data?.payment_method && <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">
                  Payment Method
                </div>
                <div>{data?.payment_method || "Cash on Delivery"}</div>
              </div>} */}
            </div>
          </div>
        </div>

        <hr className="text-[#D5D7DA] print:hidden" />

        {/* ---------- Footer Buttons ---------- */}
        <div className="flex flex-wrap justify-end gap-[20px] print:hidden">
          <SidebarBtn
            leadingIcon={"lucide:download"}
            leadingIconSize={20}
            label="Download"
            onClick={async () => {
              const res = await agentOrderExport({uuid: UUID,format:"csv"});
              if(res.error){
                showSnackbar(res.error.message || "Failed to export order", "error");
              } else {
                const downloadUrl = res.data?.download_url;
                downloadFile(downloadUrl || "", `order_${data?.order_code || UUID}.csv`);
              }
            }}
          />
          <PrintButton targetRef={targetRef as unknown as RefObject<HTMLElement>} />
        </div>
        </ContainerCard>
      </div>
    </>
  );
}
