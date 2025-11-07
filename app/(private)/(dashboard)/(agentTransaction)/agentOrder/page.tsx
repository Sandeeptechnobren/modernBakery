// "use client";

// import { useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import SidebarBtn from "@/app/components/dashboardSidebarBtn";
// import ContainerCard from "@/app/components/containerCard";
// import InputFields from "@/app/components/inputFields";
// import Table, {
//   listReturnType,
//   TableDataType,
//   searchReturnType,
// } from "@/app/components/customTable";
// import { useSnackbar } from "@/app/services/snackbarContext";
// import { useLoading } from "@/app/services/loadingContext";

// export default function CustomerOrderPage() {
//   const { showSnackbar } = useSnackbar();
//   const { setLoading } = useLoading();
//   const router = useRouter();

//   // 🔹 Filters
//   const [filters, setFilters] = useState({
//     fromDate: new Date().toISOString().split("T")[0],
//     toDate: new Date().toISOString().split("T")[0],
//   });

//   const [refreshKey, setRefreshKey] = useState(0);

//   // 🔹 Handle Input Change
//   const handleChange = (name: string, value: string) => {
//     setFilters({ ...filters, [name]: value });
//   };

//   // 🔹 Fetch Orders
//   const fetchOrders = useCallback(async (): Promise<listReturnType> => {
//     try {
//       setLoading(true);

//       const result = {
//         error: false,
//         data: [
//           {
//             id: 1,
//             date: "2025-10-08",
//             time: "11:30 AM",
//             route_code: "R001",
//             depot_name: "West Depot",
//             customer_name: "ABC Traders",
//             salesman: "John Doe",
//             order_type: "Online",
//             order_no: "ORD-2025-01",
//             sap_id: "SAP12345",
//             sap_status: "Pending",
//             order_amount: "₹12,500",
//             order_status: "In Progress",
//           },
//         ],
//         pagination: { current_page: 1, per_page: 10, last_page: 1 },
//       };

//       if (result.error) {
//         showSnackbar("Error fetching orders", "error");
//         throw new Error("Failed to fetch orders");
//       }

//       return {
//         data:[],
//         currentPage: result.pagination.current_page,
//         pageSize: result.pagination.per_page,
//         total: result.pagination.last_page,
//       };
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, setLoading, showSnackbar]);

//   // 🔹 Search Orders
//   const searchOrders = useCallback(async (): Promise<searchReturnType> => {
//     try {
//       setLoading(true);
//       return {
//         data: [],
//         currentPage: 1,
//         pageSize: 10,
//         total: 0,
//       };
//     } finally {
//       setLoading(false);
//     }
//   }, [setLoading]);

//   // 🔹 Table Columns
//   const columns = [
//     { key: "date", label: "Date" },
//     { key: "time", label: "Time" },
//     { key: "route_code", label: "Route Code" },
//     { key: "depot_name", label: "Depot Name" },
//     { key: "customer_name", label: "Customer Name" },
//     { key: "salesman", label: "Salesman" },
//     { key: "order_type", label: "Order Type" },
//     { key: "order_no", label: "Order No" },
//     { key: "sap_id", label: "SAP ID" },
//     { key: "sap_status", label: "SAP Status" },
//     { key: "order_amount", label: "Order Amount" },
//     { key: "order_status", label: "Order Status" },
//   ];

//   return (
//     <div className="p-[20px] flex flex-col gap-5">
//       {/* 🔹 Header Section */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-[22px] font-semibold">Agent Customer Order</h1>
//         <div className="flex justify-end gap-3">
//             <SidebarBtn
//               href="#"
//               isActive
//               leadingIcon=""
//               label="Download"
//               labelTw="hidden sm:block"
//             />

//         <SidebarBtn
//           key={0}
//           href="/agentTransaction/agentOrder/add"
//           isActive
//           leadingIcon="mdi:plus"
//           label="Add"
//           labelTw="hidden sm:block"
//         />
//         </div>
//       </div>

//       {/* 🔹 Filters Section */}
//       <ContainerCard className="flex flex-col gap-5">
//         <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           {/* Dates */}
//           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//             <InputFields
//               label="From Date"
//               type="date"
//               name="fromDate"
//               value={filters.fromDate}
//               onChange={(e) => handleChange(e.target.name, e.target.value)}
//             />
//             <InputFields
//               label="To Date"
//               type="date"
//               name="toDate"
//               value={filters.toDate}
//               onChange={(e) => handleChange(e.target.name, e.target.value)}
//             />
//             <SidebarBtn
//               href="#"
//               isActive
//               leadingIcon=""
//               label="Filter"
//               labelTw="hidden sm:block"
//             />
//           </div>

//           {/* Filter Button */}
//           <div className="flex justify-center md:justify-start">

//           </div>

//           {/* Download Button */}

//         </div>

//         <Table
//           refreshKey={refreshKey}
//           config={{
//             api: { list: fetchOrders, search: searchOrders },
//             header: {

//               searchBar: true,
//               columnFilter: true,
//             },
//             footer: { nextPrevBtn: true, pagination: true },
//             columns,
//             rowActions: [
//               {
//                 icon: "lucide:eye",
//                 onClick: (row: TableDataType) =>
//                   router.push(
//                     `/agentTransaction/agentOrder/details/${row.id}`
//                   ),
//               },
//             ],
//             pageSize: 10,
//           }}
//         />
//       </ContainerCard>
//     </div>
//   );
// }


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
import { agentOrderList, deleteAgentOrder } from "@/app/services/agentTransaction";
import { agentCustomerStatusUpdate } from "@/app/services/allApi";

const columns = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "route_code", label: "Route Code" },
    { key: "depot_name", label: "Depot Name" },
    { key: "customer_name", label: "Customer Name" },
    { key: "salesman", label: "Salesman" },
    { key: "Invoice_type", label: "Invoice Type" },
    { key: "Invoice_no", label: "Invoice No" },
    { key: "sap_id", label: "SAP ID" },
    { key: "sap_status", label: "SAP Status" },
    { key: "Invoice_amount", label: "Invoice Amount" },
    { key: "Invoice_status", label: "Invoice Status" },
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
                                <SidebarBtn
                                    key={0}
                                    href="#"
                                    isActive
                                    leadingIcon="mdi:download"
                                    label="Download"
                                    labelTw="hidden lg:block"
                                />,
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
                                        `/agentTransaction/agentOrder/details/${row.id}`
                                    ),
                            },
                            {
                                icon: "lucide:edit-2",
                                onClick: (row: TableDataType) =>
                                    router.push(
                                        `/agentTransaction/agentOrder/${row.id}`
                                    ),
                            },
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}
