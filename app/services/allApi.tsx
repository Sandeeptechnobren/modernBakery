import axios from "axios";
import { Params } from "next/dist/server/request/params";
import { APIFormData } from "./merchandiserApi";
import { useRouter } from "next/navigation";


export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {  
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function handleError(error: unknown) {
  // const router = useRouter()

  if (axios.isAxiosError(error) && error.response) {
    console?.error("API Error:",error, error?.response.data);
    if(error.status === 401){
      // router.push('/login')
      window.location.reload();
    }
    return { error: true, data: error.response.data };
  } else if (error instanceof Error) {
    console.error("Request Error:", error.message);
    return { error: true, data: { message: error.message } };
  } else {
    console.error("An unknown error occurred.");
    return { error: true, data: { message: "An unknown error occurred." } };
  }
}

export const downloadFile = (fileurl: string, type?: string): void => {
  const n = fileurl.lastIndexOf("/");
  const final_url = fileurl.substring(n + 1);
  const link = document.createElement("a");
  link.setAttribute("target", "");
  link.setAttribute("href", fileurl);
  link.setAttribute("download", final_url);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const res = await API.post("/api/master/auth/login", credentials);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const isVerify = async () => {
  try {
    const res = await API.get("/api/master/auth/me");
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const genearateCode = async (body: object) => {
  try {
    const res = await API.post("/api/codes/reserve", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const saveFinalCode = async (body: object) => {
  try {
    const res = await API.post("/api/codes/finalize", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const companyList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/company/list_company`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const companyById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/company/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCompany = async (id: string, data: object) => {
  try {
    const res = await APIFormData.put(`/api/master/company/company/${id}`, data);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCompany = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/company/company/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/company/company/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const logout = async () => {
  try {
    const res = await API.post("/api/master/auth/logout");
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCompany = async (data: FormData | Record<string, string>) => {
  try {
    const res = await APIFormData.post("/api/master/company/add_company", data);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const companyListGlobalSearch = async (params: Params) => {
  try {
    const res = await API.get("/api/master/company/global_search", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const SalesmanListGlobalSearch = async (params: Params) => {
  try {
    const res = await API.get("/api/master/salesmen/global_search", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const countryList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/country/list_country", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const uomList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/uom/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const countryListGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/country/global_search", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCountry = async (payload: object) => {
  try {
    const res = await API.post("/api/master/country/add_country", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const countryById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/country/country/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editCountry = async (id: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/master/country/update_country/${id}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteCountry = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/country/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Item Category
export const itemCategoryList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/item_category/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemCategoryById = async (id: number) => {
  try {
    const res = await API.get(`/api/settings/item_category/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createItemCategory = async (
  category_name: string,
  status: 0 | 1,
  category_code?: string
) => {
  try {
    const res = await API.post(`/api/settings/item_category/create`, {
      category_name,
      status,
      category_code,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateItemCategory = async (
  category_id: number,
  category_name?: string | undefined,
  status?: 0 | 1 | undefined,
category_code?: string | undefined
) => {
  const body = {
    ...(category_name && { category_name }),
    ...(status !== undefined && { status }),
    ...(category_code && { category_code: category_code }),
    category_id,
  };

  if (Object.keys(body).length === 0) {
    throw new Error("No data provided for update.");
  }

  try {
    const res = await API.put(
      `/api/settings/item_category/${category_id}`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteItemCategory = async (category_id: number) => {
  try {
    const res = await API.delete(`/api/settings/item_category/${category_id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Item Sub Category
export const itemSubCategoryList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/item-sub-category/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemSubCategoryById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/item-sub-category/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createItemSubCategory = async (
  category_id: number,
  sub_category_name: string,
  sub_category_code: string,
  status: 0 | 1
) => {
  try {
    const res = await API.post(`/api/settings/item-sub-category/create`, {
      category_id,
      sub_category_name,
      sub_category_code,
      status,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateItemSubCategory = async (
  category_id: number,
  sub_category_id: number,
  sub_category_name: string,
  sub_category_code: string,
  status: 0 | 1
) => {
  try {
    const res = await API.put(
      `/api/settings/item-sub-category/${sub_category_id}/update`,
      { sub_category_name,sub_category_code,status, category_id }
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteItemSubCategory = async (sub_category_id: number) => {
  try {
    const res = await API.delete(
      `/api/settings/item-sub-category/${sub_category_id}/delete`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const regionList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/region/list_region", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRegionById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/region/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const regionGlobalSearch = async (params: Params) => {
  try {
    const res = await API.get("/api/master/region/global_search", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteRegion = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/region/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/route/list_routes", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addRoutes = async (body: object) => {
  try {
    const res = await API.post("/api/master/route/add_routes", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRouteById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/route/routes/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateRoute = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/master/route/routes/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteRoute = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/route/routes/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const saveRouteVisit = async (body: object) => {
  try {
    const res = await API.post("/api/master/route-visits/add", body);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const merchandiserData = async () => {
  try {
    const res = await API.get("/api/master/route-visits/salesmen");
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const getCustomerByMerchandiser = async (merchandiser_id:string) => {
  try {
    const res = await API.get(`/api/master/route-visits/customerlist/${merchandiser_id}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getRouteVisitList = async (params: {
  from_date: string | null;
  to_date: string | null;
  customer_type: string | null;
  status: string | null;
}) => {
  try {
    console.log(params);
    const res = await API.get("/api/master/route-visits/list");
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateRouteVisitDetails = async (body: object) => {
  try {
    const res = await API.put(`/api/master/route-visits/bulk-update`, body);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getRouteVisitDetails = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/route-visits/${uuid}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const warehouseListGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/warehouse/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeVisitGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/route-visits/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const warehouseReturn = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/warehouse/${id}/returns`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const warehouseSales = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/warehouse/${id}/invoices`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const warehouseList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/warehouse/list", { params: params });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouseById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouseCustomerById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/warehouseCustomer/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateWarehouse = async (id: string, payload: object) => {
  try {
    const res =
      payload instanceof FormData
        ? await API.put(`/api/master/warehouse/${id}`, payload, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await API.put(`/api/master/warehouse/${id}`, payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAllActiveWarehouse = async () => {
  try {
    const res = await API.get(`/api/master/warehouse/list_warehouse/active`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouseByType = async (type: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/type/${type}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateWarehouseStatus = async (id: string, body: object) => {
  try {
    const res = await API.put(`/api/master/warehouse/${id}/status`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouseByRegion = async (regionId: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/region/${regionId}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouseByArea = async (areaId: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/region/${areaId}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeType = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/route-type/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getSubRegion = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/area/areadropdown", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const subRegionList = async (params?: Params) => {
  const res = await API.get("/api/master/area/list_area", { params: params });
  return res.data;
};

export const getCompanyCustomers = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/companycustomer/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const companyCustomersGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/companycustomer/global-search", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCompanyCustomers = async (body: object) => {
  try {
    const res = await API.post("/api/master/companycustomer/create", body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/companycustomer/show/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCompanyCustomer = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/master/companycustomer/${uuid}/update`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCompanyCustomer = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/companycustomer/${id}/delete`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerByRegion = async (regionId: string) => {
  try {
    const res = await API.get(`/api/master/companycustomer/region/${regionId}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerByArea = async (areaId: string) => {
  try {
    const res = await API.get(`/api/master/companycustomer/region/${areaId}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerActive = async () => {
  try {
    const res = await API.get(`/api/master/companycustomer/active`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomersType = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/companycustomer/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemCategory = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/item_category/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemSubCategory = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/item-sub-category/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const channelList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/outlet-channels/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const userTypes = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/user-type/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouse = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/warehouse/list", { params: params });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const warehouseType = async (type: number) => {
  try {
    const res = await API.get(`/api/master/warehouse/type/${type}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addWarehouse = async (body: object) => {
  try {
    const res =
      body instanceof FormData
        ? await API.post("/api/master/warehouse/create", body, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await API.post("/api/master/warehouse/create", body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteWarehouse = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/warehouse/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCustomerType = async (payload: object) => {
  try {
    const res = await API.post("/api/settings/customer-type/create", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerTypeById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/customer-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCustomerType = async (id: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/customer-type/${id}`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCustomerType = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/customer-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const customerTypeList = async (params?: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/customer-type/list", { params });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerType = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/customer-type/list`, {
      params: params,
    });
    return res.data;
  } catch (error) {
    console.error("Get Customer Type by ID failed ❌", error);
    throw error;
  }
};

type Payload = {
  region_name: string;
  company_id: number;
  status: number;
};

export const addRegion = async (payload: Payload) => {
  try {
    // ✅ Send the object directly, not wrapped inside { payload }
    const res = await API.post("/api/master/region/add_region", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type ipdatePayload = {
  region_name: string;
  company_id: number;
  status: number;
};

export const updateRegion = async (id: string, payload: ipdatePayload) => {
  try {
    // ✅ Send payload directly
    const res = await API.put(
      `/api/master/region/update_region/${id}`,
      payload
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeTypeList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/route-type/list", {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addRouteType = async (
  payload: Record<string, string | number>
) => {
  try {
    const res = await API.post("/api/settings/route-type/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRouteTypeById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/route-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateRouteTypeById = async (id: string, payload: object) => {
  try {
    const res = await API.put(`/api/settings/route-type/${id}/update`, payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteRouteTypeById = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/route-type/${id}/delete`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const subRegionListGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/area/global_search", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getArea = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/area/list_area`, { params: params });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addArea = async (body: object) => {
  try {
    const res = await API.post(`/api/master/area/add_area`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAreaById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/area/area/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateAreaById = async (id: string, body: object) => {
  try {
    const res = await API.put(`/api/master/area/area/${id}`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteArea = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/area/area/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const subRegionByID = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/area/area/${id}`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerCategory = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/customer-category/list`, {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerCategoryById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/customer-category/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createCustomerCategory = async (body: object) => {
  try {
    const res = await API.post(`/api/settings/customer-category/create`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const cupdateCustomerCategory = async (body: object, id: string) => {
  try {
    const res = await API.put(
      `/api/settings/customer-category/${id}/update`,
      body
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCustomerCategory = async (id: string) => {
  try {
    const res = await API.delete(
      `/api/settings/customer-category/${id}/delete`
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getItemCategory = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/item-category/list`, {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getItemCategoryById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/item-category/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getOutletChannelById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/outlet-channels/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateOutletChannel = async (id: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/outlet-channels/${id}`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteOutletChannel = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/outlet-channels/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addOutletChannel = async (body: object) => {
  try {
    const res = await API.post(`/api/settings/outlet-channels`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getUserTypeById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/user-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateUserType = async (id: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/user-type/${id}`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteUserType = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/user-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createUserType = async (body: object) => {
  try {
    const res = await API.post(`/api/settings/user-type/create`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const customerCategoryList = async (params?: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/customer-category/list", {
      params: params,
    });
    return res.data;
  } catch (error) {
    console.error("Customer Category List failed ❌", error);
    throw error;
  }
};

export const customerCategoryListGlobalSearch = async (
  params?: Record<string, string>
) => {
  try {
    const res = await API.get("/api/settings/customer-category/global_search", {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Customer Category List failed ❌", error);
    throw error;
  }
};

export const addCustomerCategory = async (
  payload: Record<string, string | number>
) => {
  try {
    const res = await API.post(
      "/api/settings/customer-category/create",
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Add Customer Category failed ❌", error);
    throw error;
  }
};

export const updateCustomerCategory = async (
  id: string,
  payload: Record<string, string | number>
) => {
  try {
    const res = await API.put(
      `/api/settings/customer-category/${id}/update`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Update Customer Category failed ❌", error);
    throw error;
  }
};
export const getCustomerCategoryByUUID = async (id: string) => {
  const res = await API.get(`/api/settings/customer-category/${id}`);
  return res.data;
};
export const userList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/user-type/list", {
      params: params,
    });
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const addUser = async (payload: object) => {
  const res = await API.post("/api/settings/user-type/create", payload);

  return res.data;
};

export const editUser = async (id: string, payload: object) => {
  const res = await API.put(
    `/api/master/country/update_country/${id}`,
    payload
  );
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await API.delete(`/api/settings/user-type/${id}`);

  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await API.get(`/api/settings/user-type/${id}`);
  return res.data;
};

export const updateUser = async (id: string, payload: object) => {
  const res = await API.put(`/api/settings/user-type/${id}`, payload);
  return res.data;
};

// outlet channel APIs
export const outletChannelList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/outlet-channels/list", { params });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteChannel = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/outlet-channels/${id}`);
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const getChannelById = async (id: string) => {
  const res = await API.get(`/api/settings/outlet-channels/${id}`);
  return res.data;
};

export const updateChannel = async (id: string, payload: object) => {
  try {
    const res = await API.put(`/api/settings/outlet-channels/${id}`, payload);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const getExpenseTypeList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/expence-types/list`, {
      params: params,
    });

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const getExpenseTypeByUUID = async (uuid: string) => {
  try {
    const res = await API.get(`/api/settings/expence-types/${uuid}`);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const addExpenseType = async (body: object) => {
  try {
    const res = await API.post(`/api/settings/expence-types/add`, body);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const updateExpenseType = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/expence-types/update/${uuid}`, body);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};  

export const deleteExpenseType = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/expense_type/${id}/delete`);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const exportSalesmanData = async (params?: Params) => {
  try {
    console.log(params);
    const res = await API.get("api/master/salesmen/exportfile", {
      params,
    });
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateSalesmanStatus = async (body: object) => {
  try {
    const res = await API.post(`api/master/salesmen/update-status`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const projectList = async (params: Params) => {
  try {
    const res = await API.get(`/api/settings/projects-list`, {
      params: params,
    });
    return res.data;
  } catch (error) {
    console.error("Project List failed ❌", error);
    throw error;
  }
};

export const salesmanTypeList = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/salesman_type/list", {
      params: params,
    });
    console.log(res,"salesmenType");
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const addSalesmanType = async (payload: object) => {
  const res = await API.post("/api/settings/salesman_type/create", payload);

  return res.data;
};

export const getSalesmanTypeById = async (id: string) => {
  const res = await API.get(`/api/settings/salesman_type/${id}`);

  return res.data;
};

export const updateSalesmanType = async (id: string, payload: object) => {
  const res = await API.put(
    `/api/settings/salesman_type/${id}/update`,
    payload
  );

  return res.data;
};

//{id}/delete

export const deleteSalesmanType = async (id: string) => {
  const res = await API.delete(`api/settings/salesman_type/${id}/delete`);
  return res.data;
};

export const vehicleListData = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/vehicle/list", { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getDiscountTypeList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/discount_type/list`, {
      params: params,
    });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getDiscountTypeById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/discount_type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createDiscountType = async (body: object) => {
  try {
    const res = await API.post(`/api/settings/discount_type/create`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateDiscountType = async (id: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/discount_type/${id}/update`, body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateDiscountStatus = async (body: object) => {
  try {
    const res = await API.post(`api/master/discount/status-update`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteDiscountType = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/discount_type/${id}/delete`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addVehicle = async (data: object) => {
  try {
    const res = await API.post("/api/master/vehicle/create", data);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateVehicle = async (
  uuid: string,
  data: FormData | Record<string, string>
) => {
  try {
    const res = await API.put(`/api/master/vehicle/${uuid}/update`, data);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/vehicle/${id}/delete`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getVehicleById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/vehicle/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Promotion Type
export const promotionTypeList = async (params: Params) => {
  try {
    const res = await API.get(`/api/settings/promotion_type/list`, params);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getPromotionTypeById = async (params: Params, id: string) => {
  try {
    const res = await API.get(`/api/settings/promotion_type/${id}`, params);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addPromotionType = async (body: {
  code: string;
  name: string;
  status: number;
}) => {
  try {
    const res = await API.post(`/api/settings/promotion_type/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePromotionType = async (
  body: { code: string; name: string; status: number },
  id: number
) => {
  try {
    const res = await API.put(
      `/api/settings/promotion_type/${id}/update`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePromotionType = async (id: number) => {
  try {
    const res = await API.delete(`/api/settings/promotion_type/${id}/delete`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const getCustomerSubCategoryById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/customer-sub-category/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const updateCustomerSubCategory = async (id: string, body: object) => {
  try {
    const res = await API.put(
      `/api/settings/customer-sub-category/${id}/update`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const customerSubCategoryList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/customer-sub-category/list`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteCustomerSubCategory = async (id: number) => {
  try {
    const res = await API.delete(
      `/api/settings/customer-sub-category/${id}/delete`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCustomerSubCategory = async (body: object) => {
  try {
    const res = await API.post(
      `/api/settings/customer-sub-category/create`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getSalesmanById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/salesmen/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getSalesmanBySalesId = async (uuid: string,query:{from:string,to:string,page:string}) => {
  try {
    const res = await API.get(`/api/master/salesmen/salespersalesman/${uuid}?from=${query.from}&to=${query.to}&page=${query.page}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getOrderOfSalesmen= async (uuid: string,query:{from:string,to:string}) => {
  try {
    const res = await API.get(`/api/master/salesmen/orderpersalesman/${uuid}?from=${query.from}&to=${query.to}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateSalesman = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/master/salesmen/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const salesmanList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/salesmen/list`, { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteSalesman = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/master/salesmen/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addSalesman = async (body: object) => {
  try {
    const res = await API.post(`/api/master/salesmen/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const discountList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/discount/list`, { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteDiscount = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/master/discount/delete/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getDiscountById = async (uuid?: string) => {
  try {
    const res = await API.get(`/api/master/discount/discount/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const updateDiscount = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/master/discount/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addDiscount = async (body: object) => {
  try {
    const res = await API.post(`/api/master/discount/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const customerCategoryGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/customer-category/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const vehicleGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/vehicle/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeGlobalSearch = async (params?: Params) => {
  try {
    console.log(params);
    const res = await API.get(`/api/master/route/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentCustomerList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/agent_customers/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentCustomerGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/agent_customers/global_search", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentCustomerFilteredList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/agent_customers/agent-list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addAgentCustomer = async (payload: object) => {
  try {
    const res = await API.post("/api/master/agent_customers/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentCustomerById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/agent_customers/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editAgentCustomer = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/master/agent_customers/update/${uuid}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteAgentCustomer = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/master/agent_customers/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentCustomerGenerateCode = async () => {
  try {
    const res = await API.get(`/api/master/agent_customers/generate-code`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/items/list", { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const itemGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/items/global-search", { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemExport = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/items/export", { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateItemStatus = async (body: object) => {
  try {
    const res = await API.post(`api/master/items/update-status`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addItem = async (payload: object, type: "json" | "form-data" = "json") => {
  try {
    if(type === "json") {
      const res = await API.post("/api/master/items/add", payload);
      return res.data;
    }
    const res = await APIFormData.post("/api/master/items/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/items/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editItem = async (id: string, payload: object, type: "json" | "form-data" = "json") => {
  try {
    if(type === "json") {
      const res = await API.post(`/api/master/items/update/${id}`, payload);
      return res.data;
    }
    const res = await APIFormData.post(`/api/master/items/update/${id}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteItem = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/items/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemSales = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/items/item-invoices/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemReturn = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/items/item-returns/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const merchendiserList = async () => {
  try {
    const res = await API.get(
      "/api/merchendisher/planogram/merchendisher-list"
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const planogramList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/planogram/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deletePlanogram = async (id: string) => {
  try {
    const res = await API.delete(`/api/merchendisher/planogram/delete/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type Payloadplanogram = {
  name: string;
  valid_from: string;
  valid_to: string;
  status: number;
};
export const addPlanogram = async (payload: Payloadplanogram) => {
  try {
    const res = await API.post("/api/merchendisher/planogram/create", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type updatePayload = {
  name: string;
  valid_from: string;
  valid_to: string;
  status: number;
};

export const updatePlanogram = async (id: string, payload: updatePayload) => {
  try {
    // ✅ Send payload directly
    const res = await API.put(
      `/api/merchendisher/planogram/update/${id}`,
      payload
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const getPlanogramById = async (id: string) => {
  try {
    const res = await API.get(`/api/merchendisher/planogram/show/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const SurveyList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/survey/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteSurvey = async (id: string) => {
  try {
    const res = await API.delete(`/api/merchendisher/survey/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const addSurvey = async (payload: object) => {
  try {
    const res = await API.post("/api/merchendisher/survey/add", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
type updateSurvey = {
  survey_name: string;
  start_date: string;
  end_date: string;
  status: string;
};
export const updateSurvey = async (id: string, payload: updateSurvey) => {
  try {
    // ✅ Send payload directly
    const res = await API.put(`/api/merchendisher/survey/${id}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const getSurveyById = async (id: string) => {
  try {
    const res = await API.get(`/api/merchendisher/survey/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// export const SurveyListGlobalSearch = async (params?: Params) => {
//   try{
//     const res = await API.get(`/api/merchendisher/survey/global-search`, {params: params})
//     return res.data;
//   }catch (error: unknown){
//     return handleError(error)
//   }
// }

export const surveyGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/survey/global-search", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const SurveyQuestionList = async () => {
  try {
    const res = await API.get("/api/merchendisher/survey-questions/list");
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
// Get survey by ID

export const getSurveyQuestions = async (surveyId: string) => {
  try {
    // removed `/questions` from the endpoint
    const res = await API.get(
      `/api/merchendisher/survey-questions/get/${surveyId}`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteSurveyQuestion = async (id: string | number) => {
  try {
    const res = await API.delete(`/api/merchendisher/survey-questions/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const getSurveyQuestionBySurveyId = async (
  surveyId: string | number
) => {
  try {
    const res = await API.get(
      `/api/merchendisher/survey-questions/get/${surveyId}`
    );

    // normalize response
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data; // ✅ direct array
    } else if (Array.isArray(data?.questions)) {
      return data.questions; // ✅ nested case
    } else {
      console.error("Unexpected response:", res.data);
      return []; // fallback
    }
  } catch (error: unknown) {
    console.error("Error fetching survey questions:", error);
    return [];
  }
};

export const addSurveyQuestion = async (payload: object) => {
  try {
    const res = await API.post(
      "/api/merchendisher/survey-questions/add",
      payload
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const UpdateSurveyQuestion = async (id: string, payload: object) => {
  try {
    // ✅ Send payload directly
    const res = await API.put(
      `/api/merchendisher/survey-questions/${id}`,
      payload
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const companyTypeList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/company-types/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCompanyType = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/settings/company-types/update/${uuid}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deletecompanyType = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/settings/company-types/delete/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCompanyType = async (payload: object) => {
  try {
    const res = await API.post("/api/settings/company-types/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getComponyTypeById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/company-types/show/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Roles
export const roleList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/roles/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRoleById = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/roles/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type roletype = {
  name: string;
  labels: number[];
};

export const addRoles = async (payload: roletype) => {
  try {
    const res = await API.post("/api/settings/roles/add", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editRoles = async (id: string, payload: roletype) => {
  try {
    const res = await API.put(`/api/settings/roles/${id}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// assign permission to role
export const assignPermissionsToRole = async (
  roleId: string,
  rolePermissionData: object
) => {
  try {
    const res = await API.post(
      `/api/settings/roles/assign-permissions/${roleId}`,
      rolePermissionData
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteRole = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/roles/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const permissionList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/permissions/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const permissionListById = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/permissions/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const rolepermissionListById = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/roles/permissions/${id}`, {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type permissionType = {
  name: string;
};

export const addPermission = async (payload: permissionType) => {
  try {
    const res = await API.post("/api/settings/permissions/add", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePermission = async (id: string, payload: permissionType) => {
  try {
    const res = await API.put(`/api/settings/permissions/${id}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePermissions = async (id: string) => {
  try {
    const res = await API.delete(`/api/settings/permissions/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingHeaderList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/pricing-headers/list", {
      params: params,
    });
    return res.data;
    console.log(res);
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const addPricingHeader = async (payload: object) => {
  try {
    const res = await API.post("/api/master/pricing-headers/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingHeaderById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/pricing-headers/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editPricingHeader = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/master/pricing-headers/update/${uuid}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePricingHeader = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/master/pricing-headers/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingHeaderGenerateCode = async () => {
  try {
    const res = await API.get(`/api/master/pricing-headers/generate-code`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingHeaderGetItemPrice = async (params?: Params) => {
  try {
    const res = await API.post(`/api/master/pricing-headers/getItemPrice`, {}, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingDetailList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/pricing-details/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addPricingDetail = async (payload: object) => {
  try {
    const res = await API.post("/api/master/pricing-details/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingDetailById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/pricing-details/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editPricingDetail = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(`/api/master/pricing-details/${uuid}`, payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePricingDetail = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/master/pricing-details/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingDetailGenerateCode = async () => {
  try {
    const res = await API.get(`/api/master/pricing-details/generate-code`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const pricingDetailGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/pricing-details/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// menu APIs
export const menuList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/menus/list`, { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const menuByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/menus/${uuid}`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const menuGenerateCode = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/menus/generate-code`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const menuGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/menus/global-search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const userTypeGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/user-type/global-search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const roleGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/role/global-search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const permissionGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/permission/global-search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const companyTypeGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`//api/settings/company-types/list`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type menuType = {
  name: string;
  icon: string;
  url: string;
  display_order: number;
  is_visible: number;
  status: number;
};

export const addMenu = async (payload: menuType) => {
  try {
    const res = await API.post(`/api/settings/menus/add`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateMenu = async (uuid: string, payload: menuType) => {
  try {
    const res = await API.put(`/api/settings/menus/update/${uuid}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteMenu = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/settings/menus/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// sub menu APIs
export const submenuList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/submenu/list`, { params: params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const submenuByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/submenu/${uuid}`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const submenuGenerateCode = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/submenu/generate-code`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportRoutes = async (params?: Params) => {
  try {
    const res = await API.post(`/api/master/route/export`, { params });
    return res.data; 
  } catch (error: unknown) {
    handleError(error);
    return null;
  }
};

export const submenuGlobalSearch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/submenu/global_search`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type submenuType = {
  name: string;
  menu_id: number;
  parent_id: number | null;
  url: string;
  display_order: number;
  action_type: number;
  is_visible: number;
};

export const addSubmenu = async (payload: submenuType) => {
  try {
    const res = await API.post(`/api/settings/submenu/add`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateSubmenu = async (uuid: string, payload: submenuType) => {
  try {
    const res = await API.put(`/api/settings/submenu/${uuid}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteSubmenu = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/settings/submenu/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportWarehouseData = async (body: object) => {
  try {
    const res = await API.post(`/api/master/warehouse/export`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportRouteVisit = async (body: object) => {
  try {
    const res = await API.post(`/api/master/route-visits/export`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const warehouseStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(
      `/api/master/warehouse/multiple_status_update`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportAgentCustomerData = async (body: object) => {
  try {
    const res = await API.post(`/api/master/agent_customers/export`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentCustomerStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(
      `/api/master/agent_customers/bulk-update-status`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportCompanyCustomerData = async (body: object) => {
  try {
    const res = await API.post(`/api/master/companycustomer/export`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const companyCustomerStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(
      `/api/master/companycustomer/bulk-update-status`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportVehicleData = async (body: object) => {
  try {
    const res = await API.post(`/api/master/vehicle/export`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const vehicleStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(
      `/api/master/vehicle/multiple_status_update`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(`/api/master/route/bulk-update-status`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addAgentOrder = async (payload: object) => {
  try {
    const res = await API.post("/api/agent_transaction/orders/add", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editAgentOrder = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/agent_transaction/orders/update/${uuid}`,
      payload
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAgentOrderById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/orders/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const promotionHeaderList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/promotion-headers/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addPromotionHeader = async (payload: object) => {
  try {
    const res = await API.post("/api/master/promotion-headers/create", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const promotionHeaderById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/promotion-headers/show/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editPromotionHeader = async (id: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/master/promotion-headers/update/${id}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePromotionHeader = async (id: string) => {
  try {
    const res = await API.delete(`/api/master/promotion-headers/delete/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const promotionDetailList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/promotion-details/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addPromotionDetail = async (payload: object) => {
  try {
    const res = await API.post("/api/master/promotion-details/create", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const promotionDetailById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/master/promotion-details/show/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editPromotionDetail = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/master/promotion-details/update/${uuid}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePromotionDetail = async (uuid: string) => {
  try {
    const res = await API.delete(
      `/api/master/promotion-details/delete/${uuid}`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const labelList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/settings/labels/list`, { params });
    console.log(res, "Labels")
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const labelGenerateCode = async () => {
  try {
    const res = await API.get(`/api/settings/labels/generate-code`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const labelById = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/labels/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

type labelType = {
  name: string;
  status: string;
};

export const addLabel = async (payload: labelType) => {
  try {
    const res = await API.post(`/api/settings/labels/add`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editLabel = async (id: string, payload: labelType) => {
  try {
    const res = await API.put(`/api/settings/labels/${id}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Authentication User APIs
export const authUserList = async (params: Params) => {
  try {
    const res = await API.get(`/api/master/auth/getUserList`, params);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const registerAuthUser = async (body: object) => {
  try {
    const res = await API.post(`/api/master/auth/register`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateAuthUser = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/master/auth/updateUser/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addPayment = async (body?: FormData) => {
  try {
    const res = await APIFormData.post(
      "api/agent_transaction/advancepayments/create",
      body
    );
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePaymentById = async (uuid: string, body?: any) => {
  try {
    const res = await API.put(
      `api/agent_transaction/advancepayments/update/${uuid}`,
      body
    );
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getPaymentById = async (uuid: string) => {
  try {
    const res = await API.get(
      `api/agent_transaction/advancepayments/show/${uuid}`
    );
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const allPaymentList = async (body?: any) => {
  try {
    const res = await API.get("api/agent_transaction/advancepayments/list");
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getbankList = async (params?: any) => {
  try {
    const res = await API.get("/api/settings/banks/list", { params });
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getbankDetailbyId = async (uuid?: any) => {
  try {
    const res = await API.get(`/api/settings/banks/show/${uuid}`);
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateBankbyId = async (body: any, uuid?: any) => {
  try {
    const res = await API.put(`/api/settings/banks/update/${uuid}`, body);
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createBank = async (body: any, uuid?: any) => {
  try {
    const res = await API.post("/api/settings/banks/create", body);
    console.log(res);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getUserList = async (params?: Params) => {
  try {
    const res = await API.get("/api/master/auth/getUserList", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getUserByUuid = async (uuid?: string) => {
  try {
    const res = await API.get(`/api/master/auth/getUserbyUuid/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRouteInWarehouse = async (id?: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/warehouse/warehouseRoutes/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getStockOfWarehouse = async (id?: string, params?: Params) => {
  try {
    const res = await API.get(`/api/settings/warehouse-stocks/warehouseStockInfo/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getVehicleInWarehouse = async (id?: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/warehouseVehicles/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getSalesmanInWarehouse = async (id?: string, params?: Params) => {
  try {
    const res = await API.get(`/api/master/warehouse/warehouseSalesman/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerInWarehouse = async (id?: string,params?:Params) => {
  try {
    const res = await API.get(`api/master/warehouse/warehouseCustomer/${id}`,{params});
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const getwarehouseStock = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/warehouse-stocks/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addWarehouseStock = async (payload: labelType) => {
  try {
    const res = await API.post(`/api/settings/warehouse-stocks/add`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editWarehouseStock = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(`/api/settings/warehouse-stocks/${uuid}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouseStockById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/settings/warehouse-stocks/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAgentCusByRoute = async (id: string) => {
  try {
    const res = await API.get(`/api/master/agent_customers/route/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};



export const userEmailVerification = async (query: string) => {
  try {
    const res = await API.get(`/api/master/auth/checkEmail?query=${query}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const userListGlobalSearch = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/user/global-search", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const locationList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/locations/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};




export const addLocation = async (payload: object) => {
  try {
    const res = await API.post(`/api/settings/locations/add`, payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const LocationById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/settings/locations/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editLocation = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/settings/locations/update/${uuid}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// export const editWarehouseStock = async (uuid: string, payload: object) => {
//   try {
//     const res = await API.put(`/api/settings/warehouse-stocks/${uuid}`, payload);
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };

export const BrandList = async (params?: Params) => {
  try {
    const res = await API.get("/api/settings/brands/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};




export const addBrand = async (payload: object) => {
  try {
    const res = await API.post(`/api/settings/brands/add`, payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const BrandById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/settings/brands/show/${uuid}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editBrand = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(`/api/settings/brands/update/${uuid}`, payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};