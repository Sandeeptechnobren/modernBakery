"use client";

import ContainerCard from "@/app/components/containerCard";
import Table, { TableDataType } from "@/app/components/customTable";
import Logo from "@/app/components/logo";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  RefObject,
  useMemo,
} from "react";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  approveWorkflow,
  authUserList,
  downloadFile,
  editBeforeApprovalWorkflow,
  getAgentOrderById,
  rejectWorkflow,
  returnBackWorkflow,
} from "@/app/services/allApi";
import KeyValueData from "@/app/components/keyValueData";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import PrintButton from "@/app/components/printButton";
import { agentOrderExport } from "@/app/services/agentTransaction";
import BorderIconButton from "@/app/components/borderIconButton";
import { formatWithPattern } from "@/app/(private)/utils/date";
import Button from "@mui/material/Button";
import InputFields from "@/app/components/inputFields";
import { camelToTitleCase } from "@/app/(private)/utils/text";

const columns = [
  { key: "index", label: "#" },
  {
    key: "item_name",
    label: "Item Name",
    render: (value: TableDataType) => (
      <>
        {value.erp_code ? `${value.erp_code}` : ""}{" "}
        {value.erp_code && value.item_name ? " - " : ""}{" "}
        {value.item_name ? value.item_name : ""}
      </>
    ),
  },
  { key: "uom_name", label: "UOM" },
  { key: "quantity", label: "Quantity" },
  {
    key: "item_price",
    label: "Price",
    render: (value: TableDataType) => (
      <>{toInternationalNumber(value.item_price) || "0.00"}</>
    ),
  },
  {
    key: "net_total",
    label: "Net",
    render: (value: TableDataType) => (
      <>{toInternationalNumber(value.net_total) || "0.00"}</>
    ),
  },
  {
    key: "vat",
    label: "VAT",
    render: (value: TableDataType) => (
      <>{toInternationalNumber(value.vat) || "0.00"}</>
    ),
  },
  // { key: "preVat", label: "Pre VAT", render: (value: TableDataType) => <>{toInternationalNumber(Number(value.total) - Number(value.vat)) || '0.00'}</> },
  // { key: "discount", label: "Discount", render: (value: TableDataType) => <>{toInternationalNumber(value.discount) || '0.00'}</> },
  // { key: "total_gross", label: "Gross", render: (value: TableDataType) => <>{toInternationalNumber(value.total_gross) || '0.00'}</> },
  {
    key: "total",
    label: "Total",
    render: (value: TableDataType) => (
      <>{toInternationalNumber(value.total) || "0.00"}</>
    ),
  },
];

