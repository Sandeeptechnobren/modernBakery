"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";
import SummaryCard from "@/app/components/summaryCard";
import { getPlanogramById } from "@/app/services/merchandiserApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import { OverviewTab } from "./tabs/overview";
import { CustomerData } from "./tabs/customer";
import { differenceInDays, parseISO } from "date-fns";

// import { PlanogramTab } from "./tabs/planogram";

// --- Shelf Interface ---
interface Customer {
  uuid: number;
  customer_code: string;
  customer_type: string;
  business_name: string;
}

interface Merchandiser {
  uuid: number;
  osa_code: string;
  type: string;
  name: string;
}

interface Planogram {
  uuid: string;
  name: string;
  //   logo?: string | null;
  valid_from?: string;
  valid_to?: string;
  customers?: Customer[];
  code: string;
  merchandisers?: Merchandiser[];
}

export const tabs = [
  { name: "Overview", url: "overview", component: <OverviewTab /> },
  { name: "Customer", url: "customer", component: <CustomerData /> },
];

export default function Page() {
  const router = useRouter();
  const { uuid: uuid } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planogramData, setPlanogramData] = useState<Planogram | null>(null);

  const { showSnackbar } = useSnackbar();
  const onTabClick = (index: number) => setActiveTab(index);

  const title = "Planogram Details";
  const backBtnUrl = "/planogram/";

  useEffect(() => {
    if (!uuid) return;

    const fetchShelfData = async () => {
      setLoading(true);
      try {
        const res = await getPlanogramById(uuid.toString());
        console.log("API Response:", res); // ✅ Now you will see the console

        // Handle response correctly
        const data = res?.data?.data || res?.data;
        if (!data) {
          showSnackbar("Unable to fetch Planogram details", "error");
          return;
        }

        setPlanogramData(data);
      } catch (error) {
        console.error("Error fetching Planogram data:", error);
        showSnackbar("Unable to fetch shelf details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid, showSnackbar]);

  const renderRemainingDays = (planogramData: Planogram | null) => {
    if (!planogramData?.valid_to) return "No expiry date";

    const today = new Date();
    const validTo = parseISO(planogramData.valid_to);

    const diff = differenceInDays(validTo, today);

    if (diff <= 0) {
      return "Expired";
    } else {
      return `${diff} day${diff !== 1 ? "s" : ""} remaining`;
    }
  };

  // ✅ Usage
  const statusText = renderRemainingDays(planogramData);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {planogramData && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-200 my-5 rounded-lg bg-white gap-6">
          {/* Shelf Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 flex-wrap">
            <div className="p-4 rounded-lg flex flex-col items-start justify-center shadow-sm">
              <h1 className="font-semibold text-xl text-gray-900">
                {planogramData.name || "-"}
              </h1>

              {planogramData.customers &&
                planogramData.customers.length > 0 && (
                  <span className="text-sm text-gray-700 font-medium">
                    Owner: {planogramData.customers[0].business_name}
                  </span>
                )}
            </div>
          </div>

          {/* Shelf Code Card */}
          <div className="p-4 rounded-lg flex flex-col items-start justify-center shadow-sm">
            <h1 className="text-xs text-gray-500 uppercase mb-1">
              Planogram Code
            </h1>
            <h2 className="text-lg font-semibold text-gray-900">
              {planogramData.code || "SHELF-001"}
            </h2>
            <h2 className={`text-sm ${statusText.includes("remaining") ? "text-green-500" : "text-red-500"} font-medium`}>
              {statusText || ""}
            </h2>
          </div>
        </div>
      )}

      {/* Tabs */}
      {planogramData && (
        <ContainerCard
          className="w-full flex gap-[4px] overflow-x-auto"
          padding="5px"
        >
          {tabs.map((tab, index) => (
            <div key={index}>
              <TabBtn
                label={tab.name}
                isActive={activeTab === index}
                onClick={() => onTabClick(index)}
              />
            </div>
          ))}
        </ContainerCard>
      )}

      {/* Tab Content */}
      <ContainerCard>{tabs[activeTab]?.component}</ContainerCard>
    </>
  );
}
