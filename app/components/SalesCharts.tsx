import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { Maximize2, Loader2, AlertCircle, BarChart3, X } from 'lucide-react';
import { Icon } from "@iconify/react";
import Highcharts from 'highcharts';
import Highcharts3D from 'highcharts/highcharts-3d';
import HighchartsReact from 'highcharts-react-official';
import { useSnackbar } from '../services/snackbarContext';

interface ChartData {
  salesTrend: { year: string; sales: number }[];
  companies: { name: string; sales: number; color: string }[];
  region: { name: string; value: number; color: string }[];
  brand: { brand: string; sales: number }[];
}

interface SalesChartsProps {
  chartData: ChartData;
  dashboardData?: any;
  isLoading?: boolean;
  error?: string | null;
  searchType?: string;
}

const SalesCharts: React.FC<SalesChartsProps> = ({ chartData, dashboardData, isLoading, error, searchType }) => {
  const {showSnackbar} = useSnackbar();
  const [selectedMaxView, setSelectedMaxView] = useState<string | null>(null);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [is3DLoaded, setIs3DLoaded] = useState(false);

  // Load Highcharts 3D module
  useEffect(() => {
    let mounted = true;

    if (typeof window !== 'undefined' && Highcharts) {
      import('highcharts/highcharts-3d').then((mod: any) => {
        if (typeof mod.default === 'function') {
          (mod.default as any)(Highcharts);
        }
        if (mounted) {
          setIs3DLoaded(true);
        }
      }).catch(() => {
        if (mounted) setIs3DLoaded(true);
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  // 🌟 Dark theme neon-inspired color palettes for trend charts
  const neonColors = [
    '#00f2fe', // Electric Cyan
    '#4facfe', // Neon Blue
    '#00ff9d', // Neon Green
    '#ff2e63', // Neon Pink
    '#ff9a00', // Neon Orange
    '#aa00ff', // Neon Purple
    '#00e5ff', // Bright Cyan
    '#f4d03f', // Neon Yellow
    '#1cefff', // Bright Teal
    '#ff4081', // Hot Pink
    '#18dcff', // Sky Blue
    '#ff4d8d'  // Magenta Pink
  ];

  const neonAreaColors = [
    { line: '#3b82f6', fill: 'rgba(59, 130, 246, 0.15)', glow: 'rgba(59, 130, 246, 0.3)' }, // Blue
    { line: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.3)' }, // Green
    { line: '#ec4899', fill: 'rgba(236, 72, 153, 0.15)', glow: 'rgba(236, 72, 153, 0.3)' }, // Pink
    { line: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.15)', glow: 'rgba(139, 92, 246, 0.3)' }, // Purple
    { line: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', glow: 'rgba(6, 182, 212, 0.3)' }, // Cyan
    { line: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', glow: 'rgba(245, 158, 11, 0.3)' }, // Amber
    { line: '#6366f1', fill: 'rgba(99, 102, 241, 0.15)', glow: 'rgba(99, 102, 241, 0.3)' }, // Indigo
    { line: '#14b8a6', fill: 'rgba(20, 184, 166, 0.15)', glow: 'rgba(20, 184, 166, 0.3)' }, // Teal
    { line: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', glow: 'rgba(244, 63, 94, 0.3)' }, // Rose
    { line: '#22c55e', fill: 'rgba(34, 197, 94, 0.15)', glow: 'rgba(34, 197, 94, 0.3)' }, // Emerald
    { line: '#a855f7', fill: 'rgba(168, 85, 247, 0.15)', glow: 'rgba(168, 85, 247, 0.3)' }, // Violet
    { line: '#0ea5e9', fill: 'rgba(14, 165, 233, 0.15)', glow: 'rgba(14, 165, 233, 0.3)' }  // Sky Blue
  ];

  // Original color palettes for other charts
  const companyColors = [
    '#22d3ee', // cyan
     '#fb7185', // rose
    '#fbbf24', // yellow
    '#60a5fa', // blue
    '#818cf8', // indigo
    '#a78bfa', // violet
    '#f472b6', // pink
    // amber
    '#34d399'  // emerald
  ];

  const regionColors = [
    '#38bdf8',
    '#facc15', // sky blue
    '#4f46e5', // indigo
    '#22c55e', // green
     // yellow
    '#f97316'  // orange
  ];

  const areaColors = [
    '#6366f1','#ff6ec7', '#8b5cf6', '#c084fc', '#e879f9', '#fb7185', '#f97316', '#facc15',  '#2dd4bf', '#38bdf8', '#60a5fa', '#22d3ee'
  ];

  const warehouseColors = [
    '#00ffd5','#c77dff',  '#00c2ff', '#2979ff', '#7c4dff', '#ff6ec7'
  ];

  const salesmanColors = [
    '#f60a0aff', '#fa7406ff', '#facc15', '#08f760ff', '#07d5f5ff', '#1f4068ff', '#a78bfa', '#c20b6aff'
  ];

  // 3D Column Chart Component
  const Column3DChart = ({ data, title, xAxisKey = 'name', yAxisKey = 'value', colors = areaColors, height = '400px' }: any) => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    const isQuantity = searchType === 'quantity';
    const yAxisLabel = isQuantity ? 'Quantity' : 'Sales Value (UGX)';
    const valuePrefix = isQuantity ? '' : 'UGX ';
    const valueSuffix = isQuantity ? ' Qty' : '';

    const options: Highcharts.Options = {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        options3d: {
          enabled: true,
          alpha: 5,
          beta: 5,
          depth: 50,
          viewDistance: 50
        },
        height: height
      },
      title: {
        text: title,
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1f2937'
        }
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        itemStyle: {
          fontSize: '10px',
          fontWeight: 'normal',
          color: '#4b5563'
        },
        itemHoverStyle: {
          color: '#1f2937'
        },
        itemHiddenStyle: {
          color: '#9ca3af'
        },
        y: 0,
        margin: 15
      },
      xAxis: {
        categories: data.map((item: any) => item[xAxisKey]),
        labels: {
          skew3d: true,
          style: {
            fontSize: '11px',
            color: '#4b5563'
          }
        },
        title: {
          text: ''
        }
      },
      yAxis: {
        title: {
          text: yAxisLabel,
          style: {
            color: '#4b5563'
          }
        },
        labels: {
          formatter: function() {
            return `UGX ${((this.value as number) / 1000000).toFixed(1)}M`;
          },
          style: {
            color: '#4b5563'
          }
        }
      },
      tooltip: {
        formatter: function() {
          if (isQuantity) {
            return `<b>${this.key}</b><br/>${this.y?.toLocaleString()} Qty`;
          }
          return `<b>${this.key}</b><br/>UGX ${this.y?.toLocaleString()}`;
        },
        style: {
          fontSize: '12px'
        }
      },
      plotOptions: {
        column: {
          depth: 40,
          borderWidth: 0,
          pointPadding: 0.1,
          groupPadding: 0.1,
          dataLabels: {
            // enabled: true,
            format: isQuantity ? '{y:,.0f} Qty' : 'UGX {y:,.0f}',
            style: {
              fontSize: '10px',
              textOutline: 'none'
            }
          }
        }
      },
      series: data.map((item: any, index: number) => ({
        type: 'column',
        name: item[xAxisKey],
        data: [item[yAxisKey]],
        color: item.color || colors[index % colors.length],
        showInLegend: true
      }))
    };

    return (
      <div className="w-full h-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  };

  // 3D Dual Column Chart for comparison (like visited vs total customers)
  const DualColumn3DChart = ({ data, series1Key, series1Name, series2Key, series2Name, xAxisKey = 'name', height = '400px' }: any) => {
    if (!data || data.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

  const options: Highcharts.Options = {
  chart: {
    type: 'column',
    backgroundColor: 'transparent',
    options3d: {
      enabled: true,
      alpha: 5,
      beta: 0,
      depth: 50,
      viewDistance: 25
    },
    height: height
  },
  title: {
    text: '',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f2937'
    }
  },
  credits: {
    enabled: false
  },
  xAxis: {
    categories: data.map((item: any) => item[xAxisKey]),
    labels: {
      skew3d: true,
      style: {
        fontSize: '11px',
        color: '#4b5563'
      }
    },
    title: {
      text: ''
    }
  },
  yAxis: {
    title: {
      text: 'Number of Customers',
      style: {
        color: '#4b5563'
      }
    },
    labels: {
      formatter: function() {
        return this.value?.toLocaleString();
      },
      style: {
        color: '#4b5563'
      }
    }
  },
  tooltip: {
    shared: true,
    formatter: function() {
      let tooltip = `<b>${this.x}</b><br/>`;
      this.points?.forEach((point: any) => {
        tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y?.toLocaleString()}</b><br/>`;
      });
      return tooltip;
    },
    style: {
      fontSize: '12px'
    }
  },
  plotOptions: {
    column: {
      depth: 15, // Reduced depth for thinner appearance
      borderWidth: 0,
      grouping: true,
      groupPadding: 0.25, // Increased to create more space between groups
      pointPadding: 0.2, // Added to create space between bars in same group
      pointWidth: 15, // Explicitly set bar width to make them thinner
      dataLabels: {
        enabled: false // Disable data labels to reduce clutter on thin bars
      }
    }
  },
  series: [{
    type: 'column',
    name: series1Name,
    data: data.map((item: any) => item[series1Key] || 0),
    color: '#4f46e5', // Indigo
    pointWidth: 25 // Even thinner for individual series
  }, {
    type: 'column',
    name: series2Name,
    data: data.map((item: any) => item[series2Key] || 0),
    color: '#10b981', // Emerald
    pointWidth: 25 // Even thinner for individual series
  }]
};

    return (
      <div className="w-full h-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  };

  // Highcharts 3D Pie wrapper
  const Highcharts3DPie = ({ data, title = '', height = '55%', innerRadius = 0, outerRadius = 100 }: any) => {
    useEffect(() => {
      if (typeof window !== 'undefined' && Highcharts) {
        try {
          if (!(Highcharts as any).__3dLoaded) {
            import('highcharts/highcharts-3d').then((mod: any) => {
              if (typeof mod.default === 'function') {
                (mod.default as any)(Highcharts);
              }
              (Highcharts as any).__3dLoaded = true;
            });
          }
        } catch (e) {
          // ignore if module load fails
        }
      }
    }, []);

    const seriesData = (Array.isArray(data) ? data : []).map((d: any) => ({
      name: d.name,
      y: d.value || 0,
      color: d.color || undefined,
      sliced: !!d.sliced,
    }));

    const isQuantity = searchType === 'quantity';

    const options: any = {
      chart: {
        type: 'pie',
        options3d: { enabled: true, alpha: 45, beta: 0, depth: 45 },
        backgroundColor: null,
        height,
      },
      credits: { enabled: false },
      title: { text: title || null },
      legend: { enabled: true, align: 'center', verticalAlign: 'top', layout: 'horizontal', itemStyle: { fontSize: '10px' }, y: 8 },
      tooltip: { pointFormat: isQuantity ? '<b>{point.percentage:.1f}%</b><br/>{point.y:,.0f} Qty' : '<b>{point.percentage:.1f}%</b><br/>UGX {point.y:,.0f}' },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          depth: 45,
          innerSize: innerRadius && outerRadius ? `${Math.round((innerRadius / outerRadius) * 100)}%` : undefined,
          dataLabels: {
            enabled: false
          },
          showInLegend: true,
        },
      },
      series: [{ name: title || 'Data', data: seriesData }],
    };

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  };

  // Transform API data for charts
  const companyData = dashboardData?.charts?.company_sales?.map((item: any, idx: number) => ({
    name: item.company_name,
    value: item.value || 0,
    color: companyColors[idx % companyColors.length]
  })) || [];

  const regionData = dashboardData?.charts?.region_sales?.map((item: any, idx: number) => ({
    name: item.region_name,
    value: item.value || 0,
    color: regionColors[idx % regionColors.length]
  })) || [];

  const areaData = dashboardData?.charts?.area_sales_bar?.map((item: any, idx: number) => ({
    name: item.area_name,
    value: item.value || 0,
    color: areaColors[idx % areaColors.length]
  })) || [];

  const warehouseData = dashboardData?.charts?.warehouse_sales_bar?.map((item: any, idx: number) => ({
    name: item.warehouse_name,
    value: item.value || 0,
    color: warehouseColors[idx % warehouseColors.length]
  })) || [];

  const salesmanData = dashboardData?.charts?.salesman_sales_bar?.map((item: any, idx: number) => ({
    name: item.salesman_name,
    value: item.value || 0,
    color: salesmanColors[idx % salesmanColors.length]
  })) || [];

  // Region-specific charts
  const regionContributionData = dashboardData?.charts?.region_contribution_top_item?.map((item: any, idx: number) => ({
    regionName: item.region_name,
    itemName: item.item_name,
    value: item.value || 0,
    color: regionColors[idx % regionColors.length]
  })) || [];

  const regionVisitedCustomerData = dashboardData?.charts?.region_visited_customer_trend || [];

  const totalVisitedByRegion = (regionVisitedCustomerData || []).reduce((s: number, r: any) => s + (r.visited_customers || 0), 0);
  const totalCustomersByRegion = (regionVisitedCustomerData || []).reduce((s: number, r: any) => s + (r.total_customers || 0), 0);

  // Area-specific charts
  const areaContributionData = dashboardData?.charts?.area_contribution_top_item?.map((item: any, idx: number) => ({
    areaName: item.area_name,
    itemName: item.item_name,
    value: item.value || 0,
    color: areaColors[idx % areaColors.length]
  })) || [];

  const areaVisitedCustomerData = dashboardData?.charts?.area_visited_customer_trend || [];

  // Company sales trend data - sorted chronologically
  const companySalesTrend = dashboardData?.charts?.company_sales_trend 
    ? [...dashboardData.charts.company_sales_trend].sort((a: any, b: any) => {
        const monthOrder = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const aMonth = monthOrder.indexOf(a.period.split('-')[0]);
        const bMonth = monthOrder.indexOf(b.period.split('-')[0]);
        return aMonth - bMonth;
      })
    : [];

  // Region sales trend data
  const regionSalesTrend = dashboardData?.charts?.region_sales_trend 
    ? [...dashboardData.charts.region_sales_trend].sort((a: any, b: any) => {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const aMonth = monthOrder.indexOf(a.period.split('-')[0]);
        const bMonth = monthOrder.indexOf(b.period.split('-')[0]);
        return aMonth - bMonth;
      })
    : [];

  // Area sales trend data
  const areaSalesTrend = dashboardData?.charts?.area_sales_trend 
    ? [...dashboardData.charts.area_sales_trend].sort((a: any, b: any) => {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const aMonth = monthOrder.indexOf(a.period.split('-')[0]);
        const bMonth = monthOrder.indexOf(b.period.split('-')[0]);
        return aMonth - bMonth;
      })
    : [];

  // Top salesmen data from tables (take top 10)
  const topSalesmenData = dashboardData?.tables?.top_salesmen?.slice(0, 10).map((item: any, idx: number) => ({
    name: item.salesman,
    value: item.value || 0,
    color: salesmanColors[idx % salesmanColors.length]
  })) || [];

  // Top warehouses data from tables (take top 10)
  const topWarehousesData = dashboardData?.tables?.top_warehouses?.slice(0, 10).map((item: any, idx: number) => ({
    name: item['?column?'] || item.warehouse_name,
    value: item.value || 0,
    color: warehouseColors[idx % warehouseColors.length]
  })) || [];

  // Get the data level from API response
  const dataLevel = dashboardData?.level || 'company';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 mt-5">
        <Icon icon="eos-icons:loading" width="48" height="48" className="text-blue-600 mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading dashboard data...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-20 mt-5">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-lg font-medium text-gray-700">Failed to load dashboard</p>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!dashboardData || !dashboardData.charts) {
    return (
      <div className="flex flex-col justify-center items-center py-20 mt-5">
        <BarChart3 size={48} className="text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700">No data available</p>
        <p className="text-sm text-gray-500 mt-2">Select filters and date range, then click the Dashboard button</p>
      </div>
    );
  }

  // Validation: Only show graphs for company, region, area, or warehouse levels
  const validDataLevels = ['company', 'region', 'area', 'warehouse'];
  if (!validDataLevels.includes(dataLevel)) {
    // Show snackbar message
    if (typeof window !== 'undefined') {
      showSnackbar('Invalid filter selection! Dashboard can only be displayed with Company, Region, Area, or Warehouse filters. Please select one of these valid filters.', 'warning');
    }
    
    return (
      <div className="flex flex-col justify-center items-center py-20 mt-5">
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle size={56} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-700 text-center mb-3">Dashboard Cannot Be Loaded</h3>
          <p className="text-base text-red-600 text-center mb-4">
            Invalid filter selection detected. Dashboard is not available for the current filter combination.
          </p>
          <div className="bg-white rounded-md p-4 border border-red-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Required Filters:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Company</li>
              <li>Region</li>
              <li>Area</li>
              <li>Warehouse</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Please select one of the valid filters above to view the dashboard
          </p>
        </div>
      </div>
    );
  }

  const totalCompany = companyData.reduce((sum: number, item: any) => sum + item.value, 0);
  const totalRegion = regionData.reduce((sum: number, item: any) => sum + item.value, 0);

  // Table data transformations
  const topSalesmenTable = dashboardData?.tables?.top_salesmen?.slice(0, 10) || [];
  const topWarehousesTable = dashboardData?.tables?.top_warehouses?.slice(0, 10) || [];
  const topCustomersTable = dashboardData?.tables?.top_customers?.slice(0, 10).map((customer: any) => ({
    name: customer.customer_name,
    contact: customer.contact,
    warehouse: customer.warehouse_name,
    value: customer.value
  })) || [];
  const topItemsTable = dashboardData?.tables?.top_items?.slice(0, 10).map((item: any) => ({
    name: item.item_name,
    value: item.value
  })) || [];

  // Pie chart data transformations
  const topSalesmenChartData = topSalesmenTable.slice(0, 10).map((salesman: any, idx: number) => ({
    name: salesman.salesman,
    value: salesman.value || 0,
    color: salesmanColors[idx % salesmanColors.length]
  }));

  const topWarehousesChartData = topWarehousesTable.slice(0, 10).map((warehouse: any, idx: number) => ({
    name: warehouse['?column?'] || warehouse.warehouse_name,
    value: warehouse.value || 0,
    color: warehouseColors[idx % warehouseColors.length]
  }));

  const topCustomersChartData = topCustomersTable.slice(0, 10).map((customer: any, idx: number) => ({
    name: customer.name,
    value: customer.value || 0,
    color: ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#fb7185', '#fdba74', '#fde047'][idx % 10]
  }));

  const topItemsChartData = topItemsTable.slice(0, 10).map((item: any, idx: number) => ({
    name: item.name,
    value: item.value || 0,
    color: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899'][idx % 10]
  }));

  const totalSalesmen = topSalesmenChartData.reduce((sum: number, item: any) => sum + item.value, 0);
  const totalWarehouses = topWarehousesChartData.reduce((sum: number, item: any) => sum + item.value, 0);
  const totalCustomers = topCustomersChartData.reduce((sum: number, item: any) => sum + item.value, 0);
  const totalItems = topItemsChartData.reduce((sum: number, item: any) => sum + item.value, 0);

  // Custom Pie Chart component with 3D exploded style
  const ExplodedPieChart = ({ data, innerRadius = 0, outerRadius = 80, labelType = 'percentage' }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Ensure data is an array
    const chartData = Array.isArray(data) ? data : [];
    const total = chartData.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

    if (chartData.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full h-full relative">
        <Highcharts3DPie data={chartData} innerRadius={innerRadius} outerRadius={outerRadius} />
      </div>
    );
  };

  // Donut Chart with exploded effect
  const ExplodedDonutChart = ({ data, innerRadius = 60, outerRadius = 100, labelType = 'percentage' }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Ensure data is an array
    const chartData = Array.isArray(data) ? data : [];
    const total = chartData.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

    if (chartData.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full h-full  relative">
        <Highcharts3DPie data={chartData} innerRadius={innerRadius} outerRadius={outerRadius} />
      </div>
    );
  };

  // Neon Trend Area Chart Component with White Background
  const NeonTrendAreaChart = ({ data, areas, title = 'Weekly Area Sales Trend' }: any) => {
    const [hiddenAreas, setHiddenAreas] = useState<string[]>([]);

    if (!data || data.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    const handleLegendClick = (areaName: string) => {
      setHiddenAreas(prev => 
        prev.includes(areaName) 
          ? prev.filter(a => a !== areaName)
          : [...prev, areaName]
      );
    };

    const isQuantity = searchType === 'quantity';

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              {/* Create gradient definitions for each area */}
              {areas.map((areaName: string, index: number) => {
                const colorSet = neonAreaColors[index % neonAreaColors.length];
                return (
                  <linearGradient
                    key={`gradient-${areaName}`}
                    id={`gradient-${areaName}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={colorSet.line} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={colorSet.line} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
              
              {/* Glow filter for lines */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* White background grid */}
            <CartesianGrid 
              stroke="#e5e7eb" 
              strokeDasharray="3 3" 
              vertical={false}
            />
            
            {/* X-Axis with light styling */}
            <XAxis 
              dataKey="period"
              axisLine={{ stroke: '#d1d5db' }}
              tick={{ fill: '#0964e2ff', fontSize: 11 }}
              tickLine={{ stroke: '#d1d5db' }}
              dy={5}
            />
            
            {/* Y-Axis with light styling */}
            <YAxis 
              axisLine={{ stroke: '#d1d5db' }}
              tick={{ fill: '#4b5563', fontSize: 11 }}
              tickLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => isQuantity ? `${value.toLocaleString()}` : `UGX ${(value / 1000000).toFixed(1)}M`}
            />
            
            {/* Custom tooltip with light theme */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                color: '#1f2937'
              }}
              labelStyle={{ 
                color: '#374151',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}
              formatter={(value: any, name: any) => [
                <span key="value" style={{ color: neonAreaColors[areas.indexOf(name) % neonAreaColors.length]?.line || '#00f2fe' }}>
                  {isQuantity ? `${value.toLocaleString()} Qty` : `UGX ${value.toLocaleString()}`}
                </span>,
                <span key="name" style={{ color: '#6b7280' }}>
                  {name}
                </span>
              ]}
              itemStyle={{ padding: '4px 0' }}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            />
            
            {/* Custom interactive legend */}
            <Legend 
              verticalAlign="top"
              align="right"
              wrapperStyle={{
                paddingBottom: '20px',
                color: '#1f2937'
              }}
              onClick={(e) => e.value && handleLegendClick(e.value)}
              formatter={(value) => (
                <span style={{ 
                  color: hiddenAreas.includes(value) ? '#9ca3af' : '#4b5563', 
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: hiddenAreas.includes(value) ? 'line-through' : 'none'
                }}>
                  {value}
                </span>
              )}
            />
            
            {/* Render each area with neon styling */}
            {areas.map((areaName: string, index: number) => {
              const colorSet = neonAreaColors[index % neonAreaColors.length];
              
              return (
                <Area
                  key={areaName}
                  type="monotone"
                  dataKey={areaName}
                  stroke={colorSet.line}
                  strokeWidth={3}
                  fill={`url(#gradient-${areaName})`}
                  fillOpacity={0.2}
                  dot={{
                    r: 4,
                    fill: colorSet.line,
                    stroke: '#ffffff',
                    strokeWidth: 2
                  }}
                  activeDot={{
                    r: 6,
                    fill: colorSet.line,
                    stroke: '#ffffff',
                    strokeWidth: 2
                  }}
                  hide={hiddenAreas.includes(areaName)}
                  // Add subtle animation
                  isAnimationActive={true}
                  animationBegin={index * 200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              );
            })}
            
            {/* Add a subtle background grid */}
            <CartesianGrid 
              stroke="#e5e7eb" 
              strokeDasharray="3 3" 
              vertical={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Maximized Modal Component
  const MaximizedView = (props: any = {}) => {
    if (!selectedMaxView) return null;

    // Maximized view versions of the charts
    const MaximizedExplodedPieChart = ({ data, title, innerRadius = 0, outerRadius = 150 }: any) => {
      const chartData = Array.isArray(data) ? data : [];

      if (chartData.length === 0) {
        return (
          <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        );
      }

      return (
        <div className="relative w-full h-[500px]">
          <Highcharts3DPie data={chartData} title={title} height={400} innerRadius={innerRadius} outerRadius={outerRadius} />
        </div>
      );
    };

    // Determine which trend data to use based on data level
    let trendData = [];
    let trendTitle = '';
    
    if (selectedMaxView === 'trend') {
      if (dataLevel === 'company') {
        trendData = companySalesTrend;
        trendTitle = 'Company Sales Trend';
      } else if (dataLevel === 'region') {
        trendData = regionSalesTrend;
        trendTitle = 'Region Sales Trend';
      } else if (dataLevel === 'area') {
        trendData = areaSalesTrend;
        trendTitle = 'Area Sales Trend';
      } else if (dataLevel === 'warehouse') {
        const wh = dashboardData?.charts?.warehouse_trend || [];
        const periods = Array.from(new Set(wh.map((r: any) => r.period))) as string[];
        trendData = (periods as string[]).map((p: string) => ({
          period: p,
          value: wh.filter((x: any) => x.period === p).reduce((s: number, x: any) => s + (x.value || 0), 0)
        }));
        trendTitle = 'Warehouse Sales Trend';
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedMaxView === 'company' && 'Company Sales Details'}
              {selectedMaxView === 'region' && 'Region Sales Details'}
              {selectedMaxView === 'regionVisited' && 'Visit Customer Trend - Region Details'}
              {selectedMaxView === 'warehouseSales' && 'Warehouse Sales Details'}
              {selectedMaxView === 'area' && 'Area Sales Details'}
              {selectedMaxView === 'areaPerformance' && 'Area Performance Details'}
              {selectedMaxView === 'areaVisited' && 'Area Visited Customers Details'}
              {selectedMaxView === 'areaTrend' && 'Area Sales Trend Details'}
              {selectedMaxView === 'trend' && `${trendTitle} Details`}
              {selectedMaxView === 'salesmen' && 'Top Salesmen Details'}
              {selectedMaxView === 'warehouses' && 'Top Warehouses Details'}
              {selectedMaxView === 'customers' && 'Top Customers Details'}
              {selectedMaxView === 'items' && 'Top Items Details'}
            </h2>
            <button 
              onClick={() => setSelectedMaxView(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Company View */}
            {selectedMaxView === 'company' && companyData.length > 0 && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Company Sales Distribution</h3>
                  <MaximizedExplodedPieChart data={companyData} title="Company Sales" outerRadius={200} />
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Company Sales Table</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Company Name</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Sales Value</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyData.map((company: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                          <td className="px-6 py-4 text-gray-800 font-medium">{company.name}</td>
                          <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                            UGX {company.value?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            {((company.value / totalCompany) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Region Visited Customers View (detailed) */}
            {selectedMaxView === 'regionVisited' && (regionVisitedCustomerData.length > 0) && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Visit Customer Trend by Region (Detailed)</h3>
                  <div className="w-full h-[600px]">
                    <DualColumn3DChart 
                      data={regionVisitedCustomerData}
                      xAxisKey="region_name"
                      series1Key="total_customers"
                      series1Name="Total Customers"
                      series2Key="visited_customers"
                      series2Name="Visited Customers"
                      height="500px"
                    />
                  </div>
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Visit Customer Trend Data Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Region</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Visited Customers</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Total Customers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regionVisitedCustomerData.map((r: any, i: number) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-800">{r.region_name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">{(r.visited_customers || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-gray-800">{(r.total_customers || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Region View */}
            {selectedMaxView === 'region' && (
              ((regionData.length > 0) || ((dashboardData?.tables?.region_performance || []).length > 0)) && (
                ((dashboardData?.tables?.region_performance || []).length > 0) ? (
                  <>
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Region Performance</h3>
                      <MaximizedExplodedPieChart 
                        data={dashboardData.tables.region_performance.map((r: any, i: number) => ({ 
                          name: r.region_name, 
                          value: r.value || 0, 
                          color: regionColors[i % regionColors.length] 
                        }))} 
                        title="Region Performance"
                        innerRadius={100}
                        outerRadius={200}
                      />
                    </div>
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Region Performance Table</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                              <th className="px-6 py-4 text-left font-semibold text-gray-700">Region Name</th>
                              <th className="px-6 py-4 text-right font-semibold text-gray-700">Sales Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(dashboardData?.tables?.region_performance || []).map((row: any, index: number) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                                <td className="px-6 py-4 text-gray-800 font-medium">{row.region_name}</td>
                                <td className="px-6 py-4 text-right text-gray-800 font-semibold">UGX { (row.value || 0).toLocaleString() }</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Region Sales Distribution</h3>
                      <MaximizedExplodedPieChart data={regionData} title="Region Sales" innerRadius={100} outerRadius={200} />
                    </div>
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Region Sales Table</h3>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-700">Region Name</th>
                            <th className="px-6 py-4 text-right font-semibold text-gray-700">Sales Value</th>
                            <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regionData.map((region: any, index: number) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                              <td className="px-6 py-4 text-gray-800 font-medium">{region.name}</td>
                              <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                                UGX {region.value?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600">
                                {((region.value / totalRegion) * 100).toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              )
            )}

            {/* Trend View - Shows both Graph and Table */}
            {selectedMaxView === 'trend' && trendData.length > 0 && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{trendTitle}</h3>
                  <div className="w-full h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="trendGradientMax" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tickFormatter={(value) => `UGX ${(value / 1000000).toFixed(1)}M`}
                          tick={{ fontSize: 13 }}
                        />
                        <Tooltip 
                          formatter={(value: any) => `UGX ${value.toLocaleString()}`}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Area 
                          type="monotone"
                          dataKey="value"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fill="url(#trendGradientMax)"
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, fill: '#6d28d9' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Trend Data Table</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Period</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Sales Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendData.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-800 font-medium">{item.period}</td>
                          <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                            UGX {item.value?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Salesmen View */}
            {selectedMaxView === 'salesmen' && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Salesmen Distribution</h3>
                  <MaximizedExplodedPieChart data={topSalesmenChartData} title="Top Salesmen" outerRadius={180} />
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Salesmen Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Salesman Name</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">{searchType === 'quantity' ? 'Quantity' : 'Sales Value'}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSalesmenChartData.map((salesman: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{salesman.name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                              {searchType === 'quantity' ? `${salesman.value?.toLocaleString()} Qty` : `UGX ${salesman.value?.toLocaleString()}`}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              {((salesman.value / totalSalesmen) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Warehouses View */}
            {selectedMaxView === 'warehouses' && topWarehousesChartData.length > 0 && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Warehouses Distribution</h3>
                  <MaximizedExplodedPieChart data={topWarehousesChartData} title="Top Warehouses" outerRadius={180} />
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Warehouses Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Warehouse Name</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">{searchType === 'quantity' ? 'Quantity' : 'Sales Value'}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topWarehousesChartData.map((warehouse: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{warehouse.name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                              {searchType === 'quantity' ? `${warehouse.value?.toLocaleString()} Qty` : `UGX ${warehouse.value?.toLocaleString()}`}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              {((warehouse.value / totalWarehouses) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Customers View */}
            {selectedMaxView === 'customers' && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Customers Distribution</h3>
                  <MaximizedExplodedPieChart data={topCustomersChartData} title="Top Customers" outerRadius={180} />
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Customers Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Customer Name</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">{searchType === 'quantity' ? 'Quantity' : 'Sales Value'}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCustomersChartData.map((customer: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{customer.name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                              {searchType === 'quantity' ? `${customer.value?.toLocaleString()} Qty` : `UGX ${customer.value?.toLocaleString()}`}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              {((customer.value / totalCustomers) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Items View */}
            {selectedMaxView === 'items' && topItemsChartData.length > 0 && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Items Distribution</h3>
                  <MaximizedExplodedPieChart data={topItemsChartData} title="Top Items" outerRadius={180} />
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Items Table</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">Item Name</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">{searchType === 'quantity' ? 'Quantity' : 'Sales Value'}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topItemsChartData.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                              {searchType === 'quantity' ? `${item.value?.toLocaleString()} Qty` : `UGX ${item.value?.toLocaleString()}`}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              {((item.value / totalItems) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Area Performance View */}
            {selectedMaxView === 'areaPerformance' && props.areaPerformanceData && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Area Performance Distribution</h3>
                  <div className="w-full h-[550px]">
                    <ExplodedDonutChart 
                      data={props.areaPerformanceData}
                      innerRadius={40}
                      outerRadius={80}
                    />
                  </div>
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Area Performance Table</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Area Name</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Performance Value</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.areaPerformanceData.map((area: any, index: number) => {
                        const totalPerformance = props.areaPerformanceData.reduce((sum: number, a: any) => sum + (a.value || 0), 0);
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{area.name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                              UGX {area.value?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              {((area.value / totalPerformance) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Area Visited Customers View */}
            {selectedMaxView === 'areaVisited' && props.areaVisitedCustomerData && props.areaVisitedCustomerData.length > 0 && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Area Visited Customers Trend</h3>
                  <div className="w-full h-[400px]">
                    <DualColumn3DChart 
                      data={props.areaVisitedCustomerData}
                      xAxisKey="area_name"
                      series1Key="total_customers"
                      series1Name="Total Customers"
                      series2Key="visited_customers"
                      series2Name="Visited Customers"
                      height="350px"
                    />
                  </div>
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Area Visited Customers Table</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Area Name</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Total Customers</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Visited Customers</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Visit Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.areaVisitedCustomerData.map((area: any, index: number) => {
                        const visitRate = area.total_customers > 0 ? ((area.visited_customers / area.total_customers) * 100).toFixed(2) : 0;
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{area.area_name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">{area.total_customers?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">{area.visited_customers?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right text-gray-600">{visitRate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Warehouse Level - Area Contribution View */}
            {selectedMaxView === 'area' && dataLevel === 'warehouse' && props.warehouseAreaContributionData && props.warehouseAreaContributionData.length > 0 && (
              <>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Area Contribution Distribution</h3>
                  <div className="w-full h-[400px]">
                    <MaximizedExplodedPieChart data={props.warehouseAreaContributionData} title="Warehouse Area Contribution" outerRadius={150} />
                  </div>
                </div>
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Area Contribution Table</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">Area Name</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Contribution Value</th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.warehouseAreaContributionData.map((area: any, index: number) => {
                        const totalContribution = props.warehouseAreaContributionData.reduce((sum: number, a: any) => sum + (a.value || 0), 0);
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-800 font-medium">{area.name}</td>
                            <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                              UGX {area.value?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600">
                              {((area.value / totalContribution) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If API returned region-level data, render the region-specific 4-row layout
  if (dataLevel === 'region') {
    // Prepare region contribution data for pie chart
    const regionContributionPieData = (() => {
      const data = (dashboardData?.charts?.region_contribution_top_item || []).reduce((acc: any, it: any) => {
        const key = it.region_name || 'Unknown';
        acc[key] = (acc[key] || 0) + (it.value || 0);
        return acc;
      }, {} as Record<string, number>);
      
      // Convert object to array for pie chart
      return Object.entries(data).map(([name, value], i) => ({
        name,
        value,
        color: areaColors[i % areaColors.length]
      }));
    })();

    // Prepare region performance data
    const regionPerformanceData = (dashboardData?.tables?.region_performance || []).map((r: any, i: number) => ({ 
      name: r.region_name, 
      value: r.value || 0, 
      color: regionColors[i % regionColors.length] 
    }));

    // Row3 pivot: build time-series per region
    const periods = Array.from(new Set(regionSalesTrend.map((r: any) => r.period)));
    const regionNames = Array.from(new Set(regionSalesTrend.map((r: any) => r.region_name)));
    const trendSeries = periods.map((p: string) => {
      const obj: any = { period: p };
      regionNames.forEach((rn: string) => {
        const item = regionSalesTrend.find((x: any) => x.period === p && x.region_name === rn);
        obj[rn] = item ? item.value || 0 : 0;
      });
      return obj;
    });

    return (
      <div className="mt-5 space-y-6">
        <MaximizedView />

        {/* Row 1 - Overview: Left Pie (region contribution by item), Right Donut (region performance) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Region Contribution by Top Item (aggregate by region) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Region Contribution (Top Items)</h3>
              <button onClick={() => setSelectedMaxView('items')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              <ExplodedPieChart 
                data={regionContributionPieData}
                outerRadius={90}
              />
            </div>
          </div>

          {/* Right: Region Performance (donut) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Region Performance</h3>
              <button onClick={() => setSelectedMaxView('region')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              <ExplodedDonutChart 
                data={regionPerformanceData}
                innerRadius={60}
                outerRadius={100}
              />
            </div>
          </div>
        </div>

        {/* Row 2 - Customer Coverage: 3D Column Chart */}
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Visit Customer Trend by Region</h3>
            <button onClick={() => setSelectedMaxView('regionVisited')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
          </div>
          <div className="w-full h-[360px]">
            {regionVisitedCustomerData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <DualColumn3DChart 
                data={regionVisitedCustomerData}
                xAxisKey="region_name"
                series1Key="total_customers"
                series1Name="Total Customers"
                series2Key="visited_customers"
                series2Name="Visited Customers"
                height="320px"
              />
            )}
          </div>
        </div>

        {/* Row 3 - Sales Trend: Neon Area Chart split by region_name */}
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Region Sales Trend</h3>
            <button onClick={() => setSelectedMaxView('trend')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
          </div>
          <div className="w-full h-[380px]">
            <NeonTrendAreaChart data={trendSeries} areas={regionNames} title="Weekly Region Sales Trend" />
          </div>
        </div>

        {/* Row 4 - Top Performers: Salesmen and Customers (Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Salesmen Chart (Pie) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Salesmen</h3>
              <button onClick={() => setSelectedMaxView('salesmen')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              <ExplodedPieChart data={topSalesmenChartData} outerRadius={90} />
            </div>
          </div>

          {/* Top Customers Chart (Bar) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
              <button onClick={() => setSelectedMaxView('customers')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              <ExplodedPieChart data={topCustomersChartData} outerRadius={90} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If API returned warehouse-level data, render the warehouse-specific 4-row layout
  if (dataLevel === 'warehouse') {
    const warehouseTrend = dashboardData?.charts?.warehouse_trend || [];
    const warehouseSales = dashboardData?.charts?.warehouse_sales || [];
    const regionContribution = dashboardData?.charts?.region_contribution || [];
    const areaContribution = dashboardData?.charts?.area_contribution || [];

    // Warehouse multi-select dropdown
    const WarehouseSelector = () => {
      const [isOpen, setIsOpen] = useState(false);
      const dropdownRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

      const handleToggleWarehouse = (warehouseLabel: string) => {
        setSelectedWarehouses(prev => {
          const isSelected = prev.includes(warehouseLabel);
          return isSelected 
            ? prev.filter(w => w !== warehouseLabel)
            : [...prev, warehouseLabel];
        });
      };

      const handleSelectAll = () => {
        setSelectedWarehouses(warehouseSales.map((w: any) => w.warehouse_label));
      };

      const handleClearAll = () => {
        setSelectedWarehouses([]);
      };

      const displayText = selectedWarehouses.length === 0 
        ? `All Warehouses (${warehouseSales.length})` 
        : `${selectedWarehouses.length} warehouse${selectedWarehouses.length > 1 ? 's' : ''} selected`;

      return (
        <div className="relative inline-block" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          >
            <span>{displayText}</span>
            <Icon icon="mdi:chevron-down" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} width={16} />
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  Clear
                </button>
              </div>
              <div className="py-1">
                {warehouseSales.map((warehouse: any, idx: number) => (
                  <label
                    key={idx}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWarehouses.includes(warehouse.warehouse_label)}
                      onChange={() => handleToggleWarehouse(warehouse.warehouse_label)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 truncate flex-1">{warehouse.warehouse_label}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      UGX {((warehouse.value || 0) / 1000000).toFixed(1)}M
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    // Filter warehouse sales based on selection
    const getFilteredWarehouses = () => {
      if (selectedWarehouses.length === 0) {
        return warehouseSales;
      }
      return warehouseSales.filter((w: any) => selectedWarehouses.includes(w.warehouse_label));
    };

    const filteredWarehouses = getFilteredWarehouses();

    // Prepare region contribution data for pie chart
    const regionContributionPieData = (() => {
      const data = regionContribution.reduce((acc: any, it: any) => {
        const key = it.region_name || it.region_label || 'Unknown';
        acc[key] = (acc[key] || 0) + (it.value || 0);
        return acc;
      }, {} as Record<string, number>);
      
      // Convert object to array for pie chart
      return Object.entries(data).map(([name, value], i) => ({
        name,
        value,
        color: regionColors[i % regionColors.length]
      }));
    })();

    // Prepare area contribution data for donut chart
    const areaContributionPieData = areaContribution.map((r: any, i: number) => ({ 
      name: r.area_name || r.area_label, 
      value: r.value || 0, 
      color: areaColors[i % areaColors.length] 
    }));

    const periods = Array.from(new Set(warehouseTrend.map((r: any) => r.period))) as string[];
    const warehouseNames = Array.from(new Set(warehouseTrend.map((r: any) => r.warehouse_label))) as string[];
    const trendSeries: any[] = periods.map((p: string) => {
      const obj: any = { period: p };
      warehouseNames.forEach((wn: string) => {
        const item = warehouseTrend.find((x: any) => x.period === p && x.warehouse_label === wn);
        obj[wn] = item ? item.value || 0 : 0;
      });
      return obj;
    });

    return (
      <div className="mt-5 space-y-6">
        <MaximizedView warehouseAreaContributionData={areaContributionPieData} />

        {/* Row 1 - Overview: Left Pie (region contribution), Right Donut (area contribution) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Region Contribution</h3>
              <button onClick={() => setSelectedMaxView('items')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-[370px]">
              {regionContributionPieData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <ExplodedPieChart 
                  data={regionContributionPieData}
                  outerRadius={90}
                />
              )}
            </div>
          </div>

          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Area Contribution</h3>
              <button onClick={() => setSelectedMaxView('area')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              {areaContributionPieData.length === 0 ? (
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <ExplodedDonutChart 
                  data={areaContributionPieData}
                  innerRadius={60}
                  outerRadius={100}
                />
              )}
            </div>
          </div>
        </div>

        {/* Row 2 - Warehouse Sales: Show both chart and table if >= 10 selected, only table if < 10 */}
        {filteredWarehouses.length >= 10 ? (
          <>
            {/* 3D Column Chart for 10+ warehouses */}
            <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">Warehouse Sales</h3>
                  <WarehouseSelector />
                </div>
                <button onClick={() => setSelectedMaxView('warehouseSales')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
              </div>
              <div className="w-full h-[360px]">
                {filteredWarehouses.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    <AlertCircle size={16} className="mr-2" /> No data available
                  </div>
                ) : (
                  <Column3DChart 
                    data={filteredWarehouses}
                    title="Warehouse Sales"
                    xAxisKey="warehouse_label"
                    yAxisKey="value"
                    colors={warehouseColors}
                    height="320px"
                  />
                )}
              </div>
            </div>

            {/* Table for 10+ warehouses */}
            <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Warehouse Sales Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700">Warehouse Name</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-700">Sales Value</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWarehouses.map((warehouse: any, index: number) => {
                      const totalSales = filteredWarehouses.reduce((sum: number, w: any) => sum + (w.value || 0), 0);
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                          <td className="px-6 py-4 text-gray-800 font-medium">{warehouse.warehouse_label}</td>
                          <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                            UGX {(warehouse.value || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">
                            {((warehouse.value / totalSales) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : filteredWarehouses.length > 0 ? (
          /* Table only for < 10 warehouses */
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">Warehouse Sales</h3>
                <WarehouseSelector />
              </div>
              <button onClick={() => setSelectedMaxView('warehouseSales')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Rank</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700"></th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Sales Value</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.map((warehouse: any, index: number) => {
                    const totalSales = filteredWarehouses.reduce((sum: number, w: any) => sum + (w.value || 0), 0);
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{warehouse.warehouse_label}</td>
                        <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                          UGX {(warehouse.value || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {((warehouse.value / totalSales) * 100).toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Row 3 - Sales Trend: Neon Area Chart split by warehouse_label */}
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Warehouse Sales Trend</h3>
            <button onClick={() => setSelectedMaxView('trend')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
          </div>
          <div className="w-full h-[500px]">
            {trendSeries.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                <AlertCircle size={16} className="mr-2" /> No data available
              </div>
            ) : (
              <NeonTrendAreaChart data={trendSeries} areas={warehouseNames} title="Weekly Warehouse Sales Trend" />
            )}
          </div>
        </div>

        {/* Row 4 - Top Items + Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Items</h3>
              <button onClick={() => setSelectedMaxView('items')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-[300px]">
              { (dashboardData?.tables?.top_items || []).length === 0 ? (
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <ExplodedPieChart 
                  data={(dashboardData?.tables?.top_items || []).map((t: any, i: number) => ({ 
                    name: t.item_name || t.name, 
                    value: t.value || 0, 
                    color: areaColors[i % areaColors.length] 
                  }))}
                  outerRadius={80}
                />
              )}
            </div>
          </div>

          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
              <button onClick={() => setSelectedMaxView('customers')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-[300px]">
              { (dashboardData?.tables?.top_customers || []).length === 0 ? (
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <Column3DChart 
                  data={(dashboardData?.tables?.top_customers || []).map((t: any, i: number) => ({ 
                    name: t.customer_name || t.name, 
                    value: t.value || 0, 
                    color: regionColors[i % regionColors.length] 
                  }))}
                  title=""
                  xAxisKey="name"
                  yAxisKey="value"
                  colors={regionColors}
                  height="260px"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If API returned area-level data, render the area-specific 4-row layout
  if (dataLevel === 'area') {
    // Prepare area contribution data for pie chart
    const areaContributionPieData = (() => {
      const data = areaContributionData.reduce((acc: any, it: any) => {
        const key = it.area_name || 'Unknown';
        acc[key] = (acc[key] || 0) + (it.value || 0);
        return acc;
      }, {} as Record<string, number>);
      
      // Convert object to array for pie chart
      return Object.entries(data).map(([name, value], i) => ({
        name,
        value,
        color: areaColors[i % areaColors.length]
      }));
    })();

    // Prepare area performance data
    const areaPerformanceData = (dashboardData?.tables?.area_performance || []).map((r: any, i: number) => ({ 
      name: r.area_name, 
      value: r.value || 0, 
      color: areaColors[i % areaColors.length] 
    }));

    // Row 3 pivot: build time-series per area
    const areaPeriods = Array.from(new Set(areaSalesTrend.map((r: any) => r.period)));
    const areaNames = Array.from(new Set(areaSalesTrend.map((r: any) => r.area_name)));
    const areaTrendSeries = areaPeriods.map((p: string) => {
      const obj: any = { period: p };
      areaNames.forEach((an: string) => {
        const item = areaSalesTrend.find((x: any) => x.period === p && x.area_name === an);
        obj[an] = item ? item.value || 0 : 0;
      });
      return obj;
    });

    return (
      <div className="mt-5 space-y-6">
        <MaximizedView areaPerformanceData={areaPerformanceData} areaVisitedCustomerData={areaVisitedCustomerData} />

        {/* Row 1 - Overview: Left Pie (area contribution by item), Right Donut (area performance) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Area Contribution by Top Item (aggregate by area) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Area Contribution (Top Items)</h3>
              <button onClick={() => setSelectedMaxView('items')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              {areaContributionPieData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <ExplodedPieChart 
                  data={areaContributionPieData}
                  outerRadius={90}
                />
              )}
            </div>
          </div>

          {/* Right: Area Performance (donut) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Area Performance</h3>
              <button onClick={() => setSelectedMaxView('areaPerformance')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              {areaPerformanceData.length === 0 ? (
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <ExplodedDonutChart 
                  data={areaPerformanceData}
                  innerRadius={60}
                  outerRadius={100}
                />
              )}
            </div>
          </div>
        </div>

        {/* Row 2 - Customer Coverage: 3D Column Chart */}
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Visited Customer Trend by Area</h3>
            <button onClick={() => setSelectedMaxView('areaVisited')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
          </div>
          <div className="w-full h-[360px]">
            {areaVisitedCustomerData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                <AlertCircle size={16} className="mr-2" /> No data available
              </div>
            ) : (
              <DualColumn3DChart 
                data={areaVisitedCustomerData}
                xAxisKey="area_name"
                series1Key="total_customers"
                series1Name="Total Customers"
                series2Key="visited_customers"
                series2Name="Visited Customers"
                height="320px"
              />
            )}
          </div>
        </div>

        {/* Row 3 - Sales Trend: Neon Area Chart split by area_name */}
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Weekly Area Sales Trend</h3>
            <button 
              onClick={() => setSelectedMaxView('trend')} 
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Maximize2 size={16} className="text-gray-600" />
            </button>
          </div>
          <div className="w-full h-[380px]">
            {areaTrendSeries.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <NeonTrendAreaChart data={areaTrendSeries} areas={areaNames} title="Weekly Area Sales Trend" />
            )}
          </div>
        </div>

        {/* Row 4 - Top Performers: Salesmen and Customers (Charts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Salesmen Chart (Pie) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Salesmen</h3>
              <button onClick={() => setSelectedMaxView('salesmen')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              {topSalesmenChartData.length === 0 ? (
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <ExplodedPieChart data={topSalesmenChartData} outerRadius={90} />
              )}
            </div>
          </div>

          {/* Top Customers Chart (Bar) */}
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
              <button onClick={() => setSelectedMaxView('customers')} className="p-1 hover:bg-gray-100 rounded"><Maximize2 size={16} /></button>
            </div>
            <div className="w-full h-80">
              {topCustomersChartData.length === 0 ? (
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <AlertCircle size={16} className="mr-2" /> No data available
                </div>
              ) : (
                <Column3DChart data={topCustomersChartData} title="" xAxisKey="name" yAxisKey="value" colors={['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#fb7185', '#fdba74', '#fde047']} height="280px" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-6">
      {/* Maximized View Modal */}
      <MaximizedView />

      {/* Row 1: Company Pie Chart + Region Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Sales - Pie Chart */}
        {companyData.length > 0 && (
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Company Sales</h3>
              <button 
                onClick={() => setSelectedMaxView('company')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="w-full h-[350px]">
              <ExplodedPieChart data={companyData} outerRadius={80} />
            </div>
          </div>
        )}

        {/* Region Sales - Donut Chart */}
        {regionData.length > 0 && (
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Region Sales</h3>
              <button 
                onClick={() => setSelectedMaxView('region')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="w-full h-[350px]">
              <ExplodedDonutChart data={regionData} innerRadius={50} outerRadius={80} />
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Area 3D Column Graph (Full Width) */}
      {areaData.length > 0 && (
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Area Sales</h3>
            <button 
              onClick={() => setSelectedMaxView('area')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="w-full h-[400px]">
            <Column3DChart 
              data={areaData}
              title="Area Sales"
              xAxisKey="name"
              yAxisKey="value"
              colors={areaColors}
              height="350px"
            />
          </div>
        </div>
      )}

      {/* Row 3: Trend Line Graph (Full Width) */}
      {(companySalesTrend.length > 0 || regionSalesTrend.length > 0 || areaSalesTrend.length > 0) && (
        <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {dataLevel === 'company' ? 'Company Sales Trend' : 
               dataLevel === 'region' ? 'Region Sales Trend' : 
               'Area Sales Trend'}
            </h3>
            <button 
              onClick={() => setSelectedMaxView('trend')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={
                dataLevel === 'company' ? companySalesTrend :
                dataLevel === 'region' ? regionSalesTrend :
                areaSalesTrend
              }>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  tickFormatter={(value) => `UGX ${(value / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any) => `UGX ${value.toLocaleString()}`}
                  labelFormatter={(label) => `${label}`}
                />
                <Area 
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, fill: '#6d28d9' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Row 4: Top Salesman + Top Warehouse Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Salesman Pie Chart */}
        {topSalesmenChartData.length > 0 && (
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Salesmen</h3>
              <button 
                onClick={() => setSelectedMaxView('salesmen')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="w-full h-[350px]">
              <ExplodedPieChart data={topSalesmenChartData} outerRadius={80} />
            </div>
          </div>
        )}

        {/* Top Warehouse Pie Chart */}
        {topWarehousesChartData.length > 0 && (
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Warehouses</h3>
              <button 
                onClick={() => setSelectedMaxView('warehouses')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="w-full h-[350px]">
              <ExplodedPieChart data={topWarehousesChartData} outerRadius={80} />
            </div>
          </div>
        )}
      </div>

      {/* Row 5: Top Customer + Top Item Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customer Bar Chart */}
        {topCustomersChartData.length > 0 && (
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
              <button 
                onClick={() => setSelectedMaxView('customers')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="w-full h-[350px]">
              <Column3DChart data={topCustomersChartData} title="" xAxisKey="name" yAxisKey="value" colors={['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#fb7185', '#fdba74', '#fde047']} height="310px" />
            </div>
          </div>
        )}

        {/* Top Item Bar Chart */}
        {topItemsChartData.length > 0 && (
          <div className="bg-white p-5 border rounded-lg shadow-sm border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Top Items</h3>
              <button 
                onClick={() => setSelectedMaxView('items')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="w-full h-[300px]">
              <Column3DChart data={topItemsChartData} title="" xAxisKey="name" yAxisKey="value" colors={['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899']} height="260px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SalesCharts, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.dashboardData === nextProps.dashboardData &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.searchType === nextProps.searchType
  );
});