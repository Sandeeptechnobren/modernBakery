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

export const exportSalesmanLoad = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/load/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportSalesmanLoadDownload = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/load/exportall`, { params });
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

export const salesmanLoadByUuid = async (uuid: string) => {
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

// export const exportNewCustomer = async () => {
//   try {
//     const res = await API.get(`/api/agent_transaction/new-customer/export`);
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };  

export const exportNewCustomer = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/new-customer/export`, { params });
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
// export const exportNewCustomerData = async (body: object) => {
//   try {
//     const res = await API.post(`/api/agent_transaction/new-customer/export`, body);
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };

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




export const newCustomerById = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/new-customer/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
// export const updateNewCustomer = async (uuid: string, data: object) => {
//   try {
//     const res = await API.put(`/api/agent_transaction/new-customer/update/${uuid}`, data);
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };
export const updateStatusNewCustomer = async (data: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/new-customer/add`, data);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


type SalesmanUnloadParams = {
  start_date?: string;
  end_date?: string;
  date?: string;
  region_id?: string;
  page?: string;
  per_page?: string;
  submit?: string;
  id?: string;
  salesman_id?: string;
};

export const salesmanUnloadList = async (params: SalesmanUnloadParams) => {
  try {
    const res = await API.get(`/api/agent_transaction/unload/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
export const salesmanUnloadData = async (id: number, params?: SalesmanUnloadParams) => {
  try {
    const res = await API.get(`/api/agent_transaction/unload/unload-data/${id}`, { params });
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

// Collections and Caps Collections both are different APIs
export const collectionList = async (params: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/collections/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// Collections and Caps Collections both are different APIs
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

export const capsCollectionStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/capscollection/updatestatus`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createCapsCollection = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/capscollection/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateCapsCollection = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/capscollection/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportCapsCollection = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/capscollection/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportCapsCollectionDetail = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/capscollection/exportcollapse`, { params });
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

export const exportInvoice = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/invoices/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportOrderInvoice = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/invoices/exportall`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportInvoiceWithDetails = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/invoices/exportall`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportInvoiceDetails = async (id?: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/invoices/${id}/exportheader`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};



export const invoiceStatusUpdate = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/invoices/updatestatus`, body);
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

export const agentDeliveryExport = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/agent-delivery/exportall`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createDelivery = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/agent-delivery/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateDelivery = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/agent_transaction/agent-delivery/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteDelivery = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/agent_transaction/agent-delivery/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createInvoice = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/invoices/create`, body);
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

export const agentOrderExport = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/orders/exportall`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// export const exportReturneWithDetails = async (params?:Params) => {
//   try {
//     const res = await API.get(`/api/agent_transaction/returns/exportall`,{params});
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };


export const agentReturnExport = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/exportcollapse`, { params });
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
    const res = await API.post(`/api/agent_transaction/returns/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnList = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnType = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/return_types`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const reasonList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/reson`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const returnByUuid = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportReturneWithDetails = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/exportall`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exchangeList = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/exchanges/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exchangeByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/exchanges/show/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addExchange = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/exchanges/create`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const deleteExchange = async (uuid: string) => {
  try {
    const res = await API.delete(`/api/agent_transaction/exchange/delete/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exchangeUpdateStatus = async (body: string) => {
  try {
    const res = await API.post(`/api/agent_transaction/exchanges/updatestatus`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

// export const exportExchangeData = async (body: string) => {
//   try {
//     const res = await API.post(`/api/agent_transaction/exchanges/export`, body);
//     return res.data;
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// };


export const exportExchangeData = async (params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/exchanges/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAgentCustomerBySalesId = async (uuid: string, params: Params) => {
  try {
    if (params.from_date) {
      const res = await API.get(`/api/agent_transaction/invoices/agent-customer/${uuid}?from_date=${params.to_date}&to_date=${params.from_date}`,);
      return res.data;

    }
    else {
      const res = await API.get(`/api/agent_transaction/invoices/agent-customer/${uuid}`);
      return res.data;


    }
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getAgentCustomerByReturnId = async (uuid: string, params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/agent-customer/${uuid}?from_date=${params.to_date}&to_date=${params.from_date}`,);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const agentCustomerReturnExport = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/returns/exportcustomer`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const advancePaymentExport = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/advancepayments/export`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const linkageList = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/salesman-warehouse-history/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const StockTransferTopOrders = async (id: string) => {
  try {
    const res = await API.get(`/api/settings/warehouse-stocks/stock-transfer/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addStockTransfer = async (body: object) => {
  try {
    const res = await API.post(`/api/settings/warehouse-stocks/transfer`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const StockTransferList = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/stock-transfer/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export type StockTransferData = {
  id: number;
  uuid: string;
  osa_code: string;
  region: {
    id: number;
    code: string;
    name: string;
  };
  area: {
    id: number;
    code: string;
    name: string;
  };
  warehouse: {
    id: number;
    code: string;
    name: string;
  };
  model_number: {
    id: number;
    code: string;
    name: string;
  };
  requestes_asset: number;
  available_stock: number;
  approved_qty: string | number;
  allocate_asset: string | number;
  status: number;
  comment_reject: string | null;
  created_at: string;
};

export const stockTransferByUUID = async (uuid: string, params?: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/stock-transfer/${uuid}`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const salesTeamRecontionOrders = async (id: string) => {
  try {
    const res = await API.get(`/api/master/warehouse/warehouseSalesman/${id}`);

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesTeamRecontionOrdersTop = async (body: any) => {
  try {
    const res = await API.get(`/api/agent_transaction/reconsile/get-data`, { params: body });

    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const addSalesTeamRecontionOrders = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/reconsile/add`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const blockSalesTeamRecontionOrders = async (body: object) => {
  try {
    const res = await API.post(`/api/agent_transaction/reconsile/salesman-block`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const salesTeamRecontionOrdersList = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/reconsile/list`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const salesTeamRecontionOrderByUuid = async (uuid: string) => {
  try {
    const res = await API.get(`/api/agent_transaction/reconsile/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const salesTeamTracking = async (params: Params) => {
  try {
    const res = await API.get(`/api/agent_transaction/salesteam-tracking/track`, { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
