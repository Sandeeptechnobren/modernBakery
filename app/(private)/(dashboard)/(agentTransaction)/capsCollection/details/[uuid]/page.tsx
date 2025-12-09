"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { capsCollectionByUuid } from "@/app/services/agentTransaction";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, RefObject, useEffect, useRef, useState } from "react";
import Table, { TableDataType } from "@/app/components/customTable";
import PrintButton from "@/app/components/printButton";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Logo from "@/app/components/logo";

const title = "CAPS Collection Details";
const backBtnUrl = "/capsCollection";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const targetRef = useRef<HTMLDivElement | null>(null);

  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [tableData, setTableData] = useState<TableDataType[]>([]);

  /** ------------------------------------------------------
   * Fetch Data
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!uuid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await capsCollectionByUuid(uuid);
        const data = response?.data ?? response;

        setDeliveryData(data);

        /** -------- Map details correctly from API response -------- */
        if (data?.details && Array.isArray(data.details)) {
          const mapped = data.details.map((detail: any, index: number) => ({
            id: String(index + 1),
            itemCode: detail.item_code ?? "-",
            itemName: detail.item_name ?? "-",
            UOM: detail.uom_name ?? "-",
            Quantity: detail.collected_quantity ?? 0,
          }));

          setTableData(mapped);
        }
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to fetch CAPS collection details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, showSnackbar, setLoading]);

  /** ------------------------------------------------------
   * Table Columns
   * ------------------------------------------------------ */
  const columns = [
    { label: "Item Code", key: "itemCode" },
    { label: "Item Name", key: "itemName" },
    { label: "UOM", key: "UOM" },
    { label: "Collected Qty", key: "Quantity" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
        <div className="w-full flex flex-col">
          <div ref={targetRef}>
            <ContainerCard className="rounded-[10px] space-y-[40px]">

              {/* Top Section */}
              <div className="flex justify-between flex-wrap gap-[20px]">
                <Logo type="full" />

                <div className="flex flex-col items-end">
                  <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                    Caps Collection
                  </span>
                  <span className="text-primary text-[14px] tracking-[10px] mb-3">
                    #{deliveryData?.code || ""}
                  </span>
                </div>
              </div>

              <hr className="text-[#D5D7DA]" />

              {/* Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">

                {/* Warehouse */}
                <div>
                  <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
                    <span>Buyer</span>
                    <span className="font-semibold">
                      {deliveryData?.warehouse_code
                        ? `${deliveryData?.warehouse_code} - ${deliveryData?.warehouse_name}`
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div>
                  <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
                    <span>Seller</span>
                    <span className="font-semibold">
                      {deliveryData?.customer || "-"}
                    </span>
                  </div>
                </div>

                {/* Route / Salesman */}
                <div className="flex md:justify-end">
                  <div className="text-primary-bold text-[14px] md:text-right">

                    {deliveryData?.route_code && (
                      <div>
                        Route:{" "}
                        <span className="font-bold">
                          {deliveryData.route_code} - {deliveryData.route_name}
                        </span>
                      </div>
                    )}

                    {deliveryData?.salesman_code && (
                      <div className="mt-2">
                        Sales Team:{" "}
                        <span className="font-bold">
                          {deliveryData.salesman_code} -{" "}
                          {deliveryData.salesman_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <Table
                data={tableData}
                config={{ columns }}
              />

              <hr className="text-[#D5D7DA] print:hidden" />

              {/* Buttons */}
              <div className="flex flex-wrap justify-end gap-[20px] print:hidden">
                {/* <SidebarBtn
                  leadingIcon={"lucide:download"}
                  leadingIconSize={20}
                  label="Download"
                /> */}
                <PrintButton
                  targetRef={targetRef as unknown as RefObject<HTMLElement>}
                />
              </div>

            </ContainerCard>
          </div>
        </div>
      </div>
    </>
  );
}
