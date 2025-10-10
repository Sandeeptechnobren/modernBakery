"use client";

import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
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

export default function CustomerOrderPage() {
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const router = useRouter();

  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    region: "",
    areaSupervisor: "",
    depotCode: "",
    customerType: "Harris Customer",
  });

  const [tempDepotCode, setTempDepotCode] = useState("");
  const [showDepotActions, setShowDepotActions] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleDepotSelect = (value: string) => {
    setTempDepotCode(value);
    setShowDepotActions(true);
  };

  const handleDepotConfirm = () => {
    setFilters({ ...filters, depotCode: tempDepotCode });
    setShowDepotActions(false);
    showSnackbar(`Depot code set to ${tempDepotCode}`, "success");
  };

  const handleDepotCancel = () => {
    setTempDepotCode("");
    setShowDepotActions(false);
  };

  const fetchOrders = useCallback(
    async (
      pageNo: number = 1,
      pageSize: number = 10
    ): Promise<listReturnType> => {
      try {
        setLoading(true);

        // Dummy data
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
              order_type: "Online",
              order_no: "ORD-2025-01",
              sap_id: "SAP12345",
              sap_status: "Pending",
              order_amount: "₹12,500",
              order_status: "In Progress",
            },
          ],
          pagination: { current_page: 1, per_page: 10, last_page: 1 },
        };

        if (result.error) {
          showSnackbar("Error fetching orders", "error");
          throw new Error("Failed to fetch orders");
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
    },
    [filters, setLoading, showSnackbar]
  );

  const searchOrders = useCallback(
    async (query: string, pageSize: number = 10): Promise<searchReturnType> => {
      try {
        setLoading(true);

        const result = {
          error: false,
          data: [],
          pagination: {
            pagination: { current_page: 1, per_page: 10, total: 0 },
          },
        };

        if (result.error) throw new Error("Search failed");

        return {
          data: result.data,
          currentPage: result.pagination.pagination.current_page,
          pageSize: result.pagination.pagination.per_page,
          total: result.pagination.pagination.total,
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const columns = [
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "route_code", label: "Route Code" },
    { key: "depot_name", label: "Depot Name" },
    { key: "customer_name", label: "Customer Name" },
    { key: "salesman", label: "Salesman" },
    { key: "order_type", label: "Order Type" },
    { key: "order_no", label: "Order No" },
    { key: "sap_id", label: "SAP ID" },
    { key: "sap_status", label: "SAP Status" },
    { key: "order_amount", label: "Order Amount" },
    { key: "order_status", label: "Order Status" },
  ];

  const showRegionFields = filters.customerType === "Harris Customer";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-[22px] font-semibold">Harris Customer Order</h1>
        <div className="flex flex-row gap-2">
          <SidebarBtn
            href="#"
            isActive
            leadingIcon="mdi:download"
            label="Download"
            labelTw="hidden sm:block"
          />
          <SidebarBtn
            key={0}
            href="/harrisTransaction/customerOrder/add"
            isActive
            leadingIcon="mdi:plus"
            label="Add"
            labelTw="hidden sm:block"
          />
        </div>
      </div>

      <ContainerCard className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 items-end w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              label="Customer Type"
              type="select"
              name="customerType"
              value={filters.customerType}
              options={[
                { label: "Harris Customer", value: "Harris Customer" },
                { label: "Direct Supply", value: "Direct Supply" },
              ]}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />

            {showRegionFields && (
              <>
                <InputFields
                  label="Region"
                  type="select"
                  name="region"
                  value={filters.region}
                  options={[{ label: "RG01 - WEST 1", value: "RG01" }]}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                />

                <InputFields
                  label="Area Sales Supervisor"
                  type="select"
                  name="areaSupervisor"
                  value={filters.areaSupervisor}
                  options={[{ label: "SRG01 - WEST 1", value: "SRG01" }]}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                />
              </>
            )}
          </div>

          <SidebarBtn
            href="#"
            isActive
            leadingIcon="mdi:filter"
            label="Filter"
            labelTw="hidden sm:block"
          />
        </div>

        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchOrders, search: searchOrders },
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
                    `/harrisTransaction/customerOrder/details/${row.id}`
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
