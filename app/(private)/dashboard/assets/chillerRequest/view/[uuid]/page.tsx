"use client";

import KeyValueData from "@/app/(private)/dashboard/master/customer/[customerId]/keyValueData";

import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { chillerRequestByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type chillerRequest = {
  outlet_name: string;
  owner_name: string;
  contact_number: string;
  outlet_type: string;
  machine_number: string;
  asset_number: string;
  agent_id?: string;
  salesman_id?: string; 
  route_id?: string; 
  status: string; 
  agent?: { id: string | number };
  salesman?: { id: string | number };
  route?: { id: string | number };
};

const title = "Chiller Request Details";

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
    const [chillerRequest, setChillerRequest] = useState<chillerRequest | null>(null);

    useEffect(() => {
        const fetchChillerDetails = async () => {
            setLoading(true);
            const res = await chillerRequestByUUID(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Chiller Request Details",
                    "error"
                );
                throw new Error("Unable to fetch Chiller Request Details");
            } else {
                setChillerRequest(res.data);
            }
        };
        fetchChillerDetails();
    }, []);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/assets/chillerRequest">
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <div className="flex flex-wrap gap-x-[20px]">
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Outlet and Owner Information"
                        data={[
                            { value: chillerRequest?.outlet_name, key: "Outlet name" },
                            { value: chillerRequest?.outlet_type, key: "Outlet type" },
                            { value: chillerRequest?.owner_name, key: "Owner name" },
                            { value: chillerRequest?.contact_number, key: "Contact number" },
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Machine Details"
                        data={[
                            { value: chillerRequest?.machine_number, key: "Machine number" },
                            { value: chillerRequest?.asset_number, key: "Asset number" },
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Agent, Salesman and Route"
                        data={[
                            { 
                                key: "Agent", 
                                value: chillerRequest && chillerRequest.agent && typeof chillerRequest.agent === "object" && "name" in chillerRequest.agent
                                    ? (chillerRequest.agent as { name: string }).name || "-"
                                    : "-",
                            },
                            { 
                                key: "Salesman", 
                                value: chillerRequest && chillerRequest.salesman && typeof chillerRequest.salesman === "object" && "name" in chillerRequest.salesman
                                    ? (chillerRequest.salesman as { name: string }).name || "-"
                                    : "-"
                            },
                            { key: "Route", value: chillerRequest && chillerRequest.route && typeof chillerRequest.route === "object" && "name" in chillerRequest.route
                                    ? (chillerRequest.route as { name: string }).name || "-"
                                    : "-"
                            }
                        ]}
                    />
                </ContainerCard>
                <ContainerCard className="w-full lg:w-[350px]">
                    <KeyValueData
                        title="Status"
                        data={[
                            { value: "", key: "Status", component: <StatusBtn isActive={!!chillerRequest?.status} /> },
                        ]}
                    />
                </ContainerCard>
            </div>
        </>
    );
}
