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

export type listReturnType = {
    data: TableDataType[];
    currentPage: number;
    pageSize: number;
    total: number;
};
export type searchReturnType = {
    data: TableDataType[];
    currentPage: number;
    pageSize: number;
    total: number;
};

type configType = {
    api?: {
        search?: (
            search: string,
            pageSize: number
        ) => Promise<searchReturnType> | searchReturnType;
        filter?: () => TableDataType[];
        list: (
            pageNo: number,
            pageSize: number
        ) => Promise<listReturnType> | listReturnType;
    };
    header?: {
        title?: string;
        wholeTableActions?: React.ReactNode[];
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

type columnFilterConfigType = {
    selectedColumns: number[];
    setSelectedColumns: React.Dispatch<React.SetStateAction<number[]>>;
};

const ColumnFilterConfig = createContext<columnFilterConfigType>({
    selectedColumns: [],
    setSelectedColumns: () => {},
});

type SelectedRowType = {
    selectedRow: number[];
    setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>;
};

const SelectedRow = createContext<SelectedRowType>({
    selectedRow: [],
    setSelectedRow: () => {},
});

type configContextType = {
    config: configType;
    setConfig: React.Dispatch<React.SetStateAction<configType>>;
};

const Config = createContext<configContextType>({
    config: {} as configType,
    setConfig: () => {},
});

export type TableDataType = {
    [key: string]: string;
};

type tableDetailsContextType = {
    tableDetails: listReturnType;
    setTableDetails: React.Dispatch<React.SetStateAction<listReturnType>>;
};
const TableDetails = createContext<tableDetailsContextType>(
    {} as tableDetailsContextType
);

interface TableProps {
    refreshKey?: number;
    data?: TableDataType[];
    config: configType;
}

const defaultPageSize = 10;

export default function Table({ refreshKey = 0, data, config }: TableProps) {
    return (
        <ContextProvider>
            <TableContainer refreshKey={refreshKey} data={data} config={config} />
        </ContextProvider>
    );
}

function ContextProvider({ children }: { children: React.ReactNode }) {
    const [selectedColumns, setSelectedColumns] = useState([] as number[]);
    const [selectedRow, setSelectedRow] = useState([] as number[]);
    const [tableDetails, setTableDetails] = useState({} as listReturnType);
    const [config, setConfig] = useState({} as configType);

    return (
        <Config.Provider value={{ config, setConfig }}>
            <ColumnFilterConfig.Provider
                value={{ selectedColumns, setSelectedColumns }}
            >
                <SelectedRow.Provider value={{ selectedRow, setSelectedRow }}>
                    <TableDetails.Provider
                        value={{ tableDetails, setTableDetails }}
                    >
                        {children}
                    </TableDetails.Provider>
                </SelectedRow.Provider>
            </ColumnFilterConfig.Provider>
        </Config.Provider>
    );
}

function TableContainer({ refreshKey, data, config }: TableProps) {
    const { setSelectedColumns } = useContext(ColumnFilterConfig);
    const { setConfig } = useContext(Config);
    const { setTableDetails } = useContext(TableDetails);
    const { selectedRow } = useContext(SelectedRow);

    async function checkForData() {
        // if data is passed, use default values
        if (data) {
            setTableDetails({
                data,
                total: Math.ceil(
                    data.length / (config.pageSize || defaultPageSize)
                ),
                currentPage: 0,
                pageSize: config.pageSize || defaultPageSize,
            });
        }

        // if api is passed, use default values
        else if (config.api?.list) {
            const result = await config.api.list(
                1,
                config.pageSize || defaultPageSize
            );
            const resolvedResult =
                result instanceof Promise ? await result : result;
            const { data, total, currentPage } = resolvedResult;
            setTableDetails({
                data,
                total,
                currentPage: currentPage - 1,
                pageSize: config.pageSize || defaultPageSize,
            });
        }

        // nothing is passed
        else {
            throw new Error(
                "Either pass data or list API function in Table config prop"
            );
        }
    }

    useEffect(() => {
        checkForData();
        setSelectedColumns(config.columns.map((_, index) => index)); // select all in the filter dropdown
        setConfig(config);
    }, [data, refreshKey]);

    return (
        <>
            {(config.header?.title || config.header?.wholeTableActions) && <div className="flex justify-between items-center mb-[20px] h-[34px]">
                {config.header?.title && (
                    <h1 className="text-[18px] font-semibold text-[#181D27]">
                        {config.header.title}
                    </h1>
                )}

                {selectedRow.length > 0 && config.header?.wholeTableActions?.map((action) => action)}
            </div>}
            <div className="flex flex-col bg-white w-full border-[1px] border-[#E9EAEB] rounded-[8px] overflow-hidden">
                <TableHeader />
                <TableBody />
                <TableFooter />
            </div>
        </>
    );
}

function TableHeader() {
    const { config } = useContext(Config);
    const { setTableDetails } = useContext(TableDetails);
    const [searchBarValue, setSearchBarValue] = useState("");

    async function handleSearch(){
        if(!config.api?.search) return;
        const result = await config.api.search(
            searchBarValue,
            config.pageSize || defaultPageSize
        );
        const resolvedResult = result instanceof Promise ? await result : result;
        const { data, pageSize } = resolvedResult;
        setTableDetails({
            data,
            total: 0,
            currentPage: 0,
            pageSize: pageSize || defaultPageSize,
        });
    }

    return (
        <>
            <div className="px-[24px] py-[20px] w-full flex justify-between items-center gap-[8px]">
                {config.header && (
                    <>
                        <div className="w-[320px] invisible sm:visible">
                            {config.header?.searchBar && (
                                <SearchBar
                                    value={searchBarValue}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setSearchBarValue(e.target.value)}
                                    onEnterPress={handleSearch}
                                />
                            )}
                        </div>

                        {/* actions */}
                        <div className="flex justify-right w-fit gap-[8px]">
                            {config.header?.actions?.map((action) => action)}

                            {config.header?.columnFilter && <ColumnFilter />}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function ColumnFilter() {
    const { config } = useContext(Config);
    const { columns } = config;
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
                    <div className="min-w-[200px] max-w-[350px] w-fit min-h-[200px] max-h-1/2 h-fit fixed right-[50px] translate-y-[10px] z-50 overflow-auto scrollbar-none">
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
    const { config } = useContext(Config);
    const {
        api,
        columns,
        rowSelection,
        rowActions,
        pageSize = defaultPageSize,
    } = config;
    const { tableDetails } = useContext(TableDetails);
    const tableData = tableDetails.data || [];

    const [displayedData, setDisplayedData] = useState<TableDataType[]>([]);
    const [tableOrder, setTableOrder] = useState<{
        column: string;
        order: "asc" | "desc";
    }>({ column: "", order: "asc" });

    const startIndex = tableDetails.currentPage * pageSize;
    const endIndex = startIndex + pageSize;

    const { selectedColumns } =
        useContext<columnFilterConfigType>(ColumnFilterConfig);
    const { selectedRow, setSelectedRow } = useContext(SelectedRow);
    if (!Array.isArray(tableData))
        throw new Error("Data must me in Array format");
    const allItemsCount: number = tableData.length || 0;
    const isAllSelected = selectedRow.length === allItemsCount;
    const isIndeterminate = selectedRow.length > 0 && !isAllSelected;

    useEffect(() => {
        if (!api?.list) {
            setDisplayedData(tableData.slice(startIndex, endIndex));
        } else {
            setDisplayedData(tableData);
        }
    }, [tableDetails]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRow(tableData.map((_, index) => index));
        } else {
            setSelectedRow([]);
        }
    };

    const handleSelectItem = (id: number) => {
        setSelectedRow((prevSelected) =>
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
                            {columns &&
                                columns.map((col, index) => {
                                    return (
                                        selectedColumns.includes(index) && (
                                            <th
                                                className={`w-[${col.width}px] px-[24px] py-[12px] font-[500] whitespace-nowrap`}
                                                key={index}
                                            >
                                                <div className="flex items-center gap-[4px]">
                                                    {col.label}{" "}
                                                    {col.filter
                                                        ?.isFilterable && (
                                                        <FilterTableHeader>
                                                            {col.filter.render(tableData)}
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
                                                                handleSort(
                                                                    col.key
                                                                )
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
                        {displayedData.length > 0 &&
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
                                                        checked={selectedRow.includes(
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
                                                selectedColumns.includes(index) && (
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
                                                                        action.onClick(
                                                                            row
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
                            ))}
                        {displayedData.length <= 0 && (
                            <tr>
                                <td colSpan={columns?.length + 2 || 1}>
                                    <div className="content-center text-center py-[12px] text-[24px] max-h-full min-h-[200px]">
                                        No data available
                                    </div>
                                </td>
                            </tr>
                        )}
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
    const { config } = useContext(Config);
    const { api, footer, pageSize = defaultPageSize } = config;
    const { tableDetails, setTableDetails } = useContext(TableDetails);
    const cPage = tableDetails.currentPage || 0;
    const totalPages = tableDetails.total || 1;

    // Determine the start and end page indices
    const firstThreePageIndices = [0, 1, 2];

    // Ensure we don't try to get a negative index if there are fewer than 6 pages
    const lastThreePageIndices =
        totalPages > 3 ? [totalPages - 3, totalPages - 2, totalPages - 1] : [];

    async function handlePageChange(pageNo: number) {
        if (pageNo < 0 || pageNo > totalPages - 1) return;
        if (api?.list) {
            const result = await api.list(pageNo + 1, pageSize);
            const resolvedResult =
                result instanceof Promise ? await result : result;
            const { data, total, currentPage } = resolvedResult;
            setTableDetails({
                ...tableDetails,
                data,
                currentPage: currentPage - 1,
                total,
                pageSize,
            });
        } else {
            setTableDetails({ ...tableDetails, currentPage: pageNo });
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
                            disabled={cPage === 0}
                            onClick={() => handlePageChange(cPage - 1)}
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
                                                    isActive={pageNo === cPage}
                                                    onClick={() =>
                                                        handlePageChange(pageNo)
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
                                                    isActive={pageNo === cPage}
                                                    onClick={() =>
                                                        handlePageChange(pageNo)
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
                                            isActive={index === cPage}
                                            onClick={() =>
                                                handlePageChange(index)
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
                            disabled={cPage === totalPages - 1}
                            onClick={() => handlePageChange(cPage + 1)}
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