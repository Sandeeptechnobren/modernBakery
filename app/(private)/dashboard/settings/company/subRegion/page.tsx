"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getArea, deleteArea } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

interface SubRegionItem {
  id?: number | string;
  area_code?: string;
  area_name?: string;
  status?: "Active" | "Inactive" | string;
}

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "area_code", label: "SubRegion Code" },
  { key: "area_name", label: "SubRegion Name" },
  {
    key: "status",
    label: "Status",
    render: (data: TableDataType) => (
        <StatusBtn isActive={data.status ? true : false} />
    ),
  },
];

export default function SubRegion() {
  const [subRegions, setSubRegions] = useState<SubRegionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubRegionItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // normalize API data for the Table component
  const tableData: TableDataType[] = subRegions.map((s) => ({
    id: s.id?.toString() ?? "",
    area_code: s.area_code ?? "",
    area_name: s.area_name ?? "",
    status: s.status ?? "Inactive",
  }));

  useEffect(() => {
    const fetchSubRegions = async () => {
      try {
        const listRes = await getArea();
        setSubRegions(listRes.data);
      } catch (error: unknown) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubRegions();
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      if (!selectedRow?.id) throw new Error("Missing id");
      await deleteArea(String(selectedRow.id));

      showSnackbar("SubRegion deleted successfully ✅", "success");
      router.refresh();
    } catch (error) {
      console.error("Delete failed ❌:", error);
      showSnackbar("Failed to delete SubRegion ❌", "error");
    } finally {
      setShowDeletePopup(false);
      setSelectedRow(null);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
          Sub Region
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
                  href="/dashboard/settings/company/subRegion/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Sub Region"
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
                onClick: (data: object) => {
                  const row = data as TableRow;
                //   router.push(`/dashboard/settings/company/subRegion/update_subRegion/${row.id}`);
                router.push(`/dashboard/settings/company/subRegion/update/${row.id}`);
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

      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="SubRegion"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
