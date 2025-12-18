
export function VerticalArrow({ rowType, verticalHeight, horizontalHeight, status }: { rowType?: string, verticalHeight?: string, horizontalHeight?: string, status?: string }) {
  // Responsive arrow sizes
  const lineColor = status == "Completed" || status == "Shipped" ? "bg-green-400" : "bg-gray-400";
  const arrowColor = status == "Completed" || status == "Shipped" ? (status == "Shipped" ? "border-t-green-400 border-l-green-400" : "border-t-green-400 border-l-green-400") : "border-t-gray-400 border-l-gray-400";
  return (
    <div className="flex flex-col h-full items-center justify-center">
      {/* Right Arrow */}
      {rowType === "right" && (
        <div className="flex items-center">
          <div className={`h-[2px] w-4 sm:w-6 md:w-[30px] ${lineColor}`}></div>
          <div className={`w-0 h-0 border-t-4 sm:border-t-[6px] border-b-4 sm:border-b-[6px] border-l-6 sm:border-l-[10px] border-t-transparent border-b-transparent ${arrowColor}`}></div>
        </div>
      )}
      {/* Down Arrow */}
      {rowType === "down" && (
        <div className="flex flex-col items-center">
          <div className={`w-[2px] h-8 sm:h-10 md:h-12 ${lineColor}`}></div>
          <div className={`w-0 h-0 border-l-4 sm:border-l-[6px] border-r-4 sm:border-r-[6px] border-t-6 sm:border-t-[10px] border-l-transparent border-r-transparent ${arrowColor}`}></div>
        </div>
      )}
      {/* Top Arrow */}
      {rowType === "top" && (
        <div className="flex flex-col items-center">
          <div className={`w-0 h-0 border-l-4 sm:border-l-[6px] border-r-4 sm:border-r-[6px] border-t-6 sm:border-t-[10px] border-l-transparent border-r-transparent ${arrowColor}`}></div>
          <div className="w-[2px] h-8 sm:h-10 md:h-12 bg-gray-400"></div>
        </div>
      )}
      {/* Both (custom L or T shape) */}
      {rowType === "both" && (
        <div className="flex flex-col items-center">
          <div className={`w-0 h-0 border-l-4 sm:border-l-[6px] border-r-4 sm:border-r-[6px] border-t-6 sm:border-t-[10px] border-l-transparent border-r-transparent ${arrowColor}`}></div>
          <div className={`w-[2px] h-8 sm:h-10 md:h-12 ${lineColor}`}></div>
          <div className="flex items-center">
            <div className={`h-[2px] w-12 sm:w-16 md:w-20 ${lineColor}`}></div>
            <div className={`w-0 h-0 border-t-4 sm:border-t-[6px] border-b-4 sm:border-b-[6px] border-l-6 sm:border-l-[10px] border-t-transparent border-b-transparent ${arrowColor}`}></div>
          </div>
        </div>
      )}

      {/* U-turn connector (matches sketch): short right -> long up -> right + arrow head */}
      {rowType === "uTurn" && (
        <div className="relative">
          {/* short right from source */}
          <div className="flex items-center">
            <div className={`h-[2px] w-10 sm:w-12 md:w-16 ${lineColor}`}></div>
          </div>

          {/* long vertical up */}
          <div className="flex">
            <div className={`w-[2px] h-24 sm:h-32 md:h-40 ${lineColor} ml-10 sm:ml-12 md:ml-16 -mt-24 sm:-mt-32 md:-mt-40`}></div>
          </div>

          {/* right into target + arrow head (at the top) */}
          <div className="flex items-center -mt-24 sm:-mt-32 md:-mt-40 ml-10 sm:ml-12 md:ml-16">
            <div className={`h-[2px] w-10 sm:w-12 md:w-16 ${lineColor}`}></div>
            <div className={`w-0 h-0 border-t-4 sm:border-t-[6px] border-b-4 sm:border-b-[6px] border-l-6 sm:border-l-[10px] border-t-transparent border-b-transparent ${arrowColor}`}></div>
          </div>
        </div>
      )}
    </div>
  );
}
   