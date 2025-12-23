
 
"use client";
import {
  agentCustomerList,
  assetsModelList,
  assetsTypeList,
  brandingList,
  BrandList,
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
  manufacturerList,
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
  getUserList,
} from '@/app/services/allApi';
import { vendorList } from '@/app/services/assetsApi';
import { shelvesList } from '@/app/services/merchandiserApi';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

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
  brandingList: Branding[];
  userList: UserItem[];
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
  itemCategoryAllOptions: { value: string; label: string }[];
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
  // added to match provider values for "all" lists
  allCompanyOptions: { value: string; label: string }[];
  allAgentCustomerOptions: { value: string; label: string; contact_no?: string }[];
  shelvesOptions: { value: string; label: string }[];
  submenuOptions: { value: string; label: string }[];
  projectOptions: { value: string; label: string }[];
  allCompanyCustomerOptions: { value: string; label: string }[];
  companyTypeOptions: { value: string; label: string }[];
  uomOptions: { value: string; label: string }[];
  locationOptions: { value: string; label: string }[];
  assetsTypeOptions: { value: string; label: string }[];
  manufacturerOptions: { value: string; label: string }[];
  assetsModelOptions: { value: string; label: string }[];
  brandOptions: { value: string; label: string }[];
  allCustomerTypeOptions: { value: string; label: string }[];
  allCompanyTypeOptions: { value: string; label: string }[];
  brandingOptions: { value: string; label: string }[];
  userOptions: { value: string; label: string }[];
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
  fetchItemsCategoryWise: (category_id?: string | number) => Promise<{ value: string; label: string; status?: string | number; uom?: { id?: string; name?: string; uom_type?: string; price?: string; upc?: string }[]; }[]>;
  getItemUoms: (item_id: string | number) => { id?: string; name?: string; uom_type?: string; price?: string; upc?: string }[];
  getPrimaryUom: (item_id: string | number) => { id?: string; name?: string; uom_type?: string; price?: string; upc?: string } | null;
  labelOptions: { value: string; label: string }[];
  roleOptions: { value: string; label: string }[];
  loading: boolean;
  // Lazy load functions - call these to ensure data is loaded
  ensureCompanyLoaded: () => void;
  ensureCountryLoaded: () => void;
  ensureRegionLoaded: () => void;
  ensureSurveyLoaded: () => void;
  ensureRouteLoaded: () => void;
  ensureWarehouseLoaded: () => void;
  ensureWarehouseAllLoaded: () => void;
  ensureRouteTypeLoaded: () => void;
  ensureAreaLoaded: () => void;
  ensureCompanyCustomersLoaded: () => void;
  ensureCompanyCustomersTypeLoaded: () => void;
  ensureItemCategoryLoaded: () => void;
  ensureAllItemCategoryLoaded: () => void;
  ensureItemSubCategoryLoaded: () => void;
  ensureChannelLoaded: () => void;
  ensureCustomerTypeLoaded: () => void;
  ensureSalesmanTypeLoaded: () => void;
  ensureVehicleListLoaded: () => void;
  ensureCustomerCategoryLoaded: () => void;
  ensureCustomerSubCategoryLoaded: () => void;
  ensureAllAgentCustomersLoaded: () => void;
  ensureAllCompanyOptionsLoaded: () => void;
  ensureItemLoaded: () => void;
  ensureDiscountTypeLoaded: () => void;
  ensureMenuListLoaded: () => void;
  ensureVendorLoaded: () => void;
  ensureSalesmanLoaded: () => void;
  ensureAgentCustomerLoaded: () => void;
  ensureShelvesLoaded: () => void;
  ensureSubmenuLoaded: () => void;
  ensurePermissionsLoaded: () => void;
  ensureLabelsLoaded: () => void;
  ensureRolesLoaded: () => void;
  ensureProjectLoaded: () => void;
  ensureCompanyTypeLoaded: () => void;
  ensureUomLoaded: () => void;
  ensureLocationLoaded: () => void;
  ensureAssetsTypeLoaded: () => void;
  ensureManufacturerLoaded: () => void;
  ensureAssetsModelLoaded: () => void;
  ensureBrandLoaded: () => void;
  ensureBrandingLoaded: () => void;
  ensureUserLoaded: () => void;
  ensureAllCompanyCustomersLoaded: () => void;
  ensureAllCustomerTypesLoaded: () => void;
  ensureAllCompanyTypesLoaded: () => void;
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

interface Branding {
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

interface UserItem {
  id: number;
  name: string;
  uuid: string;
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
  // Track which dropdowns have been fetched using useRef to avoid re-renders
  const fetchedRef = useRef<Set<string>>(new Set());
  const fetchingRef = useRef<Set<string>>(new Set());
  // State for all company types
  const [allCompanyTypes, setAllCompanyTypes] = useState<CompanyType[]>([]);

