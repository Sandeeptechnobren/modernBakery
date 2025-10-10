"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
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
  getCustomerType,
  userTypes,
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
} from "@/app/services/allApi";
import { vendorList } from "@/app/services/assetsApi";
import { shelvesList } from "@/app/services/merchandiserApi";

export type Option = { value: string; label: string };

// Minimal shared item shape
interface BaseItem {
  id?: number | string;
  [k: string]: unknown;
}

/* -- Specific item shapes used in legacy naming (keep minimal to cover labels) -- */
interface CompanyItem extends BaseItem { company_code?: string; company_name?: string; }
interface CountryItem extends BaseItem { country_code?: string; country_name?: string; currency?: string; }
interface RegionItem extends BaseItem { region_code?: string; region_name?: string; }
interface SurveyItem extends BaseItem { survey_code?: string; survey_name?: string; }
interface RouteItem extends BaseItem { route_code?: string; route_name?: string; }
interface WarehouseItem extends BaseItem { warehouse_code?: string; warehouse_name?: string; }
interface RouteTypeItem extends BaseItem { route_type_code?: string; route_type_name?: string; }
interface AreaItem extends BaseItem { area_code?: string; area_name?: string; }
interface CustomerItem extends BaseItem { customer_code?: string; owner_name?: string; }
interface CustomerTypeItem extends BaseItem { code?: string; name?: string; }
interface ItemCategoryItem extends BaseItem { category_code?: string; category_name?: string; }
interface ItemSubCategoryItem extends BaseItem { sub_category_code?: string; sub_category_name?: string; }
interface ChannelItem extends BaseItem { outlet_channel?: string; outlet_channel_code?: string; }
interface UserTypeItem extends BaseItem { code?: string; name?: string; }
interface SalesmanType extends BaseItem { salesman_type_code?: string; salesman_type_name?: string; }
interface VehicleListItem extends BaseItem { vehicle_code?: string; }
interface CustomerCategory extends BaseItem { customer_category_code?: string; customer_category_name?: string; }
interface CustomerSubCategory extends BaseItem { customer_sub_category_code?: string; customer_sub_category_name?: string; }
interface Item extends BaseItem { code?: string; name?: string; }
interface DiscountType extends BaseItem { discount_code?: string; discount_name?: string; }
interface MenuList extends BaseItem { osa_code?: string; name?: string; }
interface VendorList extends BaseItem { code?: string; name?: string; }
interface SalesmanList extends BaseItem { osa_code?: string; name?: string; }
interface AgentCustomerList extends BaseItem { osa_code?: string; name?: string; }
interface ShelvesList extends BaseItem { shelf_name?: string; }
interface SubmenuList extends BaseItem { name?: string; }
interface PermissionsList extends BaseItem { name?: string; }

/* -- Lists container typed with exact names used across project -- */
interface ListsType {
  companyList: CompanyItem[];
  countryList: CountryItem[];
  regionList: RegionItem[];
  surveyList: SurveyItem[];
  routeList: RouteItem[];
  warehouseList: WarehouseItem[];
  routeType: RouteTypeItem[];
  areaList: AreaItem[];
  companyCustomers: CustomerItem[];
  companyCustomersType: CustomerTypeItem[];
  itemCategory: ItemCategoryItem[];
  itemSubCategory: ItemSubCategoryItem[];
  channelList: ChannelItem[];
  customerType: CustomerTypeItem[];
  userTypes: UserTypeItem[];
  salesmanType: SalesmanType[];
  vehicleList: VehicleListItem[];
  customerCategory: CustomerCategory[];
  customerSubCategory: CustomerSubCategory[];
  item: Item[];
  discountType: DiscountType[];
  menuList: MenuList[];
  vendor: VendorList[];
  salesman: SalesmanList[];
  agentCustomer: AgentCustomerList[];
  shelves: ShelvesList[];
  submenu: SubmenuList[];
  permissions: PermissionsList[];
}

/* -- Options map keyed by the same list keys -- */
type OptionsMap = {
  [K in keyof ListsType]: Option[];
};

