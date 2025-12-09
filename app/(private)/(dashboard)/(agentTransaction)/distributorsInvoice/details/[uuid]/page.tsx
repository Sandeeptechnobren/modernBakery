"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, RefObject, Fragment } from "react";
import { deliveryByUuid, exportInvoiceWithDetails, exportInvoiceDetails, invoiceByUuid } from "@/app/services/agentTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import PrintButton from "@/app/components/printButton";
import KeyValueData from "@/app/components/keyValueData";
import { formatWithPattern } from "@/app/(private)/utils/date";
import { isValidDate } from "@/app/utils/formatDate";
import { downloadFile } from "@/app/services/allApi";
// const CURRENCY = localStorage.getItem("country") || "";

interface DeliveryDetail {
  id: number;
  item?: {
    id: number;
    code: string;
    name: string;
  };
  uom: number | string;
  uom_name: string;
  quantity: number;
  item_price: string;
  excise?: string;
  discount?: string;
  net_total?: string;
  vat?: string;
  total?: string;
}

interface InvoiceData {
  header_id: number,
  invoice_code: string,
  currency_id: number,
  currency_name: string,
  company_id: number,
  order_number: string,
  order_code: string,
  delivery_number: string,
  delivery_code: string,
  warehouse_id: number,
  warehouse_code: string,
  warehouse_name: string,
  route_id: number,
  route_code: string,
  route_name: string,
  customer_id: number,
  customer_code: string,
  customer_name: string,
  salesman_id: number,
  salesman_code: string,
  salesman_name: string,
  invoice_date: string,
  invoice_time: string,
  gross_total: number,
  vat: number,
  pre_vat: number,
  net_total: number,
  promotion_total: number,
  discount: number,
  total_amount: number,
  status: number,
  uuid: string,
  id: string,
  previous_uuid?: string,
  next_uuid?: string,
  details: {
    item_code: string,
    item_name: string,
    uom_name: string,
    quantity: number,
    itemvalue: number,
    vat: number,
    pre_vat: number,
    net_total: number,
    item_total: number
  }[]
}

interface TableRow {
  item_code: string,
  erp_code: string,
  item_name: string,
  uom_name: string,
  quantity: number,
  itemvalue: number,
  vat: number,
  pre_vat: number,
  net_total: number,
  item_total: number,
  [key: string]: string | number;
}

