"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, RefObject, Fragment } from "react";
import { returnByUuid, invoiceByUuid,exportReturneWithDetails} from "@/app/services/agentTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import PrintButton from "@/app/components/printButton";
import KeyValueData from "@/app/components/keyValueData";
import { downloadFile } from "@/app/services/allApi";

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
  header_id: number;
  osa_code: string;
  currency_id: number;
  currency_name: string;
  company_id: number;
  order_number: string;
  order_code: string;
  delivery_number: string;
  delivery_code: string;
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  route_id: number;
  route_code: string;
  route_name: string;
  customer_id: number;
  customer_code: string;
  customer_name: string;
  salesman_id: number;
  salesman_code: string;
  salesman_name: string;
  invoice_date: string;
  invoice_time: string;
  gross_total: number;
  vat: number;
  pre_vat: number;
  net_total: number;
  promotion_total: number;
  discount: number;
  total_amount: number;
  status: number;
  uuid: string;
  details: {
    item_code: string;
    item_name: string;
    uom_name: string;
    return_reason: string;
    returntype_name: string;
    item_quantity: number;
    item_price: number;
    vat: number;
    pre_vat: number;
    net_total: number;
    item_total: number;
    total: number;
  }[];
}

interface TableRow {
  item_code: string;
  item_name: string;
  uom_name: string;
  quantity: number;
  itemvalue: number;
  vat: number;
  pre_vat: number;
  net_total: number;
  item_total: number;
  [key: string]: string | number;
}

