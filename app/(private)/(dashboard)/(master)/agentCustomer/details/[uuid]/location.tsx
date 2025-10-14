"use client";

import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import Map from "@/app/components/map";
import { AgentCustomerDetails } from "./page";

export default function Location({
    data,
}: {
    data: AgentCustomerDetails | null;
}) {
    return (
        <ContainerCard className="w-full h-fit">
            <KeyValueData
                title="Location Information"
                data={[
                    {
                        key: "District",
                        value: data?.district || "-",
                    },
                    { key: "Town", value: data?.town || "-" },
                    {
                        key: "Street",
                        value: data?.street || "-",
                    },
                    {
                        key: "Landmark",
                        value: data?.landmark || "-",
                    },
                ]}
            />
            <Map
                latitude={data?.latitude || "21.22"}
                longitude={data?.longitude || "22.12"}
                height="200px"
                width="100%"
                title=""
            />
        </ContainerCard>
    );
}
