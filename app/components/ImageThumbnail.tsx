"use client";
import React from "react";

type SrcType = string | { url?: string; path?: string; name?: string } | undefined | null;

interface ImageThumbnailProps {
  src?: SrcType;
  alt?: string;
  width?: number; // px
  height?: number; // px
  className?: string;
  link?: boolean; // wrap in anchor to open full image
  baseUrl?: string; // optional prefix for relative paths
  placeholder?: React.ReactNode; // optional custom fallback
}

/**
 * ImageThumbnail
 * Renders a small thumbnail image and links to the full-size image when available.
 * It accepts either a string URL or an object with a `url`/`path` property.
 */
export default function ImageThumbnail({
  src,
  alt = "image",
  width = 56,
  height = 40,
  className = "",
  link = true,
  baseUrl = "",
  placeholder = null,
}: ImageThumbnailProps) {
  if (!src) {
    return placeholder ?? "-";
  }

  let url = "";
  let name = alt;

  if (typeof src === "string") {
    url = src;
  } else if (typeof src === "object" && src !== null) {
    url = (src as any).url || (src as any).path || "";
    name = (src as any).name || alt;
  }

  if (!url) return placeholder ?? "-";

  // If url is relative and a baseUrl is provided, prefix it
  const normalized = url.startsWith("http") || url.startsWith("data:") ? url : (baseUrl ? `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}` : url);

  const img = (
    // keep markup simple so it works in SSR and client contexts
    <img
      src={normalized}
      alt={name}
      width={width}
      height={height}
      className={`${className} w-[${width}px] h-[${height}px] object-cover rounded-md border cusror-pointer`}
      onError={(e) => {
        // hide broken image and leave placeholder text
        const el = e.currentTarget as HTMLImageElement;
        el.style.display = "none";
      }}
    />
  );

  if (link) {
    return (
      <a href={normalized} target="_blank" rel="noreferrer" className="inline-block">
        {img}
      </a>
    );
  }

  return img;
}
