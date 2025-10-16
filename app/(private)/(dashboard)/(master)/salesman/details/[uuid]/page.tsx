"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ContainerCard from "@/app/components/containerCard";
import TabBtn from "@/app/components/tabBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Image from "next/image";

import { getSalesmanById } from "@/app/services/allApi";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Link from "next/link";
import Role from "./role/page";
import Overview from "./overview/page";
import StatusBtn from "@/app/components/statusBtn2";
import Attendance from "./attendance/page";

interface Salesman {
  id?: string | number;
  uuid?: string;
  osa_code?: string;
  name?: string;
  status?: string | number;
}

export const tabs = [
  {
    name: "Overview",
    url: "overview",
    component: <Overview />,
  },
  {
    name: "Role",
    url: "role",
    component: <Role />,
  },
  {
    name: "Attendance",
    url: "attendance",
    component: <Attendance />,
  },
];

export default function Page() {
  const { id, tabName } = useParams();
  const [activeTab, setActiveTab] = useState(0); // default to Overview tab
  const [loading, setLoading] = useState(false);

  const { showSnackbar } = useSnackbar();
  const onTabClick = (index: number) => {
    setActiveTab(index);
  };
  const params = useParams();
  const uuid = Array.isArray(params.uuid)
    ? params.uuid[0] || ""
    : (params.uuid as string) || "";
      const [salesman, setSalesman] = useState<Salesman | null>(null);
    

  const title = "Salesman Details";
  const backBtnUrl = "/salesman";

 useEffect(() => {
    if (!uuid) return;

    const fetchSalesmanDetails = async () => {
      setLoading(true);
      try {
        const res = await getSalesmanById(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Details",
            "error"
          );
          return;
        }
        setSalesman(res.data);
      } catch (error) {
        showSnackbar("Unable to fetch Salesman Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesmanDetails();
  }, [uuid, setLoading, showSnackbar]);


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
          <div className=" flex justify-center items-center rounded-full bg-[#E9EAEB]">
            <Image
              src={"/dummyuser.webp"}
              alt="salesman Logo"
              width={150}
              height={150}
              className="h-[100px] w-[100px] object-cover rounded-full]"
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {salesman?.osa_code || "-"} - {salesman?.name}
            </h2>
            <span className="flex items-center">
              <span className="text-[#414651] text-[16px]">
                <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]"></span>
              </span>
            </span>
          </div>
        </div>

        {/* contact button */}
        <StatusBtn
          isActive={
            salesman?.status == 1 || salesman?.status === "1" ? true : false
          }
        />
      </ContainerCard>

      {/* Tabs */}
      <ContainerCard
        className="w-full flex gap-[4px] overflow-x-auto"
        padding="5px"
      >
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
      <div>{tabs[activeTab]?.component}</div>
    </>
  );
}
