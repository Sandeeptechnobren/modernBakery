"use client";

import ContainerCard from "@/app/components/containerCard";
import Table, { configType, TableDataType } from "@/app/components/customTable";
import KeyValueData from "@/app/components/keyValueData";
import StatusBtn from "@/app/components/statusBtn2";
import TabBtn from "@/app/components/tabBtn";
import { getCompanyCustomerById } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { downloadFile } from "@/app/services/allApi";
import Skeleton from "@mui/material/Skeleton";
import { formatDate } from "../../../salesTeam/details/[uuid]/page";

interface CustomerItem {
  id: number;
  sap_code: string;
  osa_code: string;
  business_name: string;
  company_type: string;
  language: string;
  contact_number?: string;
  business_type: string;
  town: string;
  landmark: string;
  district: string;
  get_region: { id: number; region_code: string; region_name: string; }
  get_area: { id: number; area_code: string; area_name: string; }
  payment_type: string;
  creditday: string;
  tin_no: string;
  creditlimit: number;
  totalcreditlimit: number;
  credit_limit_validity?: string;
  bank_guarantee_name: string;
  bank_guarantee_amount: number;
  bank_guarantee_from: string;
  bank_guarantee_to: string;
  distribution_channel_id: string;
  merchendiser_ids: string;
  status: string;
}

