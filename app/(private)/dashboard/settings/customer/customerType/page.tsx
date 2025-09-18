"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { customerTypeList } from "@/app/services/allApi";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";

interface CustomerType {
  id: string;
  code: string;
  name: string;
  status: string;
  [key: string]: string; 
}

interface DropdownItem {
  icon: string;
  label: string;
  iconWidth: number;
}

const mockCustomer: CustomerType[] = new Array(10).fill(null).map((_, i) => ({
  id: (i + 1).toString(),
  code: `AC00016${i + 1}`,
  name: `Abdul Retail Shop ${i + 1}`,
  status: "Active",
}));

const dropdownDataList: DropdownItem[] = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
];

export default function Customer() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const listRes = await customerTypeList();
      console.log("API Response ✅", listRes);

      const formatted: CustomerType[] = (listRes.data || []).map((c: CustomerType) => ({
  ...c,
  status: c.status === "active" ? "Active" : "Inactive", 
}));

      setCustomers(formatted);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      setCustomers(mockCustomer);
    } finally {
      setLoading(false);
    }
  };

  fetchCustomers();
}, []);


  return loading ? (
    <Loading />
  ) : (
    <>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27] h-[30px] flex items-center leading-[30px] mb-[1px]">
          Customer Type
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
          data={customers}
          config={{
            header: {
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key={0}
                  href="/dashboard/settings/customer/customerType/add"
                  isActive
                  leadingIcon="lucide:plus"
                  label="Add Customer Type"
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
                onClick: () =>
                  confirm("Are you sure you want to delete this customer?"),
              },
            ],
          }}
        />
      </div>
    </>
  );
}
