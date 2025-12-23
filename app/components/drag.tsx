import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar, BarChart3, Table } from 'lucide-react';
import { Icon } from "@iconify-icon/react";
import axios from 'axios';
import SalesCharts from './SalesCharts';
import ExportButtons from './ExportButtons';
import { useSnackbar } from '@/app/services/snackbarContext';
import { usePagePermissions } from '@/app/(private)/utils/usePagePermissions';


// Define TypeScript interfaces
interface FilterChildItem {
  id: string;
  name: string;
}

interface Filter {
  id: string;
  name: string;
  icon: string;
  childData: FilterChildItem[];
}

interface SelectedChildItems {
  [key: string]: string[];
}

interface SearchTerms {
  [key: string]: string;
}

const SalesReportDashboard = () => {
  const { can, permissions } = usePagePermissions();
  const { showSnackbar } = useSnackbar();
  const [viewType, setViewType] = useState('');
  const [dateRange, setDateRange] = useState('dd-mm-yyyy - dd-mm-yyyy');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [searchbyopen, setSearchbyclose] = useState(false);

  
  const [draggedFilter, setDraggedFilter] = useState<Filter | null>(null);
  const [droppedFilters, setDroppedFilters] = useState<Filter[]>([]);
  const [selectedChildItems, setSelectedChildItems] = useState<SelectedChildItems>({});
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // API states
  const [availableFilters, setAvailableFilters] = useState<Filter[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [tableData, setTableData] = useState<any>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [selectedDataview, setSelectedDataview] = useState('default');
  const [searchType, setSearchType] = useState(''); // 'amount' or 'quantity'
  const [displayQuantity, setDisplayQuantity] = useState(''); // 'Free-Good' or 'Without-Free-Good'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50; // pagination size
  
  // Dashboard API states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Filter metadata (static)
  const filterMetadata: Record<string, { name: string; icon: string }> = {
    route: { name: 'Route', icon: 'mdi:routes' },
    salesman: { name: 'Salesman', icon: 'mdi:account-tie' },
    company: { name: 'Company', icon: 'mdi:company' },
    region: { name: 'Region', icon: 'mingcute:location-line' },
    warehouse: { name: 'Warehouse', icon: 'hugeicons:warehouse' },
    area: { name: 'Area', icon: 'mdi:map-marker-radius' },
    'item-category': { name: 'Item Category', icon: 'mdi:category' },
    items: { name: 'Items', icon: 'mdi:package-variant' },
    'channel-categories': { name: 'Customer Channel', icon: 'mdi:account-group' },
    'customer-category': { name: 'Customer Category', icon: 'mdi:account-supervisor' },
    customer: { name: 'Customer', icon: 'mdi:account' },
    'display-quantity': { name: 'Display Quantity', icon: 'mdi:numeric' },
    amount: { name: 'Amount', icon: 'mdi:currency-usd' }
  };

  // Filter hierarchy - defines which filters should be cleared when parent changes
  const filterHierarchy: Record<string, string[]> = {
    'company': ['region', 'area', 'warehouse', 'route', 'salesman', 'item-category', 'items', 'channel-categories', 'customer-category', 'customer'],
    'region': ['area', 'warehouse', 'route', 'salesman', 'customer-category', 'customer'],
    'area': ['warehouse', 'route', 'salesman', 'customer'],
    'warehouse': ['route', 'salesman'],
    'route': ['salesman'],
    'item-category': ['items'],
    'channel-categories': [ 'customer'],
    'customer-category': ['customer']
  };

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    // Validate required fields
    if (!startDate || !endDate) {
      showSnackbar('Please select a date range before loading dashboard data', 'warning');
      return;
    }

    if (!searchType) {
      showSnackbar('Please select the search type (Amount or Quantity)', 'warning');
      return;
    }

    if (!displayQuantity) {
      showSnackbar('Please select the display quantity (With Free Good or Without Free Good)', 'warning');
      return;
    }

    // Check if at least one filter is selected
    const hasFilterSelections = Object.values(selectedChildItems).some(items => items.length > 0);
    if (!hasFilterSelections) {
      showSnackbar('Please select at least one filter (Company, Region, Area, etc.) before loading dashboard data', 'warning');
      return;
    }

    setIsLoadingDashboard(true);
    setDashboardError(null);

    try {
      // Build the payload with all filter types
      const payload: any = {
        from_date: startDate,
        to_date: endDate,
        search_type: searchType,
        display_quantity: displayQuantity,
        company_ids: selectedChildItems['company']?.map(id => parseInt(id)) || [],
        region_ids: selectedChildItems['region']?.map(id => parseInt(id)) || [],
        area_ids: selectedChildItems['area']?.map(id => parseInt(id)) || [],
        warehouse_ids: selectedChildItems['warehouse']?.map(id => parseInt(id)) || [],
        route_ids: selectedChildItems['route']?.map(id => parseInt(id)) || [],
        salesman_ids: selectedChildItems['salesman']?.map(id => parseInt(id)) || [],
        item_category_ids: selectedChildItems['item-category']?.map(id => parseInt(id)) || [],
        item_ids: selectedChildItems['items']?.map(id => parseInt(id)) || [],
        channel_category_ids: selectedChildItems['channel-categories']?.map(id => parseInt(id)) || [],
        customer_category_ids: selectedChildItems['customer-category']?.map(id => parseInt(id)) || [],
        customer_ids: selectedChildItems['customer']?.map(id => parseInt(id)) || []
      };

      console.log('Dashboard API Payload:', payload);

      const response = await axios.post(
        'http://172.16.6.205:8001/api/dashboard',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          }
        }
      );

      console.log('Dashboard API Response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : 'Failed to load dashboard data';
      setDashboardError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleDashboardClick = () => {
    const searchByIds = ['salesman', 'route'];
    const moreFilterIds = moreFilters.map(f => f.id);
    const blockedIds = [...searchByIds, ...moreFilterIds];
    const hasBlockedSelection = blockedIds.some(id => (selectedChildItems[id] || []).length > 0);
    if (hasBlockedSelection) {
      showSnackbar('Dashboard not allowed with Search By/More filters. Clear them to view the dashboard.', 'warning');
      return;
    }
    setViewType('graph');
    fetchDashboardData();
  };

  // Fetch filters from API
  const fetchFiltersData = async () => {
    setIsLoadingFilters(true);
    setFilterError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (selectedChildItems['company']?.length) {
        params.append('company_ids', selectedChildItems['company'].join(','));
      }
      if (selectedChildItems['region']?.length) {
        params.append('region_ids', selectedChildItems['region'].join(','));
      }
      if (selectedChildItems['area']?.length) {
        params.append('area_ids', selectedChildItems['area'].join(','));
      }
      if (selectedChildItems['warehouse']?.length) {
        params.append('warehouse_ids', selectedChildItems['warehouse'].join(','));
      }
      if (selectedChildItems['route']?.length || selectedChildItems['salesman']?.length) {
        const searchBy = [...(selectedChildItems['route'] || []), ...(selectedChildItems['salesman'] || [])].join(',');
        if (searchBy) params.append('search_by', searchBy);
      }
      if (selectedChildItems['item-category']?.length) {
        params.append('item_category_ids', selectedChildItems['item-category'].join(','));
      }
      if (selectedChildItems['channel-categories']?.length) {
        const channelIds = selectedChildItems['channel-categories'].join(',');
        params.append('channel_category_ids', channelIds);
        params.append('customer_channel_ids', channelIds); // Send both parameters for channel-based customer filtering
      }
      if (selectedChildItems['customer-category']?.length) {
        params.append('customer_category_ids', selectedChildItems['customer-category'].join(','));
      }

   const queryString = params.toString();
const url = `http://172.16.6.205:8001/api/filters${queryString ? `?${queryString}` : ''}`;

const response = await fetch(url, {
  method: 'GET',
  // ❌ DO NOT SEND HEADERS in GET unless needed
});

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();


      // Transform API response to Filter format
      const transformedFilters: Filter[] = [];
      
      const apiKeyMap: Record<string, string> = {
        companies: 'company',
        regions: 'region',
        areas: 'area',
        warehouses: 'warehouse',
      
        item_categories: 'item-category',
        items: 'items',
          routes: 'route',
        salesmen: 'salesman',
        channel_categories: 'channel-categories',
        customer_categories: 'customer-category',
        customers: 'customer'
      };

      Object.entries(data).forEach(([apiKey, items]: [string, any]) => {
        const filterId = apiKeyMap[apiKey] || apiKey;
        const metadata = filterMetadata[filterId];
        
        if (metadata && Array.isArray(items)) {
          // Debug logging for route, salesman and channel categories data
          if (apiKey === 'routes' || apiKey === 'salesmen' || apiKey === 'channel_categories') {
            console.log(`${apiKey} data from API:`, items.slice(0, 2)); // Log first 2 items
          }
          
          transformedFilters.push({
            id: filterId,
            name: metadata.name,
            icon: metadata.icon,
            childData: items.map((item: any) => {
              // Extract ID from various possible field names
              const id = item.company_id || item.region_id || item.area_id || item.warehouse_id || 
                         item.route_id || item.salesman_id || item.item_category_id || item.item_id ||
                         item.channel_category_id || item.customer_category_id || item.customer_id ||
                         item.id || item.code || item.route_code || item.salesman_code;
              
              // Extract Name/Label with comprehensive field checking
              let name = item.company_name || item.region_name || item.area_name || item.warehouse_name ||
                         item.route_name || item.route_label || item.route_title || 
                         item.salesman_name || item.salesman_label || item.salesman_title ||
                         item.category_name || item.item_name || 
                         item.outlet_channel || item.channel_category_name || item.channel_name || 
                         item.customer_category_name || item.customer_name || 
                         item.name || item.label || item.title;
              
              // Additional fallback for route/salesman/channel_categories
              if (!name && (apiKey === 'routes' || apiKey === 'salesmen' || apiKey === 'channel_categories')) {
                name = item.description || item.full_name || item.display_name;
                console.warn(`${apiKey} missing standard name field, using fallback:`, item);
              }
              
              return {
                id: String(id || item),
                name: String(name || id || item)
              };
            })
          });
        }
      });

    

      setAvailableFilters(transformedFilters);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
      setFilterError(error instanceof Error ? error.message : 'Failed to load filters');
      setAvailableFilters([]);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Fetch Table Data function
  const handleTableView = async (page?: number) => {
    if (!startDate || !endDate) {
      showSnackbar('Please select a date range before loading table data', 'warning');
      return;
    }

    // Validate search type selection
    if (!searchType) {
      showSnackbar('Please select the search type (Type by Price or Type by Quantity)', 'warning');
      return;
    }

    // Validate display quantity selection
    if (!displayQuantity) {
      showSnackbar('Please select the display quantity (Free-Good or Without-Free-Good)', 'warning');
      return;
    }

    setIsLoadingTable(true);
    try {
      // Get only the lowest-level filter for table data
      const lowestLevelFilters = getLowestLevelFilters();
      
      // Build the request payload with dates and only the lowest filter
      const payload = {
        from_date: startDate,
        to_date: endDate,
        search_type: searchType,
        display_quantity: displayQuantity,
        ...lowestLevelFilters // Spread only the lowest-level filter IDs
      };

      const response = await fetch(`http://172.16.6.205:8001/api/table?page=${page || 1}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch table data: ${response.statusText}`);
      }

      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Table fetch failed:', error);
      showSnackbar(error instanceof Error ? error.message : 'Failed to load table data', 'error');
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Export XLSX function
  const handleExportXLSX = async (selectedSearchType: string, selectedDisplayQuantity: string, dataview: string) => {
    if (!startDate || !endDate) {
      showSnackbar('Please select a date range before exporting', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      // Get only the lowest-level filter for export data
      const lowestLevelFilters = getLowestLevelFilters();
      
      // Build the base payload with dates, dataview and only the lowest filter
      const payload: any = {
        from_date: startDate,
        to_date: endDate,
        search_type: selectedSearchType,
        dataview: dataview, // 'default', 'daily', 'weekly', 'monthly', 'yearly'
        display_quantity: selectedDisplayQuantity,
        ...lowestLevelFilters // Spread only the lowest-level filter IDs
      };

      // If dataview is 'default', include a `show` array that mirrors the table columns
      // so backend can return the same columns as the on-screen table export.
      if (dataview === 'default') {
        const dynamicColumn = getDynamicFilterColumn();
        const showFields: string[] = [
          'item_code',
          'item_name',
          'item_category',
          'invoice_date',
          // add dynamic columns' field names
          ...(dynamicColumn.columns || []).map((c: any) => c.field),
          'total_quantity'
        ];
        // Deduplicate while preserving order
        payload.show = Array.from(new Set(showFields));
      }

      console.log('Export Payload (lowest-level filter only):', payload);

      const response = await fetch('http://172.16.6.205:8001/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        console.error('Export API Error:', errorData);
        throw new Error(errorData.detail || `Export failed: ${response.statusText}`);
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      showSnackbar(error instanceof Error ? error.message : 'Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to get the dynamic column configuration for the table
  const getDynamicFilterColumn = () => {
    const hierarchyOrder = [
      'company',
      'region', 
      'area',
      'warehouse',
      'route',
      'salesman',
      'item-category',
      'items',
      'channel-categories',
      'customer-category',
      'customer'
    ];

    // Find the lowest filter
    let lowestFilter = null;
    for (let i = hierarchyOrder.length - 1; i >= 0; i--) {
      const filterId = hierarchyOrder[i];
      if (selectedChildItems[filterId]?.length > 0) {
        lowestFilter = filterId;
        break;
      }
    }

    // Special handling for customer-related filters - show only selected columns
    if (lowestFilter && ['channel-categories', 'customer-category', 'customer'].includes(lowestFilter)) {
      const columns = [];
      
      // Only add columns for filters that have selections
      if (selectedChildItems['channel-categories']?.length > 0) {
        // API may return channel category under several keys; prefer the explicit key used elsewhere
        columns.push({ label: 'Channel Name', field: 'channel_category_name' });
        columns.push({ label: 'Customer Name', field: 'customer_name' });
      }
      if (selectedChildItems['customer-category']?.length > 0) {
        columns.push({ label: 'Customer Category', field: 'customer_category_name' });
        columns.push({ label: 'Customer Name', field: 'customer_name' });
      }
      if (selectedChildItems['customer']?.length > 0) {
        columns.push({ label: 'Customer Name', field: 'customer_name' });
      }
      
      return {
        type: 'customer-group',
        columns: columns
      };
    }

    // Map filter ID to column name and field name in the API response
    const filterColumnMap: Record<string, { label: string; field: string }> = {
      'company': { label: 'Company Name', field: 'company_name' },
      'region': { label: 'Region Name', field: 'region_name' },
      'area': { label: 'Area Name', field: 'area_name' },
      'warehouse': { label: 'Warehouse Name', field: 'warehouse_name' },
      'route': { label: 'Route Name', field: 'route_name' },
      'salesman': { label: 'Salesman Name', field: 'salesman_name' },
      'item-category': { label: 'Item Category', field: 'item_category' },
      'items': { label: 'Item Name', field: 'item_name' }
    };

    const singleColumn = lowestFilter ? filterColumnMap[lowestFilter] : { label: 'Filter Name', field: 'name' };
    return {
      type: 'single',
      columns: [singleColumn]
    };
  };

  // Helper function to get only the lowest-level filter for table/export APIs
  const getLowestLevelFilters = () => {
    // Define hierarchy order from highest to lowest level
    const hierarchyOrder = [
      'company',
      'region', 
      'area',
      'warehouse',
      'route',
      'salesman',
      'item-category',
      'items',
      'channel-categories',
      'customer-category',
      'customer'
    ];

    // Find the lowest (most granular) filter that has selections
    let lowestFilter = null;
    for (let i = hierarchyOrder.length - 1; i >= 0; i--) {
      const filterId = hierarchyOrder[i];
      if (selectedChildItems[filterId]?.length > 0) {
        lowestFilter = filterId;
        break;
      }
    }

    // Build payload with only the lowest filter
    const payload: any = {};
    
    if (lowestFilter) {
      switch (lowestFilter) {
        case 'company':
          payload.company_ids = selectedChildItems['company'].map(id => parseInt(id));
          break;
        case 'region':
          payload.region_ids = selectedChildItems['region'].map(id => parseInt(id));
          break;
        case 'area':
          payload.area_ids = selectedChildItems['area'].map(id => parseInt(id));
          break;
        case 'warehouse':
          payload.warehouse_ids = selectedChildItems['warehouse'].map(id => parseInt(id));
          break;
        case 'route':
          payload.route_ids = selectedChildItems['route'].map(id => parseInt(id));
          break;
        case 'salesman':
          payload.salesman_ids = selectedChildItems['salesman'].map(id => parseInt(id));
          break;
        case 'item-category':
          payload.item_category_ids = selectedChildItems['item-category'].map(id => parseInt(id));
          break;
        case 'items':
          payload.item_ids = selectedChildItems['items'].map(id => parseInt(id));
          break;
        case 'channel-categories':
          payload.customer_channel_ids = selectedChildItems['channel-categories'].map(id => parseInt(id));
          break;
        case 'customer-category':
          payload.customer_category_ids = selectedChildItems['customer-category'].map(id => parseInt(id));
          break;
        case 'customer':
          payload.customer_ids = selectedChildItems['customer'].map(id => parseInt(id));
          break;
      }
    }

    return payload;
  };

  // Resolve a value for a dynamic column from a table row, with common API field fallbacks
  const resolveRowValue = (row: any, field: string) => {
    if (!row) return undefined;
    // direct match
    if (row[field] !== undefined && row[field] !== null) return row[field];

    // common fallbacks
    const fallbacks: Record<string, string[]> = {
      channel_category_name: ['channel_category_name', 'channel_name', 'outlet_channel'],
      channel_name: ['channel_name', 'channel_category_name', 'outlet_channel'],
      customer_category_name: ['customer_category_name', 'customer_category'],
      customer_name: ['customer_name', 'customer']
    };

    const keys = fallbacks[field] || [field];
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k];
    }

    return undefined;
  };

  // Determine display value for total column depending on selected search type
  const getTotalValue = (row: any) => {
    if (!row) return '-';
    const amountCandidates = [row.total_amount, row.total_value, row.total_quantity, row.total_qty];
    const quantityCandidates = [row.total_quantity, row.total_qty, row.total_amount, row.total_value];
    const candidates = searchType === 'amount' ? amountCandidates : quantityCandidates;
    const found = candidates.find(v => v !== undefined && v !== null && v !== '');
    return found !== undefined ? found : '-';
  };

  // Fetch on mount
  useEffect(() => {
    fetchFiltersData();
  }, []);

  // Close dropdowns when clicking outside any dropdown or trigger
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;

      // If clicked inside any open dropdown, do nothing
      const dropdowns = document.querySelectorAll('.filter-dropdown');
      for (const d of Array.from(dropdowns)) {
        if (d.contains(target)) return;
      }

      // If clicked inside any trigger (buttons that open dropdowns), do nothing
      const triggers = document.querySelectorAll('.dropdown-trigger');
      for (const t of Array.from(triggers)) {
        if (t.contains(target)) return;
      }

      // Otherwise close all dropdowns
      setOpenDropdown(null);
      setShowMoreFilters(false);
      setSearchbyclose(false);
      setShowDatePicker(false);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [openDropdown, showMoreFilters, searchbyopen, showDatePicker]);

  // Refetch when selections change with hierarchical logic
  useEffect(() => {
    if (droppedFilters.length > 0) {
      // Only refetch if there are actual selections
      const hasSelections = Object.values(selectedChildItems).some(items => items.length > 0);
      if (hasSelections) {
        const timer = setTimeout(() => fetchFiltersData(), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedChildItems, droppedFilters.length]);

  const chartData = {
    salesTrend: Array.from({length: 5}, (_, i) => ({ year: `${2021+i}`, sales: [2, 6, 3, 8, 6][i] })),
    companies: Array.from({length: 5}, (_, i) => ({ name: `Company ${i+1}`, sales: [400000, 280000, 220000, 150000, 80000][i], color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i] })),
    region: Array.from({length: 3}, (_, i) => ({ name: `Region ${i+1}`, value: [35, 30, 35][i], color: ['#1e3a8a', '#3b82f6', '#38bdf8'][i] })),
    brand: Array.from({length: 5}, (_, i) => ({ brand: `Brand ${i+1}`, sales: [8, 7, 5, 4, 3.5][i] }))
  };

  const handleDateSelect = () => {
    if (startDate && endDate) {
      const format = (date: string) => new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-');
      setDateRange(`${format(startDate)} - ${format(endDate)}`);
      setShowDatePicker(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, filter: Filter) => {
    setDraggedFilter(filter);
    e.dataTransfer.setData('text/plain', filter.id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedFilter) {
      // setAvailableFilters(prev => prev.filter(f => f.id !== draggedFilter.id));
      
      setDroppedFilters(prev => [...prev, draggedFilter]);
      setSelectedChildItems(prev => ({ ...prev, [draggedFilter.id]: [] }));
      setSearchTerms(prev => ({ ...prev, [draggedFilter.id]: '' }));
      setDraggedFilter(null);
      
      // Close the dropdowns after dropping
      setShowMoreFilters(false);
      setSearchbyclose(false);
    }
  };

  const handleRemoveFilter = (filterToRemove: Filter) => {
    setDroppedFilters(prev => prev.filter(f => f.id !== filterToRemove.id));
    // setAvailableFilters(prev => [...prev, filterToRemove]);
    
    // Clear this filter and all its dependent filters
    setSelectedChildItems(prev => {
      const newObj = {...prev};
      delete newObj[filterToRemove.id];
      
      // Also clear dependent filters
      const dependentFilters = filterHierarchy[filterToRemove.id] || [];
      dependentFilters.forEach(dependentId => {
        if (newObj[dependentId]) {
          newObj[dependentId] = [];
        }
      });
      
      return newObj;
    });
    
    setSearchTerms(prev => { const newObj = {...prev}; delete newObj[filterToRemove.id]; return newObj; });
    if (openDropdown === filterToRemove.id) setOpenDropdown(null);
  };

  const handleClearAllFilters = () => {
    setAvailableFilters([...availableFilters, ...droppedFilters]);
    setDroppedFilters([]);
    setSelectedChildItems({});
    setSearchTerms({});
    setOpenDropdown(null);
  };

  const handleChildItemToggle = (filterId: string, childItemId: string) => {
    setSelectedChildItems(prev => {
      const current = prev[filterId] || [];
      const newValue = current.includes(childItemId) ? current.filter(id => id !== childItemId) : [...current, childItemId];
      
      // Create new state with updated filter
      const newState = { ...prev, [filterId]: newValue };
      
      // Clear all dependent filters based on hierarchy
      const dependentFilters = filterHierarchy[filterId] || [];
      dependentFilters.forEach(dependentId => {
        if (newState[dependentId]) {
          newState[dependentId] = [];
        }
      });
      
      return newState;
    });
  };

  const getFilterChildData = (filterId: string): FilterChildItem[] => {
    const filter = [...availableFilters, ...droppedFilters].find(f => f.id === filterId);
    return filter?.childData || [];
  };

  const getFilteredChildData = (filterId: string): FilterChildItem[] => {
    const data = getFilterChildData(filterId);
    const searchTerm = searchTerms[filterId] || '';
    return !searchTerm ? data : data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const getSelectedCount = (filterId: string): number => (selectedChildItems[filterId] || []).length;

  // Return ids of currently visible (filtered) child items for a filter
  const getVisibleChildIds = (filterId: string): string[] => {
    return getFilteredChildData(filterId).map(d => d.id);
  };

  const handleSelectAll = (filterId: string, ids: string[]) => {
    setSelectedChildItems(prev => {
      const current = prev[filterId] || [];
      const allSelected = ids.length > 0 && ids.every(id => current.includes(id));
      const newState = { ...prev, [filterId]: allSelected ? [] : ids };

      // Clear dependent filters when selection changes
      const dependentFilters = filterHierarchy[filterId] || [];
      dependentFilters.forEach(dependentId => {
        if (newState[dependentId]) newState[dependentId] = [];
      });

      return newState;
    });
  };

  // Organize filters into groups
  const visibleFilters = availableFilters.filter(f => ['company', 'region', 'area', 'warehouse'].includes(f.id));
  const searchby = availableFilters.filter(f => ['salesman', 'route'].includes(f.id));
  // const searchtype = availableFilters.filter(f => ['display-quantity', 'amount'].includes(f.id));
  const moreFilters = availableFilters.filter(f => 
    !['company', 'region', 'area', 'warehouse', 'salesman', 'route', 'display-quantity', 'amount'].includes(f.id)
  );

  const sidebarIcons = [
    'ri:home-smile-2-line', 'proicons:person', 'streamline:transfer-van', 'pajamas:package',
    'lucide:network', 'bx:file', 'proicons:bookmark', 'solar:dollar-broken'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <header className="bg-white border-b border-gray-200">
        <div className="h-[60px] flex items-center">
          <div className="w-[80px] lg:w-[80px] h-[60px] border-r border-b border-[#E9EAEB] flex items-center justify-center">
            <img src="shortLogo.png" alt="Logo" className="w-[44px] h-[44px] object-contain" />
          </div>
          <TopBar />
        </div>
      </header> */}

      {/* <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <section className="hidden lg:flex lg:w-[80px] h-auto lg:h-[1050px] border-r border-[#E9EAEB] bg-white border-b pt-5">
          <div className="flex flex-col items-center gap-6 w-full">
            {sidebarIcons.map((icon, i) => (
              <Icon key={i} icon={icon} width="24" height="24" style={{color: "#414651"}} />
            ))}
          </div>
        </section>

        <section className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
          <div className="flex justify-around py-3">
            {sidebarIcons.slice(0, 5).map((icon, i) => (
              <Icon key={i} icon={icon} width="24" height="24" style={{color: "#414651"}} />
            ))}
          </div>
        </section> */}

        <section className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl flex gap-2 lg:gap-4 font-semibold items-center text-gray-900">
              {/* <Icon icon="lucide:arrow-left" width="20" height="20" className="lg:w-6 lg:h-6" /> */}
              Sales Report Dashboard
            </h1>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer w-full sm:w-auto" onClick={() => setShowDatePicker(!showDatePicker)}>
                  <Calendar size={18} className="text-gray-600" />
                  <input type="text" value={dateRange} className="border-none outline-none text-sm cursor-pointer bg-transparent w-full" readOnly />
                </div>
                {showDatePicker && (
                  <div id="date-picker-dropdown" className="filter-dropdown absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-full sm:w-80">
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleDateSelect} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
                        <button onClick={() => setShowDatePicker(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative w-full gap-3 flex sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-4 py-2 pr-10 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer text-sm w-full sm:w-auto"
                  >
                    <option value="">Search Type</option>
                    <option value="amount"> Amount</option>
                    <option value="quantity"> Quantity</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>  
                <div className="relative w-full sm:w-auto">
                  <select
                    value={displayQuantity}
                    onChange={(e) => setDisplayQuantity(e.target.value)}
                    className="px-4 py-2 pr-10 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer text-sm w-full sm:w-auto"
                  >
                    <option value=""> Display Quantity</option>
                    <option value="with_free_good"> With Free Good</option>
                    <option value="without_free_good">Without Free Good</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                onClick={handleDashboardClick}
                disabled={isLoadingDashboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 sm:flex-none justify-center ${viewType === 'graph' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingDashboard ? (
                  <Icon icon="eos-icons:loading" width="18" height="18" />
                ) : (
                  <BarChart3 size={18} />
                )}
                <span className="text-sm">Dashboard</span>
              </button>
              <button 
                onClick={() => {
                  setViewType('table');
                  handleTableView();
                }} 
                disabled={isLoadingTable}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 sm:flex-none justify-center ${viewType === 'table' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingTable ? (
                  <Icon icon="eos-icons:loading" width="18" height="18" />
                ) : (
                  <Table size={18} />
                )}
                <span className="text-sm">Table</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white w-full rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-4 border-b border-[#E9EAEB] gap-3">
              <h2 className="font-semibold text-lg text-[#181D27]">Sales Reports</h2>
              {can("export") && (
                <ExportButtons 
                  onExportXLSX={handleExportXLSX}
                  isLoading={isExporting}
                  searchType={searchType}
                  displayQuantity={displayQuantity}
                />
              )}
            </div>

            <div className="p-4 border border-[#E9EAEB]">
              {/* Loading & Error States */}
          

              {/* Filter Section */}
              <div>
                <div className="flex flex-wrap min-h-[44px] items-center justify-start gap-2 sm:gap-3 px-3 py-2 border rounded-[10px] bg-[#F5F5F5] border-[#E9EAEB]">
                  <span className="font-semibold text-gray-800 text-sm sm:text-base whitespace-nowrap">Drag & Drop Filter</span>
                  
                 <div className="flex h-auto sm:h-[28px] justify-center items-center w-full sm:w-auto">
  {isLoadingFilters && (
    <div className="h-auto sm:h-[28px] px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm text-blue-700 flex items-center gap-2">
      <div className="animate-spin w-3 h-3 rounded-full border-b-2 border-blue-700"></div>
      <span className="whitespace-nowrap">Loading filters...</span>
    </div>
  )}

  {filterError && (
    <div className="h-auto sm:h-[28px] flex justify-center items-center px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
      <span className="truncate">{filterError}</span>
      <button
        onClick={fetchFiltersData}
        className="ml-2 underline hover:text-red-900 font-medium whitespace-nowrap"
      >
        Retry
      </button>
    </div>
  )}
</div>

                  <div className="flex flex-wrap gap-2 flex-1 w-full">
                    {visibleFilters
                      .filter(filter => !droppedFilters.some(df => df.id === filter.id))
                      .map(filter => (
                      <div key={filter.id} draggable onDragStart={(e) => handleDragStart(e, filter)} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-[#D1D5DB] rounded-[8px] cursor-grab hover:bg-gray-50">
                        <Icon icon={filter.icon} width="16" height="16" className="sm:w-[18px] sm:h-[18px]" style={{color: '#414651'}} />
                        <span className="text-xs sm:text-sm font-medium text-[#414651] whitespace-nowrap">{filter.name}</span>
                        <Icon icon="ph:dots-six-vertical-bold" width="14" height="14" className="sm:w-4 sm:h-4" style={{color: '#A4A7AE'}} />
                      </div>
                    ))}
                 

                
                           {searchby.length > 0 && (
                      <div className="relative">
                        <button className="dropdown-trigger flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-white border border-[#D1D5DB] rounded-[8px] whitespace-nowrap" onClick={() => setSearchbyclose(!searchbyopen)}>
                          Search by <ChevronDown size={14} />
                        </button>
                        {searchbyopen && (
                          <div id="searchby-dropdown" className="filter-dropdown absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
                            <div className="p-2">
                              {searchby.map(filter => (
                                <div key={filter.id} draggable onDragStart={(e) => handleDragStart(e, filter)} className="flex items-center gap-2 px-2 sm:px-3 py-2 justify-between rounded hover:bg-gray-50 cursor-grab">
                                  <div className='flex gap-2 sm:gap-4 items-center'>
                                    <Icon icon={filter.icon} width="16" height="16" className="sm:w-[18px] sm:h-[18px]" style={{color: '#414651'}} />
                                    <span className="text-xs sm:text-sm text-gray-700">{filter.name}</span>
                                  </div>
                                  <Icon icon="ph:dots-six-vertical-bold" width="14" height="14" className="sm:w-4 sm:h-4" style={{color: '#A4A7AE'}} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
 {moreFilters.length > 0 && (
                      <div className="relative">
                        <button className="dropdown-trigger flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 bg-white border border-[#D1D5DB] rounded-[8px] whitespace-nowrap" onClick={() => setShowMoreFilters(!showMoreFilters)}>
                          More <ChevronDown size={14} />
                        </button>
                        {showMoreFilters && (
                          <div id="morefilters-dropdown" className="filter-dropdown absolute top-full left-0 sm:left-auto sm:right-0 mt-1 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-80 overflow-y-auto">
                            <div className="p-2">
                              {moreFilters.map(filter => {
                                const isUndraggable = viewType === 'table' && ['items', 'item-category'].includes(filter.id);
                                return (
                                  <div 
                                    key={filter.id} 
                                    draggable={!isUndraggable} 
                                    onDragStart={!isUndraggable ? (e) => handleDragStart(e, filter) : undefined} 
                                    className={`flex items-center gap-2 px-2 sm:px-3 py-2 justify-between rounded hover:bg-gray-50 ${isUndraggable ? 'cursor-not-allowed opacity-50' : 'cursor-grab'}`}
                                  >
                                    <div className='flex gap-2 sm:gap-4 items-center'>
                                      <Icon icon={filter.icon} width="16" height="16" className="sm:w-[18px] sm:h-[18px]" style={{color: '#414651'}} />
                                      <span className="text-xs sm:text-sm text-gray-700">{filter.name}</span>
                                    </div>
                                    <Icon icon="ph:dots-six-vertical-bold" width="14" height="14" className="sm:w-4 sm:h-4" style={{color: '#A4A7AE'}} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    
                  </div>
                </div>

                <div className="mt-4 p-3 sm:p-4 border border-dashed border-[#D1D5DB] rounded-[10px]" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                  {droppedFilters.length === 0 ? (
                    <div className="flex justify-center items-center py-6 sm:py-4">
                      <Icon icon="basil:add-outline" width="20" height="20" className="sm:w-6 sm:h-6" style={{color: '#717680'}} />
                      <span className="text-xs sm:text-sm text-gray-400 ml-2">Drop Filter Here</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start sm:items-center justify-between">
                        <div className="flex flex-wrap gap-2 flex-1 w-full">
                          {droppedFilters.map(filter => {
                            const selectedCount = getSelectedCount(filter.id);
                            return (
                              <div key={filter.id} className="relative w-full sm:w-auto">
                                <div className="dropdown-trigger flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-[#414651] rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setOpenDropdown(openDropdown === filter.id ? null : filter.id)}>
                                  <Icon icon={filter.icon} width="16" height="16" className="sm:w-[18px] sm:h-[18px]" style={{color: '#414651'}} />
                                  <span className="text-xs sm:text-sm font-medium text-[#414651] whitespace-nowrap">
                                    {filter.name}
                                    {selectedCount > 0 && <span className="bg-[#252B37] text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full ml-1">{selectedCount}</span>}
                                  </span>
                                  <ChevronDown size={12} className={`sm:w-[14px] sm:h-[14px] text-[#414651] ${openDropdown === filter.id ? 'rotate-180' : ''}`} />
                                  <button onClick={(e) => { e.stopPropagation(); handleRemoveFilter(filter); }} className="text-[#414651] hover:text-red-600 ml-1">
                                    <Icon icon="mdi:close" width="14" height="14" className="sm:w-4 sm:h-4" />
                                  </button>
                                </div>

                                {openDropdown === filter.id && (
                                  <div id={`filter-dropdown-${filter.id}`} className="filter-dropdown absolute top-full left-0 mt-1 w-full min-w-[200px] sm:w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <div className="p-3">
                                      <input type="text" placeholder="Search here..." value={searchTerms[filter.id] || ''} onChange={(e) => setSearchTerms(prev => ({ ...prev, [filter.id]: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                      {getFilteredChildData(filter.id).length === 0 ? (
                                        <div className="text-center text-sm text-gray-500 py-4">No items found</div>
                                      ) : (
                                        <div className="space-y-1 p-2">
                                          {/* Select All checkbox */}
                                          {(() => {
                                            const visible = getFilteredChildData(filter.id);
                                            const visibleIds = visible.map(v => v.id);
                                            const selected = selectedChildItems[filter.id] || [];
                                            const allSelected = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id));
                                            const someSelected = visibleIds.length > 0 && visibleIds.some(id => selected.includes(id));
                                            return (
                                              <label key="__select_all__" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                                  type="checkbox"
                                                  checked={allSelected}
                                                  onChange={() => handleSelectAll(filter.id, visibleIds)}
                                                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Select All</span>
                                              </label>
                                            );
                                          })()}

                                          {getFilteredChildData(filter.id).map(childItem => {
                                            const isSelected = (selectedChildItems[filter.id] || []).includes(childItem.id);
                                            return (
                                              <label key={childItem.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input type="checkbox" checked={isSelected} onChange={() => handleChildItemToggle(filter.id, childItem.id)} className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">{childItem.name}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {droppedFilters.length > 0 && (
                          <button onClick={handleClearAllFilters} className="text-[#252B37] italic text-xs sm:text-sm underline hover:text-red-600 whitespace-nowrap mt-2 sm:mt-0 self-start sm:self-auto">Clear Filter</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Charts Grid or Table View */}
              {viewType === 'graph' ? (
                 <SalesCharts 
                  chartData={chartData} 
                  dashboardData={dashboardData}
                  isLoading={isLoadingDashboard}
                  error={dashboardError}
                  searchType={searchType}
                />
              ) : (
                <div className="mt-4">
                  {isLoadingTable ? (
                    <div className="flex justify-center items-center py-12">
                      <Icon icon="eos-icons:loading" width="40" height="40" className="text-blue-600" />
                      <span className="ml-3 text-gray-600">Loading table data...</span>
                    </div>
                  ) : tableData && (tableData.data || tableData.rows)?.length > 0 ? (
                    (() => {
                      const dynamicColumn = getDynamicFilterColumn();
                      const rows = tableData.data || tableData.rows || [];
                      
                      // Use server-side pagination data
                      const totalRows = tableData.total_rows || rows.length;
                      const totalPages = tableData.total_pages || Math.max(1, Math.ceil(totalRows / rowsPerPage));
                      const apiCurrentPage = tableData.current_page || currentPage;
                      const startIdx = ((apiCurrentPage - 1) * rowsPerPage) + 1;
                      const endIdx = Math.min(apiCurrentPage * rowsPerPage, totalRows);

                      const changePage = (page: number) => {
                        console.log('Change to page:', page);
                        if (page < 1) page = 1;
                        if (page > totalPages) page = totalPages;
                        setCurrentPage(page);
                        handleTableView(page);
                      };

                      return (
                        <div>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Code</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Category</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice Date</th>
                                  {dynamicColumn.columns.map((col: any, idx: number) => (
                                    <th key={idx} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{col.label}</th>
                                  ))}
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Quantity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row: any, rowIdx: number) => (
                                  <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.item_code || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.item_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.item_category || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{row.invoice_date || '-'}</td>
                                    {dynamicColumn.columns.map((col: any, idx: number) => (
                                      <td key={idx} className="px-4 py-3 text-sm text-gray-700">{resolveRowValue(row, col.field) || '-'}</td>
                                    ))}
                                    <td className="px-4 py-3 text-sm text-gray-700">{getTotalValue(row)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination controls */}
                          <div className="flex items-center justify-between mt-3 px-2">
                            <div className="text-sm text-gray-600">Showing {startIdx} - {endIdx} of {totalRows}</div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => changePage(apiCurrentPage - 1)} 
                                disabled={!tableData.previous_page || apiCurrentPage === 1} 
                                className="px-3 py-1 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Prev
                              </button>
                              
                              {/* Smart pagination with groups of 5 */}
                              {(() => {
                                // Adjust to 0-indexed for logic (API returns 1-indexed)
                                const cPage = apiCurrentPage - 1;
                                const pages = [];
                                
                                // If 6 or fewer pages, show all
                                if (totalPages <= 6) {
                                  for (let i = 1; i <= totalPages; i++) {
                                    pages.push(
                                      <button 
                                        key={i} 
                                        onClick={() => changePage(i)} 
                                        className={`px-3 py-1 border rounded ${apiCurrentPage === i ? 'bg-gray-900 text-white' : 'bg-white'}`}
                                      >
                                        {i}
                                      </button>
                                    );
                                  }
                                  return pages;
                                }
                                
                                // More than 6 pages: smart pagination
                                const elems: (number | string)[] = [];
                                
                                // If near the start, show first up to five pages then ellipsis + last
                                if (cPage <= 2) {
                                  const end = Math.min(totalPages - 1, 4); // pages 0..4 (display 1..5)
                                  for (let i = 0; i <= end; i++) elems.push(i);
                                  if (end < totalPages - 1) elems.push("...", totalPages - 1);
                                }
                                // If near the end, show first, ellipsis, then last up to five pages
                                else if (cPage >= totalPages - 3) {
                                  const start = Math.max(0, totalPages - 5); // show last 5 pages
                                  elems.push(0);
                                  if (start > 1) elems.push("...");
                                  for (let i = start; i <= totalPages - 1; i++) elems.push(i);
                                }
                                // Middle: show first page, ellipsis, two before/after current, ellipsis, last page
                                else {
                                  elems.push(0, "...");
                                  const start = Math.max(0, cPage - 2);
                                  const end = Math.min(totalPages - 1, cPage + 2);
                                  for (let i = start; i <= end; i++) elems.push(i);
                                  elems.push("...", totalPages - 1);
                                }
                                
                                return elems.map((p, idx) =>
                                  typeof p === "string" ? (
                                    <span key={`e-${idx}`} className="px-2 text-gray-500">{p}</span>
                                  ) : (
                                    <button 
                                      key={p} 
                                      onClick={() => changePage(p + 1)} 
                                      className={`px-3 py-1 border rounded ${apiCurrentPage === p + 1 ? 'bg-gray-900 text-white' : 'bg-white'}`}
                                    >
                                      {p + 1}
                                    </button>
                                  )
                                );
                              })()}
                              
                              <button 
                                onClick={() => changePage(apiCurrentPage + 1)} 
                                disabled={!tableData.next_page || apiCurrentPage === totalPages} 
                                className="px-3 py-1 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col justify-center items-center py-12 text-gray-500">
                      <Table size={48} className="mb-4 opacity-30" />
                      <p className="text-lg font-medium">No table data available</p>
                      <p className="text-sm mt-2">Select filters and date range, then click the Table button</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      {/* </div> */}
    </div>
  );
};

export default SalesReportDashboard;










