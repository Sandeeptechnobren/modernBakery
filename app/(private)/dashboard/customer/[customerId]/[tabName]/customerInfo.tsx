"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InfoCard from "@/app/components/InfoCard";
import KeyValueData from "../keyValueData";

export default function CustomerInfo() {
    return (
        <div className="flex gap-[20px] w-full">
            <ContainerCard className="w-[350px] space-y-[30px]">
                <InfoCard
                    icon="fa6-solid:building-wheat"
                    iconWidth={40}
                    iconCircleTw="flex item-center justify-center bg-[#E9EAEB] text-[#535862] w-[80px] h-[80px] p-[20px]"
                    title={
                        <span className="text-[20px] font-semibold">
                            Abdul Retail Shop
                        </span>
                    }
                    description="Customer Code: AC0016040"
                    isVertical={true}
                />

                <hr className="text-[#D5D7DA]" />

                <div className="text-center space-y-[12px] text-[16px]">
                    <div>
                        <span className="text-[#414651]">Site Name: </span>
                        <span>Abdul Retail</span>
                    </div>
                    <div>
                        <span className="text-[#414651]">Web ID: </span>
                        <span>252823</span>
                    </div>
                </div>

                <div className="w-fit mx-auto">
                    <SidebarBtn
                        isActive={true}
                        leadingIcon="lucide:edit"
                        leadingIconSize={20}
                        label="Edit Information"
                    />
                </div>
            </ContainerCard>

            <div className="flex flex-col gap-[20px]">
                <div className="flex gap-[20px]">
                    <div className="flex flex-col">
                        <ContainerCard className="w-[465px] h-fit">
                            <KeyValueData
                                title="Customer Information"
                                data={[
                                    {
                                        icon: "hugeicons:building-01",
                                        key: "Site Group",
                                        value: "Masafi Group",
                                    },
                                    {
                                        icon: "solar:user-id-outline",
                                        key: "TRN No",
                                        value: "123456789",
                                    },
                                    {
                                        icon: "lucide:user",
                                        key: "TRN Name",
                                        value: "Theresa Enterprices",
                                    },
                                    {
                                        icon: "streamline-plump:location-pin",
                                        key: "Route",
                                        value: "DUB-01",
                                    },
                                    {
                                        icon: "streamline-plump:location-pin",
                                        key: "Region",
                                        value: "Dubai",
                                    },
                                ]}
                            />
                        </ContainerCard>
                        <ContainerCard className="w-[465px] h-fit">
                            <KeyValueData
                                title="Sales Information"
                                data={[
                                    {
                                        icon: "lucide:user",
                                        key: "Salesman",
                                        value: "Ismatullah A",
                                    },
                                    {
                                        icon: "lucide:phone-call",
                                        key: "Salesman Mobile",
                                        value: "561234567",
                                    },
                                ]}
                            />
                        </ContainerCard>
                    </div>

                    <div className="flex flex-col">
                        <ContainerCard className="w-[465px]">
                            <KeyValueData
                                title="Contact Information"
                                data={[
                                    {
                                        icon: "lucide:phone-call",
                                        key: "+971 582095647",
                                        value: "",
                                    },
                                    {
                                        icon: "lucide:phone-call",
                                        key: "+971 582095647",
                                        value: "",
                                    },
                                    {
                                        icon: "lucide:mail",
                                        key: "thereselouise@icloud.com",
                                        value: "",
                                    },
                                ]}
                            />
                        </ContainerCard>
                        <ContainerCard className="w-[465px]">
                            <div className="text-[18px] font-semibold mb-[25px]">
                                Address Information
                            </div>
                            <div className="space-y-[20px] text-[#535862]">
                                <div>
                                    Cedre Villa K<br />
                                    Addres Line 1 Here, Addres Line 2 Here,
                                </div>
                                <div>
                                    City: Dubai, Country: United Arab Emirates
                                    <br />
                                    Zip Code: 12345
                                </div>
                                <div>
                                    Cedre Villa K<br />
                                    Addres Line 1 Here, Addres Line 2 Here,
                                </div>
                                <div className="flex justify-between">
                                    <span>Latitude: 25.2048493</span>
                                    <span>Longitude: 55.2707828</span>
                                </div>
                            </div>
                        </ContainerCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
