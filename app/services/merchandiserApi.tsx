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
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const planogramImageList = async (params: Params) => {
  try {
    const res = await API.get("/api/merchendisher/planogram-image/list", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const planogramImageById = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/planogram-image/show/${id}`, {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createPlanogramImage = async (body: FormData) => {
  try {
    const res = await APIFormData.post(
      "/api/merchendisher/planogram-image/create",
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePlanogramImage = async (id: number, body: FormData) => {
  try {
    const res = await APIFormData.post(
      `/api/merchendisher/planogram-image/update/${id}`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePlanogramImage = async (id: number) => {
  try {
    const res = await API.delete(
      `/api/merchendisher/planogram-image/delete/${id}`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// shelves
export const shelvesDropdown = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/shelves/dropdown", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const shelfList = async (body: object) => {
  try {
    const res = await API.post("/api/merchendisher/planogram/getshelf", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deletePlanogram = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/merchendisher/planogram/delete/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const shelvesList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/shelves/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const shelvesListById = async (id: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelves/${id}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const modelStockListBySelf = async (shelf_uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelve_item/list/${shelf_uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addModelStock = async (body: object) => {
  try {
    const res = await API.post(
      "/api/merchendisher/shelve_item/add",
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateModelStock = async (uuid: string, body: object) => {
  try {
    const res = await API.put(
      `/api/merchendisher/shelve_item/update/${uuid}`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteModelStock = async (uuid: string) => {
  try {
    const res = await API.delete(
      `/api/merchendisher/shelve_item/destroy/${uuid}`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const modelStockById = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelve_item/show/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const viewStockListBySelf = async (shelf_uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelve_item/viewstock-list/${shelf_uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const damageListBySelf = async (shelf_uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelve_item/damage-list/${shelf_uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const expiryListBySelf = async (shelf_uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/shelve_item/expiry-list/${shelf_uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// ✅ Update Planogram
export const updatePlanogram = async (id: string, body: PlanogramType) => {
  try {
    const res = await API.put(
      `/api/merchendisher/planogram/update/${id}`,
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const merchandiserList = async (params?: Params) => {
  try {
    const res = await API.get(
      "/api/merchendisher/planogram/merchendisher-list",
      { params: params }
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Accept multiple merchandiser IDs
export const getCustomersByMerchandisers = async (
  merchandiserIds: number[]
) => {
  try {
    const res = await API.get(`/api/merchendisher/customers`, {
      params: { merchandiser_ids: merchandiserIds.join(",") }, // send as comma-separated string
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export type shelvesType = {
  shelf_name: string;
  height: number;
  width: number;
  depth: number;
  valid_from?: string;
  valid_to?: string;
  customer_ids: Array<number>;
};
export const addShelves = async (body: shelvesType) => {
  try {
    const res = await API.post("/api/merchendisher/shelves/add", body);
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

export const complaintFeedbackByUUID = async (uuid: string) => {
  try {
    const res = await API.get(
      `/api/merchendisher/complaint-feedback/show/${uuid}`
    );

    return { data: res.data, error: false };
  } catch (error: unknown) {
    const handledError = handleError(error);
    return { data: handledError, error: true };
  }
};

export const updateShelfById = async (
  uuid: string,
  data: {
    shelf_name: string;
    height: number;
    width: number;
    depth: number;
    valid_from: string;
    valid_to: string;
    merchendiser_ids: number[];
    customer_ids: number[];
  }
) => {
  try {
    const res = await API.put(
      `/api/merchendisher/shelves/update/${uuid}`,
      data
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getShelfById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/merchendisher/shelves/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getCompititorById = async (uuid: string) => {
  try {
    const res = await API.get(
      `/api/merchendisher/competitor-info/show/${uuid}`
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const complaintFeedbackList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/complaint-feedback/list", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportShelveData = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/shelves/export", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportCompaignData = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/campagin-info/exportfile", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const campaignInformationList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/campagin-info/list", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const competitorList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/competitor-info/list", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updatePlanogramById = async (uuid: string, data: FormData) => {
  try {
    console.log(uuid)
    const res = await APIFormData.post(
      `/api/merchendisher/planogram/update/${uuid}`,
      data
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const getPlanogramById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/merchendisher/planogram/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export type PlanogramType = {
  name: string;
  valid_from?: string;
  valid_to?: string;
  merchendisher_id: number[]; // backend expects single integer
  customer_id: number[]; // backend expects single integer
};

// Define the type for the planogram payload
export type PlanogramPayload = {
  name: string;
  valid_from: string;
  valid_to: string;
  merchendisher_id: string[];
  customer_id: string[];
  shelf_id: string[];
  images: {
    [merchId: string]: {
      [custId: string]: Array<{
        shelf_id: string;
        image: string;
      }>;
    };
  };
};

// Update your addPlanogram function with proper typing
export const addPlanogram = async (body: FormData | PlanogramPayload) => {
  try {
    const res = await APIFormData.post(
      "/api/merchendisher/planogram/create",
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportCmplaintFeedback = async (params: { format: string }) => {
  try {
    const res = await API.get(
      "/api/merchendisher/complaint-feedback/exportfile",
      {
        params,
        responseType: "blob",
      }
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportPlanogram = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/planogram/export-file", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportCompetitor = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/competitor-info/exportfile", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const getPlanogramPost = async (planogram_uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/planogram-post/list/${planogram_uuid}`, {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const stockInStoreList = async (params?: Params) => {
  try {
    const res = await API.get("/api/merchendisher/stockinstore/list", {
      params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const stockInStoreById = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/merchendisher/stockinstore/show/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addStockInStore = async (body: object) => {
  try {
    const res = await APIFormData.post(
      "/api/merchendisher/stockinstore/create",
      body
    );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};