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
  getCustomerType,
  salesmanTypeList,
  vehicleListData,
  customerCategoryList,
  customerSubCategoryList,
  itemList,
  getDiscountTypeList,
  menuList as getMenuList,
  salesmanList,
  agentCustomerList,
  submenuList,
  permissionList,
  SurveyList,
  getWarehouse,
  subRegionList
} from '@/app/services/allApi';
import { vendorList } from '@/app/services/assetsApi';
import { shelvesList } from '@/app/services/merchandiserApi';

interface DropdownDataContextType {
  companyList: CompanyItem[];
  countryList: CountryItem[];
  regionList: RegionItem[];
  SurveyList: SurveyItem[];
  routeList: RouteItem[];
  warehouseList: WarehouseItem[];
  routeType: RouteTypeItem[];
  areaList: AreaItem[];
  companyCustomers: CustomerItem[];
  companyCustomersType: CustomerTypeItem[];
  itemCategory: ItemCategoryItem[];
  itemSubCategory: ItemSubCategoryItem[];
  channelList: ChannelItem[];
  customerType: CustomerType[];
  userTypes: UserTypeItem[];
  salesmanType: SalesmanType[];
  vehicleList: VehicleListItem[];
  customerCategory: CustomerCategory[];
  customerSubCategory: CustomerSubCategory[];
  item: Item[];
  discountType: DiscountType[];
  menuList: MenuList[];
  // mapped dropdown options
  companyOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  onlyCountryOptions: { value: string; label: string }[];
  countryCurrency: { value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  surveyOptions: { value: string; label: string }[];
  routeOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
  routeTypeOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string, region_id: number; }[];
  companyCustomersOptions: { value: string; label: string }[];
  companyCustomersTypeOptions: { value: string; label: string }[];
  itemCategoryOptions: { value: string; label: string }[];
  itemSubCategoryOptions: { value: string; label: string }[];
  channelOptions: { value: string; label: string }[];
  customerTypeOptions: { value: string; label: string }[];
  userTypeOptions: { value: string; label: string }[];
  salesmanTypeOptions: { value: string; label: string }[];
  vehicleListOptions: { value: string; label: string }[];
  customerCategoryOptions: { value: string; label: string }[];
  customerSubCategoryOptions: { value: string; label: string }[];
  itemOptions: { value: string; label: string }[];
  discountTypeOptions: { value: string; label: string }[];
  menuOptions: { value: string; label: string }[];
  vendorOptions: { value: string; label: string }[];
  salesmanOptions: { value: string; label: string }[];
  agentCustomerOptions: { value: string; label: string }[];
  shelvesOptions: { value: string; label: string }[];
  submenuOptions: { value: string; label: string }[];
  permissions: permissionsList[];
  refreshDropdowns: () => Promise<void>;
  fetchItemSubCategoryOptions: (category_id: string | number) => Promise<void>;
  fetchAreaOptions: (region_id: string | number) => Promise<void>;
  fetchRouteOptions: (warehouse_id: string | number) => Promise<void>;
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
  currency?: string;
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
interface SurveyItem {
  id?: number | string;
  survey_code?: string;
  survey_name?: string;
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
  region_id?: number;
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
  category_code?: string;
}

interface ItemSubCategoryItem {
  id?: number | string;
  sub_category_name?: string;
  sub_category_code?: string;
}

interface ChannelItem {
  id?: number | string;
  outlet_channel_code?: string;
  outlet_channel?: string;
}
interface CustomerType {
  id?: number | string;
  code?: string;
  name?: string;
}

interface UserTypeItem {
  id?: number | string;
  code?: string;
  name?: string;
}

interface SalesmanType {
  id?: number | string;
  salesman_type_code?: string;
  salesman_type_name?: string;
}

interface VehicleListItem {
  id?: number | string;
  vehicle_code?: string;
}
interface CustomerCategory {
  id?: number | string;
  customer_category_code?: string;
  customer_category_name?: string;
}
interface CustomerSubCategory {
  id?: number | string;
  customer_sub_category_code?: string;
  customer_sub_category_name?: string;
}

interface Item {
  id?: number | string;
  code?: string;
  name?: string;
}

interface DiscountType {
  id?: number | string;
  discount_code?: string;
  discount_name?: string;
}
interface MenuList {
  id?: number | string;
  osa_code?: string;
  name?: string;
}

interface VendorList {
  id: number,
  uuid: string,
  code: string,
  name: string,
  email: string,
  address: string,
  status: number
}

interface SalesmanList {
  id: number,
  uuid: string,
  osa_code: string,
  name: string,
  status: number
}

interface AgentCustomerList {
  id: number,
  uuid: string,
  osa_code: string,
  name: string,
  status: number
}

interface ShelvesList {
  id: number;
  shelf_name: string;
}

interface submenuList {
  id: number;
  name: string;
}
interface permissionsList {
  id: number;
  name: string;
  guard_name: string;
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
  const [surveyListData, setSurveyListData] = useState<SurveyItem[]>([]);
  const [routeListData, setRouteListData] = useState<RouteItem[]>([]);
  const [warehouseListData, setWarehouseListData] = useState<WarehouseItem[]>([]);
  const [routeTypeData, setRouteTypeData] = useState<RouteTypeItem[]>([]);
  const [areaListData, setAreaListData] = useState<AreaItem[]>([]);
  const [companyCustomersData, setCompanyCustomersData] = useState<CustomerItem[]>([]);
  const [companyCustomersTypeData, setCompanyCustomersTypeData] = useState<CustomerTypeItem[]>([]);
  const [itemCategoryData, setItemCategoryData] = useState<ItemCategoryItem[]>([]);
  const [itemSubCategoryData, setItemSubCategoryData] = useState<ItemSubCategoryItem[]>([]);
  const [channelListData, setChannelListData] = useState<ChannelItem[]>([]);
  const [customerTypeData, setCustomerTypeData] = useState<CustomerType[]>([]);
  const [userTypesData, setUserTypesData] = useState<UserTypeItem[]>([]);
  const [salesmanTypesData, setSalesmanTypesData] = useState<SalesmanType[]>([]);
  const [VehicleList, setVehicleList] = useState<VehicleListItem[]>([]);
  const [customerCategory, setCustomerCategory] = useState<VehicleListItem[]>([]);
  const [customerSubCategory, setCustomerSubCategory] = useState<VehicleListItem[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType[]>([]);
  const [item, setItem] = useState<Item[]>([]);
  const [menuList, setMenuList] = useState<MenuList[]>([]);
  const [salesman, setSalesman] = useState<SalesmanList[]>([]);
  const [agentCustomer, setAgentCustomer] = useState<AgentCustomerList[]>([]);
  const [shelves, setShelves] = useState<ShelvesList[]>([]);
  const [vendor, setVendor] = useState<VendorList[]>([]);
  const [submenu, setSubmenu] = useState<submenuList[]>([]);
  const [permissions, setPermissions] = useState<permissionsList[]>([]);
  const [loading, setLoading] = useState(false);

  // mapped dropdown options (explicit typed mappings)
  const companyOptions = (Array.isArray(companyListData) ? companyListData : []).map((c: CompanyItem) => ({
    value: String(c.id ?? ''),
    label: c.company_code && c.company_name ? `${c.company_code} - ${c.company_name}` : (c.company_name ?? '')
  }));

  const countryOptions = (Array.isArray(countryListData) ? countryListData : []).map((c: CountryItem) => ({
    value: String(c.id ?? ''),
    label: c.country_code && c.country_name ? `${c.country_code} - ${c.country_name}` : (c.country_name ?? '')
  }));
  const onlyCountryOptions = (Array.isArray(countryListData) ? countryListData : []).map((c: CountryItem) => ({
    value: String(c.id ?? ''),
    label: c.country_name ? `${c.country_name}` : (c.country_name ?? '')
  }));

  const countryCurrency = (Array.isArray(countryListData) ? countryListData : []).map((c: CountryItem) => ({
    value: String(c.currency ?? ''),
    label: c.currency ? `${c.currency}` : (c.currency ?? '')
  }));

  const regionOptions = (Array.isArray(regionListData) ? regionListData : []).map((c: RegionItem) => ({
    value: String(c.id ?? ''),
    label: c.region_code && c.region_name ? `${c.region_code} - ${c.region_name}` : (c.region_name ?? '')
  }));
  const surveyOptions = (Array.isArray(surveyListData) ? surveyListData : []).map((c: SurveyItem) => ({
    value: String(c.id ?? ''),
    label: c.survey_code && c.survey_name ? `${c.survey_code} - ${c.survey_name}` : (c.survey_name ?? '')
  }));

  const routeOptions = (Array.isArray(routeListData) ? routeListData : []).map((c: RouteItem) => ({
    value: String(c.id ?? ''),
    label: c.route_code && c.route_name ? `${c.route_code} - ${c.route_name}` : (c.route_name ?? '')
  }));

  const warehouseOptions = (Array.isArray(warehouseListData) ? warehouseListData : []).map((c: WarehouseItem) => ({
    value: String(c.id ?? ''),
    label: c.warehouse_code && c.warehouse_name ? `${c.warehouse_code} - ${c.warehouse_name}` : (c.warehouse_name ?? '')
  }));

  const routeTypeOptions = (Array.isArray(routeTypeData) ? routeTypeData : []).map((c: RouteTypeItem) => ({
    value: String(c.id ?? ''),
    label: c.route_type_code && c.route_type_name ? `${c.route_type_code} - ${c.route_type_name}` : (c.route_type_name ?? '')
  }));

  const areaOptions = (Array.isArray(areaListData) ? areaListData : []).map((c: AreaItem) => ({
    value: String(c.id ?? ''),
    label: c.area_code && c.area_name ? `${c.area_code} - ${c.area_name}` : (c.area_name ?? ''),
    region_id: Number(c.region_id ?? '')
  }));

  const companyCustomersOptions = (Array.isArray(companyCustomersData) ? companyCustomersData : []).map((c: CustomerItem) => ({
    value: String(c.id ?? ''),
    label: c.customer_code && c.owner_name ? `${c.customer_code} - ${c.owner_name}` : (c.owner_name ?? '')
  }));

  const companyCustomersTypeOptions = (Array.isArray(companyCustomersTypeData) ? companyCustomersTypeData : []).map((c: CustomerTypeItem) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const itemCategoryOptions = (Array.isArray(itemCategoryData) ? itemCategoryData : []).map((c: ItemCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.category_code && c.category_name ? `${c.category_code} - ${c.category_name}` : (c.category_name ?? '')
  }));

  const itemSubCategoryOptions = (Array.isArray(itemSubCategoryData) ? itemSubCategoryData : []).map((c: ItemSubCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.sub_category_code && c.sub_category_name ? `${c.sub_category_code} - ${c.sub_category_name}` : (c.sub_category_name ?? '')
  }));

