"use client";

import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import KeyValueData from "../keyValueData";
import SummaryCard from "@/app/components/summaryCard";
import Table from "@/app/components/customTable";

export type tableDataType = {
    id: number;
    title: string;
    address: string;
    country: string;
    city: string;
    globalPosition: string;
    route: string;
    phoneNumber: string;
    landmark: string;
};

const tableData: tableDataType[] = new Array(3).fill(null).map((_, i) => ({
    id: i + 1,
    title: "Title here",
    address: "Cedre Villa K Addres Line 1 Here, Addres Line 2 Here,",
    country: `UAE`,
    city: `DUB`,
    globalPosition: `25.2048493 55.2707828`,
    route: "RT0671",
    phoneNumber: "0789517400, 0702563915",
    landmark: "Cedre Villa K",
}));

const columns = [
  { key: "title", label: 'Title', render: (value: string) => <span className="font-semibold">{value}</span> },
  { key: "address", label: 'Address', width: 100 },
  { key: "country", label: 'Country' },
  { key: "city", label: 'City' },
  { key: "globalPosition", label: 'Latitude & Longitude' },
  { key: "route", label: 'Route' },
  { key: "phoneNumber", label: 'Phone Number' },
  { key: "landmark", label: 'Landmark' },
];

export type columnDataType = typeof columns;

export default function CustomerInfo() {
    return (
        <div className="flex flex-col lg:flex-row gap-[20px] w-full">
            <ContainerCard className="w-full lg:w-[350px] space-y-[30px] h-fit">
                <SummaryCard
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
                <div className="flex flex-col 2xl:flex-row gap-[20px]">
                    <div className="flex flex-col">
                        <ContainerCard className="w-full md:w-[465px] h-fit">
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
                        <ContainerCard className="w-full md:w-[465px] h-fit">
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
                        <ContainerCard className="w-full md:w-[465px]">
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
                        <ContainerCard className="w-full md:w-[465px]">
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
                                </div>
                                <div>Zip Code: 12345</div>
                                <div className="flex justify-between">
                                    <span>Latitude: 25.2048493</span>
                                    <span>Longitude: 55.2707828</span>
                                </div>
                            </div>
                        </ContainerCard>
                    </div>
                </div>

                {/* table */}
                <div className="w-[1000px]">

                <Table
                    config={{
                        rowActions: [
                            {
                                icon: "lucide:edit-2",
                                onClick: (data) => {
                                    console.log(data);
                                }
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: () => {
                                    confirm("Are you sure you want to delete this customer?");
                                }
                            }
                        ],
                        columns: columns
                    }}
                    data={tableData}
                />
            </div>
            </div>
        </div>
    );
}
