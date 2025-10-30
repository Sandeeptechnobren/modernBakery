"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { serviceTypesList } from "@/app/services/assetsApi";
import StatusBtn from "@/app/components/statusBtn2";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function ShelfDisplay() {
  const {setLoading} = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const fetchServiceTypes = useCallback(
    async ( pageNo: number = 1, pageSize: number = 50) : Promise<listReturnType> => {
      setLoading(true);
      const res = await serviceTypesList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
      });
      setLoading(false);
      if(res.error) {
        showSnackbar(res.data.message || "failed to fetch the Service Types", "error");
        throw new Error("Unable to fetch the Service Types");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.page || 0,
          pageSize: res?.pagination?.limit || 50,
          total: res?.pagination?.totalPages || 0,
        };
      }
    }, []
  )

  useEffect(() => {
    setLoading(true);
  }, [])

  return (
    <>
      {/* Table */}
      <div className="h-[calc(100%-60px)]">
        <Table
          config={{
            api: {
              list: fetchServiceTypes
            },
            header: {
              title: "Service Types",
              wholeTableActions: [
                <div key={0} className="flex gap-[12px] relative">
                  {/* <BorderIconButton icon="gala:file-document" label="Export CSV" /> */}
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
                              <Icon icon={link.icon} width={link.iconWidth} className="text-[#717680]" />
                              <span className="text-[#181D27] font-[500] text-[16px]">{link.label}</span>
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
                  key="name"
                  href="/settings/company/serviceType/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "serviceType",
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              { key: "code", label: "Code",
                render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.code}
            </span>
        ),
               },
              { key: "name", label: "Name" },
              { key: "status", label: "Status", render: (data: TableDataType) => (
                  <StatusBtn isActive={data.status && data.status.toString() === "1" ? true : false} />
              )},
          
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/settings/company/serviceType/${data.uuid}`);
                },
              },
            ],
            pageSize: 50,
          }}
        />
      </div>
    </>
  );
}