  const channelOptions = (Array.isArray(channelListData) ? channelListData : []).map((c: ChannelItem) => ({
    value: String(c.id ?? ''),
    label: c.outlet_channel_code && c.outlet_channel ? `${c.outlet_channel_code} - ${c.outlet_channel}` : (c.outlet_channel ?? '')
  }));
  const customerTypeOptions = (Array.isArray(customerTypeData) ? customerTypeData : []).map((c: CustomerType) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const userTypeOptions = (Array.isArray(userTypesData) ? userTypesData : []).map((c: UserTypeItem) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const salesmanTypeOptions = (Array.isArray(salesmanTypesData) ? salesmanTypesData : []).map((c: SalesmanType) => ({
    value: String(c.id ?? ''),
    label: c.salesman_type_code && c.salesman_type_name ? `${c.salesman_type_code} - ${c.salesman_type_name}` : (c.salesman_type_name ?? '')
  }));

  const vehicleListOptions = (Array.isArray(VehicleList) ? VehicleList : []).map((c: VehicleListItem) => ({
    value: String(c.id ?? ''),
    label: c.vehicle_code ? c.vehicle_code : '-',
  }));

  const customerCategoryOptions = (Array.isArray(customerCategory) ? customerCategory : []).map((c: CustomerCategory) => ({
    value: String(c.id ?? ''),
    label: c.customer_category_code && c.customer_category_name ? `${c.customer_category_code} - ${c.customer_category_name}` : (c.customer_category_name ?? '')
  }));

  const customerSubCategoryOptions = (Array.isArray(customerSubCategory) ? customerSubCategory : []).map((c: CustomerSubCategory) => ({
    value: String(c.id ?? ''),
    label: c.customer_sub_category_code && c.customer_sub_category_name ? `${c.customer_sub_category_code} - ${c.customer_sub_category_name}` : (c.customer_sub_category_name ?? '')
  }));

  const itemOptions = (Array.isArray(item) ? item : []).map((c: Item) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const discountTypeOptions = (Array.isArray(discountType) ? discountType : []).map((c: DiscountType) => ({
    value: String(c.id ?? ''),
    label: c.discount_code && c.discount_name ? `${c.discount_code} - ${c.discount_name}` : (c.discount_name ?? '')
  }));

  const menuOptions = (Array.isArray(menuList) ? menuList : []).map((c: MenuList) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }));

  const vendorOptions = (Array.isArray(vendor) ? vendor : []).map((c: VendorList) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const salesmanOptions = (Array.isArray(salesman) ? salesman : []).map((c: SalesmanList) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }));

