"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getWarehouseById, getCustomerInWarehouse,getRouteInWarehouse ,getVehicleInWarehouse,getSalesmanInWarehouse} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";
import TabBtn from "@/app/components/tabBtn";
import Map from "@/app/components/map";
import Table, { configType, TableDataType } from "@/app/components/customTable";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

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
    get_company: {
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
    const { customerSubCategoryOptions, channelOptions, warehouseOptions, routeOptions } = useAllDropdownListData();
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
    const [warehouseId, setWarehouseId] = useState<string>("");
    const [channelId, setChannelId] = useState<string>("");
    const [routeId, setRouteId] = useState<string>("");
    const [warehouseRoutes, setWarehouseRoutes] = useState<TableDataType[]>([]);
    const [warehouseVehicle, setWarehouseVehicle] = useState<TableDataType[]>([]);
    const [warehouseSalesman, setWarehouseSalesman] = useState<TableDataType[]>([]);
    const [warehouseCustomer, setWarehouseCustomer] = useState<TableDataType[]>([]);
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
        { key: "route", label: "Route" },
        { key: "vehicle", label: "Vechile" },
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

                try {
                    const cRes = await getCustomerInWarehouse(id);
                    const rRes = await getRouteInWarehouse(id);
                    const vRes = await getVehicleInWarehouse(id);
                    const sRes = await getSalesmanInWarehouse(id);
                    if (rRes && !rRes.error) {
                        setWarehouseRoutes(rRes?.data);
                        setWarehouseVehicle(vRes?.data);
                        setWarehouseSalesman(sRes?.data);
                        setWarehouseCustomer(cRes?.data);
                    } else {
                        if (rRes?.data?.message) showSnackbar(rRes.data.message, "error");
                        setWarehouseRoutes([]);
                        setWarehouseVehicle([]);
                        setWarehouseSalesman([]);
                        setWarehouseCustomer([]);
                    }
                } catch (err) {
                    console.error("Failed to fetch routes for warehouse", err);
                    setWarehouseRoutes([]);
                    setWarehouseVehicle([]);
                    setWarehouseCustomer([]);
                    setWarehouseSalesman([]);
                }
            }
        };
        fetchPlanogramImageDetails();
    }, [id]);


    const routeColumns: configType["columns"] = [
        {
            key: "route_code",
            label: "Route Code",
            render: (data: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {data.route_code ? data.route_code : "-"}
                </span>
            ),
            showByDefault: true,
        },
        {
            key: "route_name",
            label: "Route Name",
            isSortable: true,
            render: (data: TableDataType) => (data.route_name ? data.route_name : "-"),
            showByDefault: true,
        },
        {
            key: "getrouteType",
            label: "Route Type",
            render: (data: TableDataType) => {
                const raw = (data.getrouteType as any) ?? null;
                let typeObj: any = null;
                if (!raw) return "-";
                if (typeof raw === "string") {
                    try {
                        typeObj = JSON.parse(raw);
                    } catch {
                        typeObj = null;
                    }
                } else {
                    typeObj = raw;
                }
                return typeObj?.name ? typeObj.name : "-";
            },
            width: 218,
            showByDefault: true,
        },
        {
            key: "vehicle",
            label: "Vehicle",
            render: (data: TableDataType) => {
                const v = (data.vehicle as any) ?? null;
                let vehicleObj: any = null;
                if (!v) return "-";
                if (typeof v === "string") {
                    try {
                        vehicleObj = JSON.parse(v);
                    } catch {
                        vehicleObj = null;
                    }
                } else {
                    vehicleObj = v;
                }
                return vehicleObj?.code ? vehicleObj.code : "-";
            },
            showByDefault: true,
        },
        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={row.status && row.status.toString() === "1" ? true : false} />
            ),
            showByDefault: true,
        },
    ];
    const vehicleColumns: configType["columns"] = [
        { key: "vehicle_code", label: "Vehicle Code", render: (row: TableDataType) => (<span className="font-semibold text-[#181D27] text-[14px]">{row.vehicle_code || "-"}</span>) },
         { key: "number_plat", label: "Number Plate", render: (row: TableDataType) => row.number_plat || "-" },
         { key: "vehicle_chesis_no", label: "Chassis Number", render: (row: TableDataType) => row.vehicle_chesis_no || "-" },
         { key: "vehicle_brand", label: "Brand", render: (row: TableDataType) => row.vehicle_brand || "-" },
         { key: "opening_odometer", label: "Odo Meter", render: (row: TableDataType) => row.opening_odometer || "-" },
         {
           key: "vehicle_type",
           label: "Vehicle Type",
           render: (row: TableDataType) => {
             const value = row.vehicle_type;
             if (value == null || value === "") return "-";
             const strValue = String(value);
             if (strValue === "1") return "Truck";
             if (strValue === "2") return "Van";
             if (strValue === "3") return "Bike";
             if (strValue === "4") return "Tuktuk";
             return strValue;
           },
         },
         { key: "capacity", label: "Capacity", render: (row: TableDataType) => row.capacity || "-" },
         {
           key: "owner_type",
           label: "Owner Type",
           render: (row: TableDataType) => {
             const value = row.owner_type;
             if (value == null || value === "") return "-";
             const strValue = String(value);
             if (strValue === "0") return "Company Owned";
             if (strValue === "1") return "Contractor";
             return strValue;
           },
         },
         { key: "description", label: "Description", render: (row: TableDataType) => row.description || "-" },
         { key: "valid_from", label: "Valid From", render: (row: TableDataType) => row.valid_from || "-" },
         { key: "valid_to", label: "Valid To", render: (row: TableDataType) => row.valid_to || "-" },
         {
           key: "status",
           label: "Status",
           render: (row: TableDataType) => (
             <StatusBtn isActive={String(row.status) === "1"} />
           ),
         },
    ];
    const salesmanColumns: configType["columns"] = [
         {
           key: "osa_code",
           label: "Salesman Code",
           render: (row: TableDataType) => (
             <span className="font-semibold text-[#181D27] text-[14px]">
               {row.osa_code}
             </span>
           ),
         },
         { key: "name", label: "Salesman Name" },
         {
           key: "salesman_type",
           label: "Salesman Type",
           render: (row: TableDataType) => {
             const obj =
               typeof row.salesman_type === "string"
                 ? JSON.parse(row.salesman_type)
                 : row.salesman_type;
             return obj?.salesman_type_name || "-";
           },
         },
       
         { key: "designation", label: "Designation" },
           {
               key: "route",
               label: "Route",
               render: (row: TableDataType) => {
                   if (
                       typeof row.route === "object" &&
                       row.route !== null &&
                       "route_name" in row.route
                   ) {
                       return (row.route as { route_name?: string }).route_name || "-";
                   }
                   return typeof row.route === 'string' ? row.route : "-";
               },
               filter: {
                   isFilterable: true,
                   width: 320,
                   options: Array.isArray(routeOptions) ? routeOptions : [],
                   onSelect: (selected: string | string[]) => {
                       setRouteId((prev) => prev === selected ? "" : (selected as string));
                   },
                   selectedValue: routeId,
               },
              
               showByDefault: true,
           },
         { key: "contact_no", label: "Contact No" },
       
         {
           key: "status",
           label: "Status",
           render: (row: TableDataType) => (
             <StatusBtn isActive={String(row.status) === "1"} />
           ),
         },
    ];
    const columns: configType["columns"] = [
        {
               key: "osa_code",
               label: "OSA Code",
               render: (row: TableDataType) => (
                   <span className="font-semibold text-[#181D27] text-[14px]">
                       {row.osa_code || "-"}
                   </span>
               ),
               showByDefault: true,
           },
           { key: "outlet_name", label: "Outlet Name", showByDefault: true },
           { key: "owner_name", label: "Owner Name" },
           {
               key: "customer_type",
               label: "Customer Type",
               render: (row: TableDataType) => {
                   if (
                       typeof row.customer_type === "object" &&
                       row.customer_type !== null &&
                       "name" in row.customer_type
                   ) {
                       return (row.customer_type as { name?: string }).name || "-";
                   }
                   return row.customer_type || "-";
               },
           },
           {
               key: "category",
               label: "Customer Category",
               render: (row: TableDataType) =>
                   typeof row.category === "object" &&
                   row.category !== null &&
                   "customer_category_name" in row.category
                       ? (row.category as { customer_category_name?: string })
                             .customer_category_name || "-"
                       : "-",
           },
           {
               key: "subcategory",
               label: "Customer Sub Category",
               render: (row: TableDataType) =>
                   typeof row.subcategory === "object" &&
                   row.subcategory !== null &&
                   "customer_sub_category_name" in row.subcategory
                       ? (row.subcategory as { customer_sub_category_name?: string })
                             .customer_sub_category_name || "-"
                       : "-",
               filter: {
                   isFilterable: true,
                   width: 320,
                   options: Array.isArray(customerSubCategoryOptions) ? customerSubCategoryOptions : [], // [{ value, label }]
                   onSelect: (selected) => {
                       setSelectedSubCategoryId((prev) => prev === selected ? "" : (selected as string));
                   },
                   selectedValue: selectedSubCategoryId,
               },
               showByDefault: true,
           },
           {
               key: "outlet_channel",
               label: "Outlet Channel",
               render: (row: TableDataType) =>
                   typeof row.outlet_channel === "object" &&
                   row.outlet_channel !== null &&
                   "outlet_channel" in row.outlet_channel
                       ? (row.outlet_channel as { outlet_channel?: string })
                             .outlet_channel || "-"
                       : "-",
                       filter: {
                           isFilterable: true,
                           width: 320,
                           options: Array.isArray(channelOptions) ? channelOptions : [], // [{ value, label }]
                           onSelect: (selected) => {
                               setChannelId((prev) => prev === selected ? "" : (selected as string));
                           },
                           selectedValue: channelId,
                       },
               
               showByDefault: true,
           },
           { key: "landmark", label: "Landmark" },
           { key: "district", label: "District" },
           { key: "street", label: "Street" },
           { key: "town", label: "Town" },
           {
               key: "route",
               label: "Route",
               render: (row: TableDataType) => {
                   if (
                       typeof row.route === "object" &&
                       row.route !== null &&
                       "route_name" in row.route
                   ) {
                       return (row.route as { route_name?: string }).route_name || "-";
                   }
                   return typeof row.route === 'string' ? row.route : "-";
               },
               filter: {
                   isFilterable: true,
                   width: 320,
                   options: Array.isArray(routeOptions) ? routeOptions : [],
                   onSelect: (selected) => {
                       setRouteId((prev) => prev === selected ? "" : (selected as string));
                   },
                   selectedValue: routeId,
               },
              
               showByDefault: true,
           },
           { key: "contact_no", label: "Contact No." },
           { key: "whatsapp_no", label: "Whatsapp No." },
           { key: "buyertype", label: "Buyer Type", render: (row: TableDataType) => (row.buyertype === "0" ? "B2B" : "B2C") },
           { key: "payment_type", label: "Payment Type" },
           {
               key: "status",
               label: "Status",
               render: (row: TableDataType) => {
                   // Treat status 1 or 'active' (case-insensitive) as active
                   const isActive =
                       String(row.status) === "1" ||
                       (typeof row.status === "string" &&
                           row.status.toLowerCase() === "active");
                   return <StatusBtn isActive={isActive} />;
               },
               showByDefault: true,
           },
    ];


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
                                                    if (strValue === "agent_customer") return "Hariss";
                                                    if (strValue === "company_outlet") return "Outlet";
                                                    if (strValue === "0") return "Hariss";
                                                    if (strValue === "1") return "Outlet";
                                                    return strValue || "-";
                                                })(),
                                            },
                                            { key: "TIN No.", value: item?.tin_no || '-' },
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
                                            { key: "Warehouse Manager Name", value: item?.warehouse_manager || '-' },

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
                                                value: item?.area?.area_name || "-"
                                            },
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
                                            {
                                                key: "Is Ifris", value: (() => {
                                                    const value = item?.is_efris;
                                                    const strValue = value != null ? String(value) : "";
                                                    if (strValue === "0") return "Disable";
                                                    if (strValue === "1") return "Enable";
                                                    return strValue || "-";
                                                })()
                                            },
                                            {
                                                key: "Is Branch", value: (() => {
                                                    const value = item?.is_branch;
                                                    if (typeof value === "boolean") return value ? "Yes" : "No";
                                                    const strValue = String(value);
                                                    if (strValue === "1" || strValue === "true") return "Yes";
                                                    if (strValue === "0" || strValue === "false") return "No";
                                                    return value != null ? strValue : "-";
                                                })()
                                            },
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
                    {warehouseRoutes.length > 0 ? (
                        <div className="flex flex-col h-full">
                            <Table
                                data={warehouseCustomer}
                                config={{
                                    header: {
                                        title: "Customer",
                                        searchBar: false,
                                        columnFilter: true,
                                    },
                                    footer: { nextPrevBtn: true, pagination: true },
                                    columns: columns,
                                    rowSelection: false,
                                    pageSize: 50,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                            No Data Found
                        </div>
                    )}
                </ContainerCard>
            )}
            {activeTab === "warehouseStock" && (
                <ContainerCard >

                    <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                        No Data Found
                    </div>
                </ContainerCard>
            )}
            {activeTab === "route" && (
                <ContainerCard >
                    {warehouseRoutes.length > 0 ? (
                        <div className="flex flex-col h-full">
                            <Table
                                data={warehouseRoutes}
                                config={{
                                    header: {
                                        title: "Route",
                                        searchBar: false,
                                        columnFilter: true,
                                    },
                                    localStorageKey: "warehouse-route-table",
                                    footer: { nextPrevBtn: true, pagination: true },
                                    columns: routeColumns,
                                    rowSelection: false,
                                    pageSize: 50,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                            No Data Found
                        </div>
                    )}
                </ContainerCard>
            )}
            {activeTab === "vehicle" && (
                <ContainerCard >
                    {warehouseRoutes.length > 0 ? (
                        <div className="flex flex-col h-full">
                            <Table
                                data={warehouseVehicle}
                                config={{
                                    header: {
                                        title: "Vehicle",
                                        searchBar: false,
                                        columnFilter: true,
                                    },
                                    footer: { nextPrevBtn: true, pagination: true },
                                    columns: vehicleColumns,
                                    rowSelection: false,
                                    pageSize: 50,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                            No Data Found
                        </div>
                    )}
                </ContainerCard>
            )}
            {activeTab === "salesman" && (
               <ContainerCard >
                    {warehouseRoutes.length > 0 ? (
                        <div className="flex flex-col h-full">
                            <Table
                                data={warehouseSalesman}
                                config={{
                                    header: {
                                        title: "Salesman",
                                        searchBar: false,
                                        columnFilter: true,
                                    },
                                    footer: { nextPrevBtn: true, pagination: true },
                                    columns: salesmanColumns,
                                    rowSelection: false,
                                    pageSize: 50,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-[18px] mt-4 text-center items-center font-semibold mb-[25px]">
                            No Data Found
                        </div>
                    )}
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
