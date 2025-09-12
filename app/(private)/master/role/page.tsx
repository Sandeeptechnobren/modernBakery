"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import SearchBar from "../../dashboard/searchBar";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import CustomCheckbox from "@/app/components/customCheckbox";
import Link from "next/link";

type RowProps = {
    id: number;
    name: string;
    activity: string;
    description: string;
};

const data: RowProps[] = new Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    name: `Abdul`,
    activity: `Retail`,
    description: 'Super Admin',
}));

const dropdownDataList = [
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];


export default function Role() {
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const allItemsCount = data.length;
    const isAllSelected = selectedItems.length === allItemsCount;
    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;
    const [showDropdown, setShowDropdown] = useState(false);

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
                    Role
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
                            <SearchBar />
                        </div>
                        <Link href="/master/role/add">
                            <button
                                className="rounded-lg bg-[#EA0A2A] text-white px-4 py-[10px] flex items-center gap-[8px] cursor-pointer"
                                onClick={() => {}}
                            >
                                <Icon icon="tabler:plus" width={20} />
                                <span className="md:block hidden">
                                    Add Role
                                </span>
                                <span className="hidden sm:block md:hidden">
                                    Add
                                </span>
                            </button>
                        </Link>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#E9EAEB]">
                        <table className="table-auto w-full min-w-max">
                            <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
                                <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[12px] whitespace-nowrap">
                                            <CustomCheckbox
                                                id="selectAll"
                                                label="Role Name"
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                onChange={handleSelectAll}
                                            />
                                            
                                            <Icon
                                                icon="mdi-light:arrow-down"
                                                width={16}
                                            />
                                        </div>
                                    </th>
                                    
                                    {/* <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Activity
                                        </div>
                                    </th> */}
                                   
                                    <th className="px-[24px] py-[12px] font-[500] w-[218px]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap relative">
                                            Description
                                        </div>
                                    </th>
                                    <th className="sticky top-0 sm:right-0 w-0 z-10 px-[24px] py-[12px] font-[500] text-left border-l-[1px] border-[#E9EAEB] bg-[#FAFAFA]">
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
                                                                checked={selectedItems.includes(row.id)}
                                                                onChange={() => handleSelectItem(row.id)}
                                                                // Instead of plain text, pass Link as the label
                                                                label={
                                                                    <Link
                                                                    href={`/master/role/${row.id}/details`}
                                                                    className="flex items-center cursor-pointer hover:text-[#EA0A2A]"
                                                                    >
                                                                    {row.name}
                                                                    </Link>
                                                                }
                                                                />
                                                            </div>
                                                            </td>
                                           
                                            {/* <td className="px-[24px] py-[12px] whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {row.activity}
                                                </div>
                                            </td> */}
                                           
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.description}
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
