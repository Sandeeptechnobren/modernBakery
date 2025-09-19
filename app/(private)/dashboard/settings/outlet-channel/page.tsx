"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { outletChannelList, deleteChannel } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext"; // ✅ import snackbar

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
  { key: "outlet_channel_code", label: "Channel Code" },
  { key: "outlet_channel", label: "Outlet Channel Name" },

];

export default function ChannelList() {
  interface OutletChannel {
    id?: number | string;
    outlet_channel_code?: string;
    outlet_channel?: string;

  }

 const [channels, setChannels] = useState<OutletChannel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<OutletChannel | null>(null);
  const router = useRouter();
  const { showSnackbar } = useSnackbar(); // ✅ snackbar hook
  type TableRow = TableDataType & { id?: string };

  // normalize countries to TableDataType for the Table component
 const tableData: TableDataType[] = (channels ?? []).map((c) => ({
  id: c.id?.toString() ?? "",
  outlet_channel_code: c.outlet_channel_code ?? "",
   outlet_channel: c.outlet_channel ?? "",
 
}));




  const fetchChannels = async () => {
    setLoading(true);
    try {
      const listRes = await outletChannelList({});
      const data = Array.isArray(listRes?.data) ? listRes.data : [];
      setChannels(data);
    } catch (error: unknown) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ initial load
  useEffect(() => {
    fetchChannels();
  }, []);
const handleConfirmDelete = async () => {
  if (!selectedRow?.id) return;

  try {
    await deleteChannel(String(selectedRow.id)); // API call
    await fetchChannels();

    // ✅ Remove deleted row from state
    setChannels((prev) =>
      prev.filter((c) => String(c.id) !== String(selectedRow.id))
    );

    showSnackbar("Channel deleted successfully ✅", "success");
  } catch (error) {
    console.error("Delete failed ❌:", error);
    showSnackbar("Failed to delete channel ❌", "error");
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
          Channel
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
                  href="/dashboard/settings/outlet-channel/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Channel"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              { icon: "lucide:eye" },
              {
                icon: "lucide:edit-2",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  router.push(`/dashboard/settings/outlet-channel/update/${row.id}`);
                },
              },
              {
                icon: "lucide:more-vertical",
                onClick: (data: object) => {
                  const row = data as TableRow;
                  setSelectedRow({ id: row.id, outlet_channel_code: row.outlet_channel_code, outlet_channel: row.outlet_channel });
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
            title="Channel"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
