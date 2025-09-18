"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { companyList, deleteCompany } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

// 🔹 API response type
interface Company {
  id?: string | number;
  company_code?: string;
  company_name?: string;
  company_type?: string;
  email?: string;
  [key: string]: string | number | undefined;
}

// 🔹 Dropdown menu data
interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table columns
const columns = [
  { key: "company_code", label: "Company Code" },
  { key: "company_name", label: "Company Name" },
  { key: "company_type", label: "Company Type" },
  { key: "email", label: "Email" },
];

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Company | null>(null);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // normalize to TableDataType
  const tableData: TableDataType[] = companies.map((c) => ({
    id: c.id?.toString() ?? "",
    company_code: c.company_code ?? "",
    company_name: c.company_name ?? "",
    company_type: c.company_type ?? "",
    email: c.email ?? "",
  }));

  // fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const listRes = await companyList();
        setCompanies(listRes.data);
      } catch (error) {
        console.error("Failed to fetch companies ❌", error);
        showSnackbar("Failed to fetch companies ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [showSnackbar]);

  // handle delete
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    const res = await deleteCompany(String(selectedRow.id));

    if (res.error) {
      showSnackbar("Failed to delete company ❌", "error");
    }
    if (res.status === 200) {
      showSnackbar("Company deleted successfully ✅", "success");

      // Ensure both sides are strings for comparison
      setCompanies((prev) =>
        prev.filter((c) => String(c.id) !== String(selectedRow.id))
      );

      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };

  // ✅ Main Render
  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Company</h1>

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
                  key={0}
                  href="/dashboard/company/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Company"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/dashboard/company/view/${r.id}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/dashboard/company/updateCompany/${r.id}`);
                },
              },
              {
                icon: "lucide:more-vertical",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  setSelectedRow({ id: r.id });
                  setShowDeletePopup(true);
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
            title="Delete Company"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
