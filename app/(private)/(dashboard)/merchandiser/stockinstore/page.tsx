"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { campaignInformationList, exportCompaignData } from "@/app/services/merchandiserApi";

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
}

interface WeekData {
  weekName: string;
  weekNumber: number;
  dateRange: string;
  stocks: StockItem[];
}

export default function StockPage() {
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  // Fetch and organize data by weeks
  const fetchWeeklyStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campaignInformationList({
        page: "1",
        per_page: "100",
      });
      
      // Transform your data into weekly structure
      // This is a sample transformation - adjust based on your actual data structure
      const transformedData: WeekData[] = [
        {
          weekName: "Week 1",
          weekNumber: 1,
          dateRange: "Oct 27 - Nov 2, 2025",
          stocks: res?.data?.slice(0, 5).map((item: any, idx: number) => ({
            id: item.id || `${idx}`,
            name: item.code || `Stock ${idx + 1}`,
            quantity: Math.floor(Math.random() * 100),
            status: item.feedback || "Available"
          })) || []
        },
        {
          weekName: "Week 2",
          weekNumber: 2,
          dateRange: "Nov 3 - Nov 9, 2025",
          stocks: res?.data?.slice(5, 10).map((item: any, idx: number) => ({
            id: item.id || `${idx + 5}`,
            name: item.code || `Stock ${idx + 6}`,
            quantity: Math.floor(Math.random() * 100),
            status: item.feedback || "Available"
          })) || []
        },
        {
          weekName: "Week 3",
          weekNumber: 3,
          dateRange: "Nov 10 - Nov 16, 2025",
          stocks: res?.data?.slice(10, 15).map((item: any, idx: number) => ({
            id: item.id || `${idx + 10}`,
            name: item.code || `Stock ${idx + 11}`,
            quantity: Math.floor(Math.random() * 100),
            status: item.feedback || "Available"
          })) || []
        },
        {
          weekName: "Week 4",
          weekNumber: 4,
          dateRange: "Nov 17 - Nov 23, 2025",
          stocks: res?.data?.slice(15, 20).map((item: any, idx: number) => ({
            id: item.id || `${idx + 15}`,
            name: item.code || `Stock ${idx + 16}`,
            quantity: Math.floor(Math.random() * 100),
            status: item.feedback || "Available"
          })) || []
        }
      ];
      
      setWeeklyData(transformedData);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showSnackbar("Failed to fetch stock data", "error");
      console.error(err);
    }
  }, [setLoading, showSnackbar]);

  useEffect(() => {
    fetchWeeklyStock();
  }, [fetchWeeklyStock]);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);
      const res = await exportCompaignData({ file_type: fileType });
      
      let downloadUrl = "";
      if (res?.url && res.url.startsWith("blob:")) {
        downloadUrl = res.url;
      } else if (res?.url && res.url.startsWith("http")) {
        downloadUrl = res.url;
      } else if (typeof res === "string" && res.includes(",")) {
        const blob = new Blob([res], {
          type: fileType === "csv" 
            ? "text/csv;charset=utf-8;" 
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        showSnackbar("No valid file or URL returned from server", "error");
        return;
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `stock_export_${new Date().toISOString().split('T')[0]}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(`Download started for ${fileType.toUpperCase()} file`, "success");
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export stock data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Information by Week</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Icon icon="gala:file-document" width={20} />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Icon icon="gala:file-document" width={20} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Weekly Layout */}
      <div className="space-y-4 overflow-y-auto">
        {weeklyData.map((week) => (
          <div key={week.weekNumber} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Week Header */}
            <div
              onClick={() => toggleWeek(week.weekNumber)}
              className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition"
            >
              <div>
                <h2 className="text-xl font-semibold">{week.weekName}</h2>
                <p className="text-sm text-blue-100">{week.dateRange}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {week.stocks.length} items
                </span>
                <Icon
                  icon={expandedWeeks.has(week.weekNumber) ? "lucide:chevron-up" : "lucide:chevron-down"}
                  width={24}
                />
              </div>
            </div>

            {/* Stock Items */}
            {expandedWeeks.has(week.weekNumber) && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {week.stocks.length > 0 ? (
                    week.stocks.map((stock) => (
                      <div
                        key={stock.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{stock.name}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              stock.quantity > 50
                                ? "bg-green-100 text-green-700"
                                : stock.quantity > 20
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {stock.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Quantity:</span> {stock.quantity}
                          </p>
                          <p>
                            <span className="font-medium">ID:</span> {stock.id}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No stock items for this week
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}