"use client";

import React,{useEffect} from "react";
import { ArrowLeft, FileText, Truck, Receipt, Calculator } from "lucide-react";
import { useRouter } from "next/navigation";
import { VerticalArrow } from "../approval/proccessFlow";
import { orderProcessFlow } from "@/app/services/settingsAPI";
import { useSearchParams } from "next/navigation";

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
  additionalInfo?: string;
}

const ProcessFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const order_code = searchParams.get("order_code") || undefined;

  useEffect(() => {
    const fetchProcessFlow = async () => {
      try {
        const data = await orderProcessFlow({ order_code });
        console.log("Process Flow Data:", data);
      } catch (error) {
        console.error("Error fetching process flow:", error);
      }
    };

    if (order_code) fetchProcessFlow();
  }, [order_code]);

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

  const orderProcessingCards: ProcessCard[] = [
    {
      type: "Standard Ordr-Credit",
      number: "30077651",
      status: "Completed",
      date: "09.09.2025",
      rowType: "both",
      verticalHeight: "200px",
      horizontalHeight: "100px",
      dateLabel: "Requested Delivery on",
      additionalInfo: "Completely Invoiced",
    },
  ];

  const deliveryProcessingCards: ProcessCard[] = [
    {
      type: "Delivery",
      number: "800179398",
      status: "Shipped",
      rowType: "right",
      
      date: "09.09.2025",
      dateLabel: "Shipped on",
    },
    {
      type: "Delivery",
      number: "800179359",
      status: "Shipped",
      rowType: "right",
      date: "09.09.2025",
      dateLabel: "Shipped on",
    },
  ];

  const invoicingCards: ProcessCard[] = [
    {
      type: "Tax Invoice",
      number: "9000129232",
      status: "Completed",
      rowType: "right",
      date: "09.09.2025",
      dateLabel: "Billed on",
      additionalInfo: "Net Value 22881355.20 UGX",
    },
    {
      type: "Tax Invoice",
      number: "9000129226",
      status: "Completed",
      rowType: "right",
      date: "09.09.2025",
      dateLabel: "Billed on",
      additionalInfo: "Net Value 50349153.32 UGX",
    },
  ];

  const accountingCards: ProcessCard[] = [
    {
      type: "Journal Entry",
      number: "9000129232",
      status: "Not Cleared",
      date: "09.09.2025",
      dateLabel: "Posted on",
    },
    {
      type: "Journal Entry",
      number: "9000129326",
      status: "Not Cleared",
      date: "09.09.2025",
      dateLabel: "Posted on",
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
      <div className="flex items-center w-full">
        <div
          className="group bg-white border border-gray-200 hover:border-blue-500 transition-colors duration-200 p-3 sm:p-4 shadow-sm min-w-[180px] sm:min-w-[200px] min-h-[160px] sm:min-h-[200px] w-full relative"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }}
        >
          <div className="mb-2 sm:mb-3">
            <div className="font-medium text-gray-800 text-xs sm:text-sm">
              {card.type} {card.number}
            </div>
          </div>

          <div className={`flex items-center gap-2 mb-1 sm:mb-2 ${getStatusColor(card.status)}`}>
            <span className="text-base sm:text-lg">{getStatusIcon(card.status)}</span>
            <span className="font-medium text-xs sm:text-sm">{card.status}</span>
          </div>

          <div className="text-gray-600 text-xs mb-0.5 sm:mb-1">{card.dateLabel}</div>
          <div className="text-gray-800 text-xs font-medium mb-1 sm:mb-2">{card.date}</div>

          {card.additionalInfo && (
            <div className="text-gray-700 text-xs">{card.additionalInfo}</div>
          )}
          <div className="absolute bottom-0 right-0 w-0 h-0 
            transform rotate-270 bg-[#fbf9fa]
            border-l-[14px] sm:border-l-[18px] border-l-transparent
            border-t-[14px] sm:border-t-[18px] border-t-gray-500 group-hover:border-t-blue-500 transition-colors duration-200" >
          </div>
          {/* Arrow tail for card */}
        </div>
        <VerticalArrow rowType={card.rowType}  verticalHeight={card.verticalHeight}  horizontalHeight={card.horizontalHeight} />
      </div>
    );
  };

  const renderStepIcon = (step: ProcessStep, index: number) => {
    const isCompleted = step.completed;
    return (
      <div
        className="flex flex-col items-center min-w-[64px] xs:min-w-[80px] sm:min-w-[100px] md:min-w-[120px] px-1 xs:px-2"
      >
        <div
          className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
            isCompleted
              ? "border-green-500 text-green-600 bg-white"
              : "bg-gray-100 border-gray-300 text-gray-400"
          }`}
        >
          {step.icon}
        </div>
        <div
          className="mt-1 xs:mt-1.5 sm:mt-2 text-[10px] xs:text-xs sm:text-sm md:text-base font-medium text-gray-700 text-center break-words max-w-[80px] sm:max-w-[120px]"
        >
          {step.title}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Process Flow</h1>
        </div>

        {/* Process Steps Header */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 sm:gap-0 mb-8 sm:mb-12 px-1 sm:px-0 scrollbar-thin scrollbar-thumb-gray-200">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              {renderStepIcon(step, index)}
              {index < processSteps.length - 1 && (
                <div className="flex items-center ">
                  <div className="hidden sm:flex w-32 h-0.5 bg-gray-300 items-center mb-10"></div>
                  <div className="flex sm:hidden w-8 h-0.5 bg-gray-300 items-center mb-4"></div>
                  <div className="text-2xl sm:text-3xl text-gray-600 font-light leading-none mb-4 sm:mb-10">»</div>
                  <div className="hidden sm:flex w-32 h-0.5 bg-gray-300 items-center mb-10"></div>
                  <div className="flex sm:hidden w-8 h-0.5 bg-gray-300 items-center mb-4"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Process Cards Flow */}
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start">
            {/* Order Processing Column */}
            <div className="flex-1 min-w-[220px] max-w-full">
              <div className="space-y-4">
                {orderProcessingCards.map((card, index) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Processing Column */}
            <div className="flex-1 min-w-[220px] max-w-full">
              <div className="space-y-4">
                {deliveryProcessingCards.map((card, index) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Invoicing Column */}
            <div className="flex-1 min-w-[220px] max-w-full">
              <div className="space-y-4">
                {invoicingCards.map((card, index) => (
                  <div key={index} className="flex">
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Accounting Column */}
            <div className="flex-1 min-w-[220px] max-w-full">
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
