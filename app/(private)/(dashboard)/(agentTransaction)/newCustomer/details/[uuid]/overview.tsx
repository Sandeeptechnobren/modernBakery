import ContainerCard from "@/app/components/containerCard";
import { Icon } from "@iconify-icon/react";
import KeyValueData from "@/app/components/keyValueData";
import { NewCustomerDetails } from "./page";

export default function Overview({ data }: { data: NewCustomerDetails | null }) {
    return (
        <ContainerCard className="w-full h-fit">
            <KeyValueData
                title="Customer Info"
                data={[
                    {
                        key: <span className="font-bold">TIN No.</span>,
                        value: data?.vat_no || "-",
                    },
                    {
                        key: "Owner Name",
                        value: data?.owner_name || "-",
                    },
                    {
                        key: "Customer Type",
                        value: data?.customertype?.name || "-"
                    },
                ]}
            />
            <hr className="text-[#D5D7DA] my-[25px]" />
            <div>
                <div className="text-[18px] mb-[25px] font-semibold">
                    Contact
                </div>
                <div className="flex flex-col gap-[20px] text-[#414651]">
                    <div className="flex items-center gap-[8px] text-[16px]">
                        <Icon
                            icon="lucide:phone-call"
                            width={16}
                            className="text-[#EA0A2A]"
                        />
                        <span>
                            {data?.contact_no} / {data?.contact_no2}
                        </span>
                    </div>
                    <div className="flex items-center gap-[8px] text-[16px]">
                        <Icon
                            icon="ic:baseline-whatsapp"
                            width={16}
                            className="text-[#EA0A2A]"
                        />
                        <span>{data?.whatsapp_no}</span>
                    </div>
                </div>
            </div>
        </ContainerCard>
    );
}
