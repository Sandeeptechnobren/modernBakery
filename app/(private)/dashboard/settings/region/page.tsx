"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import Loading from "@/app/components/Loading";
import { regionList } from "@/app/services/allApi";

// -----------------------
// Types
// -----------------------
interface RegionAPIItem {
  id: number | string;
  region_code: string;
  region_name: string;
  country?: {
    country_name: string;
    country_code: string;
  };
  status: number;
}

interface Region extends TableDataType {
  id: string;
  region_code: string;
  region_name: string;
  country_name: string;
  country_code: string;
  status: "Active" | "Inactive";
}

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

// -----------------------
// Fallback/mock data
// -----------------------
const mockRegions: Region[] = [];

// -----------------------
// Actions dropdown
// -----------------------
const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// -----------------------
// Table columns
// -----------------------
const columns = [
  { key: "region_code", label: "Region Code" },
  { key: "region_name", label: "Region Name" },
  { key: "country_code", label: "Country Code" },
  { key: "country_name", label: "Country Name" },

];

// -----------------------
// Component
// -----------------------
export default function RegionPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // -----------------------
  // Fetch regions from API
  // -----------------------
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await regionList();
        if (res.status && Array.isArray(res.data)) {
          const mappedData: Region[] = res.data.map((item: RegionAPIItem) => ({
            id: item.id.toString(),
            region_code: item.region_code,
            region_name: item.region_name,
            country_name: item.country?.country_name || "-",
            country_code: item.country?.country_code || "-",
            status: item.status === 1 ? "Active" : "Inactive",
          }));
          setRegions(mappedData);
        } else {
          setRegions(mockRegions);
        }
      } catch (error) {
        console.error("API Error:", error);
        setRegions(mockRegions);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="h-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Regions</h1>

        <div className="flex gap-2 relative">
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
                      className="px-4 py-2 flex items-center gap-2 hover:bg-[#FAFAFA]"
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
      <Table
        data={regions}
        config={{
          header: {
            searchBar: true,
            columnFilter: true,
            actions: [
              <SidebarBtn
                key={0}
                href="/dashboard/settings/region/add"
                isActive
                leadingIcon="lucide:plus"
                label="Add Region"
                labelTw="hidden sm:block"
              />,
            ],
          },
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (row) => console.log("View", row as Region),
            },
            {
              icon: "lucide:edit-2",
              onClick: (row) => console.log("Edit", row as Region),
            },
            {
              icon: "lucide:more-vertical",
              onClick: (row) =>
                confirm(
                  `Are you sure you want to delete ${(row as Region).region_name}?`
                ),
            },
          ],
          pageSize: 10,
        }}
      />
    </div>
  );
}
