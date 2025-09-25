"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { vehicleList, deleteVehicle } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";

// 🔹 API response type
interface Vehicle {
    id?: string | number;
    vehicle_code?: string;
    description?: string;
    number_plat?: string;
    vehicle_chesis_no?: string;
    opening_odometer?: string;
    vehicle_type?: string;
    capacity?: string;
    owner_type?: string;
    warehouse?: { warehouse_name: string };
    owner_reference?: string;
    vehicle_route?: string;
    status?: number;
    [key: string]: string | number | object | undefined;
}

// 🔹 Dropdown menu data
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

// 🔹 Table columns
const columns = [
  { key: "vehicle_code", label: "Vehicle Code" },
  { key: "numberPlate", label: "Number Plate" },
  { key: "chassisNumber", label: "Chassis Number" },
  { key: "brand", label: "Brand" },
  { key: "odoMeter", label: "Odo Meter" },
  { key: "vehicleType", label: "Vehicle Type" },
  { key: "capacity", label: "Capacity" },
  { key: "ownerType", label: "Owner Type" },
  { key: "depotLocation", label: "Depot Location" },
  // { key: "ownerReference", label: "Owner Reference" },
  // { key: "vehicleRoute", label: "Vehicle Route" },
  { key: "description", label: "Description" },
  { key: "valid_from", label: "Valid From" },
  { key: "valid_to", label: "Valid To" },
  {
        key: "status",
        label: "Status",
        render: (row: TableDataType) => (
            <StatusBtn isActive={row.status === "Active" ? true : false} />
        ),
    },
];

export default function VehiclePage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Vehicle | null>(null);

    const { showSnackbar } = useSnackbar();
    const router = useRouter();

  // ✅ Map vehicles → TableDataType safely
  const tableData: TableDataType[] = vehicles.map((v) => ({
    id: String(v.id ?? ""),
    vehicle_code: v.vehicle_code ?? "-",
    brand: v.vehicle_brand !== undefined ? String(v.vehicle_brand) : "-",
    numberPlate: v.number_plat ?? "-",
    chassisNumber: v.vehicle_chesis_no ?? "-",
    odoMeter: v.opening_odometer ?? "-",
    vehicleType: v.vehicle_type ?? "-",
    capacity: v.capacity ?? "-",
    ownerType: v.owner_type ?? "-",
    depotLocation: v.warehouse_id !== undefined ? String(v.warehouse_id) : "-",
    ownerReference: v.owner_reference ?? "-",
    vehicleRoute: v.vehicle_route ?? "-",
    description: v.description ?? "-",
    valid_from: v.valid_from !== undefined ? String(v.valid_from) : "-",
    valid_to: v.valid_to !== undefined ? String(v.valid_to) : "-",
    status: v.status === 1 ? "Active" : "Inactive",
  }));

    const fetchVehicles = async () => {
        const res = await vehicleList();
        if (res.error) {
            showSnackbar(res.data.message || "Failed to fetch vehicles ❌","error");
            setVehicles([]);
        } else {
            setVehicles(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleConfirmDelete = async () => {
        if (!selectedRow?.id) return;

        const res = await deleteVehicle(String(selectedRow.id));
        if (res.error) {
            showSnackbar(res.data.message || "Failed to delete vehicle ❌","error");
        } else {
            showSnackbar(res.message || "Vehicle deleted successfully ✅", "success");
            fetchVehicles();
        }
        setShowDeletePopup(false);
        setSelectedRow(null);
    };

    if (loading) return <Loading />;

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-[20px]">
                <h1 className="text-[20px] font-semibold text-[#181D27]">
                    Vehicle
                </h1>

                <div className="flex gap-[12px] relative">
                    <BorderIconButton
                        icon="gala:file-document"
                        label="Export CSV"
                    />
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
                                    key={0}
                                    href="/dashboard/master/vehicle/add"
                                    isActive
                                    leadingIcon="lucide:plus"
                                    label="Add Vehicle"
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
                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    router.push(
                                        `/dashboard/master/vehicle/updateVehicle/${r.id}`
                                    );
                                },
                            },
                            {
                                icon: "lucide:trash-2",
                                onClick: (row: object) => {
                                    const r = row as TableDataType;
                                    setSelectedRow({ id: r.id });
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
                        title="Delete Vehicle"
                        onClose={() => setShowDeletePopup(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </div>
            )}
        </>
    );
}