/* -- Context shape with legacy top-level names preserved (no `any`) -- */
export interface DropdownDataContextType {
  lists: ListsType;
  options: OptionsMap;
  // raw lists (legacy)
  companyList: CompanyItem[];
  countryList: CountryItem[];
  regionList: RegionItem[];
  surveyList: SurveyItem[];
  routeList: RouteItem[];
  warehouseList: WarehouseItem[];
  routeType: RouteTypeItem[];
  areaList: AreaItem[];
  companyCustomers: CustomerItem[];
  companyCustomersType: CustomerTypeItem[];
  itemCategory: ItemCategoryItem[];
  itemSubCategory: ItemSubCategoryItem[];
  channelList: ChannelItem[];
  customerType: CustomerTypeItem[];
  userTypes: UserTypeItem[];
  salesmanType: SalesmanType[];
  vehicleList: VehicleListItem[];
  customerCategory: CustomerCategory[];
  customerSubCategory: CustomerSubCategory[];
  item: Item[];
  discountType: DiscountType[];
  menuList: MenuList[];
  vendor: VendorList[];
  salesman: SalesmanList[];
  agentCustomer: AgentCustomerList[];
  shelves: ShelvesList[];
  submenu: SubmenuList[];
  permissions: PermissionsList[];
  // legacy options
  companyOptions: Option[];
  countryOptions: Option[];
  onlyCountryOptions: Option[];
  countryCurrency: Option[];
  regionOptions: Option[];
  surveyOptions: Option[];
  routeOptions: Option[];
  warehouseOptions: Option[];
  routeTypeOptions: Option[];
  areaOptions: Option[];
  companyCustomersOptions: Option[];
  companyCustomersTypeOptions: Option[];
  itemCategoryOptions: Option[];
  itemSubCategoryOptions: Option[];
  channelOptions: Option[];
  customerTypeOptions: Option[];
  userTypeOptions: Option[];
  salesmanTypeOptions: Option[];
  vehicleListOptions: Option[];
  customerCategoryOptions: Option[];
  customerSubCategoryOptions: Option[];
  itemOptions: Option[];
  discountTypeOptions: Option[];
  menuOptions: Option[];
  vendorOptions: Option[];
  salesmanOptions: Option[];
  agentCustomerOptions: Option[];
  shelvesOptions: Option[];
  submenuOptions: Option[];
  permissionsOptions: Option[];
  // control
  refreshDropdowns: () => Promise<void>;
  loading: boolean;
}

const defaultLists: ListsType = {
  companyList: [],
  countryList: [],
  regionList: [],
  surveyList: [],
  routeList: [],
  warehouseList: [],
  routeType: [],
  areaList: [],
  companyCustomers: [],
  companyCustomersType: [],
  itemCategory: [],
  itemSubCategory: [],
  channelList: [],
  customerType: [],
  userTypes: [],
  salesmanType: [],
  vehicleList: [],
  customerCategory: [],
  customerSubCategory: [],
  item: [],
  discountType: [],
  menuList: [],
  vendor: [],
  salesman: [],
  agentCustomer: [],
  shelves: [],
  submenu: [],
  permissions: [],
};

const AllDropdownListDataContext = createContext<DropdownDataContextType | undefined>(undefined);

export const useAllDropdownListData = (): DropdownDataContextType => {
  const ctx = useContext(AllDropdownListDataContext);
  if (!ctx) throw new Error("useAllDropdownListData must be used within AllDropdownListDataProvider");
  return ctx;
};

const normalizeResponse = (r: unknown): BaseItem[] => {
  if (!r) return [];
  if (Array.isArray(r)) return r as BaseItem[];
  if (typeof r === "object" && r !== null) {
    const obj = r as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as BaseItem[];
  }
  return [];
};

const labelFor = (item: BaseItem, keys: string[]) => {
  for (const k of keys) {
    const v = item[k];
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      if (s !== "") return s;
    }
  }
  return String(item.id ?? "");
};

// central descriptor: add new entries here to include new API + label strategy
type ListKey = keyof ListsType;
const descriptors: { key: ListKey; fetch: () => Promise<unknown>; labelKeys?: string[] }[] = [
  { key: "companyList", fetch: companyList, labelKeys: ["company_code", "company_name", "name"] },
  { key: "countryList", fetch: countryList, labelKeys: ["country_code", "country_name", "name"] },
  { key: "regionList", fetch: regionList, labelKeys: ["region_code", "region_name", "name"] },
  { key: "surveyList", fetch: SurveyList, labelKeys: ["survey_code", "survey_name", "name"] },
  { key: "routeList", fetch: () => routeList({}), labelKeys: ["route_code", "route_name", "name"] },
  { key: "warehouseList", fetch: () => warehouseType(1), labelKeys: ["warehouse_code", "warehouse_name", "name"] },
  { key: "routeType", fetch: routeType, labelKeys: ["route_type_code", "route_type_name", "name"] },
  { key: "areaList", fetch: getSubRegion, labelKeys: ["area_code", "area_name", "name"] },
  { key: "companyCustomers", fetch: getCompanyCustomers, labelKeys: ["customer_code", "owner_name", "name"] },
  { key: "companyCustomersType", fetch: getCompanyCustomersType, labelKeys: ["code", "name"] },
  { key: "itemCategory", fetch: itemCategory, labelKeys: ["category_code", "category_name", "name"] },
  { key: "itemSubCategory", fetch: itemSubCategory, labelKeys: ["sub_category_code", "sub_category_name", "name"] },
  { key: "channelList", fetch: channelList, labelKeys: ["outlet_channel_code", "outlet_channel", "name"] },
  { key: "customerType", fetch: getCustomerType, labelKeys: ["code", "name"] },
  { key: "userTypes", fetch: userTypes, labelKeys: ["code", "name"] },
  { key: "salesmanType", fetch: () => salesmanTypeList({}), labelKeys: ["salesman_type_code", "salesman_type_name", "name"] },
  { key: "vehicleList", fetch: vehicleListData, labelKeys: ["vehicle_code", "name"] },
  { key: "customerCategory", fetch: customerCategoryList, labelKeys: ["customer_category_code", "customer_category_name", "name"] },
  { key: "customerSubCategory", fetch: customerSubCategoryList, labelKeys: ["customer_sub_category_code", "customer_sub_category_name", "name"] },
  { key: "item", fetch: itemList, labelKeys: ["code", "name"] },
  { key: "discountType", fetch: getDiscountTypeList, labelKeys: ["discount_code", "discount_name", "name"] },
  { key: "menuList", fetch: getMenuList, labelKeys: ["osa_code", "name"] },
  { key: "vendor", fetch: vendorList, labelKeys: ["code", "name"] },
  { key: "salesman", fetch: salesmanList, labelKeys: ["osa_code", "name"] },
  { key: "agentCustomer", fetch: agentCustomerList, labelKeys: ["osa_code", "name"] },
  { key: "shelves", fetch: shelvesList, labelKeys: ["shelf_name", "name"] },
  { key: "submenu", fetch: submenuList, labelKeys: ["name"] },
  { key: "permissions", fetch: permissionList, labelKeys: ["name"] },
];

