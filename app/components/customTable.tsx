"use client";

import SearchBar from "../(private)/dashboard/searchBar";
import { Icon } from "@iconify-icon/react";
import CustomDropdown from "./customDropdown";
import BorderIconButton from "./borderIconButton";
import { createContext, useContext, useState } from "react";
import FilterDropdown from "./filterDropdown";
import CustomCheckbox from "./customCheckbox";
import { tableDataType } from "../(private)/master/customer/[customerId]/[tabName]/customerInfo";

type configType = {
    header?: {
        searchBar?:
            | boolean
            | {
                  placeholder: string;
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
              };
        columnFilter?: boolean;
        actions?: React.ReactNode[];
    };
    rowActions?: {
        icon: string;
        onClick: (data: object) => void;
    }[];
    footer?:
        | React.ReactNode[]
        | {
              nextPrevBtn?: boolean;
              pagination?: boolean;
          };
    pageSize?: number;
    pageSizeOptions?: number[];
    rowSelection?: boolean;
    dragableColumn?: boolean;
    columns: {
        key: string;
        label: string;
        width?: number;
        render?: (data: string | number) => React.ReactNode;
        align?: "left" | "center" | "right";
        isSortable?: boolean;
        isFilterable?: boolean;
    }[];
};

const Config = createContext<configType>({} as configType);

type filterDataType = {
    depotId: string;
    depotName: string;
}

const filterData: filterDataType[] = new Array(10).fill(null).map(() => ({
    depotId: "DP0172",
    depotName: `Rwamayesi Company Limited-Old Kampala Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, omnis.`,
}));

export default function Table({
    data,
    config,
}: {
    data: tableDataType[];
    config: configType;
}) {
    return (
        <Config.Provider value={config}>
            <TableContainer data={data} />
        </Config.Provider>
    );
}

function TableContainer({ data }: { data: tableDataType[] }) {
    return (
        <>
            <div className="flex flex-col bg-white w-full h-full border-[1px] border-[#E9EAEB] rounded-[8px] overflow-hidden">
                <TableHeader />
                <TableBody data={data} />
                <TableFooter />
            </div>
        </>
    );
}

function TableHeader() {
    const { header } = useContext(Config);

    return header && (
        <>
            <div className="px-[24px] py-[20px] w-full flex justify-between items-center gap-1 sm:gap-0">
                {header?.searchBar && (
                    <div className="w-[320px]">
                        <SearchBar />
                    </div>
                )}

                {/* actions */}
                <div className="flex justify-right w-fit gap-[8px]">
                    {header?.actions?.map((action) => action)}

                    <ColumnFilter />
                </div>
            </div>
        </>
    );
}

function ColumnFilter() {
    const { columns } = useContext(Config);
    const [showDropdown, setshowDropdown] = useState(false);
    return (
        <div className="relative">
            <BorderIconButton
                icon="lucide:filter"
                onClick={() => setshowDropdown(!showDropdown)}
            />
            {showDropdown && (
                <div
                    className="w-[320px] absolute right-0 top-[40px] z-50"
                    onClick={() => setshowDropdown(false)}
                >
                    <CustomDropdown>
                        {columns.map((col, index) => {
                            return (
                                <div key={index} className="flex gap-[8px]">
                                    <CustomCheckbox
                                        id={col.label + index}
                                        checked={false}
                                        label={col.label}
                                        onChange={() => {}}
                                    />
                                    <span className="text-[#181D27] font-[500] text-[16px]">
                                        {col.label}
                                    </span>
                                </div>
                            );
                        })}
                    </CustomDropdown>
                </div>
            )}
        </div>
    );
}

