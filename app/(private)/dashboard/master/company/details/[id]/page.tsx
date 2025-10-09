"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";

import { getCompanyById } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import Address from "./address";
import Overview from "./overview/page";

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
    component: <Overview />,
  },
  {
    name: "Address",
    url: "address",
    component: <Address />,
  },
];

export default function Page() {
  const { id, tabName } = useParams();
  const [activeTab, setActiveTab] = useState(0); // default to Overview tab
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null);

  const { showSnackbar } = useSnackbar()
  const onTabClick = (index: number) => {
    setActiveTab(index);
    // Optionally, if you want route update:
    // router.replace(`/dashboard/master/company/details/${id}/${tabs[index].url}`);
  };

  const title = "Company Details";
  const backBtnUrl = "/dashboard/master/company";

  useEffect(() => {
    if (!id) return;

    const fetchCompanyDetails = async () => {
      setLoading(true);
      try {
        const res = await getCompanyById(id.toString());

        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch company details",
            "error"
          );
          return;
        }

        setCompany(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch company details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
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
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-500">
            <Image
              src={company?.logo || "/logo.png"}
              alt="Company Logo"
              width={150}
              height={150}
              className="h-[150px] w-[150px] object-cover rounded-full border border-[#E4E4E4] bg-[#E9EAEB]"
            />
          </div>

          {/* Owner Info */}
          <div className="flex flex-col justify-center">
            <h1 className="font-semibold text-lg text-gray-900">Dummy Data</h1>

            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-sm text-gray-700 font-medium">Owner: Ayush</h1>
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
      <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabs.map((tab, index) => (
          <div key={index}>
            <TabBtn
              label={tab.name}
              isActive={activeTab === index} // active state color logic
              onClick={() => onTabClick(index)}
            />
          </div>
        ))}
      </ContainerCard>

      {/* Tab Content */}
      <ContainerCard>
        {tabs[activeTab]?.component}
      </ContainerCard>
    </>
  );
}
