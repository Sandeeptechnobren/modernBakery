"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";

import { downloadFile, getSalesmanById, getSalesmanBySalesId } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
// import Role from "./role/page";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import Table, { configType, searchReturnType, TableDataType } from "@/app/components/customTable";
import KeyValueData from "@/app/components/keyValueData";
import StatusBtn from "@/app/components/statusBtn2";
import { exportInvoice } from "@/app/services/agentTransaction";

// import Attendance from "./attendance/page";

interface Salesman {
  id?: string | number;
  uuid?: string;
  osa_code?: string;
  name?: string;
  vehicle_chesis_no?: string;
  salesman_type?: {
    id?: number;
    salesman_type_code?: string;
    salesman_type_name?: string;
  };
  designation?: string;
  route?: {
    id?: number;
    route_code?: string;
    route_name?: string;
  };
  warehouse?: {
    id?: number;
    warehouse_code?: string;
    warehouse_name?: string;
  };
  device_no?: string;
  username?: string;
  contact_no?: string;
  status?: string | number;
  image_url?: string | null;
  description?: string | null;
  is_block?: string | number;
  block_date_from?: string;
  block_date_to?: string;
  cashier_description_block?: string;
  invoice_block?: string | number;
  reason?: string;
  forceful_login?: string | number;
}



