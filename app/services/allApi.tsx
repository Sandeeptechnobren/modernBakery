// app/services/allApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const login = async (credentials: { email: string; password: string }) => {
  const res = await API.post("/api/master/auth/login", credentials);
  return res.data;
};

export const isVerify = async () => {
  const res = await API.get("/api/master/auth/me");
  return res.data;
};

export const companyList = async () => {
  const res = await API.get("/api/master/company/list_company");
  return res.data;
};

export const companyById = async (id: string) => {
  const res = await API.get(`/api/master/company/${id}`);
  return res.data;
};

export const updateCompany = async (id: string, data: object) => {
  const res = await API.put(`/api/master/company/${id}`, data);
  return res.data;
};

export const deleteCompany = async (id: string) => {
  const res = await API.delete(`/api/master/company/${id}`);
  return res.data;
};

export const logout = async () => {
  try{
    const res = await API.post("/api/master/auth/logout");
    return res.data;
  } catch (error) {
    console.log(error)
  }
};

export const addCompany = async (data: Record<string, string>) => {
  try {
    const res = await API.post("/api/master/company/add_company", data);
    return res.data;
  } catch (error) {
    console.error("Add company failed ❌", error);
    throw error;
  }
};


export const countryList = async (data: Record<string, string>) => {
  try {
    const res = await API.get("/api/master/country/list_country", data);
    return res.data;
  } catch (error) {
    console.error("Country List failed ❌", error);
    throw error;
  }
};

export const addCountry = async (payload:object) => {
    const res = await API.post("/api/master/country/add_country", payload);
    return res.data;
};

export const countryById = async (id: string) => {
  const res = await API.get(`/api/master/country/country/${id}`);
  return res.data;
};

export const editCountry = async (id:string,payload:object) => {
    const res = await API.put(`/api/master/country/update_country/${id}`,payload);
    return res.data;
};
export const deleteCountry = async (id:string) => {
    const res = await API.delete(`/api/master/country/${id}`);
    return res.data;
};

export const regionList = async () => {
    const res = await API.get("/api/master/region/list_region");
    return res.data;
};

export const routeList = async () => {
    const res = await API.get("/api/master/route/list_routes");
    return res.data;
};

export const warehouseList = async () => {
    const res = await API.get("/api/master/warehouse/list");
    return res.data;
};

export const routeType = async () => {
    const res = await API.get("/api/settings/route-type/list");
    return res.data;
};

export const getSubRegion = async () => {
    const res = await API.get("/api/master/area/areadropdown");
    return res.data;
};

export const getCompanyCustomers = async () => {
  const res = await API.get("/api/master/companycustomer/list");
  return res.data;
};

export const getCompanyCustomersType = async () => {
    const res = await API.get("/api/settings/customer-type/list");
    return res.data;
};

export const itemCategory = async () => {
    const res = await API.get("/api/settings/item_category/list");
    return res.data;
};

export const itemSubCategory = async () => {
    const res = await API.get("/api/settings/item-sub-category/list");
    return res.data;
};

export const channelList = async () => {
  const res = await API.get("/api/settings/outlet-channels/list");
  return res.data;
};

export const userTypes = async () => {
    const res = await API.get("/api/settings/user-type/list");
    return res.data;
};

export const getWarehouse = async () => {
  const res = await API.get("/api/master/warehouse/list");
  return res.data; // returns the full response object with status, code, message, data, pagination
};
export const warehouseType = async (type:number) => {
  const res = await API.get(`/api/master/warehouse/type/${type}`);
  return res.data; // returns the full response object with status, code, message, data, pagination
};


export const addWarehouse = async (body:object) => {
  const res = await API.post("/api/master/warehouse/create", body);
  return res.data;
};

export const deleteWarehouse = async (id:string) => {
  const res = await API.delete(`/api/master/warehouse/${id}`);
  return res.data;
}

export const addCustomerType = async (payload: Record<string, string>) => {
  try {
    const res = await API.post("/api/settings/customer-type/create", payload);
    return res.data;
  } catch (error) {
    console.error("Add Customer Type failed ❌", error);
    throw error;
  }
};

export const customerTypeList = async (params?: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/customer-type/list", { params });
    return res.data;
  } catch (error) {
    console.error("Customer Type List failed ❌", error);
    throw error;
  }
};


export const addRegion = async  (payload?: {regionName: string, countryId: number, status: number}) => {
  try {
    const res = await API.post("/api/master/region/add_region", { payload });
    return res.data;
  } catch (error) {
    console.error("Add Region failed ❌", error);
    throw error;
  }
};

export const listCountries = async () => {
  try {
    const res = await API.get("/api/master/country/list_country", { params: { page: "1", limit: "200" } });
    return res.data.data;
  } catch (error) {
    console.error("List Countries failed ❌", error);
    throw error;
  }
};
     



export const routeTypeList = async (params?: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/route-type/list", { params });
    return res.data;

  } catch (error) {
    console.error("Route Type List failed ❌", error);
    throw error;
  }
};

export const addRouteType = async (payload: Record<string, string | number>) => {
  try {
    const res = await API.post("/api/settings/route-type/create", payload);
    return res.data;
  } catch (error) {
    console.error("Add Route Type failed ❌", error);
    throw error;
  }
};

export const getWarehouseById = async (id: string) => {
  const res = await API.get(`/api/master/warehouse/${id}`);
  return res.data;
};

export const updateWarehouse = async (id: string, payload: object) => {
  const res = await API.put(`/api/master/warehouse/${id}`, payload);
  return res.data;
};