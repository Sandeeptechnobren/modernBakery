"use client";
import {
  agentCustomerList,
  channelList,
  companyList,
  companyTypeList,
  countryList,
  customerCategoryList,
  customerSubCategoryList,
  getAllActiveWarehouse,
  getCompanyCustomers,
  getCompanyCustomersType,
  getCustomerType,
  getDiscountTypeList,
  menuList as getMenuList,
  getSubRegion,
  getWarehouse,
  itemCategory,
  itemList,
  itemSubCategory,
  labelList,
  locationList,
  permissionList,
  projectList,
  regionList,
  roleList,
  routeList,
  routeType,
  salesmanList,
  salesmanTypeList,
  submenuList,
  subRegionList,
  SurveyList,
  uomList,
  vehicleListData,
  warehouseList,
  assetsTypeList,
  manufacturerList,
  assetsModelList,
  BrandList,
} from '@/app/services/allApi';
import { vendorList } from '@/app/services/assetsApi';
import { shelvesList } from '@/app/services/merchandiserApi';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface DropdownDataContextType {
  companyList: CompanyItem[];
  countryList: CountryItem[];
  regionList: RegionItem[];
  SurveyList: SurveyItem[];
  routeList: RouteItem[];
  warehouseList: WarehouseItem[];
  warehouseAllList: WarehouseAll[];
  routeType: RouteTypeItem[];
  areaList: AreaItem[];
  companyCustomers: CustomerItem[];
  companyCustomersType: CustomerTypeItem[];
  itemCategory: ItemCategoryItem[];
  itemSubCategory: ItemSubCategoryItem[];
  channelList: ChannelItem[];
  customerType: CustomerType[];
  salesmanType: SalesmanType[];
  vehicleList: VehicleListItem[];
  customerCategory: CustomerCategory[];
  customerSubCategory: CustomerSubCategory[];
  item: Item[];
  discountType: DiscountType[];
  menuList: MenuList[];
  labels: LabelItem[];
  roles: Role[];
  projectList: Project[];
  companyTypeList: CompanyType[];
  uomList: UOM[];
  locationList: LocationItem[];
  assetsTypeList: AssetsType[];
  manufacturerList: Manufacturer[];
  assetsModelList: AssetsModel[];
  BrandList: Brand[];
  // mapped dropdown options
  companyOptions: { value: string; label: string }[];
  countryOptions: { value: string; label: string }[];
  onlyCountryOptions: { value: string; label: string }[];
  countryCurrency: { value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  surveyOptions: { value: string; label: string }[];
  routeOptions: { value: string; label: string }[];
  warehouseOptions: { value: string; label: string }[];
  warehouseAllOptions: { value: string; label: string }[];
  routeTypeOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string, region_id: number; }[];
  companyCustomersOptions: { value: string; label: string }[];
  companyCustomersTypeOptions: { value: string; label: string }[];
  itemCategoryOptions: { value: string; label: string }[];
  itemSubCategoryOptions: { value: string; label: string }[];
  channelOptions: { value: string; label: string }[];
  customerTypeOptions: { value: string; label: string }[];
  salesmanTypeOptions: { value: string; label: string }[];
  vehicleListOptions: { value: string; label: string }[];
  customerCategoryOptions: { value: string; label: string }[];
  customerSubCategoryOptions: { value: string; label: string }[];
  itemOptions: { value: string; label: string; volume?: string | number; uoms?: { id?: string; name?: string; uom_type?: string; price?: string; upc?: string }[] }[];
  discountTypeOptions: { value: string; label: string }[];
  menuOptions: { value: string; label: string }[];
  vendorOptions: { value: string; label: string }[];
  salesmanOptions: { value: string; label: string }[];
  agentCustomerOptions: { value: string; label: string; contact_no?: string }[];
  shelvesOptions: { value: string; label: string }[];
  submenuOptions: { value: string; label: string }[];
  projectOptions: { value: string; label: string }[];
  companyTypeOptions: { value: string; label: string }[];
  uomOptions: { value: string; label: string }[];
  locationOptions: { value: string; label: string }[];
  assetsTypeOptions: { value: string; label: string }[];
  manufacturerOptions: { value: string; label: string }[];
  assetsModelOptions: { value: string; label: string }[];
  brandOptions: { value: string; label: string }[];
  permissions: permissionsList[];
  refreshDropdowns: () => Promise<void>;
  refreshDropdown: (name: string, params?: any) => Promise<void>;
  fetchItemSubCategoryOptions: (category_id: string | number) => Promise<void>;
  fetchAgentCustomerOptions: (warehouse_id: string | number) => Promise<void>;
  fetchSalesmanOptions: (warehouse_id: string | number) => Promise<void>;
  fetchSalesmanByRouteOptions: (warehouse_id: string | number) => Promise<void>;
  fetchAreaOptions: (region_id: string | number) => Promise<void>;
  fetchRouteOptions: (warehouse_id: string | number) => Promise<void>;
  fetchRoutebySalesmanOptions: (salesman_id: string | number) => Promise<void>;
  fetchWarehouseOptions: (area_id: string | number) => Promise<void>;
  fetchRegionOptions: (company_id: string | number) => Promise<void>;
  fetchCustomerCategoryOptions: (outlet_channel_id: string | number) => Promise<void>;
  fetchCompanyCustomersOptions: (category_id: string | number) => Promise<void>;
  fetchItemOptions: (category_id: string | number) => Promise<void>;
  getItemUoms: (item_id: string | number) => { id?: string; name?: string; uom_type?: string; price?: string; upc?: string }[];
  getPrimaryUom: (item_id: string | number) => { id?: string; name?: string; uom_type?: string; price?: string; upc?: string } | null;
  labelOptions: { value: string; label: string }[];
  roleOptions: { value: string; label: string }[];
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

interface CompanyType {
  id?: number | string;
  code?: string;
  name?: string;
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

interface Project {
  id?: number | string;
  osa_code?: string;
  name?: string;
}

interface UOM {
  id?: number | string;
  osa_code?: string;
  name?: string;
}


interface WarehouseItem {
  id?: number | string;
  warehouse_code?: string;
  warehouse_name?: string;
}
interface WarehouseAll {
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
  osa_code?: string;
  business_name?: string;
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

// interface UserTypeItem {
//   id?: number | string;
//   code?: string;
//   name?: string;
// }

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
  item_code?: string;
  name?: string;
  volume?: string;
  status?: string;
  uom?: UomItem[];
}

interface UomItem {
  id?: number | string;
  item_id?: number | string;
  uom_type?: string;
  name?: string;
  price?: string;
  is_stock_keeping?: boolean;
  upc?: string;
  enable_for?: string;
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

interface AssetsModel {
  id: number;
  name: string;
  code: string;
}

interface Brand {
  id: number;
  name: string;
  osa_code: string;
}

interface AgentCustomerList {
  id: number,
  uuid: string,
  osa_code: string,
  name: string,
  contact_no?: string,
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

interface LabelItem {
  id: number;
  uuid: string;
  osa_code: string;
  name: string;
  status: number;
}

interface Role {
  id: number;
  name: string;
  status: number;
}

interface LocationItem {
  id: number;
  name: string;
  code: string;
}

interface AssetsType {
  id: number;
  name: string;
  osa_code: string;
}

interface Manufacturer {
  id: number;
  name: string;
  osa_code: string;
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
  const [routeListBySalesman, setRouteListBySalesman] = useState<RouteItem[]>([]);
  const [warehouseListData, setWarehouseListData] = useState<WarehouseItem[]>([]);
  const [warehouseAllList, setWarehouseAllList] = useState<WarehouseAll[]>([]);
  const [routeTypeData, setRouteTypeData] = useState<RouteTypeItem[]>([]);
  const [areaListData, setAreaListData] = useState<AreaItem[]>([]);
  const [companyCustomersData, setCompanyCustomersData] = useState<CustomerItem[]>([]);
  const [companyCustomersTypeData, setCompanyCustomersTypeData] = useState<CustomerTypeItem[]>([]);
  const [itemCategoryData, setItemCategoryData] = useState<ItemCategoryItem[]>([]);
  const [itemSubCategoryData, setItemSubCategoryData] = useState<ItemSubCategoryItem[]>([]);
  const [channelListData, setChannelListData] = useState<ChannelItem[]>([]);
  const [customerTypeData, setCustomerTypeData] = useState<CustomerType[]>([]);
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
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [project, setProject] = useState<Project[]>([]);
  const [companyType, setComapanyType] = useState<CompanyType[]>([]);
  const [uom, setUom] = useState<UOM[]>([]);
  const [location, setLocation] = useState<LocationItem[]>([]);
  const [assetsType, setAssetsType] = useState<AssetsType[]>([]);
  const [manufacturer, setManufacturer] = useState<Manufacturer[]>([]);
  const [assetsModel, setAssetsModel] = useState<AssetsModel[]>([]);
  const [brandList, setBrandList] = useState<Brand[]>([]);
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
  const routeOptionsBySalesman = (Array.isArray(routeListBySalesman) ? routeListBySalesman : []).map((c: RouteItem) => ({
    value: String(c.id ?? ''),
    label: c.route_code && c.route_name ? `${c.route_code} - ${c.route_name}` : (c.route_name ?? '')
  }));

  const warehouseOptions = (Array.isArray(warehouseListData) ? warehouseListData : []).map((c: WarehouseItem) => ({
    value: String(c.id ?? ''),
    label: c.warehouse_code && c.warehouse_name ? `${c.warehouse_code} - ${c.warehouse_name}` : (c.warehouse_name ?? '')
  }));

  const warehouseAllOptions = (Array.isArray(warehouseAllList) ? warehouseAllList : []).map((c: WarehouseItem) => ({
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
    label: c.osa_code && c.business_name ? `${c.osa_code} - ${c.business_name}` : (c.business_name ?? '')
  }));

  const companyCustomersTypeOptions = (Array.isArray(companyCustomersTypeData) ? companyCustomersTypeData : []).map((c: CustomerTypeItem) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const companyTypeOptions = (Array.isArray(companyType) ? companyType : []).map((c: CompanyType) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }));

  const itemCategoryOptions = (Array.isArray(itemCategoryData) ? itemCategoryData : []).map((c: ItemCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.category_code && c.category_name ? `${c.category_name}` : (c.category_name ?? '')
  }));

  const itemSubCategoryOptions = (Array.isArray(itemSubCategoryData) ? itemSubCategoryData : []).map((c: ItemSubCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.sub_category_code && c.sub_category_name ? `${c.sub_category_name}` : (c.sub_category_name ?? '')
  }));

  const channelOptions = (Array.isArray(channelListData) ? channelListData : []).map((c: ChannelItem) => ({
    value: String(c.id ?? ''),
    label: c.outlet_channel_code && c.outlet_channel ? `${c.outlet_channel}` : (c.outlet_channel ?? '')
  }));
  const customerTypeOptions = (Array.isArray(customerTypeData) ? customerTypeData : []).map((c: CustomerType) => ({
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

  const projectOptions = (Array.isArray(project) ? project : []).map((c: Project) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }))

  const assetsTypeOptions = (Array.isArray(assetsType) ? assetsType : []).map((c: AssetsType) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }));

  const manufacturerOptions = (Array.isArray(manufacturer) ? manufacturer : []).map((c: Manufacturer) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }))

  const assetsModelOptions = (Array.isArray(assetsModel) ? assetsModel : []).map((c: AssetsModel) => ({
    value: String(c.id ?? ''),
    label: c.code && c.name ? `${c.code} - ${c.name}` : (c.name ?? '')
  }))

  const brandOptions = (Array.isArray(brandList) ? brandList : []).map((c: Brand) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }))

  const uomOptions = (Array.isArray(uom) ? uom : []).map((c: UOM) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.name}` : (c.name ?? '')
  }))

  const itemOptions = (Array.isArray(item) ? item : []).map((c: Item) => ({
    value: String(c.id ?? ""),
    label:
      (c.item_code || (c as any).code) && c.name
        ? `${c.item_code || (c as any).code} - ${c.name}`
        : c.name ?? "",
    uom: Array.isArray((c as any).uom)
      ? (c as any).uom.map((u: any) => ({
        id: Number(u.id ?? 0),
        name: String(u.name ?? ""),
        uom_type: String(u.uom_type ?? ""),
        price: Number(u.price ?? 0),
        upc: String(u.upc ?? ""),
      }))
      : [],
  }));


  const getItemUoms = (item_id: string | number) => {
    const idStr = String(item_id ?? '');
    const found = item.find(it => String(it.id ?? '') === idStr);
    if (!found) return [];
    return (Array.isArray(found.uom) ? found.uom : []).map(u => ({
      id: String(u.id ?? ''),
      name: String(u.name ?? ''),
      uom_type: String(u.uom_type ?? ''),
      price: String(u.price ?? ''),
      upc: String(u.upc ?? ''),
    }));
  };

  const getPrimaryUom = (item_id: string | number) => {
    const uoms = getItemUoms(item_id);
    if (!uoms || uoms.length === 0) return null;
    // prefer uom_type === 'primary', otherwise return first
    const primary = uoms.find(u => (u.uom_type || '').toLowerCase() === 'primary');
    return primary ?? uoms[0];
  };

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
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? ''),
    contact_no: c.contact_no ?? ''
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

  const labelOptions = (Array.isArray(labels) ? labels : []).map((c: LabelItem) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? '')
  }));
  const roleOptions = (Array.isArray(roles) ? roles : []).map((r: Role) => ({
    value: String(r.id ?? ''),
    label: r.name ?? ''
  }));
  const locationOptions = (Array.isArray(location) ? location : []).map((l: LocationItem) => ({
    value: String(l.id ?? ''),
    label: l.name ?? ''
  }));


  // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.

  const fetchAreaOptions = useCallback(async (region_id: string | number) => {

    setLoading(false);
    try {
      // call subRegionList with an object matching the expected Params shape
      const res = await subRegionList({ region_id: String(region_id), dropdown: "true" });
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
  }, []);

  const fetchCustomerCategoryOptions = useCallback(async (outlet_channel_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call customerCategoryList with channel_id
      const res = await customerCategoryList({ outlet_channel_id: String(outlet_channel_id) });
      const normalize = (r: unknown): CustomerCategory[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as CustomerCategory[];
        }
        if (Array.isArray(r)) return r as CustomerCategory[];
        return [];
      };
      setCustomerCategory(normalize(res));
    } catch (error) {
      setCustomerCategory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyCustomersOptions = useCallback(async (category_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call getCompanyCustomers with category_id
      const res = await getCompanyCustomers({ category_id: String(category_id) });
      const normalize = (r: unknown): CustomerItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as CustomerItem[];
        }
        if (Array.isArray(r)) return r as CustomerItem[];
        return [];
      };
      setCompanyCustomersData(normalize(res));
    } catch (error) {
      setCompanyCustomersData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItemOptions = useCallback(async (category_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call itemList with category_id to fetch items for this category
      const res = await itemList({ category_id: String(category_id) });
      const normalize = (r: unknown): Item[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as Item[];
        }
        if (Array.isArray(r)) return r as Item[];
        return [];
      };
      setItem(normalize(res));
    } catch (error) {
      setItem([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRouteOptions = useCallback(async (warehouse_id: string | number) => {
    setLoading(false);
    try {
      // call routeList with warehouse_id
      const res = await routeList({ warehouse_id: String(warehouse_id), dropdown: "true" });
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
  }, []);
  const fetchRoutebySalesmanOptions = useCallback(async (salesman_id: string | number) => {
    setLoading(false);
    try {
      // call routeList with warehouse_id
      const res = await routeList({ salesman_id: String(salesman_id) });
      const normalize = (r: unknown): RouteItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as RouteItem[];
        }
        if (Array.isArray(r)) return r as RouteItem[];
        return [];
      };
      setRouteListBySalesman(normalize(res));
    } catch (error) {
      setRouteListBySalesman([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarehouseOptions = useCallback(async (area_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call getWarehouse with an object matching the expected Params shape
      const res = await getWarehouse({ area_id: String(area_id), dropdown: "true" });
      const normalize = (r: unknown): WarehouseItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as WarehouseItem[];
        }
        if (Array.isArray(r)) return r as WarehouseItem[];
        return [];
      };
      setWarehouseListData(normalize(res));
    } catch (error) {
      setWarehouseListData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegionOptions = useCallback(async (company_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call regionList with company_id
      const res = await regionList({ company_id: String(company_id), dropdown: "true" });
      const normalize = (r: unknown): RegionItem[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as RegionItem[];
        }
        if (Array.isArray(r)) return r as RegionItem[];
        return [];
      };
      setRegionListData(normalize(res));
    } catch (error) {
      setRegionListData([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const fetchAgentCustomerOptions = useCallback(async (warehouse_id: string | number) => {
    setLoading(false);
    try {
      // call agentCustomerList with warehouse_id
      const res = await agentCustomerList({ warehouse_id: String(warehouse_id) });
      const normalize = (r: unknown): AgentCustomerList[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as AgentCustomerList[];
        }
        if (Array.isArray(r)) return r as AgentCustomerList[];
        return [];
      };
      setAgentCustomer(normalize(res));
    } catch (error) {
      setAgentCustomer([]);
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchSalesmanOptions = useCallback(async (warehouse_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call salesmanList with warehouse_id
      const res = await salesmanList({ warehouse_id: String(warehouse_id) });
      const normalize = (r: unknown): SalesmanList[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as SalesmanList[];
        }
        if (Array.isArray(r)) return r as SalesmanList[];
        return [];
      };
      setSalesman(normalize(res));
    } catch (error) {
      setSalesman([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSalesmanByRouteOptions = useCallback(async (route_id: string | number) => {
    // Keep loading false here to avoid flipping global loading unexpectedly; caller may manage UI.
    setLoading(false);
    try {
      // call salesmanList with warehouse_id
      const res = await salesmanList({ route_id: String(route_id) });
      const normalize = (r: unknown): SalesmanList[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as SalesmanList[];
        }
        if (Array.isArray(r)) return r as SalesmanList[];
        return [];
      };
      setSalesman(normalize(res));
    } catch (error) {
      setSalesman([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDropdowns = async () => {
    // Progressive fetch: load a small set of critical dropdowns immediately
    // then warm-fetch the remaining lists when the browser is idle.
    setLoading(true);
    const normalize = (r: unknown): unknown[] => {
      if (r && typeof r === 'object') {
        const obj = r as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as unknown[];
      }
      if (Array.isArray(r)) return r as unknown[];
      return (r as unknown) ? [r as unknown] : [];
    };

    // critical short list to fetch immediately (make UI usable fast)
    const criticalTasks: { run: () => Promise<unknown>; setter: (v: unknown[]) => void }[] = [
      { run: () => companyList(), setter: (v) => setCompanyListData(v as CompanyItem[]) },
      { run: () => countryList(), setter: (v) => setCountryListData(v as CountryItem[]) },
      { run: () => regionList(), setter: (v) => setRegionListData(v as RegionItem[]) },
      { run: () => routeList({}), setter: (v) => setRouteListData(v as RouteItem[]) },
      { run: () => getAllActiveWarehouse(), setter: (v) => setWarehouseListData(v as WarehouseItem[]) },
      { run: () => routeType({ dropdown: 'true' }), setter: (v) => setRouteTypeData(v as RouteTypeItem[]) },
      { run: () => itemCategory({ dropdown: 'true' }), setter: (v) => setItemCategoryData(v as ItemCategoryItem[]) },
    ];

    const nonCriticalTasks: { run: () => Promise<unknown>; setter: (v: unknown[]) => void }[] = [
      { run: () => SurveyList(), setter: (v) => setSurveyListData(v as SurveyItem[]) },
      { run: () => warehouseList({ dropdown: 'true' }), setter: (v) => setWarehouseAllList(v as WarehouseAll[]) },
      { run: () => getSubRegion(), setter: (v) => setAreaListData(v as AreaItem[]) },
      { run: () => getCompanyCustomers({ dropdown: 'true' }), setter: (v) => setCompanyCustomersData(v as CustomerItem[]) },
      { run: () => getCompanyCustomersType(), setter: (v) => setCompanyCustomersTypeData(v as CustomerTypeItem[]) },
      { run: () => itemSubCategory({ dropdown: 'true' }), setter: (v) => setItemSubCategoryData(v as ItemSubCategoryItem[]) },
      { run: () => channelList(), setter: (v) => setChannelListData(v as ChannelItem[]) },
      { run: () => getCustomerType(), setter: (v) => setCustomerTypeData(v as CustomerType[]) },
      { run: () => salesmanTypeList({}), setter: (v) => setSalesmanTypesData(v as SalesmanType[]) },
      { run: () => vehicleListData(), setter: (v) => setVehicleList(v as VehicleListItem[]) },
      { run: () => customerCategoryList(), setter: (v) => setCustomerCategory(v as CustomerCategory[]) },
      { run: () => customerSubCategoryList(), setter: (v) => setCustomerSubCategory(v as CustomerSubCategory[]) },
      { run: () => itemList(), setter: (v) => setItem(v as Item[]) },
      { run: () => getDiscountTypeList(), setter: (v) => setDiscountType(v as DiscountType[]) },
      { run: () => getMenuList(), setter: (v) => setMenuList(v as MenuList[]) },
      { run: () => vendorList(), setter: (v) => setVendor(v as VendorList[]) },
      { run: () => salesmanList(), setter: (v) => setSalesman(v as SalesmanList[]) },
      { run: () => agentCustomerList(), setter: (v) => setAgentCustomer(v as AgentCustomerList[]) },
      { run: () => shelvesList(), setter: (v) => setShelves(v as ShelvesList[]) },
      { run: () => submenuList(), setter: (v) => setSubmenu(v as submenuList[]) },
      { run: () => permissionList(), setter: (v) => setPermissions(v as permissionsList[]) },
      { run: () => labelList(), setter: (v) => setLabels(v as LabelItem[]) },
      { run: () => roleList(), setter: (v) => setRoles(v as Role[]) },
      { run: () => projectList({}), setter: (v) => setProject(v as Project[]) },
      { run: () => companyTypeList(), setter: (v) => setComapanyType(v as CompanyType[]) },
      { run: () => uomList(), setter: (v) => setUom(v as UOM[]) },
      { run: () => locationList(), setter: (v) => setLocation(v as LocationItem[]) },
      { run: () => assetsTypeList(), setter: (v) => setAssetsType(v as AssetsType[]) },
      { run: () => manufacturerList(), setter: (v) => setManufacturer(v as Manufacturer[]) },
    ];

    try {
      // run critical tasks now and wait for them so UI has required data quickly
      const criticalPromises = criticalTasks.map(t => t.run());
      const criticalSettled = await Promise.allSettled(criticalPromises);
      criticalSettled.forEach((s, idx) => {
        if (s.status === 'fulfilled') {
          try {
            const arr = normalize(s.value);
            criticalTasks[idx].setter(arr);
          } catch (e) {
            console.warn('Failed to normalize critical dropdown', idx, e);
          }
        } else {
          console.warn('Critical dropdown fetch failed', idx, s.reason);
        }
      });

      // schedule warm background fetch of non-critical lists when the browser is idle
      const backgroundFetch = async () => {
        try {
          const nonCriticalPromises = nonCriticalTasks.map(t => t.run());
          const settled = await Promise.allSettled(nonCriticalPromises);
          settled.forEach((s, idx) => {
            if (s.status === 'fulfilled') {
              try {
                const arr = normalize(s.value);
                nonCriticalTasks[idx].setter(arr);
              } catch (e) {
                console.warn('Failed to normalize non-critical dropdown', idx, e);
              }
            } else {
              console.warn('Non-critical dropdown fetch failed', idx, s.reason);
            }
          });
        } catch (e) {
          console.error('Background fetch error', e);
        }
      };

      if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(() => backgroundFetch(), { timeout: 2000 });
      } else {
        // fallback: run after small timeout
        setTimeout(() => { backgroundFetch(); }, 1500);
      }

    } catch (err) {
      console.error('refreshDropdowns error', err);
    } finally {
      // stop showing global loading after the critical fetch; background fetches run without blocking UI
      setLoading(false);
    }
  };

  // normalize helper: accept unknown response and extract array of items from `.data` when present
  const normalizeResponse = (r: unknown): unknown[] => {
    if (r && typeof r === 'object') {
      const obj = r as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as unknown[];
    }
    if (Array.isArray(r)) return r as unknown[];
    return (r as unknown) ? [r as unknown] : [];
  };

  // refresh a particular dropdown/list by name. `params` can be provided for APIs that need it.
  const refreshDropdown = async (name: string, params?: any) => {
    setLoading(true);
    try {
      switch ((name || '').toLowerCase()) {
        case 'company': {
          const res = await companyList(params ?? {});
          setCompanyListData(normalizeResponse(res) as CompanyItem[]);
          break;
        }
        case 'country': {
          const res = await countryList(params ?? {});
          setCountryListData(normalizeResponse(res) as CountryItem[]);
          break;
        }
        case 'region': {
          const res = await regionList(params ?? {});
          setRegionListData(normalizeResponse(res) as RegionItem[]);
          break;
        }
        case 'survey': {
          const res = await SurveyList(params ?? {});
          setSurveyListData(normalizeResponse(res) as SurveyItem[]);
          break;
        }
        case 'route': {
          const res = await routeList(params ?? {});
          setRouteListData(normalizeResponse(res) as RouteItem[]);
          break;
        }
        case 'warehouse': {
          const res = await getWarehouse({ ...params, dropdown: "true" });
          setWarehouseListData(normalizeResponse(res) as WarehouseItem[]);
          break;
        }
        case 'routetype':
        case 'route_type': {
          const res = await routeType(params ?? {});
          setRouteTypeData(normalizeResponse(res) as RouteTypeItem[]);
          break;
        }
        case 'area': {
          // expects region_id in params or will fetch all
          const res = await subRegionList(params ?? {});
          setAreaListData(normalizeResponse(res) as AreaItem[]);
          break;
        }
        case 'companycustomers': {
          const res = await getCompanyCustomers(params ?? {});
          setCompanyCustomersData(normalizeResponse(res) as CustomerItem[]);
          break;
        }
        case 'companycustomerstype': {
          const res = await getCompanyCustomersType(params ?? {});
          setCompanyCustomersTypeData(normalizeResponse(res) as CustomerTypeItem[]);
          break;
        }
        case 'itemcategory': {
          const res = await itemCategory(params ?? {});
          setItemCategoryData(normalizeResponse(res) as ItemCategoryItem[]);
          break;
        }
        case 'itemsubcategory': {
          const res = await itemSubCategory(params ?? {});
          setItemSubCategoryData(normalizeResponse(res) as ItemSubCategoryItem[]);
          break;
        }
        case 'channel': {
          const res = await channelList(params ?? {});
          setChannelListData(normalizeResponse(res) as ChannelItem[]);
          break;
        }
        case 'customertype': {
          const res = await getCustomerType(params ?? {});
          setCustomerTypeData(normalizeResponse(res) as CustomerType[]);
          break;
        }
        case 'salesmantype': {
          const res = await salesmanTypeList(params ?? {});
          setSalesmanTypesData(normalizeResponse(res) as SalesmanType[]);
          break;
        }
        case 'vehiclelist': {
          const res = await vehicleListData(params ?? {});
          setVehicleList(normalizeResponse(res) as VehicleListItem[]);
          break;
        }
        case 'customercategory': {
          const res = await customerCategoryList(params ?? {});
          setCustomerCategory(normalizeResponse(res) as CustomerCategory[]);
          break;
        }
        case 'customersubcategory': {
          const res = await customerSubCategoryList(params ?? {});
          setCustomerSubCategory(normalizeResponse(res) as CustomerSubCategory[]);
          break;
        }
        case 'item': {
          const res = await itemList(params ?? {});
          setItem(normalizeResponse(res) as Item[]);
          break;
        }
        case 'discounttype': {
          const res = await getDiscountTypeList(params ?? {});
          setDiscountType(normalizeResponse(res) as DiscountType[]);
          break;
        }
        case 'menulist': {
          const res = await getMenuList(params ?? {});
          setMenuList(normalizeResponse(res) as MenuList[]);
          break;
        }
        case 'vendor': {
          const res = await vendorList(params ?? {});
          setVendor(normalizeResponse(res) as VendorList[]);
          break;
        }
        case 'salesman': {
          const res = await salesmanList(params ?? {});
          setSalesman(normalizeResponse(res) as SalesmanList[]);
          break;
        }
        case 'agentcustomer': {
          const res = await agentCustomerList(params ?? {});
          setAgentCustomer(normalizeResponse(res) as AgentCustomerList[]);
          break;
        }
        case 'shelves': {
          const res = await shelvesList(params ?? {});
          setShelves(normalizeResponse(res) as ShelvesList[]);
          break;
        }
        case 'submenu': {
          const res = await submenuList(params ?? {});
          setSubmenu(normalizeResponse(res) as submenuList[]);
          break;
        }
        case 'permissions': {
          const res = await permissionList(params ?? {});
          setPermissions(normalizeResponse(res) as permissionsList[]);
          break;
        }
        case 'labels': {
          const res = await labelList(params ?? {});
          setLabels(normalizeResponse(res) as LabelItem[]);
          break;
        }
        case 'roles': {
          const res = await roleList(params ?? {});
          setRoles(normalizeResponse(res) as Role[]);
          break;
        }
        case 'project': {
          const res = await projectList(params ?? {});
          setProject(normalizeResponse(res) as Project[]);
          break;
        }
        case 'companytype': {
          const res = await companyTypeList(params ?? {});
          setComapanyType(normalizeResponse(res) as CompanyType[]);
          break;
        }
        case 'uom': {
          const res = await uomList(params ?? {});
          setUom(normalizeResponse(res) as UOM[]);
          break;
        }
        case 'location': {
          const res = await locationList(params ?? {});
          setLocation(normalizeResponse(res) as LocationItem[]);
          break;
        }
        default: {
          console.warn('refreshDropdown: unknown dropdown name', name);
          break;
        }
      }
    } catch (err) {
      console.error('refreshDropdown error for', name, err);
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
        warehouseAllList: warehouseAllList,
        routeType: routeTypeData,
        areaList: areaListData,
        companyCustomers: companyCustomersData,
        companyCustomersType: companyCustomersTypeData,
        itemCategory: itemCategoryData,
        itemSubCategory: itemSubCategoryData,
        channelList: Array.isArray(channelListData) ? channelListData : [],
        customerType: customerTypeData,
        salesmanType: salesmanTypesData,
        vehicleList: VehicleList,
        customerCategory: customerCategory,
        customerSubCategory: customerSubCategory,
        item: item,
        discountType: discountType,
        menuList: menuList,
        labels: labels,
        roles: roles,
        projectList: project,
        companyTypeList: companyType,
        uomList: uom,
        locationList: location,
        assetsTypeList: assetsType,
        manufacturerList: manufacturer,
        assetsModelList: assetsModel,
        BrandList: brandList,
        fetchItemSubCategoryOptions,
        fetchAgentCustomerOptions,
        fetchSalesmanOptions,
        fetchSalesmanByRouteOptions,
        fetchRegionOptions,
        companyOptions,
        countryOptions,
        onlyCountryOptions,
        countryCurrency,
        regionOptions,
        surveyOptions,
        routeOptions,
        warehouseOptions,
        warehouseAllOptions,
        routeTypeOptions,
        areaOptions,
        companyCustomersOptions,
        companyCustomersTypeOptions,
        itemCategoryOptions,
        itemSubCategoryOptions,
        channelOptions,
        customerTypeOptions,
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
        labelOptions,
        refreshDropdowns,
        refreshDropdown,
        fetchAreaOptions,
        fetchRouteOptions,
        fetchRoutebySalesmanOptions,
        fetchCustomerCategoryOptions,
        fetchCompanyCustomersOptions,
        fetchItemOptions,
        fetchWarehouseOptions,
        roleOptions,
        projectOptions,
        companyTypeOptions,
        getItemUoms,
        getPrimaryUom,
        uomOptions,
        locationOptions,
        assetsTypeOptions,
        manufacturerOptions,
        assetsModelOptions,
        brandOptions,
        loading
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};