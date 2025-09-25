// app/services/allApi.ts
import axios from "axios";
import { Params } from "next/dist/server/request/params";

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

function handleError(error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    console.error('API Error:', error.response.data);
    return { error: true, data: error.response.data };
  } else if (error instanceof Error) {
    console.error('Request Error:', error.message);
    return { error: true, data: { message: error.message } };
  } else {
    console.error('An unknown error occurred.');
    return { error: true, data: { message: 'An unknown error occurred.' } };
  }
}

export const login = async (credentials: { email: string; password: string }) => {
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

export const companyList = async () => {
  try {
    const res = await API.get(`/api/master/company/list_company`);
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
    const res = await API.put(`/api/master/company/company/${id}`, data);

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

export const addCompany = async (data:FormData | Record<string, string>) => {
  try {
    const res = await API.post("/api/master/company/add_company", data);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
  
};

export const deleteCompany = async (id:string) => {
    const res = await API.delete(`/api/master/company/company/${id}`);
    return res.data;
}


export const countryList = async (data: Record<string, string>) => {
  try {
     const res = await API.get("/api/master/country/list_country", data);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
  
};

export const addCountry = async (payload:object) => {
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

export const editCountry = async (id:string,payload:object) => {
  try {
           const res = await API.put(`/api/master/country/update_country/${id}`,payload);


    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteCountry = async (id:string) => {
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
    const res = await API.get("/api/settings/item_category/list", { params: params });
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

export const createItemCategory = async (category_name: string, status: 0 | 1) => {
  try {
    const res = await API.post(`/api/settings/item_category/create`, { category_name, status });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateItemCategory = async (category_id: number, category_name?: string | undefined, status?: 0 | 1 | undefined) => {
  const body = {
      ...(category_name && { category_name }),
      ...(status !== undefined && { status }),
      category_id
  };

  if (Object.keys(body).length === 0) {
      throw new Error("No data provided for update.");
  }

  try {
    const res = await API.put(`/api/settings/item_category/${category_id}`, body);
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
export const itemSubCategoryList = async () => {
  try {
    const res = await API.get("/api/settings/item-sub-category/list");
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


export const createItemSubCategory = async (category_id: number, sub_category_name: string, status: 0 | 1) => {
  try {
    const res = await API.post(`/api/settings/item-sub-category/create`, { category_id, sub_category_name, status });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateItemSubCategory = async (category_id: number, sub_category_id: number, sub_category_name: string, status: 0 | 1) => {
  try {
    const res = await API.put(`/api/settings/item-sub-category/${sub_category_id}/update`, { sub_category_name, status, category_id });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteItemSubCategory = async (sub_category_id: number) => {
  try {
    const res = await API.delete(`/api/settings/item-sub-category/${sub_category_id}/delete`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const regionList = async () => {
  try {
              const res = await API.get("/api/master/region/list_region");
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRegionById = async (id:string) => {
  try {
              const res = await API.get(`/api/master/region/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteRegion = async (id:string) => {
  try {
              const res = await API.delete(`/api/master/region/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const routeList = async () => {
  try {
    const res = await API.get("/api/master/route/list_routes");
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addRoutes = async (body:object) => {
  try {
           const res = await API.post("/api/master/route/add_routes",body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRouteById = async (id:string) => {
  try {
           const res = await API.get(`/api/master/route/routes/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateRoute = async (id:string,body:object) => {
  try {
            const res = await API.put(`/api/master/route/routes/${id}`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteRoute = async (id:string) => {
  try {
           const res = await API.delete(`/api/master/route/routes/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const warehouseList = async () => {
  try {
    const res = await API.get("/api/master/warehouse/list");

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

export const updateWarehouse = async (id: string, payload: object) => {
  try {
  const res = await API.put(`/api/master/warehouse/${id}`, payload);

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

export const updateWarehouseStatus = async (id: string,body:object) => {
  try {
  const res = await API.put(`/api/master/warehouse/${id}/status`,body);

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



export const routeType = async () => {
  try {
    const res = await API.get("/api/settings/route-type/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};



export const getSubRegion = async () => {
  try {
    const res = await API.get("/api/master/area/areadropdown");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const subRegionList = async () => {
    const res = await API.get("/api/master/area/list_area");
    return res.data;
}


export const getCompanyCustomers = async () => {
  try {
  const res = await API.get("/api/master/companycustomer/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addCompanyCustomers = async (body:object) => {
  try {
  const res = await API.post("/api/master/companycustomer/create",body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerById = async (id:string) => {
  try {
  const res = await API.get(`/api/master/companycustomer/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCompanyCustomer = async (id:string,body:object) => {
  try {
  const res = await API.put(`/api/master/companycustomer/${id}/update`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCompanyCustomer = async (id: string, body?: object) => {
  try {
    const res = await API.delete(`/api/master/companycustomer/delete/${id}`, { data: body ?? {} });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerByRegion = async (regionId:string) => {
  try {
  const res = await API.get(`/api/master/companycustomer/region/${regionId}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompanyCustomerByArea = async (areaId:string) => {
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

export const getCompanyCustomersType = async () => {
  try {
    const res = await API.get("/api/master/companycustomer/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemCategory = async () => {
  try {
    const res = await API.get("/api/settings/item_category/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const itemSubCategory = async () => {
  try {
    const res = await API.get("/api/settings/item-sub-category/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const channelList = async () => {
  try {
  const res = await API.get("/api/settings/outlet-channels/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const userTypes = async () => {
  try {
    const res = await API.get("/api/settings/user-type/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getWarehouse = async () => {
  try {
  const res = await API.get("/api/master/warehouse/list");

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const warehouseType = async (type:number) => {
  try {
         const res = await API.get(`/api/master/warehouse/type/${type}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const addWarehouse = async (body:object) => {
  try {
  const res = await API.post("/api/master/warehouse/create", body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteWarehouse = async (id:string) => {
  try {
  const res = await API.delete(`/api/master/warehouse/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
}

export const addCustomerType = async (payload: object) => {
  try {
    const res = await API.post("/api/settings/customer-type/create", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerTypeById = async (id:string) => {
  try {
    const res = await API.get(`/api/settings/customer-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCustomerType = async (id:string,body:object) => {
  try {
    const res = await API.put(`/api/settings/customer-type/${id}`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCustomerType = async (id:string) => {
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



export const getCustomerType = async () => {
  try {
    const res = await API.get(`/api/settings/customer-type/list`);
    return res.data;
  } catch (error) {
    console.error("Get Customer Type by ID failed ❌", error);
    throw error;
  }
};




type Payload = {
  region_name: string;
  country_id: number;
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
  country_id: number;
  status: number;
};

export const updateRegion = async (id: string, payload: ipdatePayload) => {
  try {
    // ✅ Send payload directly
    const res = await API.put(`/api/master/region/update_region/${id}`, payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const listCountries = async () => {
  try {
    const res = await API.get("/api/master/country/list_country", { params: { page: "1", limit: "200" } });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const routeTypeList = async (params?: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/route-type/list", { params });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addRouteType = async (payload: Record<string, string | number>) => {
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


export const updateRouteTypeById = async (id: string,payload:object) => {
  try {
    const res = await API.put(`/api/settings/route-type/${id}/update`,payload);

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

export const getArea = async () => {
  try {
    const res = await API.get(`/api/master/area/list_area`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addArea = async (body:object) => {
  try {
    const res = await API.post(`/api/master/area/add_area`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAreaById = async (id:string) => {
  try {
    const res = await API.get(`/api/master/area/area/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateAreaById = async (id:string,body:object) => {
  try {
    const res = await API.put(`/api/master/area/area/${id}`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteArea = async (id:string) => {
  try {
    const res = await API.delete(`/api/master/area/area/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerCategory = async () => {
  try {
    const res = await API.get(`/api/settings/customer-category/list`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCustomerCategoryById = async (id:string) => {
  try {
    const res = await API.get(`/api/settings/customer-category/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createCustomerCategory = async (body:object) => {
  try {
    const res = await API.post(`/api/settings/customer-category/create`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const cupdateCustomerCategory = async (body:object,id:string) => {
  try {
    const res = await API.put(`/api/settings/customer-category/${id}/update`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteCustomerCategory = async (id:string) => {
  try {
    const res = await API.delete(`/api/settings/customer-category/${id}/delete`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getItemCategory = async () => {
  try {
    const res = await API.get(`/api/settings/item-category/list`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getItemCategoryById = async (id:string) => {
  try {
    const res = await API.get(`/api/settings/item-category/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getOutletChannelById = async (id:string) => {
  try {
    const res = await API.get(`/api/settings/outlet-channels/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateOutletChannel = async (id:string,body:object) => {
  try {
    const res = await API.put(`/api/settings/outlet-channels/${id}`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteOutletChannel = async (id:string) => {
  try {
    const res = await API.delete(`/api/settings/outlet-channels/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addOutletChannel = async (body:object) => {
  try {
    const res = await API.post(`/api/settings/outlet-channels`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getUserTypeById = async (id:string) => {
  try {
    const res = await API.get(`/api/settings/user-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateUserType = async (id:string,body:object) => {
  try {
    const res = await API.put(`/api/settings/user-type/${id}`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteUserType = async (id:string) => {
  try {
    const res = await API.delete(`/api/settings/user-type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createUserType = async (body:object) => {
  try {
    const res = await API.post(`/api/settings/user-type/create`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};







export const customerCategoryList = async (params?: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/customer-category/list", { params }); 
    return res.data;
  } catch (error) {
    console.error("Customer Category List failed ❌", error);
    throw error;
  } 
};






export const addCustomerCategory = async (payload: Record<string, string | number>) => {
  try {
    const res = await API.post("/api/settings/customer-category/create", payload);
    return res.data;
  } catch (error) {
    console.error("Add Customer Category failed ❌", error);
    throw error;
  }
};

export const updateCustomerCategory = async (id: string, payload: Record<string, string | number>) => {
  try {
    const res = await API.put(`/api/settings/customer-category/${id}/update`, payload);
    return res.data;
  } catch (error) {
    console.error("Update Customer Category failed ❌", error);
    throw error;
  } 
};



export const userList = async (data: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/user-type/list", data);
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const addUser = async (payload:object) => {
    const res = await API.post("/api/settings/user-type/create", payload);

    return res.data;
};


export const editUser = async (id:string,payload:object) => {
    const res = await API.put(`/api/master/country/update_country/${id}`,payload);
    return res.data;
};


export const deleteUser = async (id:string) => {
    const res = await API.delete(`/api/settings/user-type/${id}`);
   
    
    return res.data;
};

export const getUserById = async (id:string) => {
    const res = await API.get(`/api/settings/user-type/${id}`);
    return res.data;
  
};


export const updateUser = async (id:string,payload:object) => {
    const res = await API.put(`/api/settings/user-type/${id}`,payload);
    return res.data;
};







// outlet channel APIs
export const outletChannelList = async (data: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/outlet-channels/list", data);
   
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};




export const deleteChannel = async (id:string) => {
  try {
       const res = await API.delete(`/api/settings/outlet-channels/${id}`);
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const getChannelById = async (id:string) => {
    const res = await API.get(`/api/settings/outlet-channels/${id}`);
    return res.data;
};


export const updateChannel = async (id:string,payload:object) => {
  try {
           const res = await API.put(`/api/settings/outlet-channels/${id}`,payload);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const getExpenseTypeList = async () => {
  try {
           const res = await API.get(`/api/settings/expense_type/list`);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const getExpenseTypeById = async (id:string) => {
  try {
           const res = await API.get(`/api/settings/expense_type/${id}`);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const addExpenseType = async (body:object) => {
  try {
           const res = await API.post(`/api/settings/expense_type/create`,body);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const updateExpenseType = async (id:string,body:object) => {
  try {
           const res = await API.put(`/api/settings/expense_type/${id}/update`,body);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};


export const deleteExpenseType = async (id:string) => {
  try {
           const res = await API.delete(`/api/settings/expense_type/${id}/delete`);

    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const salesmanTypeList = async (data: Record<string, string>) => {
  try {
    const res = await API.get("/api/settings/salesman_type/list", data);
   
    return res.data;
  } catch (error) {
    console.error("User List failed ❌", error);
    throw error;
  }
};

export const addSalesmanType = async (payload:object) => {
    const res = await API.post("/api/settings/salesman_type/create", payload);

    return res.data;
};

export const getSalesmanTypeById = async (id:string) => {
    const res = await API.get(`/api/settings/salesman_type/${id}`);
 
    return res.data;
  
};


export const updateSalesmanType = async (id:string,payload:object) => {
    const res = await API.put(`/api/settings/salesman_type/${id}/update`,payload);
 
    return res.data;
};

//{id}/delete


export const deleteSalesmanType = async (id:string) => {
    const res = await API.delete(`api/settings/salesman_type/${id}/delete`);
    return res.data;
};

export const vehicleList = async () => {
  try {
    const res = await API.get("/api/master/vehicle/list");
    return res.data;
} catch (error: unknown) {
    return handleError(error);
}
};

export const getDiscountTypeList = async () => {
  try {
           const res = await API.get(`/api/settings/discount_type/list`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getDiscountTypeById = async (id:string) => {
  try {
           const res = await API.get(`/api/settings/discount_type/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createDiscountType = async (body:object) => {
  try {
           const res = await API.post(`/api/settings/discount_type/create`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateDiscountType = async (id:string,body:object) => {
  try {
           const res = await API.put(`/api/settings/discount_type/${id}/update`,body);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteDiscountType = async (id:string) => {
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


export const updateVehicle = async (id: string, data: FormData | Record<string, string>) => {
  try {
    const res = await API.put(`/api/master/vehicle/${id}/update`, data);
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

export const getVehicleById = async (id: string) => {
  try {
    const res = await API.get(`/api/master/vehicle/${id}`);
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

export const addPromotionType = async (body: { code: string, name: string, status: number }) => {
  try {
    const res = await API.post(`/api/settings/promotion_type/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePromotionType = async (body: { code: string, name: string, status: number }, id: number) => {
  try {
    const res = await API.put(`/api/settings/promotion_type/${id}/update`, body);
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
export const getCustomerSubCategoryById = async (id: number) => {
  try {
    const res = await API.get(`/api/settings/customer-sub-category/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const updateCustomerSubCategory = async (id: string,body:object) => {
  try {
    const res = await API.put(`/api/settings/customer-sub-category/${id}/update`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const customerSubCategoryList = async () => {
  try {
    const res = await API.get(`/api/settings/customer-sub-category/list`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const deleteCustomerSubCategory = async (id:number) => {
  try {
    const res = await API.delete(`/api/settings/customer-sub-category/${id}/delete`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const addCustomerSubCategory = async (body:object) => {
  try {
    const res = await API.post(`/api/settings/customer-sub-category/create`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
