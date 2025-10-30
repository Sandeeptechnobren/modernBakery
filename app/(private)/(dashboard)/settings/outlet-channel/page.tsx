"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import { useSnackbar } from "@/app/services/snackbarContext";
import { channelList } from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "outlet_channel_code", label: "Channel Code",
    render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.outlet_channel_code}
            </span>
        ),
   },
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


  return (
    <>
      {/* Table */}
      <div className="max-h-[calc(100%-60px)]">
        { channels && <Table
          // data={channels}
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
                  href="/settings/outlet-channel/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden xl:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "outlet_channels",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (row: TableDataType) => {
                  router.push(`/settings/outlet-channel/${row.id}`);
                },
              },
            ],
            pageSize: 50,
          }}
        />}
      </div>
    </>
  );
}
