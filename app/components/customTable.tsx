"use client";

import { Icon } from "@iconify-icon/react";
import CustomDropdown from "./customDropdown";
import BorderIconButton from "./borderIconButton";
import { createContext, useContext, useState } from "react";
import FilterDropdown from "./filterDropdown";
import CustomCheckbox from "./customCheckbox";
import SearchBar from "./searchBar";

type configType = {
    header?: {
        searchBar?:
            | boolean
            | {
                  placeholder: string;
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
              }; // yet to implement
        columnFilter?: boolean;
        actions?: React.ReactNode[];
    };
    rowActions?: {
        icon: string;
        onClick?: (data: object) => void;
    }[];
    footer?: {
        nextPrevBtn?: boolean;
        pagination?: boolean;
    };
    pageSize?: number;
    pageSizeOptions?: number[]; // yet to implement
    rowSelection?: boolean;
    dragableColumn?: boolean; // yet to implement
    columns: {
        key: string;
        label: string;
        width?: number;
        render?: (row: TableDataType) => React.ReactNode;
        align?: "left" | "center" | "right"; // yet to implement
        isSortable?: boolean;
        filter?: {
            isFilterable?: boolean;
            render: (data: TableDataType[]) => React.ReactNode;
        }
    }[];
};

const Config = createContext<configType>({} as configType);

type columnFilterConfigType = {
    selectedColumns: number[];
    setSelectedColumns: React.Dispatch<React.SetStateAction<number[]>>;
};

const ColumnFilterConfig = createContext<columnFilterConfigType>({
    selectedColumns: [],
    setSelectedColumns: () => {},
});

export type TableDataType = {
    [key: string]: string;
};

const TableData = createContext<TableDataType[]>([]);

type CurrentPageType = {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};
const CurrentPage = createContext<CurrentPageType>({} as CurrentPageType);

type filterDataType = {
    depotId: string;
    depotName: string;
};

const filterData: filterDataType[] = new Array(10).fill(null).map(() => ({
    depotId: "DP0172",
    depotName: `Rwamayesi Company Limited-Old Kampala Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, omnis.`,
}));

interface TableProps {
    data: TableDataType[];
    config: configType;
}

export default function Table({ data, config }: TableProps) {
    const [selectedColumns, setSelectedColumns] = useState(
        new Array(config.columns.length).fill(null).map((_, i) => i)
    );
    const [tableData] = useState(data);
    const [currentPage, setCurrentPage] = useState(0);
    return (
        <Config.Provider value={config}>
            <ColumnFilterConfig.Provider
                value={{ selectedColumns, setSelectedColumns }}
            >
                <TableData.Provider value={tableData}>
                    <CurrentPage.Provider
                        value={{ currentPage, setCurrentPage }}
                    >
                        <TableContainer />
                    </CurrentPage.Provider>
                </TableData.Provider>
            </ColumnFilterConfig.Provider>
        </Config.Provider>
    );
}

function TableContainer() {
    return (
        <>
            <div className="flex flex-col bg-white w-full h-full border-[1px] border-[#E9EAEB] rounded-[8px] overflow-hidden">
                <TableHeader />
                <TableBody />
                <TableFooter />
            </div>
        </>
    );
}

function TableHeader() {
    const { header } = useContext(Config);
    const [searchBarValue, setSearchBarValue] = useState("");

    return (
        header && (
            <>
                <div className="px-[24px] py-[20px] w-full flex justify-between items-center gap-1 sm:gap-0">
                    <div className="w-[320px]">
                        {header?.searchBar && <SearchBar value={searchBarValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchBarValue(e.target.value)} />}
                    </div>

                    {/* actions */}
                    <div className="flex justify-right w-fit gap-[8px]">
                        {header?.actions?.map((action) => action)}

                        {header?.columnFilter && <ColumnFilter />}
                    </div>
                </div>
            </>
        )
    );
}

