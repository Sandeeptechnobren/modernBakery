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
                            title: "Customer Invoices",
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
                                  href="/invoice/add"
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
                                icon: "lucide:trash-2",
                                onClick: (row: TableDataType) =>
                                    router.push(
                                        `/invoice/${row.id}`
                                    ),
                            },
                        ],
                        pageSize: 10,
                    }}
                />
        </div>
    );
}