const columns = [
  { key: "id", label: "#", width: 60 },
  { key: "itemCode", label: "Product Code" },
  { key: "itemName", label: "Product Name", width: 250 },
  { key: "UOM", label: "UOM" },
  { key: "Quantity", label: "Quantity" },
  { key: "Price", label: "Price", render: (value: TableDataType) => <>{toInternationalNumber(value.Price) || '0.00'}</> },
  { key: "returntype_name", label: "Return Type" },
  { key: "return_reason", label: "Reason" },
  { key: "total", label: "Total", render: (value: TableDataType) => <>{toInternationalNumber(value.Total) || '0.00'}</> },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoadingState] = useState<boolean>(false);

  const [deliveryData, setDeliveryData] = useState<InvoiceData | null>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const CURRENCY = localStorage.getItem("country") || "";

  const uuid = params?.uuid as string;

  useEffect(() => {
    if (uuid) {
      (async () => {
        try {
          setLoading(true);
          const response = await returnByUuid(uuid);
          const data = response?.data ?? response;
          setDeliveryData(data);

          // Map details to table data
          if (data?.details && Array.isArray(data.details)) {
            const mappedData = data.details.map((detail: InvoiceData["details"][number], index: number) => ({
              id: String(index + 1),
              itemCode: String(detail.item_code ?? "-"),
              itemName: String(detail.item_name ?? "-"),
              UOM: String(detail.uom_name ?? "-"),
              returntype_name: String(detail.returntype_name ?? "-"),
              return_reason: String(detail.return_reason ?? "-"),
              Quantity: String(detail.item_quantity ?? 0),
              Price: String(detail.item_price ?? 0),
              // Excise: String(detail.itemvalue ?? 0),
              // Excise: "0",
              Discount: "0",
              Net: String(detail.net_total ?? 0),
              Vat: String(detail.vat ?? 0),
              preVat: String(detail.pre_vat ?? 0),
              Total: String(detail.total ?? 0),
            }));
            setTableData(mappedData);
          }
        } catch (error) {
          console.error("Error fetching invoice data:", error);
          showSnackbar("Failed to fetch invoice details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [uuid, setLoading, showSnackbar]);

  // Calculate totals from details if API doesn't provide them
  const calculatedGrossTotal = deliveryData?.details?.reduce(
    (sum, item) => sum + Number(item.net_total ?? item.item_total ?? item.total ?? 0),
    0
  ) ?? 0;

  const calculatedVat = deliveryData?.details?.reduce(
    (sum, item) => sum + Number(item.vat ?? 0),
    0
  ) ?? 0;

  const calculatedTotal = deliveryData?.details?.reduce(
    (sum, item) => sum + Number(item.total ?? item.item_total ?? 0),
    0
  ) ?? 0;

  // Prefer API values, fall back to calculated values
  const grossTotal = Number(deliveryData?.gross_total ?? calculatedGrossTotal ?? 0);
  const vatTotal = Number(deliveryData?.vat ?? calculatedVat ?? 0);
  const netTotal = Number(deliveryData?.net_total ?? grossTotal ?? 0);
  const finalTotal = Number(deliveryData?.total_amount ?? calculatedTotal ?? 0);

  // const keyValueData = [
  //   //  { key: "Gross Total", value: CURRENCY + " " + toInternationalNumber(grossTotal ?? 0) },
  //   //  { key: "VAT", value: CURRENCY + " " + toInternationalNumber(vatTotal ?? 0) },
  //   // { key: "Gross Total", value: CURRENCY + "" + {toInternationalNumber(grossTotal)} },
  //   // { key: "VAT", value: `CURRENCY ${toInternationalNumber(vatTotal)}` },
  //   // { key: "Pre VAT", value: `AED ${toInternationalNumber(Number(deliveryData?.pre_vat || 0))}` },
  // ];

  const targetRef = useRef<HTMLDivElement | null>(null);

  const exportFile = async () => {
        try {
          setLoadingState(true);
          const response = await exportReturneWithDetails({ uuid: uuid, format: "pdf" });
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
            Distributor&apos;s Return Details
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          {/* Put action buttons here if needed */}
        </div>
      </div>

      {/* ---------- Order Info Card ---------- */}
      <div ref={targetRef}>
        <ContainerCard className="rounded-[10px] space-y-[40px]">
          <div className="flex justify-between flex-wrap gap-[20px]">
            <div className="flex flex-col gap-[10px]">
              <Logo type="full" />
            </div>

            <div className="flex flex-col items-end">
              <span className="flex justify-end text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                Return
              </span>
              <span className="text-primary text-[14px] tracking-[10px] mb-3">
                #{deliveryData?.osa_code || ""}
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
                      {(deliveryData?.warehouse_code || deliveryData?.warehouse_name) ? (
                        <span className="font-semibold">
                          {deliveryData?.warehouse_code && deliveryData?.warehouse_name
                            ? `${deliveryData.warehouse_code} - ${deliveryData.warehouse_name}`
                            : deliveryData?.warehouse_code || deliveryData?.warehouse_name}
                        </span>
                      ) : null}
                    </div>
                  </div>
            </div>

            {/* To (Customer) */}
            <div>
              <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
                <span>Buyer</span>
                <div className="flex flex-col space-y-[10px]">
                  {(deliveryData?.customer_code || deliveryData?.customer_name) && (
                    <span className="font-semibold">
                      {deliveryData?.customer_code && deliveryData?.customer_name
                        ? `${deliveryData.customer_code} - ${deliveryData.customer_name}`
                        : deliveryData?.customer_code || deliveryData?.customer_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dates / meta - right column */}
            <div className="flex md:justify-end">
              <div className="text-primary-bold text-[14px] md:text-right">
                {deliveryData?.invoice_date && (
                  <div>
                    Invoice Date: <span className="font-bold">{new Date(deliveryData.invoice_date).toLocaleDateString('en-GB')}</span>
                  </div>
                )}
                {(deliveryData?.route_code || deliveryData?.route_name) && (
                  <div className="mt-2">
                    Route: <span className="font-bold">
                      {deliveryData?.route_code && deliveryData?.route_name
                        ? `${deliveryData.route_code} - ${deliveryData.route_name}`
                        : deliveryData?.route_code || deliveryData?.route_name}
                    </span>
                  </div>
                )}
                {(deliveryData?.salesman_code || deliveryData?.salesman_name) && (
                  <div className="mt-2">
                    Sales Team: <span className="font-bold">
                      {deliveryData?.salesman_code && deliveryData?.salesman_name
                        ? `${deliveryData.salesman_code} - ${deliveryData.salesman_name}`
                        : deliveryData?.salesman_code || deliveryData?.salesman_name}
                    </span>
                  </div>
                )}
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
                <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">Payment Method</div>
                  <div>Cash on Delivery</div>
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-[10px] w-full lg:w-[350px] pb-[20px] lg:pb-0 mb-[20px] lg:mb-0">
                {/* {keyValueData.map((kv) => (
                  <Fragment key={kv.key}>
                    <KeyValueData data={[kv]} />
                    <hr className="text-[#D5D7DA]" />
                  </Fragment>
                ))} */}
                <div className="font-semibold text-[#181D27] py-2 text-[18px] flex justify-between">
                  <span></span>
                  <span>Total - {CURRENCY} {toInternationalNumber(Number(finalTotal)) || 0}</span>
                                    {/* <span>{CURRENCY} {toInternationalNumber(finalTotal) || 0}</span> */}
                  
                </div>
              </div>

              {/* Notes (Mobile) */}
              <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px] mt-[20px]">
                <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">Payment Method</div>
                  <div>Cash on Delivery</div>
                </div>
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
              onClick={exportFile}

            />
            <PrintButton targetRef={targetRef as unknown as RefObject<HTMLElement>} />
          </div>
        </ContainerCard>
      </div>
    </>
  );
}