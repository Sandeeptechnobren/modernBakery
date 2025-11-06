import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./APIutils";

export const salesmanLoadHeaderList = async (params: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/load/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanLoadHeaderAdd = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/load/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanLoadHeaderById = async (uuid: string, params: object) => {
  try {
    const res = await API.get(`/api/agent_transaction/load/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanLoadHeaderUpdate = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/load/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Salesman Load Details

export const salesmanLoadDetailsList = async (params: Params) => {
  try {
    const res = await API.post(`/api/agent_transaction/load-detail/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanLoadDetailsById = async (uuid: string, params: object) => {
  try {
    const res = await API.get(`/api/agent_transaction/load-detail/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const newCustomerList = async (params?: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/new-customer/list", {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addApprovedCustomer = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/new-customer/add`, body);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};
export const exportNewCustomerData = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/new-customer/export`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const newCustomerStatusUpdate = async (body: object) => {
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

export const approveOrRejectCustomer = async (body: object) => {
  try {
    // correct endpoint for approve/reject
    const res = await API.post(`/api/agent_transaction/new-customer/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addNewtCustomer = async (payload: object) => {
  try {
    const res = await API.post("/api/agent_transaction/new-customer/add", payload);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const newCustomerById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/new-customer/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const editNewCustomer = async (uuid: string, payload: object) => {
  try {
    const res = await API.put(
      `/api/agent_transaction/new-customer/update/${uuid}`,
      payload
    );

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};