export const AllDropdownListDataProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<ListsType>(defaultLists);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshDropdowns = async (): Promise<void> => {
    setLoading(true);
    try {
      const responses = await Promise.all(descriptors.map((d) => d.fetch()));
      const next: ListsType = { ...defaultLists };
      for (let i = 0; i < descriptors.length; i++) {
        const key = descriptors[i].key;
        next[key] = normalizeResponse(responses[i]) as ListsType[typeof key];
      }
      setLists(next);
    } catch (err) {
      console.error("Error loading dropdowns", err);
      setLists(defaultLists);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = useMemo<OptionsMap>(() => {
    const out = {} as OptionsMap;
    for (const d of descriptors) {
      const arr = lists[d.key] as BaseItem[];
      const keys = d.labelKeys ?? ["name", "code", "id"];
      out[d.key] = arr.map((it) => ({ value: String(it.id ?? ""), label: labelFor(it, keys) }));
    }
    return out;
  }, [lists]);

  // explicit legacy mappings (keeps typing safe)
  const contextValue: DropdownDataContextType = {
    lists,
    options,
    companyList: lists.companyList,
    countryList: lists.countryList,
    regionList: lists.regionList,
    surveyList: lists.surveyList,
    routeList: lists.routeList,
    warehouseList: lists.warehouseList,
    routeType: lists.routeType,
    areaList: lists.areaList,
    companyCustomers: lists.companyCustomers,
    companyCustomersType: lists.companyCustomersType,
    itemCategory: lists.itemCategory,
    itemSubCategory: lists.itemSubCategory,
    channelList: lists.channelList,
    customerType: lists.customerType,
    userTypes: lists.userTypes,
    salesmanType: lists.salesmanType,
    vehicleList: lists.vehicleList,
    customerCategory: lists.customerCategory,
    customerSubCategory: lists.customerSubCategory,
    item: lists.item,
    discountType: lists.discountType,
    menuList: lists.menuList,
    vendor: lists.vendor,
    salesman: lists.salesman,
    agentCustomer: lists.agentCustomer,
    shelves: lists.shelves,
    submenu: lists.submenu,
    permissions: lists.permissions,
    companyOptions: options.companyList,
    countryOptions: options.countryList,
    onlyCountryOptions: lists.countryList.map((it) => ({ value: String(it.id ?? ""), label: labelFor(it, ["country_name", "country_code", "name"]) })),
    countryCurrency: lists.countryList.map((it) => ({ value: String((it as CountryItem).currency ?? ""), label: String((it as CountryItem).currency ?? "") })),
    regionOptions: options.regionList,
    surveyOptions: options.surveyList,
    routeOptions: options.routeList,
    warehouseOptions: options.warehouseList,
    routeTypeOptions: options.routeType,
    areaOptions: options.areaList,
    companyCustomersOptions: options.companyCustomers,
    companyCustomersTypeOptions: options.companyCustomersType,
    itemCategoryOptions: options.itemCategory,
    itemSubCategoryOptions: options.itemSubCategory,
    channelOptions: options.channelList,
    customerTypeOptions: options.customerType,
    userTypeOptions: options.userTypes,
    salesmanTypeOptions: options.salesmanType,
    vehicleListOptions: options.vehicleList,
    customerCategoryOptions: options.customerCategory,
    customerSubCategoryOptions: options.customerSubCategory,
    itemOptions: options.item,
    discountTypeOptions: options.discountType,
    menuOptions: options.menuList,
    vendorOptions: options.vendor,
    salesmanOptions: options.salesman,
    agentCustomerOptions: options.agentCustomer,
    shelvesOptions: options.shelves,
    submenuOptions: options.submenu,
    permissionsOptions: options.permissions,
    refreshDropdowns,
    loading,
  };

  return <AllDropdownListDataContext.Provider value={contextValue}>{children}</AllDropdownListDataContext.Provider>;
};