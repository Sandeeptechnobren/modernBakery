"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { routeTypeList } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";

interface RouteType {
  id: string | number;
  route_type_code: string;
  route_type_name: string;
  status: number; // 1 = Active, 0 = Inactive
}

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
    render: (row: TableDataType) => {
      const statusText = row.status === "1" ? "Active" : "Inactive";
      const statusClass =
        statusText === "Active" ? "bg-[#ECFDF3] text-[#027A48]" : "bg-red-200 text-red-700";
      return <span className={`text-sm font-[500] px-4 py-1 rounded-xl ${statusClass}`}>{statusText}</span>;
    },
  },
];

export default function RouteTypeList() {
  const [routeTypes, setRouteTypes] = useState<RouteType[]>([]);
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchRouteTypes = async () => {
      try {
        const res = await routeTypeList();
        const dataArray: RouteType[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setRouteTypes(dataArray);

        // Convert number status to string to satisfy TableDataType
        const mappedTableData: TableDataType[] = dataArray.map((item) => ({
          id: item.id.toString(),
          route_type_code: item.route_type_code,
          route_type_name: item.route_type_name,
          status: item.status.toString(), // convert number -> string
        }));
        setTableData(mappedTableData);
      } catch (err) {
        console.error("API Error:", err);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteTypes();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
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
                    <div key={idx} className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]">
                      <Icon icon={link.icon} width={link.iconWidth} className="text-[#717680]" />
                      <span className="text-[#181D27] font-[500] text-[16px]">{link.label}</span>
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
          data={tableData} // now TableDataType[]
          config={{
            header: {
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/routetype/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Route Type"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            pageSize: 5,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              { icon: "lucide:eye" },
              { icon: "lucide:edit-2", onClick: console.log },
              {
                icon: "lucide:more-vertical",
                onClick: () => confirm("Are you sure you want to delete this Route Type?"),
              },
            ],
          }}
        />
      </div>
    </>
  );
}
