"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import ContainerCard from "@/app/components/containerCard";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { agentDeliveryExport, deliveryByUuid } from "@/app/services/agentTransaction";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import PrintButton from "@/app/components/printButton";
import { downloadFile } from "@/app/services/allApi";

interface DeliveryDetail {
  id: number;
  item?: {
    id: number;
    code: string;
    name: string;
  };
  uom_name?: string;
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
  comment?: string;
  customer?: {
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    contact_no?: string;
    email?: string;
    town?: string;
    landmark?: string;
    district?: string;
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
    address?: string;
    owner_number?: string;
    owner_email?: string;
  };
  details?: DeliveryDetail[];
  gross_total?: string;
  discount?: string;
  net_total?: string;
  net_amount?: string;
  excise?: string;
  vat?: string;
  delivery_charges?: string;
  total?: string;
}

interface TableRow {
  id: string;
  itemCode: string;
  itemName: string;
  name: string;
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
];

const columns = [
  { key: "id", label: "#", width: 60 },
  { key: "itemCode", label: "Product Code" },
  { key: "itemName", label: "Product Name", width: 250 },
  { key: "name", label: "UOM" },
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
          const response = await deliveryByUuid(uuid);
          const data = response?.data ?? response;
          setDeliveryData(data);

          // Map details to table data
          if (data?.details && Array.isArray(data.details)) {
            const mappedData = data.details.map((detail: DeliveryDetail, index: number) => ({
              id: (index + 1).toString(),
              itemCode: detail.item?.code || "-",
              itemName: detail.item?.name || "-",
              name: detail.uom_name || "-", // Fixed: use uom_name from API
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

  // Helper function to check if value exists and is not null/empty
  const hasValue = (value: any) => {
    return value !== null && value !== undefined && value !== "" && value !== "0" && value !== "0.00";
  };

  // Build key-value data dynamically based on available values
  const keyValueData = [
    hasValue(deliveryData?.gross_total) && { key: "Gross Total", value: `AED ${deliveryData?.gross_total}` },
    // hasValue(deliveryData?.discount) && { key: "Discount", value: `AED ${deliveryData?.discount}` },
    hasValue(deliveryData?.net_total || deliveryData?.net_amount) && { 
      key: "Net Total", 
      value: `AED ${deliveryData?.net_total || deliveryData?.net_amount || "0.00"}` 
    },
    // hasValue(deliveryData?.excise) && { key: "Excise", value: `AED ${deliveryData?.excise}` },
    hasValue(deliveryData?.vat) && { key: "Vat", value: `AED ${deliveryData?.vat}` },
    hasValue(deliveryData?.delivery_charges) && { 
      key: "Delivery Charges", 
      value: `AED ${deliveryData?.delivery_charges}` 
    },
  ].filter(Boolean); // Remove null/false entries

  const exportFile = async () => {
    try {
      const response = await agentDeliveryExport({ uuid: uuid, format: "csv" });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
    } finally {
    }
  };

  const printRef = React.useRef<HTMLDivElement>(null);

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
            Delivery Details
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          {/* Uncomment if needed */}
        </div>
      </div>

      {/* ---------- Order Info Card ---------- */}
      <div ref={printRef}>
        <ContainerCard className="rounded-[10px] space-y-[40px]">
          <div className="flex justify-between flex-wrap gap-[20px]">
            <div className="flex flex-col gap-[10px]">
              <Logo type="full" />
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
                <span className="font-semibold">
                  {deliveryData?.warehouse?.code && deliveryData?.warehouse?.name
                    ? `${deliveryData?.warehouse?.code} - ${deliveryData?.warehouse?.name}`
                    : "-"}
                </span>
                {hasValue(deliveryData?.warehouse?.address) && (
                  <span>Address: {deliveryData?.warehouse?.address}</span>
                )}
                {(hasValue(deliveryData?.warehouse?.owner_number) || hasValue(deliveryData?.warehouse?.owner_email)) && (
                  <span>
                    {hasValue(deliveryData?.warehouse?.owner_number) && (
                      <>Phone: {deliveryData?.warehouse?.owner_number}</>
                    )}
                    {hasValue(deliveryData?.warehouse?.owner_number) && hasValue(deliveryData?.warehouse?.owner_email) && <br />}
                    {hasValue(deliveryData?.warehouse?.owner_email) && (
                      <>Email: {deliveryData?.warehouse?.owner_email}</>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
              <span>To (Customer)</span>
              <div className="flex flex-col space-y-[10px]">
                <span className="font-semibold">
                  {deliveryData?.customer?.code ? deliveryData?.customer?.code : ""}
                  {deliveryData?.customer?.code && deliveryData?.customer?.name ? " - " : ""}
                  {deliveryData?.customer?.name ? `${deliveryData?.customer?.name}` : ""}
                </span>
                {hasValue(deliveryData?.customer?.town) && (
                  <span>Town: {deliveryData?.customer?.town}</span>
                )}
                {hasValue(deliveryData?.customer?.landmark) && (
                  <span>Landmark: {deliveryData?.customer?.landmark}</span>
                )}
                {hasValue(deliveryData?.customer?.district) && (
                  <span>District: {deliveryData?.customer?.district}</span>
                )}
                {
                  <span>
                    {deliveryData?.customer?.contact_no && (
                      <>Phone: {deliveryData?.customer?.contact_no}</>
                    )}
                    {deliveryData?.customer?.email && (
                      <>Phone: {deliveryData?.customer?.email}</>
                    )}
                  </span>
                }
              </div>
            </div>
          </div>

          {/* Dates / meta - right column */}
          <div className="flex md:justify-end">
            <div className="text-primary-bold text-[14px] md:text-right">
              {hasValue(deliveryData?.delivery_date) && deliveryData?.delivery_date && (
                <div>
                  Delivery Date:{" "}
                  <span className="font-bold">
                    {new Date(deliveryData.delivery_date).toLocaleDateString('en-GB')}
                  </span>
                </div>
              )}
              {(hasValue(deliveryData?.route?.code) || hasValue(deliveryData?.route?.name)) && (
                <div className="mt-2">
                  Route:{" "}
                  <span className="font-bold">
                    {deliveryData?.route?.code && deliveryData?.route?.name
                      ? `${deliveryData.route.code} - ${deliveryData.route.name}`
                      : deliveryData?.route?.code || deliveryData?.route?.name}
                  </span>
                </div>
              )}
              {(hasValue(deliveryData?.salesman?.code) || hasValue(deliveryData?.salesman?.name)) && (
                <div className="mt-2">
                  Salesman:{" "}
                  <span className="font-bold">
                    {deliveryData?.salesman?.code && deliveryData?.salesman?.name
                      ? `${deliveryData.salesman.code} - ${deliveryData.salesman.name}`
                      : deliveryData?.salesman?.code || deliveryData?.salesman?.name}
                  </span>
                </div>
              )}
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
                {keyValueData.map((kv: any) => (
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
                {deliveryData?.comment && <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">Customer Note</div>
                  <div>
                    {deliveryData?.comment || ""}
                  </div>
                </div>}
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
              onClick={exportFile}
            />
            <PrintButton targetRef={printRef as React.RefObject<HTMLDivElement>} />
          </div>
        </ContainerCard>
      </div>
    </>
  );
}