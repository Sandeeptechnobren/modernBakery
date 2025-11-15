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
                        key: "Distributor",
                        value:  data?.get_warehouse?.warehouse_code + " - " + data?.get_warehouse?.warehouse_name || "-",
                    },
                    {
                        key: "Route",
                        value: data?.route?.route_code + " - " +  data?.route?.route_name || "-",
                    },
                    {
                        key: "Outlet Channel",
                        value:data?.outlet_channel?.outlet_channel  || "-",
                    },
                    {
                        key: "Category",
                        value:data?.category?.customer_category_name   || "-",
                    },
                    {
                        key: "Sub Category",
                        value:data?.subcategory?.customer_sub_category_name  || "-",
                    },
                    
                ]}
            />
        </ContainerCard>
    );
}
