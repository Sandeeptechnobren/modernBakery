"use client";

import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import { NewCustomerDetails } from "./page";

export default function Additional({
    data,
}: {
    data: NewCustomerDetails | null;
}) {
    return (
        <ContainerCard className="w-full h-fit">
            <KeyValueData
                title="Additional Information"
                data={[
                    {
                        key: "Route",
                        value: data?.route?.route_name + " - " + data?.route?.route_code || "-",
                    },
                    {
                        key: "Category",
                        value: data?.category?.customer_category_name + " - " + data?.category?.customer_category_code || "-",
                    },
                    {
                        key: "Sub Category",
                        value: data?.subcategory?.customer_sub_category_name + " - " + data?.subcategory?.customer_sub_category_code || "-",
                    },
                    {
                        key: "Outlet Channel",
                        value: data?.outlet_channel?.outlet_channel + " - " + data?.outlet_channel?.outlet_channel_code || "-",
                    },
                    {
                        key: "Warehouse",
                        value: data?.get_warehouse?.warehouse_name + " - " + data?.get_warehouse?.warehouse_code || "-",
                    },
                ]}
            />
        </ContainerCard>
    );
}
