"use client";

import BorderIconButton from "@/app/components/borderIconButton";
import SearchBar from "../../dashboard/searchBar";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";
import CustomDropdown from "@/app/components/customDropdown";
import FilterDropdown from "@/app/components/filterDropdown";
import CustomCheckbox from "@/app/components/customCheckbox";
import Link from "next/link";

type RowProps = {
    id: number;
    itemCode: string;
    sapId: string;
    hsnCode: string;
    itemName: string;
    itemDescription: string;
    itemCategory: string;
    itemSubCategory: string;
    itemGroup: string;
    itemUPC: string;
    itemUom: string;
    itemBasePrice: string;
    exciseCode: string;
    shelfLife: string;
    status: boolean;
};

const data: RowProps[] = new Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    itemCode: "AC0001604",
    sapId: "500-0001604",
    hsnCode: "1001", 
    itemName: 'Test Item',
    itemDescription: `This is a description for item ${i + 1}`,
    itemCategory: 'Beverages',
    itemSubCategory: 'Soft Drinks',
    itemGroup: 'Non-Alcoholic',
    itemUPC: `123456789012`,
    itemUom: 'Pieces',
    itemBasePrice: '100.00',
    exciseCode: 'EXC123',
    shelfLife: '12 months',
    status: true,
   
}));

const dropdownDataList = [
    { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const itemCategoryDropdown = [
    {
        depotId: "D001",
        depotName: "Main Depot",
    },
    {
        depotId: "D002",
        depotName: "Secondary Depot",
    },
    {
        depotId: "D003",
        depotName: "East Side Depot",
    },
]
const itemSubCategoryDropdown = [
    {
        depotId: "D001",
        depotName: "Main Depot",
    },
    {
        depotId: "D002",
        depotName: "Secondary Depot",
    },
    {
        depotId: "D003",
        depotName: "East Side Depot",
    },
]

const itemGroupDropdown = [
    {
        depotId: "D001",
        depotName: "Main Depot",
    },
    {
        depotId: "D002",
        depotName: "Secondary Depot",
    },
    {
        depotId: "D003",
        depotName: "East Side Depot",
    },
]

const itemUomDropdown = [
    {
        depotId: "D001",
        depotName: "Main Depot",
    },
    {
        depotId: "D002",
        depotName: "Secondary Depot",
    },
    {
        depotId: "D003",
        depotName: "East Side Depot",
    },
]


export default function AddItem() {
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const allItemsCount = data.length;
    const isAllSelected = selectedItems.length === allItemsCount;
    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;
    const [showDropdown, setShowDropdown] = useState(false);
    const [itemCategory, setItemCategory] = useState(false);
    const [itemSubCategory, setItemSubCategory] = useState(false);
    const [itemGroup, setItemGroup] = useState(false);
    const [itemUom, setItemUom] = useState(false);

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
                    Item
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
                        <Link href="/master/item/add">
                            <button
                                className="rounded-lg bg-[#EA0A2A] text-white px-4 py-[10px] flex items-center gap-[8px] cursor-pointer"
                                onClick={() => {}}
                            >
                                <Icon icon="tabler:plus" width={20} />
                                <span className="md:block hidden">
                                    Add Item
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
                                                label="Item Code"
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                onChange={handleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            SAP ID
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            HSN Code
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Excise Code
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Item Name{" "}
                                            <Icon
                                                icon="mdi-light:arrow-down"
                                                width={16}
                                            />
                                        </div>
                                    </th>
                                   <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Item Description
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500] w-[218px]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap relative">
                                            Item Category{" "}
                                            <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setItemCategory(
                                                        !itemCategory
                                                    )
                                                }
                                            />
                                            {itemCategory && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {itemCategoryDropdown.map(
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
                                                                                item.depotId
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.depotName
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
                                    <th className="px-[24px] py-[12px] font-[500] w-[218px]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap relative">
                                            Item Sub Category{" "}
                                            <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setItemSubCategory(
                                                        !itemSubCategory
                                                    )
                                                }
                                            />
                                            {itemSubCategory && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {itemSubCategoryDropdown.map(
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
                                                                                item.depotId
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.depotName
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
                                    <th className="px-[24px] py-[12px] font-[500] w-[218px]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap relative">
                                            Item Group{" "}
                                            <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setItemGroup(
                                                        !itemGroup
                                                    )
                                                }
                                            />
                                             {itemGroup && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {itemGroupDropdown.map(
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
                                                                                item.depotId
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.depotName
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
                                            Item UPC
                                        </div>
                                    </th>
                                    <th className="px-[24px] py-[12px] font-[500] w-[218px]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap relative">
                                            Item UOM{" "}
                                            <Icon
                                                icon="circum:filter"
                                                width={16}
                                                onClick={() =>
                                                    setItemUom(
                                                        !itemUom
                                                    )
                                                }
                                            />
                                            {itemUom && (
                                                <div className="absolute top-[40px] z-40">
                                                    <FilterDropdown>
                                                        {itemUomDropdown.map(
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
                                                                                item.depotId
                                                                            }
                                                                        </span>
                                                                        <span className="w-full overflow-hidden text-ellipsis">
                                                                            {
                                                                                item.depotName
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
                                            Item Base Price
                                        </div>
                                    </th>
                                     <th className="px-[24px] py-[12px] font-[500]">
                                        <div className="flex items-center gap-[4px] whitespace-nowrap">
                                            Shelf Life
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
                                                        label={row.itemCode}
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
                                                    {row.sapId}
                                                </div>
                                            </td>
                                           
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.hsnCode}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.exciseCode}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemName}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemDescription}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemCategory}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemSubCategory}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemGroup}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemUPC}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemUom}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.itemBasePrice}
                                                </div>
                                            </td>
                                            <td className="px-[24px] py-[12px]">
                                                <div className="flex items-center">
                                                    {row.shelfLife}
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
