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
  import { newCustomerById,updateStatusNewCustomer} from "@/app/services/agentTransaction";
  import Financial from "./financial";
  import { b, q } from "framer-motion/client";
  import { sub } from "date-fns";
  import { stat } from "fs";
  export interface NewCustomerDetails {
    id?: number;
    customer_id?: number;
    uuid?: string;
    osa_code?: string;
    outlet_name?: string;
    name?: string;
    owner_name?: string;
    customer?: { id?: number; route_code?: string; route_name?: string };
    customertype?: { id?: number; route_code?: string; route_name?: string; name?: string; code?: string };
    route?: { id?: number; route_code?: string; route_name?: string; route_name_display?: string };
    outlet_channel?: { id?: number; outlet_channel_code?: string; outlet_channel?: string };
    category?: { id?: number; customer_category_code?: string; customer_category_name?: string };
    subcategory?: { id?: number; customer_category_id?: number;customer_sub_category_code?: string; customer_sub_category_name?: string  };
    getWarehouse?: { id?: number; warehouse_code?: string; warehouse_name?: string };
    get_warehouse?: { id?: number; warehouse_code?: string; warehouse_name?: string };
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
  const [hideActionMenu, setHideActionMenu] = useState(false);
  const [actionResult, setActionResult] = useState<"approved" | "rejected" | null>(null);
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();

    const params = useParams();
    let uuid: string = "";
    if (params.uuid) {
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
        customer_id: d.customer_id ?? undefined,
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
        creditday: typeof d.creditday === "number" ? d.creditday : (d.creditday ? Number(d.creditday) : 0),
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
            showSnackbar(res?.data?.message || "Unable to fetch Customer Approvals Details", "error");
            return;
          }
          const mapped = mapApiToItem(res.data);
          setItem(mapped);
        } catch (err) {
          if (mounted) {
            showSnackbar("Unable to fetch Customer Approvals Details", "error");
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

  // Ensure action icons remain hidden on revisit when already approved/rejected
  useEffect(() => {
    if (item?.approval_status === 1) {
      setHideActionMenu(true);
      // setActionResult("approved");
    } else if (item?.approval_status === 3) {
      setHideActionMenu(true);
      // setActionResult("rejected");
    } else {
      // pending or undefined
      setHideActionMenu(false);
      setActionResult(null);
    }
  }, [item?.approval_status]);

  const handleApproval = async (approval_status: number, reason?: string) => {
    if (!item) return;

    const uuid = item.uuid;
    if (!uuid) {
      showSnackbar("Missing customer UUID", "error");
      return;
    }
    try {
      setLoading(true);

  const payload: any = {
    uuid: uuid,
    approval_status: approval_status,
    customer_id: item.customer_id,
    status: item.status,
    name: item.name,
  // osa_code: item.osa_code,
    owner_name: item.owner_name || "Unknown Owner",

    outlet_channel_id: item.outlet_channel?.id,
    customer_type: item.customertype?.id,

    contact_no: item.contact_no,
    contact_no2: item.contact_no2,
    whatsapp_no: item.whatsapp_no,

    street: item.street,
    landmark: item.landmark,
    town: item.town,
    district: item.district,

    payment_type: item.payment_type,
    buyertype: item.buyertype,
    warehouse: item.get_warehouse?.id,
    route_id: item.route?.id,
    category_id: item.category?.id,
    subcategory_id: item.subcategory?.id,

    enable_promotion: item.enable_promotion,
    creditday: item.creditday || 0,
    credit_limit: item.credit_limit,

    is_cash: item.is_cash,
    vat_no: item.vat_no,

    latitude: item.latitude,
    longitude: item.longitude,
    qr_code: item.qr_code,
  };

      //  Add reject reason if needed
      if (approval_status === 3 && reason) {
        payload.reject_reason = reason;
      }

      //  ONE API for update + add
      const res = await updateStatusNewCustomer(payload);

      //  API returns error object?
      if (res?.error) {
        showSnackbar(res?.data?.message || "Failed to update approval", "error");
        // Restore menu on error so user can try again
        setHideActionMenu(false);
        setActionResult(null);
        return;
      }

      // ✅ Check response message for different scenarios
      const message = res?.message || "";
      
      // Check if customer already exists (contact number match)
      if (message.toLowerCase().includes("already exist") || message.toLowerCase().includes("contact") || res?.status === "exists") {
        showSnackbar("Customer already exist in Agent Customers!", "error");
        // Error case: keep the action menu available again
        setHideActionMenu(false);
        setActionResult(null);
        return;
      }

      // Success flows: show message, hide action menu, show status icon, and update local item state
      if (approval_status === 1) {
        showSnackbar("Customer approved & added to Agent Customer!", "success");
        setHideActionMenu(true);
        setActionResult("approved");
        setItem((prev) => (prev ? { ...prev, approval_status: 1 } : prev));
      } else if (approval_status === 3) {
        showSnackbar("Customer rejected!", "success");
        setHideActionMenu(true);
        setActionResult("rejected");
        setItem((prev) => (prev ? { ...prev, approval_status: 3, reject_reason: reason || prev.reject_reason } : prev));
      }
            
      router.push("/newCustomer");

      // Stay on the page after success so the new icon is visible
    } catch (err) {
      console.error(err);
      showSnackbar("Unexpected error", "error");
      // Restore menu on exception so user can try again
      setHideActionMenu(false);
      setActionResult(null);
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
            <h1 className="text-[20px] font-semibold text-[#181D27]">Approval Customers </h1>
          </div>
          {!hideActionMenu && (
            <div className="flex items-center gap-[10px] border border-[#D5D7DA] relative rounded-lg px-1 bg-[#FFFFFF] opacity-100">
              {/* 3-dot menu button */}
              <button onClick={() => setShowMenu((prev) => !prev)} className="p-[6px] rounded-full">
                <Icon icon="lucide:more-vertical" width={20} />
              </button>

              {/* dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-12 bg-[#FFFFFF] shadow-lg rounded-lg border border-gray-200 w-[160px] z-10">
                  <button
                    onClick={() => {
                      setHideActionMenu(true);
                      setShowMenu(false);
                      handleApproval(1);
                    }}
                    className="w-full text-left px-4 pb-2 pt-[10px] hover:bg-[#FAFAFA] leading-[20px] text-[#252B37] text-lg"
                  >
                    <div>
                      <Icon icon="material-symbols:order-approve" width={20} /> Approve
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setHideActionMenu(true);
                      setShowRejectPopup(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left text-[#252B37] px-4 py-[10px] font-inter  hover:bg-[#FAFAFA] text-lg leading-[20px]"
                  >
                    <div>
                      <Icon icon="fluent:text-change-reject-24-filled" width={20} /> Reject
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
          {hideActionMenu && actionResult === "approved" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
              <Icon icon="mdi:check-circle" width={20} />
              <span className="text-sm font-medium">Approved</span>
            </div>
          )}
          {hideActionMenu && actionResult === "rejected" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <Icon icon="mdi:close-circle" width={20} />
              <span className="text-sm font-medium">Rejected</span>
            </div>
          )}
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
            {/* {item?.approval_status} */}
            {item?.approval_status === 1 && (
  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
    Approved
  </span>
)}
{item?.approval_status === 2 && (
  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
    Pending
  </span>
)}
{item?.approval_status === 3 && (
  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
    Rejected
  </span>
)}

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
                <button
                  onClick={() => {
                    setShowRejectPopup(false);
                    setHideActionMenu(false);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(3, rejectReason)}
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