function TableBody({ data }: { data: tableDataType[] }) {
    const { columns, rowSelection, rowActions } = useContext(Config);
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const allItemsCount = data.length;
    const isAllSelected = selectedItems.length === allItemsCount;
    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

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
            <div className="overflow-x-auto rounded-lg border border-[#E9EAEB] scrollbar-thin scrollbar-thumb-[#D5D7DA] scrollbar-track-transparent">
                <table className="table-auto min-w-max w-full">
                    <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
                        <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                            {/* checkbox */}
                            {rowSelection && (
                                <th className="sm:sticky left-0 bg-[#FAFAFA] w-fit px-[10px] py-[12px] font-[500]">
                                    <div className="flex items-center gap-[12px] whitespace-nowrap">
                                        <CustomCheckbox
                                            id="selectAll"
                                            label=""
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            onChange={handleSelectAll}
                                        />
                                    </div>
                                </th>
                            )}

                            {/* main data */}
                            {columns.map((col, index) => {
                                return (
                                    <th
                                        className={`w-[${col.width}px] px-[24px] py-[12px] font-[500] whitespace-nowrap`}
                                        key={index}
                                    >
                                        <div className="flex items-center gap-[4px]">
                                            {col.label}{" "}
                                            {col.isFilterable && (
                                                <Icon
                                                    icon="mdi-light:arrow-down"
                                                    width={16}
                                                />
                                            )}
                                            {col.isFilterable && (
                                                <FilterTableHeader
                                                    filterData={filterData}
                                                />
                                            )}
                                        </div>
                                    </th>
                                );
                            })}

                            {/* actions */}
                            {rowActions && (
                                <th className="sticky top-0 sm:right-0 z-10 px-[24px] py-[12px] font-[500] text-left border-l-[1px] border-[#E9EAEB] bg-[#FAFAFA]">
                                    <div className="flex items-center gap-[4px] whitespace-nowrap">
                                        Actions
                                    </div>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-[14px] bg-white text-[#535862]">
                        {
                            // repeat row 10 times
                            data.map((row: tableDataType) => (
                                <tr
                                    className="border-b-[1px] border-[#E9EAEB]"
                                    key={row.id}
                                >
                                    {rowSelection && (
                                        <td className="sm:sticky left-0 bg-white px-[10px] py-[12px]">
                                            <div className="flex items-center gap-[12px] font-[500]">
                                                <CustomCheckbox
                                                    id={row.id.toString()}
                                                    label=""
                                                    checked={selectedItems.includes(
                                                        row.id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectItem(row.id)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    )}

                                    {columns.map((col, index) => {
                                        return (
                                            <td
                                                key={index}
                                                width={col.width}
                                                className={`px-[24px] py-[12px]`}
                                            >
                                                <div className="flex items-center">
                                                    {col.render ? col.render(row[col.key as keyof typeof row]) : row[col.key as keyof typeof row]}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {/* <td className="px-[24px] py-[12px] whitespace-nowrap">
                                        <Link
                                            href={`/dashboard/customer/${row.id}/overview`}
                                            className="flex items-center cursor-pointer hover:text-[#EA0A2A]"
                                        >
                                            {row.customerName}
                                        </Link>
                                    </td> */}
                                    
                                    { rowActions && <td className="sm:sticky right-0 z-10 px-[24px] py-[12px] border-l-[1px] border-[#E9EAEB] bg-white whitespace-nowrap">
                                        <div className="flex items-center gap-[4px]">
                                            { rowActions.map((action, index) => {
                                               return <Icon
                                                    key={index}
                                                    icon={action.icon}
                                                    width={20}
                                                    className="p-[10px]"
                                                    onClick={() => action.onClick(row)}
                                                />
                                            }) }
                                        </div>
                                    </td>}
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
}

function FilterTableHeader({ filterData }: { filterData:filterDataType[]}) {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    return (
        <>
            <Icon
                icon="circum:filter"
                width={16}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            />
            {showFilterDropdown && (
                <div className="absolute top-[40px] z-40">
                    <FilterDropdown>
                        {filterData.map((item: filterDataType, index: number) => {
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-[8px] px-[14px] py-[10px] hover:bg-[#FAFAFA] text-[14px]"
                                >
                                    <span className="font-[500] text-[#181D27]">
                                        {item.depotId}
                                    </span>
                                    <span className="w-full overflow-hidden text-ellipsis">
                                        {item.depotName}
                                    </span>
                                </div>
                            );
                        })}
                    </FilterDropdown>
                </div>
            )}
        </>
    );
}

function TableFooter() {
    const { footer } = useContext(Config);
    return footer && (
        <>
            <div>footer</div>
        </>
    );
}
