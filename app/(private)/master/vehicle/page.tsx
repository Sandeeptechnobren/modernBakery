"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import SearchBar from "../../../components/searchBar";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import FilterDropdown from "@/app/components/filterDropdown";
import CustomCheckbox from "@/app/components/customCheckbox";
import Link from "next/link";

type RowProps = {
    id: number;
    code: string;
    brand: string;
    numberPlate: string;
    chassisNumber: string;
    odoMeter: number;
    vehicleType: string;
    capacity: number;
    ownerType: string;
    ownerRefernce: string;
    vehicleRoute: string;
    status: boolean;
};

const data: RowProps[] = new Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    code: "AC0001604",
    brand: "Toyato",
    numberPlate: "DBA 123A",
    chassisNumber: "14592879",
    odoMeter: 12,
    vehicleType: `Abdul Retail Shop`,
    capacity: 5,
    ownerType: `DP01 - Zuwote Trading Group Ltd - Ggaba`,
    depotLocation: "Ggaba",
    ownerRefernce: "0789517400, 0702563915",
    vehicleRoute: "RT0671",
    status: true,
}));

const dropdownDataList = [
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const filterVehicleType = [
  {
    vehicleId: "R0171",
    vehicleType:"Tuktuk",
  },
  {
    vehicleId: "R0172",
    vehicleType: "Truck",
  },
  {
    vehicleId: "R0173",
    vehicleType: "Bike",
  },
  {
    vehicleId: "R0174",
    vehicleType: "Van",
  },
];

const filterData = [
    {
        "id":1,
        "type":"Central"
    },
    {
        "id":2,
        "type":"Warehouse"
    }
]
const reference = [
    {
        "id":1,
        "type":"Warehouse A"
    },
    {
        "id":2,
        "type":"Warehouse B"
    }
]

const filterRouteType = new Array(10).fill(null).map(() => ({
    routeId: "R0172 ",
    routeType: `Type 1`,
}));

export default function VehicleRegistration() {
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const allItemsCount = data.length;
    const isAllSelected = selectedItems.length === allItemsCount;
    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;
    const [showDropdown, setShowDropdown] = useState(false);
    const [showRouteTypeDropdown, setShowRouteTypeDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showReference, setShowReference] = useState(false);
    const [showVehicleRoute, setShowVehicleRoute] = useState(false);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedItems(data.map((item) => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    return (
        <>
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
                    Vehicle
                </h1>
                <div className="flex gap-[12px] relative">
                    <BorderIconButton
                        icon="gala:file-document"
                        label="Export CSV"
                        labelTw="text-[12px] hidden sm:block"
                    />
                    <BorderIconButton icon="mage:upload" />
                    <BorderIconButton
                        icon="ic:sharp-more-vert"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />

                    {showDropdown && (
                        <div className="w-[226px] absolute top-[40px] right-0 z-30">
                            <CustomDropdown>
                                {dropdownDataList.map((link, index: number) => (
                                    <div
                                        key={index}
                                        className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                    >
                                        <Icon
                                            icon={link.icon}
                                            width={link.iconWidth}
                                            className="text-[#717680]"
                                        />
                                        <span className="text-[#181D27] font-[500] text-[16px]">
                                            {link.label}
                                        </span>
                                    </div>
                                ))}
                            </CustomDropdown>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex bg-white w-full h-[calc(100%-46px)] border-[1px] border-[#E9EAEB] rounded-[8px] overflow-hidden">
                {/* Table */}
                <div className="w-full h-full flex flex-col">
                    <div className="px-[24px] py-[20px] w-full flex justify-between items-center gap-1 sm:gap-0">
                        <div className="w-[320px]">
                        </div>
                        <Link href="/master/vehicle/add">
                            <button
                                className="rounded-lg bg-[#EA0A2A] text-white px-4 py-[10px] flex items-center gap-[8px] cursor-pointer"
                                onClick={() => {}}
                            >
                                <Icon icon="tabler:plus" width={20} />
                                <span className="md:block hidden">
                                    Add Vehicle
                                </span>
                                <span className="hidden sm:block md:hidden">
                                    Add
                                </span>
                            </button>
                        </Link>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#E9EAEB]">
                        <table className="table-auto min-w-max">
                            <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
                                <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[12px] whitespace-nowrap">
                                            <CustomCheckbox
                                                id="selectAll"
                                                label="Vehicle Code"
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                onChange={handleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Brand
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Number Plate
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Chassis Number
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500] w-[218px]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap relative">
                                            Odo Meter
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Vehicle Type{" "}
                                            <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setShowRouteTypeDropdown(
                                                        !showRouteTypeDropdown
                                                    )
                                                }
                                            />
                                            {showRouteTypeDropdown && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {filterVehicleType.map(
                                                            (item, index) => {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                                                                    >
                                                                        <span className="font-[500] text-[#181D27]">
                                                                            {
                                                                                item.vehicleId
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.vehicleType
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </FilterDropdown>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px]">
                                            Capacity
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Owner Type{" "}
                                             <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setShowFilterDropdown(
                                                        !showFilterDropdown
                                                    )
                                                }
                                            />
                                            {showFilterDropdown && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {filterData.map(
                                                            (item, index) => {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                                                                    >
                                                                        <span className="font-[500] text-[#181D27]">
                                                                            {
                                                                                item.id
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.type
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </FilterDropdown>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Reference{" "}
                                             <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setShowReference(
                                                        !showReference
                                                    )
                                                }
                                            />
                                            {showReference && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {reference.map(
                                                            (item, index) => {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                                                                    >
                                                                        <span className="font-[500] text-[#181D27]">
                                                                            {
                                                                                item.id
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.type
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </FilterDropdown>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Vehicle Route
                                            <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setShowVehicleRoute(
                                                        !showVehicleRoute
                                                    )
                                                }
                                            />
                                             {showVehicleRoute && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {filterRouteType.map(
                                                            (item, index) => {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                                                                    >
                                                                        <span className="font-[500] text-[#181D27]">
                                                                            {
                                                                                item.routeId
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.routeType
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </FilterDropdown>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Status
                                        </div>
                                    </th>
                                    <th className="sticky top-0 sm:right-0 z-10 px-[24px] py-[12px] font-[500] text-left border-l-[1px] border-[#E9EAEB] bg-[#FAFAFA]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Actions
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] bg-white text-[#535862]">
                                {
                                    // repeat row 10 times
                                    data.map((row) => (
                                        <tr
                                            className="border-b-[1px] border-[#E9EAEB]"
                                            key={row.id}
                                        >
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center gap-[12px] whitespace-nowrap font-[500]">
                                                    <CustomCheckbox
                                                        id={row.id.toString()}
                                                        label={row.code}
                                                        checked={selectedItems.includes(
                                                            row.id
                                                        )}
                                                        onChange={() =>
                                                            handleSelectItem(
                                                                row.id
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.brand}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.numberPlate}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.chassisNumber}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.odoMeter}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.vehicleType}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-break-spaces">
                                                <div className="flex items-center">
                                                    {row.capacity}

                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.ownerType}

                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.ownerRefernce}

                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.vehicleRoute}

                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.status ? (
                                                        <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="sm:sticky right-0 z-10 px-[24px] py-[12px] border-l-[1px] border-[#E9EAEB] bg-white whitespace-nowrap">
                                                <div className="flex items-center gap-[4px]">
                                                    <Icon
                                                        icon="lucide:eye"
                                                        width={20}
                                                        className="p-[10px]"
                                                    />
                                                    <Icon
                                                        icon="lucide:edit-2"
                                                        width={20}
                                                        className="p-[10px]"
                                                    />
                                                    <Icon
                                                        icon="lucide:more-vertical"
                                                        width={20}
                                                        className="p-[10px]"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="px-[24px] py-[12px] flex justify-between items-center text-[#414651]">
                        <BorderIconButton
                            icon="lucide:arrow-left"
                            iconWidth={20}
                            label="Previous"
                            labelTw="text-[14px] font-semibold hidden sm:block"
                        />
                        <div className="gap-[2px] text-[14px] hidden md:flex">
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-[#FFF0F2] text-[#EA0A2A] flex items-center justify-center">
                                1
                            </div>
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-tranparent text-[#717680] flex items-center justify-center">
                                2
                            </div>
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-tranparent text-[#717680] flex items-center justify-center">
                                3
                            </div>
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-tranparent text-[#717680] flex items-center justify-center">
                                ...
                            </div>
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-tranparent text-[#717680] flex items-center justify-center">
                                8
                            </div>
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-tranparent text-[#717680] flex items-center justify-center">
                                9
                            </div>
                            <div className="w-[40px] h-[40px] rounded-[8px] p-[12px] bg-tranparent text-[#717680] flex items-center justify-center">
                                10
                            </div>
                        </div>
                        <BorderIconButton
                            trailingIcon="lucide:arrow-right"
                            iconWidth={20}
                            label="Next"
                            labelTw="text-[14px] font-semibold hidden sm:block"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
