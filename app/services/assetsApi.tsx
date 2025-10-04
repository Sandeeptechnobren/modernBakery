import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./allApi";

export const exportServiceTypes = async (params?: Params) => {
    try {
        const res = await API.get("/api/settings/service-types/export", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const serviceTypesList = async (params?: Params) => {
    try {
        const res = await API.get("/api/settings/service-types/list", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const getServiceTypesByUUID = async (uuid: string, params?: Params) => {
    try {
        const res = await API.get(`/api/settings/service-types/show/${uuid}`, { params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const serviceTypesGenerateCode = async (params?: Params) => {
    try {
        const res = await API.get("/api/settings/service-types/generate-code", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

type serviceTypes = {
    name: string;
    status: number;
}

export const addServiceTypes = async (body: serviceTypes) => {
    try {
        const res = await API.post("/api/settings/service-types/add", body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const updateServiceTypes = async (uuid: string, body: serviceTypes) => {
    try {
        const res = await API.put(`/api/settings/service-types/update/${uuid}`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const deleteServiceTypes = async (uuid: string) => {
    try {
        const res = await API.delete(`/api/settings/service-types/delete/${uuid}`);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

// Chiller
export const chillerList = async (params?: Params) => {
    try {
        const res = await API.get("/api/assets/chiller/list_chillers", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const chillerByUUID = async (uuid: string, params?: Params) => {
    try {
        const res = await API.get(`/api/assets/chiller/${uuid}`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const chillerGenerateCode = async (params?: Params) => {
    try {
        const res = await API.get(`/api/assets/chiller/generate-code`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

type chiller = {
  serial_number: string,
  asset_number: string,
  model_number: string,
  description: string,
  acquisition: string,
  vender_details: string[],
  manufacturer: string,
  country_id: number,
  type_name: string,
  sap_code: string,
  status: number,
  is_assign: number,
  customer_id: number,
  agreement_id: number,
  document_type: string,
  document_id: number
}

export const addChiller = async (body: chiller) => {
    try {
        const res = await API.post(`/api/assets/chiller/add_chiller`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};
export const updateChiller = async (uuid: string, body: chiller) => {
    try {
        const res = await API.put(`/api/assets/chiller/${uuid}`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};
export const deleteChiller = async (uuid: string) => {
    try {
        const res = await API.delete(`/api/assets/chiller/${uuid}`);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

// vendor
export const vendorList = async (params?: Params) => {
    try {
        const res = await API.get("/api/assets/vendor/list_vendors", { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};
export const vendorByUUID = async (uuid: string, params?: Params) => {
    try {
        const res = await API.get(`/api/assets/vendor/vendor/${uuid}`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};
export const vendorGenerateCode = async (params?: Params) => {
    try {
        const res = await API.get(`/api/assets/vendor/generate-code`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

type vendor = {
  name: string,
  address: string,
  contact: string,
  email: string,
  status: number
}

export const addVendor = async (body: vendor) => {
    try {
        const res = await API.post(`/api/assets/vendor/add_vendor`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const updateVendor = async (uuid: string, body: vendor) => {
    try {
        const res = await API.put(`/api/assets/vendor/update_vendor/${uuid}`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const deleteVendor = async (uuid: string) => {
    try {
        const res = await API.delete(`/api/assets/vendor/delete_vendor/${uuid}`);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

// chiller Request
export const chillerRequestList = async (params: Params) => {
    try {
        const res = await API.get(`/api/assets/chiller-request/list`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const chillerRequestByUUID = async (uuid: string, params?: Params) => {
    try {
        const res = await API.get(`/api/assets/chiller-request/${uuid}`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const chillerRequestGenerateCode = async (params: Params) => {
    try {
        const res = await API.get(`/api/assets/chiller-request/generate-code`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const chillerRequestGlobalSearch = async (params: Params) => {
    try {
        const res = await API.get(`/api/assets/chiller-request/global-search`, { params: params });
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

type chillerRequestType = {
  outlet_name: string,
  owner_name: string,
  contact_number: string,
  outlet_type: string,
  machine_number: string,
  asset_number: string,
  agent_id: number,
  salesman_id: number,
  route_id: number,
  status: number
}

export const addChillerRequest = async (body: chillerRequestType) => {
    try {
        const res = await API.post(`/api/assets/chiller-request/add`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const updateChillerRequest = async (uuid: string, body: chillerRequestType) => {
    try {
        const res = await API.put(`/api/assets/chiller-request/${uuid}`, body);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

export const deleteChillerRequest = async (uuid: string) => {
    try {
        const res = await API.delete(`/api/assets/chiller-request/${uuid}`);
        return res.data;
    } catch (error: unknown) {
        return handleError(error);
    }
};

