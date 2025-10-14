import React from "react";

interface MapProps {
  latitude: string | number;
  longitude: string | number;
  title?: string;
  height?: number | string;
  width?: number | string;
}

const Map: React.FC<MapProps> = ({ latitude, longitude, title = "Location", height = 300, width = "100%" }) => {
  if (!latitude || !longitude) return null;
  return (
    <div className="mt-6">
      <div className="text-[18px] mb-2 font-semibold">{title}</div>
      <iframe
        title={title}
        width={width}
        height={height}
        style={{ border: 0, borderRadius: "8px", backgroundColor: "#f0f0f0" }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed`}
      />
    </div>
  );
};

export default Map;