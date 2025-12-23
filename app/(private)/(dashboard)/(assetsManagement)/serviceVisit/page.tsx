"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Table, {
    listReturnType,
    searchReturnType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";

import { ServiceVisitList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { useEffect } from "react";

// ✅ SERVICE VISIT ROW TYPE
interface ServiceVisitRow {
    uuid: string;
    osa_code: string;
    ticket_type: string;
    time_in: string;
    time_out: string;
    ct_status: string;
    model_no: string;
    asset_no: string;
    serial_no: string;
    branding: string;
    scan_image: string;

    outlet_code: string;
    outlet_name: string;
    owner_name: string;
    landmark: string;
    location: string;
    town_village: string;
    district: string;

    contact_no: string;
    contact_no2: string;
    contact_person: string;

    longitude: string;
    latitude: string;

    technician: {
        id: number;
        name: string;
        code: string;
    } | null;

    current_voltage: string;
    amps: string;
    cabin_temperature: string;

    work_status: string;
    spare_request: string;
    work_done_type: string;

    technical_behavior: string;
    service_quality: string;

    nature_of_call: {
        id: number;
        name: string;
        code: string;
    } | null;

    comment: string;
    cts_comment: string;
}

export default function ServiceVisit() {
    const { can, permissions } = usePagePermissions();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();

    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    // ✅ COLUMNS
    const columns = useMemo(
        () => [
            { key: "osa_code", label: "OSA Code", render: (r: any) => (r as ServiceVisitRow).osa_code || "-" },
            { key: "ticket_type", label: "Ticket Type", render: (r: any) => (r as ServiceVisitRow).ticket_type || "-" },

            {
                key: "technician",
                label: "Technician",
                render: (r: any) => {
                    const row = r as ServiceVisitRow;
                    return row.technician?.code
                        ? `${row.technician.code} - ${row.technician.name || ""}`
                        : "-";
                },
            },

            { key: "model_no", label: "Model No" },
            { key: "asset_no", label: "Asset No" },
            { key: "serial_no", label: "Serial No" },
            { key: "outlet_code", label: "Outlet Code" },
            { key: "outlet_name", label: "Outlet Name" },
            { key: "owner_name", label: "Owner Name" },
            { key: "location", label: "Location" },
            { key: "town_village", label: "Town/Village" },
            { key: "district", label: "District" },
            { key: "contact_no", label: "Contact No" },
            { key: "contact_no2", label: "Alt Contact" },
            { key: "current_voltage", label: "Voltage" },
            { key: "amps", label: "Amps" },

            {
                key: "cabin_temperature",
                label: "Temperature",
                render: (r: any) => (r as ServiceVisitRow).cabin_temperature || "-",
            },

            {
                key: "work_status",
                label: "Work Status",
                render: (r: any) => (
                    <StatusBtn
                        isActive={(r as ServiceVisitRow).work_status === "completed"}
                    />
                ),
            },

            { key: "work_done_type", label: "Work Done Type" },
            { key: "spare_request", label: "Spare Request" },
            { key: "technical_behavior", label: "Tech Behavior" },
            { key: "service_quality", label: "Service Quality" },

            {
                key: "nature_of_call",
                label: "Nature of Call",
                render: (r: any) => (r as ServiceVisitRow).nature_of_call?.name || "-",
            },

            { key: "comment", label: "Comment" },
            { key: "cts_comment", label: "CTS Comment" },
        ],
        []
    );

    // ✅ FIXED PAGINATION API HANDLER (NO DUPLICATE per_page)
    const fetchServiceVisitList = useCallback(
        async (
            page: number = 1,
            pageSize: number = 20,
            appliedFilters: Record<string, any> = {}
        ): Promise<listReturnType> => {
            try {
                setLoading(true);

                const result = await ServiceVisitList({
                    page: page,
                    per_page: pageSize,
                    ...appliedFilters,
                });

                const data = Array.isArray(result?.data) ? result.data : [];

                const totalRecords = result?.pagination?.total || data.length;
                const perPage = result?.pagination?.per_page || pageSize;
                const currentPage = result?.pagination?.current_page || page;

                return {
                    data,
                    total: Math.ceil(totalRecords / perPage),
                    currentPage,
                    pageSize: perPage,
                };
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch Service Visit list", "error");

                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize,
                };
            } finally {
                setLoading(false);
            }
        },
        [setLoading, showSnackbar]
    );

    // ✅ SEARCH PLACEHOLDER
    const searchInvoices = useCallback(async (): Promise<searchReturnType> => {
        return { data: [], currentPage: 1, total: 0, pageSize: 20 };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <Table
                refreshKey={refreshKey}
                config={{
                    api: {
                        list: fetchServiceVisitList,
                        search: searchInvoices,
                    },

                    header: {
                        title: "Service Visit",
                        columnFilter: false,
                        searchBar: false,
                        actions: can("create") ? [
                            // <SidebarBtn
                            //     key="add"
                            //     href="/serviceVisit/add"
                            //     leadingIcon="lucide:plus"
                            //     label="Add Visit"
                            //     labelTw="hidden lg:block"
                            //     isActive
                            // />,
                        ] : [],
                    },

                    columns,
                    rowSelection: true,

                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: any) => {
                                router.push(`/serviceVisit/details/${(row as ServiceVisitRow).uuid}`);
                            },
                        },
                        ...(can("edit") ? [
                            // {
                            //     icon: "lucide:edit",
                            //     onClick: (row: any) => {
                            //         router.push(`/serviceVisit/${(row as ServiceVisitRow).uuid}`);
                            //     },
                            // },
                        ] : [])
                    ],

                    footer: { nextPrevBtn: true, pagination: true },
                    pageSize: 20,
                    localStorageKey: "service-visit-table",
                }}
            />
        </div>
    );
}
