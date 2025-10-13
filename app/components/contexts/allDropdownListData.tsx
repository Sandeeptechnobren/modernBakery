// "use client";
// import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
// import {
//   companyList,
//   countryList,
//   regionList,
//   routeList,
//   warehouseType,
//   routeType,
//   getSubRegion,
//   getCompanyCustomers,
//   getCompanyCustomersType,
//   itemCategory,
//   itemSubCategory,
//   channelList,
//   getCustomerType,
//   userTypes,
//   salesmanTypeList,
//   vehicleListData,
//   customerCategoryList,
//   customerSubCategoryList,
//   itemList,
//   getDiscountTypeList,
//   menuList as getMenuList,
//   salesmanList,
//   agentCustomerList,
//   submenuList,
//   permissionList,
//   SurveyList
// } from "@/app/services/allApi";
// import { vendorList } from "@/app/services/assetsApi";
// import { shelvesList } from "@/app/services/merchandiserApi";

// export type Option = { value: string; label: string };

// // Minimal shared item shape
// interface BaseItem {
//   id?: number | string;
//   [k: string]: unknown;
// }

// /* -- Specific item shapes used in legacy naming (keep minimal to cover labels) -- */
// interface CompanyItem extends BaseItem { company_code?: string; company_name?: string; }
// interface CountryItem extends BaseItem { country_code?: string; country_name?: string; currency?: string; }
// interface RegionItem extends BaseItem { region_code?: string; region_name?: string; }
// interface SurveyItem extends BaseItem { survey_code?: string; survey_name?: string; }
// interface RouteItem extends BaseItem { route_code?: string; route_name?: string; }
// interface WarehouseItem extends BaseItem { warehouse_code?: string; warehouse_name?: string; }
// interface RouteTypeItem extends BaseItem { route_type_code?: string; route_type_name?: string; }
// interface AreaItem extends BaseItem { area_code?: string; area_name?: string; }
// interface CustomerItem extends BaseItem { customer_code?: string; owner_name?: string; }
// interface CustomerTypeItem extends BaseItem { code?: string; name?: string; }
// interface ItemCategoryItem extends BaseItem { category_code?: string; category_name?: string; }
// interface ItemSubCategoryItem extends BaseItem { sub_category_code?: string; sub_category_name?: string; }
// interface ChannelItem extends BaseItem { outlet_channel?: string; outlet_channel_code?: string; }
// interface UserTypeItem extends BaseItem { code?: string; name?: string; }
// interface SalesmanType extends BaseItem { salesman_type_code?: string; salesman_type_name?: string; }
// interface VehicleListItem extends BaseItem { vehicle_code?: string; }
// interface CustomerCategory extends BaseItem { customer_category_code?: string; customer_category_name?: string; }
// interface CustomerSubCategory extends BaseItem { customer_sub_category_code?: string; customer_sub_category_name?: string; }
// interface Item extends BaseItem { code?: string; name?: string; }
// interface DiscountType extends BaseItem { discount_code?: string; discount_name?: string; }
// interface MenuList extends BaseItem { osa_code?: string; name?: string; }
// interface VendorList extends BaseItem { code?: string; name?: string; }
// interface SalesmanList extends BaseItem { osa_code?: string; name?: string; }
// interface AgentCustomerList extends BaseItem { osa_code?: string; name?: string; }
// interface ShelvesList extends BaseItem { shelf_name?: string; }
// interface SubmenuList extends BaseItem { name?: string; }
// interface PermissionsList extends BaseItem { name?: string; }

// /* -- Lists container typed with exact names used across project -- */
// interface ListsType {
//   companyList: CompanyItem[];
//   countryList: CountryItem[];
//   regionList: RegionItem[];
//   surveyList: SurveyItem[];
//   routeList: RouteItem[];
//   warehouseList: WarehouseItem[];
//   routeType: RouteTypeItem[];
//   areaList: AreaItem[];
//   companyCustomers: CustomerItem[];
//   companyCustomersType: CustomerTypeItem[];
//   itemCategory: ItemCategoryItem[];
//   itemSubCategory: ItemSubCategoryItem[];
//   channelList: ChannelItem[];
//   customerType: CustomerTypeItem[];
//   userTypes: UserTypeItem[];
//   salesmanType: SalesmanType[];
//   vehicleList: VehicleListItem[];
//   customerCategory: CustomerCategory[];
//   customerSubCategory: CustomerSubCategory[];
//   item: Item[];
//   discountType: DiscountType[];
//   menuList: MenuList[];
//   vendor: VendorList[];
//   salesman: SalesmanList[];
//   agentCustomer: AgentCustomerList[];
//   shelves: ShelvesList[];
//   submenu: SubmenuList[];
//   permissions: PermissionsList[];
// }

