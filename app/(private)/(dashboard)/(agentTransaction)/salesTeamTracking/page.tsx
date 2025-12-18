"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-polylinedecorator";
import L from "leaflet";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { salesTeamTracking } from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

/* ================= TYPES ================= */

type RoutePoint = {
  lat: number;
  lng: number;
  time: string;
  type: "start" | "checkin" | "end";
};

/* ================= ICONS ================= */

const visitPinIcon = new L.DivIcon({
  html: `<div style="
    width:22px;height:22px;
    background:#E10600;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:2px solid white;
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const startPinIcon = new L.DivIcon({
  html: `<div style="
    width:26px;height:26px;
    background:#22C55E;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
  "></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const endPinIcon = new L.DivIcon({
  html: `<div style="
    width:26px;height:26px;
    background:#DC2626;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
  "></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

/* ================= ROUTE COMPONENT ================= */

function RouteOnRoad({ route }: { route: RoutePoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || route.length < 2) return;

    const waypoints = route.map((p) =>
      L.latLng(p.lat, p.lng)
    );

    let arrowLayer: L.Layer | null = null;

    const routingControl = (L as any).Routing.control({
      waypoints,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [
          {
            color: "#E10600",
            weight: 5,
            opacity: 0.9,
          },
        ],
      },
      createMarker: () => null,
    }).addTo(map);

    // ✅ IMPORTANT PART: decorate the ACTUAL road geometry
    routingControl.on("routesfound", (e: any) => {
      const coordinates = e.routes[0].coordinates;

      arrowLayer = (L as any)
        .polylineDecorator(coordinates, {
          patterns: [
            {
              offset: 30,
              repeat: 60,
              symbol: (L as any).Symbol.arrowHead({
                pixelSize: 12,
                polygon: true,
                pathOptions: {
                  fillColor: "#1E3A8A",
                  fillOpacity: 1,
                  weight: 0,
                },
              }),
            },
          ],
        })
        .addTo(map);
    });

    return () => {
      map.removeControl(routingControl);
      if (arrowLayer) map.removeLayer(arrowLayer);
    };
  }, [map, route]);

  return null;
}

/* ================= MAIN COMPONENT ================= */

export default function SalesTrackingMap() {
  const {
    warehouseOptions,
    salesmanOptions,
    ensureWarehouseLoaded,
    ensureSalesmanLoaded,
  } = useAllDropdownListData();

  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    warehouse: "",
    salesman: "",
  });

  const [route, setRoute] = useState<RoutePoint[]>([]);

  useEffect(() => {
    ensureWarehouseLoaded();
    ensureSalesmanLoaded();
  }, []);

  const fetchSalesmanRoute = useCallback(
    async (salesmanId: string) => {
      if (!salesmanId) return;

      try {
        setLoading(true);
        const res = await salesTeamTracking({
          salesman_id: salesmanId,
        });
        setRoute(res?.data?.route || []);
      } catch {
        showSnackbar("Failed to load route", "error");
        setRoute([]);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showSnackbar]
  );

  useEffect(() => {
    if (form.salesman) fetchSalesmanRoute(form.salesman);
  }, [form.salesman, fetchSalesmanRoute]);

  const handleChange = (field: string, value: any) => {
    const val =
      value && typeof value === "object" && "target" in value
        ? value.target.value
        : value;

    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-semibold">
        Sales Team Tracking
      </h1>

      <ContainerCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputFields
            label="Distributor"
            value={form.warehouse}
            options={warehouseOptions}
            onChange={(e) => handleChange("warehouse", e)}
            type="select"
          />

          <InputFields
            label="Sales Team"
            value={form.salesman}
            options={salesmanOptions}
            onChange={(e) => handleChange("salesman", e)}
            type="select"
          />
        </div>
      </ContainerCard>

      <div className="w-full h-[460px] rounded-xl overflow-hidden">
        <MapContainer
          center={
            route.length
              ? [route[0].lat, route[0].lng]
              : [28.6139, 77.209]
          }
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {route.length > 1 && <RouteOnRoad route={route} />}

          {route.map((point, index) => {
            const icon =
              point.type === "start"
                ? startPinIcon
                : point.type === "end"
                ? endPinIcon
                : visitPinIcon;

            return (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold capitalize">
                      {point.type}
                    </div>
                    <div>{point.time}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
