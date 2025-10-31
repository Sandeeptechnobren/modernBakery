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
//           href="/agentTransaction/agentCustomerOrder/add"
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
//                     `/agentTransaction/agentCustomerOrder/details/${row.id}`
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

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import BorderIconButton from "@/app/components/borderIconButton";

const dropdownDataList = [
    // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
    // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
    // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table Columns
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
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();

    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        region: "",
        routeCode: "",
    });

    const [refreshKey, setRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Fetch Invoices (Mock API)
    const fetchInvoices = useCallback(async (): Promise<listReturnType> => {
        try {
            setLoading(true);

            // Simulated API Response
            const result = {
                data: [
                    {
                        date: "2025-10-08",
                        time: "11:30 AM",
                        route_code: "R001",
                        depot_name: "West Depot",
                        customer_name: "ABC Traders",
                        salesman: "John Doe",
                        Invoice_type: "Online",
                        Invoice_no: "INV-2025-01",
                        sap_id: "SAP12345",
                        sap_status: "Pending",
                        Invoice_amount: "₹12,500",
                        Invoice_status: "In Progress",
                    },
                    {
                        date: "2025-10-07",
                        time: "02:45 PM",
                        route_code: "R002",
                        depot_name: "East Depot",
                        customer_name: "XYZ Stores",
                        salesman: "Jane Smith",
                        Invoice_type: "Offline",
                        Invoice_no: "INV-2025-02",
                        sap_id: "SAP12346",
                        sap_status: "Completed",
                        Invoice_amount: "₹18,900",
                        Invoice_status: "Delivered",
                    },
                ],
                pagination: { current_page: 1, per_page: 10, last_page: 1 },
            };

            return {
                data: result.data || [],
                currentPage: result.pagination.current_page,
                pageSize: result.pagination.per_page,
                total: result.pagination.last_page,
            };
        } finally {
            setLoading(false);
        }
    }, [setLoading, showSnackbar]);

    // 🔹 Search Invoices (Mock)
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

    return (
        <div className="flex flex-col h-full">
                {/* 🔹 Table Section */}
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchInvoices, search: searchInvoices },
                        header: {
                            title: "Customer Orders",
                            wholeTableActions: [
                              <div key={0} className="flex gap-[12px] relative">
                                  <DismissibleDropdown
                                      isOpen={showDropdown}
                                      setIsOpen={setShowDropdown}
                                      button={
                                          <BorderIconButton icon="ic:sharp-more-vert" />
                                      }
                                      dropdown={
                                          <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                                              <CustomDropdown>
                                                  {dropdownDataList.map(
                                                      (link, idx) => (
                                                          <div
                                                              key={idx}
                                                              className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                                                          >
                                                              <Icon
                                                                  icon={
                                                                      link.icon
                                                                  }
                                                                  width={
                                                                      link.iconWidth
                                                                  }
                                                                  className="text-[#717680]"
                                                              />
                                                              <span className="text-[#181D27] font-[500] text-[16px]">
                                                                  {
                                                                      link.label
                                                                  }
                                                              </span>
                                                          </div>
                                                      )
                                                  )}
                                              </CustomDropdown>
                                          </div>
                                      }
                                  />
                              </div>
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
                                  href="/agentTransaction/agentCustomerOrder/add"
                                  isActive
                                  leadingIcon="mdi:plus"
                                  label="Add"
                                  labelTw="hidden lg:block"
                              />
                            ]
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (row: TableDataType) =>
                                    router.push(
                                        `/agentTransaction/agentCustomerOrder/details/${row.id}`
                                    ),
                            },
                            {
                                icon: "lucide:edit-2",
                                onClick: (row: TableDataType) =>
                                    router.push(
                                        `/agentTransaction/agentCustomerOrder/${row.id}`
                                    ),
                            },
                        ],
                        pageSize: 10,
                    }}
                />
        </div>
    );
}
