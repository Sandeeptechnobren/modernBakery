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

export const addCompany = async (payload: Record<string, string>) => {
  try {
    const res = await API.post("/api/master/company/add_company", payload);
    return res.data;
  } catch (error) {
    console.error("Add company failed ❌", error);
    throw error;
  }
};




export const countryList = async (params: Record<string, string>) => {
  try {
    const res = await API.get("/api/master/country/list_country", { params });
    return res.data;
  } catch (error) {
    console.error("Country List failed ❌", error);
    throw error;
  }
};


export const regionList = async () => {
  try {
    const res = await API.get("/api/master/region/list_region");
    return res.data;
  } catch (error) {
    console.error("Region List failed ❌", error);
    throw error;
  }
};
// export const addRegion = async (data: Record<string, any>) => {
//   try {
//     const res = await API.post("/api/master/region/add_region", data);
//     return res.data;
//   } catch (error) {
//     console.error("Add Region failed ❌", error);
//     throw error;
//   }
// };




const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTk5MzgyNy00M2UxLTczMGItOWE0ZC0wNTUyNzhmYmFkZGQiLCJqdGkiOiIxMTc0ZTI3ZTY0YWU3ZDQ4NWY5MzhkNTE4NzM3NmRhZTQ2NDU4YTcyOGNmNzA2MTFhYThmYWI5MjVmYmE4MzM3MTYwYWRiZWRmMDMxMzYyYiIsImlhdCI6MTc1ODAyMTM4MC4yNDIzMjEsIm5iZiI6MTc1ODAyMTM4MC4yNDIzMjMsImV4cCI6MTc4OTU1NzM4MC4yMzk1NDUsInN1YiI6IjIxIiwic2NvcGVzIjpbXX0.YXKx-D-k9c5zkCRlZFIE8DBWf-MpgOYF7yTj_N8iSo4y47FdZKmATMTZClnMyv4eh9VhBIccEZvqi2O0y9Vy3koKy55nXglrWJCg4Rr6gyyFniUoUQv-1G-E9D9PVaOlpOI4H29uT_Ym_H6plK04k1zEr4mj9xpZIptpGGb_GeIgKju4Vjnq2YvFTahVAG6RbfobP5-81KX59slMFAj_i-KXZHz-NDMh1XlHcXy7_rCv9z6UM52IIx-j7unSnUENGAgNXBOCF0-fT6yYbp6miNvpjNhxh_XczgGMYMk0MgzMobD9n7-YfnhDW2vfjhl4SP3k0e0m69JIMMkfG6QLTE5EaP3Na7W7uKJKdSG5XZLe2f1xJOF9dqnIxnwbUqWc4C2fj5oA2g4Ezt4b2j4h6eiQ45TiNYiL3dUjFrOhLkM4yXZX0Z6uKLAj8GYhmgMPHKAQZ7wkpmFk4MMMx81C-b3aYXVne52WqxunFQknLU7IqLO5aa4twwvyHs6_Yj4jj855JbNGYBqF1xBklNBm_XvTPnolUwX2TbBqZILPKBtoZ40WheDo1z0hZBNLf8lkH1z06B257i4_jb-reE_wHJrAVNQHv2dtHnWaV0I_8tyGBk1uRpJXeOm5pMwklmytynRBRWSaZHcUMNaJS3nIkiM3KVLRBm5ANGxjHUtn8aE";

// ✅ List all countries
export const listCountries = async () => {
  try {
    const res = await axios.get(
      "https://api.coreexl.com/osa_productionV2/public/api/master/country/list_country",
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    return res.data.status ? res.data.data : [];
  } catch (err) {
    console.error("Error fetching countries:", err);
    return [];
  }
};

// ✅ Add a new region
export const addRegion = async (regionName: string, countryId: string, status: number) => {
  try {
    const res = await axios.post(
      "https://api.coreexl.com/osa_productionV2/public/api/master/region/add_region",
      { region_name: regionName, country_id: countryId, status },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    return res.data;
  } catch (err) {
    console.error("Error adding region:", err);
    return { status: false };
  }
};

  // export const routeTypeList = async () => {
  //   try {
  //     const res = await API.get("/api/settings/route-type/list");
  //     return res.data;
  //   } catch (error) {
  //     console.error("Route Type failed ❌", error);
  //     throw error;
  //   }
  // };
export const routeTypeList = async () => {
  try {
    const res = await API.get("/api/settings/route-type/list");
    return res.data; // ✅ यही ठीक है
  } catch (error) {
    console.error("Route Type failed ❌", error);
    throw error;
  }
};
// Add a new route type
export const addRouteType = async (data: {
  route_type_code: string;
  route_type_name: string;
  status: number; // 1 = Active, 0 = Inactive
}) => {
  try {
    const res = await API.post("/api/settings/route-type/add", data);
    return res.data;
  } catch (err) {
    console.error("Add Route Type failed ❌", err);
    throw err;
  }
};





export const regionList = async (params: Record<string, string>) => {
  try {
    const res = await API.get("/api/master/region/list_region", { params }); 
    return res.data;
  } catch (error) {
    console.error("Region List failed ❌", error);
    throw error;
  }
};


export const subRegionList = async (params: Record<string, string>) => {
  try {
    const res = await API.get("/api/master/area/list_area", { params });
    return res.data;
  } catch (error) {
    console.error("Sub Region List failed ❌", error);
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


export const addCustomerType = async (payload: Record<string, string>) => {
  try {
    const res = await API.post("/api/settings/customer-type/create", payload);
    return res.data;
  } catch (error) {
    console.error("Add Customer Type failed ❌", error);
    throw error;
  }
};