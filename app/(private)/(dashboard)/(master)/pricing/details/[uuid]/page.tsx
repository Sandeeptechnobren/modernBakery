"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";

import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import Overview from "./overview/page";
import KeyValue from "./keyValue/page";

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
    name: "KeyValue",
    url: "keyValue",
    component: <KeyValue />,
  },
    {
    name: "Distributers",
    url: "distributers",
    component: <KeyValue />,
  },
   {
    name: "Items",
    url: "items",
    component: <KeyValue />,
  },
   {
    name: "Items",
    url: "items",
    component: <KeyValue />,
  }
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

  const title = "Pricing Details";
  const backBtnUrl = "/pricing";


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


