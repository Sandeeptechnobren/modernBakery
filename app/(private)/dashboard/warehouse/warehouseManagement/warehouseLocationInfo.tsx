"use client";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function WarehouseLocationInformation() {
  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [thresholdRadius, setThresholdRadius] = useState("");


  return (
    <>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Row 1 */}
        <InputFields
          label="Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        options={[
          { value: "north", label: "North" },
           { value: "south", label: "South" }, 
           { value: "east", label: "East" }, 
          { value: "west", label: "West" },
        ]}
        />
        <InputFields
          label="Sub Region"
        value={subRegion}
        onChange={(e) => setSubRegion(e.target.value)}
        options={[
        { value: "zone1", label: "Zone 1" }, 
        { value: "zone2", label: "Zone 2" }, 
        { value: "zone3", label: "Zone 3" },
        ]}
        />
        <InputFields
          label="District"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        />

        {/* Row 2 */}
        <InputFields
          label="Town/Village"
        value={town}
        onChange={(e) => setTown(e.target.value)}
        />
        <InputFields
          label="Street"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        />
        <InputFields
         label="Landmark"
        value={landmark}
        onChange={(e) => setLandmark(e.target.value)}
        />

        {/* Row 3 */}
        <InputFields
          label="Latitude"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        />
        <InputFields
          label="Longitude"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        />
        <InputFields
          label="Threshold Radius"
        value={thresholdRadius}
        onChange={(e) => setThresholdRadius(e.target.value)}
        />
      </div>

    </>
  );
}