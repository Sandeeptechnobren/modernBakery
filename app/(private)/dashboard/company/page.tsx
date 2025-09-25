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
  tin_number?: string;
  vat?: string;

  country?: {
    id?: number;
    country_name?: string;
    country_code?: string;
    selling_currency?: string;
    purchase_currency?: string;
  };

  region?: {
    id?: number;
    region_name?: string;
    region_code?: string;
  };

  sub_region?: {
    id?: number;
    subregion_name?: string;
    subregion_code?: string;
  };

  selling_currency?: string;
  purchase_currency?: string;
  toll_free_no?: string;
  primary_contact?: string;
  website?: string;
  module_access?: string;
  district?: string;
  town?: string;
  street?: string;
  landmark?: string;
  service_type?: string;
  status?: string | number; // allow both since API may send 0/1
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
  { key: "website", label: "Website" },
  { key: "toll_free_no", label: "Toll Free No" },
  { key: "primary_contact", label: "Primary Contact" },
  { key: "region_name", label: "Region" },
  { key: "subregion_name", label: "Sub Region" },
  { key: "street", label: "Street" },
  { key: "landmark", label: "Landmark" },
  { key: "town", label: "Town" },
  { key: "district", label: "District" },
  { key: "country_name", label: "Country" },
  { key: "tin_number", label: "TIN Number" },
  { key: "purchase_currency", label: "Purchase Currency" },
  { key: "selling_currency", label: "Selling Currency" },
  { key: "vat", label: "VAT" },
  { key: "module_access", label: "Module Access" },
  { key: "service_type", label: "Service Type" },
  { key: "status", label: "Status" },
];

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Company | null>(null);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // ✅ Map companies → TableDataType safely
  const tableData: TableDataType[] = companies.map((c) => ({
  id: String(c.id ?? ""),
  company_code: c.company_code ?? "",
  company_name: c.company_name ?? "",
  company_type: c.company_type ?? "",
  email: c.email ?? "",
  tin_number: c.tin_number ?? "",
  vat: c.vat ?? "",
  country_name: c.country?.country_name ?? "",
  selling_currency: c.country?.selling_currency ?? "",
  purchase_currency: c.country?.purchase_currency ?? "",
  toll_free_no: c.toll_free_no ?? "",
  primary_contact: c.primary_contact ?? "",
  website: c.website ?? "",
  region_name: c.region?.region_name ?? "",
  subregion_name: c.sub_region?.subregion_name ?? "",
  module_access: c.module_access ?? "",
  district: c.district ?? "",
  town: c.town ?? "",
  street: c.street ?? "",
  landmark: c.landmark ?? "",
  service_type: c.service_type ?? "",
  status: c.status === "1" || c.status === 1 ? "Active" : "Inactive",
}));


  // ✅ Fetch companies from API
  
    const fetchCompanies = async () => {
      try {
        const res = await companyList();
        if (res?.data && Array.isArray(res.data)) {
          setCompanies(res.data);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Failed to fetch companies ❌", err);
        showSnackbar("Failed to fetch companies ❌", "error");
      } finally {
        setLoading(false);
      }
    };


    useEffect(() => {
       fetchCompanies();
    }, [showSnackbar]);


  const handleConfirmDelete = async () => {
  if (!selectedRow?.id) return;

    const res = await deleteCompany(String(selectedRow.id));
    if (res.error) {
      showSnackbar(res.message || "Failed to delete company ❌", "error");
      await fetchCompanies();
      setShowDeletePopup(false);
      setSelectedRow(null);
    } else {
      // show message from API if exists, else generic error
      showSnackbar("Company deleted successfully ✅", "success");
      fetchCompanies();
    }
};
     


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
                icon: "lucide:edit-2",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/dashboard/company/updateCompany/${r.id}`);
                },
              },
              {
                icon: "lucide:trash-2",
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
