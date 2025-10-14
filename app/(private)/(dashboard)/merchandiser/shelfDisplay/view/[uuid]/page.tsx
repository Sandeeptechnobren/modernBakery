"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";
import SummaryCard from "@/app/components/summaryCard";
import { getShelfById } from "@/app/services/merchandiserApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import { OverviewTab } from "./tabs/overview";
import { PlanogramTab } from "./tabs/planogram";
import { ExpiryTab } from "./tabs/expiry";
import { DamageTab } from "./tabs/damage";
import { CustomerTab } from "./tabs/customer";

// --- Shelf Interface ---
interface Customer {
  uuid: number;
  customer_code: string;
  customer_type: string;
  owner_name: string;
}

interface Merchandiser {
  uuid: number;
  osa_code: string;
  type: string;
  name: string;
}

interface Shelf {
  uuid: string;
  shelf_name: string;
  logo?: string | null;
  height?: number;
  width?: number;
  depth?: number;
  valid_from?: string;
  valid_to?: string;
  status?: string | number;
  customers?: Customer[];
  code: string;
  merchandisers?: Merchandiser[];
}

export const tabs = [
  { name: "Overview", url: "overview", component: <OverviewTab /> },
  { name: "Customer", url: "customer", component: <CustomerTab /> },
  { name: "Planogram", url: "planogram", component: <PlanogramTab /> },
  { name: "Damage", url: "damage", component: <DamageTab /> },
  { name: "Expiry", url: "expiry", component: <ExpiryTab /> },
];

export default function Page() {
  const router = useRouter();
  const { uuid: uuid } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shelfData, setShelfData] = useState<Shelf | null>(null);

  const { showSnackbar } = useSnackbar();
  const onTabClick = (index: number) => setActiveTab(index);

  const title = "Shelf Details";
  const backBtnUrl = "/merchandiser/shelfDisplay/";

  useEffect(() => {
    if (!uuid) return;

    const fetchShelfData = async () => {
      setLoading(true);
      try {
        const res = await getShelfById(uuid.toString());
        console.log("API Response:", res); // ✅ Now you will see the console

        // Handle response correctly
        const data = res?.data?.data || res?.data;
        if (!data) {
          showSnackbar("Unable to fetch shelf details", "error");
          return;
        }

        setShelfData(data);
      } catch (error) {
        console.error("Error fetching shelf data:", error);
        showSnackbar("Unable to fetch shelf details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShelfData();
  }, [uuid, showSnackbar]);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {shelfData && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-200 my-5 rounded-lg bg-white gap-6">
          {/* Shelf Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 flex-wrap">
            <div className="p-4 rounded-lg flex flex-col items-start justify-center shadow-sm">
              <h1 className="font-semibold text-xl text-gray-900">
                {shelfData.shelf_name || "-"}
              </h1>

              {shelfData.customers && shelfData.customers.length > 0 && (
                <span className="text-sm text-gray-700 font-medium">
                  Owner: {shelfData.customers[0].owner_name}
                </span>
              )}
            </div>

            {shelfData.status != null && (
              <span
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  shelfData.status == 1 || shelfData.status === "1"
                    ? "text-green-700 border border-green-400 bg-green-50"
                    : "text-red-700 border border-red-400 bg-red-50"
                }`}
              >
                <span
                  className={`${
                    shelfData.status == 1 || shelfData.status === "1"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  •
                </span>{" "}
                {shelfData.status == 1 || shelfData.status === "1"
                  ? "Active"
                  : "Inactive"}
              </span>
            )}
          </div>

          {/* Shelf Code Card */}
          <div className="p-4 rounded-lg flex flex-col items-start justify-center shadow-sm">
            <h1 className="text-xs text-gray-500 uppercase mb-1">Shelf Code</h1>
            <h2 className="text-lg font-semibold text-gray-900">
              {shelfData.code || "SHELF-001"}
            </h2>
          </div>
        </div>
      )}

      {/* Tabs */}
      {shelfData && (
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
