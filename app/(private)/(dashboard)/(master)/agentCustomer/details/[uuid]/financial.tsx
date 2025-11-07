"use client";

import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import { AgentCustomerDetails } from "./page";

export default function Financial({ data }: { data: AgentCustomerDetails | null }) {
    return (
        <ContainerCard className="w-full h-fit">
            <KeyValueData
                title="Finanacial Information"
                data={[
                    {
                        key: "Payment Type",
                        value: "Cash",
                    },
                    {
                        key: "Buyer Type",
                        value: data?.buyertype == "0" ? "B2B" : "B2C",
                    },
                    {
                        key: "Credit Day",
                        value: data?.creditday || "-",
                    },
                    {
                        key: "Credit Limit",
                        value: data?.credit_limit || "-",
                    },
                ]}
            />
        </ContainerCard>
    );
}
