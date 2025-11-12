"use client";

import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import ContainerCard from "@/app/components/containerCard";
import Table, { configType, listReturnType, searchReturnType, TableDataType } from "@/app/components/customTable";
import StatusBtn from "@/app/components/statusBtn2";
import TabBtn from "@/app/components/tabBtn";
import { agentCustomerReturnExport, exportInvoice, getAgentCustomerByReturnId, getAgentCustomerBySalesId, invoiceList } from "@/app/services/agentTransaction";
import { agentCustomerById, downloadFile } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Additional from "./additional";
import Financial from "./financial";
import Location from "./location";
import Overview from "./overview";

export interface AgentCustomerDetails {
    id: string;
    uuid: string;
    osa_code: string;
    name: string;
    contact_no: string;
    contact_no2: string;
    whatsapp_no: string;
    is_whatsapp: string;
    vat_no: string;
    get_warehouse: { warehouse_code: string; warehouse_name: string };
    district: string;
    street: string;
    landmark: string;
    town: string;
    owner_name: string;
    latitude: string;
    longitude: string;
    creditday: string;
    payment_type: string;
    buyertype: string;
    credit_limit: string;
    outlet_channel: {
        outlet_channel: string;
        outlet_channel_code: string;
    };
    region: { region_code: string; region_name: string };
    customertype: { name: string; code: string };
    route: { route_name: string; route_code: string };
    category: {
        customer_category_name: string;
        customer_category_code: string;
    };
    subcategory: {
        customer_sub_category_name: string;
        customer_sub_category_code: string;
    };
    status: number | string;
}

const tabs = ["Overview", "Sales", "Return"];