// /* -- Options map keyed by the same list keys -- */
// type OptionsMap = {
//   [K in keyof ListsType]: Option[];
// };

// /* -- Context shape with legacy top-level names preserved (no `any`) -- */
// export interface DropdownDataContextType {
//   lists: ListsType;
//   options: OptionsMap;
//   // raw lists (legacy)
//   companyList: CompanyItem[];
//   countryList: CountryItem[];
//   regionList: RegionItem[];
//   surveyList: SurveyItem[];
//   routeList: RouteItem[];
//   warehouseList: WarehouseItem[];
//   routeType: RouteTypeItem[];
//   areaList: AreaItem[];
//   companyCustomers: CustomerItem[];
//   companyCustomersType: CustomerTypeItem[];
//   itemCategory: ItemCategoryItem[];
//   itemSubCategory: ItemSubCategoryItem[];
//   channelList: ChannelItem[];
//   customerType: CustomerTypeItem[];
//   userTypes: UserTypeItem[];
//   salesmanType: SalesmanType[];
//   vehicleList: VehicleListItem[];
//   customerCategory: CustomerCategory[];
//   customerSubCategory: CustomerSubCategory[];
//   item: Item[];
//   discountType: DiscountType[];
//   menuList: MenuList[];
//   vendor: VendorList[];
//   salesman: SalesmanList[];
//   agentCustomer: AgentCustomerList[];
//   shelves: ShelvesList[];
//   submenu: SubmenuList[];
//   permissions: PermissionsList[];
//   // legacy options
//   companyOptions: Option[];
//   countryOptions: Option[];
//   onlyCountryOptions: Option[];
//   countryCurrency: Option[];
//   regionOptions: Option[];
//   surveyOptions: Option[];
//   routeOptions: Option[];
//   warehouseOptions: Option[];
//   routeTypeOptions: Option[];
//   areaOptions: Option[];
//   companyCustomersOptions: Option[];
//   companyCustomersTypeOptions: Option[];
//   itemCategoryOptions: Option[];
//   itemSubCategoryOptions: Option[];
//   channelOptions: Option[];
//   customerTypeOptions: Option[];
//   userTypeOptions: Option[];
//   salesmanTypeOptions: Option[];
//   vehicleListOptions: Option[];
//   customerCategoryOptions: Option[];
//   customerSubCategoryOptions: Option[];
//   itemOptions: Option[];
//   discountTypeOptions: Option[];
//   menuOptions: Option[];
//   vendorOptions: Option[];
//   salesmanOptions: Option[];
//   agentCustomerOptions: Option[];
//   shelvesOptions: Option[];
//   submenuOptions: Option[];
//   permissionsOptions: Option[];
//   // control
//   refreshDropdowns: () => Promise<void>;
//   loading: boolean;
// }

// const defaultLists: ListsType = {
//   companyList: [],
//   countryList: [],
//   regionList: [],
//   surveyList: [],
//   routeList: [],
//   warehouseList: [],
//   routeType: [],
//   areaList: [],
//   companyCustomers: [],
//   companyCustomersType: [],
//   itemCategory: [],
//   itemSubCategory: [],
//   channelList: [],
//   customerType: [],
//   userTypes: [],
//   salesmanType: [],
//   vehicleList: [],
//   customerCategory: [],
//   customerSubCategory: [],
//   item: [],
//   discountType: [],
//   menuList: [],
//   vendor: [],
//   salesman: [],
//   agentCustomer: [],
//   shelves: [],
//   submenu: [],
//   permissions: [],
// };

// const AllDropdownListDataContext = createContext<DropdownDataContextType | undefined>(undefined);

// export const useAllDropdownListData = (): DropdownDataContextType => {
//   const ctx = useContext(AllDropdownListDataContext);
//   if (!ctx) throw new Error("useAllDropdownListData must be used within AllDropdownListDataProvider");
//   return ctx;
// };

// const normalizeResponse = (r: unknown): BaseItem[] => {
//   if (!r) return [];
//   if (Array.isArray(r)) return r as BaseItem[];
//   if (typeof r === "object" && r !== null) {
//     const obj = r as Record<string, unknown>;
//     if (Array.isArray(obj.data)) return obj.data as BaseItem[];
//   }
//   return [];
// };

