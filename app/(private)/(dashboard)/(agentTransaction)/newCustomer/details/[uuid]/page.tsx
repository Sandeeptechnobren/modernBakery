"use client";

import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import Overview from "./overview";
import Additional from "./additional";
import Location from "./location";
import TabBtn from "@/app/components/tabBtn";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { newCustomerById, approveOrRejectCustomer, addApprovedCustomer } from "@/app/services/agentTransaction";
import Financial from "./financial";

/**
 * Normalized interface that matches what the UI expects after mapping.
 * Many fields are optional because API sometimes omits them.
 */
export interface NewCustomerDetails {
  id?: number;
  uuid?: string;
  osa_code?: string;
  outlet_name?: string;
  name?: string; // sometimes API uses name / outlet_name
  owner_name?: string;

  // original API nested objects (IDs + codes + names)
  customer?: { id?: number; route_code?: string; route_name?: string };
  customertype?: { id?: number; route_code?: string; route_name?: string; name?: string; code?: string };
  route?: { id?: number; route_code?: string; route_name?: string; route_name_display?: string };
  outlet_channel?: { id?: number; outlet_channel_code?: string; outlet_channel?: string };
  category?: { id?: number; customer_category_code?: string; customer_category_name?: string };
  subcategory?: { id?: number; customer_category_id?: number; customer_sub_category_name?: string; customer_sub_category_code?: string };
  getWarehouse?: { id?: number; warehouse_code?: string; warehouse_name?: string };
  get_warehouse?: { id?: number; warehouse_code?: string; warehouse_name?: string };

  // address & contact
  landmark?: string;
  district?: string;
  street?: string;
  town?: string;
  whatsapp_no?: string;
  contact_no?: string;
  contact_no2?: string;

  // other fields
  payment_type?: string | number;
  buyertype?: number;
  warehouse?: string | number;
  route_id?: number;
  category_id?: number;
  subcategory_id?: number;

  enable_promotion?: string;
  creditday?: number;
  credit_limit?: string | null;

  latitude?: string;
  longitude?: string;

  is_cash?: number;
  status?: number;
  vat_no?: string;
  qr_code?: string;
  approval_status?: number;
  reject_reason?: string;
}

/* Tabs */
const tabs = ["Overview"];

