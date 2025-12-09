"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { BulkTransferByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type BulkTransferData = {
    id: number;
    uuid: string;
    osa_code: string;
    region: {
        id: number;
        code: string;
        name: string;
    };
    area: {
        id: number;
        code: string;
        name: string;
    };
    warehouse: {
        id: number;
        code: string;
        name: string;
    };
    model_number: {
        id: number;
        code: string;
        name: string;
    };
    requestes_asset: number;
    available_stock: number;
    approved_qty: string | number;
    allocate_asset: string | number;
    status: number;
    comment_reject: string | null;
    created_at: string;
};

const title = "Bulk Transfer Details";
const backBtnUrl = "/chillerInstallation/bulkTransfer"

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

    // state variables
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [transferData, setTransferData] = useState<BulkTransferData | null>(null);

    useEffect(() => {
        const fetchTransferDetails = async () => {
            setLoading(true);
            const res = await BulkTransferByUUID(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data?.message || "Unable to fetch Bulk Transfer Details",
                    "error"
                );
            } else {
                setTransferData(res.data);
            }
        };
        fetchTransferDetails();
    }, [uuid]);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="flex flex-wrap gap-x-[20px] gap-y-[20px]">
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        data={[
                            { value: transferData?.osa_code, key: "OSA Code" },
                            { value: transferData?.region?.name, key: "Region" },
                            { value: transferData?.area?.name, key: "Area" },
                            { value: transferData?.warehouse?.name, key: "Warehouse" },
                            { value: transferData?.model_number?.name, key: "Model Number" },

                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        data={[

                            { value: transferData?.available_stock, key: "Available Stock" },
                            { value: transferData?.requestes_asset, key: "Requested Assets" },
                            { value: transferData?.approved_qty || "-", key: "Approved Quantity" },
                            { value: transferData?.allocate_asset || "-", key: "Allocated Assets" },
                            {
                                value: "",
                                key: "Status",
                                component: <StatusBtn isActive={transferData?.status === 1} />
                            },
                        ]}
                    />
                </ContainerCard>

                {transferData?.comment_reject && (
                    <ContainerCard className="w-full lg:w-[350px]">
                        <div>
                            <h3 className="font-semibold mb-2">Rejection Comment</h3>
                            <p className="text-gray-700">{transferData.comment_reject}</p>
                        </div>
                    </ContainerCard>
                )}
            </div>
        </>
    );
}
