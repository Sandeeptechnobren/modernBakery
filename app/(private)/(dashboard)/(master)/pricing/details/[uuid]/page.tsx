"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pricingHeaderById } from "@/app/services/allApi";
import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";

import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import Overview from "./overview/page";
import KeyValue from "./keyValue/page";
import { useLoading } from "@/app/services/loadingContext";
import Table from "@/app/components/customTable";

interface Company {
  id?: string | number;
  company_code?: string;
  company_name?: string;
  logo?: string | null;
  status?: string | number;
}

interface PricingItem {
  uuid?: string;
  id?: number | string;
  code?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: number[] | string;
  status?: string;
}

export default function Page() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";
  const [activeTab, setActiveTab] = useState(1);
  const [pricing, setpricing] = useState<PricingItem | null>(null);
  const { setLoading } = useLoading();

  const { showSnackbar } = useSnackbar();
  const onTabClick = (index: number) => {
    setActiveTab(index);
  };

  const title = "Pricing Details";
  const backBtnUrl = "/pricing";

  const tabs = ["Overview", "Key Value", "Distributers", "Items"];
  useEffect(() => {
    if (!uuid) return;
    const fetchPricingDetails = async () => {
      setLoading(true);
      try {
        const res = await pricingHeaderById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch pricing Details",
            "error"
          );
          return;
        }
        setpricing(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch pricing Details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPricingDetails();
  }, [uuid, setLoading, showSnackbar]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 0:
        return <Overview pricing={pricing} />;
      case 1:
        return <KeyValue pricing={pricing} />;
      case 2:
        return <KeyValue pricing={pricing} key={3} section="warehouse" />;
      case 3:
        return <KeyValue pricing={pricing} key={10} section="item" />;
      case 3:
        return <>
          {/* <Table
            data={pricing}
            config={}
          /> */}
        </>;
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* Tabs */}
      <ContainerCard
        className="w-full flex gap-[4px] overflow-x-auto"
        padding="5px"
      >
        {tabs.map((tab, index) => (
          <div key={index}>
            <TabBtn
              label={tab}
              isActive={activeTab === index}
              onClick={() => onTabClick(index)}
            />
          </div>
        ))}
      </ContainerCard>

      {renderActiveTab()}
    </>
  );
}
