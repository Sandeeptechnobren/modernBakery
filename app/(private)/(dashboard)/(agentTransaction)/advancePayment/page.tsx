"use client";

import ApprovalStatus from "@/app/components/approvalStatus";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { advancePaymentExport } from "@/app/services/agentTransaction";
import { allPaymentList, downloadFile } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Payment {
  id: number;
  uuid: string;
  osa_code: string;
  payment_type: number;
  payment_type_text: string;
  companybank_id: number;
  account_number: number;
  bank_name: string;
  branch: string;
  agent_id: number | null;
  Agent_bank_name: string | null;
  bank_account_number: string | null;
  amount: number;
  recipt_no: string;
  recipt_date: string;
  recipt_image: string | null;
  cheque_no: string | null;
  cheque_date: string | null;
  status: number;
}

export default function PaymentListPage() {
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const { warehouseOptions, salesmanOptions, routeOptions, regionOptions, areaOptions, companyOptions, ensureAreaLoaded, ensureCompanyLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseLoaded } = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAreaLoaded();
    ensureCompanyLoaded();
    ensureRegionLoaded();
    ensureRouteLoaded();
    ensureSalesmanLoaded();
    ensureWarehouseLoaded();
  }, [ensureAreaLoaded, ensureCompanyLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseLoaded]);

  const columns: configType["columns"] = [
    { key: "osa_code", label: "OSA Code", },
    { key: "payment_type_text", label: "Payment Type", },
    { key: "bank_name", label: "Bank Name", },
    { key: "branch", label: "Branch", },
    { key: "account_number", label: "Account Number", },
    { key: "amount", label: "Amount", },
    { key: "recipt_no", label: "Receipt Number", },
    { key: "recipt_date", label: "Receipt Date", },
    {
      key: "Agent_bank_name",
      label: "Agent Bank",
      // showByDefault: true,
      render: (row: TableDataType) => {
        return row.Agent_bank_name || "-";
      },
    },
    {
      key: "bank_account_number",
      label: "Agent Account",
      // showByDefault: false,
      render: (row: TableDataType) => {
        return row.bank_account_number || "-";
      },
    },
    {
      key: "cheque_no",
      label: "Cheque Number",
      // showByDefault: false,
      render: (row: TableDataType) => {
        return row.cheque_no || "-";
      },
    },
    {
      key: "cheque_date",
      label: "Cheque Date",
      // showByDefault: false,
      render: (row: TableDataType) => {
        return row.cheque_date || "-";
      },
    },
    {
      key: "approval_status",
      label: "Approval Status",
      // showByDefault: true,
      render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
    },
    // {
    //   key: "status",
    //   label: "Status",
    //   showByDefault: true,
    //   render: (row: TableDataType) => {
    //     // ✅ ADDED: Render status properly
    //     const isActive = row.status == "1" || row.status === "active";
    //     return <StatusBtn isActive={isActive} />;
    //   },
    // },
  ];

  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [isExporting, setIsExporting] = useState(false);
  type TableRow = TableDataType & { uuid?: string };

  const fetchPayments = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      try {
        setLoading(true);

        const listRes = await allPaymentList({
          page,
          limit: pageSize,
        });

        console.log("Payments API Response:", listRes);

        setLoading(false);

        // Handle API response based on your API structure
        if (listRes?.status === "success" || listRes?.success === true) {
          return {
            data: Array.isArray(listRes.data) ? listRes.data : [],
            total:
              listRes?.pagination?.totalPages ||
              listRes?.pagination?.totalRecords ||
              1,
            currentPage: listRes?.pagination?.page || page,
            pageSize: listRes?.pagination?.limit || pageSize,
          };
        } else {
          showSnackbar(
            listRes?.message || "Failed to fetch payment data",
            "error"
          );
          return {
            data: [],
            total: 1,
            currentPage: page,
            pageSize: pageSize,
          };
        }
      } catch (error: unknown) {
        setLoading(false);
        console.error("Error fetching payment data:", error);
        showSnackbar("Error fetching payment data", "error");
        return {
          data: [],
          total: 1,
          currentPage: page,
          pageSize: pageSize,
        };
      }
    },
    [setLoading, showSnackbar]
  );

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  const refreshTable = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const exportfile = async (format: string) => {
    if (isExporting) return; // Prevent multiple clicks
    setIsExporting(true);
    setLoading(true);
    try {
      const response = await advancePaymentExport({ format });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download payment data", "error");
    } finally {
      setIsExporting(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    setRefreshKey(k => k + 1);
  }, [companyOptions, regionOptions, areaOptions, warehouseOptions, routeOptions, salesmanOptions]);

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchPayments },
            header: {
              title: "Advance Payments",
              filterByFields: [
                {
                  key: "start_date",
                  label: "Start Date",
                  type: "date"
                },
                {
                  key: "end_date",
                  label: "End Date",
                  type: "date"
                },
                {
                  key: "company",
                  label: "Company",
                  isSingle: false,
                  multiSelectChips: true,
                  options: Array.isArray(companyOptions) ? companyOptions : [],
                },
                {
                  key: "region",
                  label: "Region",
                  isSingle: false,
                  multiSelectChips: true,
                  options: Array.isArray(regionOptions) ? regionOptions : [],
                },
                {
                  key: "area",
                  label: "Area",
                  isSingle: false,
                  multiSelectChips: true,
                  options: Array.isArray(areaOptions) ? areaOptions : [],
                },
                {
                  key: "warehouse",
                  label: "Warehouse",
                  isSingle: false,
                  multiSelectChips: true,
                  options: Array.isArray(warehouseOptions) ? warehouseOptions : [],
                },
                {
                  key: "route_id",
                  label: "Route",
                  isSingle: false,
                  multiSelectChips: true,
                  options: Array.isArray(routeOptions) ? routeOptions : [],
                },
                {
                  key: "salesman",
                  label: "Sales Team",
                  isSingle: false,
                  multiSelectChips: true,
                  options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
                },

              ],
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: isExporting ? "Exporting..." : "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    if (isExporting) return;
                    const ids = selectedRow?.map((id) => {
                      return data[id].id;
                    })
                    exportfile("csv");
                  }
                },
                {
                  icon: "gala:file-document",
                  label: isExporting ? "Exporting..." : "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    if (isExporting) return;
                    const ids = selectedRow?.map((id) => {
                      return data[id].id;
                    })
                    exportfile("xlsx");
                  }
                },
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/advancePayment/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            localStorageKey: "payment-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              // {
              //   icon: "lucide:edit-2",
              //   onClick: (data: object) => {
              //     const row = data as TableRow;
              //     router.push(`/advancePayment/${row.uuid}`);
              //   },
              // },
              {
                icon: "lucide:eye",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/advancePayment/details/${row.uuid}`);
                },
              },
            ],
            pageSize: 50,
          }}
        />
      </div>
    </>
  );
}
