"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import Table, { TableDataType, listReturnType } from "@/app/components/customTable";
import { getAuditTrailDetails } from "@/app/services/settingsAPI";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import { useEffect, useState, useMemo } from "react";

type AuditTrailData = {
    id: number;
    menu_id: string;
    sub_menu_id: string;
    user_name: string;
    user_role: string;
    previous_data: any;
    current_data: any;
    created_at: string;
    updated_at: string;
    mode: string;
    ip_address: string;
    browser: string;
    os: string;
    user_agent: string | null;
};

interface AuditTrailDetailsDrawerProps {
    uuid: string;
    onClose: () => void;
}

export default function AuditTrailDetailDrawer({ uuid, onClose }: AuditTrailDetailsDrawerProps) {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [auditData, setAuditData] = useState<AuditTrailData | null>(null);

    useEffect(() => {
        const fetchAuditDetails = async () => {
            setLoading(true);
            const res = await getAuditTrailDetails(uuid);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data?.message || "Unable to fetch Audit Trail Details",
                    "error"
                );
            } else {
                setAuditData(res.data);
            }
        };
        fetchAuditDetails();
    }, [uuid]);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Audit Trail Details</h1>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <Icon icon="lucide:x" width={24} />
                </button>
            </div>

            <div className="flex flex-col gap-y-[20px]">
                {/* Basic Information */}
                <ContainerCard className="w-full">
                    <h3 className="font-semibold mb-4 text-lg">Basic Information</h3>
                    <KeyValueData
                        data={[
                            { value: auditData?.menu_id || "-", key: "Menu ID" },
                            { value: auditData?.sub_menu_id || "-", key: "Sub Menu ID" },
                            { value: auditData?.user_name?.toString() || "-", key: "User ID" },
                            { value: auditData?.user_role?.toString() || "-", key: "User Role" },
                            { value: auditData?.mode || "-", key: "Mode" },
                            // { value: auditData?.created_at || "-", key: "Created At" },
                        ]}
                    />
                </ContainerCard>

                {/* System Information */}
                <ContainerCard className="w-full">
                    <h3 className="font-semibold mb-4 text-lg">System Information</h3>
                    <KeyValueData
                        data={[
                            { value: auditData?.ip_address || "-", key: "IP Address" },
                            { value: auditData?.browser || "-", key: "Browser" },
                            { value: auditData?.os || "-", key: "Operating System" },
                            { value: auditData?.user_agent || "-", key: "User Agent" },
                        ]}
                    />
                </ContainerCard>

                {/* Current Data */}
                {auditData?.current_data && (
                    <ContainerCard className="w-full">
                        <h3 className="font-semibold mb-4 text-lg">Current Data</h3>
                        <Table
                            config={{
                                api: {
                                    list: async () => {
                                        const tableData = Object.entries(auditData.current_data).map(([key, value]) => ({
                                            field: key,
                                            value: typeof value === 'object' && value !== null
                                                ? JSON.stringify(value, null, 2)
                                                : String(value ?? '-')
                                        }));
                                        return {
                                            data: tableData,
                                            total: 1,
                                            currentPage: 1,
                                            pageSize: tableData.length,
                                            totalRecords: tableData.length
                                        };
                                    }
                                },
                                footer: { pagination: false },
                                pageSize: 9999,
                                columns: [
                                    { key: "field", label: "Field" },
                                    {
                                        key: "value",
                                        label: "Value",
                                        render: (row: TableDataType) => (
                                            <span className="whitespace-pre-wrap">{row.value}</span>
                                        )
                                    },
                                ],
                            }}
                        />
                    </ContainerCard>
                )}

                {/* Previous Data */}
                {auditData?.previous_data && (
                    <ContainerCard className="w-full">
                        <h3 className="font-semibold mb-4 text-lg">Previous Data</h3>
                        <Table
                            config={{
                                api: {
                                    list: async () => {
                                        const tableData = Object.entries(auditData.previous_data).map(([key, value]) => ({
                                            field: key,
                                            value: typeof value === 'object' && value !== null
                                                ? JSON.stringify(value, null, 2)
                                                : String(value ?? '-')
                                        }));
                                        return {
                                            data: tableData,
                                            total: 1,
                                            currentPage: 1,
                                            pageSize: tableData.length,
                                            totalRecords: tableData.length
                                        };
                                    }
                                },
                                footer: { pagination: false },
                                pageSize: 9999,
                                columns: [
                                    { key: "field", label: "Field" },
                                    {
                                        key: "value",
                                        label: "Value",
                                        render: (row: TableDataType) => (
                                            <span className="whitespace-pre-wrap">{row.value}</span>
                                        )
                                    },
                                ],
                            }}
                        />
                    </ContainerCard>
                )}
            </div>
        </div>
    );
}
