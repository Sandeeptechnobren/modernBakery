"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

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
  status?: number | "Active" | "Inactive"; // API may return number
}

export default function Region() {
  const [regions, setRegions] = useState<RegionItem[]>([]);
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
    status: s.status === 1 || s.status === "Active" ? "Active" : "Inactive", // ✅ Correct mapping
  }));

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const listRes = await regionList();
        setRegions(listRes.data);
      } catch (error) {
        console.error("API Error:", error);
        showSnackbar("Failed to fetch Regions ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

    try {
      await deleteRegion(String(selectedRow.id));

      // Remove deleted row from local state
      setRegions((prev) =>
        prev.filter((region) => region.id !== selectedRow.id)
      );

      showSnackbar("Region deleted successfully ✅", "success");
    } catch (error) {
      console.error("Delete failed ❌", error);
      showSnackbar("Failed to delete Region ❌", "error");
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
        <h1 className="text-[20px] font-semibold text-[#181D27]">Region</h1>
        <SidebarBtn
          href="/dashboard/settings/region/add"
          isActive
          leadingIcon="lucide:plus"
          label="Add Region"
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
              { key: "region_code", label: "Region Code" },
              { key: "region_name", label: "Region Name" },
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
