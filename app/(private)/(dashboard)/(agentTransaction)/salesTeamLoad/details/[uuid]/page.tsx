"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import Table, { configType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Logo from "@/app/components/logo";
import {
  salesmanLoadByUuid,
  exportSalesmanLoadDownload,
} from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, RefObject, useRef } from "react";
import PrintButton from "@/app/components/printButton";
import { downloadFile } from "@/app/services/allApi";
import WorkflowApprovalActions from "@/app/components/workflowApprovalActions";

interface CustomerItem {
  id: number;
  uuid: string;
  osa_code: string;
  request_step_id: number;
  salesman_type: { id: number; code: string; name: string };
  warehouse: { id: number; code: string; name: string };
  route: { id: number; code: string; name: string };
  salesman: { id: number; code: string; name: string };
  project_type: { id: number; code: string; name: string };
  details: Array<{
    id: number;
    uuid: string;
    osa_code: string;
    item: { id: number; code: string; name: string };
    uom_name: string;
    qty: number;
    price: string;
    status: number;
  }>;
}

const backBtnUrl = "/salesTeamLoad";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [loading, setLoadingState] = useState<boolean>(false);

  const title = `Load #${customer?.osa_code || "-"}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await salesmanLoadByUuid(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Load Details",
            "error"
          );
          return;
        }
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch Salesman Load Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, setLoading, showSnackbar]);

  // ✅ Table config
  const columns: configType["columns"] = [
    { key: "item", label: "Item" },
    { key: "qty", label: "Quantity" },
    { key: "price", label: "Price" },
  ];

  // ✅ Prepare table data
  const tableData =
    customer?.details?.map((detail) => ({
      item: detail.item ? `${detail.item.code} - ${detail.item.name}` : "-",
      uom: detail.uom_name || "-",
      qty: detail.qty?.toString() ?? "-",
      price: detail.price ?? "-",
    })) || [];

  const targetRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon
            icon="lucide:arrow-left"
            width={24}
            className="cursor-pointer"
          />
        </Link>
        <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
          {title}
        </h1>
      </div>

      <WorkflowApprovalActions
        requestStepId={customer?.request_step_id}
        redirectPath={backBtnUrl}
        model="Load_Header"
      />

      {/* ---------- Main Card ---------- */}
      <div ref={targetRef}>
        <ContainerCard>
          {/* Add print-area wrapper */}
          <div id="print-area">
            {/* Top Section */}
            <div className="flex justify-between flex-wrap gap-6 items-start">
              <Logo type="full" />
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                    Load
                  </span>
                  <span className="text-primary text-[14px] tracking-[8px]">
                    #{customer?.osa_code || "-"}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 my-5" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
              {/* ---------- Left Side (Details) ---------- */}
              <div className="lg:col-span-1">
                <KeyValueData
                  data={[
                    {
                      key: "Distributor",
                      value:
                        customer?.warehouse?.code && customer?.warehouse?.name
                          ? `${customer.warehouse.code} - ${customer.warehouse.name}`
                          : "-",
                    },
                    {
                      key: "Route",
                      value: customer?.route
                        ? `${customer.route.code} - ${customer.route.name}`
                        : "-",
                    },
                    {
                      key: "Sales Team Type",
                      value: customer?.salesman_type?.name || "-",
                    },
                    {
                      key: "Project Type",
                      value: customer?.project_type?.name || "-",
                    },
                    {
                      key: "Sales Team",
                      value: customer?.salesman
                        ? `${customer.salesman.code} - ${customer.salesman.name}`
                        : "-",
                    },
                  ]}
                />
              </div>

              {/* ---------- Right Side (Table) ---------- */}
              <div className="lg:col-span-2 w-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Load Items
                </h3>
                <Table data={tableData} config={{ columns }} />
              </div>

              {/* <div className="lg:col-span-2 w-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Load Items
                </h3>
                <Table data={tableData} config={{ columns }} />
              </div> */}
            </div>
            {/* ---------- Right Side (Table) ---------- */}
          </div>

          {/* ---------- Footer Buttons ---------- */}
          {/* <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
          <SidebarBtn
            leadingIcon="lucide:download"
            leadingIconSize={20}
            label="Download"
            onClick={handleDownload}
          />*/}

          <div  className="flex flex-wrap justify-end gap-4 pt-4 print:hidden">
            <PrintButton
              targetRef={targetRef as unknown as RefObject<HTMLElement>}
            />
          </div>
        </ContainerCard>
      </div>
    </>
  );
}
