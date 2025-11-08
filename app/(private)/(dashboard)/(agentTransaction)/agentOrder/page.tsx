"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { agentOrderList } from "@/app/services/agentTransaction";
import { agentCustomerStatusUpdate } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";

const columns = [
    { key: "order_code", label: "Order Code", render: (row: TableDataType) => <span className="font-bold cursor-pointer">{row.order_code}</span> },
    { key: "warehouse_name", label: "Warehouse Name", render: (row: TableDataType) => row.warehouse_name || "-" },
    { key: "customer_name", label: "Customer Name", render: (row: TableDataType) => row.customer_name || "-" },
    { key: "delivery_date", label: "Delivery Date", render: (row: TableDataType) => row.delivery_date || "-" },
    { key: "comment", label: "Comment", render: (row: TableDataType) => row.comment || "-" },
    { key: "status", label: "Status", render: (row: TableDataType) => (
        <StatusBtn isActive={row.status === "1"} />
    )},
];

export default function CustomerInvoicePage() {
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    const [refreshKey, setRefreshKey] = useState(0);

    const fetchOrders = useCallback(
        async (
            page: number = 1,
            pageSize: number = 5
        ): Promise<listReturnType> => {
            setLoading(true);
            const params: Record<string, string> = {
                page: page.toString(),
                pageSize: pageSize.toString()
            };
            const listRes = await agentOrderList(params);
            setLoading(false);
            return {
                data: Array.isArray(listRes.data) ? listRes.data : [],
                total: listRes?.pagination?.totalPages || 1,
                currentPage: listRes?.pagination?.page || 1,
                pageSize: listRes?.pagination?.limit || pageSize,
            };
        }, [setLoading, showSnackbar]);

    // const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
    //     try {
    //         setLoading(true);
    //         return {
    //             data: [],
    //             currentPage: 1,
    //             pageSize: 10,
    //             total: 0,
    //         };
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [setLoading]);

    const handleStatusChange = async (order_ids: (string | number)[] | undefined, status: number) => {
        if (!order_ids || order_ids.length === 0) return;
        const res = await agentCustomerStatusUpdate({
            order_ids,
            status: Number(status)
        });

        if (res.error) {
            showSnackbar(res.data.message || "Failed to update status", "error");
            throw new Error(res.data.message);
        }
        setRefreshKey(refreshKey + 1);
        showSnackbar("Status updated successfully", "success");
        return res;
    }


    return (
        <>
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchOrders },
                        header: {
                            title: "Customer Orders",
                            threeDot: [
                                {
                                    icon: "lucide:radio",
                                    label: "Inactive",
                                    showOnSelect: true,
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if(!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("1") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if(!status.includes(currentStatus)){
                                                status.push(currentStatus);
                                            }
                                            return data[id].id;
                                        })
                                        handleStatusChange(ids, Number(0));
                                    },
                                },
                                {
                                    icon: "lucide:radio",
                                    label: "Active",
                                    showOnSelect: true,
                                    showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                                        if(!selectedRow || selectedRow.length === 0) return false;
                                        const status = selectedRow?.map((id) => data[id].status).map(String);
                                        return status?.includes("0") || false;
                                    },
                                    onClick: (data: TableDataType[], selectedRow?: number[]) => {
                                        const status: string[] = [];
                                        const ids = selectedRow?.map((id) => {
                                            const currentStatus = data[id].status;
                                            if(!status.includes(currentStatus)){
                                                status.push(currentStatus);
                                            }
                                            return data[id].id;
                                        })
                                        handleStatusChange(ids, Number(1));
                                    },
                                },
                            ],
                            searchBar: false,
                            actions: [
                                // <SidebarBtn
                                //     key={0}
                                //     href="#"
                                //     isActive
                                //     leadingIcon="mdi:download"
                                //     label="Download"
                                //     labelTw="hidden lg:block"
                                // />,
                                <SidebarBtn
                                    key={1}
                                    href="/agentOrder/add"
                                    isActive
                                    leadingIcon="mdi:plus"
                                    label="Add"
                                    labelTw="hidden lg:block"
                                />
                            ],
                        },
                        rowSelection: true,
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (row: TableDataType) =>
                                    router.push(
                                        `/agentOrder/details/${row.uuid}`
                                    ),
                            }
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}
