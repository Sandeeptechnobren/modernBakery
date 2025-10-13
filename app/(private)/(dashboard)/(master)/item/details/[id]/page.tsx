"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { itemById } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import Overview from "./overview/page";
import Uom from "./uom/page";
import Sales from "./sales/page";
import Return from "./retuen/page";

interface Item {
  id?: number;
  erp_code?: string;
  item_code?: string;
  name?: string;
  description?: string;
  brand?: string;
  image?: string;
  shelf_life?: string;
  commodity_goods_code?: string;
  excise_duty_code?: string;
  status?: number;
  is_taxable?: boolean;
  has_excies?: boolean;
  item_weight?: string;
  volume?: number;
  category?: {
    id?: number;
    name?: string;
    code?: string;
  };
  itemSubCategory?: {
    id?: number;
    name?: string;
    code?: string;
  };
}

export const tabs = [
  {
    name: "Overview",
    url: "overview",
    component: <Overview />,
  },
  {
    name: "UOM",
    url: "uom",
    component: <Uom />,
  },
  {
    name: "Sales",
    url: "sales",
    component: <Sales />,
  },
  {
    name: "Return",
    url: "return",
    component: <Return />,
  },
];

export default function Page() {
  const { id, tabName } = useParams();
  const [activeTab, setActiveTab] = useState(0); // default to Overview tab
  const [loading, setLoading] = useState(false)
  const [item, setitem] = useState<Item | null>(null);

  const { showSnackbar } = useSnackbar()
  const onTabClick = (index: number) => {
    setActiveTab(index);
    // Optionally, if you want route update:
    // router.replace(`/dashboard/master/item/details/${id}/${tabs[index].url}`);
  };

  const title = "Products Details";
  const backBtnUrl = "/item";

  useEffect(() => {
    if (!id) return;

    const fetchitemDetails = async () => {
      setLoading(true);
      try {
        const res = await itemById(id.toString());

        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch item details",
            "error"
          );
          return;
        }

        setitem(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch item details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchitemDetails();
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
     <div className="flex gap-x-[20px] flex-wrap md:flex-nowrap">
       
        

        {/* Right Section */}
        <div className="w-full flex flex-col gap-y-[15px]">

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
        </div>
      </div>

      

      {/* Tab Content */}
      <div>
        {tabs[activeTab]?.component}
      </div>
    </>
  );
}