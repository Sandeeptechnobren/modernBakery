"use client";

import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import { AgentCustomerDetails } from "./page";

export default function Additional({
    data,
}: {
    data: AgentCustomerDetails | null;
}) {
    return (
        <ContainerCard className="w-full h-fit">
            <KeyValueData
                title="Additional Information"
                data={[
                    {
                        key: "Payment Type",
                        value: data?.payment_type || "-",
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
