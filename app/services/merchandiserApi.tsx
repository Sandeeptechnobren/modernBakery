import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./allApi";
import axios from "axios";

export const APIFormData = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

APIFormData.interceptors.request.use(
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

export const planogramImageList = async (params: Params) => {
    try {
    const res = await API.get("/api/merchendisher/planogram-image/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const planogramImageById = async (id: string, params?: Params) => {
    try {
    const res = await API.get(`/api/merchendisher/planogram-image/show/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createPlanogramImage = async (body: FormData) => {
    try {
    const res = await APIFormData.post("/api/merchendisher/planogram-image/create", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePlanogramImage = async (id: number, body: FormData) => {
    try {
    const res = await APIFormData.post(`/api/merchendisher/planogram-image/update/${id}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePlanogramImage = async (id: number) => {
    try {
    const res = await API.delete(`/api/merchendisher/planogram-image/delete/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// shelves 
export const shelvesDropdown = async () => {
  try {
    const res = await API.get("/api/merchendisher/shelves/dropdown");
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const shelvesList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/shelves/list", {params});
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const shelvesListById = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelves/${id}`, {params});
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const getPlanogramById = async (id:string, params?:Params) => {
  try {
     const res = await API.get(`/api/merchendisher/planogram/show/${id}`,{params});
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export type shelvesType = {
  shelf_name: string;
  height: number;
  width: number;
  depth: number,
  valid_from?: string;
  valid_to?: string;
  customer_ids: Array<number>;
}
export const addShelves = async (body: shelvesType) => {
  try {
    const res = await API.post("/api/merchendisher/shelves/add", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const updateShelves = async (id: string, body: shelvesType) => {
  try {
    const res = await API.put(`/api/merchendisher/shelves/${id}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export type planogramType = {
  name: string;
  valid_from: string;
  valid_to: string;
  status: number;
};
export const addPlanogram = async (body: planogramType) => {
  try {
    const res = await API.post("/api/merchendisher/planogram/create", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const updatePlanogram = async (id: string,body: planogramType) => {
  try {
    // ✅ Send payload directly
    const res = await API.put(`/api/merchendisher/planogram/update/${id}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};




export const deleteShelves = async (id: string) => {
  try {
    const res = await API.delete(`/api/merchendisher/shelves/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};