// const labelFor = (item: BaseItem, keys: string[]) => {
//   for (const k of keys) {
//     const v = item[k];
//     if (v !== undefined && v !== null) {
//       const s = String(v).trim();
//       if (s !== "") return s;
//     }
//   }
//   return String(item.id ?? "");
// };

// // central descriptor: add new entries here to include new API + label strategy
// type ListKey = keyof ListsType;
// const descriptors: { key: ListKey; fetch: () => Promise<unknown>; labelKeys?: string[] }[] = [
//   { key: "companyList", fetch: companyList, labelKeys: ["company_code", "company_name", "name"] },
//   { key: "countryList", fetch: countryList, labelKeys: ["country_code", "country_name", "name"] },
//   { key: "regionList", fetch: regionList, labelKeys: ["region_code", "region_name", "name"] },
//   { key: "surveyList", fetch: SurveyList, labelKeys: ["survey_code", "survey_name", "name"] },
//   { key: "routeList", fetch: () => routeList({}), labelKeys: ["route_code", "route_name", "name"] },
//   { key: "warehouseList", fetch: () => warehouseType(1), labelKeys: ["warehouse_code", "warehouse_name", "name"] },
//   { key: "routeType", fetch: routeType, labelKeys: ["route_type_code", "route_type_name", "name"] },
//   { key: "areaList", fetch: getSubRegion, labelKeys: ["area_code", "area_name", "name"] },
//   { key: "companyCustomers", fetch: getCompanyCustomers, labelKeys: ["customer_code", "owner_name", "name"] },
//   { key: "companyCustomersType", fetch: getCompanyCustomersType, labelKeys: ["code", "name"] },
//   { key: "itemCategory", fetch: itemCategory, labelKeys: ["category_code", "category_name", "name"] },
//   { key: "itemSubCategory", fetch: itemSubCategory, labelKeys: ["sub_category_code", "sub_category_name", "name"] },
//   { key: "channelList", fetch: channelList, labelKeys: ["outlet_channel_code", "outlet_channel", "name"] },
//   { key: "customerType", fetch: getCustomerType, labelKeys: ["code", "name"] },
//   { key: "userTypes", fetch: userTypes, labelKeys: ["code", "name"] },
//   { key: "salesmanType", fetch: () => salesmanTypeList({}), labelKeys: ["salesman_type_code", "salesman_type_name", "name"] },
//   { key: "vehicleList", fetch: vehicleListData, labelKeys: ["vehicle_code", "name"] },
//   { key: "customerCategory", fetch: customerCategoryList, labelKeys: ["customer_category_code", "customer_category_name", "name"] },
//   { key: "customerSubCategory", fetch: customerSubCategoryList, labelKeys: ["customer_sub_category_code", "customer_sub_category_name", "name"] },
//   { key: "item", fetch: itemList, labelKeys: ["code", "name"] },
//   { key: "discountType", fetch: getDiscountTypeList, labelKeys: ["discount_code", "discount_name", "name"] },
//   { key: "menuList", fetch: getMenuList, labelKeys: ["osa_code", "name"] },
//   { key: "vendor", fetch: vendorList, labelKeys: ["code", "name"] },
//   { key: "salesman", fetch: salesmanList, labelKeys: ["osa_code", "name"] },
//   { key: "agentCustomer", fetch: agentCustomerList, labelKeys: ["osa_code", "name"] },
//   { key: "shelves", fetch: shelvesList, labelKeys: ["shelf_name", "name"] },
//   { key: "submenu", fetch: submenuList, labelKeys: ["name"] },
//   { key: "permissions", fetch: permissionList, labelKeys: ["name"] },
// ];

// export const AllDropdownListDataProvider = ({ children }: { children: ReactNode }) => {
//   const [lists, setLists] = useState<ListsType>(defaultLists);
//   const [loading, setLoading] = useState<boolean>(false);

//   const refreshDropdowns = async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const responses = await Promise.all(descriptors.map((d) => d.fetch()));
//       const next: ListsType = { ...defaultLists };
//       for (let i = 0; i < descriptors.length; i++) {
//         const key = descriptors[i].key;
//         next[key] = normalizeResponse(responses[i]) as ListsType[typeof key];
//       }
//       setLists(next);
//     } catch (err) {
//       console.error("Error loading dropdowns", err);
//       setLists(defaultLists);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void refreshDropdowns();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const options = useMemo<OptionsMap>(() => {
//     const out = {} as OptionsMap;
//     for (const d of descriptors) {
//       const arr = lists[d.key] as BaseItem[];
//       const keys = d.labelKeys ?? ["name", "code", "id"];
//       out[d.key] = arr.map((it) => ({ value: String(it.id ?? ""), label: labelFor(it, keys) }));
//     }
//     return out;
//   }, [lists]);

