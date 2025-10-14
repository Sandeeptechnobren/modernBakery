"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { agentCustomerById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";

interface Item {
    id: string;
    uuid: string;
    sap_id: string;
    warehouse_name: string;
    name: string;
    contact_no2: string;
    email: string;
    whatsapp_no: string;
    warehouse_manager: string;
    tin_no: string;
    registation_no: string;
    business_name: string;
    warehouse_type: string;
    city: string;
    location: string;
    address: string;
    stock_capital: string;
    deposite_amount: string;
    district: string;
    town_village: string;
    street: string;
    landmark: string;
    latitude: string;
    longitude: string;
    threshold_radius: string;
    device_no: string;
    accuracy: string;
    creditday: string;
    payment_type: string;
    buyertype: string;
    language: string;
    osa_code: string;
    outlet_channel: {
            outlet_channel: string,
            outlet_channel_code: string
        },
    region: { region_code: string, region_name: string };
    area: { area_code: string, area_name: string };
    customer_type: { name: string, code: string };
    route: { name: string, code: string };
    category: { customer_category_name: string, customer_category_code: string };
    subcategory: { customer_sub_category_name: string, customer_sub_category_code: string };
    status: number | string;
}

const title = "Agent Customer Details";
const backBtnUrl = "/agentCustomer";

export default function ViewPage() {
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
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await agentCustomerById(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Agent Customer Details",
                    "error"
                );
                throw new Error("Unable to fetch Agent Customer Details");
            } else {
                setItem(res.data);
            }
        };
        fetchPlanogramImageDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="m-auto">
                <div className="flex flex-wrap gap-x-[20px]">
                    <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                            <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                                <Icon
                                    icon="lucide:user"
                                    width={40}
                                    className="text-[#535862] scale-[1.5]"
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                    {item?.name}
                                </h2>
                                <span className="flex items-center">
                                    <span className="text-[#414651] text-[16px]">
                                        <span className="font-[600]">Agent Customer Code:</span>{" "}
                                        <span className="font-[400]">
                                            {item?.osa_code || "-"}
                                        </span>

                                    </span>
                                </span>
                            </div>
                        </div>
                        <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                            <StatusBtn isActive={item?.status === 1 || item?.status === '1'} />
                        </span>

                    </ContainerCard>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[20px] w-full">
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Customer Info"
                                    data={[
                                        { key: <span className="font-bold">TIN No.</span>, value: item?.tin_no || '-'},
                                        {
                                            key: "Customer Type Code",
                                            value: item?.customer_type?.code || "-",
                                        },
                                        {
                                            key: "Customer Type Name",
                                            value: item?.customer_type?.name || "-",
                                        },
                                        {
                                            key: "Customer Category Code",
                                            value: item?.category?.customer_category_code || "-",
                                        },
                                        {
                                            key: "Customer Category Name",
                                            value: item?.category?.customer_category_name || "-",
                                        },
                                        {
                                            key: "Customer Sub Category Code",
                                            value: item?.subcategory?.customer_sub_category_code || "-",
                                        },
                                        {
                                            key: "Customer Sub Category Name",
                                            value: item?.subcategory?.customer_sub_category_name || "-",
                                        },
                                        { key: "Business Name", value: item?.business_name || '-' },
                                    ]}
                                />
                                <hr className="text-[#D5D7DA] my-[25px]" />
                                <div>
                                    <div className="text-[18px] mb-[25px] font-semibold">
                                        Contact
                                    </div>
                                    <div className="flex flex-col gap-[20px] text-[#414651]">
                                        <div className="flex items-center gap-[8px] text-[16px]">
                                            <Icon
                                                icon="lucide:phone-call"
                                                width={16}
                                                className="text-[#EA0A2A]"
                                            />
                                            <span>{item?.whatsapp_no} / {item?.contact_no2}</span>
                                        </div>
                                        <div className="flex items-center gap-[8px] text-[16px]">
                                            <Icon
                                                icon="ic:outline-email"
                                                width={16}
                                                className="text-[#EA0A2A]"
                                            />
                                            <span>{item?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-[8px] text-[16px]">
                                            <Icon
                                                icon="lucide:map-pin"
                                                width={16}
                                                className="text-[#EA0A2A]"
                                            />
                                            <span>{item?.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </ContainerCard>
                        </div>
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Location Information"
                                    data={[
                                        { key: "Region Code", value: item?.region?.region_code || "-" },
                                        {
                                            key: "Region Name",
                                            value: item?.region?.region_name || "-",
                                        },
                                        { key: "Sub Region Code", value: item?.area?.area_code || "-" },
                                        {
                                            key: "Sub Region Name",
                                            value: item?.area?.area_name || "-",
                                        },
                                        { key: "Outlet Channel Code", value: item?.outlet_channel?.outlet_channel_code || "-" },
                                        {
                                            key: "Outlet Channel Name",
                                            value: item?.outlet_channel?.outlet_channel || "-",
                                        },
                                        { key: "Route Code", value: item?.route?.code || "-" },
                                        {
                                            key: "Route Name",
                                            value: item?.route?.name || "-",
                                        },
                                        { key: "Location", value: item?.location || "-" },
                                        { key: "City", value: item?.city || "-" },
                                        { key: "District", value: item?.district || "-" },
                                        { key: "Town Village", value: item?.town_village || "-" },
                                        { key: "Street", value: item?.street || "-" },
                                        { key: "Landmark", value: item?.landmark || "-" },
                                       
                                    ]}
                                />
                            </ContainerCard>
                        </div>
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Additional Information"
                                    data={[
                                        { key: "Lattitude", value: item?.latitude || "-" },
                                        {
                                            key: "Longitude",
                                            value: item?.longitude || "-",
                                        },
                                        { key: "Threshold Radius", value: item?.threshold_radius || "-" },
                                        { key: "Payment Type", value: item?.payment_type || "-" },
                                        { key: "Buyer Type", value: item?.buyertype || "-" },
                                        { key: "Accuracy", value: item?.accuracy || "-" },
                                        { key: "Credit Day", value: item?.creditday || "-" },
                                        { key: "Language", value: "English" },
                                    ]}
                                />
                            </ContainerCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
