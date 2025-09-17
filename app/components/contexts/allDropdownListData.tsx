"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  companyList,
  countryList,
  regionList,
  routeList,
  warehouseType,
  routeType,
  getSubRegion,
  getCompanyCustomers,
  getCompanyCustomersType,
  itemCategory,
  itemSubCategory,
  channelList,
  userTypes
} from '@/app/services/allApi';

interface DropdownDataContextType {
  companyList: CompanyItem[];
  countryList: CountryItem[];
  regionList: RegionItem[];
  routeList: RouteItem[];
  warehouseList: WarehouseItem[];
  routeType: RouteTypeItem[];
  areaList: AreaItem[];
  companyCustomers: CustomerItem[];
  companyCustomersType: CustomerTypeItem[];
  itemCategory: ItemCategoryItem[];
  itemSubCategory: ItemSubCategoryItem[];
  channelList: ChannelItem[];
  userTypes: UserTypeItem[];
  // mapped dropdown options
  companyOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  routeOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
  routeTypeOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string }[];
  companyCustomersOptions: { value: string; label: string }[];
  companyCustomersTypeOptions: { value: string; label: string }[];
  itemCategoryOptions: { value: string; label: string }[];
  itemSubCategoryOptions: { value: string; label: string }[];
  channelOptions: { value: string; label: string }[];
  userTypeOptions: { value: string; label: string }[];
  refreshDropdowns: () => Promise<void>;
  loading: boolean;
}

// Minimal interfaces reflecting the expected fields returned by API for dropdown lists
interface CompanyItem {
  id?: number | string;
  company_code?: string;
  company_name?: string;
}

interface CountryItem {
  id?: number | string;
  country_code?: string;
  country_name?: string;
}

interface RegionItem {
  id?: number | string;
  region_code?: string;
  region_name?: string;
}

interface RouteItem {
  id?: number | string;
  route_code?: string;
  route_name?: string;
}

interface WarehouseItem {
  id?: number | string;
  warehouse_code?: string;
  warehouse_name?: string;
}

interface RouteTypeItem {
  id?: number | string;
  route_type_code?: string;
  route_type_name?: string;
}

interface AreaItem {
  id?: number | string;
  area_code?: string;
  area_name?: string;
}

interface CustomerItem {
  id?: number | string;
  customer_code?: string;
  owner_name?: string;
}

interface CustomerTypeItem {
  id?: number | string;
  code?: string;
  name?: string;
}

interface ItemCategoryItem {
  id?: number | string;
  category_name?: string;
}

interface ItemSubCategoryItem {
  id?: number | string;
  sub_category_name?: string;
}

interface ChannelItem {
  id?: number | string;
  outlet_channel_code?: string;
  outlet_channel?: string;
}

interface UserTypeItem {
  id?: number | string;
  code?: string;
  name?: string;
}

const AllDropdownListDataContext = createContext<DropdownDataContextType | undefined>(undefined);

export const useAllDropdownListData = () => {
  const context = useContext(AllDropdownListDataContext);
  if (!context) {
    throw new Error('useAllDropdownListData must be used within AllDropdownListDataProvider');
  }
  return context;
};

