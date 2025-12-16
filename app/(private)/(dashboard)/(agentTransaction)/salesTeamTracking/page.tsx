"use client";

import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import L from "leaflet";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

/* ================= DEMO ROUTE ================= */

const demoRoute = [
    { lat: 28.6139, lng: 77.209, time: "09:00 AM" },
    { lat: 28.6142, lng: 77.2135, time: "10:05 AM" },
    { lat: 28.61, lng: 77.2125, time: "10:20 AM" },
    { lat: 28.6165, lng: 77.2235, time: "10:35 AM" },
    { lat: 28.619, lng: 77.214, time: "10:50 AM" },
    { lat: 28.62, lng: 77.2155, time: "11:10 AM" },
    { lat: 28.6195, lng: 77.2265, time: "11:30 AM" },
    { lat: 28.6205, lng: 77.2275, time: "12:45 PM" },
];

/* ================= MAP PIN ICONS ================= */

const visitPinIcon = new L.DivIcon({
    className: "",
    html: `
    <div style="
      position: relative;
      width: 22px;
      height: 22px;
      background: #E10600;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
    ">
      <div style="
        position: absolute;
        top: 5px;
        left: 5px;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
});

const startPinIcon = new L.DivIcon({
    className: "",
    html: `
    <div style="
      position: relative;
      width: 26px;
      height: 26px;
      background: #22C55E;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
    ">
      <div style="
        position: absolute;
        top: 6px;
        left: 6px;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
});

const endPinIcon = new L.DivIcon({
    className: "",
    html: `
    <div style="
      position: relative;
      width: 26px;
      height: 26px;
      background: #DC2626;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
    ">
      <div style="
        position: absolute;
        top: 6px;
        left: 6px;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
});

/* ================= ROAD ROUTE ================= */

function RouteOnRoad({ route }: { route: typeof demoRoute }) {
    const map = useMap();

    useEffect(() => {
        if (!map || route.length < 2) return;

        const control = L.Routing.control({
            waypoints: route.map((p) => L.latLng(p.lat, p.lng)),

            // 🔴 Thick red road route
            lineOptions: {
                styles: [
                    {
                        color: "#E10600",
                        weight: 5,
                        opacity: 0.9,
                    },
                ],
            },

            addWaypoints: false,
            draggableWaypoints: false,
            routeWhileDragging: false,
            show: false,
            showAlternatives: false,
            fitSelectedRoutes: true,

            // ❌ No default routing markers
            createMarker: () => null,
        }).addTo(map);

        return () => {
            map.removeControl(control);
        };
    }, [map, route]);

    return null;
}

/* ================= COMPONENT ================= */

export default function SalesTrackingMap() {
    const { warehouseOptions, salesmanOptions } = useAllDropdownListData();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-[20px] font-semibold">Sales Team Tracking</h1>

            {/* Filters */}
            <ContainerCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputFields label="Distributor" options={warehouseOptions} />
                    <InputFields label="Sales Team" options={salesmanOptions} />
                </div>
            </ContainerCard>

            {/* Map */}
            <div className="w-full h-[460px] rounded-xl overflow-hidden">
                <MapContainer
                    center={[demoRoute[0].lat, demoRoute[0].lng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    {/* Road-by-road route */}
                    <RouteOnRoad route={demoRoute} />

                    {/* Map pins */}
                    {demoRoute.map((point, index) => {
                        const isStart = index === 0;
                        const isEnd = index === demoRoute.length - 1;

                        return (
                            <Marker
                                key={index}
                                position={[point.lat, point.lng]}
                                icon={
                                    isStart
                                        ? startPinIcon
                                        : isEnd
                                            ? endPinIcon
                                            : visitPinIcon
                                }
                            >
                                {(isStart || isEnd) && (
                                    <Popup>{isStart ? "Start" : "End"}</Popup>
                                )}
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
