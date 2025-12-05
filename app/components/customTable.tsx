"use client";

import SearchBar from "./searchBar";
import { Icon } from "@iconify-icon/react";
import CustomDropdown from "./customDropdown";
import BorderIconButton from "./borderIconButton";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import FilterDropdown from "./filterDropdown";
import InputFields from "./inputFields";
import SidebarBtn from "./dashboardSidebarBtn";
import CustomCheckbox from "./customCheckbox";
import DismissibleDropdown from "./dismissibleDropdown";
import { naturalSort } from "../(private)/utils/naturalSort";
import { CustomTableSkelton } from "./customSkeleton";
import Draggable from "react-draggable";

export type listReturnType = {
    data: TableDataType[];
    currentPage: number;
    pageSize: number;
    total: number;
    totalRecords?: number;
};
export type searchReturnType = listReturnType;
export type FilterField = {
    key: string;
    label?: string;
    type?: "text" | "select" | "date" | "dateChange" | "number";
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    isSingle?: boolean;
    multiSelectChips?: boolean;
    applyWhen?: (filters: Record<string, any>) => boolean;
    inputProps?: Record<string, any>;
};

export type configType = {
    api?: {
        search?: (
            search: string,
            pageSize: number,
            columnName?: string,
            pageNo?: number,
        ) => Promise<listReturnType> | listReturnType;
        list?: (
            pageNo: number,
            pageSize: number
        ) => Promise<listReturnType> | listReturnType;
        filterBy?: (
            payload: Record<string, string | number | null>,
            pageSize: number
        ) => Promise<listReturnType> | listReturnType;
    };
    header?: {
        title?: string;
        wholeTableActions?: React.ReactNode[];
        tableActions?: React.ReactNode[];
        searchBar?:
        | boolean
        | {
            placeholder: string;
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        }; // yet to implement
        columnFilter?: boolean;
        filterByFields?: FilterField[];
        threeDot?: {
            label: string;
            labelTw?: string;
            icon?: string;
            iconWidth?: string;
            onClick?: (data: TableDataType[], selectedRow?: number[]) => void;
            showOnSelect?: boolean;
            showWhen?: (data: TableDataType[], selectedRow?: number[]) => boolean;
        }[],
        selectedCount?: {
            label?: string | React.ReactNode;
            labelTw?: string;
            onClick?: (data: TableDataType[], selectedRow?: number[]) => void;
        };
        actions?: React.ReactNode[];
        actionsWithData?: (data: TableDataType[], selectedRow?: number[]) => React.ReactNode[];
    };
    rowActions?: {
        icon: string;
        onClick?: (data: TableDataType) => void;
    }[];
    table?: {
        width?: number | string;
        maxWidth?: number | string;
        maxHeight?: number | string;
        height?: number | string;
    };
    footer?: {
        nextPrevBtn?: boolean;
        pagination?: boolean;
    };
    localStorageKey?: string;
    showNestedLoading?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[]; // yet to implement
    rowSelection?: boolean;
    dragableColumn?: boolean;
    floatingInfoBar?: {
        showByDefault?: boolean;
        showSelectedRow?: boolean;
        rowSelectionOnClick?: (data: TableDataType[], selectedRow?: number[], selectedColumns?: number[]) => void;
        buttons?: {
            label: string;
            labelTw?: string;
            icon?: string;
            iconWidth?: string;
            onClick?: (data: TableDataType[], selectedRow?: number[], selectedColumns?: number[]) => void;
            showOnSelect?: boolean;
            showWhen?: (data: TableDataType[], selectedRow?: number[], selectedColumns?: number[]) => boolean;
        }[];
    };
    columns: {
        key: string;
        label: string | React.ReactNode;
        width?: number;
        render?: (row: TableDataType) => React.ReactNode;
        align?: "left" | "center" | "right";
        sticky?: string;
        isSortable?: boolean;
        showByDefault?: boolean;
        filter?: {
            isFilterable?: boolean;
            width?: number | string;
            height?: number | string;
            maxHeight?: number | string;
            maxWidth?: number | string;
            options?: Array<{ value: string; label: string }>; // dropdown options
            onSearch?: (search: string) => Promise<Array<{ value: string; label: string }>> | Array<{ value: string; label: string }>; // search handler
            onSelect?: (selected: string | string[]) => void; // selection handler, now supports array for multi-select
            isSingle?: boolean; // new prop, default true
            selectedValue?: string; // <-- add this for single-select highlight
            render?: (
                data: TableDataType[],
                search?: (
                    search: string,
                    pageSize: number,
                    columnName?: string,
                    pageNo?: number,
                ) => Promise<listReturnType> | listReturnType
            ) => React.ReactNode;
        };
    }[];
};

type columnFilterConfigType = {
    selectedColumns: number[];
    setSelectedColumns: React.Dispatch<React.SetStateAction<number[]>>;
};

const ColumnFilterConfig = createContext<columnFilterConfigType>({
    selectedColumns: [],
    setSelectedColumns: () => { },
});

type SelectedRowType = {
    selectedRow: number[];
    setSelectedRow: React.Dispatch<React.SetStateAction<number[]>>;
};

const SelectedRow = createContext<SelectedRowType>({
    selectedRow: [],
    setSelectedRow: () => { },
});

type configContextType = {
    config: configType;
    setConfig: React.Dispatch<React.SetStateAction<configType>>;
};

const Config = createContext<configContextType>({
    config: {} as configType,
    setConfig: () => { },
});

export type TableDataType = {
    [key: string]: string;
};

type tableDetailsContextType = {
    tableDetails: listReturnType;
    setTableDetails: React.Dispatch<React.SetStateAction<listReturnType>>;
    nestedLoading: boolean;
    setNestedLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // initial data snapshot so components can restore original list
    initialTableData?: listReturnType | null;
    setInitialTableData: React.Dispatch<React.SetStateAction<listReturnType | null>>;
    // search and filter state to avoid using window globals
    searchState: { applied: boolean; term: string };
    setSearchState: React.Dispatch<React.SetStateAction<{ applied: boolean; term: string }>>;
    filterState: { applied: boolean; payload: Record<string, any> };
    setFilterState: React.Dispatch<React.SetStateAction<{ applied: boolean; payload: Record<string, any> }>>;
};
const TableDetails = createContext<tableDetailsContextType>(
    {} as tableDetailsContextType
);

interface TableProps {
    refreshKey?: number;
    data?: TableDataType[];
    config: configType;
}

const defaultPageSize = 50;

export default function Table({ refreshKey = 0, data, config }: TableProps) {
    return (
        <ContextProvider>
            <TableContainer
                refreshKey={refreshKey}
                data={data}
                config={{
                    showNestedLoading: true,
                    dragableColumn: true,
                    ...config
                }}
            />
        </ContextProvider>
    );
}