  const agentCustomerOptions = (Array.isArray(agentCustomer) ? agentCustomer : []).map((c: AgentCustomerList) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }));

  const shelvesOptions = (Array.isArray(shelves) ? shelves : []).map((c: ShelvesList) => ({
    value: String(c.id ?? ''),
    label: c.shelf_name ?? ''
  }));

  const submenuOptions = (Array.isArray(submenu) ? submenu : []).map((c: submenuList) => ({
    value: String(c.id ?? ''),
    label: c.name ?? ''
  }));

  const permissionsOptions = (Array.isArray(permissions) ? permissions : []).map((c: permissionsList) => ({
    value: String(c.id ?? ''),
    label: c.name ?? '',
    guard_name: c.guard_name ?? ''
  }));

  const fetchAreaOptions = async (region_id: string | number) => {
    setLoading(false);
    try {
      // call subRegionList with an object matching the expected Params shape
      const res = await subRegionList({ region_id: String(region_id) });
      const normalize = (r: unknown): AreaItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as AreaItem[];
        }
        if (Array.isArray(r)) return r as AreaItem[];
        return [];
      };
      setAreaListData(normalize(res));
    } catch (error) {
      setAreaListData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteOptions = async (warehouse_id: string | number) => {
    setLoading(false);
    try {
      // call routeList with warehouse_id
      const res = await routeList({ warehouse_id: String(warehouse_id) });
      const normalize = (r: unknown): RouteItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as RouteItem[];
        }
        if (Array.isArray(r)) return r as RouteItem[];
        return [];
      };
      setRouteListData(normalize(res));
    } catch (error) {
      setRouteListData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemSubCategoryOptions = async (category_id: string | number) => {
    setLoading(false);
    try {
      // call itemSubCategory with category_id
      const res = await itemSubCategory({ category_id: String(category_id) });
      const normalize = (r: unknown): ItemSubCategoryItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as ItemSubCategoryItem[];
        }
        if (Array.isArray(r)) return r as ItemSubCategoryItem[];
        return [];
      };
      setItemSubCategoryData(normalize(res));
    } catch (error) {
      setItemSubCategoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshDropdowns = async () => {
    setLoading(true);
    try {
      const res = await Promise.all([
        companyList(),
        countryList(),
        regionList(),
        SurveyList(),
        routeList({}),
        getWarehouse(),
        routeType(),
        getSubRegion(),
        getCompanyCustomers(),
        getCompanyCustomersType(),
        itemCategory(),
        itemSubCategory(),
        channelList(),
        getCustomerType(),
        userTypes(),
        salesmanTypeList({}),
        vehicleListData(),
        customerCategoryList(),
        customerSubCategoryList(),
        itemList(),
        getDiscountTypeList(),
        getMenuList(),
        vendorList(),
        salesmanList(),
        agentCustomerList(),
        shelvesList(),
        submenuList(),
        permissionList(),
      ]);


      // normalize: accept unknown response and extract array of items from `.data` when present
      const normalize = (r: unknown): unknown[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as unknown[];
        }
        if (Array.isArray(r)) return r as unknown[];
        return (r as unknown) ? [r as unknown] : [];
      };

      setCompanyListData(normalize(res[0]) as CompanyItem[]);
      setCountryListData(normalize(res[1]) as CountryItem[]);
      setRegionListData(normalize(res[2]) as RegionItem[]);
      setSurveyListData(normalize(res[3]) as SurveyItem[]);
      setRouteListData(normalize(res[4]) as RouteItem[]);
      setWarehouseListData(normalize(res[5]) as WarehouseItem[]);
      setRouteTypeData(normalize(res[6]) as RouteTypeItem[]);
      setAreaListData(normalize(res[7]) as AreaItem[]);
      setCompanyCustomersData(normalize(res[8]) as CustomerItem[]);
      setCompanyCustomersTypeData(normalize(res[9]) as CustomerTypeItem[]);
      setItemCategoryData(normalize(res[10]) as ItemCategoryItem[]);
      setItemSubCategoryData(normalize(res[11]) as ItemSubCategoryItem[]);
      setChannelListData(normalize(res[12]) as ChannelItem[]);
      setCustomerTypeData(normalize(res[13]) as CustomerType[]);
      setUserTypesData(normalize(res[14]) as UserTypeItem[]);
      setSalesmanTypesData(normalize(res[15]) as SalesmanType[]);
      setVehicleList(normalize(res[16]) as VehicleListItem[]);
      setCustomerCategory(normalize(res[17]) as CustomerCategory[]);
      setCustomerSubCategory(normalize(res[18]) as CustomerSubCategory[]);
      setItem(normalize(res[19]) as Item[]);
      setDiscountType(normalize(res[20]) as DiscountType[]);
      setMenuList(normalize(res[21]) as MenuList[]);
      setVendor(normalize(res[22]) as VendorList[]);
      setSalesman(normalize(res[23]) as SalesmanList[]);
      setAgentCustomer(normalize(res[24]) as AgentCustomerList[]);
      setShelves(normalize(res[25]) as ShelvesList[]);
      setSubmenu(normalize(res[26]) as submenuList[]);
      setPermissions(normalize(res[27]) as permissionsList[]);

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      // on error clear to empty arrays
      setCompanyListData([]);
      setCountryListData([]);
      setRegionListData([]);
      setSurveyListData([]);
      setRouteListData([]);
      setWarehouseListData([]);
      setRouteTypeData([]);
      setAreaListData([]);
      setCompanyCustomersData([]);
      setCompanyCustomersTypeData([]);
      setItemCategoryData([]);
      setItemSubCategoryData([]);
      setChannelListData([]);
      setCustomerTypeData([]);
      setUserTypesData([]);
      setSalesmanTypesData([]);
      setVehicleList([]);
      setCustomerCategory([]);
      setCustomerSubCategory([]);
      setItem([]);
      setDiscountType([]);
      setMenuList([]);
      setVendor([]);
      setSalesman([]);
      setAgentCustomer([]);
      setShelves([]);
      setSubmenu([]);
      setPermissions([]);
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
        SurveyList: surveyListData,
        routeList: routeListData,
        warehouseList: warehouseListData,
        routeType: routeTypeData,
        areaList: areaListData,
        companyCustomers: companyCustomersData,
        companyCustomersType: companyCustomersTypeData,
        itemCategory: itemCategoryData,
        itemSubCategory: itemSubCategoryData,
        channelList: Array.isArray(channelListData) ? channelListData : [],
        customerType: customerTypeData,
        userTypes: userTypesData,
        salesmanType: salesmanTypesData,
        vehicleList: VehicleList,
        customerCategory: customerCategory,
        customerSubCategory: customerSubCategory,
        item: item,
        discountType: discountType,
        menuList: menuList,
        fetchItemSubCategoryOptions,
        companyOptions,
        countryOptions,
        onlyCountryOptions,
        countryCurrency,
        regionOptions,
        surveyOptions,
        routeOptions,
        warehouseOptions,
        routeTypeOptions,
        areaOptions,
        companyCustomersOptions,
        companyCustomersTypeOptions,
        itemCategoryOptions,
        itemSubCategoryOptions,
        channelOptions,
        customerTypeOptions,
        userTypeOptions,
        salesmanTypeOptions,
        vehicleListOptions,
        customerCategoryOptions,
        customerSubCategoryOptions,
        itemOptions,
        discountTypeOptions,
        menuOptions,
        vendorOptions,
        salesmanOptions,
        agentCustomerOptions,
        shelvesOptions,
        submenuOptions,
        permissions,
        refreshDropdowns,
        fetchAreaOptions,
        fetchRouteOptions,
        loading
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};