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
import Image from "next/image";
import StatusBtn from "@/app/components/statusBtn2";

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
  { name: "Overview", url: "overview", component: <Overview /> },
  { name: "UOM", url: "uom", component: <Uom /> },
  { name: "Sales", url: "sales", component: <Sales /> },
  { name: "Return", url: "return", component: <Return /> },
];

export default function Page() {
  const { id, tabName } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<Item | null>(null);

  const { showSnackbar } = useSnackbar();

  const onTabClick = (index: number) => {
    setActiveTab(index);
  };

  const title = "Product Details";
  const backBtnUrl = "/item";

  useEffect(() => {
    if (!id) return;

    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        const res = await itemById(id.toString());

        if (res.error) {
          showSnackbar(res.data?.message || "Unable to fetch item details", "error");
          return;
        }
        setItem(res.data);
      } catch {
        showSnackbar("Unable to fetch item details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, showSnackbar]);

  useEffect(() => {
    if (!tabName) {
      setActiveTab(0);
    } else {
      const foundIndex = tabs.findIndex((tab) => tab.url === tabName);
      setActiveTab(foundIndex !== -1 ? foundIndex : 0);
    }
  }, [tabName]);

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side - Image Section */}
        <div className="md:w-[350px] flex-shrink-0">
          <ContainerCard className="p-[20px] flex flex-col gap-y-[20px]">
            <Image
              src={"/no-image.png"}
              alt="item"
              width={600}
              height={400}
              className="w-full h-[200px] object-cover rounded-md border border-[#E4E4E4] bg-[#E9EAEB]"
            />
            <span className="text-[#181D27] text-[20px] font-semibold text-center">
              {item?.item_code || "-"} - {item?.name}
            </span>
            <div className="flex justify-center">
              <StatusBtn isActive={item?.status === 1} />
            </div>
          </ContainerCard>
        </div>

        {/* Right Side - Description, Tabs, and Tab Content */}
        <div className="flex-1 flex flex-col gap-y-[5px]">
          {item?.description && (
            <ContainerCard className="w-full">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.description}
              </p>
            </ContainerCard>
          )}

          {/* Tabs */}
          <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
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

          {/* Tab Content */}
          <div className="w-full">{tabs[activeTab]?.component}</div>
        </div>
      </div>
    </>
  );
}
