"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { getWarehouse ,deleteWarehouse} from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";

const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "code", label: "Warehouse Code" },
  { key: "sapId", label: "SAP ID" },
  { key: "warehouseName", label: "Warehouse Name" },
  { key: "ownerName", label: "Owner Name" },
  { key: "depotName", label: "Depot Name" },
  { key: "depotLocation", label: "Depot Location" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "address", label: "Address" },
  { key: "district", label: "District" },
  { key: "route", label: "Route" },
   {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <div className="flex items-center">
                {row.status ? (
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

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
    // typed row for warehouse table
    type WarehouseRow = TableDataType & {
      id?: number | string;
      code?: string;
      sapId?: string;
      warehouseName?: string;
      ownerName?: string;
      depotName?: string;
      depotLocation?: string;
      phoneNumber?: string;
      address?: string;
      district?: string;
      route?: string;
      status?: string | boolean | number;
    };

    const [selectedRow, setSelectedRow] = useState<WarehouseRow | null>(null);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await getWarehouse();
        interface ApiWarehouse {
          id?: number | string;
          warehouse_code?: string;
          warehouse_name?: string;
          owner_name?: string;
          branch_id?: string | number;
          location?: string;
          owner_number?: string;
          address?: string;
          city?: string;
          status?: number;
        }

        const mapped = (res.data || []).map((item: ApiWarehouse) => ({
          id: item.id,
          code: item.warehouse_code ?? "",
          sapId: "-",
          warehouseName: item.warehouse_name ?? "",
          ownerName: item.owner_name ?? "",
          depotName: item.branch_id?.toString() ?? "",
          depotLocation: item.location ?? "",
          phoneNumber: item.owner_number ?? "",
          address: item.address ?? "",
          district: item.city ?? "",
          route: "-",
          status: item.status === 1 ? "Active" : "Inactive",
        } as WarehouseRow));
        setWarehouses(mapped);
      } catch (e) {
        // ignore error details here but ensure warehouses cleared
        setWarehouses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

    const handleConfirmDelete = async () => {
      if (!selectedRow) return;
  
      try {
        if (!selectedRow?.id) throw new Error('Missing id');
        await deleteWarehouse(String(selectedRow.id)); // call API
        
        showSnackbar("Country deleted successfully ", "success"); 
        router.refresh();
      } catch (error) {
        console.error("Delete failed ❌:", error);
        showSnackbar("Failed to delete country ❌", "error"); 
      } finally {
        setShowDeletePopup(false);
        setSelectedRow(null);
      }
    };

  return loading ? <Loading /> : (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
          Warehouse
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
          data={warehouses}
          config={{
            header: {
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/master/warehouse/addwarehouse"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Warehouse"
                  labelTw="hidden sm:block"
                />,
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              { icon: "lucide:eye" },
              { icon: "lucide:edit-2", onClick: console.log },
              {
                icon: "lucide:more-vertical",
                onClick: () =>
                  confirm("Are you sure you want to delete this Warehouse?"),
              },
            ],
            pageSize: 10,
          }}
        />
      </div>
      {showDeletePopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                <DeleteConfirmPopup
                  title="Country"
                  onClose={() => setShowDeletePopup(false)}
                  onConfirm={handleConfirmDelete}
                />
              </div>
            )}
    </>
  );
}