const title = "Key Customer Details";
const backBtnUrl = "/keyCustomer";
export function getPaymentType(value: string): string {
  switch (value) {
    case "1":
      return "Cash";
    case "2":
      return "Cheque";
    case "3":
      return "Transfer";
    default:
      return "UNKNOWN";
  }
}
export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params?.uuid)
    ? params?.uuid[0] || ""
    : (params?.uuid as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  const onTabClick = (idx: number) => {
    // ensure index is within range and set the corresponding tab key
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  // const IconComponentData2 = ({row}:{row:TableDataType})=>{
  //   const [smallLoading, setSmallLoading] = useState(false)
  //   const { showSnackbar } = useSnackbar();

  //   const exportOrderFile = async (uuid: string, format: string) => {
  //     try {
  //       setSmallLoading(true)
  //       const response = await exportOrderInvoice({ uuid, format }); // send proper body object

  //       if (response && typeof response === "object" && response.download_url) {
  //         await downloadFile(response.download_url);
  //         showSnackbar("File downloaded successfully", "success");
  //       setSmallLoading(false)


  //       } else {
  //         showSnackbar("Failed to get download URL", "error");
  //       setSmallLoading(false)

  //       }
  //     } catch (error) {
  //       console.error(error);
  //       showSnackbar("Failed to download data", "error");
  //       setSmallLoading(false)

  //     }
  //   };

  //   return(smallLoading?<Skeleton/>:<div className="cursor-pointer" onClick={()=>{
  //                       exportOrderFile(row.uuid, "pdf"); // or "excel", "csv" etc.

  //       }}><Icon  icon="material-symbols:download"/></div>)
  // }
  useEffect(() => {
    if (!uuid) return;

    const fetchCompanyCustomerDetails = async () => {
      setLoading(true);
      try {
        const res = await getCompanyCustomerById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch key customer details",
            "error"
          );
          return;
        }
        console.log(res)
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch key customer details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyCustomerDetails();
  }, [uuid, setLoading, showSnackbar]);

  const Columns: configType["columns"] = [
    { key: "osa_code", label: "Code", showByDefault: true },
    { key: "order_code", label: "Order Code", showByDefault: true },
    { key: "delivery_code", label: "Delivery Code", showByDefault: true },
    {
      key: "warehouse_code", label: "Distributor", showByDefault: true, render: (row: TableDataType) => {
        const code = row.warehouse_code || "";
        const name = row.warehouse_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
    },
    {
      key: "route_code", label: "Route", showByDefault: true, render: (row: TableDataType) => {
        const code = row.route_code || "";
        const name = row.route_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
    },
    {
      key: "customer_code", label: "Customer", showByDefault: true, render: (row: TableDataType) => {
        const code = row.customer_code || "";
        const name = row.customer_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
    },
    {
      key: "salesman_code", label: "Sales Team", showByDefault: true, render: (row: TableDataType) => {
        const code = row.salesman_code || "";
        const name = row.salesman_name || "";
        return `${code}${code && name ? " - " : ""}${name}`;
      }
    },
    //  { key: "action", label: "Action",sticky:"right", render: (row: TableDataType) => {


    //       return(<IconComponentData2 row={row} />)
    //     } }
  ];

  // Tab logic
  const [activeTab, setActiveTab] = useState("overview");
  const tabList = [
    { key: "overview", label: "Overview" },
    { key: "address", label: "Location Info" },
    { key: "financial", label: "Financial Info" },
    { key: "guarantee", label: "Guarantee Info" },
    { key: "purchase", label: "Purchase" },
    { key: "creditNote", label: "Credit Note" },
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
      <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
        {/* profile details */}
        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
          <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
            <Icon
              icon="lucide:user"
              width={40}
              className="text-[#535862] scale-[1.5]"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {customer?.osa_code} - {customer?.business_name}
            </h2>

          </div>
        </div>
        <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
          <StatusBtn isActive={customer?.status == "1"} />
        </span>

      </ContainerCard>
      <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">



        <div className="w-full flex flex-col">
          <div className="flex ">

            <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
              {tabList.map((tab, index) => (
                <div key={index}>
                  <TabBtn
                    label={tab.label}
                    isActive={activeTab === tab.key}
                    onClick={() => onTabClick(index)}
                  />
                </div>
              ))}
            </ContainerCard>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Customer Information"
                data={[
                  { key: "SAP Code", value: customer?.sap_code || "-" },
                  { key: "Language", value: customer?.language || "-" },
                  { key: "Contact No.", value: customer?.contact_number || "-" },
                  { key: "Company Type", value: customer?.company_type || "-" },
                  {
                    key: "Business Type",
                    value:
                      Number(customer?.business_type) === 0
                        ? "Buyer"
                        : "Seller",
                  }


                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "address" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Location Information"
                data={[
                  { key: "Region", value: `${customer?.get_region?.region_code} - ${customer?.get_region?.region_name}` || "-" },

                  { key: "Area", value: `${customer?.get_area?.area_code} - ${customer?.get_area?.area_name}` || "-" },


                  { key: "Town", value: customer?.town || "-" },
                  { key: "Landmark", value: customer?.landmark || "-" },
                  { key: "District", value: customer?.district || "-" },
                ]}
              />

            </ContainerCard>
          )}
          {activeTab === "financial" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Financial Information"
                data={[
                  { key: "Payment Type", value: getPaymentType(customer ? customer.payment_type : "") || "-" },
                  { key: "Credit Days", value: customer?.creditday || "-" },
                  { key: "Credit Limit", value: customer?.creditlimit?.toString() || "-" },
                  { key: "Total Credit Limit", value: customer?.totalcreditlimit?.toString() || "-" },
                  { key: "Credit Limit Validity", value: customer?.credit_limit_validity || "-" },
                  { key: "TIN No", value: customer?.tin_no || "-" },
                  {
                    key: "Distribution Channel ID",
                    value: customer?.distribution_channel_id?.toString() || "-",
                  },
                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "guarantee" && (
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Guarantee Details"
                data={[
                  { key: "Guarantee Name", value: customer?.bank_guarantee_name || "-" },
                  { key: "Guarantee Amount", value: customer?.bank_guarantee_amount?.toString() || "-" },
                  {
                    key: "Guarantee From",
                    value: customer?.bank_guarantee_from
                      ? formatDate(customer.bank_guarantee_from)
                      : "-"
                  },
                  {
                    key: "Guarantee To",
                    value: customer?.bank_guarantee_to
                      ? formatDate(customer.bank_guarantee_to)
                      : "-"
                  },

                ]}
              />
            </ContainerCard>
          )}
          {activeTab === "purchase" && (
            <ContainerCard >

              <div className="flex flex-col h-full">
                <Table
                  config={{
                    header: {
                      filterByFields: [
                        {
                          key: "start_date",
                          label: "Start Date",
                          type: "dateChange"
                        },
                        {
                          key: "end_date",
                          label: "End Date",
                          type: "dateChange"
                        },

                      ],
                      searchBar: false,
                    },
                    showNestedLoading: true,
                    footer: { nextPrevBtn: true, pagination: true },
                    table: {
                      height: 500,
                    },
                    columns: Columns,
                    rowSelection: false,
                    rowActions: [
                      // {
                      //     icon: "material-symbols:download",
                      //     onClick: (data: TableDataType) => {
                      //         exportFile(data.uuid, "csv"); // or "excel", "csv" etc.
                      //     },
                      // }
                    ],
                    pageSize: 50,
                  }}
                />
              </div>

            </ContainerCard>
          )}
          {activeTab === "creditNote" && (
            <ContainerCard >

              <div className="flex flex-col h-full">
                <Table
                  config={{
                    header: {
                      filterByFields: [
                        {
                          key: "start_date",
                          label: "Start Date",
                          type: "dateChange"
                        },
                        {
                          key: "end_date",
                          label: "End Date",
                          type: "dateChange"
                        },

                      ],
                      searchBar: false,
                    },
                    showNestedLoading: true,
                    footer: { nextPrevBtn: true, pagination: true },
                    table: {
                      height: 500,
                    },
                    columns: Columns,
                    rowSelection: false,
                    rowActions: [
                      // {
                      //     icon: "material-symbols:download",
                      //     onClick: (data: TableDataType) => {
                      //         exportFile(data.uuid, "csv"); // or "excel", "csv" etc.
                      //     },
                      // }
                    ],
                    pageSize: 50,
                  }}
                />
              </div>

            </ContainerCard>
          )}
        </div>
      </div>
    </>
  );
}

