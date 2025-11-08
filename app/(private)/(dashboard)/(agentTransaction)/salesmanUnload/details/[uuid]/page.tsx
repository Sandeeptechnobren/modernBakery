"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import Table, { configType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Logo from "@/app/components/logo";
import Map from "@/app/components/map";
import TabBtn from "@/app/components/tabBtn";
import { salesmanUnloadHeaderById } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface CustomerItem {
  id: number;
  uuid: string;
  osa_code: string;
  unload_no: string;
  unload_date: string;
  unload_time: string;
  sync_date: string;
  sync_time: string;
  unload_from: string;
  salesman_type: string | null;
  latitude: string;
  longtitude: string;
  load_date: string;
  warehouse: {
    code: string;
    name: string;
  };
  route: {
    code: string;
    name: string;
  };
  salesman: {
    code: string;
    name: string;
  };
  projecttype?: {
    code: string;
    name: string;
  } | null;
  details: Array<{
    id: number;
    uuid: string;
    osa_code: string;
    item: {
      id: number;
      code: string;
      name: string;
    };
    uom: number;
    qty: number;
    price: string;
    status: number;
  }>;
}



export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  const title = `Unload ${customer?.osa_code || "-"}`;
const backBtnUrl = "/salesmanUnload";

  // Tab logic
  const [activeTab, setActiveTab] = useState("overview");
  const tabList = [
    { key: "overview", label: "Overview" },
    { key: "unload", label: "Unload" },
  ];

  const onTabClick = (idx: number) => {
    if (idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  const columns: configType["columns"] = [
      { key: "item", label: "Item" },
      { key: "uom", label: "UOM" },
      { key: "qty", label: "Quantity" },
    ];

  const tableData =
    customer?.details?.map((detail) => ({
      item: detail.item
        ? `${detail.item.code} - ${detail.item.name}`
        : "-",
      uom: detail.uom !== undefined && detail.uom !== null ? String(detail.uom) : "-",
      qty: detail.qty !== undefined && detail.qty !== null ? String(detail.qty) : "-",
      price: detail.price !== undefined && detail.price !== null ? String(detail.price) : "-",
    })) || [];

  useEffect(() => {
    if (!uuid) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await salesmanUnloadHeaderById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Unload Details",
            "error"
          );
          return;
        }
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch Salesman Unload Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [uuid, setLoading, showSnackbar]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* ---------- Main Card ---------- */}
            <ContainerCard className="rounded-xl shadow-sm space-y-8 bg-white p-6">
              {/* Top Section */}
              <div className="flex justify-between flex-wrap gap-6 items-start">
                <Logo type="full" />
      
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-gray-400 uppercase mb-2">
                    Unload
                  </h2>
                  <p className="text-primary text-sm tracking-[5px]">
                    {customer?.osa_code || "-"}
                  </p>
                </div>
              </div>
      
              <hr className="border-gray-200" />
      
              {/* ---------- Info Section ---------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left side - details */}
                <div>
                  <KeyValueData
                    data={[
                      {
                        key: "Warehouse",
                        value:
                          customer?.warehouse?.code && customer?.warehouse?.name
                            ? `${customer.warehouse.code} - ${customer.warehouse.name.split("-")[0]} - (${customer.warehouse.name.split("-")[1]})`
                            : "-",
                      },
                      {
                        key: "Route",
                        value: customer?.route
                          ? `${customer.route.code} - ${customer.route.name}`
                          : "-",
                      },
                      {
                        key: "Salesman Type",
                        value: customer?.salesman_type || "-",
                      },
                      {
                        key: "Salesman",
                        value: customer?.salesman
                          ? `${customer.salesman.code} - ${customer.salesman.name}`
                          : "-",
                      },
                      {
                        key: "Load Date",
                        value: customer?.load_date
                         
                      },
                    ]}
                  />
                </div>
              </div>
      
      
              {/* ---------- Table ---------- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Load Items
                </h3>
                <Table
                  data={tableData}
                  config={{ columns }}
                />
              </div>
      
              {/* ---------- Footer Buttons ---------- */}
              {/* ---------- Footer Buttons ---------- */}
              <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-200">
                <SidebarBtn
                  leadingIcon="lucide:download"
                  leadingIconSize={20}
                  label="Download"
                  // onClick={handleDownload}
                />
                <SidebarBtn
                  isActive
                  leadingIcon="lucide:printer"
                  leadingIconSize={20}
                  label="Print Now"
                  // onClick={handlePrint}
                />
              </div>
      
            </ContainerCard>


    </>
  );
}
