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

// Delivery Hariss Transaction APIs
export const compensationReportList = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_invoice/filter`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const compensationReportExport = async (params?: Params) => {
  try {
    // available params - from_date, to_date, format
    const res = await API.get(`/api/hariss_transaction/ht_invoice/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Invoice Hariss Transaction APIs
export const invoiceBatch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_invoice/invoicebatch`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Return Hariss Transaction APIs
export const returnList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/show/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnBatchFetch = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/batchfetch`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnExportHeader = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnExportCollapse = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnWarehouseStockByCustomer = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/getwarehousestocks`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnCreate = async (body: object) => {
  try {
    const res = await API.post(`/api/hariss_transaction/ht_returns/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Temporary Return Hariss Transaction APIs
export const tempReturnList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/temp_returns/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const tempReturnByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/temp_returns/show/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// CAPs Hariss Transaction APIs
export const capsList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_caps/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_caps/show/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsCreate = async (params?: Params) => {
  try {
    const res = await API.post(`/api/hariss_transaction/ht_caps/create`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsExportHeader = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_caps/exportheader`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const capsExportCollapse = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_caps/exportcollapse`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};



//return view pdf
export const exportReturnViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_returns/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportOrderViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_orders/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportPurposeOrderViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/po_orders/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportDeliveryViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_delivery/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportInvoiceViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_invoice/pdfexport`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportCapsViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/ht_caps/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const exportTempReturnViewPdf = async (params?: Params) => {
  try {
    const res = await API.get(`/api/hariss_transaction/temp_returns/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getDirectCustomer = async (params?: Params) => {
  try {
    const res = await API.get(`/api/master/companycustomer/customers`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
