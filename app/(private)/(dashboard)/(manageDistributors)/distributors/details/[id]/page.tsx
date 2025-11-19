"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { getWarehouseById, getCustomerInWarehouse, getRouteInWarehouse, getVehicleInWarehouse, getSalesmanInWarehouse, getStockOfWarehouse, warehouseReturn, warehouseSales, downloadFile } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";
import TabBtn from "@/app/components/tabBtn";
import Map from "@/app/components/map";
import toInternationalNumber, { FormatNumberOptions } from "@/app/(private)/utils/formatNumber";
import Table, { configType, listReturnType, searchReturnType, TableDataType } from "@/app/components/customTable";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { formatWithPattern } from "@/app/utils/formatDate";
import Drawer from "@mui/material/Drawer";
import { exportInvoice, getAgentCustomerBySalesId } from "@/app/services/agentTransaction";
import Skeleton from "@mui/material/Skeleton";
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
    location_relation: {
        code: string;
        name: string;
    }
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

const title = "Distributors Details";
const backBtnUrl = "/distributors";

export default function ViewPage() {
    const { customerSubCategoryOptions, channelOptions, warehouseOptions, routeOptions } = useAllDropdownListData();
    const [routeId, setRouteId] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [open, setOpen] = useState(false);
    const [UUIDAgentCustomer, setUUIDAgentCustomer] = useState<string>("");

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
    const [warehouseId, setWarehouseId] = useState("");
    const onTabClick = async (idx: number) => {
        // ensure index is within range and set the corresponding tab key
        if (typeof idx !== "number") return;
        if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
        setActiveTab(tabList[idx].key);

        // if (tabList[idx].key == "warehouseCustomer") {
        //     setNestedLoading(true)
        //     const cRes = await getCustomerInWarehouse(id);
        //     if (cRes && !cRes.error) {
        //         setWarehouseCustomer(cRes?.data);
        //         setNestedLoading(false)
        //     }
        //     else {
        //         setWarehouseCustomer([])
        //     }

        // }
        // else if (tabList[idx].key == "route") {
        //     setNestedLoading(true)

        //     const rRes = await getRouteInWarehouse(id);

        //     if (rRes && !rRes.error) {
        //         setWarehouseRoutes(rRes?.data);
        //         setNestedLoading(false)

        //     }
        //     else {
        //         setWarehouseRoutes([]);
        //     }
        // }

        // else if (tabList[idx].key == "salesman") {
        //     setNestedLoading(true)

        //     const sRes = await getSalesmanInWarehouse(id);
        //     if (sRes && !sRes.error) {
        //         setWarehouseSalesman(sRes?.data);
        //         setNestedLoading(false)

        //     }
        //     else {
        //         setWarehouseSalesman([]);
        //     }
        // }
    };
    const [activeTab, setActiveTab] = useState("overview");
    const tabList = [
        { key: "overview", label: "Overview" },
        { key: "warehouseCustomer", label: "Distributor Customers" },
        { key: "warehouseStock", label: "Distributor Stock" },
        { key: "route", label: "Route" },
        // { key: "vehicle", label: "Vehicle" },
        { key: "salesman", label: "Sales Team" },
        { key: "sales", label: "Sales" },
        { key: "return", label: "Market Return" },
    ];

    useEffect(() => {
        const fetchPlanogramImageDetails = async () => {
            setLoading(true);
            const res = await getWarehouseById(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data.message || "Unable to fetch Distributor Details",
                    "error"
                );
                throw new Error("Unable to fetch Distributor Details");
            } else {
                setItem(res.data);
                // store id as a string so it can be passed to APIs that expect string identifiers
                setWarehouseId(String(res.data.id));

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
            // isSortable: true,
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
                <StatusBtn isActive={row.status && row.status.toString() === "0" ? false : true} />
            ),
            showByDefault: true,
        },
    ];

    

    const salesColumns: configType["columns"] = [
        {
            key: "invoice_code",
            label: "Invoice Number",
            render: (data: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {data.invoice_code ? data.invoice_code : "-"}
                </span>
            ),
            showByDefault: true,
        },
        {
            key: "invoice_date",
            label: "Invoice Date",
            // isSortable: true,
            render: (data: TableDataType) => data.invoice_date ? formatWithPattern(new Date(data.invoice_date), "DD MMM YYYY", 'en-GB').toLowerCase() : "-",
            showByDefault: true,
        },
        {
            key: "invoice_time",
            label: "Invoice Time",
            // isSortable: true,
            render: (data: TableDataType) => (data.invoice_time ? data.invoice_time : "-"),
            showByDefault: true,
        },
        {
            key: "route_code",
            label: "Route",
            render: (row: TableDataType) => {
                const code = row.route_code || "-";
                const name = row.route_name || "-";
                return `${code}${code && name ? " - " : "-"}${name}`;
            },

            showByDefault: true,
        },
        {
            key: "customer_code",
            label: "Customer",
            render: (row: TableDataType) => {
                const code = row.customer_code || "-";
                const name = row.customer_name || "-";
                return `${code}${code && name ? " - " : "-"}${name}`;
            },
            showByDefault: true,
        },
        {
            key: "salesman_code",
            label: "Sales Team",
            render: (row: TableDataType) => {
                const code = row.salesman_code || "-";
                const name = row.salesman_name || "-";
                return `${code}${code && name ? " - " : "-"}${name}`;
            },
            showByDefault: true,
        },
        {
            key: "total_amount",
            label: "Amount",
            render: (row: TableDataType) => {
                // row.total_amount may be string or number; toInternationalNumber handles both
                return toInternationalNumber(row.total_amount, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                } as FormatNumberOptions);
            },

            showByDefault: true,
        },


    ];
    const returnColumns: configType["columns"] = [
        {
            key: "osa_code",
            label: "Code",
            render: (data: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {data.osa_code ? data.osa_code : "-"}
                </span>
            ),
            showByDefault: true,
        },
        {
            key: "return_date",
            label: "Return Date",
            // isSortable: true,
            render: (data: TableDataType) => (data.return_date ? data.return_date : "-"),
            showByDefault: true,
        },
        // {
        //     key: "order_code",
        //     label: "Order Code",
        //     render: (data: TableDataType) => (
        //         <span className="font-semibold text-[#181D27] text-[14px]">
        //             {data.order_code ? data.order_code : "-"}
        //         </span>
        //     ),
        //     showByDefault: true,
        // },
        // {
        //     key: "delivery_code",
        //     label: "Delivery Code",
        //     render: (data: TableDataType) => (
        //         <span className="font-semibold text-[#181D27] text-[14px]">
        //             {data.delivery_code ? data.delivery_code : "-"}
        //         </span>
        //     ),
        //     showByDefault: true,
        // },

        {
            key: "route_code",
            label: "Route",
            render: (row: TableDataType) => {
                const code = row.route_code || "-";
                const name = row.route_name || "-";
                return `${code}${code && name ? " - " : "-"}${name}`;
            },
            showByDefault: true,
        },
        {
            key: "customer_code",
            label: "Customer",
            render: (row: TableDataType) => {
                const code = row.customer_code || "-";
                const name = row.customer_name || "-";
                return `${code}${code && name ? " - " : "-"}${name}`;
            },
            showByDefault: true,
        },
        {
            key: "salesman_code",
            label: "Sales Team",
            render: (row: TableDataType) => {
                const code = row.salesman_code || "-";
                const name = row.salesman_name || "-";
                return `${code}${code && name ? " - " : "-"}${name}`;
            },
            showByDefault: true,
        },
        {
            key: "total",
            label: "Amount",
            render: (row: TableDataType) => {
                // row.total_amount may be string or number; toInternationalNumber handles both
                return toInternationalNumber(row.total, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                } as FormatNumberOptions);
            },

            showByDefault: true,
        },

        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={row.status && row.status.toString() === "0" ? false : true} />
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
            label: "Sales Team",
            render: (row: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.osa_code} - {row.name}
                </span>
            ),
            showByDefault: true,
        },
        {
            key: "salesman_type",
            label: "Sales Team Type",
            render: (row: TableDataType) => {
                const obj =
                    typeof row.salesman_type === "string"
                        ? JSON.parse(row.salesman_type)
                        : row.salesman_type;
                return obj?.salesman_type_name || "-";
            },
            showByDefault: true,
        },

        // { key: "designation", label: "Designation", showByDefault: true, },
        {
            key: "route",
            label: "Route",
            render: (row: TableDataType) => {
                const route = row.route;
                if (typeof route === "object" && route !== null) {
                    const code = (route as any).route_code || "-";
                    const name = (route as any).route_name || "-";
                    return `${code}${code && name ? " - " : "-"}${name}`;
                }
                return typeof route === "string" && route ? route : "-";
            },

            showByDefault: true,
        },
        { key: "contact_no", label: "Contact No", showByDefault: true, },

        {
            key: "status",
            label: "Status",
            render: (row: TableDataType) => (
                <StatusBtn isActive={String(row.status) === "1"} />
            ),
            showByDefault: true,
        },
    ];

    const stockColumns: configType["columns"] = [
        {
            key: "osa_code",
            label: "OSA Code",
            render: (row: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.osa_code || "-"}
                </span>
            ),
            // showByDefault: true,
        },
        {
            key: "item",
            label: "Item",
            render: (row: TableDataType) => {
                if (
                    typeof row.item === "object" &&
                    row.item !== null &&
                    "name" in row.item
                ) {
                    const item = row.item as { name?: string; code?: string };
                    return (
                        <div>
                            <div className="font-medium text-[#181D27] text-[14px]">
                                {item.code} {item.code && item.name ? " - " : ""} {item.name || "-"}
                            </div>
                            {/* <div className="text-xs text-gray-500">{item.code || ""}</div> */}
                        </div>
                    );
                }
                return typeof row.item === "string" ? row.item : "-";
            },
            showByDefault: true,
        },
        {
            key: "qty",
            label: `Current Qty`,
            render: (row: TableDataType) => (
                <span className="text-[14px]">
                    {toInternationalNumber(row.qty, { maximumFractionDigits: 0 }) ?? "-"}
                </span>
            ),
            showByDefault: true,
            // isSortable: true,
        },
        {
            key: "incoming",
            label: "Incoming",
            render: (row: TableDataType) => (
                <span className="text-[14px]">
                    {getRandomNumber(100) ?? "-"}
                </span>
            ),
            showByDefault: true,
            // isSortable: true,
        },
        {
            key: "usage",
            label: "Usage",
            render: (row: TableDataType) => (
                <span className="text-[14px]">
                    {getRandomNumber(30) ?? "-"}
                </span>
            ),
            showByDefault: true,
            // isSortable: true,
        },

        {
            key: "ordersBy",
            label: "Orders By",
            render: (row: TableDataType) => (
                <span className="text-[14px]">
                    {getRandomDateFromLastMonth() ?? "-"}
                </span>
            ),
            showByDefault: true,
            // isSortable: true,
        }
    ];

    function getRandomDateFromLastMonth(): string {
        const now = new Date();

        // Go to previous month
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Total days in last month
        const daysInLastMonth = new Date(
            lastMonth.getFullYear(),
            lastMonth.getMonth() + 1,
            0
        ).getDate();

        // Generate random day
        const randomDay: number = Math.floor(Math.random() * daysInLastMonth) + 1;

        // Create random date
        const randomDate: Date = new Date(
            lastMonth.getFullYear(),
            lastMonth.getMonth(),
            randomDay
        );

        // Format like "11 Oct 2025"
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };

        const formattedDate: string = randomDate
            .toLocaleDateString("en-GB", options)
            .replace(",", "");

        // Extract individual parts
        const day: number = randomDate.getDate();
        const month: string = randomDate.toLocaleString("en-GB", { month: "short" });
        const year: number = randomDate.getFullYear();

        // Return everything in a single formatted string
        return `${formattedDate} `;
    }

    function getRandomNumber(count: number) {
        return Math.floor(Math.random() * count) + 1;
    }

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
        { key: "owner_name", label: "Owner Name", showByDefault: true, render: (row: TableDataType) => (<span className="hover:text-[#ea0a2a] cursor-pointer" onClick={() => { setOpen(true); setUUIDAgentCustomer(row.uuid || ""); }}>{row.owner_name || "-"}</span>) },
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
            //   showByDefault: true,
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
            // isSortable: true,
            showByDefault: true,
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
                const route = row.route;
                if (typeof route === "object" && route !== null) {
                    const code = (route as any).route_code || "-";
                    const name = (route as any).route_name || "-";
                    return `${code}${code && name ? " - " : "-"}${name}`;
                }
                return typeof route === "string" && route ? route : "-";
            },
            // isSortable: true,
            showByDefault: true,
        },
        { key: "contact_no", label: "Contact No.", showByDefault: true, },
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

    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number
        ): Promise<listReturnType> => {
            let result;
            setLoading(true);
            try {
                const params: Record<string, string> = { per_page: pageSize.toString() };
                Object.keys(payload || {}).forEach((k) => {
                    const v = payload[k as keyof typeof payload];
                    if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                        params[k] = String(v);
                    }
                });
                result = await warehouseSales(warehouseId, params);
            } finally {
                setLoading(false);
            }

            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination = result.pagination?.pagination || result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination.last_page || result.pagination?.totalPages || 1,
                    totalRecords: pagination.total || result.pagination?.totalRecords || 0,
                    currentPage: pagination.current_page || result.pagination?.currentPage || 1,
                    pageSize: pagination.per_page || pageSize,
                };
            }
        },
        [setLoading, warehouseId]
    );

    // const filterByListReturn = useCallback(
    //     async (
    //         payload: Record<string, string | number | null>,
    //         pageSize: number
    //     ): Promise<listReturnType> => {
    //         let result;
    //         setLoading(true);
    //         try {
    //             const params: Record<string, string> = { per_page: pageSize.toString() };
    //             Object.keys(payload || {}).forEach((k) => {
    //                 const v = payload[k as keyof typeof payload];
    //                 if (v !== null && typeof v !== "undefined" && String(v) !== "") {
    //                     params[k] = String(v);
    //                 }
    //             });
    //             // result = await warehouseReturn(warehouseId, params);
    //         } finally {
    //             setLoading(false);
    //         }

    //         // if (result?.error) throw new Error(result.data?.message || "Filter failed");
    //         // else {
    //         //     const pagination = result.pagination?.pagination || result.pagination || {};
    //         //     return {
    //         //         data: result.data || [],
    //         //         total: pagination.totalPages || result.pagination?.totalPages || 0,
    //         //         totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
    //         //         currentPage: pagination.current_page || result.pagination?.currentPage || 0,
    //         //         pageSize: pagination.limit || pageSize,
    //         //     };
    //         // }
    //     },
    //     [setLoading, warehouseId]
    // );

    const searchCustomerById = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 5,
            columnName?: string
        ): Promise<searchReturnType> => {
            const result = await getCustomerInWarehouse(warehouseId, {
                query: searchQuery,
                pageSize: pageSize.toString()
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const listCustomerById = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50
        ): Promise<searchReturnType> => {
            const result = await getCustomerInWarehouse(warehouseId, {
                page: pageNo.toString(),
                pageSize: pageSize.toString()
            });
            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const searchRouteByWarehouse = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 5,
            columnName?: string
        ): Promise<searchReturnType> => {
            const result = await getRouteInWarehouse(warehouseId, {
                query: searchQuery,
            });
            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const listRouteByWarehouse = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 5,
        ): Promise<searchReturnType> => {
            const result = await getRouteInWarehouse(warehouseId, {
                page: pageNo.toString(),
                pageSize: pageSize.toString()
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );
    // const listReturnByWarehouse = useCallback(
    //     async (
    //         pageNo: number = 1,
    //         pageSize: number = 50,
    //     ): Promise<searchReturnType> => {
    //         const result = await warehouseReturn(warehouseId, {
    //             per_page: pageSize.toString()
    //         });

    //         if (result.error) {
    //             throw new Error(result.data?.message || "Search failed");
    //         }

    //         return {
    //             data: result.data || [],
    //             currentPage: result?.pagination?.current_page || 1,
    //             pageSize: result?.pagination?.per_page || pageSize,
    //             total: result?.pagination?.last_page || 1,
    //         };
    //     },
    //     [warehouseId]
    // );
    const listSalesByWarehouse = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50,
        ): Promise<searchReturnType> => {
            const result = await warehouseSales(warehouseId, {
                page: pageNo.toString(),
                per_page: pageSize.toString()
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const listStockByWarehouse = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50,
        ): Promise<searchReturnType> => {
            const result = await getStockOfWarehouse(warehouseId, {
                page: pageNo.toString(),
                pageSize: pageSize.toString()
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const searchSalesmanByWarehouse = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 5,
            columnName?: string
        ): Promise<searchReturnType> => {
            const result = await getSalesmanInWarehouse(warehouseId, {
                query: searchQuery,
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );
    // const searchReturnByWarehouse = useCallback(
    //     async (
    //         searchQuery: string,
    //         pageSize: number = 5,
    //         columnName?: string
    //     ): Promise<searchReturnType> => {
    //         const result = await warehouseReturn(warehouseId, {
    //             warehouse_id: warehouseId,
    //             query: searchQuery,
    //         });

    //         if (result.error) {
    //             throw new Error(result.data?.message || "Search failed");
    //         }

    //         return {
    //             data: result.data || [],
    //             currentPage: result?.pagination?.current_page || 1,
    //             pageSize: result?.pagination?.per_page || pageSize,
    //             total: result?.pagination?.last_page || 1,
    //         };
    //     },
    //     [warehouseId]
    // );
    const searchSalesByWarehouse = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 5,
            columnName?: string,
            page: number = 1
        ): Promise<searchReturnType> => {
            const result = await warehouseSales(warehouseId, {
                warehouse_id: warehouseId,
                query: searchQuery,
                page: page.toString()
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const searchStockByWarehouse = useCallback(
        async (
            searchQuery: string,
            pageSize: number = 5,
            columnName?: string
        ): Promise<searchReturnType> => {
            const result = await getStockOfWarehouse(warehouseId, {
                query: searchQuery,
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const listSalesmanByWarehouse = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 5,
        ): Promise<searchReturnType> => {
            const result = await getSalesmanInWarehouse(warehouseId, {
                page: pageNo.toString(),
                pageSize: pageSize.toString()
            });

            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.current_page || 1,
                pageSize: result?.pagination?.per_page || pageSize,
                total: result?.pagination?.last_page || 1,
            };
        },
        [warehouseId]
    );

    const salesByAgentCustomer = useCallback(
        async (
            pageNo: number = 1,
            pageSize: number = 50,
            uuid: string
        ): Promise<searchReturnType> => {
            const result = await getAgentCustomerBySalesId(uuid, { from_date: "", to_date: "" });
            if (result.error) {
                throw new Error(result.data?.message || "Search failed");
            }

            return {
                data: result.data || [],
                currentPage: result?.pagination?.page || 1,
                pageSize: result?.pagination?.limit || pageSize,
                total: result?.pagination?.totalPages || 1,
            };
        },
        []
    );

    const filterBySales = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number,
            uuid: string
        ): Promise<listReturnType> => {
            let result;
            setLoading(true);
            try {
                const params: Record<string, string> = { per_page: pageSize.toString() };
                Object.keys(payload || {}).forEach((k) => {
                    const v = payload[k as keyof typeof payload];
                    if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                        params[k] = String(v);
                    }
                });
                result = await getAgentCustomerBySalesId(uuid, { from_date: params.start_date, to_date: params.end_date });
            } finally {
                setLoading(false);
            }

            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            else {
                const pagination = result.pagination?.pagination || result.pagination || {};
                return {
                    data: result.data || [],
                    total: pagination.totalPages || result.pagination?.totalPages || 0,
                    totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
                    currentPage: pagination.page || result.pagination?.currentPage || 0,
                    pageSize: pagination.limit || pageSize,
                };
            }
        },
        [setLoading]
    );

    const AgentCustomerSalesColumns: configType["columns"] = [
        { key: "invoice_date", label: "Date", render: (row: TableDataType) => formatWithPattern(new Date(row.invoice_date), "DD MMM YYYY", "en-GB") },
        { key: "invoice_time", label: "Time" },
        {
            key: "invoice_code",
            label: "Invoice Number"
        },
        {
            key: "salesman_name",
            label: "Salesman"
        },
        {
            key: "warehouse_name",
            label: "Warehouse"
        },
        {
            key: "route_name",
            label: "Route"
        },
        { key: "total_amount", label: "Invoice Total", render: (row: TableDataType) => toInternationalNumber(row.total_amount) },
        {
            key: "action", label: "Action", sticky: "right", render: (row: TableDataType) => {


                return (<IconComponentData2 row={row} />)
            }
        }

    ];

    const IconComponentData2 = ({ row }: { row: TableDataType }) => {
        const [smallLoading, setSmallLoading] = useState(false)
        const { showSnackbar } = useSnackbar();

        const exportOrderFile = async (uuid: string, format: string) => {
            try {
                setSmallLoading(true)
                const response = await exportInvoice({ uuid, format }); // send proper body object

                if (response && typeof response === "object" && response.download_url) {
                    await downloadFile(response.download_url);
                    showSnackbar("File downloaded successfully", "success");
                    setSmallLoading(false)


                } else {
                    showSnackbar("Failed to get download URL", "error");
                    setSmallLoading(false)

                }
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to download data", "error");
                setSmallLoading(false)

            }
        };
        return (smallLoading ? <Skeleton /> : <div className="cursor-pointer" onClick={() => {
            exportOrderFile(row.uuid, "pdf"); // or "excel", "csv" etc.

        }}><Icon icon="material-symbols:download" /></div>)
    }

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
                            {item?.warehouse_code || "-"} {item?.warehouse_code && item?.warehouse_name ? " - " : ""} {item?.warehouse_name}
                        </h2>
                        <span className="flex items-center text-[#414651] text-[16px] mb-[6px]">
                            <Icon
                                icon="mdi:location"
                                width={16}
                                className="text-[#EA0A2A] mr-[5px]"
                            />
                            <span>
                                {item?.location || "-"}
                            </span>
                            {/* <span className="flex justify-center p-[10px] sm:p-0 sm:inline-block mt-[10px] sm:mt-0 sm:ml-[10px]">
                                    <StatusBtn status="active" />
                                </span> */}
                        </span>
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
                                        title="Distributor Info"
                                        data={[
                                            {
                                                key: "Distributor Type",
                                                value: item?.warehouse_type || "Not available"
                                            },
                                            { key: "TIN No.", value: item?.tin_no || '-' },
                                            {
                                                key: "Owner Name",
                                                value: item?.owner_name || "-",
                                            },
                                            {
                                                key: "Company",
                                                value: `${item?.get_company?.company_code || "-"} - ${item?.get_company?.company_name || "-"}`
                                            },
                                            { key: "Distributor Manager Name", value: item?.warehouse_manager || '-' },

                                        ]}
                                    />
                                    <hr className="text-[#D5D7DA] my-[25px]" />
                                    <div>
                                        <div className="text-[18px] mb-[25px] font-semibold">
                                            Contact
                                        </div>
                                        <div className="flex flex-col gap-[20px] text-[#414651]">
                                            <div className="flex items-center gap-[8px] text-[16px]">
                                                {item?.owner_number ? <><Icon
                                                    icon="lucide:phone-call"
                                                    width={16}
                                                    className="text-[#EA0A2A]"
                                                />
                                                    <div>{item?.owner_number == '0' ? "" : item?.owner_number}</div>
                                                    <div>{item?.warehouse_manager_contact == '0' ? "" : item?.warehouse_manager_contact}</div></> : ""}
                                            </div>
                                            <div className="flex items-center gap-[8px] text-[16px]">
                                                {item?.owner_email ? <>
                                                    <Icon
                                                        icon="ic:outline-email"
                                                        width={16}
                                                        className="text-[#EA0A2A]"
                                                    />
                                                    <span>{item?.owner_email}</span></> : ""}
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
                                                key: "Is Efris", value: (() => {
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
                                        <Map latitude={item.latitude} longitude={item.longitude} title="Distributor Location" />
                                    )}
                                </ContainerCard>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {activeTab === "warehouseCustomer" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            api: {
                                search: searchCustomerById,
                                list: listCustomerById
                            },
                            header: {
                                searchBar: true
                            },
                            showNestedLoading: true,
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: columns,
                            rowSelection: false,
                            pageSize: 50,
                        }}
                    />
                    <Drawer anchor="right"  open={open} onClose={() => { setOpen(false) }} >
                        <div className="flex flex-col h-full w-[calc(100vw-100px)] lg:w-[600px] p-4">
                            <Table
                                config={{
                                    api: {
                                        list: (...args) => salesByAgentCustomer(...args, UUIDAgentCustomer),
                                        filterBy: (...args) => filterBySales(...args, UUIDAgentCustomer)
                                    },
                                    header: {
                                        filterByFields: [
                                            {
                                                key: "start_date",
                                                label: "Start Date",
                                                type: "date"
                                            },
                                            {
                                                key: "end_date",
                                                label: "End Date",
                                                type: "date"
                                            },

                                        ],

                                    },
                                    showNestedLoading: true,
                                    footer: { nextPrevBtn: true, pagination: true },
                                    columns: AgentCustomerSalesColumns,
                                    table: {
                                        height: 500,
                                    },
                                    rowSelection: false,
                                    // rowActions: [
                                    //     {
                                    //         icon: "material-symbols:download",
                                    //         onClick: (data: TableDataType) => {
                                    //             return(<IconComponentData2 row={data} />)
                                    //             // exportFile(data.uuid, "csv"); // or "excel", "csv" etc.
                                    //         },
                                    //     }
                                    // ],
                                    pageSize: 50,
                                }}
                            />
                        </div>
                    </Drawer>
                </div>

                // </ContainerCard>
            )}
            {activeTab === "warehouseStock" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            api: {
                                search: searchStockByWarehouse,
                                list: listStockByWarehouse
                            },
                            header: {
                                searchBar: true
                            },
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: stockColumns,
                            showNestedLoading: true,
                            rowSelection: false,
                            pageSize: 50,
                        }}
                    />
                </div>

                // </ContainerCard>
            )}
            {activeTab === "route" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            api: {
                                search: searchRouteByWarehouse,
                                list: listRouteByWarehouse
                            },
                            header: {
                                searchBar: true,
                            },
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: routeColumns,
                            showNestedLoading: true,
                            rowSelection: false,
                            pageSize: 50,
                        }}
                    />
                </div>

                // </ContainerCard>    
            )}
            {activeTab === "salesman" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            api: {
                                search: searchSalesmanByWarehouse,
                                list: listSalesmanByWarehouse
                            },
                            header: {
                                searchBar: true
                            },
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: salesmanColumns,
                            rowSelection: false,
                            showNestedLoading: true,
                            pageSize: 50,
                        }}
                    />
                </div>

                // </ContainerCard>
            )}
            {activeTab === "sales" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            api: {
                                search: searchSalesByWarehouse,
                                list: listSalesByWarehouse,
                                filterBy: filterBy
                            },
                            header: {
                                filterByFields: [
                                    {
                                        key: "start_date",
                                        label: "Start Date",
                                        type: "date",
                                        applyWhen: (filters) => !!filters.end_date && !!filters.start_date,
                                        inputProps: {
                                            // min: filters?.end_date ? undefined : "",
                                        }
                                    },
                                    {
                                        key: "end_date",
                                        label: "End Date",
                                        type: "date"
                                    },
                                ],
                            },
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: salesColumns,
                            showNestedLoading: true,
                            rowSelection: false,
                            pageSize: 50,
                        }}
                    />
                </div>

                // </ContainerCard>
            )}
            {activeTab === "return" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table
                        config={{
                            // api: {
                            //     // search: searchReturnByWarehouse,
                            //     // list: listReturnByWarehouse,
                            //     // filterBy: filterByListReturn
                            // },
                            header: {
                                filterByFields: [
                                    {
                                        key: "start_date",
                                        label: "Start Date",
                                        type: "date"
                                    },
                                    {
                                        key: "end_date",
                                        label: "End Date",
                                        type: "date"
                                    },
                                ]
                            },
                            footer: { nextPrevBtn: true, pagination: true },
                            columns: returnColumns,
                            showNestedLoading: true,
                            rowSelection: false,
                            pageSize: 50,
                        }}
                        data={[]}
                    />
                </div>

                // </ContainerCard>
            )}
        </>
    );
}
