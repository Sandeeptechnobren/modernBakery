// ...existing code...

"use client";

// Sidebar component for answers (must be after 'use client')
const AnswerSidebar = ({ open, onClose, answers }: { open: boolean; onClose: () => void; answers: any[] }) => (
  <div
    className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-lg z-50 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
    style={{ maxWidth: 400 }}
  >
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">Answers</h2>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
        <Icon icon="lucide:x" width={24} />
      </button>
    </div>
    <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">
      {answers && answers.length > 0 ? (
        <ul className="space-y-3">
          {answers.map((d: any, i: number) => (
            <li key={d.id || i} className="border-b pb-2">
              <span className="font-semibold">Q:</span> {d.question_id} <br />
              <span className="font-semibold">A:</span> {d.answer}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500">No answers found.</div>
      )}
    </div>
  </div>
);

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
import { getSurveyById, updateSurvey, getSurveyShowById } from "@/app/services/allApi";

// ...existing code...
// Sidebar state for viewing answers


interface Customer {
  customer_code: string;
  owner_name: string;
}

interface Merchandiser {
  osa_code: string;
  name: string;
}

interface SurveyQuestion {
  id: number;
  question: string;
  question_type: string;
  question_based_selected: string | null;
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
  questions?: SurveyQuestion[]; // 👈 add this
}


export default function Page() {
  const params = useParams();
  console.log('Route params:', params); // Debug log
  const uuid = params.uuid;
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([]);
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

  // Add Survey Post tab always for now
  const tabs = [
    { name: "Overview" },
    ...(showCustomerTab ? [{ name: "Customer" }] : []),
    { name: "Survey Post" },
  ];
  // Survey Post state
  const [surveyPostLoading, setSurveyPostLoading] = useState(false);
  const [surveyPostData, setSurveyPostData] = useState<any[]>([]);

  // Fetch Survey Post data when tab is active
  useEffect(() => {
    if (tabs[activeTab]?.name !== "Survey Post" || !uuid) return;
    setSurveyPostLoading(true);
    getSurveyShowById(uuid as string)
      .then((res) => {
        // API returns { data: [...] }
        setSurveyPostData(res?.data || []);
      })
      .catch(() => {
        showSnackbar("Unable to fetch survey post data", "error");
      })
      .finally(() => setSurveyPostLoading(false));
  }, [activeTab, uuid]);


  // ✅ FETCH SHELF DATA (clean + single)
  useEffect(() => {
    if (!uuid) {
      setLoading(false);
      showSnackbar("Survey ID is missing from the URL. Please check the link.", "error");
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

          questions: rawData?.questions || [],
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
            <ContainerCard>
              <h1 className="text-lg font-semibold text-gray-800 mb-3">
                Survey Questions
              </h1>

              {surveyData?.questions && surveyData.questions.length > 0 ? (
                <ul className="space-y-3">
                  {surveyData.questions.map((q, index) => (
                    <li
                      key={q.id}
                      className="border-gray-300 border rounded-lg p-3 hover:bg-gray-100 transition"
                    >
                      <div className="font-semibold">
                        Q{index + 1}. {q.question}
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        Type: <span className="capitalize">{q.question_type}</span>
                      </div>

                      {q.question_based_selected && (
                        <div className="text-sm text-gray-500 mt-1">
                          Options: {q.question_based_selected}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No questions added.</div>
              )}
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

      {tabs[activeTab]?.name === "Survey Post" && (
        <>
          <div className="flex flex-col gap-6">
            <ContainerCard>
              <h1 className="text-lg font-semibold text-gray-800 mb-3">Survey Post Data</h1>
              {surveyPostLoading ? (
                <Loading />
              ) : surveyPostData.length === 0 ? (
                <div className="text-gray-500">No survey post data found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-gray-700 font-semibold">
                      <tr>
                        {/* <th className="px-4 py-2 border-b">ID</th> */}
                        <th className="px-4 py-2 border-b">Date</th>
                        <th className="px-4 py-2 border-b">Answerer Name</th>
                        <th className="px-4 py-2 border-b">Address</th>
                        <th className="px-4 py-2 border-b">Phone</th>
                        <th className="px-4 py-2 border-b">Merchandiser</th>
                        <th className="px-4 py-2 border-b">Survey</th>
                        <th className="px-4 py-2 border-b">Answers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyPostData.map((item: any, idx: number) => (
                        <tr key={item.id || idx} className="border-b hover:bg-gray-50 transition">
                          {/* <td className="px-4 py-2">{item.id}</td> */}
                          <td className="px-4 py-2">{item.date ? formatDate(item.date) : '-'}</td>
                          <td className="px-4 py-2">{item.answerer_name}</td>
                          <td className="px-4 py-2">{item.address}</td>
                          <td className="px-4 py-2">{item.phone}</td>
                          <td className="px-4 py-2">{item.merchandiser?.details?.name || '-'}</td>
                          <td className="px-4 py-2">{item.survey?.details?.name || '-'}</td>
                          <td className="px-4 py-2 text-center">
                            <button
                              className="hover:text-red-600"
                              title="View Answers"
                              onClick={() => {
                                setSelectedAnswers(item.details || []);
                                setSidebarOpen(true);
                              }}
                            >
                              <Icon icon="lucide:eye" width={22} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ContainerCard>
          </div>
          {/* Sidebar for answers */}
          <AnswerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} answers={selectedAnswers} />
        </>
      )}
    </>
  );
}
