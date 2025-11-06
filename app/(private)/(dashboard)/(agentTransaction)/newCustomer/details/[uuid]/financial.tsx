"use client";

import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import { NewCustomerDetails } from "./page";

export default function Financial({ data }: { data: NewCustomerDetails | null }) {
    // Map payment_type values to readable names
    const paymentTypeMap: Record<string, string> = {
        "1": "Cash",
        "2": "Credit",
        "3": "bill Tobill",
    };

    const paymentType =
        data?.payment_type && paymentTypeMap[String(data.payment_type)]
            ? paymentTypeMap[String(data.payment_type)]
            : "-";

    return (
        <ContainerCard className="w-full h-fit">
            <KeyValueData
                title="Financial Information"
                data={[
                    {
                        key: "Payment Type",
                        value: paymentType,
                    },
                    {
                        key: "Buyer Type",
                        value: data?.buyertype === 0 ? "B2B" : "B2C",
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
