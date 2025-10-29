"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getDiscountById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import StatusBtn from "@/app/components/statusBtn2";
import Toggle from "@/app/components/toggle";
import SummaryCard from "@/app/components/summaryCard";

interface Discount {
    uuid?: string;
    id?: string | number;
    osa_code?: string;
    item?: {
        id?: number;
        code?: string;
        name?: string;
    };
    item_category?: { id?: number; category_name?: string; category_code?: string };
    customer?: {
        id?: number;
        name?: string;
        osa_code?: string;
    };
    outlet_channel?: {
        id?: number;
        outlet_channel?: string;
        outlet_channel_code?: string;
    };
    discount_type?: {
        id?: number;
        discount_code?: string;
        discount_name?: string;
    };
    discount_value?: string;
    min_quantity?: string;
    min_order_value?: string;
    start_date?: string;
    end_date?: string;
    status?: string | number;
    image_url?: string;
    description?: string;
}

const title = "Discount Details";
const backBtnUrl = "/discount";

export default function ViewPage() {
    const params = useParams();
    const uuid = Array.isArray(params.uuid) ? (params.uuid[0] || '') : (params.uuid as string || '');

    // state variables
    const [isChecked, setIsChecked] = useState(false);
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [discount, setDiscount] = useState<Discount | null>(null);

    useEffect(() => {
        if (!uuid) return;

        const fetchDiscountDetails = async () => {
            setLoading(true);
            try {
                const res = await getDiscountById(uuid);
                if (res.error) {
                    showSnackbar(
                        res.data?.message || "Unable to fetch Discount Details",
                        "error"
                    );
                    return;
                }
                setDiscount(res.data);
            } catch (error) {
                showSnackbar("Unable to fetch Discount Details", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchDiscountDetails();
    }, [uuid, setLoading, showSnackbar]);

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
                            src={discount?.image_url ? discount.image_url : "/no-image.png"}
                            alt="Discount"
                            width={600}
                            height={400}
                            className="w-full h-[180px] object-cover rounded-md border border-[#E4E4E4] bg-[#E9EAEB]"
                        />
                        <span className="text-[#181D27] text-[20px] font-semibold">{discount?.osa_code || '-'}</span>
                        <div className="flex justify-center">
                            <StatusBtn isActive={!!discount?.status} />
                        </div>
                    </ContainerCard>
                </div>
                <div className="w-full">
                    {/* Location Information */}
                    <ContainerCard className="w-auto h-fit">
                        <KeyValueData
                            title="Product Information"
                            data={[
                                { key: "Item", value: discount?.item?.name || "-" },
                                {
                                    key: "Item Category",
                                    value: discount?.item_category?.category_name || "-",
                                },
                                { key: "Customer", value: discount?.customer?.name || "-" },
                                {
                                    key: "Customer Channel",
                                    value: discount?.outlet_channel?.outlet_channel || "-",
                                },
                                { key: "Discount Type", value: discount?.discount_type?.discount_name || "-" },
                                { key: "Discount Value", value: discount?.discount_value || "-" },
                            ]}
                        />
                    </ContainerCard>

                    <div className="flex flex-wrap gap-x-[20px] mt-[20px]">
                        <div className="flex flex-col md:flex-row gap-6 w-full">
                            <ContainerCard className="flex-1 min-w-[320px] h-full">
                                <KeyValueData
                                    title="Pricing & Compliance"
                                    data={[
                                        { key: "Minimum Quantity", value: discount?.min_quantity || "-" },
                                        { key: "Maximum Order Quantity", value: discount?.min_order_value || "-" },
                                        { key: "Start Date", value: discount?.start_date || "-" },
                                        { key: "End Date", value: discount?.end_date || "-" },
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