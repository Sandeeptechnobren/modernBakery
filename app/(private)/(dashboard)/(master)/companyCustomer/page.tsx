"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Table, { listReturnType, searchReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  getCompanyCustomers,
  deleteCompanyCustomer,
  exportCompanyCustomerData,
  companyCustomerStatusUpdate,
  companyCustomersGlobalSearch,
  downloadFile,
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import StatusBtn from "@/app/components/statusBtn2";

interface CustomerItem {
  id: number;
  sap_code: string;
  osa_code: string;
  business_name: string;
  company_type: string;
  language: string;
  contact_number?: string;
  business_type: string;
  town: string;
  landmark: string;
  district: string;
  region_id: number;
  area_id: number;
  payment_type: string;
  creditday: string;
  tin_no: string;
  creditlimit: number;
  totalcreditlimit: number;
  credit_limit_validity?: string;
  bank_guarantee_name: string;
  bank_guarantee_amount: number;
  bank_guarantee_from: string;
  bank_guarantee_to: string;
  distribution_channel_id: string;
  merchendiser_ids: string;
  status: string;
}

export default function CompanyCustomers() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { setLoading } = useLoading();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const fetchCompanyCustomers = async (pageNo: number = 1, pageSize: number = 50): Promise<listReturnType> => {
    setLoading(true);
    const res = await getCompanyCustomers({ page: pageNo.toString(), pageSize: pageSize.toString() });
    setLoading(false);
    if (res.error) {
      showSnackbar(res.data.message || "Failed to fetch Company Customers", "error");
      throw new Error(res.data.message);
    }
    return {
      data: res.data || [],
      pageSize: res?.pagination?.per_page || pageSize,
      total: res?.pagination?.last_page || 1,
      currentPage: res?.pagination?.current_page || 1,
    }
  };

  const search = async (searchQuery: string, pageSize: number, columnName?: string): Promise<searchReturnType> => {
    // if (!columnName) throw new Error("Column name is required for search");
    setLoading(true);
    const res = await companyCustomersGlobalSearch({ search: searchQuery, pageSize: pageSize.toString() });
    setLoading(false);
    if (res.error) {
      showSnackbar(res.data.message || "Failed to fetch search results", "error");
      throw new Error(res.data.message);
    }
    return {
      data: res.data || [],
      pageSize: res.data?.pagination?.per_page || pageSize,
      total: res.data?.pagination?.last_page || 1,
      currentPage: res.data?.pagination?.current_page || 1,
    }
  };

  // const handleConfirmDelete = async () => {
  //   if (!selectedRow) return;

  //   // Optimistically remove row first
  //   setCustomers((prev) => prev.filter((c) => c.id !== selectedRow.id));
  //   setShowDeletePopup(false);

  //   setLoading(true);
  //   try {
  //     await deleteCompanyCustomer(selectedRow.id.toString());
  //     showSnackbar("Company Customer deleted successfully ✅", "success");
  //   } catch (error) {
  //     setCustomers((prev) => [...prev, selectedRow]);
  //     showSnackbar("Failed to delete Customer ❌", "error");
  //   } finally {
  //     setSelectedRow(null);
  //   }
  //   setLoading(false);
  // };


  /* ---------- Column Configuration ---------- */
  const columns = [
    {
      key: "osa_code", label: "Customer Code", showByDefault: true, render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
          {row.osa_code}
        </span>
      )
    },
    {
      key: "sap_code", label: "SAP Code", showByDefault: true, render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
          {row.sap_code}
        </span>
      ),
    },
    { key: "business_name", label: "Business Name" },
    { key: "district", label: "District", showByDefault: true },
    { key: "creditlimit", label: "Credit Limit" },
    { key: "totalcreditlimit", label: "Total Credit Limit" },
    {
      key: "payment_type", label: "Payment Type",
      render: (row: TableDataType) => {
        const value = (row as unknown as CustomerItem).payment_type;
        const strValue = value != null ? String(value) : "";
        if (strValue === "0") return "Cash";
        if (strValue === "1") return "Credit";
        if (strValue === "2") return "Bill to Bill";
        return strValue || "-";
      },
    },
    { key: "language", label: "Language" },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => {
        const isActive =
          String(row.status) === "1" ||
          (typeof row.status === "string" &&
            row.status.toLowerCase() === "active");
        return <StatusBtn isActive={isActive} />;
      },
      showByDefault: true,
    },
  ];

  const exportFile = async (format: string) => {
    try {
      const response = await exportCompanyCustomerData({ format });
      if (response && typeof response === 'object' && response.url) {
        await downloadFile(response.url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
    }
  }

  const handleStatusChange = async (ids: (string | number)[] | undefined, status: number) => {
    if (!ids || ids.length === 0) return;
    const res = await companyCustomerStatusUpdate({
      ids: ids,
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
      {/* Table */}
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchCompanyCustomers,
              search: search,
            },
            header: {
              title: "Company Customer",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const ids = selectedRow?.map((id) => {
                      return data[id].id;
                    })
                    exportFile("csv")
                  },
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const ids = selectedRow?.map((id) => {
                      return data[id].id;
                    })
                    exportFile("xlsx")
                  },
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  // showOnSelect: true,
                  showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                    if (!selectedRow || selectedRow.length === 0) return false;
                    const status = selectedRow?.map((id) => data[id].status).map(String);
                    console.log(status, "status");
                    return status?.includes("1") || false;
                  },
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const status: string[] = [];
                    const ids = selectedRow?.map((id) => {
                      const currentStatus = data[id].status;
                      if (!status.includes(currentStatus)) {
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
                  // showOnSelect: true,
                  showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                    if (!selectedRow || selectedRow.length === 0) return false;
                    const status = selectedRow?.map((id) => data[id].status).map(String);
                    console.log(status, "status");
                    return status?.includes("0") || false;
                  },
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const status: string[] = [];
                    const ids = selectedRow?.map((id) => {
                      const currentStatus = data[id].status;
                      if (!status.includes(currentStatus)) {
                        status.push(currentStatus);
                      }
                      return data[id].id;
                    })
                    handleStatusChange(ids, Number(1));
                  },
                },
              ],
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-company-customer"
                  href="/companyCustomer/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "company-customers-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/companyCustomer/details/${data.id}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: TableDataType) => {
                  console.log(row)
                  router.push(
                    `/companyCustomer/${row.id}`
                  )
                }
              },
              // {
              //   icon: "lucide:trash-2",
              //   onClick: (row: TableDataType) => {
              //     const fullRow = customers.find(
              //       (c) => c.id.toString() === row.id
              //     );
              //     if (fullRow) {
              //       setSelectedRow(fullRow);
              //       setShowDeletePopup(true);
              //     }
              //   },
              // },
            ],
            pageSize: 50,
          }}
        />
      </div>

      {/* Delete Popup */}
      {/* {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Company Customer"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )} */}
    </>
  );
}