export default function Page() {
  const { id, tabName } = useParams();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { showSnackbar } = useSnackbar();
  // const onTabClick = (index: number) => {
  //   setActiveTab(index);
  // };
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";
  const [salesman, setSalesman] = useState<Salesman | null>(null);


  const title = "Salesman Details";
  const backBtnUrl = "/salesman";


  const columns: configType["columns"] = [
    { key: "invoice_date", label: "Data", render: (row: TableDataType) => row.invoice_date.split("T")[0] },
    { key: "invoice_time", label: "Time" },
    {
      key: "invoice_number",
      label: "Invoice Number"
    },
    {
      key: "customer_id",
      label: "Customer",
      render: (row: TableDataType) =>
        typeof row.customer_id === "object" &&
          row.customer_id !== null &&
          "customer_id" in row.customer_id
          ? (row.customer_id as { customer_id?: string })
            .customer_id || "-"
          : "-",
    },
    {
      key: "warehouse_id",
      label: "Warehouse",
      render: (row: TableDataType) =>
        typeof row.warehouse_id === "object" &&
          row.warehouse_id !== null &&
          "warehouse_name" in row.warehouse_id
          ? (row.warehouse_id as { warehouse_name?: string })
            .warehouse_name || "-"
          : "-",
    },
    {
      key: "route_id",
      label: "Route",
      render: (row: TableDataType) => {
        if (
          typeof row.route_id === "object" &&
          row.route_id !== null &&
          "route_name" in row.route_id
        ) {
          return (row.route_id as { route_name?: string }).route_name || "-";
        }
        return typeof row.route_id === 'string' ? row.route_id : "-";
      },
    },
    { key: "total_amount", label: "Invoice Total", render: (row: TableDataType) => toInternationalNumber(row.total_amount) },

  ];


  const salesBySalesman = useCallback(
    async (
      pageNo: number = 1,
      pageSize: number = 50
    ): Promise<searchReturnType> => {
      const result = await getSalesmanBySalesId(uuid);
      if (result.error) {
        throw new Error(result.data?.message || "Search failed");
      }

      return {
        data: result.data || [],
        currentPage: result?.pagination?.page || 1,
        pageSize: result?.pagination?.limit || pageSize,
        total: result?.pagination?.totalPages || 1,
      };
    },
    []
  );

  const exportFile = async (uuid: string, format: string) => {
    try {
      const response = await exportInvoice({ uuid, format }); // send proper body object

      if (response && typeof response === "object" && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to download data", "error");
    }
  };



  useEffect(() => {
    if (!uuid) return;

    const fetchSalesmanDetails = async () => {
      setLoading(true);
      try {
        const res = await getSalesmanById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Details",
            "error"
          );
          return;
        }
        setSalesman(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch Salesman Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesmanDetails();
  }, [uuid, setLoading, showSnackbar]);

  const onTabClick = (idx: number) => {
    // ensure index is within range and set the corresponding tab key
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };


  const [activeTab, setActiveTab] = useState("overview");
  const tabList = [
    { key: "overview", label: "Overview" },
    { key: "attendence", label: "Attendence" },
    { key: "sales", label: "Sales" },
    { key: "order", label: "Order" },
  ];


  // useEffect(() => {
  //   if (!tabName) {
  //     setActiveTab(0); // default tab
  //   } else {
  //     const foundIndex = tabs.findIndex((tab) => tab.url === tabName);
  //     setActiveTab(foundIndex !== -1 ? foundIndex : 0);
  //   }
  // }, [tabName]);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>
      {/* Image */}
      <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
        {/* profile details */}
        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
          <div className=" flex justify-center items-center rounded-full bg-[#E9EAEB]">
            <Image
              src={"/dummyuser.webp"}
              alt="salesman Logo"
              width={150}
              height={150}
              className="h-[100px] w-[100px] object-cover rounded-full]"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {salesman?.osa_code || "-"} - {salesman?.name}
            </h2>
            <span className="flex items-center">
              <span className="text-[#414651] text-[16px]">
                <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]"></span>
              </span>
            </span>
          </div>
        </div>


        <StatusBtn
          isActive={
            salesman?.status == 1 || salesman?.status === "1" ? true : false
          }
        />
      </ContainerCard>

      {/* Tabs */}
      <ContainerCard
        className="w-full flex gap-[4px] overflow-x-auto"
        padding="5px"
      >
        {tabList.map((tab, index) => (
          <div key={index}>
            <TabBtn
              label={tab.label}
              isActive={activeTab === tab.key} // active state color logic
              onClick={() => onTabClick(index)}
            />
          </div>
        ))}
      </ContainerCard>

      {activeTab === "overview" && (
        <ContainerCard className="w-full h-fit">
          <KeyValueData
            title="Salesman Information"
            data={[
              {
                key: "Salesman Type",
                value: salesman?.salesman_type?.salesman_type_name || "-",
              },
              { key: "Designation", value: salesman?.designation || "-" },
              { key: "Contact No", value: salesman?.contact_no || "-" },
              {
                key: "Warehouse",
                value: salesman?.warehouse?.warehouse_name || "-",
              },
              {
                key: "Route",
                value: salesman?.route?.route_name || "-",
              },
              { key: "User Name", value: salesman?.osa_code || "-" },
              {
                key: "Forcefull Login",
                value:
                  salesman?.forceful_login === 1 ||
                    salesman?.forceful_login === "1"
                    ? "Yes"
                    : "No",
              },
              {
                key: "Is Block",
                value:
                  salesman?.is_block === 1 || salesman?.is_block === "1"
                    ? "Yes"
                    : "No",
              },
              { key: "Block Date From", value: salesman?.block_date_from || "-" },
              { key: "Block Date To", value: salesman?.block_date_to || "-" },
              { key: "cashier Description Block", value: salesman?.cashier_description_block || "-" },
              {
                key: "Invoice Block",
                value:
                  salesman?.invoice_block === 1 ||
                    salesman?.invoice_block === "1"
                    ? "Yes"
                    : "No",
              },

              {
                key: "Is Block Reason",
                value: salesman?.reason || "-",
              },
            ]}
          />
        </ContainerCard>
      )}

      {activeTab === "attendence" && (
        <ContainerCard className="w-full h-fit">
          <div className="text-center">Data not found</div>
        </ContainerCard>
      )}

      {activeTab === "sales" && (
        <ContainerCard >

          <div className="flex flex-col h-full">
            <Table
              config={{
                api: {
                  // search: searchCustomerById,
                  list: salesBySalesman
                },
                header: {
                  searchBar: false
                },
                showNestedLoading: true,
                footer: { nextPrevBtn: true, pagination: true },
                columns: columns,
                table: {
                  height: 500,
                },
                rowSelection: false,
                rowActions: [
                  {
  icon: "material-symbols:download",
  onClick: (data: TableDataType) => {
    exportFile(data.uuid, "pdf"); // or "excel", "csv" etc.
  },
}
                ],
                pageSize: 50,
              }}
            />
          </div>

        </ContainerCard>
      )}

      {activeTab === "order" && (
        <ContainerCard className="w-full h-fit">
          <div className="text-center">Data not found</div>
        </ContainerCard>
      )}
    </>
  );
}
