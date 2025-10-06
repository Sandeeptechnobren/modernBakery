"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { channelList, deleteOutletChannel} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";

interface OutletChannel {
  id?: number | string;
  outlet_channel_code?: string;
  outlet_channel?: string;
  status?: number; // 1 or 0
  [key: string]: string | number | undefined;
}

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "outlet_channel_code", label: "Channel Code" },
  { key: "outlet_channel", label: "Outlet Channel Name" },
  {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <div className="flex items-center">
                {Number(row.status) === 1 ? (
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
];

export default function ChannelList() {
  const [channels, setChannels] = useState<TableDataType[]>([]);
  const { setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  async function fetchChannels() {
    const listRes = await channelList();
    if(listRes.error) {
      showSnackbar(listRes.data.message || "failed to fetch the outlet channels", "error");
    } else {
      setChannels(listRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannel = useCallback(
  async (pageNo: number = 1, pageSize: number = 5): Promise<listReturnType> => {
    setLoading(true);
    const result = await channelList({
      current_page: pageNo.toString(),
      per_page: pageSize.toString(),
    });
    setLoading(false);

    if (result.error) {
      showSnackbar(result.data.message, "error");
      throw new Error("Error fetching data");
    } else {
      return {
        data: result.data as TableDataType[],
        currentPage: result.pagination?.current_page || 1,
        pageSize: result.pagination?.per_page || 5,
        total: result.pagination?.total_pages || 0,
      };
    }
  },
  [showSnackbar]
);


  // Delete handler
  const handleConfirmDelete = async () => {
    const res = await deleteOutletChannel(String(deleteId));
    if(res.error) {
      showSnackbar(res.data.message || "failed to fetch the outlet channels", "error");
    } else {
      showSnackbar(res.message || "Channel deleted successfully", "success");
      setShowDeletePopup(false);
      fetchChannels();
      setRefreshKey(prev => prev+1);
    }
  }

  return (
    <>
      {/* Table */}
      <div className="max-h-[calc(100%-60px)]">
        { channels && <Table
          // data={channels}
          refreshKey={refreshKey}
          config={{
            api: {
              list: fetchChannel,
            },
            header: {
              title: "Outlet Channels",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
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
              ],
              searchBar: false,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-channel"
                  buttonTw="px-3 py-2 h-[34px]"
                  href="/dashboard/settings/outlet-channel/add"
                  leadingIcon="lucide:plus"
                  label="Add Channel"
                  labelTw="hidden xl:block"
                  isActive
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
               {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(
                    `/dashboard/settings/outlet-channel/details/${data.id}`
                  );
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: TableDataType) => {
                  router.push(`/dashboard/settings/outlet-channel/${row.id}`);
                },
              },
              {
                icon: "lucide:trash",
                onClick: (row: TableDataType) => {
                  setDeleteId(Number(row.id));
                  setShowDeletePopup(true);
                },
              },
            ],
            pageSize: 2,
          }}
        />}
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