export default function CustomerDetails() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  const params = useParams();
  let uuid: string = "";
  if (params?.uuid) {
    uuid = Array.isArray(params.uuid) ? params.uuid[0] : (params.uuid as string);
  }

  const [item, setItem] = useState<NewCustomerDetails | null>(null);

  /**
   * mapApiToItem
   * - Normalize API response so UI can always read the same fields.
   * - Keep both raw ids and derived friendly names (e.g., customertype.name).
   */
  const mapApiToItem = (d: any): NewCustomerDetails => {
    if (!d) return d;

    // pick warehouse either from getWarehouse or get_warehouse (APIs differ)
    const warehouseRaw = d.getWarehouse ?? d.get_warehouse ?? d.get_warehouse;

    return {
      // top-level
      id: d.id ?? d.customer_id ?? undefined,
      uuid: d.uuid ?? undefined,
      osa_code: d.osa_code ?? undefined,
      // name/outlet_name: API sometimes uses outlet_name, sometimes name
      outlet_name: d.outlet_name ?? d.name ?? undefined,
      name: d.name ?? d.outlet_name ?? undefined,
      owner_name: d.owner_name ?? undefined,

      // nested objects - keep raw ids & names
      customer: {
        id: d.customer?.id ?? undefined,
        route_code: d.customer?.route_code ?? undefined,
        route_name: d.customer?.route_name ?? undefined,
      },

      customertype: {
        id: d.customertype?.id ?? undefined,
        route_code: d.customertype?.route_code ?? d.customertype?.code ?? undefined,
        route_name: d.customertype?.route_name ?? d.customertype?.name ?? undefined,
        // also provide convenience fields used by UI
        name: d.customertype?.route_name ?? d.customertype?.name ?? undefined,
        code: d.customertype?.route_code ?? d.customertype?.code ?? undefined,
      },

      route: {
        id: d.route?.id ?? undefined,
        route_code: d.route?.route_code ?? undefined,
        route_name: d.route?.route_name ?? undefined,
        route_name_display: d.route?.route_name ?? undefined,
      },

      outlet_channel: {
        id: d.outlet_channel?.id ?? undefined,
        outlet_channel_code: d.outlet_channel?.outlet_channel_code ?? undefined,
        outlet_channel: d.outlet_channel?.outlet_channel ?? undefined,
      },

      category: {
        id: d.category?.id ?? undefined,
        customer_category_code: d.category?.customer_category_code ?? undefined,
        customer_category_name: d.category?.customer_category_name ?? undefined,
      },

      subcategory: {
        id: d.subcategory?.id ?? undefined,
        customer_category_id: d.subcategory?.customer_category_id ?? undefined,
        customer_sub_category_name: d.subcategory?.customer_sub_category_name ?? d.subcategory?.customer_sub_category_name ?? undefined,
        customer_sub_category_code: d.subcategory?.customer_sub_category_code ?? undefined,
      },

      getWarehouse: {
        id: warehouseRaw?.id ?? undefined,
        warehouse_code: warehouseRaw?.warehouse_code ?? undefined,
        warehouse_name: warehouseRaw?.warehouse_name ?? undefined,
      },

      get_warehouse: {
        id: warehouseRaw?.id ?? undefined,
        warehouse_code: warehouseRaw?.warehouse_code ?? undefined,
        warehouse_name: warehouseRaw?.warehouse_name ?? undefined,
      },

      // address/contact
      landmark: d.landmark ?? undefined,
      district: d.district ?? undefined,
      street: d.street ?? undefined,
      town: d.town ?? undefined,
      whatsapp_no: d.whatsapp_no ?? undefined,
      contact_no: d.contact_no ?? undefined,
      contact_no2: d.contact_no2 ?? undefined,

      // other raw fields
      payment_type: d.payment_type ?? undefined,
      buyertype: d.buyertype ?? undefined,
      warehouse: d.warehouse ?? undefined,
      route_id: d.route_id ?? d.route?.id ?? undefined,
      category_id: d.category_id ?? d.category?.id ?? d.category?.id ?? undefined,
      subcategory_id: d.subcategory_id ?? d.subcategory?.id ?? undefined,

      enable_promotion: d.enable_promotion ?? undefined,
      creditday: typeof d.creditday === "number" ? d.creditday : Number(d.creditday ?? 0),
      credit_limit: d.credit_limit ?? null,

      latitude: d.latitude ?? undefined,
      longitude: d.longitude ?? undefined,

      is_cash: d.is_cash ?? undefined,
      status: d.status ?? undefined,
      vat_no: d.vat_no ?? undefined,
      qr_code: d.qr_code ?? undefined,
      approval_status: d.approval_status ?? undefined,
      reject_reason: d.reject_reason ?? undefined,
    };
  };

  useEffect(() => {
    if (!uuid) return;
    let mounted = true;
    const fetchCustomerDetails = async () => {
      setLoading(true);
      try {
        const res = await newCustomerById(uuid);
        if (!mounted) return;
        if (res?.error) {
          showSnackbar(res?.data?.message || "Unable to fetch New Customer Details", "error");
          return;
        }
        const mapped = mapApiToItem(res.data);
        setItem(mapped);
      } catch (err) {
        if (mounted) {
          showSnackbar("Unable to fetch New Customer Details", "error");
          console.error(err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCustomerDetails();
    return () => {
      mounted = false;
    };
  }, [uuid]);

  /**
   * handleApproval
   * - Builds payload using IDs (not codes)
   * - Calls approveOrRejectCustomer(payload)
   * - If approved, calls addApprovedCustomer with safe fields
   */
const handleApproval = async (status: number, reason?: string) => {
  if (!item) return;

  try {
    setLoading(true);

    // ✅ Check if backend already created the customer
    if (item?.approval_status === 1 || item?.status === 1) {
     showSnackbar("Customer already exists — no approval needed.", "error");
      setLoading(false);
      return;
    }

    // ✅ MAIN APPROVAL PAYLOAD (IDs only)
    const approvalPayload: any = {
      customer_id: item.uuid,   // ✅ Approval API uses UUID
      ids: [item.uuid],
      approval_status: status,

      category_id: item.category?.id,
      subcategory_id: item.subcategory?.id,
      customer_type: item.customertype?.id,
      route_id: item.route?.id,
      outlet_channel_id: item.outlet_channel?.id,
      warehouse: item.getWarehouse?.id,

      name: item.outlet_name ?? item.name ?? "",
      owner_name: item.owner_name ?? "",

      contact_no: item.contact_no ?? "",
      contact_no2: item.contact_no2 ?? "",
      whatsapp_no: item.whatsapp_no ?? "",

      street: item.street ?? "",
      landmark: item.landmark ?? "",
      town: item.town ?? "",
      district: item.district ?? "",

      payment_type: item.payment_type ?? "",
      buyertype: item.buyertype ?? 0,
      enable_promotion: item.enable_promotion ?? "1",
      creditday: item.creditday ?? 0,
      credit_limit: item.credit_limit ?? "",

      is_cash: item.is_cash ?? 1,
      vat_no: item.vat_no ?? "",

      latitude: item.latitude ?? "",
      longitude: item.longitude ?? "",
      qr_code: item.qr_code ?? "",
    };

    if (reason) approvalPayload.reject_reason = reason;

    // ✅ Send Approval
    const res = await approveOrRejectCustomer(approvalPayload);

    if (res?.error) {
      showSnackbar(res?.data?.message || "Failed to approve", "error");
      setLoading(false);
      return;
    }

    // ✅ STOP HERE IF REJECTED — NO ADD API CALL
    if (status === 2) {
      showSnackbar("Customer rejected successfully!", "success");
      return router.push("/agent_transaction/new-customer");
    }

    // ✅ ADD CUSTOMER PAYLOAD
    // ✅ Add API uses numeric ID, not UUID
    const addPayload: any = {
      approval_status: 1,
      customer_id: item.id, // ✅ numeric ID

      // required
      osa_code: item.osa_code,
      name: item.outlet_name ?? item.name,
      owner_name: item.owner_name,

      outlet_channel_id: item.outlet_channel?.id,
      customer_type: item.customertype?.id,
      warehouse: item.getWarehouse?.id,
      route_id: item.route?.id,
      category_id: item.category?.id,
      subcategory_id: item.subcategory?.id,

      contact_no: item.contact_no,
      contact_no2: item.contact_no2,
      whatsapp_no: item.whatsapp_no,

      street: item.street,
      landmark: item.landmark,
      town: item.town,
      district: item.district,

      payment_type: item.payment_type,
      buyertype: item.buyertype,
      enable_promotion: item.enable_promotion,
      creditday: item.creditday,
      credit_limit: item.credit_limit,

      status: 1,
      is_cash: item.is_cash,
      vat_no: item.vat_no,
      latitude: item.latitude,
      longitude: item.longitude,
      qr_code: item.qr_code,
    };

    // ✅ Add approved customer
    const addRes = await addApprovedCustomer(addPayload);

    if (addRes?.error) {
      showSnackbar(addRes?.data?.message || "Unable to add agent table", "error");
      setLoading(false);
      return;
    }

    showSnackbar("✅ Customer approved and added to Agent Customer table!", "success");
    router.push("/agent_transaction/new-customer");

  } catch (e) {
    console.error(e);
    showSnackbar("Unexpected error during approval", "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      {/* header */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon icon="lucide:arrow-left" width={24} onClick={() => router.back()} />
          <h1 className="text-[20px] font-semibold text-[#181D27]">New Customer Details</h1>
        </div>
        <div className="flex items-center gap-[10px] border border-[#D5D7DA] relative rounded-lg px-1 bg-[#FFFFFF] opacity-100">
          {/* 3-dot menu button */}
          <button onClick={() => setShowMenu((prev) => !prev)} className="p-2 rounded-full">
            <Icon icon="lucide:more-vertical" width={22} />
          </button>

          {/* dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-12 bg-[#FFFFFF] shadow-lg rounded-lg border border-gray-200 w-[226px] z-10">
              <button onClick={() => handleApproval(1)} className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-700">
                ✅ Approve
              </button>
              <button
                onClick={() => {
                  setShowRejectPopup(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-700"
              >
                ❌ Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0 relative">
        {/* profile details */}
        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
          <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
            <Icon icon="gridicons:user" width={40} className="text-[#535862] scale-[1.5]" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {item?.osa_code ?? ""} - {item?.outlet_name ?? item?.name ?? "Customer Name"}
            </h2>
            <span className="flex items-center text-[#414651] text-[16px]">
              <Icon icon="mdi:location" width={16} className="text-[#EA0A2A] mr-[5px]" />
              <span>{item?.district ?? "-"}</span>
            </span>
          </div>
        </div>

        {/* right side buttons */}
        <div className="flex items-center gap-[10px] relative">
          <StatusBtn isActive={!!item?.status} />
        </div>
      </ContainerCard>

      {/* Tabs */}
      <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabs.map((tab, index) => (
          <div key={index}>
            <TabBtn label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
          </div>
        ))}
      </ContainerCard>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[10px]">
          <Overview data={item} />
          <Financial data={item} />
          <Additional data={item} />
          <Location data={item} />
        </div>
      )}

      {/* Reject Reason Popup */}
      {showRejectPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Enter Reject Reason</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRejectPopup(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={() => handleApproval(2, rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