export const AllDropdownListDataProvider = ({ children }: { children: ReactNode }) => {
  // define typed state for each dropdown list
  const [companyListData, setCompanyListData] = useState<CompanyItem[]>([]);
  const [countryListData, setCountryListData] = useState<CountryItem[]>([]);
  const [regionListData, setRegionListData] = useState<RegionItem[]>([]);
  const [routeListData, setRouteListData] = useState<RouteItem[]>([]);
  const [warehouseListData, setWarehouseListData] = useState<WarehouseItem[]>([]);
  const [routeTypeData, setRouteTypeData] = useState<RouteTypeItem[]>([]);
  const [areaListData, setAreaListData] = useState<AreaItem[]>([]);
  const [companyCustomersData, setCompanyCustomersData] = useState<CustomerItem[]>([]);
  const [companyCustomersTypeData, setCompanyCustomersTypeData] = useState<CustomerTypeItem[]>([]);
  const [itemCategoryData, setItemCategoryData] = useState<ItemCategoryItem[]>([]);
  const [itemSubCategoryData, setItemSubCategoryData] = useState<ItemSubCategoryItem[]>([]);
  const [channelListData, setChannelListData] = useState<ChannelItem[]>([]);
  const [userTypesData, setUserTypesData] = useState<UserTypeItem[]>([]);
  const [loading, setLoading] = useState(false);

  // mapped dropdown options
  const companyOptions = (Array.isArray(companyListData) ? companyListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.company_code && c.company_name ? `${c.company_code} - ${c.company_name}` : (c.company_name ?? ''),
  }));
  const countryOptions = (Array.isArray(countryListData) ? countryListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.country_code && c.country_name ? `${c.country_code} - ${c.country_name}` : (c.country_name ?? ''),
  }));
  const regionOptions = (Array.isArray(regionListData) ? regionListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.region_code && c.region_name ? `${c.region_code} - ${c.region_name}` : (c.region_name ?? ''),
  }));
  const routeOptions =(Array.isArray(routeListData) ? routeListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.route_code && c.route_name ? `${c.route_code} - ${c.route_name}` : (c.route_name ?? ''),
  }));
  const warehouseOptions = (Array.isArray(warehouseListData) ? warehouseListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.warehouse_code && c.warehouse_name ? `${c.warehouse_code} - ${c.warehouse_name}` : (c.warehouse_name ?? ''),
  }));
  const routeTypeOptions = (Array.isArray(routeTypeData) ? routeTypeData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.route_type_code && c.route_type_name
      ? `${c.route_type_code} - ${c.route_type_name}`
      : (c.route_type_name ?? ''),
  }));
  const areaOptions = (Array.isArray(areaListData) ? areaListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.area_code && c.area_name ? `${c.area_code} - ${c.area_name}` : (c.area_name ?? ''),
  }));
  const companyCustomersOptions =(Array.isArray(companyCustomersData) ? companyCustomersData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.customer_code && c.owner_name ? `${c.customer_code} - ${c.owner_name}` : (c.owner_name ?? ''),
  }));
  const companyCustomersTypeOptions = (Array.isArray(companyCustomersTypeData) ? companyCustomersTypeData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? ''),
  }));
  const itemCategoryOptions = (Array.isArray(itemCategoryData) ? itemCategoryData : []).map((c) => ({
    value: c.id?.toString() ?? '',
  label: c.category_name ?? '',
  }));
  const itemSubCategoryOptions = (Array.isArray(itemSubCategoryData) ? itemSubCategoryData : []).map((c) => ({
    value: c.id?.toString() ?? '',
  label: c.sub_category_name ?? '',
  }));
  const channelOptions = (Array.isArray(channelListData) ? channelListData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.outlet_channel_code && c.outlet_channel ? `${c.outlet_channel_code} - ${c.outlet_channel}` : (c.outlet_channel ?? ''),
  }));
  
  const userTypeOptions = (Array.isArray(userTypesData) ? userTypesData : []).map((c) => ({
    value: c.id?.toString() ?? '',
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? ''),
  }));
  userTypesData.map((c) => ({ value: c.id ?? '', label: c.name ?? '' }));



  const refreshDropdowns = async () => {
    setLoading(true);
    try {
      const [
        company,
        country,
        region,
        route,
        warehouse,
        routeTypeRes,
        area,
        companyCustomers,
        companyCustomersType,
        itemCategoryRes,
        itemSubCategoryRes,
        channelListRes,
        userTypesRes
      ] = await Promise.all([
        companyList(),
        countryList({}),
        regionList(),
        routeList(),
        warehouseType(2),
        routeType(),
        getSubRegion(),
        getCompanyCustomers(),
        getCompanyCustomersType(),
        itemCategory(),
        itemSubCategory(),
        channelList(),
        userTypes()
      ]);



  setCompanyListData((company?.data || company || []) as CompanyItem[]);
  setCountryListData((country?.data || country || []) as CountryItem[]);
  setRegionListData((region?.data || region || []) as RegionItem[]);
  setRouteListData((route?.data || route || []) as RouteItem[]);
  setWarehouseListData((warehouse?.data || warehouse || []) as WarehouseItem[]);
  setRouteTypeData((routeTypeRes?.data || routeTypeRes || []) as RouteTypeItem[]);
  setAreaListData((area?.data || area || []) as AreaItem[]);
  setCompanyCustomersData((companyCustomers?.data || companyCustomers || []) as CustomerItem[]);
  setCompanyCustomersTypeData((companyCustomersType?.data || companyCustomersType || []) as CustomerTypeItem[]);
  setItemCategoryData((itemCategoryRes?.data || itemCategoryRes || []) as ItemCategoryItem[]);
  setItemSubCategoryData((itemSubCategoryRes?.data || itemSubCategoryRes || []) as ItemSubCategoryItem[]);
  setChannelListData((Array.isArray(channelListRes?.data) ? channelListRes.data : channelListRes || []) as ChannelItem[]);
  setUserTypesData((userTypesRes?.data || userTypesRes || []) as UserTypeItem[]);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      // Reset all data to empty arrays on error
  setCompanyListData([] as CompanyItem[]);
  setCountryListData([] as CountryItem[]);
  setRegionListData([] as RegionItem[]);
  setRouteListData([] as RouteItem[]);
  setWarehouseListData([] as WarehouseItem[]);
  setRouteTypeData([] as RouteTypeItem[]);
  setAreaListData([] as AreaItem[]);
  setCompanyCustomersData([] as CustomerItem[]);
  setCompanyCustomersTypeData([] as CustomerTypeItem[]);
  setItemCategoryData([] as ItemCategoryItem[]);
  setItemSubCategoryData([] as ItemSubCategoryItem[]);
  setChannelListData([] as ChannelItem[]);
  setUserTypesData([] as UserTypeItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDropdowns();
  }, []);



  return (
    <AllDropdownListDataContext.Provider
      value={{
        companyList: companyListData,
        countryList: countryListData,
        regionList: regionListData,
        routeList: routeListData,
        warehouseList: warehouseListData,
        routeType: routeTypeData,
        areaList: areaListData,
        companyCustomers: companyCustomersData,
        companyCustomersType: companyCustomersTypeData,
        itemCategory: itemCategoryData,
        itemSubCategory: itemSubCategoryData,
        channelList: Array.isArray(channelListData) ? channelListData : [],
        userTypes: userTypesData,
        companyOptions,
        countryOptions,
        regionOptions,
        routeOptions,
        warehouseOptions,
        routeTypeOptions,
        areaOptions,
        companyCustomersOptions,
        companyCustomersTypeOptions,
        itemCategoryOptions,
        itemSubCategoryOptions,
        channelOptions,
        userTypeOptions,
        refreshDropdowns,
        loading
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};
