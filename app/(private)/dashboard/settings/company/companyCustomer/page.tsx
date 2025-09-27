"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/app/components/customDropdown";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  getCompanyCustomers,
  deleteCompanyCustomer,
} from "@/app/services/allApi";

/* ---------- Types ---------- */
interface CustomerItem {
  id: number;
  sap_code: string;
  customer_code: string;
  business_name: string;
  owner_name: string;
  owner_no: string;
  whatsapp_no: string;
  email: string;
  language: string;
  contact_no2: string;
  road_street: string;
  town: string;
  landmark: string;
  district: string;
  balance: number;
  payment_type: string;
  bank_name: string;
  bank_account_number: string;
  creditday: string;
  tin_no: string;
  accuracy: string;
  creditlimit: number;
  guarantee_name: string;
  guarantee_amount: number;
  guarantee_from: string;
  guarantee_to: string;
  totalcreditlimit: number;
  credit_limit_validity: string;
  vat_no: string;
  longitude: string;
  latitude: string;
  threshold_radius: number;
  dchannel_id: number;
  status: number;
  created_user: number;
  updated_user: number;
  created_at: string;
  updated_at: string;
}

/* ---------- Dropdown Menu ---------- */
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

/* ========================================================= */
export default function CompanyCustomers() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  /* ---------- Fetch Customers ---------- */
  useEffect(() => {
    const fetchCompanyCustomers = async () => {
      try {
        const data = await getCompanyCustomers();
        // API might return a single object or array
        const customersData = Array.isArray(data) ? data : [data];
        setCustomers(customersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyCustomers();
  }, []);

  /* ---------- Map to TableData ---------- */
  const tableData: TableDataType[] = customers.map((c) => ({
    sap_code: c.sap_code,
    customer_code: c.customer_code,
    business_name: c.business_name,
    owner_name: c.owner_name,
    owner_no: c.owner_no,
    whatsapp_no: c.whatsapp_no,
    email: c.email,
    language: c.language,
    district: c.district,
    balance: c.balance.toString(),
    payment_type: c.payment_type,
    creditlimit: c.creditlimit.toString(),
    totalcreditlimit: c.totalcreditlimit.toString(),
    status: c.status === 1 ? "Active" : "Inactive",
  }));

  /* ---------- Delete Handler ---------- */
  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    // Optimistic removal
    setCustomers((prev) => prev.filter((c) => c.id !== selectedRow.id));
    setShowDeletePopup(false);

    try {
      await deleteCompanyCustomer(selectedRow.id.toString());
      showSnackbar("Company Customer deleted successfully ✅", "success");
    } catch (error) {
      setCustomers((prev) => [...prev, selectedRow]);
      showSnackbar("Failed to delete Customer ❌", "error");
    } finally {
      setSelectedRow(null);
    }
  };

  if (loading) return <Loading />;

  /* ---------- Column Configuration ---------- */
  const columns = [
    { key: "sapcode", label: "SAP Code" },
    { key: "customer_code", label: "Customer Code" },
    { key: "business_name", label: "Business Name" },
    { key: "owner_name", label: "Owner Name" },
    { key: "owner_no", label: "Owner Number" },
    { key: "whatsapp_no", label: "WhatsApp No" },
    { key: "email", label: "Email" },
    { key: "language", label: "Language" },
    { key: "district", label: "District" },
    { key: "balance", label: "Balance" },
    { key: "payment_type", label: "Payment Type" },
    { key: "creditlimit", label: "Credit Limit" },
    { key: "totalcreditlimit", label: "Total Credit Limit" },
    {
      key: "status",
      label: "Status",
      render: (row: TableDataType) => (
        <span
          className={`text-sm p-1 px-4 rounded-xl text-[12px] font-[500] ${
            row.status === "Active"
              ? "text-[#027A48] bg-[#ECFDF3]"
              : "text-red-700 bg-red-200"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  /* ---------- Render ---------- */
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Company Customer
        </h1>

        <div className="flex gap-[12px] relative">
          <BorderIconButton icon="gala:file-document" label="Export CSV" />
          <BorderIconButton icon="mage:upload" />

          <DismissibleDropdown
            isOpen={showDropdown}
            setIsOpen={setShowDropdown}
            button={<BorderIconButton icon="ic:sharp-more-vert" />}
            dropdown={
              <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                <CustomDropdown>
                  {dropdownDataList.map((link, idx) => (
                    <div
                      key={idx}
                      className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                    >
                      <Icon
                        icon={link.icon}
                        width={link.iconWidth}
                        className="text-[#717680]"
                      />
                      <span className="text-[#181D27] font-[500] text-[16px]">
                        {link.label}
                      </span>
                    </div>
                  ))}
                </CustomDropdown>
              </div>
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          data={tableData}
          config={{
            header: {
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-company-customer"
                  href="/dashboard/settings/company/companyCustomer/add"
                  leadingIcon="lucide:plus"
                  label="Add Company Customer"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: TableDataType) =>
                  router.push(
                    `/dashboard/settings/company/companyCustomer/update/${row.id}`
                  ),
              },
              {
                icon: "lucide:trash-2",
                onClick: (row: TableDataType) => {
                  const fullRow = customers.find(
                    (c) => c.id.toString() === row.id
                  );
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
