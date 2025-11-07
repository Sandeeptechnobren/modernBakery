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

export const salesmanLoadByUuid= async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/load/${uuid}`);
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
type SalesmanUnloadParams = {
  start_date?: string;
  end_date?: string;
  region_id?: string;
  page?: string;
  per_page?: string;
  submit?: string;
};

export const salesmanUnloadList = async (params: SalesmanUnloadParams) => {
  try {
    const res = await API.get(`/api/agent_transaction/unload/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanUnloadHeaderAdd = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/unload/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanUnloadHeaderById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/unload/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesmanUnloadHeaderUpdate = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/unload/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsCollectionList = async (params: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/capscollection/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsCollectionByUuid = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/capscollection/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsCollectionStatusUpdate = async (body:object) => {
  try {
    const res = await API.post(`/api/agent_transaction/capscollection/updatestatus`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createCapsCollection = async (body:object) => {
  try {
    const res = await API.post(`/api/agent_transaction/capscollection/create`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCapsCollection = async (uuid:string,body:object) => {
  try {
    const res = await API.put(`/api/agent_transaction/capscollection/update/${uuid}`,body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportCapsCollection = async () => {
  try {
    const res = await API.get(`/api/agent_transaction/capscollection/export`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const invoiceList = async (params: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/invoices/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const invoiceByUuid = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/invoices/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deliveryList = async (params: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/agent-delivery/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deliveryByUuid = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/agent-delivery/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createDelivery= async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/agent-delivery/add`,  body );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateDelivery= async (uuid:string,body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/agent-delivery/update/${uuid}`,  body );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteDelivery= async (uuid:string) => {
  try {
    const res = await API.delete(`/api/agent_transaction/agent-delivery/${uuid}` );
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createInvoice = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/invoices/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateInvoice = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/invoices/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


// Agent Customer Order
export const agentOrderList = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/orders/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentOrderByUUID = async (uuid: string, params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/orders/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteAgentOrder = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/agent_transaction/orders/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addAgentOrder = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/orders/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateAgentOrder = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/orders/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const agentOrderStatistics = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/orders/statistics`, params);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const changeStatusAgentOrder = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/orders/update-status`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createReturn = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/retuns/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};