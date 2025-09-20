"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { channelList, deleteOutletChannel } from "@/app/services/allApi";

interface OutletChannel {
  id?: number | string;
  outlet_channel_code?: string;
  outlet_channel?: string;
  status?: number; // 1 or 0
  [key: string]: string | number | undefined;
}

const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "outlet_channel_code", label: "Channel Code" },
  { key: "outlet_channel", label: "Outlet Channel Name" },
  { key: "status", label: "Status" },
];

export default function ChannelList() {
  const [channels, setChannels] = useState<OutletChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<OutletChannel | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // Map API data to table format
  const tableData: TableDataType[] = channels.map((c) => ({
    id: c.id?.toString() ?? "",
    outlet_channel_code: c.outlet_channel_code ?? "",
    outlet_channel: c.outlet_channel ?? "",
    status: c.status === 1 ? "Active" : "Inactive",
  }));

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const res = await channelList();
        const data = Array.isArray(res?.data) ? res.data : [];
        setChannels(data);
      } catch (error) {
        console.error("Failed to fetch channels ❌", error);
        showSnackbar("Failed to fetch channels ❌", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [refresh]);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedRow?.id) return;
    try {
      await deleteOutletChannel(String(selectedRow.id));
      setChannels((prev) =>
        prev.filter((c) => String(c.id) !== String(selectedRow.id))
      );
      showSnackbar("Channel deleted successfully ✅", "success");
      setSelectedRow(null);
      setShowDeletePopup(false);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Delete failed ❌", error);
      showSnackbar("Failed to delete channel ❌", "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">
          Outlet Channels
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
                  key="add-channel"
                  href="/dashboard/settings/outlet-channel/add"
                  leadingIcon="lucide:plus"
                  label="Add Channel"
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
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  router.push(`/dashboard/settings/outlet-channel/update/${r.id}`);
                },
              },
              {
                icon: "lucide:trash",
                onClick: (row: object) => {
                  const r = row as TableDataType;
                  setSelectedRow({
                    id: r.id,
                    outlet_channel_code: r.outlet_channel_code,
                    outlet_channel: r.outlet_channel,
                    status: r.status === "Active" ? 1 : 0,
                  });
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
            title="Delete Outlet Channel"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
