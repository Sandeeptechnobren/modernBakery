"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { vendorByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type FormValues = {
    name: string;
    address: string;
    contact: string;
    email: string;
    status: number;
};

const title = "Vendor Details";
const backBtnUrl = "/assets/vendor"

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
    const [vendor, setVendor] = useState<FormValues | null>(null);

    useEffect(() => {
        const fetchVendorDetails = async () => {
            setLoading(true);
            const res = await vendorByUUID(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Vendor Details",
                    "error"
                );
                throw new Error("Unable to fetch Vendor Details");
            } else {
                setVendor(res.data);
            }
        };
        fetchVendorDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="flex flex-wrap gap-x-[20px]">
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        data={[
                            { value: vendor?.name, key: "Name" },
                            { value: vendor?.address, key: "Address" },
                            { value: vendor?.contact, key: "Contact" },
                            { value: vendor?.email, key: "Email" },
                            { value: "", key: "Status", component: <StatusBtn isActive={!!vendor?.status} /> },

                        ]}
                    />
                </ContainerCard>
            </div>
        </>
    );
}