function ColumnFilter() {
    const { columns } = useContext(Config);
    const { selectedColumns, setSelectedColumns } =
        useContext<columnFilterConfigType>(ColumnFilterConfig);
    const allItemsCount = columns.length;
    const isAllSelected = selectedColumns.length === allItemsCount;
    const isIndeterminate = selectedColumns.length > 0 && !isAllSelected;
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedColumns(
                (prevSelected: columnFilterConfigType["selectedColumns"]) => {
                    if (prevSelected.length === allItemsCount) {
                        return [];
                    } else {
                        return columns.map((_, index) => index);
                    }
                }
            );
        } else {
            setSelectedColumns([]);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedColumns((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    return (
        <div className="relative">
            <BorderIconButton
                icon="lucide:filter"
                onClick={() => setShowDropdown(!showDropdown)}
            />
            {showDropdown && (
                <div className="w-[350px] min-h-[300px] h-full absolute right-0 top-[40px] z-50 overflow-auto">
                    <CustomDropdown>
                        <div className="flex gap-[8px] p-[10px]">
                            <CustomCheckbox
                                id="select-all"
                                checked={isAllSelected}
                                indeterminate={isIndeterminate}
                                label="Select All"
                                onChange={handleSelectAll}
                            />
                        </div>
                        {columns.map((col, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex gap-[8px] p-[10px]"
                                >
                                    <CustomCheckbox
                                        id={col.label + index}
                                        checked={selectedColumns.includes(
                                            index
                                        )}
                                        label={col.label}
                                        onChange={() => handleSelectItem(index)}
                                    />
                                </div>
                            );
                        })}
                    </CustomDropdown>
                </div>
            )}
        </div>
    );
}

function TableBody() {
    const { columns, rowSelection, rowActions, pageSize = 10 } = useContext(Config);
    const { currentPage } = useContext(CurrentPage);
    const tableData = useContext(TableData);

    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const displayedData = tableData.slice(startIndex, endIndex);

    const { selectedColumns } =
        useContext<columnFilterConfigType>(ColumnFilterConfig);
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    const allItemsCount: number = tableData.length;
    const isAllSelected = selectedItems.length === allItemsCount;
    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedItems(tableData.map((_, index) => index));
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
                            {rowSelection && selectedColumns.length > 0 && (
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
                                    selectedColumns.includes(index) && (
                                        <th
                                            className={`w-[${col.width}px] px-[24px] py-[12px] font-[500] whitespace-nowrap`}
                                            key={index}
                                        >
                                            <div className="flex items-center gap-[4px]">
                                                {col.label}{" "}
                                                {col.filter?.isFilterable && (
                                                    <FilterTableHeader>
                                                        { col.filter.render(tableData) }
                                                    </FilterTableHeader>
                                                )}
                                                {col.isSortable && (
                                                    <Icon
                                                        icon="mdi-light:arrow-down"
                                                        width={16}
                                                    />
                                                )}
                                            </div>
                                        </th>
                                    )
                                );
                            })}

                            {/* actions */}
                            {rowActions && selectedColumns.length > 0 && (
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
                            displayedData.map((row, index) => (
                                <tr
                                    className="border-b-[1px] border-[#E9EAEB]"
                                    key={index}
                                >
                                    {rowSelection &&
                                        selectedColumns.length > 0 && (
                                            <td className="sm:sticky left-0 bg-white px-[10px] py-[12px]">
                                                <div className="flex items-center gap-[12px] font-[500]">
                                                    <CustomCheckbox
                                                        id={"check" + index}
                                                        label=""
                                                        checked={selectedItems.includes(
                                                            index
                                                        )}
                                                        onChange={() =>
                                                            handleSelectItem(
                                                                index
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        )}

                                    {columns.map(
                                        (
                                            col: configType["columns"][0],
                                            index
                                        ) => {
                                            return (
                                                selectedColumns.includes(
                                                    index
                                                ) && (
                                                    <td
                                                        key={index}
                                                        width={col.width}
                                                        className={`px-[24px] py-[12px]`}
                                                    >
                                                        {col.render ? col.render(row) : (
                                                            <div className="flex items-center">
                                                                {row[col.key]}
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            );
                                        }
                                    )}

                                    {rowActions &&
                                        selectedColumns.length > 0 && (
                                            <td className="sm:sticky right-0 z-10 px-[24px] py-[12px] border-l-[1px] border-[#E9EAEB] bg-white whitespace-nowrap">
                                                <div className="flex items-center gap-[4px]">
                                                    {rowActions.map(
                                                        (action, index) => {
                                                            return (
                                                                <Icon
                                                                    key={index}
                                                                    icon={
                                                                        action.icon
                                                                    }
                                                                    width={20}
                                                                    className="p-[10px] cursor-pointer"
                                                                    onClick={() =>
                                                                        action.onClick && action.onClick(
                                                                            row as object
                                                                        )
                                                                    }
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
}

function FilterTableHeader({ children }: { children: React.ReactNode }) {
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
                        {children}
                    </FilterDropdown>
                </div>
            )}
        </>
    );
}

function TableFooter() {
    const { footer, pageSize = 10 } = useContext(Config);
    const tableData = useContext(TableData);
    const {currentPage, setCurrentPage} = useContext(CurrentPage);
    const totalPages = Math.ceil(tableData.length / pageSize);

    // Determine the start and end page indices
    const firstThreePageIndices = [0, 1, 2];

    // Ensure we don't try to get a negative index if there are fewer than 6 pages
    const lastThreePageIndices =
        totalPages > 3 ? [totalPages - 3, totalPages - 2, totalPages - 1] : [];

    return (
        footer && (
            <div className="px-[24px] py-[12px] flex justify-between items-center text-[#414651]">
                <div>
                    {footer?.nextPrevBtn && (
                        <BorderIconButton
                            icon="lucide:arrow-left"
                            iconWidth={20}
                            label="Previous"
                            labelTw="text-[14px] font-semibold hidden sm:block select-none"
                            onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
                        />
                    )}
                </div>
                <div>
                    {footer?.pagination && (
                        <div className="gap-[2px] text-[14px] hidden md:flex select-none">
                            {totalPages > 6 ? (
                                <>
                                    {firstThreePageIndices.map(
                                        (pageNo, index) => {
                                            return (
                                                <PaginationBtn
                                                    key={index}
                                                    label={(
                                                        pageNo + 1
                                                    ).toString()}
                                                    isActive={
                                                        pageNo === currentPage
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(pageNo)
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                    <PaginationBtn
                                        label={"..."}
                                        isActive={false}
                                    />
                                    {lastThreePageIndices.map(
                                        (pageNo, index) => {
                                            return (
                                                <PaginationBtn
                                                    key={index}
                                                    label={(
                                                        pageNo + 1
                                                    ).toString()}
                                                    isActive={
                                                        pageNo === currentPage
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(pageNo)
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </>
                            ) : (
                                <>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <PaginationBtn
                                            key={index}
                                            label={(index + 1).toString()}
                                            isActive={index === currentPage}
                                            onClick={() =>
                                                setCurrentPage(index)
                                            }
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    {footer?.nextPrevBtn && (
                        <BorderIconButton
                            trailingIcon="lucide:arrow-right"
                            iconWidth={20}
                            label="Next"
                            labelTw="text-[14px] font-semibold hidden sm:block select-none"
                            onClick={() => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)}
                        />
                    )}
                </div>
            </div>
        )
    );
}

function PaginationBtn({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive: boolean;
    onClick?: () => void;
}) {
    return (
        <div
            className={`w-[40px] h-[40px] rounded-[8px] p-[12px] flex items-center justify-center cursor-pointer ${
                isActive
                    ? "bg-[#FFF0F2] text-[#EA0A2A]"
                    : "bg-tranparent text-[#717680]"
            }`}
            onClick={onClick}
        >
            {label}
        </div>
    );
}
