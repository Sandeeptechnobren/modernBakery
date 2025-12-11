"use client";

import { JSX, useEffect, useState } from "react";
import { ServiceTerritoryByUUID } from "@/app/services/assetsApi";

type Warehouse = {
    id: number;
    code: string;
    name: string;
    location?: string;
};

type Area = {
    id: number;
    code: string;
    name: string;
};

type Region = {
    id: number;
    code: string;
    name: string;
};

type Technician = {
    id: number;
    code: string;
    name: string;
};

type ServiceTerritoryData = {
    id?: number;
    uuid?: string;
    osa_code: string;
    name?: string;
    warehouses: Warehouse[];
    regions: Region[];
    areas: Area[];
    technician?: Technician;
    comment_reject?: string | null;
    created_at?: string;
};

interface ServiceTerritoryDetailsDrawerProps {
    uuid: string;
    onClose: () => void;
}

export default function ServiceTerritoryDetailsDrawer({ uuid, onClose }: ServiceTerritoryDetailsDrawerProps) {
    const [data, setData] = useState<ServiceTerritoryData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await ServiceTerritoryByUUID(uuid);
                if (res.error) {
                    console.error("Failed to fetch service territory details:", res.data?.message);
                } else {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Error fetching service territory details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (uuid) {
            fetchDetails();
        }
    }, [uuid]);

    const handleDownloadCSV = () => {
        if (!data) return;

        // Create CSV content
        const headers = ["Region", "Area", "Warehouse"];
        const rows: string[][] = [];

        // Since the structure is flat, we'll list all combinations
        data.regions?.forEach((region) => {
            data.areas?.forEach((area) => {
                data.warehouses?.forEach((warehouse) => {
                    rows.push([
                        region.name,
                        area.name,
                        `${warehouse.code} - ${warehouse.name}${warehouse.location ? ' - ' + warehouse.location : ''}`
                    ]);
                });
            });
        });

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `service-territory-${data.osa_code}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                <h2 className="text-2xl font-normal text-gray-600">Service Territory</h2>
                <button
                    onClick={handleDownloadCSV}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded shadow-sm transition-colors font-medium"
                    disabled={!data || loading}
                >
                    Download CSV
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : !data ? (
                        <div className="text-center py-8 text-gray-500">No data available</div>
                    ) : (
                        <>
                            {/* Code and Name Header */}
                            <div className="mb-6 pb-4 border-b border-gray-300">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm">
                                        <span className="font-semibold text-gray-600">Code: </span>
                                        <span className="text-blue-600 font-medium">{data.osa_code}</span>
                                    </div>
                                    {data.name && (
                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-600">Name: </span>
                                            <span className="text-blue-600 font-medium">{data.name}</span>
                                        </div>
                                    )}
                                    {data.technician && (
                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-600">Technician: </span>
                                            <span className="text-blue-600 font-medium">{data.technician.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="border border-gray-300 rounded-sm overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-b border-gray-300 w-1/4">
                                                Region
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-b border-gray-300 w-1/4">
                                                Area
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300 w-1/2">
                                                Warehouse
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.warehouses && data.warehouses.length > 0 ? (
                                            (() => {
                                                // Calculate total rows for rowspan
                                                const totalWarehouses = data.warehouses.length;
                                                const totalAreas = data.areas?.length || 1;
                                                const totalRegions = data.regions?.length || 1;

                                                const currentRow = 0;
                                                const rows: JSX.Element[] = [];

                                                // If we have regions and areas, create a structured table
                                                if (data.regions && data.regions.length > 0 && data.areas && data.areas.length > 0) {
                                                    data.regions.forEach((region, regionIndex) => {
                                                        data.areas.forEach((area, areaIndex) => {
                                                            data.warehouses.forEach((warehouse, warehouseIndex) => {
                                                                const isFirstWarehouseInArea = warehouseIndex === 0;
                                                                const isFirstAreaInRegion = areaIndex === 0 && warehouseIndex === 0;

                                                                rows.push(
                                                                    <tr key={`${regionIndex}-${areaIndex}-${warehouseIndex}`} className="border-b border-gray-300 last:border-b-0">
                                                                        {isFirstAreaInRegion && (
                                                                            <td
                                                                                rowSpan={totalAreas * totalWarehouses}
                                                                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-gray-50 font-medium"
                                                                            >
                                                                                {region.name}
                                                                            </td>
                                                                        )}
                                                                        {isFirstWarehouseInArea && (
                                                                            <td
                                                                                rowSpan={totalWarehouses}
                                                                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top"
                                                                            >
                                                                                {area.name}
                                                                            </td>
                                                                        )}
                                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                                            {warehouse.code} - {warehouse.name}{warehouse.location ? ` - ${warehouse.location}` : ''}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                        });
                                                    });
                                                } else {
                                                    // Simplified view - just list warehouses
                                                    data.warehouses.forEach((warehouse, index) => {
                                                        const regionName = data.regions && data.regions.length > 0
                                                            ? data.regions.map(r => r.name).join(", ")
                                                            : "N/A";
                                                        const areaName = data.areas && data.areas.length > 0
                                                            ? data.areas.map(a => a.name).join(", ")
                                                            : "N/A";

                                                        rows.push(
                                                            <tr key={index} className="border-b border-gray-300 last:border-b-0">
                                                                {index === 0 && (
                                                                    <td
                                                                        rowSpan={totalWarehouses}
                                                                        className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-gray-50 font-medium"
                                                                    >
                                                                        {regionName}
                                                                    </td>
                                                                )}
                                                                {index === 0 && (
                                                                    <td
                                                                        rowSpan={totalWarehouses}
                                                                        className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top"
                                                                    >
                                                                        {areaName}
                                                                    </td>
                                                                )}
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {warehouse.code} - {warehouse.name}{warehouse.location ? ` - ${warehouse.location}` : ''}
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                }

                                                return rows;
                                            })()
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                    No warehouses available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}