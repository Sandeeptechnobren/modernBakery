"use client";

import { useState } from "react";
import { Icon } from "@iconify-icon/react";

// Static week and day data (no API, no export)
const weekNames = ["Week 1", "Week 2", "Week 3", "Week 4"] as const;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type Week = (typeof weekNames)[number];

type WeekView = {
  week: Week;
  dateRange: string;
  days: string[];
};

const weeks: WeekView[] = [
  { week: "Week 1", dateRange: "Oct 27 - Nov 2, 2025", days: [...days] },
  { week: "Week 2", dateRange: "Nov 3 - Nov 9, 2025", days: [...days] },
  { week: "Week 3", dateRange: "Nov 10 - Nov 16, 2025", days: [...days] },
  { week: "Week 4", dateRange: "Nov 17 - Nov 23, 2025", days: [...days] },
];

// Dummy per-day data to display when week is expanded
const dayData: Record<string, { title: string; metrics: { label: string; value: string | number }[]; status: "Good" | "Average" | "Low" }[]> = {
  Monday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 4 }, { label: "Units", value: 320 }], status: "Good" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 6 }, { label: "Units", value: 210 }], status: "Average" },
  ],
  Tuesday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 3 }, { label: "Units", value: 280 }], status: "Average" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 5 }, { label: "Units", value: 190 }], status: "Good" },
  ],
  Wednesday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 2 }, { label: "Units", value: 150 }], status: "Low" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 7 }, { label: "Units", value: 260 }], status: "Good" },
  ],
  Thursday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 5 }, { label: "Units", value: 400 }], status: "Good" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 3 }, { label: "Units", value: 130 }], status: "Average" },
  ],
  Friday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 4 }, { label: "Units", value: 310 }], status: "Good" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 8 }, { label: "Units", value: 300 }], status: "Good" },
  ],
  Saturday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 1 }, { label: "Units", value: 80 }], status: "Low" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 2 }, { label: "Units", value: 70 }], status: "Low" },
  ],
  Sunday: [
    { title: "Inbound", metrics: [{ label: "POs", value: 0 }, { label: "Units", value: 0 }], status: "Low" },
    { title: "Outbound", metrics: [{ label: "Orders", value: 0 }, { label: "Units", value: 0 }], status: "Low" },
  ],
};

export default function StockPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<Week>>(new Set<Week>());

  const toggleWeek = (week: Week) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(week) ? next.delete(week) : next.add(week);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Week and Day View</h1>
      </div>

      {/* Weekly Layout */}
      <div className="space-y-4 overflow-y-auto">
        {weeks.map((w) => (
          <div key={w.week} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Week Header */}
            <div
              onClick={() => toggleWeek(w.week)}
              className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition"
            >
              <div>
                <h2 className="text-xl font-semibold">{w.week}</h2>
                <p className="text-sm text-blue-100">{w.dateRange}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {w.days.length} days
                </span>
                <Icon
                  icon={expandedWeeks.has(w.week) ? "lucide:chevron-up" : "lucide:chevron-down"}
                  width={24}
                />
              </div>
            </div>

            {/* Days */}
            {expandedWeeks.has(w.week) && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {w.days.map((day) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{day}</h3>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {dayData[day][0]?.status ?? "N/A"}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700">
                        {dayData[day]?.map((block, idx) => (
                          <div key={idx} className="rounded border border-gray-100 p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-800">{block.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                block.status === "Good"
                                  ? "bg-green-100 text-green-700"
                                  : block.status === "Average"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {block.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-gray-600">
                              {block.metrics.map((m, mIdx) => (
                                <div key={mIdx} className="flex items-center justify-between">
                                  <span>{m.label}</span>
                                  <span className="font-semibold text-gray-800">{m.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}