  // Ensure method for all company types
  const ensureAllCompanyTypesLoaded = useCallback(() => {
    companyTypeList().then(res => {
      setAllCompanyTypes(Array.isArray(res?.data) ? res.data : []);
      fetchedRef.current.add('allCompanyTypes');
      fetchingRef.current.delete('allCompanyTypes');
    }).catch(() => {
      setAllCompanyTypes([]);
      fetchingRef.current.delete('allCompanyTypes');
    });
  }, [setAllCompanyTypes, fetchedRef, fetchingRef]);
  // Options for all company types
  const allCompanyTypeOptions = (Array.isArray(allCompanyTypes) ? allCompanyTypes : []).map((c: CompanyType) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }));
  // State for all customer types
   
  const [allCustomerTypes, setAllCustomerTypes] = useState<CustomerType[]>([]);

  // Ensure method for all customer types
  const ensureAllCustomerTypesLoaded = useCallback(() => {
    getCustomerType().then(res => {
      setAllCustomerTypes(Array.isArray(res?.data) ? res.data : []);
      fetchedRef.current.add('allCustomerTypes');
      fetchingRef.current.delete('allCustomerTypes');
    }).catch(() => {
      setAllCustomerTypes([]);
      fetchingRef.current.delete('allCustomerTypes');
    });
  }, [setAllCustomerTypes, fetchedRef, fetchingRef]);
  // Options for all customer types
  const allCustomerTypeOptions = (Array.isArray(allCustomerTypes) ? allCustomerTypes : []).map((c: CustomerType) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }));
  // Track which dropdowns have been fetched using useRef to avoid re-renders
 

  // State for all company customers
  const [allCompanyCustomers, setAllCompanyCustomers] = useState<CustomerItem[]>([]);

  // Ensure method for all company customers
  const ensureAllCompanyCustomersLoaded = useCallback(() => {
    getCompanyCustomers().then(res => {
      setAllCompanyCustomers(Array.isArray(res?.data) ? res.data : []);
      fetchedRef.current.add('allCompanyCustomers');
      fetchingRef.current.delete('allCompanyCustomers');
    }).catch(() => {
      setAllCompanyCustomers([]);
      fetchingRef.current.delete('allCompanyCustomers');
    });
  }, [setAllCompanyCustomers, fetchedRef, fetchingRef]);
  // Track which dropdowns have been fetched using useRef to avoid re-renders

  // State for all company customers

  // Ensure method for all company customers
  // State for all company customers
  // const [allCompanyCustomers, setAllCompanyCustomers] = useState<CustomerItem[]>([]);

  // // Ensure method for all company customers
  // const ensureAllCompanyCustomersLoaded = useCallback(() => {
  //   getCompanyCustomers({ dropdown: 'true' }).then(res => {
  //     setAllCompanyCustomers(Array.isArray(res?.data) ? res.data : []);
  //     fetchedRef.current.add('allCompanyCustomers');
  //     fetchingRef.current.delete('allCompanyCustomers');
  //   }).catch(() => {
  //     setAllCompanyCustomers([]);
  //     fetchingRef.current.delete('allCompanyCustomers');
  //   });
  // }, [setAllCompanyCustomers, fetchedRef, fetchingRef]);
  // Options for all company customers
  
  // State for all agent customers and all companies
  
  const [allAgentCustomers, setAllAgentCustomers] = useState<AgentCustomerList[]>([]);
  const [allCompanies, setAllCompanies] = useState<CompanyItem[]>([]);

  // Track which dropdowns have been fetched using useRef to avoid re-renders
  // const fetchedRef = useRef<Set<string>>(new Set());
  // const fetchingRef = useRef<Set<string>>(new Set());

  // Track which dropdowns have been fetched using useRef to avoid re-renders

  // Ensure methods for all agent customers and all companies (must be after refs)

  // Track which dropdowns have been fetched using useRef to avoid re-renders

  // Ensure methods for all agent customers and all companies (must be after refs)

  // Ensure methods for all agent customers and all companies
  const ensureAllAgentCustomersLoaded = useCallback(() => {
    // if (fetchedRef.current.has('allAgentCustomers') || fetchingRef.current.has('allAgentCustomers')) return;
    // fetchingRef.current.add('allAgentCustomers');
    agentCustomerList().then(res => {
      setAllAgentCustomers(Array.isArray(res?.data) ? res.data : []);
      fetchedRef.current.add('allAgentCustomers');
      fetchingRef.current.delete('allAgentCustomers');
    }).catch(() => {
      setAllAgentCustomers([]);
      fetchingRef.current.delete('allAgentCustomers');
    });
  }, [setAllAgentCustomers, fetchedRef,fetchingRef]);

  const ensureAllCompanyOptionsLoaded = useCallback(() => {
    // if (fetchedRef.current.has('allCompanies') || fetchingRef.current.has('allCompanies')) return;
    // fetchingRef.current.add('allCompanies');
    companyList().then(res => {
      setAllCompanies(Array.isArray(res?.data) ? res.data : []);
      fetchedRef.current.add('allCompanies');
      fetchingRef.current.delete('allCompanies');
    }).catch(() => {
      setAllCompanies([]);
      fetchingRef.current.delete('allCompanies');
    });
  }, [setAllCompanies, fetchedRef,fetchingRef]);
  // Options for all agent customers and all companies
  
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
  const [itemCategoryAllData, setItemCategoryAllData] = useState<ItemCategoryItem[]>([]);
  // Fetch all item categories for all options (dropdown:true)
  useEffect(() => {
    itemCategory().then(res => {
      setItemCategoryAllData(Array.isArray(res?.data) ? res.data : []);
    }).catch(() => {
      setItemCategoryAllData([]);
    });
  }, []);
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
  const [brandingListState, setBrandingList] = useState<Branding[]>([]);
  const [userListState, setUserList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Track which dropdowns have been fetched using useRef to avoid re-renders
  

  // Helper to normalize API responses
  const normalizeResponse = useCallback((r: unknown): unknown[] => {
    if (r && typeof r === 'object') {
      const obj = r as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as unknown[];
    }
    if (Array.isArray(r)) return r as unknown[];
    return (r as unknown) ? [r as unknown] : [];
  }, []);

  // Lazy load functions - only fetch if not already fetched or fetching
  const ensureCompanyLoaded = useCallback(() => {
    // if (fetchedRef.current.has('company') || fetchingRef.current.has('company')) return;
    // fetchingRef.current.add('company');
    companyList({dropdown:"true"}).then(res => {
      setCompanyListData(normalizeResponse(res) as CompanyItem[]);
      fetchedRef.current.add('company');
      fetchingRef.current.delete('company');
    }).catch(() => {
      setCompanyListData([]);
      fetchingRef.current.delete('company');
    });
  }, [normalizeResponse]);

  const ensureCountryLoaded = useCallback(() => {
    // if (fetchedRef.current.has('country') || fetchingRef.current.has('country')) return;
    // fetchingRef.current.add('country');
    countryList().then(res => {
      setCountryListData(normalizeResponse(res) as CountryItem[]);
      fetchedRef.current.add('country');
      fetchingRef.current.delete('country');
    }).catch(() => {
      setCountryListData([]);
      fetchingRef.current.delete('country');
    });
  }, [normalizeResponse]);

  const ensureRegionLoaded = useCallback(() => {
    // if (fetchedRef.current.has('region') || fetchingRef.current.has('region')) return;
    // fetchingRef.current.add('region');
    regionList().then(res => {
      setRegionListData(normalizeResponse(res) as RegionItem[]);
      fetchedRef.current.add('region');
      fetchingRef.current.delete('region');
    }).catch(() => {
      setRegionListData([]);
      fetchingRef.current.delete('region');
    });
  }, [normalizeResponse]);

  const ensureSurveyLoaded = useCallback(() => {
    // if (fetchedRef.current.has('survey') || fetchingRef.current.has('survey')) return;
    // fetchingRef.current.add('survey');
    SurveyList().then(res => {
      setSurveyListData(normalizeResponse(res) as SurveyItem[]);
      fetchedRef.current.add('survey');
      fetchingRef.current.delete('survey');
    }).catch(() => {
      setSurveyListData([]);
      fetchingRef.current.delete('survey');
    });
  }, [normalizeResponse]);

  const ensureRouteLoaded = useCallback(() => {
    // if (fetchedRef.current.has('route') || fetchingRef.current.has('route')) return;
    // fetchingRef.current.add('route');
    routeList({}).then(res => {
      setRouteListData(normalizeResponse(res) as RouteItem[]);
      fetchedRef.current.add('route');
      fetchingRef.current.delete('route');
    }).catch(() => {
      setRouteListData([]);
      fetchingRef.current.delete('route');
    });
  }, [normalizeResponse]);

  const ensureWarehouseLoaded = useCallback(() => {
    // if (fetchedRef.current.has('warehouse') || fetchingRef.current.has('warehouse')) return;
    // fetchingRef.current.add('warehouse');
    getAllActiveWarehouse().then(res => {
      setWarehouseListData(normalizeResponse(res) as WarehouseItem[]);
      fetchedRef.current.add('warehouse');
      fetchingRef.current.delete('warehouse');
    }).catch(() => {
      setWarehouseListData([]);
      fetchingRef.current.delete('warehouse');
    });
  }, [normalizeResponse]);

  const ensureWarehouseAllLoaded = useCallback(() => {
    // if (fetchedRef.current.has('warehouseAll') || fetchingRef.current.has('warehouseAll')) return;
    // fetchingRef.current.add('warehouseAll');
    warehouseList().then(res => {
      setWarehouseAllList(normalizeResponse(res) as WarehouseAll[]);
      fetchedRef.current.add('warehouseAll');
      fetchingRef.current.delete('warehouseAll');
    }).catch(() => {
      setWarehouseAllList([]);
      fetchingRef.current.delete('warehouseAll');
    });
  }, [normalizeResponse]);

  const ensureRouteTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('routeType') || fetchingRef.current.has('routeType')) return;
    // fetchingRef.current.add('routeType');
    routeType({ dropdown: 'true' }).then(res => {
      setRouteTypeData(normalizeResponse(res) as RouteTypeItem[]);
      fetchedRef.current.add('routeType');
      fetchingRef.current.delete('routeType');
    }).catch(() => {
      setRouteTypeData([]);
      fetchingRef.current.delete('routeType');
    });
  }, [normalizeResponse]);

  const ensureAreaLoaded = useCallback(() => {
    // if (fetchedRef.current.has('area') || fetchingRef.current.has('area')) return;
    // fetchingRef.current.add('area');
    getSubRegion().then(res => {
      setAreaListData(normalizeResponse(res) as AreaItem[]);
      fetchedRef.current.add('area');
      fetchingRef.current.delete('area');
    }).catch(() => {
      setAreaListData([]);
      fetchingRef.current.delete('area');
    });
  }, [normalizeResponse]);

  const ensureCompanyCustomersLoaded = useCallback(() => {
    // if (fetchedRef.current.has('companyCustomers') || fetchingRef.current.has('companyCustomers')) return;
    // fetchingRef.current.add('companyCustomers');
    getCompanyCustomers({ dropdown: 'true' }).then(res => {
      setCompanyCustomersData(normalizeResponse(res) as CustomerItem[]);
      fetchedRef.current.add('companyCustomers');
      fetchingRef.current.delete('companyCustomers');
    }).catch(() => {
      setCompanyCustomersData([]);
      fetchingRef.current.delete('companyCustomers');
    });
  }, [normalizeResponse]);

  const ensureCompanyCustomersTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('companyCustomersType') || fetchingRef.current.has('companyCustomersType')) return;
    // fetchingRef.current.add('companyCustomersType');
    getCompanyCustomersType().then(res => {
      setCompanyCustomersTypeData(normalizeResponse(res) as CustomerTypeItem[]);
      fetchedRef.current.add('companyCustomersType');
      fetchingRef.current.delete('companyCustomersType');
    }).catch(() => {
      setCompanyCustomersTypeData([]);
      fetchingRef.current.delete('companyCustomersType');
    });
  }, [normalizeResponse]);

  const ensureItemCategoryLoaded = useCallback(() => {
    // if (fetchedRef.current.has('itemCategory') || fetchingRef.current.has('itemCategory')) return;
    // fetchingRef.current.add('itemCategory');
    itemCategory({ dropdown: 'true' }).then(res => {
      setItemCategoryData(normalizeResponse(res) as ItemCategoryItem[]);
      fetchedRef.current.add('itemCategory');
      fetchingRef.current.delete('itemCategory');
    }).catch(() => {
      setItemCategoryData([]);
      fetchingRef.current.delete('itemCategory');
    });
  }, [normalizeResponse]);

   // Lazy load function for all item categories (for itemCategoryAllOptions)
  const ensureAllItemCategoryLoaded = useCallback(() => {
    itemCategory().then(res => {
      setItemCategoryAllData(Array.isArray(res?.data) ? res.data : []);
      fetchedRef.current.add('itemCategoryAll');
      fetchingRef.current.delete('itemCategoryAll');
    }).catch(() => {
      setItemCategoryAllData([]);
      fetchingRef.current.delete('itemCategoryAll');
    });
  }, []);

  const ensureItemSubCategoryLoaded = useCallback(() => {
    // if (fetchedRef.current.has('itemSubCategory') || fetchingRef.current.has('itemSubCategory')) return;
    // fetchingRef.current.add('itemSubCategory');
    itemSubCategory({ dropdown: 'true' }).then(res => {
      setItemSubCategoryData(normalizeResponse(res) as ItemSubCategoryItem[]);
      fetchedRef.current.add('itemSubCategory');
      fetchingRef.current.delete('itemSubCategory');
    }).catch(() => {
      setItemSubCategoryData([]);
      fetchingRef.current.delete('itemSubCategory');
    });
  }, [normalizeResponse]);

  const ensureChannelLoaded = useCallback(() => {
    // if (fetchedRef.current.has('channel') || fetchingRef.current.has('channel')) return;
    // fetchingRef.current.add('channel');
    channelList().then(res => {
      setChannelListData(normalizeResponse(res) as ChannelItem[]);
      fetchedRef.current.add('channel');
      fetchingRef.current.delete('channel');
    }).catch(() => {
      setChannelListData([]);
      fetchingRef.current.delete('channel');
    });
  }, [normalizeResponse]);

  const ensureCustomerTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('customerType') || fetchingRef.current.has('customerType')) return;
    // fetchingRef.current.add('customerType');
    getCustomerType({dropdown:"true"}).then(res => {
      setCustomerTypeData(normalizeResponse(res) as CustomerType[]);
      fetchedRef.current.add('customerType');
      fetchingRef.current.delete('customerType');
    }).catch(() => {
      setCustomerTypeData([]);
      fetchingRef.current.delete('customerType');
    });
  }, [normalizeResponse]);

  const ensureSalesmanTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('salesmanType') || fetchingRef.current.has('salesmanType')) return;
    // fetchingRef.current.add('salesmanType');
    salesmanTypeList({}).then(res => {
      setSalesmanTypesData(normalizeResponse(res) as SalesmanType[]);
      fetchedRef.current.add('salesmanType');
      fetchingRef.current.delete('salesmanType');
    }).catch(() => {
      setSalesmanTypesData([]);
      fetchingRef.current.delete('salesmanType');
    });
  }, [normalizeResponse]);

  const ensureVehicleListLoaded = useCallback(() => {
    // if (fetchedRef.current.has('vehicleList') || fetchingRef.current.has('vehicleList')) return;
    // fetchingRef.current.add('vehicleList');
    vehicleListData().then(res => {
      setVehicleList(normalizeResponse(res) as VehicleListItem[]);
      fetchedRef.current.add('vehicleList');
      fetchingRef.current.delete('vehicleList');
    }).catch(() => {
      setVehicleList([]);
      fetchingRef.current.delete('vehicleList');
    });
  }, [normalizeResponse]);

  const ensureCustomerCategoryLoaded = useCallback(() => {
    // if (fetchedRef.current.has('customerCategory') || fetchingRef.current.has('customerCategory')) return;
    // fetchingRef.current.add('customerCategory');
    customerCategoryList().then(res => {
      setCustomerCategory(normalizeResponse(res) as CustomerCategory[]);
      fetchedRef.current.add('customerCategory');
      fetchingRef.current.delete('customerCategory');
    }).catch(() => {
      setCustomerCategory([]);
      fetchingRef.current.delete('customerCategory');
    });
  }, [normalizeResponse]);

  const ensureCustomerSubCategoryLoaded = useCallback(() => {
    // if (fetchedRef.current.has('customerSubCategory') || fetchingRef.current.has('customerSubCategory')) return;
    // fetchingRef.current.add('customerSubCategory');
    customerSubCategoryList().then(res => {
      setCustomerSubCategory(normalizeResponse(res) as CustomerSubCategory[]);
      fetchedRef.current.add('customerSubCategory');
      fetchingRef.current.delete('customerSubCategory');
    }).catch(() => {
      setCustomerSubCategory([]);
      fetchingRef.current.delete('customerSubCategory');
    });
  }, [normalizeResponse]);

  const ensureItemLoaded = useCallback(() => {
    // if (fetchedRef.current.has('item') || fetchingRef.current.has('item')) return;
    // fetchingRef.current.add('item');
    itemList().then(res => {
      setItem(normalizeResponse(res) as Item[]);
      fetchedRef.current.add('item');
      fetchingRef.current.delete('item');
    }).catch(() => {
      setItem([]);
      fetchingRef.current.delete('item');
    });
  }, [normalizeResponse]);

  const ensureDiscountTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('discountType') || fetchingRef.current.has('discountType')) return;
    // fetchingRef.current.add('discountType');
    getDiscountTypeList().then(res => {
      setDiscountType(normalizeResponse(res) as DiscountType[]);
      fetchedRef.current.add('discountType');
      fetchingRef.current.delete('discountType');
    }).catch(() => {
      setDiscountType([]);
      fetchingRef.current.delete('discountType');
    });
  }, [normalizeResponse]);

  const ensureMenuListLoaded = useCallback(() => {
    // if (fetchedRef.current.has('menuList') || fetchingRef.current.has('menuList')) return;
    // fetchingRef.current.add('menuList');
    getMenuList().then(res => {
      setMenuList(normalizeResponse(res) as MenuList[]);
      fetchedRef.current.add('menuList');
      fetchingRef.current.delete('menuList');
    }).catch(() => {
      setMenuList([]);
      fetchingRef.current.delete('menuList');
    });
  }, [normalizeResponse]);

  const ensureVendorLoaded = useCallback(() => {
    // if (fetchedRef.current.has('vendor') || fetchingRef.current.has('vendor')) return;
    // fetchingRef.current.add('vendor');
    vendorList().then(res => {
      setVendor(normalizeResponse(res) as VendorList[]);
      fetchedRef.current.add('vendor');
      fetchingRef.current.delete('vendor');
    }).catch(() => {
      setVendor([]);
      fetchingRef.current.delete('vendor');
    });
  }, [normalizeResponse]);

  const ensureSalesmanLoaded = useCallback(() => {
    // if (fetchedRef.current.has('salesman') || fetchingRef.current.has('salesman')) return;
    // fetchingRef.current.add('salesman');
    salesmanList().then(res => {
      setSalesman(normalizeResponse(res) as SalesmanList[]);
      fetchedRef.current.add('salesman');
      fetchingRef.current.delete('salesman');
    }).catch(() => {
      setSalesman([]);
      fetchingRef.current.delete('salesman');
    });
  }, [normalizeResponse]);

  const ensureAgentCustomerLoaded = useCallback(() => {
    // if (fetchedRef.current.has('agentCustomer') || fetchingRef.current.has('agentCustomer')) return;
    // fetchingRef.current.add('agentCustomer');
    agentCustomerList().then(res => {
      setAgentCustomer(normalizeResponse(res) as AgentCustomerList[]);
      fetchedRef.current.add('agentCustomer');
      fetchingRef.current.delete('agentCustomer');
    }).catch(() => {
      setAgentCustomer([]);
      fetchingRef.current.delete('agentCustomer');
    });
  }, [normalizeResponse]);

  const ensureShelvesLoaded = useCallback(() => {
    // if (fetchedRef.current.has('shelves') || fetchingRef.current.has('shelves')) return;
    // fetchingRef.current.add('shelves');
    shelvesList().then(res => {
      setShelves(normalizeResponse(res) as ShelvesList[]);
      fetchedRef.current.add('shelves');
      fetchingRef.current.delete('shelves');
    }).catch(() => {
      setShelves([]);
      fetchingRef.current.delete('shelves');
    });
  }, [normalizeResponse]);

  const ensureSubmenuLoaded = useCallback(() => {
    // if (fetchedRef.current.has('submenu') || fetchingRef.current.has('submenu')) return;
    // fetchingRef.current.add('submenu');
    submenuList({ dropdown: 'true' }).then(res => {
      setSubmenu(normalizeResponse(res) as submenuList[]);
      fetchedRef.current.add('submenu');
      fetchingRef.current.delete('submenu');
    }).catch(() => {
      setSubmenu([]);
      fetchingRef.current.delete('submenu');
    });
  }, [normalizeResponse]);

  const ensurePermissionsLoaded = useCallback(() => {
    // if (fetchedRef.current.has('permissions') || fetchingRef.current.has('permissions')) return;
    // fetchingRef.current.add('permissions');
    permissionList().then(res => {
      setPermissions(normalizeResponse(res) as permissionsList[]);
      fetchedRef.current.add('permissions');
      fetchingRef.current.delete('permissions');
    }).catch(() => {
      setPermissions([]);
      fetchingRef.current.delete('permissions');
    });
  }, [normalizeResponse]);

  const ensureLabelsLoaded = useCallback(() => {
    // if (fetchedRef.current.has('labels') || fetchingRef.current.has('labels')) return;
    // fetchingRef.current.add('labels');
    labelList().then(res => {
      setLabels(normalizeResponse(res) as LabelItem[]);
      fetchedRef.current.add('labels');
      fetchingRef.current.delete('labels');
    }).catch(() => {
      setLabels([]);
      fetchingRef.current.delete('labels');
    });
  }, [normalizeResponse]);

  const ensureRolesLoaded = useCallback(() => {
    // if (fetchedRef.current.has('roles') || fetchingRef.current.has('roles')) return;
    // fetchingRef.current.add('roles');
    roleList({ dropdown: 'true' }).then(res => {
      setRoles(normalizeResponse(res) as Role[]);
      fetchedRef.current.add('roles');
      fetchingRef.current.delete('roles');
    }).catch(() => {
      setRoles([]);
      fetchingRef.current.delete('roles');
    });
  }, [normalizeResponse]);

  const ensureProjectLoaded = useCallback(() => {
    // if (fetchedRef.current.has('project') || fetchingRef.current.has('project')) return;
    // fetchingRef.current.add('project');
    projectList({}).then(res => {
      setProject(normalizeResponse(res) as Project[]);
      fetchedRef.current.add('project');
      fetchingRef.current.delete('project');
    }).catch(() => {
      setProject([]);
      fetchingRef.current.delete('project');
    });
  }, [normalizeResponse]);

  const ensureCompanyTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('companyType') || fetchingRef.current.has('companyType')) return;
    // fetchingRef.current.add('companyType');
    companyTypeList({dropdown:"true"}).then(res => {
      setComapanyType(normalizeResponse(res) as CompanyType[]);
      fetchedRef.current.add('companyType');
      fetchingRef.current.delete('companyType');
    }).catch(() => {
      setComapanyType([]);
      fetchingRef.current.delete('companyType');
    });
  }, [normalizeResponse]);

  const ensureUomLoaded = useCallback(() => {
    // if (fetchedRef.current.has('uom') || fetchingRef.current.has('uom')) return;
    // fetchingRef.current.add('uom');
    uomList().then(res => {
      setUom(normalizeResponse(res) as UOM[]);
      fetchedRef.current.add('uom');
      fetchingRef.current.delete('uom');
    }).catch(() => {
      setUom([]);
      fetchingRef.current.delete('uom');
    });
  }, [normalizeResponse]);

  const ensureLocationLoaded = useCallback(() => {
    // if (fetchedRef.current.has('location') || fetchingRef.current.has('location')) return;
    // fetchingRef.current.add('location');
    locationList().then(res => {
      setLocation(normalizeResponse(res) as LocationItem[]);
      fetchedRef.current.add('location');
      fetchingRef.current.delete('location');
    }).catch(() => {
      setLocation([]);
      fetchingRef.current.delete('location');
    });
  }, [normalizeResponse]);

  const ensureAssetsTypeLoaded = useCallback(() => {
    // if (fetchedRef.current.has('assetsType') || fetchingRef.current.has('assetsType')) return;
    // fetchingRef.current.add('assetsType');
    assetsTypeList().then(res => {
      setAssetsType(normalizeResponse(res) as AssetsType[]);
      fetchedRef.current.add('assetsType');
      fetchingRef.current.delete('assetsType');
    }).catch(() => {
      setAssetsType([]);
      fetchingRef.current.delete('assetsType');
    });
  }, [normalizeResponse]);

  const ensureManufacturerLoaded = useCallback(() => {
    // if (fetchedRef.current.has('manufacturer') || fetchingRef.current.has('manufacturer')) return;
    // fetchingRef.current.add('manufacturer');
    manufacturerList().then(res => {
      setManufacturer(normalizeResponse(res) as Manufacturer[]);
      fetchedRef.current.add('manufacturer');
      fetchingRef.current.delete('manufacturer');
    }).catch(() => {
      setManufacturer([]);
      fetchingRef.current.delete('manufacturer');
    });
  }, [normalizeResponse]);

  const ensureAssetsModelLoaded = useCallback(() => {
    // if (fetchedRef.current.has('assetsModel') || fetchingRef.current.has('assetsModel')) return;
    // fetchingRef.current.add('assetsModel');
    assetsModelList().then(res => {
      setAssetsModel(normalizeResponse(res) as AssetsModel[]);
      fetchedRef.current.add('assetsModel');
      fetchingRef.current.delete('assetsModel');
    }).catch(() => {
      setAssetsModel([]);
      fetchingRef.current.delete('assetsModel');
    });
  }, [normalizeResponse]);

  const ensureBrandLoaded = useCallback(() => {
    // if (fetchedRef.current.has('brand') || fetchingRef.current.has('brand')) return;
    // fetchingRef.current.add('brand');
    BrandList().then(res => {
      setBrandList(normalizeResponse(res) as Brand[]);
      fetchedRef.current.add('brand');
      fetchingRef.current.delete('brand');
    }).catch(() => {
      setBrandList([]);
      fetchingRef.current.delete('brand');
    });
  }, [normalizeResponse]);

  const ensureBrandingLoaded = useCallback(() => {
    // if (fetchedRef.current.has('branding') || fetchingRef.current.has('branding')) return;
    // fetchingRef.current.add('branding');
    brandingList().then(res => {
      setBrandingList(normalizeResponse(res) as Branding[]);
      fetchedRef.current.add('branding');
      fetchingRef.current.delete('branding');
    }).catch(() => {
      setBrandingList([]);
      fetchingRef.current.delete('branding');
    });
  }, [normalizeResponse]);

  const ensureUserLoaded = useCallback(() => {
    getUserList({ dropdown: 'true' }).then(res => {
      setUserList(normalizeResponse(res) as UserItem[]);
      fetchedRef.current.add('user');
      fetchingRef.current.delete('user');
    }).catch(() => {
      setUserList([]);
      fetchingRef.current.delete('user');
    });
  }, [normalizeResponse]);

  // mapped dropdown options (explicit typed mappings)
  const companyOptions = (Array.isArray(companyListData) ? companyListData : []).map((c: CompanyItem) => ({
    value: String(c.id ?? ''),
    label: c.company_code && c.company_name ? `${c.company_code} - ${c.company_name}` : (c.company_name ?? '')
  }));

  const countryOptions = (Array.isArray(countryListData) ? countryListData : []).map((c: CountryItem) => ({
    value: String(c.id ?? ''),
    label: c.country_name ? `${c.country_name}` : (c.country_name ?? '')
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
    label: c.region_name ? `${c.region_name}` : (c.region_name ?? '')
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
    label: c.area_name ? `${c.area_name}` : (c.area_name ?? ''),
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
    label: c.name ? `${c.name}` : (c.name ?? '')
  }));

  const itemCategoryOptions = (Array.isArray(itemCategoryData) ? itemCategoryData : []).map((c: ItemCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.category_name ? `${c.category_name}` : (c.category_name ?? '')
  }));

  const itemCategoryAllOptions = (Array.isArray(itemCategoryAllData) ? itemCategoryAllData : []).map((c: ItemCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.category_name ? `${c.category_name}` : (c.category_name ?? '')
  }));

  const itemSubCategoryOptions = (Array.isArray(itemSubCategoryData) ? itemSubCategoryData : []).map((c: ItemSubCategoryItem) => ({
    value: String(c.id ?? ''),
    label: c.sub_category_name ? `${c.sub_category_name}` : (c.sub_category_name ?? '')
  }));

  const channelOptions = (Array.isArray(channelListData) ? channelListData : []).map((c: ChannelItem) => ({
    value: String(c.id ?? ''),
    label: c.outlet_channel ? `${c.outlet_channel}` : (c.outlet_channel ?? '')
  }));
  const customerTypeOptions = (Array.isArray(customerTypeData) ? customerTypeData : []).map((c: CustomerType) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }));
  const allAgentCustomerOptions = (Array.isArray(allAgentCustomers) ? allAgentCustomers : []).map((c: AgentCustomerList) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.name ? `${c.osa_code} - ${c.name}` : (c.name ?? ''),
    contact_no: c.contact_no ?? ''
  }));

  const allCompanyOptions = (Array.isArray(allCompanies) ? allCompanies : []).map((c: CompanyItem) => ({
    value: String(c.id ?? ''),
    label: c.company_code && c.company_name ? `${c.company_code} - ${c.company_name}` : (c.company_name ?? '')
  }));

  const salesmanTypeOptions = (Array.isArray(salesmanTypesData) ? salesmanTypesData : []).map((c: SalesmanType) => ({
    value: String(c.id ?? ''),
    label: c.salesman_type_name ? `${c.salesman_type_name}` : (c.salesman_type_name ?? '')
  }));

  const vehicleListOptions = (Array.isArray(VehicleList) ? VehicleList : []).map((c: VehicleListItem) => ({
    value: String(c.id ?? ''),
    label: c.vehicle_code ? c.vehicle_code : '-',
  }));

  const customerCategoryOptions = (Array.isArray(customerCategory) ? customerCategory : []).map((c: CustomerCategory) => ({
    value: String(c.id ?? ''),
    label: c.customer_category_name ? `${c.customer_category_name}` : (c.customer_category_name ?? '')
  }));

  const customerSubCategoryOptions = (Array.isArray(customerSubCategory) ? customerSubCategory : []).map((c: CustomerSubCategory) => ({
    value: String(c.id ?? ''),
    label: c.customer_sub_category_name ? `${c.customer_sub_category_name}` : (c.customer_sub_category_name ?? '')
  }));

  const projectOptions = (Array.isArray(project) ? project : []).map((c: Project) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }))

  const assetsTypeOptions = (Array.isArray(assetsType) ? assetsType : []).map((c: AssetsType) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }));

  const manufacturerOptions = (Array.isArray(manufacturer) ? manufacturer : []).map((c: Manufacturer) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }))

  const assetsModelOptions = (Array.isArray(assetsModel) ? assetsModel : []).map((c: AssetsModel) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }))

  const brandOptions = (Array.isArray(brandList) ? brandList : []).map((c: Brand) => ({
    value: String(c.id ?? ''),
    label: c.name ? `${c.name}` : (c.name ?? '')
  }))

  const brandingOptions = (Array.isArray(brandingListState) ? brandingListState : []).map((c: Branding) => ({
    value: String(c.id ?? ''),
    label: c.name ?? ''
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
    label: c.discount_name ? `${c.discount_name}` : (c.discount_name ?? '')
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

  const userOptions = (Array.isArray(userListState) ? userListState : []).map((c: UserItem) => ({
    value: String(c.id ?? ''),
    label: c.name ?? '',
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

  const allCompanyCustomerOptions = (Array.isArray(allCompanyCustomers) ? allCompanyCustomers : []).map((c: CustomerItem) => ({
    value: String(c.id ?? ''),
    label: c.osa_code && c.business_name ? `${c.osa_code} - ${c.business_name}` : (c.business_name ?? '')
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

  const fetchItemsCategoryWise = useCallback(async (category_id?: string | number) => {
    setLoading(false);
    try {
      // call itemList with category_id to fetch items for this category
      const res = await itemList({ category_id: String(category_id) ?? "", dropdown: "true" });
      const normalize = (r: unknown): Item[] => {
        if (r && typeof r === 'object') {
          const obj = r as Record<string, unknown>;
          if (Array.isArray(obj.data)) return obj.data as Item[];
        }
        if (Array.isArray(r)) return r as Item[];
        return [];
      };
      const filterNecessaryOject = (item: any) => {
        return (Array.isArray(item) ? item : []).map((c: Item) => ({
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
      }
      const normalizeResult = normalize(res)
      const result = filterNecessaryOject(normalizeResult)
      return result
    } catch (error) {
      // setItem([]);
      return []
    } finally {
      setLoading(false);
    }
  }, [])

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
      { run: () => assetsModelList(), setter: (v) => setAssetsModel(v as AssetsModel[]) },
      { run: () => BrandList(), setter: (v) => setBrandList(v as Brand[]) },
      { run: () => brandingList(), setter: (v) => setBrandingList(v as Branding[]) },
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

  // No automatic loading on mount - data loads on demand

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
        brandingList: brandingListState,
        userList: userListState,
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
      itemCategoryAllOptions,
        itemSubCategoryOptions,
        channelOptions,
        customerTypeOptions,
        allAgentCustomerOptions,
        allCompanyOptions,
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
        allCompanyCustomerOptions,
        fetchRoutebySalesmanOptions,
        fetchCustomerCategoryOptions,
        fetchCompanyCustomersOptions,
        fetchItemOptions,
        fetchItemsCategoryWise,
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
        allCustomerTypeOptions,
        allCompanyTypeOptions,
        brandingOptions,
        userOptions,
        loading,
        ensureCompanyLoaded,
        ensureCountryLoaded,
        ensureRegionLoaded,
        ensureSurveyLoaded,
        ensureRouteLoaded,
        ensureWarehouseLoaded,
        ensureWarehouseAllLoaded,
        ensureRouteTypeLoaded,
        ensureAreaLoaded,
        ensureCompanyCustomersLoaded,
        ensureCompanyCustomersTypeLoaded,
        ensureItemCategoryLoaded,
        ensureAllItemCategoryLoaded,
        ensureItemSubCategoryLoaded,
        ensureChannelLoaded,
        ensureCustomerTypeLoaded,
        ensureSalesmanTypeLoaded,
        ensureAllCompanyCustomersLoaded,
        ensureAllCustomerTypesLoaded,
        ensureAllCompanyTypesLoaded,
        ensureVehicleListLoaded,
        ensureCustomerCategoryLoaded,
        ensureCustomerSubCategoryLoaded,
        ensureItemLoaded,
        ensureDiscountTypeLoaded,
        ensureMenuListLoaded,
        ensureVendorLoaded,
        ensureSalesmanLoaded,
        ensureAgentCustomerLoaded,
        ensureShelvesLoaded,
        ensureSubmenuLoaded,
        ensurePermissionsLoaded,
        ensureLabelsLoaded,
        ensureRolesLoaded,
        ensureProjectLoaded,
        ensureCompanyTypeLoaded,
        ensureUomLoaded,
        ensureLocationLoaded,
        ensureAssetsTypeLoaded,
        ensureManufacturerLoaded,
        ensureAssetsModelLoaded,
        ensureBrandLoaded,
        ensureBrandingLoaded,
        ensureUserLoaded,
        ensureAllAgentCustomersLoaded,
        ensureAllCompanyOptionsLoaded,
      }}
    >
      {children}
    </AllDropdownListDataContext.Provider>
  );
};