export default function CustomerDetails() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Overview");

    const onTabClick = (name: string) => {
        setActiveTab(name);
    };

    const params = useParams();
    let uuid: string = "";
    if (params.uuid) {
        if (Array.isArray(params.uuid)) {
            uuid = params.uuid[0] || "";
        } else {
            uuid = params.uuid as string;
        }
    }
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [item, setItem] = useState<AgentCustomerDetails | null>(null);

    useEffect(() => {
        if (!uuid) return;

        let mounted = true;
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            try {
                const res = await agentCustomerById(uuid);
                if (!mounted) return;
                if (res?.error) {
                    showSnackbar(
                        res?.data?.message ||
                        "Unable to fetch Agent Customer Details",
                        "error"
                    );
                    return;
                }
                setItem(res.data);
            } catch (err) {
                if (mounted) {
                    showSnackbar(
                        "Unable to fetch Agent Customer Details",
                        "error"
                    );
                    console.error(err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchPlanogramImageDetails();
        return () => {
            mounted = false;
        };
    }, []);

    const columns: configType["columns"] = [
        { key: "invoice_date", label: "Data", render: (row: TableDataType) => row.invoice_date.split("T")[0] },
        { key: "invoice_time", label: "Time" },
        {
            key: "invoice_code",
            label: "Invoice Number"
        },
        {
            key: "salesman_name",
            label: "Salesman"
        },
        {
            key: "warehouse_name",
            label: "Warehouse"
        },
        {
            key: "route_name",
            label: "Route"
        },
        { key: "total_amount", label: "Invoice Total", render: (row: TableDataType) => toInternationalNumber(row.total_amount) },


    ];

    const returnColumns: configType["columns"] = [
        { key: "osa_code", label: "Code", showByDefault: true },
        { key: "order_code", label: "Order Code", showByDefault: true },
        { key: "delivery_code", label: "Delivery Code", showByDefault: true },
        {
            key: "warehouse_code", label: "Warehouse", showByDefault: true, render: (row: TableDataType) => {
                const code = row.warehouse_code || "";
                const name = row.warehouse_name || "";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "route_code", label: "Route", showByDefault: true, render: (row: TableDataType) => {
                const code = row.route_code || "";
                const name = row.route_name || "";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "customer_code", label: "Customer", showByDefault: true, render: (row: TableDataType) => {
                const code = row.customer_code || "";
                const name = row.customer_name || "";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        {
            key: "salesman_code", label: "Salesman", showByDefault: true, render: (row: TableDataType) => {
                const code = row.salesman_code || "";
                const name = row.salesman_name || "";
                return `${code}${code && name ? " - " : ""}${name}`;
            }
        },
        { key: "total", label: "Amount", showByDefault: true },


    ];

    const returnByAgentCustomer = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50
        ): Promise<searchReturnType> => {
            const result = await getAgentCustomerByReturnId(uuid);
            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.page || 1,
                pageSize: result?.pagination?.limit || pageSize,
                total: result?.pagination?.totalPages || 1,
            };
        },
        []
    );

    const filterBy = useCallback(
                async (
                    payload: Record<string, string | number | null>,
                    pageSize: number
                ): Promise<listReturnType> => {
                    let result;
                    setLoading(true);
                    try {
                        const params: Record<string, string> = { };
                        Object.keys(payload || {}).forEach((k) => {
                            const v = payload[k as keyof typeof payload];
                            if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                                params[k] = String(v);
                            }
                        });
                        result = await invoiceList(params);
                    } finally {
                        setLoading(false);
                    }
        
                    if (result?.error) throw new Error(result.data?.message || "Filter failed");
                    else {
                        const pagination = result.pagination?.pagination || result.pagination || {};
                        return {
                            data: result.data || [],
                            total: pagination.totalPages || result.pagination?.totalPages || 0,
                            totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
                            currentPage: pagination.current_page || result.pagination?.currentPage || 0,
                            pageSize: pagination.limit || pageSize,
                        };
                    }
                },
                [setLoading]
            );

            const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
        try {
            setLoading(true);
            return {
                data: [],
                currentPage: 1,
                pageSize: 10,
                total: 0,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    const salesByAgentCustomer = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50
        ): Promise<searchReturnType> => {
            const result = await getAgentCustomerBySalesId(uuid);
            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.page || 1,
                pageSize: result?.pagination?.limit || pageSize,
                total: result?.pagination?.totalPages || 1,
            };
        },
        []
    );

    const exportReturnFile = async (uuid: string, format: string) => {
        try {
            console.log(uuid, "uuid")
            const response = await agentCustomerReturnExport({ uuid, format }); // send proper body object

            if (response && typeof response === "object" && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            console.error(error);
            showSnackbar("Failed to download data", "error");
        }
    };

    const exportFile = async (uuid: string, format: string) => {
        try {
            const response = await exportInvoice({ uuid, format }); // send proper body object

            if (response && typeof response === "object" && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            console.error(error);
            showSnackbar("Failed to download data", "error");
        }
    };

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Icon
                        icon="lucide:arrow-left"
                        width={24}
                        onClick={() => router.back()}
                    />
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
                        Agent Customer Details
                    </h1>
                </div>
            </div>

            <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                {/* profile details */}
                <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                    <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                        <Icon
                            icon="gridicons:user"
                            width={40}
                            className="text-[#535862] scale-[1.5]"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                            {item?.osa_code || ""} - {item?.name || "Customer Name"}
                        </h2>
                        <span className="flex items-center text-[#414651] text-[16px]">
                            <Icon
                                icon="mdi:location"
                                width={16}
                                className="text-[#EA0A2A] mr-[5px]"
                            />
                            <span>
                                {item?.district}
                            </span>
                            {/* <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                    <StatusBtn status="active" />
                                </span> */}
                        </span>
                    </div>
                </div>
                {/* action buttons */}
                <div className="flex items-center gap-[10px]">
                    <StatusBtn
                        isActive={item?.status ? true : false}
                    />
                </div>
            </ContainerCard>

            {/* tabs */}
            <ContainerCard
                className="w-full flex gap-[4px] overflow-x-auto"
                padding="5px"
            >
                {tabs.map((tab, index) => (
                    <div key={index}>
                        <TabBtn
                            label={tab}
                            isActive={activeTab === tab}
                            onClick={() => {
                                onTabClick(tab);
                            }}
                        />
                    </div>
                ))}
            </ContainerCard>
            {activeTab === "Overview" ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px]">
                    <Overview data={item} />
                    <Financial data={item} />
                    <Additional data={item} />
                    <Location data={item} />
                </div>
            ) : activeTab === "Location" ? (
                <Location data={item} />
            ) : activeTab === "Financial" ? (
                <Financial data={item} />
            ) : activeTab === "Additional" ? (
                <Additional data={item} />
            ) : activeTab === "Sales" ? (
                <ContainerCard >

                    <div className="flex flex-col h-full">
                        <Table
                            config={{
                                api: {
                                    // search: searchCustomerById,
                                    list: salesByAgentCustomer, search: searchInvoices,filterBy: filterBy,
                                },
                                header: {
                                    filterByFields: [
                                        {
                                            key: "date_change",
                                            label: "Date Range",
                                            type: "dateChange"
                                        },

                                    ],
                                    searchBar: true,
                                },
                                showNestedLoading: true,
                                footer: { nextPrevBtn: true, pagination: true },
                                columns: columns,
                                table: {
                                    height: 500,
                                },
                                rowSelection: false,
                                rowActions: [
                                    {
                                        icon: "material-symbols:download",
                                        onClick: (data: TableDataType) => {
                                            exportFile(data.uuid, "csv"); // or "excel", "csv" etc.
                                        },
                                    }
                                ],
                                pageSize: 50,
                            }}
                        />
                    </div>

                </ContainerCard>

            ) : activeTab === "Return" ? (<ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            api: {
                                // search: searchCustomerById,
                                list: returnByAgentCustomer
                            },
                            header: {
                                filterByFields: [
                                        {
                                            key: "date_change",
                                            label: "Date Range",
                                            type: "dateChange"
                                        },

                                    ],
                                    searchBar: true,
                            },
                            showNestedLoading: true,
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: returnColumns,
                            table: {
                                height: 500,
                            },
                            rowSelection: false,
                            rowActions: [
                                {
                                    icon: "material-symbols:download",
                                    onClick: (data: TableDataType) => {
                                        exportReturnFile(uuid, "excel"); // or "excel", "csv" etc.
                                    },
                                }
                            ],
                            pageSize: 50,
                        }}
                    />
                </div>

            </ContainerCard>) : ""}
        </>
    );
}
