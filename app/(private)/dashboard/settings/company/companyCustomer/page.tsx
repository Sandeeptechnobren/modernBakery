"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { getCompanyCustomers, deleteCompanyCustomer } from "@/app/services/allApi";

interface CustomerItem {
  id: number;
  sap_code: string;
  customer_code: string;
  business_name: string;
  owner_name: string;
  owner_no: string;
  email: string;
  town: string;
  district: string;
  balance: number;
  creditlimit: number;
  totalcreditlimit: number;
  region_id: number;
  area_id: number;
  status: number; // 1 = Active, 0 = Inactive
}

export default function CompanyCustomers() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCompanyCustomers();
        if (!Array.isArray(data)) {
          showSnackbar("No customers found ❌", "error");
          setCustomers([]);
          return;
        }
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
        showSnackbar("Failed to fetch Customers ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [showSnackbar]);

  // Table data
  const tableData: TableDataType[] = customers.map((c) => ({
    id: c.id.toString(),
    sap_code: c.sap_code,
    customer_code: c.customer_code,
    business_name: c.business_name,
    owner_name: c.owner_name,
    owner_no: c.owner_no,
    email: c.email,
    district: c.district,
    status: c.status === 1 ? "Active" : "Inactive",
  }));

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedRow) return;
    try {
      await deleteCompanyCustomer(selectedRow.id.toString());
      setCustomers(prev => prev.filter(c => c.id !== selectedRow.id));
      showSnackbar("Customer deleted successfully ✅", "success");
    } catch (error) {
      console.error("Delete failed ❌", error);
      showSnackbar("Failed to delete Customer ❌", "error");
    } finally {
      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Company Customer</h1>
        <SidebarBtn
          href="/dashboard/settings/company/companyCustomer/add"
          isActive
          leadingIcon="lucide:plus"
          label="Add Company Customer"
        />
      </div>

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          data={tableData}
          config={{
            header: { searchBar: true, columnFilter: true },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "sap_code", label: "SAP Code" },
              { key: "customer_code", label: "Customer Code" },
              { key: "business_name", label: "Business Name" },
              { key: "owner_name", label: "Owner Name" },
              { key: "owner_no", label: "Owner Number" },
              { key: "email", label: "Email" },
              { key: "district", label: "District" },
              {
                key: "status",
                label: "Status",
                render: (row: TableDataType) => (
                  <span
                    className={`text-sm p-1 px-4 rounded-xl text-[12px] font-[500] ${
                      row.status === "Active" ? "text-[#027A48] bg-[#ECFDF3]" : "text-red-700 bg-red-200"
                    }`}
                  >
                    {row.status}
                  </span>
                ),
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: TableDataType) => router.push(`/dashboard/settings/customers/update/${row.id}`),
              },
              {
                icon: "lucide:trash-2",
                onClick: (row: TableDataType) => {
                  const fullRow = customers.find(c => c.id.toString() === row.id);
                  if (fullRow) {
                    setSelectedRow(fullRow);
                    setShowDeletePopup(true);
                  }
                },
              },
            ],
            pageSize: 10,
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Company Customer"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
