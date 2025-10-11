"use client";

<<<<<<< HEAD:app/(private)/dashboard/master/item/details/[id]/page.tsx
=======
import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { itemById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/details/[id]/page.tsx
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";

import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { itemById } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import Overview from "./overview/page";
import Uom from "./uom/page";

interface Item {
  id?: string | number;
  item_code?: string;
  image?: string | null;
  name?: string;
  status?: string | number;
}

<<<<<<< HEAD:app/(private)/dashboard/master/item/details/[id]/page.tsx
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
];
=======
const title = "Item Details";
const backBtnUrl = "/item";
>>>>>>> 9e5aa16dc8fec75dd2dc093ed4d84dce1ec160fd:app/(private)/(dashboard)/(master)/item/details/[id]/page.tsx

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
  const backBtnUrl = "/dashboard/master/item";

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
      {/* Image */}
      <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
        {/* profile details */}
        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
          <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
            <Image
              src={ "/logo.png"}
              alt="Product Image"
              width={150}
              height={150}
              className="h-[50px] w-[50px] object-cover rounded-full border border-[#E4E4E4] bg-[#E9EAEB]"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {item?.item_code || "-"} - {item?.name || "-"}
            </h2>
            <span className="flex items-center">
              <span className="text-[#414651] text-[16px]">
                <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                  <StatusBtn
                    isActive={
                      item?.status == 1 || item?.status === "1" ? true : false
                    }
                  />
                </span>
              </span>
            </span>
          </div>
        </div>
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
