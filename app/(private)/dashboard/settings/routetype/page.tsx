
"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter, useSearchParams } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { routeTypeList, deleteRouteTypeById } from "@/app/services/allApi";
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

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "route_type_code", label: "Route Type Code" },
  { key: "route_type_name", label: "Route Type Name" },
  {
        key: "status",
        label: "Status",
        render: (data: TableDataType) => (
            <StatusBtn isActive={data.status ? true : false} />
        ),
    },
];

export default function RouteType() {
 interface RouteTypeItem {
  id?: number | string;
  route_type_code?: string;
  route_type_name?: string;
  status?: number | "Active" | "Inactive";
}

  const [routeType, setRouteType] = useState<RouteTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RouteTypeItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const updated = searchParams.get("updated"); // detect if redirected after update
  const { showSnackbar } = useSnackbar();

  type TableRow = TableDataType & { id?: string };

  // ✅ Table data mapping
const tableData: TableDataType[] = routeType.map((s) => ({
  id: s.id?.toString() ?? "",
  route_type_code: s.route_type_code ?? "",
  route_type_name: s.route_type_name ?? "",
  status: s.status === 1 || s.status === "Active" ? "Active" : "Inactive",
}));

  // ✅ Reusable fetch function
  const fetchRouteTypes = async () => {
    const listRes = await routeTypeList({});
    if(listRes.error) showSnackbar(listRes.data.message || "Failed to fetch Route Type", "error");
    else setRouteType(listRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRouteTypes();
  }, []);

  // ✅ Delete handler with refresh
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;

      const res = await deleteRouteTypeById(String(selectedRow.id));
      if(res.error) showSnackbar(res.data.message || "Failed to delete Route Type ❌", "error");
      else {
        showSnackbar("Route Type deleted successfully ✅", "success");
        fetchRouteTypes();
      }
      setShowDeletePopup(false);
      setSelectedRow(null);
      setDeletingId(null);
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
          Route Type
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
          key="add-route-type"
          href="/dashboard/settings/routetype/add"
          leadingIcon="lucide:plus"
          label="Add Route Type"
          labelTw="hidden sm:block"
          isActive
        />,
      ],
    },
    footer: { nextPrevBtn: true, pagination: true },
    columns: [
      { key: "route_type_code", label: "Route Type Code" },
      { key: "route_type_name", label: "Route Type Name" },
      {
        key: "status",
        label: "Status",
        render: (row: RouteTypeItem) => (
          <span
            className={
              row.status === "Active"
                ? "text-sm text-[#027A48] bg-[#ECFDF3] font-[500] p-1 px-4 rounded-xl text-[12px]"
                : "text-sm text-red-700 bg-red-200 p-1 px-4 rounded-xl text-[12px]"
            }
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
        onClick: (data: object) => {
          const row = data as RouteTypeItem;
          router.push(`/dashboard/settings/route-type/update/${row.id}`);
        },
      },
      {
        icon: "lucide:trash-2",
        onClick: (data: object) => {
          const row = data as RouteTypeItem;
          setSelectedRow({ id: row.id });
          setShowDeletePopup(true);
        },
      },
    ],
    pageSize: 10,
  }}
/>
      </div>

      {/* Delete popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Route Type"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
