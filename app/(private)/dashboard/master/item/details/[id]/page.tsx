"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { itemById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import StatusBtn from "@/app/components/statusBtn2";
import Toggle from "@/app/components/toggle";
import SummaryCard from "@/app/components/summaryCard";

interface Item {
    id: string;
    sap_id: string;
    name:string;
    code:string;
    description:string;
    uom: string;
    upc: string;
    category: {code:string,name:string};
    itemSubCategory: {code:string,name:string};
    vat: string;
    excies: string;
    shelf_life: string;
    community_code: string;
    excise_code: string;
    status: number | string;
    image_url: string;
}

const title = "Item Details";
const backBtnUrl = "/dashboard/master/item";

export default function ViewPage() {
    const params = useParams();
    let id: string = "";
    if (params.id) {
        if (Array.isArray(params.id)) {
            id = params.id[0] || "";
        } else {
            id = params.id as string;
        }
    }

    // state variables
    const [isChecked, setIsChecked] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await itemById(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Item Details",
                    "error"
                );
                throw new Error("Unable to fetch Item Details");
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
            <div className="flex gap-x-[20px]">
            <div>
                <ContainerCard className="w-[350px] flex flex-col gap-y-[20px] p-[20px]">
                <Image
                    src={item?.image_url ? item?.image_url : "/no-image.png"}
                    alt="Item"
                    width={600}
                    height={400}
                    className="w-full h-[180px] object-cover rounded-md border border-[#E4E4E4] bg-[#E9EAEB]"
                />
                <span className="text-[#181D27] text-[20px] font-semibold">{item?.code} - {item?.name}</span>
                 <div className="flex justify-center">
                            <StatusBtn isActive={!!item?.status} />
                          </div>
                </ContainerCard>
            </div>
            <div className="w-full">
                <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                                {/* profile details */}
                                <div className=" sm:flex-row items-center gap-[20px]">
                                
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                            Product Description
                                        </h2>
                                        <span className="flex items-center">
                                            <span className="text-[#414651] text-[16px]">
                                                <span className="font-[400]">
                                                   {item?.description || "-"}
                                                </span>
                                                
                                            </span>
                                        </span>
                                    </div>
                                </div>
                
                               
                            </ContainerCard>
                                                {/* Location Information */}
                                                <ContainerCard className="w-auto  h-fit ">
                                                    <KeyValueData
                                                        title="Product Information"
                                                        data={[
                                                            { key: "SAP Code", value: item?.sap_id || "-" },
                                                            { key: "Product Category", value: item?.category?.name || "-" },
                                                            {
                                                                key: "Base UOM",
                                                                value: item?.uom || "-",
                                                            },
                                                            { key: "Alternate UOM", value: item?.uom || "-" },
                                                            {
                                                                key: "UPC",
                                                                value: item?.upc || "-",
                                                            },
                                                            { key: "Base UOM Vol (LTR)", value:  item?.uom || "-" },
                                                            { key: "Alternate Base UOM Vol (LTR)", value: item?.uom || "-" },
                                                        ]}
                                                    />
                                                </ContainerCard>
                                               
                                                <div className="flex flex-wrap gap-x-[20px] mt-[20px]">
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
                        <KeyValueData
                            title="Pricing & Compliance"
                            data={[
                                { key: "Net Weight (KG)", value: item?.vat || "-" },
                                { key: "Factory Price PC", value: item?.sap_id || "-" },
                                { key: "Factory Price Case", value: item?.category?.name || "-" },
                                { key: "Shelf Life (Days)", value: item?.shelf_life || "-" },
                                { key: "Pack Size", value: item?.community_code || "-" },
                                { key: "Agent Excise", value: item?.excies || "-" },
                                { key: "Direct Sell Excise", value: item?.excise_code || "-" },
                            ]}
                        />
                    </ContainerCard>
                    <ContainerCard className="flex-1 min-w-[320px] max-w-[500px] h-full">
                        <div className="text-[18px] font-semibold mb-[25px]">
                            Barcode
                        </div>
                        <ContainerCard className="w-full mb-[25px] bg-gradient-to-r from-[#E7FAFF] to-[#FFFFFF]">
                            <SummaryCard
                                icon="prime:barcode"
                                iconCircleTw="bg-[#00B8F2] text-white w-[60px] h-[60px] p-[15px]"
                                iconWidth={30}
                                title={"ABC-abc-1234"}
                                description={"Barcode"}
                            />
                        </ContainerCard>
                        <KeyValueData
                            data={[
                                {
                                    key: "Promotional Item",
                                    value: "",
                                    component: (
                                        <Toggle
                                            isChecked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                    ),
                                },
                                { key: "Tax", value: "Vat" },
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
