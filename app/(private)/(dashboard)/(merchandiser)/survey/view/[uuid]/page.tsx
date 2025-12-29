"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { damageListBySelf, deleteModelStock, expiryListBySelf, getShelfById, modelStockListBySelf, viewStockListBySelf } from "@/app/services/merchandiserApi";

import Loading from "@/app/components/Loading";
import KeyValueData from "@/app/components/keyValueData";
import Table, { TableDataType } from "@/app/components/customTable";
import { formatDate } from "@/app/(private)/(dashboard)/(master)/salesTeam/details/[uuid]/page";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { customer } from "@/app/(private)/data/customerDetails";
import { getSurveyById } from "@/app/services/allApi";

export const tabs = [
  { name: "Overview" },
  { name: "Customer" },
  // { name: "Model Stock" },
];

interface Customer {
  customer_code: string;
  owner_name: string;
}

interface Merchandiser {
  osa_code: string;
  name: string;
}

interface Survey {
  uuid: string;
  survey_name: string;
  survey_code: string;
  survey_type: string;
  start_date: string;
  end_date: string;
  customers?: Customer[];
  merchandisers?: Merchandiser[];
  assets?: any[];
}

export default function Page() {
  const params = useParams();
  const uuid = params.uuid;
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);

  const onTabClick = (index: number) => setActiveTab(index);

  const backBtnUrl = "/survey";

  const SURVEY_TYPE_MAP: Record<string, string> = {
    "1": "Consumer Survey",
    "2": "Sensory Survey",
    "3": "Asset Survey",
  };


  const hasAssets = surveyData?.assets && surveyData.assets.length > 0;
  const hasMerchandisers =
    surveyData?.merchandisers && surveyData.merchandisers.length > 0;
  const hasCustomers =
    surveyData?.customers && surveyData.customers.length > 0;
  const showCustomerTab = !hasAssets && (hasCustomers || hasMerchandisers);

  const tabs = [
    { name: "Overview" },
    ...(showCustomerTab ? [{ name: "Customer" }] : []),
  ];


  // ✅ FETCH SHELF DATA (clean + single)
  useEffect(() => {
    if (!uuid) {
      setLoading(false);
      return;
    }

    const fetchSurveyData = async () => {
      try {
        setLoading(true);

        const res = await getSurveyById(uuid as string);
        const rawData = res?.data?.data || res?.data;

        if (!rawData) {
          showSnackbar("Unable to fetch survey details", "error");
          return;
        }

        // 🔥 NORMALIZE API RESPONSE
        const normalizedData = {
          ...rawData,

          // API: merchandishers → UI: merchandisers
          merchandisers:
            rawData?.merchandishers?.map((m: any) => ({
              osa_code: m.osa_code,
              name: m.name,
            })) || [],

          // API: customers (osa_code + business_name)
          customers:
            rawData?.customers?.map((c: any) => ({
              customer_code: c.osa_code,
              owner_name: c.business_name,
            })) || [],
        };

        setSurveyData(normalizedData);
      } catch (error) {
        console.error("Error fetching survey data:", error);
        showSnackbar("Unable to fetch survey details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [uuid, showSnackbar]);



  if (loading) return <Loading />;
  return (
    <>
      {/* Back Button + Title */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">Survey Details</h1>
      </div>


      {/* TABS */}
      <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabs.map((tab, index) => (
          <TabBtn
            key={index}
            label={tab.name}
            isActive={activeTab === index}
            onClick={() => onTabClick(index)}
          />
        ))}
      </ContainerCard>

      {/* TAB CONTENT */}
      {activeTab === 0 && (
        <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
          <div className="w-full flex flex-col gap-y-[20px]">
            <ContainerCard className="w-full h-fit">
              <KeyValueData
                title="Shelf Details"
                data={[
                  { key: "Survey Name", value: surveyData?.survey_name || "-" },
                  { key: "Survey Code", value: surveyData?.survey_code || "-" },
                  {
                    key: "Survey Type",
                    value: SURVEY_TYPE_MAP[surveyData?.survey_type ?? ""] || "-",
                  },
                  {
                    key: "Start Date",
                    value: surveyData?.start_date
                      ? formatDate(surveyData.start_date)
                      : "-",
                  },
                  {
                    key: "End Date",
                    value: surveyData?.end_date
                      ? formatDate(surveyData.end_date)
                      : "-",
                  },
                ]}
              />
            </ContainerCard>
          </div>
        </div>
      )}

      {tabs[activeTab]?.name === "Customer" && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* --- Merchandisers Section --- */}
          {hasMerchandisers && (
            <div className="flex-1">
              <ContainerCard>
                <h1 className="text-lg font-semibold text-gray-800 mb-3">
                  Merchandiser Information
                </h1>

                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="text-left px-4 py-2 border-b">OSA Code</th>
                      <th className="text-right px-4 py-2 border-b">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveyData!.merchandisers!.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3">{item.osa_code}</td>
                        <td className="px-4 py-3 text-right">{item.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ContainerCard>
            </div>
          )}

          {/* --- Customers Section --- */}
          {hasCustomers && (
            <div className="flex-1">
              <ContainerCard>
                <h1 className="text-lg font-semibold text-gray-800 mb-3">
                  Customer Information
                </h1>

                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700 font-semibold">
                    <tr>
                      <th className="text-left px-4 py-2 border-b">Customer Code</th>
                      <th className="text-right px-4 py-2 border-b">Business Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveyData!.customers!.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3">{item.customer_code}</td>
                        <td className="px-4 py-3 text-right">{item.owner_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ContainerCard>
            </div>
          )}
        </div>
      )}
    </>
  );
}
