import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "../keyValueData";
import { useParams } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import Toggle from "@/app/components/toggle";
import { useState } from "react";

export default function Overview() {
    const { tabName } = useParams();
    const [isChecked, setIsChecked] = useState(true);

    return (
        <div className="m-auto">
            {/* Customer Details and Contact */}
            <div className="flex flex-wrap gap-x-[20px]">
                <div>
                    {/* Customer Details */}
                    <ContainerCard className="w-full sm:w-[400px] h-fit ">
                        <KeyValueData
                            title="Customer Info"
                            data={[
                                {
                                    key: "Customer Type",
                                    value: "Customer Type",
                                },
                                { key: "Customer Code", value: "AC0016040" },
                                { key: "SAP Id", value: "-" },
                                { key: "Category", value: "Wholesale Shop" },
                                { key: "Sub Category", value: "Fast Food" },
                                { key: "Outlet Channel", value: "-" },
                            ]}
                        />

                        <hr className="text-[#D5D7DA] my-[25px]" />

                        <div className="">
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
                                    <span>0772330967 / 0751820808</span>
                                </div>
                                <div className="flex items-center gap-[8px] text-[16px]">
                                    <Icon
                                        icon="ic:outline-email"
                                        width={16}
                                        className="text-[#EA0A2A]"
                                    />
                                    <span>thereselouise@icloud.com</span>
                                </div>
                                <div className="flex items-center gap-[8px] text-[16px]">
                                    <Icon
                                        icon="lucide:map-pin"
                                        width={16}
                                        className="text-[#EA0A2A]"
                                    />
                                    <span>Luganda</span>
                                </div>
                            </div>
                        </div>
                    </ContainerCard>

                    <ContainerCard className="w-full sm:w-[400px] h-[183px]">
                        <div className="text-[18px] font-semibold mb-[25px]"></div>
                    </ContainerCard>
                </div>

                <div>
                    {/* Location Information */}
                    <ContainerCard className="w-full sm:w-[440px] h-fit">
                        <KeyValueData
                            title="Location Information"
                            data={[
                                { key: "Region", value: "CENTRAL 1" },
                                { key: "Sub Region", value: "South Buganda 6" },
                                { key: "District", value: "Kampala" },
                                {
                                    key: "Town/Village",
                                    value: "Kakaijo Kakaijo",
                                },
                                { key: "Street", value: "Sir Apollo" },
                                {
                                    key: "Landmark",
                                    value: "Opposite Shell Sir Apollo",
                                },
                                { key: "Latitude", value: "0.31937459" },
                                { key: "Longitude", value: "32.56560273" },
                                { key: "Threshold Radius", value: "20M" },
                            ]}
                        />
                    </ContainerCard>

                    <ContainerCard className="w-full sm:w-[440px] h-fit">
                        <div className="text-[18px] font-semibold mb-[25px]">
                            Transaction & Promotion
                        </div>
                        <KeyValueData
                            data={[
                                { key: "Enable Promo Txn", value: "", component: <Toggle isChecked={isChecked} onChange={() => setIsChecked(!isChecked)} /> },
                                { key: "Assign QR Value", value: "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                <div>
                    {/* Financial Information */}
                    <ContainerCard className="w-full sm:w-[440px] h-[369px]">
                        <div className="text-[18px] font-semibold mb-[25px]">
                            Financial Information
                        </div>
                        <ContainerCard className="w-full sm:w-[440px]">
                            <h1>hi</h1>
                        </ContainerCard>
                        <KeyValueData
                            data={[
                                { key: "Payment Type", value: "Cash Only" },
                                { key: "Credit Days", value: "-" },
                                { key: "Fees Type", value: "-" },
                                { key: "VAT No", value: "-" },
                            ]}
                        />
                    </ContainerCard>

                    <ContainerCard className="w-full sm:w-[440px]">
                        <KeyValueData
                            title="Additional Information"
                            data={[
                                { key: "Route", value: "-" },
                                { key: "Assign Latitude", value: "-" },
                                { key: "Assign Longitude", value: "-" },
                                { key: "Assign Accuracy", value: "-" },
                                { key: "Available Days", value: "", component: <div className="space-x-[2px]">
                                    <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">Mon</span>
                                    <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">Tue</span>
                                    <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">Wed</span>
                                    <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">Thu</span>
                                    <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">Fri</span>
                                    <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">Sat</span>
                                </div> }
                            ]}
                        />
                    </ContainerCard>
                </div>
            </div>
        </div>
    );
}
