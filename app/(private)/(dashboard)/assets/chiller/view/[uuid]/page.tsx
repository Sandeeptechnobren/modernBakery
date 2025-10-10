"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import StatusBtn from "@/app/components/statusBtn2";
import { chillerByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type chiller = {
  serial_number: string,
  asset_number: string,
  model_number: string,
  description: string,
  acquisition: string,
  vender_details: string[] | {id: number, name: string, code: string}[],
  manufacturer: string,
  country_id: number,
  type_name: string,
  sap_code: string,
  status: number,
  is_assign: number,
  customer_id: number,
  agreement_id: number,
  document_type: string,
  document_id: number
}

const title = "Chiller Details";

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
    const [chiller, setChiller] = useState<chiller | null>(null);

    // dropdown data from context
    const { onlyCountryOptions, vendorOptions } = useAllDropdownListData();

    useEffect(() => {
        const fetchChillerDetails = async () => {
            setLoading(true);
            const res = await chillerByUUID(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Chiller Details",
                    "error"
                );
                throw new Error("Unable to fetch Chiller Details");
            } else {
                setChiller(res.data);
            }
        };
        fetchChillerDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/assets/chiller">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="flex flex-wrap lg:gap-[20px]">
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Chiller Basic Information"
                        data={[
                            { value: chiller?.serial_number, key: "Serial Number" },
                            { value: chiller?.asset_number, key: "Asset Number" },
                            { value: chiller?.model_number, key: "Model Number" },
                            { value: chiller?.description, key: "Description" },
                            { value: chiller?.type_name, key: "Type Name" },
                            { value: chiller?.sap_code, key: "SAP Code" },
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Acquisition and Vendor Information"
                        data={[
                            { value: chiller?.acquisition, key: "Acquisition" },
                            { 
                                value: Array.isArray(chiller?.vender_details)
                                    ? (typeof chiller?.vender_details[0] === "string"
                                        ? (chiller?.vender_details as string[]).join(", ")
                                        : (chiller?.vender_details as {id: number, name: string, code: string}[])
                                            .map(v => v.name)
                                            .join(", "))
                                    : "",
                                key: "Vender Details"
                            },
                            { value: chiller?.manufacturer, key: "Manufacturer" },
                            { value: chiller?.country_id, key: "Country Id" },
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Status and Assignment/Location Information"
                        data={[
                            { value: chiller?.is_assign ? "Assigned" : "Not Assigned", key: "Is Assigned" },
                            { value: "", key: "Status", component: <StatusBtn isActive={!!chiller?.status} /> },
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Documentation and Records"
                        data={[
                            { value: "Document Type 1", key: "Document" },
                            { value: "ACF", key: "Document Type" },
                            { value: "Customer 1", key: "Customer" },
                            { value: "Agreement 1", key: "Agreement" },
                        ]}
                    />
                </ContainerCard>
            </div>
        </>
    );
}
