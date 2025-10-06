"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { subRegionByID } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type subRegion = {
  area_name: string;
  area_code: string;
  
  status: string; 
    region?: { id: string | number; region_name?: string };
//   region?: { id: string | number };
};

const title = "SubRegion Detail";

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
    const [subRegion, setSubRegion] = useState<subRegion | null>(null);

    useEffect(() => {
        const fetchSubRegionDetails = async () => {
            setLoading(true);
            const res = await subRegionByID(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Sub Region Details",
                    "error"
                );
                throw new Error("Unable to fetch Sub Region Details");
            } else {
                setSubRegion(res.data);
            }
        };
        fetchSubRegionDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/settings/company/subRegion">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="flex flex-wrap gap-x-[20px]">
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="SubRegion Information"
                        data={[
                            { value: subRegion?.area_code, key: "Sub Region Code" },
                            { value: subRegion?.area_name, key: "Sub Region Name" },
                             {
                                key: "Region Name",
                                value: subRegion?.region?.region_name || "-",
                            },
            {
                value: "",
                key: "Status",
                component: <StatusBtn isActive={!!subRegion?.status} />,
            },
                        ]}
                    />
                </ContainerCard>
                
              
                {/* <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Status"
                        data={[
                        ]}
                    />
                </ContainerCard> */}
            </div>
        </>
    );
}
