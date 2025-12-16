"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type RoutePointType = "start" | "checkin" | "end";

interface RoutePoint {
    lat: number;
    lng: number;
    time: string;
    type: RoutePointType;
}

interface OptionType {
    label: string;
    value: string;
    code?: string;
    phone?: string;
}

/* ================= DEMO ROUTE ================= */

const demoRoute = [
    { lat: 28.6139, lng: 77.2090, time: "09:00 AM", type: "start" },

    { lat: 28.6142, lng: 77.2135, time: "10:05 AM", type: "checkin" },
    { lat: 28.6155, lng: 77.2125, time: "10:20 AM", type: "checkin" },
    { lat: 28.6165, lng: 77.2165, time: "10:35 AM", type: "checkin" },
    { lat: 28.6175, lng: 77.2195, time: "10:50 AM", type: "checkin" },
    { lat: 28.6185, lng: 77.2225, time: "11:10 AM", type: "checkin" },
    { lat: 28.6195, lng: 77.2255, time: "11:30 AM", type: "checkin" },

    { lat: 28.6205, lng: 77.2285, time: "12:45 PM", type: "end" },
];


/* ================= LEAFLET ICON FIX ================= */

const icon = new L.Icon({
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

/* ================= COMPONENT ================= */

export default function SalesTrackingMap() {
    const { salesmanOptions, warehouseOptions } = useAllDropdownListData();
    const router = useRouter();
    const [form, setForm] = useState({
        distributor: "",
        salesTeam: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ---------- HANDLE CHANGE ---------- */
    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    /* ---------- GET SELECTED SALES TEAM DETAILS ---------- */
    const selectedSalesTeam = (salesmanOptions as OptionType[])?.find(
        (item) => item.value === form.salesTeam
    );

    /* ---------- FINAL JSON PAYLOAD ---------- */
    const trackingPayload = {
        distributor_id: form.distributor,

        sales_team: selectedSalesTeam
            ? {
                id: selectedSalesTeam.value,
                name: selectedSalesTeam.label,
                code: selectedSalesTeam.code ?? "",
                phone: selectedSalesTeam.phone ?? "",
            }
            : null,

        route: demoRoute,
    };

    /* ---------- DEBUG / API READY ---------- */
    useEffect(() => {
        if (!form.salesTeam) return;
        console.log("📍 Tracking Payload:", trackingPayload);
    }, [form.salesTeam]);

    const path = demoRoute.map(
        (p) => [p.lat, p.lng] as [number, number]
    );

    /* ================= UI ================= */

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-4">
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[4px]">
                        Sales Team Tracking
                    </h1>
                </div>
            </div>
            {/* Filters */}
            <ContainerCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <InputFields
                        required
                        label="Distributor"
                        value={form.distributor}
                        options={warehouseOptions}
                        onChange={(e) =>
                            handleChange("distributor", e.target.value)
                        }
                        error={errors.distributor}
                    />

                    <InputFields
                        required
                        label="Sales Team"
                        value={form.salesTeam}
                        options={salesmanOptions}
                        onChange={(e) =>
                            handleChange("salesTeam", e.target.value)
                        }
                        error={errors.salesTeam}
                    />
                </div>
            </ContainerCard>

            {/* Map */}
            <div className="w-full h-[440px] rounded-xl overflow-hidden">
                <MapContainer
                    center={[demoRoute[0].lat, demoRoute[0].lng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Polyline positions={path} />

                    {demoRoute.map((point, index) => (
                        <Marker
                            key={index}
                            position={[point.lat, point.lng]}
                            icon={icon}
                        />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
