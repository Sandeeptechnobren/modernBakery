import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./APIutils";

export const purchaseOrderList = async (params?: Params) => {
  try {
    const res = await API.get("/api/hariss_transaction/po_orders/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/hariss_transaction/po_orders/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderAdd = async (body: object) => {
  try {
    const res = await API.get(`/api/hariss_transaction/po_orders/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderExportCollapse = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const purchaseOrderExportHeader = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Orders Hariss Transaction APIs
export const orderExportCollapse = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const orderExportHeader = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const orderList = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const orderListByUUID = async (uuid: string, params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_orders/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Invoice Hariss Transaction APIs 
export const invoiceList = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_invoice/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const invoiceListByUUID = async (uuid: string, params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_invoice/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const invoiceExportCollapse = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_invoice/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const invoiceExportHeader = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_invoice/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Delivery Hariss Transaction APIs
export const deliveryList = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_delivery/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deliveryListByUUID = async (uuid: string, params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_delivery/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deliveryExportCollapse = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_delivery/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deliveryExportHeader = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_delivery/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};