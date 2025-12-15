"use client";

import Table, {
    listReturnType,
    searchReturnType,
    TableDataType,
} from "@/app/components/customTable";
import InputFields from "@/app/components/inputFields";
import { exchangeList, exportExchangeData } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { downloadFile } from "@/app/services/allApi";

// 🔹 Table Columns
const columns = [
    {
        key: "exchange_code",
        label: "Code",
        showByDefault: true,
    },
    {
        key: "warehouse_code, warehouse_name",
        label: "Distributors",
        showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.warehouse_code || "";
            const name = row.warehouse_name || "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
    {
        key: "customer_code, customer_name",
        label: "Customer",
        showByDefault: true,
        render: (row: TableDataType) => {
            const code = row.customer_code || "";
            const name = row.customer_name || "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
    },
];

export default function StockTransfer() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();

    // 🔹 Depot states
    const [warehouse1, setWarehouse1] = useState("");
    const [warehouse2, setWarehouse2] = useState("");

    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });

    const [refreshKey, setRefreshKey] = useState(0);

    // 🔹 Fetch data
    const fetchInvoices = useCallback(
        async (page: number = 1, pageSize: number = 50): Promise<listReturnType> => {
            try {
                setLoading(true);
                const result = await exchangeList({
                    page: page.toString(),
                    per_page: pageSize.toString(),
                });

                return {
                    data: Array.isArray(result.data) ? result.data : [],
                    total: result?.pagination?.totalPages || 1,
                    currentPage: result?.pagination?.page || 1,
                    pageSize: result?.pagination?.limit || pageSize,
                };
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch data", "error");
                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize,
                };
            } finally {
                setLoading(false);
            }
        },
        [setLoading, showSnackbar]
    );

    // 🔹 Search placeholder
    const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
        return {
            data: [],
            currentPage: 1,
            pageSize: 50,
            total: 0,
        };
    }, []);

    // 🔹 Export
    const exportFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportExchangeData({ format });
            const url = response?.download_url || response?.url || response?.data?.url;

            if (url) {
                await downloadFile(url);
                showSnackbar("File downloaded successfully", "success");
            } else {
                showSnackbar("Failed to get download file", "error");
            }
        } catch (error) {
            console.error(error);
            showSnackbar("Export failed", "error");
        } finally {
            setThreeDotLoading({ csv: false, xlsx: false });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchInvoices, search: searchInvoices },
                    header: {
                        title: "Stock Transfer",
                        columnFilter: true,
                        searchBar: false,
                        threeDot: [
                            {
                                icon: threeDotLoading.csv
                                    ? "eos-icons:three-dots-loading"
                                    : "gala:file-document",
                                label: "Export CSV",
                                onClick: () =>
                                    !threeDotLoading.csv && exportFile("csv"),
                            },
                            {
                                icon: threeDotLoading.xlsx
                                    ? "eos-icons:three-dots-loading"
                                    : "gala:file-document",
                                label: "Export Excel",
                                onClick: () =>
                                    !threeDotLoading.xlsx && exportFile("xlsx"),
                            },
                        ],

                        // ✅ DEPOT INPUTS IN HEADER (REPLACING ADD BUTTON)
                        actions: [
                            <div
                                key="depot-inputs"
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[800px]"
                            >
                                <InputFields
                                    name="warehouse1"
                                    label="Select Warehp"
                                    placeholder="Select Depot"
                                    value={warehouse1}
                                    onChange={(e) => setWarehouse1(e.target.value)}
                                />
                                <InputFields
                                    name="warehouse2"
                                    label="Select Sub Depot"
                                    placeholder="Select Sub Depot"
                                    value={warehouse2}
                                    onChange={(e) => setWarehouse2(e.target.value)}
                                />
                            </div>,
                        ],
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) =>
                                router.push(
                                    `/distributorsExchange/details/${row.uuid}`
                                ),
                        },
                        {
                            icon: "lucide:download",
                            onClick: () => exportFile(),
                        },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
