"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getWarehouseById } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";
import TabBtn from "@/app/components/tabBtn";
import Map from "@/app/components/map";

interface Item {
    id: string;
    sap_id: string;
    warehouse_name: string;
    owner_name: string;
    owner_number: string;
    owner_email: string;
    warehouse_manager_contact: string;
    warehouse_manager: string;
    tin_no: string;
    registation_no: string;
    business_type: string;
    warehouse_type: string;
    city: string;
    location: string;
    get_company:{
        company_code: string;
        company_name: string;
    }
    address: string;
    stock_capital: string;
    deposite_amount: string;
    district: string;
    town_village: string;
    street: string;
    landmark: string;
    latitude: string;
    longitude: string;
    threshold_radius: string;
    device_no: string;
    p12_file: string;
    is_efris: string;
    is_branch: string;
    password: string;
    invoice_sync: string;
    branch_id: string;
    warehouse_code: string;
    region: { region_code: string, region_name: string };
    area: { area_code: string, area_name: string };
    created_by: { firstname: string, lastname: string };
    status: number | string;
}

const title = "Warehouse Details";
const backBtnUrl = "/warehouse";

export default function ViewPage() {
    const params = useParams();
    let id: string = "";
    if (params.id) {
        if (Array.isArray(params.id)) {
            id = params.id[0] || "";
        } else {
            id = params.id as string;
        }
    }

    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [item, setItem] = useState<Item | null>(null);
  const onTabClick = (idx: number) => {
    // ensure index is within range and set the corresponding tab key
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };
      const [activeTab, setActiveTab] = useState("overview");
  const tabList = [
    { key: "overview", label: "Overview" },
    { key: "warehouseCustomer", label: "Warehouse Customer" },
    { key: "warehouseStock", label: "Warehouse Stock" },
    { key: "rout&vehicle", label: "Route & Vechile" },
    { key: "salesman", label: "Salesman" },
    { key: "sales", label: "Sales" },
    { key: "return", label: "Return" },
  ];

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await getWarehouseById(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Warehouse Details",
                    "error"
                );
                throw new Error("Unable to fetch Warehouse Details");
            } else {
                setItem(res.data);
            }
        };
        fetchPlanogramImageDetails();
    }, []);

   


    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
            <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                            <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                                <Icon
                                    icon="tabler:building-warehouse"
                                    width={40}
                                    className="text-[#535862] scale-[1.5]"
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                    {item?.warehouse_code || "-"} - {item?.warehouse_name} 
                                </h2>
                               
                            </div>
                        </div>
                        <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                            <StatusBtn isActive={item?.status === 1 || item?.status === '1'} />
                        </span>
                    </ContainerCard>
                     <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
                                            {tabList.map((tab, index) => (
                                              <div key={index}>
                                                <TabBtn
                                                  label={tab.label}
                                                  isActive={activeTab === tab.key}
                                                  onClick={() => onTabClick(index)}
                                                />
                                              </div>
                                            ))}
                                          </ContainerCard>
           
            {activeTab === "overview" && (
            <div className="m-auto">
                <div className="flex flex-wrap gap-x-[20px]">
                    {/* <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
                        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
                            <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
                                <Icon
                                    icon="tabler:building-warehouse"
                                    width={40}
                                    className="text-[#535862] scale-[1.5]"
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
                                    {item?.warehouse_code || "-"} - {item?.warehouse_name} 
                                </h2>
                               
                            </div>
                        </div>
                        <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                            <StatusBtn isActive={item?.status === 1 || item?.status === '1'} />
                        </span>
                    </ContainerCard>
                     <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
                                            {tabList.map((tab, index) => (
                                              <div key={index}>
                                                <TabBtn
                                                  label={tab.label}
                                                  isActive={activeTab === tab.key}
                                                  onClick={() => onTabClick(index)}
                                                />
                                              </div>
                                            ))}
                                          </ContainerCard> */}
                     <div className="mb-4">
            </div>
                    <div className="flex flex-col gap-6 w-full md:flex-row md:gap-6">
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Warehouse Info"
                                    data={[
                                        {
                                                                                        key: "Warehouse Type",
                                                                                        value: (() => {
                                                                                                const value = item?.warehouse_type;
                                                                                                const strValue = value != null ? String(value).toLowerCase() : "";
                                                                                                // prefer semantic values if present
                                                                                                if (strValue === "agent_customer") return "Hariss";
                                                                                                if (strValue === "company_outlet") return "Outlet";
                                                                                                // fallback to numeric codes for backward compatibility
                                                                                                if (strValue === "0") return "Hariss";
                                                                                                if (strValue === "1") return "Outlet";
                                                                                                return strValue || "-";
                                                                                        })(),
                                                                                },
                                        // { key: <span className="font-bold">Registration No.</span>, value: item?.tin_no || '-'},
                                        { key: "TIN No.", value: item?.tin_no || '-'},
                                        // { key: <span className="font-bold">Device No.</span>, value: item?.device_no || '-'},
                                        {
                                            key: "Owner Name",
                                            value: item?.owner_name || "-",
                                        },
                                        {
                                            key: "Comapny Code",
                                            value: item?.get_company?.company_code || "-",
                                        },
                                        {
                                            key: "Company Name",
                                            value: item?.get_company?.company_name || "-",
                                        },
                                        { key: "Warehouse Manager Name", value:item?.warehouse_manager || '-' },
                                                                                
                                    ]}
                                />
                                <hr className="text-[#D5D7DA] my-[25px]" />
                                <div>
                                    <div className="text-[18px] mb-[25px] font-semibold">
                                        Contact
                                    </div>
                                    <div className="flex flex-col gap-[20px] text-[#414651]">
                                        <div className="flex items-center gap-[8px] text-[16px]">
                                            <Icon
                                                icon="lucide:phone-call"
                                                width={16}
                                                className="text-[#EA0A2A]"
                                            />
                                            <span>{item?.owner_number} / {item?.warehouse_manager_contact}</span>
                                        </div>
                                        <div className="flex items-center gap-[8px] text-[16px]">
                                            <Icon
                                                icon="ic:outline-email"
                                                width={16}
                                                className="text-[#EA0A2A]"
                                            />
                                            <span>{item?.owner_email}</span>
                                        </div>
                                       
                                    </div>
                                </div>
                            </ContainerCard>
                        </div>
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Location Information"
                                    data={[
                                        {
                                            key: "Region Name",
                                            value: item?.region?.region_name || "-",
                                        },
                                        {
                                            key: "Area Name",
                                            value: item?.area?.area_name || "-" },
                                        { key: "Location", value: item?.location || "-" },
                                        { key: "City", value: item?.city || "-" },
                                        { key: "Town Village", value: item?.town_village || "-" },
                                        { key: "Street", value: item?.street || "-" },
                                        { key: "Landmark", value: item?.landmark || "-" },
                                    ]}
                                />
                                {/* Map Display */}
                               
                            </ContainerCard>
                        </div>
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Additional Information"
                                    data={[
                                       
                                        
                                        // { key: "Invoice Sync", value: item?.invoice_sync || "-" },
                                        { key: "Is Ifris", value: (() => {
    const value = item?.is_efris;
    const strValue = value != null ? String(value) : "";
    if (strValue === "0") return "Disable";
    if (strValue === "1") return "Enable";
    return strValue || "-";
  })()},
                                                                                                                        { key: "Is Branch", value: (() => {
                                                const value = item?.is_branch;
                                                if (typeof value === "boolean") return value ? "Yes" : "No";
                                                const strValue = String(value);
                                                if (strValue === "1" || strValue === "true") return "Yes";
                                                if (strValue === "0" || strValue === "false") return "No";
                                                return value != null ? strValue : "-";
                                            })()},
                                        // { key: "Branch Id", value: item?.branch_id || "-" },
                                        
                                    ]}
                                />
                                 {item?.latitude && item?.longitude && (
                                    <Map latitude={item.latitude} longitude={item.longitude} title="Warehouse Location" />
                                )}
                            </ContainerCard>
                        </div>
                    </div>
                </div>
            </div>
            )}
               {activeTab === "warehouseCustomer" && (
             <ContainerCard >
                 
                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                        </div>
                </ContainerCard>
          )}
          {activeTab === "warehouseStock" && (
           <ContainerCard >
                 
                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                        </div>
                </ContainerCard>
          )}
          {activeTab === "route&vehicle" && (
             <ContainerCard >
                 
                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                        </div>
                </ContainerCard>
          )}
          {activeTab === "salesman" && (
            <ContainerCard >
                 
                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                        </div>
                </ContainerCard>
          )}
          {activeTab === "sales" && (
            <ContainerCard >
                 
                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                        </div>
                </ContainerCard>
          )}
          {activeTab === "return" && (
            <ContainerCard >
                 
                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                        </div>
                </ContainerCard>
          )}
        </>
    );
}