const columns = [
  { key: "id", label: "#", width: 60 },
  // { key: "itemCode", label: "Item Code" },
  { key: "itemName", label: "Item Name", render: (value: TableDataType) => <>{(value.erp_code ? value.erp_code : '') + (value.erp_code && value.itemName ? " - " : "") + (value.itemName ? value.itemName : "") || '-'}</> },
  { key: "UOM", label: "UOM" },
  { key: "Quantity", label: "Quantity" },
  { key: "Price", label: "Price", render: (value: TableDataType) => <>{toInternationalNumber(value.Price) || '0.00'}</> },
  { key: "Net", label: "Net", render: (value: TableDataType) => <>{toInternationalNumber(value.Net) || '0.00'}</> },
  { key: "vat", label: "VAT", render: (value: TableDataType) => <>{toInternationalNumber(value.Vat) || '0.00'}</> },
  // { key: "preVat", label: "Pre VAT", render: (value: TableDataType) => <>{toInternationalNumber(Number(value.preVat)) || '0.00'}</> },
  // { key: "discount", label: "Discount", render: (value: TableDataType) => <>{toInternationalNumber(value.discount) || '0.00'}</> },
  // { key: "total_gross", label: "Gross", render: (value: TableDataType) => <>{toInternationalNumber(value.total_gross) || '0.00'}</> },
  { key: "Total", label: "Total", render: (value: TableDataType) => <>{toInternationalNumber(value.Total) || '0.00'}</> },
];
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [invoiceId, setId] = useState<string>('');
  // const [showDropdown, setShowDropdown] = useState(false);
  const [deliveryData, setDeliveryData] = useState<InvoiceData | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loading, setLoadingState] = useState<boolean>(false);
  const uuid = params?.uuid as string;
  const CURRENCY = localStorage.getItem("country") || "";
  const PATH = "/distributorsInvoice/details/";

  useEffect(() => {
    if (uuid) {
      (async () => {
        try {
          setLoading(true);
          const response = await invoiceByUuid(uuid);
          const data = response?.data ?? response;
          setId(data?.header_id);
          setDeliveryData(data);

          // Map details to table data
          if (data?.details && Array.isArray(data.details)) {
            const mappedData = data.details.map((detail: TableRow, index: number) => ({
              id: String(index + 1),
              itemCode: String(detail.item_code ?? "-"),
              erp_code: String(detail.erp_code ?? "-"),
              itemName: String(detail.item_name ?? "-"),
              UOM: String(detail.uom_name ?? detail.uom ?? "-"),
              Quantity: String(detail.quantity ?? 0),
              Price: String(detail.itemvalue ?? "0"),
              Excise: String(detail.excise ?? "0"),
              Discount: String(detail.discount ?? "0"),
              Net: String(detail.net_total ?? "0"),
              Vat: String(detail.vat ?? "0"),
              preVat: String(detail.pre_vat ?? "0"),
              Total: String(detail.item_total ?? "0"),
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

  const exportFile = async () => {
    try {
      setLoadingState(true);
      const response = await exportInvoiceWithDetails({ uuid: uuid, format: "pdf" });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
    } finally {
      setLoadingState(false);
    }
  };

  const keyValueData = [
    // { key: "Gross Total", value: `AED ${deliveryData?.gross_total || "0.00"}` },
    // { key: "Discount", value: `AED ${deliveryData?.discount || "0.00"}` },
    { key: "Net Total", value: `${CURRENCY} ${toInternationalNumber(Number(deliveryData?.net_total || 0)) || "0.00"}` },
    // { key: "Excise", value: `AED ${deliveryData?.excise || "0.00"}` },
    { key: "VAT", value: `${CURRENCY} ${toInternationalNumber(Number(deliveryData?.vat || 0)) || "0.00"}` },
    // { key: "Pre VAT", value: `${CURRENCY} ${toInternationalNumber(Number(deliveryData?.pre_vat || 0)) || "0.00"}` },
    // { key: "Delivery Charges", value: `AED ${deliveryData?.delivery_charges || "0.00"}` },
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
            onClick={() => router.push("/distributorsInvoice")}
            className="cursor-pointer"
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
            Invoice Details
          </h1>
          <BorderIconButton disabled={!deliveryData?.previous_uuid} onClick={deliveryData?.previous_uuid ? () => router.push(`${PATH}${deliveryData.previous_uuid}`) : undefined} icon="lucide:chevron-left" label={"Prev"} labelTw="font-medium text-[12px]" className="!h-[30px] !gap-[3px] !px-[5px] !pr-[10px]" />
          <BorderIconButton disabled={!deliveryData?.next_uuid} onClick={deliveryData?.next_uuid ? () => router.push(`${PATH}${deliveryData.next_uuid}`) : undefined} trailingIcon="lucide:chevron-right" label={"Next"} labelTw="font-medium text-[12px]" className="!h-[30px] !gap-[3px] !px-[5px] !pl-[10px]" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          {/* <div className="gap-[12px] hidden sm:flex">
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
          </div> */}
        </div>
      </div>

      {/* ---------- Order Info Card ---------- */}
      <div ref={targetRef}>
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
                INVOICE
              </span>
              <span className="text-primary text-[14px] tracking-[10px] mb-3">
                #{deliveryData?.invoice_code || ""}
              </span>
            </div>
          </div>

          <hr className="text-[#D5D7DA]" />

          {/* ---------- Order Details Section (three equal columns) ---------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">
            {/* From (Seller) */}
            <div>
              <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px] border-b md:border-b-0 pb-4 md:pb-0">
                <span>Seller</span>
                <div className="flex flex-col space-y-[10px]">
                  {/* <span className="font-semibold">{deliveryData?.warehouse_code } - {deliveryData?.warehouse_name}</span> */}
                  <span className="font-semibold">
                    {deliveryData?.warehouse_code ? deliveryData.warehouse_code : ""}
                    {deliveryData?.warehouse_code && deliveryData?.warehouse_name ? " - " : ""}
                    {deliveryData?.warehouse_name ? deliveryData.warehouse_name : ""}
                  </span>
                  <span>
                    {/* {deliveryData?.warehouse_contact && <>Phone: {deliveryData?.warehouse_contact}</>} <br /> {data?.warehouse_email && <>Email: {data?.warehouse_email}</>} */}
                  </span>
                </div>
              </div>
            </div>

            {/* To (Customer) */}
            <div>
              <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
                <span>Buyer</span>
                <div className="flex flex-col space-y-[10px]">
                  <span className="font-semibold">{deliveryData?.customer_code ? deliveryData.customer_code : ""} {deliveryData?.customer_code && deliveryData?.customer_name ? " - " : ""} {deliveryData?.customer_name}</span>
                  {/* <span>{deliveryData?.customer_address && deliveryData?.customer_address}</span> */}
                  <span>
                    {/* {deliveryData?.customer_phone && <>Phone: {deliveryData?.customer_phone || "-"}</>} <br /> */}
                    {/* {deliveryData?.customer_email && <>Email: {deliveryData?.customer_email || "-"}</>} <br /> */}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates / meta - right column */}
            <div className="flex md:justify-end">
              <div className="text-primary-bold text-[14px] md:text-right">
                {deliveryData?.invoice_date && isValidDate(new Date(deliveryData.invoice_date)) && <div>
                  Invoice Date: <span className="font-bold">{formatWithPattern(new Date(deliveryData.invoice_date) || "", 'DD MMM YYYY', 'en-GB').toLowerCase()}</span>
                </div>}
                {(deliveryData?.route_code || deliveryData?.route_name) && <div className="mt-2">
                  Route: <span className="font-bold">{deliveryData?.route_code ? deliveryData.route_code : ""} {deliveryData?.route_code && deliveryData?.route_name ? " - " : ""} {deliveryData?.route_name ? deliveryData.route_name : ""}</span>
                </div>}
                {deliveryData?.salesman_name && <div className="mt-2">
                  Sales Team: <span className="font-bold">{deliveryData?.salesman_name}</span>
                </div>}
              </div>
            </div>
          </div>

          {/* ---------- Order Table ---------- */}
          <Table
            data={tableData as TableDataType[]}
            config={{
              columns: columns,
            }}
          />

          {/* ---------- Order Summary ---------- */}
          <div className="flex justify-between text-primary">
            <div className="flex justify-between flex-wrap w-full">
              {/* Notes Section */}
              <div className="hidden flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
                {/* <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">Customer Note</div>
                  <div>
                    Please deliver between 10 AM to 1 PM. Contact before delivery.
                  </div>
                </div> */}
                <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">
                    Payment Method
                  </div>
                  <div>Cash on Delivery</div>
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-[10px] w-full lg:w-[350px] pb-[20px] lg:pb-0 mb-[20px] lg:mb-0">
                {keyValueData.map((kv) => (
                  <Fragment key={kv.key}>
                    <KeyValueData data={[kv]} />
                    <hr className="text-[#D5D7DA]" />
                  </Fragment>
                ))}
                {/* <hr className="text-[#D5D7DA]" /> */}
                <div className="font-semibold text-[#181D27] py-2 text-[18px] flex justify-between">
                  <span>Total</span>
                  <span>{CURRENCY} {toInternationalNumber(deliveryData?.total_amount) || "0.00"}</span>
                </div>
              </div>

              {/* Notes (Mobile) */}
              <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px] mt-[20px]">
                {/* <div className="flex flex-col space-y-[10px]">
                  {deliveryData?.comment && <><div className="font-semibold text-[#181D27]">Customer Note</div>
                    <div>
                      {deliveryData?.comment}
                    </div></>}
                </div> */}
                <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">
                    Payment Method
                  </div>
                  <div>Cash on Delivery</div>
                </div>
              </div>
            </div>
          </div>

          <hr className="text-[#D5D7DA] print:hidden" />

          {/* ---------- Footer Buttons ---------- */}
          <div className="flex flex-wrap justify-end gap-[20px] print:hidden">
            <SidebarBtn
              leadingIcon={loading ? "eos-icons:three-dots-loading" : "lucide:download"}
              leadingIconSize={20}
              label="Download"
              onClick={exportFile}
            />
            <PrintButton targetRef={targetRef as unknown as RefObject<HTMLElement>} />
          </div>
        </ContainerCard>
      </div>
    </>
  );
}  