interface OrderData {
  id: number;
  uuid: string;
  order_code: string;
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
  warehouse_address: string;
  warehouse_number: string;
  warehouse_email: string;
  customer_id: number;
  customer_code: string;
  customer_name: string;
  customer_email: string;
  customer_contact: string;
  customer_street: string;
  customer_town: string;
  delivery_date: string;
  comment: string;
  created_at: string;
  order_source: string;
  request_Step_id: number;
  payment_method: string;
  status: string;
  previous_uuid?: string;
  next_uuid?: string;
  details: [
    {
      id: number;
      uuid: string;
      header_id: number;
      order_code: string;
      item_id: number;
      item_code: string;
      item_name: string;
      erp_code?: string;
      uom_id: number;
      uom_name: string;
      item_price: number;
      quantity: number;
      vat: number;
      discount: number;
      gross_total: number;
      net_total: number;
      total: number;
    }
  ];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoadingState] = useState<boolean>(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [approvalName, setApprovalName] = useState("");
  const params = useParams();
  const UUID = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const CURRENCY = localStorage.getItem("country") || "";
  const PATH = `/distributorsOrder/details/`;

  const fetchOrder = async () => {
    setLoading(true);
    const listRes = await getAgentOrderById(UUID || "");
    if (listRes.error) {
      showSnackbar(
        listRes.error.message || "Failed to fetch order details",
        "error"
      );
      setLoading(false);
      throw new Error(listRes.error.message);
    } else {
      setData(listRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [UUID]);

  const grossTotal =
    data?.details?.reduce((sum, item) => sum + Number(item.total || 0), 0) ?? 0;
  const totalVat =
    data?.details?.reduce((sum, item) => sum + Number(item.vat || 0), 0) ?? 0;
  const netAmount =
    data?.details?.reduce(
      (sum, item) => sum + Number(item.net_total || 0),
      0
    ) ?? 0;
  const preVat = totalVat ? grossTotal - totalVat : grossTotal;
  const discount =
    data?.details?.reduce((sum, item) => sum + Number(item.discount || 0), 0) ??
    0;
  const finalTotal = netAmount + totalVat;

  const keyValueData = [
    {
      key: "Net Total",
      value: CURRENCY + " " + toInternationalNumber(Number(netAmount) || 0),
    },
    // { key: "Gross Total", value: "AED "+toInternationalNumber( grossTotal ?? 0 ) },
    // { key: "Discount", value: "AED "+toInternationalNumber( discount ?? 0 ) },
    // { key: "Excise", value: "AED 0.00" },
    {
      key: "Vat",
      value: CURRENCY + " " + toInternationalNumber(Number(totalVat) || 0),
    },
    // { key: "Pre VAT", value: CURRENCY + " " + toInternationalNumber(preVat ?? 0) },
    // { key: "Delivery Charges", value: "AED 0.00" },
  ];

  const exportFile = async () => {
    try {
      setLoadingState(true);
      const response = await agentOrderExport({ uuid: UUID, format: "pdf" });
      if (response && typeof response === "object" && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
    } finally {
      setLoadingState(false);
    }
  };

  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);
  const [comment, setComment] = useState<{
    show: boolean;
    text: string;
    new_user_id?: string;
    action?: string;
    errors?: Record<string, string>;
  }>({
    show: false,
    text: "",
    new_user_id: "",
    action: "",
    errors: {},
  });
  const commentRef = useRef<{
    show: boolean;
    text: string;
    new_user_id?: string;
    action?: string;
  }>({ show: false, text: "", new_user_id: "", action: "" });

  useEffect(() => {
    commentRef.current = comment;
  }, [comment]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authUserList({});
        const usersData = (res?.data ?? []).map((user: any) => ({
          value: String(user.id),
          label: user.name,
        }));
        setUserOptions(usersData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const getCommentPrompt = (abortSignal?: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      const check = () => {
        // Check if the operation was aborted
        if (abortSignal?.aborted) {
          reject(new DOMException("Operation was aborted", "AbortError"));
          return;
        }

        if (!commentRef.current.show) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      setTimeout(check, 50);
    });
  };

  const [loadingWorkflow, setLoadingWorkflow] = useState<{
    approve: boolean;
    reject: boolean;
    returnBack: boolean;
    editBeforeApproval: boolean;
  }>({
    approve: false,
    reject: false,
    returnBack: false,
    editBeforeApproval: false,
  });
  const currentActionRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const rawOrder = localStorage.getItem("workflow.order");
  const order: { 
    request_id: number; 
    permissions: string[];
    message?: string;
    notification?: string;
    confirmationMessage?: string;
    step_title?: string;
  } =
    rawOrder && rawOrder !== "undefined"
      ? JSON.parse(rawOrder)
      : {};

  const workflowAction = async (action: string) => {
    // Prevent double-clicking the same action
    if (loadingWorkflow[action as keyof typeof loadingWorkflow]) {
      return;
    }

    // Allow switching between actions if only showing comment prompt
    // But prevent switching during actual API execution
    const isApiInProgress =
      Object.values(loadingWorkflow).some((loading) => loading) &&
      !comment.show;
    if (isApiInProgress && currentActionRef.current !== action) {
      showSnackbar("Please wait for the current action to complete", "warning");
      return;
    }

    // Cancel any existing workflow action if switching
    if (abortControllerRef.current && currentActionRef.current !== action) {
      abortControllerRef.current.abort();

      // Clear the previous action's loading state
      if (currentActionRef.current) {
        setLoadingWorkflow((prev) => ({
          ...prev,
          [currentActionRef.current!]: false,
        }));
      }
    }

    // Set current action and create new AbortController
    currentActionRef.current = action;
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    // Set loading state immediately to prevent double-clicks
    setLoadingWorkflow((prev) => ({ ...prev, [action]: true }));

    // If comment is already shown for a different action, close it and start fresh
    if (comment.show && comment.action !== action) {
      setComment({ show: false, text: "", new_user_id: "", action: "" });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if this action was cancelled while waiting
      if (
        currentAbortController.signal.aborted ||
        currentActionRef.current !== action
      ) {
        setLoadingWorkflow((prev) => ({ ...prev, [action]: false }));
        return;
      }
    }

    const requireCommentActions = [
      "reject",
      "returnBack",
    ];
    if (requireCommentActions.includes(action)) {
      setComment({ show: true, text: "", new_user_id: "", action });
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if cancelled before showing prompt
      if (
        currentAbortController.signal.aborted ||
        currentActionRef.current !== action
      ) {
        setComment({ show: false, text: "", new_user_id: "", action: "" });
        return;
      }

      try {
        await getCommentPrompt(currentAbortController.signal);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setComment({ show: false, text: "", new_user_id: "", action: "" });
          return;
        }
        throw error;
      }

      // Final check before proceeding with API call
      if (
        currentAbortController.signal.aborted ||
        currentActionRef.current !== action
      ) {
        setComment({ show: false, text: "", new_user_id: "", action: "" });
        return;
      }
    }

    try {
      const request_id = data?.request_Step_id || null;
      const userId = localStorage.getItem("userId") || "";
      let res;

      switch (action) {
        case "approve":
          res = await approveWorkflow({
            request_step_id: request_id,
            approver_id: userId,
          });
          break;

        case "reject":
          res = await rejectWorkflow({
            request_step_id: request_id,
            approver_id: userId,
            comment: commentRef.current.text,
          });
          break;

        case "returnBack":
          res = await returnBackWorkflow({
            request_step_id: request_id,
            approver_id: userId,
            comment: commentRef.current.text,
          });
          break;

        case "editBeforeApproval":
          // Call the editBeforeApproval workflow API (if applicable) and then redirect to list on success
          try {
            res = await editBeforeApprovalWorkflow({
              request_step_id: request_id,
              approver_id: userId,
            });
          } catch (e) {
            // fall through to final handling
            res = (e as any) || null;
          }
          break;

        default:
          break;
      }

      if (
        currentAbortController.signal.aborted ||
        currentActionRef.current !== action
      ) {
        return;
      }

      if (res && res.error) {
        showSnackbar(res.data.message || "Action failed", "error");
      } else {
        showSnackbar("Action performed successfully", "success");
        // After successful workflow action, redirect to list page
        try {
          router.push("/distributorsOrder");
        } catch (e) {
          // ignore navigation errors
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showSnackbar("An error occurred while processing the action", "error");
    } finally {
      setLoadingWorkflow((prev) => ({ ...prev, [action]: false }));
      setComment({ show: false, text: "", new_user_id: "", action: "" });
      if (currentActionRef.current === action) {
        currentActionRef.current = null;
        abortControllerRef.current = null;
      }
    }
  };

  const targetRef = useRef<HTMLDivElement | null>(null);

  const tableData = useMemo(() => {
    return (data?.details || []).map((row, index) => {
      const mappedRow: Record<string, string> = { index: String(index + 1) };
      Object.keys(row).forEach((key) => {
        const value = (row as any)[key];
        mappedRow[key] =
          value === null || value === undefined ? "" : String(value);
      });
      return mappedRow;
    });
  }, [data?.details]);

  const memoizedColumns = useMemo(() => columns, []);

  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="flex justify-between items-center mb-[20px]">
        <div className="flex items-center gap-[16px]">
          <Icon
            icon="lucide:arrow-left"
            width={24}
            onClick={() => router.push("/distributorsOrder")}
            className="cursor-pointer"
          />
          <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
            Distributor&apos;s Orders Details #{data?.order_code || "-"}
          </h1>
          <BorderIconButton
            disabled={!data?.previous_uuid}
            onClick={
              data?.previous_uuid
                ? () => router.push(`${PATH}${data.previous_uuid}`)
                : undefined
            }
            icon="lucide:chevron-left"
            label={"Prev"}
            labelTw="font-medium text-[12px]"
            className="!h-[30px] !gap-[3px] !px-[5px] !pr-[10px]"
          />
          <BorderIconButton
            disabled={!data?.next_uuid}
            onClick={
              data?.next_uuid
                ? () => router.push(`${PATH}${data.next_uuid}`)
                : undefined
            }
            trailingIcon="lucide:chevron-right"
            label={"Next"}
            labelTw="font-medium text-[12px]"
            className="!h-[30px] !gap-[3px] !px-[5px] !pl-[10px]"
          />
        </div>
{order?.permissions && order?.permissions.length > 0 && data?.request_Step_id != null &&
  <div
          style={{ zIndex: 30 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 backdrop-blur-md bg-black/10 border border-white/30 shadow-lg rounded-xl p-8 text-black z-[60px]"
        >
          {comment.show && (
            <>
              <div className="w-full p-5 bg-white rounded-lg mb-4 opacity-100">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setComment({ ...comment, show: false });
                  }}
                >
                  <span className="mbs-5">
                    {camelToTitleCase(comment.action || "")}
                  </span>
                  <InputFields
                    type="textarea"
                    label="Comment"
                    width="100%"
                    onChange={(e) =>
                      setComment({ ...comment, text: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        setComment({ ...comment, show: false });
                      }
                    }}
                    value={comment.text}
                  />
                </form>
              </div>
            </>
          )}
          
          {/* Display message above buttons */}
         
             
              {order?.message && (
                <div className="text-gray-600 mb-4">
                  <span className="font-medium">{order.message}</span> 
                </div>
              )}
              
       
          
          <div className="flex gap-4 flex-wrap">
            {order?.permissions?.includes("APPROVE") && (
              <BorderIconButton
                icon={
                  loadingWorkflow.approve ? "line-md:loading-loop" : "mdi:tick"
                }
                label={"Approve"}
                labelTw="font-medium text-[12px]"
                onClick={() => {
                  setApprovalName("approve");
                  setShowDeletePopup(true)}}
                disabled={
                  loadingWorkflow.approve ||
                  (Object.values(loadingWorkflow).some((loading) => loading) &&
                    !comment.show)
                }
              />
            )}
            {order?.permissions?.includes("REJECT") && (
              <BorderIconButton
                icon={
                  loadingWorkflow.reject ? "line-md:loading-loop" : "mdi:times"
                }
                label={"Reject"}
                labelTw="font-medium text-[12px]"
                onClick={() => {
                  setApprovalName("reject");
                  setShowDeletePopup(true)}}
                disabled={
                  loadingWorkflow.reject ||
                  (Object.values(loadingWorkflow).some((loading) => loading) &&
                    !comment.show)
                }
              />
            )}
            {order?.permissions?.includes("RETURN_BACK") && (
              <BorderIconButton
                icon={
                  loadingWorkflow.returnBack
                    ? "line-md:loading-loop"
                    : "lets-icons:back"
                }
                label={"Return Back"}
                labelTw="font-medium text-[12px]"
                onClick={() => {
                  setApprovalName("returnBack");
                  setShowDeletePopup(true)}}
                disabled={
                  loadingWorkflow.returnBack ||
                  (Object.values(loadingWorkflow).some((loading) => loading) &&
                    !comment.show)
                }
              />
            )}
            {order?.permissions?.includes("EDIT_BEFORE_APPROVAL") && (
              <BorderIconButton
                icon={
                  loadingWorkflow.editBeforeApproval
                    ? "line-md:loading-loop"
                    : "lucide:edit-2"
                }
                label={"Edit Before Approval"}
                labelTw="font-medium text-[12px]"
                onClick={() => {
                  setApprovalName("editBeforeApproval");
                  setShowDeletePopup(true)}}
                disabled={
                  loadingWorkflow.editBeforeApproval ||
                  (Object.values(loadingWorkflow).some((loading) => loading) &&
                    !comment.show)
                }
              />
            )}
          </div>
        </div>
}

        {/* Action Buttons */}
        <div className="flex gap-[12px] relative">
          {/* <div className="gap-[12px] hidden sm:flex">
            <BorderIconButton icon="lucide:edit-2" />
            <BorderIconButton icon="lucide:printer" />
            <BorderIconButton icon="lucide:mail" />
            <BorderIconButton icon="mdi:message-outline" />
            <DismissibleDropdown
              isOpen={showDropdown}
              setIsOpen={setShowDropdown}
              button={
                <BorderIconButton
                  icon="ic:sharp-more-vert"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
              }
              dropdown={
                <div className="w-[160px] absolute top-[40px] right-0 z-30">
                  <CustomDropdown data={dropdownDataList} />
                </div>
              }
            />
          </div> */}
        </div>
      </div>

      <div ref={targetRef}>
        <ContainerCard className="rounded-[10px] space-y-[40px]">
          <div className="flex justify-between flex-wrap gap-[20px]">
            <div className="flex flex-col gap-[10px]">
              <Logo type="full" />
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                Order
              </span>
              <span className="text-primary text-[14px] tracking-[8px]">
                #{data?.order_code || "-"}
              </span>
            </div>
          </div>

          <hr className="text-[#D5D7DA]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-8 items-start">
            {/* From (Seller) */}
            <div>
              <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px] border-b md:border-b-0 pb-4 md:pb-0">
                <span>Seller</span>
                <div className="flex flex-col space-y-[10px]">
                  <span className="font-semibold">
                    {data?.warehouse_code ? data?.warehouse_code : ""}
                    {data?.warehouse_code && data?.warehouse_name && ` - `}
                    {data?.warehouse_name ? data?.warehouse_name : ""}
                  </span>
                  <span>
                    {data?.warehouse_address ? data?.warehouse_address : ""}
                  </span>
                  <span>
                    {data?.warehouse_number && (
                      <>Phone: {data?.warehouse_number}</>
                    )}{" "}
                    <br />{" "}
                    {data?.warehouse_email && (
                      <>Email: {data?.warehouse_email}</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* To (Customer) */}
            <div>
              <div className="flex flex-col space-y-[12px] text-primary-bold text-[14px]">
                <span>Buyer</span>
                <div className="flex flex-col space-y-[10px]">
                  <span className="font-semibold">
                    {data?.customer_code && data?.customer_name
                      ? `${data?.customer_code} - ${data?.customer_name}`
                      : "-"}
                  </span>
                  <span>
                    {data?.customer_street && ` ${data?.customer_street}`}
                    {data?.customer_town && ` ${data?.customer_town}`}
                  </span>
                  <span>
                    {data?.customer_contact &&
                      `Phone: ${data?.customer_contact}`}{" "}
                    <br />{" "}
                    {data?.customer_email && `Email: ${data?.customer_email}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates / meta - right column */}
            <div className="flex md:justify-end">
              <div className="text-primary-bold text-[14px] md:text-right">
                {data?.created_at && (
                  <div>
                    Order Date:{" "}
                    <span className="font-bold">
                      {formatWithPattern(
                        new Date(data?.created_at),
                        "DD MMM YYYY",
                        "en-GB"
                      ).toLowerCase() || ""}
                    </span>
                  </div>
                )}
                {data?.delivery_date && (
                  <div className="mt-2">
                    Delivery Date:{" "}
                    <span className="font-bold">
                      {formatWithPattern(
                        new Date(data?.delivery_date),
                        "DD MMM YYYY",
                        "en-GB"
                      ).toLowerCase() || ""}
                    </span>
                  </div>
                )}
                {data?.order_source && (
                  <div className="mt-2">
                    Order Source:{" "}
                    <span className="font-bold">
                      {data?.order_source || "Online"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Order Table ---------- */}
          <Table
            data={tableData}
            config={{
              columns: memoizedColumns,
            }}
          />

          {/* ---------- Order Summary ---------- */}
          <div className="flex justify-between text-primary">
            <div className="flex justify-between flex-wrap w-full">
              {/* Notes Section */}
              <div className="hidden flex-col justify-end gap-[20px] w-full lg:flex lg:w-[400px]">
                {data?.comment && (
                  <div className="flex flex-col space-y-[10px]">
                    <div className="font-semibold text-[#181D27]">
                      Customer Note
                    </div>
                    <div>{data?.comment}</div>
                  </div>
                )}
                <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">
                    Payment Method
                  </div>
                  <div>{"Cash on Delivery"}</div>
                </div>
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-[10px] w-full lg:w-[350px]">
                {keyValueData.map((item) => (
                  <Fragment key={item.key}>
                    <KeyValueData data={[item]} />
                    <hr className="text-[#D5D7DA]" />
                  </Fragment>
                ))}
                <div className="font-semibold text-[#181D27] text-[18px] flex justify-between">
                  <span>Total</span>
                  {/* <span>AED {toInternationalNumber(finalTotal) || 0}</span> */}
                  <span>
                    {CURRENCY} {toInternationalNumber(Number(finalTotal) || 0)}
                  </span>
                </div>
              </div>

              {/* Notes (Mobile) */}
              <div className="flex flex-col justify-end gap-[20px] w-full lg:hidden lg:w-[400px] mt-[20px]">
                {data?.comment && (
                  <div className="flex flex-col space-y-[10px]">
                    <div className="font-semibold text-[#181D27]">
                      Customer Note
                    </div>
                    <div>{data?.comment}</div>
                  </div>
                )}
                <div className="flex flex-col space-y-[10px]">
                  <div className="font-semibold text-[#181D27]">
                    Payment Method
                  </div>
                  <div>{"Cash on Delivery"}</div>
                </div>
                {/* {data?.payment_method && <div className="flex flex-col space-y-[10px]">
                <div className="font-semibold text-[#181D27]">
                  Payment Method
                </div>
                <div>{data?.payment_method || "Cash on Delivery"}</div>
              </div>} */}
              </div>
            </div>
          </div>

          <hr className="text-[#D5D7DA] print:hidden" />

          {/* ---------- Footer Buttons ---------- */}
          <div className="flex flex-wrap justify-end gap-[20px] print:hidden">
            <SidebarBtn
              leadingIcon={
                loading ? "eos-icons:three-dots-loading" : "lucide:download"
              }
              leadingIconSize={20}
              label="Download"
              onClick={exportFile}
            />
            <PrintButton
              targetRef={targetRef as unknown as RefObject<HTMLElement>}
            />
          </div>
        </ContainerCard>
      </div>

      {showDeletePopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                <DeleteConfirmPopup
                  title={order?.confirmationMessage}
                  onClose={() => setShowDeletePopup(false)}
                  onConfirm={() => workflowAction(approvalName)}
                />
              </div>
            )}
    </>
  );
}