function ContextProvider({ children }: { children: React.ReactNode }) {
    const [selectedColumns, setSelectedColumns] = useState([] as number[]);
    const [selectedRow, setSelectedRow] = useState([] as number[]);
    const [tableDetails, setTableDetails] = useState({} as listReturnType);
    const [nestedLoading, setNestedLoading] = useState(false);
    const [initialTableData, setInitialTableData] = useState<listReturnType | null>(null);
    const [searchState, setSearchState] = useState<{ applied: boolean; term: string }>({ applied: false, term: "" });
    const [filterState, setFilterState] = useState<{ applied: boolean; payload: Record<string, any> }>({ applied: false, payload: {} });
    const [config, setConfig] = useState({} as configType);

    return (
        <Config.Provider value={{ config, setConfig }}>
            <ColumnFilterConfig.Provider
                value={{ selectedColumns, setSelectedColumns }}
            >
                <SelectedRow.Provider value={{ selectedRow, setSelectedRow }}>
                    <TableDetails.Provider
                        value={{ tableDetails, setTableDetails, nestedLoading, setNestedLoading, initialTableData, setInitialTableData, searchState, setSearchState, filterState, setFilterState }}
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
    const { tableDetails, setTableDetails, setNestedLoading, setInitialTableData } = useContext(TableDetails);
    const { selectedRow, setSelectedRow } = useContext(SelectedRow);
    const [showDropdown, setShowDropdown] = useState(false);
    const [displayedData, setDisplayedData] = useState<TableDataType[]>([]);
    // ordering of columns (array of original column indices). initialized from config.columns
    const [columnOrder, setColumnOrder] = useState<number[]>(
        () => (config.columns || []).map((_, i) => i)
    );

    async function checkForData() {
        // if data is passed, use default values
        if (data) {
            const date = new Date();
            setNestedLoading(true);
            setTableDetails({
                data,
                total: Math.ceil(
                    data.length / (config.pageSize || defaultPageSize)
                ),
                currentPage: 0,
                pageSize: config.pageSize || defaultPageSize,
            });
            setDisplayedData(data);
            try {
                setInitialTableData({
                    data,
                    total: Math.ceil(
                        data.length / (config.pageSize || defaultPageSize)
                    ),
                    currentPage: 0,
                    pageSize: config.pageSize || defaultPageSize,
                });
            } catch (err) {
                /* ignore */
            }
            setTimeout(() => setNestedLoading(false), Math.max(0, 1000 - (new Date().getTime() - date.getTime())));
        }

        // if api is passed, use default values
        else if (config.api?.list) {
            const MIN_LOADING_MS = 1000; // ensure nested loading lasts at least 1s
            const start = Date.now();
            try {
                setNestedLoading(true);
                const result = await config.api.list(
                    1,
                    config.pageSize || defaultPageSize
                );
                const resolvedResult =
                    result instanceof Promise ? await result : result;
                const { data, total, currentPage } = resolvedResult;
                const tableInit = {
                    data,
                    total,
                    currentPage: currentPage - 1,
                    pageSize: config.pageSize || defaultPageSize,
                };
                setTableDetails(tableInit);
                setDisplayedData(data);
                try {
                    setInitialTableData(tableInit);
                } catch (err) {
                    /* ignore */
                }
            } finally {
                // guarantee minimum display time for nested loading
                const elapsed = Date.now() - start;
                const wait = Math.max(0, MIN_LOADING_MS - elapsed);
                if (wait > 0) {
                    await new Promise((res) => setTimeout(res, wait));
                }
                setNestedLoading(false);
            }
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
        setConfig(config);

        // Only initialize "select all" when there is no saved selection in localStorage.
        // If a saved array exists we leave it to ColumnFilter's localStorage loader to restore it.
        try {
            const key = config?.localStorageKey;
            const saved = key ? localStorage.getItem(key) : null;
            if (!saved) {
                const allByDefault = config.columns.map((data, index) => { return data.showByDefault ? index : -1 });
                const filtered = allByDefault.filter((n) => n !== -1);
                if (filtered.length > 0) {
                    setSelectedColumns(filtered);
                    return;
                }
                setSelectedColumns(config.columns?.map((_, index) => index));
            }
        } catch (err) {
            // If reading localStorage fails, fall back to select all
            setSelectedColumns(config.columns?.map((_, index) => index));
        }
        setSelectedRow([]);
    }, [data, refreshKey]);


    const orderedColumns = (columnOrder || []).map((i) => config.columns[i]).filter(Boolean);

    return (
        <>
            {(config.header?.title || config.header?.wholeTableActions || config.header?.tableActions) && (
                <div className="flex justify-between items-center mb-[20px] h-[34px]">
                    {config.header?.title && (
                        <h1 className="text-[18px] font-semibold text-[#181D27]">
                            {config.header.title}
                        </h1>
                    )}

                    <div className="flex gap-[8px]">
                        {config.header?.tableActions && config.header?.tableActions?.map((action) => action)}

                        {selectedRow.length > 0 &&
                            config.header?.wholeTableActions?.map(
                                (action) => action
                            )}

                        {config.header?.threeDot &&
                            <div className="flex gap-[12px] relative">
                                <DismissibleDropdown
                                    isOpen={showDropdown}
                                    setIsOpen={setShowDropdown}
                                    button={
                                        <BorderIconButton icon="ic:sharp-more-vert" />
                                    }
                                    dropdown={
                                        <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                            <CustomDropdown>
                                                {config.header?.threeDot?.map((option, idx) => {
                                                    const shouldShow = option.showOnSelect ? selectedRow.length > 0 : option.showWhen ? option.showWhen(displayedData, selectedRow) : true;
                                                    if (!shouldShow) return null;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA] cursor-pointer"
                                                            onClick={() => option.onClick && option.onClick(displayedData, selectedRow)}
                                                        >
                                                            {option?.icon && (
                                                                <Icon
                                                                    icon={option.icon}
                                                                    width={option.iconWidth || 20}
                                                                    className="text-[#717680]"
                                                                />
                                                            )}
                                                            <span className={`text-[#181D27] font-[500] text-[16px] ${option?.labelTw}`}>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </CustomDropdown>
                                        </div>
                                    }
                                />
                            </div>
                        }
                    </div>
                </div>
            )}
            <div className="flex flex-col bg-white w-full border-[1px] border-[#E9EAEB] rounded-[8px] overflow-hidden">
                <TableHeader />
                <TableBody orderedColumns={orderedColumns} setColumnOrder={setColumnOrder} />
                <TableFooter />
            </div>
        </>
    );
}

function TableHeader() {
    const { config } = useContext(Config);
    const { tableDetails, setTableDetails, setNestedLoading, setSearchState, searchState, initialTableData } = useContext(TableDetails);
    const [searchBarValue, setSearchBarValue] = useState("");
    const { selectedRow } = useContext(SelectedRow);

    async function handleSearch() {
        if (!config.api?.search) return;
        try {
            setNestedLoading(true);
            const result = await config.api.search(
                searchBarValue,
                config.pageSize || defaultPageSize
            );
            const resolvedResult = result instanceof Promise ? await result : result;
            const { data, pageSize, total, currentPage } = resolvedResult;
            // console.log(resolvedResult);
            setTableDetails({
                data,
                total: total || 0,
                currentPage: currentPage - 1 || 0,
                pageSize: pageSize || defaultPageSize
            });
            // persist global search state so pagination can reuse it (via context)
            try {
                if (searchBarValue && String(searchBarValue).trim().length > 0) {
                    setSearchState({ applied: true, term: searchBarValue });
                } else {
                    setSearchState({ applied: false, term: "" });
                }
            } catch (err) {
                // ignore in non-browser environments
            }
        } finally {
            setNestedLoading(false);
        }
    }

    return (
        <>
            {config.header && (
                <div className="px-[24px] py-[20px] w-full flex justify-between items-center gap-[8px]">
                    <>
                        <div className="flex items-center gap-2 w-[320px] invisible sm:visible">
                            {config.header?.searchBar && (
                                <div className="w-full">
                                <SearchBar
                                    value={searchBarValue}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setSearchBarValue(e.target.value)}
                                    onEnterPress={handleSearch}
                                />
                                </div>
                            )}

                            {/* show results summary for global search (from context) */}
                            {searchState && searchState.applied && (
                                <div className="ml-3 flex items-center gap-2 text-sm text-gray-600">
                                </div>
                            )}

                            {/* header filter panel button (shows configurable fields) */}
                            {config.header?.filterByFields && config.header.filterByFields.length > 0 && (
                                <div className="ml-2">
                                    <FilterBy />
                                </div>
                            )}
                            {config.header?.selectedCount !== undefined && (
                                <div className="w-full ml-2 text-sm text-gray-600">
                                    {config.header?.selectedCount?.label && (
                                        <span className={config.header?.selectedCount?.labelTw} onClick={() => config.header?.selectedCount?.onClick && config.header?.selectedCount?.onClick(tableDetails.data, selectedRow)}>
                                            {typeof config.header?.selectedCount?.label === "string"
                                                ? `${config.header?.selectedCount?.label}${selectedRow.length}`
                                                : <>{config.header?.selectedCount?.label}{selectedRow.length}</>}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* actions */}
                        <div className="flex justify-right  w-fit gap-[8px]">
                            {config.header?.actions?.map((action) => action)}
                            {config.header?.actionsWithData && config.header?.actionsWithData(tableDetails?.data || [], selectedRow).map((action) => action)}
                            {config.header?.columnFilter && <ColumnFilter />}
                        </div>
                    </>
                </div>
            )}
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

    useEffect(() => {
        // Load saved selected columns from localStorage when component mounts or config/columns change
        if (!config?.localStorageKey) return;
        try {
            const raw = localStorage.getItem(config.localStorageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                // Keep only valid numeric indices within columns range
                const valid = (parsed as unknown[]).filter(
                    (n: unknown): n is number =>
                        typeof n === "number" && n >= 0 && n < columns.length
                );
                if (valid.length) {
                    setSelectedColumns(valid);
                }
            }
        } catch (err) {
            // ignore parse errors
            console.warn(
                "Failed to read selected columns from localStorage",
                err
            );
        }
    }, [config?.localStorageKey, columns, setSelectedColumns]);

    useEffect(() => {
        // Persist selected columns to localStorage whenever it changes
        if (!config?.localStorageKey) return;
        try {
            localStorage.setItem(
                config.localStorageKey,
                JSON.stringify(selectedColumns)
            );
        } catch (err) {
            // ignore write errors
            console.warn(
                "Failed to save selected columns to localStorage",
                err
            );
        }
    }, [selectedColumns, config?.localStorageKey]);

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
                        className="h-[40px]"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                }
                dropdown={
                    <div className="min-w-[200px] max-w-[350px] w-fit min-h-[200px] max-h-1/2 h-fit fixed right-[50px] translate-y-[10px] z-50 overflow-auto scrollbar-none">

                        <CustomDropdown>
                            <div className="flex p-[10px]">
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
                                            id={index.toString()}
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


function TableBody({ orderedColumns, setColumnOrder }: { orderedColumns: configType['columns']; setColumnOrder: React.Dispatch<React.SetStateAction<number[]>> }) {
    const { config } = useContext(Config);
    const { api, rowSelection, rowActions, pageSize = defaultPageSize } = config;
    // columns is derived from orderedColumns passed from TableContainer; fallback to config.columns
    const columns = orderedColumns && orderedColumns.length > 0 ? orderedColumns : config.columns;
    const dragIndex = useRef<number | null>(null);
    const { tableDetails, nestedLoading, setNestedLoading } = useContext(TableDetails);
    const tableData = tableDetails.data || [];

    const [displayedData, setDisplayedData] = useState<TableDataType[]>([]);
    const [tableOrder, setTableOrder] = useState<{
        column: string;
        order: "asc" | "desc";
    }>({ column: "", order: "desc" });

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
        // Update displayedData whenever tableDetails changes. Do not
        // toggle nestedLoading here — TableContainer owns nestedLoading for
        // API-driven loads. This prevents premature hiding of the loader.
        if (!api?.list) {
            setDisplayedData(tableData.slice(startIndex, endIndex));
        } else {
            setDisplayedData(tableData);
        }
    }, [tableDetails]);

    // If no sort column is set yet, initialize tableOrder to the first sortable column
    // and apply sorting once data is available.
    useEffect(() => {
        if (displayedData.length === 0) return;
        if (tableOrder && tableOrder.column) return;
        const firstSortable = columns?.find((c: any) => c.isSortable);
        if (firstSortable) {
            const colKey = firstSortable.key;
            const defaultOrder: "asc" | "desc" = tableOrder.order || "desc";
            setTableOrder({ column: colKey, order: defaultOrder });
            setDisplayedData(naturalSort(displayedData, defaultOrder, colKey));
        }
    }, [displayedData, columns]);

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
        // compute next order first (avoid using stale state after setState)
        let nextOrder: "asc" | "desc";
        if (tableOrder.column === column) {
            nextOrder = tableOrder.order === "asc" ? "desc" : "asc";
        } else {
            // default order when switching to a new column
            nextOrder = "desc";
        }
        setTableOrder({ column, order: nextOrder });
        // apply sorting using the computed order immediately
        setDisplayedData(naturalSort(displayedData, nextOrder, column));
    };

    return (
        <>{(config.showNestedLoading && nestedLoading) ? <CustomTableSkelton /> : <>
            <div
                className="overflow-x-auto border-b-[1px] border-[#E9EAEB] scrollbar-thin scrollbar-thumb-[#D5D7DA] scrollbar-track-transparent"
                style={
                    displayedData.length > 0
                        ? {
                            height: config.table?.height,
                            maxHeight: config.table?.maxHeight,
                            width: config.table?.width,
                            maxWidth: config.table?.maxWidth,
                        }
                        : undefined
                }
            >
                <table className="table-auto min-w-max w-full">
                    <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
                        <tr className="relative h-[44px] border-b-[1px] border-[#E9EAEB]">
                            {/* checkbox */}
                            {rowSelection && selectedColumns.length > 0 && (
                                <th className="z-10 sm:sticky left-0 bg-[#FAFAFA] w-fit px-[10px] py-[12px] font-[500]">
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
                                columns.map((col, orderIdx) => {
                                    // find original index in config.columns to check selectedColumns
                                    const originalIndex = config.columns?.findIndex((c) => c.key === col.key);
                                    if (!selectedColumns.includes(originalIndex)) return null;
                                    return (
                                        <th
                                            // enable native drag only when config.dragableColumn is true
                                            draggable={!!config.dragableColumn}
                                            onDragStart={(e) => {
                                                if (!config.dragableColumn) return;
                                                dragIndex.current = orderIdx;
                                                try {
                                                    e.dataTransfer?.setData('text/plain', String(orderIdx));
                                                    e.dataTransfer!.effectAllowed = 'move';
                                                } catch (err) {
                                                    /* ignore */
                                                }
                                            }}
                                            onDragOver={(e) => {
                                                if (!config.dragableColumn) return;
                                                e.preventDefault();
                                                try { e.dataTransfer!.dropEffect = 'move'; } catch (err) { }
                                            }}
                                            onDrop={(e) => {
                                                if (!config.dragableColumn) return;
                                                e.preventDefault();
                                                const from = dragIndex.current;
                                                const to = orderIdx;
                                                if (from == null) return;
                                                if (from === to) {
                                                    dragIndex.current = null;
                                                    return;
                                                }
                                                setColumnOrder((prev) => {
                                                    const next = [...prev];
                                                    const item = next.splice(from, 1)[0];
                                                    next.splice(to, 0, item);
                                                    return next;
                                                });
                                                dragIndex.current = null;
                                            }}
                                            className={`${col.width ? `w-[${col.width}px]` : ""} ${col.sticky ? "z-20 md:sticky" : ""} ${col.sticky === "left" ? "left-0" : ""} ${col.sticky === "right" ? "right-0" : ""} px-[24px] py-[12px] bg-[#FAFAFA] font-[500] whitespace-nowrap ${config.dragableColumn ? '' : ''}`}
                                            key={col.key}
                                        >
                                            <div className="flex items-center gap-[4px] capitalize">
                                                {col.label}{" "}
                                                {col.filter && (
                                                    <FilterTableHeader
                                                        column={col.key}
                                                        dimensions={col.filter}
                                                        filterConfig={col.filter}
                                                    >
                                                        {col.filter.render
                                                            ? col.filter.render(tableData, api?.search)
                                                            : null}
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
                                    );
                                })}

                            {/* actions */}
                            {rowActions && selectedColumns.length > 0 && (
                                <th
                                    className="
                                sm:sticky right-0 z-[10]
                                px-[24px] py-[12px] font-[500] text-left
                                border-[#E9EAEB]
                                bg-[#FAFAFA] whitespace-nowrap
                                before:content-[''] before:absolute before:top-0 before:left-0 before:w-[1px] before:h-full before:bg-[#E9EAEB]
                                "
                                //  className="sticky top-0 sm:right-0 z-10 px-[24px] py-[12px] font-[500] text-left border-l-[1px] border-[#E9EAEB] bg-[#FAFAFA]"
                                >
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
                                    className="border-b-[1px] border-[#E9EAEB] capitalize"
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

                                    {columns?.map((col: configType["columns"][0], orderIdx) => {
                                        const originalIndex = config.columns.findIndex((c) => c.key === col.key);
                                        if (!selectedColumns.includes(originalIndex)) return null;
                                        return (
                                            <td
                                                key={col.key}
                                                width={col.width}
                                                className={`px-[24px] py-[12px] bg-white ${col.sticky ? "z-10 md:sticky" : ""} ${col.sticky === "left"
                                                    ? "left-0"
                                                    : ""
                                                    } ${col.sticky === "right"
                                                        ? "right-0"
                                                        : ""
                                                    }`}
                                            >
                                                {col.render ? (
                                                    col.render(row)
                                                ) : (
                                                    <div className="flex items-center">
                                                        {row[col.key] || "-"}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}

                                    {rowActions &&
                                        selectedColumns.length > 0 && (
                                            <td
                                                className="
                                            sm:sticky right-0 z-[10]
                                            px-[2px] py-[12px]
                                            border-[#E9EAEB]
                                            bg-white whitespace-nowrap
                                            before:content-[''] before:absolute before:top-0 before:left-0 before:w-[1px] before:h-full before:bg-[#E9EAEB]
                                            "
                                            >
                                                <div className="flex items-center gap-[4px]">
                                                    {rowActions.map(
                                                        (action, index) => (
                                                            <Icon
                                                                key={index}
                                                                icon={
                                                                    action.icon
                                                                }
                                                                width={20}
                                                                className="
                                                    p-[10px] cursor-pointer
                                                    text-[#5E5E5E]
                                                    transition-all duration-200 ease-in-out
                                                    hover:text-[#EA0A2A]
                                                    hover:scale-110
                                                "
                                                                onClick={() =>
                                                                    action.onClick &&
                                                                    action.onClick(
                                                                        row
                                                                    )
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {displayedData.length <= 0 && (
                <div className="p-2 content-center text-center py-[12px] text-[24px] max-h-full min-h-[200px] text-primary">
                    No data available
                </div>
            )}
            {displayedData.length > 0 && selectedColumns?.length === 0 && (
                <div className="p-2 content-center text-center py-[12px] text-[24px] max-h-full min-h-[200px] text-primary">
                    No Column Selected
                </div>
            )}
        </>}

        </>
    );
}

function FilterTableHeader({
    column,
    dimensions,
    filterConfig,
    children,
}: {
    column: string;
    dimensions: {
        width?: number | string;
        height?: number | string;
        maxWidth?: number | string;
        maxHeight?: number | string;
    };
    filterConfig?: {
        options?: Array<{ value: string; label: string }>;
        onSearch?: (search: string) => Promise<Array<{ value: string; label: string }>> | Array<{ value: string; label: string }>;
        onSelect?: (selected: string | string[]) => void;
        isSingle?: boolean;
        selectedValue?: string;
    };
    children?: React.ReactNode;
}) {
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [searchBarValue, setSearchBarValue] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const parentRef = useRef<HTMLDivElement>(null);
    const { filterState, setFilterState } = useContext(TableDetails);
    const selectedRef = useRef<string | string[] | null>(null);

    useEffect(() => {
        if (filterConfig?.options) {
            setFilteredOptions(filterConfig.options);
            // console.log('FilterTableHeader options:', filterConfig.options);
        } else {
            setFilteredOptions([]);
            // console.log('FilterTableHeader options are empty or undefined');
        }
    }, [filterConfig?.options]);

    // keep selection in sync with global filterState (so selection survives table refresh)
    useEffect(() => {
        try {
            const payload = filterState?.payload || {};
            const val = payload[column];
            if (val == null || (typeof val === 'string' && val === "")) {
                selectedRef.current = null;
                setSelectedValues([]);
            } else if (Array.isArray(val)) {
                selectedRef.current = val;
                setSelectedValues(val);
            } else {
                selectedRef.current = String(val);
                setSelectedValues([String(val)]);
            }
        } catch (err) {
            // ignore
        }
    }, [filterState]);

    useEffect(() => {
        // Local search filtering if no onSearch handler
        if (!filterConfig?.onSearch && filterConfig?.options) {
            if (searchBarValue.trim() === "") {
                setFilteredOptions(filterConfig.options);
            } else {
                const lower = searchBarValue.toLowerCase();
                setFilteredOptions(
                    filterConfig.options.filter(
                        opt => opt.label.toLowerCase().includes(lower)
                    )
                );
            }
        }
    }, [searchBarValue, filterConfig?.options, filterConfig?.onSearch]);

    async function handleSearch() {
        if (filterConfig?.onSearch) {
            const result = await filterConfig.onSearch(searchBarValue);
            setFilteredOptions(result);
        }
        // If no onSearch, local filtering is handled by useEffect above
    }

    function handleSelect(value: string) {
        const isSingle = filterConfig?.isSingle !== undefined ? filterConfig.isSingle : true;
        if (isSingle) {
            // If already selected, deselect (clear filter)
            const selectedValue = filterConfig?.selectedValue;
            if (filterConfig?.onSelect) {
                if (selectedValue === value) {
                    filterConfig.onSelect(""); // Deselect
                    // update global filter state to clear this field
                    try {
                        setFilterState(prev => ({ applied: false, payload: { ...(prev?.payload || {}), [column]: "" } }));
                    } catch (err) {}
                } else {
                    filterConfig.onSelect(value);
                    // persist selection in global filter state so header survives refresh
                    try {
                        setFilterState(prev => ({ applied: true, payload: { ...(prev?.payload || {}), [column]: value } }));
                    } catch (err) {}
                }
            }
            setShowFilterDropdown(false);
        } else {
            setSelectedValues((prev) => {
                let updated: string[];
                if (prev.includes(value)) {
                    updated = prev.filter((v) => v !== value);
                } else {
                    updated = [...prev, value];
                }
                // persist multi-select in global filter state
                try {
                    setFilterState(prevState => ({ applied: updated.length > 0, payload: { ...(prevState?.payload || {}), [column]: updated } }));
                } catch (err) {}
                if (filterConfig?.onSelect) filterConfig.onSelect(updated);
                return updated;
            });
        }
    }

    return (
        <DismissibleDropdown
            isOpen={showFilterDropdown}
            setIsOpen={setShowFilterDropdown}
            button={
                <div ref={parentRef} className="flex item-center">
                    <Icon
                        icon="circum:filter"
                        width={16}
                        className={selectedValues.length > 0 ? "text-red-600" : ""}
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    />
                </div>
            }
            dropdown={
                <FilterDropdown
                    anchorRef={parentRef as React.RefObject<HTMLDivElement>}
                    align="center"
                    dimensions={dimensions}
                    searchBarValue={searchBarValue}
                    setSearchBarValue={setSearchBarValue}
                    onEnterPress={handleSearch}
                >
                    {children ? (
                        <div>{children}</div>
                    ) : filteredOptions.length > 0 ? (
                        (filterConfig && typeof filterConfig.selectedValue === 'string' && filterConfig.onSelect) ? (
                            // prefer persisted selection (selectedRef) when available
                            <FilterOptionList
                                options={filteredOptions}
                                selectedValue={typeof selectedRef.current === 'string' ? (selectedRef.current as string) : (filterConfig.selectedValue as string)}
                                onSelect={(v: string) => {
                                    // call parent's onSelect
                                    try { filterConfig.onSelect && filterConfig.onSelect(v); } catch (err) {}
                                    // persist into global filter state
                                    try { setFilterState(prev => ({ applied: !!v, payload: { ...(prev?.payload || {}), [column]: v } })); } catch (err) {}
                                }}
                            />
                        ) : filterConfig?.isSingle !== false ? (
                            filteredOptions.map((option, idx) => {
                                const currentSingle = typeof selectedRef.current === 'string' ? (selectedRef.current as string) : (filterConfig?.selectedValue ?? null);
                                const isSelected = currentSingle === option.value || selectedValues.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={`font-normal text-[14px] ${isSelected ? 'text-[#EA0A2A] text-[15px] font-semibold' : 'text-[#181D27]'} flex gap-x-[8px] py-[10px] px-[14px] hover:bg-[#FAFAFA] cursor-pointer`}
                                        onClick={() => handleSelect(option.value)}
                                    >
                                        <span className="text-[#535862]">{option.label}</span>
                                    </div>
                                );
                            })
                        ) : (
                            filteredOptions.map((option, idx) => (
                                <div
                                    key={option.value}
                                    className="font-normal text-[14px] text-[#181D27] flex gap-x-[8px] py-[10px] px-[14px] hover:bg-[#FAFAFA] cursor-pointer"
                                >
                                    <CustomCheckbox
                                        id={option.value}
                                        checked={selectedValues.includes(option.value)}
                                        label={option.label}
                                        onChange={() => handleSelect(option.value)}
                                    />
                                </div>
                            ))
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-gray-600 text-sm">
                            {filterConfig?.isSingle === false && filterConfig?.options && filterConfig.options.length > 0
                                ? filteredOptions.length === 0
                                    ? "No matching options"
                                    : null
                                : "No options available"
                            }
                        </div>
                    )}
                </FilterDropdown>
            }
        />
    );
}

function TableFooter() {
    const { config } = useContext(Config);
    const { api, footer, pageSize = defaultPageSize } = config;
    const { tableDetails, nestedLoading, setTableDetails, setNestedLoading, searchState, filterState } = useContext(TableDetails);
    const { selectedRow } = useContext(SelectedRow);
    const { selectedColumns } = useContext<columnFilterConfigType>(ColumnFilterConfig);
    const cPage = tableDetails.currentPage || 0;
    const totalPages = tableDetails.total || 1;

    async function handlePageChange(pageNo: number) {
        if (pageNo < 0 || pageNo > totalPages - 1) return;

        const MIN_LOADING_MS = 1000;
        const start = Date.now();
        try {
            setNestedLoading(true);

            // If a global search is active, prefer search-based paging
            try {
                const globalSearch = searchState;
                if (globalSearch && globalSearch.applied && api?.search) {
                    const term = globalSearch.term ?? "";
                    const res = await api.search(term, pageSize, undefined, pageNo + 1);
                    const resolvedResult = res instanceof Promise ? await res : res;
                    const { data, total, currentPage } = resolvedResult;
                    setTableDetails({
                        ...tableDetails,
                        data,
                        currentPage: currentPage - 1,
                        total,
                        pageSize,
                    });
                    return;
                }
            } catch (err) {
                console.warn('Search-based pagination failed', err);
            }

            // If filters are applied (persisted globally) and filter API exists, call filter API for the page
            try {
                const globalFilter = filterState;
                if (globalFilter && globalFilter.applied && api?.filterBy) {
                    // reuse payload and request the requested page; add page if backend expects it
                    const payload = { ...(globalFilter.payload || {}) } as Record<string, any>;
                    // include page param (1-based) so backend can return correct page
                    payload.page = pageNo + 1;
                    const res = await api.filterBy(payload, pageSize);
                    const resolvedResult = res instanceof Promise ? await res : res;
                    const { data, total, currentPage } = resolvedResult;
                    setTableDetails({
                        ...tableDetails,
                        data,
                        currentPage: currentPage - 1,
                        total,
                        pageSize,
                    });
                    return;
                }
            } catch (err) {
                // if filter-based paging fails, fall back to list or client-side
                console.warn('Filter-based pagination failed', err);
            }

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
        } finally {
            const elapsed = Date.now() - start;
            const wait = Math.max(0, MIN_LOADING_MS - elapsed);
            if (wait > 0) {
                await new Promise((res) => setTimeout(res, wait));
            }
            setNestedLoading(false);
        }
    }

     // Floating Info Bar State
    const [showFloatingBar, setShowFloatingBar] = useState(
        !!config.floatingInfoBar?.showByDefault
    );

    // Show bar if showSelectedRow and rows are selected
    useEffect(() => {
        if (config.floatingInfoBar?.showSelectedRow && selectedRow.length > 0) {
            setShowFloatingBar(true);
        } else if (!config.floatingInfoBar?.showByDefault) {
            setShowFloatingBar(false);
        }
    }, [selectedRow, config.floatingInfoBar]);

    // Move nodeRef outside to prevent recreation and flickering
    const floatingBarNodeRef = useRef(null);

    // Memoize visible buttons to avoid recalculation
    const visibleButtons = useMemo(() => {
        if (!config.floatingInfoBar?.buttons) return [];
        
        return config.floatingInfoBar.buttons.filter(button => {
            // Check showOnSelect condition
            if (button.showOnSelect && selectedRow.length === 0) return false;
            
            // Check showWhen condition
            if (button.showWhen && !button.showWhen(tableDetails?.data || [], selectedRow, selectedColumns)) return false;
            
            return true;
        });
    }, [config.floatingInfoBar?.buttons, selectedRow, tableDetails?.data, selectedColumns]);

    const FloatingInfoBar = useCallback(() => {
        if (!config.floatingInfoBar || !showFloatingBar || nestedLoading) return null;
        
        return (
            <Draggable nodeRef={floatingBarNodeRef}>
                <div 
                    ref={floatingBarNodeRef} 
                    className={`flex justify-between items-center gap-6 w-fit p-4 z-[70] cursor-grab text-white bg-[#00000080] backdrop-blur-xl rounded-[40px] transition-all ease-in-out ${footer ? 'mb-20' : ''}`}
                >
                    <span onClick={() => config?.floatingInfoBar?.rowSelectionOnClick && config.floatingInfoBar.rowSelectionOnClick(tableDetails?.data || [], selectedRow, selectedColumns) }>selected {selectedRow.length}</span>
                    {visibleButtons.length > 0 && (
                        <span className="flex gap-[18px]">
                            {visibleButtons.map((button, index) => (
                                <span 
                                    key={`${button.label}-${index}`}
                                    className={`cursor-pointer bg-[#FDFDFD33] shadow-[0px_1px_2px_0px_#0A0D120D] py-2 px-3 rounded-3xl flex items-center gap-2 ${
                                        button.labelTw || ''
                                    }`}
                                    onClick={() => button.onClick?.(tableDetails?.data || [], selectedRow, selectedColumns)}
                                >
                                    {button.icon && (
                                        <span className="w-5 h-5">
                                            <Icon 
                                                icon={button.icon}
                                                className="transition-all duration-200 ease-in-out"
                                                width={button.iconWidth ? parseInt(button.iconWidth) : 20} 
                                            />
                                        </span>
                                    )}
                                    <span>{button.label}</span>
                                </span>
                            ))}
                        </span>
                    )}
                    <span className="rounded-full py-2 px-3 bg-[#FDFDFD33] bg-opacity-30 flex items-center justify-center cursor-pointer">
                        <span className="w-5 h-5">
                            <Icon icon="mdi:close" className="transition-all duration-200 ease-in-out" width={20} onClick={() => setShowFloatingBar(false)} />
                        </span>
                    </span>
                </div>
            </Draggable>
        );
    }, [config.floatingInfoBar, showFloatingBar, nestedLoading, selectedRow.length, visibleButtons, footer]);

    return (<div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 ml-2 flex justify-center bottom-1">
            <FloatingInfoBar />
        </div>
        {footer && (
            <div className="px-6 py-3 flex justify-between items-center text-[#414651]">
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
                        <div className="gap-0.5 text-[14px] hidden md:flex select-none">
                            {(() => {
                                // Build pagination elements based on totalPages and current page (cPage)
                                if (totalPages <= 6) {
                                    return (
                                        <>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <PaginationBtn
                                                    key={index}
                                                    label={(index + 1).toString()}
                                                    isActive={index === cPage}
                                                    onClick={() => handlePageChange(index)}
                                                />
                                            ))}
                                        </>
                                    );
                                }

                                // totalPages > 6: show smart pagination
                                const elems: (number | string)[] = [];

                                // If near the start, show first up to five pages then ellipsis + last
                                if (cPage <= 2) {
                                    const end = Math.min(totalPages - 1, 4); // pages 0..4 (1..5)
                                    for (let i = 0; i <= end; i++) elems.push(i);
                                    if (end < totalPages - 1) elems.push("...", totalPages - 1);
                                }
                                // If near the end, show first, ellipsis, then last up to five pages
                                else if (cPage >= totalPages - 3) {
                                    const start = Math.max(0, totalPages - 5); // show last 5 pages
                                    elems.push(0);
                                    if (start > 1) elems.push("...");
                                    for (let i = start; i <= totalPages - 1; i++) elems.push(i);
                                }
                                // Middle: show first page, ellipsis, two before/after current, ellipsis, last page
                                else {
                                    elems.push(0, "...");
                                    const start = Math.max(0, cPage - 2);
                                    const end = Math.min(totalPages - 1, cPage + 2);
                                    for (let i = start; i <= end; i++) elems.push(i);
                                    elems.push("...", totalPages - 1);
                                }

                                return (
                                    <>
                                        {elems.map((p, idx) =>
                                            typeof p === "string" ? (
                                                <PaginationBtn key={`e-${idx}`} label={p} isActive={false} />
                                            ) : (
                                                <PaginationBtn
                                                    key={p}
                                                    label={(p + 1).toString()}
                                                    isActive={p === cPage}
                                                    onClick={() => handlePageChange(p)}
                                                />
                                            )
                                        )}
                                    </>
                                );
                            })()}
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
        )}
    </div>
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
            className={`min-w-[40px] h-[40px] rounded-[8px] p-[12px] flex items-center justify-center cursor-pointer ${isActive
                ? "bg-[#FFF0F2] text-[#EA0A2A]"
                : "bg-tranparent text-[#717680]"
                }`}
            onClick={onClick}
        >
            {label}
        </div>
    );
}

export function FilterOptionList({
    options,
    selectedValue,
    onSelect
}: {
    options: Array<{ value: string; label: string }>;
    selectedValue: string;
    onSelect: (value: string) => void;
}) {
    return (
        <div className={selectedValue ? "pt-[35px]" : ""}>
        
            {options.map(opt => (
                <div
                    key={opt.value}
                    className={`w-full font-normal text-[14px] text-[#181D27] flex gap-x-[8px] py-[10px] px-[14px] hover:bg-[#FAFAFA] cursor-pointer ${selectedValue === opt.value ? 'absolute top-[55px] bg-gray-100 font-semibold mb-[20px]' : ''}`}
                    onClick={() => {
                        onSelect(selectedValue === opt.value ? "" : opt.value);
                    }}
                >
                    <span className="truncate">
                    {opt.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function FilterBy() {
    const { config } = useContext(Config);
    const { tableDetails, setTableDetails, setNestedLoading, setFilterState, initialTableData } = useContext(TableDetails);
    const [showDropdown, setShowDropdown] = useState(false);
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const [searchBarValue, setSearchBarValue] = useState("");
    // filters can be single string values or arrays for multi-select fields
    const [filters, setFilters] = useState<Record<string, string | string[]>>({});
    const [appliedFilters, setAppliedFilters] = useState(false);

    // initialize filters when fields change
    useEffect(() => {
        const initial: Record<string, string | string[]> = {};
        (config.header?.filterByFields || []).forEach((f: FilterField) => {
            initial[f.key] = f.isSingle === false ? [] : "";
        });
        setFilters(initial);
    }, [config.header?.filterByFields]);

    const activeFilterCount = Object.keys(filters || {}).reduce((acc, k) => {
        const v = filters[k];
        const hasValue = Array.isArray(v) ? v.length > 0 : String(v ?? '').trim().length > 0;
        if (!hasValue) return acc;
        // respect applyWhen predicate if provided on the field
        const field = (config.header?.filterByFields || []).find((f: FilterField) => f.key === k);
        try {
            if (field?.applyWhen && !field.applyWhen(filters)) return acc;
        } catch (err) {
            // if predicate throws, treat as not applicable
            return acc;
        }
        return acc + 1;
    }, 0);
    const applyFilter = async () => {
        if (activeFilterCount === 0) return;
        setShowDropdown(false);
        // call API if provided
        if (config.api?.filterBy) {
            try {
                setNestedLoading(true);
                // convert array filter values into comma-separated strings for API
                // Use `applyWhen` predicate (if provided on a FilterField) to
                // decide whether to include a key in the payload. This makes the
                // filter behavior reusable: e.g. date start/end can both be
                // required before applying either.
                const payloadForApi: Record<string, string | number | null> = {};
                const fields = config.header?.filterByFields || [];
                Object.keys(filters || {}).forEach((k) => {
                    const field = fields.find(f => f.key === k);
                    try {
                        if (field?.applyWhen && !field.applyWhen(filters)) {
                            // skip this key as its predicate decided it shouldn't apply
                            return;
                        }
                    } catch (err) {
                        // if predicate throws, default to skipping to be safe
                        return;
                    }

                    const v = filters[k];
                    if (Array.isArray(v)) {
                        payloadForApi[k] = v.length > 0 ? v.join(',') : "";
                    } else {
                        payloadForApi[k] = v as string;
                    }
                });

                // persist applied filter payload via context so pagination can reuse it
                try {
                    setFilterState({ applied: true, payload: payloadForApi });
                } catch (err) {
                    // ignore environments without window
                }

                const res = await config.api.filterBy(payloadForApi, config.pageSize || defaultPageSize);
                const { currentPage, totalRecords, pageSize, total, data } = res instanceof Promise ? await res : res;
                // prefer totalRecords when provided by API
                const totalRecordsValue = totalRecords ?? total ?? 0;
                const pageSizeValue = pageSize || config.pageSize || defaultPageSize;
                const totalPages = pageSizeValue > 0 ? Math.max(1, Math.ceil(totalRecordsValue / pageSizeValue)) : (total ?? 1);
                setTableDetails({
                    data: data || [],
                    total: totalPages,
                    totalRecords: totalRecords,
                    currentPage: currentPage - 1 || 0,
                    pageSize: pageSize,
                });
                setAppliedFilters(true);
            } catch (err) {
                console.error("Filter API error", err);
            } finally {
                setNestedLoading(false);
            }
        } else {
            // fallback to client-side filtering
            const all = tableDetails.data || [];
            const fields = config.header?.filterByFields || [];
            const filtered = all.filter((row) => {
                return Object.keys(filters).every((k) => {
                    const field = fields.find(f => f.key === k);
                    try {
                        if (field?.applyWhen && !field.applyWhen(filters)) {
                            // skip this filter if its predicate says not to apply
                            return true;
                        }
                    } catch (err) {
                        // if predicate throws, skip this filter to be safe
                        return true;
                    }

                    const val = filters[k];
                    if (val === "" || val == null) return true;
                    const cell = String((row as TableDataType)[k] ?? "").toLowerCase();
                    if (Array.isArray(val)) {
                        // match any of the selected values
                        return val.some(v => cell.includes(String(v).toLowerCase()));
                    }
                    return cell.includes(String(val).toLowerCase());
                });
            });
            setTableDetails({
                data: filtered,
                total: Math.max(1, Math.ceil(filtered.length / (config.pageSize || defaultPageSize))),
                currentPage: 0,
                pageSize: config.pageSize || defaultPageSize,
            });
            setAppliedFilters(true);
        }

        setShowDropdown(false);
    };

    const clearAll = async () => {
        if (activeFilterCount === 0) return;

        // build cleared state matching initialization (arrays for multi-selects)
        const cleared: Record<string, string | string[]> = {};
        (config.header?.filterByFields || []).forEach((f: FilterField) => {
            cleared[f.key] = f.isSingle === false ? [] : "";
        });
        setFilters(cleared);
        setAppliedFilters(false);

        // clear global applied filter flag via context so pagination uses list API
        try { setFilterState({ applied: false, payload: {} }); } catch (err) { }

        // If list API exists, reload the default (unfiltered) first page using it.
        if (config.api?.list) {
            const pageSize = config.pageSize || defaultPageSize;
            try {
                setNestedLoading(true);
                const result = await config.api.list(1, pageSize);
                const resolved = result instanceof Promise ? await result : result;
                const { data, total, currentPage, pageSize: resPageSize, totalRecords } = resolved as any;
                setTableDetails({
                    data: data || [],
                    total: total || 1,
                    totalRecords: totalRecords,
                    currentPage: (currentPage ? currentPage - 1 : 0),
                    pageSize: resPageSize || pageSize,
                });
            } catch (err) {
                console.error("List API error while clearing filters", err);
            } finally {
                setNestedLoading(false);
            }
        } else if (initialTableData) {
            // Fallback: restore initial snapshot if available (client-side mode)
            try {
                setTableDetails(initialTableData as any);
            } catch (err) {
                // ignore
            }
        }
    };

    // Reset only local filter UI state (used when external actions like pagination change)
    const resetLocalFilters = () => {
        const cleared: Record<string, string | string[]> = {};
        (config.header?.filterByFields || []).forEach((f: FilterField) => {
            cleared[f.key] = f.isSingle === false ? [] : "";
        });
        setFilters(cleared);
        setAppliedFilters(false);
    };

    // listen for global clear filter signal (e.g., page change) and reset local filters
    useEffect(() => {
        const handler = () => {
            try {
                resetLocalFilters();
                setShowDropdown(false);
            } catch (err) {
                // swallow errors from handler
                console.warn('Failed to reset filter UI state', err);
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('customTable:clearFilters', handler as EventListener);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('customTable:clearFilters', handler as EventListener);
            }
        };
    }, [config.header?.filterByFields]);

    return (
        <div className="relative">
            <DismissibleDropdown
                isOpen={showDropdown}
                setIsOpen={setShowDropdown}
                button={
                    <div ref={buttonRef}>
                        <div className="inline-flex items-center gap-2">
                            <BorderIconButton icon="lucide:filter" label={
                                <div className="flex gap-[5px] items-center">
                                    <span>Filter</span>
                                    <span>
                                        {activeFilterCount > 0 && (
                                            <span className="inline-flex text-sm items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-gray-800 rounded-full">{activeFilterCount}</span>
                                        )}
                                    </span>

                                </div>
                            } className="h-[34px]" />

                        </div>
                    </div>
                }
                dropdown={
                    <FilterDropdown
                        anchorRef={buttonRef}
                        showInternalSearch={false}
                        searchBarValue={searchBarValue}
                        setSearchBarValue={setSearchBarValue}
                        onEnterPress={applyFilter}
                        dimensions={{ width: 700 }}
                    >
                        <div className="p-4 grid grid-cols-2 gap-4">
                            {(config.header?.filterByFields || []).map((f: FilterField) => (
                                <div key={f.key} className="flex flex-col gap-2">
                                    {/* Use the project's InputFields component for consistent UI */}
                                    <InputFields
                                        label={f.label || f.key}
                                        name={f.key}
                                        // pass array for multi-select fields, string for single
                                        value={filters[f.key] ?? (f.isSingle === false ? [] : "")}
                                        onChange={(e) => {
                                            const ev = e as any;
                                            const raw = ev && ev.target ? ev.target.value : e;
                                            if (f.isSingle === false) {
                                                // ensure we store an array for multi-select
                                                if (Array.isArray(raw)) {
                                                    setFilters(prev => ({ ...prev, [f.key]: raw }));
                                                } else if (typeof raw === 'string' && raw.length === 0) {
                                                    setFilters(prev => ({ ...prev, [f.key]: [] }));
                                                } else {
                                                    // try to coerce comma-separated string into array
                                                    const arr = typeof raw === 'string' ? raw.split(',').filter(Boolean) : [];
                                                    setFilters(prev => ({ ...prev, [f.key]: arr }));
                                                }
                                            } else {
                                                setFilters(prev => ({ ...prev, [f.key]: String(raw) }));
                                            }
                                        }}
                                        placeholder={f.placeholder}
                                        // map type (support dateChange)
                                        type={f.type === 'dateChange' ? 'dateChange' : f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : f.type === 'select' ? 'select' : 'text'}
                                        options={f.options}
                                        width="w-full"
                                        isSingle={typeof f.isSingle === 'boolean' ? f.isSingle : true}
                                        multiSelectChips={!!f.multiSelectChips}
                                        filters={filters}
                                        {...(f.inputProps || {})}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="p-4 flex items-center justify-end gap-4">
                            <SidebarBtn
                                isActive={false}
                                type="button"
                                onClick={() => appliedFilters === false ? resetLocalFilters() : clearAll()}
                                label="Clear All"
                                buttonTw="px-3 py-2 h-9"
                                disabled={activeFilterCount === 0}
                                className="text-sm"
                            />
                            <SidebarBtn
                                isActive={true}
                                type="button"
                                onClick={() => applyFilter()}
                                label="Apply Filter"
                                buttonTw={`px-4 py-2 h-9`}
                                disabled={activeFilterCount === 0}
                                className="text-sm"
                            />
                        </div>
                    </FilterDropdown>
                }
            />
            {/* results summary below the filter button (show only when filters active) */}
            {appliedFilters && activeFilterCount > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{(tableDetails?.totalRecords ?? tableDetails?.data?.length ?? 0)} Results Found</span>
                    <button
                        type="button"
                        onClick={async () => {
                            await clearAll(); setShowDropdown(false);
                            if (config.api?.list) {
                                try {
                                    setNestedLoading(true);
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
                                } finally {
                                    setNestedLoading(false);
                                }
                            }
                        }}
                        className="ml-2 underline text-gray-600 cursor-pointer"
                    >
                        Clear Filter
                    </button>
                </div>
            )}
        </div>
    );
}