//   // explicit legacy mappings (keeps typing safe)
//   const contextValue: DropdownDataContextType = {
//     lists,
//     options,
//     companyList: lists.companyList,
//     countryList: lists.countryList,
//     regionList: lists.regionList,
//     surveyList: lists.surveyList,
//     routeList: lists.routeList,
//     warehouseList: lists.warehouseList,
//     routeType: lists.routeType,
//     areaList: lists.areaList,
//     companyCustomers: lists.companyCustomers,
//     companyCustomersType: lists.companyCustomersType,
//     itemCategory: lists.itemCategory,
//     itemSubCategory: lists.itemSubCategory,
//     channelList: lists.channelList,
//     customerType: lists.customerType,
//     userTypes: lists.userTypes,
//     salesmanType: lists.salesmanType,
//     vehicleList: lists.vehicleList,
//     customerCategory: lists.customerCategory,
//     customerSubCategory: lists.customerSubCategory,
//     item: lists.item,
//     discountType: lists.discountType,
//     menuList: lists.menuList,
//     vendor: lists.vendor,
//     salesman: lists.salesman,
//     agentCustomer: lists.agentCustomer,
//     shelves: lists.shelves,
//     submenu: lists.submenu,
//     permissions: lists.permissions,
//     companyOptions: options.companyList,
//     countryOptions: options.countryList,
//     onlyCountryOptions: lists.countryList.map((it) => ({ value: String(it.id ?? ""), label: labelFor(it, ["country_name", "country_code", "name"]) })),
//     countryCurrency: lists.countryList.map((it) => ({ value: String((it as CountryItem).currency ?? ""), label: String((it as CountryItem).currency ?? "") })),
//     regionOptions: options.regionList,
//     surveyOptions: options.surveyList,
//     routeOptions: options.routeList,
//     warehouseOptions: options.warehouseList,
//     routeTypeOptions: options.routeType,
//     areaOptions: options.areaList,
//     companyCustomersOptions: options.companyCustomers,
//     companyCustomersTypeOptions: options.companyCustomersType,
//     itemCategoryOptions: options.itemCategory,
//     itemSubCategoryOptions: options.itemSubCategory,
//     channelOptions: options.channelList,
//     customerTypeOptions: options.customerType,
//     userTypeOptions: options.userTypes,
//     salesmanTypeOptions: options.salesmanType,
//     vehicleListOptions: options.vehicleList,
//     customerCategoryOptions: options.customerCategory,
//     customerSubCategoryOptions: options.customerSubCategory,
//     itemOptions: options.item,
//     discountTypeOptions: options.discountType,
//     menuOptions: options.menuList,
//     vendorOptions: options.vendor,
//     salesmanOptions: options.salesman,
//     agentCustomerOptions: options.agentCustomer,
//     shelvesOptions: options.shelves,
//     submenuOptions: options.submenu,
//     permissionsOptions: options.permissions,
//     refreshDropdowns,
//     loading,
//   };

//   return <AllDropdownListDataContext.Provider value={contextValue}>{children}</AllDropdownListDataContext.Provider>;
// };



"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  companyList,
  countryList,
  regionList,
  routeList,
  warehouseType,
  routeType,
  subRegionList,
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
  SurveyList
} from '@/app/services/allApi';
import { vendorList } from '@/app/services/assetsApi';
import { shelvesList } from '@/app/services/merchandiserApi';

interface DropdownDataContextType {
  companyList: CompanyItem[];
  countryList: CountryItem[];
  regionList: RegionItem[];
  SurveyList:SurveyItem[];
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
  countryCurrency: {value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  surveyOptions: { value: string; label: string }[];
  routeOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
  routeTypeOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string,region_id: number; }[];
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
  // fetch area helper to load areaOptions for a given region
  fetchAreaOptions: (region_id: string | number) => Promise<void>;
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
    setLoading(true);
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

  const refreshDropdowns = async () => {
    setLoading(true);
    try {
      const res = await Promise.all([
        companyList(),
        countryList(),
        regionList(),
        SurveyList(),
        routeList({}),
        warehouseType(1),
        routeType(),
        subRegionList(),
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
        loading
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};