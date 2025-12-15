"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { chillerRequestByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { planogramImageById } from "@/app/services/merchandiserApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import StatusBtn from "@/app/components/statusBtn2";

interface PlanogramImageItem {
    id: string;
    customer: string;
    merchandiser: string;
    shelf: string;
    image_url: string;
}

const title = "Planogram Image Details";
const backBtnUrl = "/merchandiser/planogramImage";

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
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [planogramImage, setPlanogramImage] = useState<PlanogramImageItem | null>(null);

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await planogramImageById(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Planogram Image Details",
                    "error"
                );
                throw new Error("Unable to fetch Planogram Image Details");
            } else {
                setPlanogramImage(res.data);
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
                    src={planogramImage?.image_url ? planogramImage?.image_url : "/no-image.png"}
                    alt="Planogram Image"
                    width={600}
                    height={400}
                    className="w-full h-[180px] object-cover rounded-md border border-[#E4E4E4] bg-[#E9EAEB]"
                />
                {/* <span className="text-[#181D27] text-[20px] font-semibold">Riham Rapid Watermelon 50Pcs x 12S</span> */}
                </ContainerCard>
            </div>
            <div>
                <div className="flex flex-wrap gap-x-[20px]">
                    <ContainerCard className="w-full lg:w-[350px]">
                        <KeyValueData
                            data={[
                                { key: "Customer", value: planogramImage?.customer && planogramImage?.customer && typeof planogramImage?.customer === "object" && "name" in planogramImage?.customer
                                        ? (planogramImage?.customer as { name: string }).name || "-"
                                        : "-" 
                                },
                                { key: "Merchandiser", value: planogramImage?.merchandiser && planogramImage?.merchandiser && typeof planogramImage?.merchandiser === "object" && "name" in planogramImage?.merchandiser
                                        ? (planogramImage?.merchandiser as { name: string }).name || "-"
                                        : "-"
                                },
                                { key: "Shelf", value: planogramImage?.shelf && planogramImage?.shelf && typeof planogramImage?.shelf === "object" && "name" in planogramImage?.shelf
                                        ? (planogramImage?.shelf as { name: string }).name || "-"
                                        : "-" 
                                },
                            ]}
                        />
                    </ContainerCard>
                </div>
            </div>
            </div>
        </>
    );
}
