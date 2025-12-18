"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ArrowLeft, FileText, Truck, Receipt, Calculator, CheckCircle } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import { Icon } from "@iconify-icon/react";
import { useRouter,useSearchParams  } from "next/navigation";
import { VerticalArrow } from "../approval/proccessFlow";
import { orderProcessFlow } from "@/app/services/settingsAPI";
import { useState } from "react";

interface ProcessStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ProcessCard {
  type: string;
  number: string;
  rowType?: string;
  verticalHeight?: string;
  horizontalHeight?: string;
  status?: "Completed" | "Shipped" | "Not Cleared";
  date?: string;
  dateLabel?: string;
  additionalInfo?: any;
  netValue?: string;
}

const ProcessFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const order_code = searchParams.get("order_code") || undefined;

  const [processData, setProcessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Refs & geometry for DOM-anchored connectors
  const flowCanvasRef = useRef<HTMLDivElement | null>(null);
  const lastApprovalCardRef = useRef<HTMLDivElement | null>(null);
  const firstDeliveryCardRef = useRef<HTMLDivElement | null>(null);
  const [uTurnPath, setUTurnPath] = useState<string>("");

  const lastDeliveryCardRef = useRef<HTMLDivElement | null>(null);
  const firstInvoiceCardRef = useRef<HTMLDivElement | null>(null);
  const [uTurnPathDeliveryToInvoice, setUTurnPathDeliveryToInvoice] = useState<string>("");

  useEffect(() => {
    const fetchProcessFlow = async () => {
      setLoading(true);
      try {
        const data = await orderProcessFlow({ order_code });
        setProcessData(data?.data || null);
      } catch (error) {
        setProcessData(null);
      } finally {
        setLoading(false);
      }
    };
    if (order_code) fetchProcessFlow();
  }, [order_code]);

  // Map API response to ProcessCard[] for each column
  // Approval cards for each order step
  const approvalCards: ProcessCard[] = processData?.order && Array.isArray(processData.order.steps)
    ? [...processData.order.steps].map((step: any, idx: number): ProcessCard => ({
        type: `Approval`,
        number: processData.order.order_code,
        status: step.status === "APPROVED" ? "Completed" : step.status === "PENDING" ? "Not Cleared" : step.status,
        rowType: idx === processData.order.steps.length - 1 ? "" : "down",
        verticalHeight: "100px",
        horizontalHeight: "100px",
        date: "",
        dateLabel: step.title,
        additionalInfo: step.message,
      }))
    : [];
  const orderProcessingCards: ProcessCard[] = processData?.order && processData.order.order_code
    ? [{
        type: `Order`,
        number: processData.order.order_code,
        status: processData.order.workflow.status === "APPROVED" ? "Completed" : processData.order.workflow.status.status === "PENDING" ? "Not Cleared" : processData.order.workflow.status,
        rowType: "right",
        verticalHeight: "100px",
        horizontalHeight: "100px",
        date: "",
        dateLabel: "Order Placed",
        additionalInfo: "",
      }]
    : [];

  const deliveryProcessingCards: ProcessCard[] = processData?.deliveries
    ? processData.deliveries.flatMap((d: any) =>
        Array.isArray(d.steps)
          ? [...d.steps].map((step: any, idx: number): ProcessCard => ({
              type: "Delivery",
              number: d.delivery.delivery_code,
              rowType: idx == [...d.steps].length -1 ? "" : "down",
        verticalHeight: "100px",
        horizontalHeight: "100px",
              status: step.status === "APPROVED" ? "Shipped" : "Not Cleared",
              date: "",
              dateLabel: step.title,
              additionalInfo: step.message,
            }))
          : []
      )
    : [];

  const invoicingCards: ProcessCard[] = processData?.invoices
    ? processData.invoices.flatMap((inv: any) =>
        Array.isArray(inv.steps)
          ? [...inv.steps].map((step: any, idx: number): ProcessCard => ({
              type: "Tax Invoice",
              number: inv.invoice.invoice_code,
              rowType: idx == [...inv.steps].length -1 ? "" : "down",
        verticalHeight: "100px",
        horizontalHeight: "100px",
              status: step.status === "APPROVED" ? "Completed" : "Not Cleared",
              date: "",
              dateLabel: step.title,
              additionalInfo: `${step.message}${inv.invoice.amount ? ` | Net Value ${inv.invoice.amount} UGX` : ''}`,
            }))
          : []
      )
    : [];

  const accountingCards: ProcessCard[] = [];

  const uTurnStroke = useMemo(() => {
    const status = approvalCards[approvalCards.length - 1]?.status;
    return status === "Completed" || status === "Shipped" ? "#4ade80" : "#9ca3af";
  }, [approvalCards]);

  const uTurnStrokeDeliveryToInvoice = useMemo(() => {
    const status = deliveryProcessingCards[deliveryProcessingCards.length - 1]?.status;
    return status === "Completed" || status === "Shipped" ? "#4ade80" : "#9ca3af";
  }, [deliveryProcessingCards]);

  const updateUTurn = () => {
    const canvas = flowCanvasRef.current;
    if (!canvas) {
      setUTurnPath("");
      setUTurnPathDeliveryToInvoice("");
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();

    // Helper: build a U-turn path from fromEl -> toEl
    const buildUTurnPath = (fromEl: HTMLDivElement | null, toEl: HTMLDivElement | null) => {
      if (!fromEl || !toEl) return "";
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const sx = fromRect.right - canvasRect.left;
      const sy = fromRect.top - canvasRect.top + fromRect.height / 2;

      const tx = toRect.left - canvasRect.left;
      const ty = toRect.top - canvasRect.top + toRect.height / 2;

      const gap = 18;
      const midX = sx + Math.max(24, Math.min(80, (tx - sx) / 2));
      const safeMidX = Math.min(midX, tx - gap);

      return [
        `M ${sx} ${sy}`,
        `L ${sx + gap} ${sy}`,
        `L ${safeMidX} ${sy}`,
        `L ${safeMidX} ${ty}`,
        `L ${tx - gap} ${ty}`,
        `L ${tx} ${ty}`,
      ].join(" ");
    };

    setUTurnPath(buildUTurnPath(lastApprovalCardRef.current, firstDeliveryCardRef.current));
    setUTurnPathDeliveryToInvoice(buildUTurnPath(lastDeliveryCardRef.current, firstInvoiceCardRef.current));
  };

  useLayoutEffect(() => {
    updateUTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalCards.length, deliveryProcessingCards.length, invoicingCards.length, processData]);

  useEffect(() => {
    const onResize = () => updateUTurn();
    window.addEventListener("resize", onResize);

    // Track layout changes inside the flow area (e.g., fonts/images load)
    const ro = new ResizeObserver(() => updateUTurn());
    if (flowCanvasRef.current) ro.observe(flowCanvasRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
    // Helper to check if all approvers in all steps have has_approved true
    const allOrderStepsApproved = processData?.order?.steps && Array.isArray(processData.order.steps)
      ? processData.order.steps.every((step: any) =>
          Array.isArray(step.approvers) && step.approvers.every((appr: any) => appr.has_approved === true)
        )
      : false;

    const allDeliveryStepsApproved =
      Array.isArray(processData?.deliveries) && processData.deliveries.length > 0
        ? processData.deliveries.every((d: any) =>
            Array.isArray(d.steps) && d.steps.length > 0 &&
            d.steps.every((step: any) =>
              Array.isArray(step.approvers) && step.approvers.length > 0 && step.approvers.every((appr: any) => appr.has_approved === true)
            )
          )
        : false;

    const allInvoiceStepsApproved =
      Array.isArray(processData?.invoices) && processData.invoices.length > 0
        ? processData.invoices.every((inv: any) =>
            Array.isArray(inv.steps) && inv.steps.length > 0 &&
            inv.steps.every((step: any) =>
              Array.isArray(step.approvers) && step.approvers.length > 0 && step.approvers.every((appr: any) => appr.has_approved === true)
            )
          )
        : false;

    const processSteps: ProcessStep[] = [
      {
        id: "order",
        title: "Order Processing",
        icon: <FileText className="w-6 h-6" />, 
        completed: !!processData?.order?.order_code,
      },
      {
        id: "orderApproval",
        title: "Order Approval",
        icon: <FileText className="w-6 h-6" />, 
        completed: allOrderStepsApproved,
      },
      {
        id: "delivery",
        title: "Delivery Processing",
        icon: <Truck className="w-6 h-6" />, 
        completed: allDeliveryStepsApproved,
      },
      {
        id: "invoicing",
        title: "Invoice Processing",
        icon: <Receipt className="w-6 h-6" />, 
        completed: allInvoiceStepsApproved,
      },
      {
        id: "accounting",
        title: "Completed",
        icon: <CheckCircle className="w-6 h-6" />, 
        completed: allOrderStepsApproved && allDeliveryStepsApproved && allInvoiceStepsApproved,
      },
    ];



  const renderCard = (
    card: ProcessCard,
    orderProcessingCards?: number,
    index?: number,
    cardWrapperRef?: React.Ref<HTMLDivElement>
  ) => {
    console.log("orderProcessingCards",orderProcessingCards,index);
    const getStatusColor = (status?: string) => {
      switch (status) {
        case "Completed":
          return "text-green-600";
        case "Shipped":
          return "text-green-600";
        case "Not Cleared":
          return "text-gray-400";
        default:
          return "text-gray-600";
      }
    };

    const getStatusIcon = (status?: string) => {
      switch (status) {
        case "Completed":
          return "✓";
        case "Shipped":
          return "✓";
        case "Not Cleared":
          return "»";
        default:
          return "";
      }
    };

    return (
      <div ref={cardWrapperRef} className={orderProcessingCards   == index  ? "flex items-center" : "flex flex-col items-center"}>
        <div
          className="group bg-white border border-gray-200 hover:border-blue-500 transition-colors duration-200 p-4 shadow-sm min-w-[250px] min-h-[250px] relative"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 92% 100%, 0 100%)" }}
        >
          <div className="mb-3">
            <div className="font-medium text-gray-800 text-sm">
              {card.type} #{card.number}
            </div>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${getStatusColor(card?.status)}`}>
            <span className="text-lg">{getStatusIcon(card?.status)}</span>
            <span className="font-medium text-sm">{card.status}</span>
          </div>
          <div className="text-gray-600 text-xs mb-1">{card.dateLabel}</div>
          <div className="text-gray-700 text-xs mb-2">{card.additionalInfo}</div>
          <div className="absolute bottom-0 right-0 w-0 h-0 
            transform rotate-270 bg-[#fbf9fa]
            border-l-[18px] border-l-transparent
            border-t-[18px] border-t-gray-500 group-hover:border-t-blue-500 transition-colors duration-200" >
          </div>
        </div>
        <VerticalArrow rowType={card.rowType}  verticalHeight={card.verticalHeight}  horizontalHeight={card.horizontalHeight} status={card.status}/>
      </div>
    );
  };

  const renderStepIcon = (step: ProcessStep, index: number) => {
    const isCompleted = step.completed;
    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
            isCompleted
              ? "border-green-500 text-green-600"
              : "bg-gray-100 border-gray-300 text-gray-400"
          }`}
        >
          {step.icon}
        </div>
        <div className={isCompleted ? "mt-2 text-sm font-medium text-black-800 text-center" : "mt-2 text-sm font-medium text-gray-600 text-center"}>
          {step.title}
        </div>
      </div>
    );
  };
if ( loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  return (
    <>
    <div className="flex items-center gap-2 mb-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="cursor-pointer"
        aria-label="Go back"
      >
        <Icon icon="lucide:arrow-left" width={24} />
      </button>
      <h1 className="text-xl font-semibold text-gray-900 mb-1"> Process Flow</h1>
    </div>
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
       
  <div className="flex flex-wrap items-center justify-center mb-8 md:mb-12 md:gap-0">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {renderStepIcon(step, index)}
              {index < processSteps.length - 1 && (
                <div className="flex items-center ">
                  <div className="flex w-10 h-0.5 bg-gray-300 items-center mb-8"></div>
                  <div className="text-3xl text-gray-600 font-light leading-none mb-9">»</div>
                  <div className="flex w-10 h-0.5 bg-gray-300 items-center mb-8"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Process Cards Flow */}
        <div className="relative overflow-x-auto" ref={flowCanvasRef}>
          {/* Anchored connector overlay */}
          {(uTurnPath || uTurnPathDeliveryToInvoice) && (
            <svg
              className="pointer-events-none absolute inset-0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            >
              <defs>
                <marker
                  id="uTurnArrowHead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={uTurnStroke} />
                </marker>

                <marker
                  id="uTurnArrowHeadDeliveryToInvoice"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={uTurnStrokeDeliveryToInvoice} />
                </marker>
              </defs>

              {/* Approval last -> Delivery first */}
              {uTurnPath && (
                <path
                  d={uTurnPath}
                  fill="none"
                  stroke={uTurnStroke}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  markerEnd="url(#uTurnArrowHead)"
                />
              )}

              {/* Delivery last -> Tax Invoice first */}
              {uTurnPathDeliveryToInvoice && (
                <path
                  d={uTurnPathDeliveryToInvoice}
                  fill="none"
                  stroke={uTurnStrokeDeliveryToInvoice}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  markerEnd="url(#uTurnArrowHeadDeliveryToInvoice)"
                />
              )}
            </svg>
          )}

          <div className="flex gap-2 md:gap-10 items-start min-w-[900px] md:min-w-0">
            {/* Order Processing Column */}
            <div className="flex-1 min-w-[220px] sm:min-w-[250px] max-w-xs flex flex-col items-center">
              <div className="w-full">
                {orderProcessingCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(card,orderProcessingCards.length - 1,index)}
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Column */}
            <div className="flex-1 min-w-[220px] sm:min-w-[250px] max-w-xs flex flex-col items-center">
              <div className="w-full">
                {approvalCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(
                      card,
                      approvalCards.length - 1,
                      index,
                      index === approvalCards.length - 1 ? lastApprovalCardRef : undefined
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Processing Column */}
            <div className="flex-1 min-w-[220px] sm:min-w-[250px] max-w-xs flex flex-col items-center">
              <div className="w-full">
                {deliveryProcessingCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(
                      card,
                      deliveryProcessingCards.length - 1,
                      index,
                      index === 0
                        ? firstDeliveryCardRef
                        : index === deliveryProcessingCards.length - 1
                          ? lastDeliveryCardRef
                          : undefined
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invoicing Column */}
            <div className="flex-1 min-w-[220px] sm:min-w-[250px] max-w-xs flex flex-col items-center">
              <div className="w-full">
                {invoicingCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(
                      card,
                      invoicingCards.length - 1,
                      index,
                      index === 0 ? firstInvoiceCardRef : undefined
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Accounting Column */}
            <div className="flex-1 min-w-[220px] sm:min-w-[250px] max-w-xs flex flex-col items-center">
              <div className="w-full">
                {accountingCards.map((card, index) => (
                  <div key={index} className="flex">
                    {renderCard(card,accountingCards.length - 1,index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProcessFlow;
