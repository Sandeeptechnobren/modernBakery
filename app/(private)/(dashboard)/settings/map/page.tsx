"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import axios from "axios";
import ListItemButton from "@mui/material/ListItemButton";

/* ================= TYPES ================= */
interface Customer {
  id: number;
  name: string;
  position: [number, number];
  visited: boolean;
}

interface Salesman {
  id: number;
  name: string;
  avatar: string;
  position: [number, number];
  customers: Customer[];
}

/* ================= MAIN ================= */
export default function SalesMapGoogle() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const [mapCenter, setMapCenter] = useState({
    lat: 0.27498,
    lng: 32.602878,
  });
  const [mapZoom, setMapZoom] = useState(13);

  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [selectedSalesman, setSelectedSalesman] =
    useState<Salesman | null>(null);

  const [hoveredSalesman, setHoveredSalesman] =
    useState<Salesman | null>(null);
  const [hoveredCustomer, setHoveredCustomer] =
    useState<Customer | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH API ================= */
  const fetchSalesmen = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://172.16.6.205:8001/api/salesmen?page=${page}`
      );
      setSalesmen(res.data.data);
      setTotalPages(res.data.total_pages);
      setSelectedSalesman(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesmen();
  }, [page]);

  /* ================= SEARCH ================= */
  const filteredSalesmen = useMemo(() => {
    return salesmen.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [salesmen, search]);

  /* ================= ICONS ================= */
  if (!isLoaded) return <Skeleton height="100vh" />;

  const salesmanIcon = {
    url: "/truck.png",
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20),
  };

  const visitedIcon = {
    url: "/image-blue-new.png",
    scaledSize: new window.google.maps.Size(30, 30),
    anchor: new window.google.maps.Point(15, 30),
  };

  const notVisitedIcon = {
    url: "/image-red-new.png",
    scaledSize: new window.google.maps.Size(30, 30),
    anchor: new window.google.maps.Point(15, 30),
  };

  /* ================= HANDLERS ================= */
  const handleSalesmanSelect = (s: Salesman) => {
    setSelectedSalesman(s);
    setMapCenter({ lat: s.position[0], lng: s.position[1] });
    setMapZoom(14);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ================= SIDEBAR ================= */}
      <List sx={{ width: 320, bgcolor: "background.paper" }}>
        <Box p={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search salesman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        {loading && (
          <Box p={2}>
            <Skeleton width={250} />
            <Skeleton width={200} />
          </Box>
        )}

        {filteredSalesmen.map((s) => {
          const visited = s.customers.filter((c) => c.visited).length;

          return (
            <React.Fragment key={s.id}>
             <ListItem disablePadding>
  <ListItemButton
    selected={selectedSalesman?.id === s.id}
    onClick={() => handleSalesmanSelect(s)}
  >
    <ListItemAvatar>
      <Avatar src={s.avatar} />
    </ListItemAvatar>

    <ListItemText
      primary={s.name}
      secondary={`Visited: ${visited}/${s.customers.length}`}
    />
  </ListItemButton>
</ListItem>
              <Divider />
            </React.Fragment>
          );
        })}

        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            size="small"
          />
        </Box>
      </List>

      {/* ================= GOOGLE MAP ================= */}
      <GoogleMap
        mapContainerStyle={{ flex: 1 }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={(map) => {
          (mapRef.current = map)
        }}
        onZoomChanged={() =>
          mapRef.current && setMapZoom(mapRef.current.getZoom()!)
        }
        onDragEnd={() => {
          if (mapRef.current) {
            const c = mapRef.current.getCenter();
            if (c) setMapCenter({ lat: c.lat(), lng: c.lng() });
          }
        }}
      >
        {/* ================= SALESMEN ================= */}
        {salesmen.map((s) => (
          <Marker
            key={s.id}
            position={{ lat: s.position[0], lng: s.position[1] }}
            icon={salesmanIcon}
            onClick={() => handleSalesmanSelect(s)}
            onMouseOver={() => setHoveredSalesman(s)}
            onMouseOut={() => setHoveredSalesman(null)}
          >
            {hoveredSalesman?.id === s.id && (
              <InfoWindow>
                <strong>{s.name}</strong>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* ================= CUSTOMERS ================= */}
        {selectedSalesman?.customers.map((c) => (
          <Marker
            key={c.id}
            position={{ lat: c.position[0], lng: c.position[1] }}
            icon={c.visited ? visitedIcon : notVisitedIcon}
            onMouseOver={() => setHoveredCustomer(c)}
            onMouseOut={() => setHoveredCustomer(null)}
          >
            {hoveredCustomer?.id === c.id && (
              <InfoWindow>
                <div>
                  <strong>{c.name}</strong>
                  <br />
                  {c.visited ? "Visited ✅" : "Not Visited ❌"}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
}
