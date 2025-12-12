"use client";

import { JSX, useEffect, useState } from "react";
import { ServiceTerritoryByUUID, serviceTerritoryExport } from "@/app/services/assetsApi";
import { downloadFile } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
type Warehouse = {
    warehouse_id: number;
    warehouse_code: string;
    warehouse_name: string;
};

type Area = {
    area_id: number;
    area_code: string;
    area_name: string;
    warehouses: Warehouse[];
};

type Region = {
    region_id: number;
    region_code: string;
    region_name: string;
    areas: Area[];
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
    regions: Region[];
    technician?: Technician;
    comment_reject?: string | null;

};

interface ServiceTerritoryDetailsDrawerProps {
    uuid: string;
    onClose: () => void;
}

export default function ServiceTerritoryDetailsDrawer({ uuid, onClose }: ServiceTerritoryDetailsDrawerProps) {
    const [data, setData] = useState<ServiceTerritoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const { showSnackbar } = useSnackbar();
    // Debug: Log when component mounts
    useEffect(() => {
        // console.log("🚀 ServiceTerritoryDetailsDrawer MOUNTED with UUID:", uuid);
        return () => {
            // console.log("🔴 ServiceTerritoryDetailsDrawer UNMOUNTED");
        };
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await ServiceTerritoryByUUID(uuid);
                if (res.error) {
                    console.error("Failed to fetch service territory details:", res.data?.message);
                } else {
                    // console.log("✅ Service Territory Details Response:", res);
                    // console.log("📦 res.data:", res.data);
                    // console.log("🔍 res.data.regions:", res.data?.regions);
                    setData(res.data);
                }
            } catch (error) {
                // console.error("Error fetching service territory details:", error);
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

        // Flatten the nested structure for CSV
        data.regions?.forEach((region) => {
            if (region.areas && region.areas.length > 0) {
                region.areas.forEach((area) => {
                    if (area.warehouses && area.warehouses.length > 0) {
                        area.warehouses.forEach((warehouse) => {
                            rows.push([
                                region.region_name,
                                area.area_name,
                                `${warehouse.warehouse_code} - ${warehouse.warehouse_name}`
                            ]);
                        });
                    } else {
                        // Area with no warehouses
                        rows.push([region.region_name, area.area_name, "N/A"]);
                    }
                });
            } else {
                // Region with no areas
                rows.push([region.region_name, "N/A", "N/A"]);
            }
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

    // Debug: Log data state when it changes
    useEffect(() => {
        // console.log("🎯 Data state updated:", data);
        // console.log("🎯 Data.regions:", data?.regions);
        // console.log("🎯 Data.regions length:", data?.regions?.length);
    }, [data]);

    const exportFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await serviceTerritoryExport(uuid, { format });
            console.log(response, "response")
            const url = response?.download_url || response?.data?.download_url;

            if (url) {
                await downloadFile(url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar(response?.message || "Failed to get download URL", "error");
            }
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } catch (error) {
            showSnackbar("Failed to download warehouse data", "error");
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } finally {
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200">
                <h2 className="text-2xl font-normal text-gray-600">Service Territory</h2>
                <button
                    // onClick={handleDownloadCSV}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-600 text-white rounded shadow-sm transition-colors font-medium"
                    disabled={!data || loading}
                    onClick={() => !threeDotLoading.xlsx && exportFile("xlsx")}
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
                                        {data.regions && data.regions.length > 0 ? (
                                            data.regions.flatMap((region, regionIdx) => {
                                                const regionRows: JSX.Element[] = [];
                                                const totalAreas = region.areas?.length || 0;

                                                // Calculate total row span for the region
                                                let regionRowSpan = 0;
                                                if (totalAreas > 0) {
                                                    region.areas.forEach(a => {
                                                        regionRowSpan += (a.warehouses?.length || 1);
                                                    });
                                                } else {
                                                    regionRowSpan = 1;
                                                }

                                                if (totalAreas > 0) {
                                                    region.areas.forEach((area, areaIdx) => {
                                                        const totalWarehouses = area.warehouses?.length || 0;
                                                        const areaRowSpan = totalWarehouses || 1;

                                                        if (totalWarehouses > 0) {
                                                            area.warehouses.forEach((warehouse, warehouseIdx) => {
                                                                const isFirstRegionRow = areaIdx === 0 && warehouseIdx === 0;
                                                                const isFirstAreaRow = warehouseIdx === 0;

                                                                regionRows.push(
                                                                    <tr key={`${region.region_id}-${area.area_id}-${warehouse.warehouse_id}`} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                                                                        {isFirstRegionRow && (
                                                                            <td
                                                                                rowSpan={regionRowSpan}
                                                                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-white font-medium"
                                                                            >
                                                                                {region.region_name}
                                                                            </td>
                                                                        )}
                                                                        {isFirstAreaRow && (
                                                                            <td
                                                                                rowSpan={areaRowSpan}
                                                                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-white"
                                                                            >
                                                                                {area.area_name}
                                                                            </td>
                                                                        )}
                                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                                            {warehouse.warehouse_code} - {warehouse.warehouse_name}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                        } else {
                                                            // Area with no warehouses
                                                            regionRows.push(
                                                                <tr key={`${region.region_id}-${area.area_id}-empty`} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                                                                    {areaIdx === 0 && (
                                                                        <td
                                                                            rowSpan={regionRowSpan}
                                                                            className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-white font-medium"
                                                                        >
                                                                            {region.region_name}
                                                                        </td>
                                                                    )}
                                                                    <td
                                                                        className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-white"
                                                                    >
                                                                        {area.area_name}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-400 italic">
                                                                        No warehouses
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    });
                                                } else {
                                                    // Region with no areas
                                                    regionRows.push(
                                                        <tr key={`${region.region_id}-empty`} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50">
                                                            <td
                                                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300 align-top bg-white font-medium"
                                                            >
                                                                {region.region_name}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-400 italic border-r border-gray-300">
                                                                No areas
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-400 italic">
                                                                No warehouses
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                return regionRows;
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                    No regions available
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