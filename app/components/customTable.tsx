"use client";

import SearchBar from "./searchBar";
import { Icon } from "@iconify-icon/react";
import CustomDropdown from "./customDropdown";
import BorderIconButton from "./borderIconButton";
import { createContext, useContext, useEffect, useState } from "react";
import FilterDropdown from "./filterDropdown";
import CustomCheckbox from "./customCheckbox";
import DismissibleDropdown from "./dismissibleDropdown";
import { naturalSort } from "../(private)/utils/naturalSort";

type configType = {
    api?: {
        search: () => {
            data: TableDataType[];
            currentPage: number;
            pageSize: number;
            total: number;
        };
        filter: () => TableDataType[];
        pagination: (page: number) => {
            data: TableDataType[];
            currentPage: number;
            pageSize: number;
            total: number;
        }
    };
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
        onClick?: (data: TableDataType) => void;
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
        };
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

const TableData = createContext<{
    tableData: TableDataType[];
    setTableData: React.Dispatch<React.SetStateAction<TableDataType[]>>;
}>({ tableData: [], setTableData: () => {} });

type CurrentPageType = {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};
const CurrentPage = createContext<CurrentPageType>({} as CurrentPageType);

interface TableProps {
    data: TableDataType[];
    config: configType;
}

export default function Table({ data, config }: TableProps) {
    const [selectedColumns, setSelectedColumns] = useState(
        new Array(config.columns.length).fill(null).map((_, i) => i)
    );
    const [tableData, setTableData] = useState(data);
    const [currentPage, setCurrentPage] = useState(0);

    return (
        <Config.Provider value={config}>
            <ColumnFilterConfig.Provider
                value={{ selectedColumns, setSelectedColumns }}
            >
                <TableData.Provider value={{ tableData, setTableData }}>
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
                    <div className="w-[320px] invisible sm:visible">
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
            <DismissibleDropdown
                isOpen={showDropdown}
                setIsOpen={setShowDropdown}
                button={
                    <BorderIconButton
                        icon="lucide:filter"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                }
                dropdown={
                    <div className="w-[350px] min-h-[300px] h-full absolute right-0 top-[40px] z-50 overflow-hidden">
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
                                            onChange={() =>
                                                handleSelectItem(index)
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </CustomDropdown>
                    </div>
                }
            />
        </div>
    );
}

function TableBody() {
    const {
        api,
        columns,
        rowSelection,
        rowActions,
        pageSize = 10,
    } = useContext(Config);
    const { currentPage } = useContext(CurrentPage);
    const { tableData } = useContext(TableData);
    const [displayedData, setDisplayedData] = useState<TableDataType[]>([]);
    const [tableOrder, setTableOrder] = useState<{
        column: string;
        order: "asc" | "desc";
    }>({ column: "", order: "asc" });
    
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;

    const { selectedColumns } =
        useContext<columnFilterConfigType>(ColumnFilterConfig);
    const [selectedItems, setSelectedItems] = useState<Array<number>>([]);
    if(!Array.isArray(tableData)) throw new Error("Data must me in Array format")
    const allItemsCount: number = tableData.length || 0;
    const isAllSelected = selectedItems.length === allItemsCount;
    const isIndeterminate = selectedItems.length > 0 && !isAllSelected;

    useEffect(() => {
        if (!api?.pagination){
            setDisplayedData(tableData.slice(startIndex, endIndex));
        } else {
            setDisplayedData(tableData);
        }
    }, [currentPage]);

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

    const handleSort = (column: string) => {
        if (tableOrder.column === column) {
            setTableOrder({
                column,
                order: tableOrder.order === "asc" ? "desc" : "asc",
            });
        } else {
            setTableOrder({ column, order: "desc" });
        }

        setDisplayedData(naturalSort(displayedData, tableOrder.order, column));
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
                                                        {col.filter.render(
                                                            tableData
                                                        )}
                                                    </FilterTableHeader>
                                                )}
                                                {col.isSortable && (
                                                    <Icon
                                                        className="cursor-pointer"
                                                        icon={
                                                            tableOrder.order ===
                                                                "asc" &&
                                                            tableOrder.column ===
                                                                col.key
                                                                ? "mdi-light:arrow-up"
                                                                : "mdi-light:arrow-down"
                                                        }
                                                        width={16}
                                                        onClick={() =>
                                                            handleSort(col.key)
                                                        }
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
                                                        {col.render ? (
                                                            col.render(row)
                                                        ) : (
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
                                                                        action.onClick &&
                                                                        action.onClick(row)
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
        <DismissibleDropdown
            isOpen={showFilterDropdown}
            setIsOpen={setShowFilterDropdown}
            button={
                <Icon
                    icon="circum:filter"
                    width={16}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                />
            }
            dropdown={<FilterDropdown>{children}</FilterDropdown>}
        />
    );
}

function TableFooter() {
    const { api, footer, pageSize = 10 } = useContext(Config);
    const { tableData, setTableData } = useContext(TableData);
    const { currentPage, setCurrentPage } = useContext(CurrentPage);
    const [totalPages, setTotalPages] = useState(0);

    // Determine the start and end page indices
    const firstThreePageIndices = [0, 1, 2];

    // Ensure we don't try to get a negative index if there are fewer than 6 pages
    const lastThreePageIndices =
        totalPages > 3 ? [totalPages - 3, totalPages - 2, totalPages - 1] : [];

    useEffect(() => {
        if(!api?.pagination) setTotalPages(Math.ceil(tableData.length / pageSize));
    }, [])

    function handlePageChange(pageNo: number) {
        if (api?.pagination) {
            const { data, currentPage, total } = api.pagination(pageNo);
            setTableData(data);
            setTotalPages(total);
            setCurrentPage(currentPage);
        } else if (pageNo >= 0 && pageNo < totalPages){
            setCurrentPage(pageNo);
        } 
    }

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
                            onClick={() => handlePageChange(currentPage - 1) }
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
                                                    onClick={() => handlePageChange(pageNo) }
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
                                                    onClick={() => handlePageChange(pageNo) }
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
                                            onClick={() => handlePageChange(index) }
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
                            onClick={() => handlePageChange(currentPage + 1)}
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
