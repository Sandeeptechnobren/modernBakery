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
import Address from "./address/page";
import Overview from "./overview/page";
import StatusBtn from "@/app/components/statusBtn2";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

interface Company {
  id?: string | number;
  company_code?: string;
  company_name?: string;
  logo?: string | null;
  status?: string | number;
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
  };

  const title = "Company Details";
  const backBtnUrl = "/settings/company";

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
          {/* Image */}
          <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                          {/* profile details */}
                          <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                              <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                                  <Image
                                        src={company?.logo || "/logo.png"}
                                        alt="Company Logo"
                                        width={150}
                                        height={150}
                                        className="h-[50px] w-[50px] object-cover rounded-full border border-[#E4E4E4] bg-[#E9EAEB]"
                                      />
                              </div>
                              <div className="text-center sm:text-left">
                                  <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                      {company?.company_code || "-"} - {company?.company_name || "-"}
                                  </h2>
                                  <span className="flex items-center">
                                      <span className="text-[#414651] text-[16px]">
                                          <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                             <StatusBtn
                                                   isActive={
                                                     company?.status == 1 || company?.status === "1" ? true : false
                                                   }
                                                 />
                                          </span>
                                      </span>
                                  </span>
                              </div>
                          </div>
          
                          {/* contact button */}
                          <SidebarBtn
                              isActive={true}
                              label="Send Email"
                              labelTw="text-[16px] font-semibold mb-[4px] sm:hidden md:flex"
                              leadingIcon="ic:outline-email"
                              leadingIconSize={20}
                          />
                      </ContainerCard>

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
      <div>
        {tabs[activeTab]?.component}
      </div>
    </>
  );
}