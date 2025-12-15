"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getCompititorById } from "@/app/services/merchandiserApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import { OverviewTab } from "./tabs/overview";
interface compititor {
  uuid: string;
  company_name: string;
  code: string;

}

export const tabs = [
  { name: "Overview", url: "overview", component: <OverviewTab /> },

];

export default function Page() {
  const router = useRouter();
  const { uuid: uuid } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compititor, setCompititorData] = useState<compititor | null>(null);

  const { showSnackbar } = useSnackbar();
  const onTabClick = (index: number) => setActiveTab(index);

  const title = "Compititor Information";
  const backBtnUrl = "/merchandiser/competitor/";

  useEffect(() => {
    if (!uuid) return;

    const fetchCompititorData = async () => {
      setLoading(true);
      try {
        const res = await getCompititorById(uuid.toString());
        // Handle response correctly
        const data = res?.data?.data || res?.data;
        if (!data) {
          showSnackbar("Unable to fetch Competitor details", "error");
          return;
        }

        setCompititorData(data);
      } catch (error) {
        showSnackbar("Unable to fetch Compititor details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompititorData();
  }, [uuid, showSnackbar]);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {compititor && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-200 my-5 rounded-lg bg-white gap-6">
          {/* Shelf Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 flex-wrap">
            <div className="p-4 rounded-lg flex flex-col items-start justify-center ">
              <h1 className="text-xs text-gray-500 uppercase mb-1">Comapany Name</h1>
              <h1 className="font-semibold text-xl text-gray-900">
                {compititor.company_name || "-"}
              </h1>
            
            </div>
          </div>

          <div className="p-4 rounded-lg flex flex-col items-start justify-center ">
            <h1 className="text-xs text-gray-500 uppercase mb-1">  Code</h1>
            <h2 className="text-lg font-semibold text-gray-900">
              {compititor.code || "Compititor-001"}
            </h2>
          </div>
        </div>
      )}

    

      {/* Tab Content */}
      {tabs[activeTab]?.component}
    </>
  );
}
