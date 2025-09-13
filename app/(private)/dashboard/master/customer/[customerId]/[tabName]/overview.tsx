import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "../keyValueData";
import { Icon } from "@iconify-icon/react";
import Toggle from "@/app/components/toggle";
import { useState } from "react";
import SummaryCard from "@/app/components/summaryCard";

export default function Overview() {
    const [isChecked, setIsChecked] = useState(true);
    const [isDataShareChecked, setIsDataShareChecked] = useState(false);

    return (
        <div className="m-auto">
            {/* Customer Details and Contact */}
            <div className="flex flex-wrap gap-x-[20px]">
                <div className="flex flex-col">
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

                    <ContainerCard className="w-full sm:w-[400px] h-[183px] bg-gradient-to-r from-[#E7ECFF] to-[#FFFFFF]">
                        <SummaryCard
                            className="justify-between"
                            icon="mingcute:bill-fill"
                            iconCircleTw="bg-[#487FFF] text-white w-[60px] h-[60px] p-[15px]"
                            iconWidth={30}
                        >
                            <Toggle
                                isChecked={isDataShareChecked}
                                onChange={() => setIsDataShareChecked(!isDataShareChecked)}
                            />
                        </SummaryCard>

                        <div className="mt-[17px] text-[16px] text-[#181D27]">
                            <span className="font-semibold">Client Portal</span>
                            <span className="font-normal"> allows your customers to keep track of all the transactions between them and your business. </span>
                            <span className="text-[#EA0A2A] underline underline-offset-[2px]">Learn More</span>
                        </div>
                    </ContainerCard>
                </div>

                <div className="flex flex-col">
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
                        <ContainerCard className="w-full mb-[25px] bg-gradient-to-r from-[#E7FAFF] to-[#FFFFFF]">
                            <SummaryCard
                                icon="prime:barcode"
                                iconCircleTw="bg-[#00B8F2] text-white w-[60px] h-[60px] p-[15px]"
                                iconWidth={30}
                                title={"ABC-abc-1234"}
                                description={"Barcode"}
                            />
                        </ContainerCard>
                        <KeyValueData
                            data={[
                                {
                                    key: "Enable Promo Txn",
                                    value: "",
                                    component: (
                                        <Toggle
                                            isChecked={isChecked}
                                            onChange={() =>
                                                setIsChecked(!isChecked)
                                            }
                                        />
                                    ),
                                },
                                { key: "Assign QR Value", value: "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                <div className="flex flex-col">
                    {/* Financial Information */}
                    <ContainerCard className="w-full sm:w-[440px] h-full overflow-hidden">
                        <div className="text-[18px] font-semibold mb-[25px]">
                            Financial Information
                        </div>
                        <ContainerCard className="w-full mb-[25px] bg-gradient-to-r from-[#FFEFEF] to-[#FFFFFF]">
                            <SummaryCard
                                icon="iconoir:wallet-solid"
                                iconWidth={30}
                                title={
                                    <>
                                        <div className="">
                                            <span className="text-[24px] font-semibold text-[#181D27] mb-[2px] space-y-[200px]">
                                                0.00
                                            </span>
                                            <span className="text-[16px] text-[#717680] font-[500] inline-block ml-[6px]">
                                                AED
                                            </span>
                                        </div>
                                    </>
                                }
                                description={
                                    <>
                                        <div className="space-y-[14px] text-[16px] text-[#414651]">
                                            <span className="font-semibold mb-[2px] space-y-[200px]">
                                                Credit Limit:
                                            </span>
                                            <span className="font-[400] inline-block ml-[6px]">
                                                50,000 AED
                                            </span>
                                        </div>
                                    </>
                                }
                            />
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

                    <ContainerCard className="w-full sm:w-[440px] h-full">
                        <KeyValueData
                            title="Additional Information"
                            data={[
                                { key: "Route", value: "-" },
                                { key: "Assign Latitude", value: "-" },
                                { key: "Assign Longitude", value: "-" },
                                { key: "Assign Accuracy", value: "-" },
                                {
                                    key: "Available Days",
                                    value: "",
                                    component: (
                                        <div className="space-x-[2px]">
                                            <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">
                                                Mon
                                            </span>
                                            <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">
                                                Tue
                                            </span>
                                            <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">
                                                Wed
                                            </span>
                                            <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">
                                                Thu
                                            </span>
                                            <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">
                                                Fri
                                            </span>
                                            <span className="rounded-[16px] bg-[#F5F5F5] text-[12px] text-[#414651] leading-[8px] mb-[2px] px-[8px] py-[2px]">
                                                Sat
                                            </span>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </ContainerCard>
                </div>
            </div>
        </div>
    );
}
