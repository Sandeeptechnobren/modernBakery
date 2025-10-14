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
           
           
            <div className="m-auto">
                <div className="flex flex-wrap gap-x-[20px]">
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
                                    {item?.warehouse_name}
                                </h2>
                                <span className="flex items-center">
                                    <span className="text-[#414651] text-[16px]">
                                        <span className="font-[600]">Warehouse Code:</span>{" "}
                                        <span className="font-[400]">
                                            {item?.warehouse_code || "-"}
                                        </span>
                                    </span>
                                </span>
                            </div>
                        </div>
                        <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                            <StatusBtn isActive={item?.status === 1 || item?.status === '1'} />
                        </span>
                    </ContainerCard>
                     <div className="mb-4">
                {/* <WarehouseTabs /> */}
            </div>
                    <div className="flex flex-col gap-6 w-full md:flex-row md:gap-6">
                        <div className="flex-1 w-full">
                            <ContainerCard className="w-full h-full">
                                <KeyValueData
                                    title="Warehouse Info"
                                    data={[
                                        // { key: <span className="font-bold">Registration No.</span>, value: item?.tin_no || '-'},
                                        // { key: <span className="font-bold">TIN No.</span>, value: item?.registation_no || '-'},
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
                                        <div className="flex items-center gap-[8px] text-[16px]">
                                            <Icon
                                                icon="lucide:map-pin"
                                                width={16}
                                                className="text-[#EA0A2A]"
                                            />
                                            <span>{item?.location}</span>
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
                                        { key: "Region Code", value: item?.region?.region_code || "-" },
                                        {
                                            key: "Region Name",
                                            value: item?.region?.region_name || "-",
                                        },
                                        { key: "Sub Region Code", value: item?.area?.area_code || "-" },
                                        {
                                            key: "Sub Region Name",
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
                                    <div className="mt-6">
                                        <div className="text-[18px] mb-2 font-semibold">Map Location</div>
                                        <iframe
                                            title="Warehouse Location"
                                            width="100%"
                                            height="300"
                                            style={{ border: 0, borderRadius: '8px' }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={`https://www.google.com/maps?q=${item.latitude},${item.longitude}&hl=es;z=14&output=embed`}
                                        />
                                    </div>
                                )}
                            </ContainerCard>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


