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
  userTypes,
  outletChannelList
} from '@/app/services/allApi';

// ---------- TypeScript Interfaces ----------
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
  outletChannelOptions: { value: string; label: string }[];
  refreshDropdowns: () => Promise<void>;
  loading: boolean;
}

// Minimal interfaces reflecting the expected fields returned by API for dropdown lists
interface CompanyItem { id?: number | string; company_code?: string; company_name?: string; }
interface CountryItem { id?: number | string; country_code?: string; country_name?: string; }
interface RegionItem { id?: number | string; region_code?: string; region_name?: string; }
interface RouteItem { id?: number | string; route_code?: string; route_name?: string; }
interface WarehouseItem { id?: number | string; warehouse_code?: string; warehouse_name?: string; }
interface RouteTypeItem { id?: number | string; route_type_code?: string; route_type_name?: string; }
interface AreaItem { id?: number | string; area_code?: string; area_name?: string; }
interface CustomerItem { id?: number | string; customer_code?: string; owner_name?: string; }
interface CustomerTypeItem { id?: number | string; code?: string; name?: string; }
interface ItemCategoryItem { id?: number | string; category_name?: string; }
interface ItemSubCategoryItem { id?: number | string; sub_category_name?: string; }
interface ChannelItem { id?: number | string; outlet_channel_code?: string; outlet_channel?: string; }
interface UserTypeItem { id?: number | string; code?: string; name?: string; }
interface OutletChannelItem { id?: number | string; outlet_channel_code?: string; outlet_channel?: string; }

// ---------- Context ----------
const AllDropdownListDataContext = createContext<DropdownDataContextType | undefined>(undefined);

export const useAllDropdownListData = () => {
  const context = useContext(AllDropdownListDataContext);
  if (!context) throw new Error('useAllDropdownListData must be used within AllDropdownListDataProvider');
  return context;
};

// ---------- Provider ----------
export const AllDropdownListDataProvider = ({ children }: { children: ReactNode }) => {
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
  const [outletChannelListData, setOutletChannelListData] = useState<OutletChannelItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------- Map data to dropdown options ----------
  const mapToOptions = <T extends { id?: number | string }>(arr: T[], labelFn: (item: T) => string) =>
    arr.map(item => ({ value: String(item.id ?? ''), label: labelFn(item) }));

  const companyOptions = mapToOptions(companyListData, c => c.company_code && c.company_name ? `${c.company_code} - ${c.company_name}` : (c.company_name ?? ''));
  const countryOptions = mapToOptions(countryListData, c => c.country_code && c.country_name ? `${c.country_code} - ${c.country_name}` : (c.country_name ?? ''));
  const regionOptions = mapToOptions(regionListData, c => c.region_code && c.region_name ? `${c.region_code} - ${c.region_name}` : (c.region_name ?? ''));
  const routeOptions = mapToOptions(routeListData, c => c.route_code && c.route_name ? `${c.route_code} - ${c.route_name}` : (c.route_name ?? ''));
  const warehouseOptions = mapToOptions(warehouseListData, c => c.warehouse_code && c.warehouse_name ? `${c.warehouse_code} - ${c.warehouse_name}` : (c.warehouse_name ?? ''));
  const routeTypeOptions = mapToOptions(routeTypeData, c => c.route_type_code && c.route_type_name ? `${c.route_type_code} - ${c.route_type_name}` : (c.route_type_name ?? ''));
  const areaOptions = mapToOptions(areaListData, c => c.area_code && c.area_name ? `${c.area_code} - ${c.area_name}` : (c.area_name ?? ''));
  const companyCustomersOptions = mapToOptions(companyCustomersData, c => c.customer_code && c.owner_name ? `${c.customer_code} - ${c.owner_name}` : (c.owner_name ?? ''));
  const companyCustomersTypeOptions = mapToOptions(companyCustomersTypeData, c => c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? ''));
  const itemCategoryOptions = mapToOptions(itemCategoryData, c => c.category_name ?? '');
  const itemSubCategoryOptions = mapToOptions(itemSubCategoryData, c => c.sub_category_name ?? '');
  const channelOptions = mapToOptions(channelListData, c => c.outlet_channel_code && c.outlet_channel ? `${c.outlet_channel_code} - ${c.outlet_channel}` : (c.outlet_channel ?? ''));
  const userTypeOptions = mapToOptions(userTypesData, c => c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? ''));
  const outletChannelOptions = mapToOptions(outletChannelListData, c => c.outlet_channel_code && c.outlet_channel ? `${c.outlet_channel_code} - ${c.outlet_channel}` : (c.outlet_channel ?? ''));

  // ---------- Fetch all dropdown data ----------
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
        userTypesRes,
        outletChannelListRes
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
        userTypes(),
        outletChannelList(),
      ]);

      setCompanyListData(company?.data ?? []);
      setCountryListData(country?.data ?? []);
      setRegionListData(region?.data ?? []);
      setRouteListData(route?.data ?? []);
      setWarehouseListData(warehouse?.data ?? []);
      setRouteTypeData(routeTypeRes?.data ?? []);
      setAreaListData(area?.data ?? []);
      setCompanyCustomersData(companyCustomers?.data ?? []);
      setCompanyCustomersTypeData(companyCustomersType?.data ?? []);
      setItemCategoryData(itemCategoryRes?.data ?? []);
      setItemSubCategoryData(itemSubCategoryRes?.data ?? []);
      setChannelListData(channelListRes?.data ?? []);
      setUserTypesData(userTypesRes?.data ?? []);
      setOutletChannelListData(outletChannelListRes?.data ?? []);

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setCompanyListData([]);
      setCountryListData([]);
      setRegionListData([]);
      setRouteListData([]);
      setWarehouseListData([]);
      setRouteTypeData([]);
      setAreaListData([]);
      setCompanyCustomersData([]);
      setCompanyCustomersTypeData([]);
      setItemCategoryData([]);
      setItemSubCategoryData([]);
      setChannelListData([]);
      setUserTypesData([]);
      setOutletChannelListData([]);
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
        channelList: channelListData,
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
        outletChannelOptions,
        refreshDropdowns,
        loading
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};
