"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { regionList, deleteRegion } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

interface RegionItem {
  id?: number | string;
  region_code?: string;
  region_name?: string;
  status?: number | "Active" | "Inactive";
  country?: {
    id?: number;
    country_name?: string;
    country_code?: string;   // ✅ Add country_code
  };
}
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function Region() {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);  
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RegionItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // Normalize API data for table
const tableData: TableDataType[] = regions.map((s) => ({
  id: s.id?.toString() ?? "",
  region_code: s.region_code ?? "",
  region_name: s.region_name ?? "",
  country_code: s.country?.country_code ?? "",   
  country_name: s.country?.country_name ?? "", 
  status: s.status === 1 || s.status === "Active" ? "Active" : "Inactive",
}));

  async function fetchRegions() {
      const listRes = await regionList();
      if(listRes.error) {
        showSnackbar("Failed to fetch Regions ❌", "error");
      } else {
        setRegions(listRes.data);
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchRegions();
  }, []);

 const handleConfirmDelete = async () => {
  if (!selectedRow?.id) return;

  const res = await deleteRegion(String(selectedRow.id));
  if(res.error) {
    showSnackbar(res.data.message || "Failed to delete Region","error");
  } else {
    showSnackbar(res.message || "Region deleted successfully", "success");
    fetchRegions();
  }
  setShowDeletePopup(false);
};


  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Region</h1>
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
          key="add-region"
          href="/dashboard/settings/region/add"
          leadingIcon="lucide:plus"
          label="Add Region"
          labelTw="hidden sm:block"
          isActive
        />,
      ],
    },
    footer: { nextPrevBtn: true, pagination: true },
    columns: [
      { key: "region_code", label: "Region Code" },
      { key: "region_name", label: "Region Name" },
      { key: "country_code", label: "Country Code" }, 
      { key: "country_name", label: "Country Name" },
      {
        key: "status",
        label: "Status",
        render: (row: RegionItem) => (
          <div className="flex items-center">
            {row.status === "Active" ? (
              <span className="text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]">
                Active
              </span>
            ) : (
              <span className="text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]">
                Inactive
              </span>
            )}
          </div>
        ),
      },
    ],
    rowSelection: true,
    rowActions: [
      {
        icon: "lucide:edit-2",
        onClick: (data: object) => {
          const row = data as TableRow;
          router.push(`/dashboard/settings/region/update/${row.id}`);
        },
      },
      {
        icon: "lucide:trash-2",
        onClick: (data: object) => {
          const row = data as TableRow;
          setSelectedRow({ id: row.id });
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
            title="Region"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}