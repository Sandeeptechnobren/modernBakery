"use client";

import React,{ useEffect } from "react";
import { ArrowLeft, FileText, Truck, Receipt, Calculator } from "lucide-react";
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
  status: "Completed" | "Shipped" | "Not Cleared";
  date: string;
  dateLabel: string;
  additionalInfo?: any;
  netValue?: string;
}

const ProcessFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const order_code = searchParams.get("order_code") || undefined;

  const [processData, setProcessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
  const orderProcessingCards: ProcessCard[] = processData?.order && Array.isArray(processData.order.steps)
    ? [...processData.order.steps].reverse().map((step: any, idx: number): ProcessCard => ({
        type: `Order`,
        number: processData.order.order_code,
        status: step.status === "APPROVED" ? "Completed" : "Not Cleared",
        rowType: "both",
        verticalHeight: "100px",
        horizontalHeight: "100px",
        date: "",
        dateLabel: step.title,
        additionalInfo: step.message,
      }))
    : [];

  const deliveryProcessingCards: ProcessCard[] = processData?.deliveries
    ? processData.deliveries.flatMap((d: any) =>
        Array.isArray(d.steps)
          ? [...d.steps].reverse().map((step: any, idx: number): ProcessCard => ({
              type: "Delivery",
              number: d.delivery.delivery_code,
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
          ? [...inv.steps].reverse().map((step: any, idx: number): ProcessCard => ({
              type: "Tax Invoice",
              number: inv.invoice.invoice_code,
              status: step.status === "APPROVED" ? "Completed" : "Not Cleared",
              date: "",
              dateLabel: step.title,
              additionalInfo: `${step.message}${inv.invoice.amount ? ` | Net Value ${inv.invoice.amount} UGX` : ''}`,
            }))
          : []
      )
    : [];

  const accountingCards: ProcessCard[] = [];
    const processSteps: ProcessStep[] = [
    {
      id: "order",
      title: "Order Processing",
      icon: <FileText className="w-6 h-6" />,
      completed: true,
    },
    {
      id: "delivery",
      title: "Delivery Processing",
      icon: <Truck className="w-6 h-6" />,
      completed: true,
    },
    {
      id: "invoicing",
      title: "Invoice Processing",
      icon: <Receipt className="w-6 h-6" />,
      completed: true,
    },
    {
      id: "accounting",
      title: "Account Processing",
      icon: <Calculator className="w-6 h-6" />,
      completed: false,
    },
  ];



  const renderCard = (card: ProcessCard) => {
    const getStatusColor = (status: string) => {
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

    const getStatusIcon = (status: string) => {
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
      <div className="flex items-center">
        <div
          className="group bg-white border border-gray-200 hover:border-blue-500 transition-colors duration-200 p-4 shadow-sm min-w-[200px] min-h-[200px] relative"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }}
        >
          <div className="mb-3">
            <div className="font-medium text-gray-800 text-sm">
              {card.type} {card.number}
            </div>
          </div>
          <div className={`flex items-center gap-2 mb-2 ${getStatusColor(card.status)}`}>
            <span className="text-lg">{getStatusIcon(card.status)}</span>
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
        <VerticalArrow rowType={card.rowType}  verticalHeight={card.verticalHeight}  horizontalHeight={card.horizontalHeight} />
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
        <div className="mt-2 text-sm font-medium text-gray-700 text-center">
          {step.title}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className=" transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Process Flow</h1>
        </div>

        {/* Process Steps Header */}
        <div className="flex items-center justify-center  mb-12">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {renderStepIcon(step, index)}
              {index < processSteps.length - 1 && (
                <div className="flex items-center ">
                  <div className="flex w-32 h-0.5 bg-gray-300 items-center mb-10"></div>
                  <div className="text-3xl text-gray-600 font-light leading-none mb-10">»</div>
                  <div className="flex w-32 h-0.5 bg-gray-300 items-center mb-10"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Process Cards Flow */}
        <div className="relative">
          <div className="flex gap-8 items-start">
            {/* Order Processing Column */}
            <div className="flex-1 min-w-[250px]">
              <div className="space-y-4">
                {orderProcessingCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Processing Column */}
            <div className="flex-1 min-w-[250px]">
              <div className="space-y-4">
                {deliveryProcessingCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Invoicing Column */}
            <div className="flex-1 min-w-[250px]">
              <div className="space-y-4">
                {invoicingCards.map((card: ProcessCard, index: number) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Accounting Column */}
            <div className="flex-1 min-w-[250px]">
              <div className="space-y-4">
                {accountingCards.map((card, index) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default ProcessFlow;
