"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import Table, {
  listReturnType,
  TableDataType,
  searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

export default function CustomerInvoicePage() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();

  // 🔹 Filters State
  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    region: "",
    routeCode: "",
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // 🔹 Handle Input Change
  const handleChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Fetch Invoices (Mock API)
  const fetchInvoices = useCallback(async (): Promise<listReturnType> => {
    try {
      setLoading(true);

      // Simulated API Response
      const result = {
        error: false,
        data: [
          {
            id: 1,
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
            id: 2,
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

      if (result.error) {
        showSnackbar("Error fetching Invoices", "error");
        throw new Error("Failed to fetch Invoices");
      }

      return {
        data: [],
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

  return (
    <div className="p-[20px] flex flex-col gap-5">
      {/* 🔹 Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold">Agent Customer Invoice</h1>
        <div className="flex justify-end gap-3">
          <SidebarBtn
            href="#"
            isActive
            leadingIcon="mdi:download"
            label="Download"
            labelTw="hidden sm:block"
          />
          <SidebarBtn
            key={0}
            href="/dashboard/agentTransaction/agentCustomerInvoice/add"
            isActive
            leadingIcon="mdi:plus"
            label="Add"
            labelTw="hidden sm:block"
          />
        </div>
      </div>

      {/* 🔹 Filters Section */}
      <ContainerCard className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Date Filters + Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <InputFields
              label="From Date"
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
            <InputFields
              label="To Date"
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
            <InputFields
              label="Region"
              type="select"
              options={[
                { value: "east", label: "East" },
                { value: "west", label: "West" },
                { value: "north", label: "North" },
              ]}
              value={filters.region}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, region: e.target.value }))
              }
            />
            <InputFields
              label="Route Code"
              type="select"
              options={[
                { value: "RT0447-E0062", label: "RT0447 - E0062" },
                { value: "RT0450-E0012", label: "RT0450 - E0012" },
              ]}
              value={filters.routeCode}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, routeCode: e.target.value }))
              }
            />
            <SidebarBtn
              href="#"
              isActive
              label="Filter"
              labelTw="hidden sm:block"
              onClick={() => setRefreshKey((prev) => prev + 1)}
            />
          </div>
        </div>

        {/* 🔹 Table Section */}
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchInvoices, search: searchInvoices },
            header: {
              searchBar: true,
              columnFilter: true,
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: TableDataType) =>
                  router.push(
                    `/dashboard/agentTransaction/agentCustomerInvoice/details/${row.id}`
                  ),
              },
            ],
            pageSize: 10,
          }}
        />
      </ContainerCard>
    </div>
  );
}
