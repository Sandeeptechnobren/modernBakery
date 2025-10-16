"use client";

import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import Overview from "./overview";
import Additional from "./additional";
import Location from "./location";
import TabBtn from "@/app/components/tabBtn";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { agentCustomerById } from "@/app/services/allApi";
import Financial from "./financial";

export interface AgentCustomerDetails {
    id: string;
    uuid: string;
    osa_code: string;
    name: string;
    contact_no: string;
    contact_no2: string;
    whatsapp_no: string;
    is_whatsapp: string;
    vat_no: string;
    get_warehouse: { warehouse_code: string; warehouse_name: string };
    district: string;
    street: string;
    landmark: string;
    town: string;
    owner_name: string;
    latitude: string;
    longitude: string;
    creditday: string;
    payment_type: string;
    buyertype: string;
    credit_limit:string;
    outlet_channel: {
        outlet_channel: string;
        outlet_channel_code: string;
    };
    region: { region_code: string; region_name: string };
    customertype: { name: string; code: string };
    route: { route_name: string; route_code: string };
    category: {
        customer_category_name: string;
        customer_category_code: string;
    };
    subcategory: {
        customer_sub_category_name: string;
        customer_sub_category_code: string;
    };
    status: number | string;
}

const tabs = ["Overview"];

export default function CustomerDetails() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Overview");

    const onTabClick = (name: string) => {
        setActiveTab(name);
    };

    const params = useParams();
    let uuid: string = "";
    if (params.uuid) {
        if (Array.isArray(params.uuid)) {
            uuid = params.uuid[0] || "";
        } else {
            uuid = params.uuid as string;
        }
    }
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [item, setItem] = useState<AgentCustomerDetails | null>(null);

    useEffect(() => {
        if (!uuid) return;

        let mounted = true;
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            try {
                const res = await agentCustomerById(uuid);
                if (!mounted) return;
                if (res?.error) {
                    showSnackbar(
                        res?.data?.message ||
                            "Unable to fetch Agent Customer Details",
                        "error"
                    );
                    return;
                }
                setItem(res.data);
            } catch (err) {
                if (mounted) {
                    showSnackbar(
                        "Unable to fetch Agent Customer Details",
                        "error"
                    );
                    console.error(err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchPlanogramImageDetails();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.back()}
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
                        Agent Customer Details
                    </h1>
                </div>
            </div>

            <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                {/* profile details */}
                <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                    <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                        <Icon
                            icon="gridicons:user"
                            width={40}
                            className="text-[#535862] scale-[1.5]"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                            {item?.osa_code || ""} - {item?.name || "Customer Name"}
                        </h2>
                        <span className="flex items-center text-[#414651] text-[16px]">
                                <Icon
                                    icon="mdi:location"
                                    width={16}
                                    className="text-[#EA0A2A] mr-[5px]"
                                />
                                <span>
                                    {item?.district}
                                </span>
                                {/* <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                    <StatusBtn status="active" />
                                </span> */}
                        </span>
                    </div>
                </div>
                {/* action buttons */}
                <div className="flex items-center gap-[10px]">
                    <StatusBtn
                        isActive={item?.status ? true : false}
                    />
                </div>
            </ContainerCard>

            {/* tabs */}
            <ContainerCard
                className="w-full flex gap-[4px] overflow-x-auto"
                padding="5px"
            >
                {tabs.map((tab, index) => (
                    <div key={index}>
                        <TabBtn
                            label={tab}
                            isActive={activeTab === tab}
                            onClick={() => {
                                onTabClick(tab);
                            }}
                        />
                    </div>
                ))}
            </ContainerCard>
            {activeTab === "Overview" ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px]">
                <Overview data={item} />
                <Financial data={item} />
                <Additional data={item} />
                <Location data={item} />
                </div>
            ) : activeTab === "Location" ? (
                <Location data={item} />
            ) : activeTab === "Financial" ? (
                <Financial data={item} />
            ) : activeTab === "Additional" ? (
                <Additional data={item} />
            ) : null}
        </>
    );
}
