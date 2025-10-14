"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";

import { getPlanogramById } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";

import CustomerTab from "./tabs/customer/page";
import OverviewTab from "./tabs/overview/page";
interface Company {
  id?: string | number;
  company_code?: string;
  company_name?: string;
  logo?: string | null;
}

export const tabs = [
  {
    name: "Overview",
    url: "overview",
    component: <OverviewTab />,
  },
  {
    name: "Customer",
    url: "customer",
    component: <CustomerTab />,
  },

];

export default function Page() {
  const { id, tabName } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [planogram, setPlanogram] = useState<Company | null>(null);

  const { showSnackbar } = useSnackbar();
  const onTabClick = (index: number) => {
    setActiveTab(index);
    // Optionally, if you want route update:
    // router.replace(`/shelf/details/${id}/${tabs[index].url}`);
  };

  const title = "Planogram";
  const backBtnUrl = "/planogram";

  useEffect(() => {
    if (!id) return;

    const fetchShelfDetails = async () => {
      setLoading(true);
      try {
        const res = await getPlanogramById(id.toString());

      
      } catch (error) {
        showSnackbar("Unable to fetch shelf details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShelfDetails();
  }, [id, setLoading, showSnackbar]);

  useEffect(() => {
    if (!tabName) {
      setActiveTab(0); // default tab
    } else {
      const foundIndex = tabs.findIndex((tab) => tab.url === tabName);
      setActiveTab(foundIndex !== -1 ? foundIndex : 0);
    }
  }, [tabName]);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>
      <div className="flex items-center justify-between p-5 border border-gray-400 my-5 rounded-lg bg-white ">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Image */}
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src={planogram?.logo || "/logo.png"}
              alt="Company Logo"
              width={64} // match container width
              height={64} // match container height
              className="object-cover w-full h-full rounded-full"
            />
          </div>

          {/* Owner Info */}
          <div className="flex flex-col justify-center">
            <h1 className="font-semibold text-lg text-gray-900">Dummy Data</h1>

            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-sm text-gray-700 font-medium">
                Owner: Rajneesh
              </h1>
              <button className="flex items-center gap-1 text-xs text-green-700 border border-green-400 px-2 py-0.5 rounded-full bg-green-50">
                <span className="text-green-600">•</span> Active
              </button>
            </div>
          </div>
        </div>

        {/* Right Section (Email Icon) */}
        <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg transition-all duration-200 shadow-sm">
          <Icon icon="lucide:mail" width={20} />
          <span className="text-sm font-medium">Send Email</span>
        </button>
      </div>

      {/* Tabs */}
      <ContainerCard
        className="w-full flex font-inter   items-center p-1  border-r border-gray-3"
        padding="4px"
      >
        {tabs.map((tab, index) => (
          <div key={index}> 
            <TabBtn
              label={tab.name}
              isActive={activeTab === index} 
              onClick={() => onTabClick(index)}
            />a
          </div>
        ))}
      </ContainerCard>

      {/* Tab Content */}
      <ContainerCard>{tabs[activeTab]?.component}</ContainerCard>
